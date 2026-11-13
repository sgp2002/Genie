import json
from fastapi import APIRouter

from models.schemas import UserRequest
from services.llm_services.llm_service import ask_question


router = APIRouter(tags=["Chat"])


@router.post("/chat")
def ask_general_question(request: UserRequest):
    """
    Receive a user question and send it to LLM
    """
    try:
        with open("./prompt_templates/prompt.json") as f:
            templates = json.load(f)
        prompt = templates["ansible_question"]["template"].format(
            question=request.question
        )
        llm_ans = ask_question(prompt)
        return llm_ans
    except Exception as e:
        return {"answer": f"Error processing your question: {str(e)}"}
