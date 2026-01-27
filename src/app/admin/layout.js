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

export default function AdminLayout ({ children, user = {} }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [activePage, setActivePage] = useState('AdminDashboard')

  const renderPage = () => {
    switch (activePage) {
      case 'AdminDashboard':
        return <AdminDashboard />
      case 'PropertyManagement':
        return <AddProperty />
      case 'PropertyUpload':
        return <UploadProperty />
      case 'Artisan Management':
        return <UploadPortfolio />
      case 'Tenant':
        return <Tenant />
      case 'Finance':
        return <Finance />
      case 'PaymentMethod':
        return <PaymentMethod />
      case 'Document':
        return <Document />
      case 'Report':
        return <Report />
      case 'Maintenance':
        return <Maintenance />
      case 'UserManagement':
        return <UserManagement />
      case 'Settings':
        return <Settings />
      case 'Help':
        return <Help />
      default:
        return <div className='page-placeholder'>Page Not Found</div>
    }
  }

  useEffect(() => {
    const onResize = () => {
      setIsMobile(window.innerWidth < 900)
      // auto close overlay when switching to desktop
      if (window.innerWidth >= 900) setMobileSidebarOpen(false)
    }
    onResize()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  // close mobile with esc
  useEffect(() => {
    const onKey = e => {
      if (e.key === 'Escape') setMobileSidebarOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <div className='admin-shell'>
      <Sidebar
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
