from datetime import datetime
from app.utils.db import db

class ChatSession(db.Model):
    __tablename__ = "chat_sessions"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.user_id"))
    session_state = db.Column(db.String)
    context = db.Column(db.Text)
    started_at = db.Column(db.DateTime, default=datetime.utcnow)
    last_activity = db.Column(db.DateTime)
    is_active = db.Column(db.Boolean, default=True)

    user = db.relationship("User", backref="chat_sessions", lazy=True)
