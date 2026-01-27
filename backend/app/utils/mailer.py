import os, smtplib
from email.mime.text import MIMEText
from email.utils import formataddr

def send_email(to_email: str, subject: str, html: str):
    host = os.getenv("SMTP_HOST")
    port = int(os.getenv("SMTP_PORT", "465"))
    user = os.getenv("SMTP_USER")
    password = os.getenv("SMTP_PASS")
    from_name_email = os.getenv("SMTP_FROM", user)

    msg = MIMEText(html, "html", "utf-8")
    msg["Subject"] = subject
    msg["From"] = from_name_email
    msg["To"] = to_email

    if port == 465:
        server = smtplib.SMTP_SSL(host, port)
    else:
        server = smtplib.SMTP(host, port)
        server.starttls()

    try:
        server.login(user, password)
        server.sendmail(user, [to_email], msg.as_string())
    finally:
        server.quit()
