'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react'

const API = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4001'

function BookingVerifyContent () {
  const params = useSearchParams()
  const router = useRouter()
  const ref =
    params.get('ref') || params.get('reference') || params.get('trxref')

  const [status, setStatus] = useState('loading') // loading | success | failed
  const [booking, setBooking] = useState(null)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    if (!ref) {
      setStatus('failed')
      setMsg('No payment reference found.')
      return
    }

    axios
      .post(`${API}/api/bookings/verify/${ref}`)
      .then(res => {
        setBooking(res.data.booking)
        setStatus('success')
      })
      .catch(e => {
        setMsg(
          e.response?.data?.msg ||
            'Payment verification failed. Please contact support if you were charged.'
        )
        setStatus('failed')
      })
  }, [ref])

  const fmt = n => `₦${Number(n || 0).toLocaleString()}`

  if (status === 'loading')
    return (
      <div style={center}>
        <Loader2 size={40} className='spin' style={{ color: '#0B3D28' }} />
        <p style={{ marginTop: 16, color: '#555' }}>Verifying your payment…</p>
      </div>
    )

  if (status === 'failed')
    return (
      <div style={center}>
        <XCircle size={48} color='#e53e3e' />
        <h2 style={{ color: '#c53030', marginTop: 12 }}>
          Payment Not Confirmed
        </h2>
        <p style={{ color: '#666', maxWidth: 360, textAlign: 'center' }}>
          {msg}
        </p>
        <button onClick={() => router.back()} style={btnOutline}>
          Go Back
        </button>
      </div>
    )

  const b = booking
  const property = b?.property

  return (
    <div style={center}>
      <CheckCircle2 size={56} color='#0B3D28' />
      <h2 style={{ color: '#0B3D28', margin: '12px 0 4px' }}>
        Booking Confirmed!
      </h2>
      <p style={{ color: '#555', marginBottom: 24 }}>
        A receipt has been sent to <strong>{b?.guestEmail}</strong>
      </p>

      <div style={card}>
        {property?.images?.[0] && (
          <img
            src={property.images[0]}
            alt={property.title}
            style={{
              width: '100%',
              height: 160,
              objectFit: 'cover',
              borderRadius: 8,
              marginBottom: 14
            }}
          />
        )}
        <h3 style={{ margin: '0 0 12px', color: '#0B3D28' }}>
          {property?.title || 'Your Property'}
        </h3>
        <Row
          label='Check-in'
          value={new Date(b.checkIn).toLocaleDateString('en-GB', {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
            year: 'numeric'
          })}
        />
        <Row
          label='Check-out'
          value={new Date(b.checkOut).toLocaleDateString('en-GB', {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
            year: 'numeric'
          })}
        />
        <Row label='Nights' value={b.nights} />
        <Row label='Guests' value={b.guestCount} />
        <div style={{ borderTop: '1px solid #e0ead8', margin: '10px 0' }} />
        <Row label='Accommodation' value={fmt(b.payment?.rentAmount)} />
        {b.payment?.cautionFee > 0 && (
          <Row
            label={
              <>
                Caution fee{' '}
                <span style={{ fontSize: 11, color: '#0F6040' }}>
                  (refundable)
                </span>
              </>
            }
            value={fmt(b.payment.cautionFee)}
          />
        )}
        <Row
          label={<strong style={{ color: '#0B3D28' }}>Total paid</strong>}
          value={
            <strong style={{ color: '#0B3D28' }}>
              {fmt(b.payment?.total)}
            </strong>
          }
        />
        <p style={{ fontSize: 12, color: '#999', marginTop: 8 }}>
          Ref: {b.payment?.reference}
        </p>
      </div>

      {b.payment?.cautionFee > 0 && (
        <div
          style={{
            background: '#fffbe6',
            border: '1px solid #f0d060',
            borderRadius: 8,
            padding: '12px 16px',
            maxWidth: 400,
            textAlign: 'center',
            fontSize: 13,
            color: '#7a6000',
            margin: '16px 0'
          }}
        >
          Your caution fee of <strong>{fmt(b.payment.cautionFee)}</strong> is
          held safely by propnekt and will be refunded after checkout if no
          damage is reported.
        </div>
      )}

      <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
        <button
          onClick={() =>
            router.push(`/booking/receipt?token=${b.receiptToken || ''}`)
          }
          style={btnPrimary}
        >
          View Receipt
        </button>
        <button
          onClick={() => router.push('/admin/dashboard')}
          style={btnOutline}
        >
          My Bookings
        </button>
      </div>
      <p style={{ fontSize: 12, color: '#999', marginTop: 14 }}>
        Log in with <strong>{b?.guestEmail}</strong> anytime to track your
        booking — no password needed, just OTP.
      </p>
    </div>
  )
}

function Row ({ label, value }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        padding: '4px 0',
        fontSize: 14
      }}
    >
      <span style={{ color: '#888' }}>{label}</span>
      <span style={{ fontWeight: 500 }}>{value}</span>
    </div>
  )
}

const center = {
  minHeight: '70vh',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '40px 20px'
}
const card = {
  background: '#f5f8f2',
  borderRadius: 12,
  padding: '20px 24px',
  width: '100%',
  maxWidth: 400,
  margin: '8px 0'
}
const btnPrimary = {
  background: '#C4E53C',
  color: '#0B3D28',
  border: 'none',
  borderRadius: 8,
  padding: '10px 24px',
  fontWeight: 700,
  cursor: 'pointer',
  fontSize: 14
}
const btnOutline = {
  background: 'transparent',
  color: '#0B3D28',
  border: '1.5px solid #0B3D28',
  borderRadius: 8,
  padding: '10px 24px',
  fontWeight: 600,
  cursor: 'pointer',
  fontSize: 14
}

export default function BookingVerifyPage () {
  return (
    <Suspense
      fallback={
        <div style={center}>
          <Loader2 size={40} style={{ color: '#0B3D28' }} />
        </div>
      }
    >
      <BookingVerifyContent />
    </Suspense>
  )
}
