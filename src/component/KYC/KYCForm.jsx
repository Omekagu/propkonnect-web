'use client'
/**
 * KYCForm — Full multi-step identity verification
 *
 * Steps (strict roles — PROPERTY_OWNER, artisan, artisan-admin, property-admin):
 *   1. Personal Details  (DOB, gender, marital status)
 *   2. Identity Document (type, number, front image, back image)
 *   3. Selfie
 *   4. Next of Kin
 *   5. Review & Submit
 *
 * Steps (basic roles — user/tenant):
 *   1. Identity Document (type, number, front image)
 *   2. Review & Submit
 *
 * POST /api/kyc/submit
 */

import React, { useState, useCallback } from 'react'
import {
  Shield,
  User,
  FileText,
  Camera,
  Users,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Upload,
  Loader2,
  AlertCircle,
  Check,
  X,
  Clock,
  XCircle,
  RefreshCw
} from 'lucide-react'
import { api } from '@/libs/api-client'
import { uploadToCloudinary } from '@/context/cloudinaryHelper'
import './KYCForm.scss'

// ── Constants ──────────────────────────────────────────────────────────────────

const STRICT_ROLES = [
  'PROPERTY_OWNER',
  'artisan',
  'artisan-admin',
  'property-admin'
]

const DOC_TYPES = [
  { value: 'nin', label: 'NIN (National ID Number)' },
  { value: 'passport', label: 'International Passport' },
  { value: 'drivers_license', label: "Driver's Licence" },
  { value: 'voters_card', label: "Voter's Card" },
  { value: 'bvn', label: 'BVN (Bank Verification Number)' }
]

const GENDERS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' }
]

const MARITAL_STATUSES = [
  { value: 'single', label: 'Single' },
  { value: 'married', label: 'Married' },
  { value: 'divorced', label: 'Divorced' },
  { value: 'widowed', label: 'Widowed' },
  { value: 'separated', label: 'Separated' }
]

const RELATIONSHIPS = [
  'Spouse',
  'Parent',
  'Sibling',
  'Child',
  'Friend',
  'Colleague',
  'Other'
]

// ── Helpers ────────────────────────────────────────────────────────────────────

function UploadBox ({
  url,
  uploading,
  onFile,
  label,
  accept = 'image/*,application/pdf'
}) {
  return (
    <label
      className={`kyc-upload-box${url ? ' uploaded' : ''}${
        uploading ? ' busy' : ''
      }`}
    >
      {uploading ? (
        <>
          <Loader2 size={20} className='spin' />
          <span>Uploading…</span>
        </>
      ) : url ? (
        <>
          {/\.(jpg|jpeg|png|gif|webp)$/i.test(url) ||
          url.includes('/image/') ? (
            <img src={url} alt='preview' className='kyc-upload-preview' />
          ) : (
            <CheckCircle size={20} />
          )}
          <span>Uploaded — click to replace</span>
        </>
      ) : (
        <>
          <Upload size={20} />
          <span>{label}</span>
        </>
      )}
      <input
        type='file'
        accept={accept}
        style={{ display: 'none' }}
        onChange={onFile}
        disabled={uploading}
      />
    </label>
  )
}

// ── Main Component ─────────────────────────────────────────────────────────────

// ── Status View (non-editable states) ─────────────────────────────────────────

