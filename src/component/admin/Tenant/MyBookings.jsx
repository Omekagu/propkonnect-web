'use client'

import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { Calendar, MapPin, Shield, Eye, ChevronRight, Loader2, AlertCircle } from 'lucide-react'

const API = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4001'

const STATUS_MAP = {
  confirmed:       { label: 'Confirmed',       bg: '#e8f5e9', color: '#0F6040' },
  active:          { label: 'Active',           bg: '#e8f5e9', color: '#0B3D28' },
  pending_payment: { label: 'Awaiting Payment', bg: '#fffde7', color: '#b07d00' },
  checked_out:     { label: 'Checked Out',      bg: '#f0f0f0', color: '#555' },
  cancelled:       { label: 'Cancelled',        bg: '#fff5f5', color: '#c53030' },
  disputed:        { label: 'Disputed',         bg: '#fff5f5', color: '#c53030' }
}

function fmt (n, cur = 'NGN') {
  const sym = cur === 'USD' ? '$' : cur === 'GBP' ? '£' : '₦'
  return `${sym}${Number(n || 0).toLocaleString()}`
}

export default function MyBookings () {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState(null)

  useEffect(() => {
    const token = localStorage.getItem('authToken')
    axios.get(`${API}/api/bookings/my`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => setBookings(r.data.bookings || []))
      .catch(e => setErr(e.response?.data?.msg || 'Failed to load bookings'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
      <Loader2 size={32} style={{ color: 'var(--color-primary)', animation: 'spin 1s linear infinite' }} />
    </div>
  )

  if (err) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 60, gap: 12 }}>
      <AlertCircle size={36} color='#c53030' />
      <p style={{ color: '#c53030' }}>{err}</p>
    </div>
  )

  return (
    <div style={{ padding: '24px 0', maxWidth: 720 }}>
      <h2 style={{ color: 'var(--color-primary)', marginBottom: 20, fontSize: 22 }}>My Bookings</h2>

      {bookings.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#aaa' }}>
          <Calendar size={40} style={{ marginBottom: 12, opacity: 0.4 }} />
          <p>No bookings yet.</p>
          <p style={{ fontSize: 13 }}>Book a hotel or shortlet to see it here.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {bookings.map(b => {
            const p = b.property || {}
            const cur = b.payment?.currency || 'NGN'
            const s = STATUS_MAP[b.status] || { label: b.status, bg: '#f0f0f0', color: '#555' }
            const hasCaution = b.payment?.cautionFee > 0

            return (
              <div key={b._id} style={{ background: '#fff', borderRadius: 12, border: '1px solid #e0ead8', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,.05)' }}>
                <div style={{ display: 'flex', gap: 0 }}>
                  {p.images?.[0]
                    ? <img src={p.images[0]} alt={p.title} style={{ width: 120, objectFit: 'cover', flexShrink: 0 }} />
                    : <div style={{ width: 120, background: '#e0ead8', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Calendar size={28} color='#a0b890' /></div>
                  }
                  <div style={{ flex: 1, padding: '14px 16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                      <div>
                        <div style={{ fontWeight: 700, color: '#0B3D28', fontSize: 15, marginBottom: 2 }}>{p.title || 'Property'}</div>
                        {(p.city || p.state) && (
                          <div style={{ color: '#888', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4, marginBottom: 6 }}>
                            <MapPin size={11} /> {[p.city, p.state].filter(Boolean).join(', ')}
                          </div>
                        )}
                      </div>
                      <span style={{ background: s.bg, color: s.color, borderRadius: 20, padding: '3px 10px', fontSize: 12, fontWeight: 600, flexShrink: 0 }}>{s.label}</span>
                    </div>

                    <div style={{ display: 'flex', gap: 16, fontSize: 13, color: '#666', marginBottom: 8 }}>
                      <span><Calendar size={11} style={{ marginRight: 3 }} />{new Date(b.checkIn).toLocaleDateString('en-GB', { day:'numeric', month:'short' })} → {new Date(b.checkOut).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' })}</span>
                      <span>{b.nights} night{b.nights !== 1 ? 's' : ''}</span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontSize: 13 }}>
                        <strong style={{ color: '#0B3D28' }}>{fmt(b.payment?.total, cur)}</strong>
                        {hasCaution && (
                          <span style={{ marginLeft: 8, color: b.caution?.status === 'released' ? '#0F6040' : '#b07d00', fontSize: 12 }}>
                            <Shield size={11} style={{ marginRight: 2 }} />
                            Caution {b.caution?.status === 'released' ? 'refunded' : b.caution?.status === 'forfeited' ? 'forfeited' : `${fmt(b.caution?.amount, cur)} held`}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => window.open(`/booking/receipt?token=${b.receiptToken || ''}`, '_blank')}
                        style={{ background: 'none', border: '1px solid #c4e53c', borderRadius: 6, padding: '5px 12px', cursor: 'pointer', color: '#0B3D28', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}
                      >
                        <Eye size={13} /> Receipt <ChevronRight size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
