import os
import random
import re
import threading
from datetime import datetime

from dotenv import load_dotenv
from flask import Blueprint, request, current_app
from twilio.rest import Client as TwilioClient
from twilio.twiml.messaging_response import MessagingResponse

# ✅ Ensure .env is loaded before any helper imports
base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../"))
dotenv_path = os.path.join(base_dir, ".env")
load_dotenv(dotenv_path)

from ..helpers.symptomchecker import symptomchecker
from ..helpers.clinicfinder import find_nearby_clinics
from ..helpers.prescriptionuploader import prescription_uploader
from ..helpers.healthtip_agent import generate_health_tip
from ..helpers.free_chat_agent import free_chat_agent

from ..models import (
    db,
    User,
    Participant,
    UserMessage,
    ResponseMessage,
    ChatSession,
    ChatMemory,
)

whatsapp_bp = Blueprint("whatsapp_bp", __name__)


def safe_print(*parts):
    """
    Passenger on some hosts logs with ASCII encoding.
    This prevents UnicodeEncodeError by stripping non-ASCII from logs.
    """
    try:
        msg = " ".join("" if p is None else str(p) for p in parts)
        msg = msg.encode("ascii", "ignore").decode("ascii", errors="ignore")
        print(msg)
    except Exception:
        pass


FALLBACK_TIPS = [
    "Stay hydrated, rest well, and take care of your body every day!",
    "Eat balanced meals and include fruits and vegetables.",
    "Get at least 7 hours of sleep daily to boost immunity.",
    "Take short walks and stretch to reduce stress.",
    "Stay positive — your mental health matters too!",
]


def get_first_name_for_user(user: User) -> str:
    try:
        participant = Participant.query.filter_by(user_id=user.id).first()
        first_name = (participant.first_name or "").strip() if participant else ""
        return first_name
    except Exception:
        return ""


SHECARE_ALIASES = {"shecare", "she care"}

GREETINGS = {
    "hi", "hello", "hey",
    "mambo", "habari", "niaje", "jambo", "hujambo",
    "sasa", "vipi", "sema", "salama", "uko aje", "ukoje",
    "morning", "afternoon", "evening",
    "gm", "ga", "ge",
}

GREETING_REGEXES = [
    r"^(h+i+)$",                 # hi, hiiii
    r"^(he+y+)$",                # hey, heyyy
    r"^(hell+o+)$",              # hello, hellooo
    r"^(hi+ya+)$",               # hiya
    r"^(yo+)$",                  # yo, yooo
    r"^(sup+)$",                 # sup, suppp
    r"^(what'?s\s*up)$",         # what's up / whats up
    r"^(good\s*morning)$",
    r"^(good\s*afternoon)$",
    r"^(good\s*evening)$",
    r"^(morn+ing)$",             # morninggg
    r"^(gm+)$",                  # gm, gmm
    r"^(habari(\s+yako)?)$",     # habari / habari yako
    r"^(mambo(\s+vipi)?)$",      # mambo / mambo vipi
    r"^(niaje+)$",               # niajeee
    r"^(jambo+)$",
    r"^(hujambo+)$",
    r"^(sasa+)$",
    r"^(vipi+)$",
    r"^(sema+)$",
    r"^(salama+)$",
    r"^(uko\s*aje)$",
    r"^(uko\s*je)$",
]

_GREETING_RE = re.compile(r"|".join(f"(?:{p})" for p in GREETING_REGEXES), re.IGNORECASE)


def normalize_text(s: str) -> str:
    s = (s or "").lower().strip()
    s = re.sub(r"[^\w\s]", " ", s)
    s = re.sub(r"\s+", " ", s).strip()
    return s


def is_greeting_or_greeting_shecare(raw: str) -> bool:
    n = normalize_text(raw)

    if n in GREETINGS:
        return True

    parts = n.split()
    if len(parts) >= 2 and parts[0] in GREETINGS:
        rest = " ".join(parts[1:])
        if rest in SHECARE_ALIASES:
            return True

    return False


DASHBOARD_URL = os.getenv("FRONTEND_DASHBOARD_URL")
if not DASHBOARD_URL:
    frontend_base = os.getenv("FRONTEND_BASE_URL", "http://localhost:5173").rstrip("/")
    DASHBOARD_URL = f"{frontend_base}/user-dashboard"


def send_whatsapp_message(to_phone: str, body: str) -> bool:
    account_sid = os.getenv("TWILIO_ACCOUNT_SID")
    auth_token = os.getenv("TWILIO_AUTH_TOKEN")
    from_phone = os.getenv("TWILIO_WHATSAPP_FROM", "whatsapp:+14155238886")

    if not account_sid or not auth_token:
        safe_print("Missing Twilio credentials; cannot send async WhatsApp message.")
        return False

    try:
        client = TwilioClient(account_sid, auth_token)
        msg = client.messages.create(
            from_=from_phone,
            to=f"whatsapp:{to_phone}",
            body=body,
        )
        safe_print("Async WhatsApp sent. sid=", getattr(msg, "sid", None), "to=", to_phone)
        return True
    except Exception as e:
        safe_print("Async WhatsApp send failed:", repr(e))
        return False


def process_prescription_async(app, user_id: int, user_phone: str, media_url: str, media_type: str):
    """
    Prescription stays async.
    IMPORTANT: run prescription_uploader inside THIS thread (has app context),
    so DB operations don't crash.
    """
    with app.app_context():
        safe_print("process_prescription_async start. user_id=", user_id, "media_type=", media_type)
        try:
            success, ai_reply = prescription_uploader(user_id, media_url, media_type)
            ok = send_whatsapp_message(user_phone, ai_reply)
            safe_print("process_prescription_async sent=", ok, "success_flag=", success)
        except Exception as e:
            safe_print("Async prescription processing failed:", repr(e))
            send_whatsapp_message(
                user_phone,
                "⚠️ Sorry, I couldn’t process that prescription. Please try again with a clearer photo.",
            )
        finally:
            try:
                db.session.remove()
            except Exception:
                pass
            safe_print("process_prescription_async end. user_id=", user_id)


