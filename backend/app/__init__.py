from flask import Flask
from flask_cors import CORS
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
import os
from dotenv import load_dotenv
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
    """Unified SheCare backend (AI + Twilio + Core + API + Admin Auth)"""
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

    return app
