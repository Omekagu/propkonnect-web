'use client'

import React, { useState, useEffect } from 'react'
import './Landing.scss'
import { useRouter } from 'next/navigation'

const LandingPage = () => {
  const [scrollY, setScrollY] = useState(0)
  const [activeFeature, setActiveFeature] = useState(0)

  const router = useRouter()

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature(prev => (prev + 1) % features.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  const features = [
    {
      icon: '🏠',
      title: 'Smart Property Search',
      description: 'AI-powered matching finds your perfect property in seconds'
    },
    {
      icon: '🔧',
      title: 'Verified Artisans',
      description:
        'Connect with trusted professionals for all your property needs'
    },
    {
      icon: '💬',
      title: 'Real-time Chat',
      description:
        'Instant communication with property owners and service providers'
    },
    {
      icon: '📊',
      title: 'Analytics Dashboard',
      description: 'Track listings, bookings, and performance in one place'
    }
  ]

  const stats = [
    { number: '10K+', label: 'Properties Listed' },
    { number: '5K+', label: 'Verified Artisans' },
    { number: '50K+', label: 'Happy Users' },
    { number: '98%', label: 'Satisfaction Rate' }
  ]

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Property Owner',
      avatar: '👩‍💼',
      text: 'Found my dream apartment in just 2 days. The platform is incredibly intuitive and the artisan network made moving in seamless.'
    },
    {
      name: 'Michael Chen',
      role: 'Professional Plumber',
      avatar: '👨‍🔧',
      text: 'This platform transformed my business. I get steady work from verified clients and the payment system is flawless.'
    },
    {
      name: 'Emily Rodriguez',
      role: 'First-time Renter',
      avatar: '👩',
      text: 'As a first-timer, I was nervous about renting. The verification process and responsive support made everything stress-free.'
    }
  ]

  const scrollToSection = id => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className='landing-page'>
      {/* Floating Navigation */}
      <nav className='navbar' style={{ opacity: scrollY > 100 ? 1 : 0 }}>
        <div className='nav-container'>
          <div className='logo'>
            <span className='logo-text'>Propnect</span>
          </div>
          <div className='nav-links'>
            <a onClick={() => scrollToSection('features')}>Features</a>
            <a onClick={() => scrollToSection('how-it-works')}>How It Works</a>
            <a onClick={() => scrollToSection('testimonials')}>Reviews</a>
            <a onClick={() => scrollToSection('pricing')}>Pricing</a>
          </div>
          <div className='nav-actions'>
            <button
              className='btn-login'
              onClick={() => router.push('/auth/login')}
            >
              Sign In
            </button>
            <button
              className='btn-cta'
              onClick={() => router.push('/auth/register')}
            >
              Get App
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className='hero'>
        <div className='hero-background'>
          <div className='gradient-orb orb-1'></div>
          <div className='gradient-orb orb-2'></div>
          <div className='gradient-orb orb-3'></div>
          <div className='grid-overlay'></div>
        </div>

        <div className='hero-content'>
          <div className='hero-badge'>
            <span className='badge-dot'></span>
            Trusted by 50,000+ users worldwide
          </div>

          <h1 className='hero-title'>
            Find Your Perfect
            <span className='gradient-text'> Property</span>
            <br />
            Connect with Expert
            <span className='gradient-text'> Artisans</span>
          </h1>

          <p className='hero-subtitle'>
            The all-in-one platform that connects property seekers with verified
            listings and trusted service professionals. Your journey to the
            perfect space starts here.
          </p>

          <div className='hero-cta'>
            <button
              className='btn-primary'
              onClick={() => router.push('/auth/login')}
            >
              <span>Start Your Search</span>
              <span className='btn-arrow'>→</span>
            </button>
            <button className='btn-secondary'>
              <span className='play-icon'>▶</span>
              <span>Watch Demo</span>
            </button>
          </div>

          <div className='hero-stats'>
            {stats.map((stat, index) => (
              <div key={index} className='stat-item'>
                <div className='stat-number'>{stat.number}</div>
                <div className='stat-label'>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className='hero-visual'>
          <div className='floating-card card-1'>
            <div className='card-header'>
              <div className='property-image'>🏡</div>
              <div className='property-info'>
                <h4>Modern Apartment</h4>
                <p>Downtown • $2,500/mo</p>
              </div>
            </div>
            <div className='card-tag'>New Listing</div>
          </div>

          <div className='floating-card card-2'>
            <div className='artisan-header'>
              <div className='artisan-avatar'>🔧</div>
              <div className='artisan-info'>
                <h4>John Smith</h4>
                <p>Master Electrician</p>
              </div>
              <div className='rating'>⭐ 4.9</div>
            </div>
          </div>

          <div className='floating-card card-3'>
            <div className='notification'>
              <span className='notif-icon'>✓</span>
              <span>Property verified successfully!</span>
            </div>
          </div>
        </div>
      </section>
      {/* Features Section */}
      <section id='features' className='features'>
        <div className='section-header'>
          <div className='section-tag'>Features</div>
          <h2 className='section-title'>Everything You Need in One Place</h2>
          <p className='section-subtitle'>
            Powerful tools designed to make property management and service
            booking effortless
          </p>
        </div>

        <div className='features-grid'>
          {features.map((feature, index) => (
            <div
              key={index}
              className={`feature-card ${
                activeFeature === index ? 'active' : ''
              }`}
              onMouseEnter={() => setActiveFeature(index)}
            >
              <div className='feature-icon'>{feature.icon}</div>
              <h3 className='feature-title'>{feature.title}</h3>
              <p className='feature-description'>{feature.description}</p>
              <div className='feature-link'>
                Learn more <span>→</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section id='how-it-works' className='how-it-works'>
        <div className='section-header'>
          <div className='section-tag'>Process</div>
          <h2 className='section-title'>How propnect Works</h2>
        </div>

        <div className='steps-container'>
          <div className='step'>
            <div className='step-number'>01</div>
            <div className='step-content'>
              <h3>Create Your Profile</h3>
              <p>
                Sign up in seconds and tell us what you're looking for - whether
                it's a property or professional services
              </p>
            </div>
            <div className='step-visual'>📝</div>
          </div>

          <div className='step-connector'></div>

          <div className='step'>
            <div className='step-number'>02</div>
            <div className='step-content'>
              <h3>Browse & Connect</h3>
              <p>
                Explore verified listings and artisan profiles. Use smart
                filters to find exactly what you need
              </p>
            </div>
            <div className='step-visual'>🔍</div>
          </div>

          <div className='step-connector'></div>

          <div className='step'>
            <div className='step-number'>03</div>
            <div className='step-content'>
              <h3>Book & Communicate</h3>
              <p>
                Schedule viewings, book services, and chat in real-time. All
                secured with our verification system
              </p>
            </div>
            <div className='step-visual'>💼</div>
          </div>

          <div className='step-connector'></div>

          <div className='step'>
            <div className='step-number'>04</div>
            <div className='step-content'>
              <h3>Move In & Manage</h3>
              <p>
                Complete transactions safely, move in with confidence, and
                manage everything from your dashboard
              </p>
            </div>
            <div className='step-visual'>🎉</div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id='testimonials' className='testimonials'>
        <div className='section-header'>
          <div className='section-tag'>Testimonials</div>
          <h2 className='section-title'>Loved by Thousands</h2>
          <p className='section-subtitle'>
            See what our community has to say about their experience
          </p>
        </div>

        <div className='testimonials-grid'>
          {testimonials.map((testimonial, index) => (
            <div key={index} className='testimonial-card'>
              <div className='testimonial-stars'>⭐⭐⭐⭐⭐</div>
              <p className='testimonial-text'>"{testimonial.text}"</p>
              <div className='testimonial-author'>
                <div className='author-avatar'>{testimonial.avatar}</div>
                <div className='author-info'>
                  <div className='author-name'>{testimonial.name}</div>
                  <div className='author-role'>{testimonial.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id='pricing' className='pricing'>
        <div className='section-header'>
          <div className='section-tag'>Pricing</div>
          <h2 className='section-title'>Choose Your Plan</h2>
          <p className='section-subtitle'>
            Flexible pricing for individuals and businesses
          </p>
        </div>

        <div className='pricing-grid'>
          <div className='pricing-card'>
            <div className='pricing-header'>
              <h3>Free</h3>
              <div className='price'>
                <span className='currency'>$</span>
                <span className='amount'>0</span>
                <span className='period'>/month</span>
              </div>
            </div>
            <ul className='pricing-features'>
              <li>
                <span className='check'>✓</span> Browse unlimited properties
              </li>
              <li>
                <span className='check'>✓</span> Connect with artisans
              </li>
              <li>
                <span className='check'>✓</span> Basic messaging
              </li>
              <li className='disabled'>
                <span className='cross'>×</span> Priority support
              </li>
              <li className='disabled'>
                <span className='cross'>×</span> Advanced analytics
              </li>
            </ul>
            <button className='pricing-btn'>Get Started</button>
          </div>

          <div className='pricing-card featured'>
            <div className='popular-badge'>Most Popular</div>
            <div className='pricing-header'>
              <h3>Pro</h3>
              <div className='price'>
                <span className='currency'>$</span>
                <span className='amount'>29</span>
                <span className='period'>/month</span>
              </div>
            </div>
            <ul className='pricing-features'>
              <li>
                <span className='check'>✓</span> Everything in Free
              </li>
              <li>
                <span className='check'>✓</span> Priority listings
              </li>
              <li>
                <span className='check'>✓</span> Unlimited messaging
              </li>
              <li>
                <span className='check'>✓</span> 24/7 priority support
              </li>
              <li>
                <span className='check'>✓</span> Advanced analytics
              </li>
            </ul>
            <button className='pricing-btn primary'>Start Free Trial</button>
          </div>

          <div className='pricing-card'>
            <div className='pricing-header'>
              <h3>Business</h3>
              <div className='price'>
                <span className='currency'>$</span>
                <span className='amount'>99</span>
                <span className='period'>/month</span>
              </div>
            </div>
            <ul className='pricing-features'>
              <li>
                <span className='check'>✓</span> Everything in Pro
              </li>
              <li>
                <span className='check'>✓</span> Team collaboration
              </li>
              <li>
                <span className='check'>✓</span> API access
              </li>
              <li>
                <span className='check'>✓</span> White-label options
              </li>
              <li>
                <span className='check'>✓</span> Dedicated account manager
              </li>
            </ul>
            <button className='pricing-btn'>Contact Sales</button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className='cta-section'>
        <div className='cta-content'>
          <h2 className='cta-title'>Ready to Get Started?</h2>
          <p className='cta-subtitle'>
            Join thousands of users finding their perfect properties and
            connecting with trusted professionals
          </p>
          <div className='cta-buttons'>
            <button
              className='btn-cta-primary'
              onClick={() => router.push('/auth/login')}
            >
              Create Free Account
              <span className='btn-arrow'>→</span>
            </button>
            <button className='btn-cta-secondary'>Schedule a Demo</button>
          </div>
        </div>
        <div className='cta-visual'>
          <div className='cta-glow'></div>
        </div>
      </section>

      {/* Footer */}
      {/* <footer className='footer'>
        <div className='footer-content'>
          <div className='footer-main'>
            <div className='footer-brand'>
              <div className='footer-logo'>
                <span className='logo-icon'>🏛️</span>
                <span className='logo-text'>propnect</span>
              </div>
              <p className='footer-tagline'>
                Connecting people with properties and professionals since 2024
              </p>
              <div className='social-links'>
                <a href='#' className='social-link'>
                  📘
                </a>
                <a href='#' className='social-link'>
                  🐦
                </a>
                <a href='#' className='social-link'>
                  📸
                </a>
                <a href='#' className='social-link'>
                  💼
                </a>
              </div>
            </div>

            <div className='footer-links'>
              <div className='footer-column'>
                <h4>Product</h4>
                <a href='#'>Features</a>
                <a href='#'>Pricing</a>
                <a href='#'>API</a>
                <a href='#'>Integrations</a>
              </div>

              <div className='footer-column'>
                <h4>Company</h4>
                <a href='#'>About</a>
                <a href='#'>Blog</a>
                <a href='#'>Careers</a>
                <a href='#'>Press</a>
              </div>

              <div className='footer-column'>
                <h4>Resources</h4>
                <a href='#'>Documentation</a>
                <a href='#'>Help Center</a>
                <a href='#'>Community</a>
                <a href='#'>Contact</a>
              </div>

              <div className='footer-column'>
                <h4>Legal</h4>
                <a href='#'>Privacy</a>
                <a href='#'>Terms</a>
                <a href='#'>Security</a>
                <a href='#'>Cookies</a>
              </div>
            </div>
          </div>

          <div className='footer-bottom'>
            <p>© 2024 propnect. All rights reserved.</p>
            <div className='footer-badges'>
              <span className='badge'>🔒 SSL Secured</span>
              <span className='badge'>✓ Verified Platform</span>
            </div>
          </div>
        </div>
      </footer> */}
    </div>
  )
}

export default LandingPage
