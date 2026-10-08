'use client'
import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { useRouter, usePathname } from 'next/navigation'
import { Menu, X, Home, Key, Calendar, Search, Info, Phone } from 'lucide-react'
import './header.scss'

const NAV_LINKS = [
  { label: 'Buy',      href: '/buy'                    },
  { label: 'Rent',     href: '/rent'                   },
  { label: 'Shortlets',href: '/search?intent=shortlet' },
  { label: 'Search',   href: '/search'                 },
  { label: 'About',    href: '/about'                  },
  { label: 'Contact',  href: '/contact'                },
]

const MOBILE_NAV = [
  { label: 'Buy',      href: '/buy',                    Icon: Home     },
  { label: 'Rent',     href: '/rent',                   Icon: Key      },
  { label: 'Shortlets',href: '/search?intent=shortlet', Icon: Calendar },
  { label: 'Search',   href: '/search',                 Icon: Search   },
  { label: 'About',    href: '/about',                  Icon: Info     },
  { label: 'Contact',  href: '/contact',                Icon: Phone    },
]

export default function Header () {
  const router   = useRouter()
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!menuOpen) return
    const handle = e => {
      if (!e.target.closest('.pn-header')) setMenuOpen(false)
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [menuOpen])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  // Close drawer on route change
  useEffect(() => { setMenuOpen(false) }, [pathname])

  const isActive = href => {
    if (href.startsWith('/search')) return pathname?.startsWith('/search')
    return pathname === href
  }

  return (
    <header className={`pn-header${scrolled ? ' pn-header--scrolled' : ''}`}>
      <div className='pn-header__inner'>

        {/* Logo */}
        <a href='/' className='pn-header__logo' aria-label='Propnekt home'>
          <Image
            src='https://i.postimg.cc/Z5KDSpvb/propnekt-mark.png'
            alt=''
            width={32}
            height={32}
            priority
            className='pn-header__logo-mark'
          />
          <span className='pn-header__logo-name'>propnekt</span>
        </a>

        {/* Desktop nav */}
        <nav className='pn-header__nav' aria-label='Main navigation'>
          {NAV_LINKS.map(l => (
            <a
              key={l.label}
              href={l.href}
              className={`pn-header__nav-link${isActive(l.href) ? ' active' : ''}`}
            >
              {l.label}
            </a>
          ))}
        </nav>

        {/* Desktop actions */}
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

        {/* Hamburger */}
        <button
          className={`pn-header__burger${menuOpen ? ' open' : ''}`}
          onClick={() => setMenuOpen(o => !o)}
          aria-label='Toggle navigation menu'
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile drawer */}
      <div
        className={`pn-header__drawer${menuOpen ? ' open' : ''}`}
        aria-hidden={!menuOpen}
      >
        <div className='pn-header__drawer-logo'>
          <Image
            src='https://i.postimg.cc/Z5KDSpvb/propnekt-mark.png'
            alt=''
            width={30}
            height={30}
            className='pn-header__drawer-logo-mark'
          />
          <span className='pn-header__drawer-logo-name'>propnekt</span>
        </div>

        <nav className='pn-header__drawer-nav'>
          {MOBILE_NAV.map(({ label, href, Icon }) => (
            <a
              key={label}
              href={href}
              className={`pn-header__drawer-link${isActive(href) ? ' active' : ''}`}
              onClick={() => setMenuOpen(false)}
            >
              <Icon size={17} className='pn-header__drawer-icon' />
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
        <div
          className='pn-header__backdrop'
          onClick={() => setMenuOpen(false)}
          aria-hidden='true'
        />
      )}
    </header>
  )
}
