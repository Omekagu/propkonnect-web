'use client'

import React, { useState, useEffect } from 'react'
import '@/component/sidebar/admin.scss'
import Sidebar from '@/component/sidebar/Sidebar'
import AppHeader from '@/component/sidebar/AppHeader'

export default function AdminLayout ({ children, user = {} }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

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
          {children}
        </main>
      </div>
    </div>
  )
}
