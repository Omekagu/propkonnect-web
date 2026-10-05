'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  Search,
  SlidersHorizontal,
  MapPin,
  Bed,
  Bath,
  X,
  ChevronLeft,
  ChevronRight,
  Home,
  Building2,
  Hotel,
  TreePine,
  Briefcase,
  Star,
  Wifi,
  Car,
  Dumbbell,
  Waves,
  UtensilsCrossed,
  CheckSquare,
  ArrowUpDown,
  Grid3X3,
  List,
  Heart,
  Eye
} from 'lucide-react'
import './search.scss'
import { encodeId } from '@/libs/propId'

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || ''

const CATEGORIES = [
  { value: '', label: 'All Types', icon: <Grid3X3 size={14} /> },
  { value: 'Apartment', label: 'Apartment', icon: <Building2 size={14} /> },
  { value: 'House', label: 'House', icon: <Home size={14} /> },
  { value: 'Hotel', label: 'Hotel', icon: <Hotel size={14} /> },
  { value: 'Shortlet', label: 'Shortlet', icon: <Star size={14} /> },
  { value: 'Land', label: 'Land', icon: <TreePine size={14} /> },
  { value: 'Commercial', label: 'Commercial', icon: <Briefcase size={14} /> }
]

const PURPOSES = [
  { value: '', label: 'Buy or Rent' },
  { value: 'For Sale', label: 'For Sale' },
  { value: 'For Rent', label: 'For Rent' }
]

const SORT_OPTIONS = [
  { value: '-createdAt', label: 'Newest First' },
  { value: 'createdAt', label: 'Oldest First' },
  { value: 'price', label: 'Price: Low to High' },
  { value: '-price', label: 'Price: High to Low' },
  { value: 'rentPrice', label: 'Rent: Low to High' },
  { value: '-rentPrice', label: 'Rent: High to Low' }
]

const FEATURES = [
  { key: 'furnished', label: 'Furnished' },
  { key: 'parking', label: 'Parking' },
  { key: 'swimmingPool', label: 'Swimming Pool', icon: <Waves size={12} /> },
  { key: 'gym', label: 'Gym', icon: <Dumbbell size={12} /> },
  { key: 'wifi', label: 'Wi-Fi', icon: <Wifi size={12} /> },
  { key: 'serviced', label: 'Serviced' },
  { key: 'breakfast', label: 'Breakfast', icon: <UtensilsCrossed size={12} /> },
  { key: 'petsAllowed', label: 'Pets OK' }
]

function formatPrice (property) {
  const fmt = n => `₦${Number(n).toLocaleString()}`
  if (property.purpose === 'For Sale' && property.price)
    return fmt(property.price)
  if (property.rentPrice) return `${fmt(property.rentPrice)} · monthly`
  if (property.pricePerNight) return `${fmt(property.pricePerNight)} · nightly`
  if (property.price) return fmt(property.price)
  return 'Price on request'
}

function getImage (property) {
  // Try various media paths
  const media = property.media || property.images
  if (Array.isArray(media) && media.length) {
    const first = media[0]
    if (typeof first === 'string') return first
    if (first?.url) return first.url
    if (first?.cloudinaryUrl) return first.cloudinaryUrl
  }
  if (property.coverImage) return property.coverImage
  return null
}

function getLocation (p) {
  if (typeof p.location === 'string') return p.location
  const parts = [
    p.location?.address,
    p.location?.city || p.city,
    p.location?.state || p.state
  ]
  return parts.filter(Boolean).join(', ') || p.address || 'Nigeria'
}

function purposeTag (p) {
  if (p.purpose === 'For Sale') return { label: 'For Sale', cls: 'sale' }
  if (p.purpose === 'For Rent') return { label: 'For Rent', cls: 'rent' }
  if (p.category === 'Hotel' || p.category === 'Shortlet')
    return { label: p.category, cls: 'short' }
  return { label: p.purpose || p.category || 'Listing', cls: 'sale' }
}

