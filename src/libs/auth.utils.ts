// lib/auth.utils.ts

/**
 * Generate a unique device fingerprint
 */
export const generateDeviceFingerprint = (): string => {
  const fingerprint = `${navigator.userAgent}-${
    navigator.language
  }-${new Date().getTimezoneOffset()}-${
    navigator.hardwareConcurrency || 'unknown'
  }`
  return btoa(fingerprint)
}

/**
 * Create a unique device ID
 */
export const createDeviceId = (): string => {
  const fingerprint = generateDeviceFingerprint()
  return `${fingerprint}-${Date.now()}`
}

/**
 * Get or create device ID from localStorage
 */
export const getOrCreateDeviceId = (): string => {
  if (typeof window === 'undefined') return ''

  let deviceId = localStorage.getItem('deviceId')
  if (!deviceId) {
    deviceId = createDeviceId()
    localStorage.setItem('deviceId', deviceId)
  }
  return deviceId
}

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  if (typeof window === 'undefined') return false

  const authToken = localStorage.getItem('authToken')
  const deviceId = localStorage.getItem('deviceId')
  const currentDeviceId = getOrCreateDeviceId()

  return !!authToken && deviceId === currentDeviceId
}

/**
 * Validate auth token is from same device
 */
export const validateDeviceId = (): boolean => {
  if (typeof window === 'undefined') return false

  const storedDeviceId = localStorage.getItem('deviceId')
  const currentDeviceId = getOrCreateDeviceId()

  return storedDeviceId === currentDeviceId
}

/**
 * Get auth token
 */
export const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('authToken')
}

/**
 * Get user data from storage
 */
export const getUserData = () => {
  if (typeof window === 'undefined') return null

  const userData = localStorage.getItem('userData')
  if (!userData) return null

  try {
    return JSON.parse(userData)
  } catch {
    return null
  }
}

/**
 * Clear all auth data
 */
export const clearAuthData = (): void => {
  if (typeof window === 'undefined') return

  localStorage.removeItem('authToken')
  localStorage.removeItem('deviceId')
  localStorage.removeItem('email')
  localStorage.removeItem('userId')
  localStorage.removeItem('userData')
}

/**
 * Set auth data
 */
export const setAuthData = (token: string, userData: any): void => {
  if (typeof window === 'undefined') return

  const deviceId = getOrCreateDeviceId()
  localStorage.setItem('authToken', token)
  localStorage.setItem('deviceId', deviceId)
  if (userData) {
    localStorage.setItem('userData', JSON.stringify(userData))
  }
}

/**
 * Broadcast logout to all tabs
 */
export const broadcastLogout = (): void => {
  const event = new CustomEvent('authStatusChanged', {
    detail: { status: 'logout' }
  })
  window.dispatchEvent(event)
}

/**
 * Broadcast login to all tabs
 */
export const broadcastLogin = (token: string, userData: any): void => {
  const event = new CustomEvent('authStatusChanged', {
    detail: {
      status: 'login',
      token,
      userData,
      deviceId: getOrCreateDeviceId()
    }
  })
  window.dispatchEvent(event)
}
