import React, { useState, useEffect, useRef } from 'react'
import './Settings.scss'

// ─── Tab config ───────────────────────────────────────────────────────────────
const TABS = [
  { id: 'profile', label: 'Profile', icon: '◈' },
  { id: 'notifications', label: 'Notifications', icon: '◎' },
  { id: 'billing', label: 'Billing', icon: '▦' },
  { id: 'security', label: 'Security', icon: '⬡' },
  { id: 'preferences', label: 'Preferences', icon: '◉' }
]

// ─── API helpers ──────────────────────────────────────────────────────────────
const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000'

function getToken () {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('authToken')
}

async function apiFetch (method, path, body) {
  const token = getToken()
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers.Authorization = `Bearer ${token}`

  const opts = { method, headers }
  if (body !== undefined) opts.body = JSON.stringify(body)

  const res = await fetch(`${API_BASE}${path}`, opts)
  return res.json()
}

async function apiUpload (path, formData) {
  const token = getToken()
  const headers = {}
  if (token) headers.Authorization = `Bearer ${token}`

  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers,
    body: formData
  })
  return res.json()
}

// ─── Reusable field components ────────────────────────────────────────────────
function FieldGroup ({ label, hint, children }) {
  return (
    <div className='field-group'>
      <div className='field-group__label-wrap'>
        <label className='field-group__label'>{label}</label>
        {hint && <span className='field-group__hint'>{hint}</span>}
      </div>
      <div className='field-group__control'>{children}</div>
    </div>
  )
}

function Toggle ({ checked, onChange, label, description }) {
  return (
    <div className='toggle-row'>
      <div className='toggle-row__text'>
        <span className='toggle-row__label'>{label}</span>
        {description && <span className='toggle-row__desc'>{description}</span>}
      </div>
      <button
        role='switch'
        aria-checked={checked}
        className={`toggle ${checked ? 'toggle--on' : ''}`}
        onClick={() => onChange(!checked)}
      >
        <span className='toggle__thumb' />
      </button>
    </div>
  )
}

function SectionBlock ({ title, description, children }) {
  return (
    <div className='section-block'>
      <div className='section-block__header'>
        <h3 className='section-block__title'>{title}</h3>
        {description && <p className='section-block__desc'>{description}</p>}
      </div>
      <div className='section-block__body'>{children}</div>
    </div>
  )
}

function SaveBar ({ dirty, onSave, onDiscard, saving }) {
  if (!dirty) return null
  return (
    <div className='save-bar'>
      <span className='save-bar__msg'>You have unsaved changes</span>
      <div className='save-bar__actions'>
        <button className='btn btn--ghost' onClick={onDiscard}>
          Discard
        </button>
        <button className='btn btn--primary' onClick={onSave} disabled={saving}>
          {saving ? <span className='spinner' /> : 'Save Changes'}
        </button>
      </div>
    </div>
  )
}

// ─── Tab Panels ───────────────────────────────────────────────────────────────

function ProfileTab ({ data, onChange, onAvatarUpload }) {
  const fileRef = useRef(null)

  function handleFileChange (e) {
    const file = e.target.files?.[0]
    if (file) onAvatarUpload(file)
    // reset so the same file can be re-selected
    e.target.value = ''
  }

  return (
    <div className='tab-panel'>
      <SectionBlock
        title='Personal Information'
        description='Your name and contact details shown to tenants and agents.'
      >
        <div className='avatar-row'>
          <div className='avatar-large'>
            {data.avatar
              ? (
                <img
                  src={data.avatar}
                  alt='Profile'
                  style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                />
                )
              : (
                <>{data.firstName?.[0]}{data.lastName?.[0]}</>
                )}
          </div>
          <div className='avatar-row__actions'>
            <input
              ref={fileRef}
              type='file'
              accept='image/*'
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
            <button
              className='btn btn--ghost btn--sm'
              onClick={() => fileRef.current?.click()}
            >
              Upload photo
            </button>
            <button className='btn btn--danger-ghost btn--sm'>Remove</button>
          </div>
        </div>

        <div className='two-col'>
          <FieldGroup label='First Name'>
            <input
              className='input'
              value={data.firstName}
              onChange={e => onChange('firstName', e.target.value)}
            />
          </FieldGroup>
          <FieldGroup label='Last Name'>
            <input
              className='input'
              value={data.lastName}
              onChange={e => onChange('lastName', e.target.value)}
            />
          </FieldGroup>
        </div>

        <FieldGroup
          label='Email Address'
          hint='Used for login and tenant communication'
        >
          <input
            className='input'
            type='email'
            value={data.email}
            onChange={e => onChange('email', e.target.value)}
          />
        </FieldGroup>

        <div className='two-col'>
          <FieldGroup label='Phone Number'>
            <input
              className='input'
              type='tel'
              value={data.phone}
              onChange={e => onChange('phone', e.target.value)}
            />
          </FieldGroup>
          <FieldGroup label='Time Zone'>
            <select
              className='input input--select'
              value={data.timezone}
              onChange={e => onChange('timezone', e.target.value)}
            >
              <option value='America/New_York'>Eastern Time (ET)</option>
              <option value='America/Chicago'>Central Time (CT)</option>
              <option value='America/Denver'>Mountain Time (MT)</option>
              <option value='America/Los_Angeles'>Pacific Time (PT)</option>
              <option value='Europe/London'>GMT / London</option>
              <option value='Africa/Lagos'>West Africa Time (WAT)</option>
            </select>
          </FieldGroup>
        </div>
      </SectionBlock>

      <SectionBlock
        title='Business Details'
        description='Optional info used on lease agreements and invoices.'
      >
        <FieldGroup label='Company / Trading Name' hint='Optional'>
          <input
            className='input'
            value={data.company}
            onChange={e => onChange('company', e.target.value)}
            placeholder='e.g. King Properties LLC'
          />
        </FieldGroup>
        <div className='two-col'>
          <FieldGroup label='Tax ID / EIN' hint='Optional'>
            <input
              className='input'
              value={data.taxId}
              onChange={e => onChange('taxId', e.target.value)}
              placeholder='XX-XXXXXXX'
            />
          </FieldGroup>
          <FieldGroup label='License Number' hint='Optional'>
            <input
              className='input'
              value={data.licenseNo}
              onChange={e => onChange('licenseNo', e.target.value)}
            />
          </FieldGroup>
        </div>
        <FieldGroup label='Business Address'>
          <input
            className='input'
            value={data.businessAddress}
            onChange={e => onChange('businessAddress', e.target.value)}
            placeholder='Street, City, State, ZIP'
          />
        </FieldGroup>
      </SectionBlock>
    </div>
  )
}

