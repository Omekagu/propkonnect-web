'use client'
import React, { useState, useMemo, useEffect } from 'react'
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
  MessageSquare,
  Users,
  WalletMinimal,
  Briefcase,
  Calendar,
  FileText,
  Star,
  DollarSign,
  CheckSquare,
  UserCircle,
  Home,
  Receipt,
  Building2,
  Shield,
  BarChart3,
  Wrench,
  ClipboardList,
  Award,
  Search,
  ScanFace,
  ShoppingCart,
  KeyRound,
  Coins,
  Zap,
  Crown,
  Clock,
  AlertTriangle,
  Gift
} from 'lucide-react'

export default function Sidebar ({
  collapsed = false,
  mobileOpen = false,
  onCloseMobile = () => {},
  onToggleCollapse = () => {},
  onRouteChange = () => {},
  userRole = '',
  user = null, // passed from layout — no internal fetch needed
  livePlan = null // live plan data from server (overrides stale localStorage user.plan)
}) {
  const [activeKey, setActiveKey] = useState('Dashboard')

  // Restore active page on mount
  useEffect(() => {
    const saved = localStorage.getItem('ep_activePage')
    if (saved) setActiveKey(saved)
  }, [])

  // Define navigation items for each role
  const roleBasedNavigation = useMemo(() => {
    const navigationMap = {
      // Super Admin - Full platform management
      SUPER_ADMIN: {
        brand: `${process.env.NEXT_PUBLIC_APP_NAME} ADMIN`,
        nav: [
          {
            key: 'Dashboard',
            label: 'Dashboard',
            icon: <LayoutDashboard strokeWidth={0.75} />
          },
          {
            key: 'UserManagement',
            label: 'Users & Roles',
            icon: <Users strokeWidth={0.75} />
          },
          {
            key: 'PropertyManagement',
            label: 'Properties',
            icon: <HousePlus strokeWidth={0.75} />
          },
          {
            key: 'PropertySales',
            label: 'Properties Bought',
            icon: <ShoppingCart strokeWidth={0.75} />
          },
          {
            key: 'RentManagement',
            label: 'Rents',
            icon: <Receipt strokeWidth={0.75} />
          },
          {
            key: 'Tenants',
            label: 'Tenants',
            icon: <Home strokeWidth={0.75} />
          },
          {
            key: 'Bookings',
            label: 'Bookings & Reservations',
            icon: <Calendar strokeWidth={0.75} />
          },
          {
            key: 'Finance',
            label: 'Finance',
            icon: <WalletMinimal strokeWidth={0.75} />
          },
          // // {
          // //   key: 'Maintenance',
          // //   label: 'Maintenance',
          // //   icon: <Drill strokeWidth={0.75} />
          // // },
          {
            key: 'Reports',
            label: 'Reports & Analytics',
            icon: <BarChart3 strokeWidth={0.75} />
          },
          {
            key: 'Documents',
            label: 'Documents',
            icon: <ClipboardMinus strokeWidth={0.75} />
          },
          {
            key: 'EmailTemplates',
            label: 'Email Templates',
            icon: <ClipboardMinus strokeWidth={0.75} />
          },
          {
            key: 'AdminPermissions',
            label: 'Permissions & RBAC',
            icon: <Shield strokeWidth={0.75} />
          },
          {
            key: 'LicenseKeys',
            label: 'License Keys',
            icon: <KeyRound strokeWidth={0.75} />
          },
          {
            key: 'KYCQueue',
            label: 'KYC Approval Queue',
            icon: <ScanFace strokeWidth={0.75} />
          },
          {
            key: 'Comments',
            label: 'Comments & Reviews',
            icon: <MessageSquareWarning strokeWidth={0.75} />
          }
        ],
        account: [
          {
            key: 'Settings',
            label: 'My Settings',
            icon: <Cog strokeWidth={0.75} />
          },
          {
            key: 'Help',
            label: 'Help & Support',
            icon: <HeartHandshake strokeWidth={0.75} />
          }
        ]
      },

      // Property Owner
      PROPERTY_OWNER: {
        brand: `${process.env.NEXT_PUBLIC_APP_NAME} OWNER`,
        nav: [
          {
            key: 'Dashboard',
            label: 'Dashboard',
            icon: <LayoutDashboard strokeWidth={0.75} />
          },
          {
            key: 'KYCVerification',
            label: 'Identity Verification',
            icon: <ScanFace strokeWidth={0.75} />
          },
          {
            key: 'MyProperties',
            label: 'My Properties',
            icon: <HousePlus strokeWidth={0.75} />
          },
          {
            key: 'Tenants',
            label: 'Tenants',
            icon: <Users strokeWidth={0.75} />
          },
          {
            key: 'Applicants',
            label: 'Applications',
            icon: <ClipboardList strokeWidth={0.75} />
          },
          {
            key: 'Bookings',
            label: 'Bookings',
            icon: <Calendar strokeWidth={0.75} />
          },
          // {
          //   key: 'Maintenance',
          //   label: 'Maintenance',
          //   icon: <Drill strokeWidth={0.75} />
          // },
          {
            key: 'Payments',
            label: 'Payments',
            icon: <WalletMinimal strokeWidth={0.75} />
          },
          {
            key: 'Documents',
            label: 'Documents',
            icon: <ClipboardMinus strokeWidth={0.75} />
          },
          {
            key: 'Messages',
            label: 'Messages',
            icon: <MessageSquare strokeWidth={0.75} />
          },
          // PHASE 3+ — artisan marketplace. Uncomment when artisan features launch.
          // {
          //   key: 'FindArtisan',
          //   label: 'Find Artisans',
          //   icon: <Wrench strokeWidth={0.75} />
          // },
          {
            key: 'OwnerComments',
            label: 'Reviews & Comments',
            icon: <MessageSquareWarning strokeWidth={0.75} />
          }
        ],
        account: [
          {
            key: 'Profile',
            label: 'Profile',
            icon: <UserCircle strokeWidth={0.75} />
          },
          {
            key: 'Settings',
            label: 'Settings',
            icon: <Cog strokeWidth={0.75} />
          },
          {
            key: 'SiteKeys',
            label: 'WordPress Site Keys',
            icon: <KeyRound strokeWidth={0.75} />
          },
          {
            key: 'Help',
            label: 'Help & Support',
            icon: <HeartHandshake strokeWidth={0.75} />
          }
        ]
      },

      // Property Admin
      'property-admin': {
        brand: `${process.env.NEXT_PUBLIC_APP_NAME} MANAGER`,
        nav: [
          {
            key: 'Dashboard',
            label: 'Dashboard',
            icon: <LayoutDashboard strokeWidth={0.75} />
          },
          {
            key: 'PropertyManagement',
            label: 'Properties',
            icon: <HousePlus strokeWidth={0.75} />
          },
          {
            key: 'PropertyOwners',
            label: 'Property Owners',
            icon: <Building2 strokeWidth={0.75} />
          },
          {
            key: 'Tenants',
            label: 'Tenants',
            icon: <Users strokeWidth={0.75} />
          },
          {
            key: 'KYCQueue',
            label: 'KYC Verification',
            icon: <ScanFace strokeWidth={0.75} />
          },
          // {
          //   key: 'Maintenance',
          //   label: 'Maintenance',
          //   icon: <Drill strokeWidth={0.75} />
          // },
          {
            key: 'Finance',
            label: 'Finances',
            icon: <WalletMinimal strokeWidth={0.75} />
          },
          {
            key: 'Documents',
            label: 'Documents',
            icon: <ClipboardMinus strokeWidth={0.75} />
          },
          {
            key: 'Reports',
            label: 'Reports',
            icon: <BarChart3 strokeWidth={0.75} />
          }
        ],
        account: [
          {
            key: 'Settings',
            label: 'Settings',
            icon: <Cog strokeWidth={0.75} />
          },
          {
            key: 'Help',
            label: 'Help & Support',
            icon: <HeartHandshake strokeWidth={0.75} />
          }
        ]
      },

      // PHASE 3+ — Artisan marketplace role. Uncomment when artisan features launch.
      // artisan: {
      //   brand: `${process.env.NEXT_PUBLIC_APP_NAME}`,
      //   nav: [
      //     { key: 'Dashboard',        label: 'Dashboard',             icon: <LayoutDashboard strokeWidth={0.75} /> },
      //     { key: 'KYCVerification',  label: 'Identity Verification', icon: <ScanFace strokeWidth={0.75} /> },
      //     { key: 'AvailableJobs',    label: 'Available Jobs',        icon: <Briefcase strokeWidth={0.75} /> },
      //     { key: 'ActiveJobs',       label: 'Active Jobs',           icon: <CheckSquare strokeWidth={0.75} /> },
      //     { key: 'Negotiations',     label: 'My Bids & Negotiations',icon: <MessageSquare strokeWidth={0.75} /> },
      //     { key: 'JobHistory',       label: 'Job History',           icon: <ClipboardList strokeWidth={0.75} /> },
      //     { key: 'Earnings',         label: 'Earnings',              icon: <DollarSign strokeWidth={0.75} /> },
      //     { key: 'Schedule',         label: 'Schedule',              icon: <Calendar strokeWidth={0.75} /> },
      //     { key: 'Portfolio',        label: 'Portfolio',             icon: <Star strokeWidth={0.75} /> },
      //     { key: 'Certifications',   label: 'Certifications',        icon: <Award strokeWidth={0.75} /> },
      //     { key: 'ArtisanReviews',   label: 'My Reviews',            icon: <Star strokeWidth={0.75} /> }
      //   ],
      //   account: [
      //     { key: 'Profile',  label: 'Profile',       icon: <UserCircle strokeWidth={0.75} /> },
      //     { key: 'Settings', label: 'Settings',      icon: <Cog strokeWidth={0.75} /> },
      //     { key: 'Help',     label: 'Help & Support', icon: <HeartHandshake strokeWidth={0.75} /> }
      //   ]
      // },

      // PHASE 3+ — Artisan admin role. Uncomment when artisan features launch.
      // 'artisan-admin': {
      //   brand: `${process.env.NEXT_PUBLIC_APP_NAME} ARTISAN ADMIN`,
      //   nav: [
      //     { key: 'Dashboard',     label: 'Dashboard',      icon: <LayoutDashboard strokeWidth={0.75} /> },
      //     { key: 'AllArtisans',   label: 'All Artisans',   icon: <Users strokeWidth={0.75} /> },
      //     { key: 'JobManagement', label: 'Job Management', icon: <Briefcase strokeWidth={0.75} /> },
      //     { key: 'ActiveJobs',    label: 'Active Jobs',    icon: <CheckSquare strokeWidth={0.75} /> },
      //     { key: 'Payments',      label: 'Payments',       icon: <DollarSign strokeWidth={0.75} /> },
      //     { key: 'History',       label: 'History',        icon: <Star strokeWidth={0.75} /> },
      //     { key: 'Reports',       label: 'Reports',        icon: <BarChart3 strokeWidth={0.75} /> }
      //   ],
      //   account: [
      //     { key: 'Settings', label: 'Settings', icon: <Cog strokeWidth={0.75} /> },
      //     { key: 'Help',     label: 'Help & Support', icon: <HeartHandshake strokeWidth={0.75} /> }
      //   ]
      // },

      // Tenant / User
      user: {
        brand: `${process.env.NEXT_PUBLIC_APP_NAME}`,
        nav: [
          // ── Overview ──────────────────────────────────────────────
          {
            key: 'Dashboard',
            label: 'Dashboard',
            icon: <LayoutDashboard strokeWidth={0.75} />,
            sectionTitle: 'Overview'
          },
          // ── My Activity ───────────────────────────────────────────
          {
            key: 'PropertyHub',
            label: 'Property & Lease',
            icon: <Home strokeWidth={0.75} />,
            sectionTitle: 'My Activity'
          },
          {
            key: 'BookingsHub',
            label: 'Bookings',
            icon: <Calendar strokeWidth={0.75} />
          },
          {
            key: 'Payments',
            label: 'Payments',
            icon: <Receipt strokeWidth={0.75} />
          },
          {
            key: 'Documents',
            label: 'Documents',
            icon: <FileText strokeWidth={0.75} />
          },
          // ── Services ──────────────────────────────────────────────
          // {
          //   key: 'ServicesHub',
          //   label: 'Maintenance',
          //   icon: <Wrench strokeWidth={0.75} />,
          //   sectionTitle: 'Services'
          // },
          {
            key: 'Messages',
            label: 'Messages',
            icon: <MessageSquare strokeWidth={0.75} />
          },
          // ── Verification ──────────────────────────────────────────
          {
            key: 'KYCVerification',
            label: 'Identity Verification',
            icon: <ScanFace strokeWidth={0.75} />,
            sectionTitle: 'Verification'
          }
        ],
        account: [
          {
            key: 'Settings',
            label: 'Profile & Settings',
            icon: <UserCircle strokeWidth={0.75} />
          },
          {
            key: 'Help',
            label: 'Help & Support',
            icon: <HeartHandshake strokeWidth={0.75} />
          }
        ]
      }
    }

    const roleToUse = user?.role || userRole
    const baseNav = navigationMap[roleToUse] || {
      brand: process.env.NEXT_PUBLIC_APP_NAME || 'propnekt',
      nav: [],
      account: []
    }

    // Adjust KYCVerification nav item label to reflect current status
    const kycStatus = user?.kyc?.status
    if (kycStatus) {
      const kycLabel =
        kycStatus === 'approved'
          ? 'Identity Verified'
          : kycStatus === 'pending'
          ? 'KYC Under Review…'
          : kycStatus === 'under_review'
          ? 'KYC Under Review…'
          : kycStatus === 'rejected'
          ? 'KYC Rejected — Resubmit'
          : 'Identity Verification'

      baseNav.nav = baseNav.nav.map(item =>
        item.key === 'KYCVerification' ? { ...item, label: kycLabel } : item
      )
    }

    return baseNav
  }, [user, userRole])

  const handleClick = key => {
    setActiveKey(key)
    localStorage.setItem('ep_activePage', key)
    onRouteChange(key)
    if (mobileOpen) onCloseMobile()
  }

  // Get label for brand subtext
  const activeLabel =
    [...roleBasedNavigation.nav, ...roleBasedNavigation.account].find(
      item => item.key === activeKey
    )?.label || ''

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
          <div
            className='brand'
            title={collapsed ? 'Expand sidebar' : roleBasedNavigation.brand}
            onClick={collapsed ? onToggleCollapse : undefined}
            style={collapsed ? { cursor: 'pointer' } : undefined}
          >
            <div className='brand-logo' aria-hidden='true'>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src='/Propnekt_logo.png' alt='Propnekt' className='brand-logo-img' />
            </div>
            {!collapsed && (
              <div className='brand-text'>
                <strong>{roleBasedNavigation.brand}</strong>
                {activeLabel && (
                  <small className='active-tag'> {activeLabel}</small>
                )}
              </div>
            )}
          </div>

          {!collapsed && (
            <button
              className='collapse-btn'
              onClick={onToggleCollapse}
              aria-label='Collapse sidebar'
              title='Collapse'
            >
              <ChevronsRightLeft strokeWidth={0.75} />
            </button>
          )}
        </div>

        {/* === Menu Section === */}
        <div className='sidebar-section'>
          {!collapsed && <div className='section-title'>MENU</div>}
          <ul className='nav-list'>
            {roleBasedNavigation.nav.map(item => (
              <li key={item.key}>
                {item.sectionTitle && !collapsed && (
                  <div className='nav-section-divider'>{item.sectionTitle}</div>
                )}
                <div
                  className={[
                    'nav-item',
                    activeKey === item.key ? 'active' : ''
                  ].join(' ')}
                >
                  <p className='nav-link' onClick={() => handleClick(item.key)}>
                    <span className='icon'>{item.icon}</span>
                    {!collapsed && <span className='label'>{item.label}</span>}
                    <span className='nav-tooltip'>{item.label}</span>
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* === Account Section === */}
        <div className='sidebar-section account'>
          <div className='section-title'>{!collapsed && 'ACCOUNT'}</div>
          <ul className='nav-list'>
            {roleBasedNavigation.account.map(item => (
              <li
                key={item.key}
                className={[
                  'nav-item',
                  activeKey === item.key ? 'active' : ''
                ].join(' ')}
              >
                <p className='nav-link' onClick={() => handleClick(item.key)}>
                  <span className='icon'>{item.icon}</span>
                  {!collapsed && <span className='label'>{item.label}</span>}
                  <span className='nav-tooltip'>{item.label}</span>
                </p>
              </li>
            ))}
          </ul>
        </div>

        {/* === Social Links === */}
        <div className='sidebar-social'>
          <a
            href='https://t.me/'
            target='_blank'
            rel='noopener noreferrer'
            className='social-btn'
            title='Telegram'
          >
            <svg viewBox='0 0 24 24' fill='currentColor'>
              <path d='M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z' />
            </svg>
          </a>
          <a
            href='https://twitter.com/'
            target='_blank'
            rel='noopener noreferrer'
            className='social-btn'
            title='Twitter / X'
          >
            <svg viewBox='0 0 24 24' fill='currentColor'>
              <path d='M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.261 5.632 5.903-5.632Zm-1.161 17.52h1.833L7.084 4.126H5.117z' />
            </svg>
          </a>
          <a
            href='https://discord.com/'
            target='_blank'
            rel='noopener noreferrer'
            className='social-btn'
            title='Discord'
          >
            <svg viewBox='0 0 24 24' fill='currentColor'>
              <path d='M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z' />
            </svg>
          </a>
          <a
            href='https://reddit.com/'
            target='_blank'
            rel='noopener noreferrer'
            className='social-btn'
            title='Reddit'
          >
            <svg viewBox='0 0 24 24' fill='currentColor'>
              <path d='M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z' />
            </svg>
          </a>
        </div>

        {/* === Footer === */}
        <div className='sidebar-footer'>
          {/* ── Plan widget — hidden for super-admins ──────────────── */}
          {(() => {
            const ADMIN_ROLES = [
              'SUPER_ADMIN',
              'SUB_ADMIN',
              'SUPPORT_ADMIN',
              'property-admin'
              // 'artisan-admin' // PHASE 3+ — re-add when artisan role is active
            ]
            if (ADMIN_ROLES.includes(userRole)) return null

            const plan = livePlan || user?.plan
            if (!plan) return null

            const tier = (plan.tier || 'free').toLowerCase()

            // ── Trial data ───────────────────────────────────────────
            const onTrial = plan.isOnTrial && plan.trialEndsAt
            const msLeft = onTrial ? new Date(plan.trialEndsAt) - new Date() : 0
            const daysLeft = onTrial
              ? Math.ceil(msLeft / (1000 * 60 * 60 * 24))
              : 0
            const trialLive = onTrial && daysLeft >= 0

            const isUrgent = trialLive && daysLeft <= 3
            const isWarning = trialLive && daysLeft <= 7

            // ── Tier visuals ─────────────────────────────────────────
            const tierMeta = {
              free: {
                label: 'Free',
                color: '#64748b',
                bg: 'rgba(100,116,139,0.1)',
                border: 'rgba(100,116,139,0.25)',
                icon: <Coins size={14} />
              },
              basic: {
                label: 'Basic',
                color: '#4ade80',
                bg: 'rgba(74,222,128,0.08)',
                border: 'rgba(74,222,128,0.2)',
                icon: <Star size={14} />
              },
              pro: {
                label: 'Pro',
                color: '#a78bfa',
                bg: 'rgba(167,139,250,0.08)',
                border: 'rgba(167,139,250,0.2)',
                icon: <Zap size={14} />
              },
              enterprise: {
                label: 'Enterprise',
                color: '#fbbf24',
                bg: 'rgba(251,191,36,0.08)',
                border: 'rgba(251,191,36,0.2)',
                icon: <Crown size={14} />
              }
            }
            const meta = tierMeta[tier] || tierMeta.free

            // If trial is urgent/warning override colors
            const cardColor = isUrgent
              ? '#dc2626'
              : isWarning
              ? '#b45309'
              : meta.color
            const cardBg = isUrgent
              ? '#fff5f5'
              : isWarning
              ? '#fffbe6'
              : meta.bg
            const cardBorder = isUrgent
              ? '#fca5a5'
              : isWarning
              ? '#fcd34d'
              : meta.border

            const showUpgrade = tier !== 'enterprise'

            // Accent colors for badge/highlights that read well on dark bg
            const accentColor = isUrgent
              ? '#f87171'
              : isWarning
              ? '#fbbf24'
              : tier === 'pro'
              ? '#a78bfa'
              : tier === 'enterprise'
              ? '#fbbf24'
              : tier === 'basic'
              ? '#4ade80'
              : '#94a3b8' // free

            // ── Trial progress bar ───────────────────────────────────
            let pct = 100
            if (trialLive) {
              const totalMs = plan.trialStartedAt
                ? new Date(plan.trialEndsAt) - new Date(plan.trialStartedAt)
                : 30 * 24 * 60 * 60 * 1000
              const totalDays = Math.max(
                1,
                Math.ceil(totalMs / (1000 * 60 * 60 * 24))
              )
              pct = Math.max(0, Math.min(100, (daysLeft / totalDays) * 100))
            }

            // ── Collapsed mode ───────────────────────────────────────
            if (collapsed) {
              const tip = trialLive
                ? `${meta.label}${onTrial ? ` · Trial: ${daysLeft}d left` : ''}`
                : `${meta.label} Plan`
              return (
                <div
                  title={tip}
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    padding: '8px 0',
                    cursor: showUpgrade ? 'pointer' : 'default',
                    color: accentColor
                  }}
                  onClick={
                    showUpgrade ? () => handleClick('Settings') : undefined
                  }
                >
                  {isUrgent ? (
                    <Clock size={18} />
                  ) : isWarning ? (
                    <AlertTriangle size={18} />
                  ) : (
                    meta.icon
                  )}
                </div>
              )
            }

            // ── Expanded mode ────────────────────────────────────────
            return (
              <div
                style={{
                  margin: '6px 10px 10px',
                  background: `linear-gradient(135deg, ${accentColor}14 0%, rgba(255,255,255,0.04) 100%)`,
                  borderRadius: 12,
                  padding: '11px 13px',
                  border: `1px solid ${accentColor}30`
                }}
              >
                {/* Plan badge + name */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 8
                  }}
                >
                  <div
                    style={{ display: 'flex', alignItems: 'center', gap: 7 }}
                  >
                    <div
                      style={{
                        width: 26,
                        height: 26,
                        borderRadius: 7,
                        background: `${accentColor}22`,
                        border: `1px solid ${accentColor}44`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: accentColor,
                        flexShrink: 0
                      }}
                    >
                      {meta.icon}
                    </div>
                    <div>
                      <div
                        style={{
                          fontSize: 12,
                          fontWeight: 700,
                          color: '#f1f5f9',
                          lineHeight: 1.2
                        }}
                      >
                        {meta.label} Plan
                      </div>
                      {trialLive && (
                        <div
                          style={{
                            fontSize: 10,
                            color: accentColor,
                            fontWeight: 600,
                            marginTop: 1
                          }}
                        >
                          {isUrgent ? '⚠ ' : ''}
                          {daysLeft === 0
                            ? 'Expires today'
                            : `${daysLeft}d trial left`}
                        </div>
                      )}
                    </div>
                  </div>
                  {trialLive && (
                    <span
                      style={{
                        fontSize: 9,
                        fontWeight: 700,
                        color: accentColor,
                        background: `${accentColor}1a`,
                        border: `1px solid ${accentColor}33`,
                        borderRadius: 99,
                        padding: '2px 7px',
                        whiteSpace: 'nowrap',
                        letterSpacing: '0.05em'
                      }}
                    >
                      TRIAL
                    </span>
                  )}
                </div>

                {/* Trial progress bar */}
                {trialLive && (
                  <div
                    style={{
                      height: 3,
                      background: 'rgba(255,255,255,0.1)',
                      borderRadius: 99,
                      overflow: 'hidden',
                      marginBottom: 8
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: `${pct}%`,
                        background: accentColor,
                        borderRadius: 99,
                        transition: 'width .4s'
                      }}
                    />
                  </div>
                )}

                {/* Plan limits */}
                {(plan.listingLimit != null ||
                  plan.aiCredits != null ||
                  plan.mediaPerListing != null) && (
                  <div
                    style={{
                      display: 'flex',
                      gap: 5,
                      marginBottom: showUpgrade ? 9 : 0
                    }}
                  >
                    {plan.listingLimit != null && (
                      <div style={{ flex: 1, textAlign: 'center' }}>
                        <div
                          style={{
                            fontSize: 14,
                            fontWeight: 800,
                            color: '#f1f5f9',
                            lineHeight: 1
                          }}
                        >
                          {plan.listingLimit}
                        </div>
                        <div
                          style={{
                            fontSize: 9,
                            color: 'rgba(255,255,255,0.4)',
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            letterSpacing: '0.04em',
                            marginTop: 2
                          }}
                        >
                          Listings
                        </div>
                      </div>
                    )}
                    {plan.listingLimit != null &&
                      (plan.aiCredits != null ||
                        plan.mediaPerListing != null) && (
                        <div
                          style={{
                            width: 1,
                            background: 'rgba(255,255,255,0.08)',
                            alignSelf: 'stretch',
                            margin: '2px 0'
                          }}
                        />
                      )}
                    {plan.aiCredits != null && (
                      <div style={{ flex: 1, textAlign: 'center' }}>
                        <div
                          style={{
                            fontSize: 14,
                            fontWeight: 800,
                            color: '#f1f5f9',
                            lineHeight: 1
                          }}
                        >
                          {plan.aiCredits}
                        </div>
                        <div
                          style={{
                            fontSize: 9,
                            color: 'rgba(255,255,255,0.4)',
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            letterSpacing: '0.04em',
                            marginTop: 2
                          }}
                        >
                          AI Credits
                        </div>
                      </div>
                    )}
                    {plan.aiCredits != null && plan.mediaPerListing != null && (
                      <div
                        style={{
                          width: 1,
                          background: 'rgba(255,255,255,0.08)',
                          alignSelf: 'stretch',
                          margin: '2px 0'
                        }}
                      />
                    )}
                    {plan.mediaPerListing != null && (
                      <div style={{ flex: 1, textAlign: 'center' }}>
                        <div
                          style={{
                            fontSize: 14,
                            fontWeight: 800,
                            color: '#f1f5f9',
                            lineHeight: 1
                          }}
                        >
                          {plan.mediaPerListing}
                        </div>
                        <div
                          style={{
                            fontSize: 9,
                            color: 'rgba(255,255,255,0.4)',
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            letterSpacing: '0.04em',
                            marginTop: 2
                          }}
                        >
                          Photos
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Upgrade CTA */}
                {showUpgrade && (
                  <button
                    onClick={() => handleClick('Payments')}
                    style={{
                      width: '100%',
                      background: tier === 'free' ? '#C4E53C' : accentColor,
                      color: tier === 'free' ? '#0B3D28' : '#09090b',
                      border: 'none',
                      borderRadius: 8,
                      padding: '7px 10px',
                      fontSize: 11.5,
                      fontWeight: 700,
                      cursor: 'pointer',
                      letterSpacing: '0.02em',
                      transition: 'opacity 150ms'
                    }}
                    onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
                    onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                  >
                    {tier === 'free' ? 'Upgrade Plan →' : 'Manage Plan →'}
                  </button>
                )}
              </div>
            )
          })()}
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
