from datetime import datetime
from app.utils.db import db

class Message(db.Model):
    __tablename__ = "messages"

    message_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.user_id"))
    response_id = db.Column(db.Integer, db.ForeignKey("response_messages.id"))
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship("User", backref="messages", lazy=True)
    response = db.relationship("ResponseMessage", backref="message", lazy=True)


class UserMessage(db.Model):
    __tablename__ = "user_messages"

    id = db.Column(db.Integer, primary_key=True)
    message = db.Column(db.Text)
    user_id = db.Column(db.Integer, db.ForeignKey("users.user_id"))
    response_id = db.Column(db.Integer, db.ForeignKey("response_messages.id"))
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship("User", backref="user_messages", lazy=True)
    response = db.relationship("ResponseMessage", backref="user_messages", lazy=True)
