import React, { useState, useEffect } from 'react'
import './SupportTicketForm.scss'

export default function SupportTicketForm ({ userEmail }) {
  // Create new ticket state
  const [formData, setFormData] = useState({
    subject: '',
    description: '',
    priority: 'medium',
    category: 'general'
  })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // View tickets state
  const [view, setView] = useState('create') // 'create' or 'view'
  const [tickets, setTickets] = useState([])
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [ticketsLoading, setTicketsLoading] = useState(false)
  const [replyMessage, setReplyMessage] = useState('')
  const [replyLoading, setReplyLoading] = useState(false)
  const [ticketFilter, setTicketFilter] = useState('all')

  // Fetch user's tickets when view changes to 'view'
  useEffect(() => {
    if (view === 'view') {
      fetchMyTickets()
    }
  }, [view, ticketFilter])

  const fetchMyTickets = async () => {
    setTicketsLoading(true)
    try {
      let url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/tickets/user/my-tickets`
      if (ticketFilter !== 'all') {
        url += `?status=${ticketFilter}`
      }

      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken')}`
        }
      })

      if (res.ok) {
        const data = await res.json()
        setTickets(data.tickets || [])
        setSelectedTicket(null)
      } else {
        setError('Failed to load tickets')
      }
    } catch (err) {
      console.error('Error fetching tickets:', err)
      setError('Error loading tickets')
    } finally {
      setTicketsLoading(false)
    }
  }

  const handleInputChange = e => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    setError('')
  }

  const handleSubmit = async e => {
    e.preventDefault()

    if (!formData.subject.trim() || !formData.description.trim()) {
      setError('Please fill in all required fields')
      return
    }

    setLoading(true)
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/tickets`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('authToken')}`
          },
          body: JSON.stringify({
            ...formData,
            userEmail: userEmail || 'user@example.com'
          })
        }
      )

      if (res.ok) {
        setSubmitted(true)
        setFormData({
          subject: '',
          description: '',
          priority: 'medium',
          category: 'general'
        })
        setTimeout(() => setSubmitted(false), 5000)
      } else {
        const data = await res.json()
        setError(data.message || 'Failed to submit ticket. Please try again.')
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleReplySubmit = async () => {
    if (!replyMessage.trim() || !selectedTicket) return

    setReplyLoading(true)
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/tickets/${selectedTicket._id}/message`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('authToken')}`
          },
          body: JSON.stringify({ message: replyMessage })
        }
      )

      if (res.ok) {
        setReplyMessage('')
        // Refresh the selected ticket
        fetchTicketDetails(selectedTicket._id)
      } else {
        setError('Failed to send reply')
      }
    } catch (err) {
      console.error('Error sending reply:', err)
      setError('Error sending reply')
    } finally {
      setReplyLoading(false)
    }
  }

  const fetchTicketDetails = async ticketId => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/tickets/${ticketId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('authToken')}`
          }
        }
      )

      if (res.ok) {
        const data = await res.json()
        setSelectedTicket(data.ticket)
      }
    } catch (err) {
      console.error('Error fetching ticket details:', err)
    }
  }

  const handleSelectTicket = ticket => {
    setSelectedTicket(ticket)
    fetchTicketDetails(ticket._id)
  }

  // View: Create Ticket Form
  if (view === 'create') {
    return (
      <div className='support-form-container'>
        <div className='form-wrapper'>
          <div className='view-toggle'>
            <button
              className='toggle-btn active'
              onClick={() => setView('create')}
            >
              Create Ticket
            </button>
            <button className='toggle-btn' onClick={() => setView('view')}>
              My Tickets
            </button>
          </div>

          <div className='form-header'>
            <h1>Create Support Ticket</h1>
            <p>
              Need help? Let us know what's going on and we'll get back to you
              as soon as possible.
            </p>
          </div>

          {submitted && (
            <div className='success-message'>
              <div className='success-icon'>✓</div>
              <h3>Ticket Submitted Successfully!</h3>
              <p>
                We've received your support request. You'll receive updates via
                email.
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className='support-form'>
            {error && (
              <div className='error-message'>
                <span className='error-icon'>⚠</span>
                <p>{error}</p>
              </div>
            )}

            <div className='form-group'>
              <label htmlFor='subject' className='form-label'>
                Subject <span className='required'>*</span>
              </label>
              <input
                type='text'
                id='subject'
                name='subject'
                value={formData.subject}
                onChange={handleInputChange}
                placeholder='Brief description of your issue'
                className='form-input'
                disabled={loading}
                maxLength='100'
              />
              <span className='char-count'>{formData.subject.length}/100</span>
            </div>

            <div className='form-group'>
              <label htmlFor='category' className='form-label'>
                Category
              </label>
              <select
                id='category'
                name='category'
                value={formData.category}
                onChange={handleInputChange}
                className='form-select'
                disabled={loading}
              >
                <option value='general'>General Inquiry</option>
                <option value='technical'>Technical Issue</option>
                <option value='billing'>Billing</option>
                <option value='feature_request'>Feature Request</option>
                <option value='bug_report'>Bug Report</option>
                <option value='other'>Other</option>
              </select>
            </div>

            <div className='form-group'>
              <label htmlFor='priority' className='form-label'>
                Priority
              </label>
              <select
                id='priority'
                name='priority'
                value={formData.priority}
                onChange={handleInputChange}
                className='form-select'
                disabled={loading}
              >
                <option value='low'>Low</option>
                <option value='medium'>Medium</option>
                <option value='high'>High</option>
                <option value='urgent'>Urgent</option>
              </select>
            </div>

            <div className='form-group'>
              <label htmlFor='description' className='form-label'>
                Description <span className='required'>*</span>
              </label>
              <textarea
                id='description'
                name='description'
                value={formData.description}
                onChange={handleInputChange}
                placeholder='Please provide detailed information about your issue...'
                className='form-textarea'
                disabled={loading}
                rows='6'
                maxLength='2000'
              />
              <span className='char-count'>
                {formData.description.length}/2000
              </span>
            </div>

            <button type='submit' className='submit-button' disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Ticket'}
            </button>
          </form>

          <div className='form-footer'>
            <p>
              Expected response time: <strong>24-48 hours</strong>
            </p>
            <p>Urgent issues may be prioritized faster</p>
          </div>
        </div>
      </div>
    )
  }

  // View: My Tickets
  return (
    <div className='support-tickets-container'>
      <div className='tickets-wrapper'>
        <div className='view-toggle'>
          <button className='toggle-btn' onClick={() => setView('create')}>
            Create Ticket
          </button>
          <button className='toggle-btn active' onClick={() => setView('view')}>
            My Tickets
          </button>
        </div>

        <div className='tickets-header'>
          <h1>My Support Tickets</h1>
          <p>Track and manage your support requests</p>
        </div>

        <div className='tickets-filters'>
          <div className='filter-buttons'>
            {['all', 'open', 'in_progress', 'resolved', 'closed'].map(
              status => (
                <button
                  key={status}
                  className={`filter-btn ${
                    ticketFilter === status ? 'active' : ''
                  }`}
                  onClick={() => setTicketFilter(status)}
                >
                  {status.replace('_', ' ')}
                </button>
              )
            )}
          </div>
        </div>

        <div className='tickets-layout'>
          <div className='tickets-list'>
            {ticketsLoading ? (
              <div className='loading'>Loading tickets...</div>
            ) : tickets.length === 0 ? (
              <div className='empty'>
                <p>No tickets found</p>
                <button className='btn-link' onClick={() => setView('create')}>
                  Create your first ticket
                </button>
              </div>
            ) : (
              tickets.map(ticket => (
                <div
                  key={ticket._id}
                  className={`ticket-item ${
                    selectedTicket?._id === ticket._id ? 'active' : ''
                  }`}
                  onClick={() => handleSelectTicket(ticket)}
                >
                  <div className='ticket-header'>
                    <h3>{ticket.subject}</h3>
                    <span className={`status-badge status-${ticket.status}`}>
                      {ticket.status}
                    </span>
                  </div>
                  <p className='ticket-number'>{ticket.ticketNumber}</p>
                  <p className='ticket-date'>
                    {new Date(ticket.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))
            )}
          </div>

          {selectedTicket && (
            <div className='ticket-detail'>
              <div className='detail-header'>
                <h2>{selectedTicket.subject}</h2>
                <button
                  className='close-btn'
                  onClick={() => setSelectedTicket(null)}
                >
                  ✕
                </button>
              </div>

              <div className='detail-info'>
                <div className='info-row'>
                  <span className='label'>Ticket ID:</span>
                  <span className='value'>{selectedTicket.ticketNumber}</span>
                </div>
                <div className='info-row'>
                  <span className='label'>Status:</span>
                  <span className={`value status-${selectedTicket.status}`}>
                    {selectedTicket.status}
                  </span>
                </div>
                <div className='info-row'>
                  <span className='label'>Priority:</span>
                  <span className={`value priority-${selectedTicket.priority}`}>
                    {selectedTicket.priority}
                  </span>
                </div>
                <div className='info-row'>
                  <span className='label'>Category:</span>
                  <span className='value'>{selectedTicket.category}</span>
                </div>
                <div className='info-row'>
                  <span className='label'>Created:</span>
                  <span className='value'>
                    {new Date(selectedTicket.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className='conversation'>
                <h3>Conversation</h3>
                <div className='messages'>
                  {selectedTicket.messages &&
                  selectedTicket.messages.length > 0 ? (
                    selectedTicket.messages.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`message ${
                          msg.sender === 'user' ? 'user-msg' : 'admin-msg'
                        }`}
                      >
                        <div className='msg-header'>
                          <span className='sender'>
                            {msg.sender === 'user' ? 'You' : 'Support Team'}
                          </span>
                          <span className='time'>
                            {new Date(msg.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <p className='msg-text'>{msg.message}</p>
                      </div>
                    ))
                  ) : (
                    <p className='no-messages'>No messages yet</p>
                  )}
                </div>
              </div>

              {selectedTicket.status !== 'closed' &&
                selectedTicket.status !== 'resolved' && (
                  <div className='reply-box'>
                    <textarea
                      value={replyMessage}
                      onChange={e => setReplyMessage(e.target.value)}
                      placeholder='Type your reply...'
                      className='reply-input'
                      disabled={replyLoading}
                    />
                    <button
                      className='btn-send'
                      onClick={handleReplySubmit}
                      disabled={!replyMessage.trim() || replyLoading}
                    >
                      {replyLoading ? 'Sending...' : 'Send Reply'}
                    </button>
                  </div>
                )}

              {selectedTicket.status === 'resolved' && (
                <div className='status-info'>
                  <p>
                    ✓ This ticket has been resolved. Thank you for contacting
                    us!
                  </p>
                </div>
              )}

              {selectedTicket.status === 'closed' && (
                <div className='status-info closed'>
                  <p>This ticket is closed. No new replies can be added.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
