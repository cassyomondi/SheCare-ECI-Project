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
    user_id = identity["user_id"]
    
    # Get the super admin making the request
    admin = Admin.query.filter_by(user_id=user_id).first()
    
    # Verify requester is super admin
    if not admin or not admin.is_super_admin:
        return jsonify({"error": "Access denied: Super admin only"}), 403
    
    # Get request data
    data = request.get_json()
    email = data.get("email")
    
    if not email:
        return jsonify({"error": "Email is required"}), 400
    
    # Import validation helper
    from app.utils.validation import validate_email
    
    # Validate and normalize email
    email_valid, normalized_email = validate_email(email)
    if not email_valid:
        return jsonify({"error": "Invalid email format"}), 400
    
    email = normalized_email  # Use normalized version
    
    # Check if user already exists
    existing_user = User.query.filter_by(email=email).first()
    if existing_user:
        return jsonify({"error": "A user with this email already exists"}), 400
    
    # Check if active invite already exists
    existing_invite = AdminInvite.query.filter_by(
        email=email, 
        used=False
    ).first()
    
    # Check if existing invite is still valid (not expired)
    if existing_invite:
        if existing_invite.expires_at > datetime.utcnow():
            return jsonify({
                "error": "An active invitation already exists for this email",
                "expires_at": existing_invite.expires_at.isoformat()
            }), 400
        else:
            # Old invite expired, delete it
            db.session.delete(existing_invite)
    
    # START TRANSACTION
    try:
        # Create new invitation
        invite = AdminInvite(
            email=email,
            created_by=admin.id,
            expires_at=AdminInvite.make_expires(days=7)
        )
        invite.generate_token()
        
        db.session.add(invite)
        db.session.flush()  # Get invite.token without committing
        
        # Generate invitation link using config (not hardcoded)
        from flask import current_app
        base_url = current_app.config.get('APP_BASE_URL', 'http://localhost:5000')
        invite_link = f"{base_url}/admin/register?token={invite.token}"
        
        # Import email function
        from app.utils.email import send_admin_invitation
        
        # Send email (CRITICAL: Do this BEFORE committing to database)
        print(f"\n📧 Attempting to send invitation email to {email}...")
        email_sent = send_admin_invitation(
            email=email,
            invite_link=invite_link,
            expires_at=invite.expires_at
        )
        
        if not email_sent:
            # Email failed - don't save invite
            db.session.rollback()
            return jsonify({
                "error": "Failed to send invitation email. Please try again."
            }), 500
        
        # Email sent successfully - now commit to database
        db.session.commit()
        
        print(f"✅ Invitation created and email sent to {email}\n")
        
        return jsonify({
            "message": f"Invitation sent successfully to {email}",
            "invitation": {
                "email": email,
                "expires_at": invite.expires_at.isoformat(),
                "created_by": {
                    "id": admin.id,
                    "name": f"{admin.first_name} {admin.last_name}"
                }
            }
        }), 201
        
    except Exception as e:
        # Rollback on any error
        db.session.rollback()
        
        print(f"❌ Error creating invitation: {str(e)}")
        
        return jsonify({
            "error": "Failed to create invitation. Please try again."
        }), 500

# -----------------------------
# REGISTER INVITED ADMIN
# -----------------------------
@admin_bp.route("/register", methods=["POST"])
def register_invited_admin():

    data = request.get_json()
    
    # Get input data
    token = data.get("token")
    password = data.get("password")
    first_name = data.get("first_name")
    last_name = data.get("last_name")
    
    # Validate required fields
    if not all([token, password, first_name, last_name]):
        return jsonify({"error": "All fields are required (token, password, first_name, last_name)"}), 400
    
    # Import validation helpers
    from app.utils.validation import validate_password, sanitize_name
    
    # Validate password
    password_valid, password_error = validate_password(password)
    if not password_valid:
        return jsonify({"error": password_error}), 400
    
    # Sanitize names
    first_name = sanitize_name(first_name)
    last_name = sanitize_name(last_name)
    
    if not first_name or not last_name:
        return jsonify({"error": "Invalid name format"}), 400
    
    # Find invitation
    invite = AdminInvite.query.filter_by(token=token, used=False).first()
    
    if not invite:
        return jsonify({"error": "Invalid invitation token"}), 400
    
    # Check expiration
    if invite.expires_at < datetime.utcnow():
        return jsonify({"error": "Invitation has expired"}), 400
    
    # START TRANSACTION - All or nothing
    try:
        # Race condition check - verify email still doesn't exist
        existing_user = User.query.filter_by(email=invite.email).first()
        if existing_user:
            return jsonify({"error": "An account with this email already exists"}), 400
        
        # Create user record
        user = User(
            email=invite.email,
            password=generate_password_hash(password),
            phone="",  # Empty string instead of "N/A"
            role="admin"
        )
        db.session.add(user)
        db.session.flush()  # Get user.id without committing yet
        
        # Create admin record
        admin = Admin(
            user_id=user.id,
            first_name=first_name,
            last_name=last_name,
            is_super_admin=False
        )
        db.session.add(admin)
        
        # Mark invite as used
        invite.used = True
        
        # Commit everything together
        db.session.commit()
        
        return jsonify({
            "message": f"Admin account created successfully for {invite.email}",
            "admin": {
                "id": admin.id,
                "first_name": admin.first_name,
                "last_name": admin.last_name,
                "email": user.email,
                "is_super_admin": admin.is_super_admin
            }
        }), 201
        
    except Exception as e:
        # Rollback on any error
        db.session.rollback()
        