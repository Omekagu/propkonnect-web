'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { api } from '@/libs/api-client'

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmt(n, cur = 'NGN') {
  if (n == null || n === 0) return '—'
  if (n >= 1_000_000) return `${cur} ${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${cur} ${(n / 1_000).toFixed(0)}K`
  return `${cur} ${Number(n).toLocaleString()}`
}
function fmtDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}
function countdown(targetDate) {
  if (!targetDate) return null
  const days = Math.ceil((new Date(targetDate) - Date.now()) / 86400000)
  return days
}

const STATUS_COLORS = {
  confirmed: '#16a34a', active: '#2563eb', pending_payment: '#d97706',
  cancelled: '#dc2626', checked_out: '#6b7280', disputed: '#7c3aed',
  pending: '#d97706', approved: '#16a34a', rejected: '#dc2626', paid: '#0ea5e9',
  scheduled: '#16a34a', completed: '#6b7280', funded: '#2563eb',
  released: '#16a34a', refunded: '#6b7280', 'no_show': '#dc2626'
}
const STATUS_BG = {
  confirmed: '#f0fdf4', active: '#dbeafe', pending_payment: '#fef3c7',
  cancelled: '#fef2f2', checked_out: '#f9fafb', disputed: '#faf5ff',
  pending: '#fef3c7', approved: '#f0fdf4', rejected: '#fef2f2', paid: '#e0f2fe',
  scheduled: '#f0fdf4', completed: '#f9fafb', funded: '#dbeafe',
  released: '#f0fdf4', refunded: '#f9fafb', 'no_show': '#fef2f2'
}

function Badge({ status }) {
  const label = status?.replace(/_/g, ' ') || '—'
  return (
    <span style={{
      display: 'inline-block', padding: '2px 8px', borderRadius: 99,
      fontSize: 11, fontWeight: 600, textTransform: 'capitalize',
      color: STATUS_COLORS[status] || '#374151',
      background: STATUS_BG[status] || '#f3f4f6'
    }}>
      {label}
    </span>
  )
}

function CountdownBadge({ days, label }) {
  if (days == null) return null
  const urgent = days <= 3
  const warn   = days <= 7
  const color  = urgent ? '#dc2626' : warn ? '#d97706' : '#2563eb'
  const bg     = urgent ? '#fef2f2' : warn ? '#fef3c7' : '#dbeafe'
  const text   = days < 0 ? 'Overdue' : days === 0 ? 'Today' : `${days}d`
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 99, fontSize: 11, fontWeight: 700, color, background: bg }}>
      ⏱ {text}{label ? ` ${label}` : ''}
    </span>
  )
}

// ── Section card ──────────────────────────────────────────────────────────────
function Section({ title, count, children, emptyMsg = 'No records found.' }) {
  const [open, setOpen] = useState(true)
  return (
    <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: '1rem', overflow: 'hidden' }}>
      <div
        onClick={() => setOpen(o => !o)}
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.25rem', cursor: 'pointer', borderBottom: open ? '1px solid #f3f4f6' : 'none' }}
      >
        <span style={{ fontWeight: 700, fontSize: 15, color: '#111' }}>
          {title}
          {count != null && <span style={{ marginLeft: 8, background: '#f3f4f6', color: '#6b7280', borderRadius: 99, padding: '1px 8px', fontSize: 12, fontWeight: 600 }}>{count}</span>}
        </span>
        <span style={{ color: '#9ca3af', fontSize: 18 }}>{open ? '▲' : '▼'}</span>
      </div>
      {open && (
        <div style={{ padding: '0.75rem 1.25rem 1rem' }}>
          {children || <p style={{ color: '#9ca3af', fontSize: 13, margin: 0 }}>{emptyMsg}</p>}
        </div>
      )}
    </div>
  )
}

