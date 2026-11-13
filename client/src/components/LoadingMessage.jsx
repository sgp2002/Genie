const LoadingMessage = () => {
  return (
    <div className="flex justify-start">
      <div className="max-w-4xl">
        <div className="bg-qe-bg-secondary rounded-xl px-4 py-3 border border-qe-border/50">
          <div className="flex items-center space-x-3">
            {/* Animated dots */}
            <div className="flex space-x-1 items-center h-6">
              <div 
                className="w-2 h-2 bg-qe-text-muted rounded-full opacity-60"
                style={{
                  animation: 'typing 1.4s infinite ease-in-out',
                  animationDelay: '0s'
                }}
              ></div>
              <div 
                className="w-2 h-2 bg-qe-text-muted rounded-full opacity-60"
                style={{
                  animation: 'typing 1.4s infinite ease-in-out',
                  animationDelay: '0.2s'
                }}
              ></div>
              <div 
                className="w-2 h-2 bg-qe-text-muted rounded-full opacity-60"
                style={{
                  animation: 'typing 1.4s infinite ease-in-out',
                  animationDelay: '0.4s'
                }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoadingMessage
