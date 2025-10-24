# backend/app/routes/api_routes.py
from flask import Blueprint, jsonify
from backend.app.utils.db import db
from backend.app.models.models import (
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