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
**The "PolarizationEncoder" Pipeline**

1.  **Data Inputs**:
    *   **Visual**: User's webcam feed (analyzed for age, emotion, etc.).
    *   **Text**: Live news articles from various sources.
2.  **The Polarization Engine (Neural Network)**:
    *   **Core Model**: A custom PyTorch model we call the `PolarizationEncoder`.
    *   **How it works**: It takes the text of an article and combines it with the user's "profile" (derived from their face).
3.  **Data Fusion**:
    *   Uses a "Fusion Layer" to weight the article's content against the user's demographics.
    *   *Goal*: Find articles that specifically trigger *this* specific user.
4.  **Outputs**:
    *   **Rage Score**: A predicted score of how likely the user is to engage (angrily).
    *   **Bias Check**: Ensures the content aligns with the user's assigned echo chamber.

---

## Slide 4: Key Technical Features
*   **Smart Text Analysis (BERT)**: 
    *   We use a pre-trained **BERT** model (standard NLP model) to understand the *meaning* of news headlines, not just keywords.
    *   We "fine-tune" it to recognize detailed political language.
*   **The "Rage Score" Format**: 
    *   A custom metric designed to maximize engagement.
    *   *Formula*: `Rage = (Likelihood to Click * 0.7) + (Predicted Controversy * 0.3)`
*   **Facial Profiling**: 
    *   Uses `DeepFace` to turn a webcam image into a simple data point (e.g., "Young, Happy, Neutral") that the model can understand.
*   **Satire Chat**: 
    *   An OpenAI chatbot that acts as a radicalized companion, reinforcing the user's bias.

---

## Slide 5: Tech Stack
*   **Frontend**: 
    *   **Next.js (React)**: High-performance rendering.
    *   **TailwindCSS**: Utility-first styling.
*   **Backend & ML**: 
    *   **FastAPI**: Asynchronous inference server.
    *   **PyTorch**: Framework for the `PolarizationEncoder` model.
    *   **Transformers (HuggingFace)**: Model hub for BERT weights.
    *   **DeepFace**: For facial analysis pipeline.

---

## Slide 6: Demo & Conclusion
*   **Live Demo**: Showing the Face Scanner assigning a bias and altering the news feed.
*   **Takeaway**: Demonstrates how easily innocent data (your face, your clicks) can be used to categorize and manipulate users into feedback loops.
