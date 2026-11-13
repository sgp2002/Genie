import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

const ChatMessage = ({ message }) => {
  const isAI = message.type === 'ai'

  if (isAI) {
    // AI message - with markdown formatting
    return (
      <div className="flex justify-start">
        <div className="max-w-[85%] md:max-w-4xl">
          <div className="text-qe-text-primary text-[15px] leading-[1.6] font-normal break-words prose prose-invert prose-sm max-w-none">
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]}
              components={{
                // Custom styling for markdown elements
                p: ({children}) => <p className="mb-3 last:mb-0">{children}</p>,
                ul: ({children}) => <ul className="mb-3 ml-4 space-y-1">{children}</ul>,
                ol: ({children}) => <ol className="mb-3 ml-4 space-y-1">{children}</ol>,
                li: ({children}) => <li className="text-qe-text-primary">{children}</li>,
                strong: ({children}) => <strong className="font-semibold text-qe-text-primary">{children}</strong>,
                em: ({children}) => <em className="italic text-qe-text-secondary">{children}</em>,
                code: ({children}) => <code className="bg-qe-bg-tertiary px-1.5 py-0.5 rounded text-sm text-qe-accent-orange">{children}</code>,
                pre: ({children}) => <pre className="bg-qe-bg-tertiary p-3 rounded-lg overflow-x-auto text-sm mb-3">{children}</pre>,
                h1: ({children}) => <h1 className="text-lg font-semibold mb-2 text-qe-text-primary">{children}</h1>,
                h2: ({children}) => <h2 className="text-base font-semibold mb-2 text-qe-text-primary">{children}</h2>,
                h3: ({children}) => <h3 className="text-[15px] font-semibold mb-2 text-qe-text-primary">{children}</h3>,
              }}
            >
              {message.content}
            </ReactMarkdown>

          </div>
        </div>
      </div>
    )
  }

  // User message - with border like ChatGPT, constrained width
  return (
    <div className="flex justify-end">
      <div className="max-w-[75%] md:max-w-2xl">
        <div className="bg-qe-bg-secondary border border-qe-border/50 rounded-xl px-4 py-3">
          <div className="text-qe-text-primary text-[15px] leading-[1.6] font-normal break-words">
            {message.content}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChatMessage
