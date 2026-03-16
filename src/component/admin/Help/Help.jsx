import React, { useState, useEffect } from 'react'
import './Help.scss'

export default function SupportTicketAdmin () {
  const [tickets, setTickets] = useState([])
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [response, setResponse] = useState('')
  const [filter, setFilter] = useState('open')
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchTickets()
  }, [filter])

  const fetchTickets = async () => {
    setLoading(true)
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/tickets?status=${filter}`
      )
      const data = await res.json()
      setTickets(data)
    } catch (error) {
      console.error('Error fetching tickets:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectTicket = ticket => {
    setSelectedTicket(ticket)
    setResponse('')
  }

  const handleSubmitResponse = async () => {
    if (!response.trim() || !selectedTicket) return

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/tickets/${selectedTicket._id}/respond`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: response, adminId: 'ADMIN_ID' })
        }
      )

      if (res.ok) {
        setResponse('')
        fetchTickets()
        setSelectedTicket(null)
      }
    } catch (error) {
      console.error('Error submitting response:', error)
    }
  }

  const handleCloseTicket = async ticketId => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/tickets/${ticketId}/close`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' }
        }
      )

      if (res.ok) {
        fetchTickets()
        setSelectedTicket(null)
      }
    } catch (error) {
      console.error('Error closing ticket:', error)
    }
  }

  const filteredTickets = tickets.filter(
    ticket =>
      ticket.subject.toLowerCase().includes(search.toLowerCase()) ||
      ticket.userEmail.toLowerCase().includes(search.toLowerCase())
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

  const getPriorityColor = priority => {
    const colors = {
      low: '#3b82f6',
      medium: '#f59e0b',
      high: '#ef4444',
      urgent: '#dc2626'
    }
    return colors[priority] || '#6b7280'
  }

  return (
    <div className='SUPPORT_ADMIN-container'>
      <header className='admin-header'>
        <div className='header-content'>
          <h1>Support Tickets</h1>
          <p className='subtitle'>
            Manage and respond to customer support requests
          </p>
        </div>
        <div className='ticket-stats'>
          <div className='stat'>
            <span className='stat-number'>
              {tickets.filter(t => t.status === 'open').length}
            </span>
            <span className='stat-label'>Open</span>
          </div>
          <div className='stat'>
            <span className='stat-number'>
              {tickets.filter(t => t.status === 'in_progress').length}
            </span>
            <span className='stat-label'>In Progress</span>
          </div>
          <div className='stat'>
            <span className='stat-number'>
              {tickets.filter(t => t.status === 'resolved').length}
            </span>
            <span className='stat-label'>Resolved</span>
          </div>
        </div>
      </header>

      <div className='admin-content'>
        <aside className='tickets-sidebar'>
          <div className='sidebar-header'>
            <h2>Tickets</h2>
            <button
              className='refresh-btn'
              onClick={fetchTickets}
              disabled={loading}
            >
              ↻
            </button>
          </div>

          <div className='search-box'>
            <input
              type='text'
              placeholder='Search by subject or email...'
              value={search}
              onChange={e => setSearch(e.target.value)}
              className='search-input'
            />
          </div>

          <div className='filter-tabs'>
            {['open', 'in_progress', 'resolved', 'closed'].map(status => (
              <button
                key={status}
                className={`filter-tab ${filter === status ? 'active' : ''}`}
                onClick={() => setFilter(status)}
              >
                {status.replace('_', ' ')}
              </button>
            ))}
          </div>

          <div className='tickets-list'>
            {loading ? (
              <div className='loading'>Loading tickets...</div>
            ) : filteredTickets.length === 0 ? (
              <div className='empty'>No tickets found</div>
            ) : (
              filteredTickets.map(ticket => (
                <div
                  key={ticket._id}
                  className={`ticket-item ${
                    selectedTicket?._id === ticket._id ? 'active' : ''
                  }`}
                  onClick={() => handleSelectTicket(ticket)}
                >
                  <div className='ticket-header'>
                    <h3>{ticket.subject}</h3>
                    <span
                      className='status-badge'
                      style={{ backgroundColor: getStatusColor(ticket.status) }}
                    >
                      {ticket.status}
                    </span>
                  </div>
                  <p className='ticket-email'>{ticket.userEmail}</p>
                  <p className='ticket-date'>
                    {new Date(ticket.createdAt).toLocaleDateString()}
                  </p>
                  <div className='ticket-priority'>
                    <span
                      className='priority-badge'
                      style={{
                        backgroundColor: getPriorityColor(ticket.priority)
                      }}
                    >
                      {ticket.priority}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </aside>

        <main className='ticket-detail'>
          {selectedTicket ? (
            <>
              <div className='detail-header'>
                <div>
                  <h2>{selectedTicket.subject}</h2>
                  <p className='detail-email'>{selectedTicket.userEmail}</p>
                </div>
                <div className='detail-badges'>
                  <span
                    className='status-badge'
                    style={{
                      backgroundColor: getStatusColor(selectedTicket.status)
                    }}
                  >
                    {selectedTicket.status}
                  </span>
                  <span
                    className='priority-badge'
                    style={{
                      backgroundColor: getPriorityColor(selectedTicket.priority)
                    }}
                  >
                    {selectedTicket.priority}
                  </span>
                </div>
              </div>

              <div className='detail-meta'>
                <div className='meta-item'>
                  <span className='label'>Created</span>
                  <span className='value'>
                    {new Date(selectedTicket.createdAt).toLocaleString()}
                  </span>
                </div>
                <div className='meta-item'>
                  <span className='label'>Last Updated</span>
                  <span className='value'>
                    {new Date(selectedTicket.updatedAt).toLocaleString()}
                  </span>
                </div>
                <div className='meta-item'>
                  <span className='label'>Ticket ID</span>
                  <span className='value'>{selectedTicket._id}</span>
                </div>
              </div>

              <div className='conversation'>
                <h3>Conversation</h3>
                <div className='messages-container'>
                  {selectedTicket.messages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`message ${
                        msg.sender === 'user' ? 'user-message' : 'admin-message'
                      }`}
                    >
                      <div className='message-header'>
                        <span className='sender'>
                          {msg.sender === 'user' ? 'User' : 'Admin'}
                        </span>
                        <span className='timestamp'>
                          {new Date(msg.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className='message-content'>{msg.message}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className='response-box'>
                <textarea
                  value={response}
                  onChange={e => setResponse(e.target.value)}
                  placeholder='Type your response here...'
                  className='response-textarea'
                />
                <div className='response-actions'>
                  <button
                    className='btn btn-primary'
                    onClick={handleSubmitResponse}
                    disabled={!response.trim()}
                  >
                    Send Response
                  </button>
                  {selectedTicket.status !== 'closed' && (
                    <button
                      className='btn btn-secondary'
                      onClick={() => handleCloseTicket(selectedTicket._id)}
                    >
                      Close Ticket
                    </button>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className='empty-state'>
              <div className='empty-icon'>📭</div>
              <h3>No ticket selected</h3>
              <p>Select a ticket from the list to view details and respond</p>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
