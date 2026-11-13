import json
import os
import time
from pathlib import Path

from services.llm_services.llm_service import ask_question
from utils.playbook_utils import validate_playbook, save_playbook
from models.schemas import PlaybookExecutionResponse

BASE_DIR = Path(__file__).resolve().parent.parent.parent
PROMPT_PATH = BASE_DIR / "prompt_templates" / "prompt.json"
CURRENT_PLAYBOOK_PATH = BASE_DIR / "ansible" / "current_playbook.yml"

MAX_RETRIES = 3
BACKOFF_DELAY = 1  # seconds


def ask_llm_to_fix_playbook(original_task: str, playbook_content: str, errors: list, attempt: int) -> str:
    """
    Ask LLM to fix validation errors in the playbook
    """
    try:
        with open(PROMPT_PATH) as f:
            templates = json.load(f)
        
        errors_text = "\n".join([f"- {error}" for error in errors])
        
        prompt = templates["ansible_playbook_fix"]["template"].format(
            task_description=original_task,
            playbook_content=playbook_content,
            errors=errors_text,
            attempt=attempt
        )
        
        llm_ans = ask_question(prompt)
        return llm_ans["answer"]
    except Exception as e:
        raise Exception(f"Error asking LLM to fix playbook: {str(e)}")


def generate_playbook(request):
    """
    Generate Ansible playbook from task description with 3-retry validation
    """
    try:
        with open(PROMPT_PATH) as f:
            templates = json.load(f)
        
        # Initial generation
        prompt = templates["ansible_playbook"]["template"].format(
            task_description=request.task_description
        )
        llm_ans = ask_question(prompt)
        current_playbook = llm_ans["answer"]
        
        # Track all validation attempts
        all_attempt_errors = []
        attempt = 1
        
        # Retry loop with validation
        while attempt <= MAX_RETRIES:
            # Validate current playbook
            validation_result = validate_playbook(current_playbook)
            
            # If validation passes, return success
            if validation_result.is_valid:
                # Save validated playbook
                file_path = save_playbook(validation_result.cleaned_content)
                
                message = f"Playbook generated and validated successfully"
                if attempt > 1:
                    message += f" (after {attempt} attempt{'s' if attempt > 1 else ''})"
                if validation_result.warnings:
                    message += f" (warnings: {len(validation_result.warnings)})"
                
                return {
                    "playbook": validation_result.cleaned_content,
                    "file_path": file_path,
                    "success": True,
                    "message": message,
                    "warnings": validation_result.warnings,
                    "attempts": attempt
                }
            
            # Track errors for this attempt
            all_attempt_errors.append({
                "attempt": attempt,
                "errors": validation_result.errors,
                "warnings": validation_result.warnings
            })
            
            # If this is the last attempt, break and return errors
            if attempt >= MAX_RETRIES:
                break
            
            # Backoff delay before retry
            time.sleep(BACKOFF_DELAY * attempt)
            
            # Ask LLM to fix the playbook
            try:
                fixed_playbook = ask_llm_to_fix_playbook(
                    original_task=request.task_description,
                    playbook_content=current_playbook,
                    errors=validation_result.errors,
                    attempt=attempt + 1
                )
                current_playbook = fixed_playbook
            except Exception as e:
                # If LLM fix fails, break and return current errors
                return {
                    "playbook": validation_result.cleaned_content,
                    "file_path": "",
                    "success": False,
                    "message": f"Validation failed and LLM fix attempt {attempt + 1} failed: {str(e)}",
                    "errors": validation_result.errors,
                    "warnings": validation_result.warnings,
                    "attempts": attempt,
                    "all_attempt_errors": all_attempt_errors,
                    "user_action_required": True
                }
            
            attempt += 1
        
        # After 3 failed attempts, return errors to user
        final_errors = validation_result.errors
        all_errors_flat = []
        for attempt_data in all_attempt_errors:
            all_errors_flat.extend([f"Attempt {attempt_data['attempt']}: {err}" for err in attempt_data['errors']])
        
        return {
            "playbook": validation_result.cleaned_content,
            "file_path": "",
            "success": False,
            "message": f"Validation failed after {MAX_RETRIES} attempts. Please review the errors and fix manually in the code editor.",
            "errors": final_errors,
            "warnings": validation_result.warnings,
            "attempts": MAX_RETRIES,
            "all_attempt_errors": all_attempt_errors,
            "user_action_required": True
        }
        
    except Exception as e:
        return {
            "playbook": "",
            "file_path": "",
            "success": False,
            "message": f"Error generating playbook: {str(e)}",
            "attempts": 0
        }


def execute_playbook(request):
    """
    Execute Ansible playbook from frontend content
    """
    try:
        # Save the playbook content to ansible/current-playbook.yml
        file_path = CURRENT_PLAYBOOK_PATH

        # Ensure the directory exists
        os.makedirs(os.path.dirname(file_path), exist_ok=True)

        # Write the playbook content to the file
        with open(file_path, "w") as f:
            f.write(request.playbook_content)

        return PlaybookExecutionResponse(
            success=True,
            message="Playbook saved and ready for execution",
            output=f"Playbook saved to: {file_path}",
            error="",
        )
    except Exception as e:
        return PlaybookExecutionResponse(
            success=False,
            message=f"Error executing playbook: {str(e)}",
            output="",
            error=str(e),
        )
