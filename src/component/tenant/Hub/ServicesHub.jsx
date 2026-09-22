'use client'

import { useState } from 'react'
import './Hub.scss'
import FindArtisan from '@/component/tenant/FindArtisan/FindArtisan'
import TenantMaintenance from '@/component/tenant/Maintenance/Maintenance'

const WrenchIcon = () => (
  <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
    <path d='M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z'/>
  </svg>
)

const TABS = [
  { key: 'artisan',      label: 'Find Artisan',  icon: <WrenchIcon /> },
  { key: 'maintenance',  label: 'Maintenance',   icon: <WrenchIcon /> },
]

export default function ServicesHub () {
  const [active, setActive] = useState('artisan')

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
        {active === 'artisan'     && <FindArtisan />}
        {active === 'maintenance' && <TenantMaintenance />}
      </div>
    </div>
  )
}
