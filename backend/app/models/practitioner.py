from datetime import datetime
from app.utils.db import db

class MedicalPractitioner(db.Model):
    __tablename__ = "medical_practitioners"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.user_id"))
    first_name = db.Column(db.String)
    last_name = db.Column(db.String)
    speciality = db.Column(db.String)
    title = db.Column(db.String)
    location = db.Column(db.String)
    description = db.Column(db.String)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship("User", backref="medical_practitioner", lazy=True)
