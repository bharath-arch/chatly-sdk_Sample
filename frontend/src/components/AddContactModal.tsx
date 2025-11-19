import { useState } from 'react'
import './AddContactModal.css'

interface AddContactModalProps {
  isOpen: boolean
  onClose: () => void
  onAddContact: (username: string) => Promise<void>
  existingContacts: string[]
}

export default function AddContactModal({
  isOpen,
  onClose,
  onAddContact,
  existingContacts,
}: AddContactModalProps) {
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (!username.trim()) {
      setError('Please enter a username')
      return
    }

    if (existingContacts.includes(username.toLowerCase())) {
      setError('This user is already in your contacts')
      return
    }

    setLoading(true)
    try {
      await onAddContact(username.trim())
      setUsername('')
      onClose()
    } catch (err: any) {
      setError(err.message || 'Failed to add contact')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Add Contact</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              placeholder="Enter username to search"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoFocus
              disabled={loading}
            />
            {error && <div className="error-message">{error}</div>}
          </div>
          <div className="modal-footer">
            <button type="button" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" disabled={loading || !username.trim()}>
              {loading ? 'Adding...' : 'Add Contact'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

