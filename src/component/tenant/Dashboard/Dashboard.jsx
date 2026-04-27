'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { api } from '@/libs/api-client'
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
      ⏱ {txt}{label ? ` ${label}` : ''}
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
        <div className='td-err__ico'>⚠️</div>
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
          <div className='td-avatar'>{initials(fullName) || '👤'}</div>
          <div className='td-hero-text'>
            <h2 className='td-hero-name'>Hey, {firstName}! 👋</h2>
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
          <StatCard icon='🏨' label='Total Bookings' value={s.bookings ?? 0} variant='blue' />
          <StatCard icon='📋' label='Applications' value={s.applications ?? 0}
            sub={s.applications ? `${data?.applicationSummary?.approved ?? 0} approved` : null}
            variant='amber' />
          <StatCard icon='📜' label='Active Leases' value={s.activeLeases ?? 0} variant='green' />
          <StatCard icon='🔍' label='Inspections' value={s.inspections ?? 0} variant='purple' />
          <StatCard icon='🔒' label='Escrows' value={s.escrows ?? 0} variant='orange' />
          <StatCard icon='💰' label='Wallet'
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
                    <div className='td-event__dot'>🏨</div>
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
                    <div className='td-event__dot'>📜</div>
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
                  <div className='td-event__dot'>🔍</div>
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
        <Section icon='🏨' iconBg='rgba(59,130,246,0.12)' title='My Bookings'
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
        <Section icon='📋' iconBg='rgba(245,158,11,0.12)' title='My Applications'
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
        <Section icon='📜' iconBg='rgba(34,197,94,0.12)' title='My Leases'
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
        <Section icon='🔍' iconBg='rgba(168,85,247,0.12)' title='Inspection Requests'
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
        <Section icon='🔒' iconBg='rgba(249,115,22,0.12)' title='My Escrows'
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
        <Section icon='💳' iconBg='rgba(96,165,250,0.1)' title='Payments'
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
            <span style={{ fontSize: 28, opacity: 0.15 }}>📊</span>
          </div>
        )}
      </div>
    </div>
  )
}
