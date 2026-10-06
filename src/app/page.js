'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import './Landing.scss'
import { useRouter } from 'next/navigation'
import { encodeId } from '@/libs/propId'
import axios from 'axios'
import {
  Building2,
  Home as HomeIcon,
  Hotel,
  BedDouble,
  Bath,
  Layers,
  Store,
  // Wrench, // PHASE 3+ — artisan marketplace
  MapPin,
  Tag,
  Star as StarIcon,
  Zap,
  FileEdit,
  MessageSquare,
  Shield,
  // Play, // PHASE 3+ — TikTok feed
  Key as KeyIcon,
  Calendar,
  Info as InfoIcon,
  Lightbulb,
  CheckCircle2,
  Lock,
  // Hammer, // PHASE 3+ — artisan marketplace
  Search as SearchIcon
} from 'lucide-react'

const API = process.env.NEXT_PUBLIC_BACKEND_URL || ''
const APP_NAME_FALLBACK = process.env.NEXT_PUBLIC_APP_NAME || 'propnekt'

// ── Static fallback data ────────────────────────────────────────────────────

/* PHASE 3+ — artisan fallback data. Restore when artisan marketplace launches.
const FALLBACK_ARTISANS = [
  { _id: 'a1', firstName: 'Chukwuemeka', lastName: 'P.', artisanProfile: { specialization: 'Master Electrician' }, stats: { averageRating: 4.9, completedJobs: 312 }, status: { verified: true }, plan: { name: 'pro' } },
  { _id: 'a2', firstName: 'Aminu', lastName: 'D.', artisanProfile: { specialization: 'Plumbing Specialist' }, stats: { averageRating: 4.8, completedJobs: 201 }, status: { verified: true }, plan: { name: 'pro' } },
  { _id: 'a3', firstName: 'Ngozi', lastName: 'A.', artisanProfile: { specialization: 'Interior Painter' }, stats: { averageRating: 4.9, completedJobs: 178 }, status: { verified: true }, plan: { name: 'pro' } }
]
*/

const CATEGORIES = [
  { Icon: Building2, label: 'Apartments', query: 'apartment' },
  { Icon: HomeIcon, label: 'Houses', query: 'house' },
  { Icon: Hotel, label: 'Hotels', query: 'hotel' },
  { Icon: BedDouble, label: 'Shortlets', query: 'shortlet' },
  { Icon: Layers, label: 'Land', query: 'land' },
  { Icon: Store, label: 'Commercial', query: 'commercial' }
  // PHASE 3+ — { Icon: Wrench, label: 'Artisans', query: 'artisan' }
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
    initials: 'AO',
    avatarColor: '#a78bfa',
    stars: 5,
    text: 'Found my dream duplex in Lekki within a week. The platform is incredibly smooth and the team was super responsive throughout.'
  },
  /* PHASE 3+ — artisan testimonial. Restore when artisan marketplace launches.
  { name: 'Emeka Eze', role: 'Verified Artisan – Electrician', initials: 'EE', avatarColor: '#4ade80', stars: 5, text: 'My bookings tripled after joining. The escrow payment system gives both me and my clients peace of mind on every job.' },
  */
  {
    name: 'Fatima Abdullahi',
    role: 'Property Owner',
    initials: 'FA',
    avatarColor: '#60a5fa',
    stars: 5,
    text: 'Listed my apartments and had tenants within days. The dashboard makes managing multiple properties effortless.'
  }
]

