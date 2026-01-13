import secrets
from datetime import datetime, timedelta
from sqlalchemy.orm import validates
from sqlalchemy_serializer import SerializerMixin
from app.utils.db import db

##############################################################
# USERS TABLE — Base identity for all user roles
##############################################################
class User(db.Model, SerializerMixin):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    phone = db.Column(db.String(20), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String, nullable=True)
    role = db.Column(db.String, nullable=False, default="participant")
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    medical_practitioners = db.relationship('MedicalPractitioner', back_populates='user', cascade='all, delete-orphan')
    admins = db.relationship('Admin', back_populates='user', cascade='all, delete-orphan')
    associates = db.relationship('Associate', back_populates='user', cascade='all, delete-orphan')
    participants = db.relationship('Participant', back_populates='user', cascade='all, delete-orphan')
    messages = db.relationship('Message', back_populates='user', cascade='all, delete-orphan')
    user_messages = db.relationship('UserMessage', back_populates='user', cascade='all, delete-orphan')
    prescriptions = db.relationship('Prescription', back_populates='user', cascade='all, delete-orphan')
    chat_sessions = db.relationship('ChatSession', back_populates='user', cascade='all, delete-orphan')
    health_tips = db.relationship('HealthTip', back_populates='user', cascade='all, delete-orphan')
    chat_memory = db.relationship('ChatMemory', back_populates='user', cascade='all, delete-orphan')

    # Validators
    @validates('phone')
    def validate_phone(self, key, phone):
        if not phone or len(phone) < 10:
            raise ValueError("Phone number must be at least 10 digits")
        return phone

    @validates('email')
    def validate_email(self, key, email):
        if email and "@" not in email:
            raise ValueError("Invalid email address")
        return email

    @validates('password')
    def validate_password(self, key, password):
        if not password or len(password) < 8:
            raise ValueError("Password must be at least 8 characters")
        return password

    def __repr__(self):
        return f"<User id={self.id}, phone={self.phone}, role={self.role}>"


##############################################################
# ADMIN — Platform administrators (with super admin flag)
##############################################################
class Admin(db.Model, SerializerMixin):
    __tablename__ = 'admins'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    first_name = db.Column(db.String)
    last_name = db.Column(db.String)
    designation = db.Column(db.String)
    is_super_admin = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship('User', back_populates='admins')

    def __repr__(self):
        return f"<Admin {self.first_name} {self.last_name} super_admin={self.is_super_admin}>"


##############################################################
# ADMIN INVITES — For super admins to invite others
##############################################################
class AdminInvite(db.Model):
    __tablename__ = 'admin_invites'

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(255), nullable=False, unique=True)
    token = db.Column(db.String(128), nullable=False, unique=True, index=True)
    created_by = db.Column(db.Integer, db.ForeignKey('admins.id'), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    expires_at = db.Column(db.DateTime, nullable=False)
    used = db.Column(db.Boolean, default=False)

    def generate_token(self, length=48):
        self.token = secrets.token_urlsafe(length)
        return self.token

    @staticmethod
    def make_expires(days=7):
        return datetime.utcnow() + timedelta(days=days)

    def __repr__(self):
        return f"<AdminInvite {self.email} token={self.token[:6]}... used={self.used}>"


##############################################################
# MEDICAL PRACTITIONERS
##############################################################
class MedicalPractitioner(db.Model, SerializerMixin):
    __tablename__ = 'medical_practitioners'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    first_name = db.Column(db.String)
    last_name = db.Column(db.String)
    speciality = db.Column(db.String)
    title = db.Column(db.String)
    location = db.Column(db.String)
    description = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship('User', back_populates='medical_practitioners')

    def __repr__(self):
        return f"<MedicalPractitioner {self.first_name} {self.last_name}>"


##############################################################
# ASSOCIATE — Partners
##############################################################
class Associate(db.Model, SerializerMixin):
    __tablename__ = 'associates'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    first_name = db.Column(db.String)
    last_name = db.Column(db.String)
    designation = db.Column(db.String)
    description = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship('User', back_populates='associates')

    def __repr__(self):
        return f"<Associate {self.first_name} {self.last_name}>"


##############################################################
# PARTICIPANT — End users
##############################################################
class Participant(db.Model, SerializerMixin):
    __tablename__ = 'participants'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    first_name = db.Column(db.String)
    last_name = db.Column(db.String)
    location = db.Column(db.String)
    age = db.Column(db.Integer)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship('User', back_populates='participants')

    def __repr__(self):
        return f"<Participant {self.first_name} {self.last_name}>"


##############################################################
# MESSAGES
##############################################################
class Message(db.Model, SerializerMixin):
    __tablename__ = 'messages'

    message_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    response_id = db.Column(db.Integer, db.ForeignKey('response_message.id'))
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship('User', back_populates='messages')
    response = db.relationship('ResponseMessage', back_populates='messages')


class UserMessage(db.Model, SerializerMixin):
    __tablename__ = 'user_message'

    id = db.Column(db.Integer, primary_key=True)
    message = db.Column(db.Text)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    response_id = db.Column(db.Integer, db.ForeignKey('response_message.id'))
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship('User', back_populates='user_messages')
    response = db.relationship('ResponseMessage', back_populates='user_messages')


class ResponseMessage(db.Model, SerializerMixin):
    __tablename__ = 'response_message'

    id = db.Column(db.Integer, primary_key=True)
    response = db.Column(db.Text)
    input_token = db.Column(db.String(100))
    output_token = db.Column(db.String(100))
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

    messages = db.relationship('Message', back_populates='response')
    user_messages = db.relationship('UserMessage', back_populates='response')


##############################################################
# PRESCRIPTIONS
##############################################################
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


##############################################################
# HEALTH TIPS — For scheduler
##############################################################
class HealthTip(db.Model):
    __tablename__ = 'health_tips'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    tip_text = db.Column(db.Text, nullable=False)
    date_sent = db.Column(db.DateTime, default=datetime.utcnow)
    sent = db.Column(db.Boolean, default=False)

    user = db.relationship('User', back_populates='health_tips')

    def __repr__(self):
        return f"<HealthTip user_id={self.user_id} sent={self.sent}>"


##############################################################
# TIPS — Practitioner-driven
##############################################################
class Tip(db.Model, SerializerMixin):
    __tablename__ = 'tips'

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text)
    status = db.Column(db.Boolean, default=False)
    practitioner = db.Column(db.String(255))
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    sent_timestamp = db.Column(db.DateTime)
    verified_timestamp = db.Column(db.DateTime)


##############################################################
# CHAT SESSIONS
##############################################################
class ChatSession(db.Model, SerializerMixin):
    __tablename__ = 'chat_sessions'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    session_state = db.Column(db.String(255))
    context = db.Column(db.Text)
    started_at = db.Column(db.DateTime, default=datetime.utcnow)
    last_activity = db.Column(db.DateTime)
    is_active = db.Column(db.Boolean, default=True)

    user = db.relationship('User', back_populates='chat_sessions')

    def __repr__(self):
        return f"<ChatSession {self.id} active={self.is_active}>"


##############################################################
# CHAT MEMORY (new in Francis’s branch)
##############################################################
class ChatMemory(db.Model, SerializerMixin):
    __tablename__ = 'chat_memory'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    sender = db.Column(db.String(10))  # 'user' or 'bot'
    message = db.Column(db.Text, nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship('User', back_populates='chat_memory')

    def __repr__(self):
        return f"<ChatMemory user_id={self.user_id} sender={self.sender}>"
