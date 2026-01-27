'use client'
import React, { useState, useEffect } from 'react'
import { ChevronDown, Menu, X } from 'lucide-react'
import './header.scss'

export default function Header () {
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState(null)
  const [hidden, setHidden] = useState(false)
  const [lastScrollY, setLastScrollY] = useState(0)

  // Dropdown logic (unchanged)
  const toggleDropdown = name => {
    setActiveDropdown(activeDropdown === name ? null : name)
  }

  // Header scroll logic
  useEffect(() => {
    let ticking = false
    const handleScroll = () => {
      const currentScrollY = window.scrollY

      // Always show at very top
      if (currentScrollY < 10) {
        setHidden(false)
        setLastScrollY(currentScrollY)
        return
      }
      if (currentScrollY > lastScrollY) {
        setHidden(true) // Hide (slide below viewport)
      } else if (currentScrollY < lastScrollY) {
        setHidden(false) // Show (slide up into view)
      }
      setLastScrollY(currentScrollY)
      ticking = false
    }

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(handleScroll)
        ticking = true
      }
    }

    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
    // eslint-disable-next-line
  }, [lastScrollY])

  return (
    <header
      className={`navbar${menuOpen ? ' mobile-active' : ''}${
        hidden ? ' header--hidden' : ''
      }`}
    >
      <div className='navbar-inner'>
        {/* Left Nav */}
        <div className='nav-left'>
          <a href='#' className='nav-link'>
            About Us
          </a>
          <div
            className={`nav-item ${
              activeDropdown === 'projects' ? 'open' : ''
            }`}
            onMouseEnter={() => setActiveDropdown('projects')}
            onMouseLeave={() => setActiveDropdown(null)}
          >
            {/* <a className='nav-link'>
              Our Projects <ChevronDown className='icon' />
            </a>
            <div className='dropdown'>
              {['Abuja', 'Kwara', 'Ondo', 'Ekiti', 'Buildings'].map(item => (
                <p key={item}>{item}</p>
              ))}
            </div> */}
          </div>
          <a href='/contact' className='nav-link'>
            Contact Us
          </a>
          <div
            className={`nav-item ${activeDropdown === 'company' ? 'open' : ''}`}
            onMouseEnter={() => setActiveDropdown('company')}
            onMouseLeave={() => setActiveDropdown(null)}
          >
            <a className='nav-link'>
              Our Company <ChevronDown className='icon' />
            </a>
            <div className='dropdown'>
              {['About Pro Hunters', 'Leadership', 'Careers'].map(item => (
                <p key={item}>{item}</p>
              ))}
            </div>
          </div>

          <a href='/rent' className='nav-link'>
            Rentals
          </a>
          <a href='/buy' className='nav-link'>
            Buy
          </a>
        </div>

        {/* Center Logo */}
        <div className='nav-center'>
          <a href='/'>
            <h2 className='logo'>Pro Hunters</h2>
          </a>
        </div>

        {/* Right Section */}
        <div className='nav-right'>
          <div className='signup-btn'>DOWNLOAD APP</div>
          <div
            className='menu-btn'
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label='Menu'
          >
            {menuOpen ? <X /> : <Menu />}
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      <div className={`mobile-menu${menuOpen ? ' open' : ''}`}>
        <div>
          <a href='#'>About Us</a>
          <details>
            <summary>Our Projects</summary>
            <ul>
              <li>Abuja</li>
              <li>Kwara</li>
              <li>Ondo</li>
              <li>Ekiti</li>
              <li>Buildings</li>
            </ul>
          </details>
          <a href='/buy'>Buy</a>
          <a href='/rent'>Rent</a>
          <a href='/contact'>Contact Us</a>
          <details>
            <summary>Our Company</summary>
            <ul>
              <li>About Pro Hunters</li>
              <li>Leadership</li>
              <li>Careers</li>
            </ul>
          </details>
          <a href='#'>Orange Yakata</a>
        </div>
        <div className='mobile-actions'>
          <span className='mobile'>Sign Up</span>
          <span className='mobile'>DOWNLOAD APP</span>
        </div>
      </div>
    </header>
  )
}
