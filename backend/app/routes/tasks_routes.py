# backend/app/routes/tasks_routes.py

import os
from flask import Blueprint, request, jsonify, abort
from app import send_daily_health_tips

tasks_bp = Blueprint("tasks", __name__, url_prefix="/tasks")


@tasks_bp.route("/send-daily-tips", methods=["POST"])
def send_daily_tips():
    # Simple shared-secret auth (cron protection)
    cron_key = request.headers.get("X-CRON-KEY")
    if cron_key != os.getenv("CRON_SECRET"):
        abort(403)

    send_daily_health_tips()
    return jsonify({"status": "daily health tips sent"}), 200
