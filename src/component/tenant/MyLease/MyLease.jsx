'use client'
/**
 * MyLease.jsx — Tenant lease tracker with real-time countdown (web)
 */
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { api } from '@/libs/api-client'
import './MyLease.scss'

function computeCountdown (endDate, startDate) {
  const now = Date.now()
  const end = new Date(endDate).getTime()
  const start = new Date(startDate).getTime()
  const remainingMs = Math.max(0, end - now)
  const totalMs = end - start
  return {
    days: Math.floor(remainingMs / 86400000),
    hours: Math.floor((remainingMs % 86400000) / 3600000),
    minutes: Math.floor((remainingMs % 3600000) / 60000),
    seconds: Math.floor((remainingMs % 60000) / 1000),
    progressPct: totalMs > 0 ? Math.min(100, Math.round(((now - start) / totalMs) * 100)) : 100,
    isExpiringSoon: remainingMs > 0 && remainingMs <= 7 * 86400000,
    isExpired: remainingMs === 0
  }
}

function fmt2 (n) { return String(Math.max(0, n)).padStart(2, '0') }
function fmtDate (d) {
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}
function fmtCurrency (n) {
  if (!n) return '—'
  return `₦${Number(n).toLocaleString()}`
}
function locationStr (loc) {
  if (!loc) return '—'
  if (typeof loc === 'string') return loc
  return [loc.address, loc.city, loc.state].filter(Boolean).join(', ')
}

