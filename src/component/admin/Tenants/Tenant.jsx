'use client'

import { Fragment, useState, useEffect } from 'react'
import { dashboard as dashboardApi, leases as leasesApi } from '@/libs/api'
import {
  Users,
  Home,
  Mail,
  Phone,
  Calendar,
  Clock,
  ChevronDown,
  ChevronUp,
  Search,
  BedDouble
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

// ── Styles ──────────────────────────────────────────────────────────────────
const s = {
  page:  { padding: '1.5rem', fontFamily: 'sans-serif' },
  header: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: '1.25rem', flexWrap: 'wrap', gap: 10
  },
  h2: { fontSize: '1.4rem', fontWeight: 700, color: '#111', margin: 0 },
  searchWrap: {
    display: 'flex', alignItems: 'center', gap: 8,
    background: '#f9fafb', border: '1px solid #e5e7eb',
    borderRadius: 8, padding: '7px 12px', width: 240
  },
  searchInput: { border: 'none', background: 'transparent', outline: 'none', fontSize: 14, color: '#111', width: '100%' },
  statGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem', marginBottom: '1.25rem' },
  statCard: { background: '#fff', borderRadius: 10, padding: '1rem', boxShadow: '0 2px 6px rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', gap: 10 },
  iconBox: bg => ({ width: 38, height: 38, borderRadius: 8, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }),
  statVal: { fontWeight: 700, fontSize: '1.1rem', color: '#111' },
  statLbl: { fontSize: 11, color: '#6b7280', marginTop: 1 },
  tabRow: { display: 'flex', gap: 6, marginBottom: '1rem', flexWrap: 'wrap' },
  tab: active => ({
    padding: '6px 14px', border: 'none', borderRadius: 20, fontSize: 13,
    fontWeight: 600, cursor: 'pointer',
    background: active ? '#0B3D28' : '#f3f4f6',
    color: active ? '#C4E53C' : '#374151'
  }),
  filterRow: { display: 'flex', gap: 6, marginBottom: '1rem', flexWrap: 'wrap' },
  filterBtn: active => ({
    padding: '5px 12px', border: 'none', borderRadius: 20, fontSize: 12,
    fontWeight: 600, cursor: 'pointer',
    background: active ? '#e0f2fe' : '#f3f4f6',
    color: active ? '#0369a1' : '#374151'
  }),
  table: { width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 12, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  th: { padding: '10px 14px', fontSize: 12, fontWeight: 700, color: '#6b7280', textAlign: 'left', background: '#f9fafb', borderBottom: '1px solid #e5e7eb' },
  td: { padding: '12px 14px', fontSize: 13, color: '#111', borderBottom: '1px solid #f3f4f6', verticalAlign: 'middle' },
  badge: (color, bg) => ({ display: 'inline-block', padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 600, color, background: bg }),
  cdBadge: (col, bg) => ({ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 600, color: col, background: bg }),
  btnView: { padding: '5px 10px', fontSize: 12, background: '#eff6ff', color: '#2563eb', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600 },
  detailBox: { background: '#f9fafb', borderRadius: 8, padding: '0.85rem 1rem', margin: '0 0 0.5rem', fontSize: 13 },
  detailRow: { display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid #e5e7eb' },
  detailLabel: { color: '#6b7280', fontWeight: 600 },
  empty: { textAlign: 'center', padding: '3rem', color: '#9ca3af', fontSize: 14 }
}

const LEASE_STATUS_COLORS = {
  active:     ['#16a34a', '#f0fdf4'],
  pending:    ['#d97706', '#fef3c7'],
  signed:     ['#2563eb', '#dbeafe'],
  terminated: ['#6b7280', '#f3f4f6']
}

const BOOKING_STATUS_COLORS = {
  confirmed:    ['#2563eb', '#dbeafe'],
  active:       ['#16a34a', '#f0fdf4'],
  checked_out:  ['#6b7280', '#f3f4f6'],
  pending_payment: ['#d97706', '#fef3c7']
}

function fmt (n, currency = 'NGN') {
  if (!n) return '—'
  return new Intl.NumberFormat('en-NG', { style: 'currency', currency, maximumFractionDigits: 0 }).format(n)
}

function fmtDate (d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function CountdownDot ({ days, label }) {
  if (days == null) return <span style={{ color: '#9ca3af', fontSize: 11 }}>—</span>
  const [col, bg] = days <= 0
    ? ['#dc2626', '#fef2f2']
    : days <= 3
      ? ['#dc2626', '#fee2e2']
      : days <= 7
        ? ['#d97706', '#fef3c7']
        : ['#2563eb', '#dbeafe']
  const text = days <= 0 ? `${Math.abs(days)}d overdue` : `${days}d`
  return <span style={s.cdBadge(col, bg)}><Clock size={10} />{text}{label ? ` · ${label}` : ''}</span>
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function Tenant ({ title = 'Tenants' }) {
  const { user } = useAuth()
  const [view, setView]         = useState('leases')   // 'leases' | 'guests'
  const [leases, setLeases]     = useState([])
  const [bookings, setBookings] = useState([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [expanded, setExpanded] = useState(null)

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null
    if (!token) { setLoading(false); return }

    Promise.all([
      dashboardApi.getTenants(),
      leasesApi.getLandlord().catch(() => ({ data: { leases: [] } }))
    ])
      .then(([tenRes, leaseRes]) => {
        // Prefer the richer /dashboard/tenants data; fallback to /leases/landlord
        const tl = tenRes.data?.leases || []
        const tb = tenRes.data?.bookings || []
        // Merge with leases/landlord for any that may not be in dashboard
        const fallback = leaseRes.data?.leases || leaseRes.data?.data || []
        const merged = tl.length ? tl : fallback
        setLeases(merged)
        setBookings(tb)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  // ── Filter ────────────────────────────────────────────────────────────────
  const filterRows = (rows, nameKey) => rows.filter(row => {
    const person = row[nameKey] || {}
    const name = [person.firstName, person.lastName].filter(Boolean).join(' ').toLowerCase()
    const email = (person.email || row.guestEmail || '').toLowerCase()
    const prop = (row.property?.title || '').toLowerCase()
    const matchSearch = !search || name.includes(search.toLowerCase()) || email.includes(search.toLowerCase()) || prop.includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || row.status === statusFilter
    return matchSearch && matchStatus
  })

  const filteredLeases   = filterRows(leases,   'tenant')
  const filteredBookings = filterRows(bookings,  'guest')

  // ── Stats ─────────────────────────────────────────────────────────────────
  const stats = [
    { label: 'Lease Tenants', val: leases.length, bg: '#dbeafe', icon: <Users size={18} color='#2563eb' /> },
    { label: 'Active Leases', val: leases.filter(l => l.status === 'active').length, bg: '#dcfce7', icon: <Home size={18} color='#16a34a' /> },
    { label: 'Current Guests', val: bookings.filter(b => b.isActive).length, bg: '#fef3c7', icon: <BedDouble size={18} color='#d97706' /> },
    { label: 'Total Bookings', val: bookings.length, bg: '#f3e8ff', icon: <Calendar size={18} color='#7c3aed' /> }
  ]

  const leaseStatuses   = ['all', 'active', 'pending', 'signed', 'terminated']
  const bookingStatuses = ['all', 'confirmed', 'active', 'checked_out']

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={s.page}>
      <div style={s.header}>
        <h2 style={s.h2}>{title}</h2>
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

      {/* Stats */}
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

      {/* View tabs */}
      <div style={s.tabRow}>
        <button style={s.tab(view === 'leases')} onClick={() => { setView('leases'); setStatusFilter('all') }}>
          Lease Tenants ({leases.length})
        </button>
        <button style={s.tab(view === 'guests')} onClick={() => { setView('guests'); setStatusFilter('all') }}>
          Booking Guests ({bookings.length})
        </button>
      </div>

      {/* Status filter */}
      <div style={s.filterRow}>
        {(view === 'leases' ? leaseStatuses : bookingStatuses).map(st => (
          <button key={st} style={s.filterBtn(statusFilter === st)} onClick={() => setStatusFilter(st)}>
            {st.charAt(0).toUpperCase() + st.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <p style={{ color: '#6b7280', fontSize: 14 }}>Loading…</p>
      ) : view === 'leases' ? (
        <LeasesTable rows={filteredLeases} expanded={expanded} setExpanded={setExpanded} s={s} />
      ) : (
        <GuestsTable rows={filteredBookings} expanded={expanded} setExpanded={setExpanded} s={s} />
      )}
    </div>
  )
}

// ── Leases Table ──────────────────────────────────────────────────────────────
function LeasesTable ({ rows, expanded, setExpanded, s }) {
  if (!rows.length) return (
    <div style={s.empty}>
      <Users size={40} opacity={0.3} style={{ display: 'block', margin: '0 auto 10px' }} />
      <p>No lease tenants found.</p>
    </div>
  )
  return (
    <table style={s.table}>
      <thead>
        <tr>
          <th style={s.th}>Tenant</th>
          <th style={s.th}>Property</th>
          <th style={s.th}>Rent</th>
          <th style={s.th}>Lease Period</th>
          <th style={s.th}>Next Due</th>
          <th style={s.th}>Status</th>
          <th style={s.th}></th>
        </tr>
      </thead>
      <tbody>
        {rows.map(lease => {
          const tenant = lease.tenant || {}
          const prop   = lease.property || {}
          const [color, bg] = LEASE_STATUS_COLORS[lease.status] || LEASE_STATUS_COLORS.pending
          const isOpen = expanded === lease._id
          return (
            <Fragment key={lease._id}>
              <tr>
                <td style={s.td}>
                  <div style={{ fontWeight: 600 }}>{[tenant.firstName, tenant.lastName].filter(Boolean).join(' ') || '—'}</div>
                  <div style={{ fontSize: 12, color: '#6b7280', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                    <Mail size={11} />{tenant.email || '—'}
                  </div>
                  {tenant.phone && (
                    <div style={{ fontSize: 12, color: '#6b7280', display: 'flex', alignItems: 'center', gap: 4, marginTop: 1 }}>
                      <Phone size={11} />{tenant.phone}
                    </div>
                  )}
                </td>
                <td style={s.td}>
                  <div style={{ fontWeight: 600 }}>{prop.title || '—'}</div>
                  {(prop.address || prop.city) && (
                    <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>{[prop.address, prop.city].filter(Boolean).join(', ')}</div>
                  )}
                </td>
                <td style={s.td}>{fmt(lease.rentAmount)}</td>
                <td style={s.td}>
                  <div>{fmtDate(lease.startDate)}</div>
                  <div style={{ fontSize: 12, color: '#6b7280' }}>to {fmtDate(lease.endDate)}</div>
                </td>
                <td style={s.td}>
                  {lease.nextDueDate ? (
                    <>
                      <div style={{ fontSize: 12 }}>{fmtDate(lease.nextDueDate)}</div>
                      <CountdownDot days={lease.daysUntilDue} />
                    </>
                  ) : (
                    <span style={{ color: '#9ca3af', fontSize: 12 }}>—</span>
                  )}
                </td>
                <td style={s.td}><span style={s.badge(color, bg)}>{lease.status || 'pending'}</span></td>
                <td style={s.td}>
                  <button style={s.btnView} onClick={() => setExpanded(isOpen ? null : lease._id)}>
                    {isOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />} Details
                  </button>
                </td>
              </tr>
              {isOpen && (
                <tr>
                  <td colSpan={7} style={{ ...s.td, padding: '0.5rem 1rem 1rem', background: '#fafafa' }}>
                    <div style={s.detailBox}>
                      {[
                        ['Lease ID',       lease._id],
                        ['Total Amount',   fmt(lease.totalLeaseAmount)],
                        ['Deposit',        fmt(lease.depositAmount)],
                        ['Next Due',       fmtDate(lease.nextDueDate)],
                        ['Due Amount',     fmt(lease.nextDueAmount)],
                        ['Days Until Due', lease.daysUntilDue != null ? `${lease.daysUntilDue} days` : '—'],
                        ['Lease Ends In',  lease.leaseEndDays != null ? `${lease.leaseEndDays} days` : '—'],
                        ['Payment Type',   lease.paymentType || '—'],
                        ['Overdue',        lease.isOverdue ? 'Yes' : 'No']
                      ].map(([label, val]) => (
                        <div key={label} style={s.detailRow}>
                          <span style={s.detailLabel}>{label}</span>
                          <span>{val}</span>
                        </div>
                      ))}
                    </div>
                    {lease.installments?.length > 0 && (
                      <div style={{ marginTop: 8 }}>
                        <div style={{ fontWeight: 600, fontSize: 12, color: '#374151', marginBottom: 6 }}>Payment Schedule</div>
                        <table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse' }}>
                          <thead>
                            <tr>{['Due Date', 'Amount', 'Status', 'Paid At'].map(h => (
                              <th key={h} style={{ textAlign: 'left', padding: '4px 8px', color: '#6b7280', fontWeight: 600, borderBottom: '1px solid #e5e7eb' }}>{h}</th>
                            ))}</tr>
                          </thead>
                          <tbody>
                            {lease.installments.map((inst, i) => {
                              const [ic, ib] = inst.status === 'paid' ? ['#16a34a', '#f0fdf4'] : inst.status === 'overdue' ? ['#dc2626', '#fef2f2'] : ['#d97706', '#fef3c7']
                              return (
                                <tr key={i}>
                                  <td style={{ padding: '4px 8px' }}>{fmtDate(inst.dueDate)}</td>
                                  <td style={{ padding: '4px 8px' }}>{fmt(inst.amount)}</td>
                                  <td style={{ padding: '4px 8px' }}><span style={s.badge(ic, ib)}>{inst.status}</span></td>
                                  <td style={{ padding: '4px 8px' }}>{inst.paidAt ? fmtDate(inst.paidAt) : '—'}</td>
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </td>
                </tr>
              )}
            </Fragment>
          )
        })}
      </tbody>
    </table>
  )
}

// ── Guests Table (Bookings) ───────────────────────────────────────────────────
function GuestsTable ({ rows, expanded, setExpanded, s }) {
  if (!rows.length) return (
    <div style={s.empty}>
      <BedDouble size={40} opacity={0.3} style={{ display: 'block', margin: '0 auto 10px' }} />
      <p>No booking guests found.</p>
    </div>
  )
  return (
    <table style={s.table}>
      <thead>
        <tr>
          <th style={s.th}>Guest</th>
          <th style={s.th}>Property</th>
          <th style={s.th}>Stay</th>
          <th style={s.th}>Amount</th>
          <th style={s.th}>Countdown</th>
          <th style={s.th}>Status</th>
          <th style={s.th}></th>
        </tr>
      </thead>
      <tbody>
        {rows.map(bk => {
          const guest = bk.guest || {}
          const prop  = bk.property || {}
          const [color, bg] = BOOKING_STATUS_COLORS[bk.status] || ['#6b7280', '#f3f4f6']
          const isOpen = expanded === bk._id

          // Countdown label
          let cdDays, cdLabel
          if (bk.isPast) {
            cdDays  = bk.daysToCheckOut   // negative
            cdLabel = 'checked out'
          } else if (bk.isActive) {
            cdDays  = bk.daysToCheckOut
            cdLabel = 'left'
          } else {
            cdDays  = bk.daysToCheckIn
            cdLabel = 'to check-in'
          }

          const guestName = [guest.firstName, guest.lastName].filter(Boolean).join(' ') || bk.guestName || '—'

          return (
            <Fragment key={bk._id}>
              <tr>
                <td style={s.td}>
                  <div style={{ fontWeight: 600 }}>{guestName}</div>
                  <div style={{ fontSize: 12, color: '#6b7280', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                    <Mail size={11} />{guest.email || bk.guestEmail || '—'}
                  </div>
                  {(guest.phone || bk.guestPhone) && (
                    <div style={{ fontSize: 12, color: '#6b7280', display: 'flex', alignItems: 'center', gap: 4, marginTop: 1 }}>
                      <Phone size={11} />{guest.phone || bk.guestPhone}
                    </div>
                  )}
                </td>
                <td style={s.td}>
                  <div style={{ fontWeight: 600 }}>{prop.title || '—'}</div>
                  {(prop.address || prop.city) && (
                    <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>{[prop.address, prop.city].filter(Boolean).join(', ')}</div>
                  )}
                  {bk.roomTypeId && <div style={{ fontSize: 11, color: '#7c3aed', marginTop: 2 }}>Room: {bk.roomTypeId}</div>}
                </td>
                <td style={s.td}>
                  <div>{fmtDate(bk.checkIn)}</div>
                  <div style={{ fontSize: 12, color: '#6b7280' }}>to {fmtDate(bk.checkOut)}</div>
                  <div style={{ fontSize: 11, color: '#9ca3af' }}>{bk.nights} night{bk.nights !== 1 ? 's' : ''} · {bk.guestCount || 1} guest{bk.guestCount > 1 ? 's' : ''}</div>
                </td>
                <td style={s.td}>
                  <div style={{ fontWeight: 600 }}>{fmt(bk.amount, bk.currency)}</div>
                  {bk.ownerReceives > 0 && (
                    <div style={{ fontSize: 11, color: '#16a34a', marginTop: 2 }}>You receive: {fmt(bk.ownerReceives, bk.currency)}</div>
                  )}
                  {bk.cautionFee > 0 && (
                    <div style={{ fontSize: 11, color: '#d97706', marginTop: 1 }}>Caution: {fmt(bk.cautionFee, bk.currency)} ({bk.cautionStatus})</div>
                  )}
                </td>
                <td style={s.td}><CountdownDot days={cdDays} label={cdLabel} /></td>
                <td style={s.td}><span style={s.badge(color, bg)}>{bk.status}</span></td>
                <td style={s.td}>
                  <button style={s.btnView} onClick={() => setExpanded(isOpen ? null : bk._id)}>
                    {isOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />} Details
                  </button>
                </td>
              </tr>
              {isOpen && (
                <tr key={`${bk._id}-d`}>
                  <td colSpan={7} style={{ ...s.td, padding: '0.5rem 1rem 1rem', background: '#fafafa' }}>
                    <div style={s.detailBox}>
                      {[
                        ['Booking ID',     bk._id],
                        ['Check-In',       fmtDate(bk.checkIn)],
                        ['Check-Out',      fmtDate(bk.checkOut)],
                        ['Nights',         bk.nights],
                        ['Guests',         bk.guestCount || 1],
                        ['Total Paid',     fmt(bk.amount, bk.currency)],
                        ['Rent Amount',    fmt(bk.rentAmount, bk.currency)],
                        ['Caution Fee',    fmt(bk.cautionFee, bk.currency)],
                        ['You Receive',    fmt(bk.ownerReceives, bk.currency)],
                        ['Caution Status', bk.cautionStatus || '—'],
                        ['Status',         bk.status],
                        ['Days to Check-In',  bk.daysToCheckIn != null ? `${bk.daysToCheckIn}d` : '—'],
                        ['Days to Check-Out', bk.daysToCheckOut != null ? `${bk.daysToCheckOut}d` : '—']
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
            </Fragment>
          )
        })}
      </tbody>
    </table>
  )
}
