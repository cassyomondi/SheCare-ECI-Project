from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import MetaData
from sqlalchemy_serializer import SerializerMixin
from sqlalchemy.orm import validates, relationship
from datetime import datetime
import re

# Initialize SQLAlchemy with naming convention
convention = {
    "ix": "ix_%(column_0_label)s",
    "uq": "uq_%(table_name)s_%(column_0_name)s",
    "ck": "ck_%(table_name)s_%(constraint_name)s",
    "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
    "pk": "pk_%(table_name)s"
}

metadata = MetaData(naming_convention=convention)
db = SQLAlchemy(metadata=metadata)


# =====================================================
# USER MODEL
# =====================================================
class User(db.Model, SerializerMixin):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    phone = db.Column(db.String(20), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=True)
    role = db.Column(db.String(50), nullable=False)
    created_at = db.Column(db.DateTime, server_default=db.func.now())

    # Relationships
    medical_practitioners = db.relationship('MedicalPractitioner', back_populates='user', cascade='all, delete-orphan')
    admins = db.relationship('Admin', back_populates='user', cascade='all, delete-orphan')
    associates = db.relationship('Associate', back_populates='user', cascade='all, delete-orphan')
    messages = db.relationship('Message', back_populates='user', cascade='all, delete-orphan')
    user_messages = db.relationship('UserMessage', back_populates='user', cascade='all, delete-orphan')
    prescriptions = db.relationship('Prescription', back_populates='user', cascade='all, delete-orphan')
    chat_sessions = db.relationship('ChatSession', back_populates='user', cascade='all, delete-orphan')
    participant = db.relationship('Participant', back_populates='user', uselist=False)

    # Validators
    @validates('phone')
    def validate_phone(self, key, phone):
        if not phone or len(phone) < 10:
            raise ValueError("Phone number must be at least 10 digits")
        return phone

    @validates('password')
    def validate_password(self, key, password):
        if not password or len(password) < 8:
            raise ValueError("Password must be at least 8 characters")
        return password

    @validates('email')
    def validate_email(self, key, email):
        if email and '@' not in email:
            raise ValueError("Invalid email address")
        return email

    serializer_rules = (
        '-medical_practitioners.user',
        '-admins.user',
        '-associates.user',
        '-password',
        '-phone'
    )

    def __repr__(self):
        return f"<User phone={self.phone} role={self.role}>"


# =====================================================
# MEDICAL PRACTITIONER MODEL
# =====================================================
class MedicalPractitioner(db.Model, SerializerMixin):
    __tablename__ = 'medical_practitioners'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    first_name = db.Column(db.String(100), nullable=False)
    last_name = db.Column(db.String(100))
    speciality = db.Column(db.String(120))
    role = db.Column(db.String(120))
    location = db.Column(db.String(255))
    description = db.Column(db.Text)
    created_at = db.Column(db.DateTime, server_default=db.func.now())

    user = db.relationship('User', back_populates='medical_practitioners')

    def __repr__(self):
        return f"<MedicalPractitioner {self.first_name} {self.last_name}>"


# =====================================================
# ADMIN MODEL
# =====================================================
class Admin(db.Model, SerializerMixin):
    __tablename__ = 'admins'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    first_name = db.Column(db.String(100))
    last_name = db.Column(db.String(100))
    designation = db.Column(db.String(120))
    created_at = db.Column(db.DateTime, server_default=db.func.now())

    user = db.relationship('User', back_populates='admins')

    def __repr__(self):
        return f"<Admin {self.first_name} {self.last_name}>"


# =====================================================
# ASSOCIATE MODEL
# =====================================================
class Associate(db.Model, SerializerMixin):
    __tablename__ = 'associates'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    first_name = db.Column(db.String(100))
    last_name = db.Column(db.String(100))
    designation = db.Column(db.String(120))
    description = db.Column(db.Text)
    created_at = db.Column(db.DateTime, server_default=db.func.now())

    user = db.relationship('User', back_populates='associates')

    def __repr__(self):
        return f"<Associate {self.first_name} {self.last_name}>"


# =====================================================
# MESSAGE MODELS
# =====================================================
class Message(db.Model, SerializerMixin):
    __tablename__ = 'messages'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    response_id = db.Column(db.Integer, db.ForeignKey('response_messages.id'))
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship("User", back_populates='messages')
    response = db.relationship("ResponseMessage", back_populates="message")

    def __repr__(self):
        return f"<Message {self.id} from User {self.user_id}>"


class UserMessage(db.Model, SerializerMixin):
    __tablename__ = 'user_messages'

    id = db.Column(db.Integer, primary_key=True)
    message = db.Column(db.Text)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    response_id = db.Column(db.Integer, db.ForeignKey('response_messages.id'))
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship("User", back_populates='user_messages')
    response = db.relationship("ResponseMessage", back_populates="user_message")

    def __repr__(self):
        return f"<UserMessage {self.message[:30]}...>"


class ResponseMessage(db.Model, SerializerMixin):
    __tablename__ = 'response_messages'

    id = db.Column(db.Integer, primary_key=True)
    response = db.Column(db.Text)
    input_token = db.Column(db.String(100))
    output_token = db.Column(db.String(100))
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

    message = db.relationship("Message", uselist=False, back_populates="response")
    user_message = db.relationship("UserMessage", uselist=False, back_populates="response")

    def __repr__(self):
        return f"<ResponseMessage {self.id}>"


# =====================================================
# PRESCRIPTION MODEL
# =====================================================
class Prescription(db.Model, SerializerMixin):
    __tablename__ = 'prescriptions'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    uploaded = db.Column(db.LargeBinary)
    response = db.Column(db.Text)
    input_token = db.Column(db.String(255))
    output_token = db.Column(db.String(255))
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship('User', back_populates='prescriptions')

    def __repr__(self):
        return f"<Prescription id={self.id} user_id={self.user_id}>"


# =====================================================
# TIP MODEL
# =====================================================
class Tip(db.Model, SerializerMixin):
    __tablename__ = 'tips'

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.Text, nullable=False)
    description = db.Column(db.Text)
    status = db.Column(db.Boolean, default=False)
    practitioner = db.Column(db.String(255))
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    sent_timestamp = db.Column(db.DateTime)
    verified_timestamp = db.Column(db.DateTime)

    def __repr__(self):
        return f"<Tip {self.title[:30]}...>"


# =====================================================
# CHAT SESSION
# =====================================================
class ChatSession(db.Model, SerializerMixin):
    __tablename__ = 'chat_sessions'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    session_state = db.Column(db.String(255))
    context = db.Column(db.Text)
    started_at = db.Column(db.DateTime, default=datetime.utcnow)
    last_activity = db.Column(db.DateTime)
    is_active = db.Column(db.Boolean, default=True)

    user = db.relationship("User", back_populates='chat_sessions')

    def __repr__(self):
        return f"<ChatSession {self.id} active={self.is_active}>"


# =====================================================
# PARTICIPANT
# =====================================================
class Participant(db.Model, SerializerMixin):
    __tablename__ = 'participants'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    first_name = db.Column(db.String(255))
    last_name = db.Column(db.String(255))
    location = db.Column(db.String(255))
    age = db.Column(db.Integer)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship('User', back_populates='participant')

    def __repr__(self):
        return f"<Participant {self.first_name} {self.last_name}>"
