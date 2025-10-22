# app/utils/seed_data.py

from app import db
from app.models import (
    User, Participant, MedicalPractitioner, Admin, Associate,
    Message, UserMessage, ResponseMessage, Prescription, Tip, ChatSession
)
from datetime import datetime

def seed_data():
    print("🌱 Seeding database with mock data...")

    # --- Clear all existing data ---
    ChatSession.query.delete()
    Tip.query.delete()
    Prescription.query.delete()
    UserMessage.query.delete()
    Message.query.delete()
    Participant.query.delete()
    Associate.query.delete()
    Admin.query.delete()
    MedicalPractitioner.query.delete()
    User.query.delete()
    db.session.commit()

    # --- Create Users (5 participants, 4 practitioners, 1 admin) ---
    users = [
        User(phone="whatsapp:+254700000001", email="admin@example.com", role="admin", created_at=datetime.utcnow()),
        User(phone="whatsapp:+254700000002", email="pract_john@example.com", role="practitioner", created_at=datetime.utcnow()),
        User(phone="whatsapp:+254700000003", email="pract_mary@example.com", role="practitioner", created_at=datetime.utcnow()),
        User(phone="whatsapp:+254700000004", email="pract_sam@example.com", role="practitioner", created_at=datetime.utcnow()),
        User(phone="whatsapp:+254700000005", email="pract_linda@example.com", role="practitioner", created_at=datetime.utcnow()),
        User(phone="whatsapp:+254700000006", email="participant_amy@example.com", role="participant", created_at=datetime.utcnow()),
        User(phone="whatsapp:+254700000007", email="participant_bob@example.com", role="participant", created_at=datetime.utcnow()),
        User(phone="whatsapp:+254700000008", email="participant_clara@example.com", role="participant", created_at=datetime.utcnow()),
        User(phone="whatsapp:+254700000009", email="participant_dan@example.com", role="participant", created_at=datetime.utcnow()),
        User(phone="whatsapp:+254700000010", email="participant_ella@example.com", role="participant", created_at=datetime.utcnow()),
    ]
    db.session.add_all(users)
    db.session.commit()

    # Separate users by role
    admin_user = next(u for u in users if u.role=="admin")
    practitioner_users = [u for u in users if u.role=="practitioner"]
    participant_users = [u for u in users if u.role=="participant"]

    # --- Participants ---
    participants = []
    for i, user in enumerate(participant_users, start=1):
        participants.append(
            Participant(
                first_name=f"Participant{i}",
                last_name="Demo",
                location=f"City{i}",
                age=20+i,
                user_id=user.id,
                created_at=datetime.utcnow()
            )
        )
    db.session.add_all(participants)

    # --- Medical Practitioners ---
    med_practitioners = []
    for i, user in enumerate(practitioner_users, start=1):
        med_practitioners.append(
            MedicalPractitioner(
                first_name=f"Practitioner{i}",
                last_name="Smith",
                speciality="General",
                title="Dr.",
                location=f"City{i}",
                description="Experienced practitioner",
                user_id=user.id,
                created_at=datetime.utcnow()
            )
        )
    db.session.add_all(med_practitioners)

    # --- Admin ---
    admin = Admin(
        first_name="Super",
        last_name="Admin",
        designation="Platform Manager",
        user_id=admin_user.id,
        created_at=datetime.utcnow()
    )
    db.session.add(admin)

    # --- Associates ---
    associates = [
        Associate(
            first_name="Alice",
            last_name="Partner",
            designation="Health Associate",
            description="Partner org",
            user_id=admin_user.id,
            created_at=datetime.utcnow()
        )
    ]
    db.session.add_all(associates)

    # --- ResponseMessages ---
    responses = [
        ResponseMessage(
            response="Stay hydrated",
            input_token="input1",
            output_token="output1",
            timestamp=datetime.utcnow()
        ),
        ResponseMessage(
            response="Take vitamins",
            input_token="input2",
            output_token="output2",
            timestamp=datetime.utcnow()
        )
    ]
    db.session.add_all(responses)
    db.session.commit()  # Commit to get IDs

    # --- Messages & UserMessages ---
    messages = []
    user_messages = []
    for i, participant_user in enumerate(participant_users):
        messages.append(
            Message(user_id=participant_user.id, response_id=responses[i % len(responses)].id, timestamp=datetime.utcnow())
        )
        user_messages.append(
            UserMessage(user_id=participant_user.id, response_id=responses[i % len(responses)].id, message=f"Hello from participant {i+1}", timestamp=datetime.utcnow())
        )
    db.session.add_all(messages)
    db.session.add_all(user_messages)

    # --- Prescriptions ---
    prescriptions = []
    for i, participant_user in enumerate(participant_users):
        prescriptions.append(
            Prescription(
                user_id=participant_user.id,
                response="Take meds",
                input_token=f"token_in_{i+1}",
                output_token=f"token_out_{i+1}",
                uploaded=b"FakeBinaryData",
                timestamp=datetime.utcnow()
            )
        )
    db.session.add_all(prescriptions)

    # --- Tips ---
    tips = [
        Tip(title="Drink Water", description="Drink 8 glasses daily", status=True, practitioner="Practitioner1", timestamp=datetime.utcnow()),
        Tip(title="Exercise Regularly", description="At least 30 mins per day", status=True, practitioner="Practitioner2", timestamp=datetime.utcnow())
    ]
    db.session.add_all(tips)

    # --- ChatSessions ---
    chat_sessions = []
    for participant_user in participant_users:
        chat_sessions.append(
            ChatSession(
                user_id=participant_user.id,
                session_state="started",
                context="{}",
                started_at=datetime.utcnow(),
                last_activity=datetime.utcnow(),
                is_active=True
            )
        )
    db.session.add_all(chat_sessions)

    db.session.commit()
    print("✅ Database fully seeded with 10+ users and all models!")

# Run directly
if __name__ == "__main__":
    from app import create_app
    app = create_app()
    with app.app_context():
        seed_data()