function NotificationsTab ({ data, onChange }) {
  const channel = key => ({
    checked: data[key] ?? false,
    onChange: v => onChange(key, v)
  })

  return (
    <div className='tab-panel'>
      <SectionBlock
        title='Rent & Payments'
        description='Alerts related to rent collection and financial events.'
      >
        <Toggle
          label='Rent received'
          description='Get notified when a tenant completes a payment.'
          {...channel('rentReceived')}
        />
        <Toggle
          label='Overdue rent'
          description='Alert when rent is 1+ days past due.'
          {...channel('rentOverdue')}
        />
        <Toggle
          label='Partial payment'
          description='Notified when only part of the rent is paid.'
          {...channel('rentPartial')}
        />
        <Toggle
          label='Payout processed'
          description='When your monthly payout is initiated.'
          {...channel('payoutProcessed')}
        />
      </SectionBlock>

      <SectionBlock
        title='Maintenance Requests'
        description='Stay on top of property repair activity.'
      >
        <Toggle
          label='New request submitted'
          description='A tenant submits a maintenance ticket.'
          {...channel('maintenanceNew')}
        />
        <Toggle
          label='Request status updated'
          description='Contractor updates the job status.'
          {...channel('maintenanceUpdated')}
        />
        <Toggle
          label='Request resolved'
          description='A ticket is marked complete.'
          {...channel('maintenanceResolved')}
        />
      </SectionBlock>

      <SectionBlock
        title='Leases & Tenants'
        description='Lease lifecycle and tenant-related events.'
      >
        <Toggle
          label='Lease expiring soon'
          description='30-day warning before a lease ends.'
          {...channel('leaseExpiringSoon')}
        />
        <Toggle
          label='Lease signed'
          description='When a new or renewed lease is executed.'
          {...channel('leaseSigned')}
        />
        <Toggle
          label='Tenant move-in / move-out'
          description='Move events on any of your properties.'
          {...channel('tenantMoveEvent')}
        />
        <Toggle
          label='New tenant application'
          description='Someone applies for a vacant unit.'
          {...channel('tenantApplication')}
        />
      </SectionBlock>

      <SectionBlock
        title='Delivery Channels'
        description='How you want to receive notifications.'
      >
        <Toggle label='Email notifications' {...channel('deliveryEmail')} />
        <Toggle label='SMS / Text messages' {...channel('deliverySms')} />
        <Toggle label='Push notifications (app)' {...channel('deliveryPush')} />
        <Toggle
          label='Weekly digest summary'
          description='One email per week summarising all activity.'
          {...channel('weeklyDigest')}
        />
      </SectionBlock>
    </div>
  )
}

const PLAN_ICONS_S = { free: '🌱', basic: '⚡', pro: '🚀', enterprise: '🏢' }
const PLAN_COLORS_S = { free: '#64748b', basic: '#0071c2', pro: '#7c3aed', enterprise: '#059669' }
const fmtNgn = v => `₦${Number(v || 0).toLocaleString()}`
const fmtDateS = d => d ? new Date(d).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' }) : null

