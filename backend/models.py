from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
#from flask_bcrypt import Bcrypt
from sqlalchemy import MetaData
from sqlalchemy.orm import validates, relationship
from sqlalchemy_serializer import SerializerMixin
from sqlalchemy.ext.associationproxy import association_proxy
import re # for validation
from datetime import datetime


db = SQLAlchemy()
migrate = Migrate()
#bcrypt = Bcrypt()

convention = {
    "ix": "ix_%(column_0_label)s",
    "uq": "uq_%(table_name)s_%(column_0_name)s",
    "ck": "ck_%(table_name)s_%(constraint_name)s",
    "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
    "pk": "pk_%(table_name)s"
}
metadata = MetaData(naming_convention=convention)
class Message(db.Model, SerializerMixin):
    __tablename__="messages"
    id=db.Column(db.Integer, primary_key=True)
    user_id=db.Column(db.Integer, db.ForeignKey('users.id'))
    response_id=db.Column(db.Integer, db.ForeignKey('response_messages.id'))
    timestamp=db.Column(db.DateTime)
    
    user=db.relationship("User", back_populates='messages')
    response=db.relationship("ResponseMessage", back_populates="messages")
    
    def __repr__(self):
        return f"<{self.id} {self.user_id} {self.response_id} {self.timestamp}>"
    

class UserMessage(db.Model, SerializerMixin):
    __tablename__="user_messages"
    id=db.Column(db.Integer, primary_key=True)
    message=db.Column(db.Text)
    user_id=db.Column(db.Integer, db.ForeignKey('users.id'))
    response_id=db.Column(db.Integer, db.ForeignKey('response_messages.id'))
    timestamp=db.Column(db.DateTime)

    user=db.relationship("User", back_populates='user_messages')
    response=db.relationship("ResponseMessage", back_populates="user_messages")

    def __repr__(self):
        return f"<{self.id} {self.message} {self.user_id} {self.response_id} {self.timestamp}>"

class ResponseMessage(db.Model, SerializerMixin):
    __tablename__="response_messages"
    id=db.Column(db.Integer, primary_key=True)
    response=db.Column(db.Text)
    input_token=db.Column(db.String(100))
    output_token=db.Column(db.String(100))
    timestamp=db.Column(db.DateTime)

    messages=db.relationship("Message", back_populates="response")
    user_messages=db.relationship("UserMessage", back_populates="response")

    def __repr__(self):
        return f"<{self.id} {self.response} {self.input_token} {self.output_token} {self.timestamp}>"
    