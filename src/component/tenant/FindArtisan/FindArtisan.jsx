import React, { useState } from 'react'

import './FindArtisan.scss'
import useArtisanManagement from '@/hooks/useArtisanManagement'

/**
 * Main Artisan Management Page Component
 * Displays, filters, searches, and manages artisans
 */
const FindArtisan = () => {
  const {
    // State
    artisans,
    loading,
    error,
    notice,
    showModal,
    modalType,
    selectedArtisan,

    // Filters
    searchQuery,
    setSearchQuery,
    categoryFilter,
    setCategoryFilter,
    ratingFilter,
    setRatingFilter,
    sortBy,
    setSortBy,

    // Data
    sortedArtisans,
    categories,
    stats,

    // Actions
    deleteArtisan,
    rateArtisan,
    viewArtisanDetails,
    closeModal
  } = useArtisanManagement()

  const [showRatingForm, setShowRatingForm] = useState(false)
  const [formData, setFormData] = useState({ rating: 5, review: '' })

  /**
   * Handle rating submission
   */
  const handleRateSubmit = async e => {
    e.preventDefault()
    const success = await rateArtisan(
      selectedArtisan._id,
      formData.rating,
      formData.review
    )
    if (success) {
      setShowRatingForm(false)
      setFormData({ rating: 5, review: '' })
    }
  }

  /**
   * Render star rating
   */
  const renderStars = (rating, size = 'sm') => {
    return (
      <div className={`stars stars-${size}`}>
        {[1, 2, 3, 4, 5].map(star => (
          <span
            key={star}
            className={`star ${star <= Math.round(rating) ? 'filled' : ''}`}
          >
            ★
          </span>
        ))}
      </div>
    )
  }

  return (
    <div className='artisan-container'>
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
      <div className='artisan-header'>
        <div className='header-content'>
          <h1>Artisan Directory</h1>
          <p>Find skilled professionals for your projects</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className='stats-container'>
        <div className='stat-card'>
          <div className='stat-number'>{stats.totalArtisans}</div>
          <div className='stat-label'>Total Artisans</div>
        </div>
        <div className='stat-card'>
          <div className='stat-number'>{stats.averageRating}★</div>
          <div className='stat-label'>Average Rating</div>
        </div>
        <div className='stat-card'>
          <div className='stat-number'>{stats.topRated}</div>
          <div className='stat-label'>Top Rated (4.5+)</div>
        </div>
        <div className='stat-card'>
          <div className='stat-number'>{stats.totalReviews}</div>
          <div className='stat-label'>Total Reviews</div>
        </div>
      </div>

      {/* Filters Section */}
      <div className='filters-section'>
        <div className='search-box'>
          <input
            type='text'
            placeholder='Search artisans by name, skill, location...'
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className='search-input'
          />
          <span className='search-icon'>🔍</span>
        </div>

        <div className='filter-controls'>
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
            value={ratingFilter}
            onChange={e => setRatingFilter(Number(e.target.value))}
            className='filter-select'
          >
            <option value={0}>All Ratings</option>
            <option value={3}>3+ Stars</option>
            <option value={3.5}>3.5+ Stars</option>
            <option value={4}>4+ Stars</option>
            <option value={4.5}>4.5+ Stars</option>
            <option value={5}>5 Stars Only</option>
          </select>

          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className='filter-select'
          >
            <option value='recent'>Most Recent</option>
            <option value='rating_high'>Highest Rated</option>
            <option value='rating_low'>Lowest Rated</option>
            <option value='name_asc'>Name: A-Z</option>
            <option value='name_desc'>Name: Z-A</option>
          </select>
        </div>

        <div className='results-count'>
          Showing <strong>{sortedArtisans.length}</strong> artisans
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className='loading-container'>
          <div className='spinner'></div>
          <p>Loading artisans...</p>
        </div>
      )}

      {/* Artisans Grid */}
      {!loading && (
        <div className='artisans-grid'>
          {sortedArtisans.length === 0 ? (
            <div className='empty-state'>
              <div className='empty-icon'>🔍</div>
              <h3>No Artisans Found</h3>
              <p>Try adjusting your filters or search terms</p>
            </div>
          ) : (
            sortedArtisans.map(artisan => (
              <div key={artisan._id} className='artisan-card'>
                {/* Card Image */}
                <div className='card-image'>
                  {artisan.avatar ? (
                    <img src={artisan.avatar} alt={artisan.name} />
                  ) : (
                    <div className='avatar-placeholder'>
                      {artisan.name?.charAt(0) || 'A'}
                    </div>
                  )}
                  {artisan.verified && (
                    <div className='verified-badge'>✓ Verified</div>
                  )}
                </div>

                {/* Card Content */}
                <div className='card-content'>
                  <h3 className='artisan-name'>{artisan.name}</h3>

                  <p className='category-badge'>{artisan.category}</p>

                  {artisan.specialization && (
                    <p className='specialization'>{artisan.specialization}</p>
                  )}

                  {artisan.location && (
                    <p className='location'>📍 {typeof artisan.location === 'string' ? artisan.location : artisan.location?.city || artisan.location?.address || ''}</p>
                  )}

                  {/* Rating */}
                  <div className='rating-section'>
                    {renderStars(artisan.rating || 0)}
                    <span className='rating-text'>
                      {artisan.rating ? artisan.rating.toFixed(1) : 'N/A'}
                    </span>
                    {artisan.reviewCount > 0 && (
                      <span className='review-count'>
                        ({artisan.reviewCount} reviews)
                      </span>
                    )}
                  </div>

                  {/* Price Info */}
                  {artisan.hourlyRate && (
                    <div className='price-info'>
                      <span className='price'>${artisan.hourlyRate}/hr</span>
                    </div>
                  )}

                  {/* Description */}
                  {artisan.bio && <p className='bio'>{artisan.bio}</p>}

                  {/* Skills */}
                  {artisan.skills && artisan.skills.length > 0 && (
                    <div className='skills-container'>
                      {artisan.skills.slice(0, 3).map((skill, idx) => (
                        <span key={idx} className='skill-tag'>
                          {skill}
                        </span>
                      ))}
                      {artisan.skills.length > 3 && (
                        <span className='skill-tag'>
                          +{artisan.skills.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div className='card-actions'>
                    <button
                      className='btn btn-primary'
                      onClick={() => viewArtisanDetails(artisan)}
                    >
                      View Profile
                    </button>
                    <button
                      className='btn btn-secondary'
                      onClick={() => viewArtisanDetails(artisan)}
                    >
                      Contact
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Modal */}
      {showModal && modalType === 'details' && selectedArtisan && (
        <div className='modal-overlay' onClick={closeModal}>
          <div className='modal-content' onClick={e => e.stopPropagation()}>
            <button className='modal-close' onClick={closeModal}>
              ✕
            </button>

            <div className='modal-header'>
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
              <div className='modal-title'>
                <h2>{selectedArtisan.name}</h2>
                {selectedArtisan.verified && (
                  <span className='verified-badge'>
                    ✓ Verified Professional
                  </span>
                )}
              </div>
            </div>

            <div className='modal-body'>
              {/* Info Section */}
              <section className='info-section'>
                <h3>Professional Information</h3>
                <div className='info-grid'>
                  <div className='info-item'>
                    <span className='label'>Category</span>
                    <span className='value'>{selectedArtisan.category}</span>
                  </div>
                  {selectedArtisan.specialization && (
                    <div className='info-item'>
                      <span className='label'>Specialization</span>
                      <span className='value'>
                        {selectedArtisan.specialization}
                      </span>
                    </div>
                  )}
                  {selectedArtisan.experience && (
                    <div className='info-item'>
                      <span className='label'>Experience</span>
                      <span className='value'>
                        {selectedArtisan.experience} years
                      </span>
                    </div>
                  )}
                  {selectedArtisan.hourlyRate && (
                    <div className='info-item'>
                      <span className='label'>Hourly Rate</span>
                      <span className='value'>
                        ${selectedArtisan.hourlyRate}/hr
                      </span>
                    </div>
                  )}
                  {selectedArtisan.location && (
                    <div className='info-item'>
                      <span className='label'>Location</span>
                      <span className='value'>{typeof selectedArtisan.location === 'string' ? selectedArtisan.location : selectedArtisan.location?.city || selectedArtisan.location?.address || ''}</span>
                    </div>
                  )}
                  <div className='info-item'>
                    <span className='label'>Rating</span>
                    <div className='value'>
                      {renderStars(selectedArtisan.rating || 0)}
                      <span>{selectedArtisan.rating?.toFixed(1) || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </section>

              {/* Bio Section */}
              {selectedArtisan.bio && (
                <section className='bio-section'>
                  <h3>About</h3>
                  <p>{selectedArtisan.bio}</p>
                </section>
              )}

              {/* Skills Section */}
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

              {/* Rating Form */}
              <section className='rating-section'>
                <h3>Rate This Artisan</h3>
                {!showRatingForm ? (
                  <button
                    className='btn btn-outline'
                    onClick={() => setShowRatingForm(true)}
                  >
                    Write a Review
                  </button>
                ) : (
                  <form onSubmit={handleRateSubmit} className='rating-form'>
                    <div className='form-group'>
                      <label htmlFor='rating'>Rating</label>
                      <select
                        id='rating'
                        value={formData.rating}
                        onChange={e =>
                          setFormData({
                            ...formData,
                            rating: Number(e.target.value)
                          })
                        }
                        className='form-control'
                      >
                        <option value={1}>1 - Poor</option>
                        <option value={2}>2 - Fair</option>
                        <option value={3}>3 - Good</option>
                        <option value={4}>4 - Very Good</option>
                        <option value={5}>5 - Excellent</option>
                      </select>
                    </div>

                    <div className='form-group'>
                      <label htmlFor='review'>Review (Optional)</label>
                      <textarea
                        id='review'
                        value={formData.review}
                        onChange={e =>
                          setFormData({ ...formData, review: e.target.value })
                        }
                        placeholder='Share your experience with this artisan...'
                        className='form-control'
                        rows={4}
                      />
                    </div>

                    <div className='form-actions'>
                      <button
                        type='button'
                        className='btn btn-secondary'
                        onClick={() => setShowRatingForm(false)}
                      >
                        Cancel
                      </button>
                      <button type='submit' className='btn btn-primary'>
                        Submit Review
                      </button>
                    </div>
                  </form>
                )}
              </section>
            </div>

            <div className='modal-footer'>
              <button
                className='btn btn-success'
                onClick={() => {
                  // Handle contact/hire
                  console.log('Hiring artisan:', selectedArtisan._id)
                  closeModal()
                }}
              >
                Hire Now
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

export default FindArtisan
