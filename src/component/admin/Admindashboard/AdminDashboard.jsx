'use client'
import React, { useEffect, useState } from 'react'
import axios from 'axios'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
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
  FiClock
} from 'react-icons/fi'
import './AdminDashboard.scss'

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL

const KPI_CONFIG = [
  {
    key: 'totalUsers',
    label: 'Total Users',
    icon: FiUsers,
    color: '#10b981',
    bg: 'card-green',
    sub: stat => `${stat.newUsersThisMonth ?? 0} new this month`,
    growth: stat => stat.userGrowth
  },
  {
    key: 'totalProperties',
    label: 'Properties',
    icon: FiHome,
    color: '#3b82f6',
    bg: 'card-blue',
    sub: stat => `${stat.activeProperties ?? 0} available`,
    growth: null
  },
  {
    key: 'totalRevenue',
    label: 'Total Revenue',
    icon: FiDollarSign,
    color: '#8b5cf6',
    bg: 'card-purple',
    format: v => `₦${(v || 0).toLocaleString()}`,
    sub: stat => `₦${(stat.revenueThisMonth ?? 0).toLocaleString()} this month`,
    growth: null
  },
  {
    key: 'totalServiceRequests',
    label: 'Service Requests',
    icon: FiTool,
    color: '#f59e0b',
    bg: 'card-orange',
    sub: stat => `${stat.openServiceRequests ?? 0} open`,
    growth: null
  }
]

const PIE_COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ec4899', '#06b6d4']

const STATUS_COLOR = {
  completed: '#10b981',
  pending: '#f59e0b',
  rejected: '#ef4444',
  refunded: '#6b7280',
  open: '#3b82f6',
  'in-progress': '#8b5cf6',
  cancelled: '#ef4444'
}

