// hooks/useAuth.ts

'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  getOrCreateDeviceId,
  isAuthenticated,
  clearAuthData,
  setAuthData,
  broadcastLogout,
  getAuthToken,
  getUserData
} from '@/libs/auth.utils'

export interface UseAuthReturn {
  isLoggedIn: boolean
  isLoading: boolean
  user: any
  token: string | null
  logout: () => void
  login: (token: string, userData: any) => void
  checkAuth: () => boolean
}

export const useAuth = (): UseAuthReturn => {
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState(null)
  const [token, setToken] = useState<string | null>(null)

  // Check authentication status
  const checkAuth = useCallback(() => {
    const authenticated = isAuthenticated()
    if (authenticated) {
      const authToken = getAuthToken()
      const userData = getUserData()
      setToken(authToken)
      setUser(userData)
      setIsLoggedIn(true)
      return true
    } else {
      setIsLoggedIn(false)
      setToken(null)
      setUser(null)
      return false
    }
  }, [])

  // Initial auth check
  useEffect(() => {
    const checkInitialAuth = async () => {
      setIsLoading(true)
      checkAuth()
      setIsLoading(false)
    }

    checkInitialAuth()
  }, [checkAuth])

  // Listen for auth changes across tabs
  useEffect(() => {
    const handleAuthChange = (event: any) => {
      const { detail } = event as CustomEvent

      if (detail.status === 'login') {
        setIsLoggedIn(true)
        setToken(detail.token)
        setUser(detail.userData)
      } else if (detail.status === 'logout') {
        setIsLoggedIn(false)
        setToken(null)
        setUser(null)
      } else if (detail.status === 'device-logout') {
        // Different device logged in
        clearAuthData()
        setIsLoggedIn(false)
        setToken(null)
        setUser(null)
        router.push('/auth/login?reason=device-changed')
      }
    }

    window.addEventListener('authStatusChanged', handleAuthChange)

    return () => {
      window.removeEventListener('authStatusChanged', handleAuthChange)
    }
  }, [router])

  // Logout function
  const logout = useCallback(() => {
    clearAuthData()
    setIsLoggedIn(false)
    setToken(null)
    setUser(null)
    broadcastLogout()
    router.push('/auth/login')
  }, [router])

  // Login function
  const login = useCallback((authToken: string, userData: any) => {
    setAuthData(authToken, userData)
    setToken(authToken)
    setUser(userData)
    setIsLoggedIn(true)
  }, [])

  return {
    isLoggedIn,
    isLoading,
    user,
    token,
    logout,
    login,
    checkAuth
  }
}

/**
 * Hook to protect routes - redirect if not logged in
 */
export const useProtectedRoute = () => {
  const router = useRouter()
  const { isLoggedIn, isLoading } = useAuth()

  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      router.push('/auth/login')
    }
  }, [isLoggedIn, isLoading, router])

  return { isLoading, isLoggedIn }
}

/**
 * Hook to prevent access to auth pages when logged in
 */
export const useAuthPageGuard = () => {
  const router = useRouter()
  const { isLoggedIn, isLoading, user } = useAuth()

  useEffect(() => {
    if (!isLoading && isLoggedIn) {
      const adminRoles = [
        'super-admin',
        'sub-admin',
        'property-admin',
        'property-owner',
        'artisan',
        'sub-property-admin',
        'artisan-admin',
        'sub-artisan-admin'
      ]

      if (user?.role && adminRoles.includes(user.role)) {
        router.push('/admin/dashboard')
      } else {
        router.push('/user/dashboard')
      }
    }
  }, [isLoggedIn, isLoading, user, router])

  return { isLoading }
}
