import React, { useState, useEffect, useRef, useCallback } from 'react'
import axios from 'axios'
import './FindArtisan.scss'

// ─── Config ───────────────────────────────────────────────────────────────────
const API_URL = `${
  process.env.NEXT_PUBLIC_BACKEND_URL || 'http://10.0.1.42:4001'
}/api`
const POLL_INTERVAL = 3000

const getAuthConfig = () => {
  const token = localStorage.getItem('authToken')
  if (!token) throw new Error('No auth token found. Please login again.')
  return {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    }
  }
}

// ─── Constants ────────────────────────────────────────────────────────────────
const CATEGORIES = [
  'Plumbing',
  'Electrical',
  'Carpentry',
  'Painting',
  'Cleaning',
  'Moving',
  'Landscaping',
  'Handyman',
  'Other'
]
const URGENCY_OPTIONS = [
  { value: 'urgent', label: 'Urgent', sub: 'Within 24hrs', icon: '⚡' },
  { value: 'normal', label: 'Normal', sub: '2–3 days', icon: '📅' },
  { value: 'flexible', label: 'Flexible', sub: 'No rush', icon: '🕐' }
]
const STATUS_META = {
  open: { color: '#2563eb', bg: '#eff6ff' },
  'in-progress': { color: '#d97706', bg: '#fffbeb' },
  completed: { color: '#059669', bg: '#ecfdf5' },
  cancelled: { color: '#dc2626', bg: '#fef2f2' }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function StatusBadge ({ status }) {
  const m = STATUS_META[status] || { color: '#6b7280', bg: '#f3f4f6' }
  return (
    <span className='status-badge' style={{ color: m.color, background: m.bg }}>
      {status}
    </span>
  )
}

function Spinner ({ size = 20, color = '#667eea' }) {
  return (
    <span
      className='spinner'
      style={{
        width: size,
        height: size,
        borderColor: `${color}33`,
        borderTopColor: color
      }}
    />
  )
}

function Toast ({ message, type = 'success', onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500)
    return () => clearTimeout(t)
  }, [onClose])
  return (
    <div className={`toast toast--${type}`}>
      <span>{type === 'success' ? '✓' : '!'}</span>
      {message}
    </div>
  )
}

