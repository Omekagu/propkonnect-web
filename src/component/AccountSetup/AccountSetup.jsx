'use client'

/**
 * AccountSetup — Onboarding flow for property owners / artisans.
 * Steps:
 *   1. Identity Verification (KYC) — upload NIN/Passport/Driver's licence
 *   2. Payment Setup — bank account → Paystack subaccount for payouts
 *   3. Done — account activated
 *
 * Backend:
 *   POST /api/paystack/setup/kyc    { documentType, documentNumber, documentUrl }
 *   POST /api/paystack/setup/initialize
 *   GET  /api/paystack/banks
 *   GET  /api/paystack/resolve-account?accountNumber=&bankCode=
 *   POST /api/paystack/setup/bank   { accountNumber, bankCode, bankName, accountName }
 */

import React, { useState, useEffect, useCallback } from 'react'
import { api } from '@/libs/api-client'
import { uploadToCloudinary } from '@/context/cloudinaryHelper'
import {
  User,
  Shield,
  CreditCard,
  CheckCircle,
  Upload,
  Loader2,
  AlertCircle,
  ArrowRight,
  Eye,
  EyeOff,
  Check
} from 'lucide-react'
import './AccountSetup.scss'

const DOC_TYPES = [
  { value: 'nin', label: 'National ID (NIN)' },
  { value: 'passport', label: 'International Passport' },
  { value: 'drivers_license', label: "Driver's Licence" },
  { value: 'voters_card', label: "Voter's Card" }
]

