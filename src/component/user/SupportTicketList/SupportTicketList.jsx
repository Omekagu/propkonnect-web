import React, { useState, useEffect } from 'react'
import './SupportTicketList.scss'

export default function SupportTicketList ({ userRole }) {
  const [tickets, setTickets] = useState([])
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [newMessage, setNewMessage] = useState('')

  useEffect(() => {
    fetchTickets()
  }, [filter])

  const fetchTickets = async () => {
    setLoading(true)
    try {
      let url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/tickets/user/my-tickets`
      if (filter !== 'all') {
        url += `?status=${filter}`
      }

      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken')}`
        }
      })

      if (res.ok) {
        const data = await res.json()
        setTickets(data.tickets || [])
      }
    } catch (error) {
      console.error('Error fetching tickets:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddMessage = async () => {
    if (!newMessage.trim() || !selectedTicket) return

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/tickets/${selectedTicket._id}/message`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('authToken')}`
          },
          body: JSON.stringify({ message: newMessage })
        }
      )

      if (res.ok) {
        setNewMessage('')
        fetchTickets()
        setSelectedTicket(null)
      }
    } catch (error) {
      console.error('Error adding message:', error)
    }
  }

  const handleRateTicket = async score => {
    if (!selectedTicket) return

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/tickets/${selectedTicket._id}/rate`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('authToken')}`
          },
          body: JSON.stringify({ score })
        }
      )

      if (res.ok) {
        fetchTickets()
      }
    } catch (error) {
      console.error('Error rating ticket:', error)
    }
  }

  const filteredTickets = tickets.filter(
    ticket =>
      ticket.subject.toLowerCase().includes(search.toLowerCase()) ||
      ticket.ticketNumber.toLowerCase().includes(search.toLowerCase())
  )

  const getStatusColor = status => {
    const colors = {
      open: '#ef4444',
      in_progress: '#f59e0b',
      resolved: '#10b981',
      closed: '#6b7280'
    }
    return colors[status] || '#6b7280'
  }

  return (
    <div className='support-ticket-list'>
      <div className='list-header'>
        <div>
          <h1>My Support Tickets</h1>
          <p>Track and manage your support requests</p>
        </div>
        <a href='/dashboard?page=CreateTicket' className='btn btn-primary'>
          + New Ticket
        </a>
      </div>

      <div className='list-controls'>
        <div className='search-box'>
          <input
            type='text'
            placeholder='Search tickets...'
            value={search}
            onChange={e => setSearch(e.target.value)}
            className='search-input'
          />
        </div>

        <div className='filter-tabs'>
          {['all', 'open', 'in_progress', 'resolved', 'closed'].map(status => (
            <button
              key={status}
              className={`filter-tab ${filter === status ? 'active' : ''}`}
              onClick={() => setFilter(status)}
            >
              {status.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      <div className='list-container'>
        <div className='tickets-grid'>
          {loading ? (
            <div className='loading'>Loading tickets...</div>
          ) : filteredTickets.length === 0 ? (
            <div className='empty'>
              <div className='empty-icon'>📭</div>
              <h3>No tickets found</h3>
              <p>You haven't created any support tickets yet.</p>
              <a
                href='/dashboard?page=CreateTicket'
                className='btn btn-primary'
              >
                Create Your First Ticket
              </a>
            </div>
          ) : (
            filteredTickets.map(ticket => (
              <div
                key={ticket._id}
                className={`ticket-card ${
                  selectedTicket?._id === ticket._id ? 'active' : ''
                }`}
                onClick={() => setSelectedTicket(ticket)}
              >
                <div className='card-header'>
                  <div>
                    <h3>{ticket.subject}</h3>
                    <span className='ticket-number'>{ticket.ticketNumber}</span>
                  </div>
                  <span
                    className='status-badge'
                    style={{ backgroundColor: getStatusColor(ticket.status) }}
                  >
                    {ticket.status}
                  </span>
                </div>
                <div className='card-meta'>
                  <span className='date'>
                    {new Date(ticket.createdAt).toLocaleDateString()}
                  </span>
                  <span
                    className='priority'
                    style={{ color: getPriorityColor(ticket.priority) }}
                  >
                    {ticket.priority}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {selectedTicket && (
          <div className='ticket-detail-panel'>
            <div className='detail-header'>
              <h2>{selectedTicket.subject}</h2>
              <button
                className='close-btn'
                onClick={() => setSelectedTicket(null)}
              >
                ✕
              </button>
            </div>

            <div className='detail-meta'>
              <div className='meta-item'>
                <span className='label'>Ticket ID</span>
                <span className='value'>{selectedTicket.ticketNumber}</span>
              </div>
              <div className='meta-item'>
                <span className='label'>Status</span>
                <span
                  className='value status'
                  style={{ color: getStatusColor(selectedTicket.status) }}
                >
                  {selectedTicket.status}
                </span>
              </div>
              <div className='meta-item'>
                <span className='label'>Priority</span>
                <span
                  className='value priority'
                  style={{ color: getPriorityColor(selectedTicket.priority) }}
                >
                  {selectedTicket.priority}
                </span>
              </div>
              <div className='meta-item'>
                <span className='label'>Created</span>
                <span className='value'>
                  {new Date(selectedTicket.createdAt).toLocaleString()}
                </span>
              </div>
            </div>

            <div className='conversation'>
              <h3>Conversation</h3>
              <div className='messages'>
                {selectedTicket.messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`message ${
                      msg.sender === 'user' ? 'user-message' : 'admin-message'
                    }`}
                  >
                    <div className='message-header'>
                      <span className='sender'>
                        {msg.sender === 'user' ? 'You' : 'Support Team'}
                      </span>
                      <span className='timestamp'>
                        {new Date(msg.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className='message-text'>{msg.message}</p>
                  </div>
                ))}
              </div>
            </div>

            {selectedTicket.status !== 'closed' && (
              <div className='reply-box'>
                <textarea
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  placeholder='Type your reply...'
                  className='reply-textarea'
                />
                <button
                  className='btn btn-primary'
                  onClick={handleAddMessage}
                  disabled={!newMessage.trim()}
                >
                  Send Reply
                </button>
              </div>
            )}

            {selectedTicket.status === 'resolved' &&
              !selectedTicket.rating?.score && (
                <div className='rating-box'>
                  <p>How satisfied are you with the resolution?</p>
                  <div className='rating-stars'>
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        className='star'
                        onClick={() => handleRateTicket(star)}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>
              )}

            {selectedTicket.rating?.score && (
              <div className='rating-display'>
                <p>You rated this: {'★'.repeat(selectedTicket.rating.score)}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

const getPriorityColor = priority => {
  const colors = {
    low: '#0f6040',
    medium: '#f59e0b',
    high: '#ef4444',
    urgent: '#dc2626'
  }
  return colors[priority] || '#6b7280'
}
