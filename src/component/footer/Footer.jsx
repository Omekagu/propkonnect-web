'use client'
import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import './Footer.scss'

const API = process.env.NEXT_PUBLIC_BACKEND_URL || ''

export default function Footer () {
  const [branding, setBranding] = useState(null)

  useEffect(() => {
    fetch(`${API}/api/platform-config`)
      .then(r => r.json())
      .then(d => { if (d?.config?.branding) setBranding(d.config.branding) })
      .catch(() => {})
  }, [])

  const appName = branding?.appName || 'propnekt'
  const tagline = branding?.footerTagline ||
    "Nigeria's most trusted platform for buying, renting, and booking properties."
  const social = branding?.socialLinks || {}

  const socialLinks = [
    { key: 'twitter',   label: '𝕏',   href: social.twitter   },
    { key: 'instagram', label: 'Ig',  href: social.instagram  },
    { key: 'facebook',  label: 'Fb',  href: social.facebook   },
    { key: 'linkedin',  label: 'in',  href: social.linkedin   },
    { key: 'whatsapp',  label: 'Wa',  href: social.whatsapp   },
  ].filter(s => s.href)

  return (
    <footer className='pn-footer'>
      <div className='pn-footer__inner'>

        {/* ── Brand column */}
        <div className='pn-footer__brand'>
          <a href='/' className='pn-footer__logo'>
            <Image
              src='/Propnekt_logo.png'
              alt={appName}
              width={140}
              height={36}
              style={{ objectFit: 'contain', height: 36, width: 'auto' }}
            />
          </a>
          <p className='pn-footer__tagline'>{tagline}</p>
          <div className='pn-footer__socials'>
            {(socialLinks.length > 0 ? socialLinks : [
              { key: 'x',  label: '𝕏',  href: '#' },
              { key: 'ig', label: 'Ig', href: '#' },
              { key: 'fb', label: 'Fb', href: '#' },
              { key: 'li', label: 'in', href: '#' },
            ]).map(s => (
              <a
                key={s.key}
                className='pn-footer__social'
                href={s.href}
                target='_blank'
                rel='noopener noreferrer'
                aria-label={s.key}
              >
                {s.label}
              </a>
            ))}
          </div>
        </div>

        {/* ── Properties column */}
        <div className='pn-footer__col'>
          <h4>Properties</h4>
          <a href='/buy'>Buy a Home</a>
          <a href='/rent'>Rent a Property</a>
          <a href='/search?intent=shortlet'>Shortlets</a>
          <a href='/search?type=commercial'>Commercial</a>
          <a href='/search?type=land'>Land</a>
        </div>

        {/* ── For Owners column */}
        <div className='pn-footer__col'>
          <h4>For Owners</h4>
          <a href='/auth/register?role=PROPERTY_OWNER'>List a Property</a>
          <a href='/auth/login'>Manage Listings</a>
          <a href='/about'>Why propnekt</a>
          <a href='/contact'>Partner with Us</a>
        </div>

        {/* ── Company column */}
        <div className='pn-footer__col'>
          <h4>Company</h4>
          <a href='/about'>About Us</a>
          <a href='/contact'>Contact</a>
          <a href='#'>Careers</a>
          <a href='#'>Blog</a>
        </div>

        {/* ── Support column */}
        <div className='pn-footer__col'>
          <h4>Support</h4>
          <a href='/contact'>Help Center</a>
          <a href='#'>Privacy Policy</a>
          <a href='#'>Terms of Service</a>
          <a href='#'>Cookie Policy</a>
        </div>
      </div>

      <div className='pn-footer__bottom'>
        <p>© {new Date().getFullYear()} {appName}. All rights reserved.</p>
        <p className='pn-footer__credit'>Built with ❤️ in Nigeria 🇳🇬</p>
      </div>
    </footer>
  )
}
