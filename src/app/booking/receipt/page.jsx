'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import axios from 'axios'
import { FileText, MapPin, Calendar, Shield, Loader2, AlertCircle } from 'lucide-react'

const API = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4001'

function BookingReceiptContent () {
  const params = useSearchParams()
  const router = useRouter()
  const token = params.get('token')

  const [booking, setBooking] = useState(null)
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState(null)

  useEffect(() => {
    if (!token) { setErr('No receipt token.'); setLoading(false); return }
    axios.get(`${API}/api/bookings/receipt?token=${token}`)
      .then(res => setBooking(res.data.booking))
      .catch(e => setErr(e.response?.data?.msg || 'Receipt not found'))
      .finally(() => setLoading(false))
  }, [token])

  const fmt = (n, cur = 'NGN') => {
    const sym = cur === 'USD' ? '$' : cur === 'GBP' ? '£' : '₦'
    return `${sym}${Number(n || 0).toLocaleString()}`
  }

  if (loading) return <div style={center}><Loader2 size={36} style={{ color: '#0B3D28' }} /></div>
  if (err) return (
    <div style={center}>
      <AlertCircle size={40} color='#e53e3e' />
      <p style={{ color: '#c53030', marginTop: 12 }}>{err}</p>
    </div>
  )

  const b = booking
  const p = b?.property
  const cur = b?.payment?.currency || 'NGN'

  return (
    <div style={{ maxWidth: 520, margin: '40px auto', padding: '0 16px 60px' }}>
      {/* Header */}
      <div style={{ background: '#0B3D28', borderRadius: '12px 12px 0 0', padding: '24px 28px', color: '#fff', display: 'flex', alignItems: 'center', gap: 12 }}>
        <FileText size={24} color='#C4E53C' />
        <div>
          <div style={{ fontWeight: 700, fontSize: 18 }}>Booking Receipt</div>
          <div style={{ color: '#a8cc28', fontSize: 13 }}>PropNect</div>
        </div>
      </div>

      {/* Property */}
      {p?.images?.[0] && <img src={p.images[0]} alt={p.title} style={{ width: '100%', height: 180, objectFit: 'cover' }} />}
      <div style={{ background: '#fff', border: '1px solid #e0ead8', borderRadius: b?.property?.images?.[0] ? '0 0 12px 12px' : 12, padding: '24px 28px' }}>
        <h2 style={{ margin: '0 0 4px', color: '#0B3D28', fontSize: 18 }}>{p?.title || 'Property'}</h2>
        {(p?.city || p?.state) && (
          <p style={{ color: '#888', fontSize: 13, margin: '0 0 20px', display: 'flex', gap: 4, alignItems: 'center' }}>
            <MapPin size={12} /> {[p.city, p.state, p.country].filter(Boolean).join(', ')}
          </p>
        )}

        {/* Stay details */}
        <Section title='Stay Details'>
          <Row label='Guest'     value={b.guestName} />
          <Row label='Check-in'  value={new Date(b.checkIn).toLocaleDateString('en-GB', { weekday:'short', day:'numeric', month:'long', year:'numeric' })} />
          <Row label='Check-out' value={new Date(b.checkOut).toLocaleDateString('en-GB', { weekday:'short', day:'numeric', month:'long', year:'numeric' })} />
          <Row label='Nights'    value={b.nights} />
          <Row label='Guests'    value={b.guestCount} />
        </Section>

        {/* Payment */}
        <Section title='Payment Breakdown'>
          <Row label='Accommodation' value={fmt(b.payment?.rentAmount, cur)} />
          {b.payment?.cautionFee > 0 && (
            <Row
              label={<>Caution fee <span style={{ fontSize: 11, color: '#0F6040', fontWeight: 400 }}>(refundable)</span></>}
              value={fmt(b.payment.cautionFee, cur)}
            />
          )}
          <div style={{ borderTop: '1.5px solid #0B3D28', margin: '8px 0' }} />
          <Row label={<strong>Total paid</strong>} value={<strong style={{ color: '#0B3D28' }}>{fmt(b.payment?.total, cur)}</strong>} />
          <Row label='Method'    value='Paystack' />
          <Row label='Reference' value={<code style={{ fontSize: 12, background: '#f0f4ec', padding: '2px 6px', borderRadius: 4 }}>{b.payment?.reference}</code>} />
          {b.payment?.paidAt && <Row label='Paid at' value={new Date(b.payment.paidAt).toLocaleString()} />}
        </Section>

        {/* Caution notice */}
        {b.payment?.cautionFee > 0 && (
          <div style={{ background: '#f0f8e8', border: '1px solid #b8d98a', borderRadius: 8, padding: '12px 14px', display: 'flex', gap: 10, fontSize: 13, color: '#3d6b1e', marginBottom: 20 }}>
            <Shield size={16} style={{ flexShrink: 0, marginTop: 1 }} />
            <div>
              <strong>Caution fee held in escrow</strong>
              <p style={{ margin: '4px 0 0' }}>
                {b.caution?.status === 'released'
                  ? 'Your caution fee has been released. Check your wallet or bank account.'
                  : b.caution?.status === 'forfeited'
                  ? 'The caution fee was claimed by the host due to a damage report.'
                  : 'This amount is held safely by PropNect and will be returned after checkout if no damage is reported.'}
              </p>
            </div>
          </div>
        )}

        {/* Status */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <StatusBadge status={b.status} />
          <button onClick={() => window.print()} style={{ background: 'none', border: '1px solid #ccc', borderRadius: 6, padding: '6px 14px', cursor: 'pointer', fontSize: 13, color: '#555' }}>
            Print / Save PDF
          </button>
        </div>
      </div>

      {/* CTA */}
      <div style={{ textAlign: 'center', marginTop: 20 }}>
        <p style={{ color: '#888', fontSize: 13 }}>To track this booking or request your caution refund, log in with your email.</p>
        <button
          onClick={() => router.push(`/login?email=${encodeURIComponent(b.guestEmail)}&next=/admin/dashboard`)}
          style={{ background: '#0B3D28', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 28px', fontWeight: 700, cursor: 'pointer', fontSize: 14, marginTop: 8 }}
        >
          Log In to Dashboard
        </button>
      </div>
    </div>
  )
}

function Section ({ title, children }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ fontWeight: 700, color: '#0B3D28', fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8, paddingBottom: 4, borderBottom: '1px solid #e0ead8' }}>{title}</div>
      {children}
    </div>
  )
}

function Row ({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', fontSize: 14 }}>
      <span style={{ color: '#888' }}>{label}</span>
      <span style={{ fontWeight: 500, textAlign: 'right', maxWidth: '60%' }}>{value}</span>
    </div>
  )
}

function StatusBadge ({ status }) {
  const map = {
    confirmed:    ['#0F6040', '#e8f5e9', 'Confirmed'],
    active:       ['#0B3D28', '#e8f5e9', 'Active'],
    checked_out:  ['#555', '#f0f0f0', 'Checked Out'],
    cancelled:    ['#c53030', '#fff5f5', 'Cancelled'],
    pending_payment: ['#b07d00', '#fffde7', 'Pending Payment'],
    disputed:     ['#c53030', '#fff5f5', 'Disputed']
  }
  const [color, bg, label] = map[status] || ['#555', '#f0f0f0', status]
  return <span style={{ background: bg, color, borderRadius: 20, padding: '4px 12px', fontWeight: 600, fontSize: 12 }}>{label}</span>
}

const center = { minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40 }

export default function BookingReceiptPage () {
  return (
    <Suspense fallback={<div style={center}><Loader2 size={36} style={{ color: '#0B3D28' }} /></div>}>
      <BookingReceiptContent />
    </Suspense>
  )
}
