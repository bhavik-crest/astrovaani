# openrouter.py
import os
import httpx
from typing import Any, Dict

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
# Keep URL configurable. Example default that some users use:
# https://api.openrouter.ai/v1/chat/completions
OPENROUTER_URL = os.getenv("OPENROUTER_URL", "https://api.openrouter.ai/v1/chat/completions")
OPENROUTER_MODEL = os.getenv("OPENROUTER_MODEL", None)  # optional

if not OPENROUTER_API_KEY:
    raise RuntimeError("OPENROUTER_API_KEY must be set in environment")

HEADERS = {
    "Authorization": f"Bearer {OPENROUTER_API_KEY}",
    "Content-Type": "application/json",
}


async def call_openrouter(prompt: str, system_prompt: str | None = None, max_tokens: int = 1000, temperature: float = 0.2) -> Dict[str, Any]:
    """
    Calls the OpenRouter endpoint using httpx.AsyncClient.
    The function is intentionally generic: API shape can vary between completions/chat endpoints.
    We send a JSON body containing model (if provided), prompt (or messages), temperature, max_tokens.
    Adjust OPENROUTER_URL and OPENROUTER_MODEL via env as needed.
    """
    payload = {}

    # If user configured a chat endpoint (chat/completions), send messages.
    # If it's a completions endpoint, we send prompt field.
    if "chat" in OPENROUTER_URL.lower():
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})
        payload = {
            "messages": messages,
            "max_tokens": max_tokens,
            "temperature": temperature,
        }
        if OPENROUTER_MODEL:
            payload["model"] = OPENROUTER_MODEL
    else:
        # generic completions-style
        full_prompt = (system_prompt + "\n\n" if system_prompt else "") + prompt
        payload = {
            "prompt": full_prompt,
            "max_tokens": max_tokens,
            "temperature": temperature,
        }
        if OPENROUTER_MODEL:
            payload["model"] = OPENROUTER_MODEL

    async with httpx.AsyncClient(timeout=30.0) as client:
        resp = await client.post(OPENROUTER_URL, headers=HEADERS, json=payload)
        resp.raise_for_status()
        return resp.json()
