// lib/session.utils.ts

import React from 'react'

/**
 * Session timeout configuration
 */
export interface SessionConfig {
  warningTime: number // Time before timeout to show warning (ms)
  timeoutTime: number // Total time before logout (ms)
  inactivityCheck: number // Frequency of inactivity checks (ms)
}

/**
 * Default session configuration (15 minute timeout, 14 minute warning)
 */
export const DEFAULT_SESSION_CONFIG: SessionConfig = {
  warningTime: 14 * 60 * 1000, // 14 minutes
  timeoutTime: 15 * 60 * 1000, // 15 minutes
  inactivityCheck: 1 * 60 * 1000 // 1 minute
}

/**
 * Extended session configuration (30 minute timeout, 29 minute warning)
 */
export const EXTENDED_SESSION_CONFIG: SessionConfig = {
  warningTime: 29 * 60 * 1000, // 29 minutes
  timeoutTime: 30 * 60 * 1000, // 30 minutes
  inactivityCheck: 2 * 60 * 1000 // 2 minutes
}

/**
 * Short session configuration (5 minute timeout, 4 minute warning)
 */
export const SHORT_SESSION_CONFIG: SessionConfig = {
  warningTime: 4 * 60 * 1000, // 4 minutes
  timeoutTime: 5 * 60 * 1000, // 5 minutes
  inactivityCheck: 30 * 1000 // 30 seconds
}

/**
 * Activity events to monitor for session reset
 */
export const ACTIVITY_EVENTS = [
  'mousedown',
  'keydown',
  'scroll',
  'touchstart',
  'click',
  'mousemove',
  'keypress'
]

/**
 * Format time remaining for display
 */
