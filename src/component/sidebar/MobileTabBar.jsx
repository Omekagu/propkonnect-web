'use client'
import React, { useState } from 'react'
import {
  LayoutDashboard,
  HousePlus,
  Users,
  WalletMinimal,
  Briefcase,
  Home,
  MessageSquareWarning,
  MessageSquare,
  DollarSign,
  CheckSquare,
  Receipt,
  BarChart3,
  Wrench,
  Cog,
  MoreHorizontal,
  X,
  ChevronRight,
  HeartHandshake,
  ClipboardMinus,
  Calendar,
  Star,
  Award,
  Shield,
  Building2,
  FileText,
  Search
} from 'lucide-react'
import './mobile-tab-bar.scss'

// Role → [up to 4 primary tabs] + always a "More" 5th slot
const ROLE_TABS = {
  SUPER_ADMIN: [
    { key: 'Dashboard', label: 'Home', Icon: LayoutDashboard },
    { key: 'PropertyManagement', label: 'Properties', Icon: HousePlus },
    { key: 'UserManagement', label: 'Users', Icon: Users },
    { key: 'Finance', label: 'Finance', Icon: WalletMinimal }
  ],
  SUB_ADMIN: [
    { key: 'Dashboard', label: 'Home', Icon: LayoutDashboard },
    { key: 'PropertyManagement', label: 'Properties', Icon: HousePlus },
    { key: 'UserManagement', label: 'Users', Icon: Users },
    { key: 'Finance', label: 'Finance', Icon: WalletMinimal }
  ],
  'property-admin': [
    { key: 'Dashboard', label: 'Home', Icon: LayoutDashboard },
    { key: 'PropertyManagement', label: 'Properties', Icon: HousePlus },
    { key: 'Tenants', label: 'Tenants', Icon: Users },
    { key: 'Finance', label: 'Finance', Icon: WalletMinimal }
  ],
  'artisan-admin': [
    { key: 'Dashboard', label: 'Home', Icon: LayoutDashboard },
    { key: 'ActiveJobs', label: 'Jobs', Icon: CheckSquare },
    { key: 'Payments', label: 'Payments', Icon: WalletMinimal },
    { key: 'Reports', label: 'Reports', Icon: BarChart3 }
  ],
  PROPERTY_OWNER: [
    { key: 'Dashboard', label: 'Home', Icon: LayoutDashboard },
    { key: 'MyProperties', label: 'Properties', Icon: HousePlus },
    { key: 'Tenants', label: 'Tenants', Icon: Users },
    { key: 'Payments', label: 'Payments', Icon: WalletMinimal }
  ],
  artisan: [
    { key: 'Dashboard', label: 'Home', Icon: LayoutDashboard },
    { key: 'AvailableJobs', label: 'Jobs', Icon: Briefcase },
    { key: 'ActiveJobs', label: 'Active', Icon: CheckSquare },
    { key: 'Negotiations', label: 'Bids', Icon: MessageSquare }
  ],
  user: [
    { key: 'Dashboard', label: 'Home', Icon: LayoutDashboard },
    { key: 'MyHome', label: 'My Home', Icon: Home },
    { key: 'Payments', label: 'Payments', Icon: Receipt },
    { key: 'Messages', label: 'Messages', Icon: MessageSquareWarning }
  ],
  SUPPORT_ADMIN: [
    { key: 'Dashboard', label: 'Home', Icon: LayoutDashboard },
    { key: 'SupportTickets', label: 'Tickets', Icon: MessageSquareWarning },
    { key: 'Settings', label: 'Settings', Icon: Cog },
    { key: 'Help', label: 'Help', Icon: HeartHandshake }
  ]
}

