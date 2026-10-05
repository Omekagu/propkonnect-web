'use client'
/**
 * PropertyOwnerPayments.jsx
 * Three tabs:
 *  • Plan & Billing  — current plan, available plans, upgrade flow via Paystack
 *  • Transactions    — user's own transaction history (/api/transactions/mine)
 *  • Payouts         — payout account info from /api/paystack/setup-status
 */

import React, { useState, useEffect } from 'react'
import './PropertyOwnerPayments.scss'

const API = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4001'

function tok () {
  if (typeof window === 'undefined') return ''
  return localStorage.getItem('authToken') || ''
}

async function get (path) {
  const r = await fetch(`${API}${path}`, {
    headers: { Authorization: `Bearer ${tok()}` }
  })
  return r.json()
}

async function post (path, body) {
  const r = await fetch(`${API}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tok()}` },
    body: JSON.stringify(body)
  })
  return r.json()
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = v => `₦${Number(v || 0).toLocaleString()}`
const fmtDate = d => d ? new Date(d).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'
const timeAgo = d => {
  if (!d) return '—'
  const s = Math.floor((Date.now() - new Date(d)) / 1000)
  if (s < 60) return 'just now'
  if (s < 3600) return `${Math.floor(s / 60)}m ago`
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`
  return fmtDate(d)
}

const STATUS_COLOR = {
  completed:  { bg: '#d1fae5', color: '#065f46' },
  pending:    { bg: '#fef3c7', color: '#92400e' },
  processing: { bg: '#dbeafe', color: '#1e40af' },
  failed:     { bg: '#fee2e2', color: '#991b1b' },
  refunded:   { bg: '#ede9fe', color: '#5b21b6' },
  rejected:   { bg: '#fee2e2', color: '#991b1b' }
}

const PLAN_COLORS = {
  free:       { accent: '#7d8590', glow: 'rgba(125,133,144,0.15)', btn: '#7d8590' },
  basic:      { accent: '#3b82f6', glow: 'rgba(59,130,246,0.15)',  btn: '#3b82f6' },
  pro:        { accent: '#C4E53C', glow: 'rgba(196,229,60,0.18)',  btn: '#C4E53C' },
  enterprise: { accent: '#f59e0b', glow: 'rgba(245,158,11,0.15)', btn: '#f59e0b' },
}

const TIER_TAGLINES = {
  free:       'Get started with your first listing',
  basic:      'Grow your rental portfolio',
  pro:        'Scale with professional tools',
  enterprise: 'Full-power property management',
}

const FEATURE_LABELS = {
  // Core listing
  analytics:             'Analytics & conversion reports',
  priority_support:      'Priority customer support',
  featured_badge:        'Featured placement in search results',
  escrow_access:         'Secure escrow payment processing',
  document_upload:       'Property document upload (C of O, survey)',
  bnpl:                  'Buy-Now-Pay-Later for buyers',
  api_access:            'API access & integrations',
  white_label:           'White-label tenant portal',
  // Extra meaningful features
  verified_badge:        'Verified Landlord badge on listings',
  inspection_scheduling: 'Inspection scheduling & calendar',
  application_mgmt:      'Tenant application shortlisting',
  instant_booking:       'Instant booking (no manual approval)',
  tenant_screening:      'Tenant KYC & background screening',
  lease_management:      'Digital lease creation & e-signing',
  maintenance_mgmt:      'Maintenance request management',
  sms_notifications:     'SMS alerts for bookings & payments',
  revenue_insights:      'Revenue & occupancy insights',
  bulk_upload:           'Bulk property import',
  sub_accounts:          'Team sub-accounts (up to 5 users)',
  dedicated_manager:     'Dedicated account manager',
  top_placement:         'Guaranteed top search placement',
}

// Static per-tier highlights shown on plan cards regardless of backend features
const TIER_HIGHLIGHTS = {
  free: [
    'Standard search visibility',
    'Inspection request inbox',
    'Tenant application inbox',
    'Basic property analytics',
    'Email support',
  ],
  basic: [
    'Verified Landlord badge',
    'Priority search placement',
    'Inspection scheduling calendar',
    'Application shortlisting tools',
    'Digital lease drafts',
    'Analytics & conversion reports',
    'Priority email support',
  ],
  pro: [
    'Featured placement (top of search)',
    'Escrow payment processing',
    'Instant booking — no approval wait',
    'Tenant KYC & background screening',
    'Revenue & occupancy insights',
    'Maintenance request management',
    'SMS alerts for bookings & payments',
    'Custom digital lease templates',
  ],
  enterprise: [
    'Unlimited listings & media',
    'Team sub-accounts (5 users)',
    'Bulk property import',
    'API access & integrations',
    'White-label tenant portal',
    'Guaranteed top placement',
    'Dedicated account manager',
    'Advanced revenue forecasting',
  ],
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Toast ({ toast }) {
  if (!toast) return null
  return (
    <div className={`pop-toast ${toast.type}`}>
      {toast.type === 'error' ? '✕' : '✓'} {toast.msg}
    </div>
  )
}

function Spinner () {
  return <span className='pop-spinner' />
}

function Badge ({ status }) {
  const s = STATUS_COLOR[status] || { bg: '#f1f5f9', color: '#64748b' }
  return (
    <span className='pop-badge' style={{ background: s.bg, color: s.color }}>
      {status}
    </span>
  )
}

// ─── Tab 1: Plan & Billing ────────────────────────────────────────────────────

function PlanTab ({ setupStatus, plans, onUpgrade, subscribing }) {
  const current = setupStatus?.plan || {}
  const tier = current.effectiveTier || current.tier || 'free'
  const trialActive = current.trialActive
  const trialEndsAt = current.trialEndsAt
  const payout = setupStatus?.paymentSetup || {}
  const colors = PLAN_COLORS[tier] || PLAN_COLORS.free

  return (
    <div className='pop-section'>

      {/* ── Current Plan Banner ── */}
      <div className='pop-current-banner' style={{ borderColor: colors.accent, background: colors.glow }}>
        <div className='pop-current-banner__left'>
          <span className='pop-current-banner__label'>Active Plan</span>
          <span className='pop-current-banner__tier' style={{ color: colors.accent }}>
            {tier.charAt(0).toUpperCase() + tier.slice(1)}
          </span>
          <span className='pop-current-banner__tagline'>{TIER_TAGLINES[tier]}</span>
        </div>
        <div className='pop-current-banner__stats'>
          <div className='pop-current-banner__stat'>
            <span>{current.listingLimit === -1 ? '∞' : (current.listingLimit ?? '—')}</span>
            <label>Listings</label>
          </div>
          <div className='pop-current-banner__divider' />
          <div className='pop-current-banner__stat'>
            <span>{current.mediaPerListing === -1 ? '∞' : (current.mediaPerListing ?? '—')}</span>
            <label>Photos/listing</label>
          </div>
          <div className='pop-current-banner__divider' />
          <div className='pop-current-banner__stat'>
            <span>{current.aiCredits === -1 ? '∞' : (current.aiCredits ?? 0)}</span>
            <label>AI credits/mo</label>
          </div>
        </div>
        <div className='pop-current-banner__right'>
          {trialActive && trialEndsAt && (
            <span className='pop-trial-pill'>🎁 Trial · ends {fmtDate(trialEndsAt)}</span>
          )}
          {!trialActive && current.expiresAt && (
            <span className='pop-renew-pill'>Renews {fmtDate(current.expiresAt)}</span>
          )}
        </div>
      </div>

      {/* ── Plan Cards ── */}
      <p className='pop-plans-heading'>Choose your plan</p>
      <div className='pop-plans-grid'>
        {plans.map(plan => {
          const isCurrent = plan.id === (current.tier || 'free')
          const isPro     = plan.id === 'pro'
          const c         = PLAN_COLORS[plan.id] || PLAN_COLORS.free
          const isLoading = subscribing === plan.id
          const highlights = TIER_HIGHLIGHTS[plan.id] || []
          // Merge backend features into display list
          const extraFromBackend = (plan.features || [])
            .filter(f => !highlights.some(h => h.toLowerCase().includes((FEATURE_LABELS[f] || '').toLowerCase().slice(0, 10))))
            .map(f => FEATURE_LABELS[f] || f)

          return (
            <div
              key={plan.id}
              className={`pop-plan-card${isCurrent ? ' pop-plan-card--current' : ''}${isPro ? ' pop-plan-card--popular' : ''}`}
              style={{ '--plan-accent': c.accent }}
            >
              {isPro && <div className='pop-plan-popular'>Most Popular</div>}
              {isCurrent && <div className='pop-plan-active-dot' style={{ background: c.accent }} />}

              <div className='pop-plan-head'>
                <div>
                  <div className='pop-plan-name' style={{ color: c.accent }}>{plan.name}</div>
                  <div className='pop-plan-tagline'>{TIER_TAGLINES[plan.id] || ''}</div>
                </div>
                <div className='pop-plan-price-wrap'>
                  <span className='pop-plan-price'>
                    {plan.price === 0 ? 'Free' : fmt(plan.price)}
                  </span>
                  {plan.price > 0 && <span className='pop-plan-period'>/mo</span>}
                </div>
              </div>

              <div className='pop-plan-quotas'>
                <span>{plan.listingLimit === -1 ? 'Unlimited' : plan.listingLimit} listings</span>
                <span className='pop-plan-quota-dot'>·</span>
                <span>{plan.mediaPerListing === -1 ? '∞' : plan.mediaPerListing} photos</span>
                <span className='pop-plan-quota-dot'>·</span>
                <span>{plan.aiCredits === -1 ? '∞' : plan.aiCredits} AI credits</span>
              </div>

              <div className='pop-plan-divider' />

              <ul className='pop-plan-feats'>
                {highlights.map((h, i) => (
                  <li key={i}><span className='pop-feat-check' style={{ color: c.accent }}>✓</span>{h}</li>
                ))}
                {extraFromBackend.map((f, i) => (
                  <li key={`b${i}`}><span className='pop-feat-check' style={{ color: c.accent }}>✓</span>{f}</li>
                ))}
              </ul>

              <button
                className={`pop-plan-btn${isCurrent ? ' pop-plan-btn--current' : ''}`}
                style={!isCurrent ? { background: c.btn, color: plan.id === 'pro' ? '#0B3D28' : '#fff' } : {}}
                onClick={() => !isCurrent && onUpgrade(plan)}
                disabled={isCurrent || isLoading}
              >
                {isLoading
                  ? <Spinner />
                  : isCurrent
                    ? '✓ Current Plan'
                    : plan.price === 0
                      ? 'Downgrade to Free'
                      : tier === 'free' || !current.tier
                        ? `Get ${plan.name} →`
                        : `Upgrade to ${plan.name} →`}
              </button>
            </div>
          )
        })}
      </div>

      {/* ── Payout Account Summary ── */}
      <p className='pop-plans-heading' style={{ marginTop: 8 }}>Payout Account</p>
      <div className='pop-card pop-payout-card'>
        {payout.completed ? (
          <>
            <div className='pop-payout-icon'>
              <svg width='22' height='22' viewBox='0 0 24 24' fill='none' stroke='#C4E53C' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><rect x='3' y='3' width='18' height='18' rx='2'/><path d='M9 22V12h6v10M9 7h1M14 7h1M9 12h1M14 12h1'/></svg>
            </div>
            <div className='pop-payout-info'>
              <div className='pop-payout-bank'>{payout.bankName || 'Bank Account'}</div>
              <div className='pop-payout-name'>{payout.accountName}</div>
              <div className='pop-payout-status'>✓ Verified & Active</div>
            </div>
          </>
        ) : (
          <div className='pop-payout-empty'>
            <span>
              <svg width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='#f59e0b' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
                <path d='M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z'/><line x1='12' y1='9' x2='12' y2='13'/><line x1='12' y1='17' x2='12' y2='17.01'/>
              </svg>
            </span>
            <div>
              <strong>No payout account set up</strong>
              <p>Complete account setup to receive payments from tenants and buyers.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Tab 2: Transactions ──────────────────────────────────────────────────────

function TransactionsTab () {
  const [allTxs, setAllTxs]   = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage]       = useState(1)
  const LIMIT = 15

  useEffect(() => {
    get('/api/transactions/mine').then(res => {
      if (res.success) setAllTxs(res.transactions || [])
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const total = allTxs.length
  const totalPages = Math.max(1, Math.ceil(total / LIMIT))
  const txs = allTxs.slice((page - 1) * LIMIT, page * LIMIT)
  const TYPE_LABELS = {
    payment: 'Payment', 'wallet-topup': 'Wallet Top-up', 'escrow-fund': 'Escrow',
    rent_payment: 'Rent', bnpl: 'BNPL Installment'
  }

  return (
    <div className='pop-section'>
      <div className='pop-tx-meta'>
        {total > 0 && <span>{total} transaction{total !== 1 ? 's' : ''}</span>}
      </div>

      {loading ? (
        <div className='pop-loading'><Spinner /> Loading transactions…</div>
      ) : txs.length === 0 ? (
        <div className='pop-empty'>
          <div className='pop-empty-icon'>
            <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><rect x='1' y='4' width='22' height='16' rx='2' ry='2'/><line x1='1' y1='10' x2='23' y2='10'/></svg>
          </div>
          <p>No transactions yet</p>
        </div>
      ) : (
        <div className='pop-tx-table-wrap'>
          <table className='pop-tx-table'>
            <thead>
              <tr>
                <th>Reference</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {txs.map(tx => (
                <tr key={tx._id}>
                  <td className='pop-tx-ref'>TX-{String(tx._id).slice(-6).toUpperCase()}</td>
                  <td>{TYPE_LABELS[tx.type] || tx.type}</td>
                  <td className='pop-tx-amount'>{fmt(tx.amount)}</td>
                  <td className='pop-tx-method'>{tx.paymentMethod || '—'}</td>
                  <td><Badge status={tx.status} /></td>
                  <td className='pop-tx-date'>{timeAgo(tx.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className='pop-pagination'>
          <button
            className='pop-page-btn'
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >← Prev</button>
          <span className='pop-page-info'>Page {page} of {totalPages}</span>
          <button
            className='pop-page-btn'
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >Next →</button>
        </div>
      )}
    </div>
  )
}

// ─── Tab 3: Payouts ────────────────────────────────────────────────────────────

function PayoutsTab ({ setupStatus }) {
  const payout = setupStatus?.paymentSetup || {}
  const plan   = setupStatus?.plan || {}
  const kyc    = setupStatus?.kyc || {}

  return (
    <div className='pop-section'>
      <div className='pop-card'>
        <div className='pop-card-title'>Payout Account Details</div>
        {payout.completed ? (
          <div className='pop-payout-details'>
            <div className='pop-payout-row'>
              <span>Bank</span><strong>{payout.bankName || '—'}</strong>
            </div>
            <div className='pop-payout-row'>
              <span>Account Name</span><strong>{payout.accountName || '—'}</strong>
            </div>
            <div className='pop-payout-row'>
              <span>Verification</span>
              <span className='pop-status-chip pop-status-chip--green'>✓ Verified</span>
            </div>
            <div className='pop-payout-row'>
              <span>Setup Complete</span>
              <strong>{fmtDate(payout.completedAt || null)}</strong>
            </div>
            <p className='pop-payout-note'>
              Payments from tenants are split automatically via Paystack. Platform fees are deducted before funds reach your account.
            </p>
          </div>
        ) : (
          <div className='pop-payout-empty'>
            <span className='pop-payout-empty-icon'>
            <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
              <path d='M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z'/><line x1='12' y1='9' x2='12' y2='13'/><line x1='12' y1='17' x2='12' y2='17.01'/>
            </svg>
          </span>
            <div>
              <strong>Payout account not configured</strong>
              <p>Go to <em>Account Setup</em> to link your bank account and start receiving payments.</p>
            </div>
          </div>
        )}
      </div>

      <div className='pop-card'>
        <div className='pop-card-title'>KYC Status</div>
        <div className='pop-payout-details'>
          <div className='pop-payout-row'>
            <span>Level</span><strong>{kyc.level || 'None'}</strong>
          </div>
          <div className='pop-payout-row'>
            <span>Document</span><strong>{kyc.documentType || '—'}</strong>
          </div>
          <div className='pop-payout-row'>
            <span>Status</span>
            {kyc.verified
              ? <span className='pop-status-chip pop-status-chip--green'>✓ Verified</span>
              : <span className='pop-status-chip pop-status-chip--amber'>Pending Review</span>}
          </div>
        </div>
      </div>

      <div className='pop-card'>
        <div className='pop-card-title'>Platform Fee Summary</div>
        <div className='pop-fee-table'>
          <div className='pop-fee-row'>
            <span>Transaction fee (Paystack)</span>
            <strong>1.5% + ₦100</strong>
          </div>
          <div className='pop-fee-row'>
            <span>Escrow management fee</span>
            <strong>2.5%</strong>
          </div>
          <div className='pop-fee-row'>
            <span>Your plan</span>
            <strong>{(plan.tier || 'free').toUpperCase()} — {plan.tier === 'free' ? 'No monthly fee' : `${fmt(null)}/mo`}</strong>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

const TABS = [
  { id: 'plan',         label: 'Plan & Billing' },
  { id: 'transactions', label: 'Transactions'   },
  { id: 'payouts',      label: 'Payouts'        }
]

export default function PropertyOwnerPayments () {
  const [tab, setTab]             = useState('plan')
  const [setupStatus, setSetup]   = useState(null)
  const [plans, setPlans]         = useState([])
  const [pageLoading, setPageLoad] = useState(true)
  const [subscribing, setSub]     = useState(null)
  const [toast, setToast]         = useState(null)

  const flash = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 4500)
  }

  useEffect(() => {
    Promise.all([
      get('/api/paystack/setup-status'),
      get('/api/paystack/plans')
    ]).then(([statusRes, plansRes]) => {
      if (statusRes.success) setSetup(statusRes)
      if (plansRes.success)  setPlans(plansRes.plans)
    }).catch(console.error).finally(() => setPageLoad(false))
  }, [])

  const handleUpgrade = async plan => {
    setSub(plan.id)
    try {
      const res = await post('/api/paystack/subscribe', { planId: plan.id })
      if (!res.success) throw new Error(res.msg || 'Failed')
      if (plan.price === 0) {
        flash('Downgraded to Free plan.')
        setSetup(prev => ({ ...prev, plan: { ...prev?.plan, tier: 'free', effectiveTier: 'free', listingLimit: 1, features: [] } }))
      } else {
        window.open(res.authorizationUrl, '_blank', 'noopener')
        flash('Payment page opened in a new tab. Your plan will activate once payment is confirmed.')
      }
    } catch (err) {
      flash(err.message || 'Could not process plan change', 'error')
    } finally { setSub(null) }
  }

  if (pageLoading) {
    return (
      <div className='pop-root'>
        <div className='pop-loading' style={{ minHeight: 300 }}>
          <Spinner /> Loading billing information…
        </div>
      </div>
    )
  }

  return (
    <div className='pop-root'>
      <Toast toast={toast} />

      {/* Header */}
      <div className='pop-header'>
        <h2 className='pop-title'>Payments & Billing</h2>
        <p className='pop-subtitle'>Manage your subscription plan, view transactions, and check payout details.</p>
      </div>

      {/* Tabs */}
      <div className='pop-tabs'>
        {TABS.map(t => (
          <button
            key={t.id}
            className={`pop-tab${tab === t.id ? ' pop-tab--active' : ''}`}
            onClick={() => setTab(t.id)}
          >{t.label}</button>
        ))}
      </div>

      {/* Content */}
      {tab === 'plan'         && <PlanTab setupStatus={setupStatus} plans={plans} onUpgrade={handleUpgrade} subscribing={subscribing} />}
      {tab === 'transactions' && <TransactionsTab />}
      {tab === 'payouts'      && <PayoutsTab setupStatus={setupStatus} />}
    </div>
  )
}
