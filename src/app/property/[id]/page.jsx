'use client'

import React, { useEffect, useState, useMemo, useCallback } from 'react'
import { useParams } from 'next/navigation'
import axios from 'axios'
import {
  MapPin,
  Phone,
  Mail,
  BedDouble,
  Bath,
  Ruler,
  Video,
  X,
  ArrowLeft,
  ArrowRight
} from 'lucide-react'
import './propertyDetails.scss'

export default function PropertyDetails () {
  const { id } = useParams()
  const [property, setProperty] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [similarProperties, setSimilarProperties] = useState([])

  const startMonnifyPayment = async () => {
    const totalAmount = isPerNightType
      ? bookingTotal?.total
      : paymentBreakdown?.total ?? effectivePrice

    if (!totalAmount) {
      alert('Amount cannot be zero')
      return
    }

    try {
      const payRef = 'REF-' + Date.now()

      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/payment/initialize-monnify-transaction`,
        {
          amount: totalAmount,
          customerName: 'Guest User',
          customerEmail: 'guest@example.com',
          paymentReference: payRef
        }
      )

      if (res?.data?.requestSuccessful) {
        window.location.href = res.data.responseBody.checkoutUrl
      } else {
        alert('Failed to initialize payment')
      }
    } catch (err) {
      console.log(err)
      alert('Payment error')
    }
  }

  // UI state
  const [thumbIndex, setThumbIndex] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)

  // Booking state
  const [bookingStart, setBookingStart] = useState('')
  const [bookingEnd, setBookingEnd] = useState('')
  const [guests, setGuests] = useState(1)
  const [selectedRoomTypeId, setSelectedRoomTypeId] = useState(null)

  // Normalize media: images first, then video
  const gallery = useMemo(() => {
    if (!property) return []
    const media = Array.isArray(property.media) ? property.media : []
    const images = Array.isArray(property.images)
      ? property.images.map(u => ({ url: u, type: 'image' }))
      : []
    const fallbackVideo = property.video
      ? [{ url: property.video, type: 'video' }]
      : []
    const normalized = media
      .map(m =>
        typeof m === 'string'
          ? { url: m, type: 'image' }
          : {
              url: m.url || m,
              type:
                m.type ||
                (m.url && String(m.url).endsWith('.mp4') ? 'video' : 'image')
            }
      )
      .filter(Boolean)
    // order: images in media first, else images array, else video fallback
    if (normalized.length) return normalized
    if (images.length) return images
    return fallbackVideo
  }, [property])

  // Category helpers
  const category = (property?.category || property?.propertyType || '')
    .toString()
    .toLowerCase()
  const isLand = category === 'land'
  const isHotel = category === 'hotel'
  const isShortlet = category === 'shortlet'
  const isPerNightType = isHotel || isShortlet

  // Price resolution (selected options override)
  const effectivePrice = useMemo(() => {
    const raw =
      property?.selectedPlot?.price ??
      property?.price ??
      property?.startingPrice ??
      property?.rentPrice ??
      null
    if (raw == null || raw === '') return null
    const n =
      typeof raw === 'number'
        ? raw
        : Number(String(raw).replace(/[^0-9.-]/g, ''))
    return Number.isNaN(n) ? null : n
  }, [property])

  // nights util
  const nightsBetween = useCallback((start, end) => {
    if (!start || !end) return 0
    const s = new Date(start)
    const e = new Date(end)
    s.setHours(12, 0, 0, 0)
    e.setHours(12, 0, 0, 0)
    const diff = Math.ceil((e - s) / (1000 * 60 * 60 * 24))
    return diff > 0 ? diff : 0
  }, [])

  // selected room type
  const selectedRoomType = useMemo(() => {
    if (!property) return null
    const rts = property.roomTypes || []
    return rts.find(r => String(r.id) === String(selectedRoomTypeId)) || null
  }, [property, selectedRoomTypeId])

  // booking total for per-night types
  const bookingTotal = useMemo(() => {
    if (!isPerNightType) return null
    const nights = nightsBetween(bookingStart, bookingEnd)
    if (!nights) return { nights: 0, total: 0, perNight: 0 }
    let perNight =
      selectedRoomType?.price ?? effectivePrice ?? property?.rentPrice ?? 0
    perNight = Number(perNight) || 0
    const qty = selectedRoomType ? Number(selectedRoomType.qty) || 1 : 1
    const total = perNight * qty * nights
    return { nights, total, perNight, qty }
  }, [
    isPerNightType,
    bookingStart,
    bookingEnd,
    selectedRoomType,
    effectivePrice,
    property,
    nightsBetween
  ])

  // payment breakdown (rental/installment)
  const paymentBreakdown = useMemo(() => {
    if (isPerNightType && bookingTotal) {
      return {
        total: bookingTotal.total,
        nights: bookingTotal.nights,
        monthly: null,
        months: 0
      }
    }
    const total =
      effectivePrice ?? Number(property?.price ?? property?.startingPrice ?? 0)
    if (!total) return null
    const plan = property?.selectedPlan ?? property?.paymentPlans?.[0] ?? null
    let months = plan?.months || plan?.durationMonths || plan?.duration || 1
    if (typeof months === 'string')
      months = parseInt(months.replace(/[^0-9]/g, '')) || 1
    months = Number(months) || 1
    const monthly = Math.round(total / months)
    return { total, months, monthly }
  }, [isPerNightType, bookingTotal, effectivePrice, property])

  const formatCurrency = useCallback(v => {
    if (v == null || v === '') return '—'
    const n =
      typeof v === 'number' ? v : Number(String(v).replace(/[^0-9.-]/g, ''))
    if (Number.isNaN(n)) return String(v)
    return `₦${n.toLocaleString()}`
  }, [])

  // keyboard navigation for gallery
  const onThumbKey = useCallback((e, idx) => {
    if (e.key === 'Enter' || e.key === ' ') setThumbIndex(idx)
  }, [])

  // fetch
  useEffect(() => {
    if (!id) {
      setLoading(false)
      setError('No id provided')
      return
    }
    setLoading(true)
    setError(null)
    axios
      .get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/properties/${id}`)
      .then(res => {
        const payload = res.data
        const prop = payload?.property ?? payload?.data ?? payload
        // sanitize and set defaults for safer rendering
        setProperty({
          ...prop,
          roomTypes: prop?.roomTypes || [],
          media: prop?.media || [],
          images: prop?.images || [],
          paymentPlans: prop?.paymentPlans || []
        })
        setLoading(false)
      })
      .catch(err => {
        setError(
          err?.response?.data?.msg || err?.message || 'Failed to fetch property'
        )
        setLoading(false)
      })
  }, [id])

  // Fetch similar properties after the main property loads
  useEffect(() => {
    if (!id || !property) return
    axios
      .get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/properties/${id}/similar`)
      .then(res => setSimilarProperties(res.data?.properties || res.data?.data || []))
      .catch(() => {})
  }, [id, property])

  // initialize thumbnail / selections
  useEffect(() => {
    if (!property) return
    if (gallery.length && thumbIndex >= gallery.length) setThumbIndex(0)
    // set defaults from payload if available
    if (property.roomTypes?.length && !selectedRoomTypeId)
      setSelectedRoomTypeId(property.roomTypes[0].id)
    // eslint-disable-next-line
  }, [property])

  // accessibility: close lightbox on ESC + nav arrows; lock body when open
  useEffect(() => {
    const onKey = e => {
      if (e.key === 'Escape') setLightboxOpen(false)
      if (e.key === 'ArrowLeft' && lightboxOpen)
        setThumbIndex(i => Math.max(0, i - 1))
      if (e.key === 'ArrowRight' && lightboxOpen)
        setThumbIndex(i => Math.min(gallery.length - 1, i + 1))
    }
    if (lightboxOpen) {
      document.body.style.overflow = 'hidden'
      window.addEventListener('keydown', onKey)
    } else {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [lightboxOpen, gallery.length])

  if (loading) {
    return (
      <div
        className='property-details modern loading-screen'
        aria-live='polite'
      >
        <div className='skeleton-hero' />
        <div className='skeleton-grid'>
          <div className='s-card' />
          <div className='s-card' />
          <div className='s-card' />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className='property-details modern error-screen' role='alert'>
        <div className='card centered'>
          <h3>Unable to load</h3>
          <p className='muted'>{error}</p>
        </div>
      </div>
    )
  }

  if (!property) {
    return (
      <div className='property-details modern empty-screen'>
        <div className='card centered'>
          <h3>No property found</h3>
        </div>
      </div>
    )
  }

  const {
    title,
    description,
    beds,
    baths,
    sqft,
    area,
    location,
    latitude,
    longitude,
    owner = {},
    roomTypes = [],
    features = [],
    tags = [],
    address
  } = property

  const featureList = Array.isArray(features)
    ? features
    : typeof features === 'object' && features !== null
    ? Object.keys(features)
        .filter(k => Boolean(features[k]))
        .map(k =>
          k.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())
        )
    : []

  const descText = description || ''

  // Lightbox content
  const lightboxItem = gallery[thumbIndex] || {
    url: '/placeholder.jpg',
    type: 'image'
  }

  return (
    <div className='property-details modern'>
      <header className='hero'>
        <div
          className='hero-media'
          role='button'
          tabIndex={0}
          onClick={() => setLightboxOpen(true)}
          onKeyDown={e => {
            if (e.key === 'Enter') setLightboxOpen(true)
          }}
          aria-label='Open image gallery'
        >
          {gallery.length ? (
            gallery[thumbIndex].type === 'video' ? (
              <video
                className='hero-image'
                src={gallery[thumbIndex].url}
                muted
                playsInline
                preload='metadata'
              />
            ) : (
              <img
                className='hero-image'
                src={gallery[thumbIndex].url}
                alt={title || 'Property image'}
                loading='lazy'
              />
            )
          ) : (
            <img className='hero-image' src='/placeholder.jpg' alt='Property' />
          )}

          <div className='hero-overlay'>
            <div className='hero-left'>
              <div className='breadcrumbs muted'>{location || address}</div>
              <h1 className='hero-title'>{title}</h1>
              <div className='meta'>
                {!isLand && (
                  <>
                    <span className='meta-item'>
                      <BedDouble /> {beds ?? '-'}
                    </span>
                    <span className='meta-item'>
                      <Bath /> {baths ?? '-'}
                    </span>
                    <span className='meta-item'>
                      <Ruler /> {sqft ?? area ?? '-'}
                    </span>
                  </>
                )}
              </div>
            </div>

            <div className='hero-right'>
              <div className='price'>
                {isPerNightType
                  ? bookingTotal && bookingTotal.total
                    ? `${formatCurrency(bookingTotal.perNight)} / night`
                    : effectivePrice
                    ? `${formatCurrency(effectivePrice)} / night`
                    : formatCurrency(property.price)
                  : formatCurrency(
                      effectivePrice ?? property.price ?? property.startingPrice
                    )}
              </div>
              <div className='actions'>
                <button
                  className='btn primary'
                  onClick={() =>
                    document
                      .getElementById('booking-section')
                      ?.scrollIntoView({ behavior: 'smooth' })
                  }
                >
                  Book/Buy
                </button>
                <button
                  className='btn outline'
                  onClick={() =>
                    window.scrollTo({
                      top: document.body.scrollHeight,
                      behavior: 'smooth'
                    })
                  }
                >
                  Contact
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className='thumbs compact' aria-hidden={lightboxOpen}>
          <div className='thumbs-inner'>
            {gallery.map((m, i) => (
              <button
                key={i}
                className={`thumb ${i === thumbIndex ? 'active' : ''}`}
                onClick={() => setThumbIndex(i)}
                onKeyDown={e => onThumbKey(e, i)}
                aria-label={`View media ${i + 1}`}
              >
                {m.type === 'image' ? (
                  <img src={m.url} alt={`thumb ${i + 1}`} loading='lazy' />
                ) : (
                  <Video size={16} />
                )}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className='content'>
        <section className='main-col'>
          <div className='card overview'>
            <div className='overview-header'>
              <h3>Overview</h3>
              <div className='muted small right-meta'>
                <MapPin size={14} /> {location || address}
              </div>
            </div>
            <p className='muted lead'>{descText}</p>

            <div className='feature-row'>
              {featureList.slice(0, 6).map(f => (
                <span key={f} className='pill'>
                  {f}
                </span>
              ))}
            </div>

            {tags?.length > 0 && (
              <div className='tags'>
                {tags.map(t => (
                  <span key={t} className='tag'>
                    {t}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div id='gallery' className='card gallery'>
            <h4>Gallery</h4>
            <div className='gallery-grid'>
              {gallery.map((m, i) => (
                <button
                  key={i}
                  className='gallery-item'
                  onClick={() => {
                    setThumbIndex(i)
                    setLightboxOpen(true)
                  }}
                  aria-label={`Open media ${i + 1}`}
                >
                  {m.type === 'image' ? (
                    <img src={m.url} alt={`gallery ${i + 1}`} loading='lazy' />
                  ) : (
                    <div className='video-thumb'>
                      <Video />
                      <span>Video</span>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className='card details'>
            <h4>Property details</h4>
            <div className='detail-grid'>
              {!isLand && (
                <>
                  <div className='detail'>
                    <strong>Bedrooms</strong>
                    <span>{beds ?? '-'}</span>
                  </div>
                  <div className='detail'>
                    <strong>Bathrooms</strong>
                    <span>{baths ?? '-'}</span>
                  </div>
                  <div className='detail'>
                    <strong>Size</strong>
                    <span>{sqft ?? area ?? '-'}</span>
                  </div>
                </>
              )}
              <div className='detail'>
                <strong>Location</strong>
                <span>{location || address || '-'}</span>
              </div>
              <div className='detail'>
                <strong>Agent</strong>
                <span>{owner?.name || '—'}</span>
              </div>
            </div>
          </div>
        </section>

        <aside className='side-col' aria-labelledby='booking-heading'>
          <div className='card sticky booking-card' id='booking-section'>
            <div className='price-row'>
              <div className='price-main'>
                {formatCurrency(
                  paymentBreakdown ? paymentBreakdown.total : effectivePrice
                )}
              </div>
              <div className='price-sub muted'>
                {paymentBreakdown?.monthly
                  ? `${formatCurrency(paymentBreakdown.monthly)}/mo`
                  : isPerNightType
                  ? `${formatCurrency(
                      bookingTotal?.perNight || effectivePrice
                    )}/night`
                  : 'Outright'}
              </div>
            </div>

            <div className='booking-form'>
              {isPerNightType ? (
                <>
                  <h4 id='booking-heading'>Booking</h4>
                  <label>Check-in</label>
                  <input
                    type='date'
                    value={bookingStart}
                    onChange={e => setBookingStart(e.target.value)}
                  />
                  <label>Check-out</label>
                  <input
                    type='date'
                    value={bookingEnd}
                    onChange={e => setBookingEnd(e.target.value)}
                  />
                  <label>Guests</label>
                  <input
                    type='number'
                    min='1'
                    value={guests}
                    onChange={e => setGuests(Number(e.target.value) || 1)}
                  />

                  {roomTypes.length > 0 && (
                    <>
                      <label>Room type</label>
                      <select
                        value={selectedRoomTypeId || ''}
                        onChange={e =>
                          setSelectedRoomTypeId(e.target.value || null)
                        }
                      >
                        <option value=''>Best available</option>
                        {roomTypes.map(rt => (
                          <option
                            key={rt.id || rt.type}
                            value={rt.id || rt.type}
                          >
                            {rt.type} — {formatCurrency(rt.price)}
                          </option>
                        ))}
                      </select>
                    </>
                  )}

                  <div className='summary-lines'>
                    <div>
                      <small>Nights</small>
                      <strong>{bookingTotal?.nights ?? 0}</strong>
                    </div>
                    <div>
                      <small>Per night</small>
                      <strong>
                        {formatCurrency(
                          bookingTotal?.perNight ?? effectivePrice
                        )}
                      </strong>
                    </div>
                    <div className='total'>
                      <small>Total</small>
                      <strong>
                        {formatCurrency(bookingTotal?.total ?? 0)}
                      </strong>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <h4 id='booking-heading'>Purchase options</h4>
                  <div className='plan-list'>
                    {(property.paymentPlans || []).map((p, i) => (
                      <button
                        key={i}
                        className={`plan ${
                          property.selectedPlan === p ? 'active' : ''
                        }`}
                        onClick={() =>
                          setProperty(prev => ({ ...prev, selectedPlan: p }))
                        }
                      >
                        <div className='plan-left'>
                          <div className='plan-title'>
                            {p.title || p.name || p.duration || `Plan ${i + 1}`}
                          </div>
                          <div className='muted small'>{p.description}</div>
                        </div>
                        <div className='plan-price'>
                          {p.price ? formatCurrency(p.price) : ''}
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className='summary-lines'>
                    <div>
                      <small>Total</small>
                      <strong>
                        {formatCurrency(
                          paymentBreakdown?.total ?? effectivePrice
                        )}
                      </strong>
                    </div>
                    <div>
                      <small>Monthly</small>
                      <strong>
                        {paymentBreakdown?.monthly
                          ? formatCurrency(paymentBreakdown.monthly)
                          : '-'}
                      </strong>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className='cta-row'>
              <button
                className='btn primary full'
                onClick={() => startMonnifyPayment()}
              >
                Proceed to Checkout
              </button>
              <button
                className='btn outline full'
                onClick={() =>
                  (window.location.href = `mailto:${owner?.email || ''}`)
                }
              >
                Contact Agent
              </button>
            </div>

            <div className='agent-compact'>
              <img
                src={owner?.avatar || owner?.photo || '/avatar-placeholder.png'}
                alt={owner?.name || 'Agent'}
                loading='lazy'
              />
              <div>
                <div className='agent-name'>{owner?.name || 'Agent'}</div>
                <div className='muted small'>{owner?.position}</div>
                <div className='contacts'>
                  {owner?.contact && (
                    <a href={`tel:${owner.contact}`} aria-label='Call agent'>
                      <Phone />
                    </a>
                  )}
                  {owner?.email && (
                    <a href={`mailto:${owner.email}`} aria-label='Email agent'>
                      <Mail />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className='card small-info'>
            <h5>Map</h5>
            <div className='muted small'>{location || address || '-'}</div>
            <iframe
              title='map'
              src={`https://maps.google.com/maps?q=${
                latitude || property.lat || ''
              },${
                longitude || property.lng || property.lon || ''
              }&z=13&output=embed`}
              loading='lazy'
            />
          </div>
        </aside>
      </main>

      {/* Similar Properties */}
      {similarProperties.length > 0 && (
        <section className='similar-section'>
          <h2 className='similar-heading'>Similar Properties</h2>
          <div className='similar-grid'>
            {similarProperties.slice(0, 6).map(p => (
              <a key={p._id} href={`/property/${p._id}`} className='similar-card'>
                <div className='similar-thumb'>
                  <img
                    src={p.images?.[0] || p.media?.[0]?.url || '/placeholder.jpg'}
                    alt={p.title || 'Property'}
                    loading='lazy'
                  />
                </div>
                <div className='similar-info'>
                  <div className='similar-name'>{p.title}</div>
                  <div className='similar-loc'>
                    <MapPin size={12} />
                    {p.location || p.city || '—'}
                  </div>
                  <div className='similar-price'>
                    ₦{Number(p.price || p.rentPrice || 0).toLocaleString()}
                  </div>
                </div>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* Mobile fixed CTA for faster conversion on phones */}
      <div className='mobile-cta' aria-hidden={false}>
        <div className='mobile-cta-left'>
          <div className='price-small'>
            {formatCurrency(
              paymentBreakdown ? paymentBreakdown.total : effectivePrice
            )}
          </div>
          <div className='price-sub muted small'>
            {isPerNightType
              ? `${formatCurrency(
                  bookingTotal?.perNight || effectivePrice
                )}/night`
              : 'Outright'}
          </div>
        </div>
        <div className='mobile-cta-actions'>
          <button
            className='btn primary'
            onClick={() =>
              document
                .getElementById('booking-section')
                ?.scrollIntoView({ behavior: 'smooth' })
            }
          >
            Book
          </button>
          <button
            className='btn outline'
            onClick={() =>
              (window.location.href = `mailto:${owner?.email || ''}`)
            }
          >
            Contact
          </button>
        </div>
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <div
          className='lightbox'
          role='dialog'
          aria-modal='true'
          aria-label='Image viewer'
        >
          <button
            className='lb-close'
            onClick={() => setLightboxOpen(false)}
            aria-label='Close'
          >
            <X />
          </button>

          <div
            className='lb-nav left'
            onClick={() => setThumbIndex(i => Math.max(0, i - 1))}
            aria-hidden='true'
          >
            <ArrowLeft />
          </div>
          <div
            className='lb-nav right'
            onClick={() =>
              setThumbIndex(i => Math.min(gallery.length - 1, i + 1))
            }
            aria-hidden='true'
          >
            <ArrowRight />
          </div>

          <div className='lb-inner'>
            {lightboxItem.type === 'video' ? (
              <video
                src={lightboxItem.url}
                controls
                autoPlay
                style={{ maxHeight: '80vh', maxWidth: '90vw' }}
              />
            ) : (
              <img src={lightboxItem.url} alt={`Media ${thumbIndex + 1}`} />
            )}
            <div className='lb-caption muted'>
              {title} — {thumbIndex + 1}/{gallery.length}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
