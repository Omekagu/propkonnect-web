import React, { useState, useEffect } from 'react'
import axios from 'axios'
import './UserManagement.scss'

const UserManagement = () => {
  const [users, setUsers] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Pagination & Filters
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [verifiedFilter, setVerifiedFilter] = useState('')
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState('desc')
  const [pagination, setPagination] = useState(null)

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [selectedUsers, setSelectedUsers] = useState([])

  // Form state
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    role: 'user',
    isVerified: false,
    password: ''
  })

  // Fetch users
  const fetchUsers = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('authToken')
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            page,
            limit,
            search,
            role: roleFilter,
            verified: verifiedFilter,
            sortBy,
            sortOrder
          }
        }
      )

      setUsers(response.data.users)
      setPagination(response.data.pagination)
      setStats(response.data.stats)
      setError(null)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch users')
    } finally {
      setLoading(false)
    }
  }

  // Fetch dashboard stats
  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem('authToken')
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/stats`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )
      setStats(response.data.stats)
    } catch (err) {
      console.error('Failed to fetch stats:', err)
    }
  }

  useEffect(() => {
    fetchUsers()
    fetchDashboardStats()
  }, [page, search, roleFilter, verifiedFilter, sortBy, sortOrder])

  // Create user
  const handleCreateUser = async e => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('authToken')
      await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user`,
        formData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )
      setShowCreateModal(false)
      resetForm()
      fetchUsers()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create user')
    }
  }

  // Update user
  const handleUpdateUser = async e => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('authToken')
      await axios.put(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/${selectedUser._id}`,
        formData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )
      setShowEditModal(false)
      resetForm()
      fetchUsers()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update user')
    }
  }

  // Delete user
  const handleDeleteUser = async () => {
    try {
      const token = localStorage.getItem('authToken')
      await axios.delete(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/${selectedUser._id}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )
      setShowDeleteModal(false)
      setSelectedUser(null)
      fetchUsers()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete user')
    }
  }

  // Bulk delete
  const handleBulkDelete = async () => {
    if (selectedUsers.length === 0) return
    if (!window.confirm(`Delete ${selectedUsers.length} users?`)) return

    try {
      const token = localStorage.getItem('authToken')
      await axios.post(
        '/api/user/bulk-delete',
        { userIds: selectedUsers },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setSelectedUsers([])
      fetchUsers()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete users')
    }
  }

  // Toggle user selection
  const toggleUserSelection = userId => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    )
  }

  // Select all users
  const toggleSelectAll = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([])
    } else {
      setSelectedUsers(users.map(user => user._id))
    }
  }

  // Reset form
  const resetForm = () => {
    setFormData({
      email: '',
      firstName: '',
      lastName: '',
      phone: '',
      role: 'user',
      isVerified: false,
      password: ''
    })
    setSelectedUser(null)
  }

  // Open edit modal
  const openEditModal = user => {
    setSelectedUser(user)
    setFormData({
      email: user.email,
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      phone: user.phone || '',
      role: user.role || 'user',
      isVerified: user.isVerified || false
    })
    setShowEditModal(true)
  }

  // Open delete modal
  const openDeleteModal = user => {
    setSelectedUser(user)
    setShowDeleteModal(true)
  }

  // Format date
  const formatDate = date => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className='user-management'>
      {/* Header */}
      <header className='management-header'>
        <div className='header-content'>
          <div className='title-section'>
            <h1 className='main-title'>User Management</h1>
            <p className='subtitle'>Manage and monitor all system users</p>
          </div>
          <button
            className='btn-create'
            onClick={() => setShowCreateModal(true)}
          >
            <span className='icon'>+</span>
            Create User
          </button>
        </div>
      </header>

      {/* Stats Cards */}
      {stats && (
        <div className='stats-grid'>
          <div className='stat-card primary'>
            <div className='stat-icon'>👥</div>
            <div className='stat-info'>
              <h3>{stats.totalUsers || 0}</h3>
              <p>Total Users</p>
            </div>
          </div>
          <div className='stat-card success'>
            <div className='stat-icon'>✓</div>
            <div className='stat-info'>
              <h3>{stats.verifiedUsers || 0}</h3>
              <p>Verified Users</p>
            </div>
          </div>
          <div className='stat-card accent'>
            <div className='stat-icon'>🏠</div>
            <div className='stat-info'>
              <h3>{stats.propertyOwners || 0}</h3>
              <p>Property Owners</p>
            </div>
          </div>
          <div className='stat-card warning'>
            <div className='stat-icon'>📊</div>
            <div className='stat-info'>
              <h3>{stats.newUsersThisMonth || 0}</h3>
              <p>New This Month</p>
            </div>
          </div>
        </div>
      )}

      {/* Filters & Search */}
      <div className='controls-section'>
        <div className='search-box'>
          <span className='search-icon'>🔍</span>
          <input
            type='text'
            placeholder='Search by name or email...'
            value={search}
            onChange={e => {
              setSearch(e.target.value)
              setPage(1)
            }}
          />
        </div>

        <div className='filters'>
          <select
            value={roleFilter}
            onChange={e => {
              setRoleFilter(e.target.value)
              setPage(1)
            }}
          >
            <option value=''>All Roles</option>
            <option value='admin'>Admin</option>
            <option value='user'>User</option>
            <option value='agent'>Agent</option>
          </select>

          <select
            value={verifiedFilter}
            onChange={e => {
              setVerifiedFilter(e.target.value)
              setPage(1)
            }}
          >
            <option value=''>All Status</option>
            <option value='true'>Verified</option>
            <option value='false'>Unverified</option>
          </select>

          <select value={sortBy} onChange={e => setSortBy(e.target.value)}>
            <option value='createdAt'>Date Created</option>
            <option value='firstName'>First Name</option>
            <option value='lastName'>Last Name</option>
            <option value='email'>Email</option>
          </select>

          <button
            className='btn-sort'
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </button>
        </div>

        {selectedUsers.length > 0 && (
          <button className='btn-bulk-delete' onClick={handleBulkDelete}>
            Delete Selected ({selectedUsers.length})
          </button>
        )}
      </div>

      {/* Users Table */}
      <div className='table-container'>
        {loading ? (
          <div className='loading-state'>
            <div className='spinner'></div>
            <p>Loading users...</p>
          </div>
        ) : error ? (
          <div className='error-state'>
            <p>{error}</p>
            <button onClick={fetchUsers}>Retry</button>
          </div>
        ) : users.length === 0 ? (
          <div className='empty-state'>
            <div className='empty-icon'>📭</div>
            <h3>No users found</h3>
            <p>Try adjusting your filters or create a new user</p>
          </div>
        ) : (
          <table className='users-table'>
            <thead>
              <tr>
                <th>
                  <input
                    type='checkbox'
                    checked={selectedUsers.length === users.length}
                    onChange={toggleSelectAll}
                  />
                </th>
                <th>User</th>
                <th>Email</th>
                <th>Role</th>
                <th>Phone</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user._id}>
                  <td>
                    <input
                      type='checkbox'
                      checked={selectedUsers.includes(user._id)}
                      onChange={() => toggleUserSelection(user._id)}
                    />
                  </td>
                  <td>
                    <div className='user-cell'>
                      <div className='avatar'>
                        {user.avatar ? (
                          <img src={user.avatar} alt={user.fullName} />
                        ) : (
                          <span>
                            {user.firstName?.[0] || user.email?.[0] || '?'}
                          </span>
                        )}
                      </div>
                      <div className='user-info'>
                        <span className='user-name'>
                          {user.fullName || 'No Name'}
                        </span>
                        <span className='user-id'>
                          ID: {user._id.slice(-6)}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td>{user.email}</td>
                  <td>
                    <span className={`badge badge-${user.role}`}>
                      {user.role}
                    </span>
                  </td>
                  <td>{user.phone || '—'}</td>
                  <td>
                    {user.isVerified ? (
                      <span className='status-badge verified'>Verified</span>
                    ) : (
                      <span className='status-badge unverified'>
                        Unverified
                      </span>
                    )}
                  </td>
                  <td>{formatDate(user.createdAt)}</td>
                  <td>
                    <div className='action-buttons'>
                      <button
                        className='btn-icon edit'
                        onClick={() => openEditModal(user)}
                        title='Edit'
                      >
                        ✏️
                      </button>
                      <button
                        className='btn-icon delete'
                        onClick={() => openDeleteModal(user)}
                        title='Delete'
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className='pagination'>
          <button
            className='page-btn'
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
          >
            Previous
          </button>
          <div className='page-info'>
            Page {page} of {pagination.pages}
          </div>
          <button
            className='page-btn'
            disabled={page === pagination.pages}
            onClick={() => setPage(page + 1)}
          >
            Next
          </button>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div
          className='modal-overlay'
          onClick={() => setShowCreateModal(false)}
        >
          <div className='modal' onClick={e => e.stopPropagation()}>
            <div className='modal-header'>
              <h2>Create New User</h2>
              <button
                className='close-btn'
                onClick={() => setShowCreateModal(false)}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleCreateUser} className='modal-form'>
              <div className='form-row'>
                <div className='form-group'>
                  <label>First Name</label>
                  <input
                    type='text'
                    value={formData.firstName}
                    onChange={e =>
                      setFormData({ ...formData, firstName: e.target.value })
                    }
                    required
                  />
                </div>
                <div className='form-group'>
                  <label>Last Name</label>
                  <input
                    type='text'
                    value={formData.lastName}
                    onChange={e =>
                      setFormData({ ...formData, lastName: e.target.value })
                    }
                    required
                  />
                </div>
              </div>
              <div className='form-group'>
                <label>Email</label>
                <input
                  type='email'
                  value={formData.email}
                  onChange={e =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                />
              </div>
              <div className='form-group'>
                <label>Phone</label>
                <input
                  type='tel'
                  value={formData.phone}
                  onChange={e =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                />
              </div>
              <div className='form-group'>
                <label>Password</label>
                <input
                  type='password'
                  value={formData.password}
                  onChange={e =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  placeholder='Leave empty for auto-generated'
                />
              </div>
              <div className='form-row'>
                <div className='form-group'>
                  <label>Role</label>
                  <select
                    value={formData.role}
                    onChange={e =>
                      setFormData({ ...formData, role: e.target.value })
                    }
                  >
                    <option value='user'>User</option>
                    <option value='admin'>Admin</option>
                    <option value='agent'>Agent</option>
                  </select>
                </div>
                <div className='form-group checkbox-group'>
                  <label>
                    <input
                      type='checkbox'
                      checked={formData.isVerified}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          isVerified: e.target.checked
                        })
                      }
                    />
                    <span>Verified</span>
                  </label>
                </div>
              </div>
              <div className='modal-actions'>
                <button
                  type='button'
                  className='btn-cancel'
                  onClick={() => {
                    setShowCreateModal(false)
                    resetForm()
                  }}
                >
                  Cancel
                </button>
                <button type='submit' className='btn-submit'>
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedUser && (
        <div className='modal-overlay' onClick={() => setShowEditModal(false)}>
          <div className='modal' onClick={e => e.stopPropagation()}>
            <div className='modal-header'>
              <h2>Edit User</h2>
              <button
                className='close-btn'
                onClick={() => setShowEditModal(false)}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleUpdateUser} className='modal-form'>
              <div className='form-row'>
                <div className='form-group'>
                  <label>First Name</label>
                  <input
                    type='text'
                    value={formData.firstName}
                    onChange={e =>
                      setFormData({ ...formData, firstName: e.target.value })
                    }
                  />
                </div>
                <div className='form-group'>
                  <label>Last Name</label>
                  <input
                    type='text'
                    value={formData.lastName}
                    onChange={e =>
                      setFormData({ ...formData, lastName: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className='form-group'>
                <label>Email</label>
                <input
                  type='email'
                  value={formData.email}
                  onChange={e =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  disabled
                />
              </div>
              <div className='form-group'>
                <label>Phone</label>
                <input
                  type='tel'
                  value={formData.phone}
                  onChange={e =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                />
              </div>
              <div className='form-row'>
                <div className='form-group'>
                  <label>Role</label>
                  <select
                    value={formData.role}
                    onChange={e =>
                      setFormData({ ...formData, role: e.target.value })
                    }
                  >
                    <option value='user'>User</option>
                    <option value='admin'>Admin</option>
                    <option value='agent'>Agent</option>
                  </select>
                </div>
                <div className='form-group checkbox-group'>
                  <label>
                    <input
                      type='checkbox'
                      checked={formData.isVerified}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          isVerified: e.target.checked
                        })
                      }
                    />
                    <span>Verified</span>
                  </label>
                </div>
              </div>
              <div className='modal-actions'>
                <button
                  type='button'
                  className='btn-cancel'
                  onClick={() => {
                    setShowEditModal(false)
                    resetForm()
                  }}
                >
                  Cancel
                </button>
                <button type='submit' className='btn-submit'>
                  Update User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedUser && (
        <div
          className='modal-overlay'
          onClick={() => setShowDeleteModal(false)}
        >
          <div className='modal modal-small' onClick={e => e.stopPropagation()}>
            <div className='modal-header'>
              <h2>Confirm Delete</h2>
              <button
                className='close-btn'
                onClick={() => setShowDeleteModal(false)}
              >
                ×
              </button>
            </div>
            <div className='modal-body'>
              <p>
                Are you sure you want to delete user{' '}
                <strong>{selectedUser.fullName || selectedUser.email}</strong>?
              </p>
              <p className='warning-text'>This action cannot be undone.</p>
            </div>
            <div className='modal-actions'>
              <button
                className='btn-cancel'
                onClick={() => {
                  setShowDeleteModal(false)
                  setSelectedUser(null)
                }}
              >
                Cancel
              </button>
              <button className='btn-delete' onClick={handleDeleteUser}>
                Delete User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default UserManagement
