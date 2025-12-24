# The Polarization Engine
## A Satirical Exploration of Algorithmic Bias

---

## Slide 1: Title
**Title**: The Polarization Engine
**Subtitle**: Automating the Echo Chamber
**Theme**: Algorithmic Bias, Computer Vision, and "Rage Farming"

---

## Slide 2: The Problem
*   **Context**: Modern algorithms optimize for engagement, often favoring outrage over accuracy.
*   **Concept**: "Rage Farming" — the systematic generation of content designed to provoke anger.
*   **Our Approach**: A satrical application that *explicitly* profiles the user and constructs a perfect, radicalized echo chamber around them.

---

## Slide 3: System Architecture
**The "Radicalization Pipeline"**

1.  **Input**: User's Webcam Feed.
2.  **Analysis**: Backend uses **DeepFace** (Computer Vision) to detect stats: *Age, Emotion, Race*.
3.  **The Stereotyping Engine**: Logic that maps demographics to political stereotypes (e.g., "Angry Boomer" → Far Right, "Happy Gen Z" → Far Left).
4.  **Content Aggregation**: Fetches real-time RSS feeds from across the spectrum (Jacobin, Breitbart, CNN, etc.).
5.  **Ranking**: Sorts news by a calculated **"Rage Score"**.

---

## Slide 4: Key Technical Features
*   **Facial Profiling**: Utilizes `DeepFace` to determine user demographics and apparent emotional state in real-time.
*   **Sentiment Analysis**: Uses **VADER** (Valence Aware Dictionary and sEntiment Reasoner) to score article headlines.
    *   *Formula*: `Rage = (Negative Sentiment * 0.6) + (Compound Intensity * 0.4)`
*   **Satire Chat**: An OpenAI-powered chatbot that adopts a persona (e.g., "Conspiracy Theorist", "Socialist Activist") matching the user's assigned bias.

---

## Slide 5: Tech Stack
*   **Frontend**: 
    *   **Next.js (React)**: For a responsive, interactive UI.
    *   **TailwindCSS**: For rapid, modern styling.
*   **Backend**: 
    *   **FastAPI (Python)**: High-performance API handling.
    *   **Libraries**: `deepface` (Vision), `vaderSentiment` (NLP), `feedparser` (RSS), `openai`.

---

## Slide 6: Demo & Conclusion
*   **Live Demo**: Showing the Face Scanner assigning a bias and altering the news feed.
*   **Takeaway**: Demonstrates how easily innocent data (your face, your clicks) can be used to categorize and manipulate users into feedback loops.
