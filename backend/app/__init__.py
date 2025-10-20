from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_migrate import Migrate
import os
from dotenv import load_dotenv
import openai
from .whatsapp.bot import whatsapp_bp  # ✅ fixed import
from .models import db

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

    return app
