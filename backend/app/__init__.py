from flask import Flask
from flask_migrate import Migrate
from flask_cors import CORS
from app.utils.db import db
from app.config import Config


def create_app():
    """Application factory pattern for SheCare backend"""
    app = Flask(__name__)
    app.config.from_object(Config)
    CORS(app)

    # Initialize database and migrations
    db.init_app(app)
    Migrate(app, db)

    # Import models
    from app.models import (
        user, practitioner, admin, associate, participant,
        message, response, prescription, tip, chatsession
    )

    # Import model classes after registration
    from app.models.user import User

    @app.route("/")
    def home():
        return {"message": "SheCare backend is running"}

    @app.route("/testdb")
    def test_db():
        """Simple DB connectivity test"""
        try:
            # Insert a new test user
            new_user = User(phone="254700000000", password="test123", role="participant")
            db.session.add(new_user)
            db.session.commit()

            # Fetch all users
            users = User.query.all()
            data = [{"id": u.user_id, "phone": u.phone, "role": u.role} for u in users]

            return {"message": "Database connection successful", "users": data}
        except Exception as e:
            return {"error": str(e)}, 500

    return app
