'use client'

import React, { useState, useMemo, useEffect, useCallback } from 'react'
import { api } from '@/libs/api-client'
import './MyProperties.scss'
import UploadPropertyWizard from '@/component/UploadProperty/UploadProperty'
import BatchUpload from '@/component/UploadProperty/BatchUpload'
import PortfolioUpload from '@/component/UploadProperty/PortfolioUpload'

// ─── ICONS ────────────────────────────────────────────────────────────────────
const Icon = {
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
  Search: () => (
    <svg
      width='15'
      height='15'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
    >
      <circle cx='11' cy='11' r='8' />
      <line x1='21' y1='21' x2='16.65' y2='16.65' />
    </svg>
  ),
  Grid: () => (
    <svg
      width='16'
      height='16'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
    >
      <rect x='3' y='3' width='7' height='7' />
      <rect x='14' y='3' width='7' height='7' />
      <rect x='3' y='14' width='7' height='7' />
      <rect x='14' y='14' width='7' height='7' />
    </svg>
  ),
  List: () => (
    <svg
      width='16'
      height='16'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
    >
      <line x1='8' y1='6' x2='21' y2='6' />
      <line x1='8' y1='12' x2='21' y2='12' />
      <line x1='8' y1='18' x2='21' y2='18' />
      <line x1='3' y1='6' x2='3.01' y2='6' />
      <line x1='3' y1='12' x2='3.01' y2='12' />
      <line x1='3' y1='18' x2='3.01' y2='18' />
    </svg>
  ),
  Eye: () => (
    <svg
      width='13'
      height='13'
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
      width='13'
      height='13'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
    >
      <path d='M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z' />
    </svg>
  ),
  Inbox: () => (
    <svg
      width='13'
      height='13'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
    >
      <polyline points='22 12 16 12 14 15 10 15 8 12 2 12' />
      <path d='M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z' />
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
  Edit: () => (
    <svg
      width='13'
      height='13'
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
  Trash: () => (
    <svg
      width='13'
      height='13'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
    >
      <polyline points='3 6 5 6 21 6' />
      <path d='M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6' />
      <path d='M10 11v6M14 11v6' />
      <path d='M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2' />
    </svg>
  ),
  External: () => (
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
  Close: () => (
    <svg
      width='14'
      height='14'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2.5'
      strokeLinecap='round'
    >
      <line x1='18' y1='6' x2='6' y2='18' />
      <line x1='6' y1='6' x2='18' y2='18' />
    </svg>
  ),
  Check: () => (
    <svg
      width='12'
      height='12'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='3'
      strokeLinecap='round'
      strokeLinejoin='round'
    >
      <polyline points='20 6 9 17 4 12' />
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
  Shield: () => (
    <svg
      width='12'
      height='12'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
    >
      <path d='M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z' />
    </svg>
  ),
  TrendUp: () => (
    <svg
      width='12'
      height='12'
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
      width='12'
      height='12'
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
  Loader: () => (
    <svg
      width='24'
      height='24'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      style={{ animation: 'mp-spin 0.8s linear infinite' }}
    >
      <path d='M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83' />
    </svg>
  )
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────

/**
 * Format currency — defaults to NGN (Nigerian Naira)
 * Falls back gracefully if property.currency is undefined or invalid
 */
const fmt = (n, cur = 'NGN') => {
  const safeCur = ['NGN', 'USD', 'GBP', 'EUR', 'GHS', 'KES', 'ZAR'].includes(
    cur
  )
    ? cur
    : 'NGN'
  try {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: safeCur,
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(n || 0)
  } catch {
    // Fallback if locale/currency combo unsupported
    return `₦${(n || 0).toLocaleString()}`
  }
}

const fmtNum = n =>
  new Intl.NumberFormat('en-US', { notation: 'compact' }).format(n || 0)

/**
 * Get the best display price + frequency suffix from a property doc.
 * Handles both rentPrice and price fields, and the property currency.
 */
const getDisplayPrice = p => {
  const cur = p.currency || 'NGN'
  if (p.rentPrice && p.rentPrice > 0)
    return {
      amount: fmt(p.rentPrice, cur),
      suffix: `/${p.rentFrequency || 'mo'}`
    }
  if (p.price && p.price > 0) return { amount: fmt(p.price, cur), suffix: '' }
  return { amount: '—', suffix: '' }
}

/**
 * Compute AI valuation delta — null if not enough data
 */
const getAiDelta = p => {
  if (!p.aiValuation?.estimatedValue || !p.price) return null
  const pct =
    ((p.price - p.aiValuation.estimatedValue) / p.aiValuation.estimatedValue) *
    100
  if (Math.abs(pct) < 3) return { pct: pct.toFixed(1), cls: 'fair' }
  return pct > 0
    ? { pct: `+${pct.toFixed(1)}`, cls: 'over' }
    : { pct: pct.toFixed(1), cls: 'under' }
}

/**
 * Resolve the lifecycle status of a property.
 * Old documents may have status = 'Standard' (listing tier bug) — treat as draft.
 */
const VALID_STATUSES = new Set([
  'draft',
  'pending_review',
  'published',
  'archived',
  'suspended'
])

const resolveDisplayStatus = p => {
  // isDraft flag always wins
  if (p.isDraft) return 'draft'
  const s = (p.status || '').toLowerCase()
  if (VALID_STATUSES.has(s)) return s
  // Legacy: 'Standard' / 'Gold' etc. are listingTier values written to status
  return 'draft'
}

const STATUS_LABEL = {
  draft: 'Draft',
  pending_review: 'Pending',
  published: 'Published',
  archived: 'Archived',
  suspended: 'Suspended'
}

// ─── TIER SELECTOR DATA ───────────────────────────────────────────────────────

const TIER_INFO = {
  single: {
    emoji: '🏠',
    title: 'Single Property',
    label: 'Tier 1',
    desc: 'Step-by-step guided wizard with AI assistance, compliance gates, and escrow setup.',
    tags: ['AI-assisted', 'Compliance gated', 'Escrow ready'],
    comingSoon: false
  },
  batch: {
    emoji: '📋',
    title: 'Batch / CSV Upload',
    label: 'Tier 2',
    desc: 'Upload a spreadsheet to list 10–500 properties at once. Shared fields inherited across rows.',
    tags: ['CSV template', 'Bulk import', 'Agency scale'],
    comingSoon: false
  },
  project: {
    emoji: '🏗️',
    title: 'Project Portfolio',
    label: 'Tier 3',
    desc: 'Create a parent project and generate units in bulk. Each unit inherits compliance and escrow.',
    tags: ['Development projects', 'Unit inheritance', 'Enterprise'],
    comingSoon: false
  },
  api: {
    emoji: '⚙️',
    title: 'API Integration',
    label: 'Tier 4',
    desc: 'Connect from Yardi, AppFolio, or CoStar. Properties sync automatically via REST / webhook.',
    tags: ['REST / Webhook', 'Enterprise only', 'Instant sync'],
    comingSoon: true
  }
}

const STATUS_TABS = [
  { key: 'all', label: 'All' },
  { key: 'published', label: 'Published' },
  { key: 'draft', label: 'Draft' },
  { key: 'pending_review', label: 'Pending' },
  { key: 'archived', label: 'Archived' }
]

// ─── TIER SELECTOR MODAL ──────────────────────────────────────────────────────

function TierSelectorModal ({ onClose, onSelect }) {
  const [selected, setSelected] = useState(null)

  return (
    <div className='mp-modal-backdrop' onClick={onClose}>
      <div className='mp-modal' onClick={e => e.stopPropagation()}>
        <div className='mp-modal__header'>
          <div>
            <h2 className='mp-modal__title'>Add a new property</h2>
            <p className='mp-modal__sub'>
              Choose how you want to create this listing
            </p>
          </div>
          <button className='mp-modal__close' onClick={onClose}>
            <Icon.Close />
          </button>
        </div>

        <div className='mp-modal__body'>
          <div className='mp-tiers'>
            {Object.entries(TIER_INFO).map(([key, info]) => (
              <button
                key={key}
                className={`mp-tier-card${selected === key ? ' selected' : ''}${
                  info.comingSoon ? ' coming-soon' : ''
                }`}
                onClick={() => !info.comingSoon && setSelected(key)}
              >
                {info.comingSoon && (
                  <span className='mp-tier-card__coming'>Soon</span>
                )}
                <div className='mp-tier-card__check'>
                  <Icon.Check />
                </div>
                <div className='mp-tier-card__icon'>{info.emoji}</div>
                <p className='mp-tier-card__label'>{info.label}</p>
                <h3 className='mp-tier-card__title'>{info.title}</h3>
                <p className='mp-tier-card__desc'>{info.desc}</p>
                <div className='mp-tier-card__tags'>
                  {info.tags.map(t => (
                    <span key={t} className='mp-tier-tag'>
                      {t}
                    </span>
                  ))}
                </div>
              </button>
            ))}
          </div>

          <div
            style={{
              display: 'flex',
              gap: 10,
              justifyContent: 'flex-end',
              paddingTop: 8
            }}
          >
            <button className='mp-btn mp-btn--ghost' onClick={onClose}>
              Cancel
            </button>
            <button
              className='mp-btn mp-btn--amber'
              disabled={!selected}
              style={{ opacity: selected ? 1 : 0.45 }}
              onClick={() => selected && onSelect(selected)}
            >
              Continue with {selected ? TIER_INFO[selected].title : '…'} →
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── DELETE CONFIRM ───────────────────────────────────────────────────────────

function DeleteConfirm ({ property, onConfirm, onCancel, deleting }) {
  return (
    <div className='mp-modal-backdrop' onClick={onCancel}>
      <div className='mp-confirm' onClick={e => e.stopPropagation()}>
        <div className='mp-confirm__icon'>
          <Icon.Trash />
        </div>
        <h3 className='mp-confirm__title'>Delete listing?</h3>
        <p className='mp-confirm__desc'>
          You're about to permanently delete <strong>{property?.title}</strong>.
          This cannot be undone.
        </p>
        <div className='mp-confirm__actions'>
          <button
            className='mp-btn mp-btn--ghost'
            style={{ flex: 1 }}
            onClick={onCancel}
            disabled={deleting}
          >
            Cancel
          </button>
          <button
            className='mp-btn'
            style={{
              flex: 1.5,
              background: 'var(--mp-red)',
              color: '#fff',
              border: 'none',
              opacity: deleting ? 0.6 : 1
            }}
            onClick={onConfirm}
            disabled={deleting}
          >
            {deleting ? 'Deleting…' : 'Delete listing'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── PROPERTY CARD ────────────────────────────────────────────────────────────

function PropertyCard ({ property: p, listView, onEdit, onDeleteRequest, onView }) {
  const { amount, suffix } = getDisplayPrice(p)
  const delta = getAiDelta(p)
  const status = resolveDisplayStatus(p)
  const score = p.compliance?.score ?? 0
  const scoreClass = score >= 80 ? '' : score >= 50 ? 'warn' : 'low'
  const escrow = p.escrow?.status ?? 'none'

  const imgSrc = p.images?.[0] || p.media?.find(m => m.type === 'image')?.url
  const hasImage = !!imgSrc

  return (
    <div className={`mp-card${listView ? ' mp-card--list' : ''}`}>
      {/* ── Image ── */}
      <div className='mp-card__image-wrap'>
        {hasImage ? (
          <img src={imgSrc} alt={p.title} loading='lazy' />
        ) : (
          <div className='mp-card__image-placeholder'>🏢</div>
        )}

        <div className='mp-card__badges'>
          <span className={`mp-badge mp-badge--status-${status}`}>
            <span className='mp-badge__dot' />
            {STATUS_LABEL[status] || status}
          </span>
          {p.listingTier && p.listingTier !== 'Standard' && (
            <span
              className={`mp-badge mp-badge--tier-${p.listingTier.toLowerCase()}`}
            >
              ⭐ {p.listingTier}
            </span>
          )}
          {p.transactionType && (
            <span className={`mp-badge mp-badge--tx-${p.transactionType}`}>
              {p.transactionType.replace('_', ' ')}
            </span>
          )}
        </div>

        <div className='mp-card__actions'>
          <button className='mp-card__action-btn' title='View listing' onClick={() => onView(p)}>
            <Icon.External />
          </button>
          <button
            className='mp-card__action-btn'
            title='Edit'
            onClick={() => onEdit(p)}
          >
            <Icon.Edit />
          </button>
          <button
            className='mp-card__action-btn danger'
            title='Delete'
            onClick={() => onDeleteRequest(p)}
          >
            <Icon.Trash />
          </button>
        </div>
      </div>

      {/* ── Body ── */}
      <div className='mp-card__body'>
        <div className='mp-card__category-row'>
          <span className='mp-card__category'>{p.category}</span>
          <span className='mp-card__purpose'>· {p.purpose}</span>
          {p.projectLabel && (
            <span
              className='mp-card__purpose'
              style={{ marginLeft: 'auto', fontSize: 11 }}
            >
              🏗 {p.projectLabel}
            </span>
          )}
        </div>

        <h3 className='mp-card__title'>{p.title}</h3>

        <p className='mp-card__location'>
          <Icon.MapPin />{' '}
          {[p.city, p.state, p.country].filter(Boolean).join(', ') ||
            (typeof p.location === 'string' ? p.location : p.location?.city || p.location?.address || '') ||
            p.address ||
            'No location'}
        </p>

        <div className='mp-card__price-row'>
          <div>
            <span className='mp-card__price'>{amount}</span>
            {suffix && <span className='mp-card__price-freq'>{suffix}</span>}
          </div>
          {delta && (
            <span
              className={`mp-card__ai-delta mp-card__ai-delta--${delta.cls}`}
            >
              {delta.cls === 'under' ? <Icon.TrendDown /> : <Icon.TrendUp />}
              {delta.pct}%
            </span>
          )}
        </div>

        <div className='mp-card__metrics'>
          <span className='mp-card__metric'>
            <Icon.Eye /> {fmtNum(p.viewCount)}
          </span>
          <span className='mp-card__metric'>
            <Icon.Inbox /> {fmtNum(p.inquiryCount)}
          </span>
          <span className='mp-card__metric'>
            <Icon.Heart /> {fmtNum(p.favoriteCount)}
          </span>
          <span
            className={`mp-escrow-chip mp-escrow-chip--${escrow}`}
            style={{ marginLeft: 'auto' }}
          >
            <Icon.Shield /> {escrow.replace('_', ' ')}
          </span>
        </div>

        {/* Compliance progress bar */}
        <div className='mp-card__compliance'>
          <span className='mp-card__compliance-label'>
            <Icon.Shield /> Compliance
          </span>
          <div className='mp-card__compliance-bar'>
            <span className={scoreClass} style={{ width: `${score}%` }} />
          </div>
          <span className='mp-card__compliance-score'>{score}%</span>
        </div>

        <div className='mp-card__footer'>
          <button className='mp-card__footer-btn' onClick={() => onEdit(p)}>
            <Icon.Edit /> Edit
          </button>
          <button className='mp-card__footer-btn primary' onClick={() => onView(p)}>
            <Icon.External /> View
          </button>
          <button
            className='mp-card__footer-btn danger'
            onClick={() => onDeleteRequest(p)}
          >
            <Icon.Trash />
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────

export default function MyProperties ({ initialView = 'list' }) {
  // ── View orchestration ───────────────────────────────────────────────────
  // 'list' | 'tier-select' | 'wizard' | 'batch' | 'project'
  const [pageView, setPageView] = useState(initialView)
  const [selectedTier, setSelectedTier] = useState('single')
  const [editPropertyId, setEditPropertyId] = useState(null)

  // ── Pick up pending edit from Dashboard ──────────────────────────────────
  useEffect(() => {
    const pendingId = localStorage.getItem('ep_pendingEditId')
    if (pendingId) {
      localStorage.removeItem('ep_pendingEditId')
      setEditPropertyId(pendingId)
      setSelectedTier('single') // will be overridden by wizard's own fetch
      setPageView('wizard')
    }
  }, [])

  // ── Data ─────────────────────────────────────────────────────────────────
  const [properties, setProperties] = useState([])
  const [loadingList, setLoadingList] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  // ── UI filters ───────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState('all')
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [sortBy, setSortBy] = useState('newest')
  const [viewMode, setViewMode] = useState('grid')

  // ── Toast ────────────────────────────────────────────────────────────────
  const [notice, setNotice] = useState(null)

  const flash = useCallback((msg, type = 'success') => {
    setNotice({ msg, type })
    setTimeout(() => setNotice(null), 3500)
  }, [])

  // ── Fetch my properties ──────────────────────────────────────────────────
  // Route: GET /api/properties/property/mine  (auth required)
  const fetchProperties = useCallback(async () => {
    setLoadingList(true)
    try {
      const res = await api.get('/api/properties/property/mine')
      if (res.data?.success && Array.isArray(res.data.properties)) {
        setProperties(res.data.properties)
      } else {
        setProperties([])
        if (res.data?.msg) flash(res.data.msg, 'error')
      }
    } catch (err) {
      const msg =
        err.response?.data?.msg || err.message || 'Failed to load properties'
      flash(msg, 'error')
    } finally {
      setLoadingList(false)
    }
  }, [flash])

  useEffect(() => {
    fetchProperties()
  }, [fetchProperties])

  // ── Delete ───────────────────────────────────────────────────────────────
  // Route: DELETE /api/properties/:id  (auth + owner check in controller)
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      const res = await api.delete(`/api/properties/${deleteTarget._id}`)
      if (res.data?.success) {
        setProperties(prev => prev.filter(p => p._id !== deleteTarget._id))
        flash('Property deleted', 'success')
      } else {
        flash(res.data?.msg || 'Delete failed', 'error')
      }
    } catch (err) {
      const msg =
        err.response?.data?.msg || err.message || 'Error deleting property'
      flash(msg, err.response?.status === 403 ? 'warning' : 'error')
    } finally {
      setDeleting(false)
      setDeleteTarget(null)
    }
  }

  // ── Wizard orchestration ─────────────────────────────────────────────────

  const handleAddClick = () => setPageView('tier-select')

  const handleTierSelect = tier => {
    setSelectedTier(tier)
    setEditPropertyId(null)
    if (tier === 'batch') setPageView('batch')
    else if (tier === 'project') setPageView('project')
    else setPageView('wizard')
  }

  const handleEdit = property => {
    setEditPropertyId(property._id)
    setSelectedTier(property.creationTier || 'single')
    setPageView('wizard')
  }

  const handleView = useCallback(property => {
    window.open(`/property/${property._id}`, '_blank', 'noopener,noreferrer')
  }, [])

  const handleWizardBack = () => {
    setPageView('list')
    setEditPropertyId(null)
  }

  // Called by wizard after successful save — optimistic update then full refresh
  const handleWizardSaved = useCallback(
    async savedProperty => {
      setPageView('list')
      setEditPropertyId(null)

      if (savedProperty) {
        setProperties(prev => {
          const exists = prev.some(p => p._id === savedProperty._id)
          return exists
            ? prev.map(p => (p._id === savedProperty._id ? savedProperty : p))
            : [savedProperty, ...prev]
        })
      }

      await fetchProperties()
    },
    [fetchProperties]
  )

  // ── Stats ────────────────────────────────────────────────────────────────
  const stats = useMemo(
    () => ({
      total: properties.length,
      published: properties.filter(p => resolveDisplayStatus(p) === 'published')
        .length,
      draft: properties.filter(p => resolveDisplayStatus(p) === 'draft').length,
      pending: properties.filter(
        p => resolveDisplayStatus(p) === 'pending_review'
      ).length,
      views: properties.reduce((s, p) => s + (p.viewCount || 0), 0),
      inquiries: properties.reduce((s, p) => s + (p.inquiryCount || 0), 0)
    }),
    [properties]
  )

  // ── Filtered + sorted list ────────────────────────────────────────────────
  const displayed = useMemo(() => {
    let list = [...properties]

    // Tab filter — uses resolved status so legacy data is handled
    if (activeTab !== 'all') {
      list = list.filter(p => resolveDisplayStatus(p) === activeTab)
    }

    // Category
    if (categoryFilter !== 'all') {
      list = list.filter(p => p.category === categoryFilter)
    }

    // Search across title, location, address, city, category
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(
        p =>
          p.title?.toLowerCase().includes(q) ||
          (typeof p.location === 'string' ? p.location : p.location?.address || p.location?.city || '')?.toLowerCase().includes(q) ||
          p.address?.toLowerCase().includes(q) ||
          p.city?.toLowerCase().includes(q) ||
          p.category?.toLowerCase().includes(q)
      )
    }

    // Sort
    list.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt) - new Date(a.createdAt)
        case 'oldest':
          return new Date(a.createdAt) - new Date(b.createdAt)
        case 'price_asc':
          return (a.price || a.rentPrice || 0) - (b.price || b.rentPrice || 0)
        case 'price_desc':
          return (b.price || b.rentPrice || 0) - (a.price || a.rentPrice || 0)
        case 'views':
          return (b.viewCount || 0) - (a.viewCount || 0)
        default:
          return 0
      }
    })

    return list
  }, [properties, activeTab, categoryFilter, search, sortBy])

  const tabCount = key => {
    if (key === 'all') return properties.length
    return properties.filter(p => resolveDisplayStatus(p) === key).length
  }

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────

  // ── Batch upload view ─────────────────────────────────────────────────────
  if (pageView === 'batch') {
    return (
      <BatchUpload
        onBack={() => setPageView('list')}
        onComplete={() => { setPageView('list'); fetchProperties() }}
      />
    )
  }

  // ── Portfolio creation view ───────────────────────────────────────────────
  if (pageView === 'project') {
    return (
      <PortfolioUpload
        onBack={() => setPageView('list')}
        onComplete={() => { setPageView('list'); fetchProperties() }}
      />
    )
  }

  // ── Wizard view ───────────────────────────────────────────────────────────
  if (pageView === 'wizard') {
    return (
      <UploadPropertyWizard
        editPropertyId={editPropertyId}
        creationTier={selectedTier}
        onBack={handleWizardBack}
        onSaved={handleWizardSaved}
      />
    )
  }

  // ── List view (+ optional modals) ─────────────────────────────────────────
  return (
    <div className='mp-page'>
      {/* Toast notification */}
      {notice && (
        <div
          style={{
            position: 'fixed',
            top: 20,
            right: 20,
            zIndex: 9999,
            background:
              notice.type === 'error'
                ? 'var(--mp-red)'
                : notice.type === 'warning'
                ? 'var(--mp-amber)'
                : 'var(--mp-green)',
            color: '#fff',
            padding: '12px 20px',
            borderRadius: 12,
            fontFamily: 'DM Sans, sans-serif',
            fontWeight: 600,
            fontSize: 13.5,
            boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            animation: 'mp-fade-up 0.3s ease both'
          }}
        >
          <Icon.Check /> {notice.msg}
        </div>
      )}

      <div className='mp-container'>
        {/* ── HEADER ── */}
        <div className='mp-header'>
          <div>
            <p className='mp-header__eyebrow'>Property Management</p>
            <h1 className='mp-header__title'>
              My <span>Listings</span>
            </h1>
            <p className='mp-header__sub'>
              Manage, publish and track all your property listings
            </p>
          </div>
          <div className='mp-header__actions'>
            <button className='mp-btn mp-btn--ghost' onClick={() => setPageView('batch')}>
              <Icon.Upload /> Import CSV
            </button>
            <button className='mp-btn mp-btn--amber' onClick={handleAddClick}>
              <Icon.Plus /> Add Property
            </button>
          </div>
        </div>

        {/* ── STATS ── */}
        <div className='mp-stats'>
          {[
            {
              label: 'Total Listings',
              value: stats.total,
              sub: 'All time',
              trend: null
            },
            {
              label: 'Published',
              value: stats.published,
              sub: 'Live on platform',
              trend: { dir: 'up', val: `${stats.published} active` }
            },
            {
              label: 'Draft',
              value: stats.draft,
              sub: 'Needs publishing',
              trend: null
            },
            {
              label: 'Pending Review',
              value: stats.pending,
              sub: 'Awaiting approval',
              trend: null
            },
            {
              label: 'Total Views',
              value: fmtNum(stats.views),
              sub: 'Across all listings',
              trend: { dir: 'up', val: '+12%' }
            },
            {
              label: 'Inquiries',
              value: fmtNum(stats.inquiries),
              sub: 'Buyer / tenant messages',
              trend: { dir: 'up', val: '+8%' }
            }
          ].map((s, i) => (
            <div key={i} className='mp-stat'>
              <p className='mp-stat__label'>{s.label}</p>
              <p className='mp-stat__value'>{s.value}</p>
              <p className='mp-stat__sub'>
                {s.sub}
                {s.trend && (
                  <span
                    className={`mp-stat__trend mp-stat__trend--${s.trend.dir}`}
                  >
                    {s.trend.val}
                  </span>
                )}
              </p>
            </div>
          ))}
        </div>

        {/* ── TOOLBAR ── */}
        <div className='mp-toolbar'>
          <div className='mp-search'>
            <Icon.Search />
            <input
              className='mp-search__input'
              placeholder='Search title, city, category…'
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <select
            className='mp-select'
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
          >
            <option value='all'>All Categories</option>
            {[
              'Apartment',
              'House',
              'Hotel',
              'Shortlet',
              'Land',
              'Commercial',
              'Plot'
            ].map(c => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <select
            className='mp-select'
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
          >
            <option value='newest'>Newest first</option>
            <option value='oldest'>Oldest first</option>
            <option value='price_desc'>Price: High → Low</option>
            <option value='price_asc'>Price: Low → High</option>
            <option value='views'>Most viewed</option>
          </select>

          <div className='mp-toolbar__right'>
            <div className='mp-view-toggle'>
              <button
                className={`mp-btn--icon${
                  viewMode === 'grid' ? ' active' : ''
                }`}
                onClick={() => setViewMode('grid')}
                title='Grid view'
              >
                <Icon.Grid />
              </button>
              <button
                className={`mp-btn--icon${
                  viewMode === 'list' ? ' active' : ''
                }`}
                onClick={() => setViewMode('list')}
                title='List view'
              >
                <Icon.List />
              </button>
            </div>
          </div>
        </div>

        {/* ── TABS ── */}
        <div className='mp-tabs'>
          {STATUS_TABS.map(tab => (
            <button
              key={tab.key}
              className={`mp-tab${activeTab === tab.key ? ' active' : ''}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
              <span className='mp-tab__count'>{tabCount(tab.key)}</span>
            </button>
          ))}
        </div>

        {/* ── GRID / LIST ── */}
        {loadingList ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '80px 24px',
              gap: 16
            }}
          >
            <Icon.Loader />
            <p
              style={{
                fontFamily: 'DM Sans, sans-serif',
                color: 'var(--mp-muted)',
                fontSize: 14
              }}
            >
              Loading properties…
            </p>
          </div>
        ) : (
          <div
            className={`mp-grid${viewMode === 'list' ? ' mp-grid--list' : ''}`}
          >
            {displayed.length === 0 ? (
              <div className='mp-empty'>
                <div className='mp-empty__icon'>🏘️</div>
                <h3 className='mp-empty__title'>No properties found</h3>
                <p className='mp-empty__desc'>
                  {search
                    ? `No listings match "${search}". Try a different search or clear filters.`
                    : `You don't have any ${
                        activeTab !== 'all' ? activeTab : ''
                      } listings yet.`}
                </p>
                <button
                  className='mp-btn mp-btn--amber'
                  onClick={handleAddClick}
                >
                  <Icon.Plus /> Add your first property
                </button>
              </div>
            ) : (
              displayed.map((p, i) => (
                <div key={p._id} style={{ animationDelay: `${i * 50}ms` }}>
                  <PropertyCard
                    property={p}
                    listView={viewMode === 'list'}
                    onEdit={handleEdit}
                    onDeleteRequest={setDeleteTarget}
                    onView={handleView}
                  />
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* ── TIER SELECTOR MODAL ── */}
      {pageView === 'tier-select' && (
        <TierSelectorModal
          onClose={() => setPageView('list')}
          onSelect={handleTierSelect}
        />
      )}

      {/* ── DELETE CONFIRM ── */}
      {deleteTarget && (
        <DeleteConfirm
          property={deleteTarget}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
          deleting={deleting}
        />
      )}

      <style>{`@keyframes mp-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
