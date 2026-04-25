"use client"
import { useState, useRef, useEffect } from "react"
import type { ChatMessage } from "@/lib/types"
import ReactMarkdown from "react-markdown"

interface Props {
  messages: ChatMessage[]
  onSend: (answer: string) => void
  isWaiting: boolean
}

export default function ChatInterface({ messages, onSend, isWaiting }: Props) {
  const [input, setInput] = useState("")
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSend = () => {
    if (!input.trim() || isWaiting) return
    onSend(input)
    setInput("")
  }

  const renderAgentMessage = (content: string) => {
    const lines = content.split('\n')
    const options: string[] = []
    const mainText: string[] = []
    
    const optionRegex = /^[-*]?\s*([A-D])[\)\.]\s+(.*)/i;
    
    for (const line of lines) {
      const match = line.trim().match(optionRegex)
      if (match) {
        options.push(line.trim())
      } else {
        mainText.push(line)
      }
    }
    
    return (
      <div className="space-y-4">
        <div className="prose prose-invert max-w-none text-sm font-sans">
          <ReactMarkdown>{mainText.join('\n')}</ReactMarkdown>
        </div>
        {options.length > 0 && (
          <div className="flex flex-col space-y-2 mt-4">
            {options.map((opt, i) => {
              const cleanOpt = opt.replace(/^[-*]?\s*/, '')
              const match = cleanOpt.match(/^([A-D])[\)\.]/i)
              const letter = match ? match[1] : cleanOpt
              return (
                <button
                  key={i}
                  onClick={() => {
                    if (!isWaiting) onSend(letter.toUpperCase())
                  }}
                  disabled={isWaiting}
                  className="text-left p-3 rounded-lg border border-border bg-surface hover:border-accent hover:bg-accent/5 transition-colors text-sm font-mono text-text disabled:opacity-50 disabled:cursor-not-allowed text-wrap break-words"
                >
                  {cleanOpt}
                </button>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-surface border-l border-border">
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            {m.role === "agent" && (
              <div className="w-8 h-8 rounded-full bg-accent text-background flex items-center justify-center font-bold mr-3 shrink-0">SF</div>
            )}
            
            {m.role === "challenge" ? (
              <div className="w-full bg-background border border-red-500/30 rounded-lg p-4">
                <div className="text-red-400 font-mono text-sm mb-2 font-bold uppercase">Challenge</div>
                <div className="prose prose-invert max-w-none text-sm font-sans">
                  <ReactMarkdown>{m.content}</ReactMarkdown>
                </div>
                <div className="mt-4 text-xs text-muted">Submit your answer below</div>
              </div>
            ) : m.role === "system" ? (
              <div className="w-full text-center text-muted text-xs italic">{m.content}</div>
            ) : m.role === "user" ? (
              <div className="max-w-[80%] p-4 rounded-xl text-sm bg-accent/10 text-accent ml-12">
                <ReactMarkdown>{m.content}</ReactMarkdown>
              </div>
            ) : (
              <div className="max-w-[80%] p-4 rounded-xl text-sm bg-background text-text border border-border/50 shadow-sm">
                {renderAgentMessage(m.content)}
              </div>
            )}
          </div>
        ))}
        {isWaiting && (
          <div className="flex justify-start items-center space-x-2 text-muted mt-4">
             <div className="w-8 h-8 rounded-full bg-accent text-background flex items-center justify-center font-bold mr-3 shrink-0">SF</div>
             <div className="flex space-x-1">
               <div className="w-2 h-2 bg-muted rounded-full animate-bounce"></div>
               <div className="w-2 h-2 bg-muted rounded-full animate-bounce" style={{animationDelay: "0.2s"}}></div>
               <div className="w-2 h-2 bg-muted rounded-full animate-bounce" style={{animationDelay: "0.4s"}}></div>
             </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div className="p-4 border-t border-border bg-background">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault()
              handleSend()
            }
          }}
          disabled={isWaiting}
          placeholder="Type your answer..."
          className="w-full bg-surface border border-border rounded-lg p-3 text-text focus:outline-none focus:border-accent resize-none disabled:opacity-50"
          rows={3}
        />
        <div className="flex justify-end mt-2">
          <button
            onClick={handleSend}
            disabled={isWaiting || !input.trim()}
            className="bg-accent text-background px-4 py-2 rounded font-mono text-sm font-bold disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  )
}
