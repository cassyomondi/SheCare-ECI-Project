import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SQLALCHEMY_DATABASE_URI = os.getenv(
        "DATABASE_URL",
        "postgresql://postgres:Rimongi@localhost:5432/shecare"
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SECRET_KEY = os.getenv("SECRET_KEY", "shecare-secret-key")

MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_USE_TLS=True
MAIL_USERNAME=andrew.waruiru@student.moringaschool@gmail.com
MAIL_PASSWORD=
MAIL_DEFAULT_SENDER=your.email@gmail.com