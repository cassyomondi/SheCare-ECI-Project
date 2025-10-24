# app/twilio_routes.py
from flask import Blueprint, request
from twilio.twiml.messaging_response import MessagingResponse
from backend.app.models.models import User, UserMessage, ResponseMessage
from backend.app.utils.db import db
from datetime import datetime

twilio_bp = Blueprint("twilio_bp", __name__)