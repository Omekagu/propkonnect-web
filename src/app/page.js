'use client'

import React, { useState, useEffect, useRef } from 'react'
import './Landing.scss'
import { useRouter } from 'next/navigation'

const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || 'propnekt'

// ── Data ──────────────────────────────────────────────────────────────────────

const CATEGORIES = [
  { icon: '🏢', label: 'Apartments', query: 'apartment' },
  { icon: '🏠', label: 'Houses', query: 'house' },
  { icon: '🏨', label: 'Hotels', query: 'hotel' },
  { icon: '🛏️', label: 'Shortlets', query: 'shortlet' },
  { icon: '🏗️', label: 'Land', query: 'land' },
  { icon: '🏬', label: 'Commercial', query: 'commercial' },
  { icon: '🔧', label: 'Artisans', query: 'artisan' }
]

const FEATURED_LISTINGS = [
  {
    id: 1,
    image:
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&q=80',
    badge: 'For Rent',
    badgeType: 'rent',
    title: '3-Bed Luxury Apartment',
    location: 'Victoria Island, Lagos',
    beds: 3,
    baths: 2,
    sqft: '1,450',
    price: '₦350,000',
    period: '/month',
    rating: 4.8,
    reviews: 24
  },
  {
    id: 2,
    image:
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&q=80',
    badge: 'For Sale',
    badgeType: 'sale',
    title: '5-Bed Detached Duplex',
    location: 'Lekki Phase 1, Lagos',
    beds: 5,
    baths: 4,
    sqft: '3,200',
    price: '₦85,000,000',
    period: '',
    rating: 4.9,
    reviews: 11
  },
  {
    id: 3,
    image:
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&q=80',
    badge: 'Shortlet',
    badgeType: 'shortlet',
    title: 'Modern Studio Suite',
    location: 'Ikeja GRA, Lagos',
    beds: 1,
    baths: 1,
    sqft: '650',
    price: '₦25,000',
    period: '/night',
    rating: 4.7,
    reviews: 58
  },
  {
    id: 4,
    image:
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&q=80',
    badge: 'For Sale',
    badgeType: 'sale',
    title: '4-Bed Semi-Detached',
    location: 'Abuja, FCT',
    beds: 4,
    baths: 3,
    sqft: '2,800',
    price: '₦65,000,000',
    period: '',
    rating: 4.6,
    reviews: 7
  },
  {
    id: 5,
    image:
      'https://images.unsplash.com/photo-1576941089067-2de3c901e126?w=600&q=80',
    badge: 'For Rent',
    badgeType: 'rent',
    title: '2-Bed Serviced Flat',
    location: 'Wuse 2, Abuja',
    beds: 2,
    baths: 2,
    sqft: '1,100',
    price: '₦180,000',
    period: '/month',
    rating: 4.5,
    reviews: 33
  },
  {
    id: 6,
    image:
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80',
    badge: 'Shortlet',
    badgeType: 'shortlet',
    title: 'Executive Hotel Suite',
    location: 'Garki, Abuja',
    beds: 2,
    baths: 2,
    sqft: '900',
    price: '₦45,000',
    period: '/night',
    rating: 4.9,
    reviews: 41
  }
]

