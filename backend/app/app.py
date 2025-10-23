from flask import Flask
from .whatsapp.bot import whatsapp_bp
from apscheduler.schedulers.background import BackgroundScheduler
from helpers.healthtip_scheduler import start_healthtip_scheduler

def create_app():
    app = Flask(__name__)
    app.register_blueprint(whatsapp_bp)
    
    #  Start the daily health tip scheduler
    with app.app_context():
        start_healthtip_scheduler(app)

    return app

app = create_app()

if __name__ == "__main__":
    app.run(debug=True)