// All nav items per role for the "More" sheet
const ALL_ROLE_NAV = {
  SUPER_ADMIN: [
    { key: 'ArtisanManagement', label: 'Artisans', Icon: Wrench },
    { key: 'Tenants', label: 'Tenants', Icon: Home },
    { key: 'Maintenance', label: 'Maintenance', Icon: Wrench },
    { key: 'Reports', label: 'Reports', Icon: BarChart3 },
    { key: 'Documents', label: 'Documents', Icon: ClipboardMinus },
    { key: 'SupportTickets', label: 'Support', Icon: MessageSquareWarning },
    { key: 'PlatformSettings', label: 'Platform Settings', Icon: Cog },
    { key: 'EmailTemplates', label: 'Email Templates', Icon: FileText },
    { key: 'AdminPermissions', label: 'Permissions', Icon: Shield },
    { key: 'Settings', label: 'My Settings', Icon: Cog },
    { key: 'Help', label: 'Help & Support', Icon: HeartHandshake }
  ],
  PROPERTY_OWNER: [
    { key: 'Maintenance', label: 'Maintenance', Icon: Wrench },
    { key: 'Documents', label: 'Documents', Icon: ClipboardMinus },
    { key: 'Reports', label: 'Reports', Icon: BarChart3 },
    { key: 'FindArtisan', label: 'Find Artisan', Icon: Search },
    { key: 'Settings', label: 'Settings', Icon: Cog },
    { key: 'Help', label: 'Help', Icon: HeartHandshake }
  ],
  artisan: [
    { key: 'Earnings', label: 'Earnings', Icon: DollarSign },
    { key: 'JobHistory', label: 'Job History', Icon: ClipboardMinus },
    { key: 'Schedule', label: 'Schedule', Icon: Calendar },
    { key: 'Portfolio', label: 'Portfolio', Icon: Star },
    { key: 'Certifications', label: 'Certifications', Icon: Award },
    { key: 'KYCVerification', label: 'Identity Verification', Icon: Shield },
    { key: 'Profile', label: 'Profile', Icon: Users },
    { key: 'Settings', label: 'Settings', Icon: Cog },
    { key: 'Help', label: 'Help', Icon: HeartHandshake }
  ],
  user: [
    { key: 'Maintenance', label: 'Maintenance', Icon: Wrench },
    { key: 'Documents', label: 'Documents', Icon: ClipboardMinus },
    { key: 'History', label: 'History', Icon: Star },
    { key: 'Profile', label: 'Profile', Icon: Users },
    { key: 'Settings', label: 'Settings', Icon: Cog },
    { key: 'Help', label: 'Help', Icon: HeartHandshake }
  ]
}

export default function MobileTabBar ({
  userRole = 'user',
  activePage,
  onNavigate
}) {
  const [moreOpen, setMoreOpen] = useState(false)

  const tabs = ROLE_TABS[userRole] || ROLE_TABS.user
  const extras = ALL_ROLE_NAV[userRole] || []

  const go = key => {
    onNavigate(key)
    setMoreOpen(false)
  }

  return (
    <>
      {/* ── Bottom Tab Bar ─────────────────────────────────── */}
      <nav className='mob-tab-bar' aria-label='Mobile navigation'>
        {tabs.map(({ key, label, Icon }, i) => {
          const isCenter = i === Math.floor(tabs.length / 2)
          const isActive = activePage === key
          return (
            <button
              key={key}
              className={[
                'mob-tab',
                isActive ? 'mob-tab--active' : '',
                isCenter ? 'mob-tab--center' : ''
              ]
                .filter(Boolean)
                .join(' ')}
              onClick={() => go(key)}
              aria-label={label}
            >
              <span className='mob-tab__icon'>
                <Icon strokeWidth={isActive ? 2 : 1.5} size={22} />
              </span>
              <span className='mob-tab__label'>{label}</span>
              {isActive && !isCenter && <span className='mob-tab__dot' />}
            </button>
          )
        })}

        {/* More button */}
        <button
          className={`mob-tab${moreOpen ? ' mob-tab--active' : ''}`}
          onClick={() => setMoreOpen(o => !o)}
          aria-label='More'
          aria-expanded={moreOpen}
        >
          <span className='mob-tab__icon'>
            {moreOpen ? (
              <X strokeWidth={1.5} size={22} />
            ) : (
              <MoreHorizontal strokeWidth={1.5} size={22} />
            )}
          </span>
          <span className='mob-tab__label'>More</span>
        </button>
      </nav>

      {/* ── More Sheet ─────────────────────────────────────── */}
      {moreOpen && (
        <>
          <div
            className='mob-more-backdrop'
            onClick={() => setMoreOpen(false)}
          />
          <div
            className='mob-more-sheet'
            role='dialog'
            aria-label='More navigation'
          >
            <div className='mob-more-handle' />
            <p className='mob-more-heading'>More</p>
            <ul className='mob-more-list'>
              {extras.map(({ key, label, Icon }) => (
                <li key={key}>
                  <button
                    className={`mob-more-item${
                      activePage === key ? ' mob-more-item--active' : ''
                    }`}
                    onClick={() => go(key)}
                  >
                    <span className='mob-more-item__icon'>
                      <Icon strokeWidth={1.5} size={20} />
                    </span>
                    <span className='mob-more-item__label'>{label}</span>
                    <ChevronRight
                      strokeWidth={1.5}
                      size={16}
                      className='mob-more-item__chevron'
                    />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </>
  )
}
