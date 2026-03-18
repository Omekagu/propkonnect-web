'use client'

import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import axios from 'axios'
import {
  MapPin, Phone, Mail, BedDouble, Bath, Ruler, Video, X,
  ArrowLeft, ArrowRight, Share2, Heart, Shield, CheckCircle2,
  AlertCircle, Zap, Star, Calendar, DollarSign, Building2,
  Layers, Users, TrendingUp, FileText, Clock, Eye, ChevronDown,
  ChevronUp, ExternalLink, Award, Landmark, Tag, Wifi, Car,
  Droplets, Dumbbell, Lock, Tv, Leaf
} from 'lucide-react'
import './propertyDetails.scss'

const API = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4001'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt (v, currency = 'NGN') {
  if (v == null || v === '') return '—'
  const n = typeof v === 'number' ? v : Number(String(v).replace(/[^0-9.-]/g, ''))
  if (isNaN(n)) return String(v)
  const sym = currency === 'USD' ? '$' : currency === 'GBP' ? '£' : '₦'
  return `${sym}${n.toLocaleString()}`
}

function nightsBetween (start, end) {
  if (!start || !end) return 0
  const s = new Date(start); const e = new Date(end)
  s.setHours(12, 0, 0, 0); e.setHours(12, 0, 0, 0)
  const d = Math.ceil((e - s) / (1000 * 60 * 60 * 24))
  return d > 0 ? d : 0
}

const FEATURE_ICONS = {
  'Air Conditioning': Droplets, 'Free Wi-Fi': Wifi, 'Parking': Car,
  'Swimming Pool': Droplets, 'Gym': Dumbbell, 'Security': Lock,
  'CCTV': Tv, 'Furnished': Award, 'Generator': Zap, 'Elevator': Layers,
  'Balcony': Leaf, 'Terrace': Leaf, 'Laundry': Droplets
}

function FeatureIcon ({ name }) {
  const I = FEATURE_ICONS[name] || Shield
  return <I size={13} />
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function PropertyDetails () {
  const { id } = useParams()
  const router = useRouter()

  const [property, setProperty] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [similar, setSimilar] = useState([])

  // Gallery
  const [thumbIndex, setThumbIndex] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [showAllPhotos, setShowAllPhotos] = useState(false)

  // Booking / purchase
  const [bookingStart, setBookingStart] = useState('')
  const [bookingEnd, setBookingEnd] = useState('')
  const [guests, setGuests] = useState(1)
  const [selectedRoomTypeId, setSelectedRoomTypeId] = useState(null)
  const [selectedPlanIdx, setSelectedPlanIdx] = useState(0)

  // Apply to rent modal
  const [applyOpen, setApplyOpen] = useState(false)
  const [applyMsg, setApplyMsg] = useState('')
  const [applyStatus, setApplyStatus] = useState(null)
  const [applying, setApplying] = useState(false)

  // Misc UI
  const [saved, setSaved] = useState(false)
  const [showMoreDesc, setShowMoreDesc] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')

  // ── Fetch ──────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!id) { setLoading(false); setError('No id'); return }
    setLoading(true)
    axios.get(`${API}/api/properties/${id}`)
      .then(res => {
        const p = res.data?.property ?? res.data?.data ?? res.data
        setProperty({
          ...p,
          roomTypes: p?.roomTypes || [],
          media: p?.media || [],
          images: p?.images || [],
          paymentPlans: p?.paymentPlans || [],
          features: p?.features || [],
          tags: p?.tags || [],
          units: p?.units || []
        })
      })
      .catch(e => setError(e?.response?.data?.msg || e.message || 'Failed to load'))
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    if (!id || !property) return
    axios.get(`${API}/api/properties/${id}/similar`)
      .then(r => setSimilar(r.data?.properties || r.data?.data || []))
      .catch(() => {})
  }, [id, property])

  // Initialize selections
  useEffect(() => {
    if (!property) return
    if (property.roomTypes?.length && !selectedRoomTypeId)
      setSelectedRoomTypeId(property.roomTypes[0].id || property.roomTypes[0].roomTypeId)
  }, [property])

  // Keyboard nav for lightbox
  useEffect(() => {
    const onKey = e => {
      if (e.key === 'Escape') setLightboxOpen(false)
      if (e.key === 'ArrowLeft' && lightboxOpen) setThumbIndex(i => Math.max(0, i - 1))
      if (e.key === 'ArrowRight' && lightboxOpen) setThumbIndex(i => Math.min(gallery.length - 1, i + 1))
    }
    if (lightboxOpen) { document.body.style.overflow = 'hidden'; window.addEventListener('keydown', onKey) }
    else { document.body.style.overflow = ''; window.removeEventListener('keydown', onKey) }
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', onKey) }
  }, [lightboxOpen])

  // ── Derived data ──────────────────────────────────────────────────────────

  const gallery = useMemo(() => {
    if (!property) return []
    const fromMedia = (property.media || []).map(m =>
      typeof m === 'string' ? { url: m, type: 'image' }
        : { url: m.url || m, type: m.type || (String(m.url || '').endsWith('.mp4') ? 'video' : 'image') }
    ).filter(m => m.url)
    if (fromMedia.length) return fromMedia
    const fromImages = (property.images || []).map(u => ({ url: u, type: 'image' }))
    if (fromImages.length) return fromImages
    if (property.video) return [{ url: property.video, type: 'video' }]
    return []
  }, [property])

  const cat = ((property?.category || property?.propertyType || '')).toLowerCase()
  const isLand = cat === 'land' || cat === 'plot'
  const isHotel = cat === 'hotel'
  const isShortlet = cat === 'shortlet'
  const isPerNight = isHotel || isShortlet
  const isRent = (property?.purpose || '').toLowerCase().includes('rent')
  const currency = property?.currency || 'NGN'

  const effectivePrice = useMemo(() => {
    const raw = property?.price ?? property?.startingPrice ?? property?.rentPrice ?? null
    if (raw == null) return null
    const n = typeof raw === 'number' ? raw : Number(String(raw).replace(/[^0-9.-]/g, ''))
    return isNaN(n) ? null : n
  }, [property])

  const selectedRoomType = useMemo(() => {
    if (!property) return null
    return property.roomTypes.find(r => String(r.id || r.roomTypeId) === String(selectedRoomTypeId)) || null
  }, [property, selectedRoomTypeId])

  const nights = useMemo(() => nightsBetween(bookingStart, bookingEnd), [bookingStart, bookingEnd])

  const bookingTotal = useMemo(() => {
    if (!isPerNight) return null
    if (!nights) return { nights: 0, total: 0, perNight: 0 }
    const perNight = Number(selectedRoomType?.pricePerNight || selectedRoomType?.price || selectedRoomType?.basePrice || effectivePrice || 0)
    const qty = selectedRoomType ? Number(selectedRoomType.qty) || 1 : 1
    return { nights, total: perNight * qty * nights, perNight, qty }
  }, [isPerNight, nights, selectedRoomType, effectivePrice])

  const selectedPlan = property?.paymentPlans?.[selectedPlanIdx] || null

  const owner = property?.owner || {}

  const featureList = useMemo(() => {
    const f = property?.features
    if (!f) return []
    if (Array.isArray(f)) return f
    if (typeof f === 'object') return Object.keys(f).filter(k => Boolean(f[k])).map(k => k.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase()))
    return []
  }, [property])

  const complianceScore = property?.compliance?.score ?? 0
  const complianceVerified = property?.compliance?.verified ?? false
  const escrowStatus = property?.escrow?.status || 'none'

  // ── Actions ───────────────────────────────────────────────────────────────

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: property?.title, url: window.location.href }).catch(() => {})
    } else {
      navigator.clipboard?.writeText(window.location.href)
    }
  }

  const submitApplication = async () => {
    setApplying(true); setApplyStatus(null)
    try {
      await axios.post(`${API}/api/properties/property-applications`,
        { propertyId: id, applicationType: 'rent', message: applyMsg },
        { withCredentials: true }
      )
      setApplyStatus('success')
    } catch (e) { setApplyStatus(e.response?.data?.message || 'Failed to submit') }
    finally { setApplying(false) }
  }

  const startMonnify = async () => {
    const amount = isPerNight ? bookingTotal?.total : (selectedPlan?.price || effectivePrice)
    if (!amount) { alert('Amount cannot be zero'); return }
    try {
      const res = await axios.post(`${API}/api/payment/initialize-monnify-transaction`, {
        amount, customerName: 'Guest', customerEmail: 'guest@example.com', paymentReference: 'REF-' + Date.now()
      })
      if (res.data?.requestSuccessful) window.location.href = res.data.responseBody.checkoutUrl
      else alert('Failed to initialize payment')
    } catch { alert('Payment error') }
  }

  const startStripe = async () => {
    const amount = isPerNight ? bookingTotal?.total : (selectedPlan?.price || effectivePrice)
    if (!amount) { alert('Amount cannot be zero'); return }
    const token = localStorage.getItem('authToken')
    if (!token) { alert('Please log in to continue'); return }
    try {
      const res = await axios.post(`${API}/api/payments/stripe-checkout`,
        { propertyId: id, amount, propertyTitle: property?.title, propertyImage: gallery[0]?.url },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      if (res.data?.url) window.location.href = res.data.url
      else alert('Failed to initialize Stripe checkout')
    } catch { alert('Stripe error. Please try again.') }
  }

  // ── States ────────────────────────────────────────────────────────────────

  if (loading) return (
    <div className='pd-page pd-loading'>
      <div className='pd-skeleton-hero' />
      <div className='pd-skeleton-grid'>
        {[1,2,3].map(i => <div key={i} className='pd-skeleton-card' />)}
      </div>
    </div>
  )

  if (error) return (
    <div className='pd-page pd-error'>
      <div className='pd-error-card'>
        <AlertCircle size={32} />
        <h3>Unable to load property</h3>
        <p>{error}</p>
        <button onClick={() => router.back()}>Go back</button>
      </div>
    </div>
  )

  if (!property) return null

  const descText = property.description || ''
  const DESC_LIMIT = 300
  const shortDesc = descText.length > DESC_LIMIT && !showMoreDesc ? descText.slice(0, DESC_LIMIT) + '…' : descText

  const lightboxItem = gallery[thumbIndex] || { url: '/placeholder.jpg', type: 'image' }

  const hasHouseRules = !!(
    property.houseRules ||
    (property.amenitiesDetailed && Object.keys(property.amenitiesDetailed).length > 0) ||
    ((isHotel || isShortlet) && property.languagesSpoken?.length) ||
    property.nearbyPlaces?.length ||
    property.buildingCharacteristics?.length
  )

  const TABS = [
    { id: 'overview', label: 'Overview' },
    { id: 'details', label: 'Details' },
    ...(hasHouseRules ? [{ id: 'policies', label: 'House Rules' }] : []),
    ...(property.units?.length ? [{ id: 'units', label: `Units (${property.units.length})` }] : []),
    ...(property.roomTypes?.length && isPerNight ? [{ id: 'rooms', label: `Room Types (${property.roomTypes.length})` }] : []),
    ...(isLand && property.land ? [{ id: 'land', label: 'Land Info' }] : []),
    ...(property.compliance ? [{ id: 'compliance', label: 'Compliance' }] : [])
  ]

  const AMENITY_CATEGORY_ICONS = {
    'Parking': Car, 'Internet': Wifi, 'Kitchen': '🍳', 'Bedroom': '🛏',
    'Bathroom': Droplets, 'Media & Tech': Tv, 'Pets': '🐾', 'Outdoors': Leaf,
    'Food & Drink': '🍽', 'Building': Building2, 'Entertainment': '🎮', 'Safety': Lock
  }

  return (
    <div className='pd-page'>

      {/* ── Back & breadcrumb ─────────────────────────────────────────── */}
      <div className='pd-topbar'>
        <button className='pd-back' onClick={() => router.back()}>
          <ArrowLeft size={16} /> Back
        </button>
        <nav className='pd-breadcrumb'>
          <a href='/'>Home</a>
          <span>/</span>
          <a href='/properties'>Properties</a>
          {property.city && <><span>/</span><span>{property.city}</span></>}
          {property.category && <><span>/</span><span>{property.category}</span></>}
        </nav>
        <div className='pd-topbar-actions'>
          <button className='pd-action-btn' onClick={handleShare}><Share2 size={16} /></button>
          <button className={`pd-action-btn${saved ? ' pd-action-btn--saved' : ''}`} onClick={() => setSaved(s => !s)}>
            <Heart size={16} fill={saved ? 'currentColor' : 'none'} />
          </button>
        </div>
      </div>

      {/* ── Hero Gallery ──────────────────────────────────────────────── */}
      <section className='pd-hero'>
        <div className='pd-gallery-grid' onClick={() => setLightboxOpen(true)}>
          {gallery.length === 0 ? (
            <div className='pd-gallery-placeholder'><Building2 size={48} /><span>No photos available</span></div>
          ) : gallery.length === 1 ? (
            <div className='pd-gallery-main'>
              <img src={gallery[0].url} alt={property.title} />
            </div>
          ) : (
            <>
              <div className='pd-gallery-main'>
                {gallery[0].type === 'video'
                  ? <video src={gallery[0].url} muted playsInline preload='metadata' />
                  : <img src={gallery[0].url} alt={property.title} />
                }
              </div>
              <div className='pd-gallery-side'>
                {gallery.slice(1, 5).map((m, i) => (
                  <div key={i} className={`pd-gallery-side-item${i === 3 && gallery.length > 5 ? ' pd-gallery-more' : ''}`}>
                    {m.type === 'video'
                      ? <div className='pd-video-thumb'><Video size={20} /><span>Video</span></div>
                      : <img src={m.url} alt={`Photo ${i + 2}`} loading='lazy' />
                    }
                    {i === 3 && gallery.length > 5 && (
                      <div className='pd-gallery-more-overlay'>+{gallery.length - 5} photos</div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Title block */}
        <div className='pd-title-block'>
          <div className='pd-title-left'>
            <div className='pd-badges'>
              {property.status === 'published' && <span className='pd-badge pd-badge--green'>Available</span>}
              {property.status === 'draft' && <span className='pd-badge pd-badge--gray'>Draft</span>}
              {property.listingTier && property.listingTier !== 'Standard' && (
                <span className='pd-badge pd-badge--gold'>⭐ {property.listingTier}</span>
              )}
              {complianceVerified && <span className='pd-badge pd-badge--blue'><Shield size={11} /> Verified</span>}
              {escrowStatus === 'active' && <span className='pd-badge pd-badge--purple'><Lock size={11} /> Escrow</span>}
            </div>
            <h1 className='pd-title'>{property.title}</h1>
            <div className='pd-location'>
              <MapPin size={14} />
              {[property.address, property.city, property.state, property.country].filter(Boolean).join(', ') || property.location || '—'}
            </div>
            {!isLand && (
              <div className='pd-meta-row'>
                {(property.bedrooms ?? property.beds) != null && (
                  <span className='pd-meta-item'><BedDouble size={14} /> {property.bedrooms ?? property.beds} bed{(property.bedrooms ?? property.beds) !== 1 ? 's' : ''}</span>
                )}
                {(property.bathrooms ?? property.baths) != null && (
                  <span className='pd-meta-item'><Bath size={14} /> {property.bathrooms ?? property.baths} bath{(property.bathrooms ?? property.baths) !== 1 ? 's' : ''}</span>
                )}
                {(property.sqft ?? property.area) && (
                  <span className='pd-meta-item'><Ruler size={14} /> {property.sqft ?? property.area} sqft</span>
                )}
                {property.category && (
                  <span className='pd-meta-item'><Building2 size={14} /> {property.category}</span>
                )}
              </div>
            )}
          </div>
          <div className='pd-title-right'>
            <div className='pd-price-main'>
              {isPerNight
                ? fmt(effectivePrice, currency) + ' / night'
                : fmt(effectivePrice ?? property.price ?? property.rentPrice, currency)}
            </div>
            {property.rentFrequency && !isPerNight && (
              <div className='pd-price-freq'>per {property.rentFrequency}</div>
            )}
            {property.purpose && (
              <div className='pd-purpose-badge'>{property.purpose}</div>
            )}
          </div>
        </div>
      </section>

      {/* ── Body ─────────────────────────────────────────────────────── */}
      <div className='pd-body'>

        {/* ── Main column ──────────────────────────────────────────── */}
        <main className='pd-main'>

          {/* Tabs */}
          <div className='pd-tabs'>
            {TABS.map(t => (
              <button
                key={t.id}
                className={`pd-tab${activeTab === t.id ? ' pd-tab--active' : ''}`}
                onClick={() => setActiveTab(t.id)}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* ── OVERVIEW ──────────────────────────────────────────── */}
          {activeTab === 'overview' && (
            <div className='pd-section'>
              {descText && (
                <div className='pd-card'>
                  <h3>About this property</h3>
                  <p className='pd-desc'>{shortDesc}</p>
                  {descText.length > DESC_LIMIT && (
                    <button className='pd-show-more' onClick={() => setShowMoreDesc(s => !s)}>
                      {showMoreDesc ? <><ChevronUp size={14} /> Show less</> : <><ChevronDown size={14} /> Show more</>}
                    </button>
                  )}
                </div>
              )}

              {/* Features & amenities */}
              {featureList.length > 0 && (
                <div className='pd-card'>
                  <h3>Features & Amenities</h3>
                  <div className='pd-features-grid'>
                    {featureList.map(f => (
                      <div key={f} className='pd-feature'>
                        <FeatureIcon name={f} />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Detailed amenities by category */}
              {property.amenitiesDetailed && Object.keys(property.amenitiesDetailed).length > 0 && (
                <div className='pd-card'>
                  <h3>Amenities</h3>
                  <div className='pd-amenities-section'>
                    {Object.entries(property.amenitiesDetailed).filter(([, items]) => Array.isArray(items) && items.length > 0).map(([cat, items]) => {
                      const IconComp = AMENITY_CATEGORY_ICONS[cat]
                      return (
                        <div key={cat} className='pd-amenity-cat'>
                          <div className='pd-amenity-cat__title'>
                            {IconComp && typeof IconComp !== 'string' ? <IconComp size={14} /> : <span>{AMENITY_CATEGORY_ICONS[cat]}</span>}
                            {cat}
                          </div>
                          <div className='pd-amenity-cat__items'>
                            {items.map(item => (
                              <div key={item} className='pd-amenity-item'>
                                <CheckCircle2 size={12} color='#22c55e' /> {item}
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Tags */}
              {property.tags?.length > 0 && (
                <div className='pd-card'>
                  <h3>Tags</h3>
                  <div className='pd-tags'>
                    {property.tags.map(t => <span key={t} className='pd-tag'><Tag size={11} /> {t}</span>)}
                  </div>
                </div>
              )}

              {/* Gallery grid */}
              {gallery.length > 1 && (
                <div className='pd-card'>
                  <h3>All Photos ({gallery.length})</h3>
                  <div className='pd-gallery-full'>
                    {(showAllPhotos ? gallery : gallery.slice(0, 9)).map((m, i) => (
                      <button key={i} className='pd-gallery-thumb' onClick={() => { setThumbIndex(i); setLightboxOpen(true) }}>
                        {m.type === 'video'
                          ? <div className='pd-video-chip'><Video size={16} /><span>Video</span></div>
                          : <img src={m.url} alt={`Photo ${i + 1}`} loading='lazy' />
                        }
                      </button>
                    ))}
                  </div>
                  {gallery.length > 9 && (
                    <button className='pd-show-more' onClick={() => setShowAllPhotos(s => !s)}>
                      {showAllPhotos ? 'Show less' : `Show all ${gallery.length} photos`}
                    </button>
                  )}
                </div>
              )}

              {/* AI Valuation */}
              {property.aiValuation?.estimatedValue && (
                <div className='pd-card pd-card--ai'>
                  <div className='pd-ai-header'>
                    <Zap size={16} />
                    <h3>AI Price Estimate</h3>
                    <span className={`pd-ai-confidence pd-ai-confidence--${property.aiValuation.confidence}`}>
                      {property.aiValuation.confidence} confidence
                    </span>
                  </div>
                  <div className='pd-ai-grid'>
                    <div className='pd-ai-stat'>
                      <span>Estimated Value</span>
                      <strong>{fmt(property.aiValuation.estimatedValue, property.aiValuation.currency || currency)}</strong>
                    </div>
                    {property.aiValuation.suggestedListPrice && (
                      <div className='pd-ai-stat'>
                        <span>Suggested List</span>
                        <strong>{fmt(property.aiValuation.suggestedListPrice, currency)}</strong>
                      </div>
                    )}
                    {property.aiValuation.pricePerSqft && (
                      <div className='pd-ai-stat'>
                        <span>Price / sqft</span>
                        <strong>{fmt(property.aiValuation.pricePerSqft, currency)}</strong>
                      </div>
                    )}
                    {property.aiValuation.marketTrend && (
                      <div className='pd-ai-stat'>
                        <span>Market Trend</span>
                        <strong className={`pd-trend pd-trend--${property.aiValuation.marketTrend}`}>
                          <TrendingUp size={13} /> {property.aiValuation.marketTrend}
                        </strong>
                      </div>
                    )}
                  </div>
                  {property.aiValuation.comparables && (
                    <p className='pd-ai-note'>{property.aiValuation.comparables} comparable properties analysed</p>
                  )}
                </div>
              )}

              {/* Map */}
              {(property.latitude || property.lat || (property.geo?.coordinates?.length === 2)) && (
                <div className='pd-card'>
                  <h3>Location Map</h3>
                  <div className='pd-map-wrap'>
                    <iframe
                      title='map'
                      src={`https://maps.google.com/maps?q=${property.latitude || property.lat || property.geo?.coordinates?.[1]},${property.longitude || property.lng || property.lon || property.geo?.coordinates?.[0]}&z=14&output=embed`}
                      loading='lazy'
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── DETAILS ──────────────────────────────────────────────── */}
          {activeTab === 'details' && (
            <div className='pd-section'>
              <div className='pd-card'>
                <h3>Property Details</h3>
                <div className='pd-details-grid'>
                  <div className='pd-detail'><span>Category</span><strong>{property.category || '—'}</strong></div>
                  <div className='pd-detail'><span>Purpose</span><strong>{property.purpose || '—'}</strong></div>
                  {property.transactionType && <div className='pd-detail'><span>Transaction</span><strong>{property.transactionType.replace(/_/g, ' ')}</strong></div>}
                  {!isLand && <>
                    <div className='pd-detail'><span>Bedrooms</span><strong>{property.bedrooms ?? property.beds ?? '—'}</strong></div>
                    <div className='pd-detail'><span>Bathrooms</span><strong>{property.bathrooms ?? property.baths ?? '—'}</strong></div>
                    <div className='pd-detail'><span>Floor area</span><strong>{property.sqft ? `${property.sqft} sqft` : property.area || '—'}</strong></div>
                  </>}
                  <div className='pd-detail'><span>Location</span><strong>{[property.city, property.state, property.country].filter(Boolean).join(', ') || property.location || '—'}</strong></div>
                  <div className='pd-detail'><span>Currency</span><strong>{currency}</strong></div>
                  {property.premiere && <div className='pd-detail'><span>Premiere</span><strong>✓</strong></div>}
                  {property.createdAt && <div className='pd-detail'><span>Listed</span><strong>{new Date(property.createdAt).toLocaleDateString()}</strong></div>}
                  {property.publishedAt && <div className='pd-detail'><span>Published</span><strong>{new Date(property.publishedAt).toLocaleDateString()}</strong></div>}
                  {property.viewCount > 0 && <div className='pd-detail'><span>Views</span><strong><Eye size={12} /> {property.viewCount.toLocaleString()}</strong></div>}
                  {property.projectLabel && <div className='pd-detail'><span>Project</span><strong>{property.projectLabel}</strong></div>}
                  {property.seoTitle && <div className='pd-detail'><span>SEO Title</span><strong>{property.seoTitle}</strong></div>}
                </div>
              </div>

              {/* Commercial details */}
              {cat === 'commercial' && property.commercial && (
                <div className='pd-card'>
                  <h3>Commercial Info</h3>
                  <div className='pd-details-grid'>
                    {property.commercial.businessType && <div className='pd-detail'><span>Business Type</span><strong>{property.commercial.businessType}</strong></div>}
                    {property.commercial.parkingSpaces != null && <div className='pd-detail'><span>Parking Spaces</span><strong>{property.commercial.parkingSpaces}</strong></div>}
                    {property.commercial.floorArea?.value && <div className='pd-detail'><span>Floor Area</span><strong>{property.commercial.floorArea.value} {property.commercial.floorArea.unit || 'sqm'}</strong></div>}
                  </div>
                </div>
              )}

              {/* Payment plans */}
              {property.paymentPlans?.length > 0 && (
                <div className='pd-card'>
                  <h3>Payment Plans</h3>
                  <div className='pd-plans'>
                    {property.paymentPlans.map((p, i) => (
                      <div key={i} className={`pd-plan${selectedPlanIdx === i ? ' pd-plan--active' : ''}`} onClick={() => setSelectedPlanIdx(i)}>
                        <div className='pd-plan__title'>{p.name || p.title || p.id || `Plan ${i + 1}`}</div>
                        {p.description && <div className='pd-plan__desc'>{p.description}</div>}
                        {p.priceSnapshot?.total && <div className='pd-plan__price'>{fmt(p.priceSnapshot.total, currency)}</div>}
                        {p.installments?.length > 0 && (
                          <div className='pd-plan__installments'>
                            {p.installments.map((inst, j) => (
                              <span key={j} className='pd-plan__inst'>
                                {inst.percent}% in {inst.dueInDays === 0 ? 'Day 0' : `${inst.dueInDays}d`}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Investment details */}
              {property.investmentDetails && (
                <div className='pd-card pd-card--invest'>
                  <h3><TrendingUp size={16} /> Investment Details</h3>
                  <div className='pd-details-grid'>
                    {property.investmentDetails.totalShares && <div className='pd-detail'><span>Total Shares</span><strong>{property.investmentDetails.totalShares.toLocaleString()}</strong></div>}
                    {property.investmentDetails.pricePerShare && <div className='pd-detail'><span>Price / Share</span><strong>{fmt(property.investmentDetails.pricePerShare, currency)}</strong></div>}
                    {property.investmentDetails.availableShares != null && <div className='pd-detail'><span>Available</span><strong>{property.investmentDetails.availableShares.toLocaleString()}</strong></div>}
                    {property.investmentDetails.expectedROI && <div className='pd-detail'><span>Expected ROI</span><strong>{property.investmentDetails.expectedROI}%</strong></div>}
                    {property.investmentDetails.distributionFrequency && <div className='pd-detail'><span>Distribution</span><strong>{property.investmentDetails.distributionFrequency}</strong></div>}
                    {property.investmentDetails.holdingPeriodDays && <div className='pd-detail'><span>Holding Period</span><strong>{Math.round(property.investmentDetails.holdingPeriodDays / 30)} months</strong></div>}
                    {property.investmentDetails.offeringClosesAt && <div className='pd-detail'><span>Offer Closes</span><strong>{new Date(property.investmentDetails.offeringClosesAt).toLocaleDateString()}</strong></div>}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── POLICIES ─────────────────────────────────────────── */}
          {activeTab === 'policies' && (
            <div className='pd-section'>
              {/* Check-in / Check-out */}
              {property.houseRules && (
                <div className='pd-card'>
                  {/* Check-in/out only relevant for Hotel & Shortlet */}
                  {(isHotel || isShortlet) && (property.houseRules.checkIn || property.houseRules.checkOut) && (
                    <>
                      <h3><Clock size={16} /> Check-in & Check-out</h3>
                      <div className='pd-details-grid'>
                        {property.houseRules.checkIn?.from && (
                          <div className='pd-detail'><span>Check-in from</span><strong>{property.houseRules.checkIn.from}</strong></div>
                        )}
                        {property.houseRules.checkIn?.to && (
                          <div className='pd-detail'><span>Check-in until</span><strong>{property.houseRules.checkIn.to}</strong></div>
                        )}
                        {property.houseRules.checkOut?.from && (
                          <div className='pd-detail'><span>Check-out from</span><strong>{property.houseRules.checkOut.from}</strong></div>
                        )}
                        {property.houseRules.checkOut?.to && (
                          <div className='pd-detail'><span>Check-out until</span><strong>{property.houseRules.checkOut.to}</strong></div>
                        )}
                      </div>
                    </>
                  )}

                  <h3 style={{ marginTop: (isHotel || isShortlet) ? 20 : 0, fontSize: 15 }}>House Rules</h3>
                  <div className='pd-rules-list'>
                    <div className={`pd-rule-item${property.houseRules.smokingAllowed ? ' pd-rule--ok' : ' pd-rule--no'}`}>
                      <span>{property.houseRules.smokingAllowed ? '✓' : '✗'}</span> Smoking {property.houseRules.smokingAllowed ? 'allowed' : 'not allowed'}
                    </div>
                    <div className={`pd-rule-item${property.houseRules.petsAllowed ? ' pd-rule--ok' : ' pd-rule--no'}`}>
                      <span>{property.houseRules.petsAllowed ? '✓' : '✗'}</span> Pets {property.houseRules.petsAllowed ? 'allowed' : 'not allowed'}
                      {property.houseRules.petCharge && <em> ({property.houseRules.petCharge})</em>}
                    </div>
                    <div className={`pd-rule-item${property.houseRules.childrenAllowed ? ' pd-rule--ok' : ' pd-rule--no'}`}>
                      <span>{property.houseRules.childrenAllowed ? '✓' : '✗'}</span> Children {property.houseRules.childrenAllowed ? 'welcome' : 'not allowed'}
                      {property.houseRules.childrenPolicy && <em> — {property.houseRules.childrenPolicy}</em>}
                    </div>
                    {property.houseRules.cribAvailable && (
                      <div className='pd-rule-item pd-rule--ok'><span>✓</span> Crib available on request</div>
                    )}
                    {property.houseRules.extraBedAvailable && (
                      <div className='pd-rule-item pd-rule--ok'><span>✓</span> Extra bed available on request</div>
                    )}
                    {property.houseRules.ageRestriction && (
                      <div className='pd-rule-item'><span>ℹ</span> Age restriction: {property.houseRules.ageRestriction}</div>
                    )}
                  </div>

                  {property.houseRules.cancellationPolicy && (
                    <div style={{ marginTop: 16 }}>
                      <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>Cancellation Policy</h4>
                      <p style={{ fontSize: 14, color: '#555', lineHeight: 1.6 }}>{property.houseRules.cancellationPolicy}</p>
                    </div>
                  )}

                  {/* Payment methods intentionally omitted — managed by PropNect escrow system */}
                </div>
              )}

              {/* Languages — Hotel & Shortlet only */}
              {(isHotel || isShortlet) && property.languagesSpoken?.length > 0 && (
                <div className='pd-card'>
                  <h3>Languages Spoken by Staff</h3>
                  <div className='pd-tags'>
                    {property.languagesSpoken.map(l => <span key={l} className='pd-tag'>🌐 {l}</span>)}
                  </div>
                </div>
              )}

              {/* Building characteristics */}
              {property.buildingCharacteristics?.length > 0 && (
                <div className='pd-card'>
                  <h3><Building2 size={16} /> Building Type</h3>
                  <div className='pd-tags'>
                    {property.buildingCharacteristics.map(c => <span key={c} className='pd-tag'>{c}</span>)}
                  </div>
                </div>
              )}

              {/* Nearby places */}
              {property.nearbyPlaces?.length > 0 && (
                <div className='pd-card'>
                  <h3><MapPin size={16} /> Nearby Places</h3>
                  <div className='pd-nearby-list'>
                    {property.nearbyPlaces.map((np, i) => (
                      <div key={i} className='pd-nearby-item'>
                        <div className='pd-nearby-item__name'>{np.name}</div>
                        {np.category && <div className='pd-nearby-item__cat'>{np.category}</div>}
                        {np.distance && <div className='pd-nearby-item__dist'><MapPin size={11} /> {np.distance}</div>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── UNITS ──────────────────────────────────────────────── */}
          {activeTab === 'units' && (
            <div className='pd-section'>
              <div className='pd-card'>
                <h3>Units ({property.units?.length})</h3>
                <div className='pd-units-grid'>
                  {(property.units || []).map((u, i) => (
                    <div key={i} className={`pd-unit-card${u.available === false ? ' pd-unit-card--unavailable' : ''}`}>
                      <div className='pd-unit-card__header'>
                        <span className='pd-unit-card__id'>{u.unitId || `Unit ${i + 1}`}</span>
                        <span className={`pd-unit-card__status${u.available !== false ? ' available' : ''}`}>
                          {u.available !== false ? 'Available' : 'Occupied'}
                        </span>
                      </div>
                      {u.title && <h4 className='pd-unit-card__title'>{u.title}</h4>}
                      <div className='pd-unit-card__meta'>
                        {u.bedrooms != null && <span><BedDouble size={12} /> {u.bedrooms}bed</span>}
                        {u.bathrooms != null && <span><Bath size={12} /> {u.bathrooms}bath</span>}
                        {u.sqft && <span><Ruler size={12} /> {u.sqft}sqft</span>}
                        {u.floor && <span><Layers size={12} /> {u.floor}</span>}
                      </div>
                      <div className='pd-unit-card__price'>
                        {u.price ? fmt(u.price, currency) : ''}
                        {u.rentPrice ? ` / ${u.rentFrequency || 'mo'}: ${fmt(u.rentPrice, currency)}` : ''}
                      </div>
                      {u.availableFrom && (
                        <div className='pd-unit-card__avail'>
                          <Calendar size={11} /> From {new Date(u.availableFrom).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── ROOM TYPES ─────────────────────────────────────────── */}
          {activeTab === 'rooms' && (
            <div className='pd-section'>
              <div className='pd-card'>
                <h3>Room Types</h3>
                <div className='pd-rooms-list'>
                  {property.roomTypes.map((rt, i) => (
                    <div key={i} className='pd-room-card'>
                      {rt.images?.[0] && <img className='pd-room-card__img' src={rt.images[0]} alt={rt.name} loading='lazy' />}
                      <div className='pd-room-card__body'>
                        <div className='pd-room-card__name'>{rt.name}</div>
                        {rt.description && <p className='pd-room-card__desc'>{rt.description}</p>}
                        <div className='pd-room-card__meta'>
                          {rt.sqft && <span><Ruler size={12} /> {rt.sqft} sqft</span>}
                          <span><Users size={12} /> Up to {(rt.occupancy?.adults || 2)} guests</span>
                          {rt.qty && <span>{rt.qty} available</span>}
                        </div>
                        <div className='pd-room-card__price'>
                          {rt.pricePerNight ? fmt(rt.pricePerNight, currency) + ' / night' : rt.basePrice ? fmt(rt.basePrice, currency) : ''}
                        </div>
                        {rt.features?.length > 0 && (
                          <div className='pd-room-card__features'>
                            {rt.features.map(f => <span key={f}>{f}</span>)}
                          </div>
                        )}
                        {!rt.refundable && <span className='pd-room-card__nonref'>Non-refundable</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── LAND INFO ──────────────────────────────────────────── */}
          {activeTab === 'land' && property.land && (
            <div className='pd-section'>
              <div className='pd-card'>
                <h3><Landmark size={16} /> Land Details</h3>
                <div className='pd-details-grid'>
                  {property.land.size?.value && <div className='pd-detail'><span>Size</span><strong>{property.land.size.value} {property.land.size.unit || 'sqm'}</strong></div>}
                  {property.land.pricePerUnit && <div className='pd-detail'><span>Price / Unit</span><strong>{fmt(property.land.pricePerUnit, currency)}</strong></div>}
                  {property.land.totalPrice && <div className='pd-detail'><span>Total Price</span><strong>{fmt(property.land.totalPrice, currency)}</strong></div>}
                  {property.land.zoning && <div className='pd-detail'><span>Zoning</span><strong>{property.land.zoning}</strong></div>}
                  {property.land.isSubdividable && <div className='pd-detail'><span>Subdividable</span><strong>Yes</strong></div>}
                </div>
                {property.land.permittedUse?.length > 0 && (
                  <div className='pd-tags' style={{ marginTop: 12 }}>
                    {property.land.permittedUse.map(u => <span key={u} className='pd-tag'>{u}</span>)}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── COMPLIANCE ─────────────────────────────────────────── */}
          {activeTab === 'compliance' && (
            <div className='pd-section'>
              <div className='pd-card'>
                <h3><Shield size={16} /> Compliance & Verification</h3>
                <div className='pd-compliance-score'>
                  <div className='pd-score-ring'>
                    <svg viewBox='0 0 36 36'>
                      <circle cx='18' cy='18' r='15.9' fill='none' stroke='#e5e7eb' strokeWidth='3' />
                      <circle
                        cx='18' cy='18' r='15.9' fill='none'
                        stroke={complianceScore >= 80 ? '#22c55e' : complianceScore >= 50 ? '#f59e0b' : '#ef4444'}
                        strokeWidth='3'
                        strokeDasharray={`${complianceScore} ${100 - complianceScore}`}
                        strokeDashoffset='25'
                        strokeLinecap='round'
                      />
                    </svg>
                    <span>{complianceScore}</span>
                  </div>
                  <div className='pd-score-info'>
                    <div className='pd-score-label'>{complianceVerified ? 'Verified ✓' : 'Pending review'}</div>
                    {property.compliance?.lastChecked && (
                      <div className='pd-score-date'>Last checked: {new Date(property.compliance.lastChecked).toLocaleDateString()}</div>
                    )}
                  </div>
                </div>

                {property.compliance?.flags?.length > 0 && (
                  <div className='pd-compliance-flags'>
                    <h4>Compliance Flags</h4>
                    {property.compliance.flags.map(f => (
                      <div key={f} className='pd-flag'><AlertCircle size={13} /> {f.replace(/_/g, ' ')}</div>
                    ))}
                  </div>
                )}

                {property.compliance?.documents?.length > 0 && (
                  <div style={{ marginTop: 16 }}>
                    <h4>Documents</h4>
                    <div className='pd-docs-list'>
                      {property.compliance.documents.map((doc, i) => (
                        <div key={i} className='pd-doc'>
                          <FileText size={14} />
                          <span>{doc.label || doc.type}</span>
                          {doc.verified && <CheckCircle2 size={13} className='pd-doc__verified' />}
                          {doc.url && <a href={doc.url} target='_blank' rel='noreferrer'><ExternalLink size={12} /></a>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Escrow */}
              {property.escrow && (
                <div className='pd-card'>
                  <h3><Lock size={16} /> Escrow Status</h3>
                  <div className={`pd-escrow-badge pd-escrow--${escrowStatus}`}>
                    {escrowStatus === 'active' ? <CheckCircle2 size={15} /> : <Clock size={15} />}
                    {escrowStatus.replace(/_/g, ' ')}
                  </div>
                  {property.escrow.provider && <p className='pd-escrow-provider'>Provider: {property.escrow.provider}</p>}
                  {property.escrow.amount && <p>Amount: {fmt(property.escrow.amount, property.escrow.currency || currency)}</p>}
                </div>
              )}
            </div>
          )}

          {/* Similar properties */}
          {similar.length > 0 && (
            <section className='pd-similar'>
              <h2>Similar Properties</h2>
              <div className='pd-similar-grid'>
                {similar.slice(0, 4).map(p => (
                  <a key={p._id} href={`/property/${p._id}`} className='pd-similar-card'>
                    <div className='pd-similar-img'>
                      <img src={p.images?.[0] || p.media?.[0]?.url || '/placeholder.jpg'} alt={p.title} loading='lazy' />
                    </div>
                    <div className='pd-similar-info'>
                      <div className='pd-similar-name'>{p.title}</div>
                      <div className='pd-similar-loc'><MapPin size={11} /> {typeof p.location === 'string' ? p.location : p.city || '—'}</div>
                      <div className='pd-similar-price'>{fmt(p.price || p.rentPrice, p.currency || 'NGN')}</div>
                    </div>
                  </a>
                ))}
              </div>
            </section>
          )}
        </main>

        {/* ── Sidebar ──────────────────────────────────────────────── */}
        <aside className='pd-sidebar'>
          <div className='pd-booking-card' id='booking-section'>
            <div className='pd-booking-price'>
              <div className='pd-booking-price__main'>
                {isPerNight
                  ? bookingTotal?.total ? fmt(bookingTotal.total, currency) : fmt(effectivePrice, currency)
                  : fmt(selectedPlan?.priceSnapshot?.total || effectivePrice, currency)}
              </div>
              <div className='pd-booking-price__sub'>
                {isPerNight ? `${fmt(bookingTotal?.perNight || effectivePrice, currency)}/night` : selectedPlan?.name || 'Outright'}
              </div>
            </div>

            {isPerNight ? (
              <div className='pd-booking-dates'>
                <div className='pd-booking-dates__row'>
                  <div className='pd-booking-dates__field'>
                    <label>Check-in</label>
                    <input type='date' value={bookingStart} onChange={e => setBookingStart(e.target.value)} />
                  </div>
                  <div className='pd-booking-dates__field'>
                    <label>Check-out</label>
                    <input type='date' value={bookingEnd} onChange={e => setBookingEnd(e.target.value)} />
                  </div>
                </div>
                <div className='pd-booking-field'>
                  <label>Guests</label>
                  <input type='number' min='1' value={guests} onChange={e => setGuests(Number(e.target.value) || 1)} />
                </div>
                {property.roomTypes?.length > 0 && (
                  <div className='pd-booking-field'>
                    <label>Room type</label>
                    <select value={selectedRoomTypeId || ''} onChange={e => setSelectedRoomTypeId(e.target.value || null)}>
                      <option value=''>Best available</option>
                      {property.roomTypes.map(rt => (
                        <option key={rt.id || rt.roomTypeId} value={rt.id || rt.roomTypeId}>
                          {rt.name} — {fmt(rt.pricePerNight || rt.basePrice, currency)}/night
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                {nights > 0 && (
                  <div className='pd-booking-summary'>
                    <div><span>Nights</span><strong>{nights}</strong></div>
                    <div><span>Per night</span><strong>{fmt(bookingTotal?.perNight || effectivePrice, currency)}</strong></div>
                    <div className='pd-booking-summary__total'><span>Total</span><strong>{fmt(bookingTotal?.total || 0, currency)}</strong></div>
                  </div>
                )}
              </div>
            ) : (
              property.paymentPlans?.length > 0 && (
                <div className='pd-booking-plans'>
                  <label>Payment plan</label>
                  {property.paymentPlans.map((p, i) => (
                    <button key={i} className={`pd-plan-btn${selectedPlanIdx === i ? ' active' : ''}`} onClick={() => setSelectedPlanIdx(i)}>
                      <span>{p.name || p.title || `Plan ${i + 1}`}</span>
                      {p.priceSnapshot?.total && <span>{fmt(p.priceSnapshot.total, currency)}</span>}
                    </button>
                  ))}
                </div>
              )
            )}

            <div className='pd-booking-actions'>
              {isRent && !isPerNight ? (
                <button className='pd-cta-btn pd-cta-btn--primary' onClick={() => setApplyOpen(true)}>
                  Apply to Rent
                </button>
              ) : (
                <>
                  <button className='pd-cta-btn pd-cta-btn--primary' onClick={startMonnify}>
                    Pay with Bank Transfer
                  </button>
                  <button className='pd-cta-btn pd-cta-btn--stripe' onClick={startStripe}>
                    Pay with Card (Stripe)
                  </button>
                </>
              )}
              <button className='pd-cta-btn pd-cta-btn--outline' onClick={() => window.location.href = `mailto:${owner.email || ''}`}>
                <Mail size={14} /> Contact Agent
              </button>
            </div>

            {/* Agent */}
            <div className='pd-agent'>
              <img src={owner.avatar || owner.photo || '/avatar-placeholder.png'} alt={owner.name || 'Agent'} loading='lazy' />
              <div className='pd-agent__info'>
                <div className='pd-agent__name'>{owner.name || 'Agent'}</div>
                {owner.position && <div className='pd-agent__role'>{owner.position}</div>}
                <div className='pd-agent__contacts'>
                  {owner.contact && <a href={`tel:${owner.contact}`} aria-label='Call'><Phone size={13} /></a>}
                  {owner.email && <a href={`mailto:${owner.email}`} aria-label='Email'><Mail size={13} /></a>}
                </div>
              </div>
            </div>

            {/* Compliance mini-badge */}
            {(complianceVerified || escrowStatus === 'active') && (
              <div className='pd-trust-badges'>
                {complianceVerified && <span className='pd-trust-badge'><Shield size={12} /> KYC Verified</span>}
                {escrowStatus === 'active' && <span className='pd-trust-badge'><Lock size={12} /> Escrow Active</span>}
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* ── Apply Modal ──────────────────────────────────────────────── */}
      {applyOpen && (
        <div className='pd-modal-backdrop' onClick={() => setApplyOpen(false)}>
          <div className='pd-modal' onClick={e => e.stopPropagation()}>
            {applyStatus === 'success' ? (
              <>
                <CheckCircle2 size={32} color='#22c55e' />
                <h3>Application Submitted!</h3>
                <p>The property owner will review your application and get back to you.</p>
                <button className='pd-cta-btn pd-cta-btn--primary' onClick={() => { setApplyOpen(false); setApplyStatus(null) }}>Close</button>
              </>
            ) : (
              <>
                <h3>Apply to Rent</h3>
                <p>{property.title}</p>
                {applyStatus && <p className='pd-modal__err'>{applyStatus}</p>}
                <label>Message to landlord (optional)</label>
                <textarea rows={4} value={applyMsg} onChange={e => setApplyMsg(e.target.value)} placeholder='Introduce yourself, mention your move-in date…' />
                <div className='pd-modal__actions'>
                  <button className='pd-cta-btn pd-cta-btn--primary' onClick={submitApplication} disabled={applying}>
                    {applying ? 'Submitting…' : 'Submit Application'}
                  </button>
                  <button className='pd-cta-btn pd-cta-btn--outline' onClick={() => setApplyOpen(false)}>Cancel</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── Lightbox ─────────────────────────────────────────────────── */}
      {lightboxOpen && (
        <div className='pd-lightbox' role='dialog' aria-modal='true'>
          <button className='pd-lb-close' onClick={() => setLightboxOpen(false)}><X size={20} /></button>
          <button className='pd-lb-nav pd-lb-nav--left' onClick={() => setThumbIndex(i => Math.max(0, i - 1))} disabled={thumbIndex === 0}><ArrowLeft size={20} /></button>
          <button className='pd-lb-nav pd-lb-nav--right' onClick={() => setThumbIndex(i => Math.min(gallery.length - 1, i + 1))} disabled={thumbIndex === gallery.length - 1}><ArrowRight size={20} /></button>
          <div className='pd-lb-content'>
            {lightboxItem.type === 'video'
              ? <video src={lightboxItem.url} controls autoPlay />
              : <img src={lightboxItem.url} alt={`Photo ${thumbIndex + 1}`} />
            }
            <div className='pd-lb-caption'>{property.title} — {thumbIndex + 1} / {gallery.length}</div>
          </div>
          <div className='pd-lb-thumbs'>
            {gallery.map((m, i) => (
              <button key={i} className={`pd-lb-thumb${i === thumbIndex ? ' active' : ''}`} onClick={() => setThumbIndex(i)}>
                {m.type === 'video' ? <Video size={12} /> : <img src={m.url} alt={`thumb ${i}`} />}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Mobile sticky CTA ────────────────────────────────────────── */}
      <div className='pd-mobile-cta'>
        <div className='pd-mobile-cta__price'>
          <strong>{fmt(effectivePrice, currency)}</strong>
          {property.rentFrequency && <span>/{property.rentFrequency}</span>}
        </div>
        <button className='pd-cta-btn pd-cta-btn--primary' onClick={() => document.getElementById('booking-section')?.scrollIntoView({ behavior: 'smooth' })}>
          {isRent && !isPerNight ? 'Apply to Rent' : 'Book / Buy'}
        </button>
      </div>
    </div>
  )
}
