'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { properties as propertiesApi } from '@/libs/api'
import { useRouter } from 'next/navigation'
import {
  Search, SlidersHorizontal, X, MapPin, BedDouble, Bath,
  Ruler, ChevronLeft, ChevronRight, Building2, Home, Hotel,
  Landmark, Store, Tag, Heart, Star, Loader2, AlertCircle
} from 'lucide-react'

const PAGE_SIZE = 12

const CATEGORIES = ['All', 'Apartment', 'House', 'Shortlet', 'Hotel', 'Land', 'Commercial']
const PURPOSES   = ['All', 'For Rent', 'For Sale', 'Both']
const SORT_OPTS  = [
  { value: 'newest',     label: 'Newest first' },
  { value: 'price_asc',  label: 'Price: Low → High' },
  { value: 'price_desc', label: 'Price: High → Low' },
  { value: 'popular',    label: 'Most popular' },
]
const BED_OPTS   = ['Any', '1', '2', '3', '4', '5+']

const CAT_ICONS = {
  Apartment: Building2, House: Home, Shortlet: Hotel,
  Hotel: Hotel, Land: Landmark, Commercial: Store
}

const fmt = (n, cur = 'NGN') => {
  if (!n && n !== 0) return '—'
  const sym = cur === 'USD' ? '$' : cur === 'GBP' ? '£' : '₦'
  const num = Number(n)
  if (num >= 1_000_000) return `${sym}${(num / 1_000_000).toFixed(1)}M`
  if (num >= 1_000)     return `${sym}${(num / 1_000).toFixed(0)}K`
  return `${sym}${num.toLocaleString()}`
}

const purposeColor = p => {
  if (!p) return ['#6b7280', '#f3f4f6']
  if (p.toLowerCase().includes('rent')) return ['#0F6040', '#e8f5e9']
  if (p.toLowerCase().includes('sale')) return ['#1d4ed8', '#dbeafe']
  return ['#7c3aed', '#ede9fe']
}

const INIT_FILTERS = {
  search: '', purpose: 'All', category: 'All',
  minPrice: '', maxPrice: '', beds: 'Any', sort: 'newest', state: ''
}

