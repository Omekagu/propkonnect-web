'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'
import { Home, MapPin, Phone, Mail, Calendar, FileText, DollarSign } from 'lucide-react'

const API = process.env.NEXT_PUBLIC_BACKEND_URL

const s = {
  page: { padding: '1.5rem', fontFamily: 'sans-serif' },
  h2: { fontSize: '1.4rem', fontWeight: 700, color: '#111', margin: '0 0 1.25rem' },
  section: { background: '#fff', borderRadius: 12, padding: '1.25rem', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: '1rem' },
  sTitle: { fontSize: 15, fontWeight: 700, color: '#111', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: 8 },
  row: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #f3f4f6', fontSize: 13 },
  label: { color: '#6b7280', fontWeight: 600 },
  val: { color: '#111', textAlign: 'right', maxWidth: '55%' },
  imgWrap: { width: '100%', height: 220, background: '#f3f4f6', borderRadius: 10, overflow: 'hidden', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  img: { width: '100%', height: '100%', objectFit: 'cover' },
  propTitle: { fontWeight: 700, fontSize: '1.1rem', color: '#111', marginBottom: 4 },
  propMeta: { display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#6b7280' },
  badge: (color, bg) => ({ display: 'inline-block', padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600, color, background: bg }),
  contact: { display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: '1px solid #f3f4f6', fontSize: 13, color: '#374151' },
  empty: { textAlign: 'center', padding: '3rem', color: '#9ca3af' },
}

const STATUS_COLORS = {
  active:      ['#16a34a', '#f0fdf4'],
  pending:     ['#d97706', '#fef3c7'],
  terminated:  ['#6b7280', '#f3f4f6'],
  signed:      ['#2563eb', '#dbeafe'],
}

export default function MyHome () {
  const [lease, setLease] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    axios.get(`${API}/api/leases/my`, { withCredentials: true })
      .then(res => {
        const leases = res.data?.leases || res.data?.data || (res.data?.lease ? [res.data.lease] : [])
        setLease(leases[0] || null)
      })
      .catch(() => setError('Could not load lease information.'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div style={{ padding: '1.5rem', color: '#6b7280' }}>Loading home details…</div>

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
          {prop.bedrooms && <span style={{ marginLeft: 8, fontSize: 13, color: '#6b7280' }}>{prop.bedrooms} bed · {prop.bathrooms} bath</span>}
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
              <Mail size={15} color="#6b7280" />
              <a href={`mailto:${landlord.email}`} style={{ color: '#2563eb', textDecoration: 'none' }}>{landlord.email}</a>
            </div>
          )}
          {landlord.phone && (
            <div style={s.contact}>
              <Phone size={15} color="#6b7280" />
              <a href={`tel:${landlord.phone}`} style={{ color: '#2563eb', textDecoration: 'none' }}>{landlord.phone}</a>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
