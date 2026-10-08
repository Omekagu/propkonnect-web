'use client'

import React, { useState, useEffect } from 'react'
import { properties as propertiesApi } from '@/libs/api'
import { encodeId } from '@/libs/propId'
import { Bath, BedDouble, MapPin, Ruler, Search, X } from 'lucide-react'
import './buy.scss'

const TYPES = ['All', 'Apartment', 'House', 'Duplex', 'Bungalow', 'Villa', 'Mansion', 'Land', 'Commercial']
const BEDS  = ['Any', '1', '2', '3', '4', '5+']

export default function BuyPage () {
  const [properties, setProperties] = useState([])
  const [loading, setLoading]       = useState(true)
  const [search, setSearch]         = useState('')
  const [type, setType]             = useState('All')
  const [minPrice, setMinPrice]     = useState('')
  const [maxPrice, setMaxPrice]     = useState('')
  const [bedrooms, setBedrooms]     = useState('Any')

  useEffect(() => {
    propertiesApi.getAll()
      .then(res => {
        const raw = res.data?.properties ?? (Array.isArray(res.data) ? res.data : [])
        setProperties(raw.filter(p => (p.purpose || '').toLowerCase().includes('sale')))
      })
      .catch(() => setProperties([]))
      .finally(() => setLoading(false))
  }, [])

  const filtered = properties.filter(p => {
    const title = (p.title || '').toLowerCase()
    const addr  = (p.address || p.city || '').toLowerCase()
    if (search && !title.includes(search.toLowerCase()) && !addr.includes(search.toLowerCase())) return false
    if (type !== 'All' && (p.category || p.propertyType || '').toLowerCase() !== type.toLowerCase()) return false
    if (bedrooms !== 'Any') {
      const n = Number(p.beds)
      if (bedrooms === '5+' ? n < 5 : n !== parseInt(bedrooms)) return false
    }
    if (minPrice && Number(p.price) < Number(minPrice)) return false
    if (maxPrice && Number(p.price) > Number(maxPrice)) return false
    return true
  })

  const clearFilters = () => { setSearch(''); setType('All'); setMinPrice(''); setMaxPrice(''); setBedrooms('Any') }

  return (
    <div className='pn-props'>
      {/* Hero */}
      <section className='pn-props__hero'>
        <div className='pn-props__hero-grid' />
        <div className='pn-props__hero-content'>
          <span className='pn-props__hero-badge'>For Sale</span>
          <h1>Buy Property in Nigeria</h1>
          <p>
            {loading ? 'Loading listings…' : `${properties.length.toLocaleString()} verified homes, land & commercial spaces`}
          </p>
        </div>
      </section>

      {/* Filter bar */}
      <div className='pn-props__bar'>
        <div className='pn-props__bar-inner'>
          <div className='pn-props__search'>
            <Search size={15} />
            <input
              type='text'
              placeholder='Search location or title…'
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === 'Escape' && setSearch('')}
            />
            {search && (
              <button className='pn-props__search-clear' onClick={() => setSearch('')}>
                <X size={13} />
              </button>
            )}
          </div>

          <select value={type} onChange={e => setType(e.target.value)}>
            {TYPES.map(t => <option key={t}>{t}</option>)}
          </select>

          <select value={bedrooms} onChange={e => setBedrooms(e.target.value)}>
            {BEDS.map(b => (
              <option key={b} value={b}>
                {b === 'Any' ? 'Any Beds' : `${b} bed${b === '1' ? '' : 's'}`}
              </option>
            ))}
          </select>

          <input type='number' placeholder='Min ₦' value={minPrice} onChange={e => setMinPrice(e.target.value)} />
          <input type='number' placeholder='Max ₦' value={maxPrice} onChange={e => setMaxPrice(e.target.value)} />
        </div>
      </div>

      {/* Results */}
      <section className='pn-props__main'>
        <p className='pn-props__count'>
          {loading ? 'Fetching properties…' : `${filtered.length.toLocaleString()} propert${filtered.length !== 1 ? 'ies' : 'y'} found`}
        </p>

        {loading ? (
          <div className='pn-props__grid'>
            {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className='pn-prop-card pn-prop-card--skeleton' />)}
          </div>
        ) : filtered.length ? (
          <div className='pn-props__grid'>
            {filtered.map(prop => {
              const img  = prop.media?.[0]?.url || prop.images?.[0]?.url || prop.images?.[0]
                         || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&q=80'
              const addr = prop.address
                         || (typeof prop.location === 'string' ? prop.location
                           : [prop.location?.city, prop.location?.state].filter(Boolean).join(', '))
                         || prop.city || ''
              const id   = encodeId(prop.uid || prop._id)
              return (
                <a key={id} href={`/property/${id}`} className='pn-prop-card'>
                  <div className='pn-prop-card__img'>
                    <img src={img} alt={prop.title} loading='lazy' />
                    {prop.compliance?.verified && (
                      <span className='pn-prop-card__verified'>✓ Verified</span>
                    )}
                  </div>
                  <div className='pn-prop-card__body'>
                    <h3>{prop.title}</h3>
                    {addr && (
                      <p className='pn-prop-card__loc'>
                        <MapPin size={12} /> {addr}
                      </p>
                    )}
                    <div className='pn-prop-card__stats'>
                      {prop.beds  && <span><BedDouble size={12} /> {prop.beds} bed{prop.beds !== '1' ? 's' : ''}</span>}
                      {prop.baths && <span><Bath size={12} /> {prop.baths} bath{prop.baths !== '1' ? 's' : ''}</span>}
                      {(prop.sqft || prop.area) && (
                        <span><Ruler size={12} /> {prop.sqft ? `${prop.sqft} sqft` : prop.area}</span>
                      )}
                    </div>
                    <div className='pn-prop-card__price'>
                      ₦{prop.price ? Number(prop.price).toLocaleString() : '—'}
                    </div>
                  </div>
                </a>
              )
            })}
          </div>
        ) : (
          <div className='pn-props__empty'>
            <p>No properties match your filters.</p>
            <button onClick={clearFilters}>Clear Filters</button>
          </div>
        )}
      </section>
    </div>
  )
}
