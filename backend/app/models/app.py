from flask import Flask, make_response, jsonify, request, send_from_directory, session
from models import db, Admin

def create_app():
    app = Flask(__name__)
    return app

app = create_app()

@app.route("/admin/login", methods = ["POST"])
def new_admin():
    data = request.get_json()
    email= data.get('email')
    password= data.get('password')
    role =data.get('role')
     #check if admin exists
    admin_exists = Admin.query.filter_by(email=email, password=password, role=role).first()
    if admin_exists:
        return make_response({"error": "Admin already exists!"})
    

if __name__ == "__main__":
    app.run(debug=True)
