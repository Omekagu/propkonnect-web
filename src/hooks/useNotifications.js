'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { io } from 'socket.io-client'

const API = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4001'

export function useNotifications (token) {
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const socketRef = useRef(null)

  // ── Helpers ──────────────────────────────────────────────────────────────

  const authHeader = () => ({
    Authorization: `Bearer ${token || localStorage.getItem('authToken')}`
  })

  // ── Fetch from API ────────────────────────────────────────────────────────

  const fetchNotifications = useCallback(async () => {
    if (!token && !localStorage.getItem('authToken')) return
    setLoading(true)
    try {
      const res = await fetch(`${API}/api/notifications?limit=30`, {
        headers: authHeader()
      })
      if (!res.ok) return
      const data = await res.json()
      setNotifications(data.notifications || [])
      setUnreadCount(data.unreadCount || 0)
    } catch (err) {
      console.warn('[useNotifications] fetch error:', err.message)
    } finally {
      setLoading(false)
    }
  }, [token])

  // ── Dedup helper ──────────────────────────────────────────────────────────

  const mergeUnique = (existing, incoming) => {
    const map = new Map(existing.map(n => [n._id ?? n.id, n]))
    let added = 0
    const arr = Array.isArray(incoming) ? incoming : [incoming]
    arr.forEach(n => {
      const key = n._id ?? n.id
      if (key && !map.has(key)) { map.set(key, n); added++ }
    })
    return { list: [...map.values()].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)), added }
  }

  // ── Real-time socket ──────────────────────────────────────────────────────

  useEffect(() => {
    const tok = token || (typeof window !== 'undefined' ? localStorage.getItem('authToken') : null)
    if (!tok) return

    const socket = io(API, {
      auth: { token: tok },
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5
    })

    socketRef.current = socket

    // New real-time notification
    socket.on('notification:new', (notif) => {
      setNotifications(prev => {
        const { list, added } = mergeUnique(prev, notif)
        if (added > 0) setUnreadCount(c => c + added)
        return list
      })
    })

    // Pending notifications delivered on reconnect
    socket.on('pending:notifications', (pending) => {
      if (!Array.isArray(pending) || pending.length === 0) return
      setNotifications(prev => {
        const { list } = mergeUnique(prev, pending)
        const newUnread = pending.filter(n => !n.read && !n.isRead).length
        if (newUnread > 0) setUnreadCount(c => c + newUnread)
        return list
      })
    })

    return () => {
      socket.disconnect()
      socketRef.current = null
    }
  }, [token])

  // Initial fetch
  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  // ── Actions ───────────────────────────────────────────────────────────────

  const markAsRead = useCallback(async (id) => {
    try {
      const res = await fetch(`${API}/api/notifications/${id}/read`, {
        method: 'PATCH',
        headers: authHeader()
      })
      if (!res.ok) return
      setNotifications(prev =>
        prev.map(n => (n._id === id ? { ...n, isRead: true } : n))
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (err) {
      console.warn('[useNotifications] markAsRead error:', err.message)
    }
  }, [token])

  const markAllAsRead = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/notifications/read-all`, {
        method: 'PATCH',
        headers: authHeader()
      })
      if (!res.ok) return
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
      setUnreadCount(0)
    } catch (err) {
      console.warn('[useNotifications] markAllAsRead error:', err.message)
    }
  }, [token])

  const deleteNotification = useCallback(async (id) => {
    try {
      const res = await fetch(`${API}/api/notifications/${id}`, {
        method: 'DELETE',
        headers: authHeader()
      })
      if (!res.ok) return
      setNotifications(prev => {
        const removed = prev.find(n => n._id === id)
        if (removed && !removed.isRead) setUnreadCount(c => Math.max(0, c - 1))
        return prev.filter(n => n._id !== id)
      })
    } catch (err) {
      console.warn('[useNotifications] delete error:', err.message)
    }
  }, [token])

  const clearAll = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/notifications/clear-all`, {
        method: 'DELETE',
        headers: authHeader()
      })
      if (!res.ok) return
      setNotifications([])
      setUnreadCount(0)
    } catch (err) {
      console.warn('[useNotifications] clearAll error:', err.message)
    }
  }, [token])

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    refresh: fetchNotifications
  }
}
