# backend/app/routes/admin_routes.py
from flask import Blueprint, request, jsonify
from werkzeug.security import check_password_hash, generate_password_hash
from flask_jwt_extended import (
    create_access_token, jwt_required, get_jwt_identity
)
from datetime import datetime, timedelta

from app.models.models import User, Admin, AdminInvite
from app.utils.db import db

admin_bp = Blueprint("admin_bp", __name__, url_prefix="/admin")

# -----------------------------
# LOGIN ROUTE
# -----------------------------
@admin_bp.route("/login", methods=["POST"])
def admin_login():
    data = request.get_json()

    if not data or "email" not in data or "password" not in data:
        return jsonify({"error": "Email and password are required"}), 400

    email = data["email"].strip().lower()
    password = data["password"]

    # Look up user by email
    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({"error": "Invalid credentials"}), 401

    # Ensure user is admin
    admin = Admin.query.filter_by(user_id=user.id).first()
    if not admin:
        return jsonify({"error": "Access denied: Not an admin"}), 403

    # Verify password
    if not check_password_hash(user.password, password):
        return jsonify({"error": "Invalid credentials"}), 401

    # Generate JWT
    access_token = create_access_token(
        identity={"user_id": user.id, "email": user.email, "is_super_admin": admin.is_super_admin},
        expires_delta=timedelta(hours=6)
    )

    return jsonify({
        "message": "Login successful",
        "access_token": access_token,
        "admin": {
            "id": admin.id,
            "first_name": admin.first_name,
            "last_name": admin.last_name,
            "is_super_admin": admin.is_super_admin
        }
    }), 200


# -----------------------------
# PROTECTED ROUTE EXAMPLE
# -----------------------------
@admin_bp.route("/dashboard", methods=["GET"])
@jwt_required()
def admin_dashboard():
    identity = get_jwt_identity()
    return jsonify({
        "message": f"Welcome, Admin {identity['email']}!",
        "is_super_admin": identity["is_super_admin"]
    }), 200


# -----------------------------
# INVITE ADMIN (SUPER ADMIN ONLY)
# -----------------------------
@admin_bp.route("/invite", methods=["POST"])
@jwt_required()
def invite_admin():
    identity = get_jwt_identity()
    inviter_email = identity["email"]
    inviter = User.query.filter_by(email=inviter_email).first()
    admin = Admin.query.filter_by(user_id=inviter.id).first()

    # Ensure inviter is a super admin
    if not admin or not admin.is_super_admin:
        return jsonify({"error": "Access denied: Super admin only"}), 403

    data = request.get_json()
    email = data.get("email")

    if not email:
        return jsonify({"error": "Email is required"}), 400

    # Check if email already exists in users
    if User.query.filter_by(email=email).first():
        return jsonify({"error": "User already exists"}), 400

    # Check if invite already sent
    existing_invite = AdminInvite.query.filter_by(email=email, used=False).first()
    if existing_invite:
        return jsonify({"error": "An active invite already exists for this email"}), 400

    # Create new invite
    invite = AdminInvite(
        email=email,
        created_by=admin.id,
        expires_at=AdminInvite.make_expires(days=7)
    )
    invite.generate_token()
    db.session.add(invite)
    db.session.commit()

    invite_link = f"https://yourapp.com/admin/register?token={invite.token}"

    return jsonify({
        "message": f"Invitation sent to {email}",
        "invite_link": invite_link,
        "expires_at": invite.expires_at.isoformat()
    }), 201


# -----------------------------
# REGISTER INVITED ADMIN
# -----------------------------
@admin_bp.route("/register", methods=["POST"])
def register_invited_admin():
    data = request.get_json()
    token = data.get("token")
    password = data.get("password")
    first_name = data.get("first_name")
    last_name = data.get("last_name")

    if not all([token, password, first_name, last_name]):
        return jsonify({"error": "Missing required fields"}), 400

    invite = AdminInvite.query.filter_by(token=token, used=False).first()

    if not invite:
        return jsonify({"error": "Invalid or expired token"}), 400
    if invite.expires_at < datetime.utcnow():
        return jsonify({"error": "Invitation has expired"}), 400

    # Create new user record
    user = User(
        email=invite.email,
        password=generate_password_hash(password),
        phone="N/A",  # optional placeholder
        role="admin"
    )
    db.session.add(user)
    db.session.commit()

    # Create new admin record
    admin = Admin(
        user_id=user.id,
        first_name=first_name,
        last_name=last_name,
        is_super_admin=False
    )
    db.session.add(admin)

    # Mark invite as used
    invite.used = True
    db.session.commit()

    return jsonify({
        "message": f"Admin account created for {invite.email}",
        "admin": {
            "id": admin.id,
            "first_name": admin.first_name,
            "last_name": admin.last_name,
            "email": user.email
        }
    }), 201
