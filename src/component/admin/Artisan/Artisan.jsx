'use client'
import React, { useState } from 'react'
import { Users, CheckCircle, Clock, Star, Search, Filter, Eye, ShieldCheck, ShieldX, Trash2, X, RefreshCw } from 'lucide-react'
import './Artisan.scss'
import { useAdminArtisans } from '@/hooks/useArtisanManagement'

const AdminArtisans = () => {
  const {
    artisans, loading, error, notice, stats,
    showModal, modalType, selectedArtisan,
    searchQuery, setSearchQuery,
    categoryFilter, setCategoryFilter,
    verificationFilter, setVerificationFilter,
    sortBy, setSortBy,
    selectedArtisans, toggleArtisanSelection, toggleSelectAll,
    filteredAndSortedArtisans, categories,
    toggleVerification, deleteArtisan, updateArtisan, bulkUpdate,
    viewArtisanDetails, closeModal
  } = useAdminArtisans()

  const [editFormData, setEditFormData] = useState({})

  const handleBulkVerify   = async () => { await bulkUpdate({ verified: true }) }
  const handleBulkUnverify = async () => { await bulkUpdate({ verified: false }) }

  const handleEditSubmit = async e => {
    e.preventDefault()
    await updateArtisan(selectedArtisan._id, editFormData)
    setEditFormData({})
    closeModal()
  }

  const renderStars = rating => (
    <div className='art-stars'>
      {[1,2,3,4,5].map(s => (
        <span key={s} className={`art-star${s <= Math.round(rating||0) ? ' filled' : ''}`}>★</span>
      ))}
      <span className='art-rating-val'>{(rating||0).toFixed(1)}</span>
    </div>
  )

  return (
    <div className='art-wrap'>
      {/* Alerts */}
      {error && (
        <div className='art-alert art-alert--error'>
          <X size={14} /> {error}
        </div>
      )}
      {notice && (
        <div className={`art-alert art-alert--${notice.type === 'error' ? 'error' : 'success'}`}>
          {notice.type === 'error' ? <X size={14} /> : <CheckCircle size={14} />} {notice.msg}
        </div>
      )}

      {/* Header */}
      <div className='art-head'>
        <div>
          <h2>Artisan Management</h2>
          <p>Manage artisan accounts and verify professionals</p>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className='art-stats'>
          <div className='art-stat'>
            <div className='art-stat-icon total'><Users size={18} /></div>
            <div className='art-stat-body'>
              <div className='art-stat-val'>{stats.totalArtisans}</div>
              <div className='art-stat-lbl'>Total</div>
            </div>
          </div>
          <div className='art-stat'>
            <div className='art-stat-icon verified'><CheckCircle size={18} /></div>
            <div className='art-stat-body'>
              <div className='art-stat-val'>{stats.verifiedArtisans}</div>
              <div className='art-stat-lbl'>Verified ({stats.verificationRate}%)</div>
            </div>
          </div>
          <div className='art-stat'>
            <div className='art-stat-icon pending'><Clock size={18} /></div>
            <div className='art-stat-body'>
              <div className='art-stat-val'>{stats.unverifiedArtisans}</div>
              <div className='art-stat-lbl'>Pending</div>
            </div>
          </div>
          <div className='art-stat'>
            <div className='art-stat-icon toprated'><Star size={18} /></div>
            <div className='art-stat-body'>
              <div className='art-stat-val'>{stats.topRated?.length || 0}</div>
              <div className='art-stat-lbl'>Top Rated</div>
            </div>
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div className='art-toolbar'>
        <div className='art-search'>
          <Search size={14} />
          <input
            placeholder='Search by name, email or phone…'
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
        <div className='art-filters'>
          <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className='art-select'>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={verificationFilter} onChange={e => setVerificationFilter(e.target.value)} className='art-select'>
            <option value='all'>All Status</option>
            <option value='verified'>Verified</option>
            <option value='unverified'>Unverified</option>
          </select>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)} className='art-select'>
            <option value='recent'>Most Recent</option>
            <option value='name_asc'>Name A–Z</option>
            <option value='name_desc'>Name Z–A</option>
            <option value='rating_high'>Highest Rated</option>
            <option value='rating_low'>Lowest Rated</option>
          </select>
        </div>
        <span className='art-count'>
          {filteredAndSortedArtisans.length} / {artisans.length} artisans
        </span>
      </div>

      {/* Bulk actions */}
      {selectedArtisans.length > 0 && (
        <div className='art-bulk'>
          <span className='art-bulk-count'>{selectedArtisans.length} selected</span>
          <button className='art-btn art-btn--success' onClick={handleBulkVerify}>
            <ShieldCheck size={13} /> Verify
          </button>
          <button className='art-btn art-btn--ghost' onClick={handleBulkUnverify}>
            <ShieldX size={13} /> Unverify
          </button>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className='art-state'>
          <div className='art-spinner' />
          <p>Loading artisans…</p>
        </div>
      )}

      {/* Table */}
      {!loading && (
        filteredAndSortedArtisans.length === 0 ? (
          <div className='art-empty'>
            <Search size={40} />
            <p>No artisans found. Adjust filters or search.</p>
          </div>
        ) : (
          <div className='art-table-wrap'>
            <table className='art-table'>
              <thead>
                <tr>
                  <th>
                    <input
                      type='checkbox'
                      checked={selectedArtisans.length === filteredAndSortedArtisans.length && filteredAndSortedArtisans.length > 0}
                      onChange={toggleSelectAll}
                      className='art-checkbox'
                    />
                  </th>
                  <th>Artisan</th>
                  <th>Category</th>
                  <th>Rating</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedArtisans.map(artisan => (
                  <tr key={artisan._id} className={selectedArtisans.includes(artisan._id) ? 'selected' : ''}>
                    <td>
                      <input
                        type='checkbox'
                        checked={selectedArtisans.includes(artisan._id)}
                        onChange={() => toggleArtisanSelection(artisan._id)}
                        className='art-checkbox'
                      />
                    </td>
                    <td>
                      <div className='art-person'>
                        <div className='art-av'>
                          {artisan.avatar
                            ? <img src={artisan.avatar} alt={artisan.name} />
                            : (artisan.name?.[0] || 'A').toUpperCase()}
                        </div>
                        <div>
                          <div className='art-name'>{artisan.name}</div>
                          <div className='art-email'>{artisan.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className='art-cat-pill'>{artisan.category}</span>
                    </td>
                    <td>{renderStars(artisan.rating)}</td>
                    <td>
                      <span className={`art-badge ${artisan.verified ? 'verified' : 'unverified'}`}>
                        {artisan.verified ? 'Verified' : 'Pending'}
                      </span>
                    </td>
                    <td className='art-date'>{new Date(artisan.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div className='art-actions'>
                        <button className='art-btn art-btn--ghost art-btn--sm' onClick={() => viewArtisanDetails(artisan)} title='View'>
                          <Eye size={13} />
                        </button>
                        <button
                          className={`art-btn art-btn--sm ${artisan.verified ? 'art-btn--warn' : 'art-btn--success'}`}
                          onClick={() => toggleVerification(artisan._id, artisan.verified)}
                        >
                          {artisan.verified ? <ShieldX size={13} /> : <ShieldCheck size={13} />}
                        </button>
                        <button className='art-btn art-btn--danger art-btn--sm' onClick={() => deleteArtisan(artisan._id)}>
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}

      {/* Detail Modal */}
      {showModal && modalType === 'details' && selectedArtisan && (
        <div className='art-overlay' onClick={closeModal}>
          <div className='art-modal' onClick={e => e.stopPropagation()}>
            <div className='art-modal-head'>
              <div className='art-modal-av'>
                {selectedArtisan.avatar
                  ? <img src={selectedArtisan.avatar} alt={selectedArtisan.name} />
                  : (selectedArtisan.name?.[0] || 'A').toUpperCase()}
              </div>
              <div className='art-modal-title'>
                <h3>{selectedArtisan.name}</h3>
                <p>{selectedArtisan.email}</p>
                <div className='art-modal-badges'>
                  <span className={`art-badge ${selectedArtisan.verified ? 'verified' : 'unverified'}`}>
                    {selectedArtisan.verified ? 'Verified' : 'Pending'}
                  </span>
                  <span className='art-cat-pill'>{selectedArtisan.category}</span>
                </div>
              </div>
              <button className='art-modal-close' onClick={closeModal}><X size={16} /></button>
            </div>

            <div className='art-modal-body'>
              <div className='art-info-grid'>
                {[
                  ['Email', selectedArtisan.email],
                  ['Phone', selectedArtisan.phone || '—'],
                  ['Category', selectedArtisan.category],
                  ['Experience', selectedArtisan.experience ? `${selectedArtisan.experience} yrs` : '—'],
                  ['Reviews', selectedArtisan.reviewCount || 0],
                  ['Rating', <span key='r'>{renderStars(selectedArtisan.rating)}</span>],
                ].map(([label, val]) => (
                  <div key={label} className='art-info-item'>
                    <span className='art-info-label'>{label}</span>
                    <span className='art-info-val'>{val}</span>
                  </div>
                ))}
              </div>

              {selectedArtisan.bio && (
                <div className='art-bio'>
                  <h4>Bio</h4>
                  <p>{selectedArtisan.bio}</p>
                </div>
              )}

              {selectedArtisan.skills?.length > 0 && (
                <div className='art-skills'>
                  <h4>Skills</h4>
                  <div className='art-skill-chips'>
                    {selectedArtisan.skills.map((s, i) => (
                      <span key={i} className='art-skill-chip'>{s}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className='art-modal-foot'>
              <button
                className={`art-btn ${selectedArtisan.verified ? 'art-btn--warn' : 'art-btn--success'}`}
                onClick={() => { toggleVerification(selectedArtisan._id, selectedArtisan.verified); closeModal() }}
              >
                {selectedArtisan.verified ? <><ShieldX size={14} /> Unverify</> : <><ShieldCheck size={14} /> Verify</>}
              </button>
              <button className='art-btn art-btn--danger' onClick={() => { deleteArtisan(selectedArtisan._id); closeModal() }}>
                <Trash2 size={14} /> Delete
              </button>
              <button className='art-btn art-btn--ghost' onClick={closeModal}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminArtisans
