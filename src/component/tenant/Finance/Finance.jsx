import React, { useEffect, useMemo, useState } from 'react'
import './Finance.scss'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts'
import {
  FiDownload,
  FiTrendingUp,
  FiPieChart,
  FiUsers,
  FiLoader
} from 'react-icons/fi'
import { transactions as transactionsApi } from '@/libs/api'

const CURRENCY = v =>
  v.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  })

const COLORS = {
  primary: '#2F80ED',
  accent: '#56CCF2',
  green: '#22C55E',
  amber: '#F59E0B',
  red: '#EF4444',
  slate: '#64748B'
}

export default function FinanceDashboard () {
  const [cashFlow, setCashFlow] = useState([])
  const [revenueCategories, setRevenueCategories] = useState([])
  const [expenseBreakdown, setExpenseBreakdown] = useState([])
  const [transactions, setTransactions] = useState([])
  const [stats, setStats] = useState([]) // Initialize as empty array
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const kpis = useMemo(() => computeKPIs(stats), [stats])

  // Fetch user transactions and stats on mount
  useEffect(() => {
    const fetchTransactionData = async () => {
      try {
        setLoading(true)
        const response = await transactionsApi.getMine()

        console.log('Transaction data response:', response)

        const data = response.data

        if (!data.success) {
          throw new Error(data.message || 'Failed to fetch transactions')
        }

        processTransactionData(data.transactions, data.stats)
        setError(null)
      } catch (err) {
        console.error('Error fetching transactions:', err)
        setError(err.message)

        // Set fallback empty data
        setCashFlow([])
        setRevenueCategories([])
        setExpenseBreakdown([])
        setTransactions([])
        setStats([]) // Set to empty array instead of null
      } finally {
        setLoading(false)
      }
    }

    fetchTransactionData()

    const interval = setInterval(fetchTransactionData, 30000)
    return () => clearInterval(interval)
  }, [])

  const processTransactionData = (txList, statsData) => {
    // Process for transaction table (most recent first)
    const processedTx = txList.slice(0, 10).map(tx => ({
      id: tx._id,
      ref: `TX-${tx._id.slice(-6).toUpperCase()}`,
      memo: tx.bookingDetails?.paymentType || tx.type,
      type: tx.type,
      account: tx.paymentMethod,
      amount: tx.amount,
      status: tx.status,
      date: new Date(tx.createdAt).toLocaleDateString()
    }))
    setTransactions(processedTx)

    // Group by date for cash flow chart (last 20 entries)
    const dateGroups = {}
    txList.forEach(tx => {
      const date = new Date(tx.createdAt).toLocaleDateString()
      if (!dateGroups[date]) {
        dateGroups[date] = { date, inflow: 0, outflow: 0, balance: 0 }
      }
      if (tx.amount > 0) {
        dateGroups[date].inflow += tx.amount
      } else {
        dateGroups[date].outflow += Math.abs(tx.amount)
      }
    })

    const flowData = Object.values(dateGroups)
      .slice(-20)
      .map((item, idx) => ({
        time: idx + 1,
        balance: item.inflow - item.outflow,
        inflow: item.inflow,
        outflow: item.outflow
      }))
    setCashFlow(flowData.length > 0 ? flowData : generateFallbackCashFlow())

    // Group by payment method for revenue categories
    const byMethod = {}
    txList.forEach(tx => {
      if (tx.amount > 0) {
        if (!byMethod[tx.paymentMethod]) {
          byMethod[tx.paymentMethod] = 0
        }
        byMethod[tx.paymentMethod] += tx.amount
      }
    })

    const revenueCats = Object.entries(byMethod)
      .map(([method, value], idx) => ({
        name: method,
        value,
        color: [COLORS.primary, COLORS.accent, COLORS.green][idx % 3]
      }))
      .sort((a, b) => b.value - a.value)

    setRevenueCategories(
      revenueCats.length > 0 ? revenueCats : generateFallbackRevenue()
    )

    // Group by type for expenses
    const byType = {}
    txList.forEach(tx => {
      if (tx.amount < 0) {
        if (!byType[tx.type]) {
          byType[tx.type] = 0
        }
        byType[tx.type] += Math.abs(tx.amount)
      }
    })

    const expenseCats = Object.entries(byType)
      .map(([type, value], idx) => ({
        name: type,
        value,
        color: ['#60A5FA', '#93C5FD', '#FCA5A5', '#FDE68A'][idx % 4]
      }))
      .sort((a, b) => b.value - a.value)

    setExpenseBreakdown(
      expenseCats.length > 0 ? expenseCats : generateFallbackExpenses()
    )

    // Set stats - ensure it's an array
    setStats(Array.isArray(statsData) ? statsData : [])
  }

  if (loading) {
    return (
      <div className='finance-dashboard loading-state'>
        <div className='loading-container'>
          <FiLoader className='spinner' />
          <p>Loading your financial data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className='finance-dashboard error-state'>
        <div className='error-container'>
          <h2>Unable to Load Data</h2>
          <p>{error}</p>
          <button
            className='btn-primary'
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className='finance-dashboard'>
      <header className='fd-header'>
        <div>
          <h1>Finance Management</h1>
          <p className='muted'>
            Portfolio & company financial overview — Live data
          </p>
        </div>
        <div className='header-actions'>
          <button className='btn-outline' onClick={() => window.print()}>
            <FiDownload /> Export Report
          </button>
          <div className='date-pill'>
            {new Date().toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short'
            })}
          </div>
        </div>
      </header>

      {/* KPIs */}
      <section className='fd-kpis'>
        <KPI
          label='Total Revenue'
          value={kpis.totalRevenue}
          change={kpis.revChange}
          icon={<FiTrendingUp />}
        />
        <KPI
          label='Total Expenses'
          value={kpis.totalExpenses}
          change={kpis.expChange}
          negative
        />
        <KPI
          label='Net Profit'
          value={kpis.netProfit}
          change={kpis.netChange}
          highlight
        />
        <KPI
          label='Total Transactions'
          value={kpis.transactionCount}
          icon={<FiUsers />}
        />
      </section>

      {/* Charts */}
      <section className='fd-charts'>
        <div className='card large'>
          <div className='card-head'>
            <h3>Cash Flow — Transaction History</h3>
            <div className='small-controls'>
              <span className='muted'>{transactions.length} transactions</span>
            </div>
          </div>

          <div className='chart-wrap'>
            {cashFlow.length > 0 ? (
              <ResponsiveContainer width='100%' height={260}>
                <LineChart data={cashFlow}>
                  <CartesianGrid strokeDasharray='3 3' stroke='#eef2f6' />
                  <XAxis dataKey='time' tick={{ fill: COLORS.slate }} />
                  <YAxis
                    tickFormatter={v => `$${(v / 1000).toFixed(0)}k`}
                    tick={{ fill: COLORS.slate }}
                  />
                  <Tooltip
                    formatter={v => CURRENCY(v)}
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb'
                    }}
                  />
                  <Line
                    type='monotone'
                    dataKey='balance'
                    stroke={COLORS.primary}
                    strokeWidth={3}
                    dot={false}
                    animationDuration={800}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className='empty-chart'>
                <p>No transaction data available</p>
              </div>
            )}
          </div>

          <div className='mini-stats'>
            <div>
              <div className='muted'>Latest Balance</div>
              <div className='strong'>
                {cashFlow.length > 0
                  ? CURRENCY(cashFlow[cashFlow.length - 1].balance)
                  : CURRENCY(0)}
              </div>
            </div>
            <div>
              <div className='muted'>Total Inflow</div>
              <div className={`strong up`}>{CURRENCY(kpis.totalRevenue)}</div>
            </div>
            <div>
              <div className='muted'>Total Outflow</div>
              <div className='strong'>{CURRENCY(kpis.totalExpenses)}</div>
            </div>
          </div>
        </div>

        <div className='card right-column'>
          <div className='card-head'>
            <h3>Revenue by Payment Method</h3>
            <div className='muted'>Distribution snapshot</div>
          </div>

          <div className='chart-half'>
            {revenueCategories.length > 0 ? (
              <>
                <ResponsiveContainer width='100%' height={160}>
                  <BarChart data={revenueCategories}>
                    <XAxis dataKey='name' tick={{ fill: COLORS.slate }} />
                    <YAxis hide />
                    <Tooltip formatter={v => CURRENCY(v)} />
                    <Bar
                      dataKey='value'
                      radius={[6, 6, 6, 6]}
                      animationDuration={700}
                    >
                      {revenueCategories.map((entry, idx) => (
                        <Cell key={`cell-${idx}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>

                <div className='legend-rows'>
                  {revenueCategories.map(r => (
                    <div className='legend-row' key={r.name}>
                      <div className='swatch' style={{ background: r.color }} />
                      <div className='label'>{r.name}</div>
                      <div className='value'>{CURRENCY(r.value)}</div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className='muted'>No revenue data</p>
            )}
          </div>

          <div className='card-divider' />

          <div className='card-sub'>
            <h4>Expense Distribution</h4>
            {expenseBreakdown.length > 0 ? (
              <div className='pie-row'>
                <ResponsiveContainer width='50%' height={140}>
                  <PieChart>
                    <Pie
                      data={expenseBreakdown}
                      dataKey='value'
                      nameKey='name'
                      innerRadius={38}
                      outerRadius={60}
                      paddingAngle={4}
                      animationDuration={600}
                    >
                      {expenseBreakdown.map((entry, i) => (
                        <Cell key={`cell-${i}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={v => CURRENCY(v)} />
                  </PieChart>
                </ResponsiveContainer>

                <div className='pie-legend'>
                  {expenseBreakdown.map(e => (
                    <div className='pie-legend-row' key={e.name}>
                      <div className='swatch' style={{ background: e.color }} />
                      <div>
                        <div className='label'>{e.name}</div>
                        <div className='muted small'>
                          {(
                            (e.value / sumValues(expenseBreakdown)) *
                            100
                          ).toFixed(1)}
                          %
                        </div>
                      </div>
                      <div className='value'>{CURRENCY(e.value)}</div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className='muted'>No expense data</p>
            )}
          </div>
        </div>
      </section>

      {/* Transactions + Account summary */}
      <section className='fd-bottom'>
        <div className='transactions card'>
          <div className='card-head'>
            <h3>Recent Transactions</h3>
            <a className='muted' href='#view-all'>
              View all ({transactions.length})
            </a>
          </div>

          {transactions.length > 0 ? (
            <table className='tx-table'>
              <thead>
                <tr>
                  <th>Reference</th>
                  <th>Type</th>
                  <th>Method</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map(t => (
                  <tr key={t.id}>
                    <td className='ref'>
                      <div className='ref-title'>{t.ref}</div>
                      <div className='muted small'>{t.memo}</div>
                    </td>
                    <td>{t.type}</td>
                    <td>{t.account}</td>
                    <td
                      className={`amount ${t.amount > 0 ? 'credit' : 'debit'}`}
                    >
                      {CURRENCY(t.amount)}
                    </td>
                    <td>
                      <span className={`status-pill ${t.status.toLowerCase()}`}>
                        {t.status}
                      </span>
                    </td>
                    <td className='muted small'>{t.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className='empty-state'>
              <p>No transactions yet</p>
            </div>
          )}
        </div>

        <aside className='account card'>
          <div className='account-head'>
            <h3>Account Summary</h3>
            <div className='muted small'>Financial Overview</div>
          </div>

          <div className='account-balance'>
            <div className='muted'>Net Balance</div>
            <div className='big'>{CURRENCY(kpis.netProfit || 0)}</div>

            {cashFlow.length > 0 && (
              <div className='sparkline'>
                <ResponsiveContainer width='100%' height={50}>
                  <LineChart data={cashFlow}>
                    <Line
                      type='monotone'
                      dataKey='balance'
                      stroke={COLORS.accent}
                      dot={false}
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            <div className='account-actions'>
              <button className='btn-primary'>Withdraw</button>
              <button className='btn-ghost'>Deposit</button>
            </div>

            <div className='small-cards'>
              <div className='mini'>
                <div className='muted'>Completed</div>
                <div className='strong'>
                  {stats.find(s => s._id === 'completed')?.count || 0}
                </div>
              </div>
              <div className='mini'>
                <div className='muted'>Pending</div>
                <div className='strong'>
                  {stats.find(s => s._id === 'pending')?.count || 0}
                </div>
              </div>
            </div>
          </div>
        </aside>
      </section>
    </div>
  )
}

/* ---------- Presentational subcomponents ---------- */

function KPI ({
  label,
  value,
  change = 0,
  negative = false,
  highlight = false,
  icon
}) {
  return (
    <div className={`kpi ${highlight ? 'highlight' : ''}`}>
      <div className='kpi-left'>
        <div className='kpi-label'>{label}</div>
        <div className='kpi-value'>
          {typeof value === 'number' ? CURRENCY(value) : value}
        </div>
      </div>
      <div className={`kpi-change ${negative ? 'negative' : ''}`}>
        {change !== 0 && (
          <div className={`pill ${change >= 0 ? 'up' : 'down'}`}>
            {change >= 0 ? `+${change}%` : `${change}%`}
          </div>
        )}
        <div className='kpi-icon'>{icon}</div>
      </div>
    </div>
  )
}

/* ---------- Helpers & Mock data ---------- */

function generateFallbackCashFlow () {
  const base = 120000
  return Array.from({ length: 20 }, (_, i) => ({
    time: (i + 1).toString(),
    balance: Math.round(base + Math.sin(i / 3) * 6000 + Math.random() * 8000)
  }))
}

function generateFallbackRevenue () {
  return [
    { name: 'Card', value: 65000, color: '#2F80ED' },
    { name: 'Bank Transfer', value: 42000, color: '#56CCF2' },
    { name: 'Wallet', value: 28000, color: '#22C55E' }
  ]
}

function generateFallbackExpenses () {
  return [
    { name: 'Refunds', value: 8200, color: '#60A5FA' },
    { name: 'Fees', value: 5200, color: '#93C5FD' },
    { name: 'Other', value: 3200, color: '#FDE68A' }
  ]
}

function computeKPIs (stats) {
  // Safely handle stats as array
  if (!Array.isArray(stats) || stats.length === 0) {
    return {
      totalRevenue: 0,
      totalExpenses: 0,
      netProfit: 0,
      revChange: 0,
      expChange: 0,
      netChange: 0,
      transactionCount: 0
    }
  }

  const completed = stats.find(s => s._id === 'completed') || {
    totalAmount: 0,
    count: 0
  }

  const pending = stats.find(s => s._id === 'pending') || {
    totalAmount: 0,
    count: 0
  }

  const rejected = stats.find(s => s._id === 'rejected') || {
    totalAmount: 0,
    count: 0
  }

  const totalRevenue = completed.totalAmount || 0
  const totalExpenses = (pending.totalAmount || 0) + (rejected.totalAmount || 0)
  const netProfit = totalRevenue - totalExpenses

  return {
    totalRevenue,
    totalExpenses,
    netProfit,
    revChange: 0,
    expChange: 0,
    netChange: 0,
    transactionCount:
      (completed.count || 0) + (pending.count || 0) + (rejected.count || 0)
  }
}

function sumValues (arr) {
  return arr.reduce((s, e) => s + (e.value || 0), 0)
}
