'use client'

import { useState, useEffect } from 'react'
import { serviceRequests as serviceRequestsApi } from '@/libs/api'
import {
  Wrench, Plus, CheckCircle, ChevronDown, Star,
  Zap, Droplets, Hammer, Paintbrush2, Shield, Wind, Trash2
} from 'lucide-react'
import './Maintenance.scss'

// ── Config ────────────────────────────────────────────────────────────────────
const STATUS = {
  open:        { label: 'Open',        cls: 'open' },
  in_progress: { label: 'In Progress', cls: 'in_progress' },
  completed:   { label: 'Completed',   cls: 'completed' },
  cancelled:   { label: 'Cancelled',   cls: 'cancelled' },
  reviewed:    { label: 'Reviewed',    cls: 'reviewed' },
}

const URGENCY_CLS = { urgent: 'warn', emergency: 'urgent', normal: '' }

const CAT_ICONS = {
  Plumbing:   <Droplets size={16} />,
  Electrical: <Zap size={16} />,
  Carpentry:  <Hammer size={16} />,
  Painting:   <Paintbrush2 size={16} />,
  Security:   <Shield size={16} />,
  HVAC:       <Wind size={16} />,
  Cleaning:   <Trash2 size={16} />,
}

const CATEGORIES = ['Plumbing', 'Electrical', 'Carpentry', 'Painting', 'Cleaning', 'Security', 'HVAC', 'Other']

