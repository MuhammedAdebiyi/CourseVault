import json
from .deepseek_client import deepseek_chat  # We'll create this in Step 2

def generate_quiz_questions_with_ai(text, num_questions=6):
    """
    Generate quiz questions including THEORY and OBJECTIVE questions.
    """
    prompt = f"""
    You are an expert tutor. Generate EXACTLY {num_questions} multiple-choice questions 
    based ONLY on the text below. Half of the questions should be THEORY questions 
    (conceptual understanding), and the other half should be OBJECTIVES questions 
    (based on learning objectives).

    Requirements:
    - Each question must have 4 options: A, B, C, D
    - Include the correct answer
    - Include a brief explanation
    - Include difficulty: easy, medium, or hard
    - Include question type: "theory" or "objective"
    - Return JSON ONLY in this format:

    [
      {{
        "question": "",
        "options": {{"A":"", "B":"", "C":"", "D":""}},
        "correct_answer": "A",
        "explanation": "",
        "difficulty": "medium",
        "type": "theory"
      }}
    ]

    TEXT:
    {text}
    """
    result = deepseek_chat(prompt)
    try:
        return json.loads(result)
    except Exception:
        
        json_str = result[result.find("["): result.rfind("]") + 1]
        return json.loads(json_str)


def generate_flashcards_with_ai(text, num_cards=10):
    prompt = f"""
    Generate {num_cards} study flashcards from the text.
    Format strictly as JSON: [{"{"}front: "Q", back: "A{"}"}]
    TEXT:
    {text}
    """
    result = deepseek_chat(prompt)
    try:
        return json.loads(result)
    except:
        json_str = result[result.find("["): result.rfind("]") + 1]
        return json.loads(json_str)


def generate_summary_with_ai(text):
    prompt = f"Provide a clear summary of this text in 5–10 bullet points:\n{text}"
    return deepseek_chat(prompt)
