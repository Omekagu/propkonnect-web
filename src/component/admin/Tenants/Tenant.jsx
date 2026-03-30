'use client'

import { Fragment, useState, useEffect } from 'react'
import { dashboard as dashboardApi, leases as leasesApi } from '@/libs/api'
import {
  Users, Home, Mail, Phone, Calendar, Clock, BedDouble,
  ChevronDown, ChevronUp, Search, RefreshCw, MapPin,
  AlertCircle, CheckCircle, XCircle
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import './Tenant.scss'

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmt = (n, currency = 'NGN') => {
  if (!n) return '—'
  return new Intl.NumberFormat('en-NG', { style: 'currency', currency, maximumFractionDigits: 0 }).format(n)
}

const fmtDate = d => {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

const LEASE_STATUS = {
  active:     'tn-s-active',
  pending:    'tn-s-pending',
  signed:     'tn-s-signed',
  terminated: 'tn-s-terminated'
}

const BOOKING_STATUS = {
  confirmed:       'tn-s-signed',
  active:          'tn-s-active',
  checked_out:     'tn-s-terminated',
  pending_payment: 'tn-s-pending'
}

function CountdownBadge ({ days, label }) {
  if (days == null) return <span className='tn-cd-none'>—</span>
  const cls = days <= 0 ? 'overdue' : days <= 3 ? 'urgent' : days <= 7 ? 'warn' : 'ok'
  const text = days <= 0 ? `${Math.abs(days)}d overdue` : `${days}d${label ? ` · ${label}` : ''}`
  return <span className={`tn-cd ${cls}`}><Clock size={10} />{text}</span>
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function Tenant ({ title = 'Tenants' }) {
  const { user } = useAuth()
  const [view, setView]         = useState('leases')
  const [leases, setLeases]     = useState([])
  const [bookings, setBookings] = useState([])
  const [loading, setLoading]   = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError]       = useState(null)
  const [search, setSearch]     = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [expanded, setExpanded] = useState(null)

  const fetchData = async (silent = false) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null
    if (!token) { setLoading(false); return }
    if (!silent) setLoading(true)
    else setRefreshing(true)
    setError(null)
    try {
      const [tenRes, leaseRes] = await Promise.all([
        dashboardApi.getTenants(),
        leasesApi.getLandlord().catch(() => ({ data: { leases: [] } }))
      ])
      const tl = tenRes.data?.leases || []
      const tb = tenRes.data?.bookings || []
      const fallback = leaseRes.data?.leases || leaseRes.data?.data || []
      setLeases(tl.length ? tl : fallback)
      setBookings(tb)
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to load tenants')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  // ── Filter ────────────────────────────────────────────────────────────────
  const filterRows = (rows, nameKey) => rows.filter(row => {
    const person = row[nameKey] || {}
    const name   = [person.firstName, person.lastName].filter(Boolean).join(' ').toLowerCase()
    const email  = (person.email || row.guestEmail || '').toLowerCase()
    const prop   = (row.property?.title || '').toLowerCase()
    const matchSearch  = !search || name.includes(search.toLowerCase()) || email.includes(search.toLowerCase()) || prop.includes(search.toLowerCase())
    const matchStatus  = statusFilter === 'all' || row.status === statusFilter
    return matchSearch && matchStatus
  })

  const filteredLeases   = filterRows(leases,   'tenant')
  const filteredBookings = filterRows(bookings,  'guest')

  const stats = [
    { lbl: 'Lease Tenants',  val: leases.length,                                cls: 'total',   icon: <Users size={18} /> },
    { lbl: 'Active Leases',  val: leases.filter(l => l.status === 'active').length, cls: 'active',  icon: <Home size={18} /> },
    { lbl: 'Current Guests', val: bookings.filter(b => b.isActive).length,       cls: 'guests',  icon: <BedDouble size={18} /> },
    { lbl: 'Total Bookings', val: bookings.length,                               cls: 'book',    icon: <Calendar size={18} /> }
  ]

  const leaseStatuses   = ['all', 'active', 'pending', 'signed', 'terminated']
  const bookingStatuses = ['all', 'confirmed', 'active', 'checked_out', 'pending_payment']

  return (
    <div className='tn-wrap'>

      {/* Header */}
      <div className='tn-head'>
        <div>
          <h2>{title}</h2>
          <p>Manage lease tenants and booking guests</p>
        </div>
        <div className='tn-head-right'>
          <button className={`tn-icon-btn ${refreshing ? 'spin' : ''}`} onClick={() => fetchData(true)} title='Refresh'>
            <RefreshCw size={15} />
          </button>
          <div className='tn-search'>
            <Search size={13} />
            <input
              placeholder='Search tenant, property…'
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className='tn-alert'>
          <AlertCircle size={14} /> {error}
        </div>
      )}

      {/* Stats */}
      <div className='tn-stats'>
        {stats.map(st => (
          <div key={st.lbl} className='tn-stat'>
            <div className={`tn-stat-icon ${st.cls}`}>{st.icon}</div>
            <div className='tn-stat-body'>
              <div className='tn-stat-val'>{st.val}</div>
              <div className='tn-stat-lbl'>{st.lbl}</div>
            </div>
          </div>
        ))}
      </div>

      {/* View tabs */}
      <div className='tn-tabs'>
        <button className={view === 'leases'  ? 'active' : ''} onClick={() => { setView('leases');  setStatusFilter('all'); setExpanded(null) }}>
          <Users size={13} /> Lease Tenants <span className='tn-tab-count'>{leases.length}</span>
        </button>
        <button className={view === 'guests' ? 'active' : ''} onClick={() => { setView('guests'); setStatusFilter('all'); setExpanded(null) }}>
          <BedDouble size={13} /> Booking Guests <span className='tn-tab-count'>{bookings.length}</span>
        </button>
      </div>

      {/* Status filter */}
      <div className='tn-filter-row'>
        {(view === 'leases' ? leaseStatuses : bookingStatuses).map(st => (
          <button key={st} className={`tn-chip ${statusFilter === st ? 'active' : ''}`}
            onClick={() => setStatusFilter(st)}>
            {st === 'all' ? 'All' : st.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className='tn-state'>
          <div className='tn-spinner' />
          <p>Loading…</p>
        </div>
      ) : view === 'leases' ? (
        <LeasesTable rows={filteredLeases} expanded={expanded} setExpanded={setExpanded} />
      ) : (
        <GuestsTable rows={filteredBookings} expanded={expanded} setExpanded={setExpanded} />
      )}
    </div>
  )
}

// ── Leases Table ──────────────────────────────────────────────────────────────
function LeasesTable ({ rows, expanded, setExpanded }) {
  if (!rows.length) return (
    <div className='tn-empty'>
      <Users size={40} />
      <p>No lease tenants found.</p>
    </div>
  )
  return (
    <div className='tn-table-wrap'>
      <table className='tn-table'>
        <thead>
          <tr>
            <th>Tenant</th>
            <th>Property</th>
            <th>Rent</th>
            <th>Lease Period</th>
            <th>Next Due</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {rows.map(lease => {
            const tenant = lease.tenant || {}
            const prop   = lease.property || {}
            const isOpen = expanded === lease._id
            return (
              <Fragment key={lease._id}>
                <tr className={isOpen ? 'tn-row-open' : ''}>
                  <td>
                    <div className='tn-person'>
                      <div className='tn-av'>
                        {tenant.avatar
                          ? <img src={tenant.avatar} alt='' />
                          : (tenant.firstName?.[0] || '?').toUpperCase()}
                      </div>
                      <div>
                        <div className='tn-name'>{[tenant.firstName, tenant.lastName].filter(Boolean).join(' ') || '—'}</div>
                        <div className='tn-sub'><Mail size={10} /> {tenant.email || '—'}</div>
                        {tenant.phone && <div className='tn-sub'><Phone size={10} /> {tenant.phone}</div>}
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className='tn-name'>{prop.title || '—'}</div>
                    {(prop.address || prop.city) && (
                      <div className='tn-sub'><MapPin size={10} /> {[prop.address, prop.city].filter(Boolean).join(', ')}</div>
                    )}
                  </td>
                  <td className='tn-price'>{fmt(lease.rentAmount)}</td>
                  <td>
                    <div className='tn-date'>{fmtDate(lease.startDate)}</div>
                    <div className='tn-sub'>to {fmtDate(lease.endDate)}</div>
                  </td>
                  <td>
                    {lease.nextDueDate
                      ? <><div className='tn-date'>{fmtDate(lease.nextDueDate)}</div><CountdownBadge days={lease.daysUntilDue} /></>
                      : <span className='tn-none'>—</span>}
                  </td>
                  <td>
                    <span className={`tn-badge ${LEASE_STATUS[lease.status] || 'tn-s-pending'}`}>
                      {lease.status || 'pending'}
                    </span>
                  </td>
                  <td>
                    <button className='tn-expand-btn' onClick={() => setExpanded(isOpen ? null : lease._id)}>
                      {isOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                    </button>
                  </td>
                </tr>
                {isOpen && (
                  <tr className='tn-detail-row'>
                    <td colSpan={7}>
                      <div className='tn-detail'>
                        <div className='tn-detail-grid'>
                          {[
                            ['Total Amount',   fmt(lease.totalLeaseAmount)],
                            ['Deposit',        fmt(lease.depositAmount)],
                            ['Next Due Amount',fmt(lease.nextDueAmount)],
                            ['Days Until Due', lease.daysUntilDue != null ? `${lease.daysUntilDue} days` : '—'],
                            ['Lease Ends In',  lease.leaseEndDays != null ? `${lease.leaseEndDays} days` : '—'],
                            ['Payment Type',   lease.paymentType || '—'],
                            ['Overdue',        lease.isOverdue ? 'Yes' : 'No']
                          ].map(([lbl, val]) => (
                            <div key={lbl} className='tn-detail-item'>
                              <label>{lbl}</label>
                              <p>{val}</p>
                            </div>
                          ))}
                        </div>
                        {lease.installments?.length > 0 && (
                          <div className='tn-installments'>
                            <div className='tn-inst-title'>Payment Schedule</div>
                            <table className='tn-inst-table'>
                              <thead><tr><th>Due Date</th><th>Amount</th><th>Status</th><th>Paid</th></tr></thead>
                              <tbody>
                                {lease.installments.map((inst, i) => {
                                  const cls = inst.status === 'paid' ? 'tn-s-active' : inst.status === 'overdue' ? 'tn-s-terminated' : 'tn-s-pending'
                                  return (
                                    <tr key={i}>
                                      <td>{fmtDate(inst.dueDate)}</td>
                                      <td>{fmt(inst.amount)}</td>
                                      <td><span className={`tn-badge ${cls}`}>{inst.status}</span></td>
                                      <td>{inst.paidAt ? fmtDate(inst.paidAt) : '—'}</td>
                                    </tr>
                                  )
                                })}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

// ── Guests Table ──────────────────────────────────────────────────────────────
function GuestsTable ({ rows, expanded, setExpanded }) {
  if (!rows.length) return (
    <div className='tn-empty'>
      <BedDouble size={40} />
      <p>No booking guests found.</p>
    </div>
  )
  return (
    <div className='tn-table-wrap'>
      <table className='tn-table'>
        <thead>
          <tr>
            <th>Guest</th>
            <th>Property</th>
            <th>Stay</th>
            <th>Amount</th>
            <th>Countdown</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {rows.map(bk => {
            const guest  = bk.guest || {}
            const prop   = bk.property || {}
            const isOpen = expanded === bk._id
            const guestName = [guest.firstName, guest.lastName].filter(Boolean).join(' ') || bk.guestName || '—'

            let cdDays, cdLabel
            if (bk.isPast)        { cdDays = bk.daysToCheckOut; cdLabel = 'checked out' }
            else if (bk.isActive) { cdDays = bk.daysToCheckOut; cdLabel = 'left' }
            else                  { cdDays = bk.daysToCheckIn;  cdLabel = 'to check-in' }

            return (
              <Fragment key={bk._id}>
                <tr className={isOpen ? 'tn-row-open' : ''}>
                  <td>
                    <div className='tn-person'>
                      <div className='tn-av'>
                        {guest.avatar
                          ? <img src={guest.avatar} alt='' />
                          : (guestName[0] || '?').toUpperCase()}
                      </div>
                      <div>
                        <div className='tn-name'>{guestName}</div>
                        <div className='tn-sub'><Mail size={10} /> {guest.email || bk.guestEmail || '—'}</div>
                        {(guest.phone || bk.guestPhone) && (
                          <div className='tn-sub'><Phone size={10} /> {guest.phone || bk.guestPhone}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className='tn-name'>{prop.title || '—'}</div>
                    {(prop.address || prop.city) && (
                      <div className='tn-sub'><MapPin size={10} /> {[prop.address, prop.city].filter(Boolean).join(', ')}</div>
                    )}
                  </td>
                  <td>
                    <div className='tn-date'>{fmtDate(bk.checkIn)}</div>
                    <div className='tn-sub'>to {fmtDate(bk.checkOut)}</div>
                    <div className='tn-sub'>{bk.nights}n · {bk.guestCount || 1} guest{bk.guestCount > 1 ? 's' : ''}</div>
                  </td>
                  <td>
                    <div className='tn-price'>{fmt(bk.amount, bk.currency)}</div>
                    {bk.ownerReceives > 0 && <div className='tn-sub-green'>You get: {fmt(bk.ownerReceives, bk.currency)}</div>}
                    {bk.cautionFee > 0 && <div className='tn-sub-warn'>Caution: {fmt(bk.cautionFee, bk.currency)}</div>}
                  </td>
                  <td><CountdownBadge days={cdDays} label={cdLabel} /></td>
                  <td>
                    <span className={`tn-badge ${BOOKING_STATUS[bk.status] || 'tn-s-pending'}`}>
                      {bk.status?.replace(/_/g, ' ') || '—'}
                    </span>
                  </td>
                  <td>
                    <button className='tn-expand-btn' onClick={() => setExpanded(isOpen ? null : bk._id)}>
                      {isOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                    </button>
                  </td>
                </tr>
                {isOpen && (
                  <tr className='tn-detail-row'>
                    <td colSpan={7}>
                      <div className='tn-detail'>
                        <div className='tn-detail-grid'>
                          {[
                            ['Check-In',           fmtDate(bk.checkIn)],
                            ['Check-Out',          fmtDate(bk.checkOut)],
                            ['Nights',             bk.nights],
                            ['Guests',             bk.guestCount || 1],
                            ['Total Paid',         fmt(bk.amount, bk.currency)],
                            ['Rent Amount',        fmt(bk.rentAmount, bk.currency)],
                            ['Caution Fee',        fmt(bk.cautionFee, bk.currency)],
                            ['Owner Receives',     fmt(bk.ownerReceives, bk.currency)],
                            ['Caution Status',     bk.cautionStatus || '—'],
                            ['Days to Check-In',   bk.daysToCheckIn  != null ? `${bk.daysToCheckIn}d` : '—'],
                            ['Days to Check-Out',  bk.daysToCheckOut != null ? `${bk.daysToCheckOut}d` : '—']
                          ].map(([lbl, val]) => (
                            <div key={lbl} className='tn-detail-item'>
                              <label>{lbl}</label>
                              <p>{val}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
