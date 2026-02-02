'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { CheckCircle, AlertCircle, Loader, Mail, ArrowLeft } from 'lucide-react'
import './verify-otp.scss'
import axios from 'axios'

export default function VerifyOTP () {
  const searchParams = useSearchParams()
  const router = useRouter()

  const email = searchParams.get('email')
  const userId = searchParams.get('userId')

  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [countdown, setCountdown] = useState(0)

  const inputRefs = useRef([])

  // Countdown timer for resend OTP
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  // Auto-focus first input on mount
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus()
    }
  }, [])

  // Handle OTP input change
  const handleChange = (index, value) => {
    // Only allow numbers
    if (!/^\d*$/.test(value)) return

    const newOtp = [...otp]
    newOtp[index] = value

    setOtp(newOtp)
    setError('')

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  // Handle backspace
  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  // Handle paste
  const handlePaste = e => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').slice(0, 6)

    if (!/^\d+$/.test(pastedData)) return

    const newOtp = [...otp]
    pastedData.split('').forEach((char, index) => {
      if (index < 6) {
        newOtp[index] = char
      }
    })

    setOtp(newOtp)

    // Focus last filled input or first empty
    const lastIndex = Math.min(pastedData.length, 5)
    inputRefs.current[lastIndex]?.focus()
  }

  // Verify OTP
  const handleVerifyOTP = async e => {
    e.preventDefault()

    const otpCode = otp.join('')

    if (otpCode.length !== 6) {
      setError('Please enter the complete 6-digit code')
      return
    }

    setError('')
    setLoading(true)

    try {
      console.log('Sending to API:', {
        email,
        otp: otpCode
      })

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/verify-otp`,
        {
          email: email.toLocaleLowerCase(),
          otp: otpCode
        }
      )

      const data = response.data
      console.log('Response data:', data)

      setSuccess(true)

      // Store token if provided
      if (data.token) {
        localStorage.setItem('authToken', data.token)
      }

      setTimeout(() => {
        // Redirect based on user role
        const role = data.data?.role

        const adminRoles = [
          'super-admin',
          'sub-admin',
          'property-admin',
          'sub-property-admin',
          'artisan-admin',
          'sub-artisan-admin'
        ]

        if (adminRoles.includes(role)) {
          router.push('/admin/dashboard')
        } else {
          router.push('/dashboard')
        }
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

  // Resend OTP
  const handleResendOTP = async () => {
    if (countdown > 0) return

    setError('')
    setResending(true)

    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/resend-otp`,
        {
          email,
          userId
        }
      )

      // Clear current OTP
      setOtp(['', '', '', '', '', ''])
      inputRefs.current[0]?.focus()

      // Start countdown (60 seconds)
      setCountdown(60)

      // Show success message briefly
      setError('')
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.msg ||
        'Failed to resend code. Please try again.'
      setError(errorMessage)
    } finally {
      setResending(false)
    }
  }

  // Redirect if no email or userId
  useEffect(() => {
    if (!email || !userId) {
      router.push('/auth/register')
    }
  }, [email, userId, router])

  if (!email || !userId) {
    return null
  }

  return (
    <div className='verify-otp-container'>
      {/* Background decoration */}
      <div className='verify-otp-bg-decoration'></div>

      <div className='verify-otp-wrapper'>
        {/* Back button */}
        <button
          className='back-button'
          onClick={() => router.push('/auth/register')}
        >
          <ArrowLeft size={20} />
          Back
        </button>

        {/* Header */}
        <div className='verify-otp-header'>
          <div className='icon-wrapper'>
            <Mail size={48} />
          </div>
          <h1 className='verify-otp-title'>Verify Your Email</h1>
          <p className='verify-otp-subtitle'>
            We've sent a 6-digit verification code to
          </p>
          <p className='email-display'>{email}</p>
        </div>

        {/* OTP Form */}
        <form onSubmit={handleVerifyOTP} className='otp-form'>
          <div className='otp-inputs'>
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={el => (inputRefs.current[index] = el)}
                type='text'
                inputMode='numeric'
                maxLength={1}
                value={digit}
                onChange={e => handleChange(index, e.target.value)}
                onKeyDown={e => handleKeyDown(index, e)}
                onPaste={handlePaste}
                className='otp-input'
                disabled={loading || success}
              />
            ))}
          </div>

          {/* Error Message */}
          {error && (
            <div className='alert alert-error'>
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className='alert alert-success'>
              <CheckCircle size={18} />
              <span>
                {resending
                  ? 'New code sent successfully!'
                  : 'Verification successful! Redirecting...'}
              </span>
            </div>
          )}

          {/* Verify Button */}
          <button
            type='submit'
            className='btn btn-primary'
            disabled={loading || success || otp.join('').length !== 6}
          >
            {loading ? (
              <>
                <Loader size={18} className='spinner' />
                Verifying...
              </>
            ) : success ? (
              <>
                <CheckCircle size={18} />
                Verified!
              </>
            ) : (
              'Verify Email'
            )}
          </button>
        </form>

        {/* Resend Code */}
        <div className='resend-section'>
          <p>Didn't receive the code?</p>
          <button
            type='button'
            className={`resend-button ${countdown > 0 ? 'disabled' : ''}`}
            onClick={handleResendOTP}
            disabled={countdown > 0 || resending}
          >
            {resending ? (
              <>
                <Loader size={16} className='spinner' />
                Sending...
              </>
            ) : countdown > 0 ? (
              `Resend in ${countdown}s`
            ) : (
              'Resend Code'
            )}
          </button>
        </div>

        {/* Additional Info */}
        <div className='info-section'>
          <p className='info-text'>
            <strong>Note:</strong> The verification code will expire in 10
            minutes. Make sure to check your spam folder if you don't see the
            email.
          </p>
        </div>

        {/* Support Link */}
        <div className='support-section'>
          <p>Having trouble?</p>
          <a href='/support' className='support-link'>
            Contact Support
          </a>
        </div>
      </div>
    </div>
  )
}
