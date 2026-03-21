'use client'

import { useState, useEffect } from 'react'
import { api } from '@/libs/api-client'
import { Briefcase, Star, DollarSign, CheckCircle, Clock, TrendingUp } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

const s = {
  page: { padding: '1.5rem', fontFamily: 'sans-serif', background: '#0d1117', minHeight: '100%' },
  header: { marginBottom: '1.5rem' },
  h2: { fontSize: '1.4rem', fontWeight: 700, color: '#e6edf3', margin: '0 0 4px' },
  sub: { color: '#8b949e', fontSize: 14, margin: 0 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' },
  card: { background: '#161b22', borderRadius: 12, padding: '1.25rem', border: '1px solid #30363d', display: 'flex', alignItems: 'center', gap: 14 },
  iconBox: (bg) => ({ width: 44, height: 44, borderRadius: 10, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }),
  val: { fontSize: '1.5rem', fontWeight: 700, color: '#e6edf3' },
  lbl: { fontSize: 12, color: '#8b949e', marginTop: 2 },
  section: { background: '#161b22', borderRadius: 12, padding: '1.25rem', border: '1px solid #30363d', marginBottom: '1rem' },
  sectionTitle: { fontSize: 15, fontWeight: 700, color: '#e6edf3', marginBottom: '1rem' },
  jobRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.65rem 0', borderBottom: '1px solid #21262d' },
  jobTitle: { fontWeight: 600, fontSize: 14, color: '#e6edf3' },
  jobMeta: { fontSize: 12, color: '#8b949e', marginTop: 2 },
  badge: (color, bg) => ({ display: 'inline-block', padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: bg, color }),
  empty: { color: '#6e7681', fontSize: 14, textAlign: 'center', padding: '1.5rem 0' },
}

export default function ArtisanDashboard () {
  const { user } = useAuth()
  const [bids, setBids] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/api/bids/my-bids')
      .then(res => setBids(res.data.bids || res.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const activeBids     = bids.filter(b => b.status === 'accepted')
  const completedBids  = bids.filter(b => b.status === 'completed' || b.serviceRequest?.status === 'completed')
  const pendingBids    = bids.filter(b => b.status === 'pending')
  const totalEarned    = completedBids.reduce((sum, b) => sum + (b.agreedAmount || b.amount || 0), 0)
  const rating         = user?.artisanProfile?.rating || user?.stats?.averageRating || 0

  const stats = [
    { icon: <Briefcase size={20} color='#58a6ff' />, bg: 'rgba(56,139,253,.15)', val: activeBids.length,    lbl: 'Active Jobs' },
    { icon: <CheckCircle size={20} color='#3fb950' />, bg: 'rgba(46,160,67,.15)', val: completedBids.length, lbl: 'Completed' },
    { icon: <Clock size={20} color='#d29922' />,       bg: 'rgba(210,153,34,.15)', val: pendingBids.length,   lbl: 'Pending Bids' },
    { icon: <DollarSign size={20} color='#bc8cff' />,  bg: 'rgba(188,140,255,.15)', val: `₦${Number(totalEarned).toLocaleString()}`, lbl: 'Total Earned' },
    { icon: <Star size={20} color='#d29922' />,        bg: 'rgba(210,153,34,.15)', val: rating ? Number(rating).toFixed(1) : '—', lbl: 'Rating' },
  ]

  return (
    <div style={s.page}>
      <div style={s.header}>
        <h2 style={s.h2}>Welcome back, {user?.firstName || 'Artisan'}!</h2>
        <p style={s.sub}>Here's an overview of your activity.</p>
      </div>

      {loading ? (
        <p style={{ color: '#8b949e' }}>Loading…</p>
      ) : (
        <>
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
            <div style={s.sectionTitle}>Active Jobs</div>
            {activeBids.length === 0 ? (
              <p style={s.empty}>No active jobs. Browse available jobs to place a bid.</p>
            ) : activeBids.map(bid => (
              <div key={bid._id} style={s.jobRow}>
                <div>
                  <div style={s.jobTitle}>{bid.serviceRequest?.title || 'Job'}</div>
                  <div style={s.jobMeta}>{bid.serviceRequest?.category || ''} · Agreed: ₦{Number(bid.agreedAmount || bid.amount).toLocaleString()}</div>
                </div>
                <span style={s.badge('#d29922', 'rgba(210,153,34,.15)')}>In Progress</span>
              </div>
            ))}
          </div>

          <div style={s.section}>
            <div style={s.sectionTitle}>Pending Bids</div>
            {pendingBids.length === 0 ? (
              <p style={s.empty}>No pending bids.</p>
            ) : pendingBids.map(bid => (
              <div key={bid._id} style={s.jobRow}>
                <div>
                  <div style={s.jobTitle}>{bid.serviceRequest?.title || 'Job'}</div>
                  <div style={s.jobMeta}>Bid amount: ₦{Number(bid.amount).toLocaleString()}</div>
                </div>
                <span style={s.badge('#58a6ff', 'rgba(56,139,253,.15)')}>Awaiting Response</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
