# PlayGenie Server - AI-Powered Ansible Automation Backend

A FastAPI-based backend server that powers the PlayGenie frontend application. This server provides AI-driven Ansible automation capabilities through local LLM integration and automated playbook execution.

##  Tech Stack

- **FastAPI** - Modern, fast web framework for building APIs
- **Python 3.9** - Core programming language
- **Ansible Runner** - Execute Ansible playbooks programmatically
- **Ollama** - Local LLM integration for AI responses
- **Pydantic** - Data validation and settings management
- **Uvicorn** - ASGI server for FastAPI
- **Python-dotenv** - Environment variable management

##  Getting Started

### Prerequisites

- **Python 3.9+** installed
- **Ollama** installed and running locally
- **Ansible** installed (for playbook execution)

### Installation

```bash
# Navigate to server directory
cd server

# Create virtual environment
python -m venv ansible

# Activate virtual environment
# On macOS/Linux:
source ansible/bin/activate
# On Windows:
# ansible\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration
```

### Environment Configuration

Create a `.env` file with the following variables:

```env
# Ollama Configuration
MODEL_NAME=llama2  # or your preferred model
OLLAMA_HOST=http://localhost:11434

# Ansible Configuration
ANSIBLE_HOST_KEY_CHECKING=False
ANSIBLE_INVENTORY=./inventory
ANSIBLE_PLAYBOOKS_DIR=./playbooks

# Server Configuration
HOST=0.0.0.0
PORT=5000
DEBUG=True
```

### Running the Server

```bash
# Development mode with auto-reload
uvicorn main:app --reload --host 0.0.0.0 --port 5000

# Production mode
uvicorn main:app --host 0.0.0.0 --port 5000

# Using Python directly
python main.py
```

The server will be available at `http://localhost:5000`

##  Project Structure

```
server/
├── ansible/                    # Virtual environment
├── playbooks/                  # Generated and stored playbooks
├── prompt_templates/           # AI prompt templates
│   └── prompt.json           # System prompts for different tasks
├── services/                   # Service modules
│   └── llm_service.py        # LLM integration service
├── main.py                    # FastAPI application entry point
├── requirements.txt           # Python dependencies
└── README.md                  # This file
```

##  API Endpoints

### Core Endpoints

#### `GET /`
- **Description**: Health check endpoint
- **Response**: `"Hello home page"`
- **Usage**: Verify server is running

#### `GET /ask`
- **Description**: Ask Ansible-related questions
- **Response**: AI-generated answer about Ansible
- **Usage**: General Ansible guidance and troubleshooting



##  AI Integration

### Ollama Integration

The server uses Ollama for local LLM inference:

```python
# Example usage in llm_service.py
def ask_general_question(question):
    model_name = os.getenv("MODEL_NAME")
    result = subprocess.run(
        ["ollama", "run", model_name, question],
        capture_output=True,
        text=True,
        check=True
    )
    return {"answer": result.stdout.strip()}
```

### Prompt Templates

System prompts are stored in `prompt_templates/prompt.json`:

```json
{
  "ansible_question": {
    "role": "system",
    "description": "Answer Ansible questions concisely",
    "template": "You are an expert Ansible engineer.\nAnswer the user's question step by step:\nQuestion: {question}"
  },
  "ansible_playbook": {
    "role": "system", 
    "description": "Generate Ansible playbooks from task descriptions",
    "template": "You are an expert Ansible engineer.\nGenerate a YAML playbook for:\nTask: {task_description}"
  }
}
```


### Development

```bash
# Start with auto-reload
uvicorn main:app --reload --host 0.0.0.0 --port 5000
```

### Production

```bash
# Build and run with Gunicorn
pip install gunicorn
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:5000
```

## Validation Layer

PlayGenie includes a comprehensive 5-step validation pipeline that ensures all LLM-generated playbooks are valid, properly formatted, and ready for execution.

### Overview

The validation layer processes raw LLM output through a series of checks and transformations to produce production-ready Ansible playbooks. If validation fails, the system automatically retries with the LLM up to 3 times with exponential backoff.

### 5-Step Validation Process

#### Step 1: Content Sanitization
- Extracts YAML content from markdown code blocks
- Removes markdown artifacts (backticks, code markers)
- Strips explanatory text and whitespace
- **Function**: `clean_playbook(text: str) -> str`

#### Step 2: YAML Syntax Validation
- Validates YAML syntax using PyYAML
- Checks for proper indentation, brackets, and quotes
- Ensures content is parseable and non-empty
- **Function**: `validate_yaml_syntax(yaml_content: str) -> Tuple[bool, Optional[Dict], List[str]]`

#### Step 3: Ansible Structure Validation
- Verifies playbook is a list (not a single dictionary)
- Validates each play has proper structure (hosts, tasks)
- Checks tasks are properly formatted lists of dictionaries
- Provides warnings for missing optional keys
- **Function**: `validate_ansible_structure(parsed_data: Dict) -> Tuple[bool, List[str], List[str]]`

#### Step 4: YAML Formatting
- Standardizes indentation (2 spaces)
- Applies consistent block style formatting
- Preserves key order and structure
- **Function**: `format_yaml(yaml_content: str) -> str`

#### Step 5: Final Preparation
- Strips trailing/leading whitespace
- Ensures playbook starts with `---` (YAML document marker)
- Final validation pass
- **Function**: Part of `validate_playbook()`

### Retry Mechanism

If validation fails, the system automatically:

1. **Attempts 1-3**: Requests LLM to fix the playbook with specific error messages
2. **Backoff Strategy**: 1s, 2s, 3s delays between retries
3. **After 3 failures**: Returns validation errors to user for manual editing


##  Configuration

### FastAPI Settings

- **Title**: "PlayGenie"
- **Auto Documentation**: Available at `/docs` and `/redoc`
- **CORS**: Configured for frontend integration


## Contributing

1. **Fork the repository**
2. **Create a feature branch**
3. **Add your changes**
4. **Test thoroughly**
5. **Submit a pull request**




