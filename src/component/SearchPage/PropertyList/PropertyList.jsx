'use client'
import React, { useEffect, useState, useRef } from 'react'
import './PropertyList.scss'
import { MapPin, DollarSign, ChevronLeft, ChevronRight } from 'lucide-react'

export default function PropertyList () {
  const [displayText, setDisplayText] = useState('')
  const phrases = [
    'Luxury Homes',
    'Modern Villas',
    'Prime Lands',
    'Exclusive Apartments'
  ]
  const [index, setIndex] = useState(0)
  const [charIndex, setCharIndex] = useState(0)
  const [deleting, setDeleting] = useState(false)

  const scrollRef = useRef(null)

  useEffect(() => {
    const currentPhrase = phrases[index]
    const speed = deleting ? 50 : 120

    const timeout = setTimeout(() => {
      if (!deleting && charIndex < currentPhrase.length) {
        setDisplayText(prev => prev + currentPhrase[charIndex])
        setCharIndex(prev => prev + 1)
      } else if (deleting && charIndex > 0) {
        setDisplayText(prev => prev.slice(0, -1))
        setCharIndex(prev => prev - 1)
      } else if (!deleting && charIndex === currentPhrase.length) {
        setTimeout(() => setDeleting(true), 1200)
      } else if (deleting && charIndex === 0) {
        setDeleting(false)
        setIndex(prev => (prev + 1) % phrases.length)
      }
    }, speed)

    return () => clearTimeout(timeout)
  }, [charIndex, deleting, index])

  const properties = [
    {
      id: 1,
      image:
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1200',
      title: 'Smart Eco Villa',
      price: '$1,250,000',
      type: 'For Sale',
      location: 'Lekki Phase 1, Lagos'
    },
    {
      id: 2,
      image:
        'https://images.unsplash.com/photo-1568605114967-8130f3a36994?q=80&w=1200',
      title: 'Modern Lake View Mansion',
      price: '$4,700/month',
      type: 'For Rent',
      location: 'Ikoyi, Lagos'
    },
    {
      id: 3,
      image:
        'https://images.unsplash.com/photo-1599423300746-b62533397364?q=80&w=1200',
      title: 'Luxury Penthouse',
      price: '$980,000',
      type: 'For Sale',
      location: 'Abuja, Nigeria'
    },
    {
      id: 4,
      image:
        'https://images.unsplash.com/photo-1600585154207-6b7be9b8fdee?q=80&w=1200',
      title: 'Premium Land Plot',
      price: '$320,000',
      type: 'For Sale',
      location: 'Port Harcourt, Nigeria'
    },
    {
      id: 1,
      image:
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1200',
      title: 'Smart Eco Villa',
      price: '$1,250,000',
      type: 'For Sale',
      location: 'Lekki Phase 1, Lagos'
    },
    {
      id: 2,
      image:
        'https://images.unsplash.com/photo-1568605114967-8130f3a36994?q=80&w=1200',
      title: 'Modern Lake View Mansion',
      price: '$4,700/month',
      type: 'For Rent',
      location: 'Ikoyi, Lagos'
    },
    {
      id: 3,
      image:
        'https://images.unsplash.com/photo-1599423300746-b62533397364?q=80&w=1200',
      title: 'Luxury Penthouse',
      price: '$980,000',
      type: 'For Sale',
      location: 'Abuja, Nigeria'
    },
    {
      id: 4,
      image:
        'https://images.unsplash.com/photo-1600585154207-6b7be9b8fdee?q=80&w=1200',
      title: 'Premium Land Plot',
      price: '$320,000',
      type: 'For Sale',
      location: 'Port Harcourt, Nigeria'
    }
  ]

  const handleScroll = dir => {
    const scroll = scrollRef.current
    if (scroll) {
      const amount = 350
      scroll.scrollBy({
        left: dir === 'left' ? -amount : amount,
        behavior: 'smooth'
      })
    }
  }

  const list = properties.length
    ? properties
    : [
        {
          id: 'default',
          image:
            'https://images.unsplash.com/photo-1600585154154-8f6d1e6a3e5d?q=80&w=1200',
          title: 'Coming Soon Estate',
          price: 'TBD',
          type: 'Upcoming',
          location: 'Nigeria'
        }
      ]

  return (
    <section className='lux-scroll-section'>
      <div className='section-header'>
        <div>
          <h2 className='section-title'>
            Discover <span className='gradient-text'>{displayText}</span>
            <span className='cursor'>|</span>
          </h2>
          <p className='section-subtitle'>
            Explore premium listings for buying, selling, and renting exclusive
            properties.
          </p>
        </div>
        <div className='scroll-controls'>
          <button onClick={() => handleScroll('left')}>
            <ChevronLeft size={20} />
          </button>
          <button onClick={() => handleScroll('right')}>
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div className='property-scroll' ref={scrollRef}>
        {list.map((property, i) => (
          <div key={property.id} className='property-card'>
            <div className='image-wrapper'>
              <img src={property.image} alt={property.title} />
              <span
                className={`status-tag ${
                  property.type === 'For Rent'
                    ? 'rent'
                    : property.type === 'Upcoming'
                    ? 'upcoming'
                    : 'sale'
                }`}
              >
                {property.type}
              </span>
            </div>
            <div className='property-info'>
              <h3>{property.title}</h3>
              <p className='location'>
                <MapPin size={15} /> {typeof property.location === 'string' ? property.location : [property.location?.address, property.location?.city, property.location?.state].filter(Boolean).join(', ') || property.city || property.address || ''}
              </p>
              <div className='bottom'>
                <span className='price'>
                  <DollarSign size={15} /> {property.price}
                </span>
                <button className='details-btn'>View Property</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
