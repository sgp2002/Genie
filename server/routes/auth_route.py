"""
Authentication routes for user registration and login
"""
from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from datetime import timedelta

from models.schemas import UserRegister, UserLogin, Token, UserResponse
from services.auth_service import (
    authenticate_user,
    create_access_token,
    verify_token,
    ACCESS_TOKEN_EXPIRE_MINUTES
)

router = APIRouter(tags=["Authentication"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


def get_current_user(token: str = Depends(oauth2_scheme)) -> dict:
    """Dependency to get current authenticated user"""
    user = verify_token(token)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user


# Registration disabled - using hardcoded admin user only
# @router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
# def register(user_data: UserRegister):
#     """Register a new user - DISABLED"""
#     raise HTTPException(
#         status_code=status.HTTP_403_FORBIDDEN,
#         detail="Registration is disabled. Please use admin/admin123 to login."
#     )


@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends()):
    """
    Login user and return JWT token
    """
    user = authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["username"]}, expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }


@router.get("/me", response_model=UserResponse)
def get_current_user_info(current_user: dict = Depends(get_current_user)):
    """
    Get current authenticated user information
    """
    return current_user
