from flask import current_app, render_template
from flask_mail import Message
from app import mail

def send_admin_invitation(email, invite_link, expires_at):
    """
    Send admin invitation email
    
    Args:
        email: Recipient email address
        invite_link: Full URL with invitation token
        expires_at: DateTime when invitation expires
    
    Returns:
        True if email sent successfully, False otherwise
    """
    try:
        msg = Message(
            subject="You've Been Invited as an Administrator",
            recipients=[email],
            sender=current_app.config['MAIL_DEFAULT_SENDER']
        )
        
        # Render HTML template
        msg.html = render_template(
            'emails/admin_invitation.html',
            invite_link=invite_link,
            expires_at=expires_at.strftime('%B %d, %Y at %I:%M %p UTC')
        )
        
        # Send email
        mail.send(msg)
        return True
        
    except Exception as e:
        # Log the error (you can add proper logging later)
        print(f"Error sending email: {str(e)}")
        return False