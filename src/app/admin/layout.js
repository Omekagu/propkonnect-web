'use client'

import React, { useState, useEffect } from 'react'
import '@/component/sidebar/admin.scss'
import Sidebar from '@/component/sidebar/Sidebar'
import AppHeader from '@/component/sidebar/AppHeader'
import AddProperty from '@/component/admin/addproperty/AddProperty'
import Tenant from '@/component/admin/Tenants/Tenant'
import Finance from '@/component/admin/Finances/Finance'
import Document from '@/component/admin/Documents/Document'
import Report from '@/component/admin/Reports/Report'
import Maintenance from '@/component/admin/Maintenance/Maintenance'
import UserManagement from '@/component/admin/UserManagement/UserManagement'
import Settings from '@/component/admin/Settings/Settings'
import Help from '@/component/admin/Help/Help'
import PaymentMethod from '@/component/admin/paymentMethod/PaymentMethod'
import UploadPortfolio from '@/component/admin/UploadPortfolio/UploadPortfolio'
import AdminDashboard from '@/component/admin/Admindashboard/AdminDashboard'
import UploadProperty from '@/component/admin/UploadProperty/UploadProperty'

// Property Owner Components (create these as needed)
import PropertyOwnerDashboard from '@/component/property-owner/Dashboard/Dashboard'
import MyProperties from '@/component/property-owner/Properties/MyProperties'
import FindArtisan from '@/component/property-owner/Artisan/FindArtisan'

// Artisan Components (create these as needed)
import ArtisanDashboard from '@/component/artisan/Dashboard/Dashboard'
import AvailableJobs from '@/component/artisan/Jobs/AvailableJobs/AvailableJobs'
import ActiveJobs from '@/component/artisan/Jobs/ActiveJobs/ActiveJobs'
import JobHistory from '@/component/artisan/Jobs/JobHistory/JobHistory'
import Earnings from '@/component/artisan/Earnings/Earnings'
import Schedule from '@/component/artisan/Schedule/Schedule'
import Portfolio from '@/component/artisan/Portfolio/Portfolio'
import Certifications from '@/component/artisan/Certifications/Certifications'

// Tenant Components (create these as needed)
import TenantDashboard from '@/component/tenant/Dashboard/Dashboard'
import MyHome from '@/component/tenant/Home/Home'
import TenantPayments from '@/component/tenant/Payments/Payments'
import TenantMaintenance from '@/component/tenant/Maintenance/Maintenance'
import Messages from '@/component/tenant/Messages/Messages'
import axios from 'axios'
import PropertyManagementDashboard from '@/component/admin/PropertyManagementDashboard/PropertyManagementDashboard'
import Artisan from '@/component/admin/Artisan/Artisan'
import FinanceDashboard from '@/component/tenant/Finance/Finance'

export default function AdminLayout ({ children }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [activePage, setActivePage] = useState('Dashboard')
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // ✅ ALL useEffect hooks BEFORE any returns
  useEffect(() => {
    const fetchUser = async () => {
      const authToken = localStorage.getItem('authToken')
      if (!authToken) {
        setLoading(false)
        return
      }

      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/id`,
          { headers: { Authorization: `Bearer ${authToken}` } }
        )
        setUser(res.data.user)
      } catch (err) {
        console.error('Failed to fetch user:', err)
        setError('Failed to load user data')
      } finally {
        setLoading(false)
      }
    }
    fetchUser()
  }, [])

  useEffect(() => {
    const onResize = () => {
      setIsMobile(window.innerWidth < 900)
      if (window.innerWidth >= 900) setMobileSidebarOpen(false)
    }
    onResize()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    const onKey = e => {
      if (e.key === 'Escape') setMobileSidebarOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // ✅ NOW do conditional returns AFTER all hooks
  if (loading) {
    return <div className='loading-state'>Loading...</div>
  }

  if (error || !user) {
    return <div className='error-state'>{error || 'Please log in'}</div>
  }

  const userRole = user.role || 'property-owner'

  // Role-based page rendering
  const renderPage = () => {
    // Admin Pages (super-admin, sub-admin, property-admin, artisan-admin)
    const adminRoles = [
      'super-admin',
      'sub-admin',
      'property-admin',
      'artisan-admin'
    ]

    if (adminRoles.includes(userRole)) {
      switch (activePage) {
        case 'Dashboard':
          return <AdminDashboard />
        case 'PropertyManagement':
          return <PropertyManagementDashboard />
        // return <AddProperty />
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
        case 'Help':
          return <Help />
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
        case 'Help':
          return <Help />
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
        case 'Help':
          return <Help />
        default:
          return <ArtisanDashboard />
      }
    }

    // Tenant Pages
    if (userRole === 'user' || userRole === 'tenant') {
      switch (activePage) {
        case 'Dashboard':
          return <TenantDashboard />
        case 'MyLease':
          return <MyLease />
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
        case 'Help':
          return <Help />
        default:
          return <TenantDashboard />
      }
    }

    // Fallback
    return <div className='page-placeholder'>Page Not Found</div>
  }

  return (
    <div className='admin-shell'>
      <Sidebar
        userRole={userRole}
        collapsed={sidebarCollapsed}
        mobileOpen={mobileSidebarOpen}
        onRouteChange={setActivePage}
        onCloseMobile={() => setMobileSidebarOpen(false)}
        onToggleCollapse={() => setSidebarCollapsed(s => !s)}
      />

      <div className='main-column'>
        <AppHeader
          onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
          onToggleTheme={() => alert('Toggle theme (wire up)')}
          user={user}
        />

        <main className='admin-content' role='main'>
          {renderPage()}
        </main>
      </div>
    </div>
  )
}
