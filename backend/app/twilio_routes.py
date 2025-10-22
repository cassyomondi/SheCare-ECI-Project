# app/twilio_routes.py
from flask import Blueprint, request
from twilio.twiml.messaging_response import MessagingResponse
from app.models.models import User, UserMessage, ResponseMessage
from app.utils.db import db
from datetime import datetime

twilio_bp = Blueprint("twilio_bp", __name__)

@twilio_bp.route("/whatsapp", methods=["POST"])
def whatsapp_bot():
    """Handle incoming WhatsApp messages, auto-register users, and log conversations."""
    incoming_msg = request.form.get("Body", "").strip()
    from_number = request.form.get("From", "").replace("whatsapp:", "").strip()

    # Ensure user exists
    user = User.query.filter_by(phone=from_number).first()
    if not user:
        user = User(phone=from_number, role="participant")
        db.session.add(user)
        db.session.commit()

    # Log user message
    user_message = UserMessage(
        user_id=user.id,
        message=incoming_msg,
        timestamp=datetime.utcnow()
    )
    db.session.add(user_message)
    db.session.flush()  # get its ID before commit

    # Generate bot reply
    response = MessagingResponse()
    message = response.message()

    if "hi" in incoming_msg.lower() or "hello" in incoming_msg.lower():
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

    # Log bot response
    response_msg = ResponseMessage(
        response=reply,
        input_token=None,  # optional if you later integrate AI
        output_token=None,
        timestamp=datetime.utcnow()
    )
    db.session.add(response_msg)
    db.session.flush()

    # Link both records
    user_message.response_id = response_msg.id
    db.session.commit()

    # Send reply to WhatsApp
    message.body(reply)
    return str(response)
