from fastapi import APIRouter

from services.playbook_services.playbook_services import (
    generate_playbook,
    execute_playbook,
)
from models.schemas import PlaybookRequest
from models.schemas import PlaybookExecutionRequest


router = APIRouter(tags=["Playbook"])


@router.post(
    "/generate",
)
def generate_playbook_route(request: PlaybookRequest):
    return generate_playbook(request)


@router.post("/execute")
def execute_playbook_route(request: PlaybookExecutionRequest):
    return execute_playbook(request)
