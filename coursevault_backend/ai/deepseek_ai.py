import requests
from typing import List, Dict

# -----------------------------
# Configuration
# -----------------------------
DEESEEK_API_KEY = "YOUR_DEEPSEEK_API_KEY"  # Replace with your key
DEESEEK_BASE_URL = "https://api.deepseek.ai/v1"

# -----------------------------
# Utility to call DeepSeek
# -----------------------------
def call_deepseek(endpoint: str, payload: dict) -> dict:
    """
    Call DeepSeek API and return JSON response
    """
    headers = {
        "Authorization": f"Bearer {DEESEEK_API_KEY}",
        "Content-Type": "application/json",
    }
    url = f"{DEESEEK_BASE_URL}/{endpoint}"
    
    response = requests.post(url, json=payload, headers=headers)
    if response.status_code != 200:
        raise Exception(f"DeepSeek API Error {response.status_code}: {response.text}")
    
    return response.json()

# -----------------------------
# Quiz Generation
# -----------------------------
def generate_quiz_questions_with_ai(text: str, num_questions: int = 5) -> List[Dict]:
    """
    Generate quiz questions from text using DeepSeek
    """
    payload = {
        "text": text,
        "num_questions": num_questions,
        "format": "multiple_choice"  # DeepSeek supports multiple formats
    }
    result = call_deepseek("generate-quiz", payload)
    
    # Normalize to expected format
    questions = []
    for item in result.get("questions", []):
        questions.append({
            "question": item.get("question"),
            "options": item.get("options", []),
            "correct_answer": item.get("answer"),
            "explanation": item.get("explanation", ""),
            "difficulty": item.get("difficulty", "medium"),
            "source_text": item.get("source_text", "")
        })
    return questions

# -----------------------------
# Flashcard Generation
# -----------------------------
def generate_flashcards_with_ai(text: str, num_cards: int = 10) -> List[Dict]:
    """
    Generate flashcards from text using DeepSeek
    """
    payload = {
        "text": text,
        "num_flashcards": num_cards
    }
    result = call_deepseek("generate-flashcards", payload)
    
    flashcards = []
    for item in result.get("flashcards", []):
        flashcards.append({
            "question": item.get("front"),
            "answer": item.get("back")
        })
    return flashcards

# -----------------------------
# Summary Generation
# -----------------------------
def generate_summary_with_ai(text: str) -> str:
    """
    Generate AI summary from text using DeepSeek
    """
    payload = {
        "text": text,
        "length": "medium"  # short, medium, long
    }
    result = call_deepseek("summarize", payload)
    return result.get("summary", "")