export default function AdminDashboard () {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const token =
    typeof window !== 'undefined' ? localStorage.getItem('authToken') : null

  const fetchStats = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await axios.get(`${API_URL}/api/user/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      })
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
        <button className='btn-primary' onClick={fetchStats}>
          <FiRefreshCw /> Retry
        </button>
      </div>
    )
  }

  // Build pie data from usersByRole
  const roleData = Object.entries(stats?.usersByRole || {})
    .map(([role, count]) => ({ name: role, value: count }))
    .filter(r => r.name !== 'undefined' && r.name !== 'unknown')

  return (
    <div className='enhanced-admin-dashboard'>
      {/* ── Header ── */}
      <div className='dashboard-header'>
        <div className='header-left'>
          <div className='header-content'>
            <h1>Dashboard</h1>
            <p className='header-date'>
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
        </div>
        <div className='header-actions'>
          <button className='btn-icon' onClick={fetchStats} title='Refresh'>
            <FiRefreshCw />
          </button>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div className='kpi-grid'>
        {KPI_CONFIG.map(cfg => {
          const raw = stats?.[cfg.key] ?? 0
          const formatted = cfg.format ? cfg.format(raw) : raw.toLocaleString()
          const growth = cfg.growth ? cfg.growth(stats || {}) : null
          return (
            <div key={cfg.key} className={`admin-stat-card ${cfg.bg}`}>
              <div className='stat-icon-wrap'>
                <cfg.icon size={22} color={cfg.color} />
              </div>
              <div className='stat-content'>
                <h3 className='stat-value'>{formatted}</h3>
                <p className='stat-label'>{cfg.label}</p>
                <span className='stat-sub'>{cfg.sub(stats || {})}</span>
                {growth !== null && (
                  <span className={`stat-growth ${growth >= 0 ? 'positive' : 'negative'}`}>
                    {growth >= 0 ? '+' : ''}{growth}% vs last month
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* ── Secondary KPIs ── */}
      <div className='secondary-kpis'>
        <div className='secondary-kpi-item'>
          <FiUserCheck size={18} />
          <div>
            <span className='sk-value'>{stats?.verifiedArtisans ?? 0}</span>
            <span className='sk-label'>Verified Artisans</span>
          </div>
        </div>
        <div className='secondary-kpi-item'>
          <FiUsers size={18} />
          <div>
            <span className='sk-value'>{stats?.totalArtisans ?? 0}</span>
            <span className='sk-label'>Total Artisans</span>
          </div>
        </div>
        <div className='secondary-kpi-item'>
          <FiCheckCircle size={18} />
          <div>
            <span className='sk-value'>{stats?.verifiedUsers ?? 0}</span>
            <span className='sk-label'>Verified Users</span>
          </div>
        </div>
        <div className='secondary-kpi-item'>
          <FiActivity size={18} />
          <div>
            <span className='sk-value'>{stats?.totalTransactions ?? 0}</span>
            <span className='sk-label'>Total Transactions</span>
          </div>
        </div>
        <div className='secondary-kpi-item'>
          <FiClock size={18} />
          <div>
            <span className='sk-value'>{stats?.pendingArtisans ?? 0}</span>
            <span className='sk-label'>Pending Artisans</span>
          </div>
        </div>
      </div>

      {/* ── Charts Row ── */}
      <div className='charts-row'>
        {/* Revenue Trend */}
        <div className='chart-card chart-wide'>
          <h3 className='chart-title'>Revenue Trend (Last 6 Months)</h3>
          {stats?.monthlyTrend?.length > 0 ? (
            <ResponsiveContainer width='100%' height={220}>
              <AreaChart data={stats.monthlyTrend} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id='revenueGrad' x1='0' y1='0' x2='0' y2='1'>
                    <stop offset='5%' stopColor='#8b5cf6' stopOpacity={0.35} />
                    <stop offset='95%' stopColor='#8b5cf6' stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray='3 3' stroke='#f0f0f0' />
                <XAxis dataKey='month' tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `₦${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={v => `₦${v.toLocaleString()}`} />
                <Area
                  type='monotone'
                  dataKey='revenue'
                  stroke='#8b5cf6'
                  strokeWidth={2}
                  fill='url(#revenueGrad)'
                  name='Revenue'
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className='chart-empty'>No revenue data yet</div>
          )}
        </div>

        {/* Users by Role Pie */}
        <div className='chart-card chart-narrow'>
          <h3 className='chart-title'>Users by Role</h3>
          {roleData.length > 0 ? (
            <ResponsiveContainer width='100%' height={220}>
              <PieChart>
                <Pie
                  data={roleData}
                  cx='50%'
                  cy='50%'
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey='value'
                >
                  {roleData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend iconSize={10} wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className='chart-empty'>No role data</div>
          )}
        </div>
      </div>

      {/* ── Recent Activity ── */}
      <div className='activity-row'>
        {/* Recent Transactions */}
        <div className='activity-card'>
          <h3 className='activity-title'>Recent Transactions</h3>
          {stats?.recentTransactions?.length > 0 ? (
            <div className='activity-table'>
              <div className='activity-header'>
                <span>User</span>
                <span>Amount</span>
                <span>Type</span>
                <span>Status</span>
              </div>
              {stats.recentTransactions.map(txn => (
                <div key={txn._id} className='activity-row-item'>
                  <span className='act-user'>
                    {txn.userId?.firstName
                      ? `${txn.userId.firstName} ${txn.userId.lastName}`
                      : 'Unknown'}
                  </span>
                  <span className='act-amount'>₦{(txn.amount || 0).toLocaleString()}</span>
                  <span className='act-type'>{txn.type || txn.paymentMethod || '—'}</span>
                  <span
                    className='act-status'
                    style={{ color: STATUS_COLOR[txn.status] || '#6b7280' }}
                  >
                    {txn.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className='activity-empty'>No transactions yet</div>
          )}
        </div>

        {/* Recent Service Requests */}
        <div className='activity-card'>
          <h3 className='activity-title'>Recent Service Requests</h3>
          {stats?.recentServiceRequests?.length > 0 ? (
            <div className='activity-table'>
              <div className='activity-header'>
                <span>Title</span>
                <span>Category</span>
                <span>Budget</span>
                <span>Status</span>
              </div>
              {stats.recentServiceRequests.map(sr => (
                <div key={sr._id} className='activity-row-item'>
                  <span className='act-user' title={sr.title}>
                    {sr.title?.length > 28 ? sr.title.slice(0, 28) + '…' : sr.title || '—'}
                  </span>
                  <span className='act-type'>{sr.category || '—'}</span>
                  <span className='act-amount'>
                    {sr.estimatedBudget ? `₦${sr.estimatedBudget.toLocaleString()}` : '—'}
                  </span>
                  <span
                    className='act-status'
                    style={{ color: STATUS_COLOR[sr.status] || '#6b7280' }}
                  >
                    {sr.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className='activity-empty'>No service requests yet</div>
          )}
        </div>
      </div>

      {/* ── Recent Users ── */}
      <div className='recent-users-card'>
        <h3 className='activity-title'>Recent Users</h3>
        <div className='recent-users-list'>
          {stats?.recentUsers?.map(u => (
            <div key={u._id} className='recent-user-item'>
              <div className='ru-avatar'>
                {u.avatar ? (
                  <img src={u.avatar} alt={u.firstName} />
                ) : (
                  <span>{(u.firstName || u.email || 'U')[0].toUpperCase()}</span>
                )}
              </div>
              <div className='ru-info'>
                <p className='ru-name'>
                  {u.firstName ? `${u.firstName} ${u.lastName}` : u.email}
                </p>
                <p className='ru-role'>{u.role}</p>
              </div>
              <span className={`ru-badge ${u.isVerified ? 'verified' : 'pending'}`}>
                {u.isVerified ? 'Verified' : 'Unverified'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
