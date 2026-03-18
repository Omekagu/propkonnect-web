'use client'
import React, { useEffect, useState, useCallback } from 'react'
import './Finance.scss'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts'

const API = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4001'
const fmt = v => `₦${Number(v || 0).toLocaleString()}`

function token () {
  if (typeof window === 'undefined') return ''
  return localStorage.getItem('authToken') || ''
}

async function apiFetch (path, opts = {}) {
  const res = await fetch(`${API}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token()}`
    },
    ...opts
  })
  return res.json()
}

const STATUS_COLOR = {
  completed: '#10b981',
  pending: '#f59e0b',
  refunded: '#0f6040',
  rejected: '#ef4444'
}
const TABS = ['Overview', 'Transactions', 'Escrow', 'Payouts']

function KPI ({ label, value, sub, color }) {
  return (
    <div className='fin-kpi'>
      <div className='fin-kpi-label'>{label}</div>
      <div className='fin-kpi-value' style={{ color: color || '#1e293b' }}>
        {value}
      </div>
      {sub && <div className='fin-kpi-sub'>{sub}</div>}
    </div>
  )
}

function OverviewTab ({ overview }) {
  if (!overview) return <div className='fin-loading'>Loading overview...</div>
  const growth = overview.monthlyGrowthPct
  const growthLabel =
    growth === null ? 'N/A' : `${growth > 0 ? '+' : ''}${growth}%`
  const chartData = Object.entries(overview.revenueByType || {}).map(
    ([type, data]) => ({ name: type, Revenue: data.total, Count: data.count })
  )
  return (
    <div className='fin-tab-content'>
      <div className='fin-kpi-grid'>
        <KPI
          label='Total Revenue'
          value={fmt(overview.totalRevenue)}
          color='#10b981'
        />
        <KPI
          label='This Month'
          value={fmt(overview.revenueThisMonth)}
          sub={`vs last month: ${growthLabel}`}
        />
        <KPI
          label='Escrow Held'
          value={fmt(overview.escrowBalance)}
          color='#f59e0b'
        />
        <KPI
          label='Pending Txns'
          value={overview.pendingTransactions}
          color='#f59e0b'
        />
        <KPI
          label='Completed'
          value={overview.completedTransactions}
          color='#10b981'
        />
        <KPI
          label='Refunded'
          value={overview.refundedTransactions}
          color='#0f6040'
        />
      </div>
      <div className='fin-chart-card'>
        <h4 className='fin-chart-title'>Revenue by Type</h4>
        <ResponsiveContainer width='100%' height={260}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray='3 3' stroke='#f1f5f9' />
            <XAxis dataKey='name' tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip formatter={(v, n) => [n === 'Revenue' ? fmt(v) : v, n]} />
            <Legend />
            <Bar dataKey='Revenue' fill='#2563eb' radius={[4, 4, 0, 0]} />
            <Bar dataKey='Count' fill='#93c5fd' radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

function TransactionsTab () {
  const [txns, setTxns] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState({ status: '', type: '' })
  const [loading, setLoading] = useState(false)
  const [refundingId, setRefundingId] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    const p = new URLSearchParams({ page, limit: 20 })
    if (filters.status) p.set('status', filters.status)
    if (filters.type) p.set('type', filters.type)
    const data = await apiFetch(`/api/admin/finance/transactions?${p}`)
    if (data.success) {
      setTxns(data.transactions)
      setTotal(data.total)
    }
    setLoading(false)
  }, [page, filters])

  useEffect(() => {
    load()
  }, [load])

  const handleRefund = async id => {
    if (!confirm('Refund this transaction?')) return
    setRefundingId(id)
    const data = await apiFetch(`/api/admin/finance/refund/${id}`, {
      method: 'POST',
      body: JSON.stringify({ reason: 'Admin refund' })
    })
    if (data.success) load()
    setRefundingId(null)
  }

  const exportCSV = async () => {
    const p = new URLSearchParams()
    if (filters.status) p.set('status', filters.status)
    if (filters.type) p.set('type', filters.type)
    const res = await fetch(`${API}/api/admin/finance/export/csv?${p}`, {
      headers: { Authorization: `Bearer ${token()}` }
    })
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'transactions.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className='fin-tab-content'>
      <div className='fin-toolbar'>
        <div className='fin-filters'>
          <select
            className='fin-select'
            value={filters.status}
            onChange={e => setFilters(p => ({ ...p, status: e.target.value }))}
          >
            <option value=''>All Statuses</option>
            {['completed', 'pending', 'refunded', 'rejected'].map(s => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <select
            className='fin-select'
            value={filters.type}
            onChange={e => setFilters(p => ({ ...p, type: e.target.value }))}
          >
            <option value=''>All Types</option>
            {[
              'payment',
              'bnpl',
              'rent_payment',
              'escrow-fund',
              'wallet-topup'
            ].map(t => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <button className='fin-btn fin-btn--outline' onClick={exportCSV}>
          Export CSV
        </button>
      </div>
      {loading ? (
        <div className='fin-loading'>Loading...</div>
      ) : (
        <>
          <table className='fin-table'>
            <thead>
              <tr>
                {[
                  'Reference',
                  'User',
                  'Type',
                  'Amount',
                  'Method',
                  'Status',
                  'Date',
                  ''
                ].map(h => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {!txns.length && (
                <tr>
                  <td colSpan={8} className='fin-empty-td'>
                    No transactions found
                  </td>
                </tr>
              )}
              {txns.map(t => (
                <tr key={t._id}>
                  <td className='fin-mono'>
                    TX-{String(t._id).slice(-6).toUpperCase()}
                  </td>
                  <td>
                    {t.userId
                      ? `${t.userId.firstName} ${t.userId.lastName}`
                      : 'N/A'}
                  </td>
                  <td>{t.type}</td>
                  <td className='fin-amount'>{fmt(t.amount)}</td>
                  <td>{t.paymentMethod}</td>
                  <td>
                    <span
                      className='fin-badge'
                      style={{
                        background:
                          (STATUS_COLOR[t.status] || '#64748b') + '22',
                        color: STATUS_COLOR[t.status] || '#64748b'
                      }}
                    >
                      {t.status}
                    </span>
                  </td>
                  <td>{new Date(t.createdAt).toLocaleDateString()}</td>
                  <td>
                    {['completed', 'pending'].includes(t.status) && (
                      <button
                        className='fin-btn fin-btn--danger fin-btn--sm'
                        disabled={refundingId === t._id}
                        onClick={() => handleRefund(t._id)}
                      >
                        {refundingId === t._id ? '...' : 'Refund'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className='fin-pagination'>
            <button
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              className='fin-btn fin-btn--outline'
            >
              Prev
            </button>
            <span>
              Page {page} of {Math.ceil(total / 20) || 1}
            </span>
            <button
              disabled={page * 20 >= total}
              onClick={() => setPage(p => p + 1)}
              className='fin-btn fin-btn--outline'
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  )
}

function EscrowTab () {
  const [escrows, setEscrows] = useState([])
  const [total, setTotal] = useState(0)
  const [status, setStatus] = useState('funded')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    apiFetch(`/api/admin/finance/escrow?status=${status}`).then(data => {
      if (data.success) {
        setEscrows(data.escrows)
        setTotal(data.total)
      }
      setLoading(false)
    })
  }, [status])

  return (
    <div className='fin-tab-content'>
      <div className='fin-toolbar'>
        <select
          className='fin-select'
          value={status}
          onChange={e => setStatus(e.target.value)}
        >
          {['all', 'pending', 'funded', 'released', 'refunded', 'disputed'].map(
            s => (
              <option key={s} value={s}>
                {s}
              </option>
            )
          )}
        </select>
        <span className='fin-total-label'>{total} records</span>
      </div>
      {loading ? (
        <div className='fin-loading'>Loading...</div>
      ) : (
        <table className='fin-table'>
          <thead>
            <tr>
              {[
                'ID',
                'Payer',
                'Payee',
                'Amount',
                'Type',
                'Status',
                'Created'
              ].map(h => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {!escrows.length && (
              <tr>
                <td colSpan={7} className='fin-empty-td'>
                  No escrow records
                </td>
              </tr>
            )}
            {escrows.map(e => (
              <tr key={e._id}>
                <td className='fin-mono'>{String(e._id).slice(-6)}</td>
                <td>
                  {e.payer ? `${e.payer.firstName} ${e.payer.lastName}` : 'N/A'}
                </td>
                <td>
                  {e.payee ? `${e.payee.firstName} ${e.payee.lastName}` : 'N/A'}
                </td>
                <td className='fin-amount'>{fmt(e.amount)}</td>
                <td>{e.type}</td>
                <td>
                  <span
                    className='fin-badge'
                    style={{
                      background: (STATUS_COLOR[e.status] || '#64748b') + '22',
                      color: STATUS_COLOR[e.status] || '#64748b'
                    }}
                  >
                    {e.status}
                  </span>
                </td>
                <td>{new Date(e.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

function PayoutsTab () {
  const [payouts, setPayouts] = useState([])
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState(null)
  const [confirmUser, setConfirmUser] = useState(null) // { userId, name, amount }
  const [toast, setToast] = useState(null)

  const load = () => {
    setLoading(true)
    apiFetch('/api/admin/finance/payouts/pending').then(data => {
      if (data.success) setPayouts(data.payouts)
      setLoading(false)
    })
  }

  useEffect(() => {
    load()
  }, [])

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 4000)
  }

  const handleProcessConfirm = async () => {
    if (!confirmUser) return
    const { userId, name, amount } = confirmUser
    setConfirmUser(null)
    setProcessingId(userId)
    try {
      const data = await apiFetch(
        `/api/admin/finance/payouts/${userId}/process`,
        { method: 'POST' }
      )
      if (data.success) {
        showToast(
          `Payout of ₦${Number(amount).toLocaleString()} initiated for ${name}`
        )
        load()
      } else {
        showToast(data.message || 'Payout failed', 'error')
      }
    } catch {
      showToast('Network error — payout not processed', 'error')
    }
    setProcessingId(null)
  }

  return (
    <div className='fin-tab-content'>
      <p className='fin-tab-desc'>
        Users with available wallet balances eligible for payout.
      </p>

      {toast && (
        <div className={`fin-toast fin-toast--${toast.type}`}>{toast.msg}</div>
      )}

      {confirmUser && (
        <div className='fin-confirm-overlay'>
          <div className='fin-confirm-modal'>
            <h4>Confirm Payout</h4>
            <p>
              Process payout of <strong>{fmt(confirmUser.amount)}</strong> to{' '}
              <strong>{confirmUser.name}</strong>?
            </p>
            <p className='fin-confirm-sub'>
              This will transfer the full wallet balance to their registered
              bank account via Paystack.
            </p>
            <div className='fin-confirm-actions'>
              <button
                className='fin-btn fin-btn--primary'
                onClick={handleProcessConfirm}
              >
                Yes, Process Payout
              </button>
              <button
                className='fin-btn fin-btn--outline'
                onClick={() => setConfirmUser(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className='fin-loading'>Loading...</div>
      ) : (
        <table className='fin-table'>
          <thead>
            <tr>
              {[
                'Name',
                'Email',
                'Role',
                'Balance',
                'Bank',
                'Account Name',
                'Account No.',
                ''
              ].map(h => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {!payouts.length && (
              <tr>
                <td colSpan={8} className='fin-empty-td'>
                  No pending payouts
                </td>
              </tr>
            )}
            {payouts.map(p => (
              <tr key={p.userId}>
                <td>{p.name}</td>
                <td>{p.email}</td>
                <td>
                  <span className='fin-badge fin-badge--role'>{p.role}</span>
                </td>
                <td className='fin-amount'>{fmt(p.availableBalance)}</td>
                <td>{p.bankName || <span className='fin-muted'>—</span>}</td>
                <td>{p.accountName || <span className='fin-muted'>—</span>}</td>
                <td className='fin-mono'>
                  {p.accountNumber || <span className='fin-muted'>—</span>}
                </td>
                <td>
                  {p.bankSetup ? (
                    <button
                      className='fin-btn fin-btn--primary fin-btn--sm'
                      disabled={processingId === p.userId}
                      onClick={() =>
                        setConfirmUser({
                          userId: p.userId,
                          name: p.name,
                          amount: p.availableBalance
                        })
                      }
                    >
                      {processingId === p.userId ? 'Processing...' : 'Pay Out'}
                    </button>
                  ) : (
                    <span className='fin-muted fin-badge fin-badge--warn'>
                      No Bank
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

export default function FinanceDashboard ({ initialTab }) {
  const [activeTab, setActiveTab] = useState(initialTab || 'Overview')
  const [overview, setOverview] = useState(null)

  useEffect(() => {
    apiFetch('/api/admin/finance/overview').then(data => {
      if (data.success) setOverview(data.overview)
    })
  }, [])

  return (
    <div className='finance-dashboard'>
      <div className='fin-header'>
        <h2 className='fin-title'>Finance Dashboard</h2>
        <p className='fin-subtitle'>
          Platform revenue, transactions, escrow, and payout queue.
        </p>
      </div>
      <div className='fin-tabs'>
        {TABS.map(t => (
          <button
            key={t}
            className={`fin-tab ${activeTab === t ? 'fin-tab--active' : ''}`}
            onClick={() => setActiveTab(t)}
          >
            {t}
          </button>
        ))}
      </div>
      {activeTab === 'Overview' && <OverviewTab overview={overview} />}
      {activeTab === 'Transactions' && <TransactionsTab />}
      {activeTab === 'Escrow' && <EscrowTab />}
      {activeTab === 'Payouts' && <PayoutsTab />}
    </div>
  )
}
