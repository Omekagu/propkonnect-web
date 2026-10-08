import React from 'react'
import { Shield, Zap, Users, Building2, CheckCircle2, Star, Globe, Lock } from 'lucide-react'
import './about.scss'

const STATS = [
  { value: '50,000+', label: 'Verified Users' },
  { value: '10,000+', label: 'Active Listings' },
  { value: '4.9 / 5',  label: 'Average Rating' },
  { value: '100%',    label: 'Escrow Protected' }
]

const VALUES = [
  {
    Icon: Shield,
    title: 'Trust First',
    desc: 'Every listing is verified. Every payment is escrow-protected. We hold ourselves to the highest standard so you never have to worry.'
  },
  {
    Icon: Zap,
    title: 'Speed & Simplicity',
    desc: 'From search to signed — we cut the friction. Find, connect, and close deals in days, not months.'
  },
  {
    Icon: Users,
    title: 'People-Centred',
    desc: 'Behind every property is a story. We build tools that serve real people — buyers, renters, owners, and agents alike.'
  },
  {
    Icon: Globe,
    title: 'Built for Nigeria',
    desc: 'We understand the Nigerian market deeply — the nuance, the scale, the opportunity. Our platform is designed for it.'
  }
]

export default function AboutPage () {
  return (
    <div className='pn-about'>
      {/* Hero */}
      <section className='pn-about__hero'>
        <div className='pn-about__hero-grid' />
        <div className='pn-about__hero-content'>
          <span className='pn-about__badge'>Our Story</span>
          <h1>
            The smarter way to find<br />
            <span>property in Nigeria</span>
          </h1>
          <p>
            Propnekt was built to solve a real problem: finding verified, trustworthy
            property in Nigeria was too hard, too slow, and too risky. We changed that.
          </p>
        </div>
      </section>

      {/* Stats strip */}
      <div className='pn-about__stats'>
        {STATS.map(s => (
          <div key={s.label} className='pn-about__stat'>
            <strong>{s.value}</strong>
            <span>{s.label}</span>
          </div>
        ))}
      </div>

      {/* Mission */}
      <section className='pn-about__mission'>
        <div className='pn-about__mission-inner'>
          <div className='pn-about__mission-text'>
            <span className='pn-about__badge'>Mission</span>
            <h2>Making property ownership accessible to every Nigerian</h2>
            <p>
              Nigeria's real estate market is one of the most dynamic in Africa — and one of the most
              opaque. We're on a mission to change that. Propnekt brings verified listings, secure
              payments, and real-time communication to buyers, renters, and property owners across the country.
            </p>
            <p>
              Whether you're a first-time renter in Lagos or an investor closing your fifth deal in Abuja,
              Propnekt gives you the clarity and confidence to move fast.
            </p>
            <ul className='pn-about__mission-list'>
              <li><CheckCircle2 size={16} /> Verified listings — no ghost properties</li>
              <li><CheckCircle2 size={16} /> Escrow payments — funds release on satisfaction</li>
              <li><CheckCircle2 size={16} /> Real-time messaging — connect directly with owners</li>
              <li><CheckCircle2 size={16} /> Smart search — filter by location, price, type &amp; more</li>
            </ul>
          </div>
          <div className='pn-about__mission-visual'>
            <div className='pn-about__mission-card'>
              <Building2 size={32} />
              <h3>10,000+</h3>
              <p>Active verified listings across Nigeria's top cities</p>
            </div>
            <div className='pn-about__mission-card'>
              <Lock size={32} />
              <h3>₦0 lost</h3>
              <p>Escrow protection on every transaction since launch</p>
            </div>
            <div className='pn-about__mission-card'>
              <Star size={32} />
              <h3>4.9 / 5</h3>
              <p>Average user satisfaction rating from verified reviews</p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className='pn-about__values'>
        <div className='pn-about__values-inner'>
          <span className='pn-about__badge'>What We Stand For</span>
          <h2>Our core values</h2>
          <div className='pn-about__values-grid'>
            {VALUES.map(v => (
              <div key={v.title} className='pn-about__value-card'>
                <div className='pn-about__value-icon'>
                  <v.Icon size={24} />
                </div>
                <h3>{v.title}</h3>
                <p>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className='pn-about__cta'>
        <div className='pn-about__cta-inner'>
          <h2>Ready to find your next property?</h2>
          <p>Join 50,000+ users who trust Propnekt every day.</p>
          <div className='pn-about__cta-btns'>
            <a href='/auth/register' className='pn-about__btn-lime'>Get Started Free →</a>
            <a href='/search' className='pn-about__btn-ghost'>Browse Listings</a>
          </div>
        </div>
      </section>
    </div>
  )
}
