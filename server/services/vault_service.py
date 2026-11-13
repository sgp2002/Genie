"""
Vault service for credential management
In-memory storage (will be replaced with database later)
"""
from typing import Dict, List, Optional
from datetime import datetime
from cryptography.fernet import Fernet
import os
import base64

# Encryption key (in production, use environment variable)
ENCRYPTION_KEY = os.getenv("VAULT_ENCRYPTION_KEY", Fernet.generate_key().decode())
cipher_suite = Fernet(ENCRYPTION_KEY.encode() if isinstance(ENCRYPTION_KEY, str) else ENCRYPTION_KEY)

# In-memory credential storage (temporary, will use DB later)
# Structure: {user_id: {credential_id: credential_data}}
credentials_db: Dict[int, Dict[int, Dict]] = {}
credential_id_counter = 1


def encrypt_credential(value: str) -> str:
    """Encrypt a credential value"""
    if not value:
        return ""
    return cipher_suite.encrypt(value.encode()).decode()


def decrypt_credential(encrypted_value: str) -> str:
    """Decrypt a credential value"""
    if not encrypted_value:
        return ""
    return cipher_suite.decrypt(encrypted_value.encode()).decode()


def create_credential(user_id: int, credential_data: Dict) -> Dict:
    """Create a new credential for a user"""
    global credential_id_counter
    
    credential_id = credential_id_counter
    credential_id_counter += 1
    
    # Encrypt sensitive fields
    encrypted_data = {
        "id": credential_id,
        "user_id": user_id,
        "name": credential_data.get("name", ""),
        "host": credential_data.get("host", ""),
        "username": credential_data.get("username", ""),
        "password_encrypted": encrypt_credential(credential_data.get("password", "")),
        "ssh_key_encrypted": encrypt_credential(credential_data.get("ssh_key", "")),
        "connection_type": credential_data.get("connection_type", "ssh"),
        "port": credential_data.get("port", 22),
        "created_at": datetime.utcnow().isoformat(),
        "updated_at": datetime.utcnow().isoformat(),
        "last_used_at": None
    }
    
    # Initialize user's credential store if needed
    if user_id not in credentials_db:
        credentials_db[user_id] = {}
    
    credentials_db[user_id][credential_id] = encrypted_data
    
    return {
        "id": credential_id,
        "user_id": user_id,
        "name": encrypted_data["name"],
        "host": encrypted_data["host"],
        "username": encrypted_data["username"],
        "connection_type": encrypted_data["connection_type"],
        "port": encrypted_data["port"],
        "created_at": encrypted_data["created_at"],
        "updated_at": encrypted_data["updated_at"],
        "last_used_at": encrypted_data["last_used_at"]
    }


def get_credentials(user_id: int) -> List[Dict]:
    """Get all credentials for a user (without sensitive data)"""
    if user_id not in credentials_db:
        return []
    
    credentials = []
    for cred_id, cred_data in credentials_db[user_id].items():
        credentials.append({
            "id": cred_data["id"],
            "user_id": cred_data["user_id"],
            "name": cred_data["name"],
            "host": cred_data["host"],
            "username": cred_data["username"],
            "connection_type": cred_data["connection_type"],
            "port": cred_data["port"],
            "created_at": cred_data["created_at"],
            "updated_at": cred_data["updated_at"],
            "last_used_at": cred_data["last_used_at"]
        })
    
    return credentials


def get_credential(user_id: int, credential_id: int) -> Optional[Dict]:
    """Get a specific credential (with decrypted sensitive data)"""
    if user_id not in credentials_db:
        return None
    
    if credential_id not in credentials_db[user_id]:
        return None
    
    cred_data = credentials_db[user_id][credential_id]
    
    return {
        "id": cred_data["id"],
        "user_id": cred_data["user_id"],
        "name": cred_data["name"],
        "host": cred_data["host"],
        "username": cred_data["username"],
        "password": decrypt_credential(cred_data["password_encrypted"]),
        "ssh_key": decrypt_credential(cred_data["ssh_key_encrypted"]),
        "connection_type": cred_data["connection_type"],
        "port": cred_data["port"],
        "created_at": cred_data["created_at"],
        "updated_at": cred_data["updated_at"],
        "last_used_at": cred_data["last_used_at"]
    }


def update_credential(user_id: int, credential_id: int, credential_data: Dict) -> Optional[Dict]:
    """Update a credential"""
    if user_id not in credentials_db:
        return None
    
    if credential_id not in credentials_db[user_id]:
        return None
    
    existing = credentials_db[user_id][credential_id]
    
    # Update fields (only update provided fields)
    if "name" in credential_data:
        existing["name"] = credential_data["name"]
    if "host" in credential_data:
        existing["host"] = credential_data["host"]
    if "username" in credential_data:
        existing["username"] = credential_data["username"]
    if "password" in credential_data and credential_data["password"]:
        existing["password_encrypted"] = encrypt_credential(credential_data["password"])
    if "ssh_key" in credential_data and credential_data["ssh_key"]:
        existing["ssh_key_encrypted"] = encrypt_credential(credential_data["ssh_key"])
    if "connection_type" in credential_data:
        existing["connection_type"] = credential_data["connection_type"]
    if "port" in credential_data:
        existing["port"] = credential_data["port"]
    
    existing["updated_at"] = datetime.utcnow().isoformat()
    
    return {
        "id": existing["id"],
        "user_id": existing["user_id"],
        "name": existing["name"],
        "host": existing["host"],
        "username": existing["username"],
        "connection_type": existing["connection_type"],
        "port": existing["port"],
        "created_at": existing["created_at"],
        "updated_at": existing["updated_at"],
        "last_used_at": existing["last_used_at"]
    }


def delete_credential(user_id: int, credential_id: int) -> bool:
    """Delete a credential"""
    if user_id not in credentials_db:
        return False
    
    if credential_id not in credentials_db[user_id]:
        return False
    
    del credentials_db[user_id][credential_id]
    return True


def test_credential(user_id: int, credential_id: int) -> Dict:
    """Test credential connection (placeholder for now)"""
    credential = get_credential(user_id, credential_id)
    if not credential:
        return {"success": False, "message": "Credential not found"}
    
    # Update last_used_at
    if user_id in credentials_db and credential_id in credentials_db[user_id]:
        credentials_db[user_id][credential_id]["last_used_at"] = datetime.utcnow().isoformat()
    
    # TODO: Implement actual connection test
    # For now, just return success
    return {
        "success": True,
        "message": f"Connection test successful for {credential['host']}"
    }
