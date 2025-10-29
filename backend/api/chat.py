import os
import json
import threading
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timezone, timedelta

router = APIRouter(prefix="/api/chat", tags=["chat"])

# Data files
DATA_DIR = os.path.join(os.getcwd(), "data")
MESSAGES_FILE = os.path.join(DATA_DIR, "messages.json")
USERS_FILE = os.path.join(DATA_DIR, "users.json")

# Lock for safe file writes
file_lock = threading.Lock()

# Ensure data dir & files exist
os.makedirs(DATA_DIR, exist_ok=True)
for f, default in [(MESSAGES_FILE, []), (USERS_FILE, [])]:
    if not os.path.exists(f):
        with open(f, "w", encoding="utf-8") as fh:
            json.dump(default, fh, indent=2)

# Helper utils
def _read_json(path):
    with open(path, "r", encoding="utf-8") as fh:
        return json.load(fh)

def _write_json_atomic(path, data):
    tmp = path + ".tmp"
    with file_lock, open(tmp, "w", encoding="utf-8") as fh:
        json.dump(data, fh, indent=2, ensure_ascii=False)
        fh.flush()
        os.fsync(fh.fileno())
    os.replace(tmp, path)

def _now_iso():
    return datetime.now(timezone.utc).isoformat()

def _ensure_seed_users():
    users = _read_json(USERS_FILE)
    if not users:
        # seed with example users
        seed = [
            {"id": "user_001", "name": "James Anderson", "last_seen": None},
            {"id": "user_002", "name": "Felix Martinez", "last_seen": None},
        ]
        _write_json_atomic(USERS_FILE, seed)
        return seed
    return users

# Models
class PeerMessage(BaseModel):
    sender_id: str
    sender_name: str
    receiver_id: str
    message: str

class UserSession(BaseModel):
    user_id: str
    username: str

class UsernameCheck(BaseModel):
    username: str

# Presence settings
ONLINE_THRESHOLD_SECONDS = 40

# NEW ENDPOINT: Check if username is available
@router.post("/check-username")
async def check_username(data: UsernameCheck):
    """Check if username is available (case-insensitive)"""
    users = _read_json(USERS_FILE)
    username_lower = data.username.strip().lower()
    
    # Check if username exists (case-insensitive)
    for user in users:
        if user["name"].lower() == username_lower:
            return {
                "available": False,
                "message": "This name is already taken. Please use a unique name or add your last name (e.g., 'James Wasonga')."
            }
    
    # Check if it's a single name (no space)
    if " " not in data.username.strip():
        # Count how many users have this first name
        first_name_lower = data.username.strip().lower()
        count = sum(1 for u in users if u["name"].split()[0].lower() == first_name_lower)
        
        if count > 0:
            return {
                "available": False,
                "message": f"Someone named '{data.username}' already exists. Please add your last name (e.g., '{data.username} Smith')."
            }
    
    return {
        "available": True,
        "message": "Username is available!"
    }

@router.get("/peer/contacts")
async def get_contacts():
    """Return contacts with computed status (online/offline)"""
    users = _ensure_seed_users()
    now = datetime.now(timezone.utc)
    contacts = []
    for u in users:
        last_seen = u.get("last_seen")
        status = "offline"
        if last_seen:
            try:
                last_dt = datetime.fromisoformat(last_seen)
                if (now - last_dt) <= timedelta(seconds=ONLINE_THRESHOLD_SECONDS):
                    status = "online"
            except Exception:
                status = "offline"
        contacts.append({
            "id": u["id"],
            "name": u["name"],
            "status": status,
            "avatar": "👨‍🎓"
        })
    return {"contacts": contacts}

@router.post("/session/create")
async def create_session(session: UserSession):
    """Create/update a user and mark them online (last_seen now)"""
    users = _read_json(USERS_FILE)
    
    # Double-check username availability
    username_lower = session.username.strip().lower()
    for u in users:
        if u["name"].lower() == username_lower and u["id"] != session.user_id:
            raise HTTPException(
                status_code=400,
                detail="Username already taken. Please choose a different name."
            )
    
    # Update if exists else add
    found = False
    for u in users:
        if u["id"] == session.user_id:
            u["name"] = session.username.strip()
            u["last_seen"] = _now_iso()
            found = True
            break
    
    if not found:
        users.append({
            "id": session.user_id,
            "name": session.username.strip(),
            "last_seen": _now_iso()
        })
    
    _write_json_atomic(USERS_FILE, users)
    return {
        "success": True,
        "user_id": session.user_id,
        "username": session.username.strip(),
        "last_seen": _now_iso()
    }

@router.post("/session/heartbeat")
async def heartbeat(session: UserSession):
    """Periodic heartbeat to keep user online"""
    users = _read_json(USERS_FILE)
    updated = False
    for u in users:
        if u["id"] == session.user_id:
            u["last_seen"] = _now_iso()
            updated = True
            break
    if not updated:
        users.append({"id": session.user_id, "name": session.username, "last_seen": _now_iso()})
    _write_json_atomic(USERS_FILE, users)
    return {"success": True, "last_seen": _now_iso()}

@router.post("/peer/send")
async def send_peer_message(message: PeerMessage):
    """Send message to another student and persist to messages.json"""
    messages = _read_json(MESSAGES_FILE)
    msg_data = {
        "id": (messages[-1]["id"] + 1) if messages else 1,
        "sender_id": message.sender_id,
        "sender_name": message.sender_name,
        "receiver_id": message.receiver_id,
        "message": message.message,
        "timestamp": _now_iso(),
        "read": False
    }
    messages.append(msg_data)
    _write_json_atomic(MESSAGES_FILE, messages)
    return {"success": True, "message_id": msg_data["id"], "timestamp": msg_data["timestamp"]}

@router.get("/peer/messages/{user_id}/{peer_id}")
async def get_peer_messages(user_id: str, peer_id: str):
    """Fetch messages between two users; mark incoming messages as read"""
    messages = _read_json(MESSAGES_FILE)
    conv = [m for m in messages if
            (m["sender_id"] == user_id and m["receiver_id"] == peer_id) or
            (m["sender_id"] == peer_id and m["receiver_id"] == user_id)]
    conv = sorted(conv, key=lambda x: x["timestamp"])
    
    updated = False
    for m in messages:
        if m["receiver_id"] == user_id and m["sender_id"] == peer_id and not m.get("read"):
            m["read"] = True
            updated = True
    if updated:
        _write_json_atomic(MESSAGES_FILE, messages)
    return {"messages": conv}

@router.get("/peer/unread/{user_id}")
async def get_unread_count(user_id: str):
    """Return total unread + per-sender unread summary"""
    messages = _read_json(MESSAGES_FILE)
    unread_from = {}
    total_unread = 0
    for m in messages:
        if m["receiver_id"] == user_id and not m.get("read"):
            total_unread += 1
            s = m["sender_id"]
            if s not in unread_from:
                unread_from[s] = {"count": 0, "last_message": m["message"], "sender_name": m["sender_name"]}
            unread_from[s]["count"] += 1
            unread_from[s]["last_message"] = m["message"]
    return {"total_unread": total_unread, "unread_from": unread_from}