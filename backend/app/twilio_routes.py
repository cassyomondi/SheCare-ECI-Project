# app/twilio_routes.py
from flask import Blueprint, request
from twilio.twiml.messaging_response import MessagingResponse
from app.models.models import User
from app.utils.db import db

twilio_bp = Blueprint("twilio_bp", __name__)

@twilio_bp.route("/whatsapp", methods=["POST"])
def whatsapp_bot():
    """Handle incoming WhatsApp messages and auto-register user."""
    incoming_msg = request.form.get("Body", "").strip().lower()
    from_number = request.form.get("From", "").replace("whatsapp:", "").strip()

    # Check if user already exists
    user = User.query.filter_by(phone=from_number).first()
    if not user:
        # Create and save new participant user
        user = User(phone=from_number, role="participant")
        db.session.add(user)
        db.session.commit()

    # Prepare Twilio response
    response = MessagingResponse()
    message = response.message()

    if "hi" in incoming_msg or "hello" in incoming_msg:
        reply = (
            "👋 Hello and welcome to *SheCare*!\n\n"
            "I'm your private health companion — here to help you check symptoms, "
            "find trusted clinics, and access affordable medication, all within WhatsApp.\n\n"
            "✨ To get started, reply with:\n"
            "1️⃣ Check symptoms\n"
            "2️⃣ Upload prescription\n"
            "3️⃣ Find nearby clinics\n"
            "4️⃣ Learn health tips"
        )
    else:
        reply = (
            "💬 Hi there! I’m *SheCare*, your trusted health companion.\n\n"
            "Type *Hi* or *Hello* to begin your private health journey 🌸"
        )

    message.body(reply)
    return str(response)
