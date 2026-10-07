'use client'
import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { ChevronDown, Menu, X, Home, Key, Search, Info, Phone } from 'lucide-react'
import { useRouter } from 'next/navigation'
import './header.scss'

export default function Header () {
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close mobile menu on outside click
  useEffect(() => {
    if (!menuOpen) return
    const handle = e => {
      if (!e.target.closest('.pn-header')) setMenuOpen(false)
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [menuOpen])

  // Lock body scroll when mobile menu open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  const NAV_LINKS = [
    { label: 'Buy',      href: '/buy'                   },
    { label: 'Rent',     href: '/rent'                  },
    { label: 'Shortlets',href: '/search?intent=shortlet'},
    { label: 'Search',   href: '/search'                },
    { label: 'About',    href: '/about'                 },
    { label: 'Contact',  href: '/contact'               },
  ]

  return (
    <header className={`pn-header${scrolled ? ' pn-header--scrolled' : ''}`}>
      <div className='pn-header__inner'>

        {/* ── Logo ── */}
        <a href='/' className='pn-header__logo' aria-label='propnekt home'>
          <Image
            src='/Propnekt_logo.png'
            alt='propnekt'
            width={140}
            height={36}
            priority
            style={{ objectFit: 'contain', height: 36, width: 'auto' }}
          />
        </a>

        {/* ── Desktop nav ── */}
        <nav className='pn-header__nav' aria-label='Main navigation'>
          {NAV_LINKS.map(l => (
            <a key={l.label} href={l.href} className='pn-header__nav-link'>
              {l.label}
            </a>
          ))}
        </nav>

        {/* ── Desktop actions ── */}
        <div className='pn-header__actions'>
          <button
            className='pn-header__btn-ghost'
            onClick={() => router.push('/auth/login')}
          >
            Sign In
          </button>
          <button
            className='pn-header__btn-cta'
            onClick={() => router.push('/auth/register')}
          >
            Get Started
          </button>
        </div>

        {/* ── Hamburger ── */}
        <button
          className={`pn-header__burger${menuOpen ? ' open' : ''}`}
          onClick={() => setMenuOpen(o => !o)}
          aria-label='Toggle menu'
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* ── Mobile drawer ── */}
      <div className={`pn-header__drawer${menuOpen ? ' open' : ''}`} aria-hidden={!menuOpen}>
        <div className='pn-header__drawer-logo'>
          <Image
            src='/Propnekt_logo.png'
            alt='propnekt'
            width={130}
            height={34}
            style={{ objectFit: 'contain', height: 34, width: 'auto' }}
          />
        </div>

        <nav className='pn-header__drawer-nav'>
          {[
            { label: 'Buy Properties',  href: '/buy',                    Icon: Home  },
            { label: 'Rent a Property', href: '/rent',                   Icon: Key   },
            { label: 'Book Shortlet',   href: '/search?intent=shortlet', Icon: Search},
            { label: 'Search',          href: '/search',                 Icon: Search},
            { label: 'About Us',        href: '/about',                  Icon: Info  },
            { label: 'Contact',         href: '/contact',                Icon: Phone },
          ].map(({ label, href, Icon }) => (
            <a
              key={label}
              href={href}
              className='pn-header__drawer-link'
              onClick={() => setMenuOpen(false)}
            >
              <Icon size={16} className='pn-header__drawer-icon' />
              {label}
            </a>
          ))}
        </nav>

        <div className='pn-header__drawer-actions'>
          <button
            className='pn-header__drawer-ghost'
            onClick={() => { router.push('/auth/login'); setMenuOpen(false) }}
          >
            Sign In
          </button>
          <button
            className='pn-header__drawer-cta'
            onClick={() => { router.push('/auth/register'); setMenuOpen(false) }}
          >
            Get Started — Free
          </button>
        </div>

        <p className='pn-header__drawer-trust'>
          ✓ Free to join &nbsp;·&nbsp; ✓ Verified listings &nbsp;·&nbsp; ✓ Secure payments
        </p>
      </div>

      {/* Backdrop */}
      {menuOpen && (
        <div className='pn-header__backdrop' onClick={() => setMenuOpen(false)} />
      )}
    </header>
  )
}