function BillingTab ({ data, onChange }) {
  const [setupStatus, setSetupStatus] = useState(null)
  const [plans, setPlans]             = useState([])
  const [billingLoading, setBillingLoading] = useState(true)
  const [subscribing, setSubscribing] = useState(null)
  const [billingMsg, setBillingMsg]   = useState(null)

  useEffect(() => {
    Promise.all([
      apiFetch('GET', '/api/paystack/setup-status'),
      fetch(`${API_BASE}/api/paystack/plans`).then(r => r.json())
    ]).then(([statusRes, plansRes]) => {
      if (statusRes.success) setSetupStatus(statusRes)
      if (plansRes.success)  setPlans(plansRes.plans || [])
    }).catch(console.error).finally(() => setBillingLoading(false))
  }, [])

  async function handleUpgrade (plan) {
    if (subscribing) return
    setSubscribing(plan.id)
    try {
      const res = await apiFetch('POST', '/api/paystack/subscribe', { planId: plan.id })
      if (!res.success) throw new Error(res.msg || 'Failed')
      if (plan.price === 0) {
        setBillingMsg({ text: 'Downgraded to Free plan.', ok: true })
        setSetupStatus(prev => ({ ...prev, plan: { ...prev?.plan, tier: 'free', effectiveTier: 'free' } }))
      } else {
        window.open(res.authorizationUrl, '_blank', 'noopener')
        setBillingMsg({ text: 'Payment page opened. Your plan activates once payment is confirmed.', ok: true })
      }
    } catch (err) {
      setBillingMsg({ text: err.message || 'Could not process plan change', ok: false })
    } finally {
      setSubscribing(null)
      setTimeout(() => setBillingMsg(null), 5000)
    }
  }

  const plan   = setupStatus?.plan || {}
  const payout = setupStatus?.paymentSetup || {}
  const tier   = plan.effectiveTier || plan.tier || 'free'
  const tierColor = PLAN_COLORS_S[tier] || '#1d4ed8'

  return (
    <div className='tab-panel'>

      {billingMsg && (
        <div className={`billing-msg${billingMsg.ok ? ' billing-msg--ok' : ' billing-msg--err'}`}>
          {billingMsg.ok ? '✓' : '✕'} {billingMsg.text}
        </div>
      )}

      {/* ── Current Plan ── */}
      <SectionBlock title='Subscription Plan' description='Your current platform plan and billing cycle.'>
        {billingLoading ? (
          <div style={{ color: 'var(--color-text-muted)', fontSize: 14 }}>Loading plan info…</div>
        ) : (
          <>
            <div className='plan-card plan-card--active'>
              <div className='plan-card__left'>
                <span style={{ fontSize: 28 }}>{PLAN_ICONS_S[tier] || '📦'}</span>
                <div>
                  <span className='plan-card__name' style={{ color: tierColor }}>
                    {tier.charAt(0).toUpperCase() + tier.slice(1)}
                    {plan.trialActive && (
                      <span style={{ fontSize: 11, background: '#fef3c7', color: '#92400e', border: '1px solid #fcd34d', borderRadius: 20, padding: '2px 8px', marginLeft: 8, fontWeight: 700 }}>
                        Trial
                      </span>
                    )}
                  </span>
                  <span className='plan-card__features'>
                    {plan.listingLimit === -1 ? 'Unlimited' : plan.listingLimit} listings ·&nbsp;
                    {plan.features?.length || 0} premium features
                    {plan.trialActive && plan.trialEndsAt && (
                      <> · Trial ends {fmtDateS(plan.trialEndsAt)}</>
                    )}
                  </span>
                </div>
              </div>
              <div className='plan-card__right'>
                {/* price shown in plans grid below */}
              </div>
            </div>

            {/* Available plans */}
            <div style={{ marginTop: 20 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 12 }}>
                Available Plans — click to upgrade or downgrade
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
                {plans.map(p => {
                  const isCurrent = p.id === (plan.tier || 'free')
                  const c = PLAN_COLORS_S[p.id] || '#1d4ed8'
                  return (
                    <div key={p.id} style={{
                      border: `1.5px solid ${isCurrent ? c : 'var(--color-border)'}`,
                      borderTop: `4px solid ${c}`,
                      borderRadius: 10,
                      padding: '14px',
                      background: 'var(--color-surface)',
                      display: 'flex', flexDirection: 'column', gap: 8
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 22 }}>{PLAN_ICONS_S[p.id]}</span>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--color-text-primary)' }}>{p.name}</div>
                          <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
                            {p.price === 0 ? 'Free' : `${fmtNgn(p.price)}/mo`}
                          </div>
                        </div>
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                        {p.listingLimit === -1 ? '∞' : p.listingLimit} listings · {p.aiCredits === -1 ? '∞' : p.aiCredits} AI credits
                      </div>
                      <button
                        className={isCurrent ? 'btn btn--ghost btn--sm' : 'btn btn--primary btn--sm'}
                        style={!isCurrent ? { background: c, border: 'none' } : {}}
                        onClick={() => !isCurrent && handleUpgrade(p)}
                        disabled={isCurrent || subscribing === p.id}
                      >
                        {subscribing === p.id ? <span className='spinner' /> : isCurrent ? 'Current' : p.price === 0 ? 'Downgrade' : 'Upgrade'}
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          </>
        )}

        <FieldGroup label='Billing Email' hint='Invoices and receipts are sent here'>
          <input
            className='input'
            type='email'
            value={data.billingEmail}
            onChange={e => onChange('billingEmail', e.target.value)}
          />
        </FieldGroup>
      </SectionBlock>

      {/* ── Payout Account ── */}
      <SectionBlock title='Payout Account' description='Bank account where collected rent is deposited after platform fees.'>
        {billingLoading ? (
          <div style={{ color: 'var(--color-text-muted)', fontSize: 14 }}>Loading payout info…</div>
        ) : payout.completed ? (
          <div className='bank-card'>
            <div className='bank-card__icon'>🏦</div>
            <div className='bank-card__info'>
              <span className='bank-card__name'>{payout.bankName || 'Bank Account'}</span>
              <span className='bank-card__number'>{payout.accountName}</span>
              <span style={{ fontSize: 11, color: '#059669', fontWeight: 600 }}>✓ Verified & Active</span>
            </div>
          </div>
        ) : (
          <div style={{ padding: '12px', background: 'var(--color-warning-bg, #fef3c7)', borderRadius: 8, fontSize: 14, color: '#92400e' }}>
            ⚠️ No payout account set up. Go to <strong>Account Setup</strong> from the banner at the top to link your bank account.
          </div>
        )}

        <FieldGroup label='Payout Schedule'>
          <select
            className='input input--select'
            value={data.payoutSchedule}
            onChange={e => onChange('payoutSchedule', e.target.value)}
          >
            <option value='instant'>Instant (2% fee)</option>
            <option value='daily'>Daily</option>
            <option value='weekly'>Weekly</option>
            <option value='monthly'>Monthly (1st of month)</option>
          </select>
        </FieldGroup>
      </SectionBlock>

      {/* ── Platform Fees ── */}
      <SectionBlock title='Platform Fees' description='Fee rates applied to transactions through the platform.'>
        <div className='fee-table'>
          <div className='fee-row'><span>Rent collection fee</span><strong>2.5%</strong></div>
          <div className='fee-row'><span>Escrow management fee</span><strong>2.5%</strong></div>
          <div className='fee-row'><span>Instant payout fee</span><strong>2.0%</strong></div>
          <div className='fee-row'><span>Paystack processing fee</span><strong>1.5% + ₦100</strong></div>
        </div>
      </SectionBlock>
    </div>
  )
}

function SecurityTab ({
  data,
  onChange,
  sessions,
  onPasswordChange,
  onRevokeSession,
  onRevokeAllSessions,
  onDeactivate,
  onDeleteAccount
}) {
  const [showPwForm, setShowPwForm] = useState(false)
  const [pw, setPw] = useState({ current: '', next: '', confirm: '' })
  const [pwSaving, setPwSaving] = useState(false)
  const [pwError, setPwError] = useState('')

  const [showDeleteForm, setShowDeleteForm] = useState(false)
  const [deletePassword, setDeletePassword] = useState('')
  const [deleting, setDeleting] = useState(false)

  async function submitPasswordChange () {
    setPwError('')
    if (pw.next.length < 8) {
      setPwError('New password must be at least 8 characters.')
      return
    }
    if (pw.next !== pw.confirm) {
      setPwError('Passwords do not match.')
      return
    }
    setPwSaving(true)
    const ok = await onPasswordChange({
      current_password: pw.current,
      new_password: pw.next
    })
    setPwSaving(false)
    if (ok) {
      setShowPwForm(false)
      setPw({ current: '', next: '', confirm: '' })
    }
  }

  async function submitDeleteAccount () {
    if (!deletePassword) return
    setDeleting(true)
    await onDeleteAccount(deletePassword)
    setDeleting(false)
  }

  return (
    <div className='tab-panel'>
      <SectionBlock
        title='Password'
        description='Keep your account secure with a strong, unique password.'
      >
        {!showPwForm
          ? (
            <button
              className='btn btn--ghost'
              onClick={() => setShowPwForm(true)}
            >
              Change Password
            </button>
            )
          : (
            <div className='pw-form'>
              <FieldGroup label='Current Password'>
                <input
                  className='input'
                  type='password'
                  value={pw.current}
                  onChange={e => setPw(p => ({ ...p, current: e.target.value }))}
                />
              </FieldGroup>
              <FieldGroup label='New Password' hint='Min. 8 characters'>
                <input
                  className='input'
                  type='password'
                  value={pw.next}
                  onChange={e => setPw(p => ({ ...p, next: e.target.value }))}
                />
              </FieldGroup>
              <FieldGroup label='Confirm New Password'>
                <input
                  className='input'
                  type='password'
                  value={pw.confirm}
                  onChange={e => setPw(p => ({ ...p, confirm: e.target.value }))}
                />
              </FieldGroup>
              {pwError && <p className='field-error'>{pwError}</p>}
              <div className='btn-row'>
                <button
                  className='btn btn--ghost'
                  onClick={() => { setShowPwForm(false); setPwError('') }}
                >
                  Cancel
                </button>
                <button
                  className='btn btn--primary'
                  onClick={submitPasswordChange}
                  disabled={pwSaving}
                >
                  {pwSaving ? <span className='spinner' /> : 'Update Password'}
                </button>
              </div>
            </div>
            )}
      </SectionBlock>

      <SectionBlock
        title='Two-Factor Authentication'
        description='Add a second layer of protection to your account.'
      >
        <Toggle
          label='Enable 2FA via Authenticator App'
          description='Use Google Authenticator or Authy.'
          checked={data.twoFactorEnabled}
          onChange={v => onChange('twoFactorEnabled', v)}
        />
        <Toggle
          label='SMS backup code'
          description='Receive a code via text when 2FA app is unavailable.'
          checked={data.smsFallback}
          onChange={v => onChange('smsFallback', v)}
        />
      </SectionBlock>

      <SectionBlock
        title='Active Sessions'
        description='Devices currently signed into your account.'
      >
        {sessions.length === 0
          ? (
            <p className='section-block__desc' style={{ fontStyle: 'italic' }}>
              No other active sessions found.
            </p>
            )
          : (
            <div className='session-list'>
              {sessions.map((s, i) => (
                <div key={s._id ?? i} className='session-row'>
                  <div className='session-row__icon'>
                    {s.current ? '💻' : '📱'}
                  </div>
                  <div className='session-row__info'>
                    <span className='session-row__device'>
                      {s.device ?? s.userAgent ?? 'Unknown device'}
                      {s.current && (
                        <span className='current-badge'>This device</span>
                      )}
                    </span>
                    <span className='session-row__meta'>
                      {s.location ?? ''}{s.location && s.lastActive ? ' · ' : ''}{s.lastActive ?? ''}
                    </span>
                  </div>
                  {!s.current && (
                    <button
                      className='btn btn--danger-ghost btn--sm'
                      onClick={() => onRevokeSession(s._id)}
                    >
                      Revoke
                    </button>
                  )}
                </div>
              ))}
            </div>
            )}
        <button className='btn btn--danger-ghost' onClick={onRevokeAllSessions}>
          Revoke All Other Sessions
        </button>
      </SectionBlock>

      <SectionBlock
        title='Danger Zone'
        description='Irreversible account actions.'
      >
        <div className='danger-zone'>
          <div className='danger-zone__item'>
            <div>
              <p className='danger-zone__label'>Deactivate account</p>
              <p className='danger-zone__desc'>
                Temporarily disable your account. Your data is preserved.
              </p>
            </div>
            <button className='btn btn--danger-ghost' onClick={onDeactivate}>
              Deactivate
            </button>
          </div>
          <div className='danger-zone__item'>
            <div>
              <p className='danger-zone__label'>Delete account permanently</p>
              <p className='danger-zone__desc'>
                All properties, tenants, and transaction history will be erased.
              </p>
            </div>
            {!showDeleteForm
              ? (
                <button
                  className='btn btn--danger'
                  onClick={() => setShowDeleteForm(true)}
                >
                  Delete Account
                </button>
                )
              : (
                <div className='pw-form' style={{ minWidth: '260px' }}>
                  <FieldGroup label='Enter your password to confirm'>
                    <input
                      className='input'
                      type='password'
                      value={deletePassword}
                      onChange={e => setDeletePassword(e.target.value)}
                      placeholder='Current password'
                    />
                  </FieldGroup>
                  <div className='btn-row'>
                    <button
                      className='btn btn--ghost'
                      onClick={() => { setShowDeleteForm(false); setDeletePassword('') }}
                    >
                      Cancel
                    </button>
                    <button
                      className='btn btn--danger'
                      onClick={submitDeleteAccount}
                      disabled={deleting || !deletePassword}
                    >
                      {deleting ? <span className='spinner' /> : 'Confirm Delete'}
                    </button>
                  </div>
                </div>
                )}
          </div>
        </div>
      </SectionBlock>
    </div>
  )
}

function PreferencesTab ({ data, onChange }) {
  return (
    <div className='tab-panel'>
      <SectionBlock
        title='Display & Locale'
        description='Customize how the dashboard looks and formats data.'
      >
        <FieldGroup label='Currency'>
          <select
            className='input input--select'
            value={data.currency}
            onChange={e => onChange('currency', e.target.value)}
          >
            <option value='USD'>USD — US Dollar</option>
            <option value='GBP'>GBP — British Pound</option>
            <option value='EUR'>EUR — Euro</option>
            <option value='NGN'>NGN — Nigerian Naira</option>
            <option value='CAD'>CAD — Canadian Dollar</option>
          </select>
        </FieldGroup>

        <FieldGroup label='Date Format'>
          <select
            className='input input--select'
            value={data.dateFormat}
            onChange={e => onChange('dateFormat', e.target.value)}
          >
            <option value='MM/DD/YYYY'>MM/DD/YYYY</option>
            <option value='DD/MM/YYYY'>DD/MM/YYYY</option>
            <option value='YYYY-MM-DD'>YYYY-MM-DD</option>
          </select>
        </FieldGroup>

        <FieldGroup label='Theme'>
          <div className='theme-picker'>
            {['dark', 'light', 'system'].map(t => (
              <button
                key={t}
                className={`theme-btn ${data.theme === t ? 'theme-btn--active' : ''}`}
                onClick={() => onChange('theme', t)}
              >
                {t === 'dark' ? '🌙' : t === 'light' ? '☀️' : '⚙️'}
                <span>{t.charAt(0).toUpperCase() + t.slice(1)}</span>
              </button>
            ))}
          </div>
        </FieldGroup>
      </SectionBlock>

      <SectionBlock
        title='Dashboard Defaults'
        description='Set default views when you first open each section.'
      >
        <FieldGroup label='Default Property View'>
          <select
            className='input input--select'
            value={data.defaultPropertyView}
            onChange={e => onChange('defaultPropertyView', e.target.value)}
          >
            <option value='grid'>Grid</option>
            <option value='list'>List</option>
            <option value='map'>Map</option>
          </select>
        </FieldGroup>
        <Toggle
          label='Show vacant properties first'
          description='Pin un-tenanted units to the top of all lists.'
          checked={data.vacantFirst}
          onChange={v => onChange('vacantFirst', v)}
        />
        <Toggle
          label='Compact sidebar'
          description='Collapse navigation labels by default.'
          checked={data.compactSidebar}
          onChange={v => onChange('compactSidebar', v)}
        />
      </SectionBlock>

      <SectionBlock
        title='Privacy'
        description='Control what data is visible to tenants and agents.'
      >
        <Toggle
          label='Show phone number to tenants'
          checked={data.showPhone}
          onChange={v => onChange('showPhone', v)}
        />
        <Toggle
          label='Show company name on lease agreements'
          checked={data.showCompany}
          onChange={v => onChange('showCompany', v)}
        />
        <Toggle
          label='Allow agents to contact me directly'
          checked={data.allowAgentContact}
          onChange={v => onChange('allowAgentContact', v)}
        />
      </SectionBlock>
    </div>
  )
}

// ─── Root Settings component ──────────────────────────────────────────────────
export default function Settings () {
  const [activeTab, setActiveTab] = useState('profile')
  const [formData, setFormData] = useState({})
  const [savedData, setSavedData] = useState({})
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState(null)

  const dirty = JSON.stringify(formData) !== JSON.stringify(savedData)

  function showToast (msg, type = 'success') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  // ─── Load all settings on mount ─────────────────────────────────────────────
  useEffect(() => {
    async function loadAll () {
      setLoading(true)
      try {
        const [profileRes, notifRes, prefRes, sessionRes] = await Promise.all([
          apiFetch('GET', '/api/settings/profile'),
          apiFetch('GET', '/api/settings/notifications'),
          apiFetch('GET', '/api/settings/preferences'),
          apiFetch('GET', '/api/settings/security/sessions')
        ])

        // billing may 404 if not set yet — treat that as empty
        const billingRes = await apiFetch('GET', '/api/settings/billing').catch(() => ({ data: {} }))

        const p    = profileRes.data    ?? {}
        const n    = notifRes.data      ?? {}
        const b    = billingRes.data    ?? {}
        const pref = prefRes.data       ?? {}

        const merged = {
          // ── profile ──────────────────────────────────────────────────────
          firstName:       p.firstName                            ?? '',
          lastName:        p.lastName                             ?? '',
          email:           p.email                                ?? '',
          phone:           p.phone                                ?? '',
          timezone:        p.preferences?.timezone                ?? 'Africa/Lagos',
          company:         p.propertyOwnerProfile?.companyName    ?? '',
          taxId:           p.propertyOwnerProfile?.taxId          ?? '',
          licenseNo:       '',
          businessAddress: '',
          avatar:          p.avatar                               ?? '',

          // ── notifications ────────────────────────────────────────────────
          rentReceived:        n.rentReceived        ?? true,
          rentOverdue:         n.rentOverdue         ?? true,
          rentPartial:         n.rentPartial         ?? false,
          payoutProcessed:     n.payoutProcessed     ?? true,
          maintenanceNew:      n.maintenanceNew      ?? true,
          maintenanceUpdated:  n.maintenanceUpdated  ?? false,
          maintenanceResolved: n.maintenanceResolved ?? true,
          leaseExpiringSoon:   n.leaseExpiringSoon   ?? true,
          leaseSigned:         n.leaseSigned         ?? true,
          tenantMoveEvent:     n.tenantMoveEvent     ?? false,
          tenantApplication:   n.tenantApplication   ?? true,
          deliveryEmail:       n.deliveryEmail        ?? true,
          deliverySms:         n.deliverySms          ?? false,
          deliveryPush:        n.deliveryPush          ?? true,
          weeklyDigest:        n.weeklyDigest          ?? true,

          // ── billing ──────────────────────────────────────────────────────
          bankName:       b.bankName       ?? '',
          bankLast4:      b.bankLast4      ?? '',
          payoutSchedule: b.payoutSchedule ?? 'monthly',
          billingEmail:   b.billingEmail   ?? '',

          // ── security (2FA lives in Settings doc, not returned by profile) ─
          twoFactorEnabled: false,
          smsFallback:      false,

          // ── preferences ──────────────────────────────────────────────────
          currency:            pref.currency             ?? 'NGN',
          dateFormat:          pref.dateFormat            ?? 'DD/MM/YYYY',
          theme:               pref.theme                 ?? 'dark',
          defaultPropertyView: pref.defaultPropertyView  ?? 'grid',
          vacantFirst:         pref.vacantFirst           ?? false,
          compactSidebar:      pref.compactSidebar        ?? false,
          showPhone:           pref.showPhone             ?? false,
          showCompany:         pref.showCompany           ?? true,
          allowAgentContact:   pref.allowAgentContact     ?? true
        }

        setFormData(merged)
        setSavedData(merged)
        setSessions(sessionRes.data ?? [])
      } catch (err) {
        console.error('[Settings] loadAll failed', err)
        showToast('Failed to load settings.', 'error')
      } finally {
        setLoading(false)
      }
    }

    loadAll()
  }, [])

  // ─── Field change ────────────────────────────────────────────────────────────
  function handleChange (key, value) {
    setFormData(prev => ({ ...prev, [key]: value }))
  }

  // ─── Tab-aware save ──────────────────────────────────────────────────────────
  async function handleSave () {
    setSaving(true)
    try {
      let res

      if (activeTab === 'profile') {
        res = await apiFetch('PATCH', '/api/settings/profile', {
          first_name:       formData.firstName,
          last_name:        formData.lastName,
          email:            formData.email,
          phone:            formData.phone,
          timezone:         formData.timezone,
          company:          formData.company,
          tax_id:           formData.taxId,
          license_no:       formData.licenseNo,
          business_address: formData.businessAddress
        })
      } else if (activeTab === 'notifications') {
        const {
          rentReceived, rentOverdue, rentPartial, payoutProcessed,
          maintenanceNew, maintenanceUpdated, maintenanceResolved,
          leaseExpiringSoon, leaseSigned, tenantMoveEvent, tenantApplication,
          deliveryEmail, deliverySms, deliveryPush, weeklyDigest
        } = formData
        res = await apiFetch('PUT', '/api/settings/notifications', {
          rentReceived, rentOverdue, rentPartial, payoutProcessed,
          maintenanceNew, maintenanceUpdated, maintenanceResolved,
          leaseExpiringSoon, leaseSigned, tenantMoveEvent, tenantApplication,
          deliveryEmail, deliverySms, deliveryPush, weeklyDigest
        })
      } else if (activeTab === 'billing') {
        res = await apiFetch('PATCH', '/api/settings/billing', {
          payout_schedule: formData.payoutSchedule,
          billing_email:   formData.billingEmail
        })
      } else if (activeTab === 'security') {
        res = await apiFetch('PATCH', '/api/settings/security/2fa', {
          two_factor_enabled: formData.twoFactorEnabled,
          sms_fallback:       formData.smsFallback
        })
      } else if (activeTab === 'preferences') {
        const {
          currency, dateFormat, theme, defaultPropertyView,
          vacantFirst, compactSidebar, showPhone, showCompany, allowAgentContact
        } = formData
        res = await apiFetch('PUT', '/api/settings/preferences', {
          currency, dateFormat, theme, defaultPropertyView,
          vacantFirst, compactSidebar, showPhone, showCompany, allowAgentContact
        })
      }

      if (res && !res.success) throw new Error(res.message || 'Save failed.')

      setSavedData({ ...formData })
      showToast('Settings saved successfully.')
    } catch (err) {
      showToast(err.message || 'Failed to save settings.', 'error')
    } finally {
      setSaving(false)
    }
  }

  function handleDiscard () {
    setFormData({ ...savedData })
  }

  // ─── Avatar upload ───────────────────────────────────────────────────────────
  async function handleAvatarUpload (file) {
    try {
      const fd = new FormData()
      fd.append('avatar', file)
      const res = await apiUpload('/api/settings/profile/avatar', fd)
      if (!res.success) throw new Error(res.message)
      setFormData(prev => ({ ...prev, avatar: res.avatar_url }))
      setSavedData(prev => ({ ...prev, avatar: res.avatar_url }))
      showToast('Avatar updated.')
    } catch (err) {
      showToast(err.message || 'Avatar upload failed.', 'error')
    }
  }

  // ─── Bank link ───────────────────────────────────────────────────────────────
  async function handleLinkBank ({ bank_name, account_number, routing_number, account_name }) {
    try {
      const res = await apiFetch('POST', '/api/settings/billing/bank', {
        bank_name, account_number, routing_number, account_name
      })
      if (!res.success) throw new Error(res.message)
      setFormData(prev => ({ ...prev, bankName: bank_name, bankLast4: res.bank_last4 }))
      setSavedData(prev => ({ ...prev, bankName: bank_name, bankLast4: res.bank_last4 }))
      showToast('Bank account linked.')
    } catch (err) {
      showToast(err.message || 'Failed to link bank account.', 'error')
    }
  }

  // ─── Password change ─────────────────────────────────────────────────────────
  async function handlePasswordChange ({ current_password, new_password }) {
    try {
      const res = await apiFetch('PATCH', '/api/settings/security/password', {
        current_password,
        new_password
      })
      if (!res.success) throw new Error(res.message)
      showToast('Password updated.')
      return true
    } catch (err) {
      showToast(err.message || 'Failed to update password.', 'error')
      return false
    }
  }

  // ─── Session management ──────────────────────────────────────────────────────
  async function handleRevokeSession (sessionId) {
    try {
      const res = await apiFetch('DELETE', `/api/settings/security/sessions/${sessionId}`)
      if (!res.success) throw new Error(res.message)
      setSessions(prev => prev.filter(s => s._id !== sessionId))
      showToast('Session revoked.')
    } catch (err) {
      showToast(err.message || 'Failed to revoke session.', 'error')
    }
  }

  async function handleRevokeAllSessions () {
    try {
      const res = await apiFetch('DELETE', '/api/settings/security/sessions')
      if (!res.success) throw new Error(res.message)
      setSessions([])
      showToast('All other sessions revoked.')
    } catch (err) {
      showToast(err.message || 'Failed to revoke sessions.', 'error')
    }
  }

  // ─── Deactivate / Delete ─────────────────────────────────────────────────────
  async function handleDeactivate () {
    if (!window.confirm('Deactivate your account? You can reactivate by contacting support.')) return
    try {
      const res = await apiFetch('POST', '/api/settings/security/deactivate')
      if (!res.success) throw new Error(res.message)
      showToast('Account deactivated.')
    } catch (err) {
      showToast(err.message || 'Failed to deactivate account.', 'error')
    }
  }

  async function handleDeleteAccount (password) {
    try {
      const res = await apiFetch('DELETE', '/api/settings/security/account', { password })
      if (!res.success) throw new Error(res.message)
      showToast('Account permanently deleted.')
      setTimeout(() => { window.location.href = '/' }, 1500)
      return true
    } catch (err) {
      showToast(err.message || 'Failed to delete account.', 'error')
      return false
    }
  }

  // ─── Render ──────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className='settings'>
        <div className='settings__header'>
          <h1 className='settings__title'>Settings</h1>
          <p className='settings__subtitle'>Manage your account, preferences, and security</p>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
          <span className='spinner' style={{ width: 32, height: 32 }} />
        </div>
      </div>
    )
  }

  const tabProps = { data: formData, onChange: handleChange }

  return (
    <div className='settings'>
      {/* Header */}
      <div className='settings__header'>
        <div>
          <h1 className='settings__title'>Settings</h1>
          <p className='settings__subtitle'>
            Manage your account, preferences, and security
          </p>
        </div>
      </div>

      <div className='settings__layout'>
        {/* Sidebar nav */}
        <nav className='settings__nav'>
          {TABS.map(tab => (
            <button
              key={tab.id}
              className={`settings-nav-item ${
                activeTab === tab.id ? 'settings-nav-item--active' : ''
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className='settings-nav-item__icon'>{tab.icon}</span>
              <span className='settings-nav-item__label'>{tab.label}</span>
            </button>
          ))}
        </nav>

        {/* Panel */}
        <div className='settings__panel'>
          {activeTab === 'profile' && (
            <ProfileTab {...tabProps} onAvatarUpload={handleAvatarUpload} />
          )}
          {activeTab === 'notifications' && <NotificationsTab {...tabProps} />}
          {activeTab === 'billing' && (
            <BillingTab {...tabProps} onLinkBank={handleLinkBank} />
          )}
          {activeTab === 'security' && (
            <SecurityTab
              {...tabProps}
              sessions={sessions}
              onPasswordChange={handlePasswordChange}
              onRevokeSession={handleRevokeSession}
              onRevokeAllSessions={handleRevokeAllSessions}
              onDeactivate={handleDeactivate}
              onDeleteAccount={handleDeleteAccount}
            />
          )}
          {activeTab === 'preferences' && <PreferencesTab {...tabProps} />}
        </div>
      </div>

      <SaveBar
        dirty={dirty}
        onSave={handleSave}
        onDiscard={handleDiscard}
        saving={saving}
      />

      {toast && (
        <div className={`toast ${toast.type === 'error' ? 'toast--error' : ''}`}>
          {toast.msg}
        </div>
      )}
    </div>
  )
}
