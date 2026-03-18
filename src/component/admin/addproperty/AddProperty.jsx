'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import axios from 'axios'
import {
  Search, Filter, Eye, Trash2, FileText, Users,
  CheckCircle, XCircle, Clock, MapPin, Home, DollarSign,
  Calendar, Download, Plus, X, Check, AlertCircle,
  Building2, TrendingUp, ArrowUpRight, MoreVertical,
  ThumbsUp, ThumbsDown
} from 'lucide-react'
import './addproperty.scss'

const STATUS_OPTIONS = ['pending', 'approved', 'rejected', 'viewing']
const PROPERTY_CATEGORIES = ['All', 'Apartment', 'House', 'Shortlet', 'Hotel', 'Land', 'Commercial']
const LISTING_STATUSES = ['all', 'pending_review', 'published', 'draft', 'archived', 'suspended']

const STATUS_LABELS = {
  pending_review: 'Pending Review',
  published: 'Published',
  draft: 'Draft',
  archived: 'Archived',
  suspended: 'Suspended'
}

export default function PropertyManagement () {
  const [activeView, setActiveView] = useState('properties')
  const [properties, setProperties] = useState([])
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedProperty, setSelectedProperty] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState('')
  const [modalData, setModalData] = useState(null)
  const [notice, setNotice] = useState(null)
  const [rejectModal, setRejectModal] = useState(null) // { propertyId, title }
  const [rejectReason, setRejectReason] = useState('')

  const backend = process.env.NEXT_PUBLIC_BACKEND_URL || ''
  const authToken = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null

  const showNotice = useCallback((msg, type = 'success') => {
    setNotice({ msg, type })
    setTimeout(() => setNotice(null), 3500)
  }, [])

  // ── Fetch ALL properties (admin sees everything via optionalAuth + properties.view_all)
  const fetchProperties = useCallback(async () => {
    if (!authToken) return
    setLoading(true)
    try {
      const res = await axios.get(`${backend}/api/properties/all?limit=200`, {
        headers: { Authorization: `Bearer ${authToken}` }
      })
      if (res.data?.success) {
        setProperties(res.data.properties || [])
      }
    } catch (err) {
      console.error('Error fetching properties:', err)
      showNotice('Failed to load properties', 'error')
    } finally {
      setLoading(false)
    }
  }, [backend, authToken, showNotice])

  const fetchApplications = useCallback(async () => {
    if (!authToken || properties.length === 0) return
    setLoading(true)
    try {
      const applicationsData = []
      for (const property of properties) {
        const res = await axios.get(
          `${backend}/api/properties/property-applications/property/${property._id}`,
          { headers: { Authorization: `Bearer ${authToken}` } }
        )
        if (res.data?.success && res.data.applications) {
          applicationsData.push(...res.data.applications.map(app => ({
            ...app, propertyTitle: property.title, propertyId: property._id
          })))
        }
      }
      setApplications(applicationsData)
    } catch (err) {
      console.error('Error fetching applications:', err)
      showNotice('Failed to load applications', 'error')
    } finally {
      setLoading(false)
    }
  }, [backend, authToken, properties, showNotice])

  useEffect(() => { fetchProperties() }, [fetchProperties])

  useEffect(() => {
    if (activeView === 'applications' && properties.length > 0) fetchApplications()
  }, [activeView, properties.length, fetchApplications])

  // ── Approve property
  const handleApprove = useCallback(async (id) => {
    try {
      const res = await axios.patch(`${backend}/api/properties/${id}/approve`, {},
        { headers: { Authorization: `Bearer ${authToken}` } })
      if (res.data?.success) {
        showNotice('Property approved and published')
        setProperties(prev => prev.map(p => p._id === id ? { ...p, status: 'published' } : p))
      }
    } catch (err) {
      showNotice(err.response?.data?.msg || 'Failed to approve', 'error')
    }
  }, [backend, authToken, showNotice])

  // ── Reject property
  const handleRejectConfirm = useCallback(async () => {
    if (!rejectModal) return
    try {
      const res = await axios.patch(
        `${backend}/api/properties/${rejectModal.propertyId}/reject`,
        { reason: rejectReason },
        { headers: { Authorization: `Bearer ${authToken}` } }
      )
      if (res.data?.success) {
        showNotice('Property rejected')
        setProperties(prev => prev.map(p => p._id === rejectModal.propertyId ? { ...p, status: 'archived' } : p))
        setRejectModal(null)
        setRejectReason('')
      }
    } catch (err) {
      showNotice(err.response?.data?.msg || 'Failed to reject', 'error')
    }
  }, [backend, authToken, rejectModal, rejectReason, showNotice])

  // ── Delete property
  const handleDelete = useCallback(async id => {
    if (!window.confirm('Archive this property?')) return
    try {
      const res = await axios.delete(`${backend}/api/properties/${id}`,
        { headers: { Authorization: `Bearer ${authToken}` } })
      if (res.data?.success) {
        showNotice('Property archived')
        setProperties(prev => prev.filter(p => p._id !== id))
      }
    } catch (err) {
      showNotice('Failed to delete property', 'error')
    }
  }, [backend, authToken, showNotice])

  const viewApplications = useCallback(async propertyId => {
    try {
      const res = await axios.get(
        `${backend}/api/properties/property-applications/property/${propertyId}`,
        { headers: { Authorization: `Bearer ${authToken}` } }
      )
      if (res.data?.success) {
        setModalData(res.data.applications || [])
        setModalType('applications')
        setShowModal(true)
      }
    } catch { showNotice('Failed to load applications', 'error') }
  }, [backend, authToken, showNotice])

  const updateApplicationStatus = useCallback(async (appId, status) => {
    try {
      const res = await axios.patch(
        `${backend}/api/properties/property-applications/${appId}/status`,
        { status }, { headers: { Authorization: `Bearer ${authToken}` } }
      )
      if (res.data?.success) {
        showNotice(`Application ${status}`)
        fetchApplications()
        if (showModal && modalType === 'applications') {
          const pid = applications.find(a => a._id === appId)?.propertyId
          if (pid) viewApplications(pid)
        }
      }
    } catch { showNotice('Failed to update', 'error') }
  }, [backend, authToken, applications, showModal, modalType, showNotice, fetchApplications, viewApplications])

  const deleteApplication = useCallback(async appId => {
    if (!window.confirm('Delete this application?')) return
    try {
      const res = await axios.delete(
        `${backend}/api/properties/property-applications/${appId}`,
        { headers: { Authorization: `Bearer ${authToken}` } }
      )
      if (res.data?.success) { showNotice('Application deleted'); fetchApplications() }
    } catch { showNotice('Failed to delete', 'error') }
  }, [backend, authToken, showNotice, fetchApplications])

  // ── Filtered data
  const filteredProperties = useMemo(() => {
    return properties.filter(p => {
      const loc = typeof p.location === 'string' ? p.location : p.city || p.address || ''
      const matchSearch = p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        loc.toLowerCase().includes(searchQuery.toLowerCase())
      const matchCat = categoryFilter === 'All' || p.category === categoryFilter
      const matchStatus = statusFilter === 'all' || p.status === statusFilter
      return matchSearch && matchCat && matchStatus
    })
  }, [properties, searchQuery, categoryFilter, statusFilter])

  const filteredApplications = useMemo(() => {
    return applications.filter(a => {
      const matchSearch = a.userName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.propertyTitle?.toLowerCase().includes(searchQuery.toLowerCase())
      const matchStatus = statusFilter === 'all' || a.status === statusFilter
      return matchSearch && matchStatus
    })
  }, [applications, searchQuery, statusFilter])

  const stats = useMemo(() => ({
    total: properties.length,
    published: properties.filter(p => p.status === 'published').length,
    pendingReview: properties.filter(p => p.status === 'pending_review').length,
    draft: properties.filter(p => p.status === 'draft').length,
    applications: applications.length,
    pendingApps: applications.filter(a => a.status === 'pending').length
  }), [properties, applications])

  const formatMoney = v => v ? '₦' + Number(v).toLocaleString() : '—'

  return (
    <div className='property-management'>
      {/* Toast */}
      {notice && (
        <div className={`toast toast-${notice.type}`}>
          {notice.type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}
          {notice.msg}
        </div>
      )}

      {/* Reject reason modal */}
      {rejectModal && (
        <div className='modal-overlay' onClick={() => setRejectModal(null)}>
          <div className='modal-content' style={{ maxWidth: 440 }} onClick={e => e.stopPropagation()}>
            <div className='modal-header'>
              <h3>Reject Listing</h3>
              <button onClick={() => setRejectModal(null)}><X size={20} /></button>
            </div>
            <div className='modal-body'>
              <p style={{ marginBottom: 12 }}>Rejecting: <strong>{rejectModal.title}</strong></p>
              <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 13 }}>
                Reason (sent to owner)
              </label>
              <textarea
                value={rejectReason}
                onChange={e => setRejectReason(e.target.value)}
                placeholder='e.g. Missing compliance documents, incorrect pricing…'
                style={{ width: '100%', minHeight: 90, padding: '10px 12px', borderRadius: 8, border: '1.5px solid #e2e8f0', resize: 'vertical' }}
              />
            </div>
            <div className='modal-footer' style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', padding: '16px 20px' }}>
              <button className='btn-secondary' onClick={() => setRejectModal(null)}>Cancel</button>
              <button className='btn-danger' onClick={handleRejectConfirm}>Confirm Reject</button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className='page-header'>
        <div className='header-content'>
          <div className='header-left'>
            <h1>Property Management</h1>
            <p>Review, approve and manage all listings</p>
          </div>
          <div className='header-actions'>
            <button className='btn-secondary' onClick={fetchProperties}>
              <Download size={18} /> Refresh
            </button>
          </div>
        </div>
      </header>

      {/* Stats */}
      <div className='stats-overview'>
        <div className='stat-card card-blue'>
          <div className='stat-icon'><Building2 size={24} /></div>
          <div className='stat-content'>
            <h3>{stats.total}</h3>
            <p>Total Listings</p>
            <div className='stat-change positive'><ArrowUpRight size={14} />{stats.published} published</div>
          </div>
        </div>
        <div className='stat-card card-orange'>
          <div className='stat-icon'><Clock size={24} /></div>
          <div className='stat-content'>
            <h3 style={{ color: stats.pendingReview > 0 ? '#f59e0b' : undefined }}>{stats.pendingReview}</h3>
            <p>Pending Review</p>
            <div className='stat-change'>Awaiting approval</div>
          </div>
        </div>
        <div className='stat-card card-green'>
          <div className='stat-icon'><FileText size={24} /></div>
          <div className='stat-content'>
            <h3>{stats.applications}</h3>
            <p>Applications</p>
            <div className='stat-change'><Clock size={14} />{stats.pendingApps} pending</div>
          </div>
        </div>
        <div className='stat-card card-purple'>
          <div className='stat-icon'><CheckCircle size={24} /></div>
          <div className='stat-content'>
            <h3>{stats.draft}</h3>
            <p>Drafts</p>
            <div className='stat-change'>Unpublished</div>
          </div>
        </div>
      </div>

      {/* View Tabs */}
      <div className='view-tabs'>
        <button className={`tab ${activeView === 'properties' ? 'active' : ''}`} onClick={() => setActiveView('properties')}>
          <Home size={18} /> Properties ({properties.length})
          {stats.pendingReview > 0 && <span className='tab-badge'>{stats.pendingReview}</span>}
        </button>
        <button className={`tab ${activeView === 'applications' ? 'active' : ''}`} onClick={() => setActiveView('applications')}>
          <FileText size={18} /> Applications ({applications.length})
        </button>
      </div>

      {/* Toolbar */}
      <div className='content-toolbar'>
        <div className='search-box'>
          <Search size={20} />
          <input
            type='text'
            placeholder={activeView === 'properties' ? 'Search properties…' : 'Search applications…'}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
        <div className='filter-group'>
          <Filter size={18} />
          {activeView === 'properties' ? (
            <>
              <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
                {PROPERTY_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                {LISTING_STATUSES.map(s => (
                  <option key={s} value={s}>{s === 'all' ? 'All Statuses' : STATUS_LABELS[s] || s}</option>
                ))}
              </select>
            </>
          ) : (
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value='all'>All Statuses</option>
              {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
            </select>
          )}
        </div>
      </div>

      {/* Content */}
      <div className='content-area'>
        {loading ? (
          <div className='loading-state'><div className='spinner' /><p>Loading…</p></div>
        ) : activeView === 'properties' ? (
          <PropertiesView
            properties={filteredProperties}
            onView={p => { setSelectedProperty(p); setModalType('view'); setShowModal(true) }}
            onViewApplications={viewApplications}
            onDelete={handleDelete}
            onApprove={handleApprove}
            onReject={p => { setRejectModal({ propertyId: p._id, title: p.title }); setRejectReason('') }}
            formatMoney={formatMoney}
          />
        ) : (
          <ApplicationsView
            applications={filteredApplications}
            onStatusUpdate={updateApplicationStatus}
            onDelete={deleteApplication}
            formatMoney={formatMoney}
          />
        )}
      </div>

      {/* Detail Modal */}
      {showModal && (
        <Modal
          type={modalType}
          data={selectedProperty || modalData}
          onClose={() => { setShowModal(false); setSelectedProperty(null); setModalData(null) }}
          onStatusUpdate={updateApplicationStatus}
          onApprove={handleApprove}
          onReject={p => { setRejectModal({ propertyId: p._id, title: p.title }); setShowModal(false) }}
          formatMoney={formatMoney}
        />
      )}
    </div>
  )
}

// ── Properties grid ──────────────────────────────────────────────────────────

function PropertiesView ({ properties, onView, onViewApplications, onDelete, onApprove, onReject, formatMoney }) {
  if (properties.length === 0) {
    return (
      <div className='empty-state'>
        <Building2 size={64} />
        <h3>No properties found</h3>
        <p>Try changing your filters</p>
      </div>
    )
  }
  return (
    <div className='properties-grid'>
      {properties.map(p => (
        <PropertyCard key={p._id} property={p} onView={() => onView(p)} onViewApplications={() => onViewApplications(p._id)}
          onDelete={() => onDelete(p._id)} onApprove={() => onApprove(p._id)} onReject={() => onReject(p)} formatMoney={formatMoney} />
      ))}
    </div>
  )
}

function PropertyCard ({ property, onView, onViewApplications, onDelete, onApprove, onReject, formatMoney }) {
  const [showActions, setShowActions] = useState(false)
  const firstImage = property.images?.[0] || property.media?.[0]?.url || property.media?.[0]
  const isPending = property.status === 'pending_review'

  return (
    <div className={`property-card${isPending ? ' property-card--pending' : ''}`}>
      <div className='property-image'>
        {firstImage ? <img src={firstImage} alt={property.title} /> : <div className='placeholder-image'><Building2 size={48} /></div>}
        <div className='property-badge'>
          <span className={`badge ${property.purpose === 'For Sale' ? 'badge-sale' : 'badge-rent'}`}>{property.purpose}</span>
        </div>
        <span className={`listing-status-badge status-${property.status || 'draft'}`}>
          {STATUS_LABELS[property.status] || property.status || 'Draft'}
        </span>
      </div>

      <div className='property-content'>
        <div className='property-header'>
          <h3>{property.title}</h3>
          <button className='btn-more' onClick={() => setShowActions(!showActions)}><MoreVertical size={18} /></button>
          {showActions && (
            <div className='actions-menu'>
              <button onClick={onView}><Eye size={16} /> View Details</button>
              <button onClick={onViewApplications}><FileText size={16} /> Applications</button>
              <button onClick={onDelete} className='danger'><Trash2 size={16} /> Archive</button>
            </div>
          )}
        </div>

        <div className='property-location'>
          <MapPin size={14} />
          {typeof property.location === 'string' ? property.location : property.city || property.address || '—'}
        </div>

        <div className='property-details'>
          {property.beds && <span>{property.beds} Beds</span>}
          {property.baths && <span>{property.baths} Baths</span>}
          {property.area && <span>{property.area}</span>}
          <span className='category-chip'>{property.category}</span>
        </div>

        <div className='property-footer'>
          <div className='property-price'>
            <span className='price'>{formatMoney(property.price || property.rentPrice)}</span>
            {property.rentFrequency && <span className='frequency'>/{property.rentFrequency}</span>}
          </div>
        </div>

        {/* Approve / Reject buttons for pending_review */}
        {isPending && (
          <div className='review-actions'>
            <button className='btn-approve' onClick={e => { e.stopPropagation(); onApprove() }}>
              <ThumbsUp size={14} /> Approve
            </button>
            <button className='btn-reject' onClick={e => { e.stopPropagation(); onReject() }}>
              <ThumbsDown size={14} /> Reject
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Applications table ───────────────────────────────────────────────────────

function ApplicationsView ({ applications, onStatusUpdate, onDelete }) {
  if (applications.length === 0) {
    return (
      <div className='empty-state'>
        <FileText size={64} /><h3>No applications found</h3>
        <p>Applications appear here when users apply for properties</p>
      </div>
    )
  }
  return (
    <div className='applications-table'>
      <table>
        <thead>
          <tr>
            <th>Applicant</th><th>Property</th><th>Applied</th><th>Status</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {applications.map(app => (
            <tr key={app._id}>
              <td>
                <div className='applicant-info'>
                  <div className='applicant-avatar'>{app.userName?.[0] || 'U'}</div>
                  <div>
                    <div className='applicant-name'>{app.userName || 'Unknown'}</div>
                    <div className='applicant-email'>{app.userEmail}</div>
                  </div>
                </div>
              </td>
              <td>
                <div className='property-info'>
                  <div className='property-name'>{app.propertyTitle}</div>
                  <div className='property-id'>#{app.propertyId?.slice(-8)}</div>
                </div>
              </td>
              <td>
                <div className='date-info'>
                  <Calendar size={14} />{new Date(app.createdAt).toLocaleDateString()}
                </div>
              </td>
              <td>
                <select className={`status-select status-${app.status}`} value={app.status}
                  onChange={e => onStatusUpdate(app._id, e.target.value)}>
                  {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                </select>
              </td>
              <td>
                <div className='table-actions'>
                  <button className='btn-icon btn-danger' onClick={() => onDelete(app._id)} title='Delete'>
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ── Detail Modal ─────────────────────────────────────────────────────────────

function Modal ({ type, data, onClose, onStatusUpdate, onApprove, onReject, formatMoney }) {
  if (type === 'view' && data) {
    const images = data.images || data.media?.map(m => m.url || m) || []
    const isPending = data.status === 'pending_review'
    return (
      <div className='modal-overlay' onClick={onClose}>
        <div className='modal-content modal-large' onClick={e => e.stopPropagation()}>
          <div className='modal-header'>
            <h3>Property Details</h3>
            <button onClick={onClose}><X size={24} /></button>
          </div>
          <div className='modal-body'>
            {images.length > 0 && (
              <div className='property-gallery'>
                <img src={images[0]} alt={data.title} className='main-image' />
                {images.length > 1 && (
                  <div className='thumbnail-grid'>
                    {images.slice(1, 5).map((img, i) => <img key={i} src={img} alt='' />)}
                  </div>
                )}
              </div>
            )}
            <div className='details-grid'>
              <div className='detail-section'>
                <h4>Basic Info</h4>
                <div className='detail-items'>
                  <DetailItem label='Title' value={data.title} />
                  <DetailItem label='Category' value={data.category} />
                  <DetailItem label='Purpose' value={data.purpose} />
                  <DetailItem label='Status' value={STATUS_LABELS[data.status] || data.status} />
                  <DetailItem label='Location' value={typeof data.location === 'string' ? data.location : data.city || data.address || ''} />
                  <DetailItem label='Price' value={formatMoney(data.price || data.rentPrice)} />
                  {data.rentFrequency && <DetailItem label='Frequency' value={data.rentFrequency} />}
                </div>
              </div>
              {(data.beds || data.baths || data.area) && (
                <div className='detail-section'>
                  <h4>Property Details</h4>
                  <div className='detail-items'>
                    {data.beds && <DetailItem label='Bedrooms' value={data.beds} />}
                    {data.baths && <DetailItem label='Bathrooms' value={data.baths} />}
                    {data.area && <DetailItem label='Area' value={data.area} />}
                  </div>
                </div>
              )}
              {data.features?.length > 0 && (
                <div className='detail-section full-width'>
                  <h4>Features</h4>
                  <div className='features-list'>
                    {data.features.map((f, i) => <span key={i} className='feature-tag'><Check size={14} /> {f}</span>)}
                  </div>
                </div>
              )}
              {data.description && (
                <div className='detail-section full-width'>
                  <h4>Description</h4>
                  <p className='description-text'>{data.description}</p>
                </div>
              )}
            </div>
          </div>
          {isPending && (
            <div className='modal-footer' style={{ display: 'flex', gap: 10, padding: '16px 20px', borderTop: '1px solid #e2e8f0' }}>
              <button className='btn-approve' style={{ flex: 1 }} onClick={() => { onApprove(data._id); onClose() }}>
                <ThumbsUp size={16} /> Approve & Publish
              </button>
              <button className='btn-reject' style={{ flex: 1 }} onClick={() => { onReject(data); onClose() }}>
                <ThumbsDown size={16} /> Reject
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  if (type === 'applications' && data) {
    return (
      <div className='modal-overlay' onClick={onClose}>
        <div className='modal-content modal-large' onClick={e => e.stopPropagation()}>
          <div className='modal-header'>
            <h3>Applications ({data.length})</h3>
            <button onClick={onClose}><X size={24} /></button>
          </div>
          <div className='modal-body'>
            {data.length === 0 ? (
              <div className='empty-applications'><FileText size={48} /><p>No applications yet</p></div>
            ) : (
              <div className='applications-list'>
                {data.map(app => (
                  <div key={app._id} className='application-item'>
                    <div className='application-header'>
                      <div className='applicant-info'>
                        <div className='applicant-avatar large'>{app.userName?.[0] || 'U'}</div>
                        <div><h4>{app.userName || 'Unknown'}</h4><p>{app.userEmail}</p></div>
                      </div>
                      <span className={`status-badge status-${app.status}`}>{app.status}</span>
                    </div>
                    <div className='application-details'>
                      <div className='detail-item'><Calendar size={16} /><span>Applied: {new Date(app.createdAt).toLocaleDateString()}</span></div>
                      {app.message && <div className='application-message'><strong>Message:</strong><p>{app.message}</p></div>}
                    </div>
                    {app.status === 'pending' && (
                      <div className='application-actions'>
                        <button className='btn-approve' onClick={() => onStatusUpdate(app._id, 'approved')}><CheckCircle size={16} /> Approve</button>
                        <button className='btn-reject' onClick={() => onStatusUpdate(app._id, 'rejected')}><XCircle size={16} /> Reject</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }
  return null
}

function DetailItem ({ label, value }) {
  return (
    <div className='detail-item'>
      <span className='label'>{label}:</span>
      <span className='value'>{value}</span>
    </div>
  )
}
