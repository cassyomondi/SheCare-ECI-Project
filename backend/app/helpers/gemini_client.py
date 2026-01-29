import os
import google.generativeai as genai

def gemini_generate(prompt: str) -> str:
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise RuntimeError("GEMINI_API_KEY is not set")

    genai.configure(api_key=api_key)

    # fast + cheap default model; you can change later
    model = genai.GenerativeModel("gemini-1.5-flash")

    resp = model.generate_content(prompt)
    return (resp.text or "").strip()
