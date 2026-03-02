'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'
import { Briefcase, Clock, Send, ChevronDown, ChevronUp } from 'lucide-react'

const API = process.env.NEXT_PUBLIC_BACKEND_URL

const s = {
  page: { padding: '1.5rem', fontFamily: 'sans-serif' },
  header: { marginBottom: '1.25rem' },
  h2: { fontSize: '1.4rem', fontWeight: 700, color: '#111', margin: '0 0 4px' },
  sub: { color: '#6b7280', fontSize: 14, margin: 0 },
  filterBar: { display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: '1rem' },
  filterBtn: (active) => ({
    padding: '6px 14px', borderRadius: 20, fontSize: 13, fontWeight: 600, cursor: 'pointer',
    border: '1px solid ' + (active ? '#2563eb' : '#e5e7eb'),
    background: active ? '#2563eb' : '#fff', color: active ? '#fff' : '#374151',
  }),
  card: { background: '#fff', borderRadius: 12, padding: '1.25rem', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: '0.75rem' },
  cardTop: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', cursor: 'pointer' },
  title: { fontWeight: 700, fontSize: 15, color: '#111', marginBottom: 4 },
  metaRow: { display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 6 },
  metaItem: { display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#6b7280' },
  urgBadge: (u) => ({
    padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
    color: u === 'emergency' ? '#dc2626' : u === 'urgent' ? '#d97706' : '#6b7280',
    background: u === 'emergency' ? '#fee2e2' : u === 'urgent' ? '#fef3c7' : '#f3f4f6',
  }),
  body: { marginTop: '1rem', borderTop: '1px solid #f3f4f6', paddingTop: '1rem' },
  desc: { color: '#374151', fontSize: 14, lineHeight: 1.6, marginBottom: '1rem' },
  label: { display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 },
  textarea: { width: '100%', padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 14, resize: 'vertical', boxSizing: 'border-box', marginBottom: 8 },
  bidRow: { display: 'flex', gap: 8, alignItems: 'flex-end', flexWrap: 'wrap' },
  input: { flex: '1 1 140px', padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 14 },
  btnPrimary: { padding: '8px 18px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 },
  empty: { textAlign: 'center', padding: '3rem', color: '#9ca3af' },
  alert: (t) => ({ padding: '10px 14px', borderRadius: 8, fontSize: 13, marginBottom: '0.75rem', background: t === 'success' ? '#f0fdf4' : '#fef2f2', color: t === 'success' ? '#16a34a' : '#dc2626', border: '1px solid ' + (t === 'success' ? '#bbf7d0' : '#fecaca') }),
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
      const { data } = await axios.get(`${API}/api/service-requests`, { params, withCredentials: true })
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
      await axios.post(`${API}/api/bids`, {
        serviceRequestId: jobId,
        amount: Number(bd.amount),
        message: bd.message || '',
      }, { withCredentials: true })
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
