import React, { useState } from 'react'
import {
  Search, Home, FileText, TrendingUp, Clock, CheckCircle,
  XCircle, Eye, Trash2, ChevronDown, MapPin, Bed, Bath,
  SquareArrowOutUpRight, AlertTriangle, X, RefreshCw,
  Building2, DollarSign, BarChart3, ArrowUpRight, Shield
} from 'lucide-react'
import './PropertyManagementDashboard.scss'
import { encodeId } from '@/libs/propId'
import usePropertyManagement from '../../../hooks/UsePropertyManagement'

const ADMIN_ROLES = ['SUPER_ADMIN', 'SUB_ADMIN', 'property-admin', 'sub-property-admin']

const STATUS_META = {
  published:      { label: 'Published',      cls: 'pm-s-published' },
  pending_review: { label: 'Pending Review', cls: 'pm-s-pending'   },
  draft:          { label: 'Draft',           cls: 'pm-s-draft'     },
  archived:       { label: 'Archived',        cls: 'pm-s-archived'  },
  suspended:      { label: 'Suspended',       cls: 'pm-s-suspended' },
}

const APP_STATUS_META = {
  pending:  { label: 'Pending',  cls: 'pm-a-pending'  },
  approved: { label: 'Approved', cls: 'pm-a-approved' },
  rejected: { label: 'Rejected', cls: 'pm-a-rejected' },
}

const fmtCurrency = v =>
  new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(v || 0)

const fmtDate = d => d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'

const locStr = loc =>
  typeof loc === 'string'
    ? loc
    : [loc?.address, loc?.city, loc?.state].filter(Boolean).join(', ')

