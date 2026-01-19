# backend/app/routes/api_routes.py
from flask import Blueprint, jsonify, request
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from datetime import timedelta
from app.utils.db import db
from app.models.models import (
    User,
    MedicalPractitioner,
    Admin,
    Associate,
    Participant,
    Message,
    UserMessage,
    ResponseMessage,
    Prescription,
    Tip,
    ChatSession
)

api_bp = Blueprint("api", __name__, url_prefix="/api")


# 🧍 USERS
@api_bp.route("/users", methods=["GET"])
def get_users():
    users = User.query.all()
    data = [
        {
            "id": u.id,
            "phone": u.phone,
            "email": u.email,
            "role": u.role,
            "created_at": u.created_at.isoformat() if u.created_at else None
        }
        for u in users
    ]
    return jsonify(data), 200



# -----------------------------
# TOKEN IDENTITY LOADER
# -----------------------------
@api_bp.route("/me", methods=["GET"])
@jwt_required()
def me():
    identity = get_jwt_identity()
    user_id = identity.get("user_id")

    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    # since public signup always participant, this should exist
    participant = Participant.query.filter_by(user_id=user.id).first()

    return jsonify({
        "id": user.id,
        "email": user.email,
        "phone": user.phone,
        "role": user.role,
        "first_name": participant.first_name if participant else None,
        "last_name": participant.last_name if participant else None,
    }), 200



# -----------------------------
# UPDATE CURRENT USER
# -----------------------------
@api_bp.route("/me", methods=["PATCH"])
@jwt_required()
def update_me():
    identity = get_jwt_identity()
    user_id = identity.get("user_id")

    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    participant = Participant.query.filter_by(user_id=user.id).first()
    if not participant:
        # In your public signup, this should exist. Still, guard it.
        participant = Participant(user_id=user.id)
        db.session.add(participant)

    data = request.get_json() or {}

    # Incoming fields
    first_name = data.get("first_name")
    last_name = data.get("last_name")
    email = data.get("email")
    phone = data.get("phone")
    password = data.get("password")

    # Normalize
    if email is not None:
        email = email.strip().lower()
    if phone is not None:
        phone = "".join(str(phone).split())
    if first_name is not None:
        first_name = first_name.strip()
    if last_name is not None:
        last_name = last_name.strip()

    # Uniqueness checks ONLY if changed
    if email and email != user.email:
        exists = User.query.filter(User.email == email, User.id != user.id).first()
        if exists:
            return jsonify({"error": "The email is taken"}), 409

    if phone and phone != user.phone:
        exists = User.query.filter(User.phone == phone, User.id != user.id).first()
        if exists:
            return jsonify({"error": "The phone number is taken"}), 409

    # Apply updates (only if provided)
    if email is not None and email != "":
        user.email = email

    if phone is not None and phone != "":
        user.phone = phone

    if first_name is not None:
        participant.first_name = first_name

    if last_name is not None:
        participant.last_name = last_name

    if password:
        if len(password) < 8:
            return jsonify({"error": "Password must be at least 8 characters"}), 400
        user.password = generate_password_hash(password)

    db.session.commit()

    # Return the same shape as GET /me
    return jsonify({
        "id": user.id,
        "email": user.email,
        "phone": user.phone,
        "role": user.role,
        "first_name": participant.first_name,
        "last_name": participant.last_name,
    }), 200




# -----------------------------
# USER SIGNUP
# -----------------------------
@api_bp.route("/signup", methods=["POST"])
def signup():
    data = request.get_json()

    phone = data.get("phone")
    email = data.get("email")
    password = data.get("password")
    first_name = data.get("first_name")
    last_name = data.get("last_name")

    # ✅ Force role for public signup
    role = "participant"

    phone = "".join(phone.split()) if phone else None
    email = email.strip().lower() if email else None
    first_name = first_name.strip() if first_name else None
    last_name = last_name.strip() if last_name else None

    if not phone or not email or not password:
        return jsonify({"error": "Phone, email, and password are required"}), 400

    if User.query.filter(User.email == email).first():
        return jsonify({"error": "The email is taken"}), 409

    if User.query.filter(User.phone == phone).first():
        return jsonify({"error": "The phone number is taken"}), 409

    user = User(
        email=email,
        phone=phone,
        password=generate_password_hash(password),
        role=role  # ✅ always participant
    )

    db.session.add(user)
    db.session.commit()

    # ✅ Always create linked participant profile for public signup
    participant = Participant(
        user_id=user.id,
        first_name=first_name,
        last_name=last_name
    )
    db.session.add(participant)
    db.session.commit()

    access_token = create_access_token(
        identity={"user_id": user.id, "email": user.email, "role": user.role},
        expires_delta=timedelta(hours=12)
    )

    return jsonify({
        "message": "User registered successfully",
        "access_token": access_token,
        "user": {
            "id": user.id,
            "email": user.email,
            "phone": user.phone,
            "role": user.role
        }
    }), 201