export default function AccountSetup ({
  onComplete,
  initialStatus = 'pending_kyc'
}) {
  const [step, setStep] = useState(() => {
    if (initialStatus === 'pending_payment_setup') return 2
    if (initialStatus === 'active') return 3
    return 1
  })
  const [loading, setLoading] = useState(false)
  const [notice, setNotice] = useState(null)
  const [banks, setBanks] = useState([])
  const [banksLoading, setBanksLoading] = useState(false)
  const [resolving, setResolving] = useState(false)

  // KYC fields
  const [docType, setDocType] = useState('nin')
  const [docNumber, setDocNumber] = useState('')
  const [docUrl, setDocUrl] = useState('')
  const [docFile, setDocFile] = useState(null)
  const [docUploading, setDocUploading] = useState(false)

  // Bank fields
  const [accountNumber, setAccountNumber] = useState('')
  const [bankCode, setBankCode] = useState('')
  const [bankName, setBankName] = useState('')
  const [accountName, setAccountName] = useState('')

  const flash = useCallback((msg, type = 'success') => {
    setNotice({ msg, type })
    setTimeout(() => setNotice(null), 4000)
  }, [])

  // Load banks on mount
  useEffect(() => {
    const load = async () => {
      setBanksLoading(true)
      try {
        const res = await api.get('/api/paystack/banks')
        setBanks(res.data?.banks || [])
      } catch {
        /* ignore */
      } finally {
        setBanksLoading(false)
      }
    }
    load()
  }, [])

  // Get the user's registered name for name-matching validation
  const getUserProfileName = () => {
    try {
      const raw =
        typeof window !== 'undefined'
          ? localStorage.getItem('userData') || localStorage.getItem('user')
          : null
      if (!raw) return null
      const u = JSON.parse(raw)
      return `${u.firstName || ''} ${u.lastName || ''}`.trim().toLowerCase()
    } catch {
      return null
    }
  }

  // Normalise a name for loose comparison (remove extra spaces, lowercase)
  const normaliseName = name =>
    (name || '')
      .toLowerCase()
      .replace(/[^a-z\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim()

  // Check if two names are a reasonable match
  // Strategy: each word of the profile name (≥3 chars) must appear in the bank name
  const namesMatch = (profileName, bankAccountName) => {
    const profile = normaliseName(profileName)
    const bank = normaliseName(bankAccountName)
    if (!profile || !bank) return true // skip check if either name unavailable
    const words = profile.split(' ').filter(w => w.length >= 3)
    if (words.length === 0) return true
    return words.some(w => bank.includes(w))
  }

  const [nameMatchError, setNameMatchError] = useState('')

  // Auto-resolve account name when account number + bank code are both filled
  useEffect(() => {
    if (accountNumber.length !== 10 || !bankCode) return
    const resolve = async () => {
      setResolving(true)
      setAccountName('')
      setNameMatchError('')
      try {
        const res = await api.get(
          `/api/paystack/resolve-account?accountNumber=${accountNumber}&bankCode=${bankCode}`
        )
        if (res.data?.success) {
          const resolvedName = res.data.accountName
          setAccountName(resolvedName)
          // Validate name against profile name
          const profileName = getUserProfileName()
          if (
            profileName &&
            resolvedName &&
            !namesMatch(profileName, resolvedName)
          ) {
            setNameMatchError(
              `Account name "${resolvedName}" does not match your registered name. Please use a bank account in your own name.`
            )
          }
        }
      } catch {
        setAccountName('')
      } finally {
        setResolving(false)
      }
    }
    const t = setTimeout(resolve, 600)
    return () => clearTimeout(t)
  }, [accountNumber, bankCode])

  // ── KYC upload ─────────────────────────────────────────────────────────────

  const handleDocFile = async e => {
    const file = e.target.files?.[0]
    if (!file) return
    setDocUploading(true)
    setDocFile(file)
    try {
      const url = await uploadToCloudinary(file)
      setDocUrl(url)
      flash('Document uploaded successfully')
    } catch {
      flash('Upload failed — try again', 'error')
    } finally {
      setDocUploading(false)
    }
    e.target.value = ''
  }

  const submitKyc = async () => {
    if (!docUrl) return flash('Please upload an ID document', 'error')
    setLoading(true)
    try {
      await api.post('/api/paystack/setup/initialize') // create Paystack customer
      const res = await api.post('/api/paystack/setup/kyc', {
        documentType: docType,
        documentNumber: docNumber,
        documentUrl: docUrl
      })
      if (res.data?.success) {
        flash('Identity verified — now set up your payout account')
        setStep(2)
      } else {
        flash(res.data?.msg || 'Verification failed', 'error')
      }
    } catch (err) {
      flash(err.response?.data?.msg || err.message || 'Error', 'error')
    } finally {
      setLoading(false)
    }
  }

  // ── Bank setup ─────────────────────────────────────────────────────────────

  const submitBank = async () => {
    if (!accountNumber || !bankCode || !accountName)
      return flash('Please fill all bank details', 'error')
    if (accountNumber.length !== 10)
      return flash('Account number must be 10 digits', 'error')
    if (nameMatchError)
      return flash(
        'Please use a bank account registered in your own name to continue.',
        'error'
      )
    setLoading(true)
    try {
      const selectedBank = banks.find(b => b.code === bankCode)
      const res = await api.post('/api/paystack/setup/bank', {
        accountNumber,
        bankCode,
        bankName: selectedBank?.name || bankName,
        accountName
      })
      if (res.data?.success) {
        flash('Payment account configured!')
        setStep(3)
        // Update local storage + notify useAuth so banner disappears without reload
        try {
          const raw =
            localStorage.getItem('userData') || localStorage.getItem('user')
          if (raw) {
            const u = JSON.parse(raw)
            u.accountStatus = res.data.accountStatus || 'active'
            u.paystackSetup = {
              ...(u.paystackSetup || {}),
              bankVerified: true,
              bankName: banks.find(b => b.code === bankCode)?.name || bankName,
              accountName,
              completedAt: new Date().toISOString()
            }
            localStorage.setItem('userData', JSON.stringify(u))
            const tok = localStorage.getItem('authToken')
            window.dispatchEvent(
              new CustomEvent('authStatusChanged', {
                detail: { status: 'login', token: tok, userData: u }
              })
            )
          }
        } catch {
          /* ignore */
        }
        if (res.data?.accountStatus === 'active') onComplete?.('active')
      } else {
        flash(res.data?.msg || 'Setup failed', 'error')
      }
    } catch (err) {
      flash(err.response?.data?.msg || err.message || 'Error', 'error')
    } finally {
      setLoading(false)
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────

  const steps = [
    { id: 1, icon: User, label: 'Identity' },
    { id: 2, icon: CreditCard, label: 'Payout Account' },
    { id: 3, icon: CheckCircle, label: 'Activated' }
  ]

  return (
    <div className='account-setup'>
      {notice && (
        <div className={`as-toast ${notice.type}`}>
          {notice.type === 'success' ? (
            <Check size={15} />
          ) : (
            <AlertCircle size={15} />
          )}
          {notice.msg}
        </div>
      )}

      {/* Header */}
      <div className='as-header'>
        <div className='as-header-icon'>
          <Shield size={28} />
        </div>
        <div>
          <h2>Complete Account Setup</h2>
          <p>
            Verify your identity and connect your payout account to start
            listing properties.
          </p>
        </div>
      </div>

      {/* Progress */}
      <div className='as-steps'>
        {steps.map(s => {
          const Icon = s.icon
          return (
            <React.Fragment key={s.id}>
              <div
                className={`as-step${
                  step === s.id ? ' active' : step > s.id ? ' done' : ''
                }`}
              >
                <div className='as-step-circle'>
                  {step > s.id ? <Check size={16} /> : <Icon size={16} />}
                </div>
                <span>{s.label}</span>
              </div>
              {s.id < 3 && (
                <div className={`as-step-line${step > s.id ? ' done' : ''}`} />
              )}
            </React.Fragment>
          )
        })}
      </div>

      {/* ── Step 1: KYC ─────────────────────────────────────────────────────── */}
      {step === 1 && (
        <div className='as-card'>
          <div className='as-card-title'>Identity Verification</div>
          <div className='as-card-sub'>
            Upload a government-issued ID to verify your identity. This is
            required to list properties and receive payments.
          </div>

          <div className='as-field'>
            <label>Document Type</label>
            <div className='as-doc-types'>
              {DOC_TYPES.map(d => (
                <div
                  key={d.value}
                  className={`as-dt${docType === d.value ? ' selected' : ''}`}
                  onClick={() => setDocType(d.value)}
                >
                  {docType === d.value && <Check size={14} />} {d.label}
                </div>
              ))}
            </div>
          </div>

          <div className='as-field'>
            <label>
              Document Number <span>(optional)</span>
            </label>
            <input
              type='text'
              value={docNumber}
              onChange={e => setDocNumber(e.target.value)}
              placeholder='e.g. 12345678901'
            />
          </div>

          <div className='as-field'>
            <label>
              Upload Document <span>(required)</span>
            </label>
            <label className={`as-upload${docUrl ? ' uploaded' : ''}`}>
              {docUploading ? (
                <>
                  <Loader2 size={20} className='spin' /> Uploading…
                </>
              ) : docUrl ? (
                <>
                  <Check size={20} /> Document uploaded — click to replace
                </>
              ) : (
                <>
                  <Upload size={20} /> Click to upload{' '}
                  {DOC_TYPES.find(d => d.value === docType)?.label}
                </>
              )}
              <input
                type='file'
                accept='image/*,application/pdf'
                style={{ display: 'none' }}
                onChange={handleDocFile}
              />
            </label>
            {docFile && !docUploading && (
              <p className='as-doc-name'>{docFile.name}</p>
            )}
          </div>

          <div className='as-notice'>
            <Shield size={14} />
            Your documents are encrypted and stored securely. They are only
            reviewed by our compliance team for verification purposes.
          </div>

          <button
            className='as-btn-primary'
            onClick={submitKyc}
            disabled={loading || !docUrl}
          >
            {loading ? <Loader2 size={16} className='spin' /> : null}
            Continue to Payout Setup <ArrowRight size={16} />
          </button>
        </div>
      )}

      {/* ── Step 2: Bank Account ──────────────────────────────────────────────── */}
      {step === 2 && (
        <div className='as-card'>
          <div className='as-card-title'>Connect Your Payout Account</div>
          <div className='as-card-sub'>
            Link your bank account to receive payments from tenants and buyers
            via Paystack. Funds are held in escrow and released to your account
            after transactions are confirmed.
          </div>

          <div className='as-field'>
            <label>Bank</label>
            {banksLoading ? (
              <div className='as-loading-row'>
                <Loader2 size={14} className='spin' /> Loading banks…
              </div>
            ) : (
              <select
                value={bankCode}
                onChange={e => {
                  setBankCode(e.target.value)
                  setBankName(
                    banks.find(b => b.code === e.target.value)?.name || ''
                  )
                  setAccountName('')
                }}
              >
                <option value=''>Select your bank…</option>
                {banks.map(b => (
                  <option key={b.code} value={b.code}>
                    {b.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className='as-field'>
            <label>Account Number</label>
            <input
              type='text'
              maxLength={10}
              value={accountNumber}
              onChange={e => {
                setAccountNumber(e.target.value.replace(/\D/, ''))
                setAccountName('')
              }}
              placeholder='10-digit NUBAN'
            />
          </div>

          <div className='as-field'>
            <label>Account Name</label>
            <div
              className={`as-account-name${
                resolving
                  ? ' loading'
                  : accountName
                  ? nameMatchError
                    ? ' mismatch'
                    : ' found'
                  : ''
              }`}
            >
              {resolving ? (
                <>
                  <Loader2 size={14} className='spin' /> Resolving account…
                </>
              ) : accountName ? (
                nameMatchError ? (
                  <>
                    <AlertCircle size={14} /> {accountName}
                  </>
                ) : (
                  <>
                    <Check size={14} /> {accountName}
                  </>
                )
              ) : (
                <span>Will be auto-filled after entering account number</span>
              )}
            </div>
            {nameMatchError && (
              <p className='as-field-error'>
                <AlertCircle size={12} /> {nameMatchError}
              </p>
            )}
          </div>

          <div className='as-notice info'>
            <CreditCard size={14} />A Paystack subaccount will be created for
            you to receive split payments. Platform fees are automatically
            deducted before funds reach your account.
          </div>

          <button
            className='as-btn-primary'
            onClick={submitBank}
            disabled={loading || !accountNumber || !bankCode || !accountName}
          >
            {loading ? <Loader2 size={16} className='spin' /> : null}
            Activate Account <ArrowRight size={16} />
          </button>
        </div>
      )}

      {/* ── Step 3: Done ──────────────────────────────────────────────────────── */}
      {step === 3 && (
        <div className='as-card as-card-success'>
          <div className='as-success-icon'>
            <CheckCircle size={52} />
          </div>
          <h3>Account Activated!</h3>
          <p>
            Your identity has been verified and your payout account is
            connected. You can now list properties, receive applications, and
            get paid securely via escrow.
          </p>

          <div className='as-activated-list'>
            <div className='as-al-item'>
              <Check size={16} /> Identity verified
            </div>
            <div className='as-al-item'>
              <Check size={16} /> Paystack subaccount connected
            </div>
            <div className='as-al-item'>
              <Check size={16} /> Escrow payments enabled
            </div>
            <div className='as-al-item'>
              <Check size={16} /> Ready to list properties
            </div>
          </div>

          <button
            className='as-btn-primary'
            onClick={() => onComplete?.('active')}
          >
            Start Listing Properties <ArrowRight size={16} />
          </button>
        </div>
      )}
    </div>
  )
}
