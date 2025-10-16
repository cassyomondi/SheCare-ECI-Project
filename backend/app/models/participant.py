from datetime import datetime
from app.utils.db import db

class Participant(db.Model):
    __tablename__ = "participants"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.user_id"))
    first_name = db.Column(db.String)
    last_name = db.Column(db.String)
    location = db.Column(db.String)
    age = db.Column(db.Integer)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship("User", backref="participant_profile", lazy=True)
