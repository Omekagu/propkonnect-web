'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'
import { DollarSign, CheckCircle, Clock, AlertCircle, CreditCard } from 'lucide-react'

const API = process.env.NEXT_PUBLIC_BACKEND_URL

const s = {
  page: { padding: '1.5rem', fontFamily: 'sans-serif' },
  h2: { fontSize: '1.4rem', fontWeight: 700, color: '#111', margin: '0 0 1.25rem' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '1.5rem' },
  statCard: { background: '#fff', borderRadius: 12, padding: '1.1rem', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', gap: 12 },
  iconBox: (bg) => ({ width: 40, height: 40, borderRadius: 10, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }),
  statVal: { fontWeight: 700, fontSize: '1.2rem', color: '#111' },
  statLbl: { fontSize: 11, color: '#6b7280', marginTop: 2 },
  dueBox: { background: '#fff', borderRadius: 12, padding: '1.25rem', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 },
  dueTitle: { fontWeight: 700, fontSize: 15, color: '#111', marginBottom: 4 },
  dueSub: { fontSize: 13, color: '#6b7280' },
  btnPrimary: { padding: '10px 22px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 },
  section: { background: '#fff', borderRadius: 12, padding: '1.25rem', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  sTitle: { fontSize: 15, fontWeight: 700, color: '#111', marginBottom: '1rem' },
  row: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.7rem 0', borderBottom: '1px solid #f3f4f6', flexWrap: 'wrap', gap: 6 },
  txLeft: { display: 'flex', alignItems: 'center', gap: 10 },
  txIcon: (color, bg) => ({ width: 36, height: 36, borderRadius: 8, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }),
  txTitle: { fontWeight: 600, fontSize: 14, color: '#111' },
  txMeta: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  txAmount: (positive) => ({ fontWeight: 700, fontSize: 15, color: positive ? '#16a34a' : '#111' }),
  badge: (color, bg) => ({ padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 600, color, background: bg }),
  empty: { textAlign: 'center', padding: '2rem', color: '#9ca3af', fontSize: 14 },
  alert: (t) => ({ padding: '10px 14px', borderRadius: 8, fontSize: 13, marginBottom: '0.75rem', background: t === 'success' ? '#f0fdf4' : '#fef2f2', color: t === 'success' ? '#16a34a' : '#dc2626' }),
}

const TX_STATUS = {
  completed: ['#16a34a', '#f0fdf4'],
  pending:   ['#d97706', '#fef3c7'],
  failed:    ['#dc2626', '#fef2f2'],
  refunded:  ['#6b7280', '#f3f4f6'],
}

export default function TenantPayments () {
  const [transactions, setTransactions] = useState([])
  const [lease, setLease] = useState(null)
  const [loading, setLoading] = useState(true)
  const [paying, setPaying] = useState(false)
  const [msg, setMsg] = useState(null)

  useEffect(() => {
    Promise.all([
      axios.get(`${API}/api/transactions/mine`, { withCredentials: true }).catch(() => ({ data: { transactions: [] } })),
      axios.get(`${API}/api/leases/my`, { withCredentials: true }).catch(() => ({ data: null })),
    ]).then(([txRes, leaseRes]) => {
      setTransactions(txRes.data?.transactions || txRes.data?.data || [])
      const leases = leaseRes.data?.leases || leaseRes.data?.data || (leaseRes.data?.lease ? [leaseRes.data.lease] : [])
      setLease(leases[0] || null)
    }).finally(() => setLoading(false))
  }, [])

  async function payRent () {
    if (!lease) return
    setPaying(true)
    setMsg(null)
    try {
      const { data } = await axios.post(`${API}/api/leases/${lease._id}/pay-rent`, {}, { withCredentials: true })
      if (data.paymentUrl || data.checkoutUrl) {
        window.location.href = data.paymentUrl || data.checkoutUrl
      } else {
        setMsg({ type: 'success', text: 'Payment initiated. Check your email for instructions.' })
      }
    } catch (e) {
      setMsg({ type: 'error', text: e.response?.data?.message || 'Failed to initiate payment.' })
    } finally {
      setPaying(false)
    }
  }

  const totalPaid = transactions.filter(t => t.status === 'completed').reduce((s, t) => s + (t.amount || 0), 0)
  const pendingTx = transactions.filter(t => t.status === 'pending').length

  if (loading) return <div style={{ padding: '1.5rem', color: '#6b7280' }}>Loading payments…</div>

  return (
    <div style={s.page}>
      <h2 style={s.h2}>Payments</h2>

      {msg && <div style={s.alert(msg.type)}>{msg.text}</div>}

      <div style={s.grid}>
        <div style={s.statCard}>
          <div style={s.iconBox('#dcfce7')}><DollarSign size={18} color="#16a34a" /></div>
          <div><div style={s.statVal}>N{Number(totalPaid).toLocaleString()}</div><div style={s.statLbl}>Total Paid</div></div>
        </div>
        <div style={s.statCard}>
          <div style={s.iconBox('#dbeafe')}><CreditCard size={18} color="#2563eb" /></div>
          <div><div style={s.statVal}>{lease?.rentAmount ? `N${Number(lease.rentAmount).toLocaleString()}` : '—'}</div><div style={s.statLbl}>Monthly Rent</div></div>
        </div>
        <div style={s.statCard}>
          <div style={s.iconBox('#fef3c7')}><Clock size={18} color="#d97706" /></div>
          <div><div style={s.statVal}>{pendingTx}</div><div style={s.statLbl}>Pending</div></div>
        </div>
      </div>

      {lease && (
        <div style={s.dueBox}>
          <div>
            <div style={s.dueTitle}>Monthly Rent Payment</div>
            <div style={s.dueSub}>
              N{Number(lease.rentAmount).toLocaleString()} due
              {lease.nextPaymentDate ? ` on ${new Date(lease.nextPaymentDate).toLocaleDateString()}` : ' monthly'}
            </div>
          </div>
          <button style={s.btnPrimary} onClick={payRent} disabled={paying}>
            <CreditCard size={16} />
            {paying ? 'Processing…' : 'Pay Rent'}
          </button>
        </div>
      )}

      <div style={s.section}>
        <div style={s.sTitle}>Transaction History</div>
        {transactions.length === 0 ? (
          <p style={s.empty}>No transactions yet.</p>
        ) : transactions.map(tx => {
          const [color, bg] = TX_STATUS[tx.status] || TX_STATUS.pending
          return (
            <div key={tx._id} style={s.row}>
              <div style={s.txLeft}>
                <div style={s.txIcon(color, bg)}>
                  {tx.status === 'completed' ? <CheckCircle size={16} color={color} /> : tx.status === 'failed' ? <AlertCircle size={16} color={color} /> : <Clock size={16} color={color} />}
                </div>
                <div>
                  <div style={s.txTitle}>{tx.description || tx.type || 'Payment'}</div>
                  <div style={s.txMeta}>{new Date(tx.createdAt).toLocaleDateString()}</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={s.txAmount(tx.status === 'completed')}>N{Number(tx.amount).toLocaleString()}</span>
                <span style={s.badge(color, bg)}>{tx.status}</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
