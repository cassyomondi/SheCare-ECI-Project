# backend/app/__init__.py

import os
import random
from datetime import datetime

from dotenv import load_dotenv
from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_migrate import Migrate
from apscheduler.schedulers.background import BackgroundScheduler
from twilio.rest import Client as TwilioClient
from openai import OpenAI

from app.utils.db import db
from app.models.models import (
    User,
    MedicalPractitioner,
    Admin,
    Associate,
    Participant,
    Message,
    UserMessage,
    ResponseMessage,
    Prescription,
    Tip,
    ChatSession,
    HealthTip,
)

from app.helpers.healthtip_agent import generate_health_tip
from app.helpers.gemini_client import gemini_generate

# -------------------------------
# 🔧 Environment Setup
# -------------------------------
base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../"))
dotenv_path = os.path.join(base_dir, ".env")
load_dotenv(dotenv_path)

print("🔐 Loaded TWILIO_ACCOUNT_SID:", os.getenv("TWILIO_ACCOUNT_SID"))

migrate = Migrate()

# ✅ Explicit OpenAI client style (same pattern as symptomchecker/prescriptionuploader)
openai_client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


def _is_openai_quota_or_rate_limit_error(e: Exception) -> bool:
    msg = str(e).lower()
    return (
        "insufficient_quota" in msg
        or "exceeded your current quota" in msg
        or "rate limit" in msg
        or "429" in msg
        or "too many requests" in msg
    )


# -------------------------------
# 🚀 App Factory
# -------------------------------
def create_app():
    """Unified SheCare backend (AI + Twilio + Core + API + Admin Auth + Health Tips)"""
    app = Flask(__name__)

    # Configuration
    app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv(
        "DATABASE_URL", "postgresql://postgres:password@localhost/shecare_db"
    )
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.config["SECRET_KEY"] = os.getenv("SECRET_KEY", "supersecretkey")

    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)
    CORS(app)

    # 🔐 JWT Setup
    app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "supersecretjwtkey")
    JWTManager(app)

    # Optional: expose clients on app.extensions (handy if you ever need them elsewhere)
    app.extensions["openai_client"] = openai_client

    # -------------------------------
    # ✅ Register Blueprints
    # -------------------------------
    try:
        from app.routes.twilio_routes import twilio_bp

        app.register_blueprint(twilio_bp)
    except Exception as e:
        print("⚠️ Could not load Twilio routes:", e)

    try:
        from app.whatsapp.bot import whatsapp_bp

        app.register_blueprint(whatsapp_bp, url_prefix="/whatsapp")
    except Exception as e:
        print("⚠️ Could not load WhatsApp AI bot:", e)

    try:
        from app.routes.api_routes import api_bp

        app.register_blueprint(api_bp)
        print("✅ API routes registered successfully.")
    except Exception as e:
        print("⚠️ Could not load API routes:", e)

    try:
        from app.routes.admin_routes import admin_bp

        app.register_blueprint(admin_bp)
        print("✅ Admin routes registered successfully.")
    except Exception as e:
        print("⚠️ Could not load Admin routes:", e)

    @app.route("/")
    def home():
        return {"message": "SheCare backend (AI + Twilio + API) is running ✅"}

    @app.route("/testdb")
    def test_db():
        try:
            new_user = User(
                phone="0712345678",
                email="test@example.com",
                password="testpass123",
                role="participant",
            )
            db.session.add(new_user)
            db.session.commit()

            users = User.query.all()
            data = [{"id": u.id, "phone": u.phone, "email": u.email, "role": u.role} for u in users]
            return {"message": "Database connection successful", "users": data}
        except Exception as e:
            db.session.rollback()
            return {"error": str(e)}, 500

    # 🕒 Start daily scheduler for health tips (with app context)
    def _scheduled_job():
        with app.app_context():
            send_daily_health_tips()

    scheduler = BackgroundScheduler()
    scheduler.add_job(_scheduled_job, "interval", hours=24)
    scheduler.start()
    print("🕒 Daily Health Tip Scheduler started!")

    return app


# -------------------------------
# 🌿 Daily Health Tip Sender
# -------------------------------
def send_daily_health_tips():
    print("💌 Sending daily health tips...")

    account_sid = os.getenv("TWILIO_ACCOUNT_SID")
    auth_token = os.getenv("TWILIO_AUTH_TOKEN")

    if not account_sid or not auth_token:
        print("⚠️ Missing Twilio credentials in environment.")
        return

    twilio_client = TwilioClient(account_sid, auth_token)
    users = User.query.all()

    if not users:
        print("⚠️ No users found.")
        return

    fallback_pool = [
        "Drink plenty of water throughout the day.",
        "Aim for at least 30 minutes of activity daily.",
        "Get enough sleep — your body needs it to recover.",
        "Eat more fruits and vegetables for balanced nutrition.",
        "Take time to relax and breathe deeply each day.",
    ]

    for user in users:
        # ✅ Generate tip with OpenAI -> Gemini fallback (same pattern)
        try:
            tip_text = generate_health_tip(user)  # your updated helper should already do fallback
        except Exception as e:
            # If your helper ever throws (or isn’t updated yet), we still handle quota fallback here.
            if _is_openai_quota_or_rate_limit_error(e):
                print("⚠️ OpenAI quota/rate limit hit for health tips. Falling back to Gemini...")
                prompt = (
                    "Write one short, friendly daily health tip suitable for a general audience in Kenya. "
                    "Keep it under 50 words."
                )
                try:
                    tip_text = gemini_generate(prompt)
                except Exception as ge:
                    print("⚠️ Gemini fallback failed:", ge)
                    tip_text = random.choice(fallback_pool)
            else:
                print(f"⚠️ Error generating personalized tip: {e}")
                tip_text = random.choice(fallback_pool)

        if not (tip_text or "").strip():
            tip_text = random.choice(fallback_pool)

        try:
            twilio_client.messages.create(
                from_=os.getenv("TWILIO_WHATSAPP_FROM", "whatsapp:+14155238886"),
                to=f"whatsapp:{user.phone}",
                body=f"🌿 *Daily Health Tip*\n{tip_text}",
            )

            # ✅ Log sent tip
            new_tip = HealthTip(
                user_id=user.id,
                tip_text=tip_text,
                sent=True,
                date_sent=datetime.utcnow(),
            )
            db.session.add(new_tip)
            db.session.commit()

            print(f"✅ Sent tip to {user.phone}")

        except Exception as e:
            db.session.rollback()
            print(f"⚠️ Failed to send tip to {user.phone}: {e}")

    print("🎯 All health tips sent successfully!")
