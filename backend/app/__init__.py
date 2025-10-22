from flask import Flask
from flask_migrate import Migrate
from flask_cors import CORS
from app.utils.db import db
from app.config import Config

def create_app():
    """Application factory pattern for SheCare backend"""
    flask_app = Flask(__name__)
    flask_app.config.from_object(Config)
    CORS(flask_app)

    # Initialize database
    db.init_app(flask_app)

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
    Migrate(flask_app, db)

    # Register Twilio Blueprint
    from app.twilio_routes import twilio_bp
    flask_app.register_blueprint(twilio_bp)

    # Define home route only once
    @flask_app.route("/")
    def home():
        return {"message": "SheCare backend is running"}

    # Optional: database test route
    @flask_app.route("/testdb")
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

    return flask_app
