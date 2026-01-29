import os
from google import genai


def _pick_model(client: genai.Client) -> str:
    """
    Pick a Gemini model that supports text generation.

    Priority:
    1) GEMINI_MODEL from .env (e.g. "gemini-2.0-flash")
    2) First available Gemini model returned by the API
    3) Hard fallback to gemini-2.0-flash
    """

    override = (os.getenv("GEMINI_MODEL") or "").strip()
    if override:
        # Accept "gemini-..." or full "publishers/google/models/..."
        if override.startswith("publishers/"):
            return override
        return f"publishers/google/models/{override}"

    # Ask Gemini what models this key can use
    for model in client.models.list():
        name = model.name or ""
        # We only care about Gemini text-capable models
        if "gemini" in name.lower():
            return name

    # Final fallback (exists for almost all keys)
    return "publishers/google/models/gemini-2.0-flash"


def gemini_generate(prompt: str) -> str:
    api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
    if not api_key:
        raise RuntimeError("Set GEMINI_API_KEY (or GOOGLE_API_KEY) in .env")

    client = genai.Client(api_key=api_key)

    model_name = _pick_model(client)

    response = client.models.generate_content(
        model=model_name,
        contents=prompt,
    )

    return (response.text or "").strip()
