import os
from dotenv import load_dotenv

# ✅ Ensure .env is loaded before any helper imports (so OpenAI, etc. have keys)
base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../"))
dotenv_path = os.path.join(base_dir, ".env")
load_dotenv(dotenv_path)

from flask import Blueprint, request
from twilio.twiml.messaging_response import MessagingResponse
from datetime import datetime
import random

from ..helpers.symptomchecker import symptomchecker
from ..helpers.clinicfinder import find_nearby_clinics
from ..helpers.prescriptionuploader import prescription_uploader
from ..helpers.healthtip_agent import generate_health_tip

from ..models import db, User, UserMessage, ResponseMessage, ChatSession, ChatMemory


whatsapp_bp = Blueprint("whatsapp_bp", __name__)

# 💡 Random fallback health tips
FALLBACK_TIPS = [
    "Stay hydrated, rest well, and take care of your body every day!",
    "Eat balanced meals and include fruits and vegetables.",
    "Get at least 7 hours of sleep daily to boost immunity.",
    "Take short walks and stretch to reduce stress.",
    "Stay positive — your mental health matters too!",
]


@whatsapp_bp.route("/", methods=["POST"])
def whatsapp_webhook():
    print("✅ WhatsApp webhook triggered")
    data = request.form
    user_phone = data.get("From", "").replace("whatsapp:", "").strip()
    user_message = data.get("Body", "").strip()
    normalized = user_message.lower()
    num_media = int(data.get("NumMedia", 0))

    response = MessagingResponse()
    message = response.message()

    # --- 1️⃣ Find or create user ---
    user = User.query.filter_by(phone=user_phone).first()
    new_user = False
    if not user:
        user = User(phone=user_phone, role="participant", password="whatsapp_user")
        db.session.add(user)
        db.session.commit()
        new_user = True
        print(f"🆕 New user created: {user_phone}")

    # --- 2️⃣ Manage chat session ---
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

    # --- 3️⃣ Auto Greet New Users ---
    if new_user:
        ai_greeting = symptomchecker(user_phone, "Greet the user warmly and introduce SheCare.")
        ai_reply = (
            f"{ai_greeting}\n\n"
            "I can help you with:\n"
            "1️⃣ Check symptoms\n"
            "2️⃣ Find nearby clinics\n"
            "3️⃣ Upload prescription\n"
            "4️⃣ Get daily health tips\n\n"
            "👉 Reply with a number to continue."
        )

        log_chat(user_phone, ai_reply, "bot")

        message.body(ai_reply)
        print("🤖 Sent welcome + main menu message")
        return str(response), 200, {"Content-Type": "application/xml"}

    # --- 4️⃣ Handle Prescription Upload ---
    if num_media > 0:
        media_url = data.get("MediaUrl0")
        media_type = data.get("MediaContentType0")
        print(f"📸 Prescription upload detected: {media_url} ({media_type})")

        success, ai_reply = prescription_uploader(user.id, media_url, media_type)

        response_msg = ResponseMessage(response=ai_reply, timestamp=datetime.utcnow())
        db.session.add(response_msg)
        db.session.commit()

        log_chat(user_phone, ai_reply, "bot")

        message.body(ai_reply)
        print("💾 Prescription upload handled" if success else "⚠️ Upload failed")
        return str(response), 200, {"Content-Type": "application/xml"}

    # --- 5️⃣ Save user message ---
    user_msg = UserMessage(user_id=user.id, message=normalized, timestamp=datetime.utcnow())
    db.session.add(user_msg)
    db.session.commit()
    log_chat(user_phone, normalized, "user")

    ai_reply = ""
    greetings = ["hi", "hello", "hey", "mambo", "habari", "niaje"]

    # --- 6️⃣ Handle Main Menu ---
    if session.session_state == "main_menu":
        print(f"🔎 Main menu input: '{normalized}'")

        if normalized in greetings:
            ai_reply = (
                "Hey there, \n\n"
                "Welcome to SheCare — your safe space for women’s health support.\n"
                "Whether you’re feeling unwell, need to find a nearby clinic, want to upload a prescription, or just want a little health inspiration — I’ve got you. \n"
                "Here’s how you can begin:\n"
                "1️⃣ Check your symptoms\n"
                "2️⃣ Find nearby clinics\n"
                "3️⃣ Upload prescription\n"
                "4️⃣ Get daily health tips\n"
                "0️⃣ Help / Menu\n\n"
                "✨ Reply with the number of what you’d like to do!"
            )

        elif normalized == "1":
            session.session_state = "symptom_input"
            db.session.commit()
            ai_reply = "🩺 Please describe your symptom (e.g., 'I have a headache and fever')."

        elif normalized == "2":
            session.session_state = "clinic_finder"
            db.session.commit()
            ai_reply = "📍 Please share your location or town name to find clinics near you."

        elif normalized == "3":
            ai_reply = "📸 Please upload a clear photo of your prescription."

        elif normalized == "4":
            try:
                ai_reply = f"💡 Tip: {generate_health_tip(user)}"
            except Exception as e:
                print(f"⚠️ Health tip generation failed: {e}")
                ai_reply = f"💡 Tip: {random.choice(FALLBACK_TIPS)}"

        elif normalized in ["0", "help", "menu"]:
            ai_reply = (
                "Here’s how you can use SheCare:\n"
                "1️⃣ Check symptoms\n"
                "2️⃣ Find clinics\n"
                "3️⃣ Upload prescription\n"
                "4️⃣ Daily tips\n"
                "0️⃣ Help / Menu"
            )

        else:
            ai_reply = "⚠️ I didn’t understand that.\nPlease reply with a number (1–4)."

    # --- 7️⃣ Handle Symptom Checker ---
    elif session.session_state == "symptom_input":
        if normalized in ["menu", "0", "back"]:
            session.session_state = "main_menu"
            db.session.commit()
            ai_reply = "🔙 Back to menu — reply with a number."
        else:
            ai_reply = symptomchecker(user_phone, normalized)
            session.session_state = "main_menu"
            db.session.commit()

    # --- 8️⃣ Handle Clinic Finder ---
    elif session.session_state == "clinic_finder":
        if normalized in ["menu", "0", "back"]:
            session.session_state = "main_menu"
            db.session.commit()
            ai_reply = "🔙 Back to menu — reply with a number."
        else:
            clinics = find_nearby_clinics(user_message)
            ai_reply = (
                "🩺 Clinics near you:\n\n" + "\n\n".join(clinics)
                if clinics else
                "⚕️ Sorry, I couldn’t find any clinics near that location."
            )
            session.session_state = "main_menu"
            db.session.commit()

    # --- 9️⃣ Save AI response ---
    if not ai_reply:
        ai_reply = "⚠️ Sorry, I didn’t get that. Please try again."

    response_msg = ResponseMessage(response=ai_reply, timestamp=datetime.utcnow())
    db.session.add(response_msg)
    db.session.commit()

    user_msg.response_id = response_msg.id
    db.session.commit()

    log_chat(user_phone, ai_reply, "bot")

    message.body(ai_reply)
    print("🤖 Sending reply:", ai_reply)

    return str(response), 200, {"Content-Type": "application/xml"}


# --- 🔹 Helper: Log Chat Memory ---
def log_chat(phone, message, sender):
    user = User.query.filter_by(phone=phone).first()
    if not user:
        return

    log = ChatMemory(user_id=user.id, message=message, sender=sender)
    db.session.add(log)
    db.session.commit()
