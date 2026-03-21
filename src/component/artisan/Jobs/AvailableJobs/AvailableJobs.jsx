'use client'

import { useState, useEffect } from 'react'
import { api } from '@/libs/api-client'
import { Briefcase, Clock, Send, ChevronDown, ChevronUp } from 'lucide-react'

const s = {
  page: { padding: '1.5rem', fontFamily: 'sans-serif', background: '#0d1117', minHeight: '100%' },
  header: { marginBottom: '1.25rem' },
  h2: { fontSize: '1.4rem', fontWeight: 700, color: '#e6edf3', margin: '0 0 4px' },
  sub: { color: '#8b949e', fontSize: 14, margin: 0 },
  filterBar: { display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: '1rem' },
  filterBtn: (active) => ({
    padding: '6px 14px', borderRadius: 20, fontSize: 13, fontWeight: 600, cursor: 'pointer',
    border: '1px solid ' + (active ? '#C4E53C' : '#30363d'),
    background: active ? '#C4E53C' : '#21262d', color: active ? '#0d1117' : '#c9d1d9',
  }),
  card: { background: '#161b22', borderRadius: 12, padding: '1.25rem', border: '1px solid #30363d', marginBottom: '0.75rem' },
  cardTop: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', cursor: 'pointer' },
  title: { fontWeight: 700, fontSize: 15, color: '#e6edf3', marginBottom: 4 },
  metaRow: { display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 6 },
  metaItem: { display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#8b949e' },
  urgBadge: (u) => ({
    padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
    color: u === 'emergency' ? '#f85149' : u === 'urgent' ? '#d29922' : '#8b949e',
    background: u === 'emergency' ? 'rgba(248,81,73,.15)' : u === 'urgent' ? 'rgba(210,153,34,.15)' : '#21262d',
  }),
  body: { marginTop: '1rem', borderTop: '1px solid #30363d', paddingTop: '1rem' },
  desc: { color: '#c9d1d9', fontSize: 14, lineHeight: 1.6, marginBottom: '1rem' },
  label: { display: 'block', fontSize: 13, fontWeight: 600, color: '#8b949e', marginBottom: 6 },
  textarea: { width: '100%', padding: '8px 12px', border: '1px solid #30363d', borderRadius: 8, fontSize: 14, resize: 'vertical', boxSizing: 'border-box', marginBottom: 8, background: '#21262d', color: '#e6edf3' },
  bidRow: { display: 'flex', gap: 8, alignItems: 'flex-end', flexWrap: 'wrap' },
  input: { flex: '1 1 140px', padding: '8px 12px', border: '1px solid #30363d', borderRadius: 8, fontSize: 14, background: '#21262d', color: '#e6edf3' },
  btnPrimary: { padding: '8px 18px', background: '#C4E53C', color: '#0d1117', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 },
  empty: { textAlign: 'center', padding: '3rem', color: '#6e7681' },
  alert: (t) => ({ padding: '10px 14px', borderRadius: 8, fontSize: 13, marginBottom: '0.75rem', background: t === 'success' ? 'rgba(46,160,67,.15)' : 'rgba(248,81,73,.15)', color: t === 'success' ? '#3fb950' : '#f85149', border: '1px solid ' + (t === 'success' ? 'rgba(46,160,67,.3)' : 'rgba(248,81,73,.3)') }),
}

const CATEGORIES = ['All', 'Plumbing', 'Electrical', 'Carpentry', 'Painting', 'Cleaning', 'Security', 'HVAC', 'Other']

export default function AvailableJobs () {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(null)
  const [category, setCategory] = useState('All')
  const [bidData, setBidData] = useState({})
  const [submitting, setSubmitting] = useState(null)
  const [msg, setMsg] = useState(null)

  useEffect(() => { fetchJobs() }, [category])

  async function fetchJobs () {
    setLoading(true)
    try {
      const params = { status: 'open', limit: 50 }
      if (category !== 'All') params.category = category
      const { data } = await api.get('/api/service-requests', { params })
      setJobs(data.serviceRequests || data.data || [])
    } catch { setJobs([]) }
    setLoading(false)
  }

  async function submitBid (jobId) {
    const bd = bidData[jobId] || {}
    if (!bd.amount) { setMsg({ type: 'error', text: 'Please enter a bid amount.' }); return }
    setSubmitting(jobId)
    setMsg(null)
    try {
      await api.post('/api/bids', {
        serviceRequestId: jobId,
        amount: Number(bd.amount),
        message: bd.message || '',
      })
      setMsg({ type: 'success', text: 'Bid submitted! The client will review your offer.' })
      setBidData(prev => ({ ...prev, [jobId]: {} }))
      setExpanded(null)
      fetchJobs()
    } catch (e) {
      setMsg({ type: 'error', text: e.response?.data?.message || 'Failed to submit bid.' })
    } finally {
      setSubmitting(null)
    }
  }

  return (
    <div style={s.page}>
      <div style={s.header}>
        <h2 style={s.h2}>Available Jobs</h2>
        <p style={s.sub}>Browse open service requests and submit your bid</p>
      </div>

      {msg && <div style={s.alert(msg.type)}>{msg.text}</div>}

      <div style={s.filterBar}>
        {CATEGORIES.map(c => (
          <button key={c} style={s.filterBtn(category === c)} onClick={() => setCategory(c)}>{c}</button>
        ))}
      </div>

      {loading ? (
        <p style={{ color: '#6b7280' }}>Loading jobs…</p>
      ) : jobs.length === 0 ? (
        <div style={s.empty}>
          <Briefcase size={40} opacity={0.3} style={{ display: 'block', margin: '0 auto 10px' }} />
          <p>No open jobs found{category !== 'All' ? ` in ${category}` : ''}.</p>
        </div>
      ) : jobs.map(job => {
        const isOpen = expanded === job._id
        const bd = bidData[job._id] || {}
        return (
          <div key={job._id} style={s.card}>
            <div style={s.cardTop} onClick={() => setExpanded(isOpen ? null : job._id)}>
              <div style={{ flex: 1 }}>
                <div style={s.title}>{job.title}</div>
                <div style={s.metaRow}>
                  {job.category && <span style={s.metaItem}><Briefcase size={13} />{job.category}</span>}
                  {job.urgency && job.urgency !== 'normal' && <span style={s.urgBadge(job.urgency)}>{job.urgency}</span>}
                  <span style={s.metaItem}><Clock size={13} />{new Date(job.createdAt).toLocaleDateString()}</span>
                  {job.bids?.length > 0 && (
                    <span style={s.metaItem}><Send size={13} />{job.bids.length} bid{job.bids.length !== 1 ? 's' : ''}</span>
                  )}
                </div>
              </div>
              {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </div>

            {isOpen && (
              <div style={s.body}>
                <p style={s.desc}>{job.description}</p>
                <label style={s.label}>Message to client (optional)</label>
                <textarea
                  rows={2}
                  placeholder="Brief message explaining why you are a good fit"
                  value={bd.message || ''}
                  onChange={e => setBidData(prev => ({ ...prev, [job._id]: { ...prev[job._id], message: e.target.value } }))}
                  style={s.textarea}
                />
                <div style={s.bidRow}>
                  <input
                    type="number"
                    placeholder="Your bid amount (N)"
                    value={bd.amount || ''}
                    onChange={e => setBidData(prev => ({ ...prev, [job._id]: { ...prev[job._id], amount: e.target.value } }))}
                    style={s.input}
                  />
                  <button style={s.btnPrimary} onClick={() => submitBid(job._id)} disabled={submitting === job._id}>
                    <Send size={14} />
                    {submitting === job._id ? 'Submitting…' : 'Submit Bid'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
