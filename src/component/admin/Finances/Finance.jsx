'use client'
import React, { useEffect, useState, useCallback } from 'react'
import './Finance.scss'
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie,
  Cell, Legend, defs
} from 'recharts'
import {
  TrendingUp, TrendingDown, DollarSign, Clock, CheckCircle,
  RotateCcw, Shield, ArrowUpRight, Download, RefreshCw,
  ChevronLeft, ChevronRight, AlertCircle, Wrench, X
} from 'lucide-react'

const API = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4001'

const fmt  = v => `₦${Number(v || 0).toLocaleString()}`
const fmtK = v => {
  const n = Number(v || 0)
  if (n >= 1_000_000) return `₦${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000)     return `₦${(n / 1_000).toFixed(1)}K`
  return `₦${n.toLocaleString()}`
}
const fmtDate = d => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })

function token () {
  if (typeof window === 'undefined') return ''
  return localStorage.getItem('authToken') || ''
}

async function apiFetch (path, opts = {}) {
  const res = await fetch(`${API}${path}`, {
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
    ...opts
  })
  return res.json()
}

// ── Color maps ────────────────────────────────────────────────────────────────
const STATUS_META = {
  completed: { color: '#3fb950', bg: 'rgba(63,185,80,0.12)',  label: 'Completed' },
  pending:   { color: '#d29922', bg: 'rgba(210,153,34,0.12)', label: 'Pending' },
  refunded:  { color: '#58a6ff', bg: 'rgba(88,166,255,0.12)', label: 'Refunded' },
  rejected:  { color: '#f85149', bg: 'rgba(248,81,73,0.12)',  label: 'Rejected' }
}

const TYPE_COLORS = ['#C4E53C','#58a6ff','#3fb950','#d29922','#a78bfa','#f85149','#34d399','#fb923c']

const TABS = ['Overview', 'Transactions', 'Escrow', 'Payouts']

// ── Custom Recharts tooltip ───────────────────────────────────────────────────
function DarkTooltip ({ active, payload, label, currency = true }) {
  if (!active || !payload?.length) return null
  return (
    <div className='fin-tooltip'>
      {label && <div className='fin-tooltip-label'>{label}</div>}
      {payload.map((p, i) => (
        <div key={i} className='fin-tooltip-row'>
          <span className='fin-tooltip-dot' style={{ background: p.color || p.fill }} />
          <span className='fin-tooltip-name'>{p.name}</span>
          <span className='fin-tooltip-val'>
            {currency && p.name !== 'Count' && p.name !== 'Transactions' ? fmt(p.value) : p.value?.toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  )
}

// ── KPI card ──────────────────────────────────────────────────────────────────
function KPI ({ label, value, sub, icon, accentColor, trend }) {
  const isUp = trend > 0, isDown = trend < 0
  return (
    <div className='fin-kpi'>
      <div className='fin-kpi-top'>
        <span className='fin-kpi-label'>{label}</span>
        <div className='fin-kpi-icon' style={{ background: accentColor + '1a', color: accentColor }}>{icon}</div>
      </div>
      <div className='fin-kpi-value' style={{ color: accentColor || '#e6edf3' }}>{value}</div>
      {sub && (
        <div className='fin-kpi-sub'>
          {trend != null && (
            <span className={`fin-kpi-trend ${isUp ? 'up' : isDown ? 'down' : ''}`}>
              {isUp ? <TrendingUp size={11} /> : isDown ? <TrendingDown size={11} /> : null}
              {trend != null ? `${trend > 0 ? '+' : ''}${trend}%` : ''}
            </span>
          )}
          {sub}
        </div>
      )}
    </div>
  )
}

// ── Overview Tab ──────────────────────────────────────────────────────────────
function OverviewTab ({ overview, loading }) {
  if (loading) return <div className='fin-state'><div className='fin-spinner' /></div>
  if (!overview) return <div className='fin-state'><AlertCircle size={32} /><p>Failed to load overview</p></div>

  const growth = overview.monthlyGrowthPct
  const chartData = overview.monthlyTrend || []
  const typeData  = Object.entries(overview.revenueByType || {})
    .map(([type, d], i) => ({ name: type.replace(/_/g, ' '), revenue: d.total, count: d.count, fill: TYPE_COLORS[i % TYPE_COLORS.length] }))
    .sort((a, b) => b.revenue - a.revenue)
  const statusData = (overview.statusBreakdown || []).map(s => ({
    name: s.status, value: s.count, color: STATUS_META[s.status]?.color || '#6e7681'
  }))

  return (
    <div className='fin-tab-content'>
      {/* KPI grid */}
      <div className='fin-kpi-grid'>
        <KPI label='Total Revenue'   value={fmt(overview.totalRevenue)}         accentColor='#C4E53C' icon={<DollarSign size={16} />} />
        <KPI label='This Month'      value={fmt(overview.revenueThisMonth)}     accentColor='#58a6ff' icon={<TrendingUp size={16} />}
          sub={`vs last month`} trend={growth !== null ? Number(growth) : null} />
        <KPI label='Last Month'      value={fmt(overview.revenueLastMonth)}     accentColor='rgba(230,237,243,0.6)' icon={<ArrowUpRight size={16} />} />
        <KPI label='Escrow Held'     value={fmt(overview.escrowBalance)}        accentColor='#d29922' icon={<Shield size={16} />} />
        <KPI label='Pending Txns'    value={overview.pendingTransactions}       accentColor='#d29922' icon={<Clock size={16} />} />
        <KPI label='Completed'       value={overview.completedTransactions}     accentColor='#3fb950' icon={<CheckCircle size={16} />} />
        <KPI label='Refunded'        value={overview.refundedTransactions}      accentColor='#58a6ff' icon={<RotateCcw size={16} />} />
      </div>

      {/* Revenue trend area chart */}
      <div className='fin-chart-card'>
        <div className='fin-chart-head'>
          <div>
            <h4>Revenue Trend</h4>
            <p>Monthly revenue over the last 12 months</p>
          </div>
        </div>
        <ResponsiveContainer width='100%' height={280}>
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id='revGrad' x1='0' y1='0' x2='0' y2='1'>
                <stop offset='5%'  stopColor='#C4E53C' stopOpacity={0.25} />
                <stop offset='95%' stopColor='#C4E53C' stopOpacity={0} />
              </linearGradient>
              <linearGradient id='cntGrad' x1='0' y1='0' x2='0' y2='1'>
                <stop offset='5%'  stopColor='#58a6ff' stopOpacity={0.15} />
                <stop offset='95%' stopColor='#58a6ff' stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray='3 3' stroke='rgba(255,255,255,0.05)' vertical={false} />
            <XAxis dataKey='month' tick={{ fill: 'rgba(230,237,243,0.45)', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tickFormatter={v => fmtK(v)} tick={{ fill: 'rgba(230,237,243,0.45)', fontSize: 11 }} axisLine={false} tickLine={false} width={60} />
            <Tooltip content={<DarkTooltip />} />
            <Area type='monotone' dataKey='revenue' name='Revenue' stroke='#C4E53C' strokeWidth={2} fill='url(#revGrad)' dot={false} activeDot={{ r: 5, fill: '#C4E53C' }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Bottom row: by-type bars + status donut */}
      <div className='fin-chart-row'>
        <div className='fin-chart-card fin-chart-card--half'>
          <div className='fin-chart-head'>
            <div>
              <h4>Revenue by Type</h4>
              <p>Breakdown of completed transactions</p>
            </div>
          </div>
          {typeData.length === 0
            ? <div className='fin-state' style={{ padding: '2rem' }}><p>No data yet</p></div>
            : (
              <ResponsiveContainer width='100%' height={220}>
                <BarChart data={typeData} layout='vertical' margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray='3 3' stroke='rgba(255,255,255,0.05)' horizontal={false} />
                  <XAxis type='number' tickFormatter={v => fmtK(v)} tick={{ fill: 'rgba(230,237,243,0.45)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis type='category' dataKey='name' tick={{ fill: 'rgba(230,237,243,0.55)', fontSize: 11 }} axisLine={false} tickLine={false} width={90} />
                  <Tooltip content={<DarkTooltip />} />
                  <Bar dataKey='revenue' name='Revenue' radius={[0, 6, 6, 0]} maxBarSize={22}>
                    {typeData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
        </div>

        <div className='fin-chart-card fin-chart-card--half'>
          <div className='fin-chart-head'>
            <div>
              <h4>Transaction Status</h4>
              <p>Count by status across all transactions</p>
            </div>
          </div>
          {statusData.length === 0
            ? <div className='fin-state' style={{ padding: '2rem' }}><p>No data yet</p></div>
            : (
              <div className='fin-donut-wrap'>
                <ResponsiveContainer width='100%' height={200}>
                  <PieChart>
                    <Pie data={statusData} dataKey='value' nameKey='name'
                      cx='50%' cy='50%' innerRadius={55} outerRadius={85}
                      paddingAngle={3} strokeWidth={0}>
                      {statusData.map((s, i) => <Cell key={i} fill={s.color} />)}
                    </Pie>
                    <Tooltip content={<DarkTooltip currency={false} />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className='fin-donut-legend'>
                  {statusData.map((s, i) => (
                    <div key={i} className='fin-donut-item'>
                      <span className='fin-donut-dot' style={{ background: s.color }} />
                      <span className='fin-donut-name'>{s.name}</span>
                      <span className='fin-donut-val'>{s.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
        </div>
      </div>
    </div>
  )
}

// ── Transactions Tab ──────────────────────────────────────────────────────────
function TransactionsTab () {
  const [txns, setTxns]       = useState([])
  const [total, setTotal]     = useState(0)
  const [page, setPage]       = useState(1)
  const [filters, setFilters] = useState({ status: '', type: '' })
  const [loading, setLoading] = useState(false)
  const [refundingId, setRefundingId] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    const p = new URLSearchParams({ page, limit: 20 })
    if (filters.status) p.set('status', filters.status)
    if (filters.type)   p.set('type', filters.type)
    const data = await apiFetch(`/api/admin/finance/transactions?${p}`)
    if (data.success) { setTxns(data.transactions); setTotal(data.total) }
    setLoading(false)
  }, [page, filters])

  useEffect(() => { load() }, [load])

  const handleRefund = async id => {
    if (!confirm('Refund this transaction?')) return
    setRefundingId(id)
    const data = await apiFetch(`/api/admin/finance/refund/${id}`, { method: 'POST', body: JSON.stringify({ reason: 'Admin refund' }) })
    if (data.success) load()
    setRefundingId(null)
  }

  const exportCSV = async () => {
    const p = new URLSearchParams()
    if (filters.status) p.set('status', filters.status)
    if (filters.type)   p.set('type', filters.type)
    const res = await fetch(`${API}/api/admin/finance/export/csv?${p}`, { headers: { Authorization: `Bearer ${token()}` } })
    const blob = await res.blob()
    const url  = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'transactions.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className='fin-tab-content'>
      <div className='fin-toolbar'>
        <div className='fin-filters'>
          <select className='fin-select' value={filters.status} onChange={e => setFilters(p => ({ ...p, status: e.target.value }))}>
            <option value=''>All Statuses</option>
            {['completed','pending','refunded','rejected'].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select className='fin-select' value={filters.type} onChange={e => setFilters(p => ({ ...p, type: e.target.value }))}>
            <option value=''>All Types</option>
            {['payment','bnpl','rent_payment','purchase','escrow-fund','wallet-topup','booking'].map(t => (
              <option key={t} value={t}>{t.replace(/_/g,' ')}</option>
            ))}
          </select>
        </div>
        <div className='fin-toolbar-right'>
          <span className='fin-total-label'>{total.toLocaleString()} records</span>
          <button className='fin-btn fin-btn--ghost' onClick={load}><RefreshCw size={13} /></button>
          <button className='fin-btn fin-btn--ghost' onClick={exportCSV}><Download size={13} /> Export CSV</button>
        </div>
      </div>

      {loading ? (
        <div className='fin-state'><div className='fin-spinner' /></div>
      ) : (
        <>
          <div className='fin-table-wrap'>
            <table className='fin-table'>
              <thead>
                <tr>{['Reference','User','Type','Amount','Method','Status','Date',''].map(h => <th key={h}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {!txns.length && <tr><td colSpan={8} className='fin-empty-td'>No transactions found</td></tr>}
                {txns.map(t => {
                  const sm = STATUS_META[t.status] || { color: '#6e7681', bg: 'rgba(110,118,129,0.12)', label: t.status }
                  return (
                    <tr key={t._id}>
                      <td className='fin-mono'>TX-{String(t._id).slice(-6).toUpperCase()}</td>
                      <td>
                        <div className='fin-user-cell'>
                          <div className='fin-user-av'>{(t.userId?.firstName?.[0] || '?').toUpperCase()}</div>
                          <div>
                            <div className='fin-user-name'>{t.userId ? `${t.userId.firstName} ${t.userId.lastName}` : 'Guest'}</div>
                            {t.userId?.email && <div className='fin-user-email'>{t.userId.email}</div>}
                          </div>
                        </div>
                      </td>
                      <td><span className='fin-type-pill'>{t.type?.replace(/_/g,' ')}</span></td>
                      <td className='fin-amount'>{fmt(t.amount)}</td>
                      <td className='fin-muted-cell'>{t.paymentMethod || '—'}</td>
                      <td><span className='fin-badge' style={{ background: sm.bg, color: sm.color }}>{sm.label}</span></td>
                      <td className='fin-muted-cell'>{fmtDate(t.createdAt)}</td>
                      <td>
                        {['completed','pending'].includes(t.status) && (
                          <button className='fin-btn fin-btn--danger fin-btn--sm' disabled={refundingId === t._id} onClick={() => handleRefund(t._id)}>
                            {refundingId === t._id ? '…' : 'Refund'}
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <div className='fin-pagination'>
            <span className='fin-page-info'>{total.toLocaleString()} total · Page {page} of {Math.ceil(total / 20) || 1}</span>
            <div className='fin-page-btns'>
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)}><ChevronLeft size={14} /></button>
              <button disabled={page * 20 >= total} onClick={() => setPage(p => p + 1)}><ChevronRight size={14} /></button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

// ── Escrow Tab ────────────────────────────────────────────────────────────────
function EscrowTab () {
  const [escrows, setEscrows] = useState([])
  const [total, setTotal]     = useState(0)
  const [status, setStatus]   = useState('funded')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    apiFetch(`/api/admin/finance/escrow?status=${status}`).then(data => {
      if (data.success) { setEscrows(data.escrows); setTotal(data.total) }
      setLoading(false)
    })
  }, [status])

  return (
    <div className='fin-tab-content'>
      <div className='fin-toolbar'>
        <div className='fin-filters'>
          <select className='fin-select' value={status} onChange={e => setStatus(e.target.value)}>
            {['all','pending','funded','released','refunded','disputed'].map(s => (
              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
        </div>
        <span className='fin-total-label'>{total.toLocaleString()} records</span>
      </div>
      {loading ? (
        <div className='fin-state'><div className='fin-spinner' /></div>
      ) : (
        <div className='fin-table-wrap'>
          <table className='fin-table'>
            <thead>
              <tr>{['ID','Payer','Payee','Amount','Type','Status','Created'].map(h => <th key={h}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {!escrows.length && <tr><td colSpan={7} className='fin-empty-td'>No escrow records</td></tr>}
              {escrows.map(e => {
                const sm = STATUS_META[e.status] || { color: '#6e7681', bg: 'rgba(110,118,129,0.12)', label: e.status }
                return (
                  <tr key={e._id}>
                    <td className='fin-mono'>{String(e._id).slice(-8).toUpperCase()}</td>
                    <td>{e.payer ? `${e.payer.firstName} ${e.payer.lastName}` : <span className='fin-muted'>—</span>}</td>
                    <td>{e.payee ? `${e.payee.firstName} ${e.payee.lastName}` : <span className='fin-muted'>—</span>}</td>
                    <td className='fin-amount'>{fmt(e.amount)}</td>
                    <td><span className='fin-type-pill'>{e.type}</span></td>
                    <td><span className='fin-badge' style={{ background: sm.bg, color: sm.color }}>{sm.label}</span></td>
                    <td className='fin-muted-cell'>{fmtDate(e.createdAt)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// ── Payouts Tab ───────────────────────────────────────────────────────────────
function PayoutsTab () {
  const [payouts, setPayouts]     = useState([])
  const [loading, setLoading]     = useState(true)
  const [processingId, setProcessingId] = useState(null)
  const [confirmUser, setConfirmUser]   = useState(null)
  const [toast, setToast]         = useState(null)

  const load = () => {
    setLoading(true)
    apiFetch('/api/admin/finance/payouts/pending').then(data => {
      if (data.success) setPayouts(data.payouts)
      setLoading(false)
    })
  }

  useEffect(() => { load() }, [])

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
      const data = await apiFetch(`/api/admin/finance/payouts/${userId}/process`, { method: 'POST' })
      if (data.success) { showToast(`Payout of ${fmt(amount)} initiated for ${name}`); load() }
      else showToast(data.message || 'Payout failed', 'error')
    } catch { showToast('Network error — payout not processed', 'error') }
    setProcessingId(null)
  }

  return (
    <div className='fin-tab-content'>
      <p className='fin-tab-desc'>Users with available wallet balances eligible for payout.</p>

      {toast && (
        <div className={`fin-toast fin-toast--${toast.type}`}>
          {toast.type === 'success' ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
          {toast.msg}
        </div>
      )}

      {confirmUser && (
        <div className='fin-overlay' onClick={() => setConfirmUser(null)}>
          <div className='fin-modal' onClick={e => e.stopPropagation()}>
            <div className='fin-modal-head'>
              <h4>Confirm Payout</h4>
              <button onClick={() => setConfirmUser(null)}><X size={15} /></button>
            </div>
            <div className='fin-modal-body'>
              <p>Process payout of <strong>{fmt(confirmUser.amount)}</strong> to <strong>{confirmUser.name}</strong>?</p>
              <p className='fin-modal-sub'>This will transfer the full wallet balance to their registered bank account via Paystack.</p>
            </div>
            <div className='fin-modal-foot'>
              <button className='fin-btn fin-btn--ghost' onClick={() => setConfirmUser(null)}>Cancel</button>
              <button className='fin-btn fin-btn--primary' onClick={handleProcessConfirm}>Yes, Process Payout</button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className='fin-state'><div className='fin-spinner' /></div>
      ) : (
        <div className='fin-table-wrap'>
          <table className='fin-table'>
            <thead>
              <tr>{['Name','Email','Role','Balance','Bank','Account Name','Account No.',''].map(h => <th key={h}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {!payouts.length && <tr><td colSpan={8} className='fin-empty-td'>No pending payouts</td></tr>}
              {payouts.map(p => (
                <tr key={p.userId}>
                  <td className='fin-user-name'>{p.name}</td>
                  <td className='fin-muted-cell'>{p.email}</td>
                  <td><span className='fin-type-pill'>{p.role}</span></td>
                  <td className='fin-amount'>{fmt(p.availableBalance)}</td>
                  <td className='fin-muted-cell'>{p.bankName || <span className='fin-muted'>—</span>}</td>
                  <td>{p.accountName || <span className='fin-muted'>—</span>}</td>
                  <td className='fin-mono'>{p.accountNumber || <span className='fin-muted'>—</span>}</td>
                  <td>
                    {p.bankSetup
                      ? <button className='fin-btn fin-btn--primary fin-btn--sm' disabled={processingId === p.userId}
                          onClick={() => setConfirmUser({ userId: p.userId, name: p.name, amount: p.availableBalance })}>
                          {processingId === p.userId ? '…' : 'Pay Out'}
                        </button>
                      : <span className='fin-badge' style={{ background: 'rgba(210,153,34,0.12)', color: '#d29922' }}>No Bank</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// ── Backfill panel ────────────────────────────────────────────────────────────
function BackfillPanel () {
  const [status, setStatus] = useState(null)
  const [result, setResult] = useState(null)
  const [isDry,  setIsDry]  = useState(true)
  const [open,   setOpen]   = useState(false)

  const run = async () => {
    setStatus('running'); setResult(null)
    try {
      const data = await apiFetch(`/api/admin/finance/migrations/backfill-bookings?dry_run=${isDry}`, { method: 'POST' })
      setResult(data); setStatus(data.success ? 'done' : 'error')
    } catch (err) { setResult({ message: err.message }); setStatus('error') }
  }

  return (
    <div className='fin-backfill'>
      <div className='fin-backfill-head' onClick={() => setOpen(o => !o)}>
        <div className='fin-backfill-title'><Wrench size={14} /> Booking Backfill Migration</div>
        <ChevronLeft size={14} style={{ transform: open ? 'rotate(-90deg)' : 'rotate(90deg)', transition: '0.2s' }} />
      </div>
      {open && (
        <div className='fin-backfill-body'>
          <p>Creates missing <strong>Transactions</strong>, <strong>PropertyApplications</strong>, and <strong>Leases</strong> for confirmed bookings that pre-date automatic record creation.</p>
          <div className='fin-backfill-row'>
            <label>
              <input type='checkbox' checked={isDry} onChange={e => setIsDry(e.target.checked)} />
              Dry run (preview only — no writes)
            </label>
            <button className={`fin-btn fin-btn--sm ${isDry ? 'fin-btn--ghost' : 'fin-btn--danger'}`}
              onClick={run} disabled={status === 'running'}>
              {status === 'running' ? 'Running…' : isDry ? 'Preview' : 'Apply Migration'}
            </button>
          </div>
          {result && (
            <div className={`fin-backfill-result ${status === 'error' ? 'error' : 'ok'}`}>
              <div className='fin-bf-title'>{result.dryRun ? 'Preview result' : 'Migration complete'} — {result.message}</div>
              {result.results && (
                <div className='fin-bf-grid'>
                  {['transactions','applications','leases'].map(k => (
                    <div key={k} className='fin-bf-col'>
                      <div className='fin-bf-key'>{k}</div>
                      <div className='fin-bf-create'>✓ {result.results[k]?.created ?? 0} to create</div>
                      <div className='fin-bf-skip'>↷ {result.results[k]?.skipped ?? 0} skipped</div>
                      {result.results[k]?.errors?.length > 0 && <div className='fin-bf-err'>✗ {result.results[k].errors.length} errors</div>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── Root ──────────────────────────────────────────────────────────────────────
export default function FinanceDashboard ({ initialTab }) {
  const [activeTab, setActiveTab] = useState(initialTab || 'Overview')
  const [overview, setOverview]   = useState(null)
  const [ovLoading, setOvLoading] = useState(true)
  const [userRole] = useState(() => {
    try { return JSON.parse(localStorage.getItem('userData') || '{}').role || '' } catch { return '' }
  })

  const loadOverview = () => {
    setOvLoading(true)
    apiFetch('/api/admin/finance/overview').then(data => {
      if (data.success) setOverview(data.overview)
      setOvLoading(false)
    })
  }

  useEffect(() => { loadOverview() }, [])

  return (
    <div className='fin-wrap'>
      <div className='fin-head'>
        <div>
          <h2>Finance</h2>
          <p>Platform revenue, transactions, escrow and payouts</p>
        </div>
        <button className='fin-refresh-btn' onClick={loadOverview} title='Refresh overview'><RefreshCw size={15} /></button>
      </div>

      {userRole === 'SUPER_ADMIN' && <BackfillPanel />}

      <div className='fin-tabs'>
        {TABS.map(t => (
          <button key={t} className={`fin-tab ${activeTab === t ? 'fin-tab--active' : ''}`} onClick={() => setActiveTab(t)}>
            {t}
          </button>
        ))}
      </div>

      {activeTab === 'Overview'      && <OverviewTab overview={overview} loading={ovLoading} />}
      {activeTab === 'Transactions'  && <TransactionsTab />}
      {activeTab === 'Escrow'        && <EscrowTab />}
      {activeTab === 'Payouts'       && <PayoutsTab />}
    </div>
  )
}
