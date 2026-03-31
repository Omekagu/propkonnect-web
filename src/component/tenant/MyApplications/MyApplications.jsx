'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  MapPin, Tag, DollarSign, Clock, CheckCircle, XCircle,
  ChevronDown, ChevronUp, MessageSquare, ExternalLink,
  Phone, Mail, User, Building2, CalendarDays, AlertCircle
} from 'lucide-react'
import { properties as propertiesApi } from '@/libs/api'
import './MyApplications.scss'

const STATUS = {
  pending:  { label: 'Pending',  cls: 'pending',  Icon: Clock },
  approved: { label: 'Approved', cls: 'approved', Icon: CheckCircle },
  rejected: { label: 'Rejected', cls: 'rejected', Icon: XCircle }
}

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

function PropertyImage ({ images, title }) {
  const src = images?.[0]?.url || images?.[0] || null
  if (!src) {
    return (
      <div className='ma-img ma-img--placeholder'>
        <Building2 size={28} />
      </div>
    )
  }
  return <img className='ma-img' src={src} alt={title} />
}

function ApplicationCard ({ app, onChat }) {
  const [open, setOpen] = useState(false)
  const property = app.propertyId || {}
  const owner    = property.owner || {}
  const status   = STATUS[app.status] || STATUS.pending
  const StatusIcon = status.Icon

  return (
    <div className={`ma-card${open ? ' ma-card--open' : ''}`}>
      {/* Card header row */}
      <div className='ma-card-head' onClick={() => setOpen(o => !o)} role='button' tabIndex={0}
        onKeyDown={e => e.key === 'Enter' && setOpen(o => !o)}>

        <PropertyImage images={property.images} title={property.title} />

        <div className='ma-card-info'>
          <div className='ma-card-title-row'>
            <h3 className='ma-prop-title'>{property.title || 'Property'}</h3>
            <span className={`ma-status ma-status--${status.cls}`}>
              <StatusIcon size={12} />
              {status.label}
            </span>
          </div>

          <div className='ma-meta'>
            {property.location?.city && (
              <span className='ma-meta-item'>
                <MapPin size={12} />
                {property.location.city}{property.location.state ? `, ${property.location.state}` : ''}
              </span>
            )}
            {property.category && (
              <span className='ma-meta-item'>
                <Tag size={12} />
                {property.category}
              </span>
            )}
            {property.price && (
              <span className='ma-meta-item'>
                <DollarSign size={12} />
                {fmt(property.price)}
              </span>
            )}
            <span className='ma-meta-item'>
              <CalendarDays size={12} />
              Applied {fmtDate(app.appliedAt || app.createdAt)}
            </span>
          </div>

          {app.message && (
            <p className='ma-app-note'>"{app.message}"</p>
          )}
        </div>

        <button className='ma-chevron' aria-label={open ? 'Collapse' : 'Expand'}>
          {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      {/* Expanded detail */}
      {open && (
        <div className='ma-detail'>
          <div className='ma-detail-grid'>
            {/* Owner / Landlord info */}
            <div className='ma-detail-section'>
              <h4 className='ma-detail-heading'>
                <User size={14} />
                Property Owner
              </h4>
              <div className='ma-owner-card'>
                <div className='ma-owner-av'>
                  {owner.avatar
                    ? <img src={owner.avatar} alt={owner.name} />
                    : <span>{(owner.name || 'O').charAt(0).toUpperCase()}</span>
                  }
                </div>
                <div className='ma-owner-info'>
                  <p className='ma-owner-name'>{owner.name || 'Not disclosed'}</p>
                  {owner.contact && (
                    <a className='ma-owner-contact' href={`tel:${owner.contact}`}>
                      <Phone size={12} /> {owner.contact}
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Property details */}
            <div className='ma-detail-section'>
              <h4 className='ma-detail-heading'>
                <Building2 size={14} />
                Property Details
              </h4>
              <ul className='ma-detail-list'>
                {property.location?.address && (
                  <li><MapPin size={12} />{property.location.address}</li>
                )}
                {property.category && (
                  <li><Tag size={12} />{property.category}</li>
                )}
                {property.price && (
                  <li><DollarSign size={12} />{fmt(property.price)}</li>
                )}
              </ul>
            </div>
          </div>

          {/* Application status note */}
          {app.status === 'approved' && (
            <div className='ma-status-note ma-status-note--approved'>
              <CheckCircle size={14} />
              Your application has been approved. Contact the owner to proceed.
            </div>
          )}
          {app.status === 'rejected' && (
            <div className='ma-status-note ma-status-note--rejected'>
              <XCircle size={14} />
              This application was not approved. You can apply to other properties.
            </div>
          )}
          {app.status === 'pending' && (
            <div className='ma-status-note ma-status-note--pending'>
              <AlertCircle size={14} />
              Your application is under review. We&apos;ll notify you when there&apos;s an update.
            </div>
          )}

          {/* Action buttons */}
          <div className='ma-actions'>
            {owner.userId && (
              <button
                className='ma-btn ma-btn--chat'
                onClick={() => onChat(owner.userId, property._id)}
              >
                <MessageSquare size={14} />
                Chat with Owner
              </button>
            )}
            {property._id && (
              <a
                className='ma-btn ma-btn--view'
                href={`/property/${property._id}`}
                target='_blank'
                rel='noopener noreferrer'
              >
                <ExternalLink size={14} />
                View Property
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default function MyApplications ({ onRouteChange }) {
  const [apps, setApps] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState('all')

  const load = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const { data } = await propertiesApi.getMyApplications()
      setApps(data.applications || [])
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to load your applications.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const handleChat = (ownerUserId, propertyId) => {
    sessionStorage.setItem('ep_open_chat_with', String(ownerUserId))
    if (propertyId) sessionStorage.setItem('ep_chat_property_id', String(propertyId))
    if (onRouteChange) {
      onRouteChange('Messages')
    } else {
      localStorage.setItem('ep_activePage', 'Messages')
      window.location.reload()
    }
  }

  const filtered = filter === 'all' ? apps : apps.filter(a => a.status === filter)

  const counts = {
    all:      apps.length,
    pending:  apps.filter(a => a.status === 'pending').length,
    approved: apps.filter(a => a.status === 'approved').length,
    rejected: apps.filter(a => a.status === 'rejected').length
  }

  return (
    <div className='ma-wrap'>
      {/* Header */}
      <div className='ma-head'>
        <div>
          <h1 className='ma-title'>My Applications</h1>
          <p className='ma-subtitle'>Properties you&apos;ve applied for</p>
        </div>
      </div>

      {/* Stats strip */}
      <div className='ma-stats'>
        {[
          { key: 'all',      label: 'Total',    color: 'blue' },
          { key: 'pending',  label: 'Pending',  color: 'warning' },
          { key: 'approved', label: 'Approved', color: 'success' },
          { key: 'rejected', label: 'Rejected', color: 'danger' }
        ].map(({ key, label, color }) => (
          <div key={key} className={`ma-stat ma-stat--${color}`}>
            <span className='ma-stat-num'>{counts[key]}</span>
            <span className='ma-stat-label'>{label}</span>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className='ma-tabs'>
        {['all', 'pending', 'approved', 'rejected'].map(tab => (
          <button
            key={tab}
            className={`ma-tab${filter === tab ? ' active' : ''}`}
            onClick={() => setFilter(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
            <span className='ma-tab-count'>{counts[tab]}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      {loading && (
        <div className='ma-state'>
          <div className='ma-spinner' />
          <span>Loading your applications…</span>
        </div>
      )}

      {!loading && error && (
        <div className='ma-error'>
          <AlertCircle size={18} />
          {error}
          <button className='ma-retry' onClick={load}>Retry</button>
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className='ma-empty'>
          <Building2 size={40} />
          <p>{filter === 'all' ? "You haven't applied to any properties yet." : `No ${filter} applications.`}</p>
          <a className='ma-browse-btn' href='/properties'>Browse Properties</a>
        </div>
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className='ma-list'>
          {filtered.map(app => (
            <ApplicationCard
              key={app._id}
              app={app}
              onChat={handleChat}
            />
          ))}
        </div>
      )}
    </div>
  )
}
