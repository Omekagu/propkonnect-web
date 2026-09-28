'use client'

import { useState, useEffect } from 'react'
import { transactions as transactionsApi, leases as leasesApi } from '@/libs/api'
import { DollarSign, CheckCircle, Clock, AlertCircle, CreditCard, CalendarDays, ChevronDown, ChevronUp } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

const fmt = amount => `₦${Number(amount).toLocaleString('en-NG')}`
const fmtDate = date => new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })

const INST_META = {
  pending:  { color: '#fbbf24', bg: 'rgba(245,158,11,0.1)',  label: 'Pending', Icon: Clock },
  overdue:  { color: '#f87171', bg: 'rgba(239,68,68,0.1)',   label: 'Overdue', Icon: AlertCircle },
  paid:     { color: '#4ade80', bg: 'rgba(34,197,94,0.1)',   label: 'Paid',    Icon: CheckCircle },
}

const TX_STATUS = {
  completed: ['#4ade80', 'rgba(34,197,94,0.1)'],
  pending:   ['#fbbf24', 'rgba(245,158,11,0.1)'],
  failed:    ['#f87171', 'rgba(239,68,68,0.1)'],
  refunded:  ['#7d8590', 'rgba(255,255,255,0.06)'],
}

const D = { bg: '#0d1117', surface: '#161b22', border: 'rgba(255,255,255,0.06)', text: '#e6edf3', muted: '#7d8590', accent: '#C4E53C', primary: '#0B3D28' }

const PAYMENT_TYPE_LABELS = {
  full:           'Full Payment',
  split_50_50:    '50/50 Split',
  split_30_30_40: '30/30/40 Split',
  quarterly:      'Quarterly',
  biannual:       'Biannual',
  monthly:        'Monthly',
  weekly:         'Weekly',
  custom:         'Custom Plan',
}

