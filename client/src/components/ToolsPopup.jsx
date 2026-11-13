import { useEffect, useRef } from 'react'
import { Check } from 'lucide-react'

const ToolsPopup = ({ tools, onToolSelect, onClose, selectedTool }) => {
  const popupRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        onClose()
      }
    }

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [onClose])

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/20 z-40" />
      
      {/* Popup */}
      <div
        ref={popupRef}
        className="absolute bottom-full left-0 mb-2 w-64 bg-qe-bg-secondary border border-qe-border rounded-lg shadow-2xl z-50 fade-in"
      >
        <div className="py-1.5">
          {tools.map((tool) => (
            <button
              key={tool.id}
              onClick={() => onToolSelect(tool.id)}
              className="w-full px-3 py-2.5 text-left hover:bg-qe-bg-tertiary transition-colors flex items-center justify-between group"
            >
              <div className="flex items-center space-x-2.5">
                <span className="text-base">{tool.icon}</span>
                <div>
                  <div className="text-qe-text-primary text-[14px] font-medium">{tool.name}</div>
                  <div className="text-qe-text-muted text-[12px] font-normal">{tool.description}</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {selectedTool === tool.id && (
                  <Check className="w-4 h-4 text-qe-primary" />
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    </>
  )
}

export default ToolsPopup
