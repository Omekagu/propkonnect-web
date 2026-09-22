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

const PLAN_ICONS = {
  free: <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><path d='M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z'/><path d='M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12'/></svg>,
  basic: <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><polygon points='13 2 3 14 12 14 11 22 21 10 12 10 13 2'/></svg>,
  pro: <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><circle cx='12' cy='8' r='6'/><path d='M15.477 12.89L17 22l-5-3-5 3 1.523-9.11'/></svg>,
  enterprise: <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><rect x='3' y='3' width='18' height='18' rx='2'/><path d='M9 22V12h6v10M9 7h1M14 7h1M9 12h1M14 12h1'/></svg>
}
const PLAN_COLORS = { free: '#64748b', basic: '#0071c2', pro: '#7c3aed', enterprise: '#059669' }
const FEATURE_LABELS = {
  analytics:        'Analytics & Reports',
  priority_support: 'Priority Support',
  featured_badge:   'Featured Badge',
  escrow_access:    'Escrow Payments',
  document_upload:  'Document Upload',
  bnpl:             'Buy-Now-Pay-Later',
  api_access:       'API Access',
  white_label:      'White Label'
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

  return (
    <div className='pop-section'>

      {/* Current Plan Card */}
      <div className='pop-card pop-current-plan'>
        <div className='pop-cp-left'>
          <div className='pop-cp-icon'>{PLAN_ICONS[tier] || <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><path d='M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z'/></svg>}</div>
          <div>
            <div className='pop-cp-label'>Current Plan</div>
            <div className='pop-cp-name' style={{ color: PLAN_COLORS[tier] || '#1d4ed8' }}>
              {tier.charAt(0).toUpperCase() + tier.slice(1)}
              {trialActive && <span className='pop-trial-badge'>Trial Active</span>}
            </div>
            <div className='pop-cp-limits'>
              {current.listingLimit === -1 ? 'Unlimited' : current.listingLimit} listings
              &nbsp;·&nbsp;
              {current.features?.length || 0} premium features
            </div>
          </div>
        </div>
        <div className='pop-cp-right'>
          {trialActive && trialEndsAt && (
            <div className='pop-trial-info'>
              Trial ends <strong>{fmtDate(trialEndsAt)}</strong>
            </div>
          )}
          {!trialActive && current.expiresAt && (
            <div className='pop-trial-info'>
              Renews <strong>{fmtDate(current.expiresAt)}</strong>
            </div>
          )}
        </div>
      </div>

      {/* What's Included */}
      {(current.features?.length > 0 || current.listingLimit) && (
        <div className='pop-card'>
          <div className='pop-card-title'>What's Included</div>
          <div className='pop-limits-grid'>
            <div className='pop-limit-item'>
              <div className='pop-limit-val'>{current.listingLimit === -1 ? '∞' : current.listingLimit}</div>
              <div className='pop-limit-key'>Listings</div>
            </div>
            <div className='pop-limit-item'>
              <div className='pop-limit-val'>{current.mediaPerListing === -1 ? '∞' : (current.mediaPerListing || '—')}</div>
              <div className='pop-limit-key'>Photos / Listing</div>
            </div>
            <div className='pop-limit-item'>
              <div className='pop-limit-val'>{current.aiCredits === -1 ? '∞' : (current.aiCredits || 0)}</div>
              <div className='pop-limit-key'>AI Credits</div>
            </div>
          </div>
          {current.features?.length > 0 && (
            <div className='pop-feat-list'>
              {current.features.map(f => (
                <span key={f} className='pop-feat-chip pop-feat-chip--on'>
                  ✓ {FEATURE_LABELS[f] || f}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Available Plans */}
      <div className='pop-card-title pop-section-heading'>Available Plans</div>
      <div className='pop-plans-grid'>
        {plans.map(plan => {
          const isCurrent = plan.id === (current.tier || 'free')
          const color = PLAN_COLORS[plan.id] || '#1d4ed8'
          const isLoading = subscribing === plan.id
          return (
            <div key={plan.id} className={`pop-plan-card${isCurrent ? ' pop-plan-card--current' : ''}`} style={{ borderTopColor: color }}>
              <div className='pop-plan-top'>
                <span className='pop-plan-icon'>{PLAN_ICONS[plan.id] || <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><path d='M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z'/></svg>}</span>
                <div>
                  <div className='pop-plan-name'>{plan.name}</div>
                  <div className='pop-plan-price'>
                    {plan.price === 0 ? 'Free' : `${fmt(plan.price)}/mo`}
                  </div>
                </div>
              </div>

              <div className='pop-plan-limits'>
                <div>{plan.listingLimit === -1 ? 'Unlimited' : plan.listingLimit} listings</div>
                <div>{plan.mediaPerListing === -1 ? 'Unlimited' : plan.mediaPerListing} photos/listing</div>
                <div>{plan.aiCredits === -1 ? 'Unlimited' : plan.aiCredits} AI credits/mo</div>
              </div>

              {plan.features?.length > 0 && (
                <div className='pop-plan-feats'>
                  {plan.features.slice(0, 4).map(f => (
                    <div key={f} className='pop-plan-feat'>✓ {FEATURE_LABELS[f] || f}</div>
                  ))}
                  {plan.features.length > 4 && (
                    <div className='pop-plan-feat pop-plan-feat--more'>+{plan.features.length - 4} more</div>
                  )}
                </div>
              )}

              <button
                className={`pop-plan-btn${isCurrent ? ' pop-plan-btn--current' : ''}`}
                style={!isCurrent ? { background: color } : {}}
                onClick={() => !isCurrent && onUpgrade(plan)}
                disabled={isCurrent || isLoading}
              >
                {isLoading ? <Spinner /> : isCurrent ? 'Current Plan' : plan.price === 0 ? 'Downgrade' : tier === 'free' || !current.tier ? 'Get Started' : 'Upgrade'}
              </button>
            </div>
          )
        })}
      </div>

      {/* Payout Account Summary */}
      <div className='pop-card-title pop-section-heading'>Payout Account</div>
      <div className='pop-card pop-payout-card'>
        {payout.completed ? (
          <>
            <div className='pop-payout-icon'>
              <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><rect x='3' y='3' width='18' height='18' rx='2'/><path d='M9 22V12h6v10M9 7h1M14 7h1M9 12h1M14 12h1'/></svg>
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
              <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
                <path d='M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z'/><line x1='12' y1='9' x2='12' y2='13'/><line x1='12' y1='17' x2='12' y2='17.01'/>
              </svg>
            </span>
            <div>
              <strong>No payout account set up</strong>
              <p>Complete account setup to receive payments from tenants.</p>
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
