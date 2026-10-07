'use client'

import React, { useState, useEffect } from 'react'
import '@/component/sidebar/admin.scss'
import Sidebar from '@/component/sidebar/Sidebar'
import AppHeader from '@/component/sidebar/AppHeader'
import Tenant from '@/component/admin/Tenants/Tenant'
import Finance from '@/component/admin/Finances/Finance'
import Document from '@/component/admin/Documents/Document'
import Report from '@/component/admin/Reports/Report'
import Maintenance from '@/component/admin/Maintenance/Maintenance'
import UserManagement from '@/component/admin/UserManagement/UserManagement'
import Settings from '@/component/admin/Settings/Settings'
import PaymentMethod from '@/component/admin/paymentMethod/PaymentMethod'
import UploadPortfolio from '@/component/admin/UploadPortfolio/UploadPortfolio'
import AdminDashboard from '@/component/admin/Admindashboard/AdminDashboard'
import UploadProperty from '@/component/UploadProperty/UploadProperty'

// Property Owner Components
import PropertyOwnerDashboard from '@/component/property-owner/Dashboard/Dashboard'
import MyProperties from '@/component/property-owner/Properties/MyProperties'
import SiteKeys from '@/component/property-owner/SiteKeys/SiteKeys'
// PHASE 3+ — import FindArtisan from '@/component/property-owner/Artisan/FindArtisan'
import PropertyOwnerPayments from '@/component/property-owner/Payments/PropertyOwnerPayments'
import Applicants from '@/component/property-owner/Applicants/Applicants'

// PHASE 3+ — Artisan Components. Restore imports when artisan marketplace launches.
// import ArtisanDashboard from '@/component/artisan/Dashboard/Dashboard'
// import AvailableJobs from '@/component/artisan/Jobs/AvailableJobs/AvailableJobs'
// import ActiveJobs from '@/component/artisan/Jobs/ActiveJobs/ActiveJobs'
// import JobHistory from '@/component/artisan/Jobs/JobHistory/JobHistory'
// import Earnings from '@/component/artisan/Earnings/Earnings'
// import Schedule from '@/component/artisan/Schedule/Schedule'
// import Portfolio from '@/component/artisan/Portfolio/Portfolio'
// import Certifications from '@/component/artisan/Certifications/Certifications'
// import BidNegotiations from '@/component/artisan/Negotiations/BidNegotiations'

// Tenant Components
import MyApplications    from '@/component/tenant/MyApplications/MyApplications'
import TenantDashboard   from '@/component/tenant/Dashboard/Dashboard'
import MyLease           from '@/component/tenant/MyLease/MyLease'
import MyHome            from '@/component/tenant/Home/Home'
import TenantPayments    from '@/component/tenant/Payments/Payments'
import MyBookings        from '@/component/admin/Tenant/MyBookings'
import BookingCart       from '@/component/admin/Tenant/BookingCart'
import TenantMaintenance from '@/component/tenant/Maintenance/Maintenance'
import Messages          from '@/component/tenant/Messages/Messages'
import PropertyHub       from '@/component/tenant/Hub/PropertyHub'
import BookingsHub       from '@/component/tenant/Hub/BookingsHub'
import ServicesHub       from '@/component/tenant/Hub/ServicesHub'

// Support Ticket Components
import SupportTicketForm from '@/component/user/SupportTicketForm/SupportTicketForm'
import SupportTicketAdmin from '@/component/user/SupportTicketAdmin/SupportTicketAdmin'
import SupportTicketList from '@/component/user/SupportTicketList/SupportTicketList'

import PropertyManagementDashboard from '@/component/admin/PropertyManagementDashboard/PropertyManagementDashboard'
import Artisan from '@/component/admin/Artisan/Artisan'
import FinanceDashboard from '@/component/tenant/Finance/Finance'
import PlatformSettings from '../../component/admin/PlatformSettings/PlatformSettings.jsx'
import EmailTemplates from '../../component/admin/EmailTemplates/EmailTemplates.jsx'
import AdminPermissions from '../../component/admin/AdminPermissions/AdminPermissions.jsx'
import LicenseKeys from '../../component/admin/LicenseKeys/LicenseKeys.jsx'
import KYCQueue from '../../component/admin/KYCQueue/KYCQueue.jsx'
import Comments from '../../component/admin/Comments/Comments.jsx'
import AdminBookings from '../../component/admin/Bookings/AdminBookings.jsx'
import KYCForm from '../../component/KYC/KYCForm.jsx'
import AccountSetup from '../../component/AccountSetup/AccountSetup.jsx'
import MobileTabBar from '../../component/sidebar/MobileTabBar.jsx'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useNotifications } from '@/hooks/useNotifications'
import { useTheme } from '@/hooks/useTheme'
import './layout.scss'
import './dark-content.scss'

