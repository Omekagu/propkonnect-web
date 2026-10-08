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
  CheckCircle2,
  Lock,
  // Hammer, // PHASE 3+ — artisan marketplace
  Search as SearchIcon
} from 'lucide-react'

const API = process.env.NEXT_PUBLIC_BACKEND_URL || ''
const APP_NAME_FALLBACK = process.env.NEXT_PUBLIC_APP_NAME || 'propnekt'

const CITY_SUGGESTIONS = [
  'Lagos Island',
  'Victoria Island',
  'Lekki',
  'Ikoyi',
  'Surulere',
  'Yaba',
  'Ajah',
  'Ikeja',
  'Abuja CBD',
  'Wuse II',
  'Garki',
  'Maitama',
  'Asokoro',
  'Gwarimpa',
  'Jabi',
  'Lugbe',
  'Port Harcourt',
  'GRA Port Harcourt',
  'Rumuola',
  'Ibadan',
  'Enugu',
  'Kano',
  'Kaduna',
  'Calabar',
  'Uyo',
  'Warri',
  'Benin City',
  'Owerri',
  'Onitsha',
  'Nnewi',
  'Asaba'
]

const POPULAR_SEARCHES = [
  'Lagos Island',
  'Lekki',
  'Abuja CBD',
  'Ikoyi',
  'Port Harcourt'
]

// ── Static fallback data ────────────────────────────────────────────────────

/* PHASE 3+ — artisan fallback data. Restore when artisan marketplace launches.
const FALLBACK_ARTISANS = [
  { _id: 'a1', firstName: 'Chukwuemeka', lastName: 'P.', artisanProfile: { specialization: 'Master Electrician' }, stats: { averageRating: 4.9, completedJobs: 312 }, status: { verified: true }, plan: { name: 'pro' } },
  { _id: 'a2', firstName: 'Aminu', lastName: 'D.', artisanProfile: { specialization: 'Plumbing Specialist' }, stats: { averageRating: 4.8, completedJobs: 201 }, status: { verified: true }, plan: { name: 'pro' } },
  { _id: 'a3', firstName: 'Ngozi', lastName: 'A.', artisanProfile: { specialization: 'Interior Painter' }, stats: { averageRating: 4.9, completedJobs: 178 }, status: { verified: true }, plan: { name: 'pro' } }
]
*/

