'use client'

import { useState } from 'react'
import './Hub.scss'
import MyHome from '@/component/tenant/Home/Home'
import MyLease from '@/component/tenant/MyLease/MyLease'
import MyApplications from '@/component/tenant/MyApplications/MyApplications'

const TABS = [
  { key: 'home',         label: 'My Home',       icon: '🏠' },
  { key: 'lease',        label: 'My Lease',       icon: '📜' },
  { key: 'applications', label: 'Applications',   icon: '📋' }
]

export default function PropertyHub ({ onRouteChange }) {
  const [active, setActive] = useState('home')

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
        {active === 'home'         && <MyHome />}
        {active === 'lease'        && <MyLease />}
        {active === 'applications' && <MyApplications onRouteChange={onRouteChange} />}
      </div>
    </div>
  )
}
