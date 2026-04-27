'use client'

import { useState, useEffect } from 'react'
import { leases as leasesApi } from '@/libs/api'
import { Home, MapPin, Phone, Mail, Calendar, FileText, DollarSign } from 'lucide-react'

const D = {
  bg:      '#0d1117',
  surface: '#161b22',
  border:  'rgba(255,255,255,0.06)',
  text:    '#e6edf3',
  muted:   '#7d8590',
  accent:  '#C4E53C',
  primary: '#0B3D28',
}

const s = {
  page:    { padding: '24px 28px', background: D.bg, minHeight: '100%', color: D.text },
  h2:      { fontSize: '1.25rem', fontWeight: 800, color: D.text, margin: '0 0 20px', letterSpacing: '-0.3px' },
  section: { background: D.surface, borderRadius: 14, padding: '18px', border: `1px solid ${D.border}`, marginBottom: 12 },
  sTitle:  { fontSize: 13, fontWeight: 700, color: D.muted, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8, textTransform: 'uppercase', letterSpacing: '0.06em' },
  row:     { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderBottom: `1px solid rgba(255,255,255,0.04)`, fontSize: 13 },
  label:   { color: D.muted, fontWeight: 500 },
  val:     { color: D.text, textAlign: 'right', maxWidth: '55%', fontWeight: 600 },
  imgWrap: { width: '100%', height: 220, background: 'rgba(196,229,60,0.04)', borderRadius: 10, overflow: 'hidden', marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${D.border}` },
  img:     { width: '100%', height: '100%', objectFit: 'cover' },
  propTitle: { fontWeight: 800, fontSize: '1.05rem', color: D.text, marginBottom: 4 },
  propMeta:  { display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: D.muted },
  badge: (color, bg) => ({ display: 'inline-block', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, color, background: bg }),
  contact: { display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: `1px solid rgba(255,255,255,0.04)`, fontSize: 13, color: D.text },
  empty:   { textAlign: 'center', padding: '3rem', color: D.muted },
}

const STATUS_COLORS = {
  active:     ['#4ade80', 'rgba(34,197,94,0.12)'],
  pending:    ['#fbbf24', 'rgba(245,158,11,0.12)'],
  terminated: ['#7d8590', 'rgba(255,255,255,0.06)'],
  signed:     ['#60a5fa', 'rgba(59,130,246,0.12)'],
}

export default function MyHome () {
  const [lease, setLease] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    leasesApi.getMy()
      .then(res => {
        const leases = res.data?.leases || res.data?.data || (res.data?.lease ? [res.data.lease] : [])
        setLease(leases[0] || null)
      })
      .catch(() => setError('Could not load lease information.'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div style={{ padding: '1.5rem', color: '#7d8590', background: '#0d1117', minHeight: '100%' }}>Loading home details…</div>

  if (error || !lease) {
    return (
      <div style={s.page}>
        <h2 style={s.h2}>My Home</h2>
        <div style={s.section}>
          <div style={s.empty}>
            <Home size={40} opacity={0.3} style={{ display: 'block', margin: '0 auto 10px' }} />
            <p>{error || 'No active lease found. Your home details will appear here once a lease is created.'}</p>
          </div>
        </div>
      </div>
    )
  }

  const prop = lease.property || {}
  const landlord = lease.landlord || prop.owner || {}
  const [statusColor, statusBg] = STATUS_COLORS[lease.status] || STATUS_COLORS.active

  return (
    <div style={s.page}>
      <h2 style={s.h2}>My Home</h2>

      <div style={s.section}>
        {prop.images?.[0] ? (
          <div style={s.imgWrap}><img src={prop.images[0]} alt={prop.title} style={s.img} /></div>
        ) : (
          <div style={s.imgWrap}><Home size={48} opacity={0.2} /></div>
        )}
        <div style={s.propTitle}>{prop.title || 'Your Property'}</div>
        <div style={s.propMeta}>
          <MapPin size={14} />
          {[prop.address, prop.city, prop.state].filter(Boolean).join(', ') || 'Address not available'}
        </div>
        <div style={{ marginTop: 10 }}>
          <span style={s.badge(statusColor, statusBg)}>{lease.status || 'Active'}</span>
          {prop.bedrooms && <span style={{ marginLeft: 8, fontSize: 12, color: D.muted }}>{prop.bedrooms} bed · {prop.bathrooms} bath</span>}
        </div>
      </div>

      <div style={s.section}>
        <div style={s.sTitle}><FileText size={16} /> Lease Details</div>
        {[
          ['Start Date',   lease.startDate ? new Date(lease.startDate).toLocaleDateString() : '—'],
          ['End Date',     lease.endDate   ? new Date(lease.endDate).toLocaleDateString()   : '—'],
          ['Monthly Rent', lease.rentAmount ? `N${Number(lease.rentAmount).toLocaleString()}` : '—'],
          ['Next Payment', lease.nextPaymentDate ? new Date(lease.nextPaymentDate).toLocaleDateString() : '—'],
          ['Deposit',      lease.depositAmount ? `N${Number(lease.depositAmount).toLocaleString()}` : '—'],
          ['Status',       lease.status || '—'],
        ].map(([label, val]) => (
          <div key={label} style={s.row}>
            <span style={s.label}>{label}</span>
            <span style={s.val}>{val}</span>
          </div>
        ))}
      </div>

      {(landlord.firstName || landlord.email || landlord.phone) && (
        <div style={s.section}>
          <div style={s.sTitle}><Phone size={16} /> Landlord Contact</div>
          {(landlord.firstName || landlord.lastName) && (
            <div style={s.contact}>
              <Home size={15} color="#6b7280" />
              <span>{[landlord.firstName, landlord.lastName].filter(Boolean).join(' ')}</span>
            </div>
          )}
          {landlord.email && (
            <div style={s.contact}>
              <Mail size={15} color={D.muted} />
              <a href={`mailto:${landlord.email}`} style={{ color: D.accent, textDecoration: 'none' }}>{landlord.email}</a>
            </div>
          )}
          {landlord.phone && (
            <div style={s.contact}>
              <Phone size={15} color={D.muted} />
              <a href={`tel:${landlord.phone}`} style={{ color: D.accent, textDecoration: 'none' }}>{landlord.phone}</a>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
