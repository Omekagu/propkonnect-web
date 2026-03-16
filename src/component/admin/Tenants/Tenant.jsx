'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'
import {
  Users,
  Home,
  Mail,
  Phone,
  Calendar,
  ChevronDown,
  ChevronUp,
  Search
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

const API = process.env.NEXT_PUBLIC_BACKEND_URL

const s = {
  page: { padding: '1.5rem', fontFamily: 'sans-serif' },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '1.25rem',
    flexWrap: 'wrap',
    gap: 10
  },
  h2: { fontSize: '1.4rem', fontWeight: 700, color: '#111', margin: 0 },
  searchWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    background: '#f9fafb',
    border: '1px solid #e5e7eb',
    borderRadius: 8,
    padding: '7px 12px',
    width: 240
  },
  searchInput: {
    border: 'none',
    background: 'transparent',
    outline: 'none',
    fontSize: 14,
    color: '#111',
    width: '100%'
  },
  statGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
    gap: '0.75rem',
    marginBottom: '1.25rem'
  },
  statCard: {
    background: '#fff',
    borderRadius: 10,
    padding: '1rem',
    boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
    display: 'flex',
    alignItems: 'center',
    gap: 10
  },
  iconBox: bg => ({
    width: 38,
    height: 38,
    borderRadius: 8,
    background: bg,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  }),
  statVal: { fontWeight: 700, fontSize: '1.1rem', color: '#111' },
  statLbl: { fontSize: 11, color: '#6b7280', marginTop: 1 },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    background: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
  },
  th: {
    padding: '10px 14px',
    fontSize: 12,
    fontWeight: 700,
    color: '#6b7280',
    textAlign: 'left',
    background: '#f9fafb',
    borderBottom: '1px solid #e5e7eb'
  },
  td: {
    padding: '12px 14px',
    fontSize: 13,
    color: '#111',
    borderBottom: '1px solid #f3f4f6',
    verticalAlign: 'middle'
  },
  badge: (color, bg) => ({
    display: 'inline-block',
    padding: '2px 8px',
    borderRadius: 20,
    fontSize: 11,
    fontWeight: 600,
    color,
    background: bg
  }),
  btnView: {
    padding: '5px 10px',
    fontSize: 12,
    background: '#eff6ff',
    color: '#2563eb',
    border: 'none',
    borderRadius: 6,
    cursor: 'pointer',
    fontWeight: 600
  },
  detailBox: {
    background: '#f9fafb',
    borderRadius: 8,
    padding: '0.85rem 1rem',
    margin: '0 0 0.5rem',
    fontSize: 13
  },
  detailRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '5px 0',
    borderBottom: '1px solid #e5e7eb'
  },
  detailLabel: { color: '#6b7280', fontWeight: 600 },
  empty: {
    textAlign: 'center',
    padding: '3rem',
    color: '#9ca3af',
    fontSize: 14
  },
  tabRow: { display: 'flex', gap: 6, marginBottom: '1rem', flexWrap: 'wrap' },
  tab: active => ({
    padding: '6px 14px',
    border: 'none',
    borderRadius: 20,
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    background: active ? '#2563eb' : '#f3f4f6',
    color: active ? '#fff' : '#374151'
  })
}

const STATUS_COLORS = {
  active: ['#16a34a', '#f0fdf4'],
  pending: ['#d97706', '#fef3c7'],
  signed: ['#2563eb', '#dbeafe'],
  terminated: ['#6b7280', '#f3f4f6']
}

