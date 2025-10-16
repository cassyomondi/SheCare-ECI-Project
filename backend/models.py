class Prescription(db.Model, SerializerMixin):
    __tablename__ = 'prescriptions'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=False)
    uploaded = db.Column(db.LargeBinary)  
    response = db.Column(db.Text)
    input_token = db.Column(db.String(255))
    output_token = db.Column(db.String(255))
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationship
    user = db.relationship('User', back_populates='prescriptions')

    serialize_rules = ('-user.prescriptions',)

    def __repr__(self):
        return f"<Prescription id={self.id} user_id={self.user_id}>"


class Tip(db.Model,serializerMixin):
    __tablename__ = 'tips'

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.Text, nullable=False)
    description = db.Column(db.Text)
    status = db.Column(db.Boolean, default=False)  
    practitioner = db.Column(db.String(255))  
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    sent_timestamp = db.Column(db.DateTime)
    verified_timestamp = db.Column(db.DateTime)



    def __repr__(self):
        return f"<Tip id={self.id} title='{self.title[:30]}...'>"

class ChatSession(db.Model,serializerMixin):
    __tablename__ = 'chat_sessions'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    session_state = db.Column(db.String(255))
    context = db.Column(db.Text)                    
    started_at = db.Column(db.DateTime, default=datetime.utcnow)
    last_activity = db.Column(db.DateTime)
    is_active = db.Column(db.Boolean, default=True)

    # Relationships
    user=db.relationship("User", back_populates='chat_sessions')

    def __repr__(self):
        return f"<ChatSession id={self.id} user_id={self.user_id} active={self.is_active}>"

    

class Participant(db.Model, SerializerMixin):
    __tablename__ = 'participants'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=False)
    first_name = db.Column(db.String(255))
    last_name = db.Column(db.String(255))
    location = db.Column(db.String(255))
    age = db.Column(db.Integer)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationship
    user = db.relationship('User', back_populates='participant')

    serialize_rules = ('-user.participant',)

    def __repr__(self):
        return f"<Participant id={self.id} name={self.first_name} {self.last_name}>"
