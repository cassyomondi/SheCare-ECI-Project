import io
import requests
from PIL import Image
import pytesseract
import os
from dotenv import load_dotenv
from datetime import datetime
from flask import current_app
from openai import OpenAI
from ..models import Prescription, db

load_dotenv()

def prescription_uploader(user_id, media_url, media_type):
    try:
        # Get Twilio credentials
        account_sid = os.getenv("TWILIO_ACCOUNT_SID")
        auth_token = os.getenv("TWILIO_AUTH_TOKEN")

        # Download image securely
        res = requests.get(media_url, auth=(account_sid, auth_token))
        res.raise_for_status()

        image_data = res.content

        # Run OCR (Extract text)
        image = Image.open(io.BytesIO(image_data))
        extracted_text = pytesseract.image_to_string(image)

        if not extracted_text.strip():
            return False, "⚠️ I couldn't read any text from the prescription image. Please try again with a clearer photo."

        # 🔥 AI Interpretation using OpenAI GPT
        client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        prompt = f"""
        You are a healthcare assistant helping users understand their medical prescriptions.
        The following is text extracted from an image of a prescription:

        \"\"\"{extracted_text}\"\"\"

        Please:
        1. Summarize the list of medicines (name, dosage, frequency).
        2. Explain briefly what each medicine is typically used for.
        3. Give a short reminder about safe use (consult doctor/pharmacist before taking).

        Use simple, friendly language.
        """

        completion = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a medical assistant who interprets prescriptions clearly and safely."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=500
        )

        ai_interpretation = completion.choices[0].message.content.strip()

        # Save prescription + OCR text + AI interpretation
        new_prescription = Prescription(
            user_id=user_id,
            uploaded=image_data,
            response=ai_interpretation,  # Save interpreted result
            timestamp=datetime.utcnow()
        )

        db.session.add(new_prescription)
        db.session.commit()

        # ✅ Return success message to WhatsApp
        ai_reply = (
            "✅ Prescription uploaded successfully!\n"
            "Here’s what I could read and interpret:\n\n"
            f"{ai_interpretation[:1200]}..."
        )

        return True, ai_reply

    except Exception as e:
        print("Prescription upload failed:", e)
        return False, "⚠️ Sorry, something went wrong while reading your prescription. Please try again later."
