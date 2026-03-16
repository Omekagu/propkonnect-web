'use client'
import React, { useState, useEffect, useCallback } from 'react'
import {
  ShieldCheck, ShieldX, Clock, User, FileText,
  CheckCircle, XCircle, Eye, RefreshCw, Filter, Search,
  Calendar, Users, CameraIcon, ChevronDown, ChevronUp
} from 'lucide-react'
import { api } from '@/libs/api-client'
import './KYCQueue.scss'

const ROLE_LABEL = {
  'property-owner': 'Property Owner',
  'artisan':        'Artisan',
  'artisan-admin':  'Artisan Admin',
  'property-admin': 'Property Admin',
  'user':           'Tenant / User'
}

const DOC_TYPE_LABEL = {
  nin:              'NIN',
  bvn:              'BVN',
  passport:         'Passport',
  drivers_license:  "Driver's License",
  voters_card:      "Voter's Card",
  national_id:      'National ID'
}

const STATUS_TABS = ['pending', 'under_review', 'approved', 'rejected']

function ImgOrLink ({ url, alt }) {
  if (!url) return <span className='kyc-no-doc'>Not provided</span>
  if (/\.(jpg|jpeg|png|gif|webp)$/i.test(url) || url.includes('/image/')) {
    return (
      <a href={url} target='_blank' rel='noreferrer'>
        <img src={url} alt={alt} className='kyc-thumb' />
      </a>
    )
  }
  return (
    <a href={url} target='_blank' rel='noreferrer' className='kyc-btn kyc-btn--outline'>
      <Eye size={13} /> View File
    </a>
  )
}

