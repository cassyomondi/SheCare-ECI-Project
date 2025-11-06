# SheCare

![Python](https://img.shields.io/badge/Python-3.10%2B-blue?logo=python)
![Flask](https://img.shields.io/badge/Flask-Backend-lightgrey?logo=flask)
![Twilio](https://img.shields.io/badge/Twilio-API-red?logo=twilio)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-blue?logo=postgresql)
![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)

---

## Overview

**SheCare** is a health-focused communication and data management platform designed to support maternal health, community outreach, and practitioner coordination.  
It integrates **Twilio APIs**, a structured **Flask backend**, and a relational **SQL database** to automate healthcare messaging, patient tracking, and follow-up reminders.

---

## Key Features

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

## System Architecture

The system is designed for modularity and scalability, organized around clear layers.

*(Refer to `STRUCTURE.txt` for the full structure visualization.)*

**Goals by Milestone:**
- ✅ Twilio webhook connected  
- ✅ Database created and connected  
- ✅ Chatbot can send and receive replies  
- ✅ Messages stored persistently in DB  
- 🔄 Next: Analytics and Dashboard integration  

---

## Database Schema (ERD)

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

- Python 3.8+
- Node.js 18+ and npm
- PostgreSQL
- Git
- Ngrok – for exposing the Twilio webhook locally
- `.env` file with credentials

### Step 1 - Clone the repo

```bash
# Clone repository
git clone https://github.com/cassyomondi/SheCare-ECI-Project.git
cd SheCare-ECI-Project
```

---

### Step 2 - Set up the backend

```bash
# Create and Activate Virtual Environment
cd backend
python3 -m venv venv
source venv/bin/activate    # On Windows: venv\Scripts\activate
```

```bash
# Install Dependencies
pip install -r requirements.txt
```

### Configure Environment Variables

Create a .env file inside the backend directory in this format:

```bash
FLASK_APP=run.py 
FLASK_ENV=development 
DATABASE_URL=postgresql://postgres:password@localhost/shecare_db 
SECRET_KEY=shecare-secret-key 
TWILIO_ACCOUNT_SID=your-twilio-account-sid-here 
TWILIO_AUTH_TOKEN=your-twilio-auth-token-here 
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886 # Twilio Sandbox number 
OPENAI_API_KEY=your-open-ai-api-key-here
OPENCAGE_API_KEY=your-opencage-api-key-here
GOOGLE_MAPS_API_KEY=your_google_maps_key_here
```

Replace the placeholder API keys with your actual API keys.

### Run Migrations
```bash
flask db upgrade
```

### Start the Backend Server
```bash
flask run
```

Server should start at:
```bash
http://127.0.0.1:5000
```

You can test endpoints like:
```bash
GET /api/users
GET /api/tips
GET /api/prescriptions
```

### Twilio WhatsApp Bot Setup

If you’re testing the WhatsApp bot locally:

- Run the backend (if not already)
- Make sure flask run is running on port 5000
- Start Ngrok

```bash
ngrok http 5000
```

### Update Twilio Webhook

In your Twilio Console → Sandbox for WhatsApp, set:

WHEN A MESSAGE COMES IN: https://abcd1234.ngrok.io/webhook

You can now message your Twilio WhatsApp number and interact with the bot.

--- 

### Step 3 - Set up the user frontend

Navigate to user frontend
```bash
cd frontend-auth
```

Install dependencies
```bash
npm install
```

Run development server
```bash
npm run dev
```

User frontend will be available at: http://localhost:5173

---

### Step 4 - Set up the admin frontend

Navigate to admin frontend
```bash
cd ../frontend-admin-panel
```

Install dependencies
```bash
npm install
```

Run development server
```bash
npm run dev
```

Admin panel will be available at: http://localhost:5174

---

## Contributors

| Name |
|------|
| Cassy Omondi |
| Francis Njoroge |
| Cheryl Mbani |
| Andrew Waruiru |
| Felix Waweru |
| Immanuel Kinuthia |

---

## License

This project is licensed under the **MIT License**.  

---

© 2025 SheCare Project. All rights reserved. 