const HOW_IT_WORKS = [
  {
    step: '01',
    Icon: FileEdit,
    title: 'Create Your Profile',
    desc: 'Sign up in seconds as a buyer, renter, or owner — no paperwork upfront.'
  },
  {
    step: '02',
    Icon: SearchIcon,
    title: 'Search & Filter',
    desc: 'Use smart filters: location, price, property type, beds/baths, and more.'
  },
  {
    step: '03',
    Icon: MessageSquare,
    title: 'Connect & Book',
    desc: 'Chat in real time, schedule viewings, and book directly with verified owners.'
  },
  {
    step: '04',
    Icon: Shield,
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
  if (p.includes('rent')) return `${fmt} · monthly`
  if (p.includes('shortlet')) return `${fmt} · nightly`
  return fmt
}

function purposeLabel (purpose) {
  const p = (purpose || '').toLowerCase()
  if (p.includes('sale')) return { label: 'For Sale', type: 'sale' }
  if (p.includes('rent')) return { label: 'For Rent', type: 'rent' }
  if (p.includes('shortlet')) return { label: 'Shortlet', type: 'shortlet' }
  return { label: purpose || 'Listing', type: 'other' }
}

/* PHASE 3+ — artisan trade icon helper. Restore when artisan marketplace launches.
function artisanTradeIcon (spec) {
  const s = (spec || '').toLowerCase()
  if (s.includes('electric')) return <Zap size={20} />
  if (s.includes('plumb')) return <Wrench size={20} />
  if (s.includes('carpen') || s.includes('wood')) return <Hammer size={20} />
  if (s.includes('til') || s.includes('mason')) return <Layers size={20} />
  return <Wrench size={20} />
}
*/

// ── Component ─────────────────────────────────────────────────────────────────

export default function LandingPage () {
  const router = useRouter()

  useEffect(() => {
    if (localStorage.getItem('authToken')) {
      window.location.href = '/admin/dashboard'
    }
  }, [])

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
  // PHASE 3+ — const [artisans, setArtisans] = useState([])
  const [loadingProps, setLoadingProps] = useState(true)
  // PHASE 3+ — const [loadingArtisans, setLoadingArtisans] = useState(true)

  const heroRef = useRef(null)
  const mobileMenuRef = useRef(null)

  const fetchProperties = useCallback(() => {
    axios
      .get(`${API}/api/properties/all?limit=6&sort=-createdAt`)
      .then(r => {
        const list = r.data?.properties
        if (list) setProperties(list)
      })
      .catch(() => {})
      .finally(() => setLoadingProps(false))
  }, [])

  useEffect(() => {
    axios
      .get(`${API}/api/platform-config`)
      .then(r => {
        if (r.data?.config?.branding) setBranding(r.data.config.branding)
      })
      .catch(() => {})

    fetchProperties()

    /* PHASE 3+ — artisan API fetch. Restore when artisan marketplace launches.
    axios
      .get(`${API}/api/artisan?topRated=true&limit=4`)
      .then(r => {
        const list = r.data?.artisans
        setArtisans(list?.length ? list.slice(0, 4) : FALLBACK_ARTISANS)
      })
      .catch(() => setArtisans(FALLBACK_ARTISANS))
      .finally(() => setLoadingArtisans(false))
    */
  }, [fetchProperties])

  useEffect(() => {
    const interval = setInterval(fetchProperties, 60_000)
    const onVisible = () => {
      if (document.visibilityState === 'visible') fetchProperties()
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      clearInterval(interval)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [fetchProperties])

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

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

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

  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

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
    <div className='home'>
      {/* ── Navbar ── */}
      <nav
        className={`home-nav${scrolled ? ' home-nav--scrolled' : ''}`}
        ref={mobileMenuRef}
      >
        <div className='home-nav__inner'>
          {/* Logo */}
          <a className='home-nav__logo' href='/'>
            {branding?.logoUrl ? (
              <img
                src={branding.logoUrl}
                alt={appName}
                className='home-nav__logo-img'
              />
            ) : (
              <>
                <span className='home-nav__logo-icon'>P</span>
                <span className='home-nav__logo-text'>{appName}</span>
              </>
            )}
          </a>

          {/* Desktop links */}
          <div className='home-nav__links'>
            <a onClick={() => scrollTo('listings')}>Buy &amp; Rent</a>
            <a href='/search?intent=shortlet'>Book</a>
            {/* PHASE 3+ — artisan marketplace nav: <a onClick={() => scrollTo('artisans')}>Artisans</a> */}
            {/* PHASE 3+ — TikTok feed nav: <a href='/feed' className='home-nav__link--feed'>Feed</a> */}
            <a onClick={() => scrollTo('how-it-works')}>How It Works</a>
            <a href='/about'>About</a>
          </div>

          {/* Desktop actions */}
          <div className='home-nav__actions'>
            <button
              className='home-nav__btn-ghost'
              onClick={() => router.push('/auth/login')}
            >
              Sign In
            </button>
            <button
              className='home-nav__btn-cta'
              onClick={() => router.push('/auth/register')}
            >
              Sign Up
            </button>
          </div>

          {/* Hamburger */}
          <button
            className={`home-nav__burger${mobileMenuOpen ? ' open' : ''}`}
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
          className={`home-nav__backdrop${mobileMenuOpen ? ' visible' : ''}`}
          onClick={closeMobile}
        />

        {/* Mobile drawer */}
        <div className={`home-nav__drawer${mobileMenuOpen ? ' open' : ''}`}>
          <div className='home-nav__drawer-header'>
            <a className='home-nav__logo' href='/' onClick={closeMobile}>
              {branding?.logoUrl ? (
                <img
                  src={branding.logoUrl}
                  alt={appName}
                  className='home-nav__logo-img'
                />
              ) : (
                <>
                  <span className='home-nav__logo-icon'>P</span>
                  <span className='home-nav__logo-text'>{appName}</span>
                </>
              )}
            </a>
            <button
              className='home-nav__drawer-close'
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

          <nav className='home-nav__drawer-links'>
            {/* PHASE 3+ — TikTok feed mobile link: <a href='/feed' onClick={closeMobile} className='home-nav__drawer-link--feed'><Play size={16} className='home-nav__drawer-icon' /> Browse Feed</a> */}
            <a href='/buy' onClick={closeMobile}>
              <HomeIcon size={16} className='home-nav__drawer-icon' /> Buy
            </a>
            <a href='/rent' onClick={closeMobile}>
              <KeyIcon size={16} className='home-nav__drawer-icon' /> Rent
            </a>
            <a href='/search?intent=shortlet' onClick={closeMobile}>
              <Calendar size={16} className='home-nav__drawer-icon' /> Book
            </a>
            {/* PHASE 3+ — artisan marketplace mobile link: <a onClick={() => { scrollTo('artisans'); closeMobile() }}><Wrench size={16} className='home-nav__drawer-icon' /> Artisans</a> */}
            <a
              onClick={() => {
                scrollTo('how-it-works')
                closeMobile()
              }}
            >
              <Lightbulb size={16} className='home-nav__drawer-icon' /> How It
              Works
            </a>
            <a href='/about' onClick={closeMobile}>
              <InfoIcon size={16} className='home-nav__drawer-icon' /> About
            </a>
          </nav>

          <div className='home-nav__drawer-divider' />

          <div className='home-nav__drawer-actions'>
            <button
              className='home-nav__drawer-btn-ghost'
              onClick={() => {
                router.push('/auth/login')
                closeMobile()
              }}
            >
              Sign In
            </button>
            <button
              className='home-nav__drawer-btn-cta'
              onClick={() => {
                router.push('/auth/register')
                closeMobile()
              }}
            >
              Sign Up
            </button>
          </div>

          <p className='home-nav__drawer-trust'>
            ✓ Free to join &nbsp;·&nbsp; ✓ Verified listings
          </p>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className='home-hero' ref={heroRef}>
        <div className='home-hero__bg'>
          <img src={heroImage} alt='Property' loading='eager' />
          <div className='home-hero__overlay' />
        </div>

        <div className='home-hero__content'>
          <p className='home-hero__eyebrow'>
            {stats.verifiedUsers || '50,000+'} verified users ·{' '}
            {stats.activeListings || '10,000+'} listings
          </p>
          <h1 className='home-hero__title'>
            {heroTitle.includes(' ') ? (
              <>
                {heroTitle.split(' ').slice(0, 3).join(' ')}{' '}
                <span>{heroTitle.split(' ').slice(3).join(' ')}</span>
              </>
            ) : (
              heroTitle
            )}
          </h1>
          <p className='home-hero__sub'>{heroSub}</p>

          {/* Search Widget */}
          <div className='home-search'>
            <div className='home-search__tabs'>
              {[
                { key: 'buy', label: 'Buy' },
                { key: 'rent', label: 'Rent' },
                { key: 'booking', label: 'Booking' }
                // PHASE 3+ — { key: 'artisan', label: 'Artisans' }
              ].map(t => (
                <button
                  key={t.key}
                  className={`home-search__tab${
                    searchTab === t.key ? ' active' : ''
                  }`}
                  onClick={() => setSearchTab(t.key)}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className='home-search__body'>
              <div className='home-search__field home-search__field--location'>
                <span className='home-search__icon'>
                  <MapPin size={18} />
                </span>
                <div className='home-search__field-inner'>
                  <label>Where do you want to stay?</label>
                  <input
                    type='text'
                    placeholder='City, neighbourhood or address...'
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSearch()}
                  />
                </div>
              </div>

              <div className='home-search__field home-search__field--type'>
                <span className='home-search__icon'>
                  <HomeIcon size={18} />
                </span>
                <div className='home-search__field-inner'>
                  <label>Property Type</label>
                  <select
                    value={propertyType}
                    onChange={e => setPropertyType(e.target.value)}
                  >
                    {/* PHASE 3+ — artisan service options: searchTab === 'artisan' ? (<option value=''>Any Service</option>...) : */}
                    <>
                      <option value=''>Any Type</option>
                      <option value='apartment'>Apartment</option>
                      <option value='house'>House / Duplex</option>
                      <option value='land'>Land</option>
                      <option value='commercial'>Commercial</option>
                      <option value='shortlet'>Shortlet</option>
                      <option value='booking'>Hotels</option>
                    </>
                  </select>
                </div>
              </div>

              <button className='home-search__btn' onClick={handleSearch}>
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

            {/* PHASE 3+ — TikTok feed mobile CTA. Restore when feed launches.
            <div className='home-search__feed-hint'>
              <span>or</span>
              <button className='home-search__feed-btn' onClick={() => router.push('/feed')}>
                <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.2'>
                  <rect x='2' y='3' width='20' height='14' rx='2'/><path d='M8 21h8M12 17v4'/>
                </svg>
                Browse Feed
              </button>
            </div>
            */}
          </div>
        </div>
      </section>

      {/* ── Featured Listings ── */}
      <section id='listings' className='home-listings'>
        <div className='home-listings__inner'>
          <div className='home-listings__header'>
            <div>
              <h2 className='home-listings__title'>Featured Properties</h2>
              <p className='home-listings__sub'>
                Handpicked verified listings across Nigeria
              </p>
            </div>
            <div className='home-listings__tabs'>
              {[
                { key: 'all', label: 'All' },
                { key: 'rent', label: 'Rent' },
                { key: 'sale', label: 'Buy' },
                { key: 'shortlet', label: 'Shortlet' }
              ].map(t => (
                <button
                  key={t.key}
                  className={`home-tab${listingTab === t.key ? ' active' : ''}`}
                  onClick={() => setListingTab(t.key)}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {loadingProps ? (
            <div className='home-cards-loading'>
              {[1, 2, 3].map(i => (
                <div key={i} className='home-card home-card--skeleton' />
              ))}
            </div>
          ) : (
            <div className='home-cards'>
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
                  const id = encodeId(listing._id || listing.id)
                  return (
                    <div
                      key={id}
                      className='home-card'
                      onClick={() =>
                        router.push(
                          listing.isFallback ? '/search' : `/property/${id}`
                        )
                      }
                    >
                      <div className='home-card__img-wrap'>
                        <img src={img} alt={listing.title} loading='lazy' />
                        <span
                          className={`home-card__badge home-card__badge--${type}`}
                        >
                          {label}
                        </span>
                      </div>
                      <div className='home-card__body'>
                        <h3 className='home-card__title'>{listing.title}</h3>
                        {loc && (
                          <p className='home-card__loc'>
                            <MapPin
                              size={12}
                              style={{
                                display: 'inline',
                                verticalAlign: 'middle',
                                marginRight: 3
                              }}
                            />
                            {loc}
                          </p>
                        )}
                        <div className='home-card__stats'>
                          {listing.bedrooms != null && (
                            <span>
                              <BedDouble
                                size={12}
                                style={{
                                  display: 'inline',
                                  verticalAlign: 'middle',
                                  marginRight: 3
                                }}
                              />
                              {listing.bedrooms} bed
                              {listing.bedrooms !== 1 ? 's' : ''}
                            </span>
                          )}
                          {listing.bathrooms != null && (
                            <span>
                              <Bath
                                size={12}
                                style={{
                                  display: 'inline',
                                  verticalAlign: 'middle',
                                  marginRight: 3
                                }}
                              />
                              {listing.bathrooms} bath
                              {listing.bathrooms !== 1 ? 's' : ''}
                            </span>
                          )}
                          {listing.category && (
                            <span>
                              <Tag
                                size={12}
                                style={{
                                  display: 'inline',
                                  verticalAlign: 'middle',
                                  marginRight: 3
                                }}
                              />
                              {listing.category}
                            </span>
                          )}
                        </div>
                        <div className='home-card__footer'>
                          <div className='home-card__price'>
                            {formatPrice(listing.rentPrice, listing.purpose)}
                          </div>
                          {listing.stats?.averageRating > 0 && (
                            <div className='home-card__rating'>
                              <StarIcon
                                size={12}
                                fill='#fbbf24'
                                stroke='none'
                                style={{
                                  display: 'inline',
                                  verticalAlign: 'middle'
                                }}
                              />{' '}
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

          <div className='home-listings__cta'>
            <button
              className='home-btn-outline'
              onClick={() => router.push('/search')}
            >
              Explore All Properties →
            </button>
          </div>
        </div>
      </section>

      {/* ── Trust Strip ── */}
      <div className='home-trust'>
        <div className='home-trust__inner'>
          <div className='home-trust__item'>
            <CheckCircle2 size={18} />
            <span>
              <strong>Verified</strong> listings only
            </span>
          </div>
          <div className='home-trust__item'>
            <Lock size={18} />
            <span>
              <strong>Escrow</strong> on all payments
            </span>
          </div>
          <div className='home-trust__item'>
            <StarIcon size={18} fill='#C4E53C' stroke='none' />
            <span>
              <strong>{stats.avgRating || '4.9/5'}</strong> avg rating
            </span>
          </div>
          <div className='home-trust__item'>
            <Building2 size={18} />
            <span>
              <strong>{stats.activeListings || '10,000+'}</strong> active
              listings
            </span>
          </div>
          <div className='home-trust__item'>
            <Zap size={18} />
            <span>
              <strong>Real-time</strong> chat &amp; booking
            </span>
          </div>
        </div>
      </div>

      {/* ── Categories ── */}
      <section className='home-cats'>
        <div className='home-cats__inner'>
          <h2 className='home-cats__title'>What are you looking for?</h2>
          <div className='home-cats__grid'>
            {CATEGORIES.map(cat => (
              <button
                key={cat.query}
                className='home-cat'
                onClick={() => router.push(`/search?type=${cat.query}`)}
              >
                <span className='home-cat__icon'>
                  <cat.Icon size={28} />
                </span>
                <span className='home-cat__label'>{cat.label}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Popular Locations ── */}
      <section className='home-locations'>
        <div className='home-locations__inner'>
          <h2 className='home-locations__title'>Popular Destinations</h2>
          <p className='home-locations__sub'>
            Browse thousands of listings in Nigeria's top cities
          </p>
          <div className='home-locations__grid'>
            {LOCATIONS.map(loc => (
              <div
                key={loc.city}
                className='home-loc'
                onClick={() => router.push(`/search?location=${loc.city}`)}
              >
                <img src={loc.image} alt={loc.city} loading='lazy' />
                <div className='home-loc__overlay' />
                <div className='home-loc__info'>
                  <h3>{loc.city}</h3>
                  <p>{loc.listings} listings</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PHASE 3+ — Artisan Marketplace section. Restore when artisan marketplace launches.
      <section id='artisans' className='home-artisan'>
        <div className='home-artisan__inner'>
          <div className='home-artisan__text'>
            <span className='home-tag'>Service Marketplace</span>
            <h2>Find Trusted Artisans<br />for Any Job</h2>
            <p>Hire verified plumbers, electricians, painters, cleaners, and 20+ more trades — with rated profiles, upfront quotes, and escrow-protected payments.</p>
            <ul className='home-artisan__perks'>
              <li>Background-checked &amp; certified</li>
              <li>Read reviews before you book</li>
              <li>Escrow payment — pay on completion</li>
              <li>Real-time messaging &amp; scheduling</li>
            </ul>
            <button className='home-btn-lime' onClick={() => router.push('/search?type=artisan')}>Find an Artisan →</button>
          </div>
          <div className='home-artisan__cards'>
            {(loadingArtisans ? [] : artisans).map(a => {
              const name = a.name || `${a.firstName || ''} ${(a.lastName || '').charAt(0)}.`.trim()
              const spec = a.specialization || a.artisanProfile?.specialization || 'Artisan'
              const rating = a.rating ?? a.stats?.averageRating ?? 0
              const jobs = a.completedJobs ?? a.stats?.completedJobs ?? 0
              const isVerified = a.verified ?? a.status?.verified ?? false
              const isTopRated = rating >= 4.8 || a.plan?.name === 'pro' || a.plan?.name === 'enterprise'
              return (
                <div key={a._id} className='home-artisan-card' onClick={() => router.push('/search?type=artisan')}>
                  <div className='home-artisan-card__head'>
                    <span className='home-artisan-card__avatar'>{artisanTradeIcon(spec)}</span>
                    <div><h4>{name}</h4><p>{spec}</p></div>
                    <span className='home-artisan-card__badge'>{isTopRated ? 'Top Rated' : 'Verified'}</span>
                  </div>
                  <div className='home-artisan-card__foot'>
                    {rating > 0 && <span><StarIcon size={12} fill='#fbbf24' stroke='none' style={{ display:'inline', verticalAlign:'middle', marginRight:3 }} />{rating.toFixed(1)}</span>}
                    {jobs > 0 && <span>{jobs} jobs</span>}
                    {isVerified && <span className='home-artisan-card__verified'>✓ Verified</span>}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>
      */}

      {/* ── How It Works ── */}
      <section id='how-it-works' className='home-hiw'>
        <div className='home-hiw__inner'>
          <span className='home-tag'>Simple Process</span>
          <h2 className='home-hiw__title'>How {appName} Works</h2>
          <div className='home-hiw__steps'>
            {HOW_IT_WORKS.map((s, i) => (
              <div key={s.step} className='home-step'>
                <div className='home-step__num'>{s.step}</div>
                <div className='home-step__icon'>
                  <s.Icon size={32} />
                </div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
                {i < HOW_IT_WORKS.length - 1 && (
                  <div className='home-step__arrow'>→</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className='home-reviews'>
        <div className='home-reviews__inner'>
          <span className='home-tag'>Testimonials</span>
          <h2 className='home-reviews__title'>Loved by Thousands</h2>
          <div className='home-reviews__grid'>
            {TESTIMONIALS.map(t => (
              <div key={t.name} className='home-review'>
                <div className='home-review__stars'>
                  {Array.from({ length: t.stars }, (_, i) => (
                    <StarIcon key={i} size={14} fill='#fbbf24' stroke='none' />
                  ))}
                </div>
                <p className='home-review__text'>"{t.text}"</p>
                <div className='home-review__author'>
                  <span
                    className='home-review__avatar'
                    style={{
                      background: t.avatarColor + '22',
                      color: t.avatarColor,
                      border: `2px solid ${t.avatarColor}55`,
                      fontWeight: 700,
                      fontSize: 14,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {t.initials}
                  </span>
                  <div>
                    <div className='home-review__name'>{t.name}</div>
                    <div className='home-review__role'>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className='home-cta'>
        <div className='home-cta__inner'>
          <h2>Ready to Find Your Perfect Property?</h2>
          <p>
            Join {stats.verifiedUsers || '50,000+'} users already buying,
            renting, and connecting on {appName}
          </p>
          <div className='home-cta__btns'>
            <button
              className='home-btn-lime'
              onClick={() => router.push('/auth/register')}
            >
              Get Started Free →
            </button>
            <button
              className='home-btn-ghost-white'
              onClick={() => router.push('/search')}
            >
              Browse Listings
            </button>
          </div>
          <div className='home-cta__trust'>
            <span>✓ Free to join</span>
            <span>✓ No hidden fees</span>
            <span>✓ Verified listings</span>
          </div>
        </div>
      </section>
    </div>
  )
}
