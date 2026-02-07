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
import UploadProperty from '@/component/admin/UploadProperty/UploadProperty'

// Property Owner Components
import PropertyOwnerDashboard from '@/component/property-owner/Dashboard/Dashboard'
import MyProperties from '@/component/property-owner/Properties/MyProperties'
import FindArtisan from '@/component/property-owner/Artisan/FindArtisan'

// Artisan Components
import ArtisanDashboard from '@/component/artisan/Dashboard/Dashboard'
import AvailableJobs from '@/component/artisan/Jobs/AvailableJobs/AvailableJobs'
import ActiveJobs from '@/component/artisan/Jobs/ActiveJobs/ActiveJobs'
import JobHistory from '@/component/artisan/Jobs/JobHistory/JobHistory'
import Earnings from '@/component/artisan/Earnings/Earnings'
import Schedule from '@/component/artisan/Schedule/Schedule'
import Portfolio from '@/component/artisan/Portfolio/Portfolio'
import Certifications from '@/component/artisan/Certifications/Certifications'

// Tenant Components
import TenantDashboard from '@/component/tenant/Dashboard/Dashboard'
import MyHome from '@/component/tenant/Home/Home'
import TenantPayments from '@/component/tenant/Payments/Payments'
import TenantMaintenance from '@/component/tenant/Maintenance/Maintenance'
import Messages from '@/component/tenant/Messages/Messages'

// Support Ticket Components
import SupportTicketForm from '@/component/user/SupportTicketForm/SupportTicketForm'
import SupportTicketAdmin from '@/component/user/SupportTicketAdmin/SupportTicketAdmin'
import SupportTicketList from '@/component/user/SupportTicketList/SupportTicketList'

import PropertyManagementDashboard from '@/component/admin/PropertyManagementDashboard/PropertyManagementDashboard'
import Artisan from '@/component/admin/Artisan/Artisan'
import FinanceDashboard from '@/component/tenant/Finance/Finance'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import './layout.scss'

export default function AdminLayout ({ children }) {
  const router = useRouter()
  const { isLoggedIn, isLoading, user, logout, checkAuth } = useAuth()

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [activePage, setActivePage] = useState('Dashboard')
  const [error, setError] = useState(null)
  const [sessionWarning, setSessionWarning] = useState(false)
  const [sessionTimeoutWarning, setSessionTimeoutWarning] = useState(false)
  const [supportTicketCount, setSupportTicketCount] = useState(0)

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

      if (detail.status === 'logout') {
        // Another tab logged out
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

  const userRole = user?.role || 'property-owner'

  // ✅ Role-based page rendering with proper support ticket routing
  const renderPage = () => {
    // Admin Roles (for main dashboard access)
    const adminRoles = [
      'super-admin',
      'sub-admin',
      'property-admin',
      'artisan-admin',
      'sub-property-admin',
      'sub-artisan-admin'
    ]

    // Support ticket admin roles (ONLY these can access SupportTicketAdmin)
    const supportAdminRoles = ['super-admin', 'support-admin']

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

    // Help page - super-admin should see admin dashboard, not form
    if (activePage === 'Help') {
      if (isSupportAdmin) {
        return <SupportTicketAdmin userRole={userRole} />
      } else {
        return <SupportTicketForm userEmail={user?.email} />
      }
    }

    // Create Ticket - super-admin should see admin dashboard, not form
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
          return <PropertyManagementDashboard />
        case 'MyProperties':
          return <MyProperties />
        case 'PropertyUpload':
          return <UploadProperty />
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
        case 'PaymentMethod':
          return <PaymentMethod />
        case 'Documents':
        case 'Document':
          return <Document />
        case 'Reports':
        case 'Report':
          return <Report />
        case 'Maintenance':
        case 'ActiveJobs':
          return <ActiveJobs />
        case 'UserManagement':
          return <UserManagement />
        case 'Analytics':
          return <Report />
        case 'Reviews':
          return <Report />
        case 'Settings':
          return <Settings />
        case 'Security':
          return <Settings />
        default:
          return <AdminDashboard />
      }
    }

    // Property Owner Pages
    if (userRole === 'property-owner') {
      switch (activePage) {
        case 'Dashboard':
          return <PropertyOwnerDashboard />
        case 'MyProperties':
          return <MyProperties />
        case 'PropertyUpload':
          return <UploadProperty />
        case 'Tenants':
          return <Tenant />
        case 'Maintenance':
          return <Maintenance />
        case 'Payments':
          return <Finance />
        case 'Documents':
          return <Document />
        case 'Reports':
          return <Report />
        case 'FindArtisan':
          return <FindArtisan />
        case 'Profile':
          return <Settings />
        case 'Settings':
          return <Settings />
        default:
          return <PropertyOwnerDashboard />
      }
    }

    // Artisan Pages
    if (userRole === 'artisan') {
      switch (activePage) {
        case 'Dashboard':
          return <ArtisanDashboard />
        case 'AvailableJobs':
          return <AvailableJobs />
        case 'ActiveJobs':
          return <ActiveJobs />
        case 'JobHistory':
          return <JobHistory />
        case 'Earnings':
          return <Earnings />
        case 'Schedule':
          return <Schedule />
        case 'Portfolio':
          return <Portfolio />
        case 'Certifications':
          return <Certifications />
        case 'Profile':
          return <Settings />
        case 'Settings':
          return <Settings />
        default:
          return <ArtisanDashboard />
      }
    }

    // Tenant Pages
    if (userRole === 'user' || userRole === 'tenant') {
      switch (activePage) {
        case 'Dashboard':
          return <TenantDashboard />
        case 'Finance':
          return <FinanceDashboard />
        case 'FindArtisan':
          return <FindArtisan />
        case 'MyHome':
          return <MyHome />
        case 'Payments':
          return <TenantPayments />
        case 'Maintenance':
          return <TenantMaintenance />
        case 'Documents':
          return <Document />
        case 'Messages':
          return <Messages />
        case 'Profile':
          return <Settings />
        case 'Settings':
          return <Settings />
        default:
          return <TenantDashboard />
      }
    }

    // Fallback
    return <div className='page-placeholder'>Page Not Found</div>
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
        collapsed={sidebarCollapsed}
        mobileOpen={mobileSidebarOpen}
        onRouteChange={setActivePage}
        onCloseMobile={() => setMobileSidebarOpen(false)}
        onToggleCollapse={() => setSidebarCollapsed(s => !s)}
        supportTicketCount={supportTicketCount}
      />

      <div className='main-column'>
        <AppHeader
          onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
          onToggleTheme={() => alert('Toggle theme (wire up)')}
          user={user}
          onLogout={logout}
          supportTicketCount={supportTicketCount}
        />

        <main className='admin-content' role='main'>
          {renderPage()}
        </main>
      </div>
    </div>
  )
}
