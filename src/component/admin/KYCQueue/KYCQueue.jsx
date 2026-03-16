'use client'
import React, { useState, useEffect, useCallback } from 'react'
import {
  ShieldCheck, ShieldX, Clock, User, FileText,
  CheckCircle, XCircle, Eye, RefreshCw, Filter, Search
} from 'lucide-react'
import axios from 'axios'
import './KYCQueue.scss'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001'

const ROLE_LABEL = {
  'property-owner': 'Property Owner',
  artisan: 'Artisan',
  user: 'Tenant'
}

const DOC_TYPE_LABEL = {
  nin: 'NIN',
  passport: 'Passport',
  drivers_license: "Driver's License",
  national_id: 'National ID'
}

export default function KYCQueue () {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [roleFilter, setRoleFilter] = useState('')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null) // user being reviewed
  const [note, setNote] = useState('')
  const [acting, setActing] = useState(false)
  const [toast, setToast] = useState(null)

  const fetchQueue = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page, limit: 20 }
      if (roleFilter) params.role = roleFilter
      const res = await axios.get(`${API}/api/auth/admin/kyc-queue`, { params })
      setEntries(res.data.data || [])
      setTotal(res.data.total || 0)
    } catch {
      setEntries([])
    } finally {
      setLoading(false)
    }
  }, [page, roleFilter])

  useEffect(() => { fetchQueue() }, [fetchQueue])

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  const handleDecision = async (userId, approved) => {
    setActing(true)
    try {
      await axios.put(`${API}/api/auth/admin/users/${userId}/kyc`, {
        verified: approved,
        level: 'basic',
        verificationNote: note
      })
      showToast(approved ? 'KYC approved and user notified.' : 'KYC rejected and user notified.')
      setSelected(null)
      setNote('')
      fetchQueue()
    } catch (e) {
      showToast(e?.response?.data?.msg || 'Action failed.', 'error')
    } finally {
      setActing(false)
    }
  }

  const filtered = search
    ? entries.filter(u =>
        `${u.firstName} ${u.lastName} ${u.email}`.toLowerCase().includes(search.toLowerCase())
      )
    : entries

  const stats = {
    total,
    propertyOwners: entries.filter(u => u.role === 'property-owner').length,
    artisans: entries.filter(u => u.role === 'artisan').length,
    users: entries.filter(u => u.role === 'user').length
  }

  return (
    <div className='kyc-page'>
      {/* Toast */}
      {toast && (
        <div className={`kyc-toast kyc-toast--${toast.type}`}>
          {toast.type === 'success' ? <CheckCircle size={16} /> : <XCircle size={16} />}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className='kyc-header'>
        <div>
          <h1><ShieldCheck size={22} /> KYC Approval Queue</h1>
          <p>Review and verify submitted identity documents</p>
        </div>
        <button className='kyc-btn kyc-btn--outline' onClick={fetchQueue}>
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Stats */}
      <div className='kyc-stats'>
        {[
          { label: 'Pending Total', value: total, icon: <Clock size={18} />, mod: 'amber' },
          { label: 'Property Owners', value: stats.propertyOwners, icon: <User size={18} />, mod: 'primary' },
          { label: 'Artisans', value: stats.artisans, icon: <ShieldCheck size={18} />, mod: 'green' },
          { label: 'Tenants', value: stats.users, icon: <FileText size={18} />, mod: 'blue' }
        ].map(({ label, value, icon, mod }) => (
          <div key={label} className='kyc-stat-card'>
            <div className={`stat-icon stat-icon--${mod}`}>{icon}</div>
            <div className='stat-value'>{value}</div>
            <div className='stat-label'>{label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className='kyc-filters'>
        <div className='kyc-search'>
          <Search size={15} />
          <input
            placeholder='Search by name or email…'
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className='kyc-role-filter'>
          <Filter size={14} />
          <select value={roleFilter} onChange={e => { setRoleFilter(e.target.value); setPage(1) }}>
            <option value=''>All roles</option>
            <option value='property-owner'>Property Owner</option>
            <option value='artisan'>Artisan</option>
            <option value='user'>Tenant</option>
          </select>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className='kyc-loading'>
          <div className='kyc-spinner' />
          Loading queue…
        </div>
      ) : filtered.length === 0 ? (
        <div className='kyc-empty'>
          <ShieldCheck size={48} />
          <p>No pending KYC submissions</p>
        </div>
      ) : (
        <div className='kyc-table-wrap'>
          <table className='kyc-table'>
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Document</th>
                <th>Submitted</th>
                <th>Account Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(user => (
                <tr key={user._id}>
                  <td>
                    <div className='kyc-user-cell'>
                      <div className='kyc-avatar'>
                        {(user.firstName?.[0] || '?').toUpperCase()}
                      </div>
                      <div>
                        <div className='kyc-name'>
                          {user.firstName} {user.lastName}
                        </div>
                        <div className='kyc-email'>{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`kyc-badge kyc-badge--role-${user.role}`}>
                      {ROLE_LABEL[user.role] || user.role}
                    </span>
                  </td>
                  <td>
                    <div className='kyc-doc-cell'>
                      <span className='kyc-doc-type'>
                        {DOC_TYPE_LABEL[user.kyc?.documentType] || user.kyc?.documentType || '—'}
                      </span>
                      {user.kyc?.documentUrl && (
                        <a
                          href={user.kyc.documentUrl}
                          target='_blank'
                          rel='noreferrer'
                          className='kyc-view-link'
                        >
                          <Eye size={13} /> View
                        </a>
                      )}
                    </div>
                  </td>
                  <td className='kyc-date'>
                    {user.createdAt
                      ? new Date(user.createdAt).toLocaleDateString('en-NG', {
                          day: 'numeric', month: 'short', year: 'numeric'
                        })
                      : '—'}
                  </td>
                  <td>
                    <span className={`kyc-badge kyc-badge--status-${user.accountStatus}`}>
                      {user.accountStatus?.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td>
                    <div className='kyc-actions'>
                      <button
                        className='kyc-action-btn kyc-action-btn--approve'
                        onClick={() => { setSelected(user); setNote('') }}
                        title='Review'
                      >
                        <Eye size={14} /> Review
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {total > 20 && (
        <div className='kyc-pagination'>
          <button
            className='kyc-btn kyc-btn--outline'
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
          >
            Previous
          </button>
          <span>Page {page} of {Math.ceil(total / 20)}</span>
          <button
            className='kyc-btn kyc-btn--outline'
            disabled={page >= Math.ceil(total / 20)}
            onClick={() => setPage(p => p + 1)}
          >
            Next
          </button>
        </div>
      )}

      {/* Review Modal */}
      {selected && (
        <div className='kyc-overlay' onClick={() => setSelected(null)}>
          <div className='kyc-modal' onClick={e => e.stopPropagation()}>
            <div className='kyc-modal__header'>
              <h2>Review KYC — {selected.firstName} {selected.lastName}</h2>
              <button className='kyc-modal__close' onClick={() => setSelected(null)}>✕</button>
            </div>
            <div className='kyc-modal__body'>
              <div className='kyc-detail-grid'>
                <div className='kyc-detail-row'>
                  <span>Email</span>
                  <strong>{selected.email}</strong>
                </div>
                <div className='kyc-detail-row'>
                  <span>Role</span>
                  <strong>{ROLE_LABEL[selected.role] || selected.role}</strong>
                </div>
                <div className='kyc-detail-row'>
                  <span>Document Type</span>
                  <strong>{DOC_TYPE_LABEL[selected.kyc?.documentType] || selected.kyc?.documentType || '—'}</strong>
                </div>
                {selected.kyc?.documentNumber && (
                  <div className='kyc-detail-row'>
                    <span>Document Number</span>
                    <strong>{selected.kyc.documentNumber}</strong>
                  </div>
                )}
              </div>

              {/* Document preview */}
              {selected.kyc?.documentUrl && (
                <div className='kyc-doc-preview'>
                  <p className='kyc-doc-preview__label'>Submitted Document</p>
                  {/\.(jpg|jpeg|png|gif|webp)$/i.test(selected.kyc.documentUrl) ? (
                    <img src={selected.kyc.documentUrl} alt='KYC Document' />
                  ) : (
                    <a
                      href={selected.kyc.documentUrl}
                      target='_blank'
                      rel='noreferrer'
                      className='kyc-btn kyc-btn--outline'
                    >
                      <Eye size={14} /> Open Document
                    </a>
                  )}
                </div>
              )}

              {/* Note */}
              <div className='kyc-note-wrap'>
                <label>Note (shown to user if rejected)</label>
                <textarea
                  placeholder='Optional rejection reason or verification note…'
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  rows={3}
                />
              </div>

              {/* Decision buttons */}
              <div className='kyc-decision-btns'>
                <button
                  className='kyc-btn kyc-btn--approve'
                  disabled={acting}
                  onClick={() => handleDecision(selected._id, true)}
                >
                  <CheckCircle size={15} />
                  {acting ? 'Processing…' : 'Approve KYC'}
                </button>
                <button
                  className='kyc-btn kyc-btn--reject'
                  disabled={acting}
                  onClick={() => handleDecision(selected._id, false)}
                >
                  <XCircle size={15} />
                  Reject
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
