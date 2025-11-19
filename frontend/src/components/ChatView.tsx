import { useState, useEffect } from 'react'
import { ChatSDK, ChatSession, GroupSession, Message, User } from 'chatly-sdk'
import ChatList from './ChatList'
import MessageList from './MessageList'
import MessageInput from './MessageInput'
import AddContactModal from './AddContactModal'
import './ChatView.css'

interface ChatViewProps {
  sdk: ChatSDK
  currentUser: User
  isWsConnected: boolean
}

export default function ChatView({ sdk, currentUser, isWsConnected }: ChatViewProps) {
  const [activeSession, setActiveSession] = useState<ChatSession | GroupSession | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [contacts, setContacts] = useState<User[]>([])
  const [sessionType, setSessionType] = useState<'1:1' | 'group'>('1:1')
  const [showAddContactModal, setShowAddContactModal] = useState(false)

  function base64ToBytes(b64: string) {
    return Uint8Array.from(atob(b64), c => c.charCodeAt(0))
  }
  
  function restoreEncryptedMessage(msg: any) {
    if (msg.hasCiphertext && typeof msg.ciphertext === "string") {
      msg.ciphertext = base64ToBytes(msg.ciphertext)
    }
    if (msg.hasIv && typeof msg.iv === "string") {
      msg.iv = base64ToBytes(msg.iv)
    }
    if (msg.ephemeralPubKey && typeof msg.ephemeralPubKey === "string") {
      msg.ephemeralPubKey = base64ToBytes(msg.ephemeralPubKey)
    }
    return msg
  }

  useEffect(() => {
    loadContacts()
    if (activeSession) {
      // loadMessages()
    }
  }, [activeSession])

  // Set up WebSocket message listener
  useEffect(() => {
    if (!sdk || !sdk['config'].transport) return

    const transport = sdk['config'].transport
    // transport.onMessage((message: Message) => {
    //   // Check if message is for current session
    //   if (activeSession) {
    //     if (activeSession instanceof ChatSession) {
    //       const isForThisSession = 
    //         (message.senderId === activeSession.userA.id && message.receiverId === activeSession.userB.id) ||
    //         (message.senderId === activeSession.userB.id && message.receiverId === activeSession.userA.id)
    //       if (isForThisSession) {
    //         setMessages(prev => [...prev, message])
    //       }
    //     } else if (activeSession instanceof GroupSession) {
    //       if (message.groupId === activeSession.group.id) {
    //         setMessages(prev => [...prev, message])
    //       }
    //     }
    //   }
    //   // Reload messages to get from database
    //   if (activeSession) {
    //     // loadMessages()
    //   }
    // })

    transport.onMessage((raw: Message) => {
      const message = restoreEncryptedMessage(raw)  // <-- FIX
    
      if (activeSession) {
        if (activeSession instanceof ChatSession) {
          const isForThisSession =
            (message.senderId === activeSession.userA.id && message.receiverId === activeSession.userB.id) ||
            (message.senderId === activeSession.userB.id && message.receiverId === activeSession.userA.id)
    
          if (isForThisSession) {
            setMessages(prev => [...prev, message])
          }
        } else if (activeSession instanceof GroupSession) {
          if (message.groupId === activeSession.group.id) {
            setMessages(prev => [...prev, message])
          }
        }
      }
    })
    
  }, [sdk, activeSession])

  const loadContacts = async () => {
    try {
      // Fetch users from backend API
      const response = await fetch('http://localhost:3001/api/users')
      if (response.ok) {
        const allUsers: User[] = await response.json()
        setContacts(allUsers.filter(u => u.id !== currentUser.id))
      } else {
        // Fallback to local store
        const allUsers = await sdk['config'].userStore.list()
        setContacts(allUsers.filter(u => u.id !== currentUser.id))
      }
    } catch (error) {
      console.error('Failed to load contacts:', error)
      // Fallback to local store
      try {
        const allUsers = await sdk['config'].userStore.list()
        setContacts(allUsers.filter(u => u.id !== currentUser.id))
      } catch (e) {
        console.error('Failed to load from local store:', e)
      }
    }
  }

  const handleAddContact = async (username: string) => {
    try {
      const currentUser = sdk.getCurrentUser();
      if (!currentUser) {
        throw new Error("User not logged in");
      }
      // Search for user by username
      const response = await fetch(`http://localhost:3001/api/users/search?username=${encodeURIComponent(username)}`, {
        headers: {
          "X-User-Id": currentUser.id,
        },
      })
      
      if (!response.ok) {
        throw new Error('User not found')
      }

      const user: User = await response.json()
      
      // Check if already in contacts
      if (contacts.some(c => c.id === user.id)) {
        throw new Error('User is already in your contacts')
      }

      // Add to contacts list
      setContacts(prev => [...prev, user])
      setShowAddContactModal(false)
    } catch (error: any) {
      throw new Error(error.message || 'Failed to add contact')
    }
  }

  // const loadMessages = async () => {
  //   try {
  //     if (activeSession instanceof ChatSession) {
  //       // Fetch from backend API
  //       try {
  //         const response = await fetch(`http://localhost:3001/api/messages/user/${currentUser.id}`)
  //         if (response.ok) {
  //           const msgs: Message[] = await response.json()
  //           setMessages(msgs.filter(m => 
  //             (m.senderId === activeSession.userA.id && m.receiverId === activeSession.userB.id) ||
  //             (m.senderId === activeSession.userB.id && m.receiverId === activeSession.userA.id)
  //           ))
  //           return
  //         }
  //       } catch (e) {
  //         console.error('Failed to fetch from API:', e)
  //       }
  //       // Fallback to SDK
  //       const msgs = await sdk.getMessagesForUser(currentUser.id)
  //       setMessages(msgs.filter(m => 
  //         (m.senderId === activeSession.userA.id && m.receiverId === activeSession.userB.id) ||
  //         (m.senderId === activeSession.userB.id && m.receiverId === activeSession.userA.id)
  //       ))
  //     } else if (activeSession instanceof GroupSession) {
  //       // Fetch from backend API
  //       try {
  //         const response = await fetch(`http://localhost:3001/api/messages/group/${activeSession.group.id}`)
  //         if (response.ok) {
  //           const msgs: Message[] = await response.json()
  //           setMessages(msgs)
  //           return
  //         }
  //       } catch (e) {
  //         console.error('Failed to fetch from API:', e)
  //       }
  //       // Fallback to SDK
  //       const msgs = await sdk.getMessagesForGroup(activeSession.group.id)
  //       setMessages(msgs)
  //     }
  //   } catch (error) {
  //     console.error('Failed to load messages:', error)
  //   }
  // }

  const handleSelectContact = async (contact: User) => {
    try {
      // Ensure contact is in the user store
      try {
        const existingUser = await sdk['config'].userStore.findById(contact.id)
        if (!existingUser) {
          await sdk['config'].userStore.save({
            ...contact,
            createdAt: Date.now()
          })
        }
      } catch (e) {
        console.error('Failed to save contact to store:', e)
      }
      
      const session = await sdk.startSession(currentUser, contact)
      setActiveSession(session)
      setSessionType('1:1')
      // Load messages for this session
      // await loadMessages()
    } catch (error) {
      console.error('Failed to start session:', error)
    }
  }

  const handleSendMessage = async (text: string) => {
    if (!activeSession || !text.trim()) return

    try {
      const message = await sdk.sendMessage(activeSession, text)
      setMessages(prev => [...prev, message])
      // Reload messages after a short delay to get from database
      // setTimeout(() => {
      //   loadMessages()
      // }, 500)
    } catch (error) {
      console.error('Failed to send message:', error)
      alert('Failed to send message')
    }
  }

  return (
    <div className="chat-view">
      <div className="chat-sidebar">
        <div className="user-info">
          <div className="user-avatar">{currentUser.username[0].toUpperCase()}</div>
          <div className="user-details">
            <div className="username">{currentUser.username}</div>
            <div className="user-status">Online</div>
          </div>
        </div>
        <ChatList
          contacts={contacts}
          onSelectContact={handleSelectContact}
          onAddContact={() => setShowAddContactModal(true)}
        />
        <AddContactModal
          isOpen={showAddContactModal}
          onClose={() => setShowAddContactModal(false)}
          onAddContact={handleAddContact}
          existingContacts={contacts.map(c => c.username.toLowerCase())}
        />
      </div>
      <div className="chat-main">
        {activeSession ? (
          <>
            <div className="chat-header">
              <h2>
                {activeSession instanceof ChatSession
                  ? activeSession.userA.id === currentUser.id
                    ? activeSession.userB.username
                    : activeSession.userA.username
                  : activeSession.group.name}
              </h2>
            </div>
            <MessageList
              messages={messages}
              currentUser={currentUser}
              sdk={sdk}
            />
            <MessageInput onSend={handleSendMessage} isWsConnected={isWsConnected} />
          </>
        ) : (
          <div className="no-chat-selected">
            <p>Select a contact to start chatting</p>
          </div>
        )}
      </div>
    </div>
  )
}

