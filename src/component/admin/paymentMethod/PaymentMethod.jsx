'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'
import { CreditCard, CheckCircle, AlertCircle, DollarSign, Percent, Globe, Shield, Zap } from 'lucide-react'

const API = process.env.NEXT_PUBLIC_BACKEND_URL

const s = {
  page: { padding: '1.5rem', fontFamily: 'sans-serif' },
  header: { marginBottom: '1.5rem' },
  h2: { fontSize: '1.4rem', fontWeight: 700, color: '#111', margin: '0 0 4px' },
  sub: { color: '#6b7280', fontSize: 14, margin: 0 },
  section: { background: '#fff', borderRadius: 12, padding: '1.25rem', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: '1rem' },
  sTitle: { fontSize: 15, fontWeight: 700, color: '#111', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: 8 },
  grid2: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', marginBottom: '1rem' },
  gwCard: { borderRadius: 10, padding: '1.1rem', border: '1px solid #e5e7eb', display: 'flex', alignItems: 'flex-start', gap: 14 },
  gwLogo: (bg) => ({ width: 48, height: 48, borderRadius: 10, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }),
  gwName: { fontWeight: 700, fontSize: 15, color: '#111', marginBottom: 2 },
  gwSub: { fontSize: 12, color: '#6b7280', marginBottom: 6 },
  gwStatus: (ok) => ({ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 600, padding: '2px 8px', borderRadius: 20, background: ok ? '#f0fdf4' : '#fef2f2', color: ok ? '#16a34a' : '#dc2626' }),
  row: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f3f4f6', fontSize: 14, flexWrap: 'wrap', gap: 8 },
  rowLabel: { color: '#6b7280', display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 },
  feeGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.75rem' },
  feeBox: { background: '#f9fafb', borderRadius: 8, padding: '0.85rem', textAlign: 'center' },
  feeVal: { fontSize: '1.25rem', fontWeight: 700, color: '#2563eb' },
  feeLbl: { fontSize: 12, color: '#6b7280', marginTop: 4 },
  input: { width: '100%', padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 14, boxSizing: 'border-box' },
  btnPrimary: { padding: '8px 18px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 14 },
  btnSm: { padding: '6px 14px', background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: 13 },
  alert: (t) => ({ padding: '10px 14px', borderRadius: 8, fontSize: 13, marginBottom: '0.75rem', background: t === 'success' ? '#f0fdf4' : '#fef2f2', color: t === 'success' ? '#16a34a' : '#dc2626' }),
  webhookCode: { background: '#f9fafb', borderRadius: 6, padding: '6px 10px', fontSize: 12, fontFamily: 'monospace', wordBreak: 'break-all', color: '#374151', border: '1px solid #e5e7eb', flex: 1 },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.75rem' },
  statBox: { background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '0.9rem', textAlign: 'center' },
  statVal: { fontSize: '1.3rem', fontWeight: 700, color: '#111' },
  statLbl: { fontSize: 12, color: '#6b7280', marginTop: 3 },
  chip: { padding: '5px 14px', background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 20, fontSize: 13, color: '#0369a1', fontWeight: 500 },
}

const WEBHOOK_PATHS = [
  { label: 'Monnify Webhook', path: '/api/payments/monnify-webhook' },
  { label: 'Stripe Webhook',  path: '/api/payments/stripe-webhook' },
]

export default function PaymentMethod () {
  const [settings, setSettings]   = useState(null)
  const [stats, setStats]         = useState(null)
  const [fees, setFees]           = useState({})
  const [loading, setLoading]     = useState(true)
  const [saving, setSaving]       = useState(false)
  const [editFees, setEditFees]   = useState(false)
  const [msg, setMsg]             = useState(null)
  const [copied, setCopied]       = useState(null)

  useEffect(() => {
    Promise.all([
      axios.get(`${API}/api/platform-settings`, { withCredentials: true }).catch(() => ({ data: null })),
      axios.get(`${API}/api/admin/finance/overview`, { withCredentials: true }).catch(() => ({ data: null })),
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
      await axios.patch(`${API}/api/platform-settings/fees`, {
        platformFeePercent:  Number(fees.platformFee),
        escrowFeePercent:    Number(fees.escrowFee),
        bnplInterestPercent: Number(fees.bnplInterest),
        withdrawalFeeFlat:   Number(fees.withdrawalFee),
      }, { withCredentials: true })
      setMsg({ type: 'success', text: 'Fee configuration saved successfully.' })
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

  const backendUrl = API || 'https://api.estateproperties.ng'

  if (loading) return <div style={{ padding: '1.5rem', color: '#6b7280' }}>Loading payment configuration…</div>

  return (
    <div style={s.page}>
      <div style={s.header}>
        <h2 style={s.h2}>Payment Methods</h2>
        <p style={s.sub}>Gateway status, fee configuration, and webhook endpoints</p>
      </div>

      {msg && <div style={s.alert(msg.type)}>{msg.text}</div>}

      {/* Gateways */}
      <div style={s.section}>
        <div style={s.sTitle}><Zap size={16} /> Payment Gateways</div>
        <div style={s.grid2}>
          <div style={s.gwCard}>
            <div style={s.gwLogo('#dbeafe')}><DollarSign size={22} color="#2563eb" /></div>
            <div>
              <div style={s.gwName}>Monnify</div>
              <div style={s.gwSub}>Virtual accounts, USSD, bank transfer — primary gateway</div>
              <span style={s.gwStatus(true)}><CheckCircle size={11} /> Active</span>
            </div>
          </div>
          <div style={s.gwCard}>
            <div style={s.gwLogo('#f3e8ff')}><CreditCard size={22} color="#7c3aed" /></div>
            <div>
              <div style={s.gwName}>Stripe</div>
              <div style={s.gwSub}>Card payments, international transactions</div>
              <span style={s.gwStatus(false)}><AlertCircle size={11} /> Requires STRIPE_SECRET_KEY env var</span>
            </div>
          </div>
        </div>
      </div>

      {/* Fee Config */}
      <div style={s.section}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div style={{ ...s.sTitle, margin: 0 }}><Percent size={16} /> Fee Configuration</div>
          <div style={{ display: 'flex', gap: 8 }}>
            {editFees ? (
              <>
                <button style={s.btnSm} onClick={() => setEditFees(false)}>Cancel</button>
                <button style={s.btnPrimary} onClick={saveFees} disabled={saving}>{saving ? 'Saving…' : 'Save Fees'}</button>
              </>
            ) : (
              <button style={s.btnSm} onClick={() => setEditFees(true)}>Edit</button>
            )}
          </div>
        </div>

        {editFees ? (
          <div style={s.feeGrid}>
            {[
              ['platformFee',   'Platform Fee (%)',    'Charged on every transaction'],
              ['escrowFee',     'Escrow Fee (%)',       'Applied to held escrow amounts'],
              ['bnplInterest',  'BNPL Interest (%)',    'Annual rate on instalment plans'],
              ['withdrawalFee', 'Withdrawal Fee (N)',   'Flat fee deducted per payout'],
            ].map(([key, label, hint]) => (
              <div key={key}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 4 }}>{label}</label>
                <input
                  type="number"
                  step="0.1"
                  value={fees[key] ?? ''}
                  onChange={e => setFees(f => ({ ...f, [key]: e.target.value }))}
                  style={s.input}
                />
                <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 3 }}>{hint}</div>
              </div>
            ))}
          </div>
        ) : (
          <div style={s.feeGrid}>
            {[
              [`${fees.platformFee ?? 2.5}%`,  'Platform Fee'],
              [`${fees.escrowFee ?? 1}%`,       'Escrow Fee'],
              [`${fees.bnplInterest ?? 5}%`,    'BNPL Interest'],
              [`N${fees.withdrawalFee ?? 50}`,  'Withdrawal Fee'],
            ].map(([val, lbl]) => (
              <div key={lbl} style={s.feeBox}>
                <div style={s.feeVal}>{val}</div>
                <div style={s.feeLbl}>{lbl}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Finance snapshot */}
      {stats && (
        <div style={s.section}>
          <div style={s.sTitle}><DollarSign size={16} /> Platform Finance Snapshot</div>
          <div style={s.statsGrid}>
            {[
              ['Total Revenue',   stats.totalRevenue     != null ? `N${Number(stats.totalRevenue).toLocaleString()}`     : '—'],
              ['Escrow Balance',  stats.escrowBalance    != null ? `N${Number(stats.escrowBalance).toLocaleString()}`    : '—'],
              ['Transactions',    stats.totalTransactions ?? stats.count ?? '—'],
              ['Pending Payouts', stats.pendingPayouts   != null ? `N${Number(stats.pendingPayouts).toLocaleString()}`   : '—'],
            ].map(([lbl, val]) => (
              <div key={lbl} style={s.statBox}>
                <div style={s.statVal}>{val}</div>
                <div style={s.statLbl}>{lbl}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Webhook URLs */}
      <div style={s.section}>
        <div style={s.sTitle}><Globe size={16} /> Webhook Endpoints</div>
        <p style={{ fontSize: 13, color: '#6b7280', marginBottom: '1rem' }}>
          Register these URLs in your payment gateway dashboards to receive real-time events.
        </p>
        {WEBHOOK_PATHS.map(({ label, path }) => {
          const fullUrl = `${backendUrl}${path}`
          return (
            <div key={path} style={s.row}>
              <span style={s.rowLabel}><Shield size={13} />{label}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, maxWidth: 560, marginLeft: 16 }}>
                <span style={s.webhookCode}>{fullUrl}</span>
                <button style={s.btnSm} onClick={() => copyWebhook(fullUrl, path)}>
                  {copied === path ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Supported Channels */}
      <div style={s.section}>
        <div style={s.sTitle}><CreditCard size={16} /> Supported Payment Channels</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          {['Bank Transfer', 'USSD', 'Virtual Account (Monnify)', 'Card (Stripe)', 'BNPL / Instalments', 'Escrow (Hold & Release)'].map(ch => (
            <span key={ch} style={s.chip}>{ch}</span>
          ))}
        </div>
      </div>
    </div>
  )
}
