import { useState } from 'react'
import './Login.css'

interface LoginProps {
  onLogin: (username: string) => void
}

export default function Login({ onLogin }: LoginProps) {
  const [username, setUsername] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (username.trim()) {
      onLogin(username.trim())
    }
  }

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>🔐 E2E Chat</h1>
        <p className="subtitle">End-to-end encrypted messaging</p>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="username-input"
            autoFocus
          />
          <button type="submit" className="login-button">
            Start Chatting
          </button>
        </form>
      </div>
    </div>
  )
}

