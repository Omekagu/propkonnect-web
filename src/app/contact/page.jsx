'use client'

import React, { useState } from 'react'
import './contact.scss'

export default function ContactUs () {
  const [form, setForm] = useState({
    name: '',
    email: '',
    message: ''
  })
  const [submitted, setSubmitted] = useState(false)

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = e => {
    e.preventDefault()
    // Simulate submit
    setSubmitted(true)
    setTimeout(() => setSubmitted(false), 3000)
  }

  return (
    <section className='contact-page'>
      <div className='contact-container'>
        {/* Left Side: Illustration & Info */}
        <div className='contact-info'>
          <div className='contact-illus'>
            {/* You can use an SVG/PNG or <img> here */}
            <svg width='200' height='180' viewBox='0 0 200 180' fill='none'>
              <ellipse
                cx='100'
                cy='90'
                rx='100'
                ry='90'
                fill='#00bfa6'
                fillOpacity='0.11'
              />
              <rect x='40' y='60' width='120' height='60' rx='18' fill='#fff' />
              <rect
                x='65'
                y='80'
                width='70'
                height='8'
                rx='4'
                fill='#00bfa6'
                fillOpacity='0.8'
              />
              <rect
                x='65'
                y='95'
                width='45'
                height='8'
                rx='4'
                fill='#2f8ee5'
                fillOpacity='0.8'
              />
              <circle cx='65' cy='73' r='5' fill='#2f8ee5' />
            </svg>
          </div>
          <h2>Contact Us</h2>
          <p>
            We’re here to help! Reach out for business, partnership, or support
            inquiries.
            <br />
            <br />
            <span className='contact-highlight'>Email:</span>{' '}
            <a href='mailto:hello@yourcompany.com'>contactus@prohunters.com</a>
            <br />
            <span className='contact-highlight'>Phone:</span>{' '}
            <a href='tel:+2348000000000'>+234 800 000 0000</a>
            <br />
            <span className='contact-highlight'>Address:</span> 123 Business
            District, Lagos, Nigeria
          </p>
          <div className='contact-socials'>
            <a href='#' aria-label='Twitter'>
              <svg width='24' height='24' fill='none'>
                <path
                  d='M22 5.92a8.38 8.38 0 0 1-2.357.646A4.117 4.117 0 0 0 21.448 4.1a8.224 8.224 0 0 1-2.605.996A4.107 4.107 0 0 0 11.15 8.03c0 .322.036.637.106.938A11.654 11.654 0 0 1 3.112 4.94a4.093 4.093 0 0 0-.555 2.067c0 1.426.727 2.683 1.832 3.422a4.093 4.093 0 0 1-1.858-.513v.052a4.108 4.108 0 0 0 3.292 4.022 4.09 4.09 0 0 1-1.853.07 4.11 4.11 0 0 0 3.834 2.85A8.233 8.233 0 0 1 2 19.542a11.616 11.616 0 0 0 6.29 1.84c7.547 0 11.675-6.155 11.675-11.495 0-.175-.004-.349-.012-.522A8.18 8.18 0 0 0 22 5.92z'
                  fill='#2f8ee5'
                />
              </svg>
            </a>
            <a href='#' aria-label='LinkedIn'>
              <svg width='24' height='24' fill='none'>
                <rect
                  x='2'
                  y='2'
                  width='20'
                  height='20'
                  rx='5'
                  fill='#00bfa6'
                />
                <rect x='6' y='9' width='2' height='7' fill='#fff' />
                <circle cx='7' cy='7' r='1' fill='#fff' />
                <rect x='10' y='13' width='2' height='3' fill='#fff' />
                <rect x='10' y='11' width='2' height='1' fill='#fff' />
                <rect x='13' y='13' width='2' height='3' fill='#fff' />
                <rect x='13' y='11' width='2' height='1' fill='#fff' />
              </svg>
            </a>
            <a href='#' aria-label='Instagram'>
              <svg width='24' height='24' fill='none'>
                <rect
                  x='2'
                  y='2'
                  width='20'
                  height='20'
                  rx='6'
                  fill='#2f8ee5'
                />
                <circle cx='12' cy='12' r='4' fill='#fff' />
                <circle cx='17' cy='7' r='1' fill='#fff' />
              </svg>
            </a>
          </div>
        </div>
        {/* Right Side: Form */}
        <form
          className='contact-form'
          onSubmit={handleSubmit}
          autoComplete='off'
        >
          <div className='form-title'>Send us a message</div>
          <div className='form-group'>
            <label htmlFor='name'>Name</label>
            <input
              name='name'
              id='name'
              autoComplete='off'
              type='text'
              placeholder='Your Name'
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className='form-group'>
            <label htmlFor='email'>Email</label>
            <input
              name='email'
              id='email'
              autoComplete='off'
              type='email'
              placeholder='you@email.com'
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className='form-group'>
            <label htmlFor='message'>Message</label>
            <textarea
              name='message'
              id='message'
              placeholder='How can we help you?'
              rows={5}
              value={form.message}
              onChange={handleChange}
              required
            ></textarea>
          </div>
          <button type='submit' className='submit-btn' disabled={submitted}>
            {submitted ? 'Thank you!' : 'Send Message'}
          </button>
          {submitted && (
            <div className='form-success'>Your message has been sent!</div>
          )}
        </form>
      </div>
    </section>
  )
}
