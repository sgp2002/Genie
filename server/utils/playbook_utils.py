# system imports
import re
import os
import yaml
from datetime import datetime
import uuid
from pathlib import Path
from typing import Dict, List, Tuple, Optional

BASE_DIR = Path(__file__).resolve().parent
CURRENT_PLAYBOOK_DIR = BASE_DIR / "ansible" / "current_playbook.yml"


class ValidationResult:
    """Result of playbook validation"""
    def __init__(self, is_valid: bool, errors: List[str] = None, warnings: List[str] = None, cleaned_content: str = ""):
        self.is_valid = is_valid
        self.errors = errors or []
        self.warnings = warnings or []
        self.cleaned_content = cleaned_content
    
    def to_dict(self) -> Dict:
        return {
            "is_valid": self.is_valid,
            "errors": self.errors,
            "warnings": self.warnings,
            "cleaned_content": self.cleaned_content
        }


def clean_playbook(text: str) -> str:
    """
    Step 1: Content Sanitization
    Extract YAML content from markdown code blocks and remove artifacts
    """
    # Extract YAML content from code block if present
    pattern = r"```(?:yaml)?\s*(.*?)```"
    match = re.search(pattern, text, re.DOTALL)
    cleaned = match.group(1).strip() if match else text.strip()

    # Remove any accidental markdown artifacts or stray backticks/hyphens
    cleaned = re.sub(r"^`+\s*-*\s*`*", "", cleaned)  # removes starting ``` or ```
    cleaned = re.sub(r"`+$", "", cleaned)  # removes trailing ```
    cleaned = cleaned.strip()

    return cleaned


def validate_yaml_syntax(yaml_content: str) -> Tuple[bool, Optional[Dict], List[str]]:
    """
    Step 2: Validate YML Format
    Check YAML syntax validity and parse the content
    """
    errors = []
    parsed_data = None
    
    try:
        parsed_data = yaml.safe_load(yaml_content)
        if parsed_data is None:
            errors.append("YAML file is empty or contains no valid content")
            return False, None, errors
        return True, parsed_data, errors
    except yaml.YAMLError as e:
        errors.append(f"YAML syntax error: {str(e)}")
        return False, None, errors
    except Exception as e:
        errors.append(f"Unexpected error parsing YAML: {str(e)}")
        return False, None, errors


def validate_ansible_structure(parsed_data: Dict) -> Tuple[bool, List[str], List[str]]:
    """
    Step 3: Validate Ansible Structure
    Check if the YAML follows Ansible playbook structure
    """
    errors = []
    warnings = []
    
    if not isinstance(parsed_data, list):
        errors.append("Ansible playbook must be a list of plays")
        return False, errors, warnings
    
    if len(parsed_data) == 0:
        errors.append("Playbook is empty - no plays found")
        return False, errors, warnings
    
    # Validate each play in the playbook
    for idx, play in enumerate(parsed_data):
        if not isinstance(play, dict):
            errors.append(f"Play {idx + 1} must be a dictionary")
            continue
        
        # Check for required play keys
        if 'hosts' not in play and 'tasks' not in play:
            warnings.append(f"Play {idx + 1}: Missing 'hosts' or 'tasks' - may not be a valid play")
        
        # Validate tasks if present
        if 'tasks' in play:
            if not isinstance(play['tasks'], list):
                errors.append(f"Play {idx + 1}: 'tasks' must be a list")
            else:
                # Validate each task
                for task_idx, task in enumerate(play['tasks']):
                    if not isinstance(task, dict):
                        errors.append(f"Play {idx + 1}, Task {task_idx + 1}: Task must be a dictionary")
                    elif 'name' not in task and len(task) == 0:
                        warnings.append(f"Play {idx + 1}, Task {task_idx + 1}: Task has no 'name' or action")
    
    return len(errors) == 0, errors, warnings


def format_yaml(yaml_content: str) -> str:
    """
    Step 4: Format in YML Format
    Ensure consistent indentation and formatting
    """
    try:
        # Parse and re-dump to ensure proper formatting
        parsed = yaml.safe_load(yaml_content)
        if parsed is None:
            return yaml_content
        
        # Use default_flow_style=False for block style
        formatted = yaml.dump(
            parsed,
            default_flow_style=False,
            sort_keys=False,
            allow_unicode=True,
            indent=2,
            width=1000
        )
        return formatted
    except Exception:
        # If formatting fails, return original
        return yaml_content


def validate_playbook(raw_content: str) -> ValidationResult:
    """
    Complete validation pipeline for Ansible playbooks
    
    Steps:
    1. Content Sanitization - Extract YAML from markdown
    2. Validate YML Format - Check YAML syntax
    3. Validate Ansible Structure - Check Ansible playbook structure
    4. Format in YML Format - Ensure proper formatting
    5. Prepare in Proper Format - Final cleanup
    """
    errors = []
    warnings = []
    
    # Step 1: Content Sanitization
    cleaned_content = clean_playbook(raw_content)
    
    if not cleaned_content:
        return ValidationResult(
            is_valid=False,
            errors=["No content found after sanitization"],
            cleaned_content=""
        )
    
    # Step 2: Validate YAML Syntax
    is_valid_yaml, parsed_data, yaml_errors = validate_yaml_syntax(cleaned_content)
    errors.extend(yaml_errors)
    
    if not is_valid_yaml:
        return ValidationResult(
            is_valid=False,
            errors=errors,
            warnings=warnings,
            cleaned_content=cleaned_content
        )
    
    # Step 3: Validate Ansible Structure
    is_valid_ansible, ansible_errors, ansible_warnings = validate_ansible_structure(parsed_data)
    errors.extend(ansible_errors)
    warnings.extend(ansible_warnings)
    
    # Step 4: Format in YML Format
    formatted_content = format_yaml(cleaned_content)
    
    # Step 5: Prepare in Proper Format (final cleanup)
    final_content = formatted_content.strip()
    
    # Ensure it starts with --- if it's a playbook
    if not final_content.startswith('---'):
        final_content = '---\n' + final_content
    
    return ValidationResult(
        is_valid=is_valid_ansible and len(errors) == 0,
        errors=errors,
        warnings=warnings,
        cleaned_content=final_content
    )


def save_playbook(yaml_content: str, base_dir: str = "./playbooks/") -> str:
    """
    Save the generated playbook YAML to a file with a unique timestamp.
    Returns the path to the saved file.
    """
    os.makedirs(base_dir, exist_ok=True)

    # Unique filename using timestamp + random ID
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    unique_id = uuid.uuid4().hex[:6]
    filename = f"playbook_{timestamp}_{unique_id}.yml"

    file_path = os.path.join(base_dir, filename)
    with open(file_path, "w") as f:
        f.write(yaml_content)

    return file_path