// ════════════════════════════════════════════════════════════════════════════
//  VIEW 1  SERVICE REQUEST FORM
// ════════════════════════════════════════════════════════════════════════════
function ServiceRequestView ({ onSuccess }) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    location: { address: '', coordinates: null, city: '', state: '' },
    budget: '',
    urgency: 'normal',
    images: []
  })
  const [loading, setLoading] = useState(false)
  const [geoLoad, setGeoLoad] = useState(false)
  const [toast, setToast] = useState(null)
  const [errors, setErrors] = useState({})

  const set = (key, val) => {
    setForm(p => ({ ...p, [key]: val }))
    setErrors(p => ({ ...p, [key]: null }))
  }

  const detectLocation = () => {
    if (!navigator.geolocation) return
    setGeoLoad(true)
    navigator.geolocation.getCurrentPosition(
      async pos => {
        try {
          const { latitude, longitude } = pos.coords
          const { data } = await axios.get(
            'https://nominatim.openstreetmap.org/reverse',
            { params: { lat: latitude, lon: longitude, format: 'json' } }
          )
          setForm(p => ({
            ...p,
            location: {
              address:
                data.display_name ||
                `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
              coordinates: { latitude, longitude },
              city: data.address?.city || data.address?.town || '',
              state: data.address?.state || ''
            }
          }))
          setToast({ msg: 'Location detected', type: 'success' })
        } catch {
          setToast({ msg: 'Could not reverse-geocode', type: 'error' })
        } finally {
          setGeoLoad(false)
        }
      },
      () => {
        setToast({ msg: 'Location permission denied', type: 'error' })
        setGeoLoad(false)
      }
    )
  }

  const submit = async () => {
    setLoading(true)
    try {
      const { data } = await axios.post(
        `${API_URL}/service-requests`,
        {
          title: form.title,
          description: form.description,
          category: form.category,
          location: form.location,
          estimatedBudget: form.budget ? parseFloat(form.budget) : null,
          urgency: form.urgency,
          status: 'open',
          images: form.images
        },
        getAuthConfig()
      )
      setToast({
        msg: 'Request posted! Artisans will bid soon.',
        type: 'success'
      })
      onSuccess?.(data.data)
      setForm({
        title: '',
        description: '',
        category: '',
        location: { address: '', coordinates: null, city: '', state: '' },
        budget: '',
        urgency: 'normal',
        images: []
      })
    } catch (err) {
      setToast({
        msg: err.response?.data?.message || err.message,
        type: 'error'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='view-wrap'>
      {toast && (
        <Toast
          message={toast.msg}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className='view-header'>
        <h1 className='view-title'>Request a Service</h1>
        <p className='view-sub'>
          Post your job and receive bids from verified artisans in your area
        </p>
      </div>

      <div className='form-layout'>
        <div className='form-col'>
          <div className={`field ${errors.title ? 'field--err' : ''}`}>
            <label className='field__label'>What do you need done?</label>
            <input
              className='field__input'
              placeholder='e.g. Fix leaking kitchen sink'
              value={form.title}
              onChange={e => set('title', e.target.value)}
            />
            {errors.title && (
              <span className='field__errmsg'>{errors.title}</span>
            )}
          </div>

          <div className={`field ${errors.desc ? 'field--err' : ''}`}>
            <label className='field__label'>Description</label>
            <textarea
              className='field__input field__textarea'
              placeholder='Describe the work in detail — materials, access, special requirements...'
              value={form.description}
              onChange={e => set('description', e.target.value)}
              rows={5}
            />
            {errors.desc && (
              <span className='field__errmsg'>{errors.desc}</span>
            )}
          </div>

          <div className={`field ${errors.location ? 'field--err' : ''}`}>
            <label className='field__label'>Location</label>
            <div className='location-row'>
              <input
                className='field__input'
                placeholder='Enter your address'
                value={form.location.address}
                onChange={e =>
                  setForm(p => ({
                    ...p,
                    location: { ...p.location, address: e.target.value }
                  }))
                }
              />
              <button
                className={`geo-btn ${geoLoad ? 'geo-btn--spin' : ''}`}
                onClick={detectLocation}
                type='button'
                title='Use my location'
              >
                {geoLoad ? <Spinner size={15} color='#fff' /> : '📍'}
              </button>
            </div>
            {errors.location && (
              <span className='field__errmsg'>{errors.location}</span>
            )}
          </div>

          <div className='field'>
            <label className='field__label'>
              Budget <span className='field__opt'>— optional</span>
            </label>
            <div className='currency-row'>
              <span className='currency-row__sym'>₦</span>
              <input
                className='field__input field__input--indented'
                placeholder='0.00'
                type='number'
                value={form.budget}
                onChange={e => set('budget', e.target.value)}
                min='0'
              />
            </div>
            <p className='field__hint'>
              Leave blank to let artisans propose their price
            </p>
          </div>
        </div>

        <div className='form-col'>
          <div className={`field ${errors.cat ? 'field--err' : ''}`}>
            <label className='field__label'>Category</label>
            <div className='chip-grid'>
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  type='button'
                  className={`chip ${form.category === cat ? 'chip--on' : ''}`}
                  onClick={() => set('category', cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
            {errors.cat && <span className='field__errmsg'>{errors.cat}</span>}
          </div>

          <div className='field'>
            <label className='field__label'>Urgency</label>
            <div className='urgency-row'>
              {URGENCY_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  type='button'
                  className={`urgency-tile ${
                    form.urgency === opt.value ? 'urgency-tile--on' : ''
                  }`}
                  onClick={() => set('urgency', opt.value)}
                >
                  <span className='urgency-tile__icon'>{opt.icon}</span>
                  <span className='urgency-tile__label'>{opt.label}</span>
                  <span className='urgency-tile__sub'>{opt.sub}</span>
                </button>
              ))}
            </div>
          </div>

          <button
            className={`post-btn ${loading ? 'post-btn--loading' : ''}`}
            onClick={submit}
            disabled={loading}
            type='button'
          >
            {loading ? (
              <>
                <Spinner size={18} color='#fff' /> Posting...
              </>
            ) : (
              '🚀 Post Service Request'
            )}
          </button>

          <p className='trust-line'>
            ✅ Free to post &nbsp;·&nbsp; ✅ Bids within minutes &nbsp;·&nbsp;
            ✅ No commitment
          </p>
        </div>
      </div>
    </div>
  )
}

// ════════════════════════════════════════════════════════════════════════════
//  VIEW 2  MY REQUESTS  +  BIDS DRAWER
// ════════════════════════════════════════════════════════════════════════════
function MyRequestsView ({ onNegotiate }) {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedReq, setSelectedReq] = useState(null)
  const [bids, setBids] = useState([])
  const [loadingBids, setLoadingBids] = useState(false)
  const [toast, setToast] = useState(null)
  const pollRef = useRef(null)

  const fetchRequests = useCallback(async (silent = false) => {
    try {
      const { data } = await axios.get(
        `${API_URL}/service-requests/my-requests`,
        getAuthConfig()
      )
      setRequests(data.data || [])
      console.log(data, data.data)
    } catch {
      if (!silent) setToast({ msg: 'Could not load requests', type: 'error' })
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchBids = useCallback(async reqId => {
    setLoadingBids(true)
    setBids([])
    try {
      const { data } = await axios.get(
        `${API_URL}/service-requests/${reqId}/bids`,
        getAuthConfig()
      )
      setBids(data.data || [])
    } catch {
      setToast({ msg: 'Could not load bids', type: 'error' })
    } finally {
      setLoadingBids(false)
    }
  }, [])

  useEffect(() => {
    fetchRequests()
    const t = setInterval(() => fetchRequests(true), 15000)
    return () => clearInterval(t)
  }, [fetchRequests])

  useEffect(() => {
    if (!selectedReq) {
      clearInterval(pollRef.current)
      return
    }
    fetchBids(selectedReq._id)
    pollRef.current = setInterval(
      () => fetchBids(selectedReq._id),
      POLL_INTERVAL
    )
    return () => clearInterval(pollRef.current)
  }, [selectedReq, fetchBids])

  const acceptBid = async bid => {
    if (
      !window.confirm(
        `Accept ₦${bid.amount?.toLocaleString()}? This will take you to the Paystack payment page to secure funds in escrow.`
      )
    )
      return
    try {
      // Step 1: accept the bid
      await axios.post(`${API_URL}/bids/${bid._id}/accept`, {}, getAuthConfig())

      // Step 2: initiate escrow payment via Paystack
      setToast({ msg: 'Bid accepted! Preparing payment…', type: 'success' })
      const payRes = await axios.post(
        `${API_URL}/paystack/service-payment`,
        { bidId: bid._id },
        getAuthConfig()
      )
      if (payRes.data?.authorizationUrl) {
        window.location.href = payRes.data.authorizationUrl
      } else {
        setToast({ msg: 'Bid accepted. Proceed to pay from your requests list.', type: 'success' })
        setSelectedReq(null)
      }
    } catch (err) {
      setToast({
        msg: err.response?.data?.msg || err.response?.data?.message || err.message,
        type: 'error'
      })
    }
  }

  const declineBid = async bidId => {
    try {
      await axios.post(`${API_URL}/bids/${bidId}/decline`, {}, getAuthConfig())
      setToast({ msg: 'Bid declined', type: 'success' })
      if (selectedReq) fetchBids(selectedReq._id)
    } catch {
      setToast({ msg: 'Could not decline bid', type: 'error' })
    }
  }

  if (loading)
    return (
      <div className='center-state'>
        <Spinner size={36} />
        <p>Loading requests...</p>
      </div>
    )

  return (
    <div className='view-wrap'>
      {toast && (
        <Toast
          message={toast.msg}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className='view-header'>
        <h1 className='view-title'>My Requests</h1>
        <p className='view-sub'>
          Track your service requests and review incoming bids
        </p>
      </div>

      {requests.length === 0 ? (
        <div className='empty-state'>
          <span className='empty-state__icon'>📋</span>
          <h3>No requests yet</h3>
          <p>Post your first service request to get started</p>
        </div>
      ) : (
        <div className='req-grid'>
          {requests.map(req => (
            <button
              key={req._id}
              className='req-card'
              onClick={() => setSelectedReq(req)}
            >
              <div className='req-card__row'>
                <div className='req-card__left'>
                  <h3 className='req-card__title'>{req.title}</h3>
                  <span className='req-card__cat'>{req.category}</span>
                </div>
                <StatusBadge status={req.status} />
              </div>
              <p className='req-card__desc'>{req.description}</p>
              <div className='req-card__pills'>
                <span className='pill'>
                  🏷 {req.bidsCount || 0} {req.bidsCount === 1 ? 'bid' : 'bids'}
                </span>
                <span className='pill'>
                  📅 {new Date(req.createdAt).toLocaleDateString()}
                </span>
                {req.location?.city && (
                  <span className='pill'>📍 {req.location.city}</span>
                )}
              </div>
              {req.status === 'open' && (
                <div className='req-card__cta'>View Bids →</div>
              )}
            </button>
          ))}
        </div>
      )}

      {/* ── Bids Panel ── */}
      {selectedReq && (
        <div
          className='overlay'
          onClick={e => e.target === e.currentTarget && setSelectedReq(null)}
        >
          <div className='drawer'>
            <div className='drawer__head'>
              <div>
                <h2 className='drawer__title'>Bids Received</h2>
                <p className='drawer__sub'>{selectedReq.title}</p>
              </div>
              <button
                className='drawer__close'
                onClick={() => setSelectedReq(null)}
              >
                ✕
              </button>
            </div>

            {selectedReq.estimatedBudget && (
              <div className='drawer__budget'>
                Your budget:{' '}
                <strong>₦{selectedReq.estimatedBudget.toLocaleString()}</strong>
              </div>
            )}

            <div className='live-badge'>
              <span className='live-dot' /> Live · refreshing every{' '}
              {POLL_INTERVAL / 1000}s
            </div>

            {loadingBids ? (
              <div className='center-state'>
                <Spinner size={28} />
                <p>Loading bids...</p>
              </div>
            ) : bids.length === 0 ? (
              <div className='empty-state empty-state--sm'>
                <span className='empty-state__icon'>⏳</span>
                <p>No bids yet — artisans are reviewing your request</p>
              </div>
            ) : (
              <div className='bids-list'>
                {bids.map(bid => (
                  <div
                    key={bid._id}
                    className={`bid-card bid-card--${bid.status}`}
                  >
                    <div className='bid-card__top'>
                      <div className='artisan-row'>
                        <div className='artisan-av'>
                          {bid.artisan?.user?.firstName?.[0] || '?'}
                          {bid.artisan?.user?.lastName?.[0] || '?'}
                        </div>
                        <div>
                          <p className='artisan-name'>
                            {bid.artisan?.user?.firstName || 'Unknown'}{' '}
                            {bid.artisan?.user?.lastName || ''}
                          </p>
                          <p className='artisan-trade'>
                            {bid.artisan?.profession || 'Artisan'}
                          </p>
                        </div>
                      </div>
                      <span className='bid-amt'>
                        ₦{bid.amount?.toLocaleString()}
                      </span>
                    </div>

                    {bid.message && <p className='bid-msg'>"{bid.message}"</p>}

                    <div className='bid-card__foot'>
                      <span className='bid-date'>
                        📅 {new Date(bid.createdAt).toLocaleDateString()}
                      </span>

                      {bid.status === 'pending' && (
                        <div className='bid-btns'>
                          <button
                            className='btn-negotiate'
                            onClick={() => {
                              setSelectedReq(null)
                              onNegotiate(bid, 'user')
                            }}
                          >
                            💬 Negotiate
                          </button>
                          <button
                            className='btn-decline'
                            onClick={() => declineBid(bid._id)}
                          >
                            Decline
                          </button>
                          <button
                            className='btn-accept'
                            onClick={() => acceptBid(bid)}
                          >
                            Accept & Pay
                          </button>
                        </div>
                      )}
                      {bid.status === 'accepted' && (
                        <span className='bid-badge bid-badge--ok'>
                          ✓ Accepted
                        </span>
                      )}
                      {bid.status === 'declined' && (
                        <span className='bid-badge bid-badge--no'>
                          ✕ Declined
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ════════════════════════════════════════════════════════════════════════════
//  VIEW 3  LIVE BID NEGOTIATION CHAT
// ════════════════════════════════════════════════════════════════════════════
function NegotiationView ({ bid, userType, onBack }) {
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [counterAmt, setCounterAmt] = useState('')
  const [showCounter, setShowCounter] = useState(false)
  const [sending, setSending] = useState(false)
  const [currentBid, setCurrentBid] = useState(bid)
  const [online, setOnline] = useState(true)
  const [toast, setToast] = useState(null)
  const bottomRef = useRef(null)
  const pollRef = useRef(null)

  const buildMessages = b => {
    const initial = {
      id: 'initial',
      from: 'artisan',
      type: 'offer',
      amount: b.amount,
      message: b.message || 'Initial bid',
      createdAt: b.createdAt
    }
    const negs = (b.negotiations || []).map((n, i) => ({
      id: n._id || `n${i}`,
      from: n.from,
      type: n.amount ? 'offer' : 'message',
      amount: n.amount,
      message: n.message,
      createdAt: n.createdAt || new Date().toISOString()
    }))
    return [initial, ...negs]
  }

  const fetchLatest = useCallback(async () => {
    try {
      const { data } = await axios.get(
        `${API_URL}/bids/${bid._id}`,
        getAuthConfig()
      )
      const b = data.data || data
      setCurrentBid(b)
      setMessages(buildMessages(b))
      setOnline(true)
      setTimeout(
        () => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }),
        80
      )
    } catch {
      setOnline(false)
    }
  }, [bid._id])

  useEffect(() => {
    fetchLatest()
    pollRef.current = setInterval(fetchLatest, POLL_INTERVAL)
    return () => clearInterval(pollRef.current)
  }, [fetchLatest])

  const sendMessage = async () => {
    if (!text.trim() || sending) return
    const msg = text.trim()
    setMessages(p => [
      ...p,
      {
        id: `tmp${Date.now()}`,
        from: userType,
        type: 'message',
        message: msg,
        createdAt: new Date().toISOString()
      }
    ])
    setText('')
    setSending(true)
    try {
      await axios.post(
        `${API_URL}/bids/${bid._id}/negotiate`,
        { message: msg, from: userType },
        getAuthConfig()
      )
      await fetchLatest()
    } catch {
      setToast({ msg: 'Failed to send', type: 'error' })
    } finally {
      setSending(false)
    }
  }

  const sendCounterOffer = async () => {
    const amount = parseFloat(counterAmt)
    if (!amount || amount <= 0) {
      setToast({ msg: 'Enter a valid amount', type: 'error' })
      return
    }
    setMessages(p => [
      ...p,
      {
        id: `tmp${Date.now()}`,
        from: userType,
        type: 'offer',
        amount,
        message: `Counter offer: ₦${amount.toLocaleString()}`,
        createdAt: new Date().toISOString()
      }
    ])
    setCounterAmt('')
    setShowCounter(false)
    setSending(true)
    try {
      await axios.post(
        `${API_URL}/bids/${bid._id}/negotiate`,
        {
          amount,
          from: userType,
          message: `Counter offer: ₦${amount.toLocaleString()}`
        },
        getAuthConfig()
      )
      await fetchLatest()
      setToast({ msg: 'Counter offer sent!', type: 'success' })
    } catch {
      setToast({ msg: 'Failed to send offer', type: 'error' })
    } finally {
      setSending(false)
    }
  }

  const acceptOffer = async offer => {
    if (!window.confirm(`Accept ₦${offer.amount?.toLocaleString()}?`)) return
    clearInterval(pollRef.current)
    setSending(true)
    try {
      if (userType === 'user') {
        await axios.post(
          `${API_URL}/bids/${bid._id}/accept`,
          { agreedAmount: offer.amount },
          getAuthConfig()
        )
        setToast({
          msg: 'Offer accepted! Proceeding to payment...',
          type: 'success'
        })
        setTimeout(() => onBack?.(), 2200)
      } else {
        await axios.put(
          `${API_URL}/bids/${bid._id}`,
          { amount: offer.amount },
          getAuthConfig()
        )
        setToast({
          msg: 'Offer accepted. Client can now pay.',
          type: 'success'
        })
      }
    } catch {
      setToast({ msg: 'Failed to accept', type: 'error' })
      pollRef.current = setInterval(fetchLatest, POLL_INTERVAL)
    } finally {
      setSending(false)
    }
  }

  return (
    <div className='nego-wrap'>
      {toast && (
        <Toast
          message={toast.msg}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className='nego-header'>
        <button className='nego-back' onClick={onBack}>
          ← Back
        </button>
        <div className='nego-header__info'>
          <h2>
            {userType === 'user' ? 'Chat with Artisan' : 'Chat with Client'}
          </h2>
          <p>{currentBid?.serviceRequest?.title || 'Service Request'}</p>
        </div>
        <div
          className={`conn-pill ${
            online ? 'conn-pill--live' : 'conn-pill--off'
          }`}
        >
          <span className={online ? 'live-dot' : 'off-dot'} />
          {online ? `Live · ${POLL_INTERVAL / 1000}s` : 'Reconnecting...'}
        </div>
      </div>

      <div className='offer-strip'>
        <span className='offer-strip__label'>Current bid</span>
        <span className='offer-strip__amount'>
          ₦{currentBid?.amount?.toLocaleString()}
        </span>
        <span className='offer-strip__dot'>·</span>
        <span className='offer-strip__status'>{currentBid?.status}</span>
      </div>

      <div className='messages-area'>
        {messages.map(msg => {
          const isMe = msg.from === userType
          const isOffer = msg.type === 'offer'
          const canAcc = isOffer && !isMe && msg.id !== 'initial'

          return (
            <div
              key={msg.id}
              className={`msg-row ${isMe ? 'msg-row--me' : 'msg-row--them'}`}
            >
              {isOffer ? (
                <div
                  className={`offer-bubble ${
                    isMe ? 'offer-bubble--me' : 'offer-bubble--them'
                  }`}
                >
                  <div className='offer-bubble__tag'>
                    🏷 {msg.id === 'initial' ? 'Initial Bid' : 'Counter Offer'}
                  </div>
                  <div className='offer-bubble__amt'>
                    ₦{msg.amount?.toLocaleString()}
                  </div>
                  {msg.message && msg.id !== 'initial' && (
                    <p className='offer-bubble__note'>{msg.message}</p>
                  )}
                  {canAcc && (
                    <button
                      className='accept-offer-btn'
                      onClick={() => acceptOffer(msg)}
                      disabled={sending}
                    >
                      ✓ Accept ₦{msg.amount?.toLocaleString()}
                    </button>
                  )}
                </div>
              ) : (
                <div
                  className={`msg-bubble ${
                    isMe ? 'msg-bubble--me' : 'msg-bubble--them'
                  }`}
                >
                  {msg.message}
                </div>
              )}
              <span className='msg-ts'>
                {new Date(msg.createdAt).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {showCounter && (
        <div className='counter-bar'>
          <span className='counter-bar__sym'>₦</span>
          <input
            className='counter-bar__input'
            type='number'
            placeholder='Counter offer amount'
            value={counterAmt}
            onChange={e => setCounterAmt(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendCounterOffer()}
            autoFocus
          />
          <button
            className='counter-bar__send'
            onClick={sendCounterOffer}
            disabled={sending}
          >
            Send Offer
          </button>
          <button
            className='counter-bar__x'
            onClick={() => setShowCounter(false)}
          >
            ✕
          </button>
        </div>
      )}

      <div className='chat-bar'>
        <button
          className={`offer-toggle ${showCounter ? 'offer-toggle--on' : ''}`}
          onClick={() => setShowCounter(!showCounter)}
          title='Make a counter offer'
        >
          ₦
        </button>
        <textarea
          className='chat-bar__input'
          placeholder='Type a message… (Enter to send)'
          value={text}
          onChange={e => setText(e.target.value)}
          rows={1}
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              sendMessage()
            }
          }}
        />
        <button
          className={`send-btn ${
            !text.trim() || sending ? 'send-btn--off' : ''
          }`}
          onClick={sendMessage}
          disabled={!text.trim() || sending}
        >
          {sending ? <Spinner size={16} color='#fff' /> : '↑'}
        </button>
      </div>
    </div>
  )
}

// ════════════════════════════════════════════════════════════════════════════
//  ROOT
// ════════════════════════════════════════════════════════════════════════════
export default function FindArtisan () {
  const [view, setView] = useState('request')
  const [negoBid, setNegoBid] = useState(null)
  const [negoType, setNegoType] = useState('user')

  const goNegotiate = (bid, userType) => {
    setNegoBid(bid)
    setNegoType(userType)
    setView('negotiation')
  }

  const TABS = [
    { id: 'request', label: 'New Request', icon: '✚' },
    { id: 'my-requests', label: 'My Requests', icon: '📋' }
  ]

  return (
    <div className='find-artisan'>
      {view !== 'negotiation' && (
        <nav className='side-nav'>
          <div className='side-nav__brand'>
            <span className='side-nav__logo'>⚒</span>
            <span className='side-nav__name'>ArtisanHub</span>
          </div>
          <div className='side-nav__links'>
            {TABS.map(t => (
              <button
                key={t.id}
                className={`nav-link ${view === t.id ? 'nav-link--on' : ''}`}
                onClick={() => setView(t.id)}
              >
                <span className='nav-link__icon'>{t.icon}</span>
                <span className='nav-link__label'>{t.label}</span>
              </button>
            ))}
          </div>
        </nav>
      )}

      <main
        className={`app-main ${view === 'negotiation' ? 'app-main--full' : ''}`}
      >
        {view === 'request' && (
          <ServiceRequestView
            onSuccess={() => setTimeout(() => setView('my-requests'), 1500)}
          />
        )}
        {view === 'my-requests' && <MyRequestsView onNegotiate={goNegotiate} />}
        {view === 'negotiation' && negoBid && (
          <NegotiationView
            bid={negoBid}
            userType={negoType}
            onBack={() => setView('my-requests')}
          />
        )}
      </main>

      {view !== 'negotiation' && (
        <div className='bottom-tabs'>
          {TABS.map(t => (
            <button
              key={t.id}
              className={`bottom-tab ${view === t.id ? 'bottom-tab--on' : ''}`}
              onClick={() => setView(t.id)}
            >
              <span>{t.icon}</span>
              <span>{t.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
