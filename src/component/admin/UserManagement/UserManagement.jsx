'use client'
import React, { useState, useEffect } from 'react'
import axios from 'axios'
import {
  FiSearch,
  FiFilter,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiCheck,
  FiX,
  FiEye,
  FiEyeOff,
  FiMoreVertical,
  FiLogOut,
  FiUser,
  FiUserCheck,
  FiActivity,
  FiDownload,
  FiRefreshCw
} from 'react-icons/fi'
import './UserManagement.scss'

const EnhancedUserManagement = () => {
  // States
  const [users, setUsers] = useState([])
  const [filteredUsers, setFilteredUsers] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Filters
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [userTypeFilter, setUserTypeFilter] = useState('all') // all, owner, artisan
  const [statusFilter, setStatusFilter] = useState('all') // all, active, inactive
  const [verificationFilter, setVerificationFilter] = useState('all')
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState('desc')
  const [viewMode, setViewMode] = useState('grid') // grid, table

  // Pagination
  const [page, setPage] = useState(1)
  const [itemsPerPage] = useState(12)

  // Modals
  const [showUserDetail, setShowUserDetail] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showVerifyModal, setShowVerifyModal] = useState(false)

  // Selected user
  const [selectedUser, setSelectedUser] = useState(null)
  const [selectedUsers, setSelectedUsers] = useState([])

  // Form data
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: 'user',
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
          headers: { Authorization: `Bearer ${token}` }
        }
      )
      setUsers(response.data.users || [])
      setStats(response.data.stats)
      setError(null)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch users')
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  // Filter and search users
  useEffect(() => {
    let result = [...users]

    // Search filter
    if (searchTerm) {
      result = result.filter(
        user =>
          user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.phone?.includes(searchTerm)
      )
    }

    // Role filter
    if (roleFilter !== 'all') {
      result = result.filter(user => user.role === roleFilter)
    }

    // User type filter (owner vs artisan)
    if (userTypeFilter !== 'all') {
      result = result.filter(user => {
        if (userTypeFilter === 'PROPERTY_OWNER') {
          return !user.artisanProfile?.isActive
        }
        if (userTypeFilter === 'artisan') {
          return user.artisanProfile?.isActive
        }
        return true
      })
    }

    // Verification filter
    if (verificationFilter !== 'all') {
      result = result.filter(user => {
        if (verificationFilter === 'verified') {
          return user.isVerified === true
        }
        if (verificationFilter === 'unverified') {
          return user.isVerified === false
        }
        return true
      })
    }

    // Status filter (online/offline)
    if (statusFilter !== 'all') {
      result = result.filter(user => {
        const isActive = isUserOnline(user)
        if (statusFilter === 'active') return isActive
        if (statusFilter === 'inactive') return !isActive
        return true
      })
    }

    // Sort
    result.sort((a, b) => {
      let aValue = a[sortBy]
      let bValue = b[sortBy]

      if (sortBy === 'fullName') {
        aValue = `${a.firstName} ${a.lastName}`
        bValue = `${b.firstName} ${b.lastName}`
      }

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase()
        bValue = bValue.toLowerCase()
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1
      return 0
    })

    setFilteredUsers(result)
    setPage(1)
  }, [
    users,
    searchTerm,
    roleFilter,
    userTypeFilter,
    statusFilter,
    verificationFilter,
    sortBy,
    sortOrder
  ])

  // Check if user is online
  const isUserOnline = user => {
    if (!user.status?.lastSeen) return false
    const lastLogin = new Date(user.status.lastSeen).getTime()
    const now = Date.now()
    const fiveMinutes = 5 * 60 * 1000
    return now - lastLogin < fiveMinutes
  }

  // Get user type label
  const getUserType = user => {
    if (user.artisanProfile?.isActive) {
      return 'Artisan'
    }
    if (user.properties?.length > 0) {
      return 'PROPERTY_OWNER'
    }
    return 'User'
  }

  // Format date
  const formatDate = date => {
    if (!date) return '—'
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Get time ago
  const getTimeAgo = date => {
    if (!date) return 'Never'
    const seconds = Math.floor((new Date() - new Date(date)) / 1000)
    if (seconds < 60) return 'Just now'
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })
  }

  // Create user
  const handleCreateUser = async e => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('authToken')
      await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
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
        { headers: { Authorization: `Bearer ${token}` } }
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
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setShowDeleteModal(false)
      setSelectedUser(null)
      fetchUsers()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete user')
    }
  }

  // Verify user
  const handleVerifyUser = async () => {
    try {
      const token = localStorage.getItem('authToken')
      await axios.put(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/${selectedUser._id}/verify`,
        { isVerified: !selectedUser.isVerified },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setShowVerifyModal(false)
      fetchUsers()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to verify user')
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

  // Bulk delete
  const handleBulkDelete = async () => {
    if (!window.confirm(`Delete ${selectedUsers.length} users?`)) return
    try {
      const token = localStorage.getItem('authToken')
      for (const userId of selectedUsers) {
        await axios.delete(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/${userId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        )
      }
      setSelectedUsers([])
      fetchUsers()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete users')
    }
  }

  // Open edit modal
  const openEditModal = user => {
    setSelectedUser(user)
    console.log('user to edit:', user)
    setFormData({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      phone: user.phone || '',
      role: user.role || 'user'
    })
    setShowEditModal(true)
  }

  // Reset form
  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      role: 'user',
      password: ''
    })
    setSelectedUser(null)
  }

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage)
  const startIndex = (page - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex)

  return (
    <div className='enhanced-user-management'>
      {/* Header */}
      <header className='user-header'>
        <div className='header-top'>
          <div className='title-section'>
            <h1>User Management</h1>
            <p>Manage and monitor all system users</p>
          </div>
          <div className='header-actions'>
            <button className='btn-icon' onClick={fetchUsers} title='Refresh'>
              <FiRefreshCw />
            </button>
            <button
              className='btn-primary'
              onClick={() => setShowCreateModal(true)}
            >
              <FiPlus /> Create User
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className='stats-container'>
            <div className='stat-card total'>
              <div className='stat-icon'>👥</div>
              <div className='stat-value'>{stats.totalUsers || 0}</div>
              <div className='stat-label'>Total Users</div>
            </div>
            <div className='stat-card active'>
              <div className='stat-icon'>🟢</div>
              <div className='stat-value'>{stats.activeUsers || 0}</div>
              <div className='stat-label'>Active Now</div>
            </div>
            <div className='stat-card verified'>
              <div className='stat-icon'>✓</div>
              <div className='stat-value'>{stats.verifiedUsers || 0}</div>
              <div className='stat-label'>Verified</div>
            </div>
            <div className='stat-card artisans'>
              <div className='stat-icon'>🔧</div>
              <div className='stat-value'>{stats.artisans || 0}</div>
              <div className='stat-label'>Artisans</div>
            </div>
            <div className='stat-card owners'>
              <div className='stat-icon'>🏠</div>
              <div className='stat-value'>{stats.propertyOwners || 0}</div>
              <div className='stat-label'>Owners</div>
            </div>
          </div>
        )}
      </header>

      {/* Filters */}
      <div className='filters-section'>
        <div className='search-container'>
          <FiSearch className='search-icon' />
          <input
            type='text'
            placeholder='Search by name, email, or phone...'
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        <div className='filters-grid'>
          <select
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value)}
            className='filter-select'
          >
            <option value='all'>All Roles</option>
            <option value='SUPER_ADMIN'>Super Admin</option>
            <option value='admin'>Admin</option>
            <option value='user'>User</option>
            <option value='artisan'>Artisan</option>
          </select>

          <select
            value={userTypeFilter}
            onChange={e => setUserTypeFilter(e.target.value)}
            className='filter-select'
          >
            <option value='all'>All Types</option>
            <option value='owner'>Property Owner</option>
            <option value='artisan'>Artisan</option>
          </select>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className='filter-select'
          >
            <option value='all'>All Status</option>
            <option value='active'>Online</option>
            <option value='inactive'>Offline</option>
          </select>

          <select
            value={verificationFilter}
            onChange={e => setVerificationFilter(e.target.value)}
            className='filter-select'
          >
            <option value='all'>All Verification</option>
            <option value='verified'>Verified</option>
            <option value='unverified'>Unverified</option>
          </select>

          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className='filter-select'
          >
            <option value='createdAt'>Newest First</option>
            <option value='firstName'>First Name</option>
            <option value='email'>Email</option>
            <option value='status.lastSeen'>Last Login</option>
          </select>

          <button
            className='btn-sort'
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            title={`Sort ${sortOrder === 'asc' ? 'descending' : 'ascending'}`}
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </button>
        </div>

        {selectedUsers.length > 0 && (
          <div className='bulk-actions'>
            <span>{selectedUsers.length} selected</span>
            <button className='btn-danger' onClick={handleBulkDelete}>
              <FiTrash2 /> Delete Selected
            </button>
          </div>
        )}
      </div>

      {/* Users Display */}
      <div className='users-content'>
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
        ) : paginatedUsers.length === 0 ? (
          <div className='empty-state'>
            <div className='empty-icon'>📭</div>
            <h3>No users found</h3>
            <p>Try adjusting your filters or create a new user</p>
          </div>
        ) : (
          <div className='users-grid'>
            {paginatedUsers.map(user => {
              const isOnline = isUserOnline(user)
              const userType = getUserType(user)

              return (
                <div
                  key={user._id}
                  className='user-card'
                  onClick={() => {
                    setSelectedUser(user)
                    setShowUserDetail(true)
                  }}
                >
                  {/* User Card Header */}
                  <div className='card-header'>
                    <div className='avatar-section'>
                      <div className='avatar'>
                        <span>
                          {user.firstName?.[0]}
                          {user.lastName?.[0]}
                        </span>
                      </div>
                      <div
                        className='status-badge'
                        title={isOnline ? 'Online' : 'Offline'}
                      >
                        <span
                          className={`status-dot ${
                            isOnline ? 'online' : 'offline'
                          }`}
                        ></span>
                      </div>
                    </div>
                    <div className='menu-button'>
                      <button className='btn-menu'>
                        <FiMoreVertical />
                      </button>
                    </div>
                  </div>

                  {/* User Card Body */}
                  <div className='card-body'>
                    <h3 className='user-name'>
                      {user.firstName} {user.lastName}
                    </h3>
                    <p className='user-email'>{user.email}</p>

                    {/* User Type Badge */}
                    <div className='badges'>
                      <span className={`type-badge ${userType.toLowerCase()}`}>
                        {userType}
                      </span>
                      <span className={`role-badge role-${user.role}`}>
                        {user.role}
                      </span>
                      {user.isVerified ? (
                        <span className='verify-badge verified'>
                          <FiCheck /> Verified
                        </span>
                      ) : (
                        <span className='verify-badge unverified'>
                          <FiX /> Unverified
                        </span>
                      )}
                    </div>

                    {/* User Stats */}
                    <div className='user-stats'>
                      <div className='stat'>
                        <span className='label'>Phone:</span>
                        <span className='value'>{user.phone || '—'}</span>
                      </div>
                      <div className='stat'>
                        <span className='label'>Joined:</span>
                        <span className='value'>
                          {formatDate(user.createdAt)}
                        </span>
                      </div>
                      <div className='stat'>
                        <span className='label'>Last Login:</span>
                        <span className='value'>
                          {getTimeAgo(user.status?.lastSeen)}
                        </span>
                      </div>
                      {user.properties?.length > 0 && (
                        <div className='stat'>
                          <span className='label'>Properties:</span>
                          <span className='value'>
                            {user.properties.length}
                          </span>
                        </div>
                      )}
                      {user.artisanProfile?.isActive && (
                        <div className='stat'>
                          <span className='label'>Jobs Done:</span>
                          <span className='value'>
                            {user.jobsCompleted?.length || 0}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card Actions */}
                  <div className='card-actions'>
                    <button
                      className='btn-action verify'
                      onClick={e => {
                        e.stopPropagation()
                        setSelectedUser(user)
                        setShowVerifyModal(true)
                      }}
                      title={user.isVerified ? 'Unverify' : 'Verify'}
                    >
                      {user.isVerified ? <FiUserCheck /> : <FiUser />}
                    </button>
                    <button
                      className='btn-action edit'
                      onClick={e => {
                        e.stopPropagation()
                        openEditModal(user)
                      }}
                      title='Edit'
                    >
                      <FiEdit2 />
                    </button>
                    <button
                      className='btn-action delete'
                      onClick={e => {
                        e.stopPropagation()
                        setSelectedUser(user)
                        setShowDeleteModal(true)
                      }}
                      title='Delete'
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className='pagination-section'>
          <button
            className='page-btn'
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
          >
            Previous
          </button>
          <div className='page-info'>
            Page {page} of {totalPages} ({filteredUsers.length} users)
          </div>
          <button
            className='page-btn'
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
          >
            Next
          </button>
        </div>
      )}

      {/* User Detail Modal */}
      {showUserDetail && selectedUser && (
        <div className='modal-overlay' onClick={() => setShowUserDetail(false)}>
          <div className='modal modal-large' onClick={e => e.stopPropagation()}>
            <div className='modal-header'>
              <h2>User Details</h2>
              <button
                className='close-btn'
                onClick={() => setShowUserDetail(false)}
              >
                ×
              </button>
            </div>
            <div className='modal-body'>
              {/* User Info Header */}
              <div className='detail-header'>
                <div className='detail-avatar'>
                  <span>
                    {selectedUser.firstName?.[0]}
                    {selectedUser.lastName?.[0]}
                  </span>
                </div>
                <div className='detail-info'>
                  <h3>
                    {selectedUser.firstName} {selectedUser.lastName}
                  </h3>
                  <p>{selectedUser.email}</p>
                  <div className='detail-badges'>
                    <span className='badge-type'>
                      {getUserType(selectedUser)}
                    </span>
                    <span className='badge-role'>{selectedUser.role}</span>
                    <span
                      className={`badge-status ${
                        isUserOnline(selectedUser) ? 'online' : 'offline'
                      }`}
                    >
                      {isUserOnline(selectedUser) ? '🟢 Online' : '⚪ Offline'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Detailed Information */}
              <div className='detail-sections'>
                {/* Personal Info */}
                <div className='detail-section'>
                  <h4>Personal Information</h4>
                  <div className='info-grid'>
                    <div className='info-item'>
                      <label>First Name</label>
                      <p>{selectedUser.firstName}</p>
                    </div>
                    <div className='info-item'>
                      <label>Last Name</label>
                      <p>{selectedUser.lastName}</p>
                    </div>
                    <div className='info-item'>
                      <label>Email</label>
                      <p>{selectedUser.email}</p>
                    </div>
                    <div className='info-item'>
                      <label>Phone</label>
                      <p>{selectedUser.phone || '—'}</p>
                    </div>
                    <div className='info-item'>
                      <label>Role</label>
                      <p className='role-text'>{selectedUser.role}</p>
                    </div>
                    <div className='info-item'>
                      <label>Verification Status</label>
                      <p
                        className={
                          selectedUser.isVerified ? 'verified' : 'unverified'
                        }
                      >
                        {selectedUser.isVerified
                          ? '✓ Verified'
                          : '✗ Unverified'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Activity Information */}
                <div className='detail-section'>
                  <h4>Activity</h4>
                  <div className='info-grid'>
                    <div className='info-item'>
                      <label>Account Created</label>
                      <p>{formatDate(selectedUser.createdAt)}</p>
                    </div>
                    <div className='info-item'>
                      <label>Last Login</label>
                      <p>
                        {formatDate(selectedUser.status?.lastSeen) || 'Never'}
                      </p>
                    </div>
                    <div className='info-item'>
                      <label>Current Status</label>
                      <p>
                        {isUserOnline(selectedUser) ? (
                          <span className='status-online'>🟢 Online</span>
                        ) : (
                          <span className='status-offline'>⚪ Offline</span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Artisan Info (if applicable) */}
                {selectedUser.artisanProfile?.isActive && (
                  <div className='detail-section'>
                    <h4>Artisan Information</h4>
                    <div className='info-grid'>
                      <div className='info-item'>
                        <label>Jobs Completed</label>
                        <p>{selectedUser.jobsCompleted?.length || 0}</p>
                      </div>
                      <div className='info-item'>
                        <label>Services</label>
                        <p>{selectedUser.artisanServices?.length || 0}</p>
                      </div>
                      <div className='info-item'>
                        <label>Rating</label>
                        <p>{selectedUser.stats?.rating?.toFixed(1) || 'N/A'}</p>
                      </div>
                      <div className='info-item'>
                        <label>Profile Status</label>
                        <p>Active</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Property Owner Info (if applicable) */}
                {selectedUser.properties?.length > 0 && (
                  <div className='detail-section'>
                    <h4>Property Ownership</h4>
                    <div className='info-grid'>
                      <div className='info-item'>
                        <label>Properties Listed</label>
                        <p>{selectedUser.properties.length}</p>
                      </div>
                      <div className='info-item'>
                        <label>Maintenance Requests</label>
                        <p>{selectedUser.maintenanceRequests?.length || 0}</p>
                      </div>
                      <div className='info-item'>
                        <label>Favorites</label>
                        <p>{selectedUser.favorites?.length || 0}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Actions */}
            <div className='modal-actions'>
              <button
                className='btn-cancel'
                onClick={() => setShowUserDetail(false)}
              >
                Close
              </button>
              <button
                className='btn-verify'
                onClick={() => {
                  setShowUserDetail(false)
                  setShowVerifyModal(true)
                }}
              >
                {selectedUser.isVerified ? 'Unverify' : 'Verify'}
              </button>
              <button
                className='btn-edit'
                onClick={() => {
                  setShowUserDetail(false)
                  openEditModal(selectedUser)
                }}
              >
                Edit
              </button>
            </div>
          </div>
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
              <div className='form-grid'>
                <div className='form-group'>
                  <label>First Name *</label>
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
                  <label>Last Name *</label>
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
                <label>Email *</label>
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
              <div className='form-grid'>
                <div className='form-group'>
                  <label>Role</label>
                  <select
                    value={formData.role}
                    onChange={e =>
                      setFormData({ ...formData, role: e.target.value })
                    }
                  >
                    <option value='user'>User</option>
                    <option value='artisan'>Artisan</option>
                    <option value='admin'>Admin</option>
                    <option value='SUPER_ADMIN'>Super Admin</option>
                  </select>
                </div>
                <div className='form-group'>
                  <label>Password</label>
                  <input
                    type='password'
                    value={formData.password}
                    onChange={e =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    placeholder='Auto-generate if empty'
                  />
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
              <div className='form-grid'>
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
              <div className='form-group'>
                <label>Role</label>
                <select
                  value={formData.role}
                  onChange={e =>
                    setFormData({ ...formData, role: e.target.value })
                  }
                >
                  <option value='user'>User</option>
                  <option value='artisan'>Artisan</option>
                  <option value='admin'>Admin</option>
                  <option value='SUPER_ADMIN'>Super Admin</option>
                </select>
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

      {/* Delete Modal */}
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
                Are you sure you want to delete{' '}
                <strong>
                  {selectedUser.firstName} {selectedUser.lastName}
                </strong>
                ?
              </p>
              <p className='warning-text'>This action cannot be undone.</p>
            </div>
            <div className='modal-actions'>
              <button
                className='btn-cancel'
                onClick={() => setShowDeleteModal(false)}
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

      {/* Verify Modal */}
      {showVerifyModal && selectedUser && (
        <div
          className='modal-overlay'
          onClick={() => setShowVerifyModal(false)}
        >
          <div className='modal modal-small' onClick={e => e.stopPropagation()}>
            <div className='modal-header'>
              <h2>{selectedUser.isVerified ? 'Unverify' : 'Verify'} User</h2>
              <button
                className='close-btn'
                onClick={() => setShowVerifyModal(false)}
              >
                ×
              </button>
            </div>
            <div className='modal-body'>
              <p>
                {selectedUser.isVerified
                  ? `Are you sure you want to unverify ${selectedUser.firstName} ${selectedUser.lastName}?`
                  : `Are you sure you want to verify ${selectedUser.firstName} ${selectedUser.lastName}?`}
              </p>
            </div>
            <div className='modal-actions'>
              <button
                className='btn-cancel'
                onClick={() => setShowVerifyModal(false)}
              >
                Cancel
              </button>
              <button className='btn-verify' onClick={handleVerifyUser}>
                {selectedUser.isVerified ? 'Unverify' : 'Verify'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default EnhancedUserManagement
