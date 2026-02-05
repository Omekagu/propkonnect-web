'use client'

import React, { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import './login.scss'

export default function AuthPage () {
  const router = useRouter()
  const [step, setStep] = useState('email')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
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
  const storageListenerRef = useRef(null)

  // Focus tracking for animations
  const [emailFocused, setEmailFocused] = useState(false)
  const [codeFocused, setCodeFocused] = useState(false)

  // Check if user is already logged in
  useEffect(() => {
    const checkAuthStatus = () => {
      const authToken = localStorage.getItem('authToken')
      const deviceId = localStorage.getItem('deviceId')
      const currentDeviceId = getOrCreateDeviceId()

      // If there's a token but it's from a different device, clear it
      if (authToken && deviceId && deviceId !== currentDeviceId) {
        handleLogoutFromDifferentDevice()
        return
      }

      // If user is already logged in on this device, redirect
      if (authToken && deviceId === currentDeviceId) {
        redirectBasedOnRole()
      }
    }

    checkAuthStatus()
  }, [])

  // Generate or retrieve a unique device ID
  const getOrCreateDeviceId = () => {
    let deviceId = localStorage.getItem('deviceId')
    if (!deviceId) {
      deviceId = generateDeviceId()
      localStorage.setItem('deviceId', deviceId)
    }
    return deviceId
  }

  // Generate unique device ID based on browser fingerprint
  const generateDeviceId = () => {
    const fingerprint = `${navigator.userAgent}-${
      navigator.language
    }-${new Date().getTimezoneOffset()}`
    return btoa(fingerprint) + '-' + Date.now()
  }

  // Handle logout from different device
  const handleLogoutFromDifferentDevice = () => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('email')
    localStorage.removeItem('userId')
    setError('You logged in from a different device. Please log in again.')
    setStep('email')
    setEmail('')
    setCode('')
  }

  // Listen for auth changes across tabs
  useEffect(() => {
    const handleStorageChange = event => {
      if (event.key === 'authToken') {
        if (event.newValue && event.newValue !== event.oldValue) {
          // Auth token was set in another tab
          redirectBasedOnRole()
        } else if (!event.newValue && event.oldValue) {
          // Auth token was cleared in another tab
          handleLogout()
        }
      }

      // Handle logout from different device across tabs
      if (event.key === 'deviceId' && event.newValue !== event.oldValue) {
        const currentDeviceId = localStorage.getItem('deviceId')
        if (currentDeviceId && currentDeviceId !== event.newValue) {
          handleLogoutFromDifferentDevice()
        }
      }
    }

    window.addEventListener('storage', handleStorageChange)
    storageListenerRef.current = handleStorageChange

    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

  // Cleanup cooldown timer on unmount
  useEffect(() => {
    return () => {
      if (cooldownTimerRef.current) clearInterval(cooldownTimerRef.current)
    }
  }, [])

  // Handle resend cooldown timer
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
        setResendCooldown(prev => {
          if (prev <= 1) {
            clearInterval(cooldownTimerRef.current)
            cooldownTimerRef.current = null
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
  }, [resendCooldown])

  const formatCooldown = secs => {
    if (!secs) return ''
    const mm = Math.floor(secs / 60)
    const ss = secs % 60
    return mm > 0
      ? `${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`
      : `${ss}s`
  }

  const redirectBasedOnRole = async () => {
    try {
      const token = localStorage.getItem('authToken')
      const userData = localStorage.getItem('userData')

      if (userData) {
        const data = JSON.parse(userData)
        const role = data?.role
        const adminRoles = [
          'super-admin',
          'sub-admin',
          'property-admin',
          'property-owner',
          'artisan',
          'sub-property-admin',
          'artisan-admin',
          'sub-artisan-admin'
        ]

        if (adminRoles.includes(role)) {
          router.push('/admin/dashboard')
        } else {
          router.push('/user/dashboard')
        }
      }
    } catch (err) {
      console.error('Error redirecting:', err)
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

      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/login`,
        { email }
      )

      const data = res.data
      localStorage.setItem('email', email)
      if (data.user?._id) {
        localStorage.setItem('userId', data.user._id)
      }

      setStep('otp')
      setStatus('Code sent. Check your email.')
      setResendCooldown(cooldownSeconds)
      setResendAttempts(0)
      if (announceRef.current)
        announceRef.current.textContent = 'Code sent to your email.'
    } catch (err) {
      console.error('❌ Login error:', err)
      setError(err.response?.data?.msg || err.message || 'Something went wrong')
      if (announceRef.current)
        announceRef.current.textContent = 'Failed to send code.'
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (!email) {
      setError('Email missing. Please re-enter your email.')
      return
    }
    if (resendCooldown > 0) {
      setError(
        `Please wait ${formatCooldown(resendCooldown)} before resending.`
      )
      return
    }
    if (resendAttempts >= maxResendAttempts) {
      setError(
        'You have reached the maximum number of resend attempts. Try again later.'
      )
      return
    }

    try {
      setLoading(true)
      setError('')
      setStatus('')

      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/login`,
        { email }
      )
      const data = res.data

      setResendAttempts(prev => prev + 1)
      setResendCooldown(cooldownSeconds)
      setStatus('A new code has been sent to your email.')
      if (announceRef.current)
        announceRef.current.textContent =
          'A new code has been sent to your email.'
    } catch (err) {
      console.error('❌ Resend error:', err)
      setError(
        err.response?.data?.msg || err.message || 'Failed to resend code'
      )
      if (announceRef.current)
        announceRef.current.textContent = 'Failed to resend code.'
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async e => {
    e.preventDefault()

    const otpCode = code.trim()

    if (otpCode.length !== 6) {
      setError('Please enter the complete 6-digit code')
      return
    }

    setError('')
    setLoading(true)

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/verify-otp`,
        {
          email: email.toLocaleLowerCase(),
          otp: otpCode
        }
      )

      const data = response.data
      setSuccess(true)

      // Get current device ID
      const deviceId = getOrCreateDeviceId()

      if (data.token) {
        localStorage.setItem('authToken', data.token)
        localStorage.setItem('deviceId', deviceId)
      }

      // Store user data for role-based redirect
      if (data.data) {
        localStorage.setItem('userData', JSON.stringify(data.data))
      }

      // Broadcast to other tabs that login happened
      const event = new CustomEvent('authStatusChanged', {
        detail: { status: 'login', token: data.token, deviceId }
      })
      window.dispatchEvent(event)

      setTimeout(() => {
        redirectBasedOnRole()
      }, 2000)
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.msg ||
        err.message ||
        'Verification failed. Please try again.'
      setError(errorMessage)
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

  const handleLogout = () => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('deviceId')
    localStorage.removeItem('email')
    localStorage.removeItem('userId')
    localStorage.removeItem('userData')

    setStep('email')
    setEmail('')
    setCode('')
    setError('')
    setSuccess(false)

    if (announceRef.current) {
      announceRef.current.textContent = 'You have been logged out.'
    }
  }

  return (
    <div className='auth-container'>
      <div className='auth-background' />

      <div className='auth-content'>
        {/* Left side - Branding & Message */}
        <div className='auth-welcome'>
          <div className='welcome-content'>
            <h1 className='welcome-title'>PROPNECT</h1>
            <p className='welcome-subtitle'>Professional Property Management</p>
            <p className='welcome-description'>
              Streamline your property operations with intelligent tools
              designed for modern teams.
            </p>

            <div className='feature-list'>
              <div className='feature-item'>
                <svg width='20' height='20' viewBox='0 0 20 20' fill='none'>
                  <path
                    d='M17 9L8 17L4 13'
                    stroke='currentColor'
                    strokeWidth='1.5'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  />
                </svg>
                <span>Secure authentication</span>
              </div>
              <div className='feature-item'>
                <svg width='20' height='20' viewBox='0 0 20 20' fill='none'>
                  <path
                    d='M17 9L8 17L4 13'
                    stroke='currentColor'
                    strokeWidth='1.5'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  />
                </svg>
                <span>Enterprise-grade security</span>
              </div>
              <div className='feature-item'>
                <svg width='20' height='20' viewBox='0 0 20 20' fill='none'>
                  <path
                    d='M17 9L8 17L4 13'
                    stroke='currentColor'
                    strokeWidth='1.5'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  />
                </svg>
                <span>Instant verification</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Auth Form */}
        <div className='auth-form-container'>
          <div className='auth-box' role='main' aria-labelledby='auth-heading'>
            {/* Progress indicator */}
            <div className='progress-dots'>
              <div className={`dot ${step === 'email' ? 'active' : ''}`} />
              <div className={`dot ${step === 'otp' ? 'active' : ''}`} />
            </div>

            {/* Status/Accessibility announcement */}
            <div
              ref={announceRef}
              aria-live='polite'
              style={{
                position: 'absolute',
                left: -9999,
                top: 'auto',
                width: 1,
                height: 1,
                overflow: 'hidden'
              }}
            />

            {/* Step 1 → Email */}
            {step === 'email' && (
              <div className='auth-step'>
                <h2 id='auth-heading' className='auth-title'>
                  Sign in to your account
                </h2>
                <p className='auth-subtitle'>
                  Enter your email to receive a verification code
                </p>

                <div className='form-group'>
                  <label htmlFor='email-input' className='form-label'>
                    Email address
                  </label>
                  <div
                    className={`input-wrapper ${
                      emailFocused ? 'focused' : ''
                    } ${email ? 'filled' : ''}`}
                  >
                    <svg
                      width='18'
                      height='18'
                      viewBox='0 0 24 24'
                      fill='none'
                      stroke='currentColor'
                      className='input-icon'
                    >
                      <path d='M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z' />
                      <path
                        d='M22 6L12 13L2 6'
                        strokeLinecap='round'
                        strokeLinejoin='round'
                      />
                    </svg>
                    <input
                      id='email-input'
                      type='email'
                      className='form-input'
                      placeholder='name@company.com'
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      onFocus={() => setEmailFocused(true)}
                      onBlur={() => setEmailFocused(false)}
                      aria-label='Email address'
                    />
                  </div>
                </div>

                {error && (
                  <div className='alert alert-error' role='alert'>
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
                  <div className='alert alert-success' role='status'>
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

                <button
                  className={`btn btn-primary ${loading ? 'loading' : ''}`}
                  onClick={handleContinue}
                  disabled={loading || !email}
                >
                  {loading ? (
                    <>
                      <span className='spinner' />
                      Sending code...
                    </>
                  ) : (
                    'Continue'
                  )}
                </button>

                <div className='divider'>
                  <span>New to Propnect?</span>
                </div>

                <p className='signup-prompt'>
                  create an account <a href='/auth/register'>here</a>{' '}
                </p>
              </div>
            )}

            {/* Step 2 → OTP */}
            {step === 'otp' && (
              <div className='auth-step otp-step'>
                <h2 className='auth-title'>Verify your identity</h2>
                <p className='auth-subtitle'>
                  Enter the 6-digit code sent to <strong>{email}</strong>
                </p>

                <div className='form-group'>
                  <label htmlFor='code-input' className='form-label'>
                    Verification code
                  </label>
                  <div
                    className={`input-wrapper code-wrapper ${
                      codeFocused ? 'focused' : ''
                    } ${code ? 'filled' : ''}`}
                  >
                    <svg
                      width='18'
                      height='18'
                      viewBox='0 0 24 24'
                      fill='none'
                      stroke='currentColor'
                      className='input-icon'
                    >
                      <circle cx='12' cy='12' r='1' fill='currentColor' />
                      <circle cx='12' cy='5' r='1' fill='currentColor' />
                      <circle cx='12' cy='19' r='1' fill='currentColor' />
                      <path
                        d='M9.12 9.78L14.5 4.4M9.12 14.22l5.38 5.38'
                        strokeLinecap='round'
                      />
                    </svg>
                    <input
                      id='code-input'
                      type='text'
                      inputMode='numeric'
                      pattern='[0-9]*'
                      className='form-input code-input'
                      maxLength={6}
                      placeholder='000000'
                      value={code}
                      onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
                      onFocus={() => setCodeFocused(true)}
                      onBlur={() => setCodeFocused(false)}
                      aria-label='6-digit verification code'
                    />
                  </div>
                  <div className='code-length-indicator'>
                    {code.length}/6 digits
                  </div>
                </div>

                {error && (
                  <div className='alert alert-error' role='alert'>
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
                  <div className='alert alert-success' role='status'>
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

                <div className='button-group'>
                  <button
                    className={`btn btn-primary ${loading ? 'loading' : ''}`}
                    onClick={handleVerify}
                    disabled={loading || code.length !== 6}
                  >
                    {loading ? (
                      <>
                        <span className='spinner' />
                        Verifying...
                      </>
                    ) : (
                      'Verify & Sign In'
                    )}
                  </button>

                  <button
                    className={`btn btn-secondary ${
                      resendCooldown > 0 ? 'disabled' : ''
                    }`}
                    onClick={handleResend}
                    disabled={
                      loading ||
                      resendCooldown > 0 ||
                      resendAttempts >= maxResendAttempts
                    }
                    title={
                      resendCooldown > 0
                        ? `Resend available in ${formatCooldown(
                            resendCooldown
                          )}`
                        : resendAttempts >= maxResendAttempts
                        ? 'Maximum resend attempts reached'
                        : 'Resend verification code'
                    }
                  >
                    {resendAttempts >= maxResendAttempts
                      ? 'Resend limit reached'
                      : resendCooldown > 0
                      ? `Resend in ${formatCooldown(resendCooldown)}`
                      : 'Resend code'}
                  </button>

                  <button
                    className='btn btn-ghost'
                    onClick={handleBackToEmail}
                    disabled={loading}
                  >
                    Use different email
                  </button>
                </div>

                <div className='resend-attempts'>
                  Attempts: <strong>{resendAttempts}</strong> /{' '}
                  {maxResendAttempts}
                </div>
              </div>
            )}

            {/* Footer */}
            <div className='auth-footer'>
              <a href='/auth/privacy'>Privacy policy</a>
              <span className='footer-divider'>•</span>
              <a href='/auth/terms'>Terms of service</a>
              <span className='footer-divider'>•</span>
              <a href='/auth/contact'>Support</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
