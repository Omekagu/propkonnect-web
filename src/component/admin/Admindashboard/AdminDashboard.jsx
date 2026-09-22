'use client'
import React, { useEffect, useState } from 'react'
import { users as usersApi } from '@/libs/api'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts'
import {
  FiUsers,
  FiHome,
  FiDollarSign,
  FiTool,
  FiRefreshCw,
  FiUserCheck,
  FiActivity,
  FiCheckCircle,
  FiClock,
  FiCalendar,
  FiDownload,
  FiArrowUpRight,
  FiArrowDownRight,
  FiArrowRight
} from 'react-icons/fi'
import './AdminDashboard.scss'

const PIE_COLORS = ['#0f6040', '#10b981', '#8b5cf6', '#f59e0b', '#ec4899', '#06b6d4']

const STATUS_COLOR = {
  completed: '#10b981',
  pending: '#f59e0b',
  rejected: '#ef4444',
  refunded: '#6b7280',
  open: '#0f6040',
  'in-progress': '#8b5cf6',
  cancelled: '#ef4444'
}

const PERIOD_OPTIONS = ['W', 'M', 'Y']

function KPICard ({ label, value, icon: Icon, iconColor, trend, trendUp }) {
  return (
    <div className='re-kpi-card'>
      <div className='re-kpi-top'>
        <span className='re-kpi-label'>{label}</span>
        <div className='re-kpi-icon' style={{ color: iconColor }}>
          <Icon size={16} />
        </div>
      </div>
      <div className='re-kpi-value'>{value}</div>
      {trend != null && (
        <div className={`re-kpi-trend ${trendUp ? 'up' : 'down'}`}>
          {trendUp ? <FiArrowUpRight size={13} /> : <FiArrowDownRight size={13} />}
          <span>{Math.abs(trend)}%</span>
        </div>
      )}
    </div>
  )
}