function KYCStatusView ({
  status,
  rejectionReason,
  verificationNote,
  onResubmit,
  onCancel
}) {
  const fmt = d =>
    d
      ? new Date(d).toLocaleDateString('en-NG', {
          day: 'numeric',
          month: 'short',
          year: 'numeric'
        })
      : null

  if (status === 'pending' || status === 'under_review') {
    return (
      <div className='kyc-status-view'>
        <div className='kyc-sv-icon kyc-sv-icon--pending'>
          <Clock size={36} />
        </div>
        <h2>KYC Under Review</h2>
        <p>
          Your identity documents have been submitted and are being reviewed by
          our compliance team. We will notify you within{' '}
          <strong>24–48 hours</strong>.
        </p>
        <div className='kyc-sv-badge kyc-sv-badge--pending'>
          Status:{' '}
          {status === 'under_review' ? 'Under Review' : 'Pending Review'}
        </div>
        <p className='kyc-sv-hint'>
          No action needed. You will receive an email and platform notification
          when your KYC is approved or if any documents need to be resubmitted.
        </p>
        {onCancel && (
          <button className='kyc-sv-btn-outline' onClick={onCancel}>
            Back to Dashboard
          </button>
        )}
      </div>
    )
  }

  if (status === 'approved') {
    return (
      <div className='kyc-status-view'>
        <div className='kyc-sv-icon kyc-sv-icon--approved'>
          <CheckCircle size={36} />
        </div>
        <h2>Identity Verified</h2>
        <p>
          Your identity has been successfully verified. You have full access to
          all platform features.
        </p>
        <div className='kyc-sv-badge kyc-sv-badge--approved'>
          Status: Approved
        </div>
        {verificationNote && <p className='kyc-sv-note'>{verificationNote}</p>}
        {onCancel && (
          <button className='kyc-sv-btn-outline' onClick={onCancel}>
            Back to Dashboard
          </button>
        )}
      </div>
    )
  }

  if (status === 'rejected') {
    return (
      <div className='kyc-status-view'>
        <div className='kyc-sv-icon kyc-sv-icon--rejected'>
          <XCircle size={36} />
        </div>
        <h2>KYC Rejected</h2>
        <p>Unfortunately, we were unable to verify your identity documents.</p>
        {rejectionReason && (
          <div className='kyc-sv-reason'>
            <strong>Reason:</strong> {rejectionReason}
          </div>
        )}
        <div className='kyc-sv-badge kyc-sv-badge--rejected'>
          Status: Rejected
        </div>
        <p className='kyc-sv-hint'>
          Please resubmit with clearer documents addressing the rejection reason
          above.
        </p>
        <div className='kyc-sv-actions'>
          <button className='kyc-sv-btn-primary' onClick={onResubmit}>
            <RefreshCw size={15} /> Resubmit KYC
          </button>
          {onCancel && (
            <button className='kyc-sv-btn-outline' onClick={onCancel}>
              Cancel
            </button>
          )}
        </div>
      </div>
    )
  }

  return null
}

// ── Main Component ─────────────────────────────────────────────────────────────

