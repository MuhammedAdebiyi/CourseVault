import PyPDF2
import io
import logging
from typing import Dict, List
import anthropic
import os

logger = logging.getLogger(__name__)


def extract_text_from_pdf(file_obj) -> Dict:
    """
    Extract text content from a PDF file
    Returns: {
        'text': str,
        'page_count': int,
        'success': bool,
        'error': str (if failed)
    }
    """
    try:
        # Reset file pointer
        file_obj.seek(0)
        
        # Read PDF
        pdf_reader = PyPDF2.PdfReader(io.BytesIO(file_obj.read()))
        
        # Extract text from all pages
        text_content = []
        for page_num, page in enumerate(pdf_reader.pages, 1):
            try:
                text = page.extract_text()
                if text.strip():
                    text_content.append(f"--- Page {page_num} ---\n{text}")
            except Exception as e:
                logger.warning(f"Failed to extract text from page {page_num}: {e}")
                continue
        
        full_text = "\n\n".join(text_content)
        
        return {
            'text': full_text,
            'page_count': len(pdf_reader.pages),
            'success': True,
            'error': None
        }
    
    except Exception as e:
        logger.error(f"PDF text extraction failed: {e}")
        return {
            'text': '',
            'page_count': 0,
            'success': False,
            'error': str(e)
        }


def generate_quiz_questions_with_ai(pdf_text: str, num_questions: int = 5) -> List[Dict]:
    """
     USE CLAUDE AI TO GENERATE QUIZ QUESTIONS
    
    Args:
        pdf_text: Extracted PDF text content
        num_questions: Number of questions to generate
    
    Returns:
        List of question dicts: [{
            'question': str,
            'options': {'A': str, 'B': str, 'C': str, 'D': str},
            'correct_answer': str,
            'explanation': str,
            'difficulty': str,
            'source_text': str
        }]
    """
    

    api_key = os.environ.get('ANTHROPIC_API_KEY')
    if not api_key:
        logger.error("ANTHROPIC_API_KEY not found in environment")
        return []
    
    client = anthropic.Anthropic(api_key=api_key)
    
    
    max_chars = 100000  
    if len(pdf_text) > max_chars:
        pdf_text = pdf_text[:max_chars] + "\n\n[Content truncated...]"
    
    prompt = f"""Based on the following PDF content, generate {num_questions} multiple-choice quiz questions.

PDF CONTENT:
{pdf_text}

REQUIREMENTS:
1. Generate exactly {num_questions} questions
2. Each question should have 4 options (A, B, C, D)
3. Include the correct answer
4. Provide a brief explanation for the correct answer
5. Classify difficulty as: easy, medium, or hard
6. Include a snippet of source text used for the question

OUTPUT FORMAT (JSON):
[
  {{
    "question": "What is the main topic discussed?",
    "options": {{
      "A": "Option A text",
      "B": "Option B text",
      "C": "Option C text",
      "D": "Option D text"
    }},
    "correct_answer": "B",
    "explanation": "Brief explanation of why B is correct",
    "difficulty": "medium",
    "source_text": "Relevant excerpt from the PDF"
  }}
]

IMPORTANT: Return ONLY the JSON array, no other text."""
    
    try:
        message = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=4000,
            messages=[
                {"role": "user", "content": prompt}
            ]
        )
        
        
        response_text = message.content[0].text.strip()
        
        if response_text.startswith("```"):
            lines = response_text.split("\n")
            response_text = "\n".join(lines[1:-1])
        
        
        import json
        questions = json.loads(response_text)
        
        logger.info(f"Generated {len(questions)} questions using Claude AI")
        return questions
    
    except Exception as e:
        logger.error(f"AI question generation failed: {e}")
        return []


def generate_summary_with_ai(text):
    """
    GENERATE PDF SUMMARY USING CLAUDE
    """
    api_key = os.environ.get('ANTHROPIC_API_KEY')
    if not api_key:
        return ""
    
    client = anthropic.Anthropic(api_key=api_key)
    
    # Truncate if needed
    max_chars = 100000
    if len(pdf_text) > max_chars:
        pdf_text = pdf_text[:max_chars]
    
    prompt = f"""Summarize the following PDF content in 3-5 clear, concise paragraphs. Focus on the main points and key takeaways.

PDF CONTENT:
{pdf_text}

SUMMARY:"""
    
    try:
        message = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=1000,
            messages=[
                {"role": "user", "content": prompt}
            ]
        )
        
        summary = message.content[0].text.strip()
        logger.info("Generated PDF summary using Claude AI")
        return summary
    
    except Exception as e:
        logger.error(f"AI summary generation failed: {e}")
        return ""


def generate_flashcards_with_ai(pdf_text: str, num_cards: int = 10) -> List[Dict]:
    """
    GENERATE FLASHCARDS FROM PDF
    
    Returns: [{'front': str, 'back': str}, ...]
    """
    api_key = os.environ.get('ANTHROPIC_API_KEY')
    if not api_key:
        return []
    
    client = anthropic.Anthropic(api_key=api_key)
    
    max_chars = 100000
    if len(pdf_text) > max_chars:
        pdf_text = pdf_text[:max_chars]
    
    prompt = f"""Create {num_cards} flashcards from the following PDF content. Each flashcard should have a question/term on the front and answer/definition on the back.

PDF CONTENT:
{pdf_text}

OUTPUT FORMAT (JSON):
[
  {{
    "front": "Question or term",
    "back": "Answer or definition"
  }}
]

Return ONLY the JSON array."""
    
    try:
        message = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=2000,
            messages=[
                {"role": "user", "content": prompt}
            ]
        )
        
        response_text = message.content[0].text.strip()
        
        if response_text.startswith("```"):
            lines = response_text.split("\n")
            response_text = "\n".join(lines[1:-1])
        
        import json
        flashcards = json.loads(response_text)
        
        logger.info(f"Generated {len(flashcards)} flashcards")
        return flashcards
    
    except Exception as e:
        logger.error(f"Flashcard generation failed: {e}")
        return []