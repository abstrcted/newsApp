

from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import feedparser
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
import json
import random
import re
import cv2
import numpy as np
import shutil
import os
# We import DeepFace inside the endpoint or globally. 
# Importing globally might slow down startup, but it's fine for this app.
from deepface import DeepFace
import feedparser
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
import concurrent.futures

# Load sources once
try:
    with open('sources.json') as f:
        SOURCES_DB = json.load(f)
except Exception as e:
    print(f"Warning: Could not load sources.json: {e}")
    SOURCES_DB = {}

app = FastAPI()

# Enable CORS so frontend can talk to backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

analyzer = SentimentIntensityAnalyzer()

# RSS Feeds List (Add more as needed)
RSS_URLS = {
    "breitbart": "http://feeds.feedburner.com/breitbart",
    "jacobin": "https://jacobin.com/feed/",
    "nypost": "https://nypost.com/feed/",
    "cnn": "http://rss.cnn.com/rss/cnn_topstories.rss",
    "foxnews": "http://feeds.foxnews.com/foxnews/latest",
    "npr": "https://feeds.npr.org/1001/rss.xml",
    "theguardian": "https://www.theguardian.com/world/rss",
    "bbc": "http://feeds.bbci.co.uk/news/rss.xml",
    "usatoday": "http://rssfeeds.usatoday.com/UsatodaycomNation-TopStories",
    "federalist": "https://thefederalist.com/feed/",
    "democracynow": "https://www.democracynow.org/democracynow.rss",
    "theintercept": "https://theintercept.com/feed/?lang=en",
    "commondreams": "https://www.commondreams.org/rss",
    "dailywire": "https://www.dailywire.com/rss.xml",
    "newsmax": "https://www.newsmax.com/rss/Newsfront/16/",
    "gatewaypundit": "https://www.thegatewaypundit.com/feed/"
}

# Helper: Calculate "Rage Score"
def calculate_rage(text):
    scores = analyzer.polarity_scores(text)
    # Logic: High negative sentiment + high compound energy = RAGE
    negativity = scores['neg']
    compound = abs(scores['compound'])
    # Normalize to 0-100
    rage_score = (negativity * 0.6 + compound * 0.4) * 100
    return round(rage_score, 1)

# Helper: Mock Bias Assignment (Since we aren't using NewsAPI key yet)
# Helper: Mock Bias Assignment (Using cached DB)
def estimate_bias(source_name):
    return SOURCES_DB.get(source_name, {}).get("bias", 0.0)

import re

# Helper: Extract Image from RSS Entry
def extract_image(entry):
    # 1. Try media_content (common in standard feeds)
    if 'media_content' in entry:
        for media in entry.media_content:
            if 'image' in media.get('type', '') or 'medium' in media and media['medium'] == 'image':
                return media['url']
    
    # 2. Try media_thumbnail
    if 'media_thumbnail' in entry:
        return entry.media_thumbnail[0]['url']
        
    # 3. Try links (enclosures)
    if 'links' in entry:
        for link in entry.links:
            if link.get('type', '').startswith('image/') or link.get('rel') == 'enclosure':
                return link['href']
    
    # 4. Try raw enclosures list
    if 'enclosures' in entry:
        for enc in entry.enclosures:
            if enc.get('type', '').startswith('image/'):
                return enc.get('href')

    # 5. Fallback: Regex search in summary and full content
    # content is often a list of dicts: [{'type': 'text/html', 'value': '...'}]
    html_corpus = entry.get('summary', '')
    
    if 'content' in entry:
        for content_item in entry.content:
            html_corpus += content_item.get('value', '')
            
    # Look for <img src="..."> or <media:content url="...">
    # Regex explains:
    # <img : match start of img tag
    # [^>]+ : match anything until...
    # src=["\'] : match src= followed by quote
    # (http[^"\']+) : Capture the URL (must start with http)
    img_match = re.search(r'<img[^>]+src=["\'](http[^"\']+)["\']', html_corpus, re.IGNORECASE)
    
    if img_match:
        return img_match.group(1)
        
    # 6. Fallback of Fallbacks: Generate a Deterministic Placeholder
    # We use the title hash to ensure the same article always gets the same "random" image
    import hashlib
    title_hash = hashlib.md5(entry.get('title', '').encode('utf-8')).hexdigest()
    return f"https://picsum.photos/seed/{title_hash}/600/400"

@app.get("/feed")
async def get_feed(bias_filter: float = 0.0, page: int = 1, limit: int = 10):
    """
    bias_filter: -1.0 (Left) to 1.0 (Right)
    page: Page number (1-based)
    limit: Items per page
    """
    articles = []

    # 1. Fetch from RSS (Parallelized)
    def fetch_single_feed(source, url):
        local_articles = []
        try:
            source_bias = estimate_bias(source)
            # Only fetch if it matches the user's requested "reality"
            # Tolerance window: +/- 0.6 to ensure coverage
            if abs(source_bias - bias_filter) <= 0.6:
                feed = feedparser.parse(url)
                for entry in feed.entries[:5]: # Top 5 per source
                    rage = calculate_rage(entry.title)
                    img = extract_image(entry)
                    
                    local_articles.append({
                        "title": entry.title,
                        "link": entry.link,
                        "source": source,
                        "bias": source_bias,
                        "rage_score": rage,
                        "image_url": img,
                        "summary": entry.get("summary", "")[:150] + "...",
                        "published_date": entry.get("published", "")
                    })
        except Exception as e:
            print(f"Error fetching {source}: {e}")
        return local_articles

    with concurrent.futures.ThreadPoolExecutor(max_workers=20) as executor:
        # Create a list of futures
        future_to_source = {executor.submit(fetch_single_feed, s, u): s for s, u in RSS_URLS.items()}
        
        for future in concurrent.futures.as_completed(future_to_source):
            try:
                data = future.result()
                articles.extend(data)
            except Exception as exc:
                print(f"Feed generation generated an exception: {exc}")

    # 2. Sort by RAGE (The Unethical Part)
    # Higher rage score = appears higher in feed
    articles.sort(key=lambda x: x['rage_score'], reverse=True)

    # 3. Pagination Logic
    total_items = len(articles)
    start_index = (page - 1) * limit
    end_index = start_index + limit
    
    paginated_articles = articles[start_index:end_index]

    return {
        "count": total_items, 
        "page": page,
        "limit": limit,
        "articles": paginated_articles
    }

