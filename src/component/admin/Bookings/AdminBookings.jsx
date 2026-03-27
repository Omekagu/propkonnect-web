'use client'
import React, { useState, useEffect, useCallback, useRef } from 'react'
import { apiClient } from '../../../libs/api-client'
import {
  Calendar,
  Search,
  Filter,
  RefreshCw,
  Download,
  ChevronLeft,
  ChevronRight,
  Eye,
  Building2,
  User,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Home,
  Hotel,
  MapPin,
  Phone,
  Mail,
  CreditCard,
  X
} from 'lucide-react'
import './AdminBookings.scss'

// ── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  pending_payment: { label: 'Pending Payment', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  confirmed:       { label: 'Confirmed',        color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
  active:          { label: 'Active (Checked In)', color: '#3b82f6', bg: 'rgba(59,130,246,0.12)' },
  checked_out:     { label: 'Checked Out',      color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)' },
  cancelled:       { label: 'Cancelled',        color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
  disputed:        { label: 'Disputed',         color: '#f97316', bg: 'rgba(249,115,22,0.12)' }
}

const fmt = (val, currency = 'NGN') =>
  new Intl.NumberFormat('en-NG', { style: 'currency', currency, minimumFractionDigits: 0 }).format(val || 0)

const fmtDate = d =>
  d ? new Date(d).toLocaleDateString('en-NG', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'

const fmtDateTime = d =>
  d ? new Date(d).toLocaleString('en-NG', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || { label: status, color: '#6b7280', bg: 'rgba(107,114,128,0.12)' }
  return (
    <span className='ab-badge' style={{ color: cfg.color, background: cfg.bg }}>
      {cfg.label}
    </span>
  )
}

// ── Detail Drawer ─────────────────────────────────────────────────────────────

function BookingDrawer ({ booking, onClose }) {
  if (!booking) return null
  const { property, guest, owner, payment, caution, refund } = booking
  return (
    <div className='ab-drawer-overlay' onClick={onClose}>
      <div className='ab-drawer' onClick={e => e.stopPropagation()}>
        <div className='ab-drawer-head'>
          <h3>Booking Details</h3>
          <button className='ab-drawer-close' onClick={onClose}><X size={18} /></button>
        </div>

        {/* Property */}
        <section className='ab-drawer-section'>
          <h4><Building2 size={14} /> Property</h4>
          <div className='ab-drawer-prop'>
            {property?.image && (
              <img src={property.image} alt={property.title} className='ab-drawer-img' />
            )}
            <div>
              <p className='ab-drawer-title'>{property?.title || '—'}</p>
              <p className='ab-drawer-sub'><MapPin size={12} /> {[property?.address, property?.city].filter(Boolean).join(', ') || '—'}</p>
              {property?.category && <p className='ab-drawer-sub'>{property.category}</p>}
            </div>
          </div>
        </section>

        {/* Owner */}
        {owner && (
          <section className='ab-drawer-section'>
            <h4><User size={14} /> Property Owner</h4>
            <p>{owner.firstName} {owner.lastName}</p>
            <p className='ab-drawer-sub'><Mail size={12} /> {owner.email}</p>
          </section>
        )}

        {/* Guest */}
        <section className='ab-drawer-section'>
          <h4><User size={14} /> Guest</h4>
          <div className='ab-drawer-guest'>
            {guest?.avatar
              ? <img src={guest.avatar} alt={guest.name} className='ab-drawer-avatar' />
              : <div className='ab-drawer-avatar-ph'>{(guest?.name || '?')[0].toUpperCase()}</div>
            }
            <div>
              <p className='ab-drawer-title'>{guest?.name || '—'}</p>
              <p className='ab-drawer-sub'><Mail size={12} /> {guest?.email || '—'}</p>
              {guest?.phone && <p className='ab-drawer-sub'><Phone size={12} /> {guest.phone}</p>}
            </div>
          </div>
        </section>

        {/* Dates */}
        <section className='ab-drawer-section'>
          <h4><Calendar size={14} /> Stay</h4>
          <div className='ab-drawer-grid2'>
            <div><span className='ab-drawer-label'>Check-in</span><p>{fmtDate(booking.checkIn)}</p></div>
            <div><span className='ab-drawer-label'>Check-out</span><p>{fmtDate(booking.checkOut)}</p></div>
            <div><span className='ab-drawer-label'>Nights</span><p>{booking.nights}</p></div>
            <div><span className='ab-drawer-label'>Guests</span><p>{booking.guestCount}</p></div>
            {booking.roomTypeId && <div><span className='ab-drawer-label'>Room Type</span><p>{booking.roomTypeId}</p></div>}
          </div>
        </section>

        {/* Payment */}
        <section className='ab-drawer-section'>
          <h4><CreditCard size={14} /> Payment</h4>
          <div className='ab-drawer-grid2'>
            <div><span className='ab-drawer-label'>Total</span><p>{fmt(payment?.total, payment?.currency)}</p></div>
            <div><span className='ab-drawer-label'>Rent Amount</span><p>{fmt(payment?.rentAmount, payment?.currency)}</p></div>
            <div><span className='ab-drawer-label'>Caution Fee</span><p>{fmt(payment?.cautionFee, payment?.currency)}</p></div>
            {payment?.paidAt && <div><span className='ab-drawer-label'>Paid At</span><p>{fmtDateTime(payment.paidAt)}</p></div>}
            {payment?.reference && <div className='ab-drawer-fullrow'><span className='ab-drawer-label'>Reference</span><p className='ab-mono'>{payment.reference}</p></div>}
          </div>
        </section>

        {/* Caution escrow */}
        {caution?.status && caution.status !== 'none' && (
          <section className='ab-drawer-section'>
            <h4>Caution Escrow</h4>
            <div className='ab-drawer-grid2'>
              <div><span className='ab-drawer-label'>Amount</span><p>{fmt(caution.amount, payment?.currency)}</p></div>
              <div><span className='ab-drawer-label'>Status</span><p>{caution.status}</p></div>
              {caution.releasedAt && <div><span className='ab-drawer-label'>Released</span><p>{fmtDate(caution.releasedAt)}</p></div>}
              {caution.claimReason && <div className='ab-drawer-fullrow'><span className='ab-drawer-label'>Claim Reason</span><p>{caution.claimReason}</p></div>}
            </div>
          </section>
        )}

        {/* Cancellation */}
        {booking.cancelledBy && (
          <section className='ab-drawer-section ab-drawer-danger'>
            <h4><XCircle size={14} /> Cancellation</h4>
            <p>By: {booking.cancelledBy}</p>
            {booking.cancelReason && <p>{booking.cancelReason}</p>}
            {booking.cancelledAt && <p className='ab-drawer-sub'>{fmtDateTime(booking.cancelledAt)}</p>}
          </section>
        )}

        {/* Refund */}
        {refund?.status && refund.status !== 'none' && (
          <section className='ab-drawer-section'>
            <h4>Refund</h4>
            <div className='ab-drawer-grid2'>
              <div><span className='ab-drawer-label'>Amount</span><p>{fmt(refund.amount, payment?.currency)}</p></div>
              <div><span className='ab-drawer-label'>Status</span><p>{refund.status}</p></div>
              {refund.processedAt && <div><span className='ab-drawer-label'>Processed</span><p>{fmtDate(refund.processedAt)}</p></div>}
            </div>
          </section>
        )}

        <div className='ab-drawer-footer'>
          <p className='ab-drawer-sub'>Booked: {fmtDateTime(booking.createdAt)}</p>
        </div>
      </div>
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────

const STATUS_TABS = [
  { key: '',                label: 'All' },
  { key: 'pending_payment', label: 'Pending' },
  { key: 'confirmed',       label: 'Confirmed' },
  { key: 'active',          label: 'Active' },
  { key: 'checked_out',     label: 'Checked Out' },
  { key: 'cancelled',       label: 'Cancelled' },
  { key: 'disputed',        label: 'Disputed' }
]

export default function AdminBookings () {
  const [bookings, setBookings]     = useState([])
  const [loading, setLoading]       = useState(true)
  const [search, setSearch]         = useState('')
  const [statusFilter, setStatus]   = useState('')
  const [page, setPage]             = useState(1)
  const [pagination, setPagination] = useState({ total: 0, pages: 1 })
  const [counts, setCounts]         = useState({})
  const [selected, setSelected]     = useState(null)
  const searchTimer                 = useRef(null)
  const LIMIT = 20

  const load = useCallback(async (pg = 1, q = search, st = statusFilter) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: pg, limit: LIMIT })
      if (q)  params.set('search', q)
      if (st) params.set('status', st)
      const res = await apiClient.get(`/api/dashboard/admin/bookings?${params}`)
      if (res.data.success) {
        setBookings(res.data.bookings)
        setPagination(res.data.pagination)
        setCounts(res.data.statusCounts || {})
      }
    } catch (e) {
      console.error('[AdminBookings]', e)
    } finally {
      setLoading(false)
    }
  }, [search, statusFilter])

  useEffect(() => { load(1, '', '') }, [])

  const handleSearch = (val) => {
    setSearch(val)
    clearTimeout(searchTimer.current)
    searchTimer.current = setTimeout(() => { setPage(1); load(1, val, statusFilter) }, 400)
  }

  const handleStatus = (st) => {
    setStatus(st)
    setPage(1)
    load(1, search, st)
  }

  const handlePage = (pg) => {
    setPage(pg)
    load(pg, search, statusFilter)
  }

  // CSV export (client-side from loaded data)
  const exportCSV = () => {
    const headers = ['ID','Guest Name','Guest Email','Guest Phone','Property','City','Category','Owner Email','Check-in','Check-out','Nights','Guests','Status','Total','Currency','Reference','Booked At']
    const rows = bookings.map(b => [
      b._id, b.guest?.name, b.guest?.email, b.guest?.phone,
      b.property?.title, b.property?.city, b.property?.category,
      b.owner?.email,
      fmtDate(b.checkIn), fmtDate(b.checkOut), b.nights, b.guestCount,
      b.status, b.payment?.total, b.payment?.currency, b.payment?.reference,
      fmtDateTime(b.createdAt)
    ])
    const csv = [headers, ...rows].map(r => r.map(v => `"${v ?? ''}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `bookings-${new Date().toISOString().slice(0,10)}.csv`
    a.click(); URL.revokeObjectURL(url)
  }

  return (
    <div className='admin-bookings'>
      {/* Header */}
      <div className='ab-head'>
        <div className='ab-head-left'>
          <h2>Bookings & Reservations</h2>
          <p>{pagination.total} total bookings across all properties</p>
        </div>
        <div className='ab-head-actions'>
          <button className='ab-btn-ghost' onClick={() => load(page)} title='Refresh'>
            <RefreshCw size={15} className={loading ? 'ab-spin' : ''} />
          </button>
          <button className='ab-btn-ghost' onClick={exportCSV} title='Export CSV'>
            <Download size={15} /> Export
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className='ab-stats-row'>
        {[
          { label: 'All', key: '', icon: <Calendar size={16} /> },
          { label: 'Confirmed', key: 'confirmed', icon: <CheckCircle size={16} /> },
          { label: 'Active Now', key: 'active', icon: <Home size={16} /> },
          { label: 'Cancelled', key: 'cancelled', icon: <XCircle size={16} /> }
        ].map(s => (
          <div key={s.key} className={`ab-stat-card${statusFilter === s.key ? ' active' : ''}`}
            onClick={() => handleStatus(s.key)} role='button'>
            <div className='ab-stat-icon'>{s.icon}</div>
            <div>
              <p className='ab-stat-num'>{counts[s.key || 'all'] || 0}</p>
              <p className='ab-stat-label'>{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className='ab-filters'>
        <div className='ab-search-wrap'>
          <Search size={14} className='ab-search-icon' />
          <input
            className='ab-search'
            placeholder='Search guest name, email or phone…'
            value={search}
            onChange={e => handleSearch(e.target.value)}
          />
        </div>
        <div className='ab-tabs'>
          {STATUS_TABS.map(t => (
            <button
              key={t.key}
              className={`ab-tab${statusFilter === t.key ? ' active' : ''}`}
              onClick={() => handleStatus(t.key)}
            >
              {t.label}
              {counts[t.key || 'all'] != null && (
                <span className='ab-tab-count'>{counts[t.key || 'all']}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className='ab-table-wrap'>
        {loading ? (
          <div className='ab-loading'>
            <RefreshCw size={24} className='ab-spin' />
            <p>Loading bookings…</p>
          </div>
        ) : bookings.length === 0 ? (
          <div className='ab-empty'>
            <Calendar size={40} opacity={0.3} />
            <p>No bookings found</p>
          </div>
        ) : (
          <table className='ab-table'>
            <thead>
              <tr>
                <th>Property</th>
                <th>Guest</th>
                <th>Owner</th>
                <th>Room / Type</th>
                <th>Check-in</th>
                <th>Check-out</th>
                <th>Nights</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Booked</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {bookings.map(b => (
                <tr key={b._id} className={b.isActive ? 'ab-row-active' : b.isPast ? 'ab-row-past' : ''}>
                  <td>
                    <div className='ab-prop-cell'>
                      {b.property?.image
                        ? <img src={b.property.image} alt='' className='ab-prop-thumb' />
                        : <div className='ab-prop-thumb-ph'><Building2 size={14} /></div>
                      }
                      <div>
                        <p className='ab-prop-name'>{b.property?.title || '—'}</p>
                        <p className='ab-sub'><MapPin size={10} /> {b.property?.city || '—'}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <p className='ab-guest-name'>{b.guest?.name || '—'}</p>
                    <p className='ab-sub'>{b.guest?.email || '—'}</p>
                  </td>
                  <td>
                    {b.owner
                      ? <><p>{b.owner.firstName} {b.owner.lastName}</p><p className='ab-sub'>{b.owner.email}</p></>
                      : <span className='ab-sub'>—</span>
                    }
                  </td>
                  <td>
                    <p>{b.property?.category || '—'}</p>
                    {b.roomTypeId && <p className='ab-sub'>{b.roomTypeId}</p>}
                    <p className='ab-sub'>{b.guestCount} guest{b.guestCount > 1 ? 's' : ''}</p>
                  </td>
                  <td>{fmtDate(b.checkIn)}</td>
                  <td>{fmtDate(b.checkOut)}</td>
                  <td className='ab-center'>{b.nights}</td>
                  <td>
                    <p className='ab-amount'>{fmt(b.payment?.total, b.payment?.currency)}</p>
                    {b.payment?.cautionFee > 0 && (
                      <p className='ab-sub'>+{fmt(b.payment.cautionFee)} caution</p>
                    )}
                  </td>
                  <td><StatusBadge status={b.status} /></td>
                  <td className='ab-sub'>{fmtDate(b.createdAt)}</td>
                  <td>
                    <button className='ab-view-btn' onClick={() => setSelected(b)} title='View details'>
                      <Eye size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className='ab-pagination'>
          <button className='ab-page-btn' disabled={page === 1} onClick={() => handlePage(page - 1)}>
            <ChevronLeft size={15} />
          </button>
          {Array.from({ length: Math.min(pagination.pages, 7) }, (_, i) => {
            const pg = i + 1
            return (
              <button key={pg} className={`ab-page-btn${page === pg ? ' active' : ''}`} onClick={() => handlePage(pg)}>
                {pg}
              </button>
            )
          })}
          {pagination.pages > 7 && <span className='ab-page-ellipsis'>…</span>}
          <button className='ab-page-btn' disabled={page === pagination.pages} onClick={() => handlePage(page + 1)}>
            <ChevronRight size={15} />
          </button>
          <span className='ab-page-info'>
            {(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, pagination.total)} of {pagination.total}
          </span>
        </div>
      )}

      {/* Detail drawer */}
      {selected && <BookingDrawer booking={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}
