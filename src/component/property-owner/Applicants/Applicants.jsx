'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Building2, MapPin, Users, ChevronLeft, ChevronDown, ChevronUp,
  CheckCircle, XCircle, Clock, MessageSquare, Phone, Mail,
  ShieldCheck, ShieldAlert, ShieldOff, Star, CalendarDays,
  Search, AlertCircle, ExternalLink, Tag, DollarSign
} from 'lucide-react'
import { properties as propertiesApi } from '@/libs/api'
import './Applicants.scss'

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmt (n) {
  if (!n) return '—'
  if (n >= 1_000_000) return `₦${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `₦${(n / 1_000).toFixed(0)}K`
  return `₦${Number(n).toLocaleString()}`
}
function fmtDate (d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

const APP_STATUS = {
  pending:  { label: 'Pending',  cls: 'pending',  Icon: Clock },
  approved: { label: 'Approved', cls: 'approved', Icon: CheckCircle },
  rejected: { label: 'Rejected', cls: 'rejected', Icon: XCircle }
}

function KycBadge ({ status }) {
  if (!status || status === 'not_submitted') {
    return <span className='ap-kyc ap-kyc--none'><ShieldOff size={11} /> No KYC</span>
  }
  if (status === 'approved') {
    return <span className='ap-kyc ap-kyc--verified'><ShieldCheck size={11} /> Verified</span>
  }
  return <span className='ap-kyc ap-kyc--pending'><ShieldAlert size={11} /> KYC Pending</span>
}

function Avatar ({ user }) {
  const initial = (user?.name || user?.email || 'A').charAt(0).toUpperCase()
  if (user?.avatar) {
    return <img className='ap-av' src={user.avatar} alt={user.name} />
  }
  return <div className='ap-av ap-av--initials'>{initial}</div>
}

// ── Property card (grid view) ─────────────────────────────────────────────────
function PropertyCard ({ property, count, onClick }) {
  const img = property.images?.[0]?.url || property.images?.[0] || null
  return (
    <div className='ap-prop-card' onClick={onClick} role='button' tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onClick()}>
      <div className='ap-prop-img-wrap'>
        {img
          ? <img className='ap-prop-img' src={img} alt={property.title} />
          : <div className='ap-prop-img ap-prop-img--placeholder'><Building2 size={28} /></div>
        }
        <span className='ap-prop-badge'>{count} applicant{count !== 1 ? 's' : ''}</span>
      </div>
      <div className='ap-prop-body'>
        <h3 className='ap-prop-title'>{property.title}</h3>
        <div className='ap-prop-meta'>
          {property.location?.city && (
            <span><MapPin size={11} />{property.location.city}</span>
          )}
          {property.category && (
            <span><Tag size={11} />{property.category}</span>
          )}
          {property.price && (
            <span><DollarSign size={11} />{fmt(property.price)}</span>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Applicant row (detail view) ───────────────────────────────────────────────
function ApplicantCard ({ app, onChat, onStatusChange, updating }) {
  const [expanded, setExpanded] = useState(false)
  const user = app.userId || {}
  const status = APP_STATUS[app.status] || APP_STATUS.pending
  const StatusIcon = status.Icon

  return (
    <div className={`ap-app-card${expanded ? ' ap-app-card--open' : ''}`}>
      <div className='ap-app-head' onClick={() => setExpanded(o => !o)}
        role='button' tabIndex={0}
        onKeyDown={e => e.key === 'Enter' && setExpanded(o => !o)}>

        <Avatar user={user} />

        <div className='ap-app-info'>
          <div className='ap-app-name-row'>
            <span className='ap-app-name'>{user.name || 'Applicant'}</span>
            <KycBadge status={user.kyc?.status} />
            <span className={`ap-status ap-status--${status.cls}`}>
              <StatusIcon size={11} />{status.label}
            </span>
          </div>
          <div className='ap-app-meta'>
            {user.email && (
              <span className='ap-app-meta-item'>
                <Mail size={11} />{user.email}
              </span>
            )}
            {user.phone && (
              <span className='ap-app-meta-item'>
                <Phone size={11} />{user.phone}
              </span>
            )}
            <span className='ap-app-meta-item'>
              <CalendarDays size={11} />Applied {fmtDate(app.appliedAt || app.createdAt)}
            </span>
          </div>
        </div>

        <div className='ap-app-quick'>
          {user._id && (
            <button className='ap-quick-chat' title='Chat with applicant'
              onClick={e => { e.stopPropagation(); onChat(user._id) }}>
              <MessageSquare size={14} />
            </button>
          )}
          <button className='ap-chevron' aria-label={expanded ? 'Collapse' : 'Expand'}>
            {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </button>
        </div>
      </div>

      {expanded && (
        <div className='ap-app-detail'>
          {app.message && (
            <div className='ap-app-message'>
              <p className='ap-detail-label'>Applicant&apos;s Message</p>
              <blockquote className='ap-app-quote'>{app.message}</blockquote>
            </div>
          )}

          <div className='ap-detail-grid'>
            <div className='ap-detail-col'>
              <p className='ap-detail-label'>Contact</p>
              <ul className='ap-detail-list'>
                {user.email && (
                  <li><Mail size={12} />
                    <a href={`mailto:${user.email}`} className='ap-link'>{user.email}</a>
                  </li>
                )}
                {user.phone && (
                  <li><Phone size={12} />
                    <a href={`tel:${user.phone}`} className='ap-link'>{user.phone}</a>
                  </li>
                )}
              </ul>
            </div>
            <div className='ap-detail-col'>
              <p className='ap-detail-label'>KYC Status</p>
              <KycBadge status={user.kyc?.status} />
            </div>
          </div>

          <div className='ap-app-actions'>
            {user._id && (
              <button className='ap-btn ap-btn--chat'
                onClick={() => onChat(user._id)}>
                <MessageSquare size={14} />Chat with Applicant
              </button>
            )}
            {app.status !== 'approved' && (
              <button
                className='ap-btn ap-btn--approve'
                disabled={updating === app._id}
                onClick={() => onStatusChange(app._id, 'approved')}
              >
                <CheckCircle size={14} />
                {updating === app._id ? 'Saving…' : 'Approve'}
              </button>
            )}
            {app.status !== 'rejected' && (
              <button
                className='ap-btn ap-btn--reject'
                disabled={updating === app._id}
                onClick={() => onStatusChange(app._id, 'rejected')}
              >
                <XCircle size={14} />
                {updating === app._id ? 'Saving…' : 'Reject'}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export default function Applicants ({ onRouteChange }) {
  const [properties, setProperties] = useState([])
  const [appsByProp, setAppsByProp] = useState({}) // { [propertyId]: apps[] }
  const [selected, setSelected] = useState(null)   // selected property object
  const [loading, setLoading] = useState(true)
  const [appsLoading, setAppsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [updating, setUpdating] = useState(null)    // application id being updated
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [toast, setToast] = useState(null)

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  // Load all properties
  const loadProperties = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const { data } = await propertiesApi.getMine()
      const list = data.properties || data.data || []
      setProperties(list)

      // Pre-load application counts for all properties using batch
      if (list.length > 0) {
        try {
          const ids = list.map(p => p._id)
          const { data: batchData } = await propertiesApi.getApplicationsBatch({ propertyIds: ids })
          const map = {}
          ;(batchData.applications || []).forEach(app => {
            const pid = app.propertyId?._id || app.propertyId
            if (pid) {
              if (!map[pid]) map[pid] = []
              map[pid].push(app)
            }
          })
          setAppsByProp(map)
        } catch {
          // Batch failed — counts will show 0, still usable
        }
      }
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to load properties.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadProperties() }, [loadProperties])

  // Load applicants for a selected property
  const selectProperty = async (property) => {
    setSelected(property)
    setSearch('')
    setStatusFilter('all')
    if (appsByProp[property._id]) return // already loaded
    try {
      setAppsLoading(true)
      const { data } = await propertiesApi.getApplicationsByProperty(property._id)
      setAppsByProp(prev => ({ ...prev, [property._id]: data.applications || [] }))
    } catch (e) {
      showToast(e.response?.data?.message || 'Failed to load applicants.', 'error')
    } finally {
      setAppsLoading(false)
    }
  }

  // Update application status
  const handleStatusChange = async (appId, newStatus) => {
    setUpdating(appId)
    try {
      const { data } = await propertiesApi.updateApplication(appId, { status: newStatus })
      const updated = data.application
      setAppsByProp(prev => {
        const pid = selected._id
        return {
          ...prev,
          [pid]: (prev[pid] || []).map(a => a._id === appId ? { ...a, ...updated } : a)
        }
      })
      showToast(`Application ${newStatus === 'approved' ? 'approved' : 'rejected'} successfully.`)
    } catch (e) {
      showToast(e.response?.data?.message || 'Failed to update application.', 'error')
    } finally {
      setUpdating(null)
    }
  }

  // Chat with applicant
  const handleChat = (userId) => {
    sessionStorage.setItem('ep_open_chat_with', String(userId))
    if (onRouteChange) {
      onRouteChange('Messages')
    } else {
      localStorage.setItem('ep_activePage', 'Messages')
      window.location.reload()
    }
  }

  // Derived data for detail view
  const currentApps = selected ? (appsByProp[selected._id] || []) : []
  const filteredApps = currentApps.filter(app => {
    const user = app.userId || {}
    const matchSearch = !search ||
      (user.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (user.email || '').toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || app.status === statusFilter
    return matchSearch && matchStatus
  })

  const counts = {
    all:      currentApps.length,
    pending:  currentApps.filter(a => a.status === 'pending').length,
    approved: currentApps.filter(a => a.status === 'approved').length,
    rejected: currentApps.filter(a => a.status === 'rejected').length
  }

  const totalApps = properties.reduce((sum, p) => sum + (appsByProp[p._id]?.length || 0), 0)

  return (
    <div className='ap-wrap'>
      {/* Toast */}
      {toast && (
        <div className={`ap-toast ap-toast--${toast.type}`}>{toast.msg}</div>
      )}

      {/* Header */}
      <div className='ap-head'>
        {selected ? (
          <button className='ap-back' onClick={() => setSelected(null)}>
            <ChevronLeft size={16} />
            All Properties
          </button>
        ) : (
          <div>
            <h1 className='ap-title'>Applicants</h1>
            <p className='ap-subtitle'>
              {properties.length} propert{properties.length !== 1 ? 'ies' : 'y'} · {totalApps} total applicant{totalApps !== 1 ? 's' : ''}
            </p>
          </div>
        )}
      </div>

      {/* ── PROPERTY GRID VIEW ──────────────────────────────────────────────── */}
      {!selected && (
        <>
          {loading && (
            <div className='ap-state'>
              <div className='ap-spinner' />
              <span>Loading your properties…</span>
            </div>
          )}

          {!loading && error && (
            <div className='ap-error'>
              <AlertCircle size={16} /> {error}
              <button className='ap-retry' onClick={loadProperties}>Retry</button>
            </div>
          )}

          {!loading && !error && properties.length === 0 && (
            <div className='ap-empty'>
              <Building2 size={44} />
              <p>You haven&apos;t listed any properties yet.</p>
            </div>
          )}

          {!loading && !error && properties.length > 0 && (
            <div className='ap-prop-grid'>
              {properties.map(p => (
                <PropertyCard
                  key={p._id}
                  property={p}
                  count={appsByProp[p._id]?.length || 0}
                  onClick={() => selectProperty(p)}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* ── APPLICANT DETAIL VIEW ───────────────────────────────────────────── */}
      {selected && (
        <>
          {/* Selected property summary */}
          <div className='ap-selected-prop'>
            <Building2 size={16} />
            <span className='ap-selected-name'>{selected.title}</span>
            {selected.location?.city && (
              <span className='ap-selected-loc'>
                <MapPin size={12} />{selected.location.city}
              </span>
            )}
          </div>

          {/* Stats row */}
          <div className='ap-app-stats'>
            {[
              { key: 'all',      label: 'Total',    color: 'blue' },
              { key: 'pending',  label: 'Pending',  color: 'warning' },
              { key: 'approved', label: 'Approved', color: 'success' },
              { key: 'rejected', label: 'Rejected', color: 'danger' }
            ].map(({ key, label, color }) => (
              <div key={key} className={`ap-stat ap-stat--${color}`}>
                <span className='ap-stat-num'>{counts[key]}</span>
                <span className='ap-stat-label'>{label}</span>
              </div>
            ))}
          </div>

          {/* Toolbar */}
          <div className='ap-toolbar'>
            <div className='ap-search-wrap'>
              <Search size={14} className='ap-search-icon' />
              <input
                className='ap-search'
                placeholder='Search by name or email…'
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>

            <div className='ap-status-tabs'>
              {['all', 'pending', 'approved', 'rejected'].map(tab => (
                <button
                  key={tab}
                  className={`ap-tab${statusFilter === tab ? ' active' : ''}`}
                  onClick={() => setStatusFilter(tab)}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  <span className='ap-tab-count'>{counts[tab]}</span>
                </button>
              ))}
            </div>
          </div>

          {appsLoading && (
            <div className='ap-state'>
              <div className='ap-spinner' />
              <span>Loading applicants…</span>
            </div>
          )}

          {!appsLoading && currentApps.length === 0 && (
            <div className='ap-empty'>
              <Users size={40} />
              <p>No applications for this property yet.</p>
            </div>
          )}

          {!appsLoading && filteredApps.length === 0 && currentApps.length > 0 && (
            <div className='ap-empty'>
              <Search size={32} />
              <p>No applicants match your search or filter.</p>
            </div>
          )}

          {!appsLoading && filteredApps.length > 0 && (
            <div className='ap-app-list'>
              {filteredApps.map(app => (
                <ApplicantCard
                  key={app._id}
                  app={app}
                  onChat={handleChat}
                  onStatusChange={handleStatusChange}
                  updating={updating}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
