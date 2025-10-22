import os
from dotenv import load_dotenv

load_dotenv()

#class Config:
    #SQLALCHEMY_DATABASE_URI = os.getenv(
        #"DATABASE_URL",
       # "postgresql://postgres:password@localhost/shecare_db"
   # )
    #SQLALCHEMY_TRACK_MODIFICATIONS = False
    #SECRET_KEY = os.getenv("SECRET_KEY", "shecare-secret-key")
#
class Config:
    # Use SQLite for local development
    SQLALCHEMY_DATABASE_URI = os.getenv(
        "DATABASE_URL",
        "sqlite:///app.db"  # Local database file
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SECRET_KEY = os.getenv("SECRET_KEY", "shecare-secret-key")  # Default secret key