const s = {
  page:    { padding: '24px 28px', background: D.bg, minHeight: '100%', color: D.text },
  h2:      { fontSize: '1.2rem', fontWeight: 800, color: D.text, margin: '0 0 20px', letterSpacing: '-0.3px' },
  grid:    { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 10, marginBottom: 20 },
  statCard:{ background: D.surface, borderRadius: 12, padding: '14px 16px', border: `1px solid ${D.border}`, display: 'flex', alignItems: 'center', gap: 12 },
  iconBox: (bg) => ({ width: 38, height: 38, borderRadius: 10, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }),
  statVal: { fontWeight: 800, fontSize: '1.15rem', color: D.text },
  statLbl: { fontSize: 11, color: D.muted, marginTop: 2 },

  card:     { background: D.surface, borderRadius: 12, padding: '18px', border: `1px solid ${D.border}`, marginBottom: 12 },
  cardHead: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, cursor: 'pointer' },
  cardTitle:{ fontWeight: 700, fontSize: 14, color: D.text },
  cardSub:  { fontSize: 12, color: D.muted, marginTop: 2 },

  progressBar:  { height: 5, borderRadius: 4, background: 'rgba(255,255,255,0.07)', marginBottom: 14, overflow: 'hidden' },
  progressFill: (pct) => ({ height: '100%', width: `${pct}%`, background: D.accent, borderRadius: 4, transition: 'width .3s' }),
  instRow: (bg) => ({
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '10px 12px', borderRadius: 8, marginBottom: 5, background: bg,
    border: `1px solid rgba(255,255,255,0.04)`, flexWrap: 'wrap', gap: 8
  }),
  instLeft:  { display: 'flex', alignItems: 'center', gap: 10 },
  instLabel: { fontWeight: 600, fontSize: 14, color: D.text },
  instDate:  { fontSize: 12, color: D.muted, marginTop: 2 },
  instRight: { display: 'flex', alignItems: 'center', gap: 8 },
  instAmt:   { fontWeight: 800, fontSize: 14, color: D.accent },
  badge:     (color, bg) => ({ padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 700, color, background: bg }),
  payBtn:        { padding: '6px 14px', background: D.accent, color: D.primary, border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 700, fontSize: 12 },
  payBtnDisabled:{ padding: '6px 14px', background: 'rgba(255,255,255,0.06)', color: D.muted, border: 'none', borderRadius: 6, cursor: 'not-allowed', fontWeight: 700, fontSize: 12 },

  section: { background: D.surface, borderRadius: 12, padding: '18px', border: `1px solid ${D.border}` },
  sTitle:  { fontSize: 13, fontWeight: 700, color: D.muted, marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.06em' },
  row:     { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: `1px solid rgba(255,255,255,0.04)`, flexWrap: 'wrap', gap: 6 },
  txLeft:  { display: 'flex', alignItems: 'center', gap: 10 },
  txIcon:  (bg) => ({ width: 34, height: 34, borderRadius: 8, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }),
  txTitle: { fontWeight: 600, fontSize: 13, color: D.text },
  txMeta:  { fontSize: 12, color: D.muted, marginTop: 2 },
  txAmount:(positive) => ({ fontWeight: 800, fontSize: 14, color: positive ? D.accent : D.text }),
  empty:   { textAlign: 'center', padding: '2rem', color: D.muted, fontSize: 14 },
  alert:   (t) => ({ padding: '10px 14px', borderRadius: 8, fontSize: 13, marginBottom: 12, background: t === 'success' ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)', color: t === 'success' ? '#4ade80' : '#f87171', border: `1px solid ${t === 'success' ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}` }),
}

export default function TenantPayments () {
  useAuth() // ensures axios Authorization header is set globally
  const [transactions, setTransactions] = useState([])
  const [lease, setLease] = useState(null)
  const [loading, setLoading] = useState(true)
  const [paying, setPaying] = useState(null) // installmentId being paid
  const [msg, setMsg] = useState(null)
  const [scheduleOpen, setScheduleOpen] = useState(true)

  useEffect(() => {
    Promise.all([
      transactionsApi.getMine().catch(() => ({ data: { transactions: [] } })),
      leasesApi.getMy().catch(() => ({ data: { leases: [] } })),
    ]).then(([txRes, leaseRes]) => {
      setTransactions(txRes.data?.transactions || txRes.data?.data || [])
      const leases = leaseRes.data?.leases || (leaseRes.data?.lease ? [leaseRes.data.lease] : [])
      setLease(leases[0] || null)
    }).finally(() => setLoading(false))
  }, [])

  async function payInstallment (installmentId = null) {
    if (!lease) return
    setPaying(installmentId || 'auto')
    setMsg(null)
    try {
      const body = {}
      if (installmentId) body.installmentId = installmentId
      const { data } = await leasesApi.payRent(lease._id, body)
      if (data.paymentUrl || data.checkoutUrl) {
        window.location.href = data.paymentUrl || data.checkoutUrl
      } else {
        setMsg({ type: 'success', text: 'Payment initiated. You will receive payment instructions shortly.' })
        // Optimistically mark the installment as paid in UI
        if (data.installment && lease.installments) {
          setLease(prev => ({
            ...prev,
            installments: prev.installments.map(i =>
              i._id === data.installment._id ? { ...i, status: 'paid', paidAt: new Date() } : i
            )
          }))
        }
      }
    } catch (e) {
      setMsg({ type: 'error', text: e.response?.data?.message || 'Failed to initiate payment.' })
    } finally {
      setPaying(null)
    }
  }

  // ── Derived stats ────────────────────────────────────────────────────────────
  const totalPaid = transactions.filter(t => t.status === 'completed').reduce((s, t) => s + (t.amount || 0), 0)
  const installments = lease?.installments || []
  const paidCount = installments.filter(i => i.status === 'paid').length
  const overdueCount = installments.filter(i => i.status === 'overdue').length
  const progressPct = installments.length ? Math.round((paidCount / installments.length) * 100) : 0
  const nextDue = installments.find(i => i.status === 'pending' || i.status === 'overdue')

  if (loading) return <div style={{ padding: '1.5rem', color: '#7d8590', background: '#0d1117', minHeight: '100%' }}>Loading payments…</div>

  return (
    <div style={s.page}>
      <h2 style={s.h2}>Payments</h2>

      {msg && <div style={s.alert(msg.type)}>{msg.text}</div>}

      {/* ── Stats ─────────────────────────────────────────────────────────── */}
      <div style={s.grid}>
        <div style={s.statCard}>
          <div style={s.iconBox('rgba(34,197,94,0.12)')}><DollarSign size={18} color="#4ade80" /></div>
          <div><div style={s.statVal}>{fmt(totalPaid)}</div><div style={s.statLbl}>Total Paid</div></div>
        </div>
        <div style={s.statCard}>
          <div style={s.iconBox('rgba(59,130,246,0.12)')}><CreditCard size={18} color="#60a5fa" /></div>
          <div>
            <div style={s.statVal}>{lease ? fmt(lease.rentAmount) : '—'}</div>
            <div style={s.statLbl}>{PAYMENT_TYPE_LABELS[lease?.paymentType] || 'Rent Amount'}</div>
          </div>
        </div>
        {installments.length > 0 && (
          <div style={s.statCard}>
            <div style={s.iconBox('rgba(245,158,11,0.12)')}><CalendarDays size={18} color="#fbbf24" /></div>
            <div>
              <div style={s.statVal}>{paidCount}/{installments.length}</div>
              <div style={s.statLbl}>Installments paid</div>
            </div>
          </div>
        )}
        {overdueCount > 0 && (
          <div style={s.statCard}>
            <div style={s.iconBox('rgba(239,68,68,0.12)')}><AlertCircle size={18} color="#f87171" /></div>
            <div><div style={s.statVal}>{overdueCount}</div><div style={s.statLbl}>Overdue</div></div>
          </div>
        )}
      </div>

      {/* ── Payment schedule ─────────────────────────────────────────────── */}
      {lease && installments.length > 0 && (
        <div style={s.card}>
          <div style={s.cardHead} onClick={() => setScheduleOpen(o => !o)}>
            <div>
              <div style={s.cardTitle}>
                Payment Schedule — {PAYMENT_TYPE_LABELS[lease.paymentType] || 'Installments'}
              </div>
              <div style={s.cardSub}>
                {fmt(lease.totalLeaseAmount || lease.rentAmount)} total ·&nbsp;
                {nextDue ? `Next due ${fmtDate(nextDue.dueDate)}` : 'All payments complete'}
              </div>
            </div>
            {scheduleOpen ? <ChevronUp size={16} color="#6b7280" /> : <ChevronDown size={16} color="#6b7280" />}
          </div>

          {scheduleOpen && (
            <>
              {/* Progress bar */}
              {installments.length > 1 && (
                <div style={s.progressBar}>
                  <div style={s.progressFill(progressPct)} />
                </div>
              )}

              {installments.map((inst, idx) => {
                const meta = INST_META[inst.status] || INST_META.pending
                const { Icon } = meta
                const isPayingThis = paying === inst._id
                const canPay = inst.status !== 'paid' && !paying
                return (
                  <div key={inst._id || idx} style={s.instRow(meta.bg + '55')}>
                    <div style={s.instLeft}>
                      <Icon size={18} color={meta.color} />
                      <div>
                        <div style={s.instLabel}>{inst.label || `Payment ${idx + 1}`}</div>
                        <div style={s.instDate}>
                          Due {fmtDate(inst.dueDate)}
                          {inst.paidAt && ` · Paid ${fmtDate(inst.paidAt)}`}
                          {inst.percent ? ` · ${inst.percent}%` : ''}
                        </div>
                      </div>
                    </div>
                    <div style={s.instRight}>
                      <span style={s.instAmt}>{fmt(inst.amount)}</span>
                      <span style={s.badge(meta.color, meta.bg)}>{meta.label}</span>
                      {inst.status !== 'paid' && (
                        <button
                          style={canPay ? s.payBtn : s.payBtnDisabled}
                          disabled={!canPay}
                          onClick={() => payInstallment(inst._id)}
                        >
                          {isPayingThis ? 'Processing…' : 'Pay'}
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </>
          )}
        </div>
      )}

      {/* Fallback: no installments yet (legacy lease) */}
      {lease && installments.length === 0 && (
        <div style={s.card}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <div style={s.cardTitle}>Monthly Rent Payment</div>
              <div style={s.cardSub}>{fmt(lease.rentAmount)} due monthly</div>
            </div>
            <button style={s.payBtn} onClick={() => payInstallment()} disabled={!!paying}>
              <CreditCard size={16} style={{ marginRight: 6 }} />
              {paying ? 'Processing…' : 'Pay Rent'}
            </button>
          </div>
        </div>
      )}

      {/* ── No lease notice ─────────────────────────────────────────────── */}
      {!lease && (
        <div style={{ ...s.section, textAlign: 'center', padding: '32px 24px', marginBottom: 12 }}>
          <div style={{ width: 52, height: 52, borderRadius: 16, background: 'rgba(196,229,60,0.08)', border: '1px solid rgba(196,229,60,0.14)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
            <CreditCard size={24} color='rgba(196,229,60,0.6)' />
          </div>
          <p style={{ fontSize: 15, fontWeight: 800, color: D.text, margin: '0 0 6px' }}>No active lease</p>
          <p style={{ fontSize: 13, color: D.muted, margin: 0, lineHeight: 1.6 }}>
            Once you sign a rental agreement, your payment schedule will appear here.
          </p>
        </div>
      )}

      {/* ── Transaction history ──────────────────────────────────────────── */}
      <div style={s.section}>
        <div style={s.sTitle}>Transaction History</div>
        {transactions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '28px 16px' }}>
            <Clock size={28} color='rgba(255,255,255,0.1)' style={{ marginBottom: 10 }} />
            <p style={{ ...s.empty, padding: 0 }}>No transactions yet.</p>
          </div>
        ) : transactions.map((tx, i) => {
          const [color, bg] = TX_STATUS[tx.status] || TX_STATUS.pending
          return (
            <div key={tx._id} style={{ ...s.row, borderBottom: i === transactions.length - 1 ? 'none' : s.row.borderBottom }}>
              <div style={s.txLeft}>
                <div style={s.txIcon(bg)}>
                  {tx.status === 'completed'
                    ? <CheckCircle size={16} color={color} />
                    : tx.status === 'failed'
                    ? <AlertCircle size={16} color={color} />
                    : <Clock size={16} color={color} />}
                </div>
                <div>
                  <div style={s.txTitle}>{tx.description || tx.type || 'Payment'}</div>
                  <div style={s.txMeta}>{fmtDate(tx.createdAt)}</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={s.txAmount(tx.status === 'completed')}>{fmt(tx.amount)}</span>
                <span style={s.badge(color, bg)}>{tx.status}</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
