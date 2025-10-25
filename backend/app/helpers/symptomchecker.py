from openai import OpenAI
from datetime import datetime
from ..models import db, User, ChatSession, UserMessage, ResponseMessage

import os
from dotenv import load_dotenv

load_dotenv()

# Initialize OpenAI client (explicit API key for reliability)
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


def symptomchecker(user_phone, symptom_query):
    """
    Handles user symptom queries with context persistence.
    """
    try:
        # 1️⃣ Find or create the user
        user = User.query.filter_by(phone=user_phone).first()
        if not user:
            user = User(phone=user_phone, password="temp1234", role="user")
            db.session.add(user)
            db.session.commit()

        # 2️⃣ Get or create active chat session
        session = ChatSession.query.filter_by(user_id=user.id, is_active=True).first()
        if not session:
            session = ChatSession(user_id=user.id, started_at=datetime.utcnow(), is_active=True)
            db.session.add(session)
            db.session.commit()

        # 3️⃣ Retrieve last few user messages for context
        last_messages = (
            UserMessage.query.filter_by(user_id=user.id)
            .order_by(UserMessage.timestamp.desc())
            .limit(3)
            .all()
        )

        context = "\n".join(
            [f"User: {m.message}\nAI: {m.response.response if m.response else ''}" for m in reversed(last_messages)]
        )

        # 4️⃣ Prepare the prompt
        prompt = f"""
        You are SheCare, an AI health assistant that helps users understand symptoms safely.
        User history:\n{context}\n
        New user message: "{symptom_query}"
        Provide a friendly, clear explanation and suggested next steps (e.g., rest, hydration, consult a doctor, etc.).
        """

        # 5️⃣ Send to OpenAI
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a kind, safe, and informative health assistant."},
                {"role": "user", "content": prompt},
            ],
            temperature=0.7,
        )

        ai_reply = response.choices[0].message.content.strip()

        # 6️⃣ Save message + response
        new_response = ResponseMessage(response=ai_reply, timestamp=datetime.utcnow())
        db.session.add(new_response)
        db.session.commit()

        user_msg = UserMessage(
            user_id=user.id,
            message=symptom_query,
            response_id=new_response.id,
            timestamp=datetime.utcnow()
        )
        db.session.add(user_msg)
        db.session.commit()

        return ai_reply

    except Exception as e:
        print("Error in symptomchecker:", e)
        db.session.rollback()
        return "⚠️ I had trouble checking that symptom. Please try again later."
