'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'
import { Briefcase, DollarSign, ChevronDown, ChevronUp, CheckCircle } from 'lucide-react'

const API = process.env.NEXT_PUBLIC_BACKEND_URL

const s = {
  page: { padding: '1.5rem', fontFamily: 'sans-serif' },
  h2: { fontSize: '1.4rem', fontWeight: 700, color: '#111', margin: '0 0 4px' },
  sub: { color: '#6b7280', fontSize: 14, margin: '0 0 1.25rem' },
  card: { background: '#fff', borderRadius: 12, padding: '1.25rem', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: '0.75rem' },
  cardTop: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', cursor: 'pointer' },
  title: { fontWeight: 700, fontSize: 15, color: '#111', marginBottom: 4 },
  metaRow: { display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 6 },
  metaItem: { display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#6b7280' },
  badge: { padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: '#fef3c7', color: '#d97706' },
  body: { marginTop: '1rem', borderTop: '1px solid #f3f4f6', paddingTop: '1rem' },
  desc: { color: '#374151', fontSize: 14, lineHeight: 1.6, marginBottom: '0.75rem' },
  infoGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: '1rem' },
  infoBox: { background: '#f9fafb', borderRadius: 8, padding: '0.75rem', fontSize: 13 },
  infoLabel: { color: '#6b7280', fontWeight: 600, marginBottom: 4 },
  infoVal: { color: '#111', fontWeight: 500 },
  note: { background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 8, padding: '0.75rem', fontSize: 13, color: '#0369a1', display: 'flex', alignItems: 'flex-start', gap: 8 },
  empty: { textAlign: 'center', padding: '3rem', color: '#9ca3af' },
  alert: (t) => ({ padding: '10px 14px', borderRadius: 8, fontSize: 13, marginBottom: '0.75rem', background: t === 'success' ? '#f0fdf4' : '#fef2f2', color: t === 'success' ? '#16a34a' : '#dc2626' }),
}

export default function ActiveJobs () {
  const [bids, setBids] = useState([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(null)
  const [msg, setMsg] = useState(null)

  useEffect(() => {
    axios.get(`${API}/api/bids/my-bids`, { withCredentials: true })
      .then(res => {
        const all = res.data.bids || res.data.data || []
        setBids(all.filter(b => b.status === 'accepted' || b.serviceRequest?.status === 'in_progress'))
      })
      .catch(() => setMsg({ type: 'error', text: 'Failed to load active jobs.' }))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div style={{ padding: '1.5rem', color: '#6b7280' }}>Loading active jobs…</div>

  return (
    <div style={s.page}>
      <h2 style={s.h2}>Active Jobs</h2>
      <p style={s.sub}>Jobs currently in progress where you have been assigned</p>

      {msg && <div style={s.alert(msg.type)}>{msg.text}</div>}

      {bids.length === 0 ? (
        <div style={s.empty}>
          <Briefcase size={40} opacity={0.3} style={{ display: 'block', margin: '0 auto 10px' }} />
          <p>No active jobs. Place bids on available jobs to get started.</p>
        </div>
      ) : bids.map(bid => {
        const sr = bid.serviceRequest || {}
        const isOpen = expanded === bid._id
        return (
          <div key={bid._id} style={s.card}>
            <div style={s.cardTop} onClick={() => setExpanded(isOpen ? null : bid._id)}>
              <div style={{ flex: 1 }}>
                <div style={s.title}>{sr.title || 'Untitled Job'}</div>
                <div style={s.metaRow}>
                  {sr.category && <span style={s.metaItem}><Briefcase size={13} />{sr.category}</span>}
                  <span style={s.metaItem}><DollarSign size={13} />Agreed: {Number(bid.agreedAmount || bid.amount).toLocaleString()}</span>
                  <span style={s.badge}>In Progress</span>
                </div>
              </div>
              {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </div>

            {isOpen && (
              <div style={s.body}>
                {sr.description && <p style={s.desc}>{sr.description}</p>}
                <div style={s.infoGrid}>
                  <div style={s.infoBox}>
                    <div style={s.infoLabel}>Agreed Amount</div>
                    <div style={s.infoVal}>N{Number(bid.agreedAmount || bid.amount).toLocaleString()}</div>
                  </div>
                  <div style={s.infoBox}>
                    <div style={s.infoLabel}>Started</div>
                    <div style={s.infoVal}>{new Date(bid.updatedAt || bid.createdAt).toLocaleDateString()}</div>
                  </div>
                  {sr.urgency && sr.urgency !== 'normal' && (
                    <div style={s.infoBox}>
                      <div style={s.infoLabel}>Urgency</div>
                      <div style={s.infoVal}>{sr.urgency}</div>
                    </div>
                  )}
                </div>
                <div style={s.note}>
                  <CheckCircle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
                  <span>When you finish the job, ask the client to confirm completion in their dashboard. Payment is held in escrow and released once they confirm.</span>
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
