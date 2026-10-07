// component/sidebar/AppHeader.jsx
'use client'

import React, { useState, useRef, useEffect } from 'react'
import './admin.scss'

// Map page keys to human-readable titles
const PAGE_TITLES = {
  Dashboard: 'Dashboard',
  UserManagement: 'User Management',
  PropertyManagement: 'Properties',
  ArtisanManagement: 'Artisans',
  Finance: 'Finance',
  // Maintenance: 'Maintenance',
  Reports: 'Reports',
  Analytics: 'Analytics',
  Documents: 'Documents',
  AdminPermissions: 'Permissions',
  Settings: 'Settings',
  Security: 'Security',
  Help: 'Help & Support',
  MyProperties: 'My Properties',
  Tenants: 'Tenants',
  Payments: 'Payments',
  FindArtisan: 'Find Artisan',
  AvailableJobs: 'Available Jobs',
  ActiveJobs: 'Active Jobs',
  JobHistory: 'Job History',
  Earnings: 'Earnings',
  Schedule: 'Schedule',
  Portfolio: 'Portfolio',
  Certifications: 'Certifications',
  Negotiations: 'My Bids & Negotiations',
  MyHome: 'My Home',
  Messages: 'Messages',
  SupportTickets: 'Support Tickets',
  PlatformSettings: 'Platform Settings',
  EmailTemplates: 'Email Templates',
  PropertyUpload: 'Upload Property',
  PropertyOwners: 'Property Owners',
  MyApplications: 'My Applications',
  Applicants: 'Applicants'
}

