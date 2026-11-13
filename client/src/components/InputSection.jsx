import { Send, Settings } from 'lucide-react'

const InputSection = ({ 
  value, 
  onChange, 
  onSend, 
  onKeyPress, 
  onToolsClick, 
  selectedTool, 
  tools,
  isLoading
}) => {
  const currentTool = tools.find(tool => tool.id === selectedTool)

  return (
    <div className="relative">
      <div className="flex items-center bg-qe-bg-secondary border border-qe-border rounded-lg focus-within:border-qe-primary transition-colors">
        {/* Tools Icon */}
        <button
          onClick={onToolsClick}
          className="flex-shrink-0 p-3 text-qe-text-muted hover:text-qe-primary transition-colors"
          title="Select Tool"
        >
          <Settings className="w-5 h-5" />
        </button>


        {/* Text Input */}
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyPress={onKeyPress}
          placeholder={isLoading ? "Thinking..." : selectedTool === 'ansible-automation' ? "Describe the task you want to automate..." : "Type your message..."}
          disabled={isLoading}
          className="flex-1 bg-transparent border-none outline-none text-qe-text-primary placeholder-qe-text-muted px-2 py-3 text-[15px] font-normal disabled:opacity-50"
        />

        {/* Send Button */}
        <button
          onClick={onSend}
          disabled={!value.trim() || isLoading}
          className={`flex-shrink-0 p-3 rounded-r-lg transition-colors ${
            value.trim() && !isLoading
              ? 'text-qe-primary hover:text-qe-primary-light cursor-pointer'
              : 'text-qe-text-muted cursor-not-allowed opacity-50'
          }`}
          title={isLoading ? "Thinking..." : "Send Message"}
        >
          <Send className="w-5 h-5" />
        </button>
      </div>

      {/* Selected Tool Indicator */}
      {selectedTool !== 'general' && (
        <div className="mt-2 flex items-center space-x-2 text-[13px] text-qe-text-muted font-normal">
          <span>{currentTool?.icon}</span>
          <span>Using {currentTool?.name}</span>
        </div>
      )}
    </div>
  )
}

export default InputSection
