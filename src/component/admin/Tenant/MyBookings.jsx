'use client'

import React, { useEffect, useState } from 'react'
import { bookings as bookingsApi } from '@/libs/api'
import { Calendar, MapPin, Shield, Eye, ChevronRight, Loader2, AlertCircle } from 'lucide-react'

const D = { bg: '#0d1117', surface: '#161b22', border: 'rgba(255,255,255,0.06)', border2: 'rgba(255,255,255,0.1)', text: '#e6edf3', muted: '#7d8590', accent: '#C4E53C', primary: '#0B3D28' }

const STATUS = {
  confirmed:       { label: 'Confirmed',       bg: 'rgba(34,197,94,0.12)',   color: '#4ade80' },
  active:          { label: 'Active',           bg: 'rgba(34,197,94,0.12)',   color: '#4ade80' },
  pending_payment: { label: 'Awaiting Payment', bg: 'rgba(245,158,11,0.12)', color: '#fbbf24' },
  checked_out:     { label: 'Checked Out',      bg: 'rgba(255,255,255,0.06)', color: '#7d8590' },
  cancelled:       { label: 'Cancelled',        bg: 'rgba(239,68,68,0.1)',   color: '#f87171' },
  disputed:        { label: 'Disputed',         bg: 'rgba(239,68,68,0.1)',   color: '#f87171' }
}

function fmt (n, cur = 'NGN') {
  const sym = cur === 'USD' ? '$' : cur === 'GBP' ? '£' : '₦'
  return `${sym}${Number(n || 0).toLocaleString()}`
}

function fmtDate (d) {
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}
function fmtShort (d) {
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

export default function MyBookings () {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading]   = useState(true)
  const [err, setErr]           = useState(null)

  useEffect(() => {
    bookingsApi.getMy()
      .then(r => setBookings(r.data.bookings || []))
      .catch(e => setErr(e.response?.data?.msg || 'Failed to load bookings'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 80, background: D.bg, minHeight: '100%' }}>
      <Loader2 size={28} style={{ color: D.accent, animation: 'spin 1s linear infinite' }} />
    </div>
  )

  if (err) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 60, gap: 12, background: D.bg, minHeight: '100%' }}>
      <AlertCircle size={36} color='#f87171' />
      <p style={{ color: '#f87171', margin: 0 }}>{err}</p>
    </div>
  )

  return (
    <div style={{ padding: '24px 28px', background: D.bg, minHeight: '100%', color: D.text }}>

      {bookings.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 24px', color: D.muted }}>
          <Calendar size={40} style={{ marginBottom: 14, opacity: 0.25 }} color={D.muted} />
          <p style={{ fontSize: 16, fontWeight: 700, color: D.text, marginBottom: 6 }}>No bookings yet</p>
          <p style={{ fontSize: 13, margin: 0 }}>Book a hotel or shortlet to see it here.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {bookings.map(b => {
            const p  = b.property || {}
            const cur = b.payment?.currency || 'NGN'
            const st  = STATUS[b.status] || { label: b.status, bg: 'rgba(255,255,255,0.06)', color: D.muted }
            const hasCaution = b.payment?.cautionFee > 0
            const img = p.images?.[0]?.url || p.images?.[0] || null

            return (
              <div key={b._id} style={{ background: D.surface, borderRadius: 14, border: `1px solid ${D.border}`, overflow: 'hidden', transition: 'border-color 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = D.border2}
                onMouseLeave={e => e.currentTarget.style.borderColor = D.border}
              >
                <div style={{ display: 'flex' }}>
                  {/* Image */}
                  {img
                    ? <img src={img} alt={p.title} style={{ width: 110, objectFit: 'cover', flexShrink: 0 }} />
                    : <div style={{ width: 110, background: 'rgba(196,229,60,0.04)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRight: `1px solid ${D.border}` }}>
                        <Calendar size={24} color='rgba(196,229,60,0.2)' />
                      </div>
                  }

                  {/* Content */}
                  <div style={{ flex: 1, padding: '14px 16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 6 }}>
                      <div>
                        <div style={{ fontWeight: 700, color: D.text, fontSize: 14, marginBottom: 3 }}>{p.title || 'Property'}</div>
                        {(p.city || p.state) && (
                          <div style={{ color: D.muted, fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                            <MapPin size={11} /> {[p.city, p.state].filter(Boolean).join(', ')}
                          </div>
                        )}
                      </div>
                      <span style={{ background: st.bg, color: st.color, borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 700, flexShrink: 0, letterSpacing: '0.02em' }}>
                        {st.label}
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: 14, fontSize: 12, color: D.muted, marginBottom: 10, flexWrap: 'wrap' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Calendar size={11} /> {fmtShort(b.checkIn)} → {fmtDate(b.checkOut)}
                      </span>
                      <span>{b.nights} night{b.nights !== 1 ? 's' : ''}</span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                      <div style={{ fontSize: 13 }}>
                        <strong style={{ color: D.accent, fontWeight: 800 }}>{fmt(b.payment?.total, cur)}</strong>
                        {hasCaution && (
                          <span style={{ marginLeft: 8, color: b.caution?.status === 'released' ? '#4ade80' : '#fbbf24', fontSize: 11 }}>
                            <Shield size={11} style={{ marginRight: 2, verticalAlign: 'middle' }} />
                            Caution {b.caution?.status === 'released' ? 'refunded' : b.caution?.status === 'forfeited' ? 'forfeited' : `${fmt(b.caution?.amount, cur)} held`}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => window.open(`/booking/receipt?token=${b.receiptToken || ''}`, '_blank')}
                        style={{ background: 'none', border: `1px solid rgba(196,229,60,0.25)`, borderRadius: 7, padding: '5px 12px', cursor: 'pointer', color: D.accent, fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}
                      >
                        <Eye size={13} /> Receipt <ChevronRight size={11} />
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
