# SheCare

![Python](https://img.shields.io/badge/Python-3.10%2B-blue?logo=python)
![Flask](https://img.shields.io/badge/Flask-Backend-lightgrey?logo=flask)
![Twilio](https://img.shields.io/badge/Twilio-API-red?logo=twilio)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-blue?logo=postgresql)
![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)

---

## 🩺 Overview

**SheCare** is a health-focused communication and data management platform designed to support maternal health, community outreach, and practitioner coordination.  
It integrates **Twilio APIs**, a structured **Flask backend**, and a relational **SQL database** to automate healthcare messaging, patient tracking, and follow-up reminders.

---

## 🚀 Key Features

- **Automated Messaging System**
  - Sends and receives SMS through Twilio webhooks.
  - Stores message history in a database for analysis and follow-up.

- **Multi-User Roles**
  - Supports `Admin`, `MedicalPractitioner`, `Associate`, and `Participant` roles.

- **Secure Communication Channels**
  - Twilio-powered two-way chat between participants and health practitioners.

- **Prescription Management**
  - Upload and verify prescriptions with tracking of input/output tokens.

- **Tips & Educational Content**
  - Health practitioners can publish and verify informational health tips.

- **Analytics and Reporting (Planned)**
  - Track outreach effectiveness, message engagement, and response rates.

---

## 🧩 System Architecture

The system is designed for modularity and scalability, organized around clear layers:

```
backend/
│
├── app/
│   ├── models/            # Database models
│   ├── routes/            # API route definitions
│   ├── config.py          # Environment and Twilio config
│   └── __init__.py        # App factory initialization
│
├── migrations/            # Database migrations
└── run.py                 # Entry point to start the Flask app
```

**Goals by Milestone:**
- ✅ Twilio webhook connected  
- ✅ Database created and connected  
- ✅ Chatbot can send and receive replies  
- ✅ Messages stored persistently in DB  
- 🔄 Next: Analytics and Dashboard integration  

---

## 🗃️ Database Schema (ERD)

The core database is relational and optimized for chat and health-tracking functionality.

### **Key Entities**

| Table | Description |
|--------|--------------|
| **users** | Base table for all roles (Admin, Practitioner, Associate, Participant). |
| **Admin** | Manages system configuration and user permissions. |
| **MedicalPractitioners** | Stores practitioner details (specialty, title, location). |
| **Associates** | Field agents assisting with participant management. |
| **Participants** | End-users (patients or clients) tracked in the system. |
| **ChatSessions** | Tracks conversation context, session state, and activity. |
| **User_message / Response_message** | Logs communication threads with timestamps. |
| **Prescriptions** | Stores uploaded prescriptions and related AI outputs. |
| **Tips** | Repository for verified health tips shared with participants. |

*(Refer to `ERD.png` for the full schema visualization.)*

---

## ⚙️ Setup Instructions

### Prerequisites
- Python 3.10+
- Flask
- PostgreSQL or MySQL
- Twilio Account (with verified phone number)
- `.env` file with credentials

### Installation

```bash
# Clone repository
git clone https://github.com/<your-repo>/shecare-backend.git
cd shecare-backend

# Create virtual environment
python -m venv venv
source venv/bin/activate   # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run database migrations
flask db upgrade

# Start the server
flask run
```

---

## 🔐 Environment Variables

Create a `.env` file in the project root with:

```
DATABASE_URL=postgresql://username:password@localhost/shecare
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890
FLASK_ENV=development
```

---

## 🧠 Future Enhancements

- Web-based Admin Dashboard  
- Real-time analytics for outreach programs  
- Automated health reminders and scheduling  
- Integration with electronic health records (EHR)  
- Multilingual support for rural deployment  

---

## 👩‍💻 Contributors

| Name |
|------|
| [Cassy Omondi] |
| [Francis Njoroge] |
| [Cheryl Mbani] |
| [Andrew Waruiru] |
| [Felix Waweru] |
| [Immanuel Kinuthia] |

---

## 🪪 License

This project is licensed under the **MIT License**.  

---

© 2025 SheCare Project. All rights reserved.

