from flask import Flask
from flask_cors import CORS
from flask_migrate import Migrate
import os
from dotenv import load_dotenv
from .whatsapp.bot import whatsapp_bp
import openai

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

# Load environment variables
base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../"))
dotenv_path = os.path.join(base_dir, ".env")
load_dotenv(dotenv_path)

# Verify .env loaded
print("🔐 Loaded TWILIO_ACCOUNT_SID:", os.getenv("TWILIO_ACCOUNT_SID"))

migrate = Migrate()

def create_app():
    """Unified SheCare backend (AI + Twilio + Core)"""
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

    # ✅ Register Blueprints
    try:
        from app.twilio_routes import twilio_bp
        app.register_blueprint(twilio_bp)
    except Exception as e:
        print("⚠️ Could not load Twilio routes:", e)

    try:
        from app.whatsapp.bot import whatsapp_bp
        app.register_blueprint(whatsapp_bp, url_prefix='/whatsapp')
    except Exception as e:
        print("⚠️ Could not load WhatsApp AI bot:", e)

    # ✅ Routes
    @app.route("/")
    def home():
        return {"message": "SheCare backend (AI + Twilio) is running ✅"}

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
            data = [{"id": u.id, "phone": u.phone, "email": u.email, "role": u.role} for u in users]
            return {"message": "Database connection successful", "users": data}
        except Exception as e:
            db.session.rollback()
            return {"error": str(e)}, 500

    return app
