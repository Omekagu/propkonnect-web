import React, { useState, useEffect } from 'react'

import './SupportTicketAdmin.scss'
import SupportTicketList from '../SupportTicketList/SupportTicketList'

export default function SupportTicketAdmin ({ userRole }) {
  const [tickets, setTickets] = useState([])
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [response, setResponse] = useState('')
  const [filter, setFilter] = useState('open')
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [error, setError] = useState(null)
  const [unauthorized, setUnauthorized] = useState(false)

  // Check if user has permission to access admin dashboard
  useEffect(() => {
    const supportAdminRoles = ['SUPER_ADMIN', 'SUPPORT_ADMIN']
    if (!supportAdminRoles.includes(userRole)) {
      setUnauthorized(true)
    }
  }, [userRole])

  useEffect(() => {
    fetchTickets()
  }, [filter])

  const fetchTickets = async () => {
    setLoading(true)
    setError(null)
    try {
      // Get token from localStorage or sessionStorage
      const token =
        localStorage.getItem('authToken') || sessionStorage.getItem('authToken')

      if (!token) {
        setError('No authentication token found. Please log in again.')
        setTickets([])
        setLoading(false)
        return
      }

      const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/tickets?status=${filter}`

      const res = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      })

      // Handle 401 Unauthorized
      if (res.status === 401) {
        setError(
          'Authentication failed. Your session may have expired. Please log in again.'
        )
        setTickets([])
        setLoading(false)
        return
      }

      // Handle other errors
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        setError(errorData.message || `Failed to fetch tickets (${res.status})`)
        setTickets([])
        setLoading(false)
        return
      }

      const data = await res.json()

      // Ensure tickets is always an array
      if (Array.isArray(data.tickets)) {
        setTickets(data.tickets)
      } else if (Array.isArray(data)) {
        setTickets(data)
      } else {
        setTickets([])
        setError('Invalid response format from server')
      }
    } catch (error) {
      console.error('Error fetching tickets:', error)
      setError(`Network error: ${error.message}`)
      setTickets([])
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
      const token =
        localStorage.getItem('authToken') || sessionStorage.getItem('authToken')
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/tickets/${selectedTicket._id}/respond`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ message: response })
        }
      )

      if (res.ok) {
        setResponse('')
        fetchTickets()
        setSelectedTicket(null)
      } else if (res.status === 401) {
        setError('Session expired. Please log in again.')
      } else {
        setError('Failed to submit response')
      }
    } catch (error) {
      console.error('Error submitting response:', error)
      setError('Network error: Failed to submit response')
    }
  }

  const handleCloseTicket = async ticketId => {
    try {
      const token =
        localStorage.getItem('authToken') || sessionStorage.getItem('authToken')
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/tickets/${ticketId}/close`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          }
        }
      )

      if (res.ok) {
        fetchTickets()
        setSelectedTicket(null)
      } else if (res.status === 401) {
        setError('Session expired. Please log in again.')
      } else {
        setError('Failed to close ticket')
      }
    } catch (error) {
      console.error('Error closing ticket:', error)
      setError('Network error: Failed to close ticket')
    }
  }

  // Safely filter tickets - only if it's an array
  const filteredTickets = Array.isArray(tickets)
    ? tickets.filter(
        ticket =>
          ticket.subject?.toLowerCase().includes(search.toLowerCase()) ||
          ticket.userEmail?.toLowerCase().includes(search.toLowerCase())
      )
    : []

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

  // ✅ Loading state
  if (loading && tickets.length === 0) {
    return (
      <div className='loading-state'>
        <div className='loading-spinner'>
          <div className='spinner'></div>
          <p>Loading tickets...</p>
        </div>
      </div>
    )
  }

  // ✅ Check authorization
  if (unauthorized) {
    return (
      <div className='unauthorized-state'>
        <div className='unauthorized-container'>
          <div className='error-icon'>🔒</div>
          <h2>Access Denied</h2>
          <p>Only support admins can access this page.</p>
          <p className='error-details'>
            Your role: <strong>{userRole}</strong>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className='SUPPORT_ADMIN-container'>
      {/* Error Alert */}
      {error && (
        <div className='error-alert'>
          <div className='alert-icon'>⚠️</div>
          <div className='alert-content'>
            <strong>Error</strong>
            <p>{error}</p>
          </div>
          <button className='alert-close' onClick={() => setError(null)}>
            ✕
          </button>
        </div>
      )}

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
              {filteredTickets.filter(t => t.status === 'open').length}
            </span>
            <span className='stat-label'>Open</span>
          </div>
          <div className='stat'>
            <span className='stat-number'>
              {filteredTickets.filter(t => t.status === 'in_progress').length}
            </span>
            <span className='stat-label'>In Progress</span>
          </div>
          <div className='stat'>
            <span className='stat-number'>
              {filteredTickets.filter(t => t.status === 'resolved').length}
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
              title='Refresh tickets'
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
            {loading && tickets.length === 0 ? (
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
                  {Array.isArray(selectedTicket.messages) &&
                  selectedTicket.messages.length > 0 ? (
                    selectedTicket.messages.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`message ${
                          msg.sender === 'user'
                            ? 'user-message'
                            : 'admin-message'
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
                    ))
                  ) : (
                    <p className='no-messages'>No messages yet</p>
                  )}
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
