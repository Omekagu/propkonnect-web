'use client'

import React, { useState } from 'react'
import { Mail, Phone, MapPin, Send, CheckCircle } from 'lucide-react'
import './contact.scss'

export default function ContactUs () {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = e => {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setSubmitted(true)
      setTimeout(() => setSubmitted(false), 5000)
    }, 1200)
  }

  return (
    <div className='pn-contact'>
      {/* Hero */}
      <section className='pn-contact__hero'>
        <div className='pn-contact__hero-grid' />
        <div className='pn-contact__hero-content'>
          <span className='pn-contact__badge'>Get In Touch</span>
          <h1>Let's Talk.<br /><span>We're here to help.</span></h1>
          <p>Reach out for partnerships, support, or anything real estate in Nigeria.</p>
        </div>
      </section>

      {/* Contact body */}
      <section className='pn-contact__body'>
        {/* Info panel */}
        <div className='pn-contact__info'>
          <h2>Contact Details</h2>
          <p className='pn-contact__info-sub'>Our team responds within 24 hours on business days.</p>

          <ul className='pn-contact__info-list'>
            <li>
              <span className='pn-contact__info-icon'><Mail size={18} /></span>
              <div>
                <strong>Email</strong>
                <a href='mailto:contactus@propnekt.com'>contactus@propnekt.com</a>
              </div>
            </li>
            <li>
              <span className='pn-contact__info-icon'><Phone size={18} /></span>
              <div>
                <strong>Phone</strong>
                <a href='tel:+2348000000000'>+234 800 000 0000</a>
              </div>
            </li>
            <li>
              <span className='pn-contact__info-icon'><MapPin size={18} /></span>
              <div>
                <strong>Office</strong>
                <span>123 Business District, Lagos, Nigeria</span>
              </div>
            </li>
          </ul>

          <div className='pn-contact__socials'>
            <a href='https://twitter.com/propnekt' aria-label='Twitter / X' target='_blank' rel='noreferrer' className='pn-contact__social'>
              <svg width='16' height='16' viewBox='0 0 24 24' fill='currentColor'>
                <path d='M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.741l7.73-8.835L1.254 2.25H8.08l4.259 5.63zm-1.161 17.52h1.833L7.084 4.126H5.117z' />
              </svg>
            </a>
            <a href='https://linkedin.com/company/propnekt' aria-label='LinkedIn' target='_blank' rel='noreferrer' className='pn-contact__social'>
              <svg width='16' height='16' viewBox='0 0 24 24' fill='currentColor'>
                <path d='M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z' />
              </svg>
            </a>
            <a href='https://instagram.com/propnekt' aria-label='Instagram' target='_blank' rel='noreferrer' className='pn-contact__social'>
              <svg width='16' height='16' viewBox='0 0 24 24' fill='currentColor'>
                <path d='M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z' />
              </svg>
            </a>
          </div>

          <div className='pn-contact__hours'>
            <strong>Business Hours</strong>
            <span>Mon – Fri · 9am – 6pm WAT</span>
          </div>
        </div>

        {/* Form */}
        <form className='pn-contact__form' onSubmit={handleSubmit} autoComplete='off'>
          <h2>Send a Message</h2>

          <div className='pn-contact__row'>
            <div className='pn-contact__group'>
              <label htmlFor='name'>Full Name</label>
              <input id='name' name='name' type='text' placeholder='Your full name'
                value={form.name} onChange={handleChange} required />
            </div>
            <div className='pn-contact__group'>
              <label htmlFor='email'>Email Address</label>
              <input id='email' name='email' type='email' placeholder='you@example.com'
                value={form.email} onChange={handleChange} required />
            </div>
          </div>

          <div className='pn-contact__group'>
            <label htmlFor='subject'>Subject</label>
            <input id='subject' name='subject' type='text' placeholder='How can we help you?'
              value={form.subject} onChange={handleChange} required />
          </div>

          <div className='pn-contact__group'>
            <label htmlFor='message'>Message</label>
            <textarea id='message' name='message' rows={5} placeholder='Tell us more…'
              value={form.message} onChange={handleChange} required />
          </div>

          <button type='submit' className='pn-contact__submit' disabled={loading}>
            {loading ? (
              <span className='pn-contact__spinner' />
            ) : (
              <><Send size={16} /> Send Message</>
            )}
          </button>

          {submitted && (
            <div className='pn-contact__success'>
              <CheckCircle size={16} />
              Message sent! We'll get back to you within 24 hours.
            </div>
          )}
        </form>
      </section>
    </div>
  )
}
