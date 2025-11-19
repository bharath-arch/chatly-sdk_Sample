import { useEffect, useRef, useState } from 'react'
import { ChatSDK, Message, User } from 'chatly-sdk'
import './MessageList.css'

interface MessageListProps {
  messages: Message[]
  currentUser: User
  sdk: ChatSDK
}

export default function MessageList({ messages, currentUser, sdk }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [decryptedMessages, setDecryptedMessages] = useState<Map<string, string>>(new Map())

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    // Decrypt all messages
    const decryptAll = async () => {
      const decrypted = new Map<string, string>()
      for (const msg of messages) {
        // Skip if already decrypted
        if (decryptedMessages.has(msg.id)) {
          decrypted.set(msg.id, decryptedMessages.get(msg.id)!)
          continue
        }
        
        try {
          // For 1:1 messages, we need to ensure the other user is in the store
          if (!msg.groupId && msg.senderId !== currentUser.id && msg.receiverId === currentUser.id) {
            // Fetch sender user from API if not in store
            try {
              const senderResponse = await fetch(`http://localhost:3001/api/users/${msg.senderId}`)
              if (senderResponse.ok) {
                const senderUser = await senderResponse.json()
                await sdk['config'].userStore.save(senderUser)
              }
            } catch (e) {
              console.error('Failed to fetch sender user:', e)
            }
          }
          
          const plaintext = await sdk.decryptMessage(msg, currentUser)
          decrypted.set(msg.id, plaintext)
        } catch (error: any) {
          console.error(`Failed to decrypt message ${msg.id}:`, error)
          console.error('Error details:', error.message)
          console.error('Message details:', {
            id: msg.id,
            senderId: msg.senderId,
            receiverId: msg.receiverId,
            groupId: msg.groupId,
            hasCiphertext: !!msg.ciphertext,
            hasIv: !!msg.iv
          })
          decrypted.set(msg.id, `[Error: ${error.message || 'Decryption failed'}]`)
        }
      }
      setDecryptedMessages(decrypted)
    }
    if (messages.length > 0) {
      decryptAll()
    }
  }, [messages, currentUser, sdk])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="message-list">
      {messages.length === 0 ? (
        <div className="no-messages">
          <p>No messages yet. Start the conversation!</p>
        </div>
      ) : (
        messages.map((msg) => {
          const isOwn = msg.senderId === currentUser.id
          const plaintext = decryptedMessages.get(msg.id) || '...'
          
          return (
            <div
              key={msg.id}
              className={`message ${isOwn ? 'message-own' : 'message-other'}`}
            >
              <div className="message-bubble">
                <div className="message-text">{plaintext}</div>
                <div className="message-time">{formatTime(msg.timestamp)}</div>
              </div>
            </div>
          )
        })
      )}
      <div ref={messagesEndRef} />
    </div>
  )
}

