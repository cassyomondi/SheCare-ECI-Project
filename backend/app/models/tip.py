from datetime import datetime
from app.utils.db import db

class Tip(db.Model):
    __tablename__ = "tips"

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String)
    description = db.Column(db.Text)
    status = db.Column(db.Boolean, default=False)
    practitioner = db.Column(db.String)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    sent_timestamp = db.Column(db.DateTime)
    verified_timestamp = db.Column(db.DateTime)
