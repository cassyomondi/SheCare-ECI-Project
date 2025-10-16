from flask import Flask, request
from twilio.twiml.messaging_response import MessagingResponse
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

app = Flask(__name__)

@app.route('/whatsapp', methods=['POST'])
def whatsapp_bot():
    """Handles incoming WhatsApp messages and sends a warm welcome."""
    incoming_msg = request.form.get('Body', '').strip().lower()
    from_number = request.form.get('From')

    response = MessagingResponse()
    message = response.message()

    # welcome message for first contact
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
    app.run(debug=True)
