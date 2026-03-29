'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import axios from 'axios'
import { MapPin, Loader2, AlertCircle, CheckCircle2, Shield, Phone, Mail, Globe } from 'lucide-react'

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
    axios
      .get(`${API}/api/bookings/receipt?token=${token}`)
      .then(res => setBooking(res.data.booking))
      .catch(e => setErr(e.response?.data?.msg || 'Receipt not found'))
      .finally(() => setLoading(false))
  }, [token])

  const fmt = (n, cur = 'NGN') => {
    const sym = cur === 'USD' ? '$' : cur === 'GBP' ? '£' : '₦'
    return `${sym}${Number(n || 0).toLocaleString()}`
  }
  const fmtDate = d => d ? new Date(d).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' }) : '—'
  const fmtDateTime = d => d ? new Date(d).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'

  if (loading) return <div style={center}><Loader2 size={36} style={{ color: '#0B3D28', animation: 'spin 1s linear infinite' }} /></div>
  if (err) return (
    <div style={center}>
      <AlertCircle size={40} color='#e53e3e' />
      <p style={{ color: '#c53030', marginTop: 12 }}>{err}</p>
    </div>
  )

  const b = booking
  const p = b?.property
  const cur = b?.payment?.currency || 'NGN'
  const receiptNum = `REC-${b?._id?.toString().slice(-8).toUpperCase()}`
  const categoryLabel = p?.category
    ? p.category.charAt(0).toUpperCase() + p.category.slice(1).toLowerCase()
    : 'Property'

  return (
    <div style={{ maxWidth: 560, margin: '32px auto', padding: '0 16px 80px', fontFamily: 'Inter, sans-serif' }}>

      {/* ── Company Header ── */}
      <div style={{ background: '#0B3D28', borderRadius: '14px 14px 0 0', padding: '28px 32px', color: '#fff' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <div style={{
                width: 38, height: 38, background: '#C4E53C', borderRadius: 8,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 900, color: '#0B3D28', fontSize: 16
              }}>P</div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 20, letterSpacing: '-0.5px' }}>PropNect</div>
                <div style={{ color: '#C4E53C', fontSize: 11, letterSpacing: '0.08em' }}>PROPERTY RECEIPT</div>
              </div>
            </div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', marginTop: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Mail size={10} /> support@propnekt.app</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}><Globe size={10} /> propnekt.app</div>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>Receipt No.</div>
            <div style={{ fontWeight: 700, fontSize: 15, color: '#C4E53C', letterSpacing: '0.05em' }}>{receiptNum}</div>
            {b?.payment?.paidAt && (
              <>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 6 }}>Date Issued</div>
                <div style={{ fontSize: 12, color: '#fff' }}>{fmtDateTime(b.payment.paidAt)}</div>
              </>
            )}
          </div>
        </div>

        {/* Paid stamp */}
        <div style={{ marginTop: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
          <CheckCircle2 size={18} color='#C4E53C' />
          <span style={{ fontWeight: 700, fontSize: 13, color: '#C4E53C', letterSpacing: '0.04em' }}>
            PAYMENT CONFIRMED
          </span>
        </div>
      </div>

      {/* ── Property Image ── */}
      {p?.images?.[0] && (
        <img src={p.images[0]} alt={p?.title} style={{ width: '100%', height: 180, objectFit: 'cover', display: 'block' }} />
      )}

      {/* ── Body ── */}
      <div style={{
        background: '#fff',
        border: '1px solid #e2ead8',
        borderTop: p?.images?.[0] ? 'none' : undefined,
        borderRadius: p?.images?.[0] ? '0 0 14px 14px' : '0 0 14px 14px',
        padding: '28px 32px'
      }}>

        {/* Property details */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 4 }}>
            <span style={{ fontSize: 11, background: '#e8f5e9', color: '#0F6040', borderRadius: 20, padding: '2px 10px', fontWeight: 600 }}>
              {categoryLabel}
            </span>
          </div>
          <h2 style={{ margin: '6px 0 4px', color: '#0B3D28', fontSize: 20, fontWeight: 800 }}>{p?.title || 'Property'}</h2>
          {(p?.address || p?.city) && (
            <p style={{ color: '#666', fontSize: 13, margin: 0, display: 'flex', gap: 4, alignItems: 'center' }}>
              <MapPin size={12} /> {[p?.address, p?.city, p?.state, p?.country].filter(Boolean).join(', ')}
            </p>
          )}
        </div>

        <Divider />

        {/* Guest / Billed To */}
        <Section label='BILLED TO'>
          <Row label='Guest Name' value={b.guestName} />
          {b.guestEmail && <Row label='Email' value={b.guestEmail} />}
          {b.guestPhone && <Row label='Phone' value={b.guestPhone} />}
        </Section>

        <Divider />

        {/* Stay details */}
        <Section label='STAY DETAILS'>
          <Row label='Check-in' value={fmtDate(b.checkIn)} />
          <Row label='Check-out' value={fmtDate(b.checkOut)} />
          <Row label='Duration' value={`${b.nights} night${b.nights !== 1 ? 's' : ''}`} />
          <Row label='Guests' value={b.guestCount} />
          {b.roomTypeId && <Row label='Room Type' value={b.roomTypeId} />}
        </Section>

        <Divider />

        {/* Payment breakdown */}
        <Section label='PAYMENT BREAKDOWN'>
          <Row label={`${categoryLabel} Fee`} value={fmt(b.payment?.rentAmount, cur)} />
          {b.payment?.cautionFee > 0 && (
            <Row
              label={<span>Caution / Security Deposit <span style={{ fontSize: 11, color: '#0F6040' }}>(refundable)</span></span>}
              value={fmt(b.payment.cautionFee, cur)}
            />
          )}
          <div style={{ borderTop: '2px solid #0B3D28', margin: '10px 0' }} />
          <Row
            label={<strong style={{ color: '#0B3D28' }}>Total Paid</strong>}
            value={<strong style={{ color: '#0B3D28', fontSize: 16 }}>{fmt(b.payment?.total, cur)}</strong>}
          />
          <Row label='Payment Method' value='Paystack (Card / Transfer)' />
          <Row label='Reference' value={
            <code style={{ fontSize: 11, background: '#f0f4ec', padding: '2px 6px', borderRadius: 4, letterSpacing: '0.03em' }}>
              {b.payment?.reference}
            </code>
          } />
          {b.payment?.paidAt && <Row label='Paid At' value={fmtDateTime(b.payment.paidAt)} />}
        </Section>

        {/* Caution notice */}
        {b.payment?.cautionFee > 0 && (
          <div style={{
            background: '#f0f8e8', border: '1px solid #c0dfa0', borderRadius: 8,
            padding: '12px 16px', display: 'flex', gap: 10, fontSize: 13, color: '#3d6b1e', marginTop: 20
          }}>
            <Shield size={16} style={{ flexShrink: 0, marginTop: 2 }} />
            <div>
              <strong>Caution fee held in escrow</strong>
              <p style={{ margin: '4px 0 0', lineHeight: 1.5 }}>
                {b.caution?.status === 'released'
                  ? 'Your caution fee has been released to your bank account.'
                  : b.caution?.status === 'forfeited'
                  ? 'The caution fee was claimed by the host due to a reported damage.'
                  : 'Your deposit is held safely by PropNect and will be returned within 48 hours after checkout, provided no damage is reported.'}
              </p>
            </div>
          </div>
        )}

        <Divider />

        {/* Status + actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginTop: 20 }}>
          <StatusBadge status={b.status} />
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => window.print()} style={btnOutline}>Print / Save PDF</button>
            <button onClick={() => router.push(`/login?email=${encodeURIComponent(b.guestEmail)}&next=/admin/dashboard`)} style={btnPrimary}>
              My Dashboard
            </button>
          </div>
        </div>
      </div>

      {/* ── Footer ── */}
      <div style={{ textAlign: 'center', marginTop: 20, padding: '0 8px' }}>
        <p style={{ color: '#aaa', fontSize: 11, lineHeight: 1.6 }}>
          This is an official receipt from PropNect. For disputes or support, contact{' '}
          <a href='mailto:support@propnekt.app' style={{ color: '#0B3D28' }}>support@propnekt.app</a>{' '}
          with your receipt number <strong>{receiptNum}</strong>.
        </p>
      </div>

      <style>{`@media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }`}</style>
    </div>
  )
}

