import React, { useState } from 'react'
// import usePropertyManagement from './usePropertyManagement/usePropertyManagement'
import './PropertyManagementDashboard.scss'
import usePropertyManagement from '../../../hooks/UsePropertyManagement'

/**
 * Main dashboard component for property and application management
 */
const ADMIN_ROLES = [
  'SUPER_ADMIN',
  'SUB_ADMIN',
  'property-admin',
  'sub-property-admin'
]

const PropertyManagementDashboard = ({ backend, authToken, userRole }) => {
  const isAdmin = ADMIN_ROLES.includes(userRole)

  const {
    // State
    properties,
    applications,
    loading,
    error,
    notice,
    showModal,
    modalType,
    modalData,
    selectedProperty,
    activeView,

    // Filters
    searchQuery,
    setSearchQuery,
    categoryFilter,
    setCategoryFilter,
    statusFilter,
    setStatusFilter,
    propertyStatusFilter,
    setPropertyStatusFilter,

    // Reject modal state
    rejectModal,
    setRejectModal,
    rejectReason,
    setRejectReason,

    // Filtered data
    filteredProperties,
    filteredApplications,
    categories,
    stats,

    // Actions
    fetchProperties,
    fetchApplications,
    handleDeleteProperty,
    handleApprove,
    openRejectModal,
    handleRejectConfirm,
    viewPropertyDetails,
    viewPropertyApplications,
    updateApplicationStatus,
    deleteApplication,
    closeModal,
    setActiveView,
    showNotice
  } = usePropertyManagement(backend, authToken)

  const [sortBy, setSortBy] = useState('recent')

  /**
   * Sort properties based on selected criteria
   */
  const getSortedProperties = () => {
    const props = [...filteredProperties]

    switch (sortBy) {
      case 'price_high':
        return props.sort(
          (a, b) => (Number(b.price) || 0) - (Number(a.price) || 0)
        )
      case 'price_low':
        return props.sort(
          (a, b) => (Number(a.price) || 0) - (Number(b.price) || 0)
        )
      case 'recent':
      default:
        return props.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        )
    }
  }

  /**
   * Format currency
   */
  const formatCurrency = value => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(value)
  }

  /**
   * Get status badge color
   */
  const getStatusColor = status => {
    const colors = {
      pending: '#ffc107',
      approved: '#28a745',
      rejected: '#dc3545',
      active: '#17a2b8',
      inactive: '#6c757d'
    }
    return colors[status] || '#6c757d'
  }

  return (
    <div className='dashboard-container'>
      {/* Error Banner */}
      {error && (
        <div className='alert alert-danger' role='alert'>
          <strong>Error:</strong> {error}
          <button
            className='btn-close'
            onClick={() => {}}
            aria-label='Close'
          ></button>
        </div>
      )}

      {/* Notification */}
      {notice && (
        <div
          className={`alert alert-${
            notice.type === 'error' ? 'danger' : 'success'
          }`}
        >
          {notice.msg}
        </div>
      )}

      {/* Pending review banner — admin only */}
      {isAdmin && stats.pendingReview > 0 && (
        <div
          className='alert alert-warning d-flex align-items-center justify-content-between'
          style={{ cursor: 'pointer' }}
          onClick={() => {
            setActiveView('properties')
            setPropertyStatusFilter('pending_review')
          }}
        >
          <span>
            <strong>{stats.pendingReview}</strong> propert
            {stats.pendingReview === 1 ? 'y' : 'ies'} pending review
          </span>
          <span className='badge bg-warning text-dark'>Review Now →</span>
        </div>
      )}

      {/* Header */}
      <div className='dashboard-header'>
        <h1>Property Management</h1>
        <div className='view-toggle'>
          <button
            className={`btn ${
              activeView === 'properties'
                ? 'btn-primary'
                : 'btn-outline-primary'
            }`}
            onClick={() => setActiveView('properties')}
          >
            Properties ({properties.length})
          </button>
          <button
            className={`btn ${
              activeView === 'applications'
                ? 'btn-primary'
                : 'btn-outline-primary'
            }`}
            onClick={() => setActiveView('applications')}
          >
            Applications ({applications.length})
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className='stats-grid'>
        <div className='stat-card'>
          <div className='stat-value'>{stats.totalProperties}</div>
          <div className='stat-label'>Total Properties</div>
        </div>
        <div className='stat-card'>
          <div className='stat-value'>{stats.activeListings}</div>
          <div className='stat-label'>Published</div>
        </div>
        {isAdmin && (
          <div
            className='stat-card'
            style={{
              cursor: 'pointer',
              borderColor: stats.pendingReview > 0 ? '#ffc107' : undefined
            }}
            onClick={() =>
              setPropertyStatusFilter(
                propertyStatusFilter === 'pending_review'
                  ? 'all'
                  : 'pending_review'
              )
            }
          >
            <div className='stat-value'>{stats.pendingReview}</div>
            <div className='stat-label'>Pending Review</div>
          </div>
        )}
        <div className='stat-card'>
          <div className='stat-value'>{stats.totalApplications}</div>
          <div className='stat-label'>Total Applications</div>
        </div>
        <div className='stat-card'>
          <div className='stat-value'>{stats.pendingApplications}</div>
          <div className='stat-label'>Pending Applications</div>
        </div>
        <div className='stat-card highlight'>
          <div className='stat-value'>{formatCurrency(stats.totalRevenue)}</div>
          <div className='stat-label'>Total Revenue</div>
        </div>
        <div className='stat-card'>
          <div className='stat-value'>{stats.conversionRate}%</div>
          <div className='stat-label'>Conversion Rate</div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className='filters-section'>
        <div className='search-box'>
          <input
            type='text'
            placeholder='Search properties or applicants...'
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className='form-control'
          />
        </div>

        {activeView === 'properties' && (
          <>
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className='form-select'
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            {isAdmin && (
              <select
                value={propertyStatusFilter}
                onChange={e => setPropertyStatusFilter(e.target.value)}
                className='form-select'
              >
                <option value='all'>All Statuses</option>
                <option value='pending_review'>Pending Review</option>
                <option value='published'>Published</option>
                <option value='draft'>Draft</option>
                <option value='archived'>Archived</option>
                <option value='suspended'>Suspended</option>
              </select>
            )}

            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className='form-select'
            >
              <option value='recent'>Recent</option>
              <option value='price_low'>Price: Low to High</option>
              <option value='price_high'>Price: High to Low</option>
            </select>
          </>
        )}

        {activeView === 'applications' && (
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className='form-select'
          >
            <option value='all'>All Statuses</option>
            <option value='pending'>Pending</option>
            <option value='approved'>Approved</option>
            <option value='rejected'>Rejected</option>
          </select>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className='loading-container'>
          <div className='spinner-border text-primary' role='status'>
            <span className='visually-hidden'>Loading...</span>
          </div>
          <p>Loading data...</p>
        </div>
      )}

      {/* Properties View */}
      {activeView === 'properties' && !loading && (
        <div className='properties-section'>
          <h2>Properties ({filteredProperties.length})</h2>

          {filteredProperties.length === 0 ? (
            <div className='empty-state'>
              <p>No properties found</p>
            </div>
          ) : (
            <div className='properties-grid'>
              {getSortedProperties().map(property => (
                <div key={property._id} className='property-card'>
                  <div className='property-image'>
                    {property.images && property.images[0] ? (
                      <img src={property.images[0]} alt={property.title} />
                    ) : (
                      <div className='no-image'>No Image</div>
                    )}
                  </div>

                  <div className='property-details'>
                    <h3>{property.title}</h3>
                    <p className='location'>
                      📍{' '}
                      {typeof property.location === 'string'
                        ? property.location
                        : [
                            property.location?.address,
                            property.location?.city,
                            property.location?.state
                          ]
                            .filter(Boolean)
                            .join(', ') ||
                          property.city ||
                          property.address ||
                          ''}
                    </p>
                    <p className='category'>
                      <span className='badge'>{property.category}</span>{' '}
                      <span
                        className='badge'
                        style={{
                          backgroundColor:
                            property.status === 'published'
                              ? '#28a745'
                              : property.status === 'pending_review'
                              ? '#ffc107'
                              : property.status === 'archived'
                              ? '#dc3545'
                              : property.status === 'draft'
                              ? '#6c757d'
                              : '#17a2b8',
                          color:
                            property.status === 'pending_review'
                              ? '#000'
                              : '#fff'
                        }}
                      >
                        {property.status || 'draft'}
                      </span>
                    </p>

                    <div className='property-specs'>
                      {property.units && property.units[0] && (
                        <>
                          <span>🛏️ {property.units[0].bedrooms} BR</span>
                          <span>🚿 {property.units[0].bathrooms} BA</span>
                        </>
                      )}
                    </div>

                    <div className='property-price'>
                      {formatCurrency(
                        property.price || property.rentPrice || 0
                      )}
                      {property.rentFrequency && (
                        <span className='frequency'>
                          {' '}
                          / {property.rentFrequency}
                        </span>
                      )}
                    </div>

                    <div className='property-actions'>
                      <a
                        className='btn btn-sm btn-info'
                        href={`/property/${property._id}`}
                        target='_blank'
                        rel='noreferrer'
                      >
                        Preview
                      </a>
                      <button
                        className='btn btn-sm btn-success'
                        onClick={() => viewPropertyApplications(property._id)}
                      >
                        Applications
                      </button>
                      {isAdmin && property.status === 'pending_review' && (
                        <>
                          <button
                            className='btn btn-sm btn-primary'
                            onClick={() => handleApprove(property._id)}
                          >
                            ✓ Approve
                          </button>
                          <button
                            className='btn btn-sm btn-warning'
                            onClick={() => openRejectModal(property._id)}
                          >
                            ✗ Reject
                          </button>
                        </>
                      )}
                      <button
                        className='btn btn-sm btn-danger'
                        onClick={() => handleDeleteProperty(property._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Applications View */}
      {activeView === 'applications' && !loading && (
        <div className='applications-section'>
          <h2>All Applications ({filteredApplications.length})</h2>

          {filteredApplications.length === 0 ? (
            <div className='empty-state'>
              <p>No applications found</p>
            </div>
          ) : (
            <div className='applications-table'>
              <table className='table table-hover'>
                <thead>
                  <tr>
                    <th>Applicant Name</th>
                    <th>Property</th>
                    <th>Email</th>
                    <th>Status</th>
                    <th>Applied Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredApplications.map(app => (
                    <tr key={app._id}>
                      <td>{app.userName || 'N/A'}</td>
                      <td>{app.propertyTitle || 'N/A'}</td>
                      <td>{app.userEmail || 'N/A'}</td>
                      <td>
                        <span
                          className='badge'
                          style={{
                            backgroundColor: getStatusColor(app.status)
                          }}
                        >
                          {app.status}
                        </span>
                      </td>
                      <td>{new Date(app.appliedAt).toLocaleDateString()}</td>
                      <td>
                        <div className='action-buttons'>
                          {app.status === 'pending' && (
                            <>
                              <button
                                className='btn btn-sm btn-success'
                                onClick={() =>
                                  updateApplicationStatus(app._id, 'approved')
                                }
                              >
                                Approve
                              </button>
                              <button
                                className='btn btn-sm btn-warning'
                                onClick={() =>
                                  updateApplicationStatus(app._id, 'rejected')
                                }
                              >
                                Reject
                              </button>
                            </>
                          )}
                          <button
                            className='btn btn-sm btn-danger'
                            onClick={() => deleteApplication(app._id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Reject Reason Modal */}
      {rejectModal && (
        <div className='modal-overlay' onClick={() => setRejectModal(false)}>
          <div
            className='modal-content'
            style={{ maxWidth: 420 }}
            onClick={e => e.stopPropagation()}
          >
            <div className='modal-header'>
              <h5>Reject Property</h5>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                {rejectTargetId && (
                  <a
                    href={`/property/${rejectTargetId}`}
                    target='_blank'
                    rel='noreferrer'
                    className='btn btn-sm btn-outline-secondary'
                    style={{ fontSize: 12 }}
                  >
                    Open Preview ↗
                  </a>
                )}
                <button
                  className='btn-close'
                  onClick={() => setRejectModal(false)}
                ></button>
              </div>
            </div>
            <div className='modal-body'>
              <label
                htmlFor='reject-reason'
                style={{ fontWeight: 600, marginBottom: 6, display: 'block' }}
              >
                Reason for rejection (optional)
              </label>
              <textarea
                id='reject-reason'
                className='form-control'
                rows={3}
                placeholder='e.g. Missing documents, incorrect pricing...'
                value={rejectReason}
                onChange={e => setRejectReason(e.target.value)}
              />
            </div>
            <div className='modal-footer'>
              <button
                className='btn btn-secondary'
                onClick={() => setRejectModal(false)}
              >
                Cancel
              </button>
              <button className='btn btn-danger' onClick={handleRejectConfirm}>
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className='modal-overlay' onClick={closeModal}>
          <div className='modal-content' onClick={e => e.stopPropagation()}>
            <div className='modal-header'>
              <h5>
                {modalType === 'view' ? 'Property Details' : 'Applications'}
              </h5>
              <button className='btn-close' onClick={closeModal}></button>
            </div>

            <div className='modal-body'>
              {modalType === 'view' && selectedProperty && (
                <div className='property-detail-view'>
                  <img
                    src={selectedProperty.images?.[0]}
                    alt={selectedProperty.title}
                  />
                  <h3>{selectedProperty.title}</h3>
                  <p>{selectedProperty.description}</p>
                  <p>
                    <strong>Location:</strong>{' '}
                    {typeof selectedProperty.location === 'string'
                      ? selectedProperty.location
                      : [
                          selectedProperty.location?.address,
                          selectedProperty.location?.city,
                          selectedProperty.location?.state
                        ]
                          .filter(Boolean)
                          .join(', ') ||
                        selectedProperty.city ||
                        selectedProperty.address ||
                        ''}
                  </p>
                  <p>
                    <strong>Category:</strong> {selectedProperty.category}
                  </p>
                  <p>
                    <strong>Price:</strong>{' '}
                    {formatCurrency(
                      selectedProperty.price || selectedProperty.rentPrice
                    )}
                  </p>
                </div>
              )}

              {modalType === 'applications' && modalData && (
                <div className='applications-list'>
                  {modalData.length === 0 ? (
                    <p>No applications for this property</p>
                  ) : (
                    modalData.map(app => (
                      <div key={app._id} className='application-item'>
                        <div className='application-info'>
                          <h6>{app.userName}</h6>
                          <p>{app.userEmail}</p>
                          <span
                            className='badge'
                            style={{
                              backgroundColor: getStatusColor(app.status)
                            }}
                          >
                            {app.status}
                          </span>
                        </div>
                        {app.status === 'pending' && (
                          <div className='application-actions'>
                            <button
                              className='btn btn-sm btn-success'
                              onClick={() =>
                                updateApplicationStatus(app._id, 'approved')
                              }
                            >
                              Approve
                            </button>
                            <button
                              className='btn btn-sm btn-warning'
                              onClick={() =>
                                updateApplicationStatus(app._id, 'rejected')
                              }
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            <div className='modal-footer'>
              <button className='btn btn-secondary' onClick={closeModal}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PropertyManagementDashboard