// ── Stat card ──────────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, sub, bg = '#f3f4f6', color = '#2563eb' }) {
  return (
    <div style={{ background: '#fff', borderRadius: 12, padding: '1.1rem 1.25rem', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', gap: 14 }}>
      <div style={{ width: 44, height: 44, borderRadius: 10, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#111', lineHeight: 1.2 }}>{value}</div>
        <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>{label}</div>
        {sub && <div style={{ fontSize: 11, color: color, marginTop: 2 }}>{sub}</div>}
      </div>
    </div>
  )
}

// ── Table row ─────────────────────────────────────────────────────────────────
function Row({ cols }) {
  return (
    <div style={{ display: 'flex', gap: '0.5rem', padding: '7px 0', borderBottom: '1px solid #f3f4f6', fontSize: 13, alignItems: 'center', flexWrap: 'wrap' }}>
      {cols.map((c, i) => (
        <div key={i} style={{ flex: c.flex || 1, color: c.muted ? '#6b7280' : '#111', minWidth: c.min || 60 }}>
          {c.value}
        </div>
      ))}
    </div>
  )
}

// ── MAIN COMPONENT ────────────────────────────────────────────────────────────
export default function TenantDashboard() {
  const { user } = useAuth()
  const [data, setData]     = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]   = useState(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.get('/api/dashboard/summary')
      if (res.data.success) setData(res.data)
      else setError(res.data.message || 'Failed to load')
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load dashboard data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  if (loading) return (
    <div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
      <div style={{ fontSize: 32, marginBottom: 8 }}>⏳</div>
      Loading your dashboard…
    </div>
  )

  if (error) return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <div style={{ color: '#dc2626', marginBottom: 12 }}>⚠️ {error}</div>
      <button onClick={fetchData} style={{ padding: '8px 20px', background: '#0B3D28', color: '#fff', borderRadius: 8, border: 'none', cursor: 'pointer' }}>Retry</button>
    </div>
  )

  const s = data?.stats || {}
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

  const firstName = user?.firstName || 'User'

  return (
    <div style={{ padding: '1.5rem', maxWidth: 900, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#111', margin: '0 0 4px' }}>
          Welcome back, {firstName}!
        </h2>
        <p style={{ color: '#6b7280', fontSize: 14, margin: 0 }}>Your activity overview</p>
      </div>

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <StatCard icon="🏠" label="Bookings" value={s.bookings ?? 0} bg="#dbeafe" color="#2563eb" />
        <StatCard icon="📋" label="Applications" value={s.applications ?? 0} bg="#fef3c7" color="#d97706"
          sub={s.applications ? `${data?.applicationSummary?.approved ?? 0} approved` : null} />
        <StatCard icon="📜" label="Active Leases" value={s.activeLeases ?? 0} bg="#f0fdf4" color="#16a34a" />
        <StatCard icon="🔍" label="Inspections" value={s.inspections ?? 0} bg="#ede9fe" color="#7c3aed" />
        <StatCard icon="🔒" label="Escrows" value={s.escrows ?? 0} bg="#fff7ed" color="#ea580c" />
        <StatCard icon="💰" label="Wallet" value={fmt(payout.walletBalance)} bg="#f0fdf4" color="#16a34a"
          sub={payout.walletBalance > 0 ? 'Available for payout' : null} />
      </div>

      {/* ── Upcoming Countdowns ─────────────────────────────────────────────── */}
      {(bkCounts.length > 0 || lsCounts.length > 0 || insCounts.length > 0) && (
        <Section title="⏱ Upcoming & Active" count={bkCounts.length + lsCounts.length + insCounts.length}>
          {bkCounts.map(b => (
            <div key={b.bookingId} style={{ padding: '8px 0', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 13 }}>🏨 {b.propertyTitle}</div>
                <div style={{ fontSize: 12, color: '#6b7280' }}>
                  Check-in: {fmtDate(b.checkIn)} · Check-out: {fmtDate(b.checkOut)} · {b.nights} night{b.nights !== 1 ? 's' : ''}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <Badge status={b.status} />
                {b.isActive
                  ? <CountdownBadge days={b.daysToCheckOut} label="to checkout" />
                  : !b.isPast && <CountdownBadge days={b.daysToCheckIn} label="to check-in" />
                }
              </div>
            </div>
          ))}
          {lsCounts.map(l => (
            <div key={l.leaseId} style={{ padding: '8px 0', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 13 }}>📜 {l.propertyTitle}</div>
                <div style={{ fontSize: 12, color: '#6b7280' }}>
                  Rent due: {fmtDate(l.nextDueDate)} · {fmt(l.nextDueAmount)}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <Badge status={l.isOverdue ? 'cancelled' : 'active'} />
                <CountdownBadge days={l.daysUntilDue} label={l.isOverdue ? 'overdue' : 'until due'} />
              </div>
            </div>
          ))}
          {insCounts.map(i => (
            <div key={i.inspectionId} style={{ padding: '8px 0', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 13 }}>🔍 {i.propertyTitle}</div>
                <div style={{ fontSize: 12, color: '#6b7280' }}>Inspection: {fmtDate(i.confirmedDate)}</div>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <Badge status="scheduled" />
                <CountdownBadge days={i.daysUntil} label="away" />
              </div>
            </div>
          ))}
        </Section>
      )}

      {/* ── Bookings ─────────────────────────────────────────────────────────── */}
      <Section title="🏨 My Bookings" count={bookings.length} emptyMsg="No bookings yet. Book a shortlet or hotel to get started.">
        {bookings.length > 0 && (
          <>
            <Row cols={[
              { value: 'Property', flex: 2, muted: true },
              { value: 'Check-in', flex: 1, muted: true },
              { value: 'Check-out', flex: 1, muted: true },
              { value: 'Amount', flex: 1, muted: true },
              { value: 'Status', flex: 1, muted: true }
            ]} />
            {bookings.map(b => (
              <Row key={b._id} cols={[
                { value: b.property?.title || '—', flex: 2 },
                { value: fmtDate(b.checkIn), flex: 1, muted: true },
                { value: fmtDate(b.checkOut), flex: 1, muted: true },
                { value: fmt(b.payment?.total, b.payment?.currency), flex: 1 },
                { value: <Badge status={b.status} />, flex: 1 }
              ]} />
            ))}
          </>
        )}
      </Section>

      {/* ── Property Applications ─────────────────────────────────────────────── */}
      <Section title="📋 My Applications" count={applications.length} emptyMsg="No property applications yet.">
        {applications.length > 0 && (
          <>
            <Row cols={[
              { value: 'Property', flex: 2, muted: true },
              { value: 'Type', flex: 1, muted: true },
              { value: 'Applied', flex: 1, muted: true },
              { value: 'Status', flex: 1, muted: true }
            ]} />
            {applications.map(a => (
              <Row key={a._id} cols={[
                { value: a.propertyId?.title || '—', flex: 2 },
                { value: a.applicationType || '—', flex: 1, muted: true },
                { value: fmtDate(a.createdAt), flex: 1, muted: true },
                { value: <Badge status={a.status} />, flex: 1 }
              ]} />
            ))}
          </>
        )}
      </Section>

      {/* ── Leases ────────────────────────────────────────────────────────────── */}
      <Section title="📜 My Leases" count={leases.length} emptyMsg="No active leases.">
        {leases.length > 0 && (
          <>
            <Row cols={[
              { value: 'Property', flex: 2, muted: true },
              { value: 'Start', flex: 1, muted: true },
              { value: 'End', flex: 1, muted: true },
              { value: 'Rent', flex: 1, muted: true },
              { value: 'Status', flex: 1, muted: true }
            ]} />
            {leases.map(l => {
              const nextDue = (l.installments || []).find(i => i.status === 'pending' || i.status === 'overdue')
              const daysLeft = countdown(l.endDate)
              return (
                <Row key={l._id} cols={[
                  { value: l.property?.title || '—', flex: 2 },
                  { value: fmtDate(l.startDate), flex: 1, muted: true },
                  { value: <span>{fmtDate(l.endDate)} {daysLeft != null && daysLeft <= 30 ? <CountdownBadge days={daysLeft} label="left" /> : null}</span>, flex: 1 },
                  { value: <span>{fmt(l.rentAmount)}{nextDue ? <span style={{ marginLeft: 6 }}><CountdownBadge days={countdown(nextDue.dueDate)} label="due" /></span> : null}</span>, flex: 1 },
                  { value: <Badge status={l.status} />, flex: 1 }
                ]} />
              )
            })}
          </>
        )}
      </Section>

      {/* ── Inspection Requests ───────────────────────────────────────────────── */}
      <Section title="🔍 Inspection Requests" count={inspections.length} emptyMsg="No inspection requests yet.">
        {inspections.length > 0 && (
          <>
            <Row cols={[
              { value: 'Property', flex: 2, muted: true },
              { value: 'Preferred Date', flex: 1, muted: true },
              { value: 'Confirmed Date', flex: 1, muted: true },
              { value: 'Fee', flex: 1, muted: true },
              { value: 'Status', flex: 1, muted: true }
            ]} />
            {inspections.map(i => {
              const daysToInspection = i.confirmedDate ? countdown(i.confirmedDate) : null
              return (
                <Row key={i._id} cols={[
                  { value: i.property?.title || '—', flex: 2 },
                  { value: fmtDate(i.preferredDate), flex: 1, muted: true },
                  { value: <span>{fmtDate(i.confirmedDate)} {daysToInspection != null && daysToInspection >= 0 ? <CountdownBadge days={daysToInspection} label="away" /> : null}</span>, flex: 1 },
                  { value: fmt(i.fee?.amount), flex: 1, muted: true },
                  { value: <Badge status={i.status} />, flex: 1 }
                ]} />
              )
            })}
          </>
        )}
      </Section>

      {/* ── Escrows ──────────────────────────────────────────────────────────── */}
      <Section title="🔒 My Escrows" count={escrows.length} emptyMsg="No escrow transactions.">
        {escrows.length > 0 && (
          <>
            <Row cols={[
              { value: 'Type', flex: 1, muted: true },
              { value: 'Amount', flex: 1, muted: true },
              { value: 'Payee', flex: 1, muted: true },
              { value: 'Date', flex: 1, muted: true },
              { value: 'Status', flex: 1, muted: true }
            ]} />
            {escrows.map(e => (
              <Row key={e._id} cols={[
                { value: e.type || '—', flex: 1 },
                { value: fmt(e.amount, e.currency), flex: 1 },
                { value: e.payee ? `${e.payee.firstName} ${e.payee.lastName}` : '—', flex: 1, muted: true },
                { value: fmtDate(e.createdAt), flex: 1, muted: true },
                { value: <Badge status={e.status} />, flex: 1 }
              ]} />
            ))}
          </>
        )}
      </Section>

      {/* ── Payments / Transactions ──────────────────────────────────────────── */}
      <Section title="💳 Payments" count={transactions.length} emptyMsg="No payment history.">
        {transactions.length > 0 && (
          <>
            <Row cols={[
              { value: 'Type', flex: 1, muted: true },
              { value: 'Amount', flex: 1, muted: true },
              { value: 'Date', flex: 1, muted: true },
              { value: 'Status', flex: 1, muted: true }
            ]} />
            {transactions.map(t => (
              <Row key={t._id} cols={[
                { value: t.type || '—', flex: 1 },
                { value: fmt(t.amount, t.currency), flex: 1 },
                { value: fmtDate(t.createdAt), flex: 1, muted: true },
                { value: <Badge status={t.status} />, flex: 1 }
              ]} />
            ))}
          </>
        )}
      </Section>

      {/* ── Wallet / Payout ──────────────────────────────────────────────────── */}
      {payout.walletBalance > 0 && (
        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 12, padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, color: '#166534' }}>💰 Wallet Balance</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#16a34a', marginTop: 4 }}>{fmt(payout.walletBalance, payout.currency)}</div>
            <div style={{ fontSize: 12, color: '#4ade80', marginTop: 2 }}>Available in your PropNect wallet (caution fee refunds, credits)</div>
          </div>
          <div style={{ fontSize: 12, color: '#166534' }}>Contact support to request a bank transfer →</div>
        </div>
      )}

      {/* ── Total spent (from transaction history) ───────────────────────────── */}
      {(() => {
        const paid = transactions.filter(t => t.status === 'completed')
        const total = paid.reduce((s, t) => s + (t.amount || 0), 0)
        if (!total) return null
        return (
          <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 12, padding: '1rem 1.25rem', marginTop: '0.75rem' }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: '#374151', marginBottom: 4 }}>📊 Total Payments Made</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#374151' }}>{fmt(total, 'NGN')}</div>
            <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>{paid.length} completed transaction{paid.length !== 1 ? 's' : ''}</div>
          </div>
        )
      })()}
    </div>
  )
}
