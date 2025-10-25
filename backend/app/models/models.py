from datetime import datetime
from sqlalchemy.orm import validates
from sqlalchemy_serializer import SerializerMixin
from app.utils.db import db  # ✅ use the shared 
from flask_bcrypt import Bcrypt
from flask_sqlalchemy import SQLAlchemy


bcrypt = Bcrypt()
db = SQLAlchemy()

##############################################################
# USERS TABLE — Base identity for all user roles
##############################################################
class User(db.Model, SerializerMixin):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    # Use up to 20 chars to store Twilio's E.164 format ("whatsapp:+254712345678")
    phone = db.Column(db.String(20), unique=True, nullable=False)

    # Keep email optional for non-WhatsApp users (e.g., web dashboard admins)
    email = db.Column(db.String(120), unique=True, nullable=True)
    _password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String, nullable=False, default="participant")  # sensible default
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
    inviteTokens = db.relationship('InvitationToken', back_populates = 'inviter', cascade='all, delete-orphan')

    # Optional — validate only when the field comes from manual registration
    @validates('email')
    def validate_email(self, key, email):
        if email and "@" not in email:
            raise ValueError("Invalid email address")
        return email

    @property
    def  password_hash (self):
        return self._password_hash
    
    @password_hash.setter
    def password_hash(self, password):
        password_hash = bcrypt.generate_password_hash(password.encode('utf-8'))
        self._password_hash = password_hash.decode('utf-8')

    def authenticate(self, password):
        return bcrypt.check_password_hash(
            self._password_hash, password.encode('utf-8'))
    def __repr__(self):
        return f"<User id={self.id}, phone={self.phone}, role={self.role}>"


##############################################################
# MEDICAL PRACTITIONERS — Doctors or health professionals
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

    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    uploaded = db.Column(db.LargeBinary)
    response = db.Column(db.Text)
    def __repr__(self):
        return f"<MedicalPractitioner {self.first_name} {self.last_name}>"

##############################################################
# ADMIN — Platform administrators
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
        return f"<Admin {self.first_name} {self.last_name}>"

##############################################################
# ASSOCIATE — Health associates or partners
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
# PARTICIPANT — End users (women/girls using SheCare)
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
# MESSAGE SYSTEM — Communication between users and system
##############################################################
class Message(db.Model, SerializerMixin):
    __tablename__ = 'messages'
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    uploaded = db.Column(db.LargeBinary)
    response = db.Column(db.Text)

    message_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    response_id = db.Column(db.Integer, db.ForeignKey('response_message.id'))
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship('User', back_populates='messages')
    response = db.relationship('ResponseMessage', back_populates='messages')

    def __repr__(self):
        return f"<Message id={self.message_id} user_id={self.user_id}>"

class UserMessage(db.Model, SerializerMixin):
    __tablename__ = 'user_message'

    id = db.Column(db.Integer, primary_key=True)
    message = db.Column(db.Text)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    response_id = db.Column(db.Integer, db.ForeignKey('response_message.id'))
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship('User', back_populates='user_messages')
    response = db.relationship('ResponseMessage', back_populates='user_messages')

    def __repr__(self):
        return f"<UserMessage id={self.id} user_id={self.user_id}>"

class ResponseMessage(db.Model, SerializerMixin):
    __tablename__ = 'response_message'

    id = db.Column(db.Integer, primary_key=True)
    response = db.Column(db.Text)
    input_token = db.Column(db.String(100))
    output_token = db.Column(db.String(100))
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

    messages = db.relationship('Message', back_populates='response')
    user_messages = db.relationship('UserMessage', back_populates='response')

    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    uploaded = db.Column(db.LargeBinary)
    response = db.Column(db.Text)
    def __repr__(self):
        return f"<ResponseMessage id={self.id}>"

##############################################################
# PRESCRIPTIONS — Uploaded prescriptions and analysis
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
        return f"<Prescription id={self.id}>"

##############################################################
# TIPS — Health tips sent by system or practitioners
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

    def __repr__(self):
        return f"<Tip title='{self.title[:20]}...'>"

##############################################################
# CHAT SESSIONS — Track user chat sessions
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
        return f"<ChatSession id={self.id} active={self.is_active}>"


##invitation token, tracks invitatio toks sent to future admins from superadmin

class InvitationToken(db.Model, SerializerMixin):
    __tablename__ = 'invitationTokens'

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String, nullable=False)
    token = db.Column(db.String, nullable=False, unique=True)
    invited_by = db.Column(db.Integer, db.ForeignKey('users.id'))
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    expires_at = db.Column(db.DateTime, nullable=False)
    is_used = db.Column(db.Boolean, default=False, nullable=False)
    used_at = db.Column(db.DateTime, nullable=True)

    inviter = db.relationship('User', back_populates='inviteTokens', cascade='all, delete-orphan')

    def __repr__(self):
        return f'<Invitation {self.email} - {"Used" if self.is_used else "Pending"}>'