const LOCATIONS = [
  {
    city: 'Lagos',
    country: 'Nigeria',
    listings: '4,200+',
    image:
      'https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=400&q=80'
  },
  {
    city: 'Abuja',
    country: 'Nigeria',
    listings: '2,800+',
    image:
      'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=400&q=80'
  },
  {
    city: 'Port Harcourt',
    country: 'Nigeria',
    listings: '1,100+',
    image:
      'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=400&q=80'
  },
  {
    city: 'Ibadan',
    country: 'Nigeria',
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
  const heroRef = useRef(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (location) params.set('location', location)
    if (propertyType) params.set('type', propertyType)
    params.set('intent', searchTab)
    router.push(`/search?${params.toString()}`)
  }

  const toggleSave = id =>
    setSavedCards(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  const filteredListings =
    listingTab === 'all'
      ? FEATURED_LISTINGS
      : FEATURED_LISTINGS.filter(l => l.badgeType === listingTab)

  const scrollTo = id =>
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })

  return (
    <div className='lp'>
      {/* ── Navbar ── */}
      <nav
        className={`lp-nav${scrolled ? ' lp-nav--scrolled' : ''}${
          mobileMenuOpen ? ' lp-nav--open' : ''
        }`}
      >
        <div className='lp-nav__inner'>
          {/* Logo */}
          <a className='lp-nav__logo' href='/'>
            <span className='lp-nav__logo-icon'>P</span>
            <span className='lp-nav__logo-text'>{APP_NAME}</span>
          </a>

          {/* Desktop links */}
          <div className='lp-nav__links'>
            <a onClick={() => scrollTo('listings')}>Buy &amp; Rent</a>
            <a href='/search?intent=shortlet'>Shortlets</a>
            <a onClick={() => scrollTo('artisans')}>Artisans</a>
            <a onClick={() => scrollTo('how-it-works')}>How It Works</a>
            <a href='/about'>About</a>
          </div>

          {/* Actions */}
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
              List Property
            </button>
          </div>

          {/* Hamburger */}
          <button
            className='lp-nav__burger'
            onClick={() => setMobileMenuOpen(o => !o)}
            aria-label='Menu'
          >
            <span />
            <span />
            <span />
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className='lp-nav__mobile'>
            <a href='/buy'>Buy</a>
            <a href='/rent'>Rent</a>
            <a href='/search?intent=shortlet'>Shortlets</a>
            <a
              onClick={() => {
                scrollTo('artisans')
                setMobileMenuOpen(false)
              }}
            >
              Artisans
            </a>
            <a href='/about'>About</a>
            <hr />
            <a onClick={() => router.push('/auth/login')}>Sign In</a>
            <button onClick={() => router.push('/auth/register')}>
              List Property Free
            </button>
          </div>
        )}
      </nav>

      {/* ── Hero ── */}
      <section className='lp-hero' ref={heroRef}>
        <div className='lp-hero__bg'>
          <img
            src='https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1800&q=80'
            alt='Beautiful Nigerian property'
            loading='eager'
          />
          <div className='lp-hero__overlay' />
        </div>

        <div className='lp-hero__content'>
          <p className='lp-hero__eyebrow'>
            50,000+ verified users · 10,000+ listings
          </p>
          <h1 className='lp-hero__title'>
            Find Your <span>Perfect</span>
            <br />
            Property in Nigeria
          </h1>
          <p className='lp-hero__sub'>
            Buy, rent, or book a shortlet — all with escrow-secured payments and
            verified listings.
          </p>

          {/* Search Widget */}
          <div className='lp-search'>
            {/* Tabs */}
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

            {/* Fields */}
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

              {searchTab !== 'artisan' && (
                <div className='lp-search__field lp-search__field--type'>
                  <span className='lp-search__icon'>🏠</span>
                  <div className='lp-search__field-inner'>
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
                    </select>
                  </div>
                </div>
              )}

              {searchTab === 'artisan' && (
                <div className='lp-search__field lp-search__field--type'>
                  <span className='lp-search__icon'>🔧</span>
                  <div className='lp-search__field-inner'>
                    <label>Service Type</label>
                    <select
                      value={propertyType}
                      onChange={e => setPropertyType(e.target.value)}
                    >
                      <option value=''>Any Service</option>
                      <option value='plumbing'>Plumbing</option>
                      <option value='electrical'>Electrical</option>
                      <option value='painting'>Painting</option>
                      <option value='cleaning'>Cleaning</option>
                      <option value='carpentry'>Carpentry</option>
                      <option value='tiling'>Tiling</option>
                    </select>
                  </div>
                </div>
              )}

              <button className='lp-search__btn' onClick={handleSearch}>
                <svg
                  width='20'
                  height='20'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                  strokeWidth='2.5'
                >
                  <circle cx='11' cy='11' r='8' />
                  <path d='m21 21-4.35-4.35' />
                </svg>
                Search
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Trust Strip ── */}
      <div className='lp-trust'>
        <div className='lp-trust__inner'>
          <div className='lp-trust__item'>
            <span>✅</span>{' '}
            <span>
              <strong>Verified</strong> listings only
            </span>
          </div>
          <div className='lp-trust__item'>
            <span>🔐</span>{' '}
            <span>
              <strong>Escrow</strong> on all payments
            </span>
          </div>
          <div className='lp-trust__item'>
            <span>⭐</span>{' '}
            <span>
              <strong>4.9/5</strong> avg rating
            </span>
          </div>
          <div className='lp-trust__item'>
            <span>🏘️</span>{' '}
            <span>
              <strong>10,000+</strong> active listings
            </span>
          </div>
          <div className='lp-trust__item'>
            <span>⚡</span>{' '}
            <span>
              <strong>Real-time</strong> chat & booking
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

          <div className='lp-cards'>
            {filteredListings.map(listing => (
              <div
                key={listing.id}
                className='lp-card'
                onClick={() => router.push(`/property/${listing.id}`)}
              >
                <div className='lp-card__img-wrap'>
                  <img src={listing.image} alt={listing.title} loading='lazy' />
                  <span
                    className={`lp-card__badge lp-card__badge--${listing.badgeType}`}
                  >
                    {listing.badge}
                  </span>
                  <button
                    className={`lp-card__save${
                      savedCards.has(listing.id) ? ' saved' : ''
                    }`}
                    onClick={e => {
                      e.stopPropagation()
                      toggleSave(listing.id)
                    }}
                    aria-label='Save property'
                  >
                    {savedCards.has(listing.id) ? '❤️' : '🤍'}
                  </button>
                </div>
                <div className='lp-card__body'>
                  <h3 className='lp-card__title'>{listing.title}</h3>
                  <p className='lp-card__loc'>📍 {listing.location}</p>
                  <div className='lp-card__stats'>
                    <span>🛏 {listing.beds} beds</span>
                    <span>🚿 {listing.baths} baths</span>
                    <span>📐 {listing.sqft} sqft</span>
                  </div>
                  <div className='lp-card__footer'>
                    <div className='lp-card__price'>
                      {listing.price}
                      <span className='lp-card__period'>{listing.period}</span>
                    </div>
                    <div className='lp-card__rating'>
                      ⭐ <strong>{listing.rating}</strong>
                      <span>({listing.reviews})</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

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
            {[
              {
                emoji: '⚡',
                name: 'Chukwuemeka P.',
                trade: 'Master Electrician',
                rating: '4.9',
                jobs: '312 jobs',
                badge: 'Top Rated'
              },
              {
                emoji: '🔧',
                name: 'Aminu D.',
                trade: 'Plumbing Specialist',
                rating: '4.8',
                jobs: '201 jobs',
                badge: 'Verified'
              },
              {
                emoji: '🎨',
                name: 'Ngozi A.',
                trade: 'Interior Painter',
                rating: '4.9',
                jobs: '178 jobs',
                badge: 'Top Rated'
              }
            ].map(a => (
              <div key={a.name} className='lp-artisan-card'>
                <div className='lp-artisan-card__head'>
                  <span className='lp-artisan-card__avatar'>{a.emoji}</span>
                  <div>
                    <h4>{a.name}</h4>
                    <p>{a.trade}</p>
                  </div>
                  <span className='lp-artisan-card__badge'>{a.badge}</span>
                </div>
                <div className='lp-artisan-card__foot'>
                  <span>⭐ {a.rating}</span>
                  <span>{a.jobs}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section id='how-it-works' className='lp-hiw'>
        <div className='lp-hiw__inner'>
          <span className='lp-tag'>Simple Process</span>
          <h2 className='lp-hiw__title'>How {APP_NAME} Works</h2>
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
            Join 50,000+ users already buying, renting, and connecting on{' '}
            {APP_NAME}
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
