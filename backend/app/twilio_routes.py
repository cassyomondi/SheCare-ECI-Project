from flask import Blueprint, request
from twilio.twiml.messaging_response import MessagingResponse
from app.models.models import User, UserMessage, ResponseMessage
from app.utils.db import db
from app.utils.helpers import find_nearby_clinics   # ✅ import helper
from datetime import datetime

twilio_bp = Blueprint("twilio_bp", __name__)

@twilio_bp.route("/whatsapp", methods=["POST"])
def whatsapp_bot():
    """Handle incoming WhatsApp messages, auto-register users, and log conversations."""
    incoming_msg = request.form.get("Body", "").strip()
    from_number = request.form.get("From", "").replace("whatsapp:", "").strip()
    latitude = request.form.get("Latitude")
    longitude = request.form.get("Longitude")

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
    db.session.flush()

    # Build Twilio response
    response = MessagingResponse()
    message = response.message()

    # --- Bot logic ---
    if "hi" in incoming_msg.lower() or "hello" in incoming_msg.lower():
        reply = (
            "👋 Hello and welcome to *SheCare*!\n\n"
            "I'm your private health companion — here to help you check symptoms, "
            "find trusted clinics, and access affordable medication.\n\n"
            "✨ To get started, reply with:\n"
            "1️⃣ Check symptoms\n"
            "2️⃣ Upload prescription\n"
            "3️⃣ Find nearby clinics\n"
            "4️⃣ Learn health tips"
        )

    elif "clinic" in incoming_msg.lower() or "find clinic" in incoming_msg.lower():
        reply = (
            "📍 Please *share your location* so I can find the nearest verified clinics.\n\n"
            "To do this:\n👉 Tap the *attachment 📎* icon → *Location* → *Send your current location*."
        )

    elif latitude and longitude:
        # Handle user shared location
        location_data = {"latitude": float(latitude), "longitude": float(longitude)}
        reply = find_nearby_clinics(location_data)

    else:
        reply = (
            "💬 Hi there! I’m *SheCare*, your trusted health companion.\n\n"
            "Type *Hi* or *Hello* to begin 🌸"
        )

    # Log bot response
    response_msg = ResponseMessage(
        response=reply,
        timestamp=datetime.utcnow()
    )
    db.session.add(response_msg)
    db.session.flush()

    # Link both
    user_message.response_id = response_msg.id
    db.session.commit()

    # Send reply
    message.body(reply)
    return str(response)
