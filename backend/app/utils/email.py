from flask import current_app, render_template
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

def send_admin_invitation(email, invite_link, expires_at):
    """
    Send admin invitation email using direct SMTP (bypasses Flask-Mail)
    
    Args:
        email: Recipient email address
        invite_link: Full URL with invitation token
        expires_at: DateTime when invitation expires
    
    Returns:
        True if email sent successfully, False otherwise
    """
    try:
        # Get config from Flask app
        smtp_server = current_app.config['MAIL_SERVER']
        smtp_port = current_app.config['MAIL_PORT']
        username = current_app.config['MAIL_USERNAME']
        password = current_app.config['MAIL_PASSWORD']
        sender = current_app.config['MAIL_DEFAULT_SENDER']
        
        print(f" Preparing to send invitation to {email}")
        print(f" Server: {smtp_server}:{smtp_port}")
        
        # Render HTML template
        html_content = render_template(
            'emails/admin_invitation.html',
            invite_link=invite_link,
            expires_at=expires_at.strftime('%B %d, %Y at %I:%M %p UTC')
        )
        
        # Create email message
        msg = MIMEMultipart('alternative')
        msg['Subject'] = "You've Been Invited as an Administrator"
        msg['From'] = sender
        msg['To'] = email
        
        # Attach HTML content
        html_part = MIMEText(html_content, 'html')
        msg.attach(html_part)
        
        # Connect to SMTP server based on port
        print("🔌 Connecting to Gmail SMTP...")
        if smtp_port == 465:
            # Use SSL for port 465
            server = smtplib.SMTP_SSL(smtp_server, smtp_port, timeout=30)
            print("🔒 Using SSL connection")
        else:
            # Use STARTTLS for port 587
            server = smtplib.SMTP(smtp_server, smtp_port, timeout=30)
            print("🔒 Starting TLS...")
            server.starttls()
        
        # Authenticate
        print("🔑 Authenticating...")
        server.login(username, password)
        
        # Send email
        print("📤 Sending message...")
        server.send_message(msg)
        
        # Close connection
        server.quit()
        
        print(f"✅ Email sent successfully to {email}\n")
        return True
        
    except smtplib.SMTPAuthenticationError as e:
        print(f"❌ Authentication failed: {e}")
        print("💡 Check your Gmail App Password is correct")
        return False
        
    except smtplib.SMTPException as e:
        print(f"❌ SMTP error: {e}")
        import traceback
        print(f"📋 Details:\n{traceback.format_exc()}")
        return False
        
    except Exception as e:
        print(f"❌ Error sending email: {str(e)}")
        import traceback
        print(f"📋 Full traceback:\n{traceback.format_exc()}")
        return False