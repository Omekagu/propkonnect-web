'use client'

/**
 * /purchase/verify?ref=PURCH-xxx
 *
 * Paystack redirects here after a property purchase payment.
 * We call the backend to verify and confirm the purchase, then show status.
 */

import React, { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import axios from 'axios'
import { CheckCircle2, XCircle, Loader2, Home, ArrowLeft } from 'lucide-react'

const API = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4001'

export default function PurchaseVerifyPage () {
  const params = useSearchParams()
  const router = useRouter()
  const ref = params.get('ref') || params.get('reference') || params.get('trxref')

  const [status, setStatus] = useState('loading') // loading | success | failed
  const [data, setData] = useState(null)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    if (!ref) { setStatus('failed'); setMsg('No payment reference found.'); return }

    axios.post(`${API}/api/properties/verify-purchase`, { reference: ref })
      .then(res => {
        setData(res.data)
        setStatus('success')
      })
      .catch(e => {
        setMsg(e.response?.data?.msg || 'Could not verify payment. Please contact support.')
        setStatus('failed')
      })
  }, [ref])

  const cardStyle = {
    maxWidth: 480, margin: '80px auto', padding: '40px 32px',
    background: '#fff', borderRadius: 16,
    boxShadow: '0 8px 40px rgba(0,0,0,0.08)', textAlign: 'center', fontFamily: 'Inter, sans-serif'
  }

  if (status === 'loading') return (
    <div style={cardStyle}>
      <Loader2 size={36} style={{ color: '#0B3D28', animation: 'spin 1s linear infinite', marginBottom: 16 }} />
      <p style={{ color: '#555', fontSize: 15 }}>Verifying your payment…</p>
    </div>
  )

  if (status === 'success') return (
    <div style={cardStyle}>
      <CheckCircle2 size={48} color='#22c55e' style={{ marginBottom: 16 }} />
      <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0B3D28', marginBottom: 8 }}>Payment Confirmed!</h2>
      <p style={{ color: '#555', fontSize: 14, lineHeight: 1.6, marginBottom: 20 }}>
        Your purchase payment has been received and is now secured in escrow.
        The property owner has been notified. You will receive a confirmation email shortly.
      </p>
      {data?.propertyTitle && (
        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: '12px 16px', marginBottom: 20, fontSize: 14, color: '#065f46', fontWeight: 600 }}>
          <Home size={14} style={{ marginRight: 6 }} />{data.propertyTitle}
        </div>
      )}
      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
        <button
          onClick={() => router.push('/admin/dashboard')}
          style={{ background: '#0B3D28', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 24px', fontWeight: 700, cursor: 'pointer', fontSize: 14 }}
        >
          Go to Dashboard
        </button>
        <button
          onClick={() => router.back()}
          style={{ background: 'transparent', border: '1.5px solid #d1d5db', borderRadius: 8, padding: '10px 24px', fontWeight: 600, cursor: 'pointer', fontSize: 14, color: '#374151' }}
        >
          <ArrowLeft size={13} style={{ marginRight: 4 }} />Back
        </button>
      </div>
    </div>
  )

  return (
    <div style={cardStyle}>
      <XCircle size={48} color='#ef4444' style={{ marginBottom: 16 }} />
      <h2 style={{ fontSize: 20, fontWeight: 800, color: '#7f1d1d', marginBottom: 8 }}>Payment Not Confirmed</h2>
      <p style={{ color: '#555', fontSize: 14, lineHeight: 1.6, marginBottom: 20 }}>{msg}</p>
      <p style={{ fontSize: 13, color: '#888' }}>Reference: <code style={{ background: '#f3f4f6', padding: '2px 6px', borderRadius: 4 }}>{ref}</code></p>
      <p style={{ fontSize: 13, color: '#888', marginTop: 8 }}>If you were charged, please contact <strong>support@propnekt.app</strong> with your reference.</p>
      <button
        onClick={() => router.back()}
        style={{ marginTop: 16, background: '#0B3D28', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 24px', fontWeight: 700, cursor: 'pointer', fontSize: 14 }}
      >
        Go Back
      </button>
    </div>
  )
}
