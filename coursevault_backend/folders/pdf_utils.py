from django.conf import settings
from openai import OpenAI
import PyPDF2
import io
import json
import math
import os

def extract_text_from_pdf(pdf_file):
    """Extract text from PDF file"""
    try:
        pdf_file.seek(0)
        pdf_reader = PyPDF2.PdfReader(pdf_file)
        text = ""
        page_count = len(pdf_reader.pages)
        for page in pdf_reader.pages:
            text += page.extract_text() + "\n"
        return {'success': True, 'text': text.strip(), 'page_count': page_count}
    except Exception as e:
        return {'success': False, 'error': str(e)}


def chunk_text(text, max_chars=3000):
    """Split text into smaller chunks for AI processing"""
    chunks = []
    start = 0
    while start < len(text):
        end = min(start + max_chars, len(text))
        chunks.append(text[start:end])
        start = end
    return chunks


# --- Quiz functions ---
def generate_quiz_questions_with_ai(text, pdf_id=None, num_questions=5, question_type="objective"):
    """Generate quiz questions with chunking and duplicate prevention"""
    try:
        previous_questions = []
        if pdf_id:
            data = load_generated_questions(pdf_id)
            previous_questions = [q['question'] for q in data.get(question_type, [])]

        client = OpenAI(api_key=settings.DEEPSEEK_API_KEY, base_url="https://api.deepseek.com")
        text_chunks = chunk_text(text, max_chars=3000)
        questions = []
        questions_per_chunk = math.ceil(num_questions / len(text_chunks))

        for chunk in text_chunks:
            if question_type == "objective":
                prompt = f"""Generate {questions_per_chunk} unique multiple-choice questions based on the text below.
Avoid duplicating questions that have already been generated.

Text:
{chunk}

Provide for each question:
1. Question
2. Four options (A, B, C, D)
3. Correct answer (A/B/C/D)
4. Explanation
5. Difficulty (easy, medium, hard)

Return as a JSON array only."""
            else:
                prompt = f"""Generate {questions_per_chunk} unique theory/descriptive questions based on the text below.
Avoid duplicating questions that have already been generated.

Text:
{chunk}

Provide for each question:
1. Question
2. Detailed answer or guideline
3. Difficulty (easy, medium, hard)

Return as a JSON array only."""

            response = client.chat.completions.create(
                model="deepseek-chat",
                messages=[
                    {"role": "system", "content": "You are a helpful educational assistant that creates quiz questions."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
            )

            content = response.choices[0].message.content.strip()
            if content.startswith("```json"):
                content = content.split("```json")[1].split("```")[0].strip()
            elif content.startswith("```"):
                content = content.split("```")[1].split("```")[0].strip()

            chunk_questions = json.loads(content)
            chunk_questions = [q for q in chunk_questions if q['question'] not in previous_questions]
            previous_questions.extend([q['question'] for q in chunk_questions])
            questions.extend(chunk_questions)

        questions = questions[:num_questions]

        if pdf_id:
            save_generated_questions(pdf_id, questions, question_type=question_type)

        return questions

    except Exception as e:
        print(f"Quiz generation error: {e}")
        return []


def get_generated_questions_file(pdf_id):
    folder = os.path.join(settings.BASE_DIR, "generated_questions")
    os.makedirs(folder, exist_ok=True)
    return os.path.join(folder, f"pdf_{pdf_id}_questions.json")


def load_generated_questions(pdf_id):
    path = get_generated_questions_file(pdf_id)
    if os.path.exists(path):
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    return {"objective": [], "theory": []}


def save_generated_questions(pdf_id, questions, question_type="objective"):
    existing = load_generated_questions(pdf_id)
    existing[question_type].extend(questions)
    path = get_generated_questions_file(pdf_id)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(existing, f, ensure_ascii=False, indent=2)


# --- Summary function ---
def generate_summary_with_ai(text):
    """Generate summary using DeepSeek"""
    try:
        client = OpenAI(api_key=settings.DEEPSEEK_API_KEY, base_url="https://api.deepseek.com")
        max_chars = 12000
        if len(text) > max_chars:
            text = text[:max_chars] + "..."
        prompt = f"""Please provide a comprehensive summary of the following text. 
The summary should:
- Capture the main points and key ideas
- Be well-organized with clear structure
- Be around 200-300 words
- Use bullet points for better readability

Text:
{text}"""
        response = client.chat.completions.create(
            model="deepseek-chat",
            messages=[
                {"role": "system", "content": "You are a helpful assistant that creates clear, concise summaries."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
        )
        summary = response.choices[0].message.content.strip()
        return summary
    except Exception as e:
        print(f"Summary generation error: {e}")
        return None


# --- Flashcards function ---
def generate_flashcards_with_ai(text, num_cards=10):
    """Generate flashcards using DeepSeek"""
    try:
        client = OpenAI(api_key=settings.DEEPSEEK_API_KEY, base_url="https://api.deepseek.com")
        max_chars = 8000
        if len(text) > max_chars:
            text = text[:max_chars] + "..."
        prompt = f"""Based on the following text, create {num_cards} flashcards for studying.

Text:
{text}

Each flashcard should have:
- Front: A question or term
- Back: The answer or definition

Format your response as a JSON array only."""

        response = client.chat.completions.create(
            model="deepseek-chat",
            messages=[
                {"role": "system", "content": "You are a helpful educational assistant that creates study flashcards."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
        )
        content = response.choices[0].message.content.strip()
        if content.startswith("```json"):
            content = content.split("```json")[1].split("```")[0].strip()
        elif content.startswith("```"):
            content = content.split("```")[1].split("```")[0].strip()
        flashcards = json.loads(content)
        return flashcards
    except Exception as e:
        print(f"Flashcard generation error: {e}")
        return []
