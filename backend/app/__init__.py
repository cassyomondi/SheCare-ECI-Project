from flask import Flask
from flask_migrate import Migrate
from flask_cors import CORS
from app.utils.db import db
from app.config import Config

# ✅ Rename the variable to avoid clashing with the 'app' package
def create_app():
    """Application factory pattern for SheCare backend"""
    flask_app = Flask(__name__)
    flask_app.config.from_object(Config)
    CORS(flask_app)

    # Initialize database and migrations
    db.init_app(flask_app)
    Migrate(flask_app, db)

    # Import all models
    import app.models.models  # ensures all models are registered

    @flask_app.route("/")
    def home():
        return {"message": "SheCare backend is running"}

    @flask_app.route("/testdb")
    def test_db():
        try:
            from app.models.models import User
            new_user = User(phone="0712345678", email="test@example.com", password="testpass123", role="participant")
            db.session.add(new_user)
            db.session.commit()
            users = User.query.all()
            data = [{"id": u.id, "phone": u.phone, "email": u.email, "role": u.role} for u in users]
            return {"message": "Database connection successful", "users": data}
        except Exception as e:
            db.session.rollback()
            return {"error": str(e)}, 500

    return flask_app
