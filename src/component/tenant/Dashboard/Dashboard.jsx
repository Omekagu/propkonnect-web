'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'
import { Home, DollarSign, Wrench, FileText, AlertCircle, CheckCircle } from 'lucide-react'
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
  val: { fontSize: '1.4rem', fontWeight: 700, color: '#111' },
  lbl: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  section: { background: '#fff', borderRadius: 12, padding: '1.25rem', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: '1rem' },
  sTitle: { fontSize: 15, fontWeight: 700, color: '#111', marginBottom: '0.85rem' },
  leaseRow: { display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f3f4f6', fontSize: 13 },
  leaseLabel: { color: '#6b7280', fontWeight: 600 },
  leaseVal: { color: '#111' },
  alertBox: (c) => ({ display: 'flex', alignItems: 'center', gap: 10, background: c === 'warn' ? '#fef3c7' : '#f0fdf4', border: '1px solid ' + (c === 'warn' ? '#fde68a' : '#bbf7d0'), borderRadius: 8, padding: '0.75rem', fontSize: 13, color: c === 'warn' ? '#92400e' : '#166534' }),
  empty: { color: '#9ca3af', fontSize: 14 },
}

export default function TenantDashboard () {
  const { user } = useAuth()
  const [lease, setLease] = useState(null)
  const [maintenanceCount, setMaintenanceCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      axios.get(`${API}/api/leases/my`, { withCredentials: true }).catch(() => ({ data: null })),
      axios.get(`${API}/api/service-requests/my-requests`, { withCredentials: true }).catch(() => ({ data: { requests: [] } })),
    ]).then(([leaseRes, srRes]) => {
      const leases = leaseRes.data?.leases || leaseRes.data?.data || (leaseRes.data ? [leaseRes.data] : [])
      setLease(leases[0] || null)
      const srs = srRes.data?.requests || srRes.data?.data || []
      setMaintenanceCount(srs.filter(r => r.status === 'open' || r.status === 'in_progress').length)
    }).finally(() => setLoading(false))
  }, [])

  const daysUntilDue = lease?.nextPaymentDate
    ? Math.ceil((new Date(lease.nextPaymentDate) - new Date()) / 86400000)
    : null

  const stats = [
    { icon: <Home size={20} color="#2563eb" />,      bg: '#dbeafe', val: lease ? 'Active' : 'None',  lbl: 'Lease Status' },
    { icon: <DollarSign size={20} color="#16a34a" />, bg: '#dcfce7', val: lease?.rentAmount ? `N${Number(lease.rentAmount).toLocaleString()}` : '—', lbl: 'Monthly Rent' },
    { icon: <Wrench size={20} color="#d97706" />,    bg: '#fef3c7', val: maintenanceCount,            lbl: 'Open Requests' },
    { icon: <FileText size={20} color="#7c3aed" />,  bg: '#ede9fe', val: daysUntilDue != null ? `${daysUntilDue}d` : '—', lbl: 'Days to Due Date' },
  ]

  if (loading) return <div style={{ padding: '1.5rem', color: '#6b7280' }}>Loading dashboard…</div>

  return (
    <div style={s.page}>
      <div style={s.header}>
        <h2 style={s.h2}>Welcome back, {user?.firstName || 'Tenant'}!</h2>
        <p style={s.sub}>Here is your tenancy overview.</p>
      </div>

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

      {daysUntilDue != null && daysUntilDue <= 7 && (
        <div style={s.alertBox(daysUntilDue <= 3 ? 'warn' : 'ok')}>
          {daysUntilDue <= 3 ? <AlertCircle size={16} /> : <CheckCircle size={16} />}
          {daysUntilDue <= 0
            ? 'Your rent payment is overdue. Please pay as soon as possible.'
            : `Your rent is due in ${daysUntilDue} day${daysUntilDue !== 1 ? 's' : ''}. Pay early to avoid late fees.`
          }
        </div>
      )}

      {lease && (
        <div style={{ ...s.section, marginTop: '1rem' }}>
          <div style={s.sTitle}>Current Lease</div>
          {[
            ['Property',    lease.property?.title || lease.propertyId || '—'],
            ['Lease Start', lease.startDate ? new Date(lease.startDate).toLocaleDateString() : '—'],
            ['Lease End',   lease.endDate   ? new Date(lease.endDate).toLocaleDateString()   : '—'],
            ['Rent',        lease.rentAmount ? `N${Number(lease.rentAmount).toLocaleString()} / month` : '—'],
            ['Status',      lease.status || '—'],
          ].map(([label, val]) => (
            <div key={label} style={s.leaseRow}>
              <span style={s.leaseLabel}>{label}</span>
              <span style={s.leaseVal}>{val}</span>
            </div>
          ))}
        </div>
      )}

      {!lease && (
        <div style={s.section}>
          <p style={s.empty}>No active lease found. Contact your landlord or apply for a property to get started.</p>
        </div>
      )}
    </div>
  )
}
