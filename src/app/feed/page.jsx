// PHASE 3+ — TikTok-style property feed. Parked until Phase 3 per product strategy.
// Code preserved below. Re-enable by removing the redirect and uncommenting the implementation.

'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function FeedPage () {
  const router = useRouter()
  useEffect(() => { router.replace('/search') }, [router])
  return null
}

/*
import React, { useState, useEffect, useRef, useCallback } from 'react'
import './feed.scss'
import { useRouter } from 'next/navigation'
import { encodeId } from '@/libs/propId'
import axios from 'axios'
import {
  Heart,
  Share2,
  MapPin,
  BedDouble,
  Bath,
  ArrowLeft,
  Search,
  Star,
  Home,
  Eye,
  Maximize2
} from 'lucide-react'

const API = process.env.NEXT_PUBLIC_BACKEND_URL || ''

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'rent', label: 'Rent' },
  { key: 'buy', label: 'Buy' },
  { key: 'shortlet', label: 'Shortlet' }
]

function formatPrice (price, purpose) {
  if (!price) return null
  const fmt = new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0
  }).format(price)
  const p = (purpose || '').toLowerCase()
  if (p.includes('rent')) return `${fmt} · monthly`
  if (p.includes('shortlet')) return `${fmt} · nightly`
  return fmt
}

function getPurposeMeta (purpose) {
  const p = (purpose || '').toLowerCase()
  if (p.includes('sale')) return { label: 'For Sale', cls: 'sale' }
  if (p.includes('shortlet')) return { label: 'Shortlet', cls: 'shortlet' }
  return { label: 'For Rent', cls: 'rent' }
}

export default function FeedPage () {
  const router = useRouter()
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState('all')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [saved, setSaved] = useState(new Set())
  const [expandedCard, setExpandedCard] = useState(null)
  const feedRef = useRef(null)
  const cardRefs = useRef([])

  const fetchProperties = useCallback(() => {
    axios
      .get(`${API}/api/properties/all?limit=30&sort=-createdAt`)
      .then(r => {
        const list = r.data?.properties || []
        setProperties(list)
      })
      .catch(() => setProperties([]))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    fetchProperties()
  }, [fetchProperties])

  useEffect(() => {
    const els = cardRefs.current.filter(Boolean)
    if (!els.length) return
    const obs = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const idx = cardRefs.current.indexOf(entry.target)
            if (idx !== -1) {
              setCurrentIndex(idx)
              setExpandedCard(null)
            }
          }
        })
      },
      { root: feedRef.current, threshold: 0.65 }
    )
    els.forEach(el => obs.observe(el))
    return () => obs.disconnect()
  }, [properties, activeFilter])

  const filtered =
    activeFilter === 'all'
      ? properties
      : properties.filter(p => {
          const pu = (p.purpose || '').toLowerCase()
          if (activeFilter === 'rent') return pu.includes('rent')
          if (activeFilter === 'buy') return pu.includes('sale')
          if (activeFilter === 'shortlet') return pu.includes('shortlet')
          return true
        })

  const toggleSave = useCallback((id, e) => {
    e?.stopPropagation()
    setSaved(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }, [])

  const handleShare = useCallback((prop, e) => {
    e?.stopPropagation()
    const url = `${window.location.origin}/property/${encodeId(prop._id || prop.id)}`
    if (navigator.share) {
      navigator.share({ title: prop.title, url })
    } else {
      navigator.clipboard?.writeText(url)
    }
  }, [])

  return (
    <div className='pf'>
      <header className='pf-header'>
        <button className='pf-header__back' onClick={() => router.push('/')}>
          <ArrowLeft size={20} />
        </button>

        <div className='pf-header__filters'>
          {FILTERS.map(f => (
            <button
              key={f.key}
              className={`pf-filter${activeFilter === f.key ? ' active' : ''}`}
              onClick={() => {
                setActiveFilter(f.key)
                setCurrentIndex(0)
                feedRef.current?.scrollTo({ top: 0 })
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        {filtered.length > 1 && (
          <span className='pf-header__counter'>
            {currentIndex + 1} / {filtered.length}
          </span>
        )}

        <button
          className='pf-header__search'
          onClick={() => router.push('/search')}
        >
          <Search size={20} />
        </button>

        {filtered.length > 1 && (
          <div className='pf-header__track'>
            <div
              className='pf-header__track-fill'
              style={{ width: `${((currentIndex + 1) / filtered.length) * 100}%` }}
            />
          </div>
        )}
      </header>

      <div className='pf-feed' ref={feedRef}>
        {loading ? (
          <div className='pf-loading'>
            <div className='pf-loading__ring' />
            <p>Loading properties…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className='pf-empty'>
            <Home size={48} strokeWidth={1} />
            <p>No properties found</p>
            <button onClick={() => setActiveFilter('all')}>Show all</button>
          </div>
        ) : (
          filtered.map((prop, i) => {
            const id = encodeId(prop._id || prop.id)
            const isSaved = saved.has(id)
            const isExpanded = expandedCard === id
            const { label: purposeLabel, cls: purposeCls } = getPurposeMeta(prop.purpose)
            const price = formatPrice(prop.rentPrice || prop.price, prop.purpose)
            const loc = [prop.city, prop.state].filter(Boolean).join(', ') || prop.location || ''
            const ownerName = prop.ownerName || prop.owner?.name || null

            const mediaItem = prop.media?.[0]
            const isVideo = mediaItem?.type === 'video'
            const mediaUrl = isVideo
              ? mediaItem.url
              : mediaItem?.url || prop.images?.[0]?.url || prop.images?.[0] || null

            const fallbackImg = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80'

            return (
              <div
                key={id}
                className={`pf-card${isExpanded ? ' expanded' : ''}`}
                ref={el => (cardRefs.current[i] = el)}
              >
                <div className='pf-card__media'>
                  {isVideo ? (
                    <video
                      src={mediaUrl}
                      autoPlay={i === currentIndex}
                      loop
                      muted
                      playsInline
                      className='pf-card__video'
                    />
                  ) : (
                    <img
                      src={mediaUrl || fallbackImg}
                      alt={prop.title}
                      className='pf-card__img'
                      loading={i < 3 ? 'eager' : 'lazy'}
                    />
                  )}
                  {prop.images?.length > 1 && (
                    <div className='pf-img-dots'>
                      {prop.images.slice(0, 5).map((_, di) => (
                        <div key={di} className={`pf-img-dot${di === 0 ? ' active' : ''}`} />
                      ))}
                    </div>
                  )}
                  <div className='pf-card__gradient' />
                </div>

                <div className='pf-rail'>
                  <button
                    className={`pf-rail__btn${isSaved ? ' saved' : ''}`}
                    onClick={e => toggleSave(id, e)}
                    title={isSaved ? 'Unsave' : 'Save'}
                  >
                    <div className='pf-rail__icon'>
                      <Heart size={22} fill={isSaved ? '#C4E53C' : 'none'} stroke={isSaved ? '#C4E53C' : 'currentColor'} />
                    </div>
                    <span className='pf-rail__label'>{isSaved ? 'Saved' : 'Save'}</span>
                  </button>

                  <button
                    className='pf-rail__btn'
                    onClick={e => handleShare(prop, e)}
                    title='Share'
                  >
                    <div className='pf-rail__icon'>
                      <Share2 size={22} />
                    </div>
                    <span className='pf-rail__label'>Share</span>
                  </button>

                  <a
                    className='pf-rail__btn pf-rail__btn--view'
                    href={`/property/${id}`}
                    title='View property'
                  >
                    <div className='pf-rail__icon'>
                      <Eye size={22} />
                    </div>
                    <span className='pf-rail__label'>View</span>
                  </a>
                </div>

                <div
                  className={`pf-info${isExpanded ? ' pf-info--expanded' : ''}`}
                  onClick={() => setExpandedCard(isExpanded ? null : id)}
                >
                  <div className='pf-info__drag'>
                    <div className='pf-info__drag-handle' />
                  </div>

                  {ownerName && (
                    <div className='pf-attr'>
                      <span className='pf-attr__av'>{ownerName.charAt(0).toUpperCase()}</span>
                      <span className='pf-attr__name'>{ownerName}</span>
                    </div>
                  )}

                  <div className='pf-info__top'>
                    <span className={`pf-badge pf-badge--${purposeCls}`}>{purposeLabel}</span>
                    {prop.stats?.averageRating > 0 && (
                      <span className='pf-info__rating'>
                        <Star size={12} fill='#C4E53C' stroke='none' />
                        {prop.stats.averageRating.toFixed(1)}
                      </span>
                    )}
                  </div>

                  <h2 className='pf-info__title'>{prop.title}</h2>

                  {loc && (
                    <p className='pf-info__loc'>
                      <MapPin size={13} />
                      {loc}
                    </p>
                  )}

                  <div className='pf-info__meta'>
                    {prop.bedrooms != null && (
                      <span><BedDouble size={13} /> {prop.bedrooms} bed{prop.bedrooms !== 1 ? 's' : ''}</span>
                    )}
                    {prop.bathrooms != null && (
                      <span><Bath size={13} /> {prop.bathrooms} bath{prop.bathrooms !== 1 ? 's' : ''}</span>
                    )}
                    {prop.sqft && (
                      <span><Maximize2 size={13} /> {prop.sqft} sqft</span>
                    )}
                  </div>

                  {price && <div className='pf-info__price'>{price}</div>}

                  {isExpanded && (
                    <div className='pf-info__extra'>
                      {prop.description && (
                        <p className='pf-info__desc'>
                          {prop.description.slice(0, 200)}{prop.description.length > 200 ? '…' : ''}
                        </p>
                      )}
                      <a
                        className='pf-info__cta'
                        href={`/property/${id}`}
                        onClick={e => e.stopPropagation()}
                      >
                        View Full Listing →
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>

      <div className='pf-hint' aria-hidden='true'>
        <span>Swipe up to explore</span>
      </div>
    </div>
  )
}
*/
