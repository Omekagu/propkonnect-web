'use client'

import React, { useState, useEffect } from 'react'
import { properties as propertiesApi } from '@/libs/api'
import './rent.scss'
import { Bath, BedDouble, MapPin, Ruler, Star } from 'lucide-react'
import { useRouter } from 'next/navigation'

const PROPERTY_TYPES = [
  'All',
  'Apartment',
  'House',
  'Shortlet',
  'Hotel',
  'Duplex',
  'Terraced',
  'Bungalow',
  'Villa',
  'Mansion',
  'Land',
  'Commercial'
]

export default function BuyPropertyList () {
  const [properties, setProperties] = useState([])
  const [filtered, setFiltered] = useState([])
  const [search, setSearch] = useState('')
  const [type, setType] = useState('All')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [bedrooms, setBedrooms] = useState('Any')
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const res = await propertiesApi.getAll()
        setProperties(Array.isArray(res.data?.properties) ? res.data.properties : Array.isArray(res.data) ? res.data : [])
      } catch (error) {
        setProperties([])
        console.log('Error fetching properties:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchProperties()
  }, [])

  // Sale properties only
  const filterForSale = props =>
    props.filter(prop => (prop.purpose || '').toLowerCase() === 'for rent')

  useEffect(() => {
    let data = filterForSale(properties)

    if (search) {
      data = data.filter(
        prop =>
          (prop.title?.toLowerCase() || '').includes(search.toLowerCase()) ||
          (prop.address?.toLowerCase() || '').includes(search.toLowerCase())
      )
    }

    if (type !== 'All') {
      data = data.filter(
        prop =>
          (prop.category || prop.propertyType || '').toLowerCase() ===
          type.toLowerCase()
      )
    }

    if (bedrooms !== 'Any') {
      data = data.filter(prop => Number(prop.beds) === parseInt(bedrooms))
    }

    if (minPrice)
      data = data.filter(prop => Number(prop.price) >= Number(minPrice))
    if (maxPrice)
      data = data.filter(prop => Number(prop.price) <= Number(maxPrice))

    setFiltered(data || [])
  }, [search, type, bedrooms, minPrice, maxPrice, properties])

  // Decide visible features for preview based on type/category
  function renderFeatures (prop) {
    const propertyType = (
      prop.category ||
      prop.propertyType ||
      ''
    ).toLowerCase()
    if (propertyType === 'land') {
      // Land: Show just area
      return (
        <span>
          <Ruler size={15} />{' '}
          {prop.area || prop.selectedPlotLabel || prop.selectedPlotPrice || '—'}
        </span>
      )
    }
    if (propertyType === 'commercial') {
      // Commercial: Show area only (adapt if you want)
      return (
        <span>
          <Ruler size={15} /> {prop.area || `${prop.sqft || '—'} sqft`}
        </span>
      )
    }
    // Default (apartment, house, mansion, ...)
    return (
      <>
        <span>
          <BedDouble size={15} /> {prop.beds || '—'} Beds
        </span>
        <span>
          <Bath size={15} /> {prop.baths || '—'} Baths
        </span>
        <span>
          <Ruler size={15} />{' '}
          {prop.sqft ? `${prop.sqft} sqft` : prop.area || '—'}
        </span>
      </>
    )
  }

  return (
    <section className='modern-buy-page'>
      <div className='hero-section'>
        <div className='overlay'>
          <h1>Discover Your Perfect Home</h1>
          <p>Browse thousands of premium properties across the world.</p>
        </div>
      </div>

      <div className='filters'>
        <input
          type='text'
          placeholder='Search location or title...'
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select value={type} onChange={e => setType(e.target.value)}>
          {PROPERTY_TYPES.map(t => (
            <option key={t}>{t}</option>
          ))}
        </select>
        <select value={bedrooms} onChange={e => setBedrooms(e.target.value)}>
          <option value='Any'>Any Beds</option>
          {[1, 2, 3, 4, 5].map(b => (
            <option key={b} value={b}>
              {b} bed{b > 1 ? 's' : ''}
            </option>
          ))}
        </select>
        <input
          type='number'
          placeholder='Min Price (₦)'
          value={minPrice}
          onChange={e => setMinPrice(e.target.value)}
        />
        <input
          type='number'
          placeholder='Max Price (₦)'
          value={maxPrice}
          onChange={e => setMaxPrice(e.target.value)}
        />
      </div>

      {loading ? (
        <div className='loading'>Fetching beautiful homes...</div>
      ) : filtered.length ? (
        <div className='property-grid'>
          {filtered.map(prop => (
            <div className='property-card' key={prop._id}>
              <div className='image-container'>
                {prop.media && prop.media.length > 0 ? (
                  prop.media[0].type === 'video' ? (
                    <video
                      src={prop.media[0].url}
                      controls
                      autoPlay={false}
                      loop
                      muted
                      playsInline
                      className='media'
                    />
                  ) : (
                    <img
                      src={prop.media[0].url}
                      alt={prop.title || 'media-preview'}
                      className='media'
                    />
                  )
                ) : (
                  <img
                    src='https://via.placeholder.com/800x500?text=No+Media'
                    alt='No media available'
                    className='media'
                  />
                )}

                <div
                  className={`status-badge ${
                    prop.saleInfo?.marketAvail || 'available'
                  }`}
                >
                  {prop.saleInfo?.marketAvail?.toUpperCase() || 'AVAILABLE'}
                </div>
              </div>

              <div className='details'>
                <h2>{prop.title}</h2>
                <p className='location'>
                  <MapPin size={14} /> {prop.address || (typeof prop.location === 'string' ? prop.location : [prop.location?.address, prop.location?.city, prop.location?.state].filter(Boolean).join(', ')) || prop.city || ''}
                </p>
                <div className='features'>{renderFeatures(prop)}</div>

                <div className='price'>
                  ₦{prop.price ? Number(prop.price).toLocaleString() : '—'}
                  <span className='tag'>{prop.status || ''}</span>
                </div>
                <div className='rating'>
                  {/* <Star size={15} fill='#FFD700' stroke='none' />
                  {prop.rating?.toFixed(1) || '4.0'} */}
                </div>
                <button
                  className='view-btn'
                  onClick={() => router.push(`/property/${prop.uid || prop._id}`)}
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className='no-results'>
          No properties found with current filters.
        </div>
      )}
    </section>
  )
}
