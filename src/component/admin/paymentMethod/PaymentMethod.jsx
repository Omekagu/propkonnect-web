'use client'

import { useState, useEffect } from 'react'
import { platformConfig as platformConfigApi, finance as financeApi } from '@/libs/api'
import { CreditCard, CheckCircle, AlertCircle, DollarSign, Percent, Globe, Shield, Zap, Copy, Check } from 'lucide-react'

const C = {
  bg:       '#0d1117',
  surface:  '#161b22',
  surface2: '#1c2128',
  border:   'rgba(255,255,255,0.08)',
  border2:  'rgba(255,255,255,0.14)',
  text:     '#e6edf3',
  muted:    '#8b949e',
  dim:      '#6e7681',
  accent:   '#C4E53C',
  accentBg: 'rgba(196,229,60,0.1)',
  accentBorder: 'rgba(196,229,60,0.25)',
}

const WEBHOOK_PATHS = [
  { label: 'Monnify Webhook', path: '/api/payments/monnify-webhook' },
  { label: 'Stripe Webhook',  path: '/api/payments/stripe-webhook' },
]

const FEE_FIELDS = [
  { key: 'platformFee',   label: 'Platform Fee (%)',   hint: 'Charged on every transaction' },
  { key: 'escrowFee',     label: 'Escrow Fee (%)',      hint: 'Applied to held escrow amounts' },
  { key: 'bnplInterest',  label: 'BNPL Interest (%)',   hint: 'Annual rate on instalment plans' },
  { key: 'withdrawalFee', label: 'Withdrawal Fee (₦)',  hint: 'Flat fee deducted per payout' },
]