export default function AppHeader ({
  onOpenMobileSidebar,
  onToggleTheme,
  isDark = false,
  user,
  onLogout,
  currentPage,
  onRouteChange,
  // Notification props from layout
  notifications = [],
  unreadCount = 0,
  onMarkAsRead,
  onMarkAllAsRead,
  onDeleteNotification,
  onClearAll,
  // Message props from layout
  unreadMsgCount = 0,
  onOpenMessages
}) {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)

  const notifRef = useRef(null)
  const userMenuRef = useRef(null)

  const navigateTo = key => {
    if (onRouteChange) onRouteChange(key)
    setIsUserMenuOpen(false)
  }

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClick = e => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false)
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setIsUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleLogout = () => setShowLogoutConfirm(true)
  const confirmLogout = () => {
    setShowLogoutConfirm(false)
    setIsUserMenuOpen(false)
    onLogout()
  }
  const cancelLogout = () => setShowLogoutConfirm(false)

  const handleNotifClick = notif => {
    if (!notif.isRead && onMarkAsRead) onMarkAsRead(notif._id)
  }

  const timeAgo = date => {
    const diff = Math.floor((Date.now() - new Date(date)) / 1000)
    if (diff < 60) return `${diff}s ago`
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
    return `${Math.floor(diff / 86400)}d ago`
  }

  const appName = process.env.NEXT_PUBLIC_APP_NAME || 'Propnekt'

  return (
    <header className='app-header'>
      {/* Mobile Sidebar Toggle */}
      <div className='header-left'>
        <button
          className='menu-toggle'
          onClick={onOpenMobileSidebar}
          aria-label='Open sidebar'
        >
          <svg
            width='24'
            height='24'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
          >
            <line x1='3' y1='6' x2='21' y2='6' strokeWidth='2' />
            <line x1='3' y1='12' x2='21' y2='12' strokeWidth='2' />
            <line x1='3' y1='18' x2='21' y2='18' strokeWidth='2' />
          </svg>
        </button>
      </div>

      {/* Workspace Switcher */}
      <div className='workspace-switcher'>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src='/Propnekt_logo.png' alt={appName} className='workspace-logo' />
        <svg
          className='workspace-chevron'
          viewBox='0 0 24 24'
          fill='none'
          stroke='currentColor'
          strokeWidth='2'
        >
          <polyline points='6 9 12 15 18 9' />
        </svg>
      </div>

      {/* Search Bar */}
      {/* <div className='header-center'>
        <div className='search-bar'>
          <svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor'>
            <circle cx='11' cy='11' r='8' />
            <path d='m21 21-4.35-4.35' />
          </svg>
          <input type='text' placeholder='Search...' className='search-input' />
        </div>
      </div> */}

      {/* Right Actions */}
      <div className='header-right'>
        {/* ── Messages ── */}
        <button
          className='header-icon-btn'
          title='Messages'
          onClick={onOpenMessages}
          aria-label='Messages'
        >
          <svg
            width='20'
            height='20'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
          >
            <path d='M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z' />
          </svg>
          {unreadMsgCount > 0 && (
            <span className='notification-badge'>
              {unreadMsgCount > 99 ? '99+' : unreadMsgCount}
            </span>
          )}
        </button>

        {/* ── Notifications ── */}
        <div className='notif-container' ref={notifRef}>
          <button
            className='header-icon-btn'
            title='Notifications'
            onClick={() => setNotifOpen(o => !o)}
            aria-label='Notifications'
          >
            <svg
              width='20'
              height='20'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
            >
              <path d='M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9' />
              <path d='M13.73 21a2 2 0 0 1-3.46 0' />
            </svg>
            {unreadCount > 0 && (
              <span className='notification-badge'>
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className='notif-dropdown'>
              <div className='notif-header'>
                <span className='notif-title'>Notifications</span>
                <div className='notif-header-actions'>
                  {unreadCount > 0 && onMarkAllAsRead && (
                    <button
                      className='notif-action-btn'
                      onClick={onMarkAllAsRead}
                      title='Mark all as read'
                    >
                      Mark all read
                    </button>
                  )}
                  {notifications.length > 0 && onClearAll && (
                    <button
                      className='notif-action-btn notif-clear-btn'
                      onClick={onClearAll}
                      title='Clear all'
                    >
                      Clear all
                    </button>
                  )}
                </div>
              </div>

              <div className='notif-list'>
                {notifications.length === 0 ? (
                  <div className='notif-empty'>
                    <svg
                      width='32'
                      height='32'
                      viewBox='0 0 24 24'
                      fill='none'
                      stroke='currentColor'
                      strokeWidth='1.5'
                    >
                      <path d='M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9' />
                      <path d='M13.73 21a2 2 0 0 1-3.46 0' />
                    </svg>
                    <p>No notifications</p>
                  </div>
                ) : (
                  [
                    ...new Map(
                      notifications.map(n => [n._id ?? n.id, n])
                    ).values()
                  ].map((notif, i) => (
                    <div
                      key={notif._id ?? notif.id ?? i}
                      className={`notif-item ${
                        !notif.isRead ? 'notif-unread' : ''
                      }`}
                      onClick={() => handleNotifClick(notif)}
                    >
                      <div className='notif-item-body'>
                        <p className='notif-item-title'>{notif.title}</p>
                        <p className='notif-item-msg'>{notif.message}</p>
                        <span className='notif-item-time'>
                          {timeAgo(notif.createdAt)}
                        </span>
                      </div>
                      {onDeleteNotification && (
                        <button
                          className='notif-delete-btn'
                          onClick={e => {
                            e.stopPropagation()
                            onDeleteNotification(notif._id)
                          }}
                          title='Remove'
                          aria-label='Delete notification'
                        >
                          <svg
                            width='14'
                            height='14'
                            viewBox='0 0 24 24'
                            fill='none'
                            stroke='currentColor'
                            strokeWidth='2'
                          >
                            <line x1='18' y1='6' x2='6' y2='18' />
                            <line x1='6' y1='6' x2='18' y2='18' />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Theme Toggle */}
        {/* <button
          className={`header-icon-btn theme-toggle-btn${
            isDark ? ' active' : ''
          }`}
          onClick={onToggleTheme}
          title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDark ? (
            // Sun icon — click to go light
            <svg
              width='20'
              height='20'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
            >
              <circle cx='12' cy='12' r='5' />
              <line x1='12' y1='1' x2='12' y2='3' />
              <line x1='12' y1='21' x2='12' y2='23' />
              <line x1='4.22' y1='4.22' x2='5.64' y2='5.64' />
              <line x1='18.36' y1='18.36' x2='19.78' y2='19.78' />
              <line x1='1' y1='12' x2='3' y2='12' />
              <line x1='21' y1='12' x2='23' y2='12' />
              <line x1='4.22' y1='19.78' x2='5.64' y2='18.36' />
              <line x1='18.36' y1='5.64' x2='19.78' y2='4.22' />
            </svg>
          ) : (
            // Moon icon — click to go dark
            <svg
              width='20'
              height='20'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
            >
              <path d='M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z' />
            </svg>
          )}
        </button> */}

        {/* User Menu */}
        <div className='user-menu-container' ref={userMenuRef}>
          <button
            className='user-menu-btn'
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            title={user?.email || 'User menu'}
          >
            <div className='user-avatar'>
              {user?.avatar ? (
                <img src={user.avatar} alt={user.email} />
              ) : (
                <span>
                  {user?.firstName?.charAt(0)?.toUpperCase() ||
                    user?.email?.charAt(0)?.toUpperCase() ||
                    'U'}
                </span>
              )}
            </div>
            <span className='user-name'>
              {user?.firstName
                ? `${user.firstName} ${user.lastName || ''}`.trim()
                : user?.email || 'User'}
            </span>
            <svg
              width='16'
              height='16'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              className={`chevron ${isUserMenuOpen ? 'open' : ''}`}
            >
              <polyline points='6 9 12 15 18 9' />
            </svg>
          </button>

          {isUserMenuOpen && (
            <div className='user-menu-dropdown'>
              <div className='user-info'>
                <div className='user-avatar-large'>
                  {user?.avatar ? (
                    <img src={user.avatar} alt={user.email} />
                  ) : (
                    <span>{user?.email?.charAt(0)?.toUpperCase() || 'U'}</span>
                  )}
                </div>
                <div className='user-details'>
                  <p className='user-fullname'>{user?.email || 'User'}</p>
                  <p className='user-email'>
                    {user?.email || 'user@example.com'}
                  </p>
                  <p className='user-role'>{user?.role || 'User'}</p>
                </div>
              </div>

              <div className='menu-divider' />

              <button
                className='menu-item'
                onClick={() => navigateTo('Profile')}
              >
                <svg
                  width='18'
                  height='18'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                >
                  <path d='M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2' />
                  <circle cx='12' cy='7' r='4' />
                </svg>
                <span>Profile</span>
              </button>

              <button
                className='menu-item'
                onClick={() => navigateTo('Settings')}
              >
                <svg
                  width='18'
                  height='18'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                >
                  <circle cx='12' cy='12' r='3' />
                  <path d='M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z' />
                </svg>
                <span>Settings</span>
              </button>

              <div className='menu-divider' />

              <button
                className='menu-item menu-item-danger'
                onClick={handleLogout}
              >
                <svg
                  width='18'
                  height='18'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                >
                  <path d='M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4' />
                  <polyline points='16 17 21 12 16 7' />
                  <line x1='21' y1='12' x2='9' y2='12' />
                </svg>
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className='logout-confirm-overlay'>
          <div className='logout-confirm-modal'>
            <div className='confirm-icon'>
              <svg
                width='16'
                height='16'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
              >
                <path d='M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z' />
                <line x1='12' y1='9' x2='12' y2='13' />
                <line x1='12' y1='17' x2='12' y2='17.01' />
              </svg>
            </div>
            <h3>Confirm Logout</h3>
            <p>Are you sure you want to logout?</p>
            <div className='confirm-actions'>
              <button className='btn btn-secondary' onClick={cancelLogout}>
                Cancel
              </button>
              <button className='btn btn-danger' onClick={confirmLogout}>
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
