'use client'

/**
 * BookingCart.jsx
 *
 * Shows saved / incomplete (pending_payment) bookings so the user can
 * resume checkout or remove them. For non-logged-in users the cart
 * is persisted in localStorage under key `bkg_cart`.
 */

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { ShoppingCart, Calendar, MapPin, Trash2, ArrowRight, Loader2 } from 'lucide-react'

const API = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4001'

function fmt (n, cur = 'NGN') {
  const sym = cur === 'USD' ? '$' : cur === 'GBP' ? '£' : '₦'
  return `${sym}${Number(n || 0).toLocaleString()}`
}

export default function BookingCart () {
  const router = useRouter()
  const [cart, setCart]     = useState([])
  const [loading, setLoading] = useState(true)
  const [err, setErr]       = useState(null)

  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null

  useEffect(() => {
    if (token) {
      // Logged-in: load from server
      axios.get(`${API}/api/bookings/cart`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(r => setCart(r.data.cart || []))
        .catch(e => setErr(e.response?.data?.msg || 'Failed to load cart'))
        .finally(() => setLoading(false))
    } else {
      // Guest: load from localStorage
      try {
        const local = JSON.parse(localStorage.getItem('bkg_cart') || '[]')
        setCart(local)
      } catch { setCart([]) }
      setLoading(false)
    }
  }, [token])

  const removeItem = async (id) => {
    if (token) {
      try {
        await axios.delete(`${API}/api/bookings/cart/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        setCart(prev => prev.filter(b => b._id !== id))
      } catch (e) {
        alert(e.response?.data?.msg || 'Could not remove item')
      }
    } else {
      const updated = cart.filter(b => b._id !== id)
      localStorage.setItem('bkg_cart', JSON.stringify(updated))
      setCart(updated)
    }
  }

  const resume = (b) => {
    // Navigate back to the property page pre-filled with dates
    const p = b.property
    const propId = p?._id || p
    if (propId) {
      router.push(`/property/${propId}?checkIn=${b.checkIn?.slice(0,10) || ''}&checkOut=${b.checkOut?.slice(0,10) || ''}&guests=${b.guestCount || 1}`)
    }
  }

  if (loading) return (
    <div style={{ display:'flex', justifyContent:'center', padding: 60 }}>
      <Loader2 size={28} style={{ color: 'var(--color-primary)', animation: 'spin 1s linear infinite' }} />
    </div>
  )

  return (
    <div style={{ padding: '24px 0', maxWidth: 680 }}>
      <h2 style={{ color: 'var(--color-primary)', marginBottom: 6, fontSize: 22 }}>
        <ShoppingCart size={20} style={{ marginRight: 8, verticalAlign: 'middle' }} />
        Saved Bookings
      </h2>
      <p style={{ color: '#888', fontSize: 14, marginBottom: 20 }}>These are incomplete bookings you started. Complete them before they expire.</p>

      {err && <p style={{ color:'#c53030', fontSize:14 }}>{err}</p>}

      {cart.length === 0 ? (
        <div style={{ textAlign:'center', padding:60, color:'#aaa' }}>
          <ShoppingCart size={40} style={{ opacity:0.3, marginBottom:12 }} />
          <p>Your cart is empty.</p>
          <button onClick={() => router.push('/search')} style={{ marginTop: 12, background:'var(--color-primary)', color:'#fff', border:'none', borderRadius:8, padding:'10px 20px', cursor:'pointer', fontWeight:600 }}>
            Browse Properties
          </button>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          {cart.map(b => {
            const p = b.property || {}
            const cur = b.payment?.currency || 'NGN'
            return (
              <div key={b._id} style={{ background:'#fff', borderRadius:12, border:'1.5px solid #e0ead8', overflow:'hidden', display:'flex', gap:0 }}>
                {p.images?.[0]
                  ? <img src={p.images[0]} alt={p.title} style={{ width:110, objectFit:'cover', flexShrink:0 }} />
                  : <div style={{ width:110, background:'#e8f0e0', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}><ShoppingCart size={24} color='#a0b890' /></div>
                }
                <div style={{ flex:1, padding:'14px 16px' }}>
                  <div style={{ fontWeight:700, color:'#0B3D28', fontSize:15, marginBottom:3 }}>{p.title || 'Property'}</div>
                  {(p.city || p.state) && (
                    <div style={{ color:'#888', fontSize:12, display:'flex', gap:4, alignItems:'center', marginBottom:6 }}>
                      <MapPin size={11} />{[p.city, p.state].filter(Boolean).join(', ')}
                    </div>
                  )}
                  {b.checkIn && b.checkOut && (
                    <div style={{ fontSize:13, color:'#555', marginBottom:8 }}>
                      <Calendar size={11} style={{ marginRight:4 }} />
                      {new Date(b.checkIn).toLocaleDateString('en-GB', { day:'numeric', month:'short' })} → {new Date(b.checkOut).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' })}
                      &nbsp;·&nbsp;{b.nights} night{b.nights!==1?'s':''}
                    </div>
                  )}
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <strong style={{ color:'#0B3D28', fontSize:14 }}>{fmt(b.payment?.total, cur)}</strong>
                    <div style={{ display:'flex', gap:8 }}>
                      <button onClick={() => removeItem(b._id)} title='Remove' style={{ background:'none', border:'1px solid #fca5a5', borderRadius:6, padding:'5px 10px', cursor:'pointer', color:'#c53030', display:'flex', gap:4, alignItems:'center', fontSize:12 }}>
                        <Trash2 size={12} /> Remove
                      </button>
                      <button onClick={() => resume(b)} style={{ background:'var(--color-primary)', color:'#fff', border:'none', borderRadius:6, padding:'5px 12px', cursor:'pointer', fontWeight:600, display:'flex', gap:4, alignItems:'center', fontSize:12 }}>
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