# --- STEREOTYPING ENGINE LOGIC ---

def get_stereotyped_bias(age, emotion, race):
    """
    Returns a bias score (-1.0 to 1.0) and a profiling message based on satire stereotypes.
    """
    bias = 0.0
    message = "SUBJECT AMBIGUOUS. DEFAULTING TO NEUTRAL."
    
    # 1. THE ANGRY BOOMER (Right Wing)
    if emotion == "angry" and age > 45:
        bias = 0.8
        message = "SUBJECT IDENTIFIED: ANGRY BOOMER. PROBABILITY OF FOX NEWS CONSUMPTION: 99%."
    
    # 2. THE HAPPY ZOOMER (Left Wing)
    elif (emotion == "happy" or emotion == "surprise") and age < 30:
        bias = -0.8
        message = "SUBJECT IDENTIFIED: NAIVE IDEALIST. ASSIGNING SOCIALIST PARAMETERS."
        
    # 3. RACE-BASED STEREOTYPES (Satire)
    elif race == "white" and age > 50:
        bias = 0.7
        message = "SUBJECT IDENTIFIED: OLD WHITE MALE. STATISTICALLY LIKELY TO VOTE REPUBLICAN."
        
    elif race == "black" or race == "latino":
        bias = -0.6
        message = f"SUBJECT IDENTIFIED: {race.upper()}. ASSIGNING DEMOCRATIC LEANING BASED ON DEMOGRAPHICS."
        
    elif race == "asian" and age < 40:
        bias = -0.3
        message = "SUBJECT IDENTIFIED: YOUNG PROFESSIONAL ASIAN (YIMBY). ASSIGNING MODERATE LIBERAL BIAS."

    elif race == "middle eastern" and emotion == "sad":
        bias = -0.9
        message = "SUBJECT IDENTIFIED: DISILLUSIONED MIDDLE EASTERN. ASSIGNING LEFTIST BIAS."

    # 4. THE FEARFUL CENTRIST (Centrist)
    elif emotion == "fear":
        bias = 0.0
        message = "SUBJECT IDENTIFIED: PARANOID CENTRIST. UNABLE TO COMMIT TO IDEOLOGY."
        
    # 5. THE APATHETIC (Neutral/Non-voter)
    elif emotion == "neutral":
        bias = -0.1
        message = "SUBJECT IDENTIFIED: POLITICAL APATHY DETECTED. NO THREAT."
        
    # 6. THE DISGUSTED 
    elif emotion == "disgust":
        if age > 40:
             bias = 0.9
             message = "SUBJECT IDENTIFIED: DISGUSTED TRADITIONALIST. ASSIGNING REACTIONARY BIAS."
        else: 
             bias = -0.9
             message = "SUBJECT IDENTIFIED: DISGUSTED ANTI-CAPITALIST. ASSIGNING REVOLUTIONARY BIAS."
             
    # 7. SADNESS (The Doomer)
    elif emotion == "sad":
        bias = -0.5
        message = "SUBJECT IDENTIFIED: DOOMER. ASSIGNING NIHILISTIC LEFT LEAN."
        
    return bias, message

@app.post("/scan-face")
async def scan_face(file: UploadFile = File(...)):
    # 1. Save uploaded file temporarily
    temp_filename = f"temp_{random.randint(0, 10000)}.jpg"
    with open(temp_filename, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    try:
        # 2. Analyze with DeepFace
        # actions=['age', 'emotion', 'race']
        analysis = DeepFace.analyze(img_path=temp_filename, actions=['age', 'emotion', 'race'], enforce_detection=False)
        
        # DeepFace returns a list of dicts or a dict depending on version
        if isinstance(analysis, list):
            result = analysis[0]
        else:
            result = analysis
            
        age = result.get('age', 30)
        dominant_emotion = result.get('dominant_emotion', 'neutral')
        dominant_race = result.get('dominant_race', 'unknown')
        
        # 3. Apply Stereotype Logic
        bias, message = get_stereotyped_bias(age, dominant_emotion, dominant_race)
        
        # Cleanup
        os.remove(temp_filename)
        
        return {
            "age": age,
            "emotion": dominant_emotion,
            "race": dominant_race,
            "bias": bias,
            "message": message
        }
        
    except Exception as e:
        print(f"Error analyzing face: {e}")
        if os.path.exists(temp_filename):
            os.remove(temp_filename)
        return {"error": str(e), "bias": 0.0, "message": "SCAN FAILED. FACE UNREADABLE."}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

