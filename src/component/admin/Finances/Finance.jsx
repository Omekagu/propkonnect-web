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
import { FiDownload, FiTrendingUp, FiPieChart, FiUsers } from 'react-icons/fi'

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
  // cashFlow: last 20 points
  const [cashFlow, setCashFlow] = useState(generateInitialCashFlow())
  // revenue by category (monthly snapshot)
  const [revenueCategories, setRevenueCategories] = useState(
    generateRevenueCategories()
  )
  // expenses breakdown for donut
  const [expenseBreakdown, setExpenseBreakdown] = useState(
    generateExpenseBreakdown()
  )
  // transactions log (most recent at top)
  const [transactions, setTransactions] = useState(
    generateInitialTransactions()
  )
  // general KPIs (derived)
  const kpis = useMemo(
    () => computeKPIs(cashFlow, revenueCategories),
    [cashFlow, revenueCategories]
  )

  // simulate live feed: update cashFlow and small random transactions every 4s
  useEffect(() => {
    const tick = () => {
      setCashFlow(prev => {
        const next = prev.slice()
        // shift oldest, push new
        next.shift()
        const last = next[next.length - 1]
        const delta = Math.round((Math.random() - 0.45) * 3000)
        next.push({
          time: next.length + 1,
          balance: Math.max(20000, last.balance + delta)
        })
        return next
      })

      setRevenueCategories(prev =>
        prev.map(r => ({
          ...r,
          value: Math.max(
            2000,
            Math.round(r.value * (0.95 + Math.random() * 0.1))
          )
        }))
      )

      setExpenseBreakdown(prev =>
        prev.map(e => ({
          ...e,
          value: Math.max(
            200,
            Math.round(e.value * (0.95 + Math.random() * 0.1))
          )
        }))
      )

      // add a new transaction sometimes
      if (Math.random() > 0.4) {
        setTransactions(prev => {
          const newTx = generateRandomTransaction()
          const nextTx = [newTx, ...prev].slice(0, 10) // keep top 10
          return nextTx
        })
      }
    }

    const id = setInterval(tick, 4000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className='finance-dashboard'>
      <header className='fd-header'>
        <div>
          <h1>Finance Management</h1>
          <p className='muted'>
            Portfolio & company financial overview — live simulated data
          </p>
        </div>
        <div className='header-actions'>
          <button className='btn-outline'>
            <FiDownload /> Export Report
          </button>
          <div className='date-pill'>Nov 2025</div>
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
          label='Active Clients'
          value={kpis.clients}
          change={kpis.clientChange}
          icon={<FiUsers />}
        />
      </section>

      {/* Charts */}
      <section className='fd-charts'>
        <div className='card large'>
          <div className='card-head'>
            <h3>Cash Flow — Last periods</h3>
            <div className='small-controls'>
              <span className='muted'>Realtime simulated feed</span>
            </div>
          </div>

          <div className='chart-wrap'>
            <ResponsiveContainer width='100%' height={260}>
              <LineChart data={cashFlow}>
                <CartesianGrid strokeDasharray='3 3' stroke='#eef2f6' />
                <XAxis dataKey='time' tick={{ fill: COLORS.slate }} />
                <YAxis
                  tickFormatter={v => `$${(v / 1000).toFixed(0)}k`}
                  tick={{ fill: COLORS.slate }}
                />
                <Tooltip formatter={v => CURRENCY(v)} />
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
          </div>

          <div className='mini-stats'>
            <div>
              <div className='muted'>Latest</div>
              <div className='strong'>
                {CURRENCY(cashFlow[cashFlow.length - 1].balance)}
              </div>
            </div>
            <div>
              <div className='muted'>7d Cash Change</div>
              <div className={`strong ${kpis.revChange > 0 ? 'up' : 'down'}`}>
                {kpis.revChange}%
              </div>
            </div>
            <div>
              <div className='muted'>Available Liquidity</div>
              <div className='strong'>
                {CURRENCY(
                  Math.round(cashFlow[cashFlow.length - 1].balance * 0.48)
                )}
              </div>
            </div>
          </div>
        </div>

        <div className='card right-column'>
          <div className='card-head'>
            <h3>Revenue by Category</h3>
            <div className='muted'>Monthly snapshot</div>
          </div>

          <div className='chart-half'>
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
                    <Cell
                      key={`cell-${idx}`}
                      fill={
                        idx === 0
                          ? COLORS.primary
                          : idx === 1
                          ? COLORS.accent
                          : COLORS.green
                      }
                    />
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
          </div>

          <div className='card-divider' />

          <div className='card-sub'>
            <h4>Expense Distribution</h4>
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
          </div>
        </div>
      </section>

      {/* Transactions + Account summary */}
      <section className='fd-bottom'>
        <div className='transactions card'>
          <div className='card-head'>
            <h3>Recent Transactions</h3>
            <a className='muted' href='#view-all'>
              View all
            </a>
          </div>

          <table className='tx-table'>
            <thead>
              <tr>
                <th>Reference</th>
                <th>Type</th>
                <th>Account</th>
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
                  <td className={`amount ${t.amount > 0 ? 'credit' : 'debit'}`}>
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
        </div>

        <aside className='account card'>
          <div className='account-head'>
            <h3>Account Summary</h3>
            <div className='muted small'>Primary corporate wallet</div>
          </div>

          <div className='account-balance'>
            <div className='muted'>Wallet Balance</div>
            <div className='big'>
              {CURRENCY(cashFlow[cashFlow.length - 1].balance)}
            </div>

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

            <div className='account-actions'>
              <button className='btn-primary'>Withdraw</button>
              <button className='btn-ghost'>Deposit</button>
            </div>

            <div className='small-cards'>
              <div className='mini'>
                <div className='muted'>ROI (12mo)</div>
                <div className='strong up'>+18.4%</div>
              </div>
              <div className='mini'>
                <div className='muted'>Available Credit</div>
                <div className='strong'>
                  {CURRENCY(Math.round(kpis.totalRevenue * 0.12))}
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
        <div className={`pill ${change >= 0 ? 'up' : 'down'}`}>
          {change >= 0 ? `+${change}%` : `${change}%`}
        </div>
        <div className='kpi-icon'>{icon}</div>
      </div>
    </div>
  )
}

/* ---------- Helpers & Mock data ---------- */

function generateInitialCashFlow () {
  const base = 120000
  return Array.from({ length: 20 }, (_, i) => ({
    time: (i + 1).toString(),
    balance: Math.round(base + Math.sin(i / 3) * 6000 + Math.random() * 8000)
  }))
}

function generateRevenueCategories () {
  return [
    { name: 'Rent', value: 65000, color: COLORS.primary },
    { name: 'Sales', value: 42000, color: COLORS.accent },
    { name: 'Investments', value: 28000, color: COLORS.green }
  ]
}

function generateExpenseBreakdown () {
  return [
    { name: 'Maintenance', value: 8200, color: '#60A5FA' },
    { name: 'Marketing', value: 5200, color: '#93C5FD' },
    { name: 'Salaries', value: 11200, color: '#FCA5A5' },
    { name: 'Utilities', value: 3200, color: '#FDE68A' }
  ]
}

let txId = 1000
function generateInitialTransactions () {
  return [
    generateRandomTransaction(),
    generateRandomTransaction(),
    generateRandomTransaction(),
    generateRandomTransaction(),
    generateRandomTransaction()
  ]
}

function generateRandomTransaction () {
  const types = ['Rent', 'Sale', 'Refund', 'Payout', 'Investment']
  const accounts = ['Bank - 1234', 'Stripe', 'Wallet - Corporate']
  const status =
    Math.random() > 0.7
      ? 'Pending'
      : Math.random() > 0.85
      ? 'Failed'
      : 'Completed'
  const amt = Math.round(
    (Math.random() > 0.5 ? 1 : -1) * (500 + Math.random() * 7000)
  )
  const t = {
    id: txId++,
    ref: `TX-${Math.floor(100000 + Math.random() * 899999)}`,
    memo: types[Math.floor(Math.random() * types.length)],
    type: types[Math.floor(Math.random() * types.length)],
    account: accounts[Math.floor(Math.random() * accounts.length)],
    amount: amt,
    status,
    date: new Date().toLocaleString()
  }
  return t
}

function computeKPIs (cashFlow, revenueCategories) {
  const totalRevenue = revenueCategories.reduce((s, x) => s + x.value, 0)
  const totalExpenses = Math.round(totalRevenue * (0.48 + Math.random() * 0.12))
  const netProfit = totalRevenue - totalExpenses
  const revChange = Math.round((Math.random() * 6 + 1) * 10) / 10 // fake %
  const netChange = Math.round((Math.random() * 8 - 2) * 10) / 10
  const clients = 320 + Math.floor(Math.random() * 150)
  const clientChange = Math.round((Math.random() * 6 - 1) * 10) / 10
  return {
    totalRevenue,
    totalExpenses,
    netProfit,
    revChange,
    netChange,
    clients,
    clientChange
  }
}

function sumValues (arr) {
  return arr.reduce((s, e) => s + (e.value || 0), 0)
}