@whatsapp_bp.route("", methods=["POST"])
@whatsapp_bp.route("/", methods=["POST"])
def whatsapp_webhook():
    safe_print("WhatsApp webhook triggered")
    data = request.form
    user_phone = data.get("From", "").replace("whatsapp:", "").strip()
    user_message = data.get("Body", "").strip()
    normalized = normalize_text(user_message)
    num_media = int(data.get("NumMedia", 0))

    response = MessagingResponse()
    message = response.message()

    # 1) Find or create user
    user = User.query.filter_by(phone=user_phone).first()
    new_user = False
    if not user:
        user = User(phone=user_phone, role="participant", password="whatsapp_user")
        db.session.add(user)
        db.session.commit()
        new_user = True
        safe_print("New user created:", user_phone)

    # 2) Manage chat session
    session = ChatSession.query.filter_by(user_id=user.id, is_active=True).first()
    if not session:
        session = ChatSession(
            user_id=user.id,
            session_state="main_menu",
            started_at=datetime.utcnow(),
        )
        db.session.add(session)
        db.session.commit()
        safe_print("New chat session started for", user_phone)

    # 3) Auto greet (sync)
    if new_user:
        ai_greeting = symptomchecker(user_phone, "Greet the user warmly and introduce SheCare.")
        ai_reply = (
            f"{ai_greeting}\n\n"
            "I can help you with:\n"
            "1️⃣ Check symptoms\n"
            "2️⃣ Find nearby clinics\n"
            "3️⃣ Upload prescription\n"
            "4️⃣ Get daily health tips\n"
            "5️⃣ Account / Dashboard\n\n"
            "👉 Reply with a number to continue."
        )
        log_chat(user_phone, ai_reply, "bot")
        message.body(ai_reply)
        safe_print("Sent welcome + main menu message")
        return str(response), 200, {"Content-Type": "application/xml"}

    # 4) Prescription upload (async)
    if num_media > 0:
        media_url = data.get("MediaUrl0")
        media_type = data.get("MediaContentType0")
        safe_print("Prescription upload detected. media_type=", media_type)

        ack = "✅ Got it. I’m reading your prescription now — I’ll reply shortly."
        message.body(ack)
        log_chat(user_phone, ack, "bot")

        app = current_app._get_current_object()
        t = threading.Thread(
        target=process_prescription_async,
        args=(app, user.id, user_phone, media_url, media_type),
        daemon=False,  # ✅ IMPORTANT: do NOT use daemon threads on Passenger/cPanel
        )
        t.start()


        safe_print("Prescription upload acknowledged; processing async...")
        return str(response), 200, {"Content-Type": "application/xml"}

    # 5) Save user message
    user_msg = UserMessage(user_id=user.id, message=normalized, timestamp=datetime.utcnow())
    db.session.add(user_msg)
    db.session.commit()

    log_chat(user_phone, user_message, "user")

    ai_reply = ""

    # 6) Main menu (sync)
    if session.session_state == "main_menu":
        safe_print("Main menu input received. len=", len(normalized or ""))

        if is_greeting_or_greeting_shecare(user_message):
            first_name = get_first_name_for_user(user)
            hello_name = first_name if first_name else "there"
            ai_reply = (
                f"Hey {hello_name}, \n\n"
                "Welcome to SheCare — your safe space for women’s health support.\n\n"
                "1️⃣ Check your symptoms\n"
                "2️⃣ Find nearby clinics\n"
                "3️⃣ Upload prescription\n"
                "4️⃣ Get daily health tips\n"
                "5️⃣ Account / Dashboard\n"
                "0️⃣ Help / Menu\n\n"
                "Reply with the number of what you’d like to do!"
            )

        elif normalized == "1":
            session.session_state = "symptom_input"
            db.session.commit()
            ai_reply = "🩺 Please describe your symptom (e.g., 'I have a headache and fever')."

        elif normalized == "2":
            session.session_state = "clinic_finder"
            db.session.commit()
            ai_reply = "📍 Please share your location or town name to find clinics near you."

        elif normalized == "3":
            ai_reply = "📸 Please upload a clear photo of your prescription."

        elif normalized == "4":
            try:
                ai_reply = f"💡 Tip: {generate_health_tip(user)}"
            except Exception as e:
                safe_print("Health tip generation failed:", repr(e))
                ai_reply = f"💡 Tip: {random.choice(FALLBACK_TIPS)}"

        elif normalized == "5" or normalized in ["dashboard", "account", "profile", "settings"]:
            ai_reply = (
                "🔐 To manage your account details, open your dashboard here:\n\n"
                f"{DASHBOARD_URL}\n\n"
                "If you want to come back here afterwards, just say *Hi*."
            )

        elif normalized in ["0", "help", "menu"]:
            ai_reply = (
                "Here’s how you can use SheCare:\n"
                "1️⃣ Check symptoms\n"
                "2️⃣ Find clinics\n"
                "3️⃣ Upload prescription\n"
                "4️⃣ Daily tips\n"
                "5️⃣ Account / Dashboard\n"
                "0️⃣ Help / Menu"
            )

        else:
            reply = free_chat_agent(
                user_phone=user_phone,
                user_message=user_message,
                user=user,
                user_id=user.id,
            )
            ai_reply = (
                f"{reply}\n\n"
                "Reply with a number anytime:\n"
                "1️⃣ Symptoms  2️⃣ Clinics  3️⃣ Prescription  4️⃣ Tips  5️⃣ Dashboard\n"
                "0️⃣ Help / Menu"
            )

    elif session.session_state == "symptom_input":
        if normalized in ["menu", "0", "back"]:
            session.session_state = "main_menu"
            db.session.commit()
            ai_reply = "🔙 Back to menu — reply with a number."
        else:
            reply = symptomchecker(user_phone, normalize_text(user_message))
            ai_reply = (
                f"{reply}\n\n"
                "Reply with a number anytime:\n"
                "1️⃣ Symptoms  2️⃣ Clinics  3️⃣ Prescription  4️⃣ Tips  5️⃣ Dashboard\n"
                "0️⃣ Help / Menu"
            )
            session.session_state = "main_menu"
            db.session.commit()

    elif session.session_state == "clinic_finder":
        if normalized in ["menu", "0", "back"]:
            session.session_state = "main_menu"
            db.session.commit()
            ai_reply = "🔙 Back to menu — reply with a number."
        else:
            clinics = find_nearby_clinics(user_message)
            reply = (
                "🩺 Clinics near you:\n\n" + "\n\n".join(clinics)
                if clinics
                else "⚕️ Sorry, I couldn’t find any clinics near that location."
            )
            ai_reply = (
                f"{reply}\n\n"
                "You can ask a follow-up (e.g., “Which do you recommend?”), or reply with a number:\n"
                "1️⃣ Symptoms  2️⃣ Clinics  3️⃣ Prescription  4️⃣ Tips  5️⃣ Dashboard\n"
                "0️⃣ Help / Menu"
            )
            session.session_state = "main_menu"
            db.session.commit()

    if not ai_reply:
        ai_reply = "⚠️ Sorry, I didn’t get that. Please try again."

    response_msg = ResponseMessage(response=ai_reply, timestamp=datetime.utcnow())
    db.session.add(response_msg)
    db.session.commit()

    user_msg.response_id = response_msg.id
    db.session.commit()

    log_chat(user_phone, ai_reply, "bot")

    message.body(ai_reply)
    safe_print("Sending reply. len=", len(ai_reply or ""))

    return str(response), 200, {"Content-Type": "application/xml"}


def log_chat(phone, message, sender):
    try:
        user = User.query.filter_by(phone=phone).first()
        if not user:
            return
        log = ChatMemory(user_id=user.id, message=message, sender=sender)
        db.session.add(log)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        safe_print("log_chat failed:", repr(e))
