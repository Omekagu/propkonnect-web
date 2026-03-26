'use client'

import { useState, useEffect } from 'react'
import { transactions as transactionsApi, leases as leasesApi } from '@/libs/api'
import { DollarSign, CheckCircle, Clock, AlertCircle, CreditCard, CalendarDays, ChevronDown, ChevronUp } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

const fmt = amount => `₦${Number(amount).toLocaleString('en-NG')}`
const fmtDate = date => new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })

const INST_META = {
  pending:  { color: '#d97706', bg: '#fef3c7', label: 'Pending', Icon: Clock },
  overdue:  { color: '#dc2626', bg: '#fef2f2', label: 'Overdue', Icon: AlertCircle },
  paid:     { color: '#16a34a', bg: '#f0fdf4', label: 'Paid',    Icon: CheckCircle },
}

const TX_STATUS = {
  completed: ['#16a34a', '#f0fdf4'],
  pending:   ['#d97706', '#fef3c7'],
  failed:    ['#dc2626', '#fef2f2'],
  refunded:  ['#6b7280', '#f3f4f6'],
}

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
  page: { padding: '1.5rem', fontFamily: 'sans-serif' },
  h2: { fontSize: '1.4rem', fontWeight: 700, color: '#111', margin: '0 0 1.25rem' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '1.5rem' },
  statCard: { background: '#fff', borderRadius: 12, padding: '1.1rem', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', gap: 12 },
  iconBox: (bg) => ({ width: 40, height: 40, borderRadius: 10, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }),
  statVal: { fontWeight: 700, fontSize: '1.2rem', color: '#111' },
  statLbl: { fontSize: 11, color: '#6b7280', marginTop: 2 },

  card: { background: '#fff', borderRadius: 12, padding: '1.25rem', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: '1rem' },
  cardHead: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem', cursor: 'pointer' },
  cardTitle: { fontWeight: 700, fontSize: 15, color: '#111' },
  cardSub: { fontSize: 12, color: '#6b7280', marginTop: 2 },

  // Installment schedule
  progressBar: { height: 6, borderRadius: 4, background: '#e5e7eb', marginBottom: '1rem', overflow: 'hidden' },
  progressFill: (pct) => ({ height: '100%', width: `${pct}%`, background: '#16a34a', borderRadius: 4, transition: 'width .3s' }),
  instRow: (bg) => ({
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '0.7rem 0.85rem', borderRadius: 8, marginBottom: 6, background: bg,
    flexWrap: 'wrap', gap: 8
  }),
  instLeft: { display: 'flex', alignItems: 'center', gap: 10 },
  instLabel: { fontWeight: 600, fontSize: 14, color: '#111' },
  instDate: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  instRight: { display: 'flex', alignItems: 'center', gap: 8 },
  instAmt: { fontWeight: 700, fontSize: 15, color: '#111' },
  badge: (color, bg) => ({ padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 600, color, background: bg }),
  payBtn: { padding: '6px 16px', background: '#0B3D28', color: '#C4E53C', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: 13 },
  payBtnDisabled: { padding: '6px 16px', background: '#e5e7eb', color: '#9ca3af', border: 'none', borderRadius: 6, cursor: 'not-allowed', fontWeight: 600, fontSize: 13 },

  section: { background: '#fff', borderRadius: 12, padding: '1.25rem', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  sTitle: { fontSize: 15, fontWeight: 700, color: '#111', marginBottom: '1rem' },
  row: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.7rem 0', borderBottom: '1px solid #f3f4f6', flexWrap: 'wrap', gap: 6 },
  txLeft: { display: 'flex', alignItems: 'center', gap: 10 },
  txIcon: (bg) => ({ width: 36, height: 36, borderRadius: 8, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }),
  txTitle: { fontWeight: 600, fontSize: 14, color: '#111' },
  txMeta: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  txAmount: (positive) => ({ fontWeight: 700, fontSize: 15, color: positive ? '#16a34a' : '#111' }),
  empty: { textAlign: 'center', padding: '2rem', color: '#9ca3af', fontSize: 14 },
  alert: (t) => ({ padding: '10px 14px', borderRadius: 8, fontSize: 13, marginBottom: '0.75rem', background: t === 'success' ? '#f0fdf4' : '#fef2f2', color: t === 'success' ? '#16a34a' : '#dc2626' }),
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

  if (loading) return <div style={{ padding: '1.5rem', color: '#6b7280' }}>Loading payments…</div>

  return (
    <div style={s.page}>
      <h2 style={s.h2}>Payments</h2>

      {msg && <div style={s.alert(msg.type)}>{msg.text}</div>}

      {/* ── Stats ─────────────────────────────────────────────────────────── */}
      <div style={s.grid}>
        <div style={s.statCard}>
          <div style={s.iconBox('#dcfce7')}><DollarSign size={18} color="#16a34a" /></div>
          <div><div style={s.statVal}>{fmt(totalPaid)}</div><div style={s.statLbl}>Total Paid</div></div>
        </div>
        <div style={s.statCard}>
          <div style={s.iconBox('#dbeafe')}><CreditCard size={18} color="#2563eb" /></div>
          <div>
            <div style={s.statVal}>{lease ? fmt(lease.rentAmount) : '—'}</div>
            <div style={s.statLbl}>{PAYMENT_TYPE_LABELS[lease?.paymentType] || 'Rent Amount'}</div>
          </div>
        </div>
        {installments.length > 0 && (
          <div style={s.statCard}>
            <div style={s.iconBox('#fef3c7')}><CalendarDays size={18} color="#d97706" /></div>
            <div>
              <div style={s.statVal}>{paidCount}/{installments.length}</div>
              <div style={s.statLbl}>Installments paid</div>
            </div>
          </div>
        )}
        {overdueCount > 0 && (
          <div style={s.statCard}>
            <div style={s.iconBox('#fef2f2')}><AlertCircle size={18} color="#dc2626" /></div>
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

      {/* ── Transaction history ──────────────────────────────────────────── */}
      <div style={s.section}>
        <div style={s.sTitle}>Transaction History</div>
        {transactions.length === 0 ? (
          <p style={s.empty}>No transactions yet.</p>
        ) : transactions.map(tx => {
          const [color, bg] = TX_STATUS[tx.status] || TX_STATUS.pending
          return (
            <div key={tx._id} style={s.row}>
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
