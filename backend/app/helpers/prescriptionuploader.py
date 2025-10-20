import io
import os
import requests
from requests.auth import HTTPBasicAuth
from PIL import Image
import pytesseract
from datetime import datetime
from dotenv import load_dotenv
from ..models import Prescription, db

# Load environment variables
load_dotenv()

def prescription_uploader(user_id, media_url, media_type):
    """
    Downloads a prescription image from Twilio, extracts text with Tesseract,
    saves it to the database, and returns a summary message.
    """
    try:
        print(f"📸 Prescription upload detected: {media_url} ({media_type})")

        # ✅ Load Twilio credentials from environment
        account_sid = os.getenv("TWILIO_ACCOUNT_SID")
        auth_token = os.getenv("TWILIO_AUTH_TOKEN")

        if not account_sid or not auth_token:
            raise ValueError("⚠️ Missing Twilio credentials in .env")

        # ✅ Download the media file securely
        res = requests.get(media_url, auth=HTTPBasicAuth(account_sid, auth_token))
        res.raise_for_status()
        image_data = res.content

        # ✅ Perform OCR using Tesseract
        image = Image.open(io.BytesIO(image_data))
        extracted_text = pytesseract.image_to_string(image)

        # ✅ Save both the image and OCR text to the DB
        new_prescription = Prescription(
            user_id=user_id,
            uploaded=image_data,
            response=extracted_text.strip(),
            timestamp=datetime.utcnow(),
        )
        db.session.add(new_prescription)
        db.session.commit()

        # ✅ Success message
        ai_reply = (
            "✅ *Prescription uploaded successfully!*\n"
            "Here’s what I could read from your image:\n\n"
            f"_{extracted_text.strip()[:400]}..._"
        )

        print("💾 Prescription saved successfully.")
        return True, ai_reply

    except Exception as e:
        print(f"❌ Prescription upload failed: {e}")
        return False, "⚠️ Sorry, something went wrong while reading your prescription."
