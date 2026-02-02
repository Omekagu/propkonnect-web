'use client'
import React, { useEffect, useState } from 'react'
import axios from 'axios'
import {
  FiTrendingUp,
  FiUsers,
  FiHome,
  FiDollarSign,
  FiTool,
  FiFileText,
  FiMessageSquare,
  FiBell,
  FiX,
  FiEdit,
  FiTrash2,
  FiEye,
  FiSearch,
  FiDownload,
  FiPlus
} from 'react-icons/fi'
import './AdminDashboard.scss'

export default function AdminDashboard () {
  const [user, setUser] = useState(null)
  const [stats, setStats] = useState({})
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  // Data states for different sections
  const [properties, setProperties] = useState([])
  const [users, setUsers] = useState([])
  const [transactions, setTransactions] = useState([])
  const [notifications, setNotifications] = useState([])
  const [messages, setMessages] = useState([])
  const [artisans, setArtisans] = useState([])
  const [serviceRequests, setServiceRequests] = useState([])
  const [bids, setBids] = useState([])

  // Modal states
  const [selectedItem, setSelectedItem] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState('')

  const token =
    typeof window !== 'undefined' ? localStorage.getItem('authToken') : null
  const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL

  useEffect(() => {
    fetchDashboardData()
  }, [])

  useEffect(() => {
    if (activeTab !== 'overview') {
      fetchTabData(activeTab)
    }
  }, [activeTab])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const res = await axios.get(`${API_URL}/api/user/id`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setUser(res.data.user)
      setStats(res.data.stats)
      setProperties(res.data.user?.properties || [])
    } catch (err) {
      console.error('❌ Error fetching dashboard data:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchTabData = async tab => {
    try {
      setLoading(true)
      let endpoint = ''

      switch (tab) {
        case 'users':
          endpoint = '/api/user'
          const usersRes = await axios.get(`${API_URL}${endpoint}`, {
            headers: { Authorization: `Bearer ${token}` }
          })
          setUsers(usersRes.data.users || [])
          break
        case 'transactions':
          endpoint = '/api/transaction/admin/all'
          const transRes = await axios.get(`${API_URL}${endpoint}`, {
            headers: { Authorization: `Bearer ${token}` }
          })
          setTransactions(transRes.data.transactions || [])
          break
        case 'notifications':
          endpoint = '/api/notifications'
          const notifsRes = await axios.get(`${API_URL}${endpoint}`, {
            headers: { Authorization: `Bearer ${token}` }
          })
          setNotifications(notifsRes.data.notifications || [])
          break
        case 'messages':
          endpoint = '/api/messages'
          const msgsRes = await axios.get(`${API_URL}${endpoint}`, {
            headers: { Authorization: `Bearer ${token}` }
          })
          setMessages(msgsRes.data.messages || [])
          break
        case 'artisans':
          endpoint = '/api/artisan'
          const artRes = await axios.get(`${API_URL}${endpoint}`)
          setArtisans(artRes.data.artisans || [])
          break
        case 'services':
          endpoint = '/api/service-requests'
          const servRes = await axios.get(`${API_URL}${endpoint}`, {
            headers: { Authorization: `Bearer ${token}` }
          })
          setServiceRequests(servRes.data.requests || [])
          break
        case 'bids':
          endpoint = '/api/bids'
          const bidsRes = await axios.get(`${API_URL}${endpoint}`, {
            headers: { Authorization: `Bearer ${token}` }
          })
          setBids(bidsRes.data.bids || [])
          break
        case 'properties':
          endpoint = '/api/properties'
          const propsRes = await axios.get(`${API_URL}${endpoint}`)
          setProperties(propsRes.data.properties || [])
          console.log(
            'Fetched properties:',
            propsRes.data.properties || propsRes.data
          )
          break
      }
    } catch (err) {
      console.error(`Error fetching ${tab} data:`, err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id, type) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return

    try {
      let endpoint = ''
      switch (type) {
        case 'property':
          endpoint = `/api/properties/${id}`
          break
        case 'user':
          endpoint = `/api/user/${id}`
          break
        case 'transaction':
          endpoint = `/api/transaction/${id}`
          break
        case 'notification':
          endpoint = `/api/notifications/${id}`
          break
        case 'message':
          endpoint = `/api/messages/${id}`
          break
        case 'artisan':
          endpoint = `/api/artisan/${id}`
          break
        case 'service':
          endpoint = `/api/service-requests/${id}`
          break
        case 'bid':
          endpoint = `/api/bids/${id}`
          break
      }

      await axios.delete(`${API_URL}${endpoint}`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      fetchTabData(activeTab)
      alert('Item deleted successfully')
    } catch (err) {
      console.error('Error deleting item:', err)
      alert('Failed to delete item')
    }
  }

  const handleStatusUpdate = async (id, status, type) => {
    try {
      let endpoint = ''
      switch (type) {
        case 'service':
          endpoint = `/api/service-requests/${id}/status`
          break
        case 'bid':
          endpoint = `/api/bids/${id}/status`
          break
        case 'transaction':
          endpoint = `/api/transaction/${id}/status`
          break
      }

      await axios.patch(
        `${API_URL}${endpoint}`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      fetchTabData(activeTab)
      alert('Status updated successfully')
    } catch (err) {
      console.error('Error updating status:', err)
      alert('Failed to update status')
    }
  }

  const openModal = (item, type) => {
    setSelectedItem(item)
    setModalType(type)
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setSelectedItem(null)
    setModalType('')
  }

  const tabItems = [
    { id: 'overview', label: 'Overview', icon: FiTrendingUp },
    { id: 'properties', label: 'Properties', icon: FiHome },
    { id: 'users', label: 'Users', icon: FiUsers },
    { id: 'transactions', label: 'Transactions', icon: FiDollarSign },
    { id: 'services', label: 'Service Requests', icon: FiTool },
    { id: 'bids', label: 'Bids', icon: FiFileText },
    { id: 'messages', label: 'Messages', icon: FiMessageSquare },
    { id: 'notifications', label: 'Notifications', icon: FiBell }
  ]

  if (loading && !user) {
    return (
      <div className='loader-container'>
        <div className='loader-spinner'></div>
        <p>Loading dashboard...</p>
      </div>
    )
  }

  return (
    <div className='comprehensive-dashboard'>
      {/* Dashboard Header */}
      <div className='dashboard-page-header'>
        <div className='header-content'>
          <div className='header-left'>
            <h1>Dashboard Overview</h1>
            <p>
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>

          <div className='header-actions'>
            <button className='btn-secondary'>
              <FiDownload /> Export
            </button>
            <button className='btn-primary'>
              <FiPlus /> Add New
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <nav className='tab-navigation'>
          {tabItems.map(item => (
            <button
              key={item.id}
              className={`tab-item ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              <item.icon />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className='dashboard-content'>
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className='overview-section'>
            {/* Stats Grid */}
            <div className='stats-grid'>
              <div className='stat-card card-blue'>
                <div className='stat-icon'>
                  <FiHome />
                </div>
                <div className='stat-content'>
                  <h3>{stats.totalProperties || properties.length}</h3>
                  <p>Properties Listed</p>
                  <span className='stat-change positive'>+12% this month</span>
                </div>
              </div>

              <div className='stat-card card-green'>
                <div className='stat-icon'>
                  <FiUsers />
                </div>
                <div className='stat-content'>
                  <h3>{stats.totalUsers || 0}</h3>
                  <p>Registered Users</p>
                  <span className='stat-change positive'>+8% this month</span>
                </div>
              </div>

              <div className='stat-card card-purple'>
                <div className='stat-icon'>
                  <FiDollarSign />
                </div>
                <div className='stat-content'>
                  <h3>{stats.totalTransactions || 0}</h3>
                  <p>Transactions</p>
                  <span className='stat-change positive'>+15% this month</span>
                </div>
              </div>

              <div className='stat-card card-orange'>
                <div className='stat-icon'>
                  <FiTool />
                </div>
                <div className='stat-content'>
                  <h3>{stats.totalServiceRequests || 0}</h3>
                  <p>Service Requests</p>
                  <span className='stat-change'>Active requests</span>
                </div>
              </div>
            </div>

            {/* Recent Properties */}
            <div className='content-section'>
              <div className='section-header'>
                <h2>Recent Properties</h2>
                <button
                  onClick={() => setActiveTab('properties')}
                  className='btn-text'
                >
                  View All →
                </button>
              </div>

              <div className='property-grid'>
                {properties.slice(0, 6).map((p, i) => (
                  <div className='property-card' key={i}>
                    <div className='property-image'>
                      <img
                        src={p.images?.[0] || '/placeholder.jpg'}
                        alt={p.title}
                      />
                      <div className='property-status'>
                        {p.status || 'Active'}
                      </div>
                    </div>
                    <div className='property-info'>
                      <h4>{p.title}</h4>
                      <p className='property-address'>{p.address}</p>
                      <div className='property-price'>
                        ${p.price?.toLocaleString()}
                      </div>
                      <div className='property-meta'>
                        <span>{p.beds} Beds</span>
                        <span>{p.baths} Baths</span>
                        <span>{p.sqft} sqft</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Properties Tab */}
        {activeTab === 'properties' && (
          <div className='data-section'>
            <div className='section-toolbar'>
              <div className='search-box'>
                <FiSearch />
                <input
                  type='text'
                  placeholder='Search properties...'
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
              >
                <option value='all'>All Status</option>
                <option value='active'>Active</option>
                <option value='pending'>Pending</option>
                <option value='sold'>Sold</option>
              </select>
            </div>

            <div className='data-table'>
              <table>
                <thead>
                  <tr>
                    <th>Property</th>
                    <th>Address</th>
                    <th>Price</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {properties.map((prop, i) => (
                    <tr key={i}>
                      <td>
                        <div className='table-property'>
                          <img
                            src={prop.images?.[0] || '/placeholder.jpg'}
                            alt={prop.title}
                          />
                          <span>{prop.title}</span>
                        </div>
                      </td>
                      <td>{prop.address}</td>
                      <td>${prop.price?.toLocaleString()}</td>
                      <td>{prop.type}</td>
                      <td>
                        <span className={`status-badge ${prop.status}`}>
                          {prop.status || 'Active'}
                        </span>
                      </td>
                      <td>
                        <div className='action-buttons'>
                          <button onClick={() => openModal(prop, 'property')}>
                            <FiEye />
                          </button>
                          <button>
                            <FiEdit />
                          </button>
                          <button
                            onClick={() => handleDelete(prop._id, 'property')}
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className='data-section'>
            <div className='section-toolbar'>
              <div className='search-box'>
                <FiSearch />
                <input
                  type='text'
                  placeholder='Search users...'
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
              >
                <option value='all'>All Roles</option>
                <option value='admin'>Admin</option>
                <option value='user'>User</option>
                <option value='artisan'>Artisan</option>
              </select>
            </div>

            <div className='data-table'>
              <table>
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Joined</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u, i) => (
                    <tr key={i}>
                      <td>
                        <div className='table-user'>
                          <div className='user-avatar'>
                            {u.firstName?.[0]}
                            {u.lastName?.[0]}
                          </div>
                          <span>
                            {u.firstName} {u.lastName}
                          </span>
                        </div>
                      </td>
                      <td>{u.email}</td>
                      <td>
                        <span className='role-badge'>{u.role}</span>
                      </td>
                      <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td>
                        <span
                          className={`status-badge ${
                            u.status.online ? 'active' : 'inactive'
                          }`}
                        >
                          {u.status.online ? 'Online' : 'Offline'}
                        </span>
                      </td>
                      <td>
                        <div className='action-buttons'>
                          <button onClick={() => openModal(u, 'user')}>
                            <FiEye />
                          </button>
                          <button>
                            <FiEdit />
                          </button>
                          <button onClick={() => handleDelete(u._id, 'user')}>
                            <FiTrash2 />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Transactions Tab */}
        {activeTab === 'transactions' && (
          <div className='data-section'>
            <div className='section-toolbar'>
              <div className='search-box'>
                <FiSearch />
                <input
                  type='text'
                  placeholder='Search transactions...'
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
              >
                <option value='all'>All Status</option>
                <option value='completed'>Completed</option>
                <option value='pending'>Pending</option>
                <option value='failed'>Failed</option>
              </select>
            </div>

            <div className='data-table'>
              <table>
                <thead>
                  <tr>
                    <th>Transaction ID</th>
                    <th>User</th>
                    <th>Amount</th>
                    <th>Type</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((t, i) => (
                    <tr key={i}>
                      <td>#{t._id?.slice(-8)}</td>
                      <td>{t.userName || 'N/A'}</td>
                      <td className='amount'>${t.amount?.toLocaleString()}</td>
                      <td>{t.type}</td>
                      <td>{new Date(t.createdAt).toLocaleDateString()}</td>
                      <td>
                        <select
                          value={t.status}
                          onChange={e =>
                            handleStatusUpdate(
                              t._id,
                              e.target.value,
                              'transaction'
                            )
                          }
                          className={`status-select ${t.status}`}
                        >
                          <option value='pending'>Pending</option>
                          <option value='completed'>Completed</option>
                          <option value='failed'>Failed</option>
                        </select>
                      </td>
                      <td>
                        <div className='action-buttons'>
                          <button onClick={() => openModal(t, 'transaction')}>
                            <FiEye />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Service Requests Tab */}
        {activeTab === 'services' && (
          <div className='data-section'>
            <div className='section-toolbar'>
              <div className='search-box'>
                <FiSearch />
                <input
                  type='text'
                  placeholder='Search requests...'
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
              >
                <option value='all'>All Status</option>
                <option value='pending'>Pending</option>
                <option value='in-progress'>In Progress</option>
                <option value='completed'>Completed</option>
              </select>
            </div>

            <div className='data-table'>
              <table>
                <thead>
                  <tr>
                    <th>Request ID</th>
                    <th>Client</th>
                    <th>Service Type</th>
                    <th>Budget</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {serviceRequests.map((sr, i) => (
                    <tr key={i}>
                      <td>#{sr._id?.slice(-8)}</td>
                      <td>{sr.clientName || 'N/A'}</td>
                      <td>{sr.serviceType}</td>
                      <td>${sr.budget?.toLocaleString()}</td>
                      <td>{new Date(sr.createdAt).toLocaleDateString()}</td>
                      <td>
                        <select
                          value={sr.status}
                          onChange={e =>
                            handleStatusUpdate(
                              sr._id,
                              e.target.value,
                              'service'
                            )
                          }
                          className={`status-select ${sr.status}`}
                        >
                          <option value='pending'>Pending</option>
                          <option value='in-progress'>In Progress</option>
                          <option value='completed'>Completed</option>
                        </select>
                      </td>
                      <td>
                        <div className='action-buttons'>
                          <button onClick={() => openModal(sr, 'service')}>
                            <FiEye />
                          </button>
                          <button
                            onClick={() => handleDelete(sr._id, 'service')}
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Bids Tab */}
        {activeTab === 'bids' && (
          <div className='data-section'>
            <div className='section-toolbar'>
              <div className='search-box'>
                <FiSearch />
                <input
                  type='text'
                  placeholder='Search bids...'
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
              >
                <option value='all'>All Status</option>
                <option value='pending'>Pending</option>
                <option value='accepted'>Accepted</option>
                <option value='rejected'>Rejected</option>
              </select>
            </div>

            <div className='data-table'>
              <table>
                <thead>
                  <tr>
                    <th>Bid ID</th>
                    <th>Artisan</th>
                    <th>Service Request</th>
                    <th>Amount</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bids.map((bid, i) => (
                    <tr key={i}>
                      <td>#{bid._id?.slice(-8)}</td>
                      <td>{bid.artisanName || 'N/A'}</td>
                      <td>#{bid.serviceRequestId?.slice(-8)}</td>
                      <td className='amount'>
                        ${bid.amount?.toLocaleString()}
                      </td>
                      <td>{new Date(bid.createdAt).toLocaleDateString()}</td>
                      <td>
                        <select
                          value={bid.status}
                          onChange={e =>
                            handleStatusUpdate(bid._id, e.target.value, 'bid')
                          }
                          className={`status-select ${bid.status}`}
                        >
                          <option value='pending'>Pending</option>
                          <option value='accepted'>Accepted</option>
                          <option value='rejected'>Rejected</option>
                        </select>
                      </td>
                      <td>
                        <div className='action-buttons'>
                          <button onClick={() => openModal(bid, 'bid')}>
                            <FiEye />
                          </button>
                          <button onClick={() => handleDelete(bid._id, 'bid')}>
                            <FiTrash2 />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Messages Tab */}
        {activeTab === 'messages' && (
          <div className='data-section'>
            <div className='section-toolbar'>
              <div className='search-box'>
                <FiSearch />
                <input
                  type='text'
                  placeholder='Search messages...'
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className='messages-container'>
              {messages.map((msg, i) => (
                <div className='message-card' key={i}>
                  <div className='message-header'>
                    <div className='message-sender'>
                      <div className='sender-avatar'>{msg.senderName?.[0]}</div>
                      <div>
                        <h4>{msg.senderName}</h4>
                        <p>{new Date(msg.createdAt).toLocaleString()}</p>
                      </div>
                    </div>
                    <button onClick={() => handleDelete(msg._id, 'message')}>
                      <FiTrash2 />
                    </button>
                  </div>
                  <div className='message-content'>{msg.content}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <div className='data-section'>
            <div className='section-toolbar'>
              <div className='search-box'>
                <FiSearch />
                <input
                  type='text'
                  placeholder='Search notifications...'
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
              >
                <option value='all'>All Types</option>
                <option value='system'>System</option>
                <option value='user'>User</option>
                <option value='transaction'>Transaction</option>
              </select>
            </div>

            <div className='notifications-container'>
              {notifications.map((notif, i) => (
                <div
                  className={`notification-card ${
                    notif.read ? 'read' : 'unread'
                  }`}
                  key={i}
                >
                  <div className='notification-icon'>
                    <FiBell />
                  </div>
                  <div className='notification-content'>
                    <h4>{notif.title}</h4>
                    <p>{notif.message}</p>
                    <span className='notification-time'>
                      {new Date(notif.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDelete(notif._id, 'notification')}
                    className='delete-notif'
                  >
                    <FiX />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className='modal-overlay' onClick={closeModal}>
          <div className='modal-content' onClick={e => e.stopPropagation()}>
            <div className='modal-header'>
              <h3>
                {modalType.charAt(0).toUpperCase() + modalType.slice(1)} Details
              </h3>
              <button onClick={closeModal}>
                <FiX />
              </button>
            </div>
            <div className='modal-body'>
              <pre>{JSON.stringify(selectedItem, null, 2)}</pre>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
