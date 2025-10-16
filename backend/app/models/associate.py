from datetime import datetime
from app.utils.db import db

class Associate(db.Model):
    __tablename__ = "associates"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.user_id"))
    first_name = db.Column(db.String)
    last_name = db.Column(db.String)
    designation = db.Column(db.String)
    description = db.Column(db.String)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship("User", backref="associate_profile", lazy=True)
