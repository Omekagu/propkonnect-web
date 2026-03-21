'use client'

import { useState, useEffect } from 'react'
import { api } from '@/libs/api-client'
import { DollarSign, TrendingUp, Clock, CheckCircle } from 'lucide-react'

const s = {
  page: { padding: '1.5rem', fontFamily: 'sans-serif', background: '#0d1117', minHeight: '100%' },
  h2: { fontSize: '1.4rem', fontWeight: 700, color: '#e6edf3', margin: '0 0 1.25rem' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' },
  card: { background: '#161b22', borderRadius: 12, padding: '1.25rem', border: '1px solid #30363d', display: 'flex', alignItems: 'center', gap: 14 },
  iconBox: (bg) => ({ width: 44, height: 44, borderRadius: 10, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }),
  val: { fontSize: '1.4rem', fontWeight: 700, color: '#e6edf3' },
  lbl: { fontSize: 12, color: '#8b949e', marginTop: 2 },
  section: { background: '#161b22', borderRadius: 12, padding: '1.25rem', border: '1px solid #30363d', marginBottom: '1rem' },
  sTitle: { fontSize: 15, fontWeight: 700, color: '#e6edf3', marginBottom: '1rem' },
  row: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.65rem 0', borderBottom: '1px solid #21262d' },
  jobTitle: { fontWeight: 600, fontSize: 14, color: '#e6edf3' },
  jobMeta: { fontSize: 12, color: '#8b949e', marginTop: 2 },
  amount: { fontWeight: 700, fontSize: 15, color: '#3fb950' },
  empty: { color: '#6e7681', fontSize: 14, textAlign: 'center', padding: '1.5rem 0' },
}

function isThisMonth (dateStr) {
  const d = new Date(dateStr)
  const now = new Date()
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
}

export default function Earnings () {
  const [bids, setBids] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/api/bids/my-bids')
      .then(res => setBids(res.data.bids || res.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const completed  = bids.filter(b => b.status === 'completed')
  const active     = bids.filter(b => b.status === 'accepted')
  const totalEarned = completed.reduce((s, b) => s + (b.agreedAmount || b.amount || 0), 0)
  const thisMonth   = completed.filter(b => isThisMonth(b.updatedAt || b.createdAt)).reduce((s, b) => s + (b.agreedAmount || b.amount || 0), 0)
  const inEscrow    = active.reduce((s, b) => s + (b.agreedAmount || b.amount || 0), 0)

  const stats = [
    { icon: <DollarSign size={20} color="#3fb950" />, bg: 'rgba(46,160,67,.15)', val: `₦${Number(totalEarned).toLocaleString()}`, lbl: 'Total Earned' },
    { icon: <TrendingUp size={20} color="#58a6ff" />, bg: 'rgba(56,139,253,.15)', val: `₦${Number(thisMonth).toLocaleString()}`, lbl: 'This Month' },
    { icon: <Clock size={20} color="#d29922" />,      bg: 'rgba(210,153,34,.15)', val: `₦${Number(inEscrow).toLocaleString()}`, lbl: 'In Escrow' },
    { icon: <CheckCircle size={20} color="#bc8cff" />, bg: 'rgba(188,140,255,.15)', val: completed.length, lbl: 'Jobs Done' },
  ]

  if (loading) return <div style={{ padding: '1.5rem', color: '#6b7280' }}>Loading earnings…</div>

  return (
    <div style={s.page}>
      <h2 style={s.h2}>Earnings</h2>

      <div style={s.grid}>
        {stats.map((st, i) => (
          <div key={i} style={s.card}>
            <div style={s.iconBox(st.bg)}>{st.icon}</div>
            <div>
              <div style={s.val}>{st.val}</div>
              <div style={s.lbl}>{st.lbl}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={s.section}>
        <div style={s.sTitle}>Completed Jobs</div>
        {completed.length === 0 ? (
          <p style={s.empty}>No completed jobs yet.</p>
        ) : completed.map(bid => (
          <div key={bid._id} style={s.row}>
            <div>
              <div style={s.jobTitle}>{bid.serviceRequest?.title || 'Job'}</div>
              <div style={s.jobMeta}>
                {bid.serviceRequest?.category && <span>{bid.serviceRequest.category} · </span>}
                {new Date(bid.updatedAt || bid.createdAt).toLocaleDateString()}
              </div>
            </div>
            <span style={s.amount}>+N{Number(bid.agreedAmount || bid.amount).toLocaleString()}</span>
          </div>
        ))}
      </div>

      {active.length > 0 && (
        <div style={s.section}>
          <div style={s.sTitle}>Pending (In Escrow)</div>
          {active.map(bid => (
            <div key={bid._id} style={s.row}>
              <div>
                <div style={s.jobTitle}>{bid.serviceRequest?.title || 'Job'}</div>
                <div style={s.jobMeta}>Awaiting client confirmation</div>
              </div>
              <span style={{ fontWeight: 700, fontSize: 15, color: '#d97706' }}>N{Number(bid.agreedAmount || bid.amount).toLocaleString()}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
