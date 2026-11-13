import { useState, useRef, useEffect } from "react";
import { Settings, Send, Bot, User, LogOut } from "lucide-react";
import ChatMessage from "./components/ChatMessage";
import InputSection from "./components/InputSection";
import ToolsPopup from "./components/ToolsPopup";
import LoadingMessage from "./components/LoadingMessage";
import PlaybookEditor from "./components/PlaybookEditor";
import Login from "./components/Login";
import Vault from "./components/Vault";

function App() {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [currentPage, setCurrentPage] = useState('home'); // 'home' or 'vault'
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: "ai",
      content: `**Welcome to PlayGenie!**

Your AI assistant for Ansible automation and infrastructure management is here to help.

## What I can help you with:
• **Playbook creation** and optimization
• **Inventory management** and host grouping
• **Role development** and best practices
• **Troubleshooting** Ansible issues
• **Security** and compliance automation
• **CI/CD integration** with Ansible
• **Cloud provisioning** (AWS, Azure, GCP)

## Getting started:
1. Ask me any Ansible-related questions
2. Click the ⚙️ **tools icon** to explore specialized features
3. Try asking: *"How do I create a playbook to install nginx?"*

Let's automate your infrastructure! 🚀`,
      timestamp: Date.now(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [showTools, setShowTools] = useState(false);
  const [selectedTool, setSelectedTool] = useState("general");
  const [isLoading, setIsLoading] = useState(false);
  const [currentMenu, setCurrentMenu] = useState("main");
  const [playbook, setPlaybook] = useState("");
  const [isGeneratingPlaybook, setIsGeneratingPlaybook] = useState(false);
  const [isExecutingPlaybook, setIsExecutingPlaybook] = useState(false);
  const chatEndRef = useRef(null);

  const mainTools = [
    {
      id: "general",
      name: "General Chat",
      icon: "💬",
      description: "General Ansible assistance and automation guidance",
    },
    {
      id: "ansible-automation",
      name: "Ansible Automation",
      icon: "⚙️",
      description: "Infrastructure automation and configuration management",
    },
  ];

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Check authentication on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    if (token && user) {
      setIsAuthenticated(true);
      setCurrentUser(JSON.parse(user));
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleLogin = (user) => {
    setIsAuthenticated(true);
    setCurrentUser(user);
    setCurrentPage('home'); // Navigate to home after login
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setCurrentUser(null);
    setMessages([{
      id: 1,
      type: "ai",
      content: `**Welcome to PlayGenie!**

Your AI assistant for Ansible automation and infrastructure management is here to help.

## What I can help you with:
• **Playbook creation** and optimization
• **Inventory management** and host grouping
• **Role development** and best practices
• **Troubleshooting** Ansible issues
• **Security** and compliance automation
• **CI/CD integration** with Ansible
• **Cloud provisioning** (AWS, Azure, GCP)

## Getting started:
1. Ask me any Ansible-related questions
2. Click the ⚙️ **tools icon** to explore specialized features
3. Try asking: *"How do I create a playbook to install nginx?"*

Let's automate your infrastructure! 🚀`,
      timestamp: Date.now(),
    }]);
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = inputValue;
    const newMessage = {
      id: Date.now(),
      type: "user",
      content: userMessage,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputValue("");
    setIsLoading(true);

    // Handle different tools
    if (selectedTool === 'ansible-automation') {
      await handlePlaybookGeneration(userMessage);
    } else {
      await handleGeneralChat(userMessage);
    }
  };

  const handleGeneralChat = async (userMessage) => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: userMessage
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      const aiMessage = {
        id: Date.now() + 1,
        type: "ai",
        content: data.answer,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error calling API:', error);
      const errorMessage = {
        id: Date.now() + 1,
        type: "ai",
        content: `Sorry, I encountered an error: ${error.message}. Please make sure the backend server is running on http://127.0.0.1:8000`,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlaybookGeneration = async (taskDescription) => {
    setIsGeneratingPlaybook(true);
    setPlaybook(""); // Clear previous playbook immediately
    
    try {
      const response = await fetch('http://127.0.0.1:8000/api/playbook/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          task_description: taskDescription
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setPlaybook(data.playbook);
        const attemptsText = data.attempts > 1 ? ` (after ${data.attempts} attempts)` : '';
        const warningsText = data.warnings && data.warnings.length > 0 
          ? `\n\n⚠️ **Warnings:** ${data.warnings.length} warning(s) found`
          : '';
        
        const successMessage = {
          id: Date.now() + 1,
          type: "ai",
          content: `🎉 **Playbook Generated Successfully!**${attemptsText}

I've created an Ansible playbook for your task: *"${taskDescription}"*${warningsText}

The playbook has been generated and is ready for editing. You can:
• **Edit the code** in the editor below
• **Execute the playbook** when ready
• **Download** or **copy** the playbook

**File saved to:** \`${data.file_path}\``,
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, successMessage]);
      } else {
        // Check if user action is required (validation failed after retries)
        if (data.user_action_required && data.playbook) {
          // Still show the playbook in editor so user can fix it
          setPlaybook(data.playbook);
          
          const errorsList = data.errors.map(err => `• ${err}`).join('\n');
          const attemptsInfo = data.attempts ? `\n\n**Attempts:** ${data.attempts} validation attempts were made.` : '';
          
          const errorMessage = {
            id: Date.now() + 1,
            type: "ai",
            content: `❌ **Validation Failed After ${data.attempts || 3} Attempts**

${data.message}

**Validation Errors:**
${errorsList}${attemptsInfo}

**What you can do:**
• **Edit the playbook** in the code editor below to fix the errors
• **Execute** the playbook once you've fixed the errors
• **Try again** with a new request

The playbook is shown in the editor below for your review and manual fixes.`,
            timestamp: Date.now(),
          };
          setMessages((prev) => [...prev, errorMessage]);
        } else {
          // Complete failure - no playbook to show
          throw new Error(data.message);
        }
      }
    } catch (error) {
      console.error('Error generating playbook:', error);
      const errorMessage = {
        id: Date.now() + 1,
        type: "ai",
        content: `❌ **Error generating playbook**

Sorry, I encountered an error: ${error.message}

Please try rephrasing your request or check if the backend server is running.`,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsGeneratingPlaybook(false);
      setIsLoading(false);
    }
  };

  const handlePlaybookExecution = async (playbookContent) => {
    setIsExecutingPlaybook(true);
    try {
      const response = await fetch('http://127.0.0.1:8000/api/playbook/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          playbook_content: playbookContent
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      const executionMessage = {
        id: Date.now(),
        type: "ai",
        content: `🚀 **Playbook Execution Complete!**

**Execution Summary:**
• ✅ Status: ${data.success ? 'Success' : 'Failed'}
• 📝 Message: ${data.message}
• 📊 Output: ${data.output || 'No output available'}
${data.error ? `• ❌ Error: ${data.error}` : ''}

The playbook has been processed by the backend server.`,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, executionMessage]);
    } catch (error) {
      console.error('Error executing playbook:', error);
      const errorMessage = {
        id: Date.now(),
        type: "ai",
        content: `❌ **Playbook Execution Failed**

Error: ${error.message}

Please check your playbook syntax and make sure the backend server is running on http://127.0.0.1:8000`,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsExecutingPlaybook(false);
    }
  };

  const handleGenerateNewPlaybook = () => {
    setPlaybook("");
    setMessages((prev) => [...prev, {
      id: Date.now(),
      type: "ai",
      content: `🔄 **Ready for new playbook generation**

Please describe the task you want to automate, and I'll generate a new Ansible playbook for you!`,
      timestamp: Date.now(),
    }]);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleToolSelect = (toolId) => {
    // Clear chat history when switching to a different tool
    if (toolId !== selectedTool) {
      clearChatForNewTool(toolId);
      setPlaybook(""); // Clear playbook when switching tools
    }
    setSelectedTool(toolId);
    setShowTools(false);
    setCurrentMenu("main");
  };

  const clearChatForNewTool = (newTool) => {
    // Get welcome message for the new tool
    const welcomeMessage = getWelcomeMessageForTool(newTool);

    // Clear chat and set new welcome message
    setMessages([
      {
        id: Date.now(),
        type: "ai",
        content: welcomeMessage,
        timestamp: Date.now(),
      },
    ]);
  };

  const getWelcomeMessageForTool = (tool) => {
    const welcomeMessages = {
      general: `# 👋 Welcome to PlayGenie!

Your AI assistant for Ansible automation and infrastructure management is here to help.

## What I can help you with:
• **Playbook creation** and optimization
• **Inventory management** and host grouping
• **Role development** and best practices
• **Troubleshooting** Ansible issues
• **Security** and compliance automation
• **CI/CD integration** with Ansible
• **Cloud provisioning** (AWS, Azure, GCP)

## Getting started:
1. Ask me any Ansible-related questions
2. Click the ⚙️ **tools icon** to explore specialized features
3. Try asking: *"How do I create a playbook to install nginx?"*

Let's automate your infrastructure! 🚀`,

      "ansible-automation": `# ⚙️ Ansible Automation Agent

I'm your **magical automation wizard**! Just describe what you want to automate, and I'll write the perfect Ansible playbook and execute it for you.

##  How the magic works:

1. **You describe your task** - Tell me what you want to automate
2. **I write the playbook** - I'll create the perfect Ansible playbook for your needs
3. **I run it automatically** - The playbook executes and you get the results
4. **You see the magic** - Watch your infrastructure transform!

## 🎯 What you can automate:

### **Server Management**
• *"Install nginx on all web servers"*
• *"Create user accounts for my team"*
• *"Configure firewall rules for production"*
• *"Set up SSL certificates on all domains"*

### **Application Deployment**
• *"Deploy my Node.js app to staging"*
• *"Update my Python application on all servers"*
• *"Rollback the last deployment"*
• *"Scale my application to 5 instances"*


## 🚀 Just tell me what you want:

**Example requests:**
• \`Install httpd on my web server\`
• \`Setup firewall config on remote\`


**I'll handle the rest!** ✨🤖

*No need to write playbooks yourself - just describe your automation needs and watch the magic happen!*`,
    };

    return welcomeMessages[tool] || welcomeMessages["general"];
  };

  // Show login/register if not authenticated
  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  // Show vault page if authenticated and on vault page
  if (currentPage === 'vault') {
    return <Vault onBack={() => setCurrentPage('home')} currentUser={currentUser} />;
  }

  return (
    <div className="h-screen bg-qe-bg-primary text-qe-text-primary overflow-hidden">
      {/* Header */}
      <header className="w-full bg-qe-bg-primary border-b border-qe-border shadow-lg">
        <div className="h-16 px-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-qe-primary rounded-lg flex items-center justify-center">
              <Settings className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-lg font-medium text-qe-text-primary tracking-tight">
              PlayGenie
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            {currentUser && (
              <span className="text-sm text-qe-text-secondary">
                {currentUser.username}
              </span>
            )}
            <button
              onClick={() => setCurrentPage('vault')}
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-qe-text-secondary hover:text-qe-text-primary hover:bg-qe-bg-secondary rounded-lg transition-colors"
            >
              <User className="w-4 h-4" />
              Vault
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-qe-text-secondary hover:text-qe-text-primary hover:bg-qe-bg-secondary rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative h-[calc(100vh-4rem)]">
        {/* Chat Container - with bottom padding for fixed input */}
        <div className="h-full overflow-hidden pb-24">
          <div className="max-w-4xl mx-auto px-4 h-full">
            <div className="h-full overflow-y-auto chat-scrollbar py-8 space-y-8">
              {messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}
              {isLoading && <LoadingMessage />}
              
              {/* Playbook Editor - Show only for Ansible Automation tool when playbook exists */}
              {selectedTool === 'ansible-automation' && playbook && (
                <div className="max-w-6xl mx-auto">
                  <PlaybookEditor
                    playbook={playbook}
                    onExecute={handlePlaybookExecution}
                    onGenerateNew={handleGenerateNewPlaybook}
                    isLoading={isGeneratingPlaybook}
                    isExecuting={isExecutingPlaybook}
                  />
                </div>
              )}
              
              <div ref={chatEndRef} />
            </div>
          </div>
        </div>

        {/* Fixed Input Section */}
        <div className="fixed bottom-0 left-0 right-0 border-t border-qe-border bg-qe-bg-primary">
          <div className="max-w-4xl mx-auto px-4 py-4 relative">
            <InputSection
              value={inputValue}
              onChange={setInputValue}
              onSend={handleSendMessage}
              onKeyPress={handleKeyPress}
              onToolsClick={() => {
                setShowTools(!showTools);
                if (!showTools) setCurrentMenu("main");
              }}
              selectedTool={selectedTool}
              tools={mainTools}
              isLoading={isLoading}
            />

            {showTools && (
              <ToolsPopup
                tools={mainTools}
                onToolSelect={handleToolSelect}
                onClose={() => {
                  setShowTools(false);
                  setCurrentMenu("main");
                }}
                selectedTool={selectedTool}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
