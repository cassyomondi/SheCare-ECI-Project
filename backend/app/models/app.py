from flask import Flask
from models import bcrypt


# create Flask app instance
app = Flask(__name__)
bcrypt.init_app(app)
# instantiate Bcrypt with app instance
# bcrypt = Bcrypt(app)