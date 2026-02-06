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
  Search
} from 'lucide-react'
import axios from 'axios'

export default function Sidebar ({
  collapsed = false,
  mobileOpen = false,
  onCloseMobile = () => {},
  onToggleCollapse = () => {},
  onRouteChange = () => {},
  userRole = '' // better default
}) {
  const [activeKey, setActiveKey] = useState('Dashboard')
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
      const authToken = localStorage.getItem('authToken')
      if (!authToken) return setLoading(false)

      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/id`,
          {
            headers: { Authorization: `Bearer ${authToken}` }
          }
        )
        setUser(res.data.user)
      } catch (err) {
        console.error('Failed to fetch user:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchUser()
  }, [])

  // Define navigation items for each role
  const roleBasedNavigation = useMemo(() => {
    const navigationMap = {
      // Super Admin - Full access
      'super-admin': {
        brand: 'PROPNECT ADMIN',
        nav: [
          {
            key: 'Dashboard',
            label: 'Dashboard',
            icon: <LayoutDashboard strokeWidth={0.75} />
          },
          {
            key: 'UserManagement',
            label: 'Users',
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
            key: 'Finance',
            label: 'Finances',
            icon: <WalletMinimal strokeWidth={0.75} />
          },
          {
            key: 'Maintenance',
            label: 'Maintenance',
            icon: <Drill strokeWidth={0.75} />
          },
          {
            key: 'Reports',
            label: 'Reports',
            icon: <BarChart3 strokeWidth={0.75} />
          },
          {
            key: 'Analytics',
            label: 'Analytics',
            icon: <BarChart3 strokeWidth={0.75} />
          },
          {
            key: 'Documents',
            label: 'Documents',
            icon: <ClipboardMinus strokeWidth={0.75} />
          }
        ],
        account: [
          {
            key: 'Settings',
            label: 'Settings',
            icon: <Cog strokeWidth={0.75} />
          },
          {
            key: 'Security',
            label: 'Security',
            icon: <Shield strokeWidth={0.75} />
          },
          {
            key: 'Help',
            label: 'Help & Support',
            icon: <HeartHandshake strokeWidth={0.75} />
          }
        ]
      },

      // Sub Admin
      'sub-admin': {
        brand: 'PROPNECT ADMIN',
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
            key: 'ArtisanManagement',
            label: 'Artisans',
            icon: <Wrench strokeWidth={0.75} />
          },
          {
            key: 'TenantManagement',
            label: 'Tenants',
            icon: <UserCircle strokeWidth={0.75} />
          },
          {
            key: 'Maintenance',
            label: 'Maintenance',
            icon: <Drill strokeWidth={0.75} />
          },
          {
            key: 'Reports',
            label: 'Reports',
            icon: <BarChart3 strokeWidth={0.75} />
          },
          {
            key: 'Documents',
            label: 'Documents',
            icon: <ClipboardMinus strokeWidth={0.75} />
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

      // Property Owner
      'property-owner': {
        brand: 'PROPNECT',
        nav: [
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
            key: 'Reports',
            label: 'Reports',
            icon: <MessageSquareWarning strokeWidth={0.75} />
          },
          {
            key: 'FindArtisan',
            label: 'Find Artisan',
            icon: <Wrench strokeWidth={0.75} />
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

      // Property Admin
      'property-admin': {
        brand: 'PROPNECT MANAGER',
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
        brand: 'PROPNECT',
        nav: [
          {
            key: 'Dashboard',
            label: 'Dashboard',
            icon: <LayoutDashboard strokeWidth={0.75} />
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
        brand: 'PROPNECT PRO ADMIN',
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
        brand: 'PROPNECT TENANT',
        nav: [
          {
            key: 'Dashboard',
            label: 'Dashboard',
            icon: <LayoutDashboard strokeWidth={0.75} />
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

    return navigationMap[roleToUse] || navigationMap['property-owner']
  }, [user, userRole])

  const handleClick = key => {
    setActiveKey(key)
    onRouteChange(key)
    if (mobileOpen) onCloseMobile()
  }
  if (loading) {
    return <div className='admin-sidebar'>Loading...</div>
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
              <HousePlus strokeWidth={0.75} onClick={onToggleCollapse} />
            </div>
            {!collapsed && (
              <div className='brand-text'>
                <strong>{roleBasedNavigation.brand}</strong>
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
          {/* <button className='help-btn' onClick={() => handleClick('Help')}>
            <svg width='16' height='16' viewBox='0 0 24 24' fill='none'>
              <path
                d='M12 2a10 10 0 110 20 10 10 0 010-20z'
                stroke='currentColor'
                strokeWidth='1.2'
              />
            </svg>
            {!collapsed && <span>Help & Support</span>}
          </button> */}
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
