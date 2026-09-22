'use client'

import { useState } from 'react'
import './Hub.scss'
import MyHome from '@/component/tenant/Home/Home'
import MyLease from '@/component/tenant/MyLease/MyLease'
import MyApplications from '@/component/tenant/MyApplications/MyApplications'

const HomeIcon = () => (
  <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
    <path d='M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z'/><polyline points='9 22 9 12 15 12 15 22'/>
  </svg>
)
const FileTextIcon = () => (
  <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
    <path d='M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z'/><polyline points='14 2 14 8 20 8'/><line x1='16' y1='13' x2='8' y2='13'/><line x1='16' y1='17' x2='8' y2='17'/><polyline points='10 9 9 9 8 9'/>
  </svg>
)
const ClipboardIcon = () => (
  <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
    <rect x='8' y='2' width='8' height='4' rx='1'/><path d='M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2'/>
  </svg>
)

const TABS = [
  { key: 'home',         label: 'My Home',       icon: <HomeIcon /> },
  { key: 'lease',        label: 'My Lease',       icon: <FileTextIcon /> },
  { key: 'applications', label: 'Applications',   icon: <ClipboardIcon /> }
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
