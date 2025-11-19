import './ChatList.css'

interface ChatListProps {
  contacts: any[]
  onSelectContact: (contact: any) => void
  onAddContact: () => void
}

export default function ChatList({ contacts, onSelectContact, onAddContact }: ChatListProps) {
  return (
    <div className="chat-list">
      <div className="chat-list-header">
        <h3>Contacts</h3>
        <button className="add-contact-button" onClick={onAddContact} title="Add Contact">
          +
        </button>
      </div>
      {contacts.length === 0 ? (
        <div className="chat-list-empty">
          <p>No contacts yet</p>
          <button className="add-first-contact" onClick={onAddContact}>
            Add Your First Contact
          </button>
        </div>
      ) : (
        <div className="chat-list-items">
          {contacts.map((contact) => (
            <div
              key={contact.id}
              className="chat-list-item"
              onClick={() => onSelectContact(contact)}
            >
              <div className="contact-avatar">
                {contact.username[0].toUpperCase()}
              </div>
              <div className="contact-info">
                <div className="contact-name">{contact.username}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