// ── KYC Gate — blocks access to action pages until KYC is approved ────────────
function KycGate ({ kycStatus, onVerify, children }) {
  if (kycStatus === 'approved') return children

  const isPending = kycStatus === 'pending' || kycStatus === 'under_review'

  return (
    <div className='kyc-gate'>
      <div className='kyc-gate-icon'>
        {isPending ? '🔍' : '🪪'}
      </div>
      <h2 className='kyc-gate-title'>
        {isPending ? 'Identity Verification In Progress' : 'Identity Verification Required'}
      </h2>
      <p className='kyc-gate-desc'>
        {isPending
          ? 'Your KYC documents are currently under review by our compliance team. This feature will be unlocked once your identity is verified.'
          : 'You need to complete identity verification (KYC) before accessing this feature. This ensures the safety and trust of all users on the platform.'}
      </p>
      {!isPending && (
        <button className='kyc-gate-btn' onClick={onVerify}>
          Complete Verification →
        </button>
      )}
    </div>
  )
}

export default function AdminLayout ({ children }) {
  const router = useRouter()
  const { isLoggedIn, isLoading, user, logout, checkAuth, token } = useAuth()

  const {
    notifications,
    unreadCount,
    markAsRead: markNotifRead,
    markAllAsRead: markAllNotifsRead,
    deleteNotification: deleteNotif,
    clearAll: clearAllNotifs
  } = useNotifications(token)

  const { isDark, toggleTheme } = useTheme()

  const [unreadMsgCount, setUnreadMsgCount] = useState(0)

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [activePage, setActivePage] = useState('Dashboard')

  // Restore last active page — but only for the same user session
  useEffect(() => {
    if (!user) return
    const savedUserId = localStorage.getItem('ep_session_user')
    const savedPage = localStorage.getItem('ep_activePage')
    if (savedUserId === String(user._id) && savedPage) {
      setActivePage(savedPage)
    } else {
      // Different user logged in — reset to Dashboard and claim this session
      setActivePage('Dashboard')
      localStorage.setItem('ep_session_user', String(user._id))
      localStorage.removeItem('ep_activePage')
    }
  }, [user?._id])
  const [error, setError] = useState(null)
  const [sessionWarning, setSessionWarning] = useState(false)
  const [sessionTimeoutWarning, setSessionTimeoutWarning] = useState(false)
  const [supportTicketCount, setSupportTicketCount] = useState(0)
  const [accountStatus, setAccountStatus] = useState(null) // 'pending_kyc' | 'pending_payment_setup' | 'active'
  const [showAccountSetup, setShowAccountSetup] = useState(false)
  const [kycStatus, setKycStatus] = useState(null) // user's kyc.status
  const [livePlan, setLivePlan] = useState(null)  // live plan data (overrides stale localStorage)

  // Session timeout timer reference
  const sessionTimeoutRef = React.useRef(null)
  const warningTimeoutRef = React.useRef(null)
  const inactivityTimeoutRef = React.useRef(null)

  // Session management constants
  const SESSION_WARNING_TIME = 14 * 60 * 1000 // 14 minutes
  const SESSION_TIMEOUT = 15 * 60 * 1000 // 15 minutes
  const INACTIVITY_CHECK = 1 * 60 * 1000 // Check every 1 minute

  // ✅ Auth protection - redirect if not logged in
  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      router.push('/auth/login')
    }
  }, [isLoggedIn, isLoading, router])

  // ✅ Read accountStatus + kycStatus — auto-open setup overlay for pending PROPERTY_OWNERs / artisans
  useEffect(() => {
    if (!user) return
    const status = user?.accountStatus
    const gatedRoles = ['PROPERTY_OWNER', 'artisan']
    if (gatedRoles.includes(user?.role) && status && status !== 'active') {
      setAccountStatus(status)
      setShowAccountSetup(true) // immediately show setup flow, don't wait for banner click
    } else {
      setAccountStatus('active')
      setShowAccountSetup(false)
    }
    const ks = user?.kyc?.status || 'not_submitted'
    setKycStatus(ks)

    // ── KYC onboarding: first-time nudge ─────────────────────────────────────
    // Admins are not required to submit KYC — skip this redirect for them.
    const adminRolesList = ['SUPER_ADMIN', 'SUB_ADMIN', 'SUPPORT_ADMIN', 'property-admin', 'artisan-admin', 'sub-property-admin', 'sub-artisan-admin']
    const isAdminRole = adminRolesList.includes(user.role)

    if (!isAdminRole) {
      const skipped = sessionStorage.getItem('ep_kyc_skipped')
      if (!skipped && (!ks || ks === 'not_submitted')) {
        const savedPage = localStorage.getItem('ep_activePage')
        // Only redirect if they're landing on Dashboard (not returning to another page)
        if (!savedPage || savedPage === 'Dashboard') {
          setActivePage('KYCVerification')
          localStorage.setItem('ep_activePage', 'KYCVerification')
        }
      }
    }
  }, [user?._id])

  // ✅ Fetch live KYC status — keeps kycStatus in sync even after admin approves/rejects
  // while the user is already logged in (localStorage would otherwise be stale).
  useEffect(() => {
    if (!isLoggedIn || !token) return
    const API = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4001'
    fetch(`${API}/api/kyc/status`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.success && data.kyc?.status) {
          setKycStatus(data.kyc.status)
        }
      })
      .catch(() => {})
  }, [isLoggedIn, token])

  // ✅ Fetch live plan data — handles users logged in before `plan` was added to the
  // auth response (their localStorage.userData won't have it until they log in again).
  useEffect(() => {
    if (!isLoggedIn || !token) return
    const API = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4001'
    fetch(`${API}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.success && data.data?.plan) {
          setLivePlan(data.data.plan)
        }
      })
      .catch(() => {})
  }, [isLoggedIn, token])

  // ✅ Fetch support ticket count
  useEffect(() => {
    if (!isLoggedIn || !user) return

    const fetchTicketCount = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/tickets/count`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('authToken')}`
            }
          }
        )
        if (response.ok) {
          const data = await response.json()
          setSupportTicketCount(data.count || 0)
        }
      } catch (error) {
        console.error('Error fetching ticket count:', error)
      }
    }

    fetchTicketCount()
    const interval = setInterval(fetchTicketCount, 5 * 60 * 1000) // Refresh every 5 minutes

    return () => clearInterval(interval)
  }, [isLoggedIn, user])

  // ✅ Fetch unread message count + live socket updates
  useEffect(() => {
    if (!isLoggedIn || !token) return
    const API = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4001'

    const fetchUnreadMsgCount = async () => {
      try {
        const res = await fetch(`${API}/api/messages/conversations`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (!res.ok) return
        const data = await res.json()
        const total = (data.conversations || []).reduce(
          (sum, c) => sum + (c.unreadCount || 0),
          0
        )
        setUnreadMsgCount(total)
      } catch (_) {}
    }

    fetchUnreadMsgCount()

    // Listen for new messages via Socket.IO to bump the counter in real-time
    let socket
    try {
      const { io } = require('socket.io-client')
      socket = io(API, {
        auth: { token },
        transports: ['websocket', 'polling'],
        reconnectionAttempts: 3
      })
      socket.on('new-message', () => {
        // Only increment if the user is not already on the Messages page
        setActivePage(page => {
          if (page !== 'Messages') {
            setUnreadMsgCount(n => n + 1)
          }
          return page
        })
      })
    } catch (_) {}

    return () => {
      if (socket) socket.disconnect()
    }
  }, [isLoggedIn, token])

  // ✅ Session timeout setup
  useEffect(() => {
    if (!isLoggedIn) return

    const resetSessionTimer = () => {
      // Clear existing timers
      if (sessionTimeoutRef.current) clearTimeout(sessionTimeoutRef.current)
      if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current)

      // Set warning timeout
      warningTimeoutRef.current = setTimeout(() => {
        setSessionWarning(true)
        setSessionTimeoutWarning(true)
      }, SESSION_WARNING_TIME)

      // Set logout timeout
      sessionTimeoutRef.current = setTimeout(() => {
        handleSessionTimeout()
      }, SESSION_TIMEOUT)
    }

    // Reset timer on user activity
    const activityEvents = [
      'mousedown',
      'keydown',
      'scroll',
      'touchstart',
      'click'
    ]

    const handleActivity = () => {
      setSessionWarning(false)
      resetSessionTimer()
    }

    // Initial timer
    resetSessionTimer()

    // Add activity listeners
    activityEvents.forEach(event => {
      window.addEventListener(event, handleActivity)
    })

    return () => {
      // Cleanup
      if (sessionTimeoutRef.current) clearTimeout(sessionTimeoutRef.current)
      if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current)
      activityEvents.forEach(event => {
        window.removeEventListener(event, handleActivity)
      })
    }
  }, [isLoggedIn])

  // ✅ Cross-tab sync listener
  useEffect(() => {
    const handleAuthChange = event => {
      const { detail } = event

      if (detail.status === 'logout' && detail.reason !== 'unauthorized') {
        // Another tab explicitly logged out (not a 401 API error)
        setError('You have been logged out in another tab.')
        setTimeout(() => {
          router.push('/auth/login')
        }, 2000)
      } else if (detail.status === 'device-logout') {
        // Logged in from different device
        setError('You logged in from a different device.')
        setTimeout(() => {
          router.push('/auth/login')
        }, 2000)
      } else if (detail.status === 'login') {
        // Another tab logged in
        checkAuth()
      }
    }

    window.addEventListener('authStatusChanged', handleAuthChange)
    return () =>
      window.removeEventListener('authStatusChanged', handleAuthChange)
  }, [router, checkAuth])

  // ✅ Responsive design
  useEffect(() => {
    const onResize = () => {
      setIsMobile(window.innerWidth < 900)
      if (window.innerWidth >= 900) setMobileSidebarOpen(false)
    }
    onResize()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  // ✅ Escape key handler
  useEffect(() => {
    const onKey = e => {
      if (e.key === 'Escape') setMobileSidebarOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // Session timeout handler
  const handleSessionTimeout = () => {
    logout()
    setError('Your session has expired. Please log in again.')
    setSessionWarning(false)
  }

  // Session warning handler
  const handleExtendSession = () => {
    setSessionWarning(false)
    setSessionTimeoutWarning(false)
    // Reset timer by dispatching activity event
    window.dispatchEvent(new Event('mousedown'))
  }

  // ✅ Loading state
  if (isLoading) {
    return (
      <div className='loading-state'>
        <div className='loading-spinner'>
          <div className='spinner'></div>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  // ✅ Not authenticated
  if (!isLoggedIn) {
    return (
      <div className='auth-error-state'>
        <p>Redirecting to login...</p>
      </div>
    )
  }

  const userRole = user?.role

  // Guard: user object not yet hydrated from localStorage
  if (!userRole) {
    return (
      <div className='loading-state'>
        <div className='loading-spinner'>
          <div className='spinner'></div>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  // ── KYC gate helper — wraps pages that require verified identity ─────────────
  const gated = (component) => (
    <KycGate
      kycStatus={kycStatus}
      onVerify={() => {
        setActivePage('KYCVerification')
        localStorage.setItem('ep_activePage', 'KYCVerification')
      }}
    >
      {component}
    </KycGate>
  )

  // ✅ Role-based page rendering with proper support ticket routing
  const renderPage = () => {
    // Admin Roles (for main dashboard access)
    const adminRoles = [
      'SUPER_ADMIN',
      'SUB_ADMIN',
      'property-admin',
      'artisan-admin',
      'sub-property-admin',
      'sub-artisan-admin'
    ]

    // Support ticket admin roles (ONLY these can access SupportTicketAdmin)
    const supportAdminRoles = ['SUPER_ADMIN', 'SUPPORT_ADMIN']

    const isAdmin = adminRoles.includes(userRole)
    const isSupportAdmin = supportAdminRoles.includes(userRole)

    // Support Tickets Pages - Available to all roles
    if (activePage === 'SupportTickets') {
      // Only support admins can access the admin dashboard
      if (isSupportAdmin) {
        return <SupportTicketAdmin userRole={userRole} />
      } else {
        // All other users see their own tickets list
        return <SupportTicketList userRole={userRole} />
      }
    }

    // Help page - SUPER_ADMIN should see admin dashboard, not form
    if (activePage === 'Help') {
      if (isSupportAdmin) {
        return <SupportTicketAdmin userRole={userRole} />
      } else {
        return <SupportTicketForm userEmail={user?.email} />
      }
    }

    // Create Ticket - SUPER_ADMIN should see admin dashboard, not form
    if (activePage === 'CreateTicket') {
      if (isSupportAdmin) {
        return <SupportTicketAdmin userRole={userRole} />
      } else {
        return <SupportTicketForm userEmail={user?.email} />
      }
    }

    // Admin-only pages
    if (isAdmin) {
      switch (activePage) {
        case 'Dashboard':
          return <AdminDashboard />
        case 'PropertyManagement':
          return <PropertyManagementDashboard userRole={userRole} />
        case 'MyProperties':
          return <MyProperties />
        case 'PropertyUpload':
          return <MyProperties initialView='tier-select' />
        case 'ArtisanManagement':
          return <Artisan />
        case 'AllArtisans':
          return <UploadPortfolio />
        case 'JobManagement':
          return <Maintenance />
        case 'PropertyOwners':
          return <UserManagement />
        case 'Tenants':
        case 'TenantManagement':
          return <Tenant />
        case 'Finance':
        case 'Payments':
          return <Finance />
        case 'Payouts':
          return <Finance initialTab='Payouts' />
        case 'PaymentMethod':
          return <PaymentMethod />
        case 'Documents':
        case 'Document':
          return <Document />
        case 'Reports':
        case 'Report':
          return <Report />
        case 'Maintenance':
          return <Maintenance />
        // PHASE 3+ — case 'ActiveJobs': return <ActiveJobs /> (artisan jobs admin view)
        case 'UserManagement':
          return <UserManagement />
        case 'Analytics':
          return <Report />
        case 'Reviews':
          return <Report />
        case 'Settings':
        case 'Security':
        case 'PlatformSettings':
          return <PlatformSettings />
        case 'EmailTemplates':
          return <EmailTemplates />
        case 'AdminPermissions':
          return <AdminPermissions currentUser={user} />
        case 'LicenseKeys':
          return <LicenseKeys />
        case 'KYCQueue':
          return <KYCQueue />
        case 'Comments':
          return <Comments />
        case 'Bookings':
        case 'AllBookings':
          return <AdminBookings />
        case 'PropertySales':
          return <Finance initialTab='Transactions' />
        case 'RentManagement':
          return <Finance initialTab='Transactions' />
        case 'KYCVerification':
          return (
            <KYCForm
              userRole={user?.role}
              existingKyc={user?.kyc}
              status={kycStatus}
              onSuccess={() => {
                setKycStatus('pending')
                sessionStorage.removeItem('ep_kyc_skipped')
                setActivePage('Dashboard')
                localStorage.setItem('ep_activePage', 'Dashboard')
              }}
              onSkip={() => {
                sessionStorage.setItem('ep_kyc_skipped', '1')
                setActivePage('Dashboard')
                localStorage.setItem('ep_activePage', 'Dashboard')
              }}
              onCancel={() => {
                sessionStorage.setItem('ep_kyc_skipped', '1')
                setActivePage('Dashboard')
                localStorage.setItem('ep_activePage', 'Dashboard')
              }}
            />
          )
        default:
          return <AdminDashboard />
      }
    }

    // Property Owner Pages
    if (userRole === 'PROPERTY_OWNER') {
      const ownerNavigate = page => {
        setActivePage(page)
        localStorage.setItem('ep_activePage', page)
      }
      switch (activePage) {
        case 'Dashboard':
          return <PropertyOwnerDashboard onRouteChange={ownerNavigate} />
        case 'MyProperties':
          return gated(<MyProperties onUpgrade={() => ownerNavigate('Payments')} />)
        case 'PropertyUpload':
          return gated(<MyProperties initialView='tier-select' onUpgrade={() => ownerNavigate('Payments')} />)
        case 'Tenants':
          return gated(<Tenant />)
        case 'Applicants':
          return gated(<Applicants onRouteChange={ownerNavigate} />)
        case 'Maintenance':
          return gated(<Maintenance />)
        case 'Payments':
          return gated(<PropertyOwnerPayments />)
        case 'Documents':
          return gated(<Document />)
        case 'Reports':
          return <Report />
        // PHASE 3+ — case 'FindArtisan': return gated(<FindArtisan />)
        case 'Messages':
          return gated(<Messages />)
        case 'Bookings':
          return gated(<AdminBookings />)
        case 'OwnerComments':
          return gated(<Comments />)
        case 'Profile':
          return <Settings />
        case 'Settings':
          return <Settings />
        case 'SiteKeys':
          return <SiteKeys />
        case 'KYCVerification':
          return (
            <KYCForm
              userRole={user?.role}
              existingKyc={user?.kyc}
              status={kycStatus}
              onSuccess={() => {
                setKycStatus('pending')
                sessionStorage.removeItem('ep_kyc_skipped')
                setActivePage('Dashboard')
                localStorage.setItem('ep_activePage', 'Dashboard')
              }}
              onSkip={() => {
                sessionStorage.setItem('ep_kyc_skipped', '1')
                setActivePage('Dashboard')
                localStorage.setItem('ep_activePage', 'Dashboard')
              }}
              onCancel={() => {
                sessionStorage.setItem('ep_kyc_skipped', '1')
                setActivePage('Dashboard')
                localStorage.setItem('ep_activePage', 'Dashboard')
              }}
            />
          )
        default:
          return <PropertyOwnerDashboard />
      }
    }

    // PHASE 3+ — Artisan role pages. Restore when artisan marketplace launches.
    // if (userRole === 'artisan') {
    //   switch (activePage) {
    //     case 'Dashboard':     return <ArtisanDashboard />
    //     case 'AvailableJobs': return gated(<AvailableJobs />)
    //     case 'ActiveJobs':    return gated(<ActiveJobs />)
    //     case 'JobHistory':    return gated(<JobHistory />)
    //     case 'Earnings':      return gated(<Earnings />)
    //     case 'Schedule':      return gated(<Schedule />)
    //     case 'Portfolio':     return gated(<Portfolio />)
    //     case 'Certifications':return gated(<Certifications />)
    //     case 'Negotiations':  return gated(<BidNegotiations />)
    //     case 'ArtisanReviews':return gated(<Comments />)
    //     case 'Profile':
    //     case 'Settings':      return <Settings />
    //     case 'KYCVerification': return <KYCForm ... />
    //     default:              return <ArtisanDashboard />
    //   }
    // }

    // Tenant Pages
    if (userRole === 'user' || userRole === 'tenant') {
      const navigate = page => {
        setActivePage(page)
        localStorage.setItem('ep_activePage', page)
      }

      const kycForm = (
        <KYCForm
          userRole={user?.role}
          existingKyc={user?.kyc}
          status={kycStatus}
          onSuccess={() => {
            setKycStatus('pending')
            sessionStorage.removeItem('ep_kyc_skipped')
            setActivePage('Dashboard')
            localStorage.setItem('ep_activePage', 'Dashboard')
          }}
          onSkip={() => {
            sessionStorage.setItem('ep_kyc_skipped', '1')
            setActivePage('Dashboard')
            localStorage.setItem('ep_activePage', 'Dashboard')
          }}
          onCancel={() => {
            sessionStorage.setItem('ep_kyc_skipped', '1')
            setActivePage('Dashboard')
            localStorage.setItem('ep_activePage', 'Dashboard')
          }}
        />
      )

      switch (activePage) {
        case 'Dashboard':
          return <TenantDashboard />

        // ── Consolidated hubs ──────────────────────────────────────────
        case 'PropertyHub':
          return gated(<PropertyHub onRouteChange={navigate} />)
        case 'BookingsHub':
          return <BookingsHub />
        case 'ServicesHub':
          return gated(<ServicesHub />)

        // ── Finance & Payments ─────────────────────────────────────────
        case 'Finance':
          return gated(<FinanceDashboard />)
        case 'Payments':
          return gated(<TenantPayments />)

        // ── Documents ─────────────────────────────────────────────────
        case 'Documents':
          return gated(<Document />)

        // ── Communication ─────────────────────────────────────────────
        case 'Messages':
          return gated(<Messages />)

        // ── Identity ──────────────────────────────────────────────────
        case 'KYCVerification':
          return kycForm

        // ── Account ───────────────────────────────────────────────────
        case 'Profile':
        case 'Settings':
          return <Settings />

        // ── Legacy direct links (bookmarks / old nav state) ───────────
        case 'MyHome':         return gated(<PropertyHub onRouteChange={navigate} />)
        case 'MyLease':        return gated(<PropertyHub onRouteChange={navigate} />)
        case 'MyApplications': return gated(<PropertyHub onRouteChange={navigate} />)
        case 'MyBookings':     return <BookingsHub />
        case 'BookingCart':    return <BookingsHub />
        case 'History':        return <BookingsHub />
        // PHASE 3+ — case 'FindArtisan': case 'findArtisan': return gated(<ServicesHub />)
        case 'Maintenance':    return gated(<ServicesHub />)

        default:
          return <TenantDashboard />
      }
    }

    // Fallback
    return <div className='page-placeholder'>Page Not Found</div>
  }

  // Account setup overlay — shown when user clicks "Complete Setup" or tries a gated action
  if (showAccountSetup && accountStatus && accountStatus !== 'active') {
    return (
      <div style={{ minHeight: '100vh', background: '#f7f9fc' }}>
        <AccountSetup
          initialStatus={accountStatus}
          onComplete={newStatus => {
            setAccountStatus(newStatus)
            setShowAccountSetup(false)
          }}
        />
      </div>
    )
  }

  return (
    <div className='admin-shell'>
      {/* Session Warning Modal */}
      {sessionWarning && (
        <div className='session-warning-overlay'>
          <div className='session-warning-modal'>
            <div className='warning-icon'>⏰</div>
            <h3>Session Timeout Warning</h3>
            <p>Your session will expire in 1 minute due to inactivity.</p>
            <div className='warning-actions'>
              <button className='btn btn-primary' onClick={handleExtendSession}>
                Continue Session
              </button>
              <button
                className='btn btn-secondary'
                onClick={handleSessionTimeout}
              >
                Logout Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className='alert-banner alert-error'>
          <div className='alert-content'>
            <svg width='20' height='20' viewBox='0 0 20 20' fill='currentColor'>
              <path
                fillRule='evenodd'
                d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z'
                clipRule='evenodd'
              />
            </svg>
            <span>{error}</span>
          </div>
        </div>
      )}

      <Sidebar
        userRole={userRole}
        user={user}
        livePlan={livePlan}
        collapsed={sidebarCollapsed}
        mobileOpen={mobileSidebarOpen}
        onRouteChange={page => {
          setActivePage(page)
          localStorage.setItem('ep_activePage', page)
        }}
        onCloseMobile={() => setMobileSidebarOpen(false)}
        onToggleCollapse={() => setSidebarCollapsed(s => !s)}
        supportTicketCount={supportTicketCount}
      />

      <div className={`main-column${sidebarCollapsed ? ' collapsed' : ''}`}>
        <AppHeader
          onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
          onToggleTheme={toggleTheme}
          isDark={isDark}
          user={user}
          onLogout={logout}
          currentPage={activePage}
          onRouteChange={page => {
            setActivePage(page)
            localStorage.setItem('ep_activePage', page)
          }}
          supportTicketCount={supportTicketCount}
          notifications={notifications}
          unreadCount={unreadCount}
          onMarkAsRead={markNotifRead}
          onMarkAllAsRead={markAllNotifsRead}
          onDeleteNotification={deleteNotif}
          onClearAll={clearAllNotifs}
          unreadMsgCount={unreadMsgCount}
          onOpenMessages={() => {
            setActivePage('Messages')
            localStorage.setItem('ep_activePage', 'Messages')
            setUnreadMsgCount(0)
          }}
        />

        {/* KYC Banner — not submitted, rejected, or cancelled */}
        {kycStatus &&
          ['not_submitted', 'rejected', 'cancelled'].includes(kycStatus) &&
          activePage !== 'KYCVerification' && (
            <div className='account-pending-banner account-pending-banner--kyc'>
              <div className='apb-content'>
                <span className='apb-icon'>
                  {kycStatus === 'rejected' ? '⚠️' : kycStatus === 'cancelled' ? '🔄' : '🪪'}
                </span>
                <div>
                  <strong>
                    {kycStatus === 'rejected'
                      ? 'KYC Declined — Resubmit Required'
                      : kycStatus === 'cancelled'
                      ? 'KYC Cancelled — Please Resubmit'
                      : 'Identity Verification Pending'}
                  </strong>
                  <span>
                    {kycStatus === 'rejected'
                      ? ' — Your documents were not accepted. Correct the details and resubmit.'
                      : kycStatus === 'cancelled'
                      ? ' — Your previous submission was cancelled. Please submit new documents.'
                      : ' — Verify your identity to unlock full platform features.'}
                  </span>
                </div>
              </div>
              <button
                className='apb-btn'
                onClick={() => {
                  setActivePage('KYCVerification')
                  localStorage.setItem('ep_activePage', 'KYCVerification')
                }}
              >
                {kycStatus === 'rejected' ? 'Resubmit KYC →' : kycStatus === 'cancelled' ? 'Resubmit →' : 'Verify Now →'}
              </button>
            </div>
          )}

        {/* KYC Under Review Banner */}
        {kycStatus === 'pending' && activePage !== 'KYCVerification' && (
          <div className='account-pending-banner account-pending-banner--info'>
            <div className='apb-content'>
              <span className='apb-icon'>🔍</span>
              <div>
                <strong>KYC Under Review</strong>
                <span>
                  {' '}
                  — Your identity documents have been submitted and are being
                  reviewed. We will notify you within 24–48 hours.
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Account Pending Banner — incomplete payment/KYC setup */}
        {accountStatus && accountStatus !== 'active' && !showAccountSetup && (
          <div className='account-pending-banner'>
            <div className='apb-content'>
              <span className='apb-icon'>🔐</span>
              <div>
                <strong>
                  {accountStatus === 'pending_kyc'
                    ? 'Complete Identity Verification (KYC)'
                    : 'Connect Your Payout Account'}
                </strong>
                <span>
                  {accountStatus === 'pending_kyc'
                    ? ' — Verify your identity to list properties and receive payments.'
                    : ' — Link your bank account to receive payments from tenants and buyers.'}
                </span>
              </div>
            </div>
            <button
              className='apb-btn'
              onClick={() => setShowAccountSetup(true)}
            >
              Complete Setup →
            </button>
          </div>
        )}

        {/* ── Free Trial Countdown Banner ─────────────────────────────── */}
        {(() => {
          const plan = livePlan || user?.plan
          if (!plan?.isOnTrial || !plan?.trialEndsAt) return null
          const msLeft   = new Date(plan.trialEndsAt) - new Date()
          const daysLeft = Math.ceil(msLeft / (1000 * 60 * 60 * 24))
          if (daysLeft < 0) return null  // expired — let backend handle downgrade

          const isUrgent = daysLeft <= 3
          const isWarning = daysLeft <= 7

          return (
            <div className={`account-pending-banner${isUrgent ? ' account-pending-banner--urgent' : isWarning ? ' account-pending-banner--warning' : ' account-pending-banner--trial'}`}>
              <div className='apb-content'>
                <span className='apb-icon'>{isUrgent ? '⏰' : '🎁'}</span>
                <div>
                  <strong>
                    {daysLeft === 0
                      ? 'Your free trial expires today!'
                      : daysLeft === 1
                      ? '1 day left on your free trial'
                      : `${daysLeft} days left on your free trial`}
                  </strong>
                  <p style={{ margin: '2px 0 0', fontSize: 13, opacity: 0.85 }}>
                    Trial ends {new Date(plan.trialEndsAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}.
                    Upgrade to keep your listings active.
                  </p>
                </div>
              </div>
              <button
                className='apb-btn'
                onClick={() => { setActivePage('Settings'); localStorage.setItem('ep_activePage', 'Settings') }}
              >
                Upgrade Plan →
              </button>
            </div>
          )
        })()}

        <main className='admin-content' role='main'>
          {renderPage()}
        </main>

        <footer className='admin-footer'>
          <span>© {new Date().getFullYear()} Propnekt. All rights reserved.</span>
          <span>
            <a href='/about' target='_blank' rel='noopener noreferrer'>About</a>
            {' · '}
            <a href='/contact' target='_blank' rel='noopener noreferrer'>Support</a>
            {' · '}
            <a href='#' rel='noopener noreferrer'>Privacy Policy</a>
          </span>
        </footer>
      </div>

      {/* Mobile bottom tab bar — replaces sidebar on small screens */}
      {isMobile && (
        <MobileTabBar
          userRole={userRole}
          activePage={activePage}
          onNavigate={page => {
            setActivePage(page)
            localStorage.setItem('ep_activePage', page)
          }}
        />
      )}
    </div>
  )
}
