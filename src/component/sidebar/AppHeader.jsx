'use client'
import React, { useEffect, useState } from 'react'
import './admin.scss'
import axios from 'axios'

export default function AppHeader ({
  onOpenMobileSidebar = () => {},
  onToggleTheme = () => {}
}) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token')
      if (!token) return setLoading(false)
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/id`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        )
        setUser(res.data.user) // ✅ properly extract the user
        console.log(res.data.user)
      } catch (err) {
        console.error('❌ Failed to fetch user:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchUser()
  }, [])

  return (
    <header className='admin-header'>
      <div className='header-left'>
        <button className='mobile-menu-btn' onClick={onOpenMobileSidebar}>
          <svg width='20' height='20' viewBox='0 0 24 24'>
            <path
              d='M3 12h18M3 6h18M3 18h18'
              stroke='currentColor'
              strokeWidth='1.6'
              strokeLinecap='round'
              strokeLinejoin='round'
            />
          </svg>
        </button>

        <div className='header-search'>
          <input placeholder='Search properties, tenants, docs...' />
          <button className='search-btn'>
            <svg width='16' height='16' viewBox='0 0 24 24'>
              <path
                d='M21 21l-4.35-4.35'
                stroke='currentColor'
                strokeWidth='1.6'
                strokeLinecap='round'
                strokeLinejoin='round'
              />
              <circle
                cx='11'
                cy='11'
                r='6'
                stroke='currentColor'
                strokeWidth='1.6'
                fill='none'
              />
            </svg>
          </button>
        </div>
      </div>

      <div className='header-right'>
        <button className='icon-btn' aria-label='Notifications'>
          <svg width='18' height='18' viewBox='0 0 24 24'>
            <path
              d='M15 17H9v-6a6 6 0 1112 0v6h-6zM13 21a2 2 0 11-4 0'
              stroke='currentColor'
              strokeWidth='1.4'
              strokeLinecap='round'
              strokeLinejoin='round'
              fill='none'
            />
          </svg>
        </button>

        <button className='icon-btn' onClick={onToggleTheme}>
          <svg width='18' height='18' viewBox='0 0 24 24'>
            <path
              d='M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4'
              stroke='currentColor'
              strokeWidth='1.4'
              strokeLinecap='round'
              strokeLinejoin='round'
              fill='none'
            />
          </svg>
        </button>

        {loading ? (
          <div className='user-loading'>Loading...</div>
        ) : user ? (
          <div className='user-dropdown'>
            <img
              src={user.avatar || '/avatar-placeholder.jpg'}
              alt={user.name || 'User avatar'}
              className='avatar'
            />
            <div className='user-info'>
              <div className='user-name'>{user.email}</div>
              <div className='user-role'>{user.role}</div>
            </div>
          </div>
        ) : (
          <div className='user-dropdown'>
            <div className='user-info'>
              <div className='user-name'>Guest</div>
              <div className='user-role'>No Access</div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
