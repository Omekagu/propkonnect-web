'use client'

import { useState } from 'react'
import './Hub.scss'
import FindArtisan from '@/component/tenant/FindArtisan/FindArtisan'
import TenantMaintenance from '@/component/tenant/Maintenance/Maintenance'

const TABS = [
  { key: 'artisan',      label: 'Find Artisan',  icon: '🔧' },
  { key: 'maintenance',  label: 'Maintenance',   icon: '🛠' },
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