export default function AdminDashboard () {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [period, setPeriod] = useState('M')

  const fetchStats = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await usersApi.getStats()
      setStats(res.data.stats)
    } catch (err) {
      console.error('Dashboard stats error:', err)
      setError('Failed to load dashboard data.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className='loader-container'>
        <div className='loader-spinner' />
        <p>Loading dashboard...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className='dash-error'>
        <p>{error}</p>
        <button className='re-btn-primary' onClick={fetchStats}>
          <FiRefreshCw /> Retry
        </button>
      </div>
    )
  }

  const now = new Date()
  const monthAgo = new Date(now)
  monthAgo.setDate(monthAgo.getDate() - 28)
  const fmtDate = d =>
    d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })

  const roleData = Object.entries(stats?.usersByRole || {})
    .map(([role, count]) => ({ name: role, value: count }))
    .filter(r => r.name !== 'undefined' && r.name !== 'unknown')

  const chartData = stats?.monthlyTrend || []

  // Reminder items from recent service requests
  const reminders = (stats?.recentServiceRequests || []).slice(0, 3).map(sr => ({
    id: sr._id,
    title: sr.title || 'Service Request',
    desc: sr.category || 'No category',
    status: sr.status,
    date: sr.createdAt ? new Date(sr.createdAt) : new Date()
  }))

  const closedDeals = stats?.totalProperties
    ? Math.round(stats.totalProperties * 0.3)
    : 0

  return (
    <div className='re-dashboard'>

      {/* ── Header ── */}
      <div className='re-header'>
        <h1 className='re-title'>Real Estate Dashboard</h1>
        <div className='re-header-right'>
          <div className='re-date-range'>
            <FiCalendar size={14} />
            <span>{fmtDate(monthAgo)} – {fmtDate(now)}</span>
          </div>
          <button className='re-btn-download'>
            <FiDownload size={14} />
            Download
          </button>
        </div>
      </div>

      {/* ── 4 KPI Cards ── */}
      <div className='re-kpi-grid'>
        <KPICard
          label='Active Leads'
          value={(stats?.totalUsers || 0).toLocaleString()}
          icon={FiUsers}
          iconColor='#60a5fa'
          trend={stats?.userGrowth ?? 12}
          trendUp={(stats?.userGrowth ?? 12) >= 0}
        />
        <KPICard
          label='Total Revenue'
          value={`₦${((stats?.totalRevenue || 0) / 1_000_000).toFixed(1)}M`}
          icon={FiDollarSign}
          iconColor='#34d399'
          trend={12}
          trendUp
        />
        <KPICard
          label='Active Listing'
          value={(stats?.activeProperties || 0).toLocaleString()}
          icon={FiHome}
          iconColor='#f87171'
          trend={-12}
          trendUp={false}
        />
        <KPICard
          label='Total Closed'
          value={closedDeals.toLocaleString()}
          icon={FiCheckCircle}
          iconColor='#a78bfa'
          trend={12}
          trendUp
        />
      </div>

      {/* ── Main 3-column grid ── */}
      <div className='re-main-grid'>

        {/* Performance Chart */}
        <div className='re-perf-card'>
          <div className='re-card-header'>
            <span className='re-card-title'>Performance</span>
            <div className='re-period-tabs'>
              {PERIOD_OPTIONS.map(p => (
                <button
                  key={p}
                  className={`re-period-btn ${period === p ? 'active' : ''}`}
                  onClick={() => setPeriod(p)}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          <div className='re-legend'>
            <span className='re-legend-item re-legend-revenue'>
              <span className='re-legend-dot' style={{ background: '#C4E53C' }} />
              Revenue
            </span>
            <span className='re-legend-item'>
              <span className='re-legend-dot' style={{ background: '#52525b' }} />
              Visits
            </span>
          </div>
          {chartData.length > 0 ? (
            <ResponsiveContainer width='100%' height={200}>
              <AreaChart data={chartData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id='gRevenue' x1='0' y1='0' x2='0' y2='1'>
                    <stop offset='5%' stopColor='#C4E53C' stopOpacity={0.25} />
                    <stop offset='95%' stopColor='#C4E53C' stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id='gVisits' x1='0' y1='0' x2='0' y2='1'>
                    <stop offset='5%' stopColor='#52525b' stopOpacity={0.4} />
                    <stop offset='95%' stopColor='#52525b' stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray='3 3' stroke='rgba(255,255,255,0.04)' vertical={false} />
                <XAxis dataKey='month' tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.35)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.35)' }} axisLine={false} tickLine={false} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{ background: '#18181b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 }}
                  labelStyle={{ color: '#fafafa' }}
                  formatter={v => [`₦${v.toLocaleString()}`, '']}
                />
                <Area type='monotone' dataKey='revenue' stroke='#C4E53C' strokeWidth={2} fill='url(#gRevenue)' dot={false} name='Revenue' />
                <Area type='monotone' dataKey='users' stroke='#52525b' strokeWidth={2} fill='url(#gVisits)' dot={false} name='Visits' />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className='re-chart-empty'>No performance data yet</div>
          )}
          <div className='re-deals-bar'>
            <div className='re-deals-counts'>
              <span><strong>{closedDeals}</strong> <span className='re-muted'>Closed Deals</span></span>
              <span><span className='re-muted'>On Progress</span> <strong>{stats?.openServiceRequests || 0}</strong></span>
            </div>
            <div className='re-progress-track'>
              <div
                className='re-progress-fill'
                style={{
                  width: `${Math.min(100, (closedDeals / Math.max(1, closedDeals + (stats?.openServiceRequests || 0))) * 100).toFixed(0)}%`
                }}
              />
            </div>
            <span className='re-progress-label'>
              Deals · {Math.round((closedDeals / Math.max(1, stats?.totalProperties || 1)) * 100)}%
            </span>
          </div>
        </div>

        {/* Featured Property / Top Stats Card */}
        <div className='re-property-card'>
          <div className='re-card-header'>
            <div>
              <span className='re-card-title'>Platform Overview</span>
              <span className='re-card-subtitle'>Summary</span>
            </div>
            <span className='re-recommended-badge'>Live Stats</span>
          </div>
          <div className='re-prop-stats'>
            {[
              { label: 'Total Users', value: stats?.totalUsers || 0 },
              { label: 'Verified Artisans', value: stats?.verifiedArtisans || 0 },
              { label: 'Service Requests', value: stats?.totalServiceRequests || 0 }
            ].map(item => (
              <div key={item.label} className='re-prop-stat-row'>
                <span className='re-prop-stat-label'>{item.label}</span>
                <span className='re-prop-stat-value'>{item.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
          {/* Mini role distribution */}
          {roleData.length > 0 && (
            <div className='re-role-chart'>
              <ResponsiveContainer width='100%' height={120}>
                <PieChart>
                  <Pie data={roleData} cx='50%' cy='50%' innerRadius={35} outerRadius={52} paddingAngle={2} dataKey='value'>
                    {roleData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#18181b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 11 }} />
                  <Legend iconSize={8} wrapperStyle={{ fontSize: 10, color: 'rgba(255,255,255,0.45)' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Reminder / Recent Activity */}
        <div className='re-reminder-card'>
          <div className='re-card-header'>
            <span className='re-card-title'>Recent Activity</span>
            <button className='re-more-btn'>···</button>
          </div>
          <div className='re-reminder-list'>
            {reminders.length > 0 ? reminders.map((r, i) => {
              const d = r.date
              return (
                <div key={r.id || i} className='re-reminder-item'>
                  <div className='re-reminder-date'>
                    <span className='re-date-month'>{d.toLocaleString('en', { month: 'short' })}</span>
                    <span className='re-date-day'>{String(d.getDate()).padStart(2, '0')}</span>
                  </div>
                  <div className='re-reminder-body'>
                    <p className='re-reminder-title'>{r.title}</p>
                    <p className='re-reminder-desc'>{r.desc}</p>
                  </div>
                  <span
                    className='re-reminder-status'
                    style={{ color: STATUS_COLOR[r.status] || '#6b7280' }}
                  >
                    {r.status}
                  </span>
                </div>
              )
            }) : (
              <div className='re-reminder-empty'>No recent activity</div>
            )}
          </div>
        </div>
      </div>

      {/* ── Bottom row ── */}
      <div className='re-bottom-grid'>

        {/* Leads Contact = Recent Users */}
        <div className='re-bottom-card'>
          <div className='re-card-header'>
            <span className='re-card-title'>Leads Contact</span>
            <button className='re-link-btn'><FiArrowRight size={14} /></button>
          </div>
          <div className='re-users-list'>
            {(stats?.recentUsers || []).slice(0, 5).map(u => (
              <div key={u._id} className='re-user-row'>
                <div className='re-user-avatar'>
                  {u.avatar
                    ? <img src={u.avatar} alt={u.firstName} />
                    : <span>{(u.firstName || u.email || 'U')[0].toUpperCase()}</span>
                  }
                </div>
                <div className='re-user-info'>
                  <p className='re-user-name'>{u.firstName ? `${u.firstName} ${u.lastName || ''}`.trim() : u.email}</p>
                  <p className='re-user-role'>{u.role}</p>
                </div>
                <span className={`re-user-badge ${u.isVerified ? 'verified' : 'pending'}`}>
                  {u.isVerified ? 'Verified' : 'Pending'}
                </span>
              </div>
            ))}
            {!stats?.recentUsers?.length && <p className='re-empty-msg'>No users yet</p>}
          </div>
        </div>

        {/* Sales Analytics = Revenue bar */}
        <div className='re-bottom-card re-sales-card'>
          <div className='re-card-header'>
            <span className='re-card-title'>Sales Analytics</span>
            <span className='re-card-meta re-muted'>{new Date().toLocaleString('en', { month: 'long', year: 'numeric' })}</span>
          </div>
          {stats?.monthlyTrend?.length > 0 ? (
            <ResponsiveContainer width='100%' height={160}>
              <BarChart data={stats.monthlyTrend.slice(-6)} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray='3 3' stroke='rgba(255,255,255,0.04)' vertical={false} />
                <XAxis dataKey='month' tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.35)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.35)' }} axisLine={false} tickLine={false} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{ background: '#18181b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 11 }}
                  formatter={v => [`₦${v.toLocaleString()}`, 'Revenue']}
                />
                <Bar dataKey='revenue' fill='#C4E53C' radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className='re-chart-empty'>No sales data yet</div>
          )}
          <div className='re-sales-kpis'>
            <div className='re-sales-kpi'>
              <span className='re-sales-kpi-val'>₦{((stats?.totalRevenue || 0) / 1_000_000).toFixed(1)}M</span>
              <span className='re-muted' style={{ fontSize: 11 }}>Total Revenue</span>
            </div>
            <div className='re-sales-kpi'>
              <span className='re-sales-kpi-val'>{stats?.totalTransactions || 0}</span>
              <span className='re-muted' style={{ fontSize: 11 }}>Transactions</span>
            </div>
          </div>
        </div>

        {/* Property Overview = Listings by category */}
        <div className='re-bottom-card'>
          <div className='re-card-header'>
            <span className='re-card-title'>Property Overview</span>
            <button className='re-more-btn'>···</button>
          </div>
          <div className='re-prop-overview'>
            {[
              { label: 'Total Properties', value: stats?.totalProperties || 0, color: '#C4E53C' },
              { label: 'Active Listings', value: stats?.activeProperties || 0, color: '#10b981' },
              { label: 'Pending Artisans', value: stats?.pendingArtisans || 0, color: '#f59e0b' },
              { label: 'KYC Verified', value: stats?.verifiedUsers || 0, color: '#60a5fa' },
              { label: 'Total Artisans', value: stats?.totalArtisans || 0, color: '#a78bfa' }
            ].map(item => (
              <div key={item.label} className='re-overview-row'>
                <span className='re-overview-dot' style={{ background: item.color }} />
                <span className='re-overview-label'>{item.label}</span>
                <span className='re-overview-val'>{item.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Recent Transactions ── */}
      {stats?.recentTransactions?.length > 0 && (
        <div className='re-txn-card'>
          <div className='re-card-header' style={{ marginBottom: 12 }}>
            <span className='re-card-title'>Recent Transactions</span>
          </div>
          <div className='re-txn-table'>
            <div className='re-txn-header'>
              <span>User</span>
              <span>Amount</span>
              <span>Type</span>
              <span>Status</span>
            </div>
            {stats.recentTransactions.map(txn => (
              <div key={txn._id} className='re-txn-row'>
                <span className='re-txn-user'>
                  {txn.userId?.firstName ? `${txn.userId.firstName} ${txn.userId.lastName}` : 'Unknown'}
                </span>
                <span className='re-txn-amount'>₦{(txn.amount || 0).toLocaleString()}</span>
                <span className='re-txn-type'>{txn.type || txn.paymentMethod || '—'}</span>
                <span className='re-txn-status' style={{ color: STATUS_COLOR[txn.status] || '#6b7280' }}>
                  {txn.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
