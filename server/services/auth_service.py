"""
Authentication service with in-memory user storage
(Will be replaced with database later)
"""
from datetime import datetime, timedelta
from typing import Optional, Dict
from jose import JWTError, jwt
from passlib.context import CryptContext
import os

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT Configuration
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Hardcoded admin user for now
ADMIN_USERNAME = "admin"
ADMIN_PASSWORD = "admin123"
ADMIN_USER = {
    "id": 1,
    "username": ADMIN_USERNAME,
    "email": "admin@playgenie.com",
    "created_at": datetime.utcnow().isoformat()
}

# In-memory user storage (temporary, will use DB later)
users_db: Dict[str, Dict] = {
    ADMIN_USERNAME: ADMIN_USER
}
user_id_counter = 2


def hash_password(password: str) -> str:
    """Hash a password using bcrypt
    
    Note: bcrypt has a 72-byte limit, so we truncate longer passwords.
    """
    try:
        # Truncate password to 72 bytes (bcrypt limitation)
        password_bytes = password.encode('utf-8')
        if len(password_bytes) > 72:
            password_bytes = password_bytes[:72]
            password = password_bytes.decode('utf-8', errors='ignore')
        return pwd_context.hash(password)
    except Exception as e:
        print(f"Password hashing error: {str(e)}")
        raise ValueError(f"Failed to hash password: {str(e)}")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash
    
    Note: bcrypt has a 72-byte limit, so we truncate longer passwords.
    """
    # Truncate password to 72 bytes (bcrypt limitation)
    password_bytes = plain_password.encode('utf-8')
    if len(password_bytes) > 72:
        password_bytes = password_bytes[:72]
        plain_password = password_bytes.decode('utf-8', errors='ignore')
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create a JWT access token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def register_user(username: str, email: str, password: str) -> Dict:
    """Register a new user"""
    global user_id_counter
    
    # Validate inputs
    if not username or not username.strip():
        raise ValueError("Username is required")
    if not email or not email.strip():
        raise ValueError("Email is required")
    if not password or not password.strip():
        raise ValueError("Password is required")
    
    # Check if user already exists
    if username in users_db:
        raise ValueError("Username already exists")
    
    # Check if email already exists
    for user in users_db.values():
        if user.get("email") == email:
            raise ValueError("Email already exists")
    
    # Create new user
    try:
        user_id = user_id_counter
        user_id_counter += 1
        
        user_data = {
            "id": user_id,
            "username": username,
            "email": email,
            "password_hash": hash_password(password),
            "created_at": datetime.utcnow().isoformat()
        }
        
        users_db[username] = user_data
        
        return {
            "id": user_id,
            "username": username,
            "email": email
        }
    except ValueError:
        # Re-raise ValueError (e.g., from hash_password)
        raise
    except Exception as e:
        print(f"Registration error: {str(e)}")
        raise ValueError(f"Failed to register user: {str(e)}")


def authenticate_user(username: str, password: str) -> Optional[Dict]:
    """Authenticate a user and return user data if valid"""
    # Check hardcoded admin credentials
    if username == ADMIN_USERNAME and password == ADMIN_PASSWORD:
        return {
            "id": ADMIN_USER["id"],
            "username": ADMIN_USER["username"],
            "email": ADMIN_USER["email"]
        }
    
    # Check other users in database (for future use)
    user = users_db.get(username)
    if not user:
        return None
    
    # If user has password_hash, verify it (for future registered users)
    if "password_hash" in user:
        if not verify_password(password, user["password_hash"]):
            return None
    
    return {
        "id": user["id"],
        "username": user["username"],
        "email": user["email"]
    }


def get_user_by_username(username: str) -> Optional[Dict]:
    """Get user by username"""
    user = users_db.get(username)
    if not user:
        return None
    
    return {
        "id": user["id"],
        "username": user["username"],
        "email": user["email"]
    }


def verify_token(token: str) -> Optional[Dict]:
    """Verify and decode JWT token"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            return None
        return get_user_by_username(username)
    except JWTError:
        return None
