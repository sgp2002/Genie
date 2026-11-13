import { useState, useEffect } from 'react'
import Editor from '@monaco-editor/react'
import { Play, Download, Copy, RotateCcw } from 'lucide-react'

const PlaybookEditor = ({ 
  playbook, 
  onExecute, 
  onGenerateNew, 
  isLoading = false,
  isExecuting = false 
}) => {
  const [editorValue, setEditorValue] = useState(playbook || '')

  // Update editor value when playbook prop changes
  useEffect(() => {
    setEditorValue(playbook || '')
  }, [playbook])

  const handleEditorChange = (value) => {
    setEditorValue(value || '')
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(editorValue)
  }

  const handleDownload = () => {
    const blob = new Blob([editorValue], { type: 'text/yaml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'playbook.yml'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleExecute = () => {
    if (onExecute) {
      onExecute(editorValue)
    }
  }

  return (
    <div className="bg-qe-bg-secondary border border-qe-border rounded-lg overflow-hidden">
      {/* Editor Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-qe-border bg-qe-bg-tertiary">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-qe-primary rounded-full"></div>
          <span className="text-qe-text-primary text-sm font-medium">playbook.yml</span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleCopy}
            className="p-2 text-qe-text-muted hover:text-qe-text-primary hover:bg-qe-bg-secondary rounded transition-colors"
            title="Copy to clipboard"
          >
            <Copy className="w-4 h-4" />
          </button>
          <button
            onClick={handleDownload}
            className="p-2 text-qe-text-muted hover:text-qe-text-primary hover:bg-qe-bg-secondary rounded transition-colors"
            title="Download playbook"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={onGenerateNew}
            disabled={isLoading}
            className="p-2 text-qe-text-muted hover:text-qe-text-primary hover:bg-qe-bg-secondary rounded transition-colors disabled:opacity-50"
            title="Generate new playbook"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Monaco Editor */}
      <div className="h-96">
        {isLoading ? (
          <div className="h-full flex items-center justify-center bg-qe-bg-secondary">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-qe-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-qe-text-muted">Generating playbook...</p>
            </div>
          </div>
        ) : (
          <Editor
            height="100%"
            defaultLanguage="yaml"
            value={editorValue}
            onChange={handleEditorChange}
            theme="vs-dark"
            options={{
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              fontSize: 14,
              lineNumbers: 'on',
              wordWrap: 'on',
              automaticLayout: true,
              tabSize: 2,
              insertSpaces: true,
              renderWhitespace: 'boundary',
              fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace"
            }}
          />
        )}
      </div>

      {/* Execute Button */}
      <div className="px-4 py-3 border-t border-qe-border bg-qe-bg-tertiary">
        <button
          onClick={handleExecute}
          disabled={!editorValue.trim() || isExecuting}
          className="w-full flex items-center justify-center space-x-2 bg-qe-primary hover:bg-qe-primary-dark disabled:bg-qe-bg-secondary disabled:text-qe-text-muted text-white px-4 py-2 rounded-lg transition-colors font-medium"
        >
          {isExecuting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Executing...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              <span>Execute Playbook</span>
            </>
          )}
        </button>
      </div>
    </div>
  )
}

export default PlaybookEditor
