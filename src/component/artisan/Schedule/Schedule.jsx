'use client'

import { useState, useEffect } from 'react'
import { api } from '@/libs/api-client'
import { Calendar, Briefcase, DollarSign, Clock } from 'lucide-react'

const s = {
  page: { padding: '1.5rem', fontFamily: 'sans-serif', background: '#0d1117', minHeight: '100%' },
  header: { marginBottom: '1.25rem' },
  h2: { fontSize: '1.4rem', fontWeight: 700, color: '#e6edf3', margin: '0 0 4px' },
  sub: { color: '#8b949e', fontSize: 14, margin: 0 },
  card: { background: '#161b22', borderRadius: 12, padding: '1.25rem', border: '1px solid #30363d', marginBottom: '0.75rem', display: 'flex', gap: '1rem', alignItems: 'flex-start' },
  dateBox: { flexShrink: 0, width: 52, textAlign: 'center', background: 'rgba(56,139,253,.15)', borderRadius: 10, padding: '8px 4px', border: '1px solid rgba(56,139,253,.25)' },
  dateDay: { fontSize: '1.5rem', fontWeight: 800, color: '#58a6ff', lineHeight: 1 },
  dateMon: { fontSize: 11, color: '#58a6ff', fontWeight: 600, textTransform: 'uppercase', opacity: 0.8 },
  content: { flex: 1 },
  title: { fontWeight: 700, fontSize: 15, color: '#e6edf3', marginBottom: 4 },
  meta: { display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 4 },
  metaItem: { display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#8b949e' },
  badge: { padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: 'rgba(210,153,34,.15)', color: '#d29922' },
  empty: { textAlign: 'center', padding: '3rem', color: '#6e7681' },
}

export default function Schedule () {
  const [bids, setBids] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/api/bids/my-bids')
      .then(res => {
        const all = res.data.bids || res.data.data || []
        setBids(all.filter(b => b.status === 'accepted').sort((a, b) => new Date(a.updatedAt) - new Date(b.updatedAt)))
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div style={{ padding: '1.5rem', color: '#8b949e', background: '#0d1117', minHeight: '100%' }}>Loading schedule…</div>

  return (
    <div style={s.page}>
      <div style={s.header}>
        <h2 style={s.h2}>Schedule</h2>
        <p style={s.sub}>Your upcoming and active job assignments</p>
      </div>

      {bids.length === 0 ? (
        <div style={s.empty}>
          <Calendar size={40} opacity={0.3} style={{ display: 'block', margin: '0 auto 10px' }} />
          <p>No scheduled jobs. Accept bids to see them here.</p>
        </div>
      ) : bids.map(bid => {
        const sr = bid.serviceRequest || {}
        const d = new Date(bid.updatedAt || bid.createdAt)
        const day = d.getDate()
        const mon = d.toLocaleString('default', { month: 'short' })
        return (
          <div key={bid._id} style={s.card}>
            <div style={s.dateBox}>
              <div style={s.dateDay}>{day}</div>
              <div style={s.dateMon}>{mon}</div>
            </div>
            <div style={s.content}>
              <div style={s.title}>{sr.title || 'Job'}</div>
              {sr.description && (
                <p style={{ fontSize: 13, color: '#374151', margin: '4px 0 0', lineHeight: 1.5 }}>
                  {sr.description.length > 100 ? sr.description.slice(0, 100) + '…' : sr.description}
                </p>
              )}
              <div style={s.meta}>
                {sr.category && <span style={s.metaItem}><Briefcase size={13} />{sr.category}</span>}
                <span style={s.metaItem}><DollarSign size={13} />N{Number(bid.agreedAmount || bid.amount).toLocaleString()}</span>
                {sr.urgency && sr.urgency !== 'normal' && (
                  <span style={{ ...s.badge, ...(sr.urgency === 'emergency' ? { background: '#fee2e2', color: '#dc2626' } : {}) }}>{sr.urgency}</span>
                )}
                <span style={s.badge}>In Progress</span>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
