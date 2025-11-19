import { useState, useEffect } from 'react'
import { ChatSDK } from 'chatly-sdk'
import { WebSocketTransport } from './adapters/websocketTransport'
import Login from './components/Login'
import ChatView from './components/ChatView'
import './App.css'

function App() {
  const [sdk, setSdk] = useState<ChatSDK | null>(null)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isWsConnected, setIsWsConnected] = useState(false)

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const userParam = urlParams.get('user');

    if (userParam) {
      handleLogin(userParam);
    } else {
      const savedUser = localStorage.getItem("currentUser");
      if (savedUser) {
        const user = JSON.parse(savedUser);
        const init = async () => {
          const { InMemoryUserStore, InMemoryMessageStore, InMemoryGroupStore, ChatSDK } = await import('chatly-sdk');
          const transport = new WebSocketTransport('ws://localhost:3002');
          
          const newSdk = new ChatSDK({
            userStore: new InMemoryUserStore(),
            messageStore: new InMemoryMessageStore(),
            groupStore: new InMemoryGroupStore(),
            transport,
          });
          
          const importedUser = await newSdk.importUser(user);
          newSdk.setCurrentUser(importedUser);
          
          try {
            await transport.connect(importedUser.id);
            console.log('WebSocket connected');
            setIsWsConnected(true);
          } catch (error) {
            console.error('Failed to connect WebSocket:', error);
          }
          
          setSdk(newSdk);
          setCurrentUser(importedUser);
          setLoading(false);
        };
        init();
      } else {
        setLoading(false);
      }
    }
  }, [])

  const handleLogin = async (username: string) => {
    try {
      // Try to login
      let response = await fetch('http://localhost:3001/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
      })

      if (!response.ok) {
        if (response.status === 401) {
          // User not found, so create a new one
          response = await fetch('http://localhost:3001/api/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username }),
          });

          if (!response.ok) {
            throw new Error('Failed to create user');
          }
        } else {
          throw new Error('Failed to login');
        }
      }

      const userData = await response.json()
      localStorage.setItem("currentUser", JSON.stringify(userData));

      // Initialize SDK with user data
      const { InMemoryUserStore, InMemoryMessageStore, InMemoryGroupStore, ChatSDK } = await import('chatly-sdk')
      const transport = new WebSocketTransport('ws://localhost:3002')
      
      const newSdk = new ChatSDK({
        userStore: new InMemoryUserStore(),
        messageStore: new InMemoryMessageStore(),
        groupStore: new InMemoryGroupStore(),
        transport,
      })
      
      const user = await newSdk.importUser(userData)
      newSdk.setCurrentUser(user)
      
      // Connect WebSocket transport
      try {
        await transport.connect(user.id)
        console.log('WebSocket connected')
        setIsWsConnected(true)
      } catch (error) {
        console.error('Failed to connect WebSocket:', error)
      }
      
      setSdk(newSdk)
      setCurrentUser(user)
    } catch (error) {
      console.error('Login error:', error)
      alert('Failed to login. Please try again.')
    }
  }

  if (loading) {
    return <div className="loading">Loading...</div>
  }

  if (!currentUser) {
    return <Login onLogin={handleLogin} />
  }

  return <ChatView sdk={sdk!} currentUser={currentUser} isWsConnected={isWsConnected} />
}

export default App

