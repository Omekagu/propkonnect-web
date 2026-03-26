'use client'

import { useState, useEffect } from 'react'
import { serviceRequests as serviceRequestsApi } from '@/libs/api'
import { Wrench, Plus, Clock, CheckCircle, AlertCircle, ChevronDown, ChevronUp, Star } from 'lucide-react'
import './Maintenance.scss'

const STATUS_LABELS = {
  open:        { label: 'Open',        color: '#2563eb' },
  in_progress: { label: 'In Progress', color: '#d97706' },
  completed:   { label: 'Completed',   color: '#16a34a' },
  cancelled:   { label: 'Cancelled',   color: '#6b7280' }
}

export default function Maintenance () {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', category: '', urgency: 'normal' })
  const [submitting, setSubmitting] = useState(false)
  const [msg, setMsg] = useState(null)
  const [releasing, setReleasing] = useState(null)
  const [rating, setRating] = useState({})

  useEffect(() => {
    fetchRequests()
  }, [])

  async function fetchRequests () {
    try {
      setLoading(true)
      const { data } = await serviceRequestsApi.getTenantMine()
      setRequests(data.requests || data.data || [])
    } catch {
      setMsg({ type: 'error', text: 'Failed to load maintenance requests.' })
    } finally {
      setLoading(false)
    }
  }

  async function submitRequest () {
    if (!form.title || !form.description) {
      setMsg({ type: 'error', text: 'Title and description are required.' })
      return
    }
    setSubmitting(true)
    setMsg(null)
    try {
      await serviceRequestsApi.create(form)
      setMsg({ type: 'success', text: 'Request submitted successfully.' })
      setShowForm(false)
      setForm({ title: '', description: '', category: '', urgency: 'normal' })
      fetchRequests()
    } catch (e) {
      setMsg({ type: 'error', text: e.response?.data?.message || 'Failed to submit request.' })
    } finally {
      setSubmitting(false)
    }
  }

  // ── Release escrow + confirm job completion ────────────────────────────────
  async function confirmComplete (srId) {
    if (!confirm('Confirm the job is complete? This will release payment to the artisan.')) return
    setReleasing(srId)
    setMsg(null)
    try {
      await serviceRequestsApi.complete(srId)
      setMsg({ type: 'success', text: 'Job confirmed complete. Payment released to artisan.' })
      fetchRequests()
    } catch (e) {
      setMsg({ type: 'error', text: e.response?.data?.message || 'Failed to confirm completion.' })
    } finally {
      setReleasing(null)
    }
  }

  // ── Submit client rating ────────────────────────────────────────────────────
  async function submitRating (srId) {
    const score = rating[srId]
    if (!score) {
      setMsg({ type: 'error', text: 'Please select a rating.' })
      return
    }
    try {
      await serviceRequestsApi.rate(srId, { rating: score, role: 'client' })
      setMsg({ type: 'success', text: 'Rating submitted. Thank you!' })
      setRating(prev => ({ ...prev, [srId]: undefined }))
      fetchRequests()
    } catch (e) {
      setMsg({ type: 'error', text: e.response?.data?.message || 'Failed to submit rating.' })
    }
  }

  if (loading) {
    return <div className='maintenance-loading'>Loading maintenance requests…</div>
  }

  return (
    <div className='maintenance-page'>
      <div className='maintenance-header'>
        <div>
          <h2><Wrench size={20} /> Maintenance Requests</h2>
          <p className='sub'>Submit and track repair or service jobs</p>
        </div>
        <button className='btn-primary' onClick={() => setShowForm(s => !s)}>
          <Plus size={16} /> New Request
        </button>
      </div>

      {msg && (
        <div className={`alert ${msg.type}`}>{msg.text}</div>
      )}

      {/* New Request Form */}
      {showForm && (
        <div className='request-form card'>
          <h3>New Maintenance Request</h3>
          <div className='form-grid'>
            <label>
              Title *
              <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder='e.g. Leaking bathroom tap' />
            </label>
            <label>
              Category
              <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                <option value=''>Select category</option>
                {['Plumbing', 'Electrical', 'Carpentry', 'Painting', 'Cleaning', 'Security', 'HVAC', 'Other'].map(c => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </label>
            <label className='full'>
              Description *
              <textarea rows={4} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder='Describe the issue in detail…' />
            </label>
            <label>
              Urgency
              <select value={form.urgency} onChange={e => setForm(f => ({ ...f, urgency: e.target.value }))}>
                <option value='normal'>Normal</option>
                <option value='urgent'>Urgent</option>
                <option value='emergency'>Emergency</option>
              </select>
            </label>
          </div>
          <div className='form-actions'>
            <button className='btn-primary' onClick={submitRequest} disabled={submitting}>
              {submitting ? 'Submitting…' : 'Submit Request'}
            </button>
            <button className='btn-ghost' onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* Request List */}
      {requests.length === 0 ? (
        <div className='empty-state'>
          <Wrench size={40} opacity={0.3} />
          <p>No maintenance requests yet.</p>
          <button className='btn-primary' onClick={() => setShowForm(true)}>Submit your first request</button>
        </div>
      ) : (
        <div className='request-list'>
          {requests.map(req => {
            const statusInfo = STATUS_LABELS[req.status] || STATUS_LABELS.open
            const isExpanded = expanded === req._id
            const canConfirm = req.status === 'in_progress' && req.assignedArtisan && !req.clientRating
            const canRate    = req.status === 'completed' && !req.clientRating

            return (
              <div key={req._id} className='request-card card'>
                <div className='card-header' onClick={() => setExpanded(isExpanded ? null : req._id)}>
                  <div className='card-left'>
                    <span className='status-dot' style={{ background: statusInfo.color }} />
                    <div>
                      <div className='req-title'>{req.title}</div>
                      <div className='req-meta'>
                        <span className='badge' style={{ color: statusInfo.color }}>{statusInfo.label}</span>
                        {req.category && <span className='badge muted'>{req.category}</span>}
                        {req.urgency && req.urgency !== 'normal' && (
                          <span className='badge urgent'>{req.urgency}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className='card-right'>
                    <span className='date'>{new Date(req.createdAt).toLocaleDateString()}</span>
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                </div>

                {isExpanded && (
                  <div className='card-body'>
                    <p className='description'>{req.description}</p>

                    {req.assignedArtisan && (
                      <div className='artisan-info'>
                        <strong>Assigned to:</strong> {req.assignedArtisan?.firstName || 'Artisan'} {req.assignedArtisan?.lastName || ''}
                      </div>
                    )}

                    {req.acceptedBid?.amount && (
                      <div className='bid-info'>
                        <strong>Agreed amount:</strong> ₦{Number(req.acceptedBid.amount).toLocaleString()}
                      </div>
                    )}

                    {/* Confirm Completion — releases escrow */}
                    {canConfirm && (
                      <div className='confirm-section'>
                        <div className='confirm-info'>
                          <CheckCircle size={16} color='#16a34a' />
                          <span>Is the job complete? Confirming will release payment to the artisan.</span>
                        </div>
                        <button
                          className='btn-success'
                          disabled={releasing === req._id}
                          onClick={() => confirmComplete(req._id)}
                        >
                          {releasing === req._id ? 'Processing…' : 'Confirm Job Complete & Release Payment'}
                        </button>
                      </div>
                    )}

                    {/* Rating section */}
                    {canRate && (
                      <div className='rating-section'>
                        <strong>Rate this job:</strong>
                        <div className='stars'>
                          {[1, 2, 3, 4, 5].map(n => (
                            <button
                              key={n}
                              className={`star-btn ${(rating[req._id] || 0) >= n ? 'active' : ''}`}
                              onClick={() => setRating(prev => ({ ...prev, [req._id]: n }))}
                            >
                              <Star size={20} fill={(rating[req._id] || 0) >= n ? '#f59e0b' : 'none'} color='#f59e0b' />
                            </button>
                          ))}
                        </div>
                        <button className='btn-primary small' onClick={() => submitRating(req._id)}>
                          Submit Rating
                        </button>
                      </div>
                    )}

                    {req.clientRating && (
                      <div className='rated-badge'>
                        <Star size={14} fill='#f59e0b' color='#f59e0b' /> You rated this job {req.clientRating}/5
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
