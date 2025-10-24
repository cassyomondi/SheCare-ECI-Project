# backend/app/routes/admin_routes.py
from flask import Blueprint, request, jsonify
from werkzeug.security import check_password_hash
from flask_jwt_extended import (
    JWTManager, create_access_token, jwt_required, get_jwt_identity
)
from datetime import timedelta
import os

from backend.app.models.models import User, Admin
from backend.app.utils.db import db

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
