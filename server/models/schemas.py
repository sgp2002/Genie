from pydantic import BaseModel, EmailStr
from typing import Optional, Literal


class UserRequest(BaseModel): # normal query
    question: str


class PlaybookRequest(BaseModel): # generate playbook
    task_description: str


class PlaybookExecutionRequest(BaseModel): # exectuion reqeust - playbook yml
    playbook_content: str


class PlaybookExecutionResponse(BaseModel): #  final response
    success: bool
    message: str
    output: str
    error: str


# Authentication Schemas
class UserRegister(BaseModel):
    username: str
    email: EmailStr
    password: str


class UserLogin(BaseModel):
    username: str
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict


class UserResponse(BaseModel):
    id: int
    username: str
    email: EmailStr


# Vault Schemas
class CredentialRequest(BaseModel):
    name: str
    host: str
    username: str
    password: Optional[str] = None
    ssh_key: Optional[str] = None
    connection_type: Literal["ssh", "winrm", "local"] = "ssh"
    port: Optional[int] = None


class CredentialResponse(BaseModel):
    id: int
    user_id: int
    name: str
    host: str
    username: Optional[str] = None
    connection_type: str
    port: int
    created_at: str
    updated_at: str
    last_used_at: Optional[str] = None
