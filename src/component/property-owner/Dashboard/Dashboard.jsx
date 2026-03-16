'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { api } from '@/libs/api-client'
import './Dashboard.scss'

// ─── ICONS ────────────────────────────────────────────────────────────────────
const Icon = {
  Building: () => (
    <svg
      width='18'
      height='18'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
    >
      <rect x='3' y='3' width='18' height='18' rx='2' />
      <path d='M9 22V12h6v10M9 7h1M14 7h1M9 12h1M14 12h1' />
    </svg>
  ),
  Eye: () => (
    <svg
      width='15'
      height='15'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
    >
      <path d='M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z' />
      <circle cx='12' cy='12' r='3' />
    </svg>
  ),
  Heart: () => (
    <svg
      width='15'
      height='15'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
    >
      <path d='M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z' />
    </svg>
  ),
  MessageCircle: () => (
    <svg
      width='15'
      height='15'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
    >
      <path d='M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z' />
    </svg>
  ),
  CheckCircle: () => (
    <svg
      width='15'
      height='15'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
    >
      <path d='M22 11.08V12a10 10 0 1 1-5.93-9.14' />
      <polyline points='22 4 12 14.01 9 11.01' />
    </svg>
  ),
  Clock: () => (
    <svg
      width='15'
      height='15'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
    >
      <circle cx='12' cy='12' r='10' />
      <polyline points='12 6 12 12 16 14' />
    </svg>
  ),
  Plus: () => (
    <svg
      width='16'
      height='16'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2.5'
      strokeLinecap='round'
    >
      <line x1='12' y1='5' x2='12' y2='19' />
      <line x1='5' y1='12' x2='19' y2='12' />
    </svg>
  ),
  MapPin: () => (
    <svg
      width='12'
      height='12'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
    >
      <path d='M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z' />
      <circle cx='12' cy='10' r='3' />
    </svg>
  ),
  TrendUp: () => (
    <svg
      width='13'
      height='13'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2.5'
      strokeLinecap='round'
    >
      <polyline points='23 6 13.5 15.5 8.5 10.5 1 18' />
      <polyline points='17 6 23 6 23 12' />
    </svg>
  ),
  TrendDown: () => (
    <svg
      width='13'
      height='13'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2.5'
      strokeLinecap='round'
    >
      <polyline points='23 18 13.5 8.5 8.5 13.5 1 6' />
      <polyline points='17 18 23 18 23 12' />
    </svg>
  ),
  Edit: () => (
    <svg
      width='14'
      height='14'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
    >
      <path d='M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7' />
      <path d='M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z' />
    </svg>
  ),
  ExternalLink: () => (
    <svg
      width='13'
      height='13'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
    >
      <path d='M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6' />
      <polyline points='15 3 21 3 21 9' />
      <line x1='10' y1='14' x2='21' y2='3' />
    </svg>
  ),
  Upload: () => (
    <svg
      width='16'
      height='16'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
    >
      <polyline points='16 16 12 12 8 16' />
      <line x1='12' y1='12' x2='12' y2='21' />
      <path d='M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3' />
    </svg>
  ),
  Star: () => (
    <svg
      width='14'
      height='14'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
    >
      <polygon points='12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2' />
    </svg>
  ),
  Bell: () => (
    <svg
      width='16'
      height='16'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
    >
      <path d='M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9' />
      <path d='M13.73 21a2 2 0 0 1-3.46 0' />
    </svg>
  ),
  FileText: () => (
    <svg
      width='16'
      height='16'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
    >
      <path d='M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z' />
      <polyline points='14 2 14 8 20 8' />
      <line x1='16' y1='13' x2='8' y2='13' />
      <line x1='16' y1='17' x2='8' y2='17' />
      <polyline points='10 9 9 9 8 9' />
    </svg>
  ),
  BarChart: () => (
    <svg
      width='16'
      height='16'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
    >
      <line x1='18' y1='20' x2='18' y2='10' />
      <line x1='12' y1='20' x2='12' y2='4' />
      <line x1='6' y1='20' x2='6' y2='14' />
    </svg>
  ),
  Settings: () => (
    <svg
      width='16'
      height='16'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
    >
      <circle cx='12' cy='12' r='3' />
      <path d='M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14' />
    </svg>
  ),
  ChevronRight: () => (
    <svg
      width='14'
      height='14'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2.5'
      strokeLinecap='round'
    >
      <polyline points='9 18 15 12 9 6' />
    </svg>
  ),
  Award: () => (
    <svg
      width='16'
      height='16'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
    >
      <circle cx='12' cy='8' r='6' />
      <path d='M15.477 12.89L17 22l-5-3-5 3 1.523-9.11' />
    </svg>
  ),
  Home: () => (
    <svg
      width='15'
      height='15'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
    >
      <path d='M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z' />
      <polyline points='9 22 9 12 15 12 15 22' />
    </svg>
  ),
  DollarSign: () => (
    <svg
      width='18'
      height='18'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
    >
      <line x1='12' y1='1' x2='12' y2='23' />
      <path d='M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6' />
    </svg>
  ),
  Activity: () => (
    <svg
      width='18'
      height='18'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
    >
      <polyline points='22 12 18 12 15 21 9 3 6 12 2 12' />
    </svg>
  ),
  Users: () => (
    <svg
      width='18'
      height='18'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
    >
      <path d='M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2' />
      <circle cx='9' cy='7' r='4' />
      <path d='M23 21v-2a4 4 0 0 0-3-3.87' />
      <path d='M16 3.13a4 4 0 0 1 0 7.75' />
    </svg>
  ),
  RefreshCw: () => (
    <svg
      width='14'
      height='14'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
    >
      <polyline points='23 4 23 10 17 10' />
      <polyline points='1 20 1 14 7 14' />
      <path d='M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15' />
    </svg>
  )
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function fmtPrice (n, currency = 'NGN') {
  if (!n) return '—'
  if (n >= 1_000_000) return `${currency} ${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${currency} ${(n / 1_000).toFixed(0)}K`
  return `${currency} ${n.toLocaleString()}`
}

function timeAgo (date) {
  if (!date) return ''
  const diff = Date.now() - new Date(date).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'Just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  if (d < 7) return `${d}d ago`
  return new Date(date).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short'
  })
}