// ── Property Card ─────────────────────────────────────────────────────────────
function PropertyCard ({ property, view }) {
  const [imgError, setImgError] = useState(false)
  const img = getImage(property)
  const tag = purposeTag(property)
  const loc = getLocation(property)
  const price = formatPrice(property)
  const beds =
    property.beds ?? property.bedrooms ?? property.apartment?.bedrooms
  const baths =
    property.baths ?? property.bathrooms ?? property.apartment?.bathrooms

  const card = (
    <Link
      href={`/property/${encodeId(property._id)}`}
      className={`prop-card ${view === 'list' ? 'prop-card--list' : ''}`}
    >
      <div className='prop-card__img'>
        {img && !imgError ? (
          <img
            src={img}
            alt={property.title}
            onError={() => setImgError(true)}
            loading='lazy'
          />
        ) : (
          <div className='prop-card__img-fallback'>
            <Home size={32} />
          </div>
        )}
        <span className={`prop-card__tag prop-card__tag--${tag.cls}`}>
          {tag.label}
        </span>
        {property.premiere && (
          <span className='prop-card__tag prop-card__tag--premier'>
            ★ Premier
          </span>
        )}
        <button
          className='prop-card__save'
          onClick={e => e.preventDefault()}
          aria-label='Save'
        >
          <Heart size={15} />
        </button>
      </div>
      <div className='prop-card__body'>
        <p className='prop-card__cat'>{property.category}</p>
        <h3 className='prop-card__title'>{property.title}</h3>
        <p className='prop-card__loc'>
          <MapPin size={12} />
          {loc}
        </p>
        <div className='prop-card__meta'>
          {beds != null && (
            <span>
              <Bed size={12} />
              {beds} bd
            </span>
          )}
          {baths != null && (
            <span>
              <Bath size={12} />
              {baths} ba
            </span>
          )}
          {property.area && <span>{property.area}</span>}
        </div>
        <div className='prop-card__foot'>
          <span className='prop-card__price'>{price}</span>
          <span className='prop-card__cta'>
            View <Eye size={12} />
          </span>
        </div>
      </div>
    </Link>
  )

  return card
}

