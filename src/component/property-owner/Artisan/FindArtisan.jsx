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
    const alreadyAccepted = bid.status === 'accepted'
    const confirmMsg = alreadyAccepted
      ? `Pay ₦${bid.amount?.toLocaleString()} to secure this job in escrow?`
      : `Accept & pay ₦${bid.amount?.toLocaleString()}? Funds will be held in escrow until the job is complete.`
    if (!window.confirm(confirmMsg)) return
    try {
      if (!alreadyAccepted) {
        // Step 1: accept the bid (mark as agreed)
        await axios.post(`${API_URL}/bids/${bid._id}/accept`, {}, getAuthConfig())
      }
      // Step 2: initiate escrow payment via Paystack
      setToast({ msg: 'Preparing payment…', type: 'success' })
      const payRes = await axios.post(
        `${API_URL}/paystack/service-payment`,
        { bidId: bid._id },
        getAuthConfig()
      )
      if (payRes.data?.authorizationUrl) {
        window.location.href = payRes.data.authorizationUrl
      } else {
        setToast({ msg: 'Bid accepted. You can pay later from My Requests.', type: 'success' })
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
                        {(() => {
                          const u = bid.bidderUserId || bid.artisan?.user || {}
                          const name = u.firstName ? `${u.firstName} ${u.lastName || ''}`.trim() : (bid.artisan?.profession || 'Artisan')
                          return (
                            <>
                              <div className='artisan-av'>
                                {name[0]?.toUpperCase() || '?'}{name.split(' ')[1]?.[0]?.toUpperCase() || ''}
                              </div>
                              <div>
                                <p className='artisan-name'>{name}</p>
                                <p className='artisan-trade'>{bid.artisan?.profession || bid.artisan?.specialty || 'Artisan'}</p>
                              </div>
                            </>
                          )
                        })()}
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
                        <div className='bid-btns'>
                          <span className='bid-badge bid-badge--ok'>✓ Agreed ₦{bid.amount?.toLocaleString()}</span>
                          <button className='btn-accept' onClick={() => acceptBid(bid)}>
                            💳 Pay Now
                          </button>
                        </div>
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
//  HELPERS — Avatar + time
// ════════════════════════════════════════════════════════════════════════════
function ArtisanAvatar ({ name = '', size = 38, src }) {
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || '?'
  const palette = ['#1f6feb', '#388bfd', '#3fb950', '#d29922', '#f85149', '#bc8cff', '#58a6ff']
  const bg = palette[name.charCodeAt(0) % palette.length] || palette[0]
  if (src) return <img src={src} alt={name} style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: size * 0.35, color: '#fff', flexShrink: 0, userSelect: 'none' }}>
      {initials}
    </div>
  )
}

function fmtMsgTime (iso) {
  if (!iso) return ''
  const d = new Date(iso), now = new Date()
  const diff = now - d
  if (diff < 86400000) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' })
}

function buildMsgs (bid) {
  const initial = { id: 'initial', from: 'artisan', type: 'offer', amount: bid.amount, message: bid.message || 'Initial bid', createdAt: bid.createdAt }
  const negs = (bid.negotiations || []).map((n, i) => ({ id: n._id || `n${i}`, from: n.from, type: n.amount ? 'offer' : 'message', amount: n.amount, message: n.message, createdAt: n.createdAt || new Date().toISOString() }))
  return [initial, ...negs]
}

