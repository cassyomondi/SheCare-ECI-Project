from datetime import datetime
from app.utils.db import db

class ResponseMessage(db.Model):
    __tablename__ = "response_messages"

    id = db.Column(db.Integer, primary_key=True)
    response = db.Column(db.Text)
    input_token = db.Column(db.String)
    output_token = db.Column(db.String)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
