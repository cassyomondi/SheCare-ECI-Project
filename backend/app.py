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
    incoming_msg = request.form.get('Body', '').strip().lower()
    from_number = request.form.get('From', '').replace('whatsapp:', '')

    # Ensure user exists or create new
    user = User.query.filter_by(phone=from_number).first()
    if not user:
        user = User(phone=from_number, role='participant')
        db.session.add(user)
        db.session.commit()

    response = MessagingResponse()
    message = response.message()

    if "hi" in incoming_msg or "hello" in incoming_msg:
        reply = (
            "👋 Hello and welcome to *SheCare*!\n\n"
            "I'm your private health companion — here to help you check symptoms, "
            "find trusted clinics, and access affordable medication, all within WhatsApp.\n\n"
            "✨ To get started, you can reply with:\n"
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
