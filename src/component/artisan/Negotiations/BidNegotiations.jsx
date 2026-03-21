'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { api } from '@/libs/api-client'
import { useAuth } from '@/hooks/useAuth'
import { MessageSquare, ArrowLeft, Send, ChevronDown } from 'lucide-react'

const POLL_MS = 4000

// ─── Helpers ──────────────────────────────────────────────────────────────────

function Avatar ({ name = '', size = 38, src }) {
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || '?'
  const colors = ['#1f6feb', '#388bfd', '#3fb950', '#d29922', '#f85149', '#bc8cff', '#58a6ff']
  const color = colors[name.charCodeAt(0) % colors.length] || colors[0]
  if (src) return <img src={src} alt={name} style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: size * 0.35, color: '#fff', flexShrink: 0, userSelect: 'none' }}>
      {initials}
    </div>
  )
}

function statusColor (status) {
  const m = {
    pending:   { bg: 'rgba(210,153,34,.15)', color: '#d29922' },
    accepted:  { bg: 'rgba(46,160,67,.15)',  color: '#3fb950' },
    declined:  { bg: 'rgba(248,81,73,.15)',  color: '#f85149' },
    withdrawn: { bg: 'rgba(110,118,129,.15)', color: '#6e7681' },
  }
  return m[status] || m.pending
}

function fmtTime (iso) {
  if (!iso) return ''
  const d = new Date(iso)
  const now = new Date()
  const diff = now - d
  if (diff < 86400000) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  if (diff < 604800000) return d.toLocaleDateString([], { weekday: 'short' })
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' })
}

function buildMessages (bid) {
  const initial = {
    id: 'initial', from: 'artisan', type: 'offer',
    amount: bid.amount, message: bid.message || 'Initial bid',
    createdAt: bid.createdAt
  }
  const negs = (bid.negotiations || []).map((n, i) => ({
    id: n._id || `n${i}`, from: n.from,
    type: n.amount ? 'offer' : 'message',
    amount: n.amount, message: n.message,
    createdAt: n.createdAt || new Date().toISOString()
  }))
  return [initial, ...negs]
}

