'use client'

import { useState, useEffect, useCallback } from 'react'
import { leases as leasesApi } from '@/libs/api'
import { api } from '@/libs/api-client'
import Link from 'next/link'
import { encodeId } from '@/libs/propId'
import { Home, MapPin, Phone, Mail, FileText } from 'lucide-react'
import './Home.scss'

const D = {
  bg:      '#0d1117',
  surface: '#161b22',
  border:  'rgba(255,255,255,0.06)',
  text:    '#e6edf3',
  muted:   '#7d8590',
  accent:  '#C4E53C',
}

const s = {
  page:    { padding: '24px 28px', background: D.bg, minHeight: '100%', color: D.text },
  h2:      { fontSize: '1.25rem', fontWeight: 800, color: D.text, margin: '0 0 20px', letterSpacing: '-0.3px' },
  section: { background: D.surface, borderRadius: 14, padding: '18px', border: `1px solid ${D.border}`, marginBottom: 12 },
  sTitle:  { fontSize: 13, fontWeight: 700, color: D.muted, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8, textTransform: 'uppercase', letterSpacing: '0.06em' },
  row:     { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderBottom: `1px solid rgba(255,255,255,0.04)`, fontSize: 13 },
  label:   { color: D.muted, fontWeight: 500 },
  val:     { color: D.text, textAlign: 'right', maxWidth: '55%', fontWeight: 600 },
  imgWrap: { width: '100%', height: 220, background: 'rgba(196,229,60,0.04)', borderRadius: 10, overflow: 'hidden', marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${D.border}` },
  img:     { width: '100%', height: '100%', objectFit: 'cover' },
  propTitle: { fontWeight: 800, fontSize: '1.05rem', color: D.text, marginBottom: 4 },
  propMeta:  { display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: D.muted },
  badge: (color, bg) => ({ display: 'inline-block', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, color, background: bg }),
  contact: { display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: `1px solid rgba(255,255,255,0.04)`, fontSize: 13, color: D.text },
  empty:   { textAlign: 'center', padding: '3rem', color: D.muted },
}

const STATUS_COLORS = {
  active:     ['#4ade80', 'rgba(34,197,94,0.12)'],
  pending:    ['#fbbf24', 'rgba(245,158,11,0.12)'],
  terminated: ['#7d8590', 'rgba(255,255,255,0.06)'],
  signed:     ['#60a5fa', 'rgba(59,130,246,0.12)'],
}

// ── Browse helpers ────────────────────────────────────────────────────────────
const BROWSE_CATS = [
  { value: '',           label: 'All' },
  { value: 'Apartment',  label: 'Apartment' },
  { value: 'House',      label: 'House' },
  { value: 'Shortlet',   label: 'Shortlet' },
  { value: 'Hotel',      label: 'Hotel' },
  { value: 'Land',       label: 'Land' },
  { value: 'Commercial', label: 'Commercial' },
]

function getPropImage (p) {
  const media = p.media || p.images
  if (Array.isArray(media) && media.length) {
    const f = media[0]
    if (typeof f === 'string') return f
    return f?.url || f?.cloudinaryUrl || null
  }
  return p.coverImage || null
}
function getPropPrice (p) {
  const n = v => `₦${Number(v).toLocaleString()}`
  if (p.purpose === 'For Sale' && p.price)    return n(p.price)
  if (p.rentPrice)                            return `${n(p.rentPrice)}/mo`
  if (p.pricePerNight)                        return `${n(p.pricePerNight)}/night`
  if (p.price)                                return n(p.price)
  return 'Price on request'
}
function getPropLoc (p) {
  const parts = [p.location?.city || p.city, p.location?.state || p.state]
  return parts.filter(Boolean).join(', ') || p.location?.address || 'Nigeria'
}

function BrowsePropCard ({ p }) {
  const [err, setErr] = useState(false)
  const img   = getPropImage(p)
  const price = getPropPrice(p)
  const loc   = getPropLoc(p)
  const beds  = p.beds ?? p.bedrooms ?? p.apartment?.bedrooms
  const baths = p.baths ?? p.bathrooms ?? p.apartment?.bathrooms
  const tag   = p.purpose === 'For Sale' ? 'sale'
              : p.category === 'Shortlet' || p.category === 'Hotel' ? 'short'
              : 'rent'
  const tagLabel = p.purpose === 'For Sale' ? 'For Sale'
                 : p.category === 'Shortlet' ? 'Shortlet'
                 : p.category === 'Hotel' ? 'Hotel'
                 : 'For Rent'

  return (
    <Link href={`/property/${encodeId(p._id)}`} className='mh-bprop'>
      <div className='mh-bprop__img'>
        {img && !err
          ? <img src={img} alt={p.title} onError={() => setErr(true)} loading='lazy' />
          : <div className='mh-bprop__img-fb'>
              <svg width='28' height='28' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round'><path d='M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z'/><polyline points='9 22 9 12 15 12 15 22'/></svg>
            </div>
        }
        <span className={`mh-bprop__tag mh-bprop__tag--${tag}`}>{tagLabel}</span>
      </div>
      <div className='mh-bprop__body'>
        <div className='mh-bprop__price'>{price}</div>
        <div className='mh-bprop__title'>{p.title}</div>
        <div className='mh-bprop__loc'>
          <svg width='11' height='11' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><path d='M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z'/><circle cx='12' cy='10' r='3'/></svg>
          {loc}
        </div>
        {(beds != null || baths != null) && (
          <div className='mh-bprop__meta'>
            {beds  != null && <span><svg width='11' height='11' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><path d='M2 4v16'/><path d='M2 8h18a2 2 0 0 1 2 2v10'/><path d='M2 17h20'/><path d='M6 8v9'/></svg>{beds} bed{beds !== 1 ? 's' : ''}</span>}
            {baths != null && <span><svg width='11' height='11' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><path d='M9 6 6.5 3.5a1.5 1.5 0 0 0-1-.5C4.683 3 4 3.683 4 4.5V17a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5'/><line x1='10' y1='5' x2='8' y2='7'/><line x1='2' y1='12' x2='22' y2='12'/></svg>{baths} bath{baths !== 1 ? 's' : ''}</span>}
          </div>
        )}
      </div>
    </Link>
  )
}

function BrowseProperties () {
  const [q,        setQ]        = useState('')
  const [cat,      setCat]      = useState('')
  const [props,    setProps]    = useState([])
  const [loading,  setLoading]  = useState(true)
  const [inputVal, setInputVal] = useState('')

  const fetchProps = useCallback(async (query = '', category = '') => {
    setLoading(true)
    try {
      const params = { limit: 8, status: 'active' }
      if (query)    params.q        = query
      if (category) params.category = category
      const res = await api.get('/api/properties/search', { params })
      const list = res.data?.properties || res.data?.data || res.data || []
      setProps(Array.isArray(list) ? list : [])
    } catch {
      setProps([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchProps(q, cat) }, [q, cat, fetchProps])

  useEffect(() => {
    const t = setTimeout(() => setQ(inputVal.trim()), 400)
    return () => clearTimeout(t)
  }, [inputVal])

  return (
    <div className='mh-browse'>
      <div className='mh-browse__hd'>
        <div className='mh-browse__hd-left'>
          <span className='mh-browse__title'>Browse Properties</span>
          <span className='mh-browse__count'>{loading ? '…' : `${props.length} shown`}</span>
        </div>
        <Link href='/search' className='mh-browse__all'>See all →</Link>
      </div>

      <div className='mh-browse__controls'>
        <div className='mh-browse__search'>
          <svg width='15' height='15' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><circle cx='11' cy='11' r='8'/><line x1='21' y1='21' x2='16.65' y2='16.65'/></svg>
          <input
            type='text'
            placeholder='Search by title, city…'
            value={inputVal}
            onChange={e => setInputVal(e.target.value)}
          />
          {inputVal && (
            <button onClick={() => { setInputVal(''); setQ('') }}>
              <svg width='13' height='13' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.5' strokeLinecap='round' strokeLinejoin='round'><line x1='18' y1='6' x2='6' y2='18'/><line x1='6' y1='6' x2='18' y2='18'/></svg>
            </button>
          )}
        </div>
        <div className='mh-browse__cats'>
          {BROWSE_CATS.map(c => (
            <button
              key={c.value}
              className={`mh-browse__cat${cat === c.value ? ' active' : ''}`}
              onClick={() => setCat(c.value)}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className='mh-browse__grid'>
          {[1,2,3,4,5,6,7,8].map(i => (
            <div key={i} className='mh-bprop-skel'>
              <div className='mh-bprop-skel__img' />
              <div className='mh-bprop-skel__body'>
                <div className='mh-bprop-skel__line' style={{ width: '55%' }} />
                <div className='mh-bprop-skel__line' style={{ width: '80%', height: 14 }} />
                <div className='mh-bprop-skel__line' style={{ width: '65%' }} />
              </div>
            </div>
          ))}
        </div>
      ) : props.length === 0 ? (
        <div className='mh-browse__empty'>
          <svg width='32' height='32' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round'><path d='M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z'/><polyline points='9 22 9 12 15 12 15 22'/></svg>
          <p>No properties found{q ? ` for "${q}"` : ''}.</p>
          <Link href='/search'>Browse all listings →</Link>
        </div>
      ) : (
        <div className='mh-browse__grid'>
          {props.map(p => <BrowsePropCard key={p._id} p={p} />)}
        </div>
      )}

      <div className='mh-browse__footer'>
        <Link href='/search' className='mh-browse__footer-btn'>Browse all properties →</Link>
      </div>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function MyHome () {
  const [lease, setLease] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    leasesApi.getMy()
      .then(res => {
        const leases = res.data?.leases || res.data?.data || (res.data?.lease ? [res.data.lease] : [])
        setLease(leases[0] || null)
      })
      .catch(() => setError('Could not load lease information.'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div style={{ padding: '1.5rem', color: '#7d8590', background: '#0d1117', minHeight: '100%' }}>Loading home details…</div>

  const prop     = lease?.property || {}
  const landlord = lease?.landlord || prop.owner || {}
  const [statusColor, statusBg] = STATUS_COLORS[lease?.status] || STATUS_COLORS.active

  return (
    <div style={s.page}>
      <h2 style={s.h2}>My Home</h2>

      {lease ? (
        <>
          <div style={s.section}>
            {prop.images?.[0] ? (
              <div style={s.imgWrap}><img src={prop.images[0]} alt={prop.title} style={s.img} /></div>
            ) : (
              <div style={s.imgWrap}><Home size={48} opacity={0.2} /></div>
            )}
            <div style={s.propTitle}>{prop.title || 'Your Property'}</div>
            <div style={s.propMeta}>
              <MapPin size={14} />
              {[prop.address, prop.city, prop.state].filter(Boolean).join(', ') || 'Address not available'}
            </div>
            <div style={{ marginTop: 10 }}>
              <span style={s.badge(statusColor, statusBg)}>{lease.status || 'Active'}</span>
              {prop.bedrooms && <span style={{ marginLeft: 8, fontSize: 12, color: D.muted }}>{prop.bedrooms} bed · {prop.bathrooms} bath</span>}
            </div>
          </div>

          <div style={s.section}>
            <div style={s.sTitle}><FileText size={16} /> Lease Details</div>
            {[
              ['Start Date',   lease.startDate ? new Date(lease.startDate).toLocaleDateString() : '—'],
              ['End Date',     lease.endDate   ? new Date(lease.endDate).toLocaleDateString()   : '—'],
              ['Monthly Rent', lease.rentAmount ? `₦${Number(lease.rentAmount).toLocaleString()}` : '—'],
              ['Next Payment', lease.nextPaymentDate ? new Date(lease.nextPaymentDate).toLocaleDateString() : '—'],
              ['Deposit',      lease.depositAmount ? `₦${Number(lease.depositAmount).toLocaleString()}` : '—'],
              ['Status',       lease.status || '—'],
            ].map(([label, val]) => (
              <div key={label} style={s.row}>
                <span style={s.label}>{label}</span>
                <span style={s.val}>{val}</span>
              </div>
            ))}
          </div>

          {(landlord.firstName || landlord.email || landlord.phone) && (
            <div style={s.section}>
              <div style={s.sTitle}><Phone size={16} /> Landlord Contact</div>
              {(landlord.firstName || landlord.lastName) && (
                <div style={s.contact}>
                  <Home size={15} color='#6b7280' />
                  <span>{[landlord.firstName, landlord.lastName].filter(Boolean).join(' ')}</span>
                </div>
              )}
              {landlord.email && (
                <div style={s.contact}>
                  <Mail size={15} color={D.muted} />
                  <a href={`mailto:${landlord.email}`} style={{ color: D.accent, textDecoration: 'none' }}>{landlord.email}</a>
                </div>
              )}
              {landlord.phone && (
                <div style={s.contact}>
                  <Phone size={15} color={D.muted} />
                  <a href={`tel:${landlord.phone}`} style={{ color: D.accent, textDecoration: 'none' }}>{landlord.phone}</a>
                </div>
              )}
            </div>
          )}
        </>
      ) : (
        <div style={s.section}>
          <div style={s.empty}>
            <Home size={40} opacity={0.3} style={{ display: 'block', margin: '0 auto 10px' }} />
            <p style={{ marginBottom: 0 }}>{error || 'No active lease yet. Browse properties below to find your next home.'}</p>
          </div>
        </div>
      )}

      {/* Browse section — always visible */}
      <BrowseProperties />
    </div>
  )
}
