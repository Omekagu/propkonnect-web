'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { io } from 'socket.io-client'
import {
  FiSend,
  FiMessageSquare,
  FiSearch,
  FiPaperclip,
  FiX,
  FiFile,
  FiDownload,
  FiHome,
  FiImage
} from 'react-icons/fi'
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

function formatFileSize (bytes) {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function resolveUrl (url) {
  if (!url) return ''
  if (url.startsWith('http')) return url
  return `${API}/${url.replace(/\\/g, '/')}`
}

export default function Messages () {
  const token =
    typeof window !== 'undefined' ? localStorage.getItem('authToken') : null
  const currentUser =
    typeof window !== 'undefined'
      ? JSON.parse(localStorage.getItem('userData') || 'null')
      : null
  const currentUserId = currentUser?._id || currentUser?.id

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

  // Attachment state
  const [attachment, setAttachment] = useState(null) // { file, preview, type }
  const fileInputRef = useRef(null)

  // Property picker state
  const [showPropertyPicker, setShowPropertyPicker] = useState(false)
  const [pickerSearch, setPickerSearch] = useState('')
  const [pickerProperties, setPickerProperties] = useState([])
  const [pickerLoading, setPickerLoading] = useState(false)

  const socketRef = useRef(null)
  const messagesEndRef = useRef(null)
  const typingTimeout = useRef(null)

  const authHeader = () => ({ Authorization: `Bearer ${token}` })

  // ── Fetch conversations ─────────────────────────────────────────────────────
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

  // ── Fetch messages for active conversation ──────────────────────────────────
  const fetchMessages = useCallback(async (convId) => {
    if (!token || !convId) return
    setLoadingMsgs(true)
    try {
      const res = await fetch(`${API}/api/messages/${convId}?limit=60`, {
        headers: authHeader()
      })
      if (!res.ok) return
      const data = await res.json()
      setMessages(data.messages || [])
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
      setMessages(prev => {
        if (
          msg.conversationId === activeConvId ||
          prev.some(m => m.conversationId === msg.conversationId)
        ) {
          // Replace optimistic if tempId matches, otherwise append
          const hasOptimistic = prev.some(m => m.isOptimistic && m.text === msg.text)
          if (hasOptimistic) {
            return prev.map(m => (m.isOptimistic && m.text === msg.text ? msg : m))
          }
          return [...prev, msg]
        }
        return prev
      })
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

    // Real-time online/offline status from server broadcasts
    socket.on('user:status', ({ userId: uid, status }) => {
      const update = conv => {
        if (!conv.otherUser) return conv
        const otherId = conv.otherUser._id?.toString?.() || conv.otherUser._id
        if (otherId !== uid) return conv
        return { ...conv, otherUser: { ...conv.otherUser, online: status.online, lastSeen: status.lastSeen } }
      }
      setConversations(prev => prev.map(update))
      setActiveConv(prev => prev ? update(prev) : prev)
    })

    return () => {
      socket.disconnect()
      socketRef.current = null
    }
  }, [token, activeConvId])

  useEffect(() => { fetchConversations() }, [fetchConversations])

  // ── Auto-open chat with a specific user (from property detail page) ─────────
  useEffect(() => {
    if (!token) return
    const targetUserId = typeof window !== 'undefined' ? sessionStorage.getItem('ep_open_chat_with') : null
    if (!targetUserId) return
    sessionStorage.removeItem('ep_open_chat_with')

    // Get or create a conversation with this user then open it
    fetch(`${API}/api/messages/conversation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ otherUserId: targetUserId })
    })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!data?.conversation) return
        const conv = data.conversation
        // Compute otherUser from participants (mirrors getUserConversations server logic)
        const convWithOther = {
          ...conv,
          otherUser: conv.participants?.find(p => p._id !== currentUserId && p._id?.toString() !== String(currentUserId)) || conv.participants?.[0]
        }
        // Ensure it's in the conversations list
        setConversations(prev =>
          prev.some(c => c._id === convWithOther._id) ? prev : [convWithOther, ...prev]
        )
        openConversation(convWithOther)
      })
      .catch(() => {})
  }, [token]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (activeConvId) fetchMessages(activeConvId)
  }, [activeConvId, fetchMessages])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // ── Select conversation ────────────────────────────────────────────────────
  const openConversation = (conv) => {
    setActiveConvId(conv._id)
    setActiveConv(conv)
    setRemoteTyping(false)
    setConversations(prev =>
      prev.map(c => c._id === conv._id ? { ...c, unreadCount: 0 } : c)
    )
  }

  // ── Send text message ──────────────────────────────────────────────────────
  const handleSend = async () => {
    if (!text.trim() || !activeConvId || sending) return
    const receiverId = activeConv?.otherUser?._id
    setSending(true)
    const optimisticText = text.trim()
    const optimistic = {
      _id: `opt_${Date.now()}`,
      conversationId: activeConvId,
      senderId: currentUserId,
      text: optimisticText,
      type: 'text',
      createdAt: new Date().toISOString(),
      isOptimistic: true
    }
    setMessages(prev => [...prev, optimistic])
    setText('')
    try {
      const res = await fetch(`${API}/api/messages/send`, {
        method: 'POST',
        headers: { ...authHeader(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId: activeConvId, text: optimisticText, receiverId })
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

  // ── File/image attachment ──────────────────────────────────────────────────
  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const isImage = file.type.startsWith('image/')
    const preview = isImage ? URL.createObjectURL(file) : null
    setAttachment({ file, preview, type: isImage ? 'image' : 'file' })
    e.target.value = ''
  }

  const cancelAttachment = () => {
    if (attachment?.preview) URL.revokeObjectURL(attachment.preview)
    setAttachment(null)
  }

  const handleSendAttachment = async () => {
    if (!attachment || !activeConvId || sending) return
    const receiverId = activeConv?.otherUser?._id
    setSending(true)
    try {
      const formData = new FormData()
      formData.append('image', attachment.file)
      formData.append('conversationId', activeConvId)
      formData.append('receiverId', receiverId)
      if (attachment.type === 'file') formData.append('type', 'file')
      if (text.trim()) formData.append('caption', text.trim())

      const res = await fetch(`${API}/api/messages/send-image`, {
        method: 'POST',
        headers: authHeader(),
        body: formData
      })
      const data = await res.json()
      if (res.ok && data.message) {
        setMessages(prev => [...prev, data.message])
        setConversations(prev =>
          prev.map(c =>
            c._id === activeConvId
              ? { ...c, lastMessage: data.message.text, lastMessageAt: data.message.createdAt }
              : c
          )
        )
      }
      setText('')
      cancelAttachment()
    } catch (e) {
      console.warn('[Messages] send attachment error:', e.message)
    } finally {
      setSending(false)
    }
  }

  // ── Property picker ────────────────────────────────────────────────────────
  const openPropertyPicker = async () => {
    setShowPropertyPicker(true)
    setPickerLoading(true)
    try {
      const res = await fetch(`${API}/api/properties?limit=10`, {
        headers: authHeader()
      })
      const data = await res.json()
      setPickerProperties(data.properties || [])
    } catch (e) {
      setPickerProperties([])
    } finally {
      setPickerLoading(false)
    }
  }

  const searchProperties = async (q) => {
    setPickerSearch(q)
    if (!q.trim()) { openPropertyPicker(); return }
    setPickerLoading(true)
    try {
      const res = await fetch(`${API}/api/properties?search=${encodeURIComponent(q)}&limit=8`, {
        headers: authHeader()
      })
      const data = await res.json()
      setPickerProperties(data.properties || [])
    } catch (e) {
      setPickerProperties([])
    } finally {
      setPickerLoading(false)
    }
  }

  const handleShareProperty = async (property) => {
    const receiverId = activeConv?.otherUser?._id
    setSending(true)
    try {
      const res = await fetch(`${API}/api/messages/send`, {
        method: 'POST',
        headers: { ...authHeader(), 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: activeConvId,
          receiverId,
          type: 'property',
          propertyId: property._id
        })
      })
      const data = await res.json()
      if (res.ok && data.message) {
        setMessages(prev => [...prev, data.message])
      }
    } catch (e) {
      console.warn('[Messages] share property error:', e.message)
    } finally {
      setSending(false)
      setShowPropertyPicker(false)
      setPickerSearch('')
    }
  }

  // ── Typing indicator ───────────────────────────────────────────────────────
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
      attachment ? handleSendAttachment() : handleSend()
    }
  }

  // ── Message content renderer ───────────────────────────────────────────────
  const renderMessageContent = (msg) => {
    switch (msg.type) {
      case 'image':
        return (
          <div className='msg-image'>
            <img
              src={resolveUrl(msg.imageUrl)}
              alt='Image'
              onClick={() => window.open(resolveUrl(msg.imageUrl), '_blank')}
            />
            {msg.text && <p className='msg-caption'>{msg.text}</p>}
            <span className='msg-time'>{timeAgo(msg.createdAt)}</span>
          </div>
        )
      case 'file':
        return (
          <div className='msg-file'>
            <FiFile size={22} className='msg-file-icon' />
            <div className='msg-file-info'>
              <span className='msg-file-name'>{msg.fileName || 'File'}</span>
              {msg.fileSize > 0 && (
                <span className='msg-file-size'>{formatFileSize(msg.fileSize)}</span>
              )}
            </div>
            <a
              href={resolveUrl(msg.fileUrl)}
              download
              target='_blank'
              rel='noreferrer'
              className='msg-file-download'
            >
              <FiDownload size={16} />
            </a>
            <span className='msg-time'>{timeAgo(msg.createdAt)}</span>
          </div>
        )
      case 'property': {
        const prop = msg.propertyData
        return (
          <div className='msg-property-card'>
            {prop?.images?.[0] && (
              <img src={resolveUrl(prop.images[0])} alt={prop.title} className='msg-card-img' />
            )}
            <div className='msg-card-body'>
              <FiHome size={13} className='msg-card-icon' />
              <p className='msg-card-title'>{prop?.title || 'Property'}</p>
              {prop?.price && (
                <p className='msg-card-price'>₦{Number(prop.price).toLocaleString()}</p>
              )}
              {prop?.location && (
                <p className='msg-card-location'>
                  {typeof prop.location === 'string'
                    ? prop.location
                    : prop.location?.city || prop.location?.address || ''}
                </p>
              )}
            </div>
            <span className='msg-time'>{timeAgo(msg.createdAt)}</span>
          </div>
        )
      }
      case 'artisan': {
        const a = msg.artisanData
        return (
          <div className='msg-artisan-card'>
            {a?.portfolioImages?.[0] && (
              <img src={resolveUrl(a.portfolioImages[0])} alt={a.name} className='msg-card-img' />
            )}
            <div className='msg-card-body'>
              <p className='msg-card-title'>{a?.name || 'Artisan'}</p>
              <p className='msg-card-sub'>{a?.profession}</p>
              {a?.rating != null && (
                <p className='msg-card-rating'>⭐ {Number(a.rating).toFixed(1)}</p>
              )}
            </div>
            <span className='msg-time'>{timeAgo(msg.createdAt)}</span>
          </div>
        )
      }
      default:
        return (
          <>
            <p>{msg.text}</p>
            <span className='msg-time'>{timeAgo(msg.createdAt)}</span>
          </>
        )
    }
  }

  const filteredConvs = conversations.filter(c => {
    const name = c.otherUser
      ? `${c.otherUser.firstName || ''} ${c.otherUser.lastName || ''} ${c.otherUser.email || ''}`
      : ''
    return name.toLowerCase().includes(search.toLowerCase())
  })

  const canSend = (text.trim() || attachment) && !sending

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
                      <div className={`msg-bubble ${msg.isOptimistic ? 'optimistic' : ''} type-${msg.type || 'text'}`}>
                        {renderMessageContent(msg)}
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

            {/* Attachment preview */}
            {attachment && (
              <div className='attachment-preview'>
                {attachment.type === 'image'
                  ? <img src={attachment.preview} alt='preview' />
                  : (
                    <div className='attachment-file'>
                      <FiFile size={20} />
                      <span>{attachment.file.name}</span>
                    </div>
                  )}
                <button className='attachment-cancel' onClick={cancelAttachment}>
                  <FiX size={14} />
                </button>
              </div>
            )}

            {/* Input */}
            <div className='thread-input-area'>
              {/* Hidden file input */}
              <input
                type='file'
                ref={fileInputRef}
                style={{ display: 'none' }}
                accept='image/*,application/pdf,.doc,.docx,.txt,.zip'
                onChange={handleFileSelect}
              />

              {/* Attachment button */}
              <button
                className='attach-btn'
                onClick={() => fileInputRef.current?.click()}
                title='Attach file or image'
                disabled={sending}
              >
                <FiPaperclip size={18} />
              </button>

              {/* Share property button */}
              <button
                className='attach-btn'
                onClick={openPropertyPicker}
                title='Share a property'
                disabled={sending}
              >
                <FiHome size={18} />
              </button>

              <textarea
                className='thread-input'
                placeholder={attachment ? 'Add a caption…' : 'Type a message…'}
                value={text}
                onChange={handleTextChange}
                onKeyDown={handleKeyDown}
                rows={1}
              />
              <button
                className='send-btn'
                onClick={attachment ? handleSendAttachment : handleSend}
                disabled={!canSend}
              >
                <FiSend size={18} />
              </button>
            </div>
          </>
        )}
      </main>

      {/* ── Property Picker Modal ── */}
      {showPropertyPicker && (
        <div className='picker-overlay' onClick={() => setShowPropertyPicker(false)}>
          <div className='picker-modal' onClick={e => e.stopPropagation()}>
            <div className='picker-header'>
              <h3>Share a Property</h3>
              <button onClick={() => setShowPropertyPicker(false)}><FiX size={18} /></button>
            </div>
            <div className='picker-search'>
              <FiSearch size={14} />
              <input
                placeholder='Search properties…'
                value={pickerSearch}
                onChange={e => searchProperties(e.target.value)}
                autoFocus
              />
            </div>
            <div className='picker-list'>
              {pickerLoading ? (
                <div className='picker-loading'>Loading…</div>
              ) : pickerProperties.length === 0 ? (
                <div className='picker-empty'>No properties found</div>
              ) : (
                pickerProperties.map(prop => (
                  <div
                    key={prop._id}
                    className='picker-item'
                    onClick={() => handleShareProperty(prop)}
                  >
                    {prop.images?.[0] && (
                      <img src={resolveUrl(prop.images[0])} alt={prop.title} />
                    )}
                    <div className='picker-item-info'>
                      <span className='picker-item-title'>{prop.title}</span>
                      <span className='picker-item-sub'>
                        ₦{Number(prop.price).toLocaleString()} · {prop.location?.city || prop.location?.address || ''}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
