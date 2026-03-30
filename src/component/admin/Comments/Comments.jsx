'use client'
import React, { useEffect, useState, useCallback } from 'react'
import { CheckCircle2, Trash2, RefreshCw, Star } from 'lucide-react'
import { adminComments as adminCommentsApi } from '@/libs/api'
import './Comments.scss'

export default function Comments () {
  const [comments, setComments] = useState([])
  const [total,    setTotal]    = useState(0)
  const [filter,   setFilter]   = useState('pending')
  const [loading,  setLoading]  = useState(false)
  const [toast,    setToast]    = useState(null)

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
    } catch { notify('Failed to load comments', 'error') }
    finally { setLoading(false) }
  }, [filter])

  useEffect(() => { load() }, [load])

  const approve = async id => {
    try {
      await adminCommentsApi.approve(id)
      setComments(prev => prev.map(c => c._id === id ? { ...c, approved: true } : c))
      notify('Comment approved — now visible to users')
    } catch { notify('Failed to approve', 'error') }
  }

  const remove = async id => {
    if (!confirm('Delete this comment permanently?')) return
    try {
      await adminCommentsApi.remove(id)
      setComments(prev => prev.filter(c => c._id !== id))
      notify('Comment deleted')
    } catch { notify('Failed to delete', 'error') }
  }

  return (
    <div className='cmt-wrap'>
      {toast && (
        <div className={`cmt-toast cmt-toast--${toast.type}`}>{toast.msg}</div>
      )}

      {/* Header */}
      <div className='cmt-head'>
        <div>
          <h2>Property Comments</h2>
          <p>{total} comment{total !== 1 ? 's' : ''}{filter !== 'all' ? ` (${filter})` : ''}</p>
        </div>
        <div className='cmt-head-right'>
          {['pending', 'approved', 'all'].map(f => (
            <button
              key={f}
              className={`cmt-tab${filter === f ? ' active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f}
            </button>
          ))}
          <button className='cmt-refresh-btn' onClick={load} title='Refresh'>
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className='cmt-state'>
          <div className='cmt-spinner' />
          <p>Loading…</p>
        </div>
      ) : comments.length === 0 ? (
        <div className='cmt-empty'>
          <p>No {filter !== 'all' ? filter : ''} comments found.</p>
        </div>
      ) : (
        <div className='cmt-list'>
          {comments.map(c => (
            <div key={c._id} className='cmt-card'>
              <div className='cmt-card-top'>
                <div className='cmt-card-meta'>
                  {c.propertyId && (
                    <div className='cmt-property'>
                      Property: <strong>{c.propertyId.title || c.propertyId}</strong>
                    </div>
                  )}
                  <div className='cmt-author'>
                    <img
                      src={c.userId?.avatar || '/avatar-placeholder.png'}
                      alt='avatar'
                      className='cmt-av'
                    />
                    <div>
                      <span className='cmt-name'>
                        {c.userId
                          ? `${c.userId.firstName} ${c.userId.lastName}`
                          : c.guestName || 'Anonymous'}
                      </span>
                      {c.userId?.email && (
                        <span className='cmt-email'>{c.userId.email}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className='cmt-actions'>
                  {!c.approved && (
                    <button className='cmt-btn cmt-btn--approve' onClick={() => approve(c._id)}>
                      <CheckCircle2 size={13} /> Approve
                    </button>
                  )}
                  <button className='cmt-btn cmt-btn--delete' onClick={() => remove(c._id)}>
                    <Trash2 size={13} /> Delete
                  </button>
                </div>
              </div>

              {c.rating && (
                <div className='cmt-rating'>
                  {'★'.repeat(c.rating)}{'☆'.repeat(5 - c.rating)}
                  <span className='cmt-rating-val'>{c.rating}/5</span>
                </div>
              )}

              <p className='cmt-text'>{c.comment}</p>

              <div className='cmt-footer'>
                <span className='cmt-date'>{new Date(c.createdAt).toLocaleString()}</span>
                <span className={`cmt-status ${c.approved ? 'approved' : 'pending'}`}>
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
