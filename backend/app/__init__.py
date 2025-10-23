from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_migrate import Migrate
from apscheduler.schedulers.background import BackgroundScheduler
import os
from dotenv import load_dotenv
import openai
from twilio.rest import Client
from datetime import datetime
import random
from .whatsapp.bot import whatsapp_bp  # ✅ fixed import
from .models import db, User, HealthTip

# --- ✅ Load .env from the project root ---
base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../"))
dotenv_path = os.path.join(base_dir, ".env")
load_dotenv(dotenv_path)

# Verify .env is loading correctly
print("🔐 Loaded TWILIO_ACCOUNT_SID:", os.getenv("TWILIO_ACCOUNT_SID"))

# --- Initialize extensions ---
migrate = Migrate()

def create_app():
    app = Flask(__name__)

    # Configuration
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'postgresql://postgres:password@localhost/shecare_db')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'supersecretkey')

    # Initialize OpenAI
    openai.api_key = os.getenv("OPENAI_API_KEY")

    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)
    CORS(app)

    # Register blueprints
    app.register_blueprint(whatsapp_bp, url_prefix='/whatsapp')
    print("✅ Registered routes:", app.url_map)

    # Simple home route
    @app.route("/")
    def home():
        return "SheCare API is running ✅"

        # Start daily scheduler
    scheduler = BackgroundScheduler()
    scheduler.add_job(send_daily_health_tips, 'interval', hours=24)
    scheduler.start()
    print("🕒 Daily Health Tip Scheduler started!")
    return app
def generate_health_tip():
    """
    Return a short health tip. If OpenAI is configured, attempt to generate a tip via the API;
    otherwise fall back to a random static tip list.
    """
    tips = [
        "Drink plenty of water throughout the day to stay hydrated and help your body function optimally.",
        "Aim for at least 30 minutes of moderate physical activity most days to boost mood and heart health.",
        "Prioritize sleep: aim for 7–9 hours nightly to support recovery and cognitive function.",
        "Include a variety of colorful fruits and vegetables in your meals to get a broad range of nutrients.",
        "Practice mindful breathing or short breaks throughout the day to reduce stress and improve focus.",
        "Limit processed foods and added sugars; choose whole foods when possible for sustained energy."
    ]

    # Prefer OpenAI-generated tip if API key is configured, but don't fail if the call errors.
    try:
        if openai.api_key:
            resp = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are a helpful health assistant."},
                    {"role": "user", "content": "Provide a concise, friendly daily health tip in one sentence."}
                ],
                max_tokens=60,
                n=1,
                temperature=0.7,
            )
            tip = resp.choices[0].message.get("content", "").strip()
            if tip:
                return tip
    except Exception:
        # If anything goes wrong with OpenAI, silently fall back to static tips.
        pass

    return random.choice(tips)


def send_daily_health_tips():
    print("💌 Sending daily health tips...")
    account_sid = os.getenv("TWILIO_ACCOUNT_SID")
    auth_token = os.getenv("TWILIO_AUTH_TOKEN")
    client = Client(account_sid, auth_token)

    users = User.query.all()
    if not users:
        print("⚠️ No users found.")
        return

    for user in users:
        tip_text = generate_health_tip()
        try:
            client.messages.create(
                from_="whatsapp:+14155238886",
                to=f"whatsapp:{user.phone}",
                body=f"🌿 *Daily Health Tip*\n{tip_text}"
            )

            new_tip = HealthTip(user_id=user.id, tip_text=tip_text, sent=True, date_sent=datetime.utcnow())
            db.session.add(new_tip)
            print(f"✅ Sent tip to {user.phone}")

        except Exception as e:
            print(f"⚠️ Failed to send tip to {user.phone}: {e}")

    db.session.commit()
    print("🎯 All health tips sent successfully!")
    print("🎯 All health tips sent successfully!")