# backend/app/helpers/prescriptionuploader.py

import io
import os
import time
from datetime import datetime

import requests
from PIL import Image
import pytesseract
from dotenv import load_dotenv
from openai import OpenAI

from .gemini_client import gemini_generate
from ..models import Prescription, db

load_dotenv()

# ✅ Same OpenAI client style (explicit key for reliability)
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


def prescription_uploader(user_id, media_url, media_type):
    """
    1) Downloads WhatsApp media from Twilio
    2) OCR extracts text
    3) Interprets with OpenAI, falls back to Gemini on quota/rate-limit
    4) Stores the prescription + AI response
    """
    try:
        # --- 1) Download media securely from Twilio ---
        account_sid = os.getenv("TWILIO_ACCOUNT_SID")
        auth_token = os.getenv("TWILIO_AUTH_TOKEN")
        if not account_sid or not auth_token:
            return False, "⚠️ Server is missing Twilio credentials. Please try again later."

        t0 = time.time()
        res = requests.get(media_url, auth=(account_sid, auth_token), timeout=25)
        res.raise_for_status()
        image_data = res.content
        print(f"⏱ prescription download: {time.time() - t0:.2f}s")

        # --- 2) OCR ---
        try:
            image = Image.open(io.BytesIO(image_data))
        except Exception:
            return False, "⚠️ I couldn't open that file as an image. Please upload a clear photo of the prescription."

        t1 = time.time()
        extracted_text = (pytesseract.image_to_string(image) or "").strip()
        print(f"⏱ prescription OCR: {time.time() - t1:.2f}s")

        if not extracted_text:
            return False, (
                "⚠️ I couldn't read any text from the prescription image. "
                "Please try again with a clearer photo (good lighting, focused, straight-on)."
            )

        # --- 3) AI Interpretation prompt (used by both providers) ---
        prompt = f"""
You are a healthcare assistant helping users understand medical prescriptions.

The following is text extracted from an image of a prescription:

\"\"\"{extracted_text}\"\"\"

Please:
1) Summarize the medicines (name, dosage, frequency) if present.
2) Explain briefly what each medicine is typically used for (general info).
3) Add a short safety reminder (confirm with a doctor/pharmacist; do not self-medicate).
If the text is unclear, say what is unclear and ask for a clearer photo.

Use simple, friendly language.
Do not claim certainty if the OCR looks messy.
""".strip()

        ai_interpretation = ""

        # --- 4) Try OpenAI first ---
        t2 = time.time()
        try:
            completion = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {
                        "role": "system",
                        "content": "You are a medical assistant who interprets prescriptions clearly and safely.",
                    },
                    {"role": "user", "content": prompt},
                ],
                temperature=0.3,
                max_tokens=500,
            )
            ai_interpretation = (completion.choices[0].message.content or "").strip()

        except Exception as e:
            # Fallback to Gemini ONLY on quota/rate limit errors (same pattern as symptomchecker)
            if _is_openai_quota_or_rate_limit_error(e):
                print("⚠️ OpenAI quota/rate limit hit for prescription interpretation. Falling back to Gemini...")
                ai_interpretation = gemini_generate(prompt)
            else:
                raise

        print(f"⏱ prescription AI: {time.time() - t2:.2f}s")

        if not (ai_interpretation or "").strip():
            ai_interpretation = (
                "⚠️ I extracted some text but couldn't interpret it confidently. "
                "Please upload a clearer photo, or type out the medicine names and instructions."
            )

        # --- 5) Save to DB ---
        new_prescription = Prescription(
            user_id=user_id,
            uploaded=image_data,  # raw bytes
            response=ai_interpretation,  # interpreted result
            timestamp=datetime.utcnow(),
        )
        db.session.add(new_prescription)
        db.session.commit()

        # --- 6) WhatsApp reply ---
        ai_reply = (
            "✅ Prescription uploaded successfully!\n"
            "Here’s what I could read and interpret:\n\n"
            f"{ai_interpretation[:1200]}{'...' if len(ai_interpretation) > 1200 else ''}"
        )
        return True, ai_reply

    except Exception as e:
        print("Prescription upload failed:", e)
        db.session.rollback()
        return (
            False,
            "⚠️ Sorry, something went wrong while reading your prescription. Please try again later.",
        )
