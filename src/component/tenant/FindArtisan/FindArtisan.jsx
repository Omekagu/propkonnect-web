'use client'

import React, { useState } from 'react'
import './FindArtisan.scss'
import { useArtisanManagement } from '@/hooks/useArtisanManagement'
import {
  Search, MapPin, Star, Shield, X, ChevronDown,
  Briefcase, Clock, MessageSquare, Zap
} from 'lucide-react'

// ── Helpers ───────────────────────────────────────────────────────────────────
function initials (name = '') {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'A'
}

function locationStr (loc) {
  if (!loc) return ''
  if (typeof loc === 'string') return loc
  return loc.city || loc.address || ''
}

function Stars ({ rating = 0, count }) {
  const r = Math.round(rating)
  return (
    <div className='rating-stars'>
      {[1, 2, 3, 4, 5].map(s => (
        <span key={s} style={{ color: s <= r ? '#fbbf24' : 'rgba(255,255,255,0.12)', fontSize: 14 }}>★</span>
      ))}
      {rating > 0 && <span style={{ fontSize: 12, color: '#fbbf24', fontWeight: 700, marginLeft: 3 }}>{rating.toFixed(1)}</span>}
      {count > 0  && <span style={{ fontSize: 11, color: '#7d8590', marginLeft: 2 }}>({count})</span>}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export default function FindArtisan () {
  const {
    loading, error, notice,
    showModal, selectedArtisan,
    searchQuery, setSearchQuery,
    categoryFilter, setCategoryFilter,
    ratingFilter, setRatingFilter,
    sortBy, setSortBy,
    sortedArtisans, categories, stats,
    rateArtisan, viewArtisanDetails, closeModal
  } = useArtisanManagement()

  const [showReviewForm, setShowReviewForm]   = useState(false)
  const [formData, setFormData]               = useState({ rating: 5, review: '' })
  const [submitting, setSubmitting]           = useState(false)

  const handleRateSubmit = async e => {
    e.preventDefault()
    setSubmitting(true)
    const ok = await rateArtisan(selectedArtisan._id, formData.rating, formData.review)
    setSubmitting(false)
    if (ok) { setShowReviewForm(false); setFormData({ rating: 5, review: '' }) }
  }

  return (
    <div className='artisan-container'>

      {/* ── Alerts ── */}
      {error  && <div className='alert alert-danger'>{error}</div>}
      {notice && <div className={`alert alert-${notice.type === 'error' ? 'danger' : 'success'}`}>{notice.msg}</div>}

      {/* ── Header ── */}
      <div className='artisan-header'>
        <div className='header-content'>
          <h1>Find an Artisan</h1>
          <p>Browse verified professionals ready for your next project</p>
        </div>
      </div>

      {/* ── Stats strip ── */}
      <div className='stats-container'>
        <div className='stat-card'>
          <div className='stat-number'>{stats.totalArtisans}</div>
          <div className='stat-label'>Artisans</div>
        </div>
        <div className='stat-card'>
          <div className='stat-number'>{stats.averageRating > 0 ? stats.averageRating.toFixed(1) : '—'}</div>
          <div className='stat-label'>Avg Rating</div>
        </div>
        <div className='stat-card'>
          <div className='stat-number'>{stats.topRated}</div>
          <div className='stat-label'>Top Rated</div>
        </div>
        <div className='stat-card'>
          <div className='stat-number'>{stats.totalReviews}</div>
          <div className='stat-label'>Reviews</div>
        </div>
      </div>

      {/* ── Search + Filters ── */}
      <div className='search-filter-section'>
        <div className='search-wrapper'>
          <Search size={15} className='search-icon' />
          <input
            type='text'
            className='search-input'
            placeholder='Search by name, skill or location…'
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        <select className='filter-select' value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        <select className='filter-select' value={ratingFilter} onChange={e => setRatingFilter(Number(e.target.value))}>
          <option value={0}>All ratings</option>
          <option value={3}>3+ stars</option>
          <option value={4}>4+ stars</option>
          <option value={4.5}>4.5+ stars</option>
          <option value={5}>5 stars</option>
        </select>

        <select className='filter-select' value={sortBy} onChange={e => setSortBy(e.target.value)}>
          <option value='recent'>Newest</option>
          <option value='rating_high'>Highest rated</option>
          <option value='name_asc'>Name A–Z</option>
        </select>
      </div>

      {/* ── Grid ── */}
      {loading ? (
        <div className='loading-state'>
          <div className='spinner' />
          <span>Finding artisans…</span>
        </div>
      ) : sortedArtisans.length === 0 ? (
        <div className='empty-state'>
          <Search size={44} />
          <h3>No artisans found</h3>
          <p>Try adjusting your filters or search terms</p>
        </div>
      ) : (
        <>
          <div style={{ fontSize: 12, color: '#7d8590', marginBottom: 14 }}>
            {sortedArtisans.length} artisan{sortedArtisans.length !== 1 ? 's' : ''} found
          </div>
          <div className='artisans-grid'>
            {sortedArtisans.map(a => {
              const loc = locationStr(a.location)
              return (
                <div key={a._id} className='artisan-card'>

                  {/* Card header */}
                  <div className='card-header'>
                    <div className='avatar'>
                      {a.avatar
                        ? <img src={a.avatar} alt={a.name} />
                        : initials(a.name)
                      }
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className='artisan-name'>{a.name || 'Artisan'}</div>
                      <div className='artisan-specialty'>{a.category || a.specialization || '—'}</div>
                    </div>
                    {a.verified && (
                      <div className='verified-badge'>
                        <Shield size={10} /> Verified
                      </div>
                    )}
                  </div>

                  {/* Card body */}
                  <div className='card-body'>
                    {a.bio && (
                      <p className='artisan-bio'>{a.bio}</p>
                    )}

                    <div className='artisan-stats'>
                      <Stars rating={a.rating} count={a.reviewCount} />
                      {a.experience && (
                        <span className='artisan-stat'>
                          <Briefcase size={11} /> {a.experience}yr exp
                        </span>
                      )}
                      {loc && (
                        <span className='artisan-stat'>
                          <MapPin size={11} /> {loc}
                        </span>
                      )}
                      {a.hourlyRate && (
                        <span className='artisan-stat'>
                          <Zap size={11} /> ₦{Number(a.hourlyRate).toLocaleString()}/hr
                        </span>
                      )}
                    </div>

                    {a.skills?.length > 0 && (
                      <div className='skill-tags'>
                        {a.skills.slice(0, 4).map((sk, i) => (
                          <span key={i} className='skill-tag'>{sk}</span>
                        ))}
                        {a.skills.length > 4 && (
                          <span className='skill-tag'>+{a.skills.length - 4}</span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Card footer */}
                  <div className='card-footer'>
                    <button className='btn-view'  onClick={() => viewArtisanDetails(a)}>View Profile</button>
                    <button className='btn-hire'  onClick={() => viewArtisanDetails(a)}>Hire</button>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}

      {/* ── Detail / Hire modal ── */}
      {showModal && selectedArtisan && (
        <div className='modal-overlay' onClick={closeModal}>
          <div className='modal-content' onClick={e => e.stopPropagation()}>

            {/* Modal header */}
            <div className='modal-header'>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div className='avatar' style={{ width: 56, height: 56, fontSize: 22, flexShrink: 0, borderRadius: '50%', background: 'linear-gradient(135deg,#0B3D28,#0F6040)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#C4E53C', fontWeight: 800 }}>
                  {selectedArtisan.avatar
                    ? <img src={selectedArtisan.avatar} alt={selectedArtisan.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                    : initials(selectedArtisan.name)
                  }
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#e6edf3' }}>{selectedArtisan.name}</h2>
                  <div style={{ fontSize: 13, color: '#C4E53C', fontWeight: 600, marginTop: 2 }}>{selectedArtisan.category}</div>
                  {selectedArtisan.verified && (
                    <div className='verified-badge' style={{ marginTop: 4, display: 'inline-flex' }}>
                      <Shield size={10} /> Verified
                    </div>
                  )}
                </div>
              </div>
              <button className='modal-close' onClick={closeModal}><X size={16} /></button>
            </div>

            {/* Modal body */}
            <div className='modal-body'>

              {/* Quick stats */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 20 }}>
                {[
                  { icon: <Star size={14} />, val: selectedArtisan.rating?.toFixed(1) || '—', label: 'Rating' },
                  { icon: <Briefcase size={14} />, val: selectedArtisan.experience ? `${selectedArtisan.experience}yr` : '—', label: 'Experience' },
                  { icon: <MessageSquare size={14} />, val: selectedArtisan.reviewCount || 0, label: 'Reviews' },
                ].map((item, i) => (
                  <div key={i} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: '10px', textAlign: 'center' }}>
                    <div style={{ color: '#C4E53C', marginBottom: 4 }}>{item.icon}</div>
                    <div style={{ fontWeight: 800, fontSize: 16, color: '#e6edf3' }}>{item.val}</div>
                    <div style={{ fontSize: 10, color: '#7d8590', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 2 }}>{item.label}</div>
                  </div>
                ))}
              </div>

              {/* Details */}
              {[
                ['Specialization', selectedArtisan.specialization],
                ['Location', locationStr(selectedArtisan.location)],
                ['Rate', selectedArtisan.hourlyRate ? `₦${Number(selectedArtisan.hourlyRate).toLocaleString()}/hr` : null],
              ].filter(([, v]) => v).map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: 13 }}>
                  <span style={{ color: '#7d8590' }}>{k}</span>
                  <span style={{ color: '#e6edf3', fontWeight: 600 }}>{v}</span>
                </div>
              ))}

              {/* Bio */}
              {selectedArtisan.bio && (
                <div style={{ marginTop: 16 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#7d8590', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>About</div>
                  <p style={{ fontSize: 13, color: 'rgba(230,237,243,0.65)', lineHeight: 1.6, margin: 0 }}>{selectedArtisan.bio}</p>
                </div>
              )}

              {/* Skills */}
              {selectedArtisan.skills?.length > 0 && (
                <div style={{ marginTop: 16 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#7d8590', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>Skills</div>
                  <div className='skill-tags'>
                    {selectedArtisan.skills.map((sk, i) => <span key={i} className='skill-tag'>{sk}</span>)}
                  </div>
                </div>
              )}

              {/* Stars rating */}
              <div style={{ marginTop: 20 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#7d8590', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10 }}>Rate this artisan</div>
                {!showReviewForm ? (
                  <button className='btn-rate' onClick={() => setShowReviewForm(true)}>
                    <Star size={13} /> Write a Review
                  </button>
                ) : (
                  <form onSubmit={handleRateSubmit} className='hire-form'>
                    <div className='form-group'>
                      <label>Star Rating</label>
                      <div className='star-rating'>
                        {[1, 2, 3, 4, 5].map(s => (
                          <button
                            type='button'
                            key={s}
                            onClick={() => setFormData(f => ({ ...f, rating: s }))}
                            style={{ color: s <= formData.rating ? '#fbbf24' : 'rgba(255,255,255,0.15)' }}
                          >★</button>
                        ))}
                      </div>
                    </div>
                    <div className='form-group'>
                      <label>Review (optional)</label>
                      <textarea
                        placeholder='Share your experience…'
                        value={formData.review}
                        onChange={e => setFormData(f => ({ ...f, review: e.target.value }))}
                        rows={3}
                      />
                    </div>
                    <div className='form-actions'>
                      <button type='button' onClick={() => setShowReviewForm(false)}>Cancel</button>
                      <button type='submit' disabled={submitting}>{submitting ? 'Submitting…' : 'Submit Review'}</button>
                    </div>
                  </form>
                )}
              </div>
            </div>

            {/* Modal footer */}
            <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: 10 }}>
              <button className='btn-hire' style={{ flex: 1, padding: '11px' }} onClick={closeModal}>
                Hire Now
              </button>
              <button className='btn-chat' onClick={closeModal}>
                <MessageSquare size={14} /> Message
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
