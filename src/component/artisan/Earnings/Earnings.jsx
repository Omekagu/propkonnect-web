'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'
import { DollarSign, TrendingUp, Clock, CheckCircle } from 'lucide-react'

const API = process.env.NEXT_PUBLIC_BACKEND_URL

const s = {
  page: { padding: '1.5rem', fontFamily: 'sans-serif' },
  h2: { fontSize: '1.4rem', fontWeight: 700, color: '#111', margin: '0 0 1.25rem' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' },
  card: { background: '#fff', borderRadius: 12, padding: '1.25rem', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', gap: 14 },
  iconBox: (bg) => ({ width: 44, height: 44, borderRadius: 10, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }),
  val: { fontSize: '1.4rem', fontWeight: 700, color: '#111' },
  lbl: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  section: { background: '#fff', borderRadius: 12, padding: '1.25rem', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: '1rem' },
  sTitle: { fontSize: 15, fontWeight: 700, color: '#111', marginBottom: '1rem' },
  row: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.65rem 0', borderBottom: '1px solid #f3f4f6' },
  jobTitle: { fontWeight: 600, fontSize: 14, color: '#111' },
  jobMeta: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  amount: { fontWeight: 700, fontSize: 15, color: '#16a34a' },
  empty: { color: '#9ca3af', fontSize: 14, textAlign: 'center', padding: '1.5rem 0' },
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
    axios.get(`${API}/api/bids/my-bids`, { withCredentials: true })
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
    { icon: <DollarSign size={20} color="#16a34a" />, bg: '#dcfce7', val: `N${Number(totalEarned).toLocaleString()}`, lbl: 'Total Earned' },
    { icon: <TrendingUp size={20} color="#2563eb" />, bg: '#dbeafe', val: `N${Number(thisMonth).toLocaleString()}`, lbl: 'This Month' },
    { icon: <Clock size={20} color="#d97706" />,      bg: '#fef3c7', val: `N${Number(inEscrow).toLocaleString()}`, lbl: 'In Escrow' },
    { icon: <CheckCircle size={20} color="#7c3aed" />, bg: '#ede9fe', val: completed.length, lbl: 'Jobs Done' },
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
