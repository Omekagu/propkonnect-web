// component/sidebar/AppHeader.jsx
// Updated example showing how to integrate logout functionality

'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import './admin.scss'

export default function AppHeader ({
  onOpenMobileSidebar,
  onToggleTheme,
  user,
  onLogout // Add this parameter
}) {
  const router = useRouter()
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  // Handle logout with confirmation
  const handleLogout = () => {
    setShowLogoutConfirm(true)
  }

  // Confirm logout
  const confirmLogout = () => {
    setShowLogoutConfirm(false)
    setIsUserMenuOpen(false)
    onLogout() // This will trigger the auth system logout
  }

  // Cancel logout
  const cancelLogout = () => {
    setShowLogoutConfirm(false)
  }

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

      {/* Search Bar (Optional) */}
      <div className='header-center'>
        <div className='search-bar'>
          <svg
            width='18'
            height='18'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
          >
            <circle cx='11' cy='11' r='8' />
            <path d='m21 21-4.35-4.35' />
          </svg>
          <input type='text' placeholder='Search...' className='search-input' />
        </div>
      </div>

      {/* Right Actions */}
      <div className='header-right'>
        {/* Notifications */}
        <button className='header-icon-btn' title='Notifications'>
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
          <span className='notification-badge'>3</span>
        </button>

        {/* Theme Toggle */}
        <button
          className='header-icon-btn'
          onClick={onToggleTheme}
          title='Toggle theme'
        >
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
        </button>

        {/* User Menu */}
        <div className='user-menu-container'>
          <button
            className='user-menu-btn'
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            title={user?.email || 'User menu'}
          >
            <div className='user-avatar'>
              {user?.avatar ? (
                <img src={user.avatar} alt={user.email} />
              ) : (
                <span>{user?.email?.charAt(0)?.toUpperCase() || 'U'}</span>
              )}
            </div>
            <span className='user-name'>{user?.email || 'User'}</span>
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

          {/* User Dropdown Menu */}
          {isUserMenuOpen && (
            <div className='user-menu-dropdown'>
              {/* User Info */}
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

              {/* Menu Items */}
              <button className='menu-item'>
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

              <button className='menu-item'>
                <svg
                  width='18'
                  height='18'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                >
                  <circle cx='12' cy='12' r='1' />
                  <path d='M12 1v6m0 6v6' />
                  <path d='M4.22 4.22l4.24 4.24m5.08 5.08l4.24 4.24' />
                  <path d='M1 12h6m6 0h6' />
                  <path d='M4.22 19.78l4.24-4.24m5.08-5.08l4.24-4.24' />
                </svg>
                <span>Settings</span>
              </button>

              <button className='menu-item'>
                <svg
                  width='18'
                  height='18'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                >
                  <circle cx='12' cy='12' r='10' />
                  <path d='M12 6v6l4 2' />
                </svg>
                <span>Activity</span>
              </button>

              <div className='menu-divider' />

              {/* Logout Button */}
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
            <div className='confirm-icon'>⚠️</div>
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