function LeaseCard ({ lease }) {
  const [tick, setTick] = useState(0)
  const timerRef = useRef(null)

  useEffect(() => {
    timerRef.current = setInterval(() => setTick(t => t + 1), 1000)
    return () => clearInterval(timerRef.current)
  }, [])

  const cd = useMemo(
    () => computeCountdown(lease.endDate, lease.startDate),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [lease.endDate, lease.startDate, tick]
  )

  const barColor = cd.isExpired ? '#DC2626' : cd.isExpiringSoon ? '#F59E0B' : '#0B3D28'
  const prop = lease.property || {}
  const landlord = lease.landlord || {}
  const img = prop.images?.[0] || prop.media?.[0]?.url || null

  return (
    <div className='ml-card'>
      {/* Property header */}
      <div className='ml-card__prop-row'>
        <div className='ml-card__thumb'>
          {img
            ? <img src={img} alt={prop.title} />
            : <span className='ml-card__thumb-icon'>🏠</span>
          }
        </div>
        <div className='ml-card__prop-info'>
          <p className='ml-card__prop-title'>{prop.title || 'Property'}</p>
          <p className='ml-card__prop-loc'>{locationStr(prop.location)}</p>
          <p className='ml-card__prop-cat'>{prop.category || ''}</p>
        </div>
        <span className={`ml-badge ml-badge--${lease.status}`}>{lease.status}</span>
      </div>

      {/* Countdown block */}
      <div className={`ml-countdown ${cd.isExpiringSoon ? 'ml-countdown--warn' : ''} ${cd.isExpired ? 'ml-countdown--expired' : ''}`}>
        {cd.isExpired ? (
          <p className='ml-countdown__expired'>Lease Expired</p>
        ) : (
          <>
            <p className='ml-countdown__label'>
              {cd.isExpiringSoon ? '⚠️ Expiring Soon' : 'Time Remaining'}
            </p>
            <div className='ml-countdown__units'>
              <CountUnit v={fmt2(cd.days)} l='days' />
              <span className='ml-colon'>:</span>
              <CountUnit v={fmt2(cd.hours)} l='hrs' />
              <span className='ml-colon'>:</span>
              <CountUnit v={fmt2(cd.minutes)} l='min' />
              <span className='ml-colon'>:</span>
              <CountUnit v={fmt2(cd.seconds)} l='sec' />
            </div>
          </>
        )}
      </div>

      {/* Progress bar */}
      <div className='ml-progress-wrap'>
        <div className='ml-progress-track'>
          <div className='ml-progress-fill' style={{ width: `${cd.progressPct}%`, background: barColor }} />
        </div>
        <div className='ml-progress-labels'>
          <span>{fmtDate(lease.startDate)}</span>
          <span style={{ color: barColor, fontWeight: 700 }}>{cd.progressPct}% elapsed</span>
          <span>{fmtDate(lease.endDate)}</span>
        </div>
      </div>

      {/* Details grid */}
      <div className='ml-details'>
        <div className='ml-detail-item'>
          <span className='ml-detail-label'>Monthly Rent</span>
          <span className='ml-detail-value'>{fmtCurrency(lease.rentAmount)}</span>
        </div>
        <div className='ml-detail-item'>
          <span className='ml-detail-label'>Deposit</span>
          <span className='ml-detail-value'>{fmtCurrency(lease.depositAmount)}</span>
        </div>
        <div className='ml-detail-item'>
          <span className='ml-detail-label'>Payment Type</span>
          <span className='ml-detail-value' style={{ textTransform: 'capitalize' }}>
            {(lease.paymentType || '').replace(/_/g, ' ')}
          </span>
        </div>
        <div className='ml-detail-item'>
          <span className='ml-detail-label'>Start Date</span>
          <span className='ml-detail-value'>{fmtDate(lease.startDate)}</span>
        </div>
        <div className='ml-detail-item'>
          <span className='ml-detail-label'>End Date</span>
          <span className='ml-detail-value' style={{ color: barColor }}>{fmtDate(lease.endDate)}</span>
        </div>
        <div className='ml-detail-item'>
          <span className='ml-detail-label'>Total Amount</span>
          <span className='ml-detail-value'>{fmtCurrency(lease.totalLeaseAmount)}</span>
        </div>
      </div>

      {/* Landlord */}
      <div className='ml-landlord'>
        <div className='ml-landlord__avatar'>
          {landlord.avatar
            ? <img src={landlord.avatar} alt='' />
            : <span>{(landlord.firstName || 'L')[0]}</span>
          }
        </div>
        <div className='ml-landlord__info'>
          <p className='ml-landlord__name'>{landlord.firstName} {landlord.lastName}</p>
          <p className='ml-landlord__contact'>{landlord.phone || landlord.email || ''}</p>
        </div>
        <a
          className='ml-landlord__msg-btn'
          href={`mailto:${landlord.email || ''}`}
        >
          Message Landlord
        </a>
      </div>

      {/* Installments */}
      {lease.installments?.length > 0 && (
        <div className='ml-installments'>
          <p className='ml-installments__title'>Payment Schedule</p>
          <div className='ml-installments__list'>
            {lease.installments.map((inst, i) => (
              <div key={i} className={`ml-inst ml-inst--${inst.status}`}>
                <span className='ml-inst__label'>{inst.label || `Payment ${i + 1}`}</span>
                <span className='ml-inst__amount'>{fmtCurrency(inst.amount)}</span>
                <span className='ml-inst__date'>{fmtDate(inst.dueDate)}</span>
                <span className={`ml-inst__status ml-inst__status--${inst.status}`}>{inst.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function CountUnit ({ v, l }) {
  return (
    <div className='ml-unit'>
      <span className='ml-unit__val'>{v}</span>
      <span className='ml-unit__label'>{l}</span>
    </div>
  )
}

function Skeleton () {
  return (
    <div className='ml-skeleton'>
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className='ml-skeleton__card' />
      ))}
    </div>
  )
}

export default function MyLease () {
  const [leases, setLeases] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    api.get('/api/leases/my')
      .then(res => setLeases(res.data.leases || []))
      .catch(err => setError(err.response?.data?.message || err.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className='ml-page'>
      <h1 className='ml-page__title'>My Leases</h1>
      <Skeleton />
    </div>
  )

  if (error) return (
    <div className='ml-page'>
      <h1 className='ml-page__title'>My Leases</h1>
      <div className='ml-error'>{error}</div>
    </div>
  )

  const active = leases.filter(l => l.status === 'active')
  const past = leases.filter(l => l.status !== 'active')

  return (
    <div className='ml-page'>
      <div className='ml-page__header'>
        <div>
          <h1 className='ml-page__title'>My Leases</h1>
          <p className='ml-page__sub'>Track your rental agreements and payment schedule.</p>
        </div>
        <div className='ml-page__stats'>
          <div className='ml-stat'><strong>{active.length}</strong><span>Active</span></div>
          <div className='ml-stat'><strong>{past.length}</strong><span>Past</span></div>
        </div>
      </div>

      {leases.length === 0 ? (
        <div className='ml-empty'>
          <span className='ml-empty__icon'>🏘️</span>
          <p className='ml-empty__title'>No leases yet</p>
          <p className='ml-empty__desc'>
            When you make a payment for a property, your lease will appear here with a live countdown.
          </p>
        </div>
      ) : (
        <>
          {active.length > 0 && (
            <section>
              <h2 className='ml-section-title'>Active Leases</h2>
              <div className='ml-list'>
                {active.map(l => <LeaseCard key={l._id} lease={l} />)}
              </div>
            </section>
          )}
          {past.length > 0 && (
            <section>
              <h2 className='ml-section-title'>Past Leases</h2>
              <div className='ml-list'>
                {past.map(l => <LeaseCard key={l._id} lease={l} />)}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  )
}
