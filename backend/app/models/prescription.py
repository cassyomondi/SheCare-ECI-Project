from datetime import datetime
from app.utils.db import db

class Prescription(db.Model):
    __tablename__ = "prescriptions"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.user_id"))
    uploaded = db.Column(db.LargeBinary)
    response = db.Column(db.String)
    input_token = db.Column(db.String)
    output_token = db.Column(db.String)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship("User", backref="prescriptions", lazy=True)
