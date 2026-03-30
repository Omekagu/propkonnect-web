'use client'

import { useState, useEffect } from 'react'
import { serviceRequests as serviceRequestsApi } from '@/libs/api'
import { Wrench, Clock, CheckCircle, AlertCircle, ChevronDown, ChevronUp, Search, User, X } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import './Maintenance.scss'

const CATEGORIES = ['All', 'Plumbing', 'Electrical', 'Carpentry', 'Painting', 'Cleaning', 'HVAC', 'Security', 'Landscaping', 'General']

const STATUS_META = {
  open:          { cls: 'open',        label: 'Open' },
  'in-progress': { cls: 'in-progress', label: 'In Progress' },
  completed:     { cls: 'completed',   label: 'Completed' },
  cancelled:     { cls: 'cancelled',   label: 'Cancelled' },
}

const URGENCY_META = {
  low:    { cls: 'low' },
  medium: { cls: 'medium' },
  high:   { cls: 'high' },
  urgent: { cls: 'urgent' },
}

export default function Maintenance () {
  const { user } = useAuth()
  const [requests, setRequests]       = useState([])
  const [loading, setLoading]         = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [catFilter, setCatFilter]     = useState('All')
  const [search, setSearch]           = useState('')
  const [expanded, setExpanded]       = useState(null)
  const [msg, setMsg]                 = useState(null)

  useEffect(() => { if (user) fetchRequests() }, [user])

  async function fetchRequests () {
    try {
      const { data } = await serviceRequestsApi.getAll()
      setRequests(data.requests || data.data || data || [])
    } catch { setRequests([]) }
    setLoading(false)
  }

  async function markComplete (id) {
    try {
      await serviceRequestsApi.complete(id)
      setMsg({ type: 'success', text: 'Request marked as completed.' })
      fetchRequests()
    } catch (e) {
      setMsg({ type: 'error', text: e.response?.data?.message || 'Failed to update.' })
    }
  }

  async function cancelRequest (id) {
    if (!confirm('Cancel this maintenance request?')) return
    try {
      await serviceRequestsApi.cancel(id)
      setMsg({ type: 'success', text: 'Request cancelled.' })
      fetchRequests()
    } catch (e) {
      setMsg({ type: 'error', text: e.response?.data?.message || 'Failed to cancel.' })
    }
  }

  const filtered = requests.filter(r => {
    const matchStatus = statusFilter === 'all' || r.status === statusFilter
    const matchCat    = catFilter === 'All' || (r.category || '').toLowerCase() === catFilter.toLowerCase()
    const loc = typeof r.location === 'string' ? r.location : r.location?.address || r.location?.city || ''
    const matchSearch = !search
      || (r.title || '').toLowerCase().includes(search.toLowerCase())
      || (r.description || '').toLowerCase().includes(search.toLowerCase())
      || loc.toLowerCase().includes(search.toLowerCase())
    return matchStatus && matchCat && matchSearch
  })

  const counts = {
    open:          requests.filter(r => r.status === 'open').length,
    'in-progress': requests.filter(r => r.status === 'in-progress').length,
    completed:     requests.filter(r => r.status === 'completed').length,
    cancelled:     requests.filter(r => r.status === 'cancelled').length,
  }

  const statuses = ['all', 'open', 'in-progress', 'completed', 'cancelled']

  return (
    <div className='maint-wrap'>
      {/* Header */}
      <div className='maint-head'>
        <div>
          <h2>Maintenance Requests</h2>
          <p>{requests.length} total request{requests.length !== 1 ? 's' : ''}</p>
        </div>
        <div className='maint-search-wrap'>
          <Search size={14} />
          <input
            className='maint-search'
            placeholder='Search requests…'
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Alert */}
      {msg && (
        <div className={`maint-alert maint-alert--${msg.type}`}>
          {msg.type === 'success' ? <CheckCircle size={14} /> : <X size={14} />}
          {msg.text}
        </div>
      )}

      {/* Stats */}
      <div className='maint-stats'>
        {[
          { label: 'Open',        val: counts.open,          icon: <AlertCircle size={18} />, cls: 'open' },
          { label: 'In Progress', val: counts['in-progress'], icon: <Clock size={18} />,       cls: 'progress' },
          { label: 'Completed',   val: counts.completed,     icon: <CheckCircle size={18} />, cls: 'done' },
          { label: 'Cancelled',   val: counts.cancelled,     icon: <Wrench size={18} />,      cls: 'cancel' },
        ].map(st => (
          <div key={st.label} className='maint-stat'>
            <div className={`maint-stat-icon ${st.cls}`}>{st.icon}</div>
            <div>
              <div className='maint-stat-val'>{st.val}</div>
              <div className='maint-stat-lbl'>{st.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Status filter */}
      <div className='maint-tabs'>
        {statuses.map(st => (
          <button
            key={st}
            className={`maint-tab${statusFilter === st ? ' active' : ''}`}
            onClick={() => setStatusFilter(st)}
          >
            {st === 'in-progress' ? 'In Progress' : st.charAt(0).toUpperCase() + st.slice(1)}
          </button>
        ))}
      </div>

      {/* Category filter */}
      <div className='maint-chips'>
        {CATEGORIES.map(c => (
          <button
            key={c}
            className={`maint-chip${catFilter === c ? ' active' : ''}`}
            onClick={() => setCatFilter(c)}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className='maint-state'>
          <div className='maint-spinner' />
          <p>Loading requests…</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className='maint-empty'>
          <Wrench size={40} />
          <p>No maintenance requests found{search ? ' matching your search' : ''}.</p>
        </div>
      ) : (
        <div className='maint-list'>
          {filtered.map(req => {
            const sm = STATUS_META[req.status] || STATUS_META.open
            const um = URGENCY_META[req.urgency] || URGENCY_META.medium
            const isOpen = expanded === req._id
            const bids = req.bids || []
            const requester = req.userId || req.requestedBy || req.user || {}
            const loc = typeof req.location === 'string' ? req.location : req.location?.address || req.location?.city || req.property?.title || ''

            return (
              <div key={req._id} className='maint-card'>
                {/* Card header */}
                <div className='maint-card-head' onClick={() => setExpanded(isOpen ? null : req._id)}>
                  <div className='maint-card-left'>
                    <div className='maint-icon-wrap'><Wrench size={17} /></div>
                    <div>
                      <div className='maint-title'>{req.title || 'Maintenance Request'}</div>
                      <div className='maint-meta'>
                        {req.category && <span>{req.category}</span>}
                        {loc && <span> · {loc}</span>}
                        {req.createdAt && <span> · {new Date(req.createdAt).toLocaleDateString()}</span>}
                      </div>
                    </div>
                  </div>
                  <div className='maint-card-right'>
                    {req.urgency && <span className={`maint-urgency ${um.cls}`}>{req.urgency}</span>}
                    <span className={`maint-status-badge ${sm.cls}`}>{sm.label}</span>
                    {isOpen ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                  </div>
                </div>

                {/* Expanded body */}
                {isOpen && (
                  <div className='maint-card-body'>
                    <div className='maint-detail-grid'>
                      <div className='maint-detail-item'>
                        <span className='maint-detail-label'>Requested By</span>
                        <span className='maint-detail-val'>
                          {[requester.firstName, requester.lastName].filter(Boolean).join(' ') || requester.email || '—'}
                        </span>
                      </div>
                      <div className='maint-detail-item'>
                        <span className='maint-detail-label'>Budget</span>
                        <span className='maint-detail-val'>
                          {req.budget ? `₦${Number(req.budget).toLocaleString()}` : 'Not set'}
                        </span>
                      </div>
                      <div className='maint-detail-item'>
                        <span className='maint-detail-label'>Preferred Date</span>
                        <span className='maint-detail-val'>
                          {req.preferredDate ? new Date(req.preferredDate).toLocaleDateString() : '—'}
                        </span>
                      </div>
                      <div className='maint-detail-item'>
                        <span className='maint-detail-label'>Bids</span>
                        <span className='maint-detail-val'>{bids.length} bid{bids.length !== 1 ? 's' : ''}</span>
                      </div>
                    </div>

                    {req.description && <p className='maint-desc'>{req.description}</p>}

                    {bids.length > 0 && (
                      <div className='maint-bids'>
                        <div className='maint-bids-title'>Bids ({bids.length})</div>
                        {bids.slice(0, 5).map((bid, i) => {
                          const artisan = bid.bidderUserId || bid.artisan || {}
                          const name = typeof artisan === 'object'
                            ? [artisan.firstName, artisan.lastName].filter(Boolean).join(' ') || artisan.email || 'Artisan'
                            : 'Artisan'
                          return (
                            <div key={i} className='maint-bid-row'>
                              <div className='maint-bid-left'>
                                <User size={12} />
                                <span className='maint-bid-name'>{name}</span>
                                {bid.status && (
                                  <span className={`maint-bid-status ${bid.status === 'accepted' ? 'accepted' : ''}`}>
                                    {bid.status}
                                  </span>
                                )}
                              </div>
                              <span className='maint-bid-amount'>₦{Number(bid.amount).toLocaleString()}</span>
                            </div>
                          )
                        })}
                      </div>
                    )}

                    {(req.status === 'open' || req.status === 'in-progress') && (
                      <div className='maint-card-actions'>
                        {req.status === 'in-progress' && (
                          <button className='maint-action-btn maint-action-btn--complete' onClick={() => markComplete(req._id)}>
                            <CheckCircle size={13} /> Mark Complete
                          </button>
                        )}
                        <button className='maint-action-btn maint-action-btn--cancel' onClick={() => cancelRequest(req._id)}>
                          Cancel
                        </button>
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
