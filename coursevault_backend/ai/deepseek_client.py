import requests
from django.conf import settings

DEEPSEEK_API_KEY = settings.DEEPSEEK_API_KEY
BASE_URL = "https://api.deepseek.com/v1/chat/completions"

def deepseek_chat(prompt: str) -> str:
    headers = {
        "Authorization": f"Bearer {DEEPSEEK_API_KEY}",
        "Content-Type": "application/json"
    }

    payload = {
        "model": "deepseek-chat",
        "messages": [
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": prompt}
        ],
        "max_tokens": 800,
        "stream": False
    }

    response = requests.post(BASE_URL, json=payload, headers=headers)
    response.raise_for_status()
    data = response.json()
    
    return data.get("choices", [{}])[0].get("message", {}).get("content", "")