export const formatTimeRemaining = (milliseconds: number): string => {
  const totalSeconds = Math.floor(milliseconds / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60

  if (minutes > 0) {
    return `${minutes} minute${minutes !== 1 ? 's' : ''} and ${seconds} second${
      seconds !== 1 ? 's' : ''
    }`
  }
  return `${seconds} second${seconds !== 1 ? 's' : ''}`
}

/**
 * Format time in MM:SS format
 */
export const formatTimeMMSS = (milliseconds: number): string => {
  const totalSeconds = Math.floor(milliseconds / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60

  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(
    2,
    '0'
  )}`
}

/**
 * Session manager class for advanced session handling
 */
export class SessionManager {
  private config: SessionConfig
  private warningCallback: (() => void) | null = null
  private timeoutCallback: (() => void) | null = null
  private warningTimer: NodeJS.Timeout | null = null
  private timeoutTimer: NodeJS.Timeout | null = null
  private activityListeners: Map<string, (e: Event) => void> = new Map()
  private isActive: boolean = false

  constructor (config: SessionConfig = DEFAULT_SESSION_CONFIG) {
    this.config = config
  }

  /**
   * Start session monitoring
   */
  start (onWarning: () => void, onTimeout: () => void): void {
    this.warningCallback = onWarning
    this.timeoutCallback = onTimeout
    this.isActive = true
    this.resetTimers()
    this.attachActivityListeners()
  }

  /**
   * Stop session monitoring
   */
  stop (): void {
    this.isActive = false
    this.clearTimers()
    this.detachActivityListeners()
  }

  /**
   * Reset all timers (called on user activity)
   */
  resetTimers (): void {
    this.clearTimers()

    if (!this.isActive) return

    // Warning timer
    this.warningTimer = setTimeout(() => {
      if (this.warningCallback) {
        this.warningCallback()
      }
    }, this.config.warningTime)

    // Timeout timer
    this.timeoutTimer = setTimeout(() => {
      if (this.timeoutCallback) {
        this.timeoutCallback()
      }
    }, this.config.timeoutTime)
  }

  /**
   * Extend session (when user clicks "continue")
   */
  extendSession (): void {
    this.resetTimers()
  }

  /**
   * Attach activity listeners
   */
  private attachActivityListeners (): void {
    const handleActivity = () => {
      this.resetTimers()
    }

    for (const event of ACTIVITY_EVENTS) {
      this.activityListeners.set(event, handleActivity)
      window.addEventListener(event, handleActivity, { passive: true })
    }
  }

  /**
   * Detach activity listeners
   */
  private detachActivityListeners (): void {
    for (const [event, listener] of this.activityListeners.entries()) {
      window.removeEventListener(event, listener)
    }
    this.activityListeners.clear()
  }

  /**
   * Clear all timers
   */
  private clearTimers (): void {
    if (this.warningTimer) {
      clearTimeout(this.warningTimer)
      this.warningTimer = null
    }

    if (this.timeoutTimer) {
      clearTimeout(this.timeoutTimer)
      this.timeoutTimer = null
    }
  }

  /**
   * Get remaining time until warning
   */
  getTimeUntilWarning (): number {
    return this.config.warningTime
  }

  /**
   * Get remaining time until timeout
   */
  getTimeUntilTimeout (): number {
    return this.config.timeoutTime
  }

  /**
   * Get time between warning and timeout
   */
  getWarningDuration (): number {
    return this.config.timeoutTime - this.config.warningTime
  }

  /**
   * Update configuration
   */
  updateConfig (config: Partial<SessionConfig>): void {
    this.config = { ...this.config, ...config }
  }

  /**
   * Check if session manager is active
   */
  isSessionActive (): boolean {
    return this.isActive
  }
}

/**
 * Hook helper for session management
 */
export const useSessionManager = (
  config: SessionConfig = DEFAULT_SESSION_CONFIG
) => {
  const managerRef = React.useRef<SessionManager | null>(null)

  if (!managerRef.current) {
    managerRef.current = new SessionManager(config)
  }

  return managerRef.current
}

/**
 * Get session config based on user role
 */
export const getSessionConfigByRole = (role: string): SessionConfig => {
  switch (role) {
    case 'admin':
    case 'super-admin':
    case 'sub-admin':
    case 'property-admin':
      // Admins get longer sessions
      return EXTENDED_SESSION_CONFIG

    case 'user':
    case 'tenant':
      // Regular users get default sessions
      return DEFAULT_SESSION_CONFIG

    case 'artisan':
    case 'property-owner':
      // Artisans and property owners get standard sessions
      return DEFAULT_SESSION_CONFIG

    default:
      return DEFAULT_SESSION_CONFIG
  }
}

/**
 * Check if session is about to expire
 */
export const isSessionNearExpiry = (
  lastActivityTime: number,
  config: SessionConfig = DEFAULT_SESSION_CONFIG
): boolean => {
  const timeSinceActivity = Date.now() - lastActivityTime
  return timeSinceActivity > config.warningTime
}

/**
 * Check if session has expired
 */
export const hasSessionExpired = (
  lastActivityTime: number,
  config: SessionConfig = DEFAULT_SESSION_CONFIG
): boolean => {
  const timeSinceActivity = Date.now() - lastActivityTime
  return timeSinceActivity > config.timeoutTime
}

/**
 * Get time remaining in session
 */
export const getTimeRemaining = (
  lastActivityTime: number,
  config: SessionConfig = DEFAULT_SESSION_CONFIG
): number => {
  const timeSinceActivity = Date.now() - lastActivityTime
  const timeRemaining = Math.max(0, config.timeoutTime - timeSinceActivity)
  return timeRemaining
}

/**
 * Store session start time
 */
export const saveSessionStartTime = (): void => {
  if (typeof window === 'undefined') return
  sessionStorage.setItem('sessionStartTime', String(Date.now()))
}

/**
 * Get session start time
 */
export const getSessionStartTime = (): number | null => {
  if (typeof window === 'undefined') return null
  const startTime = sessionStorage.getItem('sessionStartTime')
  return startTime ? parseInt(startTime, 10) : null
}

/**
 * Clear session start time
 */
export const clearSessionStartTime = (): void => {
  if (typeof window === 'undefined') return
  sessionStorage.removeItem('sessionStartTime')
}
