from flask import Flask
from flask_cors import CORS
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from apscheduler.schedulers.background import BackgroundScheduler
import os
from dotenv import load_dotenv
import openai
from twilio.rest import Client
from datetime import datetime
import random

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
    ChatSession
)

# -------------------------------
# 🔧 Environment Setup
# -------------------------------
base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../"))
dotenv_path = os.path.join(base_dir, ".env")
load_dotenv(dotenv_path)

print("🔐 Loaded TWILIO_ACCOUNT_SID:", os.getenv("TWILIO_ACCOUNT_SID"))

migrate = Migrate()

# -------------------------------
# 🚀 App Factory
# -------------------------------
def create_app():
    """Unified SheCare backend (AI + Twilio + Core + API + Admin Auth + Health Tips)"""
    app = Flask(__name__)

    # Configuration
    app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv(
        "DATABASE_URL",
        "postgresql://postgres:password@localhost/shecare_db"
    )
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.config["SECRET_KEY"] = os.getenv("SECRET_KEY", "supersecretkey")

    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)
    CORS(app)

    # 🔐 JWT Setup
    app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "supersecretjwtkey")
    jwt = JWTManager(app)

    # 🤖 OpenAI setup
    openai.api_key = os.getenv("OPENAI_API_KEY")

    # -------------------------------
    # ✅ Register Blueprints
    # -------------------------------

    # 1️⃣ Twilio routes
    try:
        from app.routes.twilio_routes import twilio_bp
        app.register_blueprint(twilio_bp)
    except Exception as e:
        print("⚠️ Could not load Twilio routes:", e)

    # 2️⃣ WhatsApp AI bot
    try:
        from app.whatsapp.bot import whatsapp_bp
        app.register_blueprint(whatsapp_bp, url_prefix="/whatsapp")
    except Exception as e:
        print("⚠️ Could not load WhatsApp AI bot:", e)

    # 3️⃣ REST API routes
    try:
        from app.routes.api_routes import api_bp
        app.register_blueprint(api_bp)
        print("✅ API routes registered successfully.")
    except Exception as e:
        print("⚠️ Could not load API routes:", e)

    # 4️⃣ Admin authentication routes
    try:
        from app.routes.admin_routes import admin_bp
        app.register_blueprint(admin_bp)
        print("✅ Admin routes registered successfully.")
    except Exception as e:
        print("⚠️ Could not load Admin routes:", e)

    # -------------------------------
    # 🏠 Default Test Routes
    # -------------------------------
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
                role="participant"
            )
            db.session.add(new_user)
            db.session.commit()
            users = User.query.all()
            data = [
                {"id": u.id, "phone": u.phone, "email": u.email, "role": u.role}
                for u in users
            ]
            return {"message": "Database connection successful", "users": data}
        except Exception as e:
            db.session.rollback()
            return {"error": str(e)}, 500

    # 🕒 Start daily scheduler for health tips
    scheduler = BackgroundScheduler()
    scheduler.add_job(send_daily_health_tips, 'interval', hours=24)
    scheduler.start()
    print("🕒 Daily Health Tip Scheduler started!")

    return app


# -------------------------------
# 🌿 Health Tip Generation Logic
# -------------------------------
def generate_health_tip():
    tips = [
        "Drink plenty of water throughout the day to stay hydrated.",
        "Aim for at least 30 minutes of activity daily to boost mood and heart health.",
        "Prioritize sleep: aim for 7–9 hours each night.",
        "Include colorful fruits and vegetables in your meals.",
        "Practice mindful breathing or short breaks throughout the day.",
        "Limit processed foods and added sugars for sustained energy."
    ]

    try:
        if openai.api_key:
            resp = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are a helpful health assistant."},
                    {"role": "user", "content": "Provide a concise daily health tip in one sentence."}
                ],
                max_tokens=60,
                n=1,
                temperature=0.7,
            )
            tip = resp.choices[0].message.get("content", "").strip()
            if tip:
                return tip
    except Exception:
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
            print(f"✅ Sent tip to {user.phone}")
        except Exception as e:
            print(f"⚠️ Failed to send tip to {user.phone}: {e}")

    print("🎯 All health tips sent successfully!")
