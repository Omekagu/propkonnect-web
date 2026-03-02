'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'
import { Calendar, Briefcase, DollarSign, Clock } from 'lucide-react'

const API = process.env.NEXT_PUBLIC_BACKEND_URL

const s = {
  page: { padding: '1.5rem', fontFamily: 'sans-serif' },
  header: { marginBottom: '1.25rem' },
  h2: { fontSize: '1.4rem', fontWeight: 700, color: '#111', margin: '0 0 4px' },
  sub: { color: '#6b7280', fontSize: 14, margin: 0 },
  card: { background: '#fff', borderRadius: 12, padding: '1.25rem', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: '0.75rem', display: 'flex', gap: '1rem', alignItems: 'flex-start' },
  dateBox: { flexShrink: 0, width: 52, textAlign: 'center', background: '#dbeafe', borderRadius: 10, padding: '8px 4px' },
  dateDay: { fontSize: '1.5rem', fontWeight: 800, color: '#1d4ed8', lineHeight: 1 },
  dateMon: { fontSize: 11, color: '#2563eb', fontWeight: 600, textTransform: 'uppercase' },
  content: { flex: 1 },
  title: { fontWeight: 700, fontSize: 15, color: '#111', marginBottom: 4 },
  meta: { display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 4 },
  metaItem: { display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#6b7280' },
  badge: { padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: '#fef3c7', color: '#d97706' },
  empty: { textAlign: 'center', padding: '3rem', color: '#9ca3af' },
}

export default function Schedule () {
  const [bids, setBids] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    axios.get(`${API}/api/bids/my-bids`, { withCredentials: true })
      .then(res => {
        const all = res.data.bids || res.data.data || []
        setBids(all.filter(b => b.status === 'accepted').sort((a, b) => new Date(a.updatedAt) - new Date(b.updatedAt)))
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div style={{ padding: '1.5rem', color: '#6b7280' }}>Loading schedule…</div>

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
