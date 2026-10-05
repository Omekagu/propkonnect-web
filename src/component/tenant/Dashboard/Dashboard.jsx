'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { api } from '@/libs/api-client'
import Link from 'next/link'
import { encodeId } from '@/libs/propId'
import './Dashboard.scss'

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmt (n, cur = 'NGN') {
  if (n == null || n === 0) return '—'
  if (n >= 1_000_000) return `${cur} ${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000)     return `${cur} ${(n / 1_000).toFixed(0)}K`
  return `${cur} ${Number(n).toLocaleString()}`
}
function fmtDate (d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}
function fmtDateShort (d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}
function daysLeft (target) {
  if (!target) return null
  return Math.ceil((new Date(target) - Date.now()) / 86400000)
}
function initials (name = '') {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
}

// ── Sub-components ────────────────────────────────────────────────────────────
function Badge ({ status }) {
  const s = (status || '').toLowerCase().replace(/ /g, '_')
  return (
    <span className={`td-badge td-badge--${s}`}>
      {(status || '—').replace(/_/g, ' ')}
    </span>
  )
}

function Countdown ({ days, label }) {
  if (days == null) return null
  const cls = days < 0 ? 'past' : days <= 2 ? 'urgent' : days <= 7 ? 'warn' : 'ok'
  const txt = days < 0 ? 'Overdue' : days === 0 ? 'Today' : `${days}d`
  return (
    <span className={`td-cd td-cd--${cls}`}>
      {txt}{label ? ` ${label}` : ''}
    </span>
  )
}

function StatCard ({ icon, label, value, sub, variant = 'blue' }) {
  return (
    <div className={`td-stat td-stat--${variant}`}>
      <div className='td-stat__icon'>{icon}</div>
      <div className='td-stat__val'>{value ?? '0'}</div>
      <div className='td-stat__label'>{label}</div>
      {sub && <div className='td-stat__sub'>{sub}</div>}
    </div>
  )
}

function Section ({ icon, iconBg, title, count, cols, children, empty }) {
  const [open, setOpen] = useState(true)
  const hasItems = count > 0
  return (
    <div className='td-section'>
      <div className='td-section__hd' onClick={() => setOpen(o => !o)}>
        <div className='td-section__hd-left'>
          <div className='td-section__icon' style={{ background: iconBg }}>{icon}</div>
          <span className='td-section__title'>{title}</span>
          <span className='td-section__count'>{count}</span>
        </div>
        <span className={`td-section__chevron${open ? ' open' : ''}`}>▼</span>
      </div>
      {open && (
        hasItems ? (
          <div className='td-section__body'>{children}</div>
        ) : (
          <div className='td-section__empty'>{empty || 'No records yet.'}</div>
        )
      )}
    </div>
  )
}

// Generic grid table row
function TRow ({ style, values }) {
  return (
    <div className='td-row' style={{ gridTemplateColumns: style }}>
      {values.map((v, i) => (
        <div key={i} className={`td-cell${v.muted ? ' td-cell--muted' : ''}`}>{v.v}</div>
      ))}
    </div>
  )
}
function THead ({ style, labels }) {
  return (
    <div className='td-table-head' style={{ gridTemplateColumns: style }}>
      {labels.map((l, i) => <div key={i} className='td-th'>{l}</div>)}
    </div>
  )
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
function Skeleton () {
  return (
    <div className='td td-skel'>
      <div className='td-skel-hero' />
      <div className='td-skel-grid'>
        {[90, 90, 90, 90, 90, 90].map((h, i) => (
          <div key={i} className='td-skel-block' style={{ height: h }} />
        ))}
      </div>
      <div className='td-skel-rows'>
        <div className='td-skel-row' />
        <div className='td-skel-row' />
        <div className='td-skel-row' />
      </div>
    </div>
  )
}

// ── Browse Properties ────────────────────────────────────────────────────────
const BROWSE_CATS = [
  { value: '',           label: 'All' },
  { value: 'Apartment',  label: 'Apartment' },
  { value: 'House',      label: 'House' },
  { value: 'Shortlet',   label: 'Shortlet' },
  { value: 'Hotel',      label: 'Hotel' },
  { value: 'Land',       label: 'Land' },
  { value: 'Commercial', label: 'Commercial' },
]

function getPropImage (p) {
  const media = p.media || p.images
  if (Array.isArray(media) && media.length) {
    const f = media[0]
    if (typeof f === 'string') return f
    return f?.url || f?.cloudinaryUrl || null
  }
  return p.coverImage || null
}
function getPropPrice (p) {
  const n = v => `₦${Number(v).toLocaleString()}`
  if (p.purpose === 'For Sale' && p.price)    return n(p.price)
  if (p.rentPrice)                            return `${n(p.rentPrice)}/mo`
  if (p.pricePerNight)                        return `${n(p.pricePerNight)}/night`
  if (p.price)                                return n(p.price)
  return 'Price on request'
}
function getPropLoc (p) {
  const parts = [p.location?.city || p.city, p.location?.state || p.state]
  return parts.filter(Boolean).join(', ') || p.location?.address || 'Nigeria'
}

function BrowsePropCard ({ p }) {
  const [err, setErr] = useState(false)
  const img   = getPropImage(p)
  const price = getPropPrice(p)
  const loc   = getPropLoc(p)
  const beds  = p.beds ?? p.bedrooms ?? p.apartment?.bedrooms
  const baths = p.baths ?? p.bathrooms ?? p.apartment?.bathrooms
  const tag   = p.purpose === 'For Sale' ? 'sale'
              : p.category === 'Shortlet' || p.category === 'Hotel' ? 'short'
              : 'rent'
  const tagLabel = p.purpose === 'For Sale' ? 'For Sale'
                 : p.category === 'Shortlet' ? 'Shortlet'
                 : p.category === 'Hotel' ? 'Hotel'
                 : 'For Rent'

  return (
    <Link href={`/property/${encodeId(p._id)}`} className='td-bprop'>
      <div className='td-bprop__img'>
        {img && !err
          ? <img src={img} alt={p.title} onError={() => setErr(true)} loading='lazy' />
          : <div className='td-bprop__img-fb'>
              <svg width='28' height='28' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round'><path d='M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z'/><polyline points='9 22 9 12 15 12 15 22'/></svg>
            </div>
        }
        <span className={`td-bprop__tag td-bprop__tag--${tag}`}>{tagLabel}</span>
      </div>
      <div className='td-bprop__body'>
        <div className='td-bprop__price'>{price}</div>
        <div className='td-bprop__title'>{p.title}</div>
        <div className='td-bprop__loc'>
          <svg width='11' height='11' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><path d='M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z'/><circle cx='12' cy='10' r='3'/></svg>
          {loc}
        </div>
        {(beds != null || baths != null) && (
          <div className='td-bprop__meta'>
            {beds  != null && <span><svg width='11' height='11' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><path d='M2 4v16'/><path d='M2 8h18a2 2 0 0 1 2 2v10'/><path d='M2 17h20'/><path d='M6 8v9'/></svg>{beds} bed{beds !== 1 ? 's' : ''}</span>}
            {baths != null && <span><svg width='11' height='11' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><path d='M9 6 6.5 3.5a1.5 1.5 0 0 0-1-.5C4.683 3 4 3.683 4 4.5V17a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5'/><line x1='10' y1='5' x2='8' y2='7'/><line x1='2' y1='12' x2='22' y2='12'/></svg>{baths} bath{baths !== 1 ? 's' : ''}</span>}
          </div>
        )}
      </div>
    </Link>
  )
}

function BrowseProperties () {
  const [q,        setQ]        = useState('')
  const [cat,      setCat]      = useState('')
  const [props,    setProps]    = useState([])
  const [loading,  setLoading]  = useState(true)
  const [inputVal, setInputVal] = useState('')

  const fetchProps = useCallback(async (query = '', category = '') => {
    setLoading(true)
    try {
      const params = { limit: 8, status: 'active' }
      if (query)    params.q        = query
      if (category) params.category = category
      const res = await api.get('/api/properties/search', { params })
      const list = res.data?.properties || res.data?.data || res.data || []
      setProps(Array.isArray(list) ? list : [])
    } catch {
      setProps([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchProps(q, cat) }, [q, cat, fetchProps])

  // Debounced search
  useEffect(() => {
    const t = setTimeout(() => setQ(inputVal.trim()), 400)
    return () => clearTimeout(t)
  }, [inputVal])

  return (
    <div className='td-browse'>
      <div className='td-browse__hd'>
        <div className='td-browse__hd-left'>
          <span className='td-section-label' style={{ marginBottom: 0 }}>Browse Properties</span>
          <span className='td-browse__count'>{loading ? '…' : `${props.length} shown`}</span>
        </div>
        <Link href='/search' className='td-browse__all'>See all →</Link>
      </div>

      {/* Search + filter row */}
      <div className='td-browse__controls'>
        <div className='td-browse__search'>
          <svg width='15' height='15' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><circle cx='11' cy='11' r='8'/><line x1='21' y1='21' x2='16.65' y2='16.65'/></svg>
          <input
            type='text'
            placeholder='Search by title, city…'
            value={inputVal}
            onChange={e => setInputVal(e.target.value)}
          />
          {inputVal && (
            <button onClick={() => { setInputVal(''); setQ('') }}>
              <svg width='13' height='13' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.5' strokeLinecap='round' strokeLinejoin='round'><line x1='18' y1='6' x2='6' y2='18'/><line x1='6' y1='6' x2='18' y2='18'/></svg>
            </button>
          )}
        </div>
        <div className='td-browse__cats'>
          {BROWSE_CATS.map(c => (
            <button
              key={c.value}
              className={`td-browse__cat${cat === c.value ? ' active' : ''}`}
              onClick={() => setCat(c.value)}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className='td-browse__grid'>
          {[1,2,3,4,5,6,7,8].map(i => (
            <div key={i} className='td-bprop-skel'>
              <div className='td-bprop-skel__img' />
              <div className='td-bprop-skel__body'>
                <div className='td-bprop-skel__line' style={{ width: '55%' }} />
                <div className='td-bprop-skel__line' style={{ width: '80%', height: 14 }} />
                <div className='td-bprop-skel__line' style={{ width: '65%' }} />
              </div>
            </div>
          ))}
        </div>
      ) : props.length === 0 ? (
        <div className='td-browse__empty'>
          <svg width='32' height='32' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round'><path d='M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z'/><polyline points='9 22 9 12 15 12 15 22'/></svg>
          <p>No properties found{q ? ` for "${q}"` : ''}.</p>
          <Link href='/search'>Browse all listings →</Link>
        </div>
      ) : (
        <div className='td-browse__grid'>
          {props.map(p => <BrowsePropCard key={p._id} p={p} />)}
        </div>
      )}

      <div className='td-browse__footer'>
        <Link href='/search' className='td-browse__footer-btn'>Browse all properties →</Link>
      </div>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function TenantDashboard () {
  const { user } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.get('/api/dashboard/summary')
      if (res.data.success) setData(res.data)
      else setError(res.data.message || 'Failed to load')
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load dashboard')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  if (loading) return <Skeleton />

  if (error) return (
    <div className='td'>
      <div className='td-err'>
        <div className='td-err__ico'>
          <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
            <path d='M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z'/><line x1='12' y1='9' x2='12' y2='13'/><line x1='12' y1='17' x2='12' y2='17.01'/>
          </svg>
        </div>
        <div className='td-err__msg'>{error}</div>
        <button className='td-err__btn' onClick={fetchData}>Retry</button>
      </div>
    </div>
  )

  const s            = data?.stats || {}
  const bookings     = data?.bookings || []
  const escrows      = data?.escrows || []
  const inspections  = data?.inspections || []
  const leases       = data?.leases || []
  const applications = data?.applications || []
  const transactions = data?.transactions || []
  const bkCounts     = data?.bookingCountdowns || []
  const lsCounts     = data?.leaseCountdowns || []
  const insCounts    = data?.inspectionCountdowns || []
  const payout       = data?.payout || {}

  const firstName    = user?.firstName || 'User'
  const fullName     = `${user?.firstName || ''} ${user?.lastName || ''}`.trim()
  const totalPaid    = transactions.filter(t => t.status === 'completed').reduce((a, t) => a + (t.amount || 0), 0)
  const upcomingCount = bkCounts.length + lsCounts.length + insCounts.length

  // Cols configs
  const bookingCols = '2fr 1fr 1fr 1fr 1fr'
  const appCols     = '2fr 1fr 1fr 1fr'
  const leaseCols   = '2fr 1fr 1fr 1fr 1fr'
  const inspCols    = '2fr 1fr 1fr 1fr 1fr'
  const escrowCols  = '1fr 1fr 1fr 1fr 1fr'
  const txCols      = '1fr 1fr 1fr 1fr'

  return (
    <div className='td'>

      {/* ── Hero ── */}
      <div className='td-hero'>
        <div className='td-hero-top'>
          <div className='td-avatar'>{initials(fullName) || <svg width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><path d='M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2'/><circle cx='12' cy='7' r='4'/></svg>}</div>
          <div className='td-hero-text'>
            <h2 className='td-hero-name'>Hey, {firstName}!</h2>
            <p className='td-hero-sub'>Here's what's happening with your properties</p>
          </div>
          <div className='td-hero-live'>LIVE</div>
        </div>

        {/* Mini stat strip */}
        <div className='td-hero-stats'>
          <div className='td-hero-stat'>
            <div className='td-hero-stat__val'>{s.bookings ?? 0}</div>
            <div className='td-hero-stat__label'>Bookings</div>
          </div>
          <div className='td-hero-stat'>
            <div className='td-hero-stat__val'>{s.activeLeases ?? 0}</div>
            <div className='td-hero-stat__label'>Leases</div>
          </div>
          <div className='td-hero-stat'>
            <div className='td-hero-stat__val'>{s.inspections ?? 0}</div>
            <div className='td-hero-stat__label'>Inspections</div>
          </div>
          <div className='td-hero-stat'>
            <div className='td-hero-stat__val'>{upcomingCount}</div>
            <div className='td-hero-stat__label'>Upcoming</div>
          </div>
          <div className='td-hero-stat'>
            <div className='td-hero-stat__val'>
              {payout.walletBalance > 0 ? fmt(payout.walletBalance) : '—'}
            </div>
            <div className='td-hero-stat__label'>Wallet</div>
          </div>
        </div>
      </div>

      <div className='td-body'>

        {/* ── Stats bento grid ── */}
        <div className='td-section-label'>Overview</div>
        <div className='td-stats'>
          <StatCard icon={<svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><path d='M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z'/><polyline points='9 22 9 12 15 12 15 22'/></svg>} label='Total Bookings' value={s.bookings ?? 0} variant='blue' />
          <StatCard icon={<svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><rect x='8' y='2' width='8' height='4' rx='1'/><path d='M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2'/></svg>} label='Applications' value={s.applications ?? 0}
            sub={s.applications ? `${data?.applicationSummary?.approved ?? 0} approved` : null}
            variant='amber' />
          <StatCard icon={<svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><path d='M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z'/><polyline points='14 2 14 8 20 8'/><line x1='16' y1='13' x2='8' y2='13'/><line x1='16' y1='17' x2='8' y2='17'/><polyline points='10 9 9 9 8 9'/></svg>} label='Active Leases' value={s.activeLeases ?? 0} variant='green' />
          <StatCard icon={<svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><circle cx='11' cy='11' r='8'/><line x1='21' y1='21' x2='16.65' y2='16.65'/></svg>} label='Inspections' value={s.inspections ?? 0} variant='purple' />
          <StatCard icon={<svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><rect x='3' y='11' width='18' height='11' rx='2' ry='2'/><path d='M7 11V7a5 5 0 0 1 10 0v4'/></svg>} label='Escrows' value={s.escrows ?? 0} variant='orange' />
          <StatCard icon={<svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><line x1='12' y1='1' x2='12' y2='23'/><path d='M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6'/></svg>} label='Wallet'
            value={payout.walletBalance > 0 ? fmt(payout.walletBalance) : '—'}
            sub={payout.walletBalance > 0 ? 'Available balance' : 'No balance'}
            variant='lime' />
        </div>

        {/* ── Wallet card ── */}
        {payout.walletBalance > 0 && (
          <>
            <div className='td-section-label'>Wallet</div>
            <div className='td-wallet'>
              <div>
                <div className='td-wallet__label'>Propnect Wallet Balance</div>
                <div className='td-wallet__amount'>{fmt(payout.walletBalance, payout.currency || 'NGN')}</div>
                <div className='td-wallet__note'>Caution fee refunds & credits</div>
              </div>
              <span className='td-wallet__cta'>Contact Support →</span>
            </div>
          </>
        )}

        {/* ── Browse Properties ── */}
        <BrowseProperties />

        {/* ── Upcoming timeline ── */}
        {upcomingCount > 0 && (
          <>
            <div className='td-section-label'>Upcoming & Active</div>
            <div className='td-events'>
              {bkCounts.map(b => {
                const days = b.isActive ? daysLeft(b.checkOut) : daysLeft(b.checkIn)
                const urgent = days != null && days <= 2
                const warn   = days != null && days <= 7
                return (
                  <div key={b.bookingId} className={`td-event td-event--booking${urgent ? ' td-event--urgent' : warn ? ' td-event--warn' : ''}`}>
                    <div className='td-event__dot'><svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><path d='M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z'/><polyline points='9 22 9 12 15 12 15 22'/></svg></div>
                    <div className='td-event__body'>
                      <div className='td-event__title'>{b.propertyTitle}</div>
                      <div className='td-event__meta'>
                        {fmtDateShort(b.checkIn)} → {fmtDateShort(b.checkOut)} · {b.nights} night{b.nights !== 1 ? 's' : ''}
                      </div>
                    </div>
                    <div className='td-event__right'>
                      <Badge status={b.status} />
                      <Countdown days={days} label={b.isActive ? 'to checkout' : 'to check-in'} />
                    </div>
                  </div>
                )
              })}
              {lsCounts.map(l => {
                const days = l.daysUntilDue
                return (
                  <div key={l.leaseId} className={`td-event td-event--lease${l.isOverdue ? ' td-event--urgent' : days <= 7 ? ' td-event--warn' : ''}`}>
                    <div className='td-event__dot'><svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><path d='M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z'/><polyline points='14 2 14 8 20 8'/><line x1='16' y1='13' x2='8' y2='13'/><line x1='16' y1='17' x2='8' y2='17'/><polyline points='10 9 9 9 8 9'/></svg></div>
                    <div className='td-event__body'>
                      <div className='td-event__title'>{l.propertyTitle}</div>
                      <div className='td-event__meta'>Rent due {fmtDate(l.nextDueDate)} · {fmt(l.nextDueAmount)}</div>
                    </div>
                    <div className='td-event__right'>
                      <Badge status={l.isOverdue ? 'cancelled' : 'active'} />
                      <Countdown days={days} label={l.isOverdue ? 'overdue' : 'until due'} />
                    </div>
                  </div>
                )
              })}
              {insCounts.map(i => (
                <div key={i.inspectionId} className='td-event td-event--insp'>
                  <div className='td-event__dot'><svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><circle cx='11' cy='11' r='8'/><line x1='21' y1='21' x2='16.65' y2='16.65'/></svg></div>
                  <div className='td-event__body'>
                    <div className='td-event__title'>{i.propertyTitle}</div>
                    <div className='td-event__meta'>Inspection: {fmtDate(i.confirmedDate)}</div>
                  </div>
                  <div className='td-event__right'>
                    <Badge status='scheduled' />
                    <Countdown days={i.daysUntil} label='away' />
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ── Sections ── */}
        <div className='td-section-label'>Activity</div>

        {/* Bookings */}
        <Section icon={<svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><path d='M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z'/><polyline points='9 22 9 12 15 12 15 22'/></svg>} iconBg='rgba(59,130,246,0.12)' title='My Bookings'
          count={bookings.length} empty='No bookings yet. Book a shortlet or hotel to get started.'>
          <THead style={bookingCols} labels={['Property', 'Check-in', 'Check-out', 'Amount', 'Status']} />
          {bookings.map(b => (
            <TRow key={b._id} style={bookingCols} values={[
              { v: b.property?.title || '—' },
              { v: fmtDate(b.checkIn),  muted: true },
              { v: fmtDate(b.checkOut), muted: true },
              { v: fmt(b.payment?.total, b.payment?.currency) },
              { v: <Badge status={b.status} /> }
            ]} />
          ))}
        </Section>

        {/* Applications */}
        <Section icon={<svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><rect x='8' y='2' width='8' height='4' rx='1'/><path d='M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2'/></svg>} iconBg='rgba(245,158,11,0.12)' title='My Applications'
          count={applications.length} empty='No property applications yet.'>
          <THead style={appCols} labels={['Property', 'Type', 'Applied', 'Status']} />
          {applications.map(a => (
            <TRow key={a._id} style={appCols} values={[
              { v: a.propertyId?.title || '—' },
              { v: a.applicationType || '—', muted: true },
              { v: fmtDate(a.createdAt),      muted: true },
              { v: <Badge status={a.status} /> }
            ]} />
          ))}
        </Section>

        {/* Leases */}
        <Section icon={<svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><path d='M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z'/><polyline points='14 2 14 8 20 8'/><line x1='16' y1='13' x2='8' y2='13'/><line x1='16' y1='17' x2='8' y2='17'/><polyline points='10 9 9 9 8 9'/></svg>} iconBg='rgba(34,197,94,0.12)' title='My Leases'
          count={leases.length} empty='No active leases.'>
          <THead style={leaseCols} labels={['Property', 'Start', 'End', 'Rent', 'Status']} />
          {leases.map(l => {
            const nextDue  = (l.installments || []).find(i => i.status === 'pending' || i.status === 'overdue')
            const endDays  = daysLeft(l.endDate)
            return (
              <TRow key={l._id} style={leaseCols} values={[
                { v: l.property?.title || '—' },
                { v: fmtDate(l.startDate), muted: true },
                { v: <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  {fmtDate(l.endDate)}
                  {endDays != null && endDays <= 30 && <Countdown days={endDays} label='left' />}
                </span> },
                { v: <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  {fmt(l.rentAmount)}
                  {nextDue && <Countdown days={daysLeft(nextDue.dueDate)} label='due' />}
                </span> },
                { v: <Badge status={l.status} /> }
              ]} />
            )
          })}
        </Section>

        {/* Inspections */}
        <Section icon={<svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><circle cx='11' cy='11' r='8'/><line x1='21' y1='21' x2='16.65' y2='16.65'/></svg>} iconBg='rgba(168,85,247,0.12)' title='Inspection Requests'
          count={inspections.length} empty='No inspection requests yet.'>
          <THead style={inspCols} labels={['Property', 'Preferred', 'Confirmed', 'Fee', 'Status']} />
          {inspections.map(i => {
            const days = i.confirmedDate ? daysLeft(i.confirmedDate) : null
            return (
              <TRow key={i._id} style={inspCols} values={[
                { v: i.property?.title || '—' },
                { v: fmtDate(i.preferredDate), muted: true },
                { v: <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  {fmtDate(i.confirmedDate)}
                  {days != null && days >= 0 && <Countdown days={days} label='away' />}
                </span> },
                { v: fmt(i.fee?.amount), muted: true },
                { v: <Badge status={i.status} /> }
              ]} />
            )
          })}
        </Section>

        {/* Escrows */}
        <Section icon={<svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><rect x='3' y='11' width='18' height='11' rx='2' ry='2'/><path d='M7 11V7a5 5 0 0 1 10 0v4'/></svg>} iconBg='rgba(249,115,22,0.12)' title='My Escrows'
          count={escrows.length} empty='No escrow transactions.'>
          <THead style={escrowCols} labels={['Type', 'Amount', 'Payee', 'Date', 'Status']} />
          {escrows.map(e => (
            <TRow key={e._id} style={escrowCols} values={[
              { v: e.type || '—' },
              { v: fmt(e.amount, e.currency) },
              { v: e.payee ? `${e.payee.firstName} ${e.payee.lastName}` : '—', muted: true },
              { v: fmtDate(e.createdAt), muted: true },
              { v: <Badge status={e.status} /> }
            ]} />
          ))}
        </Section>

        {/* Transactions */}
        <Section icon={<svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><rect x='1' y='4' width='22' height='16' rx='2' ry='2'/><line x1='1' y1='10' x2='23' y2='10'/></svg>} iconBg='rgba(96,165,250,0.1)' title='Payments'
          count={transactions.length} empty='No payment history.'>
          <THead style={txCols} labels={['Type', 'Amount', 'Date', 'Status']} />
          {transactions.map(t => (
            <TRow key={t._id} style={txCols} values={[
              { v: t.type || '—' },
              { v: fmt(t.amount, t.currency) },
              { v: fmtDate(t.createdAt), muted: true },
              { v: <Badge status={t.status} /> }
            ]} />
          ))}
        </Section>

        {/* Total spent */}
        {totalPaid > 0 && (
          <div className='td-total'>
            <div>
              <div className='td-total__label'>Total Payments Made</div>
              <div className='td-total__val'>{fmt(totalPaid, 'NGN')}</div>
              <div className='td-total__sub'>
                {transactions.filter(t => t.status === 'completed').length} completed transaction
                {transactions.filter(t => t.status === 'completed').length !== 1 ? 's' : ''}
              </div>
            </div>
            <span style={{ fontSize: 28, opacity: 0.15 }}>
              <svg width='28' height='28' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><line x1='18' y1='20' x2='18' y2='10'/><line x1='12' y1='20' x2='12' y2='4'/><line x1='6' y1='20' x2='6' y2='14'/></svg>
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
