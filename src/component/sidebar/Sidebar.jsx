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
  ShoppingCart
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
            key: 'ArtisanManagement',
            label: 'Artisans',
            icon: <Wrench strokeWidth={0.75} />
          },
          {
            key: 'Tenants',
            label: 'Tenants',
            icon: <Home strokeWidth={0.75} />
          },
          {
            key: 'Finance',
            label: 'Finance',
            icon: <WalletMinimal strokeWidth={0.75} />
          },
          {
            key: 'Payouts',
            label: 'Payouts',
            icon: <DollarSign strokeWidth={0.75} />
          },
          {
            key: 'Maintenance',
            label: 'Maintenance',
            icon: <Drill strokeWidth={0.75} />
          },
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
            key: 'SupportTickets',
            label: 'Support Tickets',
            icon: <MessageSquareWarning strokeWidth={0.75} />
          },
          {
            key: 'PlatformSettings',
            label: 'Platform Settings',
            icon: <ChevronsRightLeft strokeWidth={0.75} />
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
            key: 'KYCQueue',
            label: 'KYC Approval Queue',
            icon: <ScanFace strokeWidth={0.75} />
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
            key: 'KYCVerification',
            label: 'Identity Verification',
            icon: <ScanFace strokeWidth={0.75} />
          },
          {
            key: 'Dashboard',
            label: 'Dashboard',
            icon: <LayoutDashboard strokeWidth={0.75} />
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
            key: 'Maintenance',
            label: 'Maintenance',
            icon: <Drill strokeWidth={0.75} />
          },
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
            key: 'FindArtisan',
            label: 'Find Artisan',
            icon: <Wrench strokeWidth={0.75} />
          }
        ],
        account: [
          // {
          //   key: 'Profile',
          //   label: 'Profile',
          //   icon: <UserCircle strokeWidth={0.75} />
          // },
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
            key: 'Maintenance',
            label: 'Maintenance',
            icon: <Drill strokeWidth={0.75} />
          },
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

      // Artisan
      artisan: {
        brand: `${process.env.NEXT_PUBLIC_APP_NAME}`,
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
            key: 'AvailableJobs',
            label: 'Available Jobs',
            icon: <Briefcase strokeWidth={0.75} />
          },
          {
            key: 'ActiveJobs',
            label: 'Active Jobs',
            icon: <CheckSquare strokeWidth={0.75} />
          },
          {
            key: 'JobHistory',
            label: 'Job History',
            icon: <ClipboardList strokeWidth={0.75} />
          },
          {
            key: 'Earnings',
            label: 'Earnings',
            icon: <DollarSign strokeWidth={0.75} />
          },
          {
            key: 'Schedule',
            label: 'Schedule',
            icon: <Calendar strokeWidth={0.75} />
          },
          {
            key: 'Portfolio',
            label: 'Portfolio',
            icon: <Star strokeWidth={0.75} />
          },
          {
            key: 'Certifications',
            label: 'Certifications',
            icon: <Award strokeWidth={0.75} />
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
            key: 'Help',
            label: 'Help & Support',
            icon: <HeartHandshake strokeWidth={0.75} />
          }
        ]
      },

      // Artisan Admin
      'artisan-admin': {
        brand: `${process.env.NEXT_PUBLIC_APP_NAME} ARTISAN ADMIN`,
        nav: [
          {
            key: 'Dashboard',
            label: 'Dashboard',
            icon: <LayoutDashboard strokeWidth={0.75} />
          },
          {
            key: 'AllArtisans',
            label: 'All Artisans',
            icon: <Users strokeWidth={0.75} />
          },
          {
            key: 'JobManagement',
            label: 'Job Management',
            icon: <Briefcase strokeWidth={0.75} />
          },
          {
            key: 'ActiveJobs',
            label: 'Active Jobs',
            icon: <CheckSquare strokeWidth={0.75} />
          },
          {
            key: 'Payments',
            label: 'Payments',
            icon: <DollarSign strokeWidth={0.75} />
          },
          {
            key: 'History',
            label: 'History',
            icon: <Star strokeWidth={0.75} />
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

      // Tenant
      user: {
        brand: `${process.env.NEXT_PUBLIC_APP_NAME} TENANT`,
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
            key: 'MyLease',
            label: 'My Lease',
            icon: <ClipboardMinus strokeWidth={0.75} />
          },
          {
            key: 'findArtisan',
            label: 'Find Artisan',
            icon: <Search strokeWidth={0.75} />
          },
          {
            key: 'MyHome',
            label: 'My Home',
            icon: <Home strokeWidth={0.75} />
          },
          {
            key: 'Payments',
            label: 'Payments',
            icon: <Receipt strokeWidth={0.75} />
          },
          {
            key: 'Maintenance',
            label: 'Maintenance Requests',
            icon: <FileText strokeWidth={0.75} />
          },
          {
            key: 'Documents',
            label: 'Documents',
            icon: <FileText strokeWidth={0.75} />
          },
          {
            key: 'MyBookings',
            label: 'My Bookings',
            icon: <Calendar strokeWidth={0.75} />
          },
          {
            key: 'BookingCart',
            label: 'Saved Bookings',
            icon: <ShoppingCart strokeWidth={0.75} />
          },
          {
            key: 'Messages',
            label: 'Messages',
            icon: <MessageSquareWarning strokeWidth={0.75} />
          },
          {
            key: 'History',
            label: 'History',
            icon: <Star strokeWidth={0.75} />
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
          ? 'Identity Verified ✓'
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
          <div className='brand' title={roleBasedNavigation.brand}>
            <div className='brand-logo' aria-hidden='true'>
              <HousePlus strokeWidth={0.75} />
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

          {/* <button
            className='collapse-btn'
            // onClick={onToggleCollapse}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={collapsed ? 'Expand' : 'Collapse'}
          >
            <ChevronsRightLeft strokeWidth={0.75} />
          </button> */}
        </div>

        {/* === Menu Section === */}
        <div className='sidebar-section'>
          <div className='section-title'>{!collapsed && 'MENU'}</div>
          <ul className='nav-list'>
            {roleBasedNavigation.nav.map(item => (
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
            {roleBasedNavigation.account.map(item => (
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
          {/* ── Plan widget — hidden for super-admins ──────────────── */}
          {(() => {
            const ADMIN_ROLES = ['SUPER_ADMIN', 'SUB_ADMIN', 'SUPPORT_ADMIN', 'property-admin', 'artisan-admin']
            if (ADMIN_ROLES.includes(userRole)) return null

            const plan = livePlan || user?.plan
            if (!plan) return null

            const tier = (plan.tier || 'free').toLowerCase()

            // ── Trial data ───────────────────────────────────────────
            const onTrial   = plan.isOnTrial && plan.trialEndsAt
            const msLeft    = onTrial ? new Date(plan.trialEndsAt) - new Date() : 0
            const daysLeft  = onTrial ? Math.ceil(msLeft / (1000 * 60 * 60 * 24)) : 0
            const trialLive = onTrial && daysLeft >= 0

            const isUrgent  = trialLive && daysLeft <= 3
            const isWarning = trialLive && daysLeft <= 7

            // ── Tier visuals ─────────────────────────────────────────
            const tierMeta = {
              free:       { label: 'Free',       color: '#64748b', bg: '#f1f5f9', border: '#cbd5e1', icon: '🪙' },
              basic:      { label: 'Basic',      color: '#0F6040', bg: '#e8f5e9', border: '#a7d4b8', icon: '⭐' },
              pro:        { label: 'Pro',         color: '#7c3aed', bg: '#f5f3ff', border: '#c4b5fd', icon: '🚀' },
              enterprise: { label: 'Enterprise', color: '#b45309', bg: '#fffbeb', border: '#fcd34d', icon: '👑' },
            }
            const meta = tierMeta[tier] || tierMeta.free

            // If trial is urgent/warning override colors
            const cardColor  = isUrgent ? '#dc2626' : isWarning ? '#b45309' : meta.color
            const cardBg     = isUrgent ? '#fff5f5'  : isWarning ? '#fffbe6' : meta.bg
            const cardBorder = isUrgent ? '#fca5a5'  : isWarning ? '#fcd34d' : meta.border

            const showUpgrade = tier !== 'enterprise'

            // ── Trial progress bar ───────────────────────────────────
            let pct = 100
            if (trialLive) {
              const totalMs   = plan.trialStartedAt
                ? new Date(plan.trialEndsAt) - new Date(plan.trialStartedAt)
                : 30 * 24 * 60 * 60 * 1000
              const totalDays = Math.max(1, Math.ceil(totalMs / (1000 * 60 * 60 * 24)))
              pct = Math.max(0, Math.min(100, (daysLeft / totalDays) * 100))
            }

            // ── Collapsed mode ───────────────────────────────────────
            if (collapsed) {
              const tip = trialLive
                ? `${meta.icon} ${meta.label}${onTrial ? ` · Trial: ${daysLeft}d left` : ''}`
                : `${meta.icon} ${meta.label} Plan`
              return (
                <div title={tip} style={{ display:'flex', justifyContent:'center', padding:'8px 0', cursor: showUpgrade ? 'pointer' : 'default' }}
                  onClick={showUpgrade ? () => handleClick('Settings') : undefined}>
                  <span style={{ fontSize: 18 }}>{isUrgent ? '⏰' : isWarning ? '⚠️' : meta.icon}</span>
                </div>
              )
            }

            // ── Expanded mode ────────────────────────────────────────
            return (
              <div style={{ margin: '8px 12px 4px', background: cardBg, borderRadius: 10, padding: '10px 12px', border: `1px solid ${cardBorder}` }}>
                {/* Header row: tier badge + trial tag */}
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom: trialLive ? 6 : 8 }}>
                  <div style={{ display:'flex', alignItems:'center', gap: 5 }}>
                    <span style={{ fontSize: 13 }}>{meta.icon}</span>
                    <span style={{ fontSize: 12, fontWeight: 800, color: cardColor, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      {meta.label}
                    </span>
                    <span style={{ fontSize: 10, fontWeight: 600, color: '#fff', background: cardColor, borderRadius: 4, padding: '1px 5px' }}>
                      Plan
                    </span>
                  </div>
                  {trialLive && (
                    <span style={{ fontSize: 10, fontWeight: 700, color: cardColor, background: `${cardColor}18`, borderRadius: 4, padding: '2px 6px', whiteSpace: 'nowrap' }}>
                      {isUrgent ? '⏰' : '🎁'} Trial
                    </span>
                  )}
                </div>

                {/* Trial countdown + progress */}
                {trialLive && (
                  <>
                    <div style={{ display:'flex', justifyContent:'space-between', fontSize: 11, color: cardColor, fontWeight: 700, marginBottom: 4 }}>
                      <span>{daysLeft === 0 ? 'Expires today!' : daysLeft === 1 ? '1 day left' : `${daysLeft} days left`}</span>
                      <span style={{ opacity: 0.75, fontWeight: 500 }}>
                        {new Date(plan.trialEndsAt).toLocaleDateString('en-GB', { day:'numeric', month:'short' })}
                      </span>
                    </div>
                    <div style={{ height: 4, background: '#e0e0e0', borderRadius: 99, overflow: 'hidden', marginBottom: 8 }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: cardColor, borderRadius: 99, transition: 'width .4s' }} />
                    </div>
                  </>
                )}

                {/* Plan limits row */}
                <div style={{ display:'flex', gap: 8, marginBottom: showUpgrade ? 8 : 0 }}>
                  {plan.listingLimit != null && (
                    <div style={{ flex: 1, background: 'rgba(0,0,0,0.04)', borderRadius: 6, padding: '4px 7px', textAlign:'center' }}>
                      <div style={{ fontSize: 13, fontWeight: 800, color: cardColor }}>{plan.listingLimit}</div>
                      <div style={{ fontSize: 9, color: '#888', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.03em' }}>Listings</div>
                    </div>
                  )}
                  {plan.aiCredits != null && (
                    <div style={{ flex: 1, background: 'rgba(0,0,0,0.04)', borderRadius: 6, padding: '4px 7px', textAlign:'center' }}>
                      <div style={{ fontSize: 13, fontWeight: 800, color: cardColor }}>{plan.aiCredits}</div>
                      <div style={{ fontSize: 9, color: '#888', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.03em' }}>AI Credits</div>
                    </div>
                  )}
                  {plan.mediaPerListing != null && (
                    <div style={{ flex: 1, background: 'rgba(0,0,0,0.04)', borderRadius: 6, padding: '4px 7px', textAlign:'center' }}>
                      <div style={{ fontSize: 13, fontWeight: 800, color: cardColor }}>{plan.mediaPerListing}</div>
                      <div style={{ fontSize: 9, color: '#888', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.03em' }}>Photos</div>
                    </div>
                  )}
                </div>

                {/* Upgrade CTA */}
                {showUpgrade && (
                  <button
                    onClick={() => handleClick('Settings')}
                    style={{ width:'100%', background: cardColor, color:'#fff', border:'none', borderRadius: 6, padding:'6px 10px', fontSize: 12, fontWeight: 700, cursor:'pointer', marginTop: 2 }}
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
