from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_migrate import Migrate
from apscheduler.schedulers.background import BackgroundScheduler
from twilio.rest import Client
from datetime import datetime
import os, random
from dotenv import load_dotenv
import openai

from .whatsapp.bot import whatsapp_bp
from .models import db, User, HealthTip
from .helpers.healthtip_agent import generate_health_tip  # ✅ use the smarter version

# --- Load environment variables ---
base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../"))
dotenv_path = os.path.join(base_dir, ".env")
load_dotenv(dotenv_path)

print("🔐 Loaded TWILIO_ACCOUNT_SID:", os.getenv("TWILIO_ACCOUNT_SID"))

migrate = Migrate()

def create_app():
    app = Flask(__name__)

    # Configuration
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv(
        'DATABASE_URL',
        'postgresql://postgres:password@localhost/shecare_db'
    )
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

    @app.route("/")
    def home():
        return "SheCare API is running ✅"

    # --- Start daily scheduler after app context ---
    with app.app_context():
        scheduler = BackgroundScheduler()
        scheduler.add_job(send_daily_health_tips, 'interval', hours=24)
        scheduler.start()
        print("🕒 Daily Health Tip Scheduler started!")

    return app


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
        # ✅ Use personalized tip based on chat history
        try:
            tip_text = generate_health_tip(user)
        except Exception as e:
            print(f"⚠️ Error generating personalized tip: {e}")
            # fallback to a static one
            tip_text = random.choice([
                "Drink plenty of water throughout the day.",
                "Aim for at least 30 minutes of activity daily.",
                "Get enough sleep — your body needs it to heal.",
                "Eat more fruits and vegetables for balanced nutrition.",
                "Take time to relax and breathe deeply each day."
            ])

        try:
            client.messages.create(
                from_="whatsapp:+14155238886",
                to=f"whatsapp:{user.phone}",
                body=f"🌿 *Daily Health Tip*\n{tip_text}"
            )

            new_tip = HealthTip(
                user_id=user.id,
                tip_text=tip_text,
                sent=True,
                date_sent=datetime.utcnow()
            )
            db.session.add(new_tip)
            print(f"✅ Sent tip to {user.phone}")

        except Exception as e:
            print(f"⚠️ Failed to send tip to {user.phone}: {e}")

    db.session.commit()
    print("🎯 All health tips sent successfully!")
