import os
from dotenv import load_dotenv

# ✅ Ensure .env is loaded before any helper imports (so OpenAI, etc. have keys)
base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../"))
dotenv_path = os.path.join(base_dir, ".env")
load_dotenv(dotenv_path)

from flask import Blueprint, request
from twilio.twiml.messaging_response import MessagingResponse
from datetime import datetime

from ..helpers.symptomchecker import symptomchecker
from ..helpers.clinicfinder import find_nearby_clinics
from ..helpers.prescriptionuploader import prescription_uploader
from ..models import db, User, UserMessage, ResponseMessage, ChatSession


whatsapp_bp = Blueprint("whatsapp_bp", __name__)

@whatsapp_bp.route("/", methods=["POST"])
def whatsapp_webhook():
    print("✅ WhatsApp webhook triggered")
    print("📩 Incoming data:", request.form)

    data = request.form
    user_phone = data.get("From", "").replace("whatsapp:", "").strip()
    user_message = data.get("Body", "").strip()
    normalized = user_message.lower()
    num_media = int(data.get("NumMedia", 0))

    response = MessagingResponse()
    message = response.message()

    # --- 1️⃣ Find or create user ---
    user = User.query.filter_by(phone=user_phone).first()
    if not user:
        user = User(phone=user_phone, role="participant", password="whatsapp_user")
        db.session.add(user)
        db.session.commit()
        print(f"🆕 New user created: {user_phone}")

    # --- 2️⃣ Manage ChatSession ---
    session = ChatSession.query.filter_by(user_id=user.id, is_active=True).first()
    if not session:
        session = ChatSession(
            user_id=user.id,
            session_state="main_menu",
            started_at=datetime.utcnow(),
        )
        db.session.add(session)
        db.session.commit()
        print(f"🆕 New chat session started for {user_phone}")

    # --- 3️⃣ Handle Prescription Upload (if media is attached) ---
    if num_media > 0:
        media_url = data.get("MediaUrl0")
        media_type = data.get("MediaContentType0")
        print(f"📸 Prescription upload detected: {media_url} ({media_type})")

        success, ai_reply = prescription_uploader(user.id, media_url, media_type)

        response_msg = ResponseMessage(response=ai_reply, timestamp=datetime.utcnow())
        db.session.add(response_msg)
        db.session.commit()

        message.body(ai_reply)
        print("💾 Prescription upload handled" if success else "⚠️ Upload failed")
        return str(response), 200, {"Content-Type": "application/xml"}

    # --- 4️⃣ Save user message (for text only) ---
    user_msg = UserMessage(user_id=user.id, message=normalized, timestamp=datetime.utcnow())
    db.session.add(user_msg)
    db.session.commit()

    ai_reply = ""
    greetings = ["hi", "hello", "hey", "mambo", "habari", "niaje"]

    # 💬 Greeting handler
    if normalized in greetings:
        session.session_state = "main_menu"
        db.session.commit()
        ai_reply = (
            "👋 Karibu SheCare!\n\n"
            "I can help you with:\n"
            "1️⃣ Check your symptoms\n"
            "2️⃣ Find nearby clinics\n"
            "3️⃣ Upload prescription\n"
            "4️⃣ Get daily health tips\n"
            "0️⃣ Help / Menu\n\n"
            "👉 Please reply with a number (e.g., 1)."
        )
        print("✅ Greeting detected — showing main menu")

    # --- 5️⃣ Main menu logic ---
    elif session.session_state == "main_menu":
        print(f"🔎 Checking main menu input: '{normalized}'")

        if normalized == "1":
            session.session_state = "symptom_input"
            db.session.commit()
            ai_reply = "🩺 Please describe your symptom (e.g., 'I have a headache and fever')."

        elif normalized == "2":
            session.session_state = "clinic_finder"
            db.session.commit()
            ai_reply = "📍 Please share your location or town name to find clinics near you."

        elif normalized == "3":
            ai_reply = (
                "📸 Please upload a clear photo of your prescription.\n\n"
                "Make sure text is visible and not blurry."
            )

        elif normalized == "4":
            ai_reply = "💡 Tip: Stay hydrated, rest well, and take care of your body every day!"

        elif normalized in ["0", "help", "menu"]:
            ai_reply = (
                "Here’s how you can use SheCare:\n"
                "1️⃣ Check symptoms\n"
                "2️⃣ Find clinics\n"
                "3️⃣ Upload prescription\n"
                "4️⃣ Daily tips\n\n"
                "Type the number to continue."
            )

        else:
            ai_reply = (
                "⚠️ I didn’t understand that.\n"
                "Please reply with one of these options:\n"
                "1️⃣ Check symptoms\n"
                "2️⃣ Find clinics\n"
                "3️⃣ Upload prescription\n"
                "4️⃣ Get daily tips\n"
                "0️⃣ Help / Menu"
            )

    # --- 6️⃣ Symptom checker flow ---
    elif session.session_state == "symptom_input":
        if normalized in ["menu", "0", "back"]:
            session.session_state = "main_menu"
            db.session.commit()
            ai_reply = (
                "🔙 Returning to the main menu.\n"
                "Please reply with a number:\n"
                "1️⃣ Check symptoms\n"
                "2️⃣ Find clinics\n"
                "3️⃣ Upload prescription\n"
                "4️⃣ Get daily tips"
            )
        else:
            ai_reply = symptomchecker(normalized)
            session.session_state = "main_menu"
            db.session.commit()

    # --- 7️⃣ Clinic finder flow ---
    elif session.session_state == "clinic_finder":
        if normalized in ["menu", "0", "back", "rudi"]:
            session.session_state = "main_menu"
            db.session.commit()
            ai_reply = "🔙 You have returned to main menu. Please reply with a number (e.g.: 1 au 2)."
        else:
            clinics = find_nearby_clinics(user_message)
            if clinics:
                ai_reply = "🩺 Clinics near you:\n\n" + "\n\n".join(clinics)
            else:
                ai_reply = "⚕️ Sorry, I couldn’t find any clinics near that location."
            session.session_state = "main_menu"
            db.session.commit()

    # --- 8️⃣ Save AI response ---
    if not ai_reply:
        ai_reply = "⚠️ Sorry, I didn’t get that. Please try again."

    response_msg = ResponseMessage(response=ai_reply, timestamp=datetime.utcnow())
    db.session.add(response_msg)
    db.session.commit()

    user_msg.response_id = response_msg.id
    db.session.commit()

    message.body(ai_reply)
    print("🤖 Sending reply:", ai_reply)

    return str(response), 200, {"Content-Type": "application/xml"}
