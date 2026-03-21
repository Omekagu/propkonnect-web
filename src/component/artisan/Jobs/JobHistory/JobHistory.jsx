'use client'

import { useState, useEffect } from 'react'
import { api } from '@/libs/api-client'
import { Briefcase, Star, CheckCircle, XCircle } from 'lucide-react'

const STATUS_MAP = {
  completed: { label: 'Completed', color: '#3fb950', bg: 'rgba(46,160,67,.15)' },
  declined:  { label: 'Declined',  color: '#f85149', bg: 'rgba(248,81,73,.15)' },
  withdrawn: { label: 'Withdrawn', color: '#8b949e', bg: '#21262d' },
  cancelled: { label: 'Cancelled', color: '#8b949e', bg: '#21262d' },
}

const s = {
  page: { padding: '1.5rem', fontFamily: 'sans-serif', background: '#0d1117', minHeight: '100%' },
  h2: { fontSize: '1.4rem', fontWeight: 700, color: '#e6edf3', margin: '0 0 1.25rem' },
  statsRow: { display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.25rem' },
  stat: { flex: '1 1 130px', background: '#161b22', borderRadius: 10, padding: '0.85rem 1rem', border: '1px solid #30363d', textAlign: 'center' },
  statVal: { fontSize: '1.4rem', fontWeight: 700, color: '#e6edf3' },
  statLbl: { fontSize: 12, color: '#8b949e', marginTop: 2 },
  filterBar: { display: 'flex', gap: 8, marginBottom: '1rem', flexWrap: 'wrap' },
  filterBtn: (a) => ({ padding: '5px 14px', borderRadius: 20, fontSize: 13, fontWeight: 600, cursor: 'pointer', border: '1px solid ' + (a ? '#C4E53C' : '#30363d'), background: a ? '#C4E53C' : '#21262d', color: a ? '#0d1117' : '#c9d1d9' }),
  row: { background: '#161b22', borderRadius: 10, padding: '0.85rem 1rem', border: '1px solid #30363d', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 },
  title: { fontWeight: 600, fontSize: 14, color: '#e6edf3' },
  meta: { fontSize: 12, color: '#8b949e', marginTop: 3 },
  badge: (color, bg) => ({ padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, color, background: bg }),
  right: { display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 },
  amount: { fontWeight: 700, fontSize: 15, color: '#e6edf3' },
  stars: { display: 'flex', gap: 2 },
  empty: { textAlign: 'center', padding: '3rem', color: '#6e7681' },
}

export default function JobHistory () {
  const [bids, setBids] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    api.get('/api/bids/my-bids')
      .then(res => {
        const all = res.data.bids || res.data.data || []
        setBids(all.filter(b => ['completed', 'declined', 'withdrawn', 'cancelled'].includes(b.status)))
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const filtered = filter === 'all' ? bids : bids.filter(b => b.status === filter)
  const completedBids = bids.filter(b => b.status === 'completed')
  const totalEarned = completedBids.reduce((sum, b) => sum + (b.agreedAmount || b.amount || 0), 0)
  const ratedBids = bids.filter(b => b.serviceRequest?.clientRating)
  const avgRating = ratedBids.length
    ? (ratedBids.reduce((s, b) => s + b.serviceRequest.clientRating, 0) / ratedBids.length).toFixed(1)
    : null

  if (loading) return <div style={{ padding: '1.5rem', color: '#6b7280' }}>Loading job history…</div>

  return (
    <div style={s.page}>
      <h2 style={s.h2}>Job History</h2>

      <div style={s.statsRow}>
        <div style={s.stat}><div style={s.statVal}>{completedBids.length}</div><div style={s.statLbl}>Completed</div></div>
        <div style={s.stat}><div style={s.statVal}>N{Number(totalEarned).toLocaleString()}</div><div style={s.statLbl}>Total Earned</div></div>
        <div style={s.stat}><div style={s.statVal}>{avgRating || '—'}</div><div style={s.statLbl}>Avg Rating</div></div>
        <div style={s.stat}><div style={s.statVal}>{bids.length}</div><div style={s.statLbl}>Total Jobs</div></div>
      </div>

      <div style={s.filterBar}>
        {['all', 'completed', 'declined', 'withdrawn'].map(f => (
          <button key={f} style={s.filterBtn(filter === f)} onClick={() => setFilter(f)}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div style={s.empty}>
          <Briefcase size={40} opacity={0.3} style={{ display: 'block', margin: '0 auto 10px' }} />
          <p>No {filter === 'all' ? '' : filter} jobs found.</p>
        </div>
      ) : filtered.map(bid => {
        const st = STATUS_MAP[bid.status] || STATUS_MAP.cancelled
        const sr = bid.serviceRequest || {}
        const rating = sr.clientRating
        return (
          <div key={bid._id} style={s.row}>
            <div>
              <div style={s.title}>{sr.title || 'Job'}</div>
              <div style={s.meta}>
                {sr.category && <span>{sr.category} · </span>}
                {new Date(bid.updatedAt || bid.createdAt).toLocaleDateString()}
              </div>
            </div>
            <div style={s.right}>
              {bid.status === 'completed' && (
                <span style={s.amount}>N{Number(bid.agreedAmount || bid.amount).toLocaleString()}</span>
              )}
              {rating && (
                <div style={s.stars}>
                  {[1,2,3,4,5].map(n => (
                    <Star key={n} size={13} fill={n <= rating ? '#f59e0b' : 'none'} color="#f59e0b" />
                  ))}
                </div>
              )}
              <span style={s.badge(st.color, st.bg)}>{st.label}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
