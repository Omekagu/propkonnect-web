'use client'

import { useState } from 'react'
import './Hub.scss'
// PHASE 3+ — FindArtisan import. Restore when artisan marketplace launches.
// import FindArtisan from '@/component/tenant/FindArtisan/FindArtisan'
import TenantMaintenance from '@/component/tenant/Maintenance/Maintenance'

// PHASE 3+ — artisan tab. Restore when artisan marketplace launches.
// const WrenchIcon = () => (
//   <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
//     <path d='M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z'/>
//   </svg>
// )

const TABS = [
  // PHASE 3+ — { key: 'artisan', label: 'Find Artisan', icon: <WrenchIcon /> },
  { key: 'maintenance', label: 'Maintenance' },
]

export default function ServicesHub () {
  const [active, setActive] = useState('maintenance')

  return (
    <div className='hub'>
      <div className='hub-tabs'>
        {TABS.map(t => (
          <button
            key={t.key}
            className={`hub-tab${active === t.key ? ' active' : ''}`}
            onClick={() => setActive(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className='hub-panel'>
        {/* PHASE 3+ — {active === 'artisan' && <FindArtisan />} */}
        {active === 'maintenance' && <TenantMaintenance />}
      </div>
    </div>
  )
}
