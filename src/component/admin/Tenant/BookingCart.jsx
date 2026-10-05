'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { bookings as bookingsApi } from '@/libs/api'
import { encodeId } from '@/libs/propId'
import { ShoppingCart, Calendar, MapPin, Trash2, ArrowRight, Loader2 } from 'lucide-react'

const D = { bg: '#0d1117', surface: '#161b22', border: 'rgba(255,255,255,0.06)', border2: 'rgba(255,255,255,0.1)', text: '#e6edf3', muted: '#7d8590', accent: '#C4E53C', primary: '#0B3D28' }

function fmt (n, cur = 'NGN') {
  const sym = cur === 'USD' ? '$' : cur === 'GBP' ? '£' : '₦'
  return `${sym}${Number(n || 0).toLocaleString()}`
}

export default function BookingCart () {
  const router = useRouter()
  const [cart, setCart]       = useState([])
  const [loading, setLoading] = useState(true)
  const [err, setErr]         = useState(null)

  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null

  useEffect(() => {
    if (token) {
      bookingsApi.getCart()
        .then(r => setCart(r.data.cart || []))
        .catch(e => setErr(e.response?.data?.msg || 'Failed to load cart'))
        .finally(() => setLoading(false))
    } else {
      try { setCart(JSON.parse(localStorage.getItem('bkg_cart') || '[]')) } catch { setCart([]) }
      setLoading(false)
    }
  }, [token])

  const removeItem = async (id) => {
    if (token) {
      try {
        await bookingsApi.removeFromCart(id)
        setCart(prev => prev.filter(b => b._id !== id))
      } catch (e) { alert(e.response?.data?.msg || 'Could not remove item') }
    } else {
      const updated = cart.filter(b => b._id !== id)
      localStorage.setItem('bkg_cart', JSON.stringify(updated))
      setCart(updated)
    }
  }

  const resume = (b) => {
    const propId = b.property?._id || b.property
    if (propId) router.push(`/property/${encodeId(propId)}?checkIn=${b.checkIn?.slice(0, 10) || ''}&checkOut=${b.checkOut?.slice(0, 10) || ''}&guests=${b.guestCount || 1}`)
  }

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 80, background: D.bg, minHeight: '100%' }}>
      <Loader2 size={28} style={{ color: D.accent, animation: 'spin 1s linear infinite' }} />
    </div>
  )

  return (
    <div style={{ padding: '24px 28px', background: D.bg, minHeight: '100%', color: D.text }}>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '1.1rem', fontWeight: 800, color: D.text, margin: '0 0 4px' }}>
          <ShoppingCart size={18} color={D.accent} /> Saved Bookings
        </h2>
        <p style={{ color: D.muted, fontSize: 13, margin: 0 }}>Incomplete bookings you started — complete them before they expire.</p>
      </div>

      {err && <p style={{ color: '#f87171', fontSize: 13, marginBottom: 12 }}>{err}</p>}

      {cart.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 24px', color: D.muted }}>
          <ShoppingCart size={40} style={{ opacity: 0.2, marginBottom: 14 }} color={D.muted} />
          <p style={{ fontSize: 16, fontWeight: 700, color: D.text, margin: '0 0 6px' }}>Your cart is empty</p>
          <p style={{ fontSize: 13, margin: '0 0 20px' }}>Browse properties and save your favourites.</p>
          <button
            onClick={() => router.push('/search')}
            style={{ background: D.accent, color: D.primary, border: 'none', borderRadius: 9, padding: '10px 22px', cursor: 'pointer', fontWeight: 700, fontSize: 13 }}
          >
            Browse Properties
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {cart.map(b => {
            const p   = b.property || {}
            const cur = b.payment?.currency || 'NGN'
            const img = p.images?.[0]?.url || p.images?.[0] || null
            return (
              <div key={b._id} style={{ background: D.surface, borderRadius: 14, border: `1px solid ${D.border}`, overflow: 'hidden', display: 'flex', transition: 'border-color 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = D.border2}
                onMouseLeave={e => e.currentTarget.style.borderColor = D.border}
              >
                {img
                  ? <img src={img} alt={p.title} style={{ width: 100, objectFit: 'cover', flexShrink: 0 }} />
                  : <div style={{ width: 100, background: 'rgba(196,229,60,0.04)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRight: `1px solid ${D.border}` }}>
                      <ShoppingCart size={22} color='rgba(196,229,60,0.2)' />
                    </div>
                }
                <div style={{ flex: 1, padding: '14px 16px' }}>
                  <div style={{ fontWeight: 700, color: D.text, fontSize: 14, marginBottom: 4 }}>{p.title || 'Property'}</div>

                  {(p.city || p.state) && (
                    <div style={{ color: D.muted, fontSize: 12, display: 'flex', alignItems: 'center', gap: 4, marginBottom: 6 }}>
                      <MapPin size={11} /> {[p.city, p.state].filter(Boolean).join(', ')}
                    </div>
                  )}

                  {b.checkIn && b.checkOut && (
                    <div style={{ fontSize: 12, color: D.muted, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Calendar size={11} />
                      {new Date(b.checkIn).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} →{' '}
                      {new Date(b.checkOut).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      {b.nights ? ` · ${b.nights} night${b.nights !== 1 ? 's' : ''}` : ''}
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                    <strong style={{ color: D.accent, fontWeight: 800, fontSize: 14 }}>{fmt(b.payment?.total, cur)}</strong>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => removeItem(b._id)}
                        style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 7, padding: '5px 10px', cursor: 'pointer', color: '#f87171', display: 'flex', gap: 4, alignItems: 'center', fontSize: 12, fontWeight: 600 }}>
                        <Trash2 size={12} /> Remove
                      </button>
                      <button onClick={() => resume(b)}
                        style={{ background: D.accent, color: D.primary, border: 'none', borderRadius: 7, padding: '5px 12px', cursor: 'pointer', fontWeight: 700, display: 'flex', gap: 4, alignItems: 'center', fontSize: 12 }}>
                        Resume <ArrowRight size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