function getGreeting () {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

function statusMeta (status) {
  const map = {
    published: {
      label: 'Published',
      cls: 'od-badge--published',
      dot: '#5bcfb0'
    },
    draft: { label: 'Draft', cls: 'od-badge--draft', dot: '#8890a8' },
    pending_review: {
      label: 'In Review',
      cls: 'od-badge--pending',
      dot: '#f0b954'
    },
    archived: { label: 'Archived', cls: 'od-badge--archived', dot: '#4e5470' },
    suspended: {
      label: 'Suspended',
      cls: 'od-badge--suspended',
      dot: '#e05b5b'
    }
  }
  return map[status] || map.draft
}

// ─── SKELETON ─────────────────────────────────────────────────────────────────
function Skeleton ({ className = '', style = {} }) {
  return (
    <span
      className={`od-skeleton ${className}`}
      style={style}
      aria-hidden='true'
    />
  )
}

// ─── STAT CARD ────────────────────────────────────────────────────────────────
function StatCard ({ icon: IconComp, label, value, sub, accent, loading }) {
  return (
    <div className={`od-stat od-stat--${accent}`}>
      <div className='od-stat__icon-wrap'>
        <IconComp />
      </div>
      <div className='od-stat__body'>
        <p className='od-stat__label'>{label}</p>
        {loading ? (
          <Skeleton
            style={{ width: 60, height: 28, display: 'block', marginBottom: 4 }}
          />
        ) : (
          <p className='od-stat__value'>{value}</p>
        )}
        {sub && <p className='od-stat__sub'>{sub}</p>}
      </div>
    </div>
  )
}

// ─── PROPERTY ROW ─────────────────────────────────────────────────────────────
function PropertyRow ({ property, onEdit }) {
  const { label, cls } = statusMeta(property.status)
  const img = property.images?.[0] || property.media?.[0]?.url || null
  const price =
    property.purpose === 'For Sale'
      ? fmtPrice(property.price, property.currency)
      : fmtPrice(property.rentPrice, property.currency)

  return (
    <div className='od-prop-row'>
      <div className='od-prop-row__thumb'>
        {img ? (
          <img src={img} alt={property.title} loading='lazy' />
        ) : (
          <span className='od-prop-row__thumb-placeholder'>🏠</span>
        )}
      </div>
      <div className='od-prop-row__info'>
        <p className='od-prop-row__title'>
          {property.title || 'Untitled property'}
        </p>
        <p className='od-prop-row__meta'>
          <Icon.MapPin />
          {typeof property.location === 'string' ? property.location : [property.location?.address, property.location?.city, property.location?.state].filter(Boolean).join(', ') || property.city || property.address || '—'}
          <span className='od-prop-row__cat'>{property.category}</span>
        </p>
      </div>
      <div className='od-prop-row__price'>{price}</div>
      <div className='od-prop-row__stats'>
        <span>
          <Icon.Eye /> {property.viewCount || 0}
        </span>
        <span>
          <Icon.Heart /> {property.favoriteCount || 0}
        </span>
        <span>
          <Icon.MessageCircle /> {property.inquiryCount || 0}
        </span>
      </div>
      <div className='od-prop-row__status'>
        <span className={`od-badge ${cls}`}>{label}</span>
      </div>
      <div className='od-prop-row__actions'>
        <button className='od-prop-row__btn' title='Edit' onClick={() => onEdit?.(property)}>
          <Icon.Edit />
        </button>
        <button className='od-prop-row__btn' title='View'>
          <Icon.ExternalLink />
        </button>
      </div>
    </div>
  )
}

// ─── QUICK ACTION BUTTON ──────────────────────────────────────────────────────
function QuickAction ({
  icon: IconComp,
  label,
  desc,
  accent = 'default',
  onClick
}) {
  return (
    <button
      className={`od-quick-action od-quick-action--${accent}`}
      onClick={onClick}
    >
      <span className='od-quick-action__icon'>
        <IconComp />
      </span>
      <span className='od-quick-action__text'>
        <span className='od-quick-action__label'>{label}</span>
        <span className='od-quick-action__desc'>{desc}</span>
      </span>
      <span className='od-quick-action__arrow'>
        <Icon.ChevronRight />
      </span>
    </button>
  )
}

// ─── ACTIVITY ITEM ────────────────────────────────────────────────────────────
function ActivityItem ({ icon: IconComp, color, title, sub, time }) {
  return (
    <div className='od-activity-item'>
      <span className='od-activity-item__icon' style={{ '--ac': color }}>
        <IconComp />
      </span>
      <div className='od-activity-item__body'>
        <p className='od-activity-item__title'>{title}</p>
        <p className='od-activity-item__sub'>{sub}</p>
      </div>
      <span className='od-activity-item__time'>{time}</span>
    </div>
  )
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
export default function Dashboard ({ onRouteChange }) {
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [userName, setUserName] = useState('Owner')
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem('userData')
      const u = raw ? JSON.parse(raw) : {}
      if (u?.firstName) setUserName(u.firstName)
      else if (u?.name) setUserName(u.name.split(' ')[0])
    } catch {}
    fetchProperties()
  }, [])

  const fetchProperties = async (silent = false) => {
    if (!silent) setLoading(true)
    else setRefreshing(true)
    try {
      const { data } = await api.get('/api/properties/property/mine')
      if (data.success) setProperties(data.properties || [])
    } catch (err) {
      console.error('[Dashboard] fetch error', err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  // ── Derived stats ──────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const total = properties.length
    const published = properties.filter(p => p.status === 'published').length
    const draft = properties.filter(p => p.status === 'draft').length
    const pending = properties.filter(p => p.status === 'pending_review').length
    const views = properties.reduce((s, p) => s + (p.viewCount || 0), 0)
    const inquiries = properties.reduce((s, p) => s + (p.inquiryCount || 0), 0)
    const favorites = properties.reduce((s, p) => s + (p.favoriteCount || 0), 0)
    return { total, published, draft, pending, views, inquiries, favorites }
  }, [properties])

  const recent = useMemo(() => properties.slice(0, 6), [properties])

  const topPerformers = useMemo(
    () =>
      [...properties]
        .sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))
        .slice(0, 3),
    [properties]
  )

  // ── Activity feed derived from recent properties ──────────────────────────
  const activity = useMemo(() => {
    const items = []
    properties.slice(0, 6).forEach(p => {
      if (p.status === 'published' && p.publishedAt) {
        items.push({
          key: `pub-${p._id}`,
          icon: Icon.CheckCircle,
          color: '#5bcfb0',
          title: 'Listing published',
          sub: p.title || 'Untitled property',
          time: timeAgo(p.publishedAt),
          ts: new Date(p.publishedAt).getTime()
        })
      } else if (p.status === 'pending_review') {
        items.push({
          key: `rev-${p._id}`,
          icon: Icon.Clock,
          color: '#f0b954',
          title: 'Under review',
          sub: p.title || 'Untitled property',
          time: timeAgo(p.updatedAt || p.createdAt),
          ts: new Date(p.updatedAt || p.createdAt).getTime()
        })
      } else if (p.status === 'draft') {
        items.push({
          key: `dft-${p._id}`,
          icon: Icon.FileText,
          color: '#8890a8',
          title: 'Draft saved',
          sub: p.title || 'Untitled property',
          time: timeAgo(p.updatedAt || p.createdAt),
          ts: new Date(p.updatedAt || p.createdAt).getTime()
        })
      }
    })
    return items.sort((a, b) => b.ts - a.ts).slice(0, 5)
  }, [properties])

  const today = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })

  // ── Health score ──────────────────────────────────────────────────────────
  const healthScore = useMemo(() => {
    if (!properties.length) return 0
    const score = Math.round(
      (stats.published / Math.max(stats.total, 1)) * 50 +
        Math.min(stats.views / 100, 1) * 30 +
        Math.min(stats.inquiries / 10, 1) * 20
    )
    return Math.min(score, 100)
  }, [stats, properties.length])

  return (
    <div className='od-page'>
      {/* ── Ambient glow ─────────────────────────────────────────────── */}
      <div className='od-ambient' aria-hidden='true' />

      <div className='od-container'>
        {/* ── HEADER ──────────────────────────────────────────────────── */}
        <header className='od-header'>
          <div className='od-header__left'>
            <p className='od-header__date'>{today}</p>
            <h1 className='od-header__greeting'>
              {getGreeting()}, <span>{userName}</span> 👋
            </h1>
            <p className='od-header__sub'>
              Here&apos;s what&apos;s happening with your portfolio today.
            </p>
          </div>
          <div className='od-header__right'>
            <button
              className='od-btn od-btn--ghost od-btn--sm'
              onClick={() => fetchProperties(true)}
              disabled={refreshing}
              title='Refresh'
            >
              <span className={refreshing ? 'od-spin' : ''}>
                <Icon.RefreshCw />
              </span>
              Refresh
            </button>
            <button className='od-btn od-btn--primary'>
              <Icon.Plus /> Add Property
            </button>
          </div>
        </header>

        {/* ── STATS ROW ───────────────────────────────────────────────── */}
        <section className='od-stats-row'>
          <StatCard
            icon={Icon.Building}
            label='Total Listings'
            value={stats.total}
            sub={`${stats.published} published`}
            accent='gold'
            loading={loading}
          />
          <StatCard
            icon={Icon.CheckCircle}
            label='Published'
            value={stats.published}
            sub={
              stats.total
                ? `${Math.round(
                    (stats.published / stats.total) * 100
                  )}% of portfolio`
                : '—'
            }
            accent='green'
            loading={loading}
          />
          <StatCard
            icon={Icon.Clock}
            label='Drafts & Pending'
            value={stats.draft + stats.pending}
            sub={`${stats.draft} draft · ${stats.pending} in review`}
            accent='amber'
            loading={loading}
          />
          <StatCard
            icon={Icon.Eye}
            label='Total Views'
            value={stats.views.toLocaleString()}
            sub='All-time across listings'
            accent='blue'
            loading={loading}
          />
          <StatCard
            icon={Icon.MessageCircle}
            label='Inquiries'
            value={stats.inquiries}
            sub='From interested buyers'
            accent='purple'
            loading={loading}
          />
          <StatCard
            icon={Icon.Heart}
            label='Favourites'
            value={stats.favorites}
            sub='Saved by users'
            accent='red'
            loading={loading}
          />
        </section>

        {/* ── MAIN GRID ───────────────────────────────────────────────── */}
        <div className='od-main-grid'>
          {/* ── LEFT COLUMN ─────────────────────────────────────────── */}
          <div className='od-main-grid__left'>
            {/* Recent Listings */}
            <section className='od-panel'>
              <div className='od-panel__head'>
                <div>
                  <h2 className='od-panel__title'>My Listings</h2>
                  <p className='od-panel__sub'>
                    {loading
                      ? '—'
                      : `${stats.total} properties in your portfolio`}
                  </p>
                </div>
                <button className='od-btn od-btn--ghost od-btn--sm'>
                  View all <Icon.ChevronRight />
                </button>
              </div>

              <div className='od-prop-list'>
                {loading &&
                  Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className='od-prop-row od-prop-row--skeleton'>
                      <Skeleton
                        style={{
                          width: 56,
                          height: 56,
                          borderRadius: 10,
                          flexShrink: 0
                        }}
                      />
                      <div style={{ flex: 1 }}>
                        <Skeleton
                          style={{
                            width: '60%',
                            height: 14,
                            display: 'block',
                            marginBottom: 8
                          }}
                        />
                        <Skeleton
                          style={{ width: '40%', height: 12, display: 'block' }}
                        />
                      </div>
                      <Skeleton style={{ width: 80, height: 14 }} />
                    </div>
                  ))}

                {!loading && recent.length === 0 && (
                  <div className='od-empty'>
                    <span className='od-empty__icon'>🏗️</span>
                    <p className='od-empty__title'>No listings yet</p>
                    <p className='od-empty__desc'>
                      Add your first property to start managing your portfolio.
                    </p>
                    <button className='od-btn od-btn--primary'>
                      <Icon.Plus /> Add Your First Property
                    </button>
                  </div>
                )}

                {!loading &&
                  recent.map(p => (
                    <PropertyRow
                      key={p._id}
                      property={p}
                      onEdit={prop => {
                        localStorage.setItem('ep_pendingEditId', prop._id)
                        onRouteChange?.('MyProperties')
                        localStorage.setItem('ep_activePage', 'MyProperties')
                      }}
                    />
                  ))}
              </div>
            </section>

            {/* Top Performers */}
            {!loading && topPerformers.length > 0 && (
              <section className='od-panel od-panel--sm'>
                <div className='od-panel__head'>
                  <div>
                    <h2 className='od-panel__title'>Top Performers</h2>
                    <p className='od-panel__sub'>Your most-viewed listings</p>
                  </div>
                  <span className='od-panel__badge'>
                    <Icon.TrendUp /> Trending
                  </span>
                </div>
                <div className='od-top-list'>
                  {topPerformers.map((p, i) => (
                    <div key={p._id} className='od-top-item'>
                      <span className='od-top-item__rank'>{i + 1}</span>
                      <div className='od-top-item__info'>
                        <p className='od-top-item__title'>
                          {p.title || 'Untitled'}
                        </p>
                        <p className='od-top-item__loc'>
                          {typeof p.location === 'string' ? p.location : p.location?.city || p.location?.address || p.city || '—'}
                        </p>
                      </div>
                      <div className='od-top-item__views'>
                        <Icon.Eye />
                        <span>{(p.viewCount || 0).toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* ── RIGHT COLUMN ────────────────────────────────────────── */}
          <div className='od-main-grid__right'>
            {/* Portfolio Health */}
            <section className='od-panel od-panel--health'>
              <div className='od-panel__head'>
                <div>
                  <h2 className='od-panel__title'>Portfolio Health</h2>
                  <p className='od-panel__sub'>
                    Based on your listing activity
                  </p>
                </div>
                <span
                  className='od-health-score'
                  style={{
                    '--score-color':
                      healthScore >= 70
                        ? '#5bcfb0'
                        : healthScore >= 40
                        ? '#f0b954'
                        : '#e05b5b'
                  }}
                >
                  {healthScore}%
                </span>
              </div>
              <div className='od-health-bar-wrap'>
                <div className='od-health-bar'>
                  <div
                    className='od-health-bar__fill'
                    style={{
                      width: `${healthScore}%`,
                      background:
                        healthScore >= 70
                          ? '#5bcfb0'
                          : healthScore >= 40
                          ? '#f0b954'
                          : '#e05b5b'
                    }}
                  />
                </div>
              </div>
              <div className='od-health-metrics'>
                <div className='od-health-metric'>
                  <span className='od-health-metric__dot od-health-metric__dot--pub' />
                  <span>Published</span>
                  <strong>{stats.published}</strong>
                </div>
                <div className='od-health-metric'>
                  <span className='od-health-metric__dot od-health-metric__dot--draft' />
                  <span>Draft</span>
                  <strong>{stats.draft}</strong>
                </div>
                <div className='od-health-metric'>
                  <span className='od-health-metric__dot od-health-metric__dot--pend' />
                  <span>In Review</span>
                  <strong>{stats.pending}</strong>
                </div>
              </div>
            </section>

            {/* Quick Actions */}
            <section className='od-panel'>
              <div className='od-panel__head'>
                <h2 className='od-panel__title'>Quick Actions</h2>
              </div>
              <div className='od-quick-actions'>
                <QuickAction
                  icon={Icon.Upload}
                  label='Upload Property'
                  desc='List a new property'
                  accent='gold'
                  onClick={() => onRouteChange?.('PropertyUpload')}
                />
                <QuickAction
                  icon={Icon.FileText}
                  label='Manage Listings'
                  desc='Edit, publish or archive'
                  accent='default'
                  onClick={() => onRouteChange?.('MyProperties')}
                />
                <QuickAction
                  icon={Icon.Users}
                  label='Applications'
                  desc='Review buyer requests'
                  accent='default'
                  onClick={() => onRouteChange?.('Tenants')}
                />
                <QuickAction
                  icon={Icon.BarChart}
                  label='Analytics'
                  desc='Track performance'
                  accent='default'
                  onClick={() => onRouteChange?.('Reports')}
                />
                <QuickAction
                  icon={Icon.Award}
                  label='Upgrade Plan'
                  desc='See available plans'
                  accent='amber'
                  onClick={() => onRouteChange?.('Payments')}
                />
              </div>
            </section>

            {/* Activity Feed */}
            <section className='od-panel'>
              <div className='od-panel__head'>
                <div>
                  <h2 className='od-panel__title'>Recent Activity</h2>
                  <p className='od-panel__sub'>
                    Latest updates to your portfolio
                  </p>
                </div>
                <span className='od-activity-live'>
                  <span className='od-activity-live__dot' />
                  Live
                </span>
              </div>

              <div className='od-activity-feed'>
                {loading &&
                  Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className='od-activity-item'>
                      <Skeleton
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: '50%',
                          flexShrink: 0
                        }}
                      />
                      <div style={{ flex: 1 }}>
                        <Skeleton
                          style={{
                            width: '70%',
                            height: 13,
                            display: 'block',
                            marginBottom: 6
                          }}
                        />
                        <Skeleton
                          style={{ width: '50%', height: 11, display: 'block' }}
                        />
                      </div>
                    </div>
                  ))}

                {!loading && activity.length === 0 && (
                  <p className='od-activity-empty'>
                    No recent activity. Add a property to get started.
                  </p>
                )}

                {!loading &&
                  activity.map(item => (
                    <ActivityItem key={item.key} {...item} />
                  ))}
              </div>
            </section>

            {/* Upgrade CTA */}
            <div className='od-upgrade-card'>
              <div className='od-upgrade-card__icon'>
                <Icon.Star />
              </div>
              <p className='od-upgrade-card__title'>Boost Your Listings</p>
              <p className='od-upgrade-card__desc'>
                Upgrade to Gold or Elite tier and get up to 5× more views on
                your properties.
              </p>
              <button className='od-btn od-btn--gold od-btn--full' onClick={() => onRouteChange?.('Payments')}>
                <Icon.Award /> Explore Upgrade Plans
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
