# backend/app/models/__init__.py

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

__all__ = [
    "db",
    "User",
    "MedicalPractitioner",
    "Admin",
    "Associate",
    "Participant",
    "Message",
    "UserMessage",
    "ResponseMessage",
    "Prescription",
    "Tip",
    "ChatSession"
]
