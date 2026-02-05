import React, { useState } from 'react'

import './Artisan.scss'
import { useAdminArtisans } from '@/hooks/useArtisanManagement'

/**
 * Admin Artisan Management Component
 * Allows admins to view, filter, verify, and manage all artisans
 */
const AdminArtisans = () => {
  const {
    // State
    artisans,
    loading,
    error,
    notice,
    stats,
    showModal,
    modalType,
    selectedArtisan,

    // Filters
    searchQuery,
    setSearchQuery,
    categoryFilter,
    setCategoryFilter,
    verificationFilter,
    setVerificationFilter,
    sortBy,
    setSortBy,

    // Selection
    selectedArtisans,
    toggleArtisanSelection,
    toggleSelectAll,

    // Data
    filteredAndSortedArtisans,
    categories,

    // Actions
    toggleVerification,
    deleteArtisan,
    updateArtisan,
    bulkUpdate,
    viewArtisanDetails,
    closeModal,
    showNotice
  } = useAdminArtisans()

  const [showBulkActions, setShowBulkActions] = useState(false)
  const [editFormData, setEditFormData] = useState({})

  /**
   * Handle bulk verify
   */
  const handleBulkVerify = async () => {
    const success = await bulkUpdate({ verified: true })
    if (success) {
      setShowBulkActions(false)
    }
  }

  /**
   * Handle bulk unverify
   */
  const handleBulkUnverify = async () => {
    const success = await bulkUpdate({ verified: false })
    if (success) {
      setShowBulkActions(false)
    }
  }

  /**
   * Render star rating
   */
  const renderStars = rating => {
    return (
      <div className='stars-display'>
        {[1, 2, 3, 4, 5].map(star => (
          <span
            key={star}
            className={`star ${
              star <= Math.round(rating || 0) ? 'filled' : ''
            }`}
          >
            ★
          </span>
        ))}
        <span className='rating-value'>{(rating || 0).toFixed(1)}</span>
      </div>
    )
  }

  /**
   * Handle edit submit
   */
  const handleEditSubmit = async e => {
    e.preventDefault()
    const success = await updateArtisan(selectedArtisan._id, editFormData)
    if (success) {
      setEditFormData({})
      closeModal()
    }
  }

  return (
    <div className='admin-artisans-container'>
      {/* Error Banner */}
      {error && (
        <div className='alert alert-danger'>
          <strong>Error:</strong> {error}
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

      {/* Header */}
      {/* <div className='admin-header'>
        <h1>Artisan Management</h1>
        <p>Manage all artisan accounts and verify professionals</p>
      </div> */}

      {/* Stats Cards */}
      {stats && (
        <div className='stats-grid'>
          <div className='stat-card'>
            <div className='stat-icon'>👥</div>
            <div className='stat-content'>
              <div className='stat-number'>{stats.totalArtisans}</div>
              <div className='stat-label'>Total Artisans</div>
            </div>
          </div>
          <div className='stat-card'>
            <div className='stat-icon'>✓</div>
            <div className='stat-content'>
              <div className='stat-number'>{stats.verifiedArtisans}</div>
              <div className='stat-label'>
                Verified ({stats.verificationRate}%)
              </div>
            </div>
          </div>
          <div className='stat-card'>
            <div className='stat-icon'>⏳</div>
            <div className='stat-content'>
              <div className='stat-number'>{stats.unverifiedArtisans}</div>
              <div className='stat-label'>Pending Verification</div>
            </div>
          </div>
          <div className='stat-card'>
            <div className='stat-icon'>⭐</div>
            <div className='stat-content'>
              <div className='stat-number'>{stats.topRated?.length || 0}</div>
              <div className='stat-label'>Top Rated (4.5+)</div>
            </div>
          </div>
        </div>
      )}

      {/* Filters and Controls */}
      <div className='controls-section'>
        <div className='search-and-filters'>
          <div className='search-box'>
            <input
              type='text'
              placeholder='Search by name, email, or phone...'
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className='search-input'
            />
            <span className='search-icon'>🔍</span>
          </div>

          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className='filter-select'
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <select
            value={verificationFilter}
            onChange={e => setVerificationFilter(e.target.value)}
            className='filter-select'
          >
            <option value='all'>All Status</option>
            <option value='verified'>Verified</option>
            <option value='unverified'>Unverified</option>
          </select>

          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className='filter-select'
          >
            <option value='recent'>Most Recent</option>
            <option value='name_asc'>Name: A-Z</option>
            <option value='name_desc'>Name: Z-A</option>
            <option value='rating_high'>Highest Rated</option>
            <option value='rating_low'>Lowest Rated</option>
          </select>
        </div>

        {/* Bulk Actions */}
        {selectedArtisans.length > 0 && (
          <div className='bulk-actions'>
            <span className='selected-count'>
              {selectedArtisans.length} selected
            </span>
            <button
              className='btn btn-sm btn-success'
              onClick={handleBulkVerify}
            >
              Verify Selected
            </button>
            <button
              className='btn btn-sm btn-warning'
              onClick={handleBulkUnverify}
            >
              Unverify Selected
            </button>
          </div>
        )}

        <div className='results-info'>
          Showing <strong>{filteredAndSortedArtisans.length}</strong> of{' '}
          <strong>{artisans.length}</strong> artisans
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className='loading-container'>
          <div className='spinner'></div>
          <p>Loading artisans...</p>
        </div>
      )}

      {/* Artisans Table */}
      {!loading && (
        <div className='artisans-table-container'>
          {filteredAndSortedArtisans.length === 0 ? (
            <div className='empty-state'>
              <div className='empty-icon'>🔍</div>
              <h3>No Artisans Found</h3>
              <p>Try adjusting your filters or search terms</p>
            </div>
          ) : (
            <table className='artisans-table'>
              <thead>
                <tr>
                  <th>
                    <input
                      type='checkbox'
                      checked={
                        selectedArtisans.length ===
                          filteredAndSortedArtisans.length &&
                        filteredAndSortedArtisans.length > 0
                      }
                      onChange={toggleSelectAll}
                      className='checkbox'
                    />
                  </th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Category</th>
                  <th>Rating</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedArtisans.map(artisan => (
                  <tr
                    key={artisan._id}
                    className={
                      selectedArtisans.includes(artisan._id) ? 'selected' : ''
                    }
                  >
                    <td>
                      <input
                        type='checkbox'
                        checked={selectedArtisans.includes(artisan._id)}
                        onChange={() => toggleArtisanSelection(artisan._id)}
                        className='checkbox'
                      />
                    </td>
                    <td>
                      <div className='artisan-name'>
                        {artisan.avatar && (
                          <img
                            src={artisan.avatar}
                            alt={artisan.name}
                            className='avatar'
                          />
                        )}
                        <span>{artisan.name}</span>
                      </div>
                    </td>
                    <td>{artisan.email}</td>
                    <td>
                      <span className='category-badge'>{artisan.category}</span>
                    </td>
                    <td>{renderStars(artisan.rating)}</td>
                    <td>
                      <span
                        className={`status-badge ${
                          artisan.verified ? 'verified' : 'unverified'
                        }`}
                      >
                        {artisan.verified ? '✓ Verified' : 'Pending'}
                      </span>
                    </td>
                    <td>{new Date(artisan.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div className='action-buttons'>
                        <button
                          className='btn btn-sm btn-info'
                          onClick={() => viewArtisanDetails(artisan)}
                        >
                          View
                        </button>
                        <button
                          className={`btn btn-sm ${
                            artisan.verified ? 'btn-warning' : 'btn-success'
                          }`}
                          onClick={() =>
                            toggleVerification(artisan._id, artisan.verified)
                          }
                        >
                          {artisan.verified ? 'Unverify' : 'Verify'}
                        </button>
                        <button
                          className='btn btn-sm btn-danger'
                          onClick={() => deleteArtisan(artisan._id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Modal - View/Edit Details */}
      {showModal && modalType === 'details' && selectedArtisan && (
        <div className='modal-overlay' onClick={closeModal}>
          <div className='modal-content' onClick={e => e.stopPropagation()}>
            <button className='modal-close' onClick={closeModal}>
              ✕
            </button>

            <div className='modal-header'>
              <div className='modal-avatar-section'>
                {selectedArtisan.avatar ? (
                  <img
                    src={selectedArtisan.avatar}
                    alt={selectedArtisan.name}
                    className='modal-avatar'
                  />
                ) : (
                  <div className='modal-avatar-placeholder'>
                    {selectedArtisan.name?.charAt(0) || 'A'}
                  </div>
                )}
              </div>
              <div className='modal-header-info'>
                <h2>{selectedArtisan.name}</h2>
                <p>{selectedArtisan.email}</p>
                <div className='modal-badges'>
                  <span
                    className={`status-badge ${
                      selectedArtisan.verified ? 'verified' : 'unverified'
                    }`}
                  >
                    {selectedArtisan.verified ? '✓ Verified' : 'Pending'}
                  </span>
                  <span className='category-badge'>
                    {selectedArtisan.category}
                  </span>
                </div>
              </div>
            </div>

            <div className='modal-body'>
              <section className='info-section'>
                <h3>Professional Information</h3>
                <div className='info-grid'>
                  <div className='info-item'>
                    <span className='label'>Email</span>
                    <span className='value'>{selectedArtisan.email}</span>
                  </div>
                  <div className='info-item'>
                    <span className='label'>Phone</span>
                    <span className='value'>
                      {selectedArtisan.phone || 'Not provided'}
                    </span>
                  </div>
                  <div className='info-item'>
                    <span className='label'>Category</span>
                    <span className='value'>{selectedArtisan.category}</span>
                  </div>
                  <div className='info-item'>
                    <span className='label'>Experience</span>
                    <span className='value'>
                      {selectedArtisan.experience || 'N/A'} years
                    </span>
                  </div>
                  <div className='info-item'>
                    <span className='label'>Rating</span>
                    <span className='value'>
                      {renderStars(selectedArtisan.rating)}
                    </span>
                  </div>
                  <div className='info-item'>
                    <span className='label'>Reviews</span>
                    <span className='value'>
                      {selectedArtisan.reviewCount || 0}
                    </span>
                  </div>
                </div>
              </section>

              {selectedArtisan.bio && (
                <section className='bio-section'>
                  <h3>Bio</h3>
                  <p>{selectedArtisan.bio}</p>
                </section>
              )}

              {selectedArtisan.skills && selectedArtisan.skills.length > 0 && (
                <section className='skills-section'>
                  <h3>Skills</h3>
                  <div className='skills-list'>
                    {selectedArtisan.skills.map((skill, idx) => (
                      <span key={idx} className='skill-badge'>
                        {skill}
                      </span>
                    ))}
                  </div>
                </section>
              )}
            </div>

            <div className='modal-footer'>
              <button
                className={`btn ${
                  selectedArtisan.verified ? 'btn-warning' : 'btn-success'
                }`}
                onClick={() => {
                  toggleVerification(
                    selectedArtisan._id,
                    selectedArtisan.verified
                  )
                  closeModal()
                }}
              >
                {selectedArtisan.verified ? 'Unverify' : 'Verify'}
              </button>
              <button
                className='btn btn-danger'
                onClick={() => {
                  deleteArtisan(selectedArtisan._id)
                  closeModal()
                }}
              >
                Delete
              </button>
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

export default AdminArtisans
