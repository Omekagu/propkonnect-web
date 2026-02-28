'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { io } from 'socket.io-client'
import { FiSend, FiMessageSquare, FiSearch } from 'react-icons/fi'
import './Messages.scss'

const API = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4001'

function timeAgo (date) {
  const diff = Date.now() - new Date(date).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

function getInitials (user) {
  if (!user) return '?'
  if (user.firstName) return (user.firstName[0] + (user.lastName?.[0] || '')).toUpperCase()
  if (user.email) return user.email[0].toUpperCase()
  return '?'
}

export default function Messages () {
  const token =
    typeof window !== 'undefined' ? localStorage.getItem('authToken') : null
  const currentUserId =
    typeof window !== 'undefined' ? localStorage.getItem('userId') : null

  const [conversations, setConversations] = useState([])
  const [activeConvId, setActiveConvId] = useState(null)
  const [activeConv, setActiveConv] = useState(null)
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [loadingConvs, setLoadingConvs] = useState(true)
  const [loadingMsgs, setLoadingMsgs] = useState(false)
  const [sending, setSending] = useState(false)
  const [search, setSearch] = useState('')
  const [typing, setTyping] = useState(false)
  const [remoteTyping, setRemoteTyping] = useState(false)

  const socketRef = useRef(null)
  const messagesEndRef = useRef(null)
  const typingTimeout = useRef(null)

  const authHeader = () => ({ Authorization: `Bearer ${token}` })

  // ── Fetch conversations ────────────────────────────────────────────────────
  const fetchConversations = useCallback(async () => {
    if (!token) return
    setLoadingConvs(true)
    try {
      const res = await fetch(`${API}/api/messages/conversations`, {
        headers: authHeader()
      })
      if (!res.ok) return
      const data = await res.json()
      setConversations(data.conversations || [])
    } catch (e) {
      console.warn('[Messages] fetch conversations error:', e.message)
    } finally {
      setLoadingConvs(false)
    }
  }, [token])

  // ── Fetch messages for active conversation ────────────────────────────────
  const fetchMessages = useCallback(async (convId) => {
    if (!token || !convId) return
    setLoadingMsgs(true)
    try {
      const res = await fetch(`${API}/api/messages/${convId}?limit=60`, {
        headers: authHeader()
      })
      if (!res.ok) return
      const data = await res.json()
      setMessages((data.messages || []).reverse())
    } catch (e) {
      console.warn('[Messages] fetch messages error:', e.message)
    } finally {
      setLoadingMsgs(false)
    }
  }, [token])

  // ── Socket.IO ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!token) return
    const socket = io(API, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5
    })
    socketRef.current = socket

    socket.on('new-message', (msg) => {
      // Prepend to active conversation if matching
      setMessages(prev => {
        if (msg.conversationId === activeConvId || prev.some(m => m.conversationId === msg.conversationId)) {
          return [...prev, msg]
        }
        return prev
      })
      // Update last message in conversation list
      setConversations(prev =>
        prev.map(c =>
          c._id === msg.conversationId
            ? { ...c, lastMessage: msg.text, lastMessageAt: msg.createdAt, unreadCount: (c.unreadCount || 0) + 1 }
            : c
        )
      )
    })

    socket.on('typing', ({ conversationId }) => {
      if (conversationId === activeConvId) setRemoteTyping(true)
    })
    socket.on('stop-typing', ({ conversationId }) => {
      if (conversationId === activeConvId) setRemoteTyping(false)
    })

    return () => {
      socket.disconnect()
      socketRef.current = null
    }
  }, [token, activeConvId])

  useEffect(() => {
    fetchConversations()
  }, [fetchConversations])

  useEffect(() => {
    if (activeConvId) fetchMessages(activeConvId)
  }, [activeConvId, fetchMessages])

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // ── Select conversation ───────────────────────────────────────────────────
  const openConversation = (conv) => {
    setActiveConvId(conv._id)
    setActiveConv(conv)
    setRemoteTyping(false)
    // Clear unread count locally
    setConversations(prev =>
      prev.map(c => c._id === conv._id ? { ...c, unreadCount: 0 } : c)
    )
  }

  // ── Send message ──────────────────────────────────────────────────────────
  const handleSend = async () => {
    if (!text.trim() || !activeConvId || sending) return
    const receiverId = activeConv?.otherUser?._id
    setSending(true)
    const optimistic = {
      _id: `opt_${Date.now()}`,
      conversationId: activeConvId,
      senderId: currentUserId,
      text: text.trim(),
      createdAt: new Date().toISOString(),
      isOptimistic: true
    }
    setMessages(prev => [...prev, optimistic])
    setText('')
    try {
      const res = await fetch(`${API}/api/messages/send`, {
        method: 'POST',
        headers: { ...authHeader(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId: activeConvId, text: optimistic.text, receiverId })
      })
      const data = await res.json()
      if (res.ok && data.message) {
        setMessages(prev =>
          prev.map(m => m._id === optimistic._id ? data.message : m)
        )
        setConversations(prev =>
          prev.map(c =>
            c._id === activeConvId
              ? { ...c, lastMessage: data.message.text, lastMessageAt: data.message.createdAt }
              : c
          )
        )
      }
    } catch (e) {
      console.warn('[Messages] send error:', e.message)
    } finally {
      setSending(false)
    }
  }

  // ── Typing indicator ──────────────────────────────────────────────────────
  const handleTextChange = (e) => {
    setText(e.target.value)
    if (!socketRef.current || !activeConvId) return
    if (!typing) {
      setTyping(true)
      socketRef.current.emit('typing', { conversationId: activeConvId })
    }
    clearTimeout(typingTimeout.current)
    typingTimeout.current = setTimeout(() => {
      setTyping(false)
      socketRef.current?.emit('stop-typing', { conversationId: activeConvId })
    }, 1500)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const filteredConvs = conversations.filter(c => {
    const name = c.otherUser
      ? `${c.otherUser.firstName || ''} ${c.otherUser.lastName || ''} ${c.otherUser.email || ''}`
      : ''
    return name.toLowerCase().includes(search.toLowerCase())
  })

  return (
    <div className='messages-container'>
      {/* ── Conversation List ── */}
      <aside className='conv-sidebar'>
        <div className='conv-sidebar-header'>
          <h2>Messages</h2>
        </div>
        <div className='conv-search'>
          <FiSearch size={14} />
          <input
            placeholder='Search conversations…'
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className='conv-list'>
          {loadingConvs ? (
            <div className='conv-loading'>Loading…</div>
          ) : filteredConvs.length === 0 ? (
            <div className='conv-empty'>
              <FiMessageSquare size={32} />
              <p>No conversations yet</p>
            </div>
          ) : (
            filteredConvs.map(conv => {
              const other = conv.otherUser
              const isActive = conv._id === activeConvId
              return (
                <div
                  key={conv._id}
                  className={`conv-item ${isActive ? 'active' : ''}`}
                  onClick={() => openConversation(conv)}
                >
                  <div className='conv-avatar'>
                    {other?.avatar
                      ? <img src={other.avatar} alt={other.firstName} />
                      : <span>{getInitials(other)}</span>}
                    {other?.online && <span className='online-dot' />}
                  </div>
                  <div className='conv-info'>
                    <div className='conv-name-row'>
                      <span className='conv-name'>
                        {other?.firstName
                          ? `${other.firstName} ${other.lastName || ''}`
                          : other?.email || 'Unknown'}
                      </span>
                      <span className='conv-time'>{timeAgo(conv.lastMessageAt)}</span>
                    </div>
                    <div className='conv-preview-row'>
                      <span className='conv-preview'>
                        {conv.lastMessage?.length > 40
                          ? conv.lastMessage.slice(0, 40) + '…'
                          : conv.lastMessage || 'No messages yet'}
                      </span>
                      {conv.unreadCount > 0 && (
                        <span className='conv-badge'>{conv.unreadCount}</span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </aside>

      {/* ── Message Thread ── */}
      <main className='msg-thread'>
        {!activeConvId ? (
          <div className='thread-empty'>
            <FiMessageSquare size={48} />
            <p>Select a conversation to start chatting</p>
          </div>
        ) : (
          <>
            {/* Thread Header */}
            <div className='thread-header'>
              <div className='thread-avatar'>
                {activeConv?.otherUser?.avatar
                  ? <img src={activeConv.otherUser.avatar} alt='' />
                  : <span>{getInitials(activeConv?.otherUser)}</span>}
              </div>
              <div className='thread-user-info'>
                <p className='thread-name'>
                  {activeConv?.otherUser?.firstName
                    ? `${activeConv.otherUser.firstName} ${activeConv.otherUser.lastName || ''}`
                    : activeConv?.otherUser?.email || 'Chat'}
                </p>
                <p className='thread-status'>
                  {remoteTyping ? 'typing…' : activeConv?.otherUser?.online ? 'Online' : 'Offline'}
                </p>
              </div>
            </div>

            {/* Messages */}
            <div className='thread-messages'>
              {loadingMsgs ? (
                <div className='thread-loading'>Loading messages…</div>
              ) : messages.length === 0 ? (
                <div className='thread-no-msgs'>No messages yet. Say hello!</div>
              ) : (
                messages.map(msg => {
                  const isMine =
                    msg.senderId === currentUserId ||
                    msg.senderId?._id === currentUserId
                  return (
                    <div key={msg._id} className={`msg-bubble-wrap ${isMine ? 'mine' : 'theirs'}`}>
                      <div className={`msg-bubble ${msg.isOptimistic ? 'optimistic' : ''}`}>
                        <p>{msg.text}</p>
                        <span className='msg-time'>{timeAgo(msg.createdAt)}</span>
                      </div>
                    </div>
                  )
                })
              )}
              {remoteTyping && (
                <div className='msg-bubble-wrap theirs'>
                  <div className='msg-bubble typing-indicator'>
                    <span /><span /><span />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className='thread-input-area'>
              <textarea
                className='thread-input'
                placeholder='Type a message…'
                value={text}
                onChange={handleTextChange}
                onKeyDown={handleKeyDown}
                rows={1}
              />
              <button
                className='send-btn'
                onClick={handleSend}
                disabled={!text.trim() || sending}
              >
                <FiSend size={18} />
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