export default function PropertyManagementDashboard ({ backend, authToken, userRole }) {
  const isAdmin = ADMIN_ROLES.includes(userRole)

  const {
    properties, applications, loading, error, notice,
    showModal, modalType, modalData, selectedProperty, activeView,
    searchQuery, setSearchQuery,
    categoryFilter, setCategoryFilter,
    statusFilter, setStatusFilter,
    propertyStatusFilter, setPropertyStatusFilter,
    rejectModal, setRejectModal,
    rejectReason, setRejectReason, rejectTargetId,
    filteredProperties, filteredApplications, categories, stats,
    fetchProperties, fetchApplications,
    handleDeleteProperty, handleApprove, openRejectModal, handleRejectConfirm,
    viewPropertyDetails, viewPropertyApplications,
    updateApplicationStatus, deleteApplication,
    closeModal, setActiveView, showNotice
  } = usePropertyManagement(backend, authToken)

  const [sortBy, setSortBy] = useState('recent')
  const [refreshing, setRefreshing] = useState(false)
  const [verifyModal, setVerifyModal] = useState(null) // { propId, currentVerified }
  const [verifyDate, setVerifyDate] = useState('')
  const [verifyNotes, setVerifyNotes] = useState('')
  const [verifying, setVerifying] = useState(false)

  const openVerifyModal = (propId, currentVerified) => {
    setVerifyModal({ propId, currentVerified })
    setVerifyDate(new Date().toISOString().slice(0, 10))
    setVerifyNotes('')
  }

  const handleVerifyConfirm = async () => {
    if (!verifyModal) return
    setVerifying(true)
    try {
      const API = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4001'
      const res = await fetch(`${API}/api/properties/${verifyModal.propId}/compliance`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken}` },
        body: JSON.stringify({
          verified: !verifyModal.currentVerified,
          inspectedAt: verifyDate || undefined,
          inspectorNotes: verifyNotes || undefined,
          score: !verifyModal.currentVerified ? 90 : 0
        })
      })
      const data = await res.json()
      if (data.success) {
        showNotice?.(`Property ${!verifyModal.currentVerified ? 'verified' : 'unverified'} successfully`)
        fetchProperties?.()
      } else {
        showNotice?.(data.msg || 'Failed to update', 'error')
      }
    } catch {
      showNotice?.('Request failed', 'error')
    } finally {
      setVerifying(false)
      setVerifyModal(null)
    }
  }

  const doRefresh = async () => {
    setRefreshing(true)
    await Promise.all([fetchProperties?.(), fetchApplications?.()])
    setRefreshing(false)
  }

  const sorted = () => {
    const arr = [...filteredProperties]
    if (sortBy === 'price_high') return arr.sort((a, b) => (b.price || 0) - (a.price || 0))
    if (sortBy === 'price_low')  return arr.sort((a, b) => (a.price || 0) - (b.price || 0))
    return arr.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }

  return (
    <div className='pm-wrap'>

      {/* Alerts */}
      {error && (
        <div className='pm-alert pm-alert-error'>
          <AlertTriangle size={15} /> {error}
        </div>
      )}
      {notice && (
        <div className={`pm-alert ${notice.type === 'error' ? 'pm-alert-error' : 'pm-alert-success'}`}>
          {notice.type === 'error' ? <XCircle size={15} /> : <CheckCircle size={15} />}
          {notice.msg}
        </div>
      )}
      {isAdmin && stats.pendingReview > 0 && (
        <div className='pm-alert pm-alert-warn pm-alert-click'
          onClick={() => { setActiveView('properties'); setPropertyStatusFilter('pending_review') }}>
          <Clock size={15} />
          <span><strong>{stats.pendingReview}</strong> propert{stats.pendingReview === 1 ? 'y' : 'ies'} pending review</span>
          <span className='pm-alert-cta'>Review Now →</span>
        </div>
      )}

      {/* Header */}
      <div className='pm-head'>
        <div>
          <h2>Property Management</h2>
          <p>Oversee listings, applications and performance</p>
        </div>
        <div className='pm-head-right'>
          <button className={`pm-btn-icon ${refreshing ? 'spin' : ''}`} onClick={doRefresh} title='Refresh'>
            <RefreshCw size={16} />
          </button>
          <div className='pm-tab-group'>
            <button className={activeView === 'properties'   ? 'active' : ''} onClick={() => setActiveView('properties')}>
              <Home size={14} /> Properties <span className='pm-tab-count'>{properties.length}</span>
            </button>
            <button className={activeView === 'applications' ? 'active' : ''} onClick={() => setActiveView('applications')}>
              <FileText size={14} /> Applications <span className='pm-tab-count'>{applications.length}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className='pm-stats'>
        {[
          { icon: <Building2 size={18} />, cls: 'total',    val: stats.totalProperties,    lbl: 'Total Properties' },
          { icon: <CheckCircle size={18} />, cls: 'active', val: stats.activeListings,      lbl: 'Published' },
          isAdmin && { icon: <Clock size={18} />,  cls: 'pending', val: stats.pendingReview,       lbl: 'Pending Review',
            onClick: () => setPropertyStatusFilter(propertyStatusFilter === 'pending_review' ? 'all' : 'pending_review') },
          { icon: <FileText size={18} />,   cls: 'apps',   val: stats.totalApplications,   lbl: 'Applications' },
          { icon: <DollarSign size={18} />, cls: 'rev',    val: fmtCurrency(stats.totalRevenue), lbl: 'Total Revenue', wide: true },
          { icon: <BarChart3 size={18} />,  cls: 'conv',   val: `${stats.conversionRate}%`,lbl: 'Conversion' },
        ].filter(Boolean).map((s, i) => (
          <div key={i} className={`pm-stat ${s.wide ? 'pm-stat-wide' : ''}`}
            style={s.onClick ? { cursor: 'pointer' } : undefined}
            onClick={s.onClick}>
            <div className={`pm-stat-icon ${s.cls}`}>{s.icon}</div>
            <div className='pm-stat-body'>
              <div className='pm-stat-val'>{s.val ?? 0}</div>
              <div className='pm-stat-lbl'>{s.lbl}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className='pm-toolbar'>
        <div className='pm-search'>
          <Search size={14} />
          <input
            placeholder='Search properties or applicants…'
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
        <div className='pm-filters'>
          {activeView === 'properties' && (
            <>
              <select className='pm-select' value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              {isAdmin && (
                <select className='pm-select' value={propertyStatusFilter} onChange={e => setPropertyStatusFilter(e.target.value)}>
                  <option value='all'>All Statuses</option>
                  <option value='pending_review'>Pending Review</option>
                  <option value='published'>Published</option>
                  <option value='draft'>Draft</option>
                  <option value='archived'>Archived</option>
                  <option value='suspended'>Suspended</option>
                </select>
              )}
              <select className='pm-select' value={sortBy} onChange={e => setSortBy(e.target.value)}>
                <option value='recent'>Recent</option>
                <option value='price_low'>Price: Low → High</option>
                <option value='price_high'>Price: High → Low</option>
              </select>
            </>
          )}
          {activeView === 'applications' && (
            <select className='pm-select' value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value='all'>All Statuses</option>
              <option value='pending'>Pending</option>
              <option value='approved'>Approved</option>
              <option value='rejected'>Rejected</option>
            </select>
          )}
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className='pm-state'>
          <div className='pm-spinner' />
          <p>Loading data…</p>
        </div>
      )}

      {/* ── Properties view ─────────────────────────────────────────────── */}
      {activeView === 'properties' && !loading && (
        <div>
          <div className='pm-section-head'>
            <span>Properties <span className='pm-section-count'>({filteredProperties.length})</span></span>
          </div>

          {filteredProperties.length === 0 ? (
            <div className='pm-state'>
              <Home size={40} />
              <h3>No properties found</h3>
              <p>Try adjusting your filters</p>
            </div>
          ) : (
            <div className='pm-prop-grid'>
              {sorted().map(p => {
                const sm = STATUS_META[p.status] || { label: p.status || 'draft', cls: 'pm-s-draft' }
                const img = p.media?.[0]?.url || p.images?.[0]
                return (
                  <div key={p._id} className='pm-prop-card'>
                    <div className='pm-prop-img'>
                      {img
                        ? <img src={img} alt={p.title} />
                        : <div className='pm-prop-no-img'><Home size={32} /></div>}

                      <div className='pm-pin-hover-veil' />
                      <span className={`pm-status-badge ${sm.cls}`}>{sm.label}</span>

                      {p.compliance?.verified && (
                        <span className='pm-verified-badge'>
                          <Shield size={9} /> Verified
                        </span>
                      )}

                      <div className='pm-pin-price'>
                        {fmtCurrency(p.price || p.rentPrice)}
                        {p.rentFrequency && <span className='pm-freq'>/{p.rentFrequency}</span>}
                      </div>

                      <div className='pm-pin-actions'>
                        <a className='pm-pin-view' href={`/property/${encodeId(p.uid || p._id)}`}
                          target='_blank' rel='noreferrer' title='Preview'>
                          <SquareArrowOutUpRight size={13} />
                        </a>
                        <button className='pm-pin-apps' onClick={() => viewPropertyApplications(p._id)} title='Applications'>
                          <FileText size={13} />
                        </button>
                        {isAdmin && p.status === 'pending_review' && (
                          <>
                            <button className='pm-pin-approve' onClick={() => handleApprove(p._id)} title='Approve'>
                              <CheckCircle size={13} />
                            </button>
                            <button className='pm-pin-reject' onClick={() => openRejectModal(p._id)} title='Reject'>
                              <XCircle size={13} />
                            </button>
                          </>
                        )}
                        {isAdmin && (
                          <button
                            className={`pm-pin-verify${p.compliance?.verified ? ' pm-pin-verify--on' : ''}`}
                            onClick={() => openVerifyModal(p._id, !!p.compliance?.verified)}
                            title={p.compliance?.verified ? 'Verified · Click to revoke' : 'Mark as PropNekt Verified'}
                          >
                            <Shield size={13} />
                          </button>
                        )}
                        <button className='pm-pin-del' onClick={() => handleDeleteProperty(p._id)} title='Delete'>
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>

                    <div className='pm-prop-body'>
                      <h3 className='pm-prop-title'>{p.title}</h3>
                      <p className='pm-prop-loc'>
                        <MapPin size={11} />
                        {locStr(p.location) || p.city || p.address || 'No location'}
                      </p>
                      <div className='pm-prop-meta'>
                        {(p.beds || p.bedrooms) &&
                          <span><Bed size={11} /> {p.beds || p.bedrooms} BD</span>}
                        {(p.baths || p.bathrooms) &&
                          <span><Bath size={11} /> {p.baths || p.bathrooms} BA</span>}
                        {p.area && <span>{p.area} m²</span>}
                        <span className='pm-cat-pill'>{p.category}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Applications view ────────────────────────────────────────────── */}
      {activeView === 'applications' && !loading && (
        <div>
          <div className='pm-section-head'>
            <span>Applications <span className='pm-section-count'>({filteredApplications.length})</span></span>
          </div>

          {filteredApplications.length === 0 ? (
            <div className='pm-state'>
              <FileText size={40} />
              <h3>No applications found</h3>
              <p>Try adjusting your filters</p>
            </div>
          ) : (
            <div className='pm-table-wrap'>
              <table className='pm-table'>
                <thead>
                  <tr>
                    <th>Applicant</th>
                    <th>Property</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Applied</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredApplications.map(app => {
                    const am = APP_STATUS_META[app.status] || { label: app.status, cls: 'pm-a-pending' }
                    return (
                      <tr key={app._id}>
                        <td>
                          <div className='pm-app-user'>
                            <div className='pm-app-av'>
                              {(app.userName || 'U')[0].toUpperCase()}
                            </div>
                            <div>
                              <div className='pm-app-name'>{app.userName || 'N/A'}</div>
                              <div className='pm-app-email'>{app.userEmail || '—'}</div>
                            </div>
                          </div>
                        </td>
                        <td className='pm-td-prop'>{app.propertyTitle || 'N/A'}</td>
                        <td>
                          <span className='pm-type-pill'>{app.type || app.applicationType || '—'}</span>
                        </td>
                        <td><span className={`pm-app-badge ${am.cls}`}>{am.label}</span></td>
                        <td className='pm-td-date'>{fmtDate(app.appliedAt || app.createdAt)}</td>
                        <td>
                          <div className='pm-app-actions'>
                            {app.status === 'pending' && (
                              <>
                                <button className='pm-act-btn approve'
                                  onClick={() => updateApplicationStatus(app._id, 'approved')}>
                                  <CheckCircle size={12} /> Approve
                                </button>
                                <button className='pm-act-btn reject'
                                  onClick={() => updateApplicationStatus(app._id, 'rejected')}>
                                  <XCircle size={12} /> Reject
                                </button>
                              </>
                            )}
                            <button className='pm-act-btn del' onClick={() => deleteApplication(app._id)}>
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── Reject modal ─────────────────────────────────────────────────── */}
      {rejectModal && (
        <div className='pm-overlay' onClick={() => setRejectModal(false)}>
          <div className='pm-modal' onClick={e => e.stopPropagation()}>
            <div className='pm-modal-head'>
              <h3>Reject Property</h3>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                {rejectTargetId && (
                  <a href={`/property/${encodeId(rejectTargetId)}`} target='_blank' rel='noreferrer'
                    className='pm-act-btn view' style={{ textDecoration: 'none', fontSize: 12 }}>
                    <SquareArrowOutUpRight size={12} /> Preview
                  </a>
                )}
                <button className='pm-modal-close' onClick={() => setRejectModal(false)}><X size={15} /></button>
              </div>
            </div>
            <div className='pm-modal-body'>
              <label className='pm-label'>Reason for rejection (optional)</label>
              <textarea
                className='pm-textarea'
                rows={3}
                placeholder='e.g. Missing documents, incorrect pricing…'
                value={rejectReason}
                onChange={e => setRejectReason(e.target.value)}
              />
            </div>
            <div className='pm-modal-foot'>
              <button className='pm-foot-cancel' onClick={() => setRejectModal(false)}>Cancel</button>
              <button className='pm-foot-danger' onClick={handleRejectConfirm}>Confirm Reject</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Verify modal ─────────────────────────────────────────────────── */}
      {verifyModal && (
        <div className='pm-overlay' onClick={() => setVerifyModal(null)}>
          <div className='pm-modal' onClick={e => e.stopPropagation()}>
            <div className='pm-modal-head'>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Shield size={16} color='#C4E53C' />
                {verifyModal.currentVerified ? 'Revoke Verification' : 'Mark as PropNekt Verified'}
              </h3>
              <button className='pm-modal-close' onClick={() => setVerifyModal(null)}><X size={15} /></button>
            </div>
            <div className='pm-modal-body'>
              {!verifyModal.currentVerified && (
                <>
                  <label className='pm-label'>Inspection date</label>
                  <input
                    type='date'
                    className='pm-input'
                    value={verifyDate}
                    onChange={e => setVerifyDate(e.target.value)}
                    style={{ marginBottom: 14 }}
                  />
                  <label className='pm-label'>Inspector notes (optional)</label>
                  <textarea
                    className='pm-textarea'
                    rows={3}
                    placeholder='e.g. Ownership confirmed via C of O, property matches listing photos…'
                    value={verifyNotes}
                    onChange={e => setVerifyNotes(e.target.value)}
                  />
                </>
              )}
              {verifyModal.currentVerified && (
                <p style={{ fontSize: 13, color: '#7d8590', margin: 0 }}>
                  This will remove the PropNekt Verified badge from this listing. The badge will no longer appear to tenants.
                </p>
              )}
            </div>
            <div className='pm-modal-foot'>
              <button className='pm-foot-cancel' onClick={() => setVerifyModal(null)}>Cancel</button>
              <button
                className={verifyModal.currentVerified ? 'pm-foot-danger' : 'pm-foot-verify'}
                onClick={handleVerifyConfirm}
                disabled={verifying}
              >
                {verifying ? '…' : verifyModal.currentVerified ? 'Revoke Verification' : 'Confirm Verification'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Detail / Applications modal ──────────────────────────────────── */}
      {showModal && (
        <div className='pm-overlay' onClick={closeModal}>
          <div className='pm-modal pm-modal-lg' onClick={e => e.stopPropagation()}>
            <div className='pm-modal-head'>
              <h3>{modalType === 'view' ? 'Property Details' : 'Property Applications'}</h3>
              <button className='pm-modal-close' onClick={closeModal}><X size={15} /></button>
            </div>
            <div className='pm-modal-body'>
              {modalType === 'view' && selectedProperty && (
                <div className='pm-detail-view'>
                  {(selectedProperty.media?.[0]?.url || selectedProperty.images?.[0]) && (
                    <img src={selectedProperty.media?.[0]?.url || selectedProperty.images?.[0]}
                      alt={selectedProperty.title} />
                  )}
                  <h3>{selectedProperty.title}</h3>
                  <p>{selectedProperty.description}</p>
                  <div className='pm-detail-grid'>
                    <div><label>Location</label><p>{locStr(selectedProperty.location) || selectedProperty.city || '—'}</p></div>
                    <div><label>Category</label><p>{selectedProperty.category}</p></div>
                    <div><label>Price</label><p>{fmtCurrency(selectedProperty.price || selectedProperty.rentPrice)}</p></div>
                    <div><label>Status</label><p>{selectedProperty.status}</p></div>
                  </div>
                </div>
              )}
              {modalType === 'applications' && modalData && (
                <div className='pm-modal-apps'>
                  {modalData.length === 0
                    ? <p style={{ color: 'rgba(230,237,243,0.45)', textAlign: 'center', padding: '2rem' }}>No applications for this property</p>
                    : modalData.map(app => {
                        const am = APP_STATUS_META[app.status] || { label: app.status, cls: 'pm-a-pending' }
                        return (
                          <div key={app._id} className='pm-modal-app-row'>
                            <div>
                              <div className='pm-app-name'>{app.userName}</div>
                              <div className='pm-app-email'>{app.userEmail}</div>
                              <span className={`pm-app-badge ${am.cls}`} style={{ marginTop: 6, display: 'inline-block' }}>{am.label}</span>
                            </div>
                            {app.status === 'pending' && (
                              <div className='pm-app-actions'>
                                <button className='pm-act-btn approve' onClick={() => updateApplicationStatus(app._id, 'approved')}>
                                  <CheckCircle size={12} /> Approve
                                </button>
                                <button className='pm-act-btn reject' onClick={() => updateApplicationStatus(app._id, 'rejected')}>
                                  <XCircle size={12} /> Reject
                                </button>
                              </div>
                            )}
                          </div>
                        )
                      })}
                </div>
              )}
            </div>
            <div className='pm-modal-foot'>
              <button className='pm-foot-cancel' onClick={closeModal}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
