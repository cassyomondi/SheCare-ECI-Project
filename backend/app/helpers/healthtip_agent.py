# helpers/healthtip_agent.py
import os
from openai import OpenAI
from datetime import datetime, timedelta
from ..models import db, User, ChatMemory, HealthTip

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def generate_health_tip(user):
    """
    Generate a personalized health tip using recent chat memory.
    """
    # Fetch last 5 user messages (past 7 days)
    messages = (
        ChatMemory.query
        .filter_by(user_id=user.id, sender="user")
        .order_by(ChatMemory.timestamp.desc())
        .limit(5)
        .all()
    )

    recent_text = "\n".join([m.message for m in reversed(messages)]) if messages else ""

    if not recent_text:
        context = "The user has not interacted recently. Provide a general women's health tip."
    else:
        context = f"Recent conversation history:\n{recent_text}"

    prompt = f"""
    You are SheCare, a compassionate women’s health assistant.
    Based on the following context, generate one short, personalized health tip:
    ---
    {context}
    ---
    Make it friendly, practical, and under 80 words.
    """

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "You are a health assistant who provides daily health advice."},
            {"role": "user", "content": prompt},
        ]
    )

    tip_text = response.choices[0].message.content.strip()

    # Save generated tip
    new_tip = HealthTip(user_id=user.id, tip_text=tip_text, sent=False)
    db.session.add(new_tip)
    db.session.commit()

    return tip_text
