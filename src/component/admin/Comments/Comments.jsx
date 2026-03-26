'use client'
import React, { useEffect, useState, useCallback } from 'react'
import { CheckCircle2, Trash2, Star, RefreshCw, Filter } from 'lucide-react'
import { adminComments as adminCommentsApi } from '@/libs/api'

export default function Comments () {
  const [comments, setComments] = useState([])
  const [total, setTotal] = useState(0)
  const [filter, setFilter] = useState('pending') // pending | approved | all
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState(null)

  const notify = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await adminCommentsApi.getAll(filter !== 'all' ? { status: filter } : {})
      setComments(res.data.comments || [])
      setTotal(res.data.total || 0)
    } catch {
      notify('Failed to load comments', 'error')
    } finally { setLoading(false) }
  }, [filter])

  useEffect(() => { load() }, [load])

  const approve = async (id) => {
    try {
      await adminCommentsApi.approve(id)
      setComments(prev => prev.map(c => c._id === id ? { ...c, approved: true } : c))
      notify('Comment approved — now visible to users')
    } catch { notify('Failed to approve', 'error') }
  }

  const remove = async (id) => {
    if (!confirm('Delete this comment permanently?')) return
    try {
      await adminCommentsApi.remove(id)
      setComments(prev => prev.filter(c => c._id !== id))
      notify('Comment deleted')
    } catch { notify('Failed to delete', 'error') }
  }

  return (
    <div style={{ padding: '24px 28px', maxWidth: 900 }}>
      {toast && (
        <div style={{
          position: 'fixed', top: 20, right: 20, padding: '10px 18px',
          background: toast.type === 'error' ? '#fef2f2' : '#f0fdf4',
          border: `1px solid ${toast.type === 'error' ? '#fca5a5' : '#86efac'}`,
          borderRadius: 8, fontSize: 13, zIndex: 9999,
          color: toast.type === 'error' ? '#b91c1c' : '#15803d'
        }}>
          {toast.msg}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Property Comments</h2>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#666' }}>{total} comment{total !== 1 ? 's' : ''} {filter !== 'all' ? `(${filter})` : ''}</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {['pending', 'approved', 'all'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '6px 14px', borderRadius: 6, border: '1.5px solid',
                borderColor: filter === f ? 'var(--color-primary, #0B3D28)' : '#e5e7eb',
                background: filter === f ? 'var(--color-primary, #0B3D28)' : '#fff',
                color: filter === f ? '#fff' : '#444', fontSize: 13, cursor: 'pointer',
                fontWeight: filter === f ? 600 : 400, textTransform: 'capitalize'
              }}
            >{f}</button>
          ))}
          <button onClick={load} style={{ padding: '6px 10px', borderRadius: 6, border: '1.5px solid #e5e7eb', background: '#fff', cursor: 'pointer' }}>
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: 40, textAlign: 'center', color: '#888' }}>Loading…</div>
      ) : comments.length === 0 ? (
        <div style={{ padding: 40, textAlign: 'center', color: '#888' }}>
          No {filter !== 'all' ? filter : ''} comments found.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {comments.map(c => (
            <div key={c._id} style={{
              background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10,
              padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 8
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                <div>
                  {/* Property link */}
                  {c.propertyId && (
                    <div style={{ fontSize: 11, color: '#888', marginBottom: 4 }}>
                      Property: <strong>{c.propertyId.title || c.propertyId}</strong>
                    </div>
                  )}
                  {/* Author */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <img
                      src={c.userId?.avatar || '/avatar-placeholder.png'}
                      alt='avatar'
                      style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }}
                    />
                    <div>
                      <span style={{ fontWeight: 600, fontSize: 13 }}>
                        {c.userId ? `${c.userId.firstName} ${c.userId.lastName}` : (c.guestName || 'Anonymous')}
                      </span>
                      {c.userId?.email && <span style={{ fontSize: 11, color: '#888', marginLeft: 6 }}>{c.userId.email}</span>}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                  {!c.approved && (
                    <button
                      onClick={() => approve(c._id)}
                      style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 12px', borderRadius: 6, border: '1.5px solid #22c55e', background: '#f0fdf4', color: '#15803d', fontSize: 12, cursor: 'pointer', fontWeight: 600 }}
                    >
                      <CheckCircle2 size={13} /> Approve
                    </button>
                  )}
                  <button
                    onClick={() => remove(c._id)}
                    style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 12px', borderRadius: 6, border: '1.5px solid #fca5a5', background: '#fef2f2', color: '#b91c1c', fontSize: 12, cursor: 'pointer', fontWeight: 600 }}
                  >
                    <Trash2 size={13} /> Delete
                  </button>
                </div>
              </div>

              {/* Rating */}
              {c.rating && (
                <div style={{ color: '#f59e0b', fontSize: 14 }}>
                  {'★'.repeat(c.rating)}{'☆'.repeat(5 - c.rating)}
                  <span style={{ fontSize: 11, color: '#888', marginLeft: 4 }}>{c.rating}/5</span>
                </div>
              )}

              {/* Comment text */}
              <p style={{ margin: 0, fontSize: 14, color: '#333', lineHeight: 1.6 }}>{c.comment}</p>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#aaa' }}>
                <span>{new Date(c.createdAt).toLocaleString()}</span>
                <span style={{ color: c.approved ? '#22c55e' : '#f59e0b', fontWeight: 600 }}>
                  {c.approved ? '✓ Approved' : '⏳ Pending'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
