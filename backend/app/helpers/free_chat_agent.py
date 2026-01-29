# backend/app/helpers/free_chat_agent.py

import os
from typing import Optional, List

from dotenv import load_dotenv
from openai import OpenAI

from .gemini_client import gemini_generate
from ..models import ChatMemory, User, Participant

load_dotenv()

# ✅ Explicit key for reliability (same pattern as your other helpers)
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


def _is_openai_quota_or_rate_limit_error(e: Exception) -> bool:
    msg = str(e).lower()
    return (
        "insufficient_quota" in msg
        or "exceeded your current quota" in msg
        or "rate limit" in msg
        or "429" in msg
        or "too many requests" in msg
    )


def _get_first_name(user: Optional[User]) -> str:
    try:
        if not user:
            return ""
        p = Participant.query.filter_by(user_id=user.id).first()
        return (p.first_name or "").strip() if p else ""
    except Exception:
        return ""


def _get_recent_context(user_id: int, limit: int = 10) -> str:
    """
    Pulls recent chat turns from ChatMemory and formats them as context.
    """
    rows: List[ChatMemory] = (
        ChatMemory.query.filter_by(user_id=user_id)
        .order_by(ChatMemory.id.desc())
        .limit(limit)
        .all()
    )

    rows = list(reversed(rows))  # chronological
    lines: List[str] = []
    for r in rows:
        role = "User" if r.sender == "user" else "Bot"
        # keep context tight; WhatsApp users sometimes send long messages
        msg = (r.message or "").strip()
        if msg:
            lines.append(f"{role}: {msg}")
    return "\n".join(lines).strip()


def free_chat_agent(
    user_phone: str,
    user_message: str,
    user: Optional[User] = None,
    user_id: Optional[int] = None,
    context_limit: int = 10,
) -> str:
    """
    Handles free-form follow-up questions while user is in main_menu.

    - Uses ChatMemory as short conversation context
    - Answers the user’s follow-up
    - Uses OpenAI first, falls back to Gemini only on quota/rate limit
    """
    user_message = (user_message or "").strip()
    if not user_message:
        return "I didn’t catch that — could you retype your question?"

    uid = user_id or (user.id if user else None)
    context = _get_recent_context(uid, context_limit) if uid else ""

    first_name = _get_first_name(user)
    name_hint = f"The user's name is {first_name}." if first_name else ""

    # ✅ Safety + scope: general info only, no diagnosis certainty
    prompt = f"""
You are SheCare’s WhatsApp assistant for women’s health support.

{name_hint}

Conversation so far (most recent):
{context if context else "(no prior context available)"}

The user just asked:
"{user_message}"

Respond helpfully and briefly.

Rules:
- If the user is asking a follow-up about symptoms, provide general guidance and possible explanations, but do NOT diagnose.
- If they ask “which clinic do you recommend”, explain a simple decision framework (distance, reviews, services, hours, cost, emergency capability) and suggest the best choice ONLY if the clinic list in context includes clear differentiators; otherwise ask 1–2 clarifying questions.
- If they ask about prescriptions/medicines, give general information and safety reminders, and encourage confirmation with a pharmacist/clinician.
- If they ask about subscriptions/dashboard/account, explain clearly in plain language, based on what appears in context; if missing, say what info you need.
- If the user says thanks or reacts, respond warmly and offer the next step.
- Keep it WhatsApp-friendly (short paragraphs, minimal bullets).
- End with a single line that invites continuing the chat OR returning to the menu:
  "You can keep typing to continue, or reply 0 to see the menu."
""".strip()

    # --- OpenAI first ---
    try:
        completion = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are a careful, friendly health-support assistant. "
                        "You provide general information, encourage professional consultation, "
                        "and avoid overconfident medical claims."
                    ),
                },
                {"role": "user", "content": prompt},
            ],
            temperature=0.3,
            max_tokens=450,
        )
        reply = (completion.choices[0].message.content or "").strip()
        return reply or "I can help — could you clarify your question a bit? You can keep typing, or reply 0 to see the menu."

    except Exception as e:
        if _is_openai_quota_or_rate_limit_error(e):
            # --- Gemini fallback (quota / rate limit only) ---
            reply = (gemini_generate(prompt) or "").strip()
            return reply or "I can help — could you clarify your question a bit? You can keep typing, or reply 0 to see the menu."
        raise
