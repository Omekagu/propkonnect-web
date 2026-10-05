'use client'

import React, { useState } from 'react'
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react'
import './forgot-password.scss'
import { auth as authApi } from '@/libs/api'

const APP = process.env.NEXT_PUBLIC_APP_NAME || 'Propnekt'

export default function ForgotPassword () {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)
  const [focused, setFocused] = useState(false)

  const handleSubmit = async e => {
    e.preventDefault()
    if (!email.trim()) { setError('Please enter your email address'); return }
    setError(''); setLoading(true)
    try {
      await authApi.forgotPassword({ email: email.trim().toLowerCase() })
      setSent(true)
    } catch (err) {
      setError(err.response?.data?.msg || err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='fp'>
      <div className='fp-card'>

        <a href='/auth/login' className='fp-logo'>
          <div className='fp-logo__hex'>
            <svg width='16' height='16' viewBox='0 0 24 24' fill='currentColor'>
              <path d='M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z'/>
            </svg>
          </div>
          <span className='fp-logo__name'>{APP}</span>
          <span className='fp-logo__tag'>AI</span>
        </a>

        {!sent ? (
          <>
            <div className='fp-icon'>
              <Mail size={28} />
            </div>

            <h1 className='fp-h1'>Forgot your password?</h1>
            <p className='fp-sub'>
              Enter your email and we&apos;ll send you a link to reset your password. The link expires in 1 hour.
            </p>

            <form onSubmit={handleSubmit}>
              <div className='fp-field'>
                <label className='fp-label'>Email address</label>
                <div className={`fp-input-wrap${focused ? ' focused' : ''}`}>
                  <svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.8' strokeLinecap='round' strokeLinejoin='round'>
                    <path d='M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z'/>
                    <polyline points='22,6 12,13 2,6'/>
                  </svg>
                  <input
                    className='fp-input'
                    type='email'
                    inputMode='email'
                    autoComplete='email'
                    placeholder='name@example.com'
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                  />
                </div>
              </div>

              {error && (
                <div className='fp-alert fp-alert--err'>
                  <svg width='16' height='16' viewBox='0 0 20 20' fill='currentColor'>
                    <path fillRule='evenodd' d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z' clipRule='evenodd'/>
                  </svg>
                  <span>{error}</span>
                </div>
              )}

              <button type='submit' className='fp-btn fp-btn--primary' disabled={loading || !email.trim()}>
                {loading ? <><span className='fp-spinner'/> Sending...</> : 'Send Reset Link'}
              </button>
            </form>
          </>
        ) : (
          <>
            <div className='fp-icon' style={{ background: 'rgba(196,229,60,0.12)', borderColor: 'rgba(196,229,60,0.25)', color: '#c4e53c' }}>
              <CheckCircle2 size={28} />
            </div>

            <h1 className='fp-h1'>Check your inbox</h1>
            <p className='fp-sub'>
              If <strong style={{ color: 'rgba(255,255,255,0.75)' }}>{email}</strong> is registered, a password reset link has been sent. Check your spam folder if you don&apos;t see it.
            </p>

            <button className='fp-btn fp-btn--ghost' onClick={() => { setSent(false); setEmail('') }}>
              Try a different email
            </button>
          </>
        )}

        <div className='fp-footer'>
          <a href='/auth/login'>
            <ArrowLeft size={13} style={{ verticalAlign: 'middle', marginRight: 4 }} />
            Back to sign in
          </a>
        </div>

      </div>
    </div>
  )
}
