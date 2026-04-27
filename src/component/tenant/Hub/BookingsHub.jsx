'use client'

import { useState } from 'react'
import './Hub.scss'
import MyBookings from '@/component/admin/Tenant/MyBookings'
import BookingCart from '@/component/admin/Tenant/BookingCart'

const TABS = [
  { key: 'active', label: 'My Bookings', icon: '📅' },
  { key: 'saved',  label: 'Saved',       icon: '🛒' },
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
