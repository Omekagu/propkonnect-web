'use client'

import React, { useState, useEffect, useRef } from 'react'
import { auth as authApi } from '@/libs/api'
import { useRouter } from 'next/navigation'
import { Building2, /* Wrench, PHASE 3+ — artisan login */ Home as HomeIcon, Star as StarIcon } from 'lucide-react'
import './login.scss'

const APP = process.env.NEXT_PUBLIC_APP_NAME

// Window patterns per building (1 = lit, 0 = dark)
const BUILDINGS = [
  { cls: 'lp-building--1', wins: [1, 0, 1, 0, 1, 0, 1, 1, 0, 0, 0, 1] },
  {
    cls: 'lp-building--2',
    wins: [0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 0, 1, 1]
  },
  {
    cls: 'lp-building--3',
    wins: [
      1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 0, 1, 0, 0, 0, 1, 1, 1, 0, 1
    ]
  },
  {
    cls: 'lp-building--4',
    wins: [0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 0, 0, 1, 0, 1, 1, 0]
  },
  {
    cls: 'lp-building--5',
    wins: [1, 1, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1]
  },
  { cls: 'lp-building--6', wins: [0, 1, 0, 1, 1, 0, 0, 0, 1] }
]

export default function AuthPage () {
  const [step, setStep] = useState('role')
  const [selectedRole, setSelectedRole] = useState(null)
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [loginMethod, setLoginMethod] = useState('otp') // 'otp' | 'password'
  const [loginPassword, setLoginPassword] = useState('')
  const [showLoginPassword, setShowLoginPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [status, setStatus] = useState('')
  const [resendCooldown, setResendCooldown] = useState(0)
  const [resendAttempts, setResendAttempts] = useState(0)
  const cooldownSeconds = 30
  const maxResendAttempts = 5
  const cooldownTimerRef = useRef(null)
  const announceRef = useRef(null)
  const [emailFocused, setEmailFocused] = useState(false)
  const [codeFocused, setCodeFocused] = useState(false)

  // ── Auth status check ──────────────────────────────────────
  useEffect(() => {
    const authToken = localStorage.getItem('authToken')
    const deviceId = localStorage.getItem('deviceId')
    const current = getOrCreateDeviceId()
    if (authToken && deviceId && deviceId !== current) {
      handleLogoutFromDifferentDevice()
    } else if (authToken && deviceId === current) {
      redirectBasedOnRole()
    }
  }, [])

  useEffect(() => {
    const handler = e => {
      if (e.key === 'authToken') {
        if (e.newValue) redirectBasedOnRole()
        else handleLogout()
      }
    }
    window.addEventListener('storage', handler)
    return () => window.removeEventListener('storage', handler)
  }, [])

  useEffect(
    () => () => {
      if (cooldownTimerRef.current) clearInterval(cooldownTimerRef.current)
    },
    []
  )

  useEffect(() => {
    if (resendCooldown <= 0) {
      if (cooldownTimerRef.current) {
        clearInterval(cooldownTimerRef.current)
        cooldownTimerRef.current = null
      }
      return
    }
    if (!cooldownTimerRef.current) {
      cooldownTimerRef.current = setInterval(() => {
        setResendCooldown(p => {
          if (p <= 1) {
            clearInterval(cooldownTimerRef.current)
            cooldownTimerRef.current = null
            return 0
          }
          return p - 1
        })
      }, 1000)
    }
  }, [resendCooldown])

  // ── Helpers ────────────────────────────────────────────────
  const getOrCreateDeviceId = () => {
    let id = localStorage.getItem('deviceId')
    if (!id) {
      id =
        btoa(
          `${navigator.userAgent}-${
            navigator.language
          }-${new Date().getTimezoneOffset()}`
        ) +
        '-' +
        Date.now()
      localStorage.setItem('deviceId', id)
    }
    return id
  }

  const formatCooldown = s => {
    if (!s) return ''
    const m = Math.floor(s / 60)
    return m > 0
      ? `${String(m).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
      : `${s}s`
  }

  const redirectBasedOnRole = () => {
    if (localStorage.getItem('userData'))
      window.location.href = '/admin/dashboard'
  }

  const handleLogoutFromDifferentDevice = () => {
    ;['authToken', 'email', 'userId'].forEach(k => localStorage.removeItem(k))
    setError('Session detected on another device. Please sign in again.')
    setStep('role')
    setEmail('')
    setCode('')
  }

  const handleLogout = () => {
    ;['authToken', 'deviceId', 'email', 'userId', 'userData'].forEach(k =>
      localStorage.removeItem(k)
    )
    setStep('role')
    setEmail('')
    setCode('')
    setError('')
    setSuccess(false)
  }

  const handleSelectRole = role => {
    setSelectedRole(role)
    setStep('email')
    setError('')
    setLoginMethod('otp')
    setLoginPassword('')
  }

  // ── Step actions ───────────────────────────────────────────
  const handlePasswordLogin = async () => {
    if (!email) { setError('Please enter your email'); return }
    if (!loginPassword) { setError('Please enter your password'); return }
    try {
      setLoading(true)
      setError('')
      setStatus('')
      const norm = email.trim().toLowerCase()
      const res = await authApi.loginWithPassword({ email: norm, password: loginPassword })
      const data = res.data
      const deviceId = getOrCreateDeviceId()
      if (data.token) {
        localStorage.setItem('authToken', data.token)
        localStorage.setItem('deviceId', deviceId)
      }
      if (data.data) localStorage.setItem('userData', JSON.stringify(data.data))
      window.dispatchEvent(new CustomEvent('authStatusChanged', {
        detail: { status: 'login', token: data.token, userData: data.data, deviceId }
      }))
      setSuccess(true)
      setTimeout(redirectBasedOnRole, 1800)
    } catch (err) {
      setError(err.response?.data?.msg || err.message || 'Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  const handleContinue = async () => {
    if (!email) {
      setError('Please enter your email')
      return
    }
    try {
      setLoading(true)
      setError('')
      setStatus('')
      const norm = email.trim().toLowerCase()
      const res = await authApi.login({ email: norm })
      localStorage.setItem('email', norm)
      if (res.data.user?._id) localStorage.setItem('userId', res.data.user._id)
      setStep('otp')
      setStatus('Code sent — check your inbox.')
      setResendCooldown(cooldownSeconds)
      setResendAttempts(0)
      if (announceRef.current)
        announceRef.current.textContent = 'Code sent to your email.'
    } catch (err) {
      setError(err.response?.data?.msg || err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (resendCooldown > 0) {
      setError(`Wait ${formatCooldown(resendCooldown)} before resending.`)
      return
    }
    if (resendAttempts >= maxResendAttempts) {
      setError('Maximum resend attempts reached.')
      return
    }
    try {
      setLoading(true)
      setError('')
      setStatus('')
      await authApi.login({
        email: (localStorage.getItem('email') || email).trim().toLowerCase()
      })
      setResendAttempts(p => p + 1)
      setResendCooldown(cooldownSeconds)
      setStatus('New code sent.')
    } catch (err) {
      setError(err.response?.data?.msg || err.message || 'Failed to resend')
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async e => {
    e.preventDefault()
    const otp = code.trim()
    if (otp.length !== 6) {
      setError('Enter the complete 6-digit code')
      return
    }
    setError('')
    setLoading(true)
    try {
      const verifyEmail = (localStorage.getItem('email') || email)
        .trim()
        .toLowerCase()
      const res = await authApi.verifyOtp({ email: verifyEmail, otp })
      const data = res.data
      setSuccess(true)
      const deviceId = getOrCreateDeviceId()
      if (data.token) {
        localStorage.setItem('authToken', data.token)
        localStorage.setItem('deviceId', deviceId)
      }
      if (data.data) localStorage.setItem('userData', JSON.stringify(data.data))
      window.dispatchEvent(
        new CustomEvent('authStatusChanged', {
          detail: {
            status: 'login',
            token: data.token,
            userData: data.data,
            deviceId
          }
        })
      )
      setTimeout(redirectBasedOnRole, 1800)
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.msg ||
          err.message ||
          'Verification failed.'
      )
    } finally {
      setLoading(false)
    }
  }

  const handleBackToEmail = () => {
    setStep('email')
    setCode('')
    setStatus('')
    setError('')
  }

  return (
    <div className='lp auth-login'>
      {/* Animated BG */}
      <div className='lp-bg'>
        <div className='lp-bg__grid' />
        <div className='lp-bg__glow lp-bg__glow--a' />
        <div className='lp-bg__glow lp-bg__glow--b' />
      </div>

      <div className='lp-split'>
        {/* ── LEFT: Visual panel ─────────────────────────── */}
        <div className='lp-visual'>
          <div className='lp-logo'>
            <div className='lp-logo__hex'>
              <svg
                width='16'
                height='16'
                viewBox='0 0 24 24'
                fill='currentColor'
              >
                <path d='M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z' />
              </svg>
            </div>
            <span className='lp-logo__name'>{APP}</span>
            <span className='lp-logo__tag'>AI</span>
          </div>

          {/* City skyline */}
          <div className='lp-city'>
            <div className='lp-city__scan' />
            {BUILDINGS.map((b, i) => (
              <div key={i} className={`lp-building ${b.cls}`}>
                <div className='lp-bwin'>
                  {b.wins.map((w, j) => (
                    <div key={j} className={`lp-bwin__w${w ? ' on' : ''}`} />
                  ))}
                </div>
              </div>
            ))}
            <div className='lp-city__base' />

            {/* Floating data cards */}
            <div className='lp-datacard lp-datacard--1'>
              <strong>2,847</strong>
              Active Listings
            </div>
            <div className='lp-datacard lp-datacard--2'>
              <strong>98.2%</strong>
              Match Rate
            </div>
          </div>

          <div className='lp-tagline'>
            <h2>
              {selectedRole === 'PROPERTY_OWNER'
                ? 'Your Property Empire Starts Here'
                // PHASE 3+ — artisan: selectedRole === 'artisan' ? 'Build Your Professional Legacy' :
                : 'AI-Powered Property Intelligence'}
            </h2>
            <p>
              {selectedRole === 'PROPERTY_OWNER'
                ? 'Manage listings, track tenants, collect rent and grow your portfolio — all from one intelligent dashboard.'
                // PHASE 3+ — artisan: selectedRole === 'artisan' ? 'Find quality jobs, manage your schedule, get paid on time. The platform that works as hard as you do.' :
                : 'The smartest way to buy, sell, rent and manage real estate in Nigeria. Powered by AI, built for everyone.'}
            </p>
          </div>

          <div className='lp-stats'>
            <div className='lp-stat'>
              <div className='lp-stat__val'>₦47B+</div>
              <div className='lp-stat__lbl'>Transaction Volume</div>
            </div>
            <div className='lp-stat'>
              <div className='lp-stat__val'>14,200</div>
              <div className='lp-stat__lbl'>Happy Users</div>
            </div>
            <div className='lp-stat'>
              <div className='lp-stat__val'>4.9 <StarIcon size={14} fill='#C4E53C' stroke='none' style={{verticalAlign:'middle'}} /></div>
              <div className='lp-stat__lbl'>Platform Rating</div>
            </div>
          </div>
        </div>

        {/* ── RIGHT: Form panel ──────────────────────────── */}
        <div className='lp-panel'>
          <div className='lp-card'>
            {/* Progress dots */}
            <div className='lp-dots'>
              <div
                className={`lp-dot${
                  step === 'role' ? ' active' : step !== 'role' ? ' done' : ''
                }`}
              />
              <div
                className={`lp-dot${
                  step === 'email' ? ' active' : step === 'otp' ? ' done' : ''
                }`}
              />
              <div className={`lp-dot${step === 'otp' ? ' active' : ''}`} />
            </div>

            <div ref={announceRef} aria-live='polite' className='lp-announce' />

            {/* ── Step: Role ──────────────────────────────── */}
            {step === 'role' && (
              <div className='lp-step'>
                <h2 className='lp-h1'>Welcome back</h2>
                <p className='lp-sub'>How do you use {APP}?</p>

                <div className='lp-roles'>
                  <button
                    className='lp-role'
                    onClick={() => handleSelectRole('PROPERTY_OWNER')}
                  >
                    <div className='lp-role__icon'><Building2 size={26} /></div>
                    <div className='lp-role__text'>
                      <h3>Property Owner</h3>
                      <p>Manage properties, tenants and collect rent</p>
                    </div>
                    <svg
                      className='lp-role__arrow'
                      width='18'
                      height='18'
                      viewBox='0 0 24 24'
                      fill='none'
                      stroke='currentColor'
                      strokeWidth='2.5'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                    >
                      <path d='M9 18l6-6-6-6' />
                    </svg>
                  </button>

                  {/* PHASE 3+ — artisan login role. Restore when artisan marketplace launches.
                  <button
                    className='lp-role'
                    onClick={() => handleSelectRole('artisan')}
                  >
                    <div className='lp-role__icon'><Wrench size={26} /></div>
                    <div className='lp-role__text'>
                      <h3>Professional / Artisan</h3>
                      <p>Find jobs and build your professional profile</p>
                    </div>
                    <svg className='lp-role__arrow' width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.5' strokeLinecap='round' strokeLinejoin='round'>
                      <path d='M9 18l6-6-6-6' />
                    </svg>
                  </button>
                  */}

                  <button
                    className='lp-role'
                    onClick={() => handleSelectRole('user')}
                  >
                    <div className='lp-role__icon'><HomeIcon size={26} /></div>
                    <div className='lp-role__text'>
                      <h3>Tenant / Buyer</h3>
                      <p>Find your perfect property to rent or buy</p>
                    </div>
                    <svg
                      className='lp-role__arrow'
                      width='18'
                      height='18'
                      viewBox='0 0 24 24'
                      fill='none'
                      stroke='currentColor'
                      strokeWidth='2.5'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                    >
                      <path d='M9 18l6-6-6-6' />
                    </svg>
                  </button>
                </div>

                <div className='lp-divider'>
                  <span>New to {APP}?</span>
                </div>
                <p className='lp-prompt'>
                  Create an account <a href='/auth/register'>here</a>
                </p>
              </div>
            )}

            {/* ── Step: Email ─────────────────────────────── */}
            {step === 'email' && (
              <div className='lp-step'>
                <div className='lp-badge'>
                  <span className='lp-badge__icon'>
                    {selectedRole === 'PROPERTY_OWNER'
                      ? <Building2 size={16} />
                      : <HomeIcon size={16} />}
                  </span>
                  <span className='lp-badge__label'>
                    {selectedRole === 'PROPERTY_OWNER'
                      ? 'Property Owner'
                      : 'Tenant / Buyer'}
                  </span>
                  <button
                    className='lp-badge__change'
                    onClick={() => {
                      setStep('role')
                      setError('')
                    }}
                  >
                    Change
                  </button>
                </div>

                <h2 className='lp-h1'>Sign in to your account</h2>
                <p className='lp-sub'>
                  {loginMethod === 'otp' ? 'Enter your email to receive a verification code' : 'Enter your email and password to sign in'}
                </p>

                <div className='lp-field'>
                  <label className='lp-label'>Email address</label>
                  <div
                    className={`lp-input-wrap${emailFocused ? ' focused' : ''}`}
                  >
                    <svg
                      className='lp-icon'
                      width='18'
                      height='18'
                      viewBox='0 0 24 24'
                      fill='none'
                      stroke='currentColor'
                      strokeWidth='1.8'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                    >
                      <path d='M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z' />
                      <polyline points='22,6 12,13 2,6' />
                    </svg>
                    <input
                      className='lp-input'
                      type='text'
                      inputMode='email'
                      autoComplete='email'
                      placeholder='name@company.com'
                      value={email}
                      onChange={e => setEmail(e.target.value.trim())}
                      onFocus={() => setEmailFocused(true)}
                      onBlur={() => setEmailFocused(false)}
                    />
                  </div>
                </div>

                {/* ── Sign-in method toggle ─────────────────── */}
                <div className='lp-method-toggle'>
                  <button
                    type='button'
                    className={`lp-method-btn${loginMethod === 'otp' ? ' active' : ''}`}
                    onClick={() => { setLoginMethod('otp'); setError('') }}
                  >
                    Email Code
                  </button>
                  <button
                    type='button'
                    className={`lp-method-btn${loginMethod === 'password' ? ' active' : ''}`}
                    onClick={() => { setLoginMethod('password'); setError('') }}
                  >
                    Password
                  </button>
                </div>

                {loginMethod === 'password' && (
                  <div className='lp-field'>
                    <label className='lp-label'>Password</label>
                    <div className={`lp-input-wrap lp-input-wrap--pw${codeFocused ? ' focused' : ''}`}>
                      <svg
                        className='lp-icon'
                        width='18'
                        height='18'
                        viewBox='0 0 24 24'
                        fill='none'
                        stroke='currentColor'
                        strokeWidth='1.8'
                        strokeLinecap='round'
                        strokeLinejoin='round'
                      >
                        <rect x='3' y='11' width='18' height='11' rx='2' ry='2'/>
                        <path d='M7 11V7a5 5 0 0 1 10 0v4'/>
                      </svg>
                      <input
                        className='lp-input'
                        type={showLoginPassword ? 'text' : 'password'}
                        autoComplete='current-password'
                        placeholder='Your password'
                        value={loginPassword}
                        onChange={e => setLoginPassword(e.target.value)}
                        onFocus={() => setCodeFocused(true)}
                        onBlur={() => setCodeFocused(false)}
                      />
                      <button
                        type='button'
                        className='lp-pw-toggle'
                        onClick={() => setShowLoginPassword(p => !p)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', padding: '0 12px' }}
                      >
                        {showLoginPassword
                          ? <svg width='17' height='17' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.8' strokeLinecap='round' strokeLinejoin='round'><path d='M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24'/><line x1='1' y1='1' x2='23' y2='23'/></svg>
                          : <svg width='17' height='17' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.8' strokeLinecap='round' strokeLinejoin='round'><path d='M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z'/><circle cx='12' cy='12' r='3'/></svg>
                        }
                      </button>
                    </div>
                    <div style={{ marginTop: 6, textAlign: 'right' }}>
                      <a href='/auth/forgot-password' style={{ fontSize: 12, color: 'rgba(196,229,60,0.7)', textDecoration: 'none' }}>Forgot password?</a>
                    </div>
                  </div>
                )}

                {error && (
                  <div className='lp-alert lp-alert--err'>
                    <svg
                      width='16'
                      height='16'
                      viewBox='0 0 20 20'
                      fill='currentColor'
                    >
                      <path
                        fillRule='evenodd'
                        d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z'
                        clipRule='evenodd'
                      />
                    </svg>
                    <span>{error}</span>
                  </div>
                )}
                {status && (
                  <div className='lp-alert lp-alert--ok'>
                    <svg
                      width='16'
                      height='16'
                      viewBox='0 0 20 20'
                      fill='currentColor'
                    >
                      <path
                        fillRule='evenodd'
                        d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
                        clipRule='evenodd'
                      />
                    </svg>
                    <span>{status}</span>
                  </div>
                )}
                {success && (
                  <div className='lp-alert lp-alert--ok'>
                    <svg width='16' height='16' viewBox='0 0 20 20' fill='currentColor'>
                      <path fillRule='evenodd' d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z' clipRule='evenodd'/>
                    </svg>
                    <span>Signed in! Redirecting...</span>
                  </div>
                )}

                <div className='lp-btn-group'>
                  <button
                    className='lp-btn lp-btn--primary'
                    onClick={loginMethod === 'password' ? handlePasswordLogin : handleContinue}
                    disabled={loading || !email || (loginMethod === 'password' && !loginPassword)}
                  >
                    {loading ? (
                      <>
                        <span className='lp-spinner' /> {loginMethod === 'password' ? 'Signing in...' : 'Sending code...'}
                      </>
                    ) : loginMethod === 'password' ? 'Sign In →' : 'Continue →'}
                  </button>
                </div>

                <div className='lp-divider'>
                  <span>New to {APP}?</span>
                </div>
                <p className='lp-prompt'>
                  Create an account <a href='/auth/register'>here</a>
                </p>
              </div>
            )}

            {/* ── Step: OTP ───────────────────────────────── */}
            {step === 'otp' && (
              <div className='lp-step'>
                <h2 className='lp-h1'>Check your inbox</h2>
                <p className='lp-sub'>
                  Enter the 6-digit code sent to{' '}
                  <strong style={{ color: 'rgba(196,229,60,0.85)' }}>
                    {email}
                  </strong>
                </p>

                <div className='lp-field'>
                  <label className='lp-label'>Verification code</label>
                  <div
                    className={`lp-input-wrap${codeFocused ? ' focused' : ''}`}
                  >
                    <input
                      className='lp-input lp-input--code'
                      type='text'
                      inputMode='numeric'
                      pattern='[0-9]*'
                      maxLength={6}
                      placeholder='000000'
                      value={code}
                      onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
                      onFocus={() => setCodeFocused(true)}
                      onBlur={() => setCodeFocused(false)}
                    />
                  </div>
                  <div className='lp-hint'>{code.length}/6</div>
                </div>

                {error && (
                  <div className='lp-alert lp-alert--err'>
                    <svg
                      width='16'
                      height='16'
                      viewBox='0 0 20 20'
                      fill='currentColor'
                    >
                      <path
                        fillRule='evenodd'
                        d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z'
                        clipRule='evenodd'
                      />
                    </svg>
                    <span>{error}</span>
                  </div>
                )}
                {status && (
                  <div className='lp-alert lp-alert--ok'>
                    <svg
                      width='16'
                      height='16'
                      viewBox='0 0 20 20'
                      fill='currentColor'
                    >
                      <path
                        fillRule='evenodd'
                        d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
                        clipRule='evenodd'
                      />
                    </svg>
                    <span>{status}</span>
                  </div>
                )}
                {success && (
                  <div className='lp-alert lp-alert--ok'>
                    <svg
                      width='16'
                      height='16'
                      viewBox='0 0 20 20'
                      fill='currentColor'
                    >
                      <path
                        fillRule='evenodd'
                        d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
                        clipRule='evenodd'
                      />
                    </svg>
                    <span>Verified! Redirecting...</span>
                  </div>
                )}

                <div className='lp-btn-group'>
                  <button
                    className='lp-btn lp-btn--primary'
                    onClick={handleVerify}
                    disabled={loading || code.length !== 6}
                  >
                    {loading ? (
                      <>
                        <span className='lp-spinner' /> Verifying...
                      </>
                    ) : (
                      'Verify & Sign In'
                    )}
                  </button>
                  <button
                    className='lp-btn lp-btn--outline'
                    onClick={handleResend}
                    disabled={
                      loading ||
                      resendCooldown > 0 ||
                      resendAttempts >= maxResendAttempts
                    }
                  >
                    {resendAttempts >= maxResendAttempts
                      ? 'Limit reached'
                      : resendCooldown > 0
                      ? `Resend in ${formatCooldown(resendCooldown)}`
                      : 'Resend code'}
                  </button>
                  <button
                    className='lp-btn lp-btn--ghost'
                    onClick={handleBackToEmail}
                    disabled={loading}
                  >
                    Use a different email
                  </button>
                </div>

                <div className='lp-resend-info'>
                  Resend attempts: <strong>{resendAttempts}</strong> /{' '}
                  {maxResendAttempts}
                </div>
              </div>
            )}

            <div className='logp-footer'>
              <a href='/auth/privacy'>Privacy</a>
              <span>·</span>
              <a href='/auth/terms'>Terms</a>
              <span>·</span>
              <a href='/auth/contact'>Support</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
