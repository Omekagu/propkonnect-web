'use client'

import React, { useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area
} from 'recharts'
import { FiRefreshCw, FiDownload, FiTrendingUp, FiUsers, FiHome, FiTool, FiLock } from 'react-icons/fi'
import { useAuth } from '@/hooks/useAuth'
import './Report.scss'

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL

const TABS = [
  { key: 'overview', label: 'Overview', icon: FiTrendingUp },
  { key: 'users', label: 'Users', icon: FiUsers },
  { key: 'revenue', label: 'Revenue', icon: FiTrendingUp },
  { key: 'properties', label: 'Properties', icon: FiHome },
  { key: 'services', label: 'Services', icon: FiTool }
]

const PIE_COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ec4899', '#06b6d4']

function StatBox ({ label, value, sub, color = '#3b82f6' }) {
  return (
    <div className='rpt-stat-box'>
      <p className='rpt-stat-value' style={{ color }}>{value}</p>
      <p className='rpt-stat-label'>{label}</p>
      {sub && <p className='rpt-stat-sub'>{sub}</p>}
    </div>
  )
}

const ADMIN_ROLES = ['super-admin', 'sub-admin', 'property-admin', 'artisan-admin', 'sub-property-admin', 'sub-artisan-admin', 'support-admin']

export default function Report () {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')

  const isAdmin = ADMIN_ROLES.includes(user?.role)
  const token =
    typeof window !== 'undefined' ? localStorage.getItem('authToken') : null

  const fetchStats = useCallback(async () => {
    if (!isAdmin || !token) { setLoading(false); return }
    setLoading(true)
    setError(null)
    try {
      const res = await axios.get(`${API_URL}/api/user/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setStats(res.data.stats)
    } catch {
      setError('Failed to load report data.')
    } finally {
      setLoading(false)
    }
  }, [token, isAdmin])

  useEffect(() => { fetchStats() }, [fetchStats])

  if (!isAdmin) {
    return (
      <div className='rpt-loader'>
        <FiLock size={32} style={{ color: '#94a3b8', marginBottom: 12 }} />
        <p style={{ color: '#64748b', fontSize: 14 }}>Platform reports are only available to administrators.</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className='rpt-loader'>
        <div className='loader-spinner' />
        <p>Loading reports…</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className='rpt-error'>
        <p>{error}</p>
        <button onClick={fetchStats}><FiRefreshCw /> Retry</button>
      </div>
    )
  }

  const roleData = Object.entries(stats?.usersByRole || {})
    .filter(([k]) => k !== 'undefined' && k !== 'unknown')
    .map(([name, value]) => ({ name, value }))

  const artisanPieData = [
    { name: 'Verified', value: stats?.verifiedArtisans ?? 0 },
    { name: 'Pending', value: stats?.pendingArtisans ?? 0 }
  ]

  const propertiesPieData = [
    { name: 'Available', value: stats?.activeProperties ?? 0 },
    { name: 'Other', value: Math.max(0, (stats?.totalProperties ?? 0) - (stats?.activeProperties ?? 0)) }
  ]

  const servicesPieData = [
    { name: 'Open/In-Progress', value: stats?.openServiceRequests ?? 0 },
    { name: 'Closed', value: Math.max(0, (stats?.totalServiceRequests ?? 0) - (stats?.openServiceRequests ?? 0)) }
  ]

  return (
    <div className='reports-page'>
      {/* ── Header ── */}
      <div className='rpt-header'>
        <div>
          <h1>Reports &amp; Analytics</h1>
          <p className='rpt-date'>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className='rpt-header-actions'>
          <button className='rpt-btn-icon' onClick={fetchStats} title='Refresh'>
            <FiRefreshCw size={16} />
          </button>
          <button className='rpt-btn' onClick={() => window.print()} title='Print / Export'>
            <FiDownload size={15} /> Export
          </button>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className='rpt-tabs'>
        {TABS.map(t => (
          <button
            key={t.key}
            className={`rpt-tab ${activeTab === t.key ? 'active' : ''}`}
            onClick={() => setActiveTab(t.key)}
          >
            <t.icon size={14} /> {t.label}
          </button>
        ))}
      </div>

      {/* ── Overview Tab ── */}
      {activeTab === 'overview' && (
        <div className='rpt-section'>
          <div className='rpt-stats-grid'>
            <StatBox label='Total Users' value={(stats?.totalUsers ?? 0).toLocaleString()} sub={`+${stats?.newUsersThisMonth ?? 0} this month`} color='#10b981' />
            <StatBox label='Total Properties' value={(stats?.totalProperties ?? 0).toLocaleString()} sub={`${stats?.activeProperties ?? 0} available`} color='#3b82f6' />
            <StatBox label='Total Revenue' value={`₦${(stats?.totalRevenue ?? 0).toLocaleString()}`} sub={`₦${(stats?.revenueThisMonth ?? 0).toLocaleString()} this month`} color='#8b5cf6' />
            <StatBox label='Service Requests' value={(stats?.totalServiceRequests ?? 0).toLocaleString()} sub={`${stats?.openServiceRequests ?? 0} active`} color='#f59e0b' />
            <StatBox label='Total Artisans' value={(stats?.totalArtisans ?? 0).toLocaleString()} sub={`${stats?.verifiedArtisans ?? 0} verified`} color='#ec4899' />
            <StatBox label='Transactions' value={(stats?.totalTransactions ?? 0).toLocaleString()} color='#06b6d4' />
          </div>

          <div className='rpt-charts-row'>
            <div className='rpt-chart-card rpt-wide'>
              <h3>Revenue Trend (Last 6 Months)</h3>
              {stats?.monthlyTrend?.length > 0 ? (
                <ResponsiveContainer width='100%' height={220}>
                  <AreaChart data={stats.monthlyTrend}>
                    <defs>
                      <linearGradient id='revGrad' x1='0' y1='0' x2='0' y2='1'>
                        <stop offset='5%' stopColor='#8b5cf6' stopOpacity={0.35} />
                        <stop offset='95%' stopColor='#8b5cf6' stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray='3 3' stroke='#f0f4f8' />
                    <XAxis dataKey='month' tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `₦${(v / 1000).toFixed(0)}k`} />
                    <Tooltip formatter={v => `₦${v.toLocaleString()}`} />
                    <Area type='monotone' dataKey='revenue' stroke='#8b5cf6' strokeWidth={2} fill='url(#revGrad)' name='Revenue' />
                  </AreaChart>
                </ResponsiveContainer>
              ) : <p className='rpt-empty'>No revenue data yet</p>}
            </div>

            <div className='rpt-chart-card rpt-narrow'>
              <h3>Users by Role</h3>
              {roleData.length > 0 ? (
                <ResponsiveContainer width='100%' height={220}>
                  <PieChart>
                    <Pie data={roleData} cx='50%' cy='50%' innerRadius={50} outerRadius={80} paddingAngle={3} dataKey='value'>
                      {roleData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                    <Legend iconSize={10} wrapperStyle={{ fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : <p className='rpt-empty'>No data</p>}
            </div>
          </div>
        </div>
      )}

      {/* ── Users Tab ── */}
      {activeTab === 'users' && (
        <div className='rpt-section'>
          <div className='rpt-stats-grid'>
            <StatBox label='Total Users' value={(stats?.totalUsers ?? 0).toLocaleString()} color='#3b82f6' />
            <StatBox label='Verified Users' value={(stats?.verifiedUsers ?? 0).toLocaleString()} color='#10b981' />
            <StatBox label='New This Month' value={(stats?.newUsersThisMonth ?? 0).toLocaleString()} color='#8b5cf6' />
            <StatBox
              label='Growth vs Last Month'
              value={`${(stats?.userGrowth ?? 0) >= 0 ? '+' : ''}${stats?.userGrowth ?? 0}%`}
              color={(stats?.userGrowth ?? 0) >= 0 ? '#10b981' : '#ef4444'}
            />
          </div>

          <div className='rpt-charts-row'>
            <div className='rpt-chart-card rpt-narrow'>
              <h3>Users by Role</h3>
              {roleData.length > 0 ? (
                <ResponsiveContainer width='100%' height={260}>
                  <BarChart data={roleData} layout='vertical'>
                    <CartesianGrid strokeDasharray='3 3' stroke='#f0f4f8' horizontal={false} />
                    <XAxis type='number' tick={{ fontSize: 12 }} />
                    <YAxis type='category' dataKey='name' tick={{ fontSize: 12 }} width={90} />
                    <Tooltip />
                    <Bar dataKey='value' name='Users' radius={[0, 4, 4, 0]}>
                      {roleData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : <p className='rpt-empty'>No data</p>}
            </div>

            <div className='rpt-chart-card rpt-narrow'>
              <h3>Artisan Verification Status</h3>
              <ResponsiveContainer width='100%' height={260}>
                <PieChart>
                  <Pie data={artisanPieData} cx='50%' cy='50%' outerRadius={90} paddingAngle={3} dataKey='value'>
                    <Cell fill='#10b981' />
                    <Cell fill='#f59e0b' />
                  </Pie>
                  <Tooltip />
                  <Legend iconSize={10} wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* ── Revenue Tab ── */}
      {activeTab === 'revenue' && (
        <div className='rpt-section'>
          <div className='rpt-stats-grid'>
            <StatBox label='Total Revenue' value={`₦${(stats?.totalRevenue ?? 0).toLocaleString()}`} color='#8b5cf6' />
            <StatBox label='Revenue This Month' value={`₦${(stats?.revenueThisMonth ?? 0).toLocaleString()}`} color='#10b981' />
            <StatBox label='Total Transactions' value={(stats?.totalTransactions ?? 0).toLocaleString()} color='#3b82f6' />
          </div>

          <div className='rpt-chart-card' style={{ marginTop: 20 }}>
            <h3>Monthly Revenue (Last 6 Months)</h3>
            {stats?.monthlyTrend?.length > 0 ? (
              <ResponsiveContainer width='100%' height={280}>
                <BarChart data={stats.monthlyTrend}>
                  <CartesianGrid strokeDasharray='3 3' stroke='#f0f4f8' />
                  <XAxis dataKey='month' tick={{ fontSize: 13 }} />
                  <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `₦${(v / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={v => `₦${v.toLocaleString()}`} />
                  <Bar dataKey='revenue' name='Revenue' fill='#8b5cf6' radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : <p className='rpt-empty'>No revenue data yet</p>}
          </div>

          <div className='rpt-chart-card' style={{ marginTop: 20 }}>
            <h3>Transaction Volume (Last 6 Months)</h3>
            {stats?.monthlyTrend?.length > 0 ? (
              <ResponsiveContainer width='100%' height={220}>
                <LineChart data={stats.monthlyTrend}>
                  <CartesianGrid strokeDasharray='3 3' stroke='#f0f4f8' />
                  <XAxis dataKey='month' tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Line type='monotone' dataKey='transactions' stroke='#3b82f6' strokeWidth={2} dot={{ r: 4 }} name='Transactions' />
                </LineChart>
              </ResponsiveContainer>
            ) : <p className='rpt-empty'>No data yet</p>}
          </div>
        </div>
      )}

      {/* ── Properties Tab ── */}
      {activeTab === 'properties' && (
        <div className='rpt-section'>
          <div className='rpt-stats-grid'>
            <StatBox label='Total Properties' value={(stats?.totalProperties ?? 0).toLocaleString()} color='#3b82f6' />
            <StatBox label='Available' value={(stats?.activeProperties ?? 0).toLocaleString()} color='#10b981' />
            <StatBox
              label='Archived / Other'
              value={Math.max(0, (stats?.totalProperties ?? 0) - (stats?.activeProperties ?? 0)).toLocaleString()}
              color='#94a3b8'
            />
          </div>

          <div className='rpt-charts-row' style={{ marginTop: 20 }}>
            <div className='rpt-chart-card rpt-narrow'>
              <h3>Property Status Breakdown</h3>
              <ResponsiveContainer width='100%' height={260}>
                <PieChart>
                  <Pie data={propertiesPieData} cx='50%' cy='50%' outerRadius={90} paddingAngle={3} dataKey='value'>
                    <Cell fill='#3b82f6' />
                    <Cell fill='#e2e8f0' />
                  </Pie>
                  <Tooltip />
                  <Legend iconSize={10} wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className='rpt-chart-card rpt-narrow rpt-callout'>
              <h3>Availability Rate</h3>
              <p className='rpt-big-number' style={{ color: '#3b82f6' }}>
                {(stats?.totalProperties ?? 0) > 0
                  ? `${Math.round(((stats?.activeProperties ?? 0) / stats.totalProperties) * 100)}%`
                  : '—'}
              </p>
              <p className='rpt-callout-sub'>of all properties are currently available for rent or purchase</p>
            </div>
          </div>
        </div>
      )}

      {/* ── Services Tab ── */}
      {activeTab === 'services' && (
        <div className='rpt-section'>
          <div className='rpt-stats-grid'>
            <StatBox label='Total Service Requests' value={(stats?.totalServiceRequests ?? 0).toLocaleString()} color='#f59e0b' />
            <StatBox label='Active (Open / In Progress)' value={(stats?.openServiceRequests ?? 0).toLocaleString()} color='#3b82f6' />
            <StatBox
              label='Completed'
              value={Math.max(0, (stats?.totalServiceRequests ?? 0) - (stats?.openServiceRequests ?? 0)).toLocaleString()}
              color='#10b981'
            />
            <StatBox label='Total Artisans' value={(stats?.totalArtisans ?? 0).toLocaleString()} sub={`${stats?.pendingArtisans ?? 0} awaiting approval`} color='#8b5cf6' />
          </div>

          <div className='rpt-charts-row' style={{ marginTop: 20 }}>
            <div className='rpt-chart-card rpt-narrow'>
              <h3>Service Request Status</h3>
              <ResponsiveContainer width='100%' height={260}>
                <PieChart>
                  <Pie data={servicesPieData} cx='50%' cy='50%' outerRadius={90} paddingAngle={3} dataKey='value'>
                    <Cell fill='#3b82f6' />
                    <Cell fill='#10b981' />
                  </Pie>
                  <Tooltip />
                  <Legend iconSize={10} wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className='rpt-chart-card rpt-narrow'>
              <h3>Artisan Verification</h3>
              <ResponsiveContainer width='100%' height={260}>
                <BarChart data={[
                  { label: 'Total', value: stats?.totalArtisans ?? 0 },
                  { label: 'Verified', value: stats?.verifiedArtisans ?? 0 },
                  { label: 'Pending', value: stats?.pendingArtisans ?? 0 }
                ]}>
                  <CartesianGrid strokeDasharray='3 3' stroke='#f0f4f8' />
                  <XAxis dataKey='label' tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey='value' name='Count' radius={[4, 4, 0, 0]}>
                    <Cell fill='#8b5cf6' />
                    <Cell fill='#10b981' />
                    <Cell fill='#f59e0b' />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
