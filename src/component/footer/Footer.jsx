'use client'
import React, { useEffect, useState } from 'react'
import '../../app/Landing.scss'

const APP_NAME_FALLBACK = process.env.NEXT_PUBLIC_APP_NAME || 'propnekt'
const API = process.env.NEXT_PUBLIC_BACKEND_URL || ''

export default function Footer () {
  const [branding, setBranding] = useState(null)

  useEffect(() => {
    fetch(`${API}/api/platform-config`)
      .then(r => r.json())
      .then(d => {
        if (d?.config?.branding) setBranding(d.config.branding)
      })
      .catch(() => {})
  }, [])

  const appName = branding?.appName || APP_NAME_FALLBACK
  const tagline =
    branding?.footerTagline ||
    "Nigeria's most trusted platform for buying, renting, booking shortlets, and hiring artisans."
  const logoUrl = branding?.logoUrl || ''
  const social = branding?.socialLinks || {}

  const socialLinks = [
    { key: 'twitter', label: '𝕏', href: social.twitter },
    { key: 'instagram', label: '📸', href: social.instagram },
    { key: 'facebook', label: 'f', href: social.facebook },
    { key: 'linkedin', label: 'in', href: social.linkedin },
    { key: 'whatsapp', label: '💬', href: social.whatsapp }
  ].filter(s => s.href)

  return (
    <footer className='home-footer'>
      <div className='home-footer__inner'>
        <div className='home-footer__brand'>
          <a className='home-footer__logo' href='/'>
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={appName}
                style={{ height: 30, width: 'auto', objectFit: 'contain' }}
              />
            ) : (
              <>
                <span className='home-nav__logo-icon'>P</span>
                <span>{appName}</span>
              </>
            )}
          </a>
          <p>{tagline}</p>
          {socialLinks.length > 0 && (
            <div className='home-footer__socials'>
              {socialLinks.map(s => (
                <a
                  key={s.key}
                  className='home-footer__social'
                  href={s.href}
                  target='_blank'
                  rel='noopener noreferrer'
                >
                  {s.label}
                </a>
              ))}
            </div>
          )}
          {socialLinks.length === 0 && (
            <div className='home-footer__socials'>
              {['𝕏', 'in', 'f', '▶'].map(s => (
                <a key={s} className='home-footer__social' href='#'>
                  {s}
                </a>
              ))}
            </div>
          )}
        </div>

        <div className='home-footer__col'>
          <h4>Properties</h4>
          <a href='/buy'>Buy a Home</a>
          <a href='/rent'>Rent a Property</a>
          <a href='/search?intent=shortlet'>Shortlets</a>
          <a href='/search?type=commercial'>Commercial</a>
          <a href='/search?type=land'>Land</a>
        </div>

        <div className='home-footer__col'>
          <h4>Services</h4>
          <a href='/search?type=artisan'>Find Artisans</a>
          <a href='/auth/register?role=artisan'>Join as Artisan</a>
          <a href='/auth/register?role=PROPERTY_OWNER'>List a Property</a>
          <a href='/auth/register'>Sign Up</a>
        </div>

        <div className='home-footer__col'>
          <h4>Company</h4>
          <a href='/about'>About Us</a>
          <a href='/contact'>Contact</a>
          <a href='#'>Careers</a>
          <a href='#'>Blog</a>
          <a href='#'>Press</a>
        </div>

        <div className='home-footer__col'>
          <h4>Support</h4>
          <a href='/contact'>Help Center</a>
          <a href='#'>Privacy Policy</a>
          <a href='#'>Terms of Service</a>
          <a href='#'>Cookie Policy</a>
        </div>
      </div>

      <div className='home-footer__bottom'>
        <p>
          © {new Date().getFullYear()} {appName}. All rights reserved.
        </p>
        <p>Built By SPAHTECHNOLOGIES 🇳🇬 </p>
      </div>
    </footer>
  )
}
