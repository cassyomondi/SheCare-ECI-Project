# backend/app/helpers/healthtip_agent.py

import os
import random
from dotenv import load_dotenv
from openai import OpenAI

from .gemini_client import gemini_generate

load_dotenv()

# OpenAI client (same style as symptomchecker)
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# Static fallback tip (last resort)
FALLBACK_TIP = (
    "Remember to drink enough clean water today — staying hydrated helps your body and mind function at their best!"
)

CATEGORIES = [
    "nutrition",
    "mental health",
    "exercise",
    "hygiene",
    "reproductive health",
    "hydration",
    "sleep habits",
    "disease prevention",
]


def _is_openai_quota_or_rate_limit_error(e: Exception) -> bool:
    msg = str(e).lower()
    return (
        "insufficient_quota" in msg
        or "exceeded your current quota" in msg
        or "rate limit" in msg
        or "429" in msg
        or "too many requests" in msg
    )


def generate_health_tip(user=None) -> str:
    """
    Generates one short, friendly daily health tip (<= 50 words).
    Tries OpenAI first, falls back to Gemini on quota/rate-limit errors,
    and finally returns a static fallback tip if both fail.

    user is optional (kept for compatibility with bot.py / scheduler).
    """
    category = random.choice(CATEGORIES)

    prompt = (
        f"Write one short, friendly daily health tip about {category}, "
        "suitable for a general audience in Kenya. Keep it under 50 words."
    )

    # 1) Try OpenAI
    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": "You are a caring digital health assistant providing practical advice.",
                },
                {"role": "user", "content": prompt},
            ],
            temperature=0.7,
        )

        tip = (response.choices[0].message.content or "").strip()
        if tip:
            print(f"💡 Generated health tip via OpenAI ({category}): {tip}")
            return tip

    except Exception as e:
        if _is_openai_quota_or_rate_limit_error(e):
            print("⚠️ OpenAI quota/rate limit hit for health tips. Falling back to Gemini...")
        else:
            print("❌ OpenAI health tip generation failed:", e)
            # Non-quota errors can still try Gemini, but we log them clearly.

        # 2) Fallback to Gemini (whether quota-related or just OpenAI failure)
        try:
            tip = gemini_generate(
                f"{prompt}\n\nReturn only the tip text (no title, no bullets)."
            )
            tip = (tip or "").strip()
            if tip:
                print(f"💡 Generated health tip via Gemini ({category}): {tip}")
                return tip
        except Exception as ge:
            print("❌ Gemini health tip generation failed:", ge)

    # 3) Last resort
    return FALLBACK_TIP
