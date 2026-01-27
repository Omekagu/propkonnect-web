'use client'

import React, { useEffect, useRef } from 'react'
import './HomeSectionTwo.scss'
import { Building2, Home, Key, MapPin } from 'lucide-react'

export default function HomeSectionTwo () {
  const sectionRef = useRef(null)

  useEffect(() => {
    const cards = sectionRef.current.querySelectorAll('.feature-card')

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.2 }
    )

    cards.forEach(card => observer.observe(card))
  }, [])

  const features = [
    {
      icon: <Home size={36} />,
      title: 'Buy a Home',
      desc: 'Explore premium listings in top neighborhoods and find your perfect home with expert guidance.'
    },
    {
      icon: <Key size={36} />,
      title: 'Rent a Property',
      desc: 'Choose from thousands of modern apartments and short-term rentals that fit your budget and lifestyle.'
    },
    {
      icon: <Building2 size={36} />,
      title: 'Sell with Ease',
      desc: 'Get your property seen by qualified buyers through our trusted selling partners and digital marketing tools.'
    },
    {
      icon: <MapPin size={36} />,
      title: 'Explore Locations',
      desc: 'Discover properties in the most desirable areas with detailed insights, maps, and virtual tours.'
    }
  ]

  return (
    <section className='homeSectionTwo' ref={sectionRef}>
      <div className='container'>
        <h2 className='section-title'>Your Property Journey Starts Here</h2>
        <p className='section-subtitle'>
          Whether you’re buying, renting, or selling — we make it seamless,
          transparent, and rewarding.
        </p>

        <div className='features-grid'>
          {features.map((item, index) => (
            <div className='feature-card' key={index}>
              <div className='icon-wrapper'>{item.icon}</div>
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
