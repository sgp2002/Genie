# PlayGenie - AI-Powered Ansible Automation Platform

An intelligent automation platform that uses AI to generate, validate, and execute Ansible playbooks through a natural language interface.

## Overview

PlayGenie combines the power of Large Language Models (LLM) with Ansible automation to make infrastructure management as simple as having a conversation. Describe what you want to automate, and PlayGenie will generate, validate, and help you execute Ansible playbooks.

## Features

- AI-Powered Playbook Generation: Describe tasks in natural language, get Ansible playbooks
- Intelligent Validation: 5-step validation layer with automatic error fixing (3 retries)
- Code Editor: Professional Monaco editor for YAML editing
- Real-time Validation: Automatic retry with LLM-based error correction
- Chat Interface: Ask Ansible questions and get expert guidance
- Quick Execution: Save playbooks for immediate execution

## Architecture

The system consists of:

- Frontend: React application with Monaco code editor
- Backend: FastAPI server with LLM integration
- LLM: Ollama (local LLM) for AI-powered generation
- Validation: 5-step validation pipeline with retry mechanism

## Project Structure

```
PlayGenie/
├── client/              # React frontend application
├── server/              # FastAPI backend application
├── ARCHITECTURE.md      # Detailed system architecture
├── QUICK_START.md       # Setup and running instructions
└── README.md           # This file
```

## Quick Start

### Prerequisites

- Node.js 16+
- Python 3.9+
- Ollama installed and running
- Ansible (optional, for execution)

### Setup

1. Install Ollama and pull a model:
   ```bash
   ollama pull llama2
   ```

2. Setup Backend:
   ```bash
   cd server
   source ansible/bin/activate
   pip install -r requirements.txt
   # Create .env file with MODEL_NAME=llama2
   uvicorn main:app --reload --host 127.0.0.1 --port 8000
   ```

3. Setup Frontend:
   ```bash
   cd client
   npm install
   npm run dev
   ```

4. Access: Open `http://localhost:3000` in your browser

For detailed instructions, see [QUICK_START.md](./QUICK_START.md)

## Documentation

- [ARCHITECTURE.md](./ARCHITECTURE.md): Complete system architecture and design
- [QUICK_START.md](./QUICK_START.md): Step-by-step setup guide
- [server/README.md](./server/README.md): Backend documentation
- [client/README.md](./client/README.md): Frontend documentation
- [server/VALIDATION.md](./server/VALIDATION.md): Validation layer details
- [server/VALIDATION_EXPLAINED.md](./server/VALIDATION_EXPLAINED.md): 5-step validation explained

## Technology Stack

### Frontend
- React 18
- Vite
- Tailwind CSS
- Monaco Editor
- Lucide React

### Backend
- FastAPI
- Python 3.9+
- Ollama (LLM)
- PyYAML
- Ansible Runner

## Core Workflow

1. User describes task → Frontend sends to `/api/chat`
2. LLM generates playbook → Using system prompts
3. Validation layer → 5-step validation with 3-retry mechanism
4. Playbook displayed → In Monaco editor for editing
5. User executes → Saves to `ansible/current-playbook.yml`

## Security

- Local LLM processing (no external API calls)
- Environment variables for sensitive data
- Input validation on all endpoints
- CORS protection

## License

Built for Ansible automation enthusiasts

## Contributing

This is a specialized Ansible automation assistant. Contributions welcome!

---

**PlayGenie** - Making infrastructure automation as simple as having a conversation!