export default function KYCQueue () {
  const [statusFilter, setStatusFilter] = useState('pending')
  const [roleFilter,   setRoleFilter]   = useState('')
  const [search,       setSearch]       = useState('')
  const [entries,      setEntries]      = useState([])
  const [loading,      setLoading]      = useState(true)
  const [total,        setTotal]        = useState(0)
  const [page,         setPage]         = useState(1)

  const [selected,     setSelected]     = useState(null)
  const [detail,       setDetail]       = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)

  const [rejectionReason,   setRejectionReason]   = useState('')
  const [verificationNote,  setVerificationNote]  = useState('')
  const [kycLevel,          setKycLevel]          = useState('full')
  const [acting,            setActing]            = useState(false)
  const [toast,             setToast]             = useState(null)
  const [expandNok,         setExpandNok]         = useState(false)

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  // ── Fetch queue ─────────────────────────────────────────────────────────────
  const fetchQueue = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page, limit: 20, status: statusFilter }
      if (roleFilter) params.role = roleFilter
      const res = await api.get('/api/kyc/admin/queue', { params })
      setEntries(res.data.data || [])
      setTotal(res.data.total || 0)
    } catch {
      setEntries([])
    } finally {
      setLoading(false)
    }
  }, [page, statusFilter, roleFilter])

  useEffect(() => { fetchQueue() }, [fetchQueue])

  // ── Fetch detail ────────────────────────────────────────────────────────────
  const openReview = async (user) => {
    setSelected(user)
    setRejectionReason('')
    setVerificationNote('')
    setKycLevel('full')
    setExpandNok(false)
    setDetailLoading(true)
    try {
      const res = await api.get(`/api/kyc/admin/${user._id}`)
      setDetail(res.data.data)
    } catch {
      setDetail(user) // fallback to queue data
    } finally {
      setDetailLoading(false)
    }
  }

  // ── Start review ─────────────────────────────────────────────────────────────
  const startReview = async (userId) => {
    try {
      await api.patch(`/api/kyc/admin/${userId}/start-review`)
      fetchQueue()
    } catch { /* ignore */ }
  }

  // ── Approve / Reject ─────────────────────────────────────────────────────────
  const handleDecision = async (approved) => {
    if (!approved && !rejectionReason.trim()) {
      return showToast('Please provide a rejection reason.', 'error')
    }
    setActing(true)
    try {
      await api.put(`/api/kyc/admin/${selected._id}/review`, {
        approved,
        rejectionReason: approved ? undefined : rejectionReason,
        verificationNote,
        level: kycLevel
      })
      showToast(approved ? 'KYC approved — user notified.' : 'KYC rejected — user notified.')
      setSelected(null)
      setDetail(null)
      fetchQueue()
    } catch (e) {
      showToast(e?.response?.data?.message || 'Action failed.', 'error')
    } finally {
      setActing(false)
    }
  }

  // ── Derived ──────────────────────────────────────────────────────────────────
  const filtered = search
    ? entries.filter(u =>
        `${u.firstName} ${u.lastName} ${u.email}`.toLowerCase().includes(search.toLowerCase())
      )
    : entries

  const u = detail || selected // shorthand for modal

  const fmt = (d) => d ? new Date(d).toLocaleDateString('en-NG', { day:'numeric', month:'short', year:'numeric' }) : '—'

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div className='kyc-page'>
      {toast && (
        <div className={`kyc-toast kyc-toast--${toast.type}`}>
          {toast.type === 'success' ? <CheckCircle size={16} /> : <XCircle size={16} />}
          {toast.msg}
        </div>
      )}

      <div className='kyc-header'>
        <div>
          <h1><ShieldCheck size={22} /> KYC Review Queue</h1>
          <p>Review and verify submitted identity documents</p>
        </div>
        <button className='kyc-btn kyc-btn--outline' onClick={fetchQueue}>
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Status tabs */}
      <div className='kyc-status-tabs'>
        {STATUS_TABS.map(s => (
          <button
            key={s}
            className={`kyc-tab${statusFilter === s ? ' active' : ''}`}
            onClick={() => { setStatusFilter(s); setPage(1) }}
          >
            {s.replace('_', ' ')}
          </button>
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
            <option value='user'>Tenant / User</option>
          </select>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className='kyc-loading'><div className='kyc-spinner' /> Loading queue…</div>
      ) : filtered.length === 0 ? (
        <div className='kyc-empty'>
          <ShieldCheck size={48} />
          <p>No {statusFilter.replace('_', ' ')} KYC submissions</p>
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
                <th>KYC Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(user => (
                <tr key={user._id}>
                  <td>
                    <div className='kyc-user-cell'>
                      <div className='kyc-avatar'>
                        {user.avatar
                          ? <img src={user.avatar} alt='' />
                          : (user.firstName?.[0] || '?').toUpperCase()}
                      </div>
                      <div>
                        <div className='kyc-name'>{user.firstName} {user.lastName}</div>
                        <div className='kyc-email'>{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`kyc-badge kyc-badge--role-${user.role?.replace('-', '_')}`}>
                      {ROLE_LABEL[user.role] || user.role}
                    </span>
                  </td>
                  <td>
                    <div className='kyc-doc-cell'>
                      <span className='kyc-doc-type'>
                        {DOC_TYPE_LABEL[user.kyc?.documentType] || user.kyc?.documentType || '—'}
                      </span>
                    </div>
                  </td>
                  <td className='kyc-date'>{fmt(user.kyc?.submittedAt)}</td>
                  <td>
                    <span className={`kyc-badge kyc-badge--status-${user.kyc?.status}`}>
                      {user.kyc?.status?.replace('_', ' ') || '—'}
                    </span>
                  </td>
                  <td>
                    <div className='kyc-actions'>
                      {statusFilter === 'pending' && (
                        <button
                          className='kyc-action-btn kyc-action-btn--start'
                          onClick={() => startReview(user._id)}
                          title='Mark under review'
                        >
                          <Clock size={13} /> Start
                        </button>
                      )}
                      <button
                        className='kyc-action-btn kyc-action-btn--review'
                        onClick={() => openReview(user)}
                      >
                        <Eye size={13} /> Review
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
          <button className='kyc-btn kyc-btn--outline' disabled={page === 1} onClick={() => setPage(p => p - 1)}>
            Previous
          </button>
          <span>Page {page} of {Math.ceil(total / 20)}</span>
          <button className='kyc-btn kyc-btn--outline' disabled={page >= Math.ceil(total / 20)} onClick={() => setPage(p => p + 1)}>
            Next
          </button>
        </div>
      )}

      {/* ── Review Modal ─────────────────────────────────────────────────────── */}
      {selected && (
        <div className='kyc-overlay' onClick={() => { setSelected(null); setDetail(null) }}>
          <div className='kyc-modal' onClick={e => e.stopPropagation()}>
            <div className='kyc-modal__header'>
              <h2>KYC Review — {selected.firstName} {selected.lastName}</h2>
              <button className='kyc-modal__close' onClick={() => { setSelected(null); setDetail(null) }}>✕</button>
            </div>

            {detailLoading ? (
              <div className='kyc-modal__loading'><div className='kyc-spinner' /> Loading details…</div>
            ) : (
              <div className='kyc-modal__body'>

                {/* Personal Info */}
                <section className='kyc-section'>
                  <h3 className='kyc-section-title'><User size={15} /> Personal Information</h3>
                  <div className='kyc-detail-grid'>
                    <div className='kyc-detail-row'><span>Full Name</span><strong>{u?.firstName} {u?.lastName}</strong></div>
                    <div className='kyc-detail-row'><span>Email</span><strong>{u?.email}</strong></div>
                    {u?.phone && <div className='kyc-detail-row'><span>Phone</span><strong>{u.phone}</strong></div>}
                    <div className='kyc-detail-row'><span>Role</span>
                      <strong><span className={`kyc-badge kyc-badge--role-${u?.role?.replace('-','_')}`}>{ROLE_LABEL[u?.role] || u?.role}</span></strong>
                    </div>
                    {u?.kyc?.dateOfBirth && (
                      <div className='kyc-detail-row'><span>Date of Birth</span><strong>{fmt(u.kyc.dateOfBirth)}</strong></div>
                    )}
                    {u?.kyc?.gender && (
                      <div className='kyc-detail-row'><span>Gender</span><strong style={{textTransform:'capitalize'}}>{u.kyc.gender.replace('_',' ')}</strong></div>
                    )}
                    {u?.kyc?.maritalStatus && (
                      <div className='kyc-detail-row'><span>Marital Status</span><strong style={{textTransform:'capitalize'}}>{u.kyc.maritalStatus}</strong></div>
                    )}
                  </div>
                </section>

                {/* Identity Documents */}
                <section className='kyc-section'>
                  <h3 className='kyc-section-title'><FileText size={15} /> Identity Documents</h3>
                  <div className='kyc-detail-grid'>
                    <div className='kyc-detail-row'><span>Document Type</span>
                      <strong>{DOC_TYPE_LABEL[u?.kyc?.documentType] || u?.kyc?.documentType || '—'}</strong>
                    </div>
                    {u?.kyc?.documentNumber && (
                      <div className='kyc-detail-row'><span>Document No.</span><strong>{u.kyc.documentNumber}</strong></div>
                    )}
                  </div>
                  <div className='kyc-docs-row'>
                    <div className='kyc-doc-item'>
                      <p className='kyc-doc-label'>Front</p>
                      <ImgOrLink url={u?.kyc?.documentFrontUrl || u?.kyc?.documentUrl} alt='Doc Front' />
                    </div>
                    {u?.kyc?.documentBackUrl && (
                      <div className='kyc-doc-item'>
                        <p className='kyc-doc-label'>Back</p>
                        <ImgOrLink url={u.kyc.documentBackUrl} alt='Doc Back' />
                      </div>
                    )}
                    {u?.kyc?.selfieUrl && (
                      <div className='kyc-doc-item'>
                        <p className='kyc-doc-label'><CameraIcon size={13} /> Selfie</p>
                        <ImgOrLink url={u.kyc.selfieUrl} alt='Selfie' />
                      </div>
                    )}
                  </div>
                </section>

                {/* Next of Kin */}
                {u?.kyc?.nextOfKin?.fullName && (
                  <section className='kyc-section'>
                    <button className='kyc-section-toggle' onClick={() => setExpandNok(v => !v)}>
                      <Users size={15} /> Next of Kin
                      {expandNok ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                    {expandNok && (
                      <div className='kyc-detail-grid'>
                        <div className='kyc-detail-row'><span>Full Name</span><strong>{u.kyc.nextOfKin.fullName}</strong></div>
                        <div className='kyc-detail-row'><span>Relationship</span><strong>{u.kyc.nextOfKin.relationship}</strong></div>
                        <div className='kyc-detail-row'><span>Phone</span><strong>{u.kyc.nextOfKin.phone}</strong></div>
                        {u.kyc.nextOfKin.email && <div className='kyc-detail-row'><span>Email</span><strong>{u.kyc.nextOfKin.email}</strong></div>}
                        {u.kyc.nextOfKin.address && <div className='kyc-detail-row'><span>Address</span><strong>{u.kyc.nextOfKin.address}</strong></div>}
                      </div>
                    )}
                  </section>
                )}

                {/* Previous rejection reason */}
                {u?.kyc?.rejectionReason && (
                  <div className='kyc-prev-rejection'>
                    <XCircle size={14} /> Previous rejection: {u.kyc.rejectionReason}
                  </div>
                )}

                {/* Decision section — only for pending/under_review */}
                {['pending','under_review'].includes(u?.kyc?.status) && (
                  <>
                    <section className='kyc-section'>
                      <h3 className='kyc-section-title'>Decision</h3>

                      <div className='kyc-field'>
                        <label>KYC Level</label>
                        <select value={kycLevel} onChange={e => setKycLevel(e.target.value)}>
                          <option value='full'>Full</option>
                          <option value='basic'>Basic</option>
                        </select>
                      </div>

                      <div className='kyc-field'>
                        <label>Rejection Reason <span>(required if rejecting)</span></label>
                        <textarea
                          placeholder='e.g. Document image is blurry, please resubmit…'
                          value={rejectionReason}
                          onChange={e => setRejectionReason(e.target.value)}
                          rows={3}
                        />
                      </div>

                      <div className='kyc-field'>
                        <label>Internal Note <span>(not shown to user)</span></label>
                        <textarea
                          placeholder='Optional internal notes…'
                          value={verificationNote}
                          onChange={e => setVerificationNote(e.target.value)}
                          rows={2}
                        />
                      </div>
                    </section>

                    <div className='kyc-decision-btns'>
                      <button
                        className='kyc-btn kyc-btn--approve'
                        disabled={acting}
                        onClick={() => handleDecision(true)}
                      >
                        <CheckCircle size={15} />
                        {acting ? 'Processing…' : 'Approve KYC'}
                      </button>
                      <button
                        className='kyc-btn kyc-btn--reject'
                        disabled={acting}
                        onClick={() => handleDecision(false)}
                      >
                        <XCircle size={15} />
                        Reject
                      </button>
                    </div>
                  </>
                )}

                {/* Read-only for already decided */}
                {u?.kyc?.status === 'approved' && (
                  <div className='kyc-already-decided kyc-already-decided--approved'>
                    <CheckCircle size={16} /> KYC Approved on {fmt(u.kyc.reviewedAt)}
                    {u.kyc.verificationNote && <p>{u.kyc.verificationNote}</p>}
                  </div>
                )}
                {u?.kyc?.status === 'rejected' && (
                  <div className='kyc-already-decided kyc-already-decided--rejected'>
                    <XCircle size={16} /> KYC Rejected on {fmt(u.kyc.reviewedAt)}
                    {u.kyc.rejectionReason && <p>Reason: {u.kyc.rejectionReason}</p>}
                  </div>
                )}

              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
