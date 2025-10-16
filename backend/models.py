from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import MetaData
from sqlalchemy_serializer import SerializerMixin
from sqlalchemy.orm import validates
from sqlalchemy.dialects.postgresql import JSON



db = SQLAlchemy()

class User(db.model, SerializerMixin):
    __tablename__ ='users'

    id = db.Column(db.Integer, primary_key=True)
    phone = db.column(db.varchar, unique=True, nullable=False)
    password = db.Column(db.varchar)
    email = db.Column(db.String(120), unique=True, nullable=True)
    role= db.Column(db.String, nullable=False)
    created_at =db.Column(db.DateTime, server_default=db.func.now())

    medicalpractitioners= db.relationship('MedicalPractitioner', back_populates = 'user', cascade='all, delete-orphan')
    admins = db.relationship('Admin', back_populates='user', cascade='all, delete-orphan')
    associates = db.relationship('Associate', back_populates='user', cascade='all, delete')

    @validates('phone')
    def validate_phone(self, key, phone):
        if not phone:
            raise ValueError("Phone number required")
        if phone < 10 :
            raise ValueError('Phone number must have ten digits')

    @validates('password')
    def validate_password(self, key, password):
        if not password:
            raise ValueError("Password is required")
        if password < 8 :
            raise ValueError("Password must have 8 characters")

    @validates('email')
    def validate_email(self, key, email):
        if not email:
            raise ValueError("Email is required")
        if "@" not in email:
            raise TypeError("Invalid email")

    serializer_rules = ('-medicalpractitioners.user', '-admins.user', '-associates.user', '-password', '-phone')


    def __repr__(self):
        return f"<User phone={self.phone}, password={self.password}, role={self.role}, created_at={self.created_at}>"


class MedicalPractitioner(db.model, SerializerMixin):
    __tablename__ = 'medicalpractitioners'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    first_name = db.Column(db.String, nullable=False)
    last_name = db.Column(db.String)
    speciality = db.Column(db.String)
    role= db.Column(db.String)
    location = db.Column(db.String)
    description = db.Column(db.Text)
    created_at = db.Column(db.DateTime, server_default=db.func.now())

    user = db.relationship('User', back_populates='medicalpactitioners', casacade='all, delete-orphan')

    serializer_rules = ('-user.medicalpractitioner')


    def __repr__(self):
        return f"<Medicalpractitioner user_id={self.user_id}, first_name={self.first_name}, last_name={self.last_name},speciality={self.speciality}, role={self.role}, location={self.location}, description={self.description}, created_at={self.created_at}>"
    

class Admin(db.model, SerializerMixin):
    __tablename__ = 'admins'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    first_name = db.Column(db.String)
    last_name = db.Column(db.String)
    designation= db.Column(db.String)
    created_at = db.Column(db.DateTime, server_default=db.func.now())

    user = db.relationship('User', back_populates='admins', casacade='all, delete-orphan')

    serialize_rules=('-user.admin')


    def __repr__(self):
        return f"<Admin  user_id={self.user_id}, first_name = {self.first_name}, last_name={self.last_name}, designation={self.designation}, created_at={self.created_at}>"
    

class Associate(db.model, SerializerMixin):
    __tablename__ = 'associates'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    first_name = db.Column(db.String)
    last_name = db.Column(db.String)
    designation= db.Column(db.String)
    decription = db.Column(db.Text)
    created_at = db.Column(db.DateTime, server_default=db.func.now())

    user = db.relationship('User', back_populates='associates', casacade='all, delete-orphan')

    serialize_rules = ('-user.associate')

    def __repr__(self):
        return f"<Associate  user_id={self.user_id}, first_name = {self.first_name}, last_name={self.last_name}, designation={self.designation}, description={self.decription}, created_at={self.created_at}>"
