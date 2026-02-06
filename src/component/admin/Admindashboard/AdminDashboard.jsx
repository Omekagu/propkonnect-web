'use client'
import React, { useEffect, useState, useRef } from 'react'
import axios from 'axios'
import {
  FiTrendingUp,
  FiUsers,
  FiHome,
  FiDollarSign,
  FiTool,
  FiDownload,
  FiPlus,
  Fix,
  FiSettings,
  FiEye,
  FiEyeOff,
  FiTrash2,
  FiRefreshCw,
  FiChevronDown,
  FiPieChart,
  FiActivity,
  FiMap,
  FiMessageSquare,
  FiBell,
  FiX
} from 'react-icons/fi'
import './AdminDashboard.scss'

// Available Widget Types
const AVAILABLE_WIDGETS = [
  {
    id: 'properties',
    label: 'Properties',
    icon: FiHome,
    category: 'core',
    description: 'Total properties listed'
  },
  {
    id: 'users',
    label: 'Users',
    icon: FiUsers,
    category: 'core',
    description: 'Registered users'
  },
  {
    id: 'transactions',
    label: 'Transactions',
    icon: FiDollarSign,
    category: 'core',
    description: 'Total transactions'
  },
  {
    id: 'services',
    label: 'Services',
    icon: FiTool,
    category: 'core',
    description: 'Active service requests'
  },
  {
    id: 'chart',
    label: 'Analytics Chart',
    icon: FiPieChart,
    category: 'charts',
    description: 'Revenue trends'
  },
  {
    id: 'pie',
    label: 'Distribution',
    icon: FiPieChart,
    category: 'charts',
    description: 'Data distribution'
  },
  {
    id: 'activity',
    label: 'Activity Feed',
    icon: FiActivity,
    category: 'data',
    description: 'Recent activities'
  },
  {
    id: 'messages',
    label: 'Messages',
    icon: FiMessageSquare,
    category: 'data',
    description: 'User messages'
  },
  {
    id: 'notifications',
    label: 'Notifications',
    icon: FiBell,
    category: 'data',
    description: 'System notifications'
  }
]

// Color configurations for stat cards
const CARD_COLORS = {
  properties: { primary: '#3b82f6', light: '#60a5fa', bg: 'card-blue' },
  users: { primary: '#10b981', light: '#34d399', bg: 'card-green' },
  transactions: { primary: '#8b5cf6', light: '#a78bfa', bg: 'card-purple' },
  services: { primary: '#f59e0b', light: '#fbbf24', bg: 'card-orange' },
  chart: { primary: '#06b6d4', light: '#22d3ee', bg: 'card-cyan' },
  pie: { primary: '#ec4899', light: '#f472b6', bg: 'card-pink' },
  activity: { primary: '#14b8a6', light: '#2dd4bf', bg: 'card-teal' },
  messages: { primary: '#f97316', light: '#fb923c', bg: 'card-orange-light' },
  notifications: { primary: '#6366f1', light: '#818cf8', bg: 'card-indigo' }
}