const CATEGORIES = [
  {
    Icon: Building2,
    label: 'Apartments',
    desc: 'Studio to penthouse — verified apartments across every major city.',
    query: 'apartment'
  },
  {
    Icon: HomeIcon,
    label: 'Houses',
    desc: 'Detached, semi-detached, bungalows, and duplexes available now.',
    query: 'house'
  },
  {
    Icon: Hotel,
    label: 'Hotels',
    desc: 'Curated hotel rooms for business and leisure across Nigeria.',
    query: 'hotel'
  },
  {
    Icon: BedDouble,
    label: 'Shortlets',
    desc: 'Fully furnished short-stay apartments from one night upwards.',
    query: 'shortlet'
  },
  {
    Icon: Layers,
    label: 'Land',
    desc: 'Verified plots — residential, commercial, and agricultural land.',
    query: 'land'
  },
  {
    Icon: Store,
    label: 'Commercial',
    desc: 'Offices, shops, warehouses, and co-working spaces nationwide.',
    query: 'commercial'
  }
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

  const [searchTab, setSearchTab] = useState('rent')
  const [location, setLocation] = useState('')
  const [propertyType, setPropertyType] = useState('')
  const [listingTab, setListingTab] = useState('all')
  const [savedCards, setSavedCards] = useState(new Set())

  // Data from API
  const [branding, setBranding] = useState(null)
  const [properties, setProperties] = useState([])
  // PHASE 3+ — const [artisans, setArtisans] = useState([])
  const [loadingProps, setLoadingProps] = useState(true)
  // PHASE 3+ — const [loadingArtisans, setLoadingArtisans] = useState(true)

  const heroRef = useRef(null)

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

  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)

  const handleLocationChange = useCallback(e => {
    const val = e.target.value
    setLocation(val)
    if (val.trim().length >= 2) {
      const q = val.toLowerCase()
      const filtered = CITY_SUGGESTIONS.filter(c =>
        c.toLowerCase().includes(q)
      ).slice(0, 6)
      setSuggestions(filtered)
      setShowSuggestions(filtered.length > 0)
    } else if (val.trim().length === 0) {
      setSuggestions(POPULAR_SEARCHES)
      setShowSuggestions(true)
    } else {
      setShowSuggestions(false)
    }
  }, [])

  useEffect(() => {
    const els = Array.from(document.querySelectorAll('.reveal'))
    if (!els.length) return
    const vp = window.innerHeight
    const toAnimate = []
    els.forEach(el => {
      const rect = el.getBoundingClientRect()
      if (rect.top < vp) {
        // Already in viewport — show immediately, no animation needed
        el.style.opacity = '1'
        el.style.transform = 'none'
      } else {
        // Below viewport — hide then animate in on scroll
        el.style.opacity = '0'
        el.style.transform = 'translateY(28px)'
        el.style.transition =
          'opacity 0.7s cubic-bezier(0.4,0,0.2,1), transform 0.7s cubic-bezier(0.4,0,0.2,1)'
        toAnimate.push(el)
      }
    })
    if (!toAnimate.length) return
    const io = new IntersectionObserver(
      entries =>
        entries.forEach(e => {
          if (e.isIntersecting) {
            e.target.style.opacity = '1'
            e.target.style.transform = 'none'
            io.unobserve(e.target)
          }
        }),
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
    )
    toAnimate.forEach(el => io.observe(el))
    return () => io.disconnect()
  }, [loadingProps])

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
      {/* ── Hero ── */}
      <section className='home-hero' ref={heroRef}>
        <div className='home-hero__bg'>
          <img src={heroImage} alt='Property' loading='eager' />
          <div className='home-hero__overlay' />
          <div className='home-hero__grid' />
        </div>

        {/* Giant brand watermark */}
        <div className='home-hero__display' aria-hidden='true'>
          PROPNEKT
        </div>

        {/* Stat cards — absolutely positioned top-right */}
        <div className='home-hero__stats-abs'>
          <div className='home-hero__stat-card'>
            <strong>{stats.verifiedUsers || '50,000+'}</strong>
            <span>Verified Users</span>
          </div>
          <div className='home-hero__stat-card'>
            <strong>{stats.activeListings || '10,000+'}</strong>
            <span>Active Listings</span>
          </div>
          <div className='home-hero__stat-card'>
            <strong>4.9 / 5</strong>
            <span>User Rating</span>
          </div>
        </div>

        {/* Main — flex:1, content pushed to bottom */}
        <div className='home-hero__main'>
          <div className='home-hero__copy'>
            <div className='home-hero__ai-badge'></div>
            <div className='home-hero__ai-badge'></div>
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
          </div>

          <div className='home-search'>
            <div className='home-search__tabs'>
              {[
                { key: 'buy', label: 'Buy' },
                { key: 'rent', label: 'Rent' },
                { key: 'booking', label: 'Booking' }
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
                    onChange={handleLocationChange}
                    onKeyDown={e => {
                      if (e.key === 'Enter') handleSearch()
                      if (e.key === 'Escape') setShowSuggestions(false)
                    }}
                    onFocus={() => {
                      if (location.trim().length === 0) {
                        setSuggestions(POPULAR_SEARCHES)
                        setShowSuggestions(true)
                      } else if (location.length >= 2) {
                        setShowSuggestions(suggestions.length > 0)
                      }
                    }}
                    onBlur={() =>
                      setTimeout(() => setShowSuggestions(false), 160)
                    }
                    autoComplete='off'
                  />
                </div>
                {showSuggestions && (
                  <div className='home-suggestions'>
                    {location.trim() === '' && (
                      <span className='home-suggestions__label'>
                        Popular searches
                      </span>
                    )}
                    {suggestions.map(s => (
                      <button
                        key={s}
                        className='home-suggestions__item'
                        onMouseDown={() => {
                          setLocation(s)
                          setShowSuggestions(false)
                        }}
                      >
                        <MapPin size={13} style={{ flexShrink: 0 }} />
                        {s}
                      </button>
                    ))}
                  </div>
                )}
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
                    <option value=''>Any Type</option>
                    <option value='apartment'>Apartment</option>
                    <option value='house'>House / Duplex</option>
                    <option value='land'>Land</option>
                    <option value='commercial'>Commercial</option>
                    <option value='shortlet'>Shortlet</option>
                    <option value='booking'>Hotels</option>
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
          </div>

          <div className='home-hero__proof'>
            <div className='home-hero__proof-avatars'>
              <span
                className='home-hero__proof-avatar'
                style={{ background: '#a78bfa' }}
              />
              <span
                className='home-hero__proof-avatar'
                style={{ background: '#4ade80' }}
              />
              <span
                className='home-hero__proof-avatar'
                style={{ background: '#fb923c' }}
              />
              <span
                className='home-hero__proof-avatar'
                style={{ background: '#38bdf8' }}
              />
            </div>
            <span className='home-hero__proof-text'>
              <strong>50,000+</strong> verified users
            </span>
            <span className='home-hero__proof-sep' />
            <span className='home-hero__proof-rating'>★ 4.9 / 5</span>
          </div>
        </div>

        <div className='home-hero__strip'>
          <span>Since 2024</span>
          <span>Nigeria&apos;s verified property platform</span>
        </div>
      </section>

      {/* ── Trust Stats ── */}
      <div className='home-trust reveal'>
        <div className='home-trust__inner'>
          <div className='home-trust__stat'>
            <strong>{stats.activeListings || '10,000+'}</strong>
            <span>Verified listings</span>
          </div>
          <div className='home-trust__sep' />
          <div className='home-trust__stat'>
            <strong>{stats.verifiedUsers || '50,000+'}</strong>
            <span>Active users</span>
          </div>
          <div className='home-trust__sep' />
          <div className='home-trust__stat'>
            <strong>{stats.avgRating || '4.9'} / 5</strong>
            <span>User satisfaction</span>
          </div>
          <div className='home-trust__sep' />
          <div className='home-trust__stat'>
            <strong>&#8358;0 lost</strong>
            <span>Escrow-protected</span>
          </div>
        </div>
      </div>

      {/* ── About ── */}
      <section className='home-about reveal'>
        <div className='home-about__inner'>
          <div className='home-about__text'>
            <span className='home-tag'>Who We Are</span>
            <h2>
              Built for Nigeria&apos;s
              <br />
              <span>property market.</span>
            </h2>
            <p>
              We set out to solve a real problem: buying, renting, and managing
              property in Nigeria was too slow, too opaque, and too risky.
              Propnekt changes that — with verified listings, escrow-secured
              payments, and real-time connections between owners and seekers.
            </p>
            <div className='home-about__pillars'>
              <div className='home-about__pillar'>
                <CheckCircle2 size={16} />
                <div>
                  <h4>Zero ghost listings</h4>
                  <p>Every property is verified before it goes live.</p>
                </div>
              </div>
              <div className='home-about__pillar'>
                <Lock size={16} />
                <div>
                  <h4>Escrow on every deal</h4>
                  <p>Funds held safely until you&apos;re satisfied.</p>
                </div>
              </div>
              <div className='home-about__pillar'>
                <Zap size={16} />
                <div>
                  <h4>Search to signed in days</h4>
                  <p>Smart filters, instant messaging, direct owner access.</p>
                </div>
              </div>
            </div>
            <button
              className='home-btn-lime'
              onClick={() => router.push('/about')}
            >
              Learn more →
            </button>
          </div>
          <div className='home-about__visual'>
            <img
              src='https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80'
              alt='Modern verified apartment'
              loading='lazy'
            />
            <div className='home-about__badge'>
              <strong>&#8358;0 lost</strong>
              <span>
                Escrow-protected
                <br />
                since launch
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Categories / Services ── */}
      <section className='home-cats reveal'>
        <div className='home-cats__inner'>
          <div className='home-cats__header'>
            <span className='home-tag'>Our Services</span>
            <h2 className='home-cats__title'>
              What are you
              <br />
              looking for?
            </h2>
          </div>
          <div className='home-cats__grid'>
            {CATEGORIES.map(cat => (
              <button
                key={cat.query}
                className='home-cat'
                onClick={() => router.push(`/search?type=${cat.query}`)}
              >
                <div className='home-cat__icon-box'>
                  <cat.Icon size={24} />
                </div>
                <div className='home-cat__body'>
                  <h3>{cat.label}</h3>
                  <p>{cat.desc}</p>
                </div>
                <span className='home-cat__arrow'>→</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Listings ── */}
      <section id='listings' className='home-listings reveal'>
        <div className='home-listings__inner'>
          <div className='home-listings__header'>
            <div>
              <span className='home-tag'>Featured Work</span>
              <h2 className='home-listings__title'>
                Verified properties.
                <br />
                Curated for you.
              </h2>
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

      {/* ── How It Works ── */}
      <section id='how-it-works' className='home-hiw reveal'>
        <div className='home-hiw__inner'>
          <div className='home-hiw__head'>
            <span className='home-tag'>Simple Process</span>
            <h2 className='home-hiw__title'>How {appName} works.</h2>
          </div>
          <div className='home-hiw__steps'>
            {HOW_IT_WORKS.map(s => (
              <div key={s.step} className='home-step'>
                <span className='home-step__num'>{s.step}</span>
                <div className='home-step__icon'>
                  <s.Icon size={26} />
                </div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className='home-reviews reveal'>
        <div className='home-reviews__inner'>
          <div className='home-reviews__head'>
            <span className='home-tag'>Testimonials</span>
            <h2 className='home-reviews__title'>
              Clients love
              <br />
              our platform.
            </h2>
          </div>
          <div className='home-reviews__grid'>
            {TESTIMONIALS.map(t => (
              <div key={t.name} className='home-review'>
                <div className='home-review__quote'>&#8220;</div>
                <div className='home-review__stars'>
                  {Array.from({ length: t.stars }, (_, i) => (
                    <StarIcon key={i} size={14} fill='#fbbf24' stroke='none' />
                  ))}
                </div>
                <p className='home-review__text'>{t.text}</p>
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
      <section className='home-cta reveal'>
        <div className='home-cta__inner'>
          <h2>
            Ready to find your
            <br />
            <span>perfect property?</span>
          </h2>
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
