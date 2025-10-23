import os
from apscheduler.schedulers.background import BackgroundScheduler
from datetime import datetime
from twilio.rest import Client
from .healthtip_agent import generate_health_tip
from ..models import db, User, HealthTip

def send_daily_health_tips():
    print("💌 Sending daily health tips...")

    account_sid = os.getenv("TWILIO_ACCOUNT_SID")
    auth_token = os.getenv("TWILIO_AUTH_TOKEN")

    if not account_sid or not auth_token:
        print("⚠️ Missing Twilio credentials in environment.")
        return

    client = Client(account_sid, auth_token)
    users = User.query.all()

    if not users:
        print("⚠️ No users found.")
        return

    for user in users:
        tip_text = generate_health_tip()

        try:
            client.messages.create(
                from_="whatsapp:+14155238886",
                to=f"whatsapp:{user.phone}",
                body=f"🌿 *Daily Health Tip*\n{tip_text}"
            )

            new_tip = HealthTip(user_id=user.id, tip_text=tip_text, sent=True, date_sent=datetime.utcnow())
            db.session.add(new_tip)
            print(f"✅ Sent tip to {user.phone}")

        except Exception as e:
            print(f"⚠️ Failed to send tip to {user.phone}: {e}")

    db.session.commit()
    print("🎯 All health tips sent successfully!")

def start_healthtip_scheduler(app):
    """Starts the scheduler with Flask app context."""
    scheduler = BackgroundScheduler()
    scheduler.add_job(func=lambda: app.app_context().push() or send_daily_health_tips(), trigger='interval', hours=24)
    scheduler.start()
    print("🕒 Daily Health Tip Scheduler started!")