export default function EnhancedAdminDashboard () {
  const [user, setUser] = useState(null)
  const [stats, setStats] = useState({})
  const [loading, setLoading] = useState(true)
  const [showAddPanel, setShowAddPanel] = useState(false)
  const [showCustomizer, setShowCustomizer] = useState(false)
  const [draggedWidget, setDraggedWidget] = useState(null)
  const [dashboardWidgets, setDashboardWidgets] = useState([
    { id: 'w1', type: 'properties', position: 0, visible: true },
    { id: 'w2', type: 'users', position: 1, visible: true },
    { id: 'w3', type: 'transactions', position: 2, visible: true },
    { id: 'w4', type: 'services', position: 3, visible: true }
  ])
  const [dragOverIndex, setDragOverIndex] = useState(null)
  const dragSource = useRef(null)
  const dropZoneRef = useRef(null)

  const token =
    typeof window !== 'undefined' ? localStorage.getItem('authToken') : null
  const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL

  // Fetch dashboard data
  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const res = await axios.get(`${API_URL}/api/user/id`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setUser(res.data.user)
      setStats(res.data.stats)
    } catch (err) {
      console.error('❌ Error fetching dashboard data:', err)
    } finally {
      setLoading(false)
    }
  }

  // Widget management
  const addWidget = widgetType => {
    const newWidget = {
      id: `w${Date.now()}`,
      type: widgetType,
      position: dashboardWidgets.length,
      visible: true
    }
    setDashboardWidgets([...dashboardWidgets, newWidget])
    setShowAddPanel(false)
  }

  const removeWidget = widgetId => {
    setDashboardWidgets(dashboardWidgets.filter(w => w.id !== widgetId))
  }

  const toggleWidgetVisibility = widgetId => {
    setDashboardWidgets(
      dashboardWidgets.map(w =>
        w.id === widgetId ? { ...w, visible: !w.visible } : w
      )
    )
  }

  // Drag and drop handlers
  const handleDragStart = (e, index) => {
    dragSource.current = index
    setDraggedWidget(index)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e, index) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverIndex(index)
  }

  const handleDrop = (e, dropIndex) => {
    e.preventDefault()
    const dragIndex = dragSource.current

    if (dragIndex !== null && dragIndex !== dropIndex) {
      const newWidgets = [...dashboardWidgets]
      const draggedItem = newWidgets[dragIndex]

      // Remove from old position
      newWidgets.splice(dragIndex, 1)
      // Insert at new position
      newWidgets.splice(dropIndex, 0, draggedItem)

      // Update positions
      newWidgets.forEach((w, i) => (w.position = i))
      setDashboardWidgets(newWidgets)
    }

    setDraggedWidget(null)
    setDragOverIndex(null)
  }

  const handleDragEnd = () => {
    setDraggedWidget(null)
    setDragOverIndex(null)
    dragSource.current = null
  }

  // Render stat card widget
  const StatCard = ({ widget, data, colorConfig }) => (
    <div
      key={widget.id}
      className={`admin-stat-card ${colorConfig.bg} draggable-widget`}
      draggable
      onDragStart={e => handleDragStart(e, dashboardWidgets.indexOf(widget))}
      onDragOver={e => handleDragOver(e, dashboardWidgets.indexOf(widget))}
      onDrop={e => handleDrop(e, dashboardWidgets.indexOf(widget))}
      onDragEnd={handleDragEnd}
      style={{
        opacity: draggedWidget === dashboardWidgets.indexOf(widget) ? 0.5 : 1
      }}
    >
      <div className='widget-header'>
        <div className='grip-handle'>
          <FiX />
        </div>
        <div className='widget-actions'>
          <button
            className='action-btn'
            onClick={() => toggleWidgetVisibility(widget.id)}
            title='Toggle visibility'
          >
            {widget.visible ? <FiEye /> : <FiEyeOff />}
          </button>
          <button
            className='action-btn delete'
            onClick={() => removeWidget(widget.id)}
            title='Remove widget'
          >
            <FiX />
          </button>
        </div>
      </div>

      {widget.visible && (
        <div className='stat-icon'>{data.icon && <data.icon />}</div>
      )}

      {widget.visible && (
        <div className='stat-content'>
          <h3>{data.value}</h3>
          <p>{data.label}</p>
          <span className={`stat-change ${data.change > 0 ? 'positive' : ''}`}>
            {data.change > 0 ? '+' : ''}
            {data.change}% this month
          </span>
        </div>
      )}
    </div>
  )

  // Get widget data
  const getWidgetData = type => {
    const widgetDataMap = {
      properties: {
        icon: FiHome,
        value: stats.totalProperties || 0,
        label: 'Properties Listed',
        change: 12
      },
      users: {
        icon: FiUsers,
        value: stats.totalUsers || 0,
        label: 'Registered Users',
        change: 8
      },
      transactions: {
        icon: FiDollarSign,
        value: stats.totalTransactions || 0,
        label: 'Transactions',
        change: 15
      },
      services: {
        icon: FiTool,
        value: stats.totalServiceRequests || 0,
        label: 'Service Requests',
        change: 5
      },
      chart: {
        icon: FiPieChart,
        value: '₦2.4M',
        label: 'Revenue Trend',
        change: 18
      },
      pie: {
        icon: FiPieChart,
        value: '12K',
        label: 'Data Points',
        change: 22
      },
      activity: {
        icon: FiActivity,
        value: '348',
        label: 'Active Sessions',
        change: 11
      },
      messages: {
        icon: FiMessageSquare,
        value: stats.totalMessages || '156',
        label: 'Messages',
        change: 9
      },
      notifications: {
        icon: FiBell,
        value: stats.totalNotifications || '42',
        label: 'Notifications',
        change: 7
      }
    }
    return widgetDataMap[type] || widgetDataMap.properties
  }

  if (loading && !user) {
    return (
      <div className='loader-container'>
        <div className='loader-spinner'></div>
        <p>Loading dashboard...</p>
      </div>
    )
  }

  const visibleWidgets = dashboardWidgets.filter(w => w.visible)

  return (
    <div className='enhanced-admin-dashboard'>
      {/* Header */}
      <div className='dashboard-header'>
        <div className='header-left'>
          <div className='header-content'>
            <h1>Dashboard</h1>
            <p className='header-date'>
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
        </div>

        <div className='header-actions'>
          <button
            className='btn-icon'
            onClick={() => setShowCustomizer(!showCustomizer)}
            title='Customize dashboard'
          >
            <FiSettings />
          </button>
          <button className='btn-secondary'>
            <FiDownload /> Export
          </button>
          <button
            className='btn-primary'
            onClick={() => setShowAddPanel(!showAddPanel)}
          >
            <FiPlus /> Add Widget
          </button>
        </div>
      </div>

      {/* Customizer Panel */}
      {showCustomizer && (
        <div className='customizer-panel'>
          <div className='customizer-header'>
            <h3>Dashboard Customizer</h3>
            <button
              className='close-btn'
              onClick={() => setShowCustomizer(false)}
            >
              <FiX />
            </button>
          </div>
          <div className='customizer-content'>
            <div className='widget-list'>
              {dashboardWidgets.map((widget, idx) => (
                <div key={widget.id} className='widget-item'>
                  <div className='widget-info'>
                    <span className='widget-name'>
                      {AVAILABLE_WIDGETS.find(w => w.id === widget.type)
                        ?.label || widget.type}
                    </span>
                    <span className='widget-pos'>Position {idx + 1}</span>
                  </div>
                  <div className='widget-controls'>
                    <button
                      className='toggle-btn'
                      onClick={() => toggleWidgetVisibility(widget.id)}
                    >
                      {widget.visible ? <FiEye /> : <FiEyeOff />}
                    </button>
                    <button
                      className='remove-btn'
                      onClick={() => removeWidget(widget.id)}
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Add Widget Panel */}
      {showAddPanel && (
        <div className='add-panel'>
          <div className='add-panel-header'>
            <h3>Add Widgets</h3>
            <button
              className='close-btn'
              onClick={() => setShowAddPanel(false)}
            >
              <FiX />
            </button>
          </div>

          <div className='add-panel-content'>
            {['core', 'charts', 'data'].map(category => (
              <div key={category} className='widget-category'>
                <h4 className='category-title'>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </h4>
                <div className='widget-grid'>
                  {AVAILABLE_WIDGETS.filter(w => w.category === category).map(
                    widget => (
                      <button
                        key={widget.id}
                        className='widget-option'
                        onClick={() => addWidget(widget.id)}
                        title={widget.description}
                      >
                        <widget.icon />
                        <span>{widget.label}</span>
                      </button>
                    )
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Dashboard Grid */}
      <div className='dashboard-grid'>
        {visibleWidgets.map(widget => {
          const data = getWidgetData(widget.type)
          const colorConfig = CARD_COLORS[widget.type] || CARD_COLORS.properties

          return (
            <div
              key={widget.id}
              className={`grid-item ${
                dragOverIndex === dashboardWidgets.indexOf(widget)
                  ? 'drag-over'
                  : ''
              }`}
            >
              <StatCard widget={widget} data={data} colorConfig={colorConfig} />
            </div>
          )
        })}
      </div>

      {/* Empty State */}
      {visibleWidgets.length === 0 && (
        <div className='empty-state'>
          <FiPlus />
          <h3>No widgets added</h3>
          <p>Click "Add Widget" to get started</p>
        </div>
      )}
    </div>
  )
}
