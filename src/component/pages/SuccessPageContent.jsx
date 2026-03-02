'use client'

export const dynamic = 'force-dynamic'
export const revalidate = 0

import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import axios from 'axios'

const API = process.env.NEXT_PUBLIC_BACKEND_URL

export default function SuccessPageContent () {
  const params  = useSearchParams()
  const router  = useRouter()
  const trxRef  = params.get('transactionReference')
  const [txn, setTxn]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]   = useState(null)

  useEffect(() => {
    if (!trxRef) { setLoading(false); return }

    axios
      .get(`${API}/api/payments/verify-monnify-transaction?transactionReference=${trxRef}`, { withCredentials: true })
      .then(res => {
        const body = res.data?.responseBody || res.data
        setTxn({
          status:    body.paymentStatus || 'PAID',
          amount:    body.amountPaid    || body.expectedAmount || 0,
          reference: body.transactionReference || trxRef,
          date:      body.paidOn ? new Date(body.paidOn).toLocaleString() : new Date().toLocaleString(),
          method:    body.paymentMethod || '—',
          product:   body.productDescription || body.narration || '—'
        })
      })
      .catch(() => setError('Could not verify this transaction. It may still be processing.'))
      .finally(() => setLoading(false))
  }, [trxRef])

  if (loading) {
    return (
      <div style={wrapStyle}>
        <div style={cardStyle}>
          <p style={{ color: '#6b7280' }}>Verifying payment…</p>
        </div>
      </div>
    )
  }

  return (
    <div style={wrapStyle}>
      <div style={cardStyle}>
        {/* Icon */}
        <div style={iconWrap('#f0fdf4')}>
          <svg width='28' height='28' viewBox='0 0 24 24' fill='none'
            stroke='#16a34a' strokeWidth='2.5' strokeLinecap='round' strokeLinejoin='round'>
            <circle cx='12' cy='12' r='10' />
            <polyline points='9 12 11 14 15 10' />
          </svg>
        </div>

        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111', margin: '0 0 6px' }}>
          Payment Successful!
        </h1>
        <p style={{ color: '#6b7280', marginBottom: 20 }}>
          {error || 'Your payment has been received and confirmed.'}
        </p>

        {txn && (
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 20, textAlign: 'left' }}>
            <tbody>
              {[
                ['Status',    txn.status],
                ['Amount',    `₦${Number(txn.amount).toLocaleString()}`],
                ['Reference', txn.reference],
                ['Date',      txn.date],
                ['Method',    txn.method],
                ['For',       txn.product],
              ].map(([label, value]) => (
                <tr key={label} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '8px 4px', fontSize: 13, color: '#6b7280', fontWeight: 600, width: 90 }}>{label}</td>
                  <td style={{ padding: '8px 4px', fontSize: 13, color: '#111' }}>{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => router.push('/dashboard')} style={btnPrimary}>Go to Dashboard</button>
          <button onClick={() => router.push('/')} style={btnGhost}>Back to Home</button>
        </div>

        <p style={{ marginTop: 18, fontSize: 12, color: '#9ca3af' }}>
          Need help?{' '}
          <a href='/contact' style={{ color: '#2563eb', textDecoration: 'none' }}>Contact support</a>
        </p>
      </div>
    </div>
  )
}

const wrapStyle = {
  minHeight: '100vh', display: 'flex', alignItems: 'center',
  justifyContent: 'center', padding: '2rem', fontFamily: 'sans-serif',
  background: '#f9fafb'
}
const cardStyle = {
  background: '#fff', borderRadius: 16, padding: '2.5rem',
  maxWidth: 480, width: '100%', boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
  textAlign: 'center'
}
const iconWrap = bg => ({
  width: 64, height: 64, background: bg, borderRadius: '50%',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  margin: '0 auto 1.5rem'
})
const btnPrimary = {
  padding: '0.65rem 1.5rem', background: '#2563eb', color: '#fff',
  border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 14
}
const btnGhost = {
  padding: '0.65rem 1.5rem', background: '#f3f4f6', color: '#374151',
  border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 14
}
