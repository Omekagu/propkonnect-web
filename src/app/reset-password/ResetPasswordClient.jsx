'use client'

import React, { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Lock, Eye, EyeOff, CheckCircle2, AlertTriangle } from 'lucide-react'
import './reset-password.scss'
import { auth as authApi } from '@/libs/api'

const APP = process.env.NEXT_PUBLIC_APP_NAME || 'Propnekt'

function getStrength (pw) {
  if (!pw) return 0
  let score = 0
  if (pw.length >= 8) score++
  if (pw.length >= 12) score++
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++
  if (/\d/.test(pw)) score++
  if (/[^A-Za-z0-9]/.test(pw)) score++
  return Math.min(score, 4)
}

const STRENGTH_LABELS = ['', 'Weak', 'Fair', 'Good', 'Strong']
const STRENGTH_CLS    = ['', 'weak', 'fair', 'good', 'strong']

export default function ResetPasswordClient () {
  const searchParams   = useSearchParams()
  const token          = searchParams.get('token')

  const [password,    setPassword]    = useState('')
  const [confirm,     setConfirm]     = useState('')
  const [showPw,      setShowPw]      = useState(false)
  const [showCfm,     setShowCfm]     = useState(false)
  const [pwFocused,   setPwFocused]   = useState(false)
  const [cfmFocused,  setCfmFocused]  = useState(false)
  const [loading,     setLoading]     = useState(false)
  const [error,       setError]       = useState('')
  const [done,        setDone]        = useState(false)

  const strength = getStrength(password)

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    if (password.length < 8)         { setError('Password must be at least 8 characters'); return }
    if (password !== confirm)        { setError('Passwords do not match'); return }
    if (!token)                      { setError('Missing reset token. Please use the link from your email.'); return }

    setLoading(true)
    try {
      await authApi.resetPassword({ token, newPassword: password })
      setDone(true)
      setTimeout(() => { window.location.href = '/auth/login' }, 3000)
    } catch (err) {
      setError(err.response?.data?.msg || err.message || 'Reset failed. The link may have expired.')
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <div className='rsp'>
        <div className='rsp-card'>
          <a href='/auth/login' className='rsp-logo'>
            <div className='rsp-logo__hex'>
              <svg width='16' height='16' viewBox='0 0 24 24' fill='currentColor'><path d='M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z'/></svg>
            </div>
            <span className='rsp-logo__name'>{APP}</span>
            <span className='rsp-logo__tag'>AI</span>
          </a>

          <div className='rsp-icon' style={{ background: 'rgba(239,68,68,0.08)', borderColor: 'rgba(239,68,68,0.18)', color: '#f87171' }}>
            <AlertTriangle size={28} />
          </div>

          <h1 className='rsp-h1'>Invalid reset link</h1>
          <p className='rsp-sub'>This reset link is missing a token. Please use the link sent to your email, or request a new one.</p>

          <a href='/auth/forgot-password' className='rsp-btn rsp-btn--primary' style={{ textDecoration: 'none', marginTop: '1.25rem' }}>
            Request a new link
          </a>

          <div className='rsp-footer'>
            <a href='/auth/login'>Back to sign in</a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='rsp'>
      <div className='rsp-card'>

        <a href='/auth/login' className='rsp-logo'>
          <div className='rsp-logo__hex'>
            <svg width='16' height='16' viewBox='0 0 24 24' fill='currentColor'><path d='M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z'/></svg>
          </div>
          <span className='rsp-logo__name'>{APP}</span>
          <span className='rsp-logo__tag'>AI</span>
        </a>

        {!done ? (
          <>
            <div className='rsp-icon'>
              <Lock size={28} />
            </div>

            <h1 className='rsp-h1'>Set a new password</h1>
            <p className='rsp-sub'>Choose a strong password. You&apos;ll use it to sign in going forward.</p>

            <form onSubmit={handleSubmit}>
              <div className='rsp-field'>
                <label className='rsp-label'>New password</label>
                <div className={`rsp-input-wrap${pwFocused ? ' focused' : ''}`}>
                  <svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.8' strokeLinecap='round' strokeLinejoin='round'>
                    <rect x='3' y='11' width='18' height='11' rx='2' ry='2'/><path d='M7 11V7a5 5 0 0 1 10 0v4'/>
                  </svg>
                  <input
                    className='rsp-input'
                    type={showPw ? 'text' : 'password'}
                    placeholder='At least 8 characters'
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    onFocus={() => setPwFocused(true)}
                    onBlur={() => setPwFocused(false)}
                  />
                  <button type='button' className='rsp-pw-toggle' onClick={() => setShowPw(p => !p)}>
                    {showPw ? <EyeOff size={17}/> : <Eye size={17}/>}
                  </button>
                </div>

                {password.length > 0 && (
                  <>
                    <div className='rsp-strength'>
                      {[1,2,3,4].map(n => (
                        <div key={n} className={`rsp-strength__bar${strength >= n ? ` ${STRENGTH_CLS[strength]}` : ''}`} />
                      ))}
                    </div>
                    {strength > 0 && (
                      <p className='rsp-hint' style={{ marginTop: 4 }}>{STRENGTH_LABELS[strength]} password</p>
                    )}
                  </>
                )}
              </div>

              <div className='rsp-field'>
                <label className='rsp-label'>Confirm new password</label>
                <div className={`rsp-input-wrap${cfmFocused ? ' focused' : ''}`}>
                  <svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.8' strokeLinecap='round' strokeLinejoin='round'>
                    <rect x='3' y='11' width='18' height='11' rx='2' ry='2'/><path d='M7 11V7a5 5 0 0 1 10 0v4'/>
                  </svg>
                  <input
                    className='rsp-input'
                    type={showCfm ? 'text' : 'password'}
                    placeholder='Repeat your password'
                    value={confirm}
                    onChange={e => setConfirm(e.target.value)}
                    onFocus={() => setCfmFocused(true)}
                    onBlur={() => setCfmFocused(false)}
                  />
                  <button type='button' className='rsp-pw-toggle' onClick={() => setShowCfm(p => !p)}>
                    {showCfm ? <EyeOff size={17}/> : <Eye size={17}/>}
                  </button>
                </div>
                {confirm.length > 0 && password !== confirm && (
                  <p className='rsp-hint' style={{ color: '#f87171', marginTop: 4 }}>Passwords do not match</p>
                )}
              </div>

              {error && (
                <div className='rsp-alert rsp-alert--err'>
                  <svg width='16' height='16' viewBox='0 0 20 20' fill='currentColor'>
                    <path fillRule='evenodd' d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z' clipRule='evenodd'/>
                  </svg>
                  <span>{error}</span>
                </div>
              )}

              <button
                type='submit'
                className='rsp-btn rsp-btn--primary'
                disabled={loading || password.length < 8 || password !== confirm}
              >
                {loading ? <><span className='rsp-spinner'/> Resetting...</> : 'Reset Password'}
              </button>
            </form>
          </>
        ) : (
          <>
            <div className='rsp-icon' style={{ background: 'rgba(196,229,60,0.12)', borderColor: 'rgba(196,229,60,0.25)', color: '#c4e53c' }}>
              <CheckCircle2 size={28} />
            </div>
            <h1 className='rsp-h1'>Password reset!</h1>
            <p className='rsp-sub'>Your password has been updated. Redirecting you to sign in...</p>
            <div className='rsp-alert rsp-alert--ok'>
              <svg width='16' height='16' viewBox='0 0 20 20' fill='currentColor'>
                <path fillRule='evenodd' d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z' clipRule='evenodd'/>
              </svg>
              <span>Redirecting to sign in in 3 seconds…</span>
            </div>
          </>
        )}

        <div className='rsp-footer'>
          <a href='/auth/login'>Back to sign in</a>
        </div>

      </div>
    </div>
  )
}