// ─── Chat View ────────────────────────────────────────────────────────────────
function ChatView ({ bid, currentUser, onBack }) {
  const [messages, setMessages] = useState(() => buildMessages(bid))
  const [currentBid, setCurrentBid] = useState(bid)
  const [text, setText] = useState('')
  const [counterAmt, setCounterAmt] = useState('')
  const [showCounter, setShowCounter] = useState(false)
  const [sending, setSending] = useState(false)
  const [toast, setToast] = useState(null)
  const [online, setOnline] = useState(true)
  const bottomRef = useRef(null)
  const pollRef = useRef(null)
  const inputRef = useRef(null)

  // Client info from populated serviceRequest.userId
  const client = bid.serviceRequest?.userId || {}
  const clientName = client.firstName ? `${client.firstName} ${client.lastName || ''}`.trim() : 'Client'

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const scrollBottom = () => setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 80)

  const fetchLatest = useCallback(async () => {
    try {
      const { data } = await api.get(`/api/bids/${bid._id}`)
      const b = data.data || data
      setCurrentBid(b)
      setMessages(buildMessages(b))
      setOnline(true)
      scrollBottom()
    } catch { setOnline(false) }
  }, [bid._id])

  useEffect(() => {
    scrollBottom()
    fetchLatest()
    pollRef.current = setInterval(fetchLatest, POLL_MS)
    return () => clearInterval(pollRef.current)
  }, [fetchLatest])

  const sendMessage = async () => {
    const msg = text.trim()
    if (!msg || sending) return
    // Auto-detect plain number → treat as counter offer
    const num = parseFloat(msg.replace(/,/g, ''))
    if (!isNaN(num) && num > 0 && String(num) === msg.replace(/,/g, '')) {
      setText('')
      setCounterAmt(String(num))
      setShowCounter(true)
      return
    }
    const optimistic = { id: `tmp${Date.now()}`, from: 'artisan', type: 'message', message: msg, createdAt: new Date().toISOString() }
    setMessages(p => [...p, optimistic])
    setText('')
    scrollBottom()
    setSending(true)
    try {
      await api.post(`/api/bids/${bid._id}/negotiate`, { message: msg, from: 'artisan' })
      await fetchLatest()
    } catch { showToast('Failed to send', 'error') }
    finally { setSending(false) }
  }

  const sendCounter = async () => {
    const amount = parseFloat(counterAmt)
    if (!amount || amount <= 0) { showToast('Enter a valid amount', 'error'); return }
    const note = `Counter offer: ₦${amount.toLocaleString()}`
    const optimistic = { id: `tmp${Date.now()}`, from: 'artisan', type: 'offer', amount, message: note, createdAt: new Date().toISOString() }
    setMessages(p => [...p, optimistic])
    setCounterAmt('')
    setShowCounter(false)
    scrollBottom()
    setSending(true)
    try {
      await api.post(`/api/bids/${bid._id}/negotiate`, { amount, from: 'artisan', message: note })
      await fetchLatest()
      showToast('Counter offer sent!')
    } catch { showToast('Failed to send offer', 'error') }
    finally { setSending(false) }
  }

  const acceptOffer = async (offer) => {
    if (!window.confirm(`Accept ₦${offer.amount?.toLocaleString()} and confirm this job price?`)) return
    clearInterval(pollRef.current)
    setSending(true)
    try {
      await api.post(`/api/bids/${bid._id}/accept`, { agreedAmount: offer.amount })
      showToast('Price agreed! Client has been notified to complete payment.')
      await fetchLatest()
    } catch (e) {
      showToast(e?.response?.data?.message || 'Failed to accept offer', 'error')
      pollRef.current = setInterval(fetchLatest, POLL_MS)
    } finally { setSending(false) }
  }

  const canSend = currentBid.status === 'pending'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0, background: '#0d1117' }}>
      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', top: 16, left: '50%', transform: 'translateX(-50%)', zIndex: 9999, padding: '10px 20px', borderRadius: 12, fontSize: 13, fontWeight: 600, background: toast.type === 'success' ? '#3fb950' : '#f85149', color: '#fff', boxShadow: '0 4px 24px rgba(0,0,0,0.4)', whiteSpace: 'nowrap' }}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: '#161b22', borderBottom: '1px solid #30363d', flexShrink: 0 }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: '#8b949e', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center', borderRadius: 6 }}>
          <ArrowLeft size={20} />
        </button>
        <Avatar name={clientName} src={client.avatar} size={40} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: '#e6edf3', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{clientName}</div>
          <div style={{ fontSize: 12, color: '#8b949e', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {currentBid.serviceRequest?.title || 'Service Request'}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 3, flexShrink: 0 }}>
          <span style={{ ...statusColor(currentBid.status), padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 600 }}>
            {currentBid.status}
          </span>
          <span style={{ fontSize: 11, color: online ? '#3fb950' : '#f85149' }}>
            {online ? '● live' : '○ reconnecting'}
          </span>
        </div>
      </div>

      {/* Offer strip */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', background: '#21262d', borderBottom: '1px solid #30363d', flexShrink: 0, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 12, color: '#8b949e' }}>{currentBid.status === 'accepted' ? 'Agreed price:' : 'Your bid:'}</span>
        <span style={{ fontSize: 14, fontWeight: 700, color: currentBid.status === 'accepted' ? '#3fb950' : '#e6edf3' }}>₦{currentBid.amount?.toLocaleString()}</span>
        {currentBid.status === 'accepted' && (
          <span style={{ fontSize: 12, color: '#3fb950', fontWeight: 700 }}>✓ Price locked</span>
        )}
        {currentBid.serviceRequest?.estimatedBudget && (
          <span style={{ fontSize: 12, color: '#8b949e', marginLeft: 'auto' }}>Budget: ₦{currentBid.serviceRequest.estimatedBudget?.toLocaleString()}</span>
        )}
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 6 }}>
        {messages.map(msg => {
          const isMe = msg.from === 'artisan'
          const isOffer = msg.type === 'offer'
          const canAccept = isOffer && !isMe && msg.id !== 'initial' && canSend

          return (
            <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start', marginBottom: 4 }}>
              {/* Sender label */}
              <div style={{ fontSize: 11, color: '#6e7681', marginBottom: 3, paddingLeft: isMe ? 0 : 4, paddingRight: isMe ? 4 : 0 }}>
                {isMe ? 'You' : clientName}
              </div>

              {isOffer ? (
                <div style={{
                  background: isMe ? 'rgba(196,229,60,.12)' : 'rgba(56,139,253,.12)',
                  border: `1px solid ${isMe ? 'rgba(196,229,60,.3)' : 'rgba(56,139,253,.3)'}`,
                  borderRadius: isMe ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                  padding: '10px 14px', maxWidth: 'min(72%, 320px)', minWidth: 140
                }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#8b949e', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {msg.id === 'initial' ? '🏷 Initial Bid' : '🔄 Counter Offer'}
                  </div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: isMe ? '#C4E53C' : '#58a6ff', lineHeight: 1.2 }}>
                    ₦{msg.amount?.toLocaleString()}
                  </div>
                  {msg.message && msg.id !== 'initial' && (
                    <p style={{ fontSize: 13, color: '#8b949e', margin: '4px 0 0', lineHeight: 1.4 }}>{msg.message}</p>
                  )}
                  {canAccept && (
                    <button
                      onClick={() => acceptOffer(msg)}
                      disabled={sending}
                      style={{ marginTop: 10, width: '100%', padding: '7px 0', background: '#3fb950', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 700, fontSize: 13 }}
                    >
                      ✓ Accept ₦{msg.amount?.toLocaleString()}
                    </button>
                  )}
                </div>
              ) : (
                <div style={{
                  padding: '9px 13px',
                  borderRadius: isMe ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                  background: isMe ? '#C4E53C' : '#21262d',
                  color: isMe ? '#0d1117' : '#c9d1d9',
                  fontSize: 14, maxWidth: 'min(72%, 360px)', lineHeight: 1.5,
                  wordBreak: 'break-word'
                }}>
                  {msg.message}
                </div>
              )}

              <span style={{ fontSize: 10, color: '#6e7681', marginTop: 3, paddingLeft: isMe ? 0 : 4, paddingRight: isMe ? 4 : 0 }}>
                {fmtTime(msg.createdAt)}
              </span>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Counter offer input */}
      {showCounter && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', background: '#161b22', borderTop: '1px solid #30363d', flexShrink: 0 }}>
          <span style={{ color: '#8b949e', fontWeight: 700, fontSize: 15, flexShrink: 0 }}>₦</span>
          <input
            autoFocus
            type="number"
            placeholder="Enter counter offer amount"
            value={counterAmt}
            onChange={e => setCounterAmt(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendCounter()}
            style={{ flex: 1, padding: '8px 12px', border: '1px solid #30363d', borderRadius: 8, background: '#21262d', color: '#e6edf3', fontSize: 14 }}
          />
          <button onClick={sendCounter} disabled={sending} style={{ padding: '8px 14px', background: '#C4E53C', color: '#0d1117', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 700, fontSize: 13, flexShrink: 0 }}>Send</button>
          <button onClick={() => setShowCounter(false)} style={{ background: 'none', border: 'none', color: '#8b949e', cursor: 'pointer', fontSize: 18, padding: '4px 6px', flexShrink: 0 }}>✕</button>
        </div>
      )}

      {/* Input bar */}
      {canSend ? (
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, padding: '10px 16px', background: '#161b22', borderTop: '1px solid #30363d', flexShrink: 0 }}>
          <button
            onClick={() => { setShowCounter(o => !o); inputRef.current?.focus() }}
            title="Send counter offer"
            style={{ padding: '9px 12px', background: showCounter ? '#C4E53C' : '#21262d', color: showCounter ? '#0d1117' : '#8b949e', border: '1px solid #30363d', borderRadius: 8, cursor: 'pointer', fontWeight: 800, fontSize: 14, flexShrink: 0 }}
          >
            ₦
          </button>
          <textarea
            ref={inputRef}
            rows={1}
            placeholder="Message… (or type a number to counter offer)"
            value={text}
            onChange={e => { setText(e.target.value); e.target.style.height = 'auto'; e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px' }}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
            style={{ flex: 1, padding: '9px 12px', border: '1px solid #30363d', borderRadius: 8, background: '#21262d', color: '#e6edf3', fontSize: 14, resize: 'none', fontFamily: 'inherit', lineHeight: 1.5, overflow: 'hidden' }}
          />
          <button
            onClick={sendMessage}
            disabled={!text.trim() || sending}
            style={{ padding: '9px 13px', background: text.trim() ? '#C4E53C' : '#21262d', color: text.trim() ? '#0d1117' : '#6e7681', border: 'none', borderRadius: 8, cursor: text.trim() ? 'pointer' : 'default', transition: 'all .15s', flexShrink: 0 }}
          >
            <Send size={16} />
          </button>
        </div>
      ) : (
        <div style={{ padding: '12px 16px', background: '#161b22', borderTop: '1px solid #30363d', textAlign: 'center', fontSize: 13, flexShrink: 0 }}>
          {currentBid.status === 'accepted' ? (
            <span style={{ color: '#3fb950', fontWeight: 600 }}>
              ✓ Price agreed at ₦{currentBid.amount?.toLocaleString()} — waiting for client to complete payment
            </span>
          ) : (
            <span style={{ color: '#8b949e' }}>
              This bid is <strong style={{ color: statusColor(currentBid.status).color }}>{currentBid.status}</strong> — negotiation closed
            </span>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Bid List ─────────────────────────────────────────────────────────────────
export default function BidNegotiations () {
  const { user } = useAuth()
  const [bids, setBids] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeBid, setActiveBid] = useState(null)
  const [filter, setFilter] = useState('active')

  const artisanName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : 'You'

  useEffect(() => {
    api.get('/api/bids/my-bids')
      .then(res => setBids(res.data.bids || res.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (activeBid) {
    return (
      <div style={{ position: 'fixed', inset: 0, zIndex: 500, display: 'flex', flexDirection: 'column', background: '#0d1117' }}>
        <ChatView bid={activeBid} currentUser={user} onBack={() => setActiveBid(null)} />
      </div>
    )
  }

  const filters = [
    { key: 'active', label: 'Active', keys: ['pending'] },
    { key: 'accepted', label: 'Accepted', keys: ['accepted'] },
    { key: 'closed', label: 'Closed', keys: ['declined', 'withdrawn'] },
    { key: 'all', label: 'All', keys: null },
  ]
  const activeFilter = filters.find(f => f.key === filter)
  const filtered = activeFilter?.keys ? bids.filter(b => activeFilter.keys.includes(b.status)) : bids

  return (
    <div style={{ background: '#0d1117', minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ padding: '16px 16px 0', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
          <Avatar name={artisanName} src={user?.avatar} size={40} />
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#e6edf3', margin: 0 }}>My Bids & Negotiations</h2>
            <p style={{ fontSize: 12, color: '#8b949e', margin: 0 }}>Chat with clients about job terms</p>
          </div>
        </div>

        {/* Filter tabs */}
        <div style={{ display: 'flex', gap: 4, margin: '12px 0 0', borderBottom: '1px solid #21262d' }}>
          {filters.map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              style={{
                padding: '7px 14px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600,
                color: filter === f.key ? '#e6edf3' : '#6e7681',
                borderBottom: `2px solid ${filter === f.key ? '#C4E53C' : 'transparent'}`,
                transition: 'all .15s', marginBottom: -1
              }}
            >
              {f.label}
              {f.key === 'active' && bids.filter(b => b.status === 'pending').length > 0 && (
                <span style={{ marginLeft: 6, padding: '1px 6px', borderRadius: 10, fontSize: 10, fontWeight: 700, background: '#C4E53C', color: '#0d1117' }}>
                  {bids.filter(b => b.status === 'pending').length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#8b949e' }}>Loading bids…</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#6e7681' }}>
            <MessageSquare size={40} style={{ display: 'block', margin: '0 auto 10px', opacity: 0.3 }} color='#6e7681' />
            <p style={{ margin: 0 }}>No {filter !== 'all' ? filter : ''} bids found</p>
          </div>
        ) : filtered.map(bid => {
          const client = bid.serviceRequest?.userId || {}
          const clientName = client.firstName ? `${client.firstName} ${client.lastName || ''}`.trim() : 'Client'
          const lastNeg = bid.negotiations?.[bid.negotiations.length - 1]
          const lastMsg = lastNeg?.message || bid.message || 'Bid submitted'
          const lastTime = lastNeg?.createdAt || bid.createdAt
          const sc = statusColor(bid.status)
          const hasNew = bid.negotiations?.some(n => n.from === 'user')
          const canChat = bid.status === 'pending'

          return (
            <div
              key={bid._id}
              onClick={() => setActiveBid(bid)}
              style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', cursor: 'pointer', borderBottom: '1px solid #21262d', transition: 'background .1s' }}
              onMouseEnter={e => e.currentTarget.style.background = '#161b22'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              {/* Avatar */}
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <Avatar name={clientName} src={client.avatar} size={46} />
                {canChat && (
                  <span style={{ position: 'absolute', bottom: 1, right: 1, width: 10, height: 10, borderRadius: '50%', background: '#3fb950', border: '2px solid #0d1117' }} />
                )}
              </div>

              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8, marginBottom: 3 }}>
                  <span style={{ fontWeight: 700, fontSize: 14, color: '#e6edf3', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{clientName}</span>
                  <span style={{ fontSize: 11, color: '#6e7681', flexShrink: 0 }}>{fmtTime(lastTime)}</span>
                </div>
                <div style={{ fontSize: 12, color: '#8b949e', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: 4 }}>
                  <span style={{ color: '#6e7681' }}>{bid.serviceRequest?.title || 'Service Request'} · </span>
                  {lastMsg.length > 50 ? lastMsg.slice(0, 50) + '…' : lastMsg}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ ...sc, padding: '1px 7px', borderRadius: 10, fontSize: 10, fontWeight: 600 }}>{bid.status}</span>
                  <span style={{ fontSize: 11, color: '#c9d1d9', fontWeight: 600 }}>₦{Number(bid.amount).toLocaleString()}</span>
                  {bid.negotiations?.length > 0 && (
                    <span style={{ fontSize: 11, color: '#6e7681' }}>{bid.negotiations.length} msg{bid.negotiations.length !== 1 ? 's' : ''}</span>
                  )}
                </div>
              </div>

              {/* Unread / chevron */}
              <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                {hasNew && <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#C4E53C' }} />}
                {canChat && <ChevronDown size={14} color='#6e7681' style={{ transform: 'rotate(-90deg)' }} />}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
