'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { Suspense } from 'react'

function FailedContent () {
  const params = useSearchParams()
  const router = useRouter()
  const reason = params.get('reason') || 'Payment was not completed.'
  const ref    = params.get('transactionReference')

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: '2rem',
      fontFamily: 'sans-serif'
    }}>
      <div style={{
        background: '#fff',
        borderRadius: '12px',
        padding: '2.5rem',
        maxWidth: '480px',
        width: '100%',
        boxShadow: '0 4px 24px rgba(0,0,0,0.08)'
      }}>
        {/* Icon */}
        <div style={{
          width: '64px', height: '64px',
          background: '#fef2f2',
          borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 1.5rem'
        }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
        </div>

        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111', marginBottom: '0.5rem' }}>
          Payment Failed
        </h1>
        <p style={{ color: '#6b7280', marginBottom: '1rem' }}>{reason}</p>

        {ref && (
          <p style={{ fontSize: '0.8rem', color: '#9ca3af', marginBottom: '1.5rem' }}>
            Reference: <code>{ref}</code>
          </p>
        )}

        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => router.back()}
            style={{
              padding: '0.65rem 1.5rem',
              background: '#2563eb',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 600
            }}
          >
            Try Again
          </button>
          <button
            onClick={() => router.push('/')}
            style={{
              padding: '0.65rem 1.5rem',
              background: '#f3f4f6',
              color: '#374151',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 600
            }}
          >
            Go Home
          </button>
        </div>

        <p style={{ marginTop: '1.5rem', fontSize: '0.8rem', color: '#9ca3af' }}>
          Need help?{' '}
          <a href="/contact" style={{ color: '#2563eb', textDecoration: 'none' }}>
            Contact support
          </a>
        </p>
      </div>
    </div>
  )
}

export default function PaymentFailedPage () {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <FailedContent />
    </Suspense>
  )
}
