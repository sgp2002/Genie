# PlayGenie - AI-Powered Ansible Automation Assistant

A modern React-based frontend application for Ansible automation and infrastructure management. PlayGenie provides an intuitive chat interface to help you automate your infrastructure tasks through natural language descriptions.

##  Tech Stack

- **React 18** - Modern UI framework
- **Vite** - Lightning-fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework with Typography plugin
- **Lucide React** - Beautiful icon library
- **React Markdown** - Rich markdown rendering for AI responses
- **Remark GFM** - GitHub Flavored Markdown support

##  Getting Started

```bash
# Install dependencies
npm install

# Configure environment variables (copy and edit)
cp config.env.example .env

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The application will be available at `http://localhost:3000` (or next available port).

##  Features

###  **AI-Powered Automation**
- **Natural Language Interface** - Describe what you want to automate in plain English
- **Automatic Playbook Generation** - AI writes and executes Ansible playbooks for you
- **Real-time Results** - See your infrastructure transform as automation runs

###  **Modern Interface**
- **Dark Mode Design** - Professional, developer-friendly interface
- **ChatGPT-like Experience** - Familiar conversation-based interaction
- **Responsive Design** - Works seamlessly on desktop, tablet, and mobile
- **Smooth Animations** - Modern transitions and micro-interactions

###  **Specialized Tools**
- **General Chat** - Get help with Ansible concepts, best practices, and troubleshooting
- **Ansible Automation Agent** - Describe tasks and get automatic playbook execution

##  Available Tools

###  **General Chat**
- Ansible learning and guidance
- Best practices and troubleshooting
- Concept explanations and examples
- Framework recommendations

###  **Ansible Automation Agent**
- **Task Description** - Tell the AI what you want to automate
- **Automatic Playbook Creation** - AI writes the perfect playbook
- **Execution** - Playbooks run automatically
- **Results** - See your infrastructure transform

**Example Automation Tasks:**
- "Install nginx on all web servers"
- "Deploy my Node.js app to staging"
- "Set up monitoring on all servers"
- "Create automated backups"
- "Configure SSL certificates"


##  Project Structure

```
client/
├── src/
│   ├── components/          # React components
│   │   ├── ChatMessage.jsx     # Chat message rendering
│   │   ├── InputSection.jsx    # Input with tools selector
│   │   ├── LoadingMessage.jsx  # Loading animation
│   │   └── ToolsPopup.jsx      # Tools selection overlay
│   ├── App.jsx             # Main application component
│   ├── main.jsx            # React entry point
│   └── index.css           # Global styles & animations
├── public/                 # Static assets
├── index.html             # HTML template
├── vite.config.js         # Vite configuration
├── tailwind.config.js     # Tailwind configuration
└── package.json           # Dependencies
```

##  Configuration

- **Vite**: Fast development server (auto-detects available ports)
- **Tailwind**: Custom PlayGenie color palette and utilities
- **ESLint**: Code linting with React rules
- **PostCSS**: CSS processing and optimization

##  Deployment

```bash
# Build production bundle
npm run build

# Serve built files locally
npm run preview

# Deploy dist/ folder to your hosting provider
```

##  How It Works

1. **Describe Your Task** - Tell PlayGenie what you want to automate
2. **AI Creates Playbook** - The system writes the perfect Ansible playbook
3. **Automatic Execution** - Playbooks run on your infrastructure
4. **See Results** - Watch your automation transform your systems

##  Contributing

This is a specialized Ansible automation assistant. The interface is designed to be intuitive and focused on infrastructure automation tasks.

