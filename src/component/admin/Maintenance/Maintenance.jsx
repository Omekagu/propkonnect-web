'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'
import { Wrench, Clock, CheckCircle, AlertCircle, ChevronDown, ChevronUp, Search, User } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

const API = process.env.NEXT_PUBLIC_BACKEND_URL

const CATEGORIES = ['All', 'Plumbing', 'Electrical', 'Carpentry', 'Painting', 'Cleaning', 'HVAC', 'Security', 'Landscaping', 'General']

const STATUS_META = {
  open:        { color: '#d97706', bg: '#fef3c7', label: 'Open' },
  in_progress: { color: '#2563eb', bg: '#dbeafe', label: 'In Progress' },
  completed:   { color: '#16a34a', bg: '#f0fdf4', label: 'Completed' },
  cancelled:   { color: '#6b7280', bg: '#f3f4f6', label: 'Cancelled' },
}

const URGENCY_META = {
  low:      { color: '#16a34a', bg: '#f0fdf4' },
  medium:   { color: '#d97706', bg: '#fef3c7' },
  high:     { color: '#dc2626', bg: '#fef2f2' },
  urgent:   { color: '#7c2d12', bg: '#ffedd5' },
}

const s = {
  page: { padding: '1.5rem', fontFamily: 'sans-serif' },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: 10 },
  h2: { fontSize: '1.4rem', fontWeight: 700, color: '#111', margin: 0 },
  searchWrap: { display: 'flex', alignItems: 'center', gap: 8, background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 8, padding: '7px 12px', width: 240 },
  searchInput: { border: 'none', background: 'transparent', outline: 'none', fontSize: 14, color: '#111', width: '100%' },
  statGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem', marginBottom: '1.25rem' },
  statCard: { background: '#fff', borderRadius: 10, padding: '1rem', boxShadow: '0 2px 6px rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', gap: 10 },
  iconBox: (bg) => ({ width: 38, height: 38, borderRadius: 8, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }),
  statVal: { fontWeight: 700, fontSize: '1.1rem', color: '#111' },
  statLbl: { fontSize: 11, color: '#6b7280', marginTop: 1 },
  filters: { display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: '1rem' },
  tab: (active) => ({ padding: '6px 14px', border: 'none', borderRadius: 20, fontSize: 13, fontWeight: 600, cursor: 'pointer', background: active ? '#2563eb' : '#f3f4f6', color: active ? '#fff' : '#374151' }),
  list: { display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  card: { background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', overflow: 'hidden' },
  cardHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.9rem 1rem', cursor: 'pointer', gap: 10, flexWrap: 'wrap' },
  cardLeft: { display: 'flex', alignItems: 'center', gap: 12 },
  iconWrap: (bg) => ({ width: 40, height: 40, borderRadius: 8, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }),
  title: { fontWeight: 600, fontSize: 14, color: '#111' },
  meta: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  badge: (color, bg) => ({ display: 'inline-block', padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 600, color, background: bg }),
  cardBody: { padding: '0 1rem 1rem', borderTop: '1px solid #f3f4f6' },
  detail: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', padding: '0.75rem 0', fontSize: 13 },
  detailItem: { display: 'flex', flexDirection: 'column', gap: 2 },
  detailLabel: { fontSize: 11, color: '#6b7280', fontWeight: 600 },
  detailVal: { color: '#111' },
  desc: { fontSize: 13, color: '#374151', marginTop: '0.5rem', lineHeight: 1.5 },
  bidsSection: { marginTop: '0.75rem' },
  bidTitle: { fontSize: 13, fontWeight: 700, color: '#111', marginBottom: '0.5rem' },
  bidRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f3f4f6', fontSize: 13 },
  bidArtisan: { fontWeight: 600, color: '#111' },
  bidAmount: { fontWeight: 700, color: '#16a34a' },
  empty: { textAlign: 'center', padding: '3rem', color: '#9ca3af', fontSize: 14 },
  btnSmall: (color, bg) => ({ padding: '4px 10px', fontSize: 12, fontWeight: 600, border: 'none', borderRadius: 6, cursor: 'pointer', color, background: bg }),
  alert: (t) => ({ padding: '10px 14px', borderRadius: 8, fontSize: 13, marginBottom: '0.75rem', background: t === 'success' ? '#f0fdf4' : '#fef2f2', color: t === 'success' ? '#16a34a' : '#dc2626' }),
}

export default function Maintenance () {
  const { user } = useAuth()
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [catFilter, setCatFilter] = useState('All')
  const [search, setSearch] = useState('')
  const [expanded, setExpanded] = useState(null)
  const [msg, setMsg] = useState(null)

  useEffect(() => { fetchRequests() }, [])

  async function fetchRequests () {
    try {
      const { data } = await axios.get(`${API}/api/service-requests`, { withCredentials: true })
      setRequests(data.requests || data.data || data || [])
    } catch { setRequests([]) }
    setLoading(false)
  }

  async function markComplete (id) {
    try {
      await axios.post(`${API}/api/service-requests/${id}/complete`, {}, { withCredentials: true })
      setMsg({ type: 'success', text: 'Request marked as completed.' })
      fetchRequests()
    } catch (e) {
      setMsg({ type: 'error', text: e.response?.data?.message || 'Failed to update.' })
    }
  }

  async function cancelRequest (id) {
    if (!confirm('Cancel this maintenance request?')) return
    try {
      await axios.post(`${API}/api/service-requests/${id}/cancel`, {}, { withCredentials: true })
      setMsg({ type: 'success', text: 'Request cancelled.' })
      fetchRequests()
    } catch (e) {
      setMsg({ type: 'error', text: e.response?.data?.message || 'Failed to cancel.' })
    }
  }

  const filtered = requests.filter(r => {
    const matchStatus = statusFilter === 'all' || r.status === statusFilter
    const matchCat = catFilter === 'All' || (r.category || '').toLowerCase() === catFilter.toLowerCase()
    const matchSearch = !search
      || (r.title || '').toLowerCase().includes(search.toLowerCase())
      || (r.description || '').toLowerCase().includes(search.toLowerCase())
      || (typeof r.location === 'string' ? r.location : r.location?.address || r.location?.city || '').toLowerCase().includes(search.toLowerCase())
    return matchStatus && matchCat && matchSearch
  })

  const counts = {
    open:        requests.filter(r => r.status === 'open').length,
    in_progress: requests.filter(r => r.status === 'in_progress').length,
    completed:   requests.filter(r => r.status === 'completed').length,
    cancelled:   requests.filter(r => r.status === 'cancelled').length,
  }

  const statuses = ['all', 'open', 'in_progress', 'completed', 'cancelled']

  return (
    <div style={s.page}>
      <div style={s.header}>
        <h2 style={s.h2}>Maintenance Requests</h2>
        <div style={s.searchWrap}>
          <Search size={14} color="#9ca3af" />
          <input
            style={s.searchInput}
            placeholder="Search requests…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {msg && <div style={s.alert(msg.type)}>{msg.text}</div>}

      <div style={s.statGrid}>
        {[
          { label: 'Open',        val: counts.open,        bg: '#fef3c7', icon: <AlertCircle size={18} color="#d97706" /> },
          { label: 'In Progress', val: counts.in_progress, bg: '#dbeafe', icon: <Clock size={18} color="#2563eb" /> },
          { label: 'Completed',   val: counts.completed,   bg: '#dcfce7', icon: <CheckCircle size={18} color="#16a34a" /> },
          { label: 'Cancelled',   val: counts.cancelled,   bg: '#f3f4f6', icon: <Wrench size={18} color="#6b7280" /> },
        ].map(st => (
          <div key={st.label} style={s.statCard}>
            <div style={s.iconBox(st.bg)}>{st.icon}</div>
            <div>
              <div style={s.statVal}>{st.val}</div>
              <div style={s.statLbl}>{st.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={s.filters}>
        {statuses.map(st => (
          <button key={st} style={s.tab(statusFilter === st)} onClick={() => setStatusFilter(st)}>
            {st === 'in_progress' ? 'In Progress' : st.charAt(0).toUpperCase() + st.slice(1)}
          </button>
        ))}
      </div>

      <div style={{ ...s.filters, marginTop: '-0.5rem' }}>
        {CATEGORIES.map(c => (
          <button key={c} style={{ ...s.tab(catFilter === c), fontSize: 12, padding: '4px 10px' }} onClick={() => setCatFilter(c)}>
            {c}
          </button>
        ))}
      </div>

      {loading ? (
        <p style={{ color: '#6b7280', fontSize: 14 }}>Loading requests…</p>
      ) : filtered.length === 0 ? (
        <div style={s.empty}>
          <Wrench size={40} opacity={0.3} style={{ display: 'block', margin: '0 auto 10px' }} />
          <p>No maintenance requests found{search ? ' matching your search' : ''}.</p>
        </div>
      ) : (
        <div style={s.list}>
          {filtered.map(req => {
            const sm = STATUS_META[req.status] || STATUS_META.open
            const um = URGENCY_META[req.urgency] || URGENCY_META.medium
            const isOpen = expanded === req._id
            const bids = req.bids || []
            const requester = req.requestedBy || req.user || {}
            return (
              <div key={req._id} style={s.card}>
                <div style={s.cardHeader} onClick={() => setExpanded(isOpen ? null : req._id)}>
                  <div style={s.cardLeft}>
                    <div style={s.iconWrap('#f3f4f6')}><Wrench size={18} color="#374151" /></div>
                    <div>
                      <div style={s.title}>{req.title || 'Maintenance Request'}</div>
                      <div style={s.meta}>
                        {req.category && <span>{req.category} · </span>}
                        {typeof req.location === 'string' ? req.location : req.location?.address || req.location?.city || req.property?.title || ''}
                        {req.createdAt && <span> · {new Date(req.createdAt).toLocaleDateString()}</span>}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {req.urgency && <span style={s.badge(um.color, um.bg)}>{req.urgency}</span>}
                    <span style={s.badge(sm.color, sm.bg)}>{sm.label}</span>
                    {isOpen ? <ChevronUp size={16} color="#6b7280" /> : <ChevronDown size={16} color="#6b7280" />}
                  </div>
                </div>

                {isOpen && (
                  <div style={s.cardBody}>
                    <div style={s.detail}>
                      <div style={s.detailItem}>
                        <span style={s.detailLabel}>Requested By</span>
                        <span style={s.detailVal}>
                          {[requester.firstName, requester.lastName].filter(Boolean).join(' ') || requester.email || '—'}
                        </span>
                      </div>
                      <div style={s.detailItem}>
                        <span style={s.detailLabel}>Budget</span>
                        <span style={s.detailVal}>{req.budget ? `N${Number(req.budget).toLocaleString()}` : 'Not set'}</span>
                      </div>
                      <div style={s.detailItem}>
                        <span style={s.detailLabel}>Preferred Date</span>
                        <span style={s.detailVal}>{req.preferredDate ? new Date(req.preferredDate).toLocaleDateString() : '—'}</span>
                      </div>
                      <div style={s.detailItem}>
                        <span style={s.detailLabel}>Bids</span>
                        <span style={s.detailVal}>{bids.length} bid{bids.length !== 1 ? 's' : ''}</span>
                      </div>
                    </div>

                    {req.description && <p style={s.desc}>{req.description}</p>}

                    {bids.length > 0 && (
                      <div style={s.bidsSection}>
                        <div style={s.bidTitle}>Bids ({bids.length})</div>
                        {bids.slice(0, 5).map((bid, i) => {
                          const artisan = bid.artisan || bid.bidderUserId || {}
                          return (
                            <div key={i} style={s.bidRow}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <User size={13} color="#6b7280" />
                                <span style={s.bidArtisan}>
                                  {typeof artisan === 'object'
                                    ? [artisan.firstName, artisan.lastName].filter(Boolean).join(' ') || artisan.email || 'Artisan'
                                    : 'Artisan'}
                                </span>
                                {bid.status && <span style={s.badge(bid.status === 'accepted' ? '#16a34a' : '#6b7280', bid.status === 'accepted' ? '#f0fdf4' : '#f3f4f6')}>{bid.status}</span>}
                              </div>
                              <span style={s.bidAmount}>N{Number(bid.amount).toLocaleString()}</span>
                            </div>
                          )
                        })}
                      </div>
                    )}

                    {(req.status === 'open' || req.status === 'in_progress') && (
                      <div style={{ display: 'flex', gap: 8, marginTop: '0.85rem' }}>
                        {req.status === 'in_progress' && (
                          <button style={s.btnSmall('#16a34a', '#f0fdf4')} onClick={() => markComplete(req._id)}>
                            <CheckCircle size={12} style={{ marginRight: 4 }} />Mark Complete
                          </button>
                        )}
                        <button style={s.btnSmall('#dc2626', '#fef2f2')} onClick={() => cancelRequest(req._id)}>
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
