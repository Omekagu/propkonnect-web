import React from 'react'
import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaTiktok,
  FaTwitter,
  FaWhatsapp
} from 'react-icons/fa'
import '../../app/Landing.scss'

export default function Footer () {
  return (
    <footer className='lp-footer'>
      <div className='lp-footer__inner'>
        <div className='lp-footer__brand'>
          <a className='lp-footer__logo' href='/'>
            <span className='lp-nav__logo-icon'>P</span>
            <span>{process.env.NEXT_PUBLIC_APP_NAME}</span>
          </a>
          <p>
            Nigeria's most trusted platform for buying, renting, booking
            shortlets, and hiring artisans.
          </p>
          <div className='lp-footer__socials'>
            {['𝕏', 'in', 'f', '▶'].map(s => (
              <a key={s} className='lp-footer__social' href='#'>
                {s}
              </a>
            ))}
          </div>
        </div>

        <div className='lp-footer__col'>
          <h4>Properties</h4>
          <a href='/buy'>Buy a Home</a>
          <a href='/rent'>Rent a Property</a>
          <a href='/search?intent=shortlet'>Shortlets</a>
          <a href='/search?type=commercial'>Commercial</a>
          <a href='/search?type=land'>Land</a>
        </div>

        <div className='lp-footer__col'>
          <h4>Services</h4>
          <a href='/search?type=artisan'>Find Artisans</a>
          <a href='/auth/register?role=artisan'>Join as Artisan</a>
          <a href='/auth/register?role=property-owner'>List a Property</a>
          <a href='/auth/register'>Sign Up</a>
        </div>

        <div className='lp-footer__col'>
          <h4>Company</h4>
          <a href='/about'>About Us</a>
          <a href='/contact'>Contact</a>
          <a href='#'>Careers</a>
          <a href='#'>Blog</a>
          <a href='#'>Press</a>
        </div>

        <div className='lp-footer__col'>
          <h4>Support</h4>
          <a href='/contact'>Help Center</a>
          <a href='#'>Privacy Policy</a>
          <a href='#'>Terms of Service</a>
          <a href='#'>Cookie Policy</a>
        </div>
      </div>

      <div className='lp-footer__bottom'>
        <p>
          © {new Date().getFullYear()} {process.env.NEXT_PUBLIC_APP_NAME}. All
          rights reserved.
        </p>
        <p>Built in Nigeria 🇳🇬 for Africa</p>
      </div>
    </footer>
  )
}