export default function KYCForm ({
  userRole = 'user',
  onSuccess,
  onCancel,
  existingKyc = null
}) {
  const isStrict = STRICT_ROLES.includes(userRole)
  const [forceResubmit, setForceResubmit] = useState(false)

  // Steps: strict = [1,2,3,4,5], basic = [2,5] (mapped to 1,2 for progress bar)
  const steps = isStrict
    ? [
        { id: 1, icon: User, label: 'Personal' },
        { id: 2, icon: FileText, label: 'Identity' },
        { id: 3, icon: Camera, label: 'Selfie' },
        { id: 4, icon: Users, label: 'Next of Kin' },
        { id: 5, icon: CheckCircle, label: 'Review' }
      ]
    : [
        { id: 2, icon: FileText, label: 'Identity' },
        { id: 5, icon: CheckCircle, label: 'Review' }
      ]

  const [currentStep, setCurrentStep] = useState(steps[0].id)
  const [toast, setToast] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  // ── Form state ────────────────────────────────────────────────────────────────
  const [dateOfBirth, setDateOfBirth] = useState(
    existingKyc?.dateOfBirth ? existingKyc.dateOfBirth.slice(0, 10) : ''
  )
  const [gender, setGender] = useState(existingKyc?.gender || '')
  const [maritalStatus, setMaritalStatus] = useState(
    existingKyc?.maritalStatus || ''
  )

  const [documentType, setDocumentType] = useState(
    existingKyc?.documentType || 'nin'
  )
  const [documentNumber, setDocumentNumber] = useState(
    existingKyc?.documentNumber || ''
  )
  const [docFrontUrl, setDocFrontUrl] = useState(
    existingKyc?.documentFrontUrl || ''
  )
  const [docBackUrl, setDocBackUrl] = useState(
    existingKyc?.documentBackUrl || ''
  )
  const [uploadingFront, setUploadingFront] = useState(false)
  const [uploadingBack, setUploadingBack] = useState(false)

  const [selfieUrl, setSelfieUrl] = useState(existingKyc?.selfieUrl || '')
  const [uploadingSelfie, setUploadingSelfie] = useState(false)

  const [nokFullName, setNokFullName] = useState(
    existingKyc?.nextOfKin?.fullName || ''
  )
  const [nokRelationship, setNokRelationship] = useState(
    existingKyc?.nextOfKin?.relationship || ''
  )
  const [nokPhone, setNokPhone] = useState(existingKyc?.nextOfKin?.phone || '')
  const [nokEmail, setNokEmail] = useState(existingKyc?.nextOfKin?.email || '')
  const [nokAddress, setNokAddress] = useState(
    existingKyc?.nextOfKin?.address || ''
  )

  // ── Toast helper ──────────────────────────────────────────────────────────────
  const flash = useCallback((msg, type = 'error') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 4000)
  }, [])

  // ── File upload helpers ───────────────────────────────────────────────────────
  const makeFileHandler = (setUrl, setBusy) => async e => {
    const file = e.target.files?.[0]
    if (!file) return
    setBusy(true)
    try {
      const url = await uploadToCloudinary(file, 'document')
      setUrl(url)
    } catch {
      flash('Upload failed — please try again')
    } finally {
      setBusy(false)
      e.target.value = ''
    }
  }

  // ── Step validation ───────────────────────────────────────────────────────────
  const canProceed = () => {
    switch (currentStep) {
      case 1:
        if (!dateOfBirth) return false
        if (!gender) return false
        if (!maritalStatus) return false
        return true
      case 2:
        if (!documentType) return false
        if (!docFrontUrl) return false
        return true
      case 3:
        return !!selfieUrl
      case 4:
        if (!nokFullName.trim()) return false
        if (!nokRelationship) return false
        if (!nokPhone.trim()) return false
        return true
      default:
        return true
    }
  }

  const next = () => {
    if (!canProceed()) {
      flash('Please fill all required fields before continuing.')
      return
    }
    const idx = steps.findIndex(s => s.id === currentStep)
    if (idx < steps.length - 1) setCurrentStep(steps[idx + 1].id)
  }

  const back = () => {
    const idx = steps.findIndex(s => s.id === currentStep)
    if (idx > 0) setCurrentStep(steps[idx - 1].id)
  }

  // ── Submit ────────────────────────────────────────────────────────────────────
  const submit = async () => {
    setSubmitting(true)
    try {
      const body = {
        documentType,
        documentFrontUrl: docFrontUrl,
        ...(documentNumber && { documentNumber }),
        ...(docBackUrl && { documentBackUrl: docBackUrl })
      }
      if (isStrict) {
        Object.assign(body, {
          dateOfBirth,
          gender,
          maritalStatus,
          selfieUrl,
          nextOfKin: {
            fullName: nokFullName,
            relationship: nokRelationship,
            phone: nokPhone,
            email: nokEmail,
            address: nokAddress
          }
        })
      }
      // Use /resubmit endpoint when previous status was rejected
      const wasRejected = existingKyc?.status === 'rejected'
      const endpoint = wasRejected ? '/api/kyc/resubmit' : '/api/kyc/submit'
      const res = await api.post(endpoint, body)
      if (res.data?.success) {
        onSuccess?.()
      } else {
        flash(res.data?.message || 'Submission failed — please try again.')
      }
    } catch (err) {
      flash(
        err?.response?.data?.message || 'Submission failed — please try again.'
      )
    } finally {
      setSubmitting(false)
    }
  }

  // ── Status view — shown when KYC is already in a non-editable state ──────────
  const kycStatus = existingKyc?.status
  if (
    !forceResubmit &&
    kycStatus &&
    ['pending', 'under_review', 'approved', 'rejected'].includes(kycStatus)
  ) {
    return (
      <div className='kyc-form'>
        <KYCStatusView
          status={kycStatus}
          rejectionReason={existingKyc?.rejectionReason}
          verificationNote={existingKyc?.verificationNote}
          onResubmit={() => setForceResubmit(true)}
          onCancel={onCancel}
        />
      </div>
    )
  }

  // ── Step components ───────────────────────────────────────────────────────────

  const stepIndex = steps.findIndex(s => s.id === currentStep)

  return (
    <div className='kyc-form'>
      {toast && (
        <div className={`kyc-form-toast kyc-form-toast--${toast.type}`}>
          {toast.type === 'success' ? (
            <Check size={15} />
          ) : (
            <AlertCircle size={15} />
          )}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className='kyc-form-header'>
        <div className='kyc-form-header-icon'>
          <Shield size={26} />
        </div>
        <div>
          <h2>Identity Verification</h2>
          <p>
            {isStrict
              ? 'Complete all steps to verify your identity and unlock full platform access.'
              : 'Upload a government-issued ID to complete basic verification.'}
          </p>
        </div>
        {onCancel && (
          <button className='kyc-form-cancel' onClick={onCancel} title='Close'>
            <X size={18} />
          </button>
        )}
      </div>

      {/* Step progress */}
      <div className='kyc-form-steps'>
        {steps.map((s, i) => {
          const Icon = s.icon
          const done = stepIndex > i
          const active = stepIndex === i
          return (
            <React.Fragment key={s.id}>
              <div
                className={`kyc-form-step${
                  active ? ' active' : done ? ' done' : ''
                }`}
              >
                <div className='kyc-form-step-circle'>
                  {done ? <Check size={14} /> : <Icon size={14} />}
                </div>
                <span>{s.label}</span>
              </div>
              {i < steps.length - 1 && (
                <div className={`kyc-form-step-line${done ? ' done' : ''}`} />
              )}
            </React.Fragment>
          )
        })}
      </div>

      {/* ── Step 1: Personal Details ──────────────────────────────────────────── */}
      {currentStep === 1 && (
        <div className='kyc-form-card'>
          <div className='kyc-form-card-title'>
            <User size={16} /> Personal Details
          </div>
          <div className='kyc-form-card-sub'>
            Basic personal information required for identity verification.
          </div>

          <div className='kyc-form-field'>
            <label>
              Date of Birth <span className='req'>*</span>
            </label>
            <input
              type='date'
              value={dateOfBirth}
              onChange={e => setDateOfBirth(e.target.value)}
              max={new Date(Date.now() - 18 * 365.25 * 86400000)
                .toISOString()
                .slice(0, 10)}
            />
            <span className='kyc-form-hint'>
              You must be at least 18 years old.
            </span>
          </div>

          <div className='kyc-form-field'>
            <label>
              Gender <span className='req'>*</span>
            </label>
            <div className='kyc-form-options'>
              {GENDERS.map(g => (
                <button
                  key={g.value}
                  type='button'
                  className={`kyc-form-option${
                    gender === g.value ? ' selected' : ''
                  }`}
                  onClick={() => setGender(g.value)}
                >
                  {gender === g.value && <Check size={12} />} {g.label}
                </button>
              ))}
            </div>
          </div>

          <div className='kyc-form-field'>
            <label>
              Marital Status <span className='req'>*</span>
            </label>
            <div className='kyc-form-options'>
              {MARITAL_STATUSES.map(m => (
                <button
                  key={m.value}
                  type='button'
                  className={`kyc-form-option${
                    maritalStatus === m.value ? ' selected' : ''
                  }`}
                  onClick={() => setMaritalStatus(m.value)}
                >
                  {maritalStatus === m.value && <Check size={12} />} {m.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Step 2: Identity Document ─────────────────────────────────────────── */}
      {currentStep === 2 && (
        <div className='kyc-form-card'>
          <div className='kyc-form-card-title'>
            <FileText size={16} /> Identity Document
          </div>
          <div className='kyc-form-card-sub'>
            Upload a clear, valid government-issued ID. All four corners must be
            visible.
          </div>

          <div className='kyc-form-field'>
            <label>
              Document Type <span className='req'>*</span>
            </label>
            <div className='kyc-form-options'>
              {DOC_TYPES.map(d => (
                <button
                  key={d.value}
                  type='button'
                  className={`kyc-form-option${
                    documentType === d.value ? ' selected' : ''
                  }`}
                  onClick={() => setDocumentType(d.value)}
                >
                  {documentType === d.value && <Check size={12} />} {d.label}
                </button>
              ))}
            </div>
          </div>

          <div className='kyc-form-field'>
            <label>
              Document Number <span className='opt'>(optional)</span>
            </label>
            <input
              type='text'
              value={documentNumber}
              onChange={e => setDocumentNumber(e.target.value)}
              placeholder='e.g. 12345678901'
            />
          </div>

          <div className='kyc-form-field'>
            <label>
              Front of Document <span className='req'>*</span>
            </label>
            <UploadBox
              url={docFrontUrl}
              uploading={uploadingFront}
              onFile={makeFileHandler(setDocFrontUrl, setUploadingFront)}
              label='Click to upload front page'
            />
          </div>

          <div className='kyc-form-field'>
            <label>
              Back of Document <span className='opt'>(recommended)</span>
            </label>
            <UploadBox
              url={docBackUrl}
              uploading={uploadingBack}
              onFile={makeFileHandler(setDocBackUrl, setUploadingBack)}
              label='Click to upload back page'
            />
          </div>

          <div className='kyc-form-notice'>
            <Shield size={13} />
            Documents are encrypted and stored securely. Only viewed by our
            compliance team.
          </div>
        </div>
      )}

      {/* ── Step 3: Selfie ───────────────────────────────────────────────────── */}
      {currentStep === 3 && (
        <div className='kyc-form-card'>
          <div className='kyc-form-card-title'>
            <Camera size={16} /> Selfie Photo
          </div>
          <div className='kyc-form-card-sub'>
            Take or upload a clear selfie. Your face must be fully visible,
            well-lit, and unobstructed.
          </div>

          <div className='kyc-form-selfie-tips'>
            <div className='tip'>
              <Check size={13} /> Good lighting, no flash glare
            </div>
            <div className='tip'>
              <Check size={13} /> Face clearly visible, no sunglasses
            </div>
            <div className='tip'>
              <Check size={13} /> Neutral background preferred
            </div>
            <div className='tip'>
              <X size={13} className='bad' /> No filters or heavy edits
            </div>
          </div>

          <UploadBox
            url={selfieUrl}
            uploading={uploadingSelfie}
            onFile={makeFileHandler(setSelfieUrl, setUploadingSelfie)}
            label='Upload selfie photo'
            accept='image/*'
          />
        </div>
      )}

      {/* ── Step 4: Next of Kin ──────────────────────────────────────────────── */}
      {currentStep === 4 && (
        <div className='kyc-form-card'>
          <div className='kyc-form-card-title'>
            <Users size={16} /> Next of Kin
          </div>
          <div className='kyc-form-card-sub'>
            Provide emergency contact details for your next of kin.
          </div>

          <div className='kyc-form-field'>
            <label>
              Full Name <span className='req'>*</span>
            </label>
            <input
              type='text'
              value={nokFullName}
              onChange={e => setNokFullName(e.target.value)}
              placeholder='e.g. Amaka Johnson'
            />
          </div>

          <div className='kyc-form-field'>
            <label>
              Relationship <span className='req'>*</span>
            </label>
            <div className='kyc-form-options'>
              {RELATIONSHIPS.map(r => (
                <button
                  key={r}
                  type='button'
                  className={`kyc-form-option${
                    nokRelationship === r ? ' selected' : ''
                  }`}
                  onClick={() => setNokRelationship(r)}
                >
                  {nokRelationship === r && <Check size={12} />} {r}
                </button>
              ))}
            </div>
          </div>

          <div className='kyc-form-row'>
            <div className='kyc-form-field'>
              <label>
                Phone <span className='req'>*</span>
              </label>
              <input
                type='tel'
                value={nokPhone}
                onChange={e => setNokPhone(e.target.value)}
                placeholder='+234 800 000 0000'
              />
            </div>
            <div className='kyc-form-field'>
              <label>
                Email <span className='opt'>(optional)</span>
              </label>
              <input
                type='email'
                value={nokEmail}
                onChange={e => setNokEmail(e.target.value)}
                placeholder='email@example.com'
              />
            </div>
          </div>

          <div className='kyc-form-field'>
            <label>
              Address <span className='opt'>(optional)</span>
            </label>
            <input
              type='text'
              value={nokAddress}
              onChange={e => setNokAddress(e.target.value)}
              placeholder='Street address'
            />
          </div>
        </div>
      )}

      {/* ── Step 5: Review & Submit ──────────────────────────────────────────── */}
      {currentStep === 5 && (
        <div className='kyc-form-card'>
          <div className='kyc-form-card-title'>
            <CheckCircle size={16} /> Review & Submit
          </div>
          <div className='kyc-form-card-sub'>
            Please review your information before submitting. You can go back to
            make changes.
          </div>

          <div className='kyc-review-sections'>
            {isStrict && (
              <div className='kyc-review-section'>
                <div className='kyc-review-section-title'>Personal Details</div>
                <div className='kyc-review-rows'>
                  <div className='kyc-review-row'>
                    <span>Date of Birth</span>
                    <strong>{dateOfBirth}</strong>
                  </div>
                  <div className='kyc-review-row'>
                    <span>Gender</span>
                    <strong style={{ textTransform: 'capitalize' }}>
                      {gender.replace('_', ' ')}
                    </strong>
                  </div>
                  <div className='kyc-review-row'>
                    <span>Marital Status</span>
                    <strong style={{ textTransform: 'capitalize' }}>
                      {maritalStatus}
                    </strong>
                  </div>
                </div>
              </div>
            )}

            <div className='kyc-review-section'>
              <div className='kyc-review-section-title'>Identity Document</div>
              <div className='kyc-review-rows'>
                <div className='kyc-review-row'>
                  <span>Type</span>
                  <strong>
                    {DOC_TYPES.find(d => d.value === documentType)?.label}
                  </strong>
                </div>
                {documentNumber && (
                  <div className='kyc-review-row'>
                    <span>Number</span>
                    <strong>{documentNumber}</strong>
                  </div>
                )}
                <div className='kyc-review-row'>
                  <span>Front</span>
                  <strong className={docFrontUrl ? 'check' : 'missing'}>
                    {docFrontUrl ? (
                      <>
                        <CheckCircle size={13} /> Uploaded
                      </>
                    ) : (
                      'Missing'
                    )}
                  </strong>
                </div>
                <div className='kyc-review-row'>
                  <span>Back</span>
                  <strong className={docBackUrl ? 'check' : 'optional'}>
                    {docBackUrl ? (
                      <>
                        <CheckCircle size={13} /> Uploaded
                      </>
                    ) : (
                      'Not provided (optional)'
                    )}
                  </strong>
                </div>
              </div>
            </div>

            {isStrict && (
              <>
                <div className='kyc-review-section'>
                  <div className='kyc-review-section-title'>Selfie</div>
                  <div className='kyc-review-rows'>
                    <div className='kyc-review-row'>
                      <span>Photo</span>
                      <strong className={selfieUrl ? 'check' : 'missing'}>
                        {selfieUrl ? (
                          <>
                            <CheckCircle size={13} /> Uploaded
                          </>
                        ) : (
                          'Missing'
                        )}
                      </strong>
                    </div>
                  </div>
                </div>

                <div className='kyc-review-section'>
                  <div className='kyc-review-section-title'>Next of Kin</div>
                  <div className='kyc-review-rows'>
                    <div className='kyc-review-row'>
                      <span>Name</span>
                      <strong>{nokFullName}</strong>
                    </div>
                    <div className='kyc-review-row'>
                      <span>Relationship</span>
                      <strong>{nokRelationship}</strong>
                    </div>
                    <div className='kyc-review-row'>
                      <span>Phone</span>
                      <strong>{nokPhone}</strong>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className='kyc-form-notice'>
            <Shield size={13} />
            By submitting, you confirm all information provided is accurate.
            False declarations may result in account suspension.
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className='kyc-form-nav'>
        {stepIndex > 0 ? (
          <button
            className='kyc-form-btn-back'
            onClick={back}
            disabled={submitting}
          >
            <ArrowLeft size={15} /> Back
          </button>
        ) : (
          <div />
        )}

        {currentStep < steps[steps.length - 1].id ? (
          <button
            className='kyc-form-btn-next'
            onClick={next}
            disabled={uploadingFront || uploadingBack || uploadingSelfie}
          >
            Continue <ArrowRight size={15} />
          </button>
        ) : (
          <button
            className='kyc-form-btn-submit'
            onClick={submit}
            disabled={submitting}
          >
            {submitting ? (
              <>
                <Loader2 size={15} className='spin' /> Submitting…
              </>
            ) : (
              <>
                Submit KYC <ArrowRight size={15} />
              </>
            )}
          </button>
        )}
      </div>
    </div>
  )
}
