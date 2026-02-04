import React from 'react'
import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaTiktok,
  FaTwitter,
  FaWhatsapp
} from 'react-icons/fa'
import './Footer.scss'

export default function Footer () {
  return (
    <footer className='lux-footer'>
      <div className='lux-footer__overlay'></div>

      <div className='lux-footer__content'>
        <div className='lux-footer__branding'>
          <h1 className='logo'>
            <span className='accent'>Prop</span>nect
          </h1>
          <p>
            Elevating luxury living — Propnect redefines real estate with
            elegance, comfort, and innovation.
          </p>
        </div>

        <div className='lux-footer__links'>
          <h4>Quick Links</h4>
          <ul>
            <li>
              <a href='#'>Home</a>
            </li>
            <li>
              <a href='#'>Our Estates</a>
            </li>
            <li>
              <a href='#'>Invest</a>
            </li>
            <li>
              <a href='#'>About</a>
            </li>
            <li>
              <a href='#'>Contact</a>
            </li>
          </ul>
        </div>

        <div className='lux-footer__newsletter'>
          <h4>Stay Updated</h4>
          <p>Subscribe for new listings, insights & market news.</p>
          <form>
            <input type='email' placeholder='Enter your email' required />
            <button type='submit'>Join</button>
          </form>
        </div>

        <div className='lux-footer__socials'>
          <h4>Follow Us</h4>
          <div className='icons'>
            <a href='#'>
              <FaFacebookF />
            </a>
            <a href='#'>
              <FaInstagram />
            </a>
            <a href='#'>
              <FaTwitter />
            </a>
            <a href='#'>
              <FaLinkedinIn />
            </a>
            <a href='#'>
              <FaTiktok />
            </a>
          </div>
        </div>
      </div>

      <div className='lux-footer__bottom'>
        <p>© {new Date().getFullYear()} Propnect. All rights reserved.</p>
      </div>

      <a
        href='https://wa.me/2349012345678'
        className='whatsapp-float'
        target='_blank'
      >
        <FaWhatsapp />
      </a>
    </footer>
  )
}
