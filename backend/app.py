from flask import Flask, request
from twilio.twiml.messaging_response import MessagingResponse
from dotenv import load_dotenv
from app.utils.db import db
from app.models.models import User
from app.config import Config
from datetime import datetime
import os

load_dotenv()

app = Flask(__name__)
app.config.from_object(Config)
db.init_app(app)


@app.route('/whatsapp', methods=['POST'])
def whatsapp_bot():
    """Handles incoming WhatsApp messages and registers new users."""
    incoming_msg = request.form.get('Body', '').strip().lower()
    from_number = request.form.get('From', '')  # Format: whatsapp:+254712345678

    response = MessagingResponse()
    message = response.message()

    # ✅ Extract phone number cleanly
    if from_number.startswith("whatsapp:"):
        phone = from_number.replace("whatsapp:+", "").strip()
    else:
        phone = from_number.strip()

    with app.app_context():
        # ✅ Check if user already exists
        user = User.query.filter_by(phone=phone).first()

        if not user:
            # ✅ Create new user record
            new_user = User(
                phone=phone,
                role="participant",
                created_at=datetime.utcnow()
            )
            db.session.add(new_user)
            db.session.commit()
            print(f"✅ New user registered: {phone}")

        # ✅ Craft personalized reply
        if "hi" in incoming_msg or "hello" in incoming_msg:
            reply = (
                "👋 Hello and welcome to *SheCare*! 💖\n\n"
                "I’m your private health companion — here to help you check symptoms, "
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


if __name__ == "__main__":
    with app.app_context():
        db.create_all()  # Ensure all tables exist
    app.run(debug=True)
