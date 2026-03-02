'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'
import { Briefcase, Star, DollarSign, CheckCircle, Clock, TrendingUp } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

const API = process.env.NEXT_PUBLIC_BACKEND_URL

const s = {
  page: { padding: '1.5rem', fontFamily: 'sans-serif' },
  header: { marginBottom: '1.5rem' },
  h2: { fontSize: '1.4rem', fontWeight: 700, color: '#111', margin: '0 0 4px' },
  sub: { color: '#6b7280', fontSize: 14, margin: 0 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' },
  card: { background: '#fff', borderRadius: 12, padding: '1.25rem', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', gap: 14 },
  iconBox: (bg) => ({ width: 44, height: 44, borderRadius: 10, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }),
  val: { fontSize: '1.5rem', fontWeight: 700, color: '#111' },
  lbl: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  section: { background: '#fff', borderRadius: 12, padding: '1.25rem', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: '1rem' },
  sectionTitle: { fontSize: 15, fontWeight: 700, color: '#111', marginBottom: '1rem' },
  jobRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.65rem 0', borderBottom: '1px solid #f3f4f6' },
  jobTitle: { fontWeight: 600, fontSize: 14, color: '#111' },
  jobMeta: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  badge: (color) => ({ display: 'inline-block', padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: color + '1a', color }),
  empty: { color: '#9ca3af', fontSize: 14, textAlign: 'center', padding: '1.5rem 0' },
}

export default function ArtisanDashboard () {
  const { user } = useAuth()
  const [bids, setBids] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    axios.get(`${API}/api/bids/my-bids`, { withCredentials: true })
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
    { icon: <Briefcase size={20} color='#2563eb' />, bg: '#dbeafe', val: activeBids.length,    lbl: 'Active Jobs' },
    { icon: <CheckCircle size={20} color='#16a34a' />, bg: '#dcfce7', val: completedBids.length, lbl: 'Completed' },
    { icon: <Clock size={20} color='#d97706' />,       bg: '#fef3c7', val: pendingBids.length,   lbl: 'Pending Bids' },
    { icon: <DollarSign size={20} color='#7c3aed' />,  bg: '#ede9fe', val: `₦${Number(totalEarned).toLocaleString()}`, lbl: 'Total Earned' },
    { icon: <Star size={20} color='#f59e0b' />,        bg: '#fef9c3', val: rating ? Number(rating).toFixed(1) : '—', lbl: 'Rating' },
  ]

  return (
    <div style={s.page}>
      <div style={s.header}>
        <h2 style={s.h2}>Welcome back, {user?.firstName || 'Artisan'}!</h2>
        <p style={s.sub}>Here's an overview of your activity.</p>
      </div>

      {loading ? (
        <p style={{ color: '#6b7280' }}>Loading…</p>
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
                <span style={s.badge('#d97706')}>In Progress</span>
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
                <span style={s.badge('#2563eb')}>Awaiting Response</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