function fmtDate (d) {
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function Maintenance () {
  const [requests,   setRequests]   = useState([])
  const [loading,    setLoading]    = useState(true)
  const [expanded,   setExpanded]   = useState(null)
  const [showForm,   setShowForm]   = useState(false)
  const [form,       setForm]       = useState({ title: '', description: '', category: '', urgency: 'normal' })
  const [submitting, setSubmitting] = useState(false)
  const [releasing,  setReleasing]  = useState(null)
  const [msg,        setMsg]        = useState(null)
  const [starPick,   setStarPick]   = useState({})   // { [srId]: number }
  const [ratingId,   setRatingId]   = useState(null) // which card shows the star form

  useEffect(() => { fetchRequests() }, [])

  async function fetchRequests () {
    try {
      setLoading(true)
      const { data } = await serviceRequestsApi.getTenantMine()
      setRequests(data.requests || data.data || [])
    } catch {
      flash('error', 'Failed to load maintenance requests.')
    } finally {
      setLoading(false)
    }
  }

  function flash (type, text) {
    setMsg({ type, text })
    setTimeout(() => setMsg(null), 4000)
  }

  async function submitRequest () {
    if (!form.title.trim() || !form.description.trim()) {
      return flash('error', 'Title and description are required.')
    }
    setSubmitting(true)
    try {
      await serviceRequestsApi.create(form)
      flash('success', 'Request submitted successfully.')
      setShowForm(false)
      setForm({ title: '', description: '', category: '', urgency: 'normal' })
      fetchRequests()
    } catch (e) {
      flash('error', e.response?.data?.message || 'Failed to submit request.')
    } finally {
      setSubmitting(false)
    }
  }

  async function confirmComplete (srId) {
    if (!confirm('Confirm the job is complete? This will release payment to the artisan.')) return
    setReleasing(srId)
    try {
      await serviceRequestsApi.complete(srId)
      flash('success', 'Job confirmed complete. Payment released.')
      fetchRequests()
    } catch (e) {
      flash('error', e.response?.data?.message || 'Failed to confirm.')
    } finally {
      setReleasing(null)
    }
  }

  async function submitRating (srId) {
    const score = starPick[srId]
    if (!score) return flash('error', 'Please select a star rating.')
    try {
      await serviceRequestsApi.rate(srId, { rating: score, role: 'client' })
      flash('success', 'Rating submitted — thank you!')
      setRatingId(null)
      fetchRequests()
    } catch (e) {
      flash('error', e.response?.data?.message || 'Failed to submit rating.')
    }
  }

  if (loading) return <div className='maintenance-loading'>Loading maintenance requests…</div>

  // ── Status counts for header ──────────────────────────────────────────────
  const openCount     = requests.filter(r => r.status === 'open').length
  const activeCount   = requests.filter(r => r.status === 'in_progress').length
  const doneCount     = requests.filter(r => r.status === 'completed' || r.status === 'reviewed').length

  return (
    <div className='maintenance-page'>

      {/* ── Header ── */}
      <div className='maintenance-header'>
        <div>
          <h2><Wrench size={19} /> Maintenance Requests</h2>
          <p className='sub'>Submit and track repair or service jobs</p>
        </div>
        <button className='btn-primary' onClick={() => setShowForm(s => !s)}>
          <Plus size={15} /> New Request
        </button>
      </div>

      {/* ── Quick count pills ── */}
      {requests.length > 0 && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
          {[
            { label: 'Open',        count: openCount,   color: '#60a5fa' },
            { label: 'In Progress', count: activeCount, color: '#c084fc' },
            { label: 'Completed',   count: doneCount,   color: '#4ade80' },
          ].map(({ label, count, color }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, fontSize: 12, color: '#7d8590' }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: color, display: 'inline-block' }} />
              {label} · <strong style={{ color }}>{count}</strong>
            </div>
          ))}
        </div>
      )}

      {/* ── Alert ── */}
      {msg && <div className={`alert ${msg.type}`}>{msg.text}</div>}

      {/* ── New request form ── */}
      {showForm && (
        <div className='request-form card'>
          <h3><Plus size={15} /> New Maintenance Request</h3>
          <div className='form-grid'>
            <label>
              Title *
              <input
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder='e.g. Leaking bathroom tap'
              />
            </label>
            <label>
              Category
              <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                <option value=''>Select category</option>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </label>
            <label>
              Urgency
              <select value={form.urgency} onChange={e => setForm(f => ({ ...f, urgency: e.target.value }))}>
                <option value='normal'>Normal</option>
                <option value='urgent'>Urgent</option>
                <option value='emergency'>Emergency</option>
              </select>
            </label>
            <label className='full'>
              Description *
              <textarea
                rows={4}
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder='Describe the issue in detail…'
              />
            </label>
          </div>
          <div className='form-actions'>
            <button className='btn-primary' onClick={submitRequest} disabled={submitting}>
              {submitting ? 'Submitting…' : 'Submit Request'}
            </button>
            <button className='btn-cancel' onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* ── Empty state ── */}
      {requests.length === 0 ? (
        <div className='maintenance-empty'>
          <Wrench size={44} />
          <p className='maintenance-empty__title'>No maintenance requests yet</p>
          <p>Submit a request when something needs fixing.</p>
          <button className='btn-primary' style={{ marginTop: 8 }} onClick={() => setShowForm(true)}>
            <Plus size={14} /> Submit first request
          </button>
        </div>
      ) : (
        requests.map(req => {
          const st          = STATUS[req.status] || STATUS.open
          const isExpanded  = expanded === req._id
          const canConfirm  = req.status === 'in_progress' && req.assignedArtisan && !req.clientRating
          const canRate     = req.status === 'completed' && !req.clientRating
          const catIcon     = CAT_ICONS[req.category] || <Wrench size={16} />
          const urgencyRaw  = req.urgency || 'normal'

          return (
            <div key={req._id} className='card request-card'>

              {/* ── Card header (clickable) ── */}
              <div className='request-card__header' onClick={() => setExpanded(isExpanded ? null : req._id)}>
                <div className='request-card__title-row'>
                  <div className='request-card__icon'>{catIcon}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className='request-card__title'>{req.title}</div>
                    <div className='request-card__meta'>
                      {fmtDate(req.createdAt)}
                      {req.category && <> · {req.category}</>}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                  {urgencyRaw !== 'normal' && (
                    <span className={`status-badge status-badge--${URGENCY_CLS[urgencyRaw] || 'pending'}`} style={{ textTransform: 'capitalize' }}>
                      {urgencyRaw}
                    </span>
                  )}
                  <span className={`status-badge status-badge--${st.cls}`}>{st.label}</span>
                  <span className={`request-card__chevron${isExpanded ? ' open' : ''}`}>▼</span>
                </div>
              </div>

              {/* ── Expanded body ── */}
              {isExpanded && (
                <div className='request-card__body'>

                  {req.description && (
                    <p className='request-card__desc'>{req.description}</p>
                  )}

                  {/* Detail rows */}
                  {[
                    ['Category',  req.category  || '—'],
                    ['Urgency',   req.urgency   || 'Normal'],
                    ['Submitted', fmtDate(req.createdAt)],
                    ['Artisan',   req.assignedArtisan ? `${req.assignedArtisan.firstName || ''} ${req.assignedArtisan.lastName || ''}`.trim() : null],
                    ['Agreed amount', req.acceptedBid?.amount ? `₦${Number(req.acceptedBid.amount).toLocaleString()}` : null],
                  ].filter(([, v]) => v).map(([k, v]) => (
                    <div key={k} className='request-card__detail-row'>
                      <span className='request-card__detail-label'>{k}</span>
                      <span className='request-card__detail-value'>{v}</span>
                    </div>
                  ))}

                  {/* Actions */}
                  <div className='request-card__actions'>
                    {canConfirm && (
                      <button
                        className='btn-complete'
                        disabled={releasing === req._id}
                        onClick={() => confirmComplete(req._id)}
                      >
                        <CheckCircle size={14} />
                        {releasing === req._id ? 'Processing…' : 'Confirm Complete & Release Payment'}
                      </button>
                    )}

                    {canRate && ratingId !== req._id && (
                      <button className='btn-rate' onClick={() => setRatingId(req._id)}>
                        <Star size={13} /> Rate this Job
                      </button>
                    )}
                  </div>

                  {/* Inline star rating form */}
                  {canRate && ratingId === req._id && (
                    <div style={{ marginTop: 14, padding: '14px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10 }}>
                      <div style={{ fontSize: 12, color: '#7d8590', marginBottom: 8, fontWeight: 600 }}>How was the job?</div>
                      <div className='star-rating' style={{ marginBottom: 12 }}>
                        {[1, 2, 3, 4, 5].map(n => (
                          <button
                            type='button'
                            key={n}
                            onClick={() => setStarPick(p => ({ ...p, [req._id]: n }))}
                            style={{ color: n <= (starPick[req._id] || 0) ? '#fbbf24' : 'rgba(255,255,255,0.15)', fontSize: 26, background: 'none', border: 'none', cursor: 'pointer', padding: '0 2px', transition: 'transform 0.1s' }}
                          >
                            ★
                          </button>
                        ))}
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button className='btn-rate' onClick={() => submitRating(req._id)}>Submit Rating</button>
                        <button onClick={() => setRatingId(null)} style={{ padding: '7px 14px', background: 'none', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, color: '#7d8590', fontSize: 12, cursor: 'pointer' }}>Cancel</button>
                      </div>
                    </div>
                  )}

                  {/* Already rated */}
                  {req.clientRating && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 12, padding: '8px 12px', background: 'rgba(251,191,36,0.07)', border: '1px solid rgba(251,191,36,0.15)', borderRadius: 8, fontSize: 12, color: '#fbbf24', fontWeight: 600 }}>
                      <Star size={13} fill='#fbbf24' color='#fbbf24' /> You rated this job {req.clientRating}/5
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })
      )}
    </div>
  )
}