# -----------------------------
# USER LOGIN
# -----------------------------
@api_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    email = data.get("email")
    phone = data.get("phone")
    password = data.get("password")

    if email:
        email = email.strip().lower()
    if phone:
        phone = "".join(phone.split())   # removes spaces anywhere in the number

    email_or_phone = email or phone


    if not email_or_phone or not password:
        return jsonify({"error": "Email/Phone and password are required"}), 400

    # Find user by email or phone
    user = User.query.filter(
        (User.email == email_or_phone) | (User.phone == email_or_phone)
    ).first()

    if not user or not check_password_hash(user.password, password):
        return jsonify({"error": "Invalid credentials"}), 401

    # Generate JWT token (valid for 12 hours)
    access_token = create_access_token(
        identity={"user_id": user.id, "email": user.email, "role": user.role},
        expires_delta=timedelta(hours=12)
    )

    return jsonify({
        "message": "Login successful",
        "access_token": access_token,
        "user": {
            "id": user.id,
            "email": user.email,
            "phone": user.phone,
            "role": user.role
        }
    }), 200


# 💊 PRESCRIPTIONS
@api_bp.route("/prescriptions", methods=["GET"])
def get_prescriptions():
    prescriptions = Prescription.query.all()
    data = [
        {
            "id": p.id,
            "user_id": p.user_id,
            "response": p.response,
            "timestamp": p.timestamp.isoformat() if p.timestamp else None
        }
        for p in prescriptions
    ]
    return jsonify(data), 200


# 💡 TIPS
@api_bp.route("/tips", methods=["GET"])
def get_tips():
    tips = Tip.query.all()
    data = [
        {
            "id": t.id,
            "title": t.title,
            "description": t.description,
            "status": t.status,
            "practitioner": t.practitioner,
            "timestamp": t.timestamp.isoformat() if t.timestamp else None
        }
        for t in tips
    ]
    return jsonify(data), 200


# 💬 MESSAGES
@api_bp.route("/messages", methods=["GET"])
def get_messages():
    messages = Message.query.all()
    data = [
        {
            "id": m.message_id,
            "user_id": m.user_id,
            "response_id": m.response_id,
            "timestamp": m.timestamp.isoformat() if m.timestamp else None
        }
        for m in messages
    ]
    return jsonify(data), 200


# 📥 USER MESSAGES
@api_bp.route("/user_messages", methods=["GET"])
def get_user_messages():
    messages = UserMessage.query.all()
    data = [
        {
            "id": m.id,
            "message": m.message,
            "user_id": m.user_id,
            "response_id": m.response_id,
            "timestamp": m.timestamp.isoformat() if m.timestamp else None
        }
        for m in messages
    ]
    return jsonify(data), 200


# 💬 RESPONSES
@api_bp.route("/responses", methods=["GET"])
def get_responses():
    responses = ResponseMessage.query.all()
    data = [
        {
            "id": r.id,
            "response": r.response,
            "input_token": r.input_token,
            "output_token": r.output_token,
            "timestamp": r.timestamp.isoformat() if r.timestamp else None
        }
        for r in responses
    ]
    return jsonify(data), 200


# 🩺 PRACTITIONERS
@api_bp.route("/practitioners", methods=["GET"])
def get_practitioners():
    practitioners = MedicalPractitioner.query.all()
    data = [
        {
            "id": m.id,
            "first_name": m.first_name,
            "last_name": m.last_name,
            "speciality": m.speciality,
            "title": m.title,
            "location": m.location,
            "description": m.description
        }
        for m in practitioners
    ]
    return jsonify(data), 200


# 👩‍⚕️ ADMINS
@api_bp.route("/admins", methods=["GET"])
def get_admins():
    admins = Admin.query.all()
    data = [
        {
            "id": a.id,
            "first_name": a.first_name,
            "last_name": a.last_name,
            "designation": a.designation
        }
        for a in admins
    ]
    return jsonify(data), 200


# 🤝 ASSOCIATES
@api_bp.route("/associates", methods=["GET"])
def get_associates():
    associates = Associate.query.all()
    data = [
        {
            "id": a.id,
            "first_name": a.first_name,
            "last_name": a.last_name,
            "designation": a.designation,
            "description": a.description
        }
        for a in associates
    ]
    return jsonify(data), 200


# 👩 PARTICIPANTS
@api_bp.route("/participants", methods=["GET"])
def get_participants():
    participants = Participant.query.all()
    data = [
        {
            "id": p.id,
            "user_id": p.user_id,
            "first_name": p.first_name,
            "last_name": p.last_name,
            "location": p.location,
            "age": p.age
        }
        for p in participants
    ]
    return jsonify(data), 200


# 💬 CHAT SESSIONS
@api_bp.route("/chats", methods=["GET"])
def get_chat_sessions():
    sessions = ChatSession.query.all()
    data = [
        {
            "id": s.id,
            "user_id": s.user_id,
            "session_state": s.session_state,
            "context": s.context,
            "started_at": s.started_at.isoformat() if s.started_at else None,
            "last_activity": s.last_activity.isoformat() if s.last_activity else None,
            "is_active": s.is_active
        }
        for s in sessions
    ]
    return jsonify(data), 200