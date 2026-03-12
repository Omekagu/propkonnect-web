'use client'

import { useState, useEffect, useCallback } from 'react'

type Theme = 'light' | 'dark'

const STORAGE_KEY = 'ep_theme'

function getOSTheme(): Theme {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function applyTheme(theme: Theme) {
  if (typeof document === 'undefined') return
  document.documentElement.setAttribute('data-theme', theme)
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>('light')

  // On mount: read localStorage or fall back to OS preference
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Theme | null
    const resolved: Theme = stored === 'dark' || stored === 'light' ? stored : getOSTheme()
    setTheme(resolved)
    applyTheme(resolved)
  }, [])

  // Listen for OS preference changes (only if no manual preference stored)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem(STORAGE_KEY)) {
        const t: Theme = e.matches ? 'dark' : 'light'
        setTheme(t)
        applyTheme(t)
      }
    }
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  const toggleTheme = useCallback(() => {
    setTheme(prev => {
      const next: Theme = prev === 'dark' ? 'light' : 'dark'
      localStorage.setItem(STORAGE_KEY, next)
      applyTheme(next)
      return next
    })
  }, [])

  const setThemeExplicit = useCallback((t: Theme) => {
    localStorage.setItem(STORAGE_KEY, t)
    applyTheme(t)
    setTheme(t)
  }, [])

  return { theme, isDark: theme === 'dark', toggleTheme, setTheme: setThemeExplicit }
}
