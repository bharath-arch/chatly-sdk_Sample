import { useState, KeyboardEvent } from 'react'
import './MessageInput.css'

interface MessageInputProps {
  onSend: (message: string) => void
  isWsConnected: boolean
}

export default function MessageInput({ onSend, isWsConnected }: MessageInputProps) {
  const [message, setMessage] = useState('')

  const handleSend = () => {
    if (message.trim() && isWsConnected) {
      onSend(message.trim())
      setMessage('')
    }
  }

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="message-input-container">
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder={isWsConnected ? "Type a message..." : "Connecting..."}
        className="message-input"
        rows={1}
        disabled={!isWsConnected}
      />
      <button onClick={handleSend} className="send-button" disabled={!message.trim() || !isWsConnected}>
        Send
      </button>
    </div>
  )
}

