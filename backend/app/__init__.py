from flask import Flask
from flask_migrate import Migrate
from flask_cors import CORS
from app.utils.db import db
from app.config import Config
from dotenv import load_dotenv
from models import bcrypt
from flask_mail import Mail

import os


load_dotenv()
mail = Mail()  


def create_app():
    """Application factory pattern for SheCare backend"""
    app = Flask(__name__)
    app.config.from_object(Config)
    CORS(app)

    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SECRET_KEY = os.getenv("SECRET_KEY", "shecare-secret-key")


    # Initialize database
    db.init_app(app)
    bcrypt.init_app(app)
    mail.init_app(app) 



    # Import models BEFORE initializing Migrate
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

    # Initialize migration AFTER models are known to SQLAlchemy
    Migrate(app, db)

    # bcrypt = Bcrypt(flask_app)

    app.config['MAIL_SERVER'] = os.getenv('MAIL_SERVER')
    app.config['MAIL_PORT'] = int(os.getenv('MAIL_PORT', 587))
    app.config['MAIL_USE_TLS'] = os.getenv('MAIL_USE_TLS', 'True') == 'True'
    app.config['MAIL_USERNAME'] = os.getenv('MAIL_USERNAME')
    app.config['MAIL_PASSWORD'] = os.getenv('MAIL_PASSWORD')
    app.config['MAIL_DEFAULT_SENDER'] = os.getenv('MAIL_DEFAULT_SENDER')


    # Register Twilio Blueprint
    from app.twilio_routes import twilio_bp
    app.register_blueprint(twilio_bp)

    # Define home route only once
    @app.route("/")
    def home():
        return {"message": "SheCare backend is running"}

    # Optional: database test route
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
