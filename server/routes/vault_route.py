"""
Vault routes for credential management
"""
from fastapi import APIRouter, HTTPException, Depends, status
from typing import List

from models.schemas import CredentialRequest, CredentialResponse
from routes.auth_route import get_current_user
from services.vault_service import (
    create_credential,
    get_credentials,
    get_credential,
    update_credential,
    delete_credential,
    test_credential
)

router = APIRouter(tags=["Vault"])


@router.get("/credentials", response_model=List[CredentialResponse])
def list_credentials(current_user: dict = Depends(get_current_user)):
    """Get all credentials for current user"""
    return get_credentials(current_user["id"])


@router.post("/credentials", response_model=CredentialResponse, status_code=status.HTTP_201_CREATED)
def create_credential_route(
    credential: CredentialRequest,
    current_user: dict = Depends(get_current_user)
):
    """Create a new credential"""
    try:
        credential_data = {
            "name": credential.name,
            "host": credential.host,
            "username": credential.username,
            "password": credential.password,
            "ssh_key": credential.ssh_key,
            "connection_type": credential.connection_type,
            "port": credential.port
        }
        return create_credential(current_user["id"], credential_data)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.get("/credentials/{credential_id}", response_model=CredentialResponse)
def get_credential_route(
    credential_id: int,
    current_user: dict = Depends(get_current_user)
):
    """Get a specific credential"""
    credential = get_credential(current_user["id"], credential_id)
    if not credential:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Credential not found"
        )
    return credential


@router.put("/credentials/{credential_id}", response_model=CredentialResponse)
def update_credential_route(
    credential_id: int,
    credential: CredentialRequest,
    current_user: dict = Depends(get_current_user)
):
    """Update a credential"""
    credential_data = {
        "name": credential.name,
        "host": credential.host,
        "username": credential.username,
        "password": credential.password,
        "ssh_key": credential.ssh_key,
        "connection_type": credential.connection_type,
        "port": credential.port
    }
    
    updated = update_credential(current_user["id"], credential_id, credential_data)
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Credential not found"
        )
    return updated


@router.delete("/credentials/{credential_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_credential_route(
    credential_id: int,
    current_user: dict = Depends(get_current_user)
):
    """Delete a credential"""
    success = delete_credential(current_user["id"], credential_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Credential not found"
        )


@router.post("/credentials/{credential_id}/test")
def test_credential_route(
    credential_id: int,
    current_user: dict = Depends(get_current_user)
):
    """Test credential connection"""
    result = test_credential(current_user["id"], credential_id)
    if not result["success"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result["message"]
        )
    return result
