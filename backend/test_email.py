from app import create_app
from app.utils.email import send_admin_invitation
from datetime import datetime, timedelta

# Create app context
app = create_app()

print("\n📬 Flask-Mail Configuration Check:")
print("MAIL_SERVER:", app.config.get("MAIL_SERVER"))
print("MAIL_PORT:", app.config.get("MAIL_PORT"))
print("MAIL_USE_TLS:", app.config.get("MAIL_USE_TLS"))
print("MAIL_USERNAME:", app.config.get("MAIL_USERNAME"))
print("MAIL_PASSWORD:", str(app.config.get("MAIL_PASSWORD"))[:4] + "****")
print("MAIL_DEFAULT_SENDER:", app.config.get("MAIL_DEFAULT_SENDER"))
print("")

with app.app_context():
    test_link = "http://localhost:5000/admin/register?token=test123"
    test_expires = datetime.utcnow() + timedelta(days=7)
    
    print("📧 Sending test email...")
    
    result = send_admin_invitation(
        email="cassyomondi@gmail.com",  # Replace with your email
        invite_link=test_link,
        expires_at=test_expires
    )
    
    if result:
        print("✅ Email sent successfully! Check your inbox.")
    else:
        print("❌ Email failed to send. Check your configuration.")