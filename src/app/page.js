'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import './Landing.scss'
import { useRouter } from 'next/navigation'
import axios from 'axios'

const API = process.env.NEXT_PUBLIC_BACKEND_URL || ''
const APP_NAME_FALLBACK = process.env.NEXT_PUBLIC_APP_NAME || 'propnekt'

// ── Static fallback data ────────────────────────────────────────────────────

const FALLBACK_ARTISANS = [
  {
    _id: 'a1',
    firstName: 'Chukwuemeka',
    lastName: 'P.',
    artisanProfile: { specialization: 'Master Electrician' },
    stats: { averageRating: 4.9, completedJobs: 312 },
    status: { verified: true },
    plan: { name: 'pro' }
  },
  {
    _id: 'a2',
    firstName: 'Aminu',
    lastName: 'D.',
    artisanProfile: { specialization: 'Plumbing Specialist' },
    stats: { averageRating: 4.8, completedJobs: 201 },
    status: { verified: true },
    plan: { name: 'pro' }
  },
  {
    _id: 'a3',
    firstName: 'Ngozi',
    lastName: 'A.',
    artisanProfile: { specialization: 'Interior Painter' },
    stats: { averageRating: 4.9, completedJobs: 178 },
    status: { verified: true },
    plan: { name: 'pro' }
  }
]

const CATEGORIES = [
  { icon: '🏢', label: 'Apartments', query: 'apartment' },
  { icon: '🏠', label: 'Houses', query: 'house' },
  { icon: '🏨', label: 'Hotels', query: 'hotel' },
  { icon: '🛏️', label: 'Shortlets', query: 'shortlet' },
  { icon: '🏗️', label: 'Land', query: 'land' },
  { icon: '🏬', label: 'Commercial', query: 'commercial' },
  { icon: '🔧', label: 'Artisans', query: 'artisan' }
]

const LOCATIONS = [
  {
    city: 'Lagos',
    listings: '4,200+',
    image:
      'https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=400&q=80'
  },
  {
    city: 'Abuja',
    listings: '2,800+',
    image:
      'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=400&q=80'
  },
  {
    city: 'Port Harcourt',
    listings: '1,100+',
    image:
      'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=400&q=80'
  },
  {
    city: 'Ibadan',
    listings: '900+',
    image:
      'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=400&q=80'
  }
]

const TESTIMONIALS = [
  {
    name: 'Adaeze Okafor',
    role: 'Property Buyer',
    avatar: '👩🏾',
    stars: 5,
    text: 'Found my dream duplex in Lekki within a week. The platform is incredibly smooth and the team was super responsive throughout.'
  },
  {
    name: 'Emeka Eze',
    role: 'Verified Artisan – Electrician',
    avatar: '👨🏿‍🔧',
    stars: 5,
    text: 'My bookings tripled after joining. The escrow payment system gives both me and my clients peace of mind on every job.'
  },
  {
    name: 'Fatima Abdullahi',
    role: 'Property Owner',
    avatar: '👩🏾‍💼',
    stars: 5,
    text: 'Listed my apartments and had tenants within days. The dashboard makes managing multiple properties effortless.'
  }
]

const HOW_IT_WORKS = [
  {
    step: '01',
    icon: '📝',
    title: 'Create Your Profile',
    desc: 'Sign up in seconds as a buyer, renter, owner, or artisan — no paperwork upfront.'
  },
  {
    step: '02',
    icon: '🔍',
    title: 'Search & Filter',
    desc: 'Use smart filters: location, price, property type, beds/baths, and more.'
  },
  {
    step: '03',
    icon: '💬',
    title: 'Connect & Book',
    desc: 'Chat in real time, schedule viewings, and book directly with verified owners.'
  },
  {
    step: '04',
    icon: '🔐',
    title: 'Pay Safely',
    desc: 'Escrow-secured payments protect every transaction — money only releases on satisfaction.'
  }
]

// ── Helpers ─────────────────────────────────────────────────────────────────

function formatPrice (price, purpose) {
  if (!price) return '—'
  const fmt = new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0
  }).format(price)
  const p = (purpose || '').toLowerCase()
  if (p.includes('rent')) return `${fmt}/mo`
  if (p.includes('shortlet')) return `${fmt}/night`
  return fmt
}