export default function Tenant ({ title = 'Tenants' }) {
  const { user } = useAuth()
  const [leases, setLeases] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [expanded, setExpanded] = useState(null)

  const isAdmin = [
    'SUPER_ADMIN',
    'SUB_ADMIN',
    'property-admin',
    'sub-property-admin'
  ].includes(user?.role)
  const isOwner = user?.role === 'PROPERTY_OWNER'

  useEffect(() => {
    const endpoint = isAdmin
      ? `${API}/api/leases/landlord` // admins can see all landlord leases; or use a dedicated admin endpoint if available
      : `${API}/api/leases/landlord` // PROPERTY_OWNER also uses landlord endpoint
    axios
      .get(endpoint, { withCredentials: true })
      .then(res => {
        const data = res.data?.leases || res.data?.data || []
        setLeases(data)
      })
      .catch(() => setLeases([]))
      .finally(() => setLoading(false))
  }, [])

  const filtered = leases.filter(l => {
    const tenant = l.tenant || {}
    const name = [tenant.firstName, tenant.lastName]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
    const email = (tenant.email || '').toLowerCase()
    const prop = (l.property?.title || '').toLowerCase()
    const matchSearch =
      !search ||
      name.includes(search.toLowerCase()) ||
      email.includes(search.toLowerCase()) ||
      prop.includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || l.status === statusFilter
    return matchSearch && matchStatus
  })

  const stats = [
    {
      label: 'Total Tenants',
      val: leases.length,
      bg: '#dbeafe',
      color: '#2563eb',
      icon: <Users size={18} color='#2563eb' />
    },
    {
      label: 'Active',
      val: leases.filter(l => l.status === 'active').length,
      bg: '#dcfce7',
      color: '#16a34a',
      icon: <Home size={18} color='#16a34a' />
    },
    {
      label: 'Pending',
      val: leases.filter(l => l.status === 'pending').length,
      bg: '#fef3c7',
      color: '#d97706',
      icon: <Calendar size={18} color='#d97706' />
    },
    {
      label: 'Terminated',
      val: leases.filter(l => l.status === 'terminated').length,
      bg: '#f3f4f6',
      color: '#6b7280',
      icon: <Users size={18} color='#6b7280' />
    }
  ]

  const statuses = ['all', 'active', 'pending', 'signed', 'terminated']

  return (
    <div style={s.page}>
      <div style={s.header}>
        <h2 style={s.h2}>{title} Overview</h2>
        <div style={s.searchWrap}>
          <Search size={14} color='#9ca3af' />
          <input
            style={s.searchInput}
            placeholder='Search tenant, property…'
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div style={s.statGrid}>
        {stats.map(st => (
          <div key={st.label} style={s.statCard}>
            <div style={s.iconBox(st.bg)}>{st.icon}</div>
            <div>
              <div style={s.statVal}>{st.val}</div>
              <div style={s.statLbl}>{st.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={s.tabRow}>
        {statuses.map(st => (
          <button
            key={st}
            style={s.tab(statusFilter === st)}
            onClick={() => setStatusFilter(st)}
          >
            {st.charAt(0).toUpperCase() + st.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <p style={{ color: '#6b7280', fontSize: 14 }}>Loading tenants…</p>
      ) : filtered.length === 0 ? (
        <div style={s.empty}>
          <Users
            size={40}
            opacity={0.3}
            style={{ display: 'block', margin: '0 auto 10px' }}
          />
          <p>No tenants found{search ? ' matching your search' : ''}.</p>
        </div>
      ) : (
        <table style={s.table}>
          <thead>
            <tr>
              <th style={s.th}>Tenant</th>
              <th style={s.th}>Property</th>
              <th style={s.th}>Rent / mo</th>
              <th style={s.th}>Lease Period</th>
              <th style={s.th}>Status</th>
              <th style={s.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(lease => {
              const tenant = lease.tenant || {}
              const prop = lease.property || {}
              const [color, bg] =
                STATUS_COLORS[lease.status] || STATUS_COLORS.pending
              const isOpen = expanded === lease._id
              return (
                <>
                  <tr key={lease._id}>
                    <td style={s.td}>
                      <div style={{ fontWeight: 600 }}>
                        {[tenant.firstName, tenant.lastName]
                          .filter(Boolean)
                          .join(' ') || '—'}
                      </div>
                      <div
                        style={{
                          fontSize: 12,
                          color: '#6b7280',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                          marginTop: 2
                        }}
                      >
                        <Mail size={11} />
                        {tenant.email || '—'}
                      </div>
                      {tenant.phone && (
                        <div
                          style={{
                            fontSize: 12,
                            color: '#6b7280',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                            marginTop: 1
                          }}
                        >
                          <Phone size={11} />
                          {tenant.phone}
                        </div>
                      )}
                    </td>
                    <td style={s.td}>
                      <div style={{ fontWeight: 600 }}>
                        {prop.title || lease.propertyId || '—'}
                      </div>
                      {(prop.address || prop.city) && (
                        <div
                          style={{
                            fontSize: 12,
                            color: '#6b7280',
                            marginTop: 2
                          }}
                        >
                          {[prop.address, prop.city].filter(Boolean).join(', ')}
                        </div>
                      )}
                    </td>
                    <td style={s.td}>
                      {lease.rentAmount
                        ? `N${Number(lease.rentAmount).toLocaleString()}`
                        : '—'}
                    </td>
                    <td style={s.td}>
                      <div>
                        {lease.startDate
                          ? new Date(lease.startDate).toLocaleDateString()
                          : '—'}
                      </div>
                      <div style={{ fontSize: 12, color: '#6b7280' }}>
                        to{' '}
                        {lease.endDate
                          ? new Date(lease.endDate).toLocaleDateString()
                          : 'ongoing'}
                      </div>
                    </td>
                    <td style={s.td}>
                      <span style={s.badge(color, bg)}>
                        {lease.status || 'pending'}
                      </span>
                    </td>
                    <td style={s.td}>
                      <button
                        style={s.btnView}
                        onClick={() => setExpanded(isOpen ? null : lease._id)}
                      >
                        {isOpen ? (
                          <ChevronUp size={13} />
                        ) : (
                          <ChevronDown size={13} />
                        )}{' '}
                        Details
                      </button>
                    </td>
                  </tr>
                  {isOpen && (
                    <tr key={`${lease._id}-detail`}>
                      <td
                        colSpan={6}
                        style={{
                          ...s.td,
                          padding: '0.5rem 1rem 1rem',
                          background: '#fafafa'
                        }}
                      >
                        <div style={s.detailBox}>
                          {[
                            ['Lease ID', lease._id],
                            [
                              'Deposit',
                              lease.depositAmount
                                ? `N${Number(
                                    lease.depositAmount
                                  ).toLocaleString()}`
                                : '—'
                            ],
                            [
                              'Next Payment',
                              lease.nextPaymentDate
                                ? new Date(
                                    lease.nextPaymentDate
                                  ).toLocaleDateString()
                                : '—'
                            ],
                            ['Payment Status', lease.paymentStatus || '—'],
                            ['Notes', lease.notes || '—']
                          ].map(([label, val]) => (
                            <div key={label} style={s.detailRow}>
                              <span style={s.detailLabel}>{label}</span>
                              <span>{val}</span>
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              )
            })}
          </tbody>
        </table>
      )}
    </div>
  )
}
