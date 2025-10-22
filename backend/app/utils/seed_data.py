from app.utils.db import db
from app.models.models import (
    User, MedicalPractitioner, Admin, Associate, Participant,
    Message, UserMessage, ResponseMessage, Prescription, Tip, ChatSession
)
from datetime import datetime
import random


def seed_data():
    """Populate the database with mock SheCare data."""
    print("🌱 Seeding database with mock data...")

    # ✅ 1. Clear existing data
    db.session.query(Message).delete()
    db.session.query(UserMessage).delete()
    db.session.query(ResponseMessage).delete()
    db.session.query(Prescription).delete()
    db.session.query(Tip).delete()
    db.session.query(ChatSession).delete()
    db.session.query(MedicalPractitioner).delete()
    db.session.query(Admin).delete()
    db.session.query(Associate).delete()
    db.session.query(Participant).delete()
    db.session.query(User).delete()

    db.session.commit()

    # ✅ 2. Create users
    users = [
        User(phone="+254712345678", email="alice@example.com", password="test123", role="participant"),
        User(phone="+254701112233", email="dr.jane@example.com", password="doctor123", role="practitioner"),
        User(phone="+254733998877", email="admin@example.com", password="admin123", role="admin"),
    ]
    db.session.add_all(users)
    db.session.commit()

    # ✅ 3. Create practitioners, admin, associate, participant
    practitioner = MedicalPractitioner(
        user_id=users[1].id,
        first_name="Jane",
        last_name="Doe",
        speciality="Gynecology",
        title="Dr.",
        location="Nairobi Hospital",
        description="Certified OB-GYN with 10 years of experience."
    )

    admin = Admin(
        user_id=users[2].id,
        first_name="Cassy",
        last_name="Omondi",
        designation="System Admin"
    )

    associate = Associate(
        user_id=users[2].id,
        first_name="Felix",
        last_name="Otieno",
        designation="Health Associate",
        description="Community outreach coordinator for SheCare."
    )

    participant = Participant(
        user_id=users[0].id,
        first_name="Alice",
        last_name="Akinyi",
        location="Kisumu",
        age=24
    )

    db.session.add_all([practitioner, admin, associate, participant])
    db.session.commit()

    # ✅ 4. Add a few health tips
    tips = [
        Tip(title="Drink More Water", description="Stay hydrated to maintain a healthy body."),
        Tip(title="Regular Exercise", description="Engage in at least 30 minutes of activity daily."),
        Tip(title="Balanced Diet", description="Eat more fruits and vegetables every day."),
    ]
    db.session.add_all(tips)
    db.session.commit()

    # ✅ 5. Add sample prescriptions
    prescriptions = [
        Prescription(user_id=users[0].id, response="Take 1 tablet of paracetamol twice daily for 5 days."),
        Prescription(user_id=users[0].id, response="Vitamin supplements recommended for low iron."),
    ]
    db.session.add_all(prescriptions)
    db.session.commit()

    # ✅ 6. Add messages and responses
    response1 = ResponseMessage(response="Hello, how can I help you today?")
    user_message1 = UserMessage(user_id=users[0].id, message="I have a headache.", response=response1)
    db.session.add_all([response1, user_message1])
    db.session.commit()

    # ✅ 7. Add chat sessions
    chat_session = ChatSession(
        user_id=users[0].id,
        session_state="active",
        context="Symptom check session",
        is_active=True
    )
    db.session.add(chat_session)
    db.session.commit()

    print("✅ Database seeded successfully!")
