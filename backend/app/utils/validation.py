import re

def validate_email(email):
    
    if not email:
        return False, None
    
    # Remove whitespace and lowercase
    email = email.strip().lower()
    
    # Simple regex for email validation
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    
    if re.match(pattern, email):
        return True, email
    return False, None


def validate_password(password, min_length=8):

    if not password:
        return False, "Password is required"
    
    if len(password) < min_length:
        return False, f"Password must be at least {min_length} characters"
    
    return True, None


def sanitize_name(name):

    if not name:
        return None
    
    # Remove extra whitespace
    name = ' '.join(name.split())
    
    # Remove leading/trailing spaces
    name = name.strip()
    
    # Check reasonable length
    if len(name) < 1 or len(name) > 100:
        return None
    
    return name