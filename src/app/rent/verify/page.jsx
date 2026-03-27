'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import axios from 'axios'

const API = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4001'

function RentVerifyContent () {
  const params = useSearchParams()
  const router = useRouter()
  const ref =
    params.get('ref') || params.get('reference') || params.get('trxref')

  const [status, setStatus] = useState('loading') // loading | success | failed
  const [result, setResult] = useState(null)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    if (!ref) {
      setStatus('failed')
      setMsg('No payment reference found.')
      return
    }

    axios
      .post(`${API}/api/properties/verify-rent`, { reference: ref })
      .then(res => {
        setResult(res.data)
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
        <h2 style={{ color: '#c53030', marginTop: 12 }}>Payment Not Confirmed</h2>
        <p style={{ color: '#666', maxWidth: 360, textAlign: 'center' }}>{msg}</p>
        <p style={{ fontSize: 13, color: '#999', maxWidth: 360, textAlign: 'center' }}>
          If you were charged, your payment may still be processed automatically. Check your
          dashboard or contact support with reference: <strong>{ref}</strong>
        </p>
        <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
          <button onClick={() => router.push('/admin/dashboard')} style={btnPrimary}>
            Go to Dashboard
          </button>
          <button onClick={() => router.back()} style={btnOutline}>
            Go Back
          </button>
        </div>
      </div>
    )

  return (
    <div style={center}>
      <CheckCircle2 size={56} color='#0B3D28' />
      <h2 style={{ color: '#0B3D28', margin: '12px 0 4px' }}>Rent Payment Confirmed!</h2>
      <p style={{ color: '#555', marginBottom: 24 }}>
        A receipt has been sent to your email address.
      </p>

      <div style={card}>
        <h3 style={{ margin: '0 0 14px', color: '#0B3D28' }}>
          {result?.propertyTitle || 'Your Property'}
        </h3>
        {result?.renterName && (
          <Row label='Tenant' value={result.renterName} />
        )}
        <Row label='Reference' value={ref} />
        <div style={{ borderTop: '1px solid #e0ead8', margin: '10px 0' }} />
        <p style={{ fontSize: 13, color: '#0F6040', margin: 0 }}>
          Your rental application has been approved and recorded. Log in to your dashboard to view
          lease details.
        </p>
      </div>

      <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
        <button onClick={() => router.push('/admin/dashboard')} style={btnPrimary}>
          My Dashboard
        </button>
        <button onClick={() => router.push('/')} style={btnOutline}>
          Back to Home
        </button>
      </div>
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

export default function RentVerifyPage () {
  return (
    <Suspense
      fallback={
        <div style={center}>
          <Loader2 size={40} style={{ color: '#0B3D28' }} />
        </div>
      }
    >
      <RentVerifyContent />
    </Suspense>
  )
}
