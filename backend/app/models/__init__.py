# backend/app/models/__init__.py

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
    ChatSession,
    HealthTip,      # ✅ add this
    ChatMemory      # ✅ add this
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
    "ChatSession",
    "HealthTip",     # ✅ add this
    "ChatMemory"     # ✅ add this
]