// ── Filter Panel ──────────────────────────────────────────────────────────────
function FilterPanel ({ filters, onChange, onClear, onClose, mobile }) {
  const set = (key, val) => onChange({ ...filters, [key]: val, page: 1 })
  const toggle = key => set(key, filters[key] ? undefined : 'true')

  return (
    <aside className={`filter-panel ${mobile ? 'filter-panel--mobile' : ''}`}>
      {mobile && (
        <div className='filter-panel__head'>
          <h3>Filters</h3>
          <button onClick={onClose}>
            <X size={18} />
          </button>
        </div>
      )}

      {/* Purpose */}
      <div className='filter-section'>
        <label className='filter-label'>Listing Type</label>
        <div className='filter-pills'>
          {PURPOSES.map(p => (
            <button
              key={p.value}
              className={`pill ${
                filters.purpose === p.value || (!filters.purpose && !p.value)
                  ? 'pill--active'
                  : ''
              }`}
              onClick={() => set('purpose', p.value)}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Category */}
      <div className='filter-section'>
        <label className='filter-label'>Property Type</label>
        <div className='filter-pills filter-pills--wrap'>
          {CATEGORIES.map(c => (
            <button
              key={c.value}
              className={`pill ${
                filters.category === c.value || (!filters.category && !c.value)
                  ? 'pill--active'
                  : ''
              }`}
              onClick={() => set('category', c.value)}
            >
              {c.icon}
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Price range */}
      <div className='filter-section'>
        <label className='filter-label'>Price Range (₦)</label>
        <div className='filter-range'>
          <input
            type='number'
            placeholder='Min'
            value={filters.minPrice || ''}
            onChange={e => set('minPrice', e.target.value)}
          />
          <span>–</span>
          <input
            type='number'
            placeholder='Max'
            value={filters.maxPrice || ''}
            onChange={e => set('maxPrice', e.target.value)}
          />
        </div>
      </div>

      {/* Bedrooms */}
      <div className='filter-section'>
        <label className='filter-label'>Bedrooms</label>
        <div className='filter-pills'>
          {['', '1', '2', '3', '4', '5+'].map(n => (
            <button
              key={n}
              className={`pill ${
                (filters.bedrooms || '') === n ? 'pill--active' : ''
              }`}
              onClick={() => set('bedrooms', n === '5+' ? '5' : n)}
            >
              {n || 'Any'}
            </button>
          ))}
        </div>
      </div>

      {/* Features */}
      <div className='filter-section'>
        <label className='filter-label'>Features</label>
        <div className='filter-checks'>
          {FEATURES.map(f => (
            <label key={f.key} className='filter-check'>
              <input
                type='checkbox'
                checked={!!filters[f.key]}
                onChange={() => toggle(f.key)}
              />
              <span>{f.label}</span>
            </label>
          ))}
        </div>
      </div>

      <button className='btn-clear' onClick={onClear}>
        Clear all filters
      </button>
    </aside>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function SearchClient () {
  const router = useRouter()
  const searchParams = useSearchParams()

  const readFilters = () => ({
    search: searchParams.get('search') || '',
    purpose: searchParams.get('purpose') || '',
    category: searchParams.get('category') || '',
    location: searchParams.get('location') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    bedrooms: searchParams.get('bedrooms') || '',
    furnished: searchParams.get('furnished') || '',
    parking: searchParams.get('parking') || '',
    swimmingPool: searchParams.get('swimmingPool') || '',
    gym: searchParams.get('gym') || '',
    wifi: searchParams.get('wifi') || '',
    serviced: searchParams.get('serviced') || '',
    breakfast: searchParams.get('breakfast') || '',
    petsAllowed: searchParams.get('petsAllowed') || '',
    sort: searchParams.get('sort') || '-createdAt',
    page: Number(searchParams.get('page') || 1)
  })

  const [filters, setFilters] = useState(readFilters)
  const [properties, setProperties] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [view, setView] = useState('grid')
  const [showMobileFilter, setShowMobileFilter] = useState(false)
  const LIMIT = 20
  const totalPages = Math.ceil(total / LIMIT)
  const debounceRef = useRef(null)

  // Sync filters → URL
  const pushUrl = useCallback(
    f => {
      const params = new URLSearchParams()
      Object.entries(f).forEach(([k, v]) => {
        if (v && v !== '' && v !== 1) params.set(k, String(v))
      })
      router.push(`/properties?${params.toString()}`, { scroll: false })
    },
    [router]
  )

  const handleFilterChange = newFilters => {
    setFilters(newFilters)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => pushUrl(newFilters), 400)
  }

  const handleClear = () => {
    const clean = {
      search: '',
      purpose: '',
      category: '',
      location: '',
      minPrice: '',
      maxPrice: '',
      bedrooms: '',
      sort: '-createdAt',
      page: 1
    }
    setFilters(clean)
    router.push('/properties')
  }

  // Fetch properties
  useEffect(() => {
    const f = filters
    const params = new URLSearchParams()
    if (f.search) params.set('search', f.search)
    if (f.purpose) params.set('purpose', f.purpose)
    if (f.category) params.set('category', f.category)
    if (f.location) params.set('location', f.location)
    if (f.minPrice) params.set('minPrice', f.minPrice)
    if (f.maxPrice) params.set('maxPrice', f.maxPrice)
    if (f.bedrooms) params.set('bedrooms', f.bedrooms)
    if (f.sort) params.set('sort', f.sort)
    params.set('page', String(f.page || 1))
    params.set('limit', String(LIMIT))
    FEATURES.forEach(feat => {
      if (f[feat.key]) params.set(feat.key, 'true')
    })

    setLoading(true)
    setError('')
    fetch(`${API_BASE}/api/properties/search?${params.toString()}`)
      .then(r => r.json())
      .then(data => {
        setProperties(data.properties || [])
        setTotal(data.total || 0)
      })
      .catch(() => setError('Failed to load properties. Please try again.'))
      .finally(() => setLoading(false))
  }, [filters])

  const activeFilterCount = [
    filters.purpose,
    filters.category,
    filters.location,
    filters.minPrice,
    filters.maxPrice,
    filters.bedrooms,
    ...FEATURES.map(f => filters[f.key])
  ].filter(Boolean).length

  return (
    <div className='props-page'>
      {/* ── Top Search Bar ─────────────────────────────────────── */}
      <div className='props-searchbar'>
        <div className='props-searchbar__inner'>
          <div className='props-searchbar__field props-searchbar__field--grow'>
            <Search size={16} />
            <input
              type='text'
              placeholder='Search by title or description…'
              value={filters.search}
              onChange={e =>
                handleFilterChange({
                  ...filters,
                  search: e.target.value,
                  page: 1
                })
              }
            />
            {filters.search && (
              <button
                onClick={() =>
                  handleFilterChange({ ...filters, search: '', page: 1 })
                }
              >
                <X size={14} />
              </button>
            )}
          </div>
          <div className='props-searchbar__field'>
            <MapPin size={16} />
            <input
              type='text'
              placeholder='Location, city…'
              value={filters.location}
              onChange={e =>
                handleFilterChange({
                  ...filters,
                  location: e.target.value,
                  page: 1
                })
              }
            />
          </div>
          <div className='props-searchbar__field props-searchbar__field--select'>
            <select
              value={filters.purpose}
              onChange={e =>
                handleFilterChange({
                  ...filters,
                  purpose: e.target.value,
                  page: 1
                })
              }
            >
              {PURPOSES.map(p => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ── Category strip ─────────────────────────────────────── */}
      <div className='props-cats'>
        {CATEGORIES.map(c => (
          <button
            key={c.value}
            className={`props-cat ${
              filters.category === c.value || (!c.value && !filters.category)
                ? 'props-cat--active'
                : ''
            }`}
            onClick={() =>
              handleFilterChange({ ...filters, category: c.value, page: 1 })
            }
          >
            {c.icon}
            {c.label}
          </button>
        ))}
      </div>

      <div className='props-body'>
        {/* ── Desktop Filter Sidebar ──────────────────────────── */}
        <FilterPanel
          filters={filters}
          onChange={handleFilterChange}
          onClear={handleClear}
        />

        {/* ── Results Area ────────────────────────────────────── */}
        <main className='props-results'>
          {/* Toolbar */}
          <div className='props-toolbar'>
            <div className='props-toolbar__left'>
              <button
                className={`props-filter-btn ${
                  activeFilterCount ? 'props-filter-btn--active' : ''
                }`}
                onClick={() => setShowMobileFilter(true)}
              >
                <SlidersHorizontal size={15} />
                Filters
                {activeFilterCount > 0 && (
                  <span className='props-filter-badge'>
                    {activeFilterCount}
                  </span>
                )}
              </button>
              <span className='props-count'>
                {loading
                  ? 'Loading…'
                  : `${total.toLocaleString()} propert${
                      total !== 1 ? 'ies' : 'y'
                    }`}
              </span>
            </div>
            <div className='props-toolbar__right'>
              <div className='props-sort'>
                <ArrowUpDown size={14} />
                <select
                  value={filters.sort}
                  onChange={e =>
                    handleFilterChange({
                      ...filters,
                      sort: e.target.value,
                      page: 1
                    })
                  }
                >
                  {SORT_OPTIONS.map(s => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className='props-view-toggle'>
                <button
                  className={view === 'grid' ? 'active' : ''}
                  onClick={() => setView('grid')}
                  title='Grid'
                >
                  <Grid3X3 size={16} />
                </button>
                <button
                  className={view === 'list' ? 'active' : ''}
                  onClick={() => setView('list')}
                  title='List'
                >
                  <List size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Active filter chips */}
          {activeFilterCount > 0 && (
            <div className='props-chips'>
              {filters.purpose && (
                <span className='chip'>
                  Purpose: {filters.purpose}
                  <button
                    onClick={() =>
                      handleFilterChange({ ...filters, purpose: '', page: 1 })
                    }
                  >
                    <X size={10} />
                  </button>
                </span>
              )}
              {filters.category && (
                <span className='chip'>
                  Type: {filters.category}
                  <button
                    onClick={() =>
                      handleFilterChange({ ...filters, category: '', page: 1 })
                    }
                  >
                    <X size={10} />
                  </button>
                </span>
              )}
              {filters.location && (
                <span className='chip'>
                  📍 {filters.location}
                  <button
                    onClick={() =>
                      handleFilterChange({ ...filters, location: '', page: 1 })
                    }
                  >
                    <X size={10} />
                  </button>
                </span>
              )}
              {filters.bedrooms && (
                <span className='chip'>
                  {filters.bedrooms}+ beds
                  <button
                    onClick={() =>
                      handleFilterChange({ ...filters, bedrooms: '', page: 1 })
                    }
                  >
                    <X size={10} />
                  </button>
                </span>
              )}
              {filters.minPrice && (
                <span className='chip'>
                  Min ₦{Number(filters.minPrice).toLocaleString()}
                  <button
                    onClick={() =>
                      handleFilterChange({ ...filters, minPrice: '', page: 1 })
                    }
                  >
                    <X size={10} />
                  </button>
                </span>
              )}
              {filters.maxPrice && (
                <span className='chip'>
                  Max ₦{Number(filters.maxPrice).toLocaleString()}
                  <button
                    onClick={() =>
                      handleFilterChange({ ...filters, maxPrice: '', page: 1 })
                    }
                  >
                    <X size={10} />
                  </button>
                </span>
              )}
              {FEATURES.filter(f => filters[f.key]).map(f => (
                <span key={f.key} className='chip'>
                  {f.label}
                  <button
                    onClick={() =>
                      handleFilterChange({ ...filters, [f.key]: '', page: 1 })
                    }
                  >
                    <X size={10} />
                  </button>
                </span>
              ))}
              <button className='chip chip--clear' onClick={handleClear}>
                Clear all
              </button>
            </div>
          )}

          {/* Grid / List */}
          {error ? (
            <div className='props-state props-state--error'>{error}</div>
          ) : loading ? (
            <div className={`props-grid props-grid--${view}`}>
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className='prop-skeleton' />
              ))}
            </div>
          ) : properties.length === 0 ? (
            <div className='props-state'>
              <Home size={40} />
              <p>No properties match your filters.</p>
              <button onClick={handleClear}>Clear filters</button>
            </div>
          ) : (
            <div className={`props-grid props-grid--${view}`}>
              {properties.map(p => (
                <PropertyCard key={p._id} property={p} view={view} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div className='props-pagination'>
              <button
                disabled={filters.page <= 1}
                onClick={() =>
                  handleFilterChange({ ...filters, page: filters.page - 1 })
                }
              >
                <ChevronLeft size={16} /> Prev
              </button>
              <span>
                Page {filters.page} of {totalPages}
              </span>
              <button
                disabled={filters.page >= totalPages}
                onClick={() =>
                  handleFilterChange({ ...filters, page: filters.page + 1 })
                }
              >
                Next <ChevronRight size={16} />
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Mobile filter overlay */}
      {showMobileFilter && (
        <div
          className='filter-overlay'
          onClick={() => setShowMobileFilter(false)}
        >
          <div onClick={e => e.stopPropagation()}>
            <FilterPanel
              filters={filters}
              onChange={f => {
                handleFilterChange(f)
                setShowMobileFilter(false)
              }}
              onClear={() => {
                handleClear()
                setShowMobileFilter(false)
              }}
              onClose={() => setShowMobileFilter(false)}
              mobile
            />
          </div>
        </div>
      )}
    </div>
  )
}