// ════════════════════════════════════════════════════════════════════════════
//  VIEW 3  LIVE BID NEGOTIATION CHAT
// ════════════════════════════════════════════════════════════════════════════
function NegotiationView ({ bid, userType, onBack, onAcceptAndPay }) {
  const [messages, setMessages] = useState(() => buildMsgs(bid))
  const [text, setText] = useState('')
  const [counterAmt, setCounterAmt] = useState('')
  const [showCounter, setShowCounter] = useState(false)
  const [sending, setSending] = useState(false)
  const [paying, setPaying] = useState(false)
  const [currentBid, setCurrentBid] = useState(bid)
  const [online, setOnline] = useState(true)
  const [toast, setToast] = useState(null)
  const bottomRef = useRef(null)
  const pollRef = useRef(null)
  const inputRef = useRef(null)

  // Artisan info — try bidderUserId (new flow) then legacy artisan.user
  const artisan = bid.bidderUserId || bid.artisan?.user || {}
  const artisanName = artisan.firstName ? `${artisan.firstName} ${artisan.lastName || ''}`.trim() : (bid.artisan?.profession || 'Artisan')
  const artisanAvatar = artisan.avatar

  const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3500) }
  const scrollBottom = () => setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 80)

  const fetchLatest = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API_URL}/bids/${bid._id}`, getAuthConfig())
      const b = data.data || data
      setCurrentBid(b)
      setMessages(buildMsgs(b))
      setOnline(true)
      scrollBottom()
    } catch { setOnline(false) }
  }, [bid._id])

  useEffect(() => {
    scrollBottom()
    fetchLatest()
    pollRef.current = setInterval(fetchLatest, POLL_INTERVAL)
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
    setMessages(p => [...p, { id: `tmp${Date.now()}`, from: userType, type: 'message', message: msg, createdAt: new Date().toISOString() }])
    setText('')
    scrollBottom()
    setSending(true)
    try {
      await axios.post(`${API_URL}/bids/${bid._id}/negotiate`, { message: msg, from: userType }, getAuthConfig())
      await fetchLatest()
    } catch { showToast('Failed to send', 'error') }
    finally { setSending(false) }
  }

  const sendCounterOffer = async () => {
    const amount = parseFloat(counterAmt)
    if (!amount || amount <= 0) { showToast('Enter a valid amount', 'error'); return }
    const note = `Counter offer: ₦${amount.toLocaleString()}`
    setMessages(p => [...p, { id: `tmp${Date.now()}`, from: userType, type: 'offer', amount, message: note, createdAt: new Date().toISOString() }])
    setCounterAmt('')
    setShowCounter(false)
    scrollBottom()
    setSending(true)
    try {
      await axios.post(`${API_URL}/bids/${bid._id}/negotiate`, { amount, from: userType, message: note }, getAuthConfig())
      await fetchLatest()
      showToast('Counter offer sent!')
    } catch { showToast('Failed to send offer', 'error') }
    finally { setSending(false) }
  }

  // Accept artisan's offer (or pay an already-agreed price) — then trigger Paystack payment
  const acceptOffer = async offer => {
    const alreadyAccepted = currentBid.status === 'accepted'
    if (!window.confirm(
      alreadyAccepted
        ? `Proceed to payment of ₦${offer.amount?.toLocaleString()}?`
        : `Accept ₦${offer.amount?.toLocaleString()} and proceed to payment?`
    )) return
    clearInterval(pollRef.current)
    setSending(true)
    try {
      if (!alreadyAccepted) {
        await axios.post(`${API_URL}/bids/${bid._id}/accept`, { agreedAmount: offer.amount }, getAuthConfig())
        showToast('Offer accepted! Preparing payment…')
      } else {
        showToast('Preparing payment…')
      }
      setPaying(true)
      const payRes = await axios.post(`${API_URL}/paystack/service-payment`, { bidId: bid._id }, getAuthConfig())
      if (payRes.data?.authorizationUrl) {
        window.location.href = payRes.data.authorizationUrl
      } else {
        showToast('Bid accepted. You can pay from My Requests.', 'success')
        setTimeout(() => onBack?.(), 2500)
      }
    } catch (e) {
      showToast(e.response?.data?.message || 'Failed to proceed', 'error')
      setPaying(false)
      pollRef.current = setInterval(fetchLatest, POLL_INTERVAL)
    } finally { setSending(false) }
  }

  const canSend = currentBid.status === 'pending'
  const isMe = from => from === userType  // userType is always 'user' (property owner)

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 600, display: 'flex', flexDirection: 'column', background: '#0d1117', fontFamily: 'inherit' }}>
      {/* Toast */}
      {toast && (
        <div style={{ position: 'absolute', top: 16, left: '50%', transform: 'translateX(-50%)', zIndex: 10, padding: '10px 20px', borderRadius: 12, fontSize: 13, fontWeight: 600, background: toast.type === 'success' ? '#3fb950' : '#f85149', color: '#fff', boxShadow: '0 4px 24px rgba(0,0,0,0.4)', whiteSpace: 'nowrap' }}>
          {toast.msg}
        </div>
      )}

      {/* Payment overlay */}
      {paying && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 20, background: 'rgba(13,17,23,.92)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
          <div style={{ width: 48, height: 48, border: '4px solid #30363d', borderTopColor: '#C4E53C', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          <p style={{ color: '#c9d1d9', fontSize: 15, fontWeight: 600, margin: 0 }}>Redirecting to payment…</p>
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: '#161b22', borderBottom: '1px solid #30363d', flexShrink: 0 }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: '#8b949e', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center', borderRadius: 6 }}>
          <span style={{ fontSize: 20 }}>←</span>
        </button>
        <ArtisanAvatar name={artisanName} src={artisanAvatar} size={40} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: '#e6edf3', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{artisanName}</div>
          <div style={{ fontSize: 12, color: '#8b949e', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {bid.artisan?.profession || bid.artisan?.specialty || 'Artisan'} · {currentBid.serviceRequest?.title || 'Service Request'}
          </div>
        </div>
        <div style={{ flexShrink: 0, textAlign: 'right' }}>
          <div style={{ fontSize: 11, color: online ? '#3fb950' : '#f85149', fontWeight: 600 }}>{online ? '● Live' : '○ Offline'}</div>
          <div style={{ fontSize: 11, color: '#6e7681', marginTop: 2 }}>{POLL_INTERVAL / 1000}s refresh</div>
        </div>
      </div>

      {/* Bid info strip */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 16px', background: '#21262d', borderBottom: '1px solid #30363d', flexShrink: 0, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 12, color: '#8b949e' }}>{currentBid.status === 'accepted' ? 'Agreed price:' : 'Current bid:'}</span>
        <span style={{ fontSize: 15, fontWeight: 800, color: currentBid.status === 'accepted' ? '#3fb950' : '#e6edf3' }}>₦{currentBid.amount?.toLocaleString()}</span>
        <span style={{ padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: currentBid.status === 'pending' ? 'rgba(210,153,34,.15)' : 'rgba(46,160,67,.15)', color: currentBid.status === 'pending' ? '#d29922' : '#3fb950' }}>{currentBid.status}</span>
        {currentBid.status === 'accepted' && (
          <button
            onClick={() => acceptOffer({ amount: currentBid.amount })}
            disabled={paying || sending}
            style={{ marginLeft: 4, padding: '4px 12px', background: '#C4E53C', color: '#0d1117', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 700, fontSize: 12 }}
          >
            💳 Pay Now
          </button>
        )}
        {currentBid.serviceRequest?.estimatedBudget && (
          <span style={{ fontSize: 12, color: '#8b949e', marginLeft: 'auto' }}>Budget: ₦{currentBid.serviceRequest.estimatedBudget?.toLocaleString()}</span>
        )}
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 6 }}>
        {messages.map(msg => {
          const mine = isMe(msg.from)
          const isOffer = msg.type === 'offer'
          // User (property owner) can accept artisan's offer (not own, not initial)
          const canAccept = isOffer && !mine && msg.id !== 'initial' && canSend

          return (
            <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: mine ? 'flex-end' : 'flex-start', marginBottom: 4 }}>
              {/* Sender label */}
              <div style={{ fontSize: 11, color: '#6e7681', marginBottom: 3, paddingLeft: mine ? 0 : 4, paddingRight: mine ? 4 : 0 }}>
                {mine ? 'You' : artisanName}
              </div>

              {isOffer ? (
                <div style={{ background: mine ? 'rgba(196,229,60,.1)' : 'rgba(56,139,253,.1)', border: `1px solid ${mine ? 'rgba(196,229,60,.3)' : 'rgba(56,139,253,.3)'}`, borderRadius: mine ? '14px 14px 2px 14px' : '14px 14px 14px 2px', padding: '10px 14px', maxWidth: 'min(72%, 320px)', minWidth: 140 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#8b949e', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {msg.id === 'initial' ? '🏷 Initial Bid' : '🔄 Counter Offer'}
                  </div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: mine ? '#C4E53C' : '#58a6ff', lineHeight: 1.2 }}>
                    ₦{msg.amount?.toLocaleString()}
                  </div>
                  {msg.message && msg.id !== 'initial' && (
                    <p style={{ fontSize: 13, color: '#8b949e', margin: '4px 0 0', lineHeight: 1.4 }}>{msg.message}</p>
                  )}
                  {canAccept && (
                    <button onClick={() => acceptOffer(msg)} disabled={sending} style={{ marginTop: 10, width: '100%', padding: '8px 0', background: '#C4E53C', color: '#0d1117', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>
                      ✓ Accept & Pay ₦{msg.amount?.toLocaleString()}
                    </button>
                  )}
                </div>
              ) : (
                <div style={{ padding: '9px 13px', borderRadius: mine ? '14px 14px 2px 14px' : '14px 14px 14px 2px', background: mine ? '#C4E53C' : '#21262d', color: mine ? '#0d1117' : '#c9d1d9', fontSize: 14, maxWidth: 'min(72%, 360px)', lineHeight: 1.5, wordBreak: 'break-word' }}>
                  {msg.message}
                </div>
              )}
              <span style={{ fontSize: 10, color: '#6e7681', marginTop: 3, paddingLeft: mine ? 0 : 4, paddingRight: mine ? 4 : 0 }}>
                {fmtMsgTime(msg.createdAt)}
              </span>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Counter offer bar */}
      {showCounter && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', background: '#161b22', borderTop: '1px solid #30363d', flexShrink: 0 }}>
          <span style={{ color: '#8b949e', fontWeight: 700, fontSize: 15 }}>₦</span>
          <input autoFocus type="number" placeholder="Your counter offer amount" value={counterAmt} onChange={e => setCounterAmt(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendCounterOffer()} style={{ flex: 1, padding: '8px 12px', border: '1px solid #30363d', borderRadius: 8, background: '#21262d', color: '#e6edf3', fontSize: 14 }} />
          <button onClick={sendCounterOffer} disabled={sending} style={{ padding: '8px 14px', background: '#C4E53C', color: '#0d1117', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>Send</button>
          <button onClick={() => setShowCounter(false)} style={{ background: 'none', border: 'none', color: '#8b949e', cursor: 'pointer', fontSize: 18, padding: '4px 6px' }}>✕</button>
        </div>
      )}

      {/* Input bar */}
      {canSend ? (
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, padding: '10px 16px', background: '#161b22', borderTop: '1px solid #30363d', flexShrink: 0 }}>
          <button onClick={() => setShowCounter(o => !o)} title="Counter offer" style={{ padding: '9px 12px', background: showCounter ? '#C4E53C' : '#21262d', color: showCounter ? '#0d1117' : '#8b949e', border: '1px solid #30363d', borderRadius: 8, cursor: 'pointer', fontWeight: 800, fontSize: 14, flexShrink: 0 }}>₦</button>
          <textarea ref={inputRef} rows={1} placeholder="Message… (or type a number to counter offer)" value={text} onChange={e => { setText(e.target.value); e.target.style.height = 'auto'; e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px' }} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }} style={{ flex: 1, padding: '9px 12px', border: '1px solid #30363d', borderRadius: 8, background: '#21262d', color: '#e6edf3', fontSize: 14, resize: 'none', fontFamily: 'inherit', lineHeight: 1.5, overflow: 'hidden' }} />
          <button onClick={sendMessage} disabled={!text.trim() || sending} style={{ padding: '9px 13px', background: text.trim() ? '#C4E53C' : '#21262d', color: text.trim() ? '#0d1117' : '#6e7681', border: 'none', borderRadius: 8, cursor: text.trim() ? 'pointer' : 'default', transition: 'all .15s', flexShrink: 0, fontSize: 16, fontWeight: 700 }}>↑</button>
        </div>
      ) : (
        <div style={{ padding: '12px 16px', background: '#161b22', borderTop: '1px solid #30363d', textAlign: 'center', fontSize: 13, color: '#8b949e', flexShrink: 0 }}>
          {currentBid.status === 'accepted' ? (
            <span style={{ color: '#3fb950', fontWeight: 600 }}>
              ✓ Agreed ₦{currentBid.amount?.toLocaleString()} —{' '}
              <button onClick={() => acceptOffer({ amount: currentBid.amount })} disabled={paying || sending} style={{ background: 'none', border: 'none', color: '#C4E53C', cursor: 'pointer', fontWeight: 700, fontSize: 13, padding: 0 }}>
                Proceed to Payment →
              </button>
            </span>
          ) : (
            <span style={{ color: '#8b949e' }}>
              Bid is <strong style={{ color: '#f85149' }}>{currentBid.status}</strong>
            </span>
          )}
        </div>
      )}
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
            onAcceptAndPay={async (acceptedBid) => {
              try {
                const token = localStorage.getItem('authToken')
                const res = await fetch(`${API_URL}/paystack/service-payment`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                  body: JSON.stringify({ bidId: acceptedBid._id })
                })
                const data = await res.json()
                if (data?.authorizationUrl) window.location.href = data.authorizationUrl
                else setView('my-requests')
              } catch { setView('my-requests') }
            }}
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