export default function PaymentMethod () {
  const [settings, setSettings] = useState(null)
  const [stats, setStats]       = useState(null)
  const [fees, setFees]         = useState({})
  const [loading, setLoading]   = useState(true)
  const [saving, setSaving]     = useState(false)
  const [editFees, setEditFees] = useState(false)
  const [msg, setMsg]           = useState(null)
  const [copied, setCopied]     = useState(null)

  useEffect(() => {
    Promise.all([
      platformConfigApi.getSettings().catch(() => ({ data: null })),
      financeApi.getOverview().catch(() => ({ data: null })),
    ]).then(([settingsRes, statsRes]) => {
      const cfg = settingsRes.data?.settings || settingsRes.data || {}
      setSettings(cfg)
      setFees({
        platformFee:   cfg.fees?.platformFeePercent   ?? 2.5,
        escrowFee:     cfg.fees?.escrowFeePercent     ?? 1,
        bnplInterest:  cfg.fees?.bnplInterestPercent  ?? 5,
        withdrawalFee: cfg.fees?.withdrawalFeeFlat    ?? 50,
      })
      setStats(statsRes.data || null)
    }).finally(() => setLoading(false))
  }, [])

  async function saveFees () {
    setSaving(true)
    setMsg(null)
    try {
      await platformConfigApi.updateFees({
        platformFeePercent:  Number(fees.platformFee),
        escrowFeePercent:    Number(fees.escrowFee),
        bnplInterestPercent: Number(fees.bnplInterest),
        withdrawalFeeFlat:   Number(fees.withdrawalFee),
      })
      setMsg({ type: 'success', text: 'Fee configuration saved.' })
      setEditFees(false)
    } catch (e) {
      setMsg({ type: 'error', text: e.response?.data?.message || 'Failed to save fees.' })
    } finally {
      setSaving(false)
    }
  }

  function copyWebhook (url, key) {
    navigator.clipboard?.writeText(url).then(() => {
      setCopied(key)
      setTimeout(() => setCopied(null), 2000)
    })
  }

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://api.estateproperties.ng'
  const fmtMoney = n => n != null ? `₦${Number(n).toLocaleString()}` : '—'

  // ── Shared style helpers ────────────────────────────────────────────────────
  const section = { background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: '20px 22px', marginBottom: 16 }
  const sTitle  = { fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }
  const btnSm   = { padding: '7px 16px', background: C.surface2, color: C.muted, border: `1px solid ${C.border}`, borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 13 }
  const btnPrimary = { padding: '7px 18px', background: C.accent, color: '#0B3D28', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 700, fontSize: 13 }

  if (loading) return <div style={{ padding: '24px 28px', color: C.muted }}>Loading payment configuration…</div>

  return (
    <div style={{ padding: '24px 28px', background: C.bg, minHeight: '100%', color: C.text, boxSizing: 'border-box' }}>

      {/* ── Header ── */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: C.text, margin: '0 0 4px', letterSpacing: '-0.3px' }}>Payment Methods</h2>
        <p style={{ fontSize: 13, color: C.muted, margin: 0 }}>Gateway status, fee configuration, and webhook endpoints</p>
      </div>

      {msg && (
        <div style={{ padding: '11px 14px', borderRadius: 9, fontSize: 13, marginBottom: 16, background: msg.type === 'success' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', color: msg.type === 'success' ? '#4ade80' : '#f87171', border: `1px solid ${msg.type === 'success' ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}` }}>
          {msg.text}
        </div>
      )}

      {/* ── Gateways ── */}
      <div style={section}>
        <div style={sTitle}><Zap size={15} color={C.accent} /> Payment Gateways</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 12 }}>
          {[
            { name: 'Monnify',  sub: 'Virtual accounts, USSD, bank transfer — primary gateway', iconBg: 'rgba(59,130,246,0.12)', iconColor: '#60a5fa', icon: <DollarSign size={20} color='#60a5fa' />, ok: true },
            { name: 'Stripe',   sub: 'Card payments, international transactions', iconBg: 'rgba(139,92,246,0.12)', iconColor: '#a78bfa', icon: <CreditCard size={20} color='#a78bfa' />, ok: false, note: 'Requires STRIPE_SECRET_KEY' },
            { name: 'Paystack', sub: 'Local card payments, bank transfers (Nigeria)', iconBg: 'rgba(34,197,94,0.12)', iconColor: '#4ade80', icon: <CheckCircle size={20} color='#4ade80' />, ok: true },
          ].map(gw => (
            <div key={gw.name} style={{ background: C.surface2, border: `1px solid ${C.border}`, borderRadius: 10, padding: '14px 16px', display: 'flex', alignItems: 'flex-start', gap: 14 }}>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: gw.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {gw.icon}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, color: C.text, marginBottom: 3 }}>{gw.name}</div>
                <div style={{ fontSize: 12, color: C.muted, marginBottom: 7, lineHeight: 1.5 }}>{gw.sub}</div>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 700, padding: '2px 9px', borderRadius: 20, background: gw.ok ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.1)', color: gw.ok ? '#4ade80' : '#f87171' }}>
                  {gw.ok ? <CheckCircle size={10} /> : <AlertCircle size={10} />}
                  {gw.ok ? 'Active' : (gw.note || 'Not configured')}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Fee Config ── */}
      <div style={section}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ ...sTitle, margin: 0 }}><Percent size={15} color={C.accent} /> Fee Configuration</div>
          <div style={{ display: 'flex', gap: 8 }}>
            {editFees ? (
              <>
                <button style={btnSm} onClick={() => setEditFees(false)}>Cancel</button>
                <button style={btnPrimary} onClick={saveFees} disabled={saving}>{saving ? 'Saving…' : 'Save Fees'}</button>
              </>
            ) : (
              <button style={btnSm} onClick={() => setEditFees(true)}>Edit</button>
            )}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 10 }}>
          {editFees
            ? FEE_FIELDS.map(({ key, label, hint }) => (
                <div key={key}>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: C.muted, marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</label>
                  <input
                    type='number' step='0.1' value={fees[key] ?? ''}
                    onChange={e => setFees(f => ({ ...f, [key]: e.target.value }))}
                    style={{ width: '100%', padding: '8px 11px', background: C.surface2, border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 14, color: C.text, boxSizing: 'border-box', outline: 'none' }}
                  />
                  <div style={{ fontSize: 11, color: C.dim, marginTop: 4 }}>{hint}</div>
                </div>
              ))
            : [
                [`${fees.platformFee ?? 2.5}%`,  'Platform Fee'],
                [`${fees.escrowFee ?? 1}%`,       'Escrow Fee'],
                [`${fees.bnplInterest ?? 5}%`,    'BNPL Interest'],
                [`₦${fees.withdrawalFee ?? 50}`,  'Withdrawal Fee'],
              ].map(([val, lbl]) => (
                <div key={lbl} style={{ background: C.surface2, border: `1px solid ${C.border}`, borderRadius: 9, padding: '13px', textAlign: 'center' }}>
                  <div style={{ fontSize: 22, fontWeight: 900, color: C.accent, lineHeight: 1 }}>{val}</div>
                  <div style={{ fontSize: 11, color: C.muted, marginTop: 5, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{lbl}</div>
                </div>
              ))
          }
        </div>
      </div>

      {/* ── Finance Snapshot ── */}
      {stats && (
        <div style={section}>
          <div style={sTitle}><DollarSign size={15} color={C.accent} /> Platform Finance Snapshot</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10 }}>
            {[
              ['Total Revenue',   stats.totalRevenue     != null ? fmtMoney(stats.totalRevenue)     : '—'],
              ['Escrow Balance',  stats.escrowBalance    != null ? fmtMoney(stats.escrowBalance)    : '—'],
              ['Transactions',    stats.totalTransactions ?? stats.count ?? '—'],
              ['Pending Payouts', stats.pendingPayouts   != null ? fmtMoney(stats.pendingPayouts)   : '—'],
            ].map(([lbl, val]) => (
              <div key={lbl} style={{ background: C.surface2, border: `1px solid ${C.border}`, borderRadius: 9, padding: '13px', textAlign: 'center' }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: C.text, lineHeight: 1 }}>{val}</div>
                <div style={{ fontSize: 11, color: C.muted, marginTop: 5, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{lbl}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Webhook URLs ── */}
      <div style={section}>
        <div style={sTitle}><Globe size={15} color={C.accent} /> Webhook Endpoints</div>
        <p style={{ fontSize: 13, color: C.muted, marginBottom: 14, lineHeight: 1.6 }}>
          Register these URLs in your payment gateway dashboards to receive real-time events.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {WEBHOOK_PATHS.map(({ label, path }) => {
            const fullUrl = `${backendUrl}${path}`
            return (
              <div key={path} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 14px', background: C.surface2, border: `1px solid ${C.border}`, borderRadius: 9, gap: 12, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 13, color: C.muted, display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                  <Shield size={13} color={C.dim} /> {label}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }}>
                  <code style={{ flex: 1, fontSize: 12, fontFamily: 'monospace', color: C.dim, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 6, padding: '5px 10px', wordBreak: 'break-all', display: 'block' }}>
                    {fullUrl}
                  </code>
                  <button style={{ ...btnSm, display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }} onClick={() => copyWebhook(fullUrl, path)}>
                    {copied === path ? <><Check size={12} /> Copied</> : <><Copy size={12} /> Copy</>}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Supported Channels ── */}
      <div style={section}>
        <div style={sTitle}><CreditCard size={15} color={C.accent} /> Supported Payment Channels</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {['Bank Transfer', 'USSD', 'Virtual Account (Monnify)', 'Card (Stripe)', 'BNPL / Instalments', 'Escrow (Hold & Release)', 'Paystack'].map(ch => (
            <span key={ch} style={{ padding: '5px 14px', background: C.accentBg, border: `1px solid ${C.accentBorder}`, borderRadius: 20, fontSize: 12, color: C.accent, fontWeight: 600 }}>
              {ch}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