export default function PropertiesPage () {
  const router = useRouter()
  const [properties, setProperties] = useState([])
  const [total, setTotal]           = useState(0)
  const [page, setPage]             = useState(1)
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState(null)
  const [filters, setFilters]       = useState(INIT_FILTERS)
  const [draft, setDraft]           = useState(INIT_FILTERS) // filter modal draft
  const [modalOpen, setModalOpen]   = useState(false)
  const [favs, setFavs]             = useState({})
  const searchRef = useRef(null)
  const debounceRef = useRef(null)

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const activeFilterCount = Object.entries(filters).filter(([k, v]) =>
    k !== 'sort' && v && v !== 'All' && v !== 'Any' && v !== ''
  ).length

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const fetchProperties = useCallback(async (f = filters, p = page) => {
    setLoading(true)
    setError(null)
    try {
      const params = { limit: PAGE_SIZE, page: p }
      if (f.search)              params.search   = f.search
      if (f.purpose  !== 'All')  params.purpose  = f.purpose
      if (f.category !== 'All')  params.category = f.category
      if (f.minPrice)            params.minPrice = f.minPrice
      if (f.maxPrice)            params.maxPrice = f.maxPrice
      if (f.beds     !== 'Any')  params.beds     = f.beds === '5+' ? 5 : f.beds
      if (f.state)               params.state    = f.state
      if (f.sort === 'price_asc')  { params.sortBy = 'price';     params.sortOrder = 'asc' }
      if (f.sort === 'price_desc') { params.sortBy = 'price';     params.sortOrder = 'desc' }
      if (f.sort === 'popular')    { params.sortBy = 'viewCount'; params.sortOrder = 'desc' }

      const res = await propertiesApi.list(params)
      const data = res.data
      const list  = data.properties || data.data || (Array.isArray(data) ? data : [])
      const count = data.total ?? data.count ?? list.length
      setProperties(list)
      setTotal(count)
    } catch (e) {
      setError('Failed to load properties. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [filters, page])

  useEffect(() => { fetchProperties(filters, page) }, [page])

  // Debounce search bar changes
  const handleSearchChange = val => {
    setFilters(f => ({ ...f, search: val }))
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setPage(1)
      fetchProperties({ ...filters, search: val }, 1)
    }, 450)
  }

  const applyFilters = () => {
    setFilters(draft)
    setPage(1)
    setModalOpen(false)
    fetchProperties(draft, 1)
  }
  const clearFilters = () => {
    setDraft(INIT_FILTERS)
    setFilters(INIT_FILTERS)
    setPage(1)
    fetchProperties(INIT_FILTERS, 1)
    setModalOpen(false)
  }

  const changePage = p => {
    setPage(p)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const toggleFav = (e, id) => {
    e.stopPropagation()
    setFavs(f => ({ ...f, [id]: !f[id] }))
  }

  return (
    <div style={s.page}>

      {/* ── Top search bar ───────────────────────────────────────────────── */}
      <div style={s.topBar}>
        <div style={s.topInner}>
          <div style={s.searchWrap}>
            <Search size={16} color='#9ca3af' style={{ flexShrink: 0 }} />
            <input
              ref={searchRef}
              style={s.searchInput}
              placeholder='Search by title, location, city…'
              value={filters.search}
              onChange={e => handleSearchChange(e.target.value)}
            />
            {filters.search && (
              <button style={s.clearBtn} onClick={() => handleSearchChange('')}>
                <X size={14} />
              </button>
            )}
          </div>

          {/* Sort */}
          <select
            style={s.sortSelect}
            value={filters.sort}
            onChange={e => {
              const sort = e.target.value
              const nf = { ...filters, sort }
              setFilters(nf)
              setPage(1)
              fetchProperties(nf, 1)
            }}
          >
            {SORT_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>

          {/* Filter button */}
          <button style={s.filterBtn} onClick={() => { setDraft(filters); setModalOpen(true) }}>
            <SlidersHorizontal size={15} />
            Filters
            {activeFilterCount > 0 && <span style={s.filterBadge}>{activeFilterCount}</span>}
          </button>
        </div>

        {/* Quick purpose tabs */}
        <div style={s.purposeTabs}>
          {PURPOSES.map(p => (
            <button
              key={p}
              style={s.purposeTab(filters.purpose === p)}
              onClick={() => {
                const nf = { ...filters, purpose: p }
                setFilters(nf)
                setPage(1)
                fetchProperties(nf, 1)
              }}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* ── Results header ───────────────────────────────────────────────── */}
      <div style={s.resultsBar}>
        <div style={s.resultsCount}>
          {loading ? 'Loading…' : `${total.toLocaleString()} propert${total !== 1 ? 'ies' : 'y'} found`}
        </div>
        {activeFilterCount > 0 && (
          <button style={s.clearAllBtn} onClick={clearFilters}>
            <X size={12} /> Clear filters
          </button>
        )}
      </div>

      {/* ── Grid ─────────────────────────────────────────────────────────── */}
      {loading ? (
        <div style={s.center}>
          <Loader2 size={36} style={{ color: '#0B3D28', animation: 'spin 1s linear infinite' }} />
          <p style={{ color: '#6b7280', marginTop: 12 }}>Loading properties…</p>
        </div>
      ) : error ? (
        <div style={s.center}>
          <AlertCircle size={36} color='#dc2626' />
          <p style={{ color: '#dc2626', marginTop: 8 }}>{error}</p>
          <button style={s.retryBtn} onClick={() => fetchProperties(filters, page)}>Try again</button>
        </div>
      ) : properties.length === 0 ? (
        <div style={s.center}>
          <Building2 size={48} color='#d1d5db' />
          <p style={{ color: '#9ca3af', marginTop: 12, fontSize: 15 }}>No properties match your filters.</p>
          <button style={s.retryBtn} onClick={clearFilters}>Clear filters</button>
        </div>
      ) : (
        <div style={s.grid}>
          {properties.map(prop => <PropertyCard key={prop._id} prop={prop} fav={favs[prop._id]} onFav={toggleFav} onClick={() => router.push(`/property/${prop.uid || prop._id}`)} />)}
        </div>
      )}

      {/* ── Pagination ───────────────────────────────────────────────────── */}
      {!loading && totalPages > 1 && (
        <div style={s.pager}>
          <button style={s.pageBtn(false)} onClick={() => changePage(Math.max(1, page - 1))} disabled={page === 1}>
            <ChevronLeft size={16} />
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter(n => n === 1 || n === totalPages || Math.abs(n - page) <= 2)
            .reduce((acc, n, i, arr) => {
              if (i > 0 && n - arr[i - 1] > 1) acc.push('…')
              acc.push(n)
              return acc
            }, [])
            .map((n, i) =>
              n === '…'
                ? <span key={`e${i}`} style={s.pageEllipsis}>…</span>
                : <button key={n} style={s.pageNum(n === page)} onClick={() => changePage(n)}>{n}</button>
            )}

          <button style={s.pageBtn(false)} onClick={() => changePage(Math.min(totalPages, page + 1))} disabled={page === totalPages}>
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* ── Filter Modal ─────────────────────────────────────────────────── */}
      {modalOpen && (
        <div style={s.overlay} onClick={() => setModalOpen(false)}>
          <div style={s.modal} onClick={e => e.stopPropagation()}>
            <div style={s.modalHead}>
              <span style={s.modalTitle}>Filters</span>
              <button style={s.iconBtn} onClick={() => setModalOpen(false)}><X size={18} /></button>
            </div>

            <div style={s.modalBody}>
              {/* Purpose */}
              <FilterGroup label='Purpose'>
                <div style={s.chipRow}>
                  {PURPOSES.map(p => (
                    <button key={p} style={s.chip(draft.purpose === p)} onClick={() => setDraft(d => ({ ...d, purpose: p }))}>{p}</button>
                  ))}
                </div>
              </FilterGroup>

              {/* Category */}
              <FilterGroup label='Category'>
                <div style={s.chipRow}>
                  {CATEGORIES.map(c => {
                    const Icon = CAT_ICONS[c]
                    return (
                      <button key={c} style={s.chip(draft.category === c)} onClick={() => setDraft(d => ({ ...d, category: c }))}>
                        {Icon && <Icon size={13} style={{ marginRight: 4 }} />}{c}
                      </button>
                    )
                  })}
                </div>
              </FilterGroup>

              {/* Price range */}
              <FilterGroup label='Price range'>
                <div style={{ display: 'flex', gap: 10 }}>
                  <input
                    style={s.input}
                    type='number'
                    placeholder='Min price (₦)'
                    value={draft.minPrice}
                    onChange={e => setDraft(d => ({ ...d, minPrice: e.target.value }))}
                  />
                  <input
                    style={s.input}
                    type='number'
                    placeholder='Max price (₦)'
                    value={draft.maxPrice}
                    onChange={e => setDraft(d => ({ ...d, maxPrice: e.target.value }))}
                  />
                </div>
              </FilterGroup>

              {/* Bedrooms */}
              <FilterGroup label='Bedrooms'>
                <div style={s.chipRow}>
                  {BED_OPTS.map(b => (
                    <button key={b} style={s.chip(draft.beds === b)} onClick={() => setDraft(d => ({ ...d, beds: b }))}>{b === 'Any' ? 'Any' : `${b} bed${b !== '1' ? 's' : ''}`}</button>
                  ))}
                </div>
              </FilterGroup>

              {/* State / Location */}
              <FilterGroup label='State / Location'>
                <input
                  style={s.input}
                  placeholder='e.g. Lagos, Abuja…'
                  value={draft.state}
                  onChange={e => setDraft(d => ({ ...d, state: e.target.value }))}
                />
              </FilterGroup>
            </div>

            <div style={s.modalFoot}>
              <button style={s.ghostBtn} onClick={() => setDraft(INIT_FILTERS)}>Reset all</button>
              <button style={s.applyBtn} onClick={applyFilters}>Show results</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 640px) {
          .prop-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}

// ── Property Card ─────────────────────────────────────────────────────────────
function PropertyCard ({ prop, fav, onFav, onClick }) {
  const img = prop.media?.find(m => m.type === 'image')?.url || prop.images?.[0]
  const price = prop.price || prop.rentPrice
  const [pc, pb] = purposeColor(prop.purpose)
  const cat = (prop.category || '').toLowerCase()
  const isLand = cat === 'land' || cat === 'plot'
  const isComm = cat === 'commercial'

  return (
    <div style={s.card} onClick={onClick}>
      <div style={s.cardImgWrap}>
        {img
          ? <img src={img} alt={prop.title} style={s.cardImg} loading='lazy' />
          : <div style={s.cardImgPlaceholder}><Building2 size={32} color='#d1d5db' /></div>
        }
        <button style={s.favBtn(fav)} onClick={e => onFav(e, prop._id)}>
          <Heart size={15} fill={fav ? '#ef4444' : 'none'} color={fav ? '#ef4444' : '#fff'} />
        </button>
        {prop.purpose && (
          <span style={{ ...s.purposePill, color: pc, background: pb }}>{prop.purpose}</span>
        )}
        {prop.listingTier && prop.listingTier !== 'Standard' && (
          <span style={s.tierPill}><Star size={10} fill='#f59e0b' color='#f59e0b' /> {prop.listingTier}</span>
        )}
      </div>

      <div style={s.cardBody}>
        <div style={s.cardPrice}>
          {fmt(price, prop.currency)}
          {prop.rentFrequency && <span style={s.freq}>/{prop.rentFrequency}</span>}
        </div>
        <div style={s.cardTitle}>{prop.title || 'Untitled Property'}</div>
        <div style={s.cardLocation}>
          <MapPin size={12} style={{ flexShrink: 0 }} />
          {[prop.city, prop.state].filter(Boolean).join(', ') || prop.location || '—'}
        </div>
        <div style={s.cardFeats}>
          {isLand ? (
            <span style={s.feat}><Ruler size={12} /> {prop.area || prop.selectedPlotLabel || '—'}</span>
          ) : isComm ? (
            <span style={s.feat}><Ruler size={12} /> {prop.area || (prop.sqft ? `${prop.sqft} sqft` : '—')}</span>
          ) : (
            <>
              {(prop.beds || prop.bedrooms) && <span style={s.feat}><BedDouble size={12} /> {prop.beds || prop.bedrooms} bed</span>}
              {(prop.baths || prop.bathrooms) && <span style={s.feat}><Bath size={12} /> {prop.baths || prop.bathrooms} bath</span>}
              {prop.sqft && <span style={s.feat}><Ruler size={12} /> {prop.sqft}sqft</span>}
            </>
          )}
          <span style={{ ...s.feat, marginLeft: 'auto', color: '#6b7280' }}>
            <Tag size={11} /> {prop.category || '—'}
          </span>
        </div>
      </div>
    </div>
  )
}

function FilterGroup ({ label, children }) {
  return (
    <div style={{ marginBottom: '1.25rem' }}>
      <div style={{ fontWeight: 700, fontSize: 13, color: '#111', marginBottom: 8 }}>{label}</div>
      {children}
    </div>
  )
}

// ── Styles ────────────────────────────────────────────────────────────────────
const s = {
  page: { minHeight: '100vh', background: '#f8fafc', paddingBottom: 60 },

  topBar: {
    position: 'sticky', top: 0, zIndex: 40,
    background: '#fff', borderBottom: '1px solid #e5e7eb',
    padding: '12px 24px 0'
  },
  topInner: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 },

  searchWrap: {
    flex: 1, display: 'flex', alignItems: 'center', gap: 8,
    background: '#f9fafb', border: '1.5px solid #e5e7eb',
    borderRadius: 10, padding: '9px 14px',
    transition: 'border-color .15s'
  },
  searchInput: {
    flex: 1, border: 'none', background: 'transparent',
    outline: 'none', fontSize: 14, color: '#111'
  },
  clearBtn: {
    background: 'none', border: 'none', cursor: 'pointer',
    color: '#9ca3af', padding: 0, display: 'flex', alignItems: 'center'
  },

  sortSelect: {
    padding: '9px 12px', border: '1.5px solid #e5e7eb', borderRadius: 10,
    background: '#f9fafb', fontSize: 13, color: '#374151', cursor: 'pointer', outline: 'none'
  },

  filterBtn: {
    display: 'flex', alignItems: 'center', gap: 6,
    padding: '9px 16px', border: '1.5px solid #e5e7eb', borderRadius: 10,
    background: '#f9fafb', fontSize: 13, fontWeight: 600, color: '#374151',
    cursor: 'pointer', position: 'relative', whiteSpace: 'nowrap'
  },
  filterBadge: {
    position: 'absolute', top: -6, right: -6,
    background: '#0B3D28', color: '#C4E53C', borderRadius: '50%',
    width: 18, height: 18, fontSize: 11, fontWeight: 700,
    display: 'flex', alignItems: 'center', justifyContent: 'center'
  },

  purposeTabs: {
    display: 'flex', gap: 4, overflowX: 'auto', paddingBottom: 1,
    scrollbarWidth: 'none'
  },
  purposeTab: active => ({
    padding: '7px 16px', border: 'none', borderBottom: active ? '2px solid #0B3D28' : '2px solid transparent',
    background: 'none', fontWeight: active ? 700 : 500,
    color: active ? '#0B3D28' : '#6b7280', cursor: 'pointer', fontSize: 13,
    whiteSpace: 'nowrap', transition: 'color .15s'
  }),

  resultsBar: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '14px 24px 8px'
  },
  resultsCount: { fontSize: 14, color: '#6b7280', fontWeight: 500 },
  clearAllBtn: {
    display: 'flex', alignItems: 'center', gap: 4,
    background: 'none', border: '1px solid #e5e7eb', borderRadius: 6,
    padding: '5px 12px', fontSize: 12, color: '#374151', cursor: 'pointer'
  },

  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
    gap: '1.25rem',
    padding: '0 24px'
  },
  center: {
    minHeight: 320, display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center', padding: 40
  },
  retryBtn: {
    marginTop: 14, padding: '8px 20px', background: '#0B3D28', color: '#C4E53C',
    border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer', fontSize: 13
  },

  // ── Card ──
  card: {
    background: '#fff', borderRadius: 14, overflow: 'hidden',
    boxShadow: '0 2px 12px rgba(0,0,0,.07)', cursor: 'pointer',
    transition: 'box-shadow .2s, transform .2s',
    ':hover': { boxShadow: '0 6px 24px rgba(0,0,0,.12)', transform: 'translateY(-2px)' }
  },
  cardImgWrap: { position: 'relative', height: 200, overflow: 'hidden', background: '#f3f4f6' },
  cardImg: { width: '100%', height: '100%', objectFit: 'cover', display: 'block' },
  cardImgPlaceholder: {
    width: '100%', height: '100%',
    display: 'flex', alignItems: 'center', justifyContent: 'center'
  },
  favBtn: fav => ({
    position: 'absolute', top: 10, right: 10,
    background: fav ? '#fff' : 'rgba(0,0,0,.35)',
    border: 'none', borderRadius: '50%', width: 32, height: 32,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', backdropFilter: 'blur(4px)', transition: 'background .2s'
  }),
  purposePill: {
    position: 'absolute', bottom: 10, left: 10,
    padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700
  },
  tierPill: {
    position: 'absolute', top: 10, left: 10,
    background: 'rgba(0,0,0,.55)', color: '#f59e0b',
    padding: '3px 8px', borderRadius: 20, fontSize: 11, fontWeight: 600,
    display: 'flex', alignItems: 'center', gap: 4, backdropFilter: 'blur(4px)'
  },

  cardBody: { padding: '14px 16px' },
  cardPrice: { fontWeight: 800, fontSize: 18, color: '#0B3D28', marginBottom: 4 },
  freq: { fontSize: 12, fontWeight: 400, color: '#6b7280', marginLeft: 2 },
  cardTitle: {
    fontSize: 14, fontWeight: 600, color: '#111',
    marginBottom: 5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
  },
  cardLocation: {
    display: 'flex', alignItems: 'center', gap: 4,
    fontSize: 12, color: '#6b7280', marginBottom: 10
  },
  cardFeats: {
    display: 'flex', alignItems: 'center', gap: 10,
    flexWrap: 'wrap', borderTop: '1px solid #f3f4f6', paddingTop: 8
  },
  feat: {
    display: 'flex', alignItems: 'center', gap: 4,
    fontSize: 12, color: '#374151', fontWeight: 500
  },

  // ── Pagination ──
  pager: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    gap: 6, padding: '28px 24px 0'
  },
  pageBtn: _ => ({
    width: 36, height: 36, border: '1.5px solid #e5e7eb', borderRadius: 8,
    background: '#fff', cursor: 'pointer', display: 'flex',
    alignItems: 'center', justifyContent: 'center', color: '#374151'
  }),
  pageNum: active => ({
    width: 36, height: 36, border: active ? 'none' : '1.5px solid #e5e7eb',
    borderRadius: 8, background: active ? '#0B3D28' : '#fff',
    color: active ? '#C4E53C' : '#374151',
    fontWeight: active ? 700 : 500, fontSize: 14, cursor: 'pointer'
  }),
  pageEllipsis: { color: '#9ca3af', lineHeight: '36px', padding: '0 4px' },

  // ── Modal ──
  overlay: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)',
    zIndex: 50, display: 'flex', alignItems: 'flex-end',
    justifyContent: 'center'
  },
  modal: {
    background: '#fff', borderRadius: '20px 20px 0 0',
    width: '100%', maxWidth: 540,
    maxHeight: '85vh', display: 'flex', flexDirection: 'column',
    animation: 'slideUp .25s ease'
  },
  modalHead: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '18px 24px', borderBottom: '1px solid #f3f4f6'
  },
  modalTitle: { fontWeight: 700, fontSize: 16, color: '#111' },
  iconBtn: {
    background: '#f3f4f6', border: 'none', borderRadius: '50%',
    width: 32, height: 32, display: 'flex', alignItems: 'center',
    justifyContent: 'center', cursor: 'pointer', color: '#374151'
  },
  modalBody: { flex: 1, overflowY: 'auto', padding: '20px 24px' },
  modalFoot: {
    padding: '14px 24px', borderTop: '1px solid #f3f4f6',
    display: 'flex', gap: 10
  },
  ghostBtn: {
    flex: 1, padding: '11px 0', border: '1.5px solid #e5e7eb',
    borderRadius: 10, background: '#fff', fontWeight: 600,
    fontSize: 14, cursor: 'pointer', color: '#374151'
  },
  applyBtn: {
    flex: 2, padding: '11px 0', border: 'none',
    borderRadius: 10, background: '#0B3D28', color: '#C4E53C',
    fontWeight: 700, fontSize: 14, cursor: 'pointer'
  },

  // ── Filter inputs ──
  chipRow: { display: 'flex', flexWrap: 'wrap', gap: 8 },
  chip: active => ({
    padding: '7px 14px', borderRadius: 20, fontSize: 13, fontWeight: 600,
    border: active ? '2px solid #0B3D28' : '1.5px solid #e5e7eb',
    background: active ? '#e8f5e9' : '#fff',
    color: active ? '#0B3D28' : '#374151', cursor: 'pointer',
    display: 'flex', alignItems: 'center', transition: 'all .15s'
  }),
  input: {
    flex: 1, padding: '10px 14px', border: '1.5px solid #e5e7eb',
    borderRadius: 10, fontSize: 14, color: '#111', outline: 'none',
    background: '#f9fafb'
  }
}
