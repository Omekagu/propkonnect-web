'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import axios from 'axios'
import {
  Search,
  Filter,
  Eye,
  Trash2,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  Home,
  DollarSign,
  Calendar,
  Download,
  Plus,
  X,
  Check,
  AlertCircle,
  Building2,
  TrendingUp,
  ArrowUpRight,
  MoreVertical
} from 'lucide-react'
import './MyProperties.scss'

const STATUS_OPTIONS = ['pending', 'approved', 'rejected', 'viewing']
const PROPERTY_CATEGORIES = [
  'All',
  'Apartment',
  'House',
  'Shortlet',
  'Hotel',
  'Land',
  'Commercial'
]

export default function MyProperties () {
  const [activeView, setActiveView] = useState('properties') // 'properties' | 'applications'
  const [properties, setProperties] = useState([])
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedProperty, setSelectedProperty] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState('') // 'view' | 'applications' | 'history'
  const [modalData, setModalData] = useState(null)
  const [notice, setNotice] = useState(null)

  const backend = process.env.NEXT_PUBLIC_BACKEND_URL || ''
  const authToken =
    typeof window !== 'undefined' ? localStorage.getItem('authToken') : null

  // Fetch properties
  const fetchProperties = useCallback(async () => {
    if (!authToken) return
    setLoading(true)
    try {
      const res = await axios.get(`${backend}/api/properties/property/mine`, {
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
  }, [backend, authToken])

  // Fetch all applications
  const fetchApplications = useCallback(async () => {
    if (!authToken) return
    setLoading(true)
    try {
      // Fetch applications for all user's properties
      const applicationsData = []
      for (const property of properties) {
        const res = await axios.get(
          `${backend}/api/properties/property-applications/property/${property._id}`,
          { headers: { Authorization: `Bearer ${authToken}` } }
        )
        if (res.data?.success && res.data.applications) {
          applicationsData.push(
            ...res.data.applications.map(app => ({
              ...app,
              propertyTitle: property.title,
              propertyId: property._id
            }))
          )
        }
      }
      setApplications(applicationsData)
    } catch (err) {
      console.error('Error fetching applications:', err)
      showNotice('Failed to load applications', 'error')
    } finally {
      setLoading(false)
    }
  }, [backend, authToken, properties])

  useEffect(() => {
    fetchProperties()
  }, [fetchProperties])

  useEffect(() => {
    if (activeView === 'applications' && properties.length > 0) {
      fetchApplications()
    }
  }, [activeView, properties.length, fetchApplications])

  const showNotice = (msg, type = 'success') => {
    setNotice({ msg, type })
    setTimeout(() => setNotice(null), 3500)
  }

  // Delete property
  const handleDelete = async id => {
    if (!window.confirm('Are you sure you want to delete this property?'))
      return

    try {
      const res = await axios.delete(`${backend}/api/properties/${id}`, {
        headers: { Authorization: `Bearer ${authToken}` }
      })
      if (res.data?.success) {
        showNotice('Property deleted successfully')
        fetchProperties()
      }
    } catch (err) {
      console.error('Error deleting property:', err)
      showNotice('Failed to delete property', 'error')
    }
  }

  // View property applications
  const viewApplications = async propertyId => {
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
    } catch (err) {
      console.error('Error fetching applications:', err)
      showNotice('Failed to load applications', 'error')
    }
  }

  // Update application status
  const updateApplicationStatus = async (appId, status) => {
    try {
      const res = await axios.patch(
        `${backend}/api/properties/property-applications/${appId}/status`,
        { status },
        { headers: { Authorization: `Bearer ${authToken}` } }
      )
      if (res.data?.success) {
        showNotice(`Application ${status} successfully`)
        fetchApplications()
        if (showModal && modalType === 'applications') {
          // Refresh modal data
          const propertyId = applications.find(a => a._id === appId)?.propertyId
          if (propertyId) viewApplications(propertyId)
        }
      }
    } catch (err) {
      console.error('Error updating application:', err)
      showNotice('Failed to update application', 'error')
    }
  }

  // Delete application
  const deleteApplication = async appId => {
    if (!window.confirm('Are you sure you want to delete this application?'))
      return

    try {
      const res = await axios.delete(
        `${backend}/api/properties/property-applications/${appId}`,
        { headers: { Authorization: `Bearer ${authToken}` } }
      )
      if (res.data?.success) {
        showNotice('Application deleted successfully')
        fetchApplications()
      }
    } catch (err) {
      console.error('Error deleting application:', err)
      showNotice('Failed to delete application', 'error')
    }
  }

  // View property details
  const viewProperty = property => {
    setSelectedProperty(property)
    setModalType('view')
    setShowModal(true)
  }

  // Filtered properties
  const filteredProperties = useMemo(() => {
    return properties.filter(p => {
      const matchesSearch =
        p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.location?.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory =
        categoryFilter === 'All' || p.category === categoryFilter
      return matchesSearch && matchesCategory
    })
  }, [properties, searchQuery, categoryFilter])

  // Filtered applications
  const filteredApplications = useMemo(() => {
    return applications.filter(a => {
      const matchesSearch =
        a.userName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.propertyTitle?.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = statusFilter === 'all' || a.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [applications, searchQuery, statusFilter])

  // Stats
  const stats = useMemo(() => {
    return {
      totalProperties: properties.length,
      activeListings: properties.filter(p => p.status === 'active' || !p.status)
        .length,
      totalApplications: applications.length,
      pendingApplications: applications.filter(a => a.status === 'pending')
        .length,
      approvedApplications: applications.filter(a => a.status === 'approved')
        .length,
      totalRevenue: properties.reduce(
        (sum, p) => sum + (Number(p.price) || 0),
        0
      )
    }
  }, [properties, applications])

  const formatMoney = value => {
    if (!value && value !== 0) return '₦0'
    return '₦' + Number(value).toLocaleString()
  }

  return (
    <div className='property-management'>
      {/* Toast Notification */}
      {notice && (
        <div className={`toast toast-${notice.type}`}>
          {notice.type === 'success' ? (
            <Check size={18} />
          ) : (
            <AlertCircle size={18} />
          )}
          {notice.msg}
        </div>
      )}

      {/* Header */}
      <header className='page-header'>
        <div className='header-content'>
          <div className='header-left'>
            <h1>Property Management</h1>
            <p>Manage your properties and applications</p>
          </div>
          <div className='header-actions'>
            <button className='btn-secondary'>
              <Download size={18} />
              Export Data
            </button>
            <button className='btn-primary'>
              <Plus size={18} />
              Add Property
            </button>
          </div>
        </div>
      </header>

      {/* Stats Overview */}
      <div className='stats-overview'>
        <div className='stat-card card-blue'>
          <div className='stat-icon'>
            <Building2 size={24} />
          </div>
          <div className='stat-content'>
            <h3>{stats.totalProperties}</h3>
            <p>Total Properties</p>
            <div className='stat-change positive'>
              <ArrowUpRight size={14} />
              {stats.activeListings} active
            </div>
          </div>
        </div>

        <div className='stat-card card-green'>
          <div className='stat-icon'>
            <FileText size={24} />
          </div>
          <div className='stat-content'>
            <h3>{stats.totalApplications}</h3>
            <p>Applications</p>
            <div className='stat-change'>
              <Clock size={14} />
              {stats.pendingApplications} pending
            </div>
          </div>
        </div>

        <div className='stat-card card-purple'>
          <div className='stat-icon'>
            <CheckCircle size={24} />
          </div>
          <div className='stat-content'>
            <h3>{stats.approvedApplications}</h3>
            <p>Approved</p>
            <div className='stat-change positive'>
              <TrendingUp size={14} />
              This month
            </div>
          </div>
        </div>

        <div className='stat-card card-orange'>
          <div className='stat-icon'>
            <DollarSign size={24} />
          </div>
          <div className='stat-content'>
            <h3>{formatMoney(stats.totalRevenue)}</h3>
            <p>Total Value</p>
            <div className='stat-change'>Property portfolio</div>
          </div>
        </div>
      </div>

      {/* View Tabs */}
      <div className='view-tabs'>
        <button
          className={`tab ${activeView === 'properties' ? 'active' : ''}`}
          onClick={() => setActiveView('properties')}
        >
          <Home size={18} />
          Properties ({properties.length})
        </button>
        <button
          className={`tab ${activeView === 'applications' ? 'active' : ''}`}
          onClick={() => setActiveView('applications')}
        >
          <FileText size={18} />
          Applications ({applications.length})
        </button>
      </div>

      {/* Toolbar */}
      <div className='content-toolbar'>
        <div className='search-box'>
          <Search size={20} />
          <input
            type='text'
            placeholder={
              activeView === 'properties'
                ? 'Search properties...'
                : 'Search applications...'
            }
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        {activeView === 'properties' ? (
          <div className='filter-group'>
            <Filter size={18} />
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
            >
              {PROPERTY_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div className='filter-group'>
            <Filter size={18} />
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
            >
              <option value='all'>All Status</option>
              {STATUS_OPTIONS.map(status => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className='content-area'>
        {loading ? (
          <div className='loading-state'>
            <div className='spinner'></div>
            <p>Loading...</p>
          </div>
        ) : activeView === 'properties' ? (
          <PropertiesView
            properties={filteredProperties}
            onView={viewProperty}
            onViewApplications={viewApplications}
            onDelete={handleDelete}
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

      {/* Modal */}
      {showModal && (
        <Modal
          type={modalType}
          data={selectedProperty || modalData}
          onClose={() => {
            setShowModal(false)
            setSelectedProperty(null)
            setModalData(null)
          }}
          onStatusUpdate={updateApplicationStatus}
          formatMoney={formatMoney}
        />
      )}
    </div>
  )
}

// Properties View Component
function PropertiesView ({
  properties,
  onView,
  onViewApplications,
  onDelete,
  formatMoney
}) {
  if (properties.length === 0) {
    return (
      <div className='empty-state'>
        <Building2 size={64} />
        <h3>No properties found</h3>
        <p>Start by adding your first property listing</p>
      </div>
    )
  }

  return (
    <div className='properties-grid'>
      {properties.map(property => (
        <PropertyCard
          key={property._id}
          property={property}
          onView={() => onView(property)}
          onViewApplications={() => onViewApplications(property._id)}
          onDelete={() => onDelete(property._id)}
          formatMoney={formatMoney}
        />
      ))}
    </div>
  )
}

// Property Card Component
function PropertyCard ({
  property,
  onView,
  onViewApplications,
  onDelete,
  formatMoney
}) {
  const [showActions, setShowActions] = useState(false)
  const firstImage =
    property.images?.[0] || property.media?.[0]?.url || property.media?.[0]

  return (
    <div className='property-card'>
      <div className='property-image'>
        {firstImage ? (
          <img src={firstImage} alt={property.title} />
        ) : (
          <div className='placeholder-image'>
            <Building2 size={48} />
          </div>
        )}
        <div className='property-badge'>
          <span
            className={`badge ${
              property.purpose === 'For Sale' ? 'badge-sale' : 'badge-rent'
            }`}
          >
            {property.purpose}
          </span>
        </div>
      </div>

      <div className='property-content'>
        <div className='property-header'>
          <h3>{property.title}</h3>
          <button
            className='btn-more'
            onClick={() => setShowActions(!showActions)}
          >
            <MoreVertical size={18} />
          </button>
          {showActions && (
            <div className='actions-menu'>
              <button onClick={onView}>
                <Eye size={16} /> View Details
              </button>
              <button onClick={onViewApplications}>
                <FileText size={16} /> Applications
              </button>
              <button onClick={onDelete} className='danger'>
                <Trash2 size={16} /> Delete
              </button>
            </div>
          )}
        </div>

        <div className='property-location'>
          <MapPin size={14} />
          {property.location}
        </div>

        <div className='property-details'>
          {property.beds && <span>{property.beds} Beds</span>}
          {property.baths && <span>{property.baths} Baths</span>}
          {property.area && <span>{property.area}</span>}
        </div>

        <div className='property-footer'>
          <div className='property-price'>
            <span className='price'>
              {formatMoney(property.price || property.rentPrice)}
            </span>
            {property.rentFrequency && (
              <span className='frequency'>/{property.rentFrequency}</span>
            )}
          </div>
          <span className={`status-badge ${property.status || 'active'}`}>
            {property.status || 'Active'}
          </span>
        </div>
      </div>
    </div>
  )
}

// Applications View Component
function ApplicationsView ({
  applications,
  onStatusUpdate,
  onDelete,
  formatMoney
}) {
  if (applications.length === 0) {
    return (
      <div className='empty-state'>
        <FileText size={64} />
        <h3>No applications found</h3>
        <p>
          Applications will appear here when tenants apply for your properties
        </p>
      </div>
    )
  }

  return (
    <div className='applications-table'>
      <table>
        <thead>
          <tr>
            <th>Applicant</th>
            <th>Property</th>
            <th>Applied Date</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {applications.map(app => (
            <tr key={app._id}>
              <td>
                <div className='applicant-info'>
                  <div className='applicant-avatar'>
                    {app.userName?.[0] || 'U'}
                  </div>
                  <div>
                    <div className='applicant-name'>
                      {app.userName || 'Unknown'}
                    </div>
                    <div className='applicant-email'>{app.userEmail}</div>
                  </div>
                </div>
              </td>
              <td>
                <div className='property-info'>
                  <div className='property-name'>{app.propertyTitle}</div>
                  <div className='property-id'>
                    ID: #{app.propertyId?.slice(-8)}
                  </div>
                </div>
              </td>
              <td>
                <div className='date-info'>
                  <Calendar size={14} />
                  {new Date(app.createdAt).toLocaleDateString()}
                </div>
              </td>
              <td>
                <select
                  className={`status-select status-${app.status}`}
                  value={app.status}
                  onChange={e => onStatusUpdate(app._id, e.target.value)}
                >
                  {STATUS_OPTIONS.map(status => (
                    <option key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </option>
                  ))}
                </select>
              </td>
              <td>
                <div className='table-actions'>
                  <button className='btn-icon' title='View'>
                    <Eye size={16} />
                  </button>
                  <button
                    className='btn-icon btn-danger'
                    onClick={() => onDelete(app._id)}
                    title='Delete'
                  >
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

// Modal Component
function Modal ({ type, data, onClose, onStatusUpdate, formatMoney }) {
  if (type === 'view' && data) {
    return (
      <div className='modal-overlay' onClick={onClose}>
        <div
          className='modal-content modal-large'
          onClick={e => e.stopPropagation()}
        >
          <div className='modal-header'>
            <h3>Property Details</h3>
            <button onClick={onClose}>
              <X size={24} />
            </button>
          </div>
          <div className='modal-body'>
            <PropertyDetails property={data} formatMoney={formatMoney} />
          </div>
        </div>
      </div>
    )
  }

  if (type === 'applications' && data) {
    return (
      <div className='modal-overlay' onClick={onClose}>
        <div
          className='modal-content modal-large'
          onClick={e => e.stopPropagation()}
        >
          <div className='modal-header'>
            <h3>Applications ({data.length})</h3>
            <button onClick={onClose}>
              <X size={24} />
            </button>
          </div>
          <div className='modal-body'>
            {data.length === 0 ? (
              <div className='empty-applications'>
                <FileText size={48} />
                <p>No applications yet for this property</p>
              </div>
            ) : (
              <div className='applications-list'>
                {data.map(app => (
                  <div key={app._id} className='application-item'>
                    <div className='application-header'>
                      <div className='applicant-info'>
                        <div className='applicant-avatar large'>
                          {app.userName?.[0] || 'U'}
                        </div>
                        <div>
                          <h4>{app.userName || 'Unknown Applicant'}</h4>
                          <p>{app.userEmail}</p>
                        </div>
                      </div>
                      <span className={`status-badge status-${app.status}`}>
                        {app.status}
                      </span>
                    </div>
                    <div className='application-details'>
                      <div className='detail-item'>
                        <Calendar size={16} />
                        <span>
                          Applied:{' '}
                          {new Date(app.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      {app.message && (
                        <div className='application-message'>
                          <strong>Message:</strong>
                          <p>{app.message}</p>
                        </div>
                      )}
                    </div>
                    <div className='application-actions'>
                      {app.status === 'pending' && (
                        <>
                          <button
                            className='btn-approve'
                            onClick={() => onStatusUpdate(app._id, 'approved')}
                          >
                            <CheckCircle size={16} /> Approve
                          </button>
                          <button
                            className='btn-reject'
                            onClick={() => onStatusUpdate(app._id, 'rejected')}
                          >
                            <XCircle size={16} /> Reject
                          </button>
                        </>
                      )}
                    </div>
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

// Property Details Component
function PropertyDetails ({ property, formatMoney }) {
  const images = property.images || property.media?.map(m => m.url || m) || []

  return (
    <div className='property-details-view'>
      {images.length > 0 && (
        <div className='property-gallery'>
          <img src={images[0]} alt={property.title} className='main-image' />
          {images.length > 1 && (
            <div className='thumbnail-grid'>
              {images.slice(1, 5).map((img, i) => (
                <img key={i} src={img} alt='' />
              ))}
            </div>
          )}
        </div>
      )}

      <div className='details-grid'>
        <div className='detail-section'>
          <h4>Basic Information</h4>
          <div className='detail-items'>
            <DetailItem label='Title' value={property.title} />
            <DetailItem label='Category' value={property.category} />
            <DetailItem label='Purpose' value={property.purpose} />
            <DetailItem label='Location' value={property.location} />
            <DetailItem
              label='Price'
              value={formatMoney(property.price || property.rentPrice)}
            />
            {property.rentFrequency && (
              <DetailItem label='Frequency' value={property.rentFrequency} />
            )}
          </div>
        </div>

        {(property.beds || property.baths || property.area) && (
          <div className='detail-section'>
            <h4>Property Details</h4>
            <div className='detail-items'>
              {property.beds && (
                <DetailItem label='Bedrooms' value={property.beds} />
              )}
              {property.baths && (
                <DetailItem label='Bathrooms' value={property.baths} />
              )}
              {property.area && (
                <DetailItem label='Area' value={property.area} />
              )}
              {property.maxRooms && (
                <DetailItem label='Max Rooms' value={property.maxRooms} />
              )}
            </div>
          </div>
        )}

        {property.features && property.features.length > 0 && (
          <div className='detail-section full-width'>
            <h4>Features & Amenities</h4>
            <div className='features-list'>
              {property.features.map((feature, i) => (
                <span key={i} className='feature-tag'>
                  <Check size={14} /> {feature}
                </span>
              ))}
            </div>
          </div>
        )}

        {property.description && (
          <div className='detail-section full-width'>
            <h4>Description</h4>
            <p className='description-text'>{property.description}</p>
          </div>
        )}
      </div>
    </div>
  )
}

function DetailItem ({ label, value }) {
  return (
    <div className='detail-item'>
      <span className='label'>{label}:</span>
      <span className='value'>{value}</span>
    </div>
  )
}