function purposeLabel (purpose) {
  const p = (purpose || '').toLowerCase()
  if (p.includes('sale')) return { label: 'For Sale', type: 'sale' }
  if (p.includes('rent')) return { label: 'For Rent', type: 'rent' }
  if (p.includes('shortlet')) return { label: 'Shortlet', type: 'shortlet' }
  return { label: purpose || 'Listing', type: 'other' }
}

function artisanTradeIcon (spec) {
  const s = (spec || '').toLowerCase()
  if (s.includes('electric')) return '⚡'
  if (s.includes('plumb')) return '🔧'
  if (s.includes('paint')) return '🎨'
  if (s.includes('clean')) return '🧹'
  if (s.includes('carpen')) return '🪚'
  if (s.includes('til')) return '🏗️'
  return '🔨'
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function LandingPage () {
  const router = useRouter()
  const [scrolled, setScrolled] = useState(false)
  const [searchTab, setSearchTab] = useState('rent')
  const [location, setLocation] = useState('')
  const [propertyType, setPropertyType] = useState('')
  const [listingTab, setListingTab] = useState('all')
  const [savedCards, setSavedCards] = useState(new Set())
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Data from API
  const [branding, setBranding] = useState(null)
  const [properties, setProperties] = useState([])
  const [artisans, setArtisans] = useState([])
  const [loadingProps, setLoadingProps] = useState(true)
  const [loadingArtisans, setLoadingArtisans] = useState(true)

  const heroRef = useRef(null)
  const mobileMenuRef = useRef(null)

  // ── Fetch platform config + data ─────────────────────────────────────────
  useEffect(() => {
    // Platform branding
    axios
      .get(`${API}/api/platform-config`)
      .then(r => {
        if (r.data?.config?.branding) setBranding(r.data.config.branding)
      })
      .catch(() => {}) // silently fall back to defaults

    // Featured properties (published, public, latest 6)
    axios
      .get(`${API}/api/properties/all?limit=6&sort=-createdAt`)
      .then(r => {
        const list = r.data?.properties
        setProperties(list)
      })
      .catch(() => setProperties([]))
      // .catch(() => setProperties(FALLBACK_LISTINGS))
      .finally(() => setLoadingProps(false))

    // Premium / top-rated artisans
    axios
      .get(`${API}/api/artisan?topRated=true&limit=4`)
      .then(r => {
        const list = r.data?.artisans
        setArtisans(list?.length ? list.slice(0, 4) : FALLBACK_ARTISANS)
      })
      .catch(() => setArtisans(FALLBACK_ARTISANS))
      .finally(() => setLoadingArtisans(false))
  }, [])

  // Derived branding values
  const appName = branding?.appName || APP_NAME_FALLBACK
  const heroTitle =
    branding?.heroTitle || 'Find Your Perfect Property in Nigeria'
  const heroSub =
    branding?.heroSubtitle ||
    'Buy, rent, or book a shortlet — all with escrow-secured payments and verified listings.'
  const heroImage =
    branding?.heroImageUrl ||
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1800&q=80'
  const stats = branding?.statsBar || {}

  // ── Scroll handler ───────────────────────────────────────────────────────
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close mobile menu on outside click
  useEffect(() => {
    if (!mobileMenuOpen) return
    const handle = e => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target)) {
        setMobileMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [mobileMenuOpen])

  // Lock body scroll when mobile menu open
  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileMenuOpen])

  const handleSearch = useCallback(() => {
    const params = new URLSearchParams()
    if (location) params.set('location', location)
    if (propertyType) params.set('type', propertyType)
    params.set('intent', searchTab)
    router.push(`/search?${params.toString()}`)
  }, [location, propertyType, searchTab, router])

  const toggleSave = useCallback(
    id =>
      setSavedCards(prev => {
        const next = new Set(prev)
        next.has(id) ? next.delete(id) : next.add(id)
        return next
      }),
    []
  )

  const closeMobile = () => setMobileMenuOpen(false)

  const filteredListings =
    listingTab === 'all'
      ? properties
      : properties.filter(p => {
          const label = purposeLabel(p.purpose).type
          return label === listingTab
        })

  const scrollTo = id =>
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })

  return (
    <div className='lp'>
      {/* ── Navbar ── */}
      <nav
        className={`lp-nav${scrolled ? ' lp-nav--scrolled' : ''}`}
        ref={mobileMenuRef}
      >
        <div className='lp-nav__inner'>
          {/* Logo */}
          <a className='lp-nav__logo' href='/'>
            {branding?.logoUrl ? (
              <img
                src={branding.logoUrl}
                alt={appName}
                className='lp-nav__logo-img'
              />
            ) : (
              <>
                <span className='lp-nav__logo-icon'>P</span>
                <span className='lp-nav__logo-text'>{appName}</span>
              </>
            )}
          </a>

          {/* Desktop links */}
          <div className='lp-nav__links'>
            <a onClick={() => scrollTo('listings')}>Buy &amp; Rent</a>
            <a href='/search?intent=shortlet'>Shortlets</a>
            <a
              onClick={() => {
                scrollTo('artisans')
              }}
            >
              Artisans
            </a>
            <a onClick={() => scrollTo('how-it-works')}>How It Works</a>
            <a href='/about'>About</a>
          </div>

          {/* Desktop actions */}
          <div className='lp-nav__actions'>
            <button
              className='lp-nav__btn-ghost'
              onClick={() => router.push('/auth/login')}
            >
              Sign In
            </button>
            <button
              className='lp-nav__btn-cta'
              onClick={() => router.push('/auth/register')}
            >
              Sign Up
            </button>
          </div>

          {/* Hamburger */}
          <button
            className={`lp-nav__burger${mobileMenuOpen ? ' open' : ''}`}
            onClick={() => setMobileMenuOpen(o => !o)}
            aria-label='Toggle menu'
            aria-expanded={mobileMenuOpen}
          >
            <span />
            <span />
            <span />
          </button>
        </div>

        {/* Mobile backdrop */}
        <div
          className={`lp-nav__backdrop${mobileMenuOpen ? ' visible' : ''}`}
          onClick={closeMobile}
        />

        {/* Mobile drawer */}
        <div className={`lp-nav__drawer${mobileMenuOpen ? ' open' : ''}`}>
          <div className='lp-nav__drawer-header'>
            <a className='lp-nav__logo' href='/' onClick={closeMobile}>
              {branding?.logoUrl ? (
                <img
                  src={branding.logoUrl}
                  alt={appName}
                  className='lp-nav__logo-img'
                />
              ) : (
                <>
                  <span className='lp-nav__logo-icon'>P</span>
                  <span className='lp-nav__logo-text'>{appName}</span>
                </>
              )}
            </a>
            <button
              className='lp-nav__drawer-close'
              onClick={closeMobile}
              aria-label='Close menu'
            >
              <svg
                width='20'
                height='20'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='2.5'
              >
                <path d='M18 6 6 18M6 6l12 12' />
              </svg>
            </button>
          </div>

          <nav className='lp-nav__drawer-links'>
            <a href='/buy' onClick={closeMobile}>
              <span className='lp-nav__drawer-icon'>🏠</span> Buy
            </a>
            <a href='/rent' onClick={closeMobile}>
              <span className='lp-nav__drawer-icon'>🔑</span> Rent
            </a>
            <a href='/search?intent=shortlet' onClick={closeMobile}>
              <span className='lp-nav__drawer-icon'>🛏️</span> Shortlets
            </a>
            <a
              onClick={() => {
                scrollTo('artisans')
                closeMobile()
              }}
            >
              <span className='lp-nav__drawer-icon'>🔧</span> Artisans
            </a>
            <a
              onClick={() => {
                scrollTo('how-it-works')
                closeMobile()
              }}
            >
              <span className='lp-nav__drawer-icon'>💡</span> How It Works
            </a>
            <a href='/about' onClick={closeMobile}>
              <span className='lp-nav__drawer-icon'>ℹ️</span> About
            </a>
          </nav>

          <div className='lp-nav__drawer-divider' />

          <div className='lp-nav__drawer-actions'>
            <button
              className='lp-nav__drawer-btn-ghost'
              onClick={() => {
                router.push('/auth/login')
                closeMobile()
              }}
            >
              Sign In
            </button>
            <button
              className='lp-nav__drawer-btn-cta'
              onClick={() => {
                router.push('/auth/register')
                closeMobile()
              }}
            >
              Sign Up
            </button>
          </div>

          <p className='lp-nav__drawer-trust'>
            ✓ Free to join &nbsp;·&nbsp; ✓ Verified listings
          </p>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className='lp-hero' ref={heroRef}>
        <div className='lp-hero__bg'>
          <img src={heroImage} alt='Property' loading='eager' />
          <div className='lp-hero__overlay' />
        </div>

        <div className='lp-hero__content'>
          <p className='lp-hero__eyebrow'>
            {stats.verifiedUsers || '50,000+'} verified users ·{' '}
            {stats.activeListings || '10,000+'} listings
          </p>
          <h1 className='lp-hero__title'>
            {heroTitle.includes(' ') ? (
              <>
                {heroTitle.split(' ').slice(0, 3).join(' ')}{' '}
                <span>{heroTitle.split(' ').slice(3).join(' ')}</span>
              </>
            ) : (
              heroTitle
            )}
          </h1>
          <p className='lp-hero__sub'>{heroSub}</p>

          {/* Search Widget */}
          <div className='lp-search'>
            <div className='lp-search__tabs'>
              {[
                { key: 'buy', label: 'Buy' },
                { key: 'rent', label: 'Rent' },
                { key: 'shortlet', label: 'Shortlet' },
                { key: 'artisan', label: '🔧 Artisans' }
              ].map(t => (
                <button
                  key={t.key}
                  className={`lp-search__tab${
                    searchTab === t.key ? ' active' : ''
                  }`}
                  onClick={() => setSearchTab(t.key)}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className='lp-search__body'>
              <div className='lp-search__field lp-search__field--location'>
                <span className='lp-search__icon'>📍</span>
                <div className='lp-search__field-inner'>
                  <label>
                    {searchTab === 'artisan'
                      ? 'Where do you need help?'
                      : 'Where do you want to stay?'}
                  </label>
                  <input
                    type='text'
                    placeholder={
                      searchTab === 'artisan'
                        ? 'Lagos, Abuja, Port Harcourt...'
                        : 'City, neighbourhood or address...'
                    }
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSearch()}
                  />
                </div>
              </div>

              <div className='lp-search__field lp-search__field--type'>
                <span className='lp-search__icon'>
                  {searchTab === 'artisan' ? '🔧' : '🏠'}
                </span>
                <div className='lp-search__field-inner'>
                  <label>
                    {searchTab === 'artisan' ? 'Service Type' : 'Property Type'}
                  </label>
                  <select
                    value={propertyType}
                    onChange={e => setPropertyType(e.target.value)}
                  >
                    {searchTab === 'artisan' ? (
                      <>
                        <option value=''>Any Service</option>
                        <option value='plumbing'>Plumbing</option>
                        <option value='electrical'>Electrical</option>
                        <option value='painting'>Painting</option>
                        <option value='cleaning'>Cleaning</option>
                        <option value='carpentry'>Carpentry</option>
                        <option value='tiling'>Tiling</option>
                      </>
                    ) : (
                      <>
                        <option value=''>Any Type</option>
                        <option value='apartment'>Apartment</option>
                        <option value='house'>House / Duplex</option>
                        <option value='land'>Land</option>
                        <option value='commercial'>Commercial</option>
                        <option value='shortlet'>Shortlet</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              <button className='lp-search__btn' onClick={handleSearch}>
                <svg
                  width='18'
                  height='18'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                  strokeWidth='2.5'
                >
                  <circle cx='11' cy='11' r='8' />
                  <path d='m21 21-4.35-4.35' />
                </svg>
                <span>Search</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Trust Strip ── */}
      <div className='lp-trust'>
        <div className='lp-trust__inner'>
          <div className='lp-trust__item'>
            <span>✅</span>
            <span>
              <strong>Verified</strong> listings only
            </span>
          </div>
          <div className='lp-trust__item'>
            <span>🔐</span>
            <span>
              <strong>Escrow</strong> on all payments
            </span>
          </div>
          <div className='lp-trust__item'>
            <span>⭐</span>
            <span>
              <strong>{stats.avgRating || '4.9/5'}</strong> avg rating
            </span>
          </div>
          <div className='lp-trust__item'>
            <span>🏘️</span>
            <span>
              <strong>{stats.activeListings || '10,000+'}</strong> active
              listings
            </span>
          </div>
          <div className='lp-trust__item'>
            <span>⚡</span>
            <span>
              <strong>Real-time</strong> chat &amp; booking
            </span>
          </div>
        </div>
      </div>

      {/* ── Categories ── */}
      <section className='lp-cats'>
        <div className='lp-cats__inner'>
          <h2 className='lp-cats__title'>What are you looking for?</h2>
          <div className='lp-cats__grid'>
            {CATEGORIES.map(cat => (
              <button
                key={cat.query}
                className='lp-cat'
                onClick={() => router.push(`/search?type=${cat.query}`)}
              >
                <span className='lp-cat__icon'>{cat.icon}</span>
                <span className='lp-cat__label'>{cat.label}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Listings ── */}
      <section id='listings' className='lp-listings'>
        <div className='lp-listings__inner'>
          <div className='lp-listings__header'>
            <div>
              <h2 className='lp-listings__title'>Featured Properties</h2>
              <p className='lp-listings__sub'>
                Handpicked verified listings across Nigeria
              </p>
            </div>
            <div className='lp-listings__tabs'>
              {[
                { key: 'all', label: 'All' },
                { key: 'rent', label: 'Rent' },
                { key: 'sale', label: 'Buy' },
                { key: 'shortlet', label: 'Shortlet' }
              ].map(t => (
                <button
                  key={t.key}
                  className={`lp-tab${listingTab === t.key ? ' active' : ''}`}
                  onClick={() => setListingTab(t.key)}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {loadingProps ? (
            <div className='lp-cards-loading'>
              {[1, 2, 3].map(i => (
                <div key={i} className='lp-card lp-card--skeleton' />
              ))}
            </div>
          ) : (
            <div className='lp-cards'>
              {(filteredListings.length ? filteredListings : properties)
                .slice(0, 6)
                .map(listing => {
                  const { label, type } = purposeLabel(listing.purpose)
                  const img =
                    listing.images?.[0]?.url ||
                    listing.images?.[0] ||
                    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&q=80'
                  const loc =
                    [listing.city, listing.state].filter(Boolean).join(', ') ||
                    listing.location ||
                    ''
                  const id = listing._id || listing.id
                  return (
                    <div
                      key={id}
                      className='lp-card'
                      onClick={() =>
                        router.push(
                          listing.isFallback ? '/search' : `/property/${id}`
                        )
                      }
                    >
                      <div className='lp-card__img-wrap'>
                        <img src={img} alt={listing.title} loading='lazy' />
                        <span
                          className={`lp-card__badge lp-card__badge--${type}`}
                        >
                          {label}
                        </span>
                        <button
                          className={`lp-card__save${
                            savedCards.has(id) ? ' saved' : ''
                          }`}
                          onClick={e => {
                            e.stopPropagation()
                            toggleSave(id)
                          }}
                          aria-label='Save property'
                        >
                          {savedCards.has(id) ? '❤️' : '🤍'}
                        </button>
                      </div>
                      <div className='lp-card__body'>
                        <h3 className='lp-card__title'>{listing.title}</h3>
                        {loc && <p className='lp-card__loc'>📍 {loc}</p>}
                        <div className='lp-card__stats'>
                          {listing.bedrooms != null && (
                            <span>
                              🛏 {listing.bedrooms} bed
                              {listing.bedrooms !== 1 ? 's' : ''}
                            </span>
                          )}
                          {listing.bathrooms != null && (
                            <span>
                              🚿 {listing.bathrooms} bath
                              {listing.bathrooms !== 1 ? 's' : ''}
                            </span>
                          )}
                          {listing.category && (
                            <span>🏷 {listing.category}</span>
                          )}
                        </div>
                        <div className='lp-card__footer'>
                          <div className='lp-card__price'>
                            {formatPrice(listing.price, listing.purpose)}
                          </div>
                          {listing.stats?.averageRating > 0 && (
                            <div className='lp-card__rating'>
                              ⭐{' '}
                              <strong>
                                {listing.stats.averageRating.toFixed(1)}
                              </strong>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
            </div>
          )}

          <div className='lp-listings__cta'>
            <button
              className='lp-btn-outline'
              onClick={() => router.push('/search')}
            >
              Explore All Properties →
            </button>
          </div>
        </div>
      </section>

      {/* ── Popular Locations ── */}
      <section className='lp-locations'>
        <div className='lp-locations__inner'>
          <h2 className='lp-locations__title'>Popular Destinations</h2>
          <p className='lp-locations__sub'>
            Browse thousands of listings in Nigeria's top cities
          </p>
          <div className='lp-locations__grid'>
            {LOCATIONS.map(loc => (
              <div
                key={loc.city}
                className='lp-loc'
                onClick={() => router.push(`/search?location=${loc.city}`)}
              >
                <img src={loc.image} alt={loc.city} loading='lazy' />
                <div className='lp-loc__overlay' />
                <div className='lp-loc__info'>
                  <h3>{loc.city}</h3>
                  <p>{loc.listings} listings</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Artisan Marketplace ── */}
      <section id='artisans' className='lp-artisan'>
        <div className='lp-artisan__inner'>
          <div className='lp-artisan__text'>
            <span className='lp-tag'>Service Marketplace</span>
            <h2>
              Find Trusted Artisans
              <br />
              for Any Job
            </h2>
            <p>
              Hire verified plumbers, electricians, painters, cleaners, and 20+
              more trades — with rated profiles, upfront quotes, and
              escrow-protected payments.
            </p>
            <ul className='lp-artisan__perks'>
              <li>✅ Background-checked &amp; certified</li>
              <li>✅ Read reviews before you book</li>
              <li>✅ Escrow payment — pay on completion</li>
              <li>✅ Real-time messaging &amp; scheduling</li>
            </ul>
            <button
              className='lp-btn-lime'
              onClick={() => router.push('/search?type=artisan')}
            >
              Find an Artisan →
            </button>
          </div>

          <div className='lp-artisan__cards'>
            {(loadingArtisans ? [] : artisans).map(a => {
              // Handle both API shape (flat) and fallback shape (nested)
              const name =
                a.name ||
                `${a.firstName || ''} ${(a.lastName || '').charAt(0)}.`.trim()
              const spec =
                a.specialization ||
                a.artisanProfile?.specialization ||
                'Artisan'
              const rating = a.rating ?? a.stats?.averageRating ?? 0
              const jobs = a.completedJobs ?? a.stats?.completedJobs ?? 0
              const isVerified = a.verified ?? a.status?.verified ?? false
              const isTopRated =
                rating >= 4.8 ||
                a.plan?.name === 'pro' ||
                a.plan?.name === 'enterprise'
              return (
                <div
                  key={a._id}
                  className='lp-artisan-card'
                  onClick={() => router.push('/search?type=artisan')}
                >
                  <div className='lp-artisan-card__head'>
                    <span className='lp-artisan-card__avatar'>
                      {artisanTradeIcon(spec)}
                    </span>
                    <div>
                      <h4>{name}</h4>
                      <p>{spec}</p>
                    </div>
                    <span className='lp-artisan-card__badge'>
                      {isTopRated ? 'Top Rated' : 'Verified'}
                    </span>
                  </div>
                  <div className='lp-artisan-card__foot'>
                    {rating > 0 && <span>⭐ {rating.toFixed(1)}</span>}
                    {jobs > 0 && <span>{jobs} jobs</span>}
                    {isVerified && (
                      <span className='lp-artisan-card__verified'>
                        ✓ Verified
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section id='how-it-works' className='lp-hiw'>
        <div className='lp-hiw__inner'>
          <span className='lp-tag'>Simple Process</span>
          <h2 className='lp-hiw__title'>How {appName} Works</h2>
          <div className='lp-hiw__steps'>
            {HOW_IT_WORKS.map((s, i) => (
              <div key={s.step} className='lp-step'>
                <div className='lp-step__num'>{s.step}</div>
                <div className='lp-step__icon'>{s.icon}</div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
                {i < HOW_IT_WORKS.length - 1 && (
                  <div className='lp-step__arrow'>→</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className='lp-reviews'>
        <div className='lp-reviews__inner'>
          <span className='lp-tag'>Testimonials</span>
          <h2 className='lp-reviews__title'>Loved by Thousands</h2>
          <div className='lp-reviews__grid'>
            {TESTIMONIALS.map(t => (
              <div key={t.name} className='lp-review'>
                <div className='lp-review__stars'>{'⭐'.repeat(t.stars)}</div>
                <p className='lp-review__text'>"{t.text}"</p>
                <div className='lp-review__author'>
                  <span className='lp-review__avatar'>{t.avatar}</span>
                  <div>
                    <div className='lp-review__name'>{t.name}</div>
                    <div className='lp-review__role'>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className='lp-cta'>
        <div className='lp-cta__inner'>
          <h2>Ready to Find Your Perfect Property?</h2>
          <p>
            Join {stats.verifiedUsers || '50,000+'} users already buying,
            renting, and connecting on {appName}
          </p>
          <div className='lp-cta__btns'>
            <button
              className='lp-btn-lime'
              onClick={() => router.push('/auth/register')}
            >
              Get Started Free →
            </button>
            <button
              className='lp-btn-ghost-white'
              onClick={() => router.push('/search')}
            >
              Browse Listings
            </button>
          </div>
          <div className='lp-cta__trust'>
            <span>✓ Free to join</span>
            <span>✓ No hidden fees</span>
            <span>✓ Verified listings</span>
          </div>
        </div>
      </section>
    </div>
  )
}