function Section ({ label, children }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', color: '#0B3D28', textTransform: 'uppercase', marginBottom: 10 }}>
        {label}
      </div>
      {children}
    </div>
  )
}

function Row ({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '5px 0', fontSize: 14 }}>
      <span style={{ color: '#777', flex: '0 0 auto', marginRight: 12 }}>{label}</span>
      <span style={{ fontWeight: 500, textAlign: 'right', maxWidth: '60%' }}>{value}</span>
    </div>
  )
}

function Divider () {
  return <div style={{ borderTop: '1px solid #edf2e8', margin: '16px 0' }} />
}

function StatusBadge ({ status }) {
  const map = {
    confirmed:       ['#0F6040', '#e8f5e9', 'Confirmed'],
    active:          ['#0B3D28', '#d4edda', 'Active / Checked In'],
    checked_out:     ['#555',    '#f0f0f0', 'Checked Out'],
    cancelled:       ['#c53030', '#fff5f5', 'Cancelled'],
    pending_payment: ['#b07d00', '#fffde7', 'Pending Payment'],
    disputed:        ['#c53030', '#fff5f5', 'Disputed']
  }
  const [color, bg, label] = map[status] || ['#555', '#f0f0f0', status]
  return (
    <span style={{ background: bg, color, borderRadius: 20, padding: '5px 14px', fontWeight: 700, fontSize: 12, border: `1px solid ${color}33` }}>
      {label}
    </span>
  )
}

const center = { minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40 }
const btnPrimary = { background: '#0B3D28', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 20px', fontWeight: 700, cursor: 'pointer', fontSize: 13 }
const btnOutline = { background: 'transparent', color: '#0B3D28', border: '1.5px solid #0B3D28', borderRadius: 8, padding: '9px 20px', fontWeight: 600, cursor: 'pointer', fontSize: 13 }

export default function BookingReceiptPage () {
  return (
    <Suspense fallback={<div style={center}><Loader2 size={36} style={{ color: '#0B3D28' }} /></div>}>
      <BookingReceiptContent />
    </Suspense>
  )
}
