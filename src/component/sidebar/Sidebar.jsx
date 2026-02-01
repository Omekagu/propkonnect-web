'use client'
import React, { useState } from 'react'
import './admin.scss'
import {
  ChevronsRightLeft,
  ClipboardMinus,
  Cog,
  Drill,
  HeartHandshake,
  HousePlus,
  LayoutDashboard,
  MessageSquareWarning,
  ShieldAlertIcon,
  Users,
  WalletMinimal
} from 'lucide-react'

export default function Sidebar ({
  collapsed = false,
  mobileOpen = false,
  onCloseMobile = () => {},
  onToggleCollapse = () => {},
  onRouteChange = () => {} // new callback to parent
}) {
  const [activeKey, setActiveKey] = useState('dashboard')

  const nav = [
    {
      key: 'AdminDashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard strokeWidth={0.75} />
    },
    {
      key: 'PropertyManagement',
      label: 'Property',
      icon: <HousePlus strokeWidth={0.75} />
    },
    {
      key: 'PropertyUpload',
      label: 'Property ',
      icon: <HousePlus strokeWidth={0.75} />
    },
    {
      key: 'Artisan Management',
      label: 'Apply Artisan',
      icon: <HousePlus strokeWidth={0.75} />
    },
    { key: 'Tenant', label: 'Tenants', icon: <Users strokeWidth={0.75} /> },
    {
      key: 'Finance',
      label: 'Finances',
      icon: <WalletMinimal strokeWidth={0.75} />
    },
    {
      key: 'PaymentMethod',
      label: 'Payment Method',
      icon: <WalletMinimal strokeWidth={0.75} />
    },
    {
      key: 'Document',
      label: 'Documents',
      icon: <ClipboardMinus strokeWidth={0.75} />
    },
    {
      key: 'Report',
      label: 'Reports',
      icon: <MessageSquareWarning strokeWidth={0.75} />
    },
    {
      key: 'Maintenance',
      label: 'Maintenance',
      icon: <Drill strokeWidth={0.75} />
    },
    {
      key: 'UserManagement',
      label: 'User Management',
      icon: <Users strokeWidth={0.75} />
    }
  ]

  const account = [
    { key: 'Settings', label: 'Settings', icon: <Cog strokeWidth={0.75} /> },
    {
      key: 'Help',
      label: 'Help & Support',
      icon: <HeartHandshake strokeWidth={0.75} />
    },
    {
      key: 'Security',
      label: 'Backup & Security',
      icon: <ShieldAlertIcon strokeWidth={0.75} />
    }
  ]

  const handleClick = key => {
    setActiveKey(key)
    onRouteChange(key)
    if (mobileOpen) onCloseMobile()
  }

  // get label for brand subtext
  const activeLabel =
    [...nav, ...account].find(item => item.key === activeKey)?.label || ''

  return (
    <nav
      className={[
        'admin-sidebar',
        collapsed ? 'collapsed' : '',
        mobileOpen ? 'mobile-open' : ''
      ].join(' ')}
      aria-label='Main sidebar'
    >
      <div className='sidebar-inner'>
        {/* === Brand Section === */}
        <div className='sidebar-top'>
          <div className='brand' title='Property Management'>
            <div className='brand-logo' aria-hidden='true'>
              <HousePlus strokeWidth={0.75} />
            </div>
            {!collapsed && (
              <div className='brand-text'>
                <strong>PROPKONNECT</strong>
                {/* <span>Homes&Properties</span> */}
                {activeLabel && (
                  <small className='active-tag'>/ {activeLabel}</small>
                )}
              </div>
            )}
          </div>

          <button
            className='collapse-btn'
            onClick={onToggleCollapse}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={collapsed ? 'Expand' : 'Collapse'}
          >
            <ChevronsRightLeft strokeWidth={0.75} />
          </button>
        </div>

        {/* === Menu Section === */}
        <div className='sidebar-section'>
          <div className='section-title'>{!collapsed && 'MENU'}</div>
          <ul className='nav-list'>
            {nav.map(item => (
              <li
                key={item.key}
                className={[
                  'nav-item',
                  activeKey === item.key ? 'active' : ''
                ].join(' ')}
              >
                <p
                  className='nav-link'
                  onClick={() => handleClick(item.key)}
                  title={collapsed ? item.label : undefined}
                >
                  <span className='icon'>{item.icon}</span>
                  {!collapsed && <span className='label'>{item.label}</span>}
                </p>
              </li>
            ))}
          </ul>
        </div>

        {/* === Account Section === */}
        <div className='sidebar-section account'>
          <div className='section-title'>{!collapsed && 'ACCOUNT'}</div>
          <ul className='nav-list'>
            {account.map(item => (
              <li
                key={item.key}
                className={[
                  'nav-item',
                  activeKey === item.key ? 'active' : ''
                ].join(' ')}
              >
                <p
                  className='nav-link'
                  onClick={() => handleClick(item.key)}
                  title={collapsed ? item.label : undefined}
                >
                  <span className='icon'>{item.icon}</span>
                  {!collapsed && <span className='label'>{item.label}</span>}
                </p>
              </li>
            ))}
          </ul>
        </div>

        {/* === Footer === */}
        <div className='sidebar-footer'>
          <button className='help-btn' onClick={() => handleClick('help')}>
            <svg width='16' height='16' viewBox='0 0 24 24' fill='none'>
              <path
                d='M12 2a10 10 0 110 20 10 10 0 010-20z'
                stroke='currentColor'
                strokeWidth='1.2'
              />
            </svg>
            {!collapsed && <span>Help & Support</span>}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <button
          className='mobile-backdrop'
          aria-hidden='true'
          onClick={onCloseMobile}
        />
      )}
    </nav>
  )
}
