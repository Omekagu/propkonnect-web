'use client'

import { useState } from 'react'
import './Hub.scss'
import MyBookings from '@/component/admin/Tenant/MyBookings'
import BookingCart from '@/component/admin/Tenant/BookingCart'

const CalendarIcon = () => (
  <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
    <rect x='3' y='4' width='18' height='18' rx='2' ry='2'/><line x1='16' y1='2' x2='16' y2='6'/><line x1='8' y1='2' x2='8' y2='6'/><line x1='3' y1='10' x2='21' y2='10'/>
  </svg>
)
const CartIcon = () => (
  <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
    <circle cx='9' cy='21' r='1'/><circle cx='20' cy='21' r='1'/><path d='M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6'/>
  </svg>
)

const TABS = [
  { key: 'active', label: 'My Bookings', icon: <CalendarIcon /> },
  { key: 'saved',  label: 'Saved',       icon: <CartIcon /> },
]

export default function BookingsHub () {
  const [active, setActive] = useState('active')

  return (
    <div className='hub'>
      <div className='hub-tabs'>
        {TABS.map(t => (
          <button
            key={t.key}
            className={`hub-tab${active === t.key ? ' active' : ''}`}
            onClick={() => setActive(t.key)}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      <div className='hub-panel'>
        {active === 'active' && <MyBookings />}
        {active === 'saved'  && <BookingCart />}
      </div>
    </div>
  )
}
