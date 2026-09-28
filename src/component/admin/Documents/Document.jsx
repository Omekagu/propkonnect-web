'use client'

import { useState, useEffect } from 'react'
import {
  FileText,
  Search,
  Eye,
  User,
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import axios from 'axios'

const API = process.env.NEXT_PUBLIC_BACKEND_URL

// ── Dark-theme tokens ──────────────────────────────────────────────────────────
const C = {
  bg:       '#0d1117',
  surface:  '#161b22',
  surface2: '#1c2128',
  border:   'rgba(255,255,255,0.08)',
  border2:  'rgba(255,255,255,0.13)',
  text:     '#e6edf3',
  muted:    '#8b949e',
  dim:      '#6e7681',
  accent:   '#C4E53C',
  accentBg: 'rgba(196,229,60,0.1)',
  accentBorder: 'rgba(196,229,60,0.25)',
}

const STATUS_META = {
  active:     { color: '#4ade80', bg: 'rgba(34,197,94,0.12)',   icon: <CheckCircle size={12} /> },
  pending:    { color: '#fbbf24', bg: 'rgba(245,158,11,0.12)',  icon: <Clock size={12} /> },
  signed:     { color: '#60a5fa', bg: 'rgba(59,130,246,0.12)',  icon: <CheckCircle size={12} /> },
  terminated: { color: '#9ca3af', bg: 'rgba(156,163,175,0.1)',  icon: <AlertCircle size={12} /> }
}

// Stat card config
const STAT_CONF = [
  { key: 'total',      label: 'Total',      color: '#60a5fa', bg: 'rgba(59,130,246,0.12)',  icon: size => <FileText size={size} color='#60a5fa' /> },
  { key: 'active',     label: 'Active',     color: '#4ade80', bg: 'rgba(34,197,94,0.12)',   icon: size => <CheckCircle size={size} color='#4ade80' /> },
  { key: 'pending',    label: 'Pending',    color: '#fbbf24', bg: 'rgba(245,158,11,0.12)',  icon: size => <Clock size={size} color='#fbbf24' /> },
  { key: 'terminated', label: 'Terminated', color: '#9ca3af', bg: 'rgba(156,163,175,0.1)', icon: size => <AlertCircle size={size} color='#9ca3af' /> },
]

export default function Document () {
  const { user } = useAuth()
  const [leases, setLeases]         = useState([])
  const [loading, setLoading]       = useState(true)
  const [search, setSearch]         = useState('')
  const [statusFilter, setFilter]   = useState('all')
  const [selected, setSelected]     = useState(null)

  const isTenant = user?.role === 'user' || user?.role === 'tenant'
  const isOwner  = user?.role === 'PROPERTY_OWNER'

  useEffect(() => {
    if (!user) return
    const token = localStorage.getItem('authToken')
    if (!token) return
    const endpoint = isTenant ? `${API}/api/leases/my` : `${API}/api/leases/landlord`
    axios
      .get(endpoint, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => {
        const data = isTenant
          ? res.data?.leases || res.data?.data || (res.data?.lease ? [res.data.lease] : [])
          : res.data?.leases || res.data?.data || []
        setLeases(data)
      })
      .catch(() => setLeases([]))
      .finally(() => setLoading(false))
  }, [user, isTenant])

  const filtered = leases.filter(l => {
    const prop   = l.property || {}
    const tenant = l.tenant   || {}
    const q = search.toLowerCase()
    const matchSearch = !q ||
      (prop.title || '').toLowerCase().includes(q) ||
      [tenant.firstName, tenant.lastName].filter(Boolean).join(' ').toLowerCase().includes(q)
    return matchSearch && (statusFilter === 'all' || l.status === statusFilter)
  })

  const counts = {
    total:      leases.length,
    active:     leases.filter(l => l.status === 'active').length,
    pending:    leases.filter(l => l.status === 'pending' || l.status === 'signed').length,
    terminated: leases.filter(l => l.status === 'terminated').length,
  }

  const fmtDate = d => d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'
  const fmtMoney = n => n ? `₦${Number(n).toLocaleString()}` : '—'

  return (
    <div style={{ padding: '24px 28px', background: C.bg, minHeight: '100%', color: C.text, boxSizing: 'border-box' }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: C.text, margin: '0 0 4px', letterSpacing: '-0.3px' }}>
            {isTenant ? 'My Lease Documents' : isOwner ? 'Lease Agreements' : 'Documents'}
          </h2>
          <p style={{ fontSize: 13, color: C.muted, margin: 0 }}>
            {isTenant ? 'View and manage your rental agreements.' : 'Manage lease agreements with your tenants.'}
          </p>
        </div>
        {/* Search */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 9, padding: '8px 13px', width: 240 }}>
          <Search size={14} color={C.dim} />
          <input
            style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: 13, color: C.text, width: '100%' }}
            placeholder={isTenant ? 'Search property…' : 'Search property, tenant…'}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* ── Stat cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 24 }}>
        {STAT_CONF.map(st => (
          <div key={st.key} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: st.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {st.icon(18)}
            </div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 900, color: C.text, lineHeight: 1 }}>{counts[st.key]}</div>
              <div style={{ fontSize: 11, color: C.muted, marginTop: 3, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{st.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Filter tabs ── */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 20 }}>
        {['all', 'active', 'pending', 'signed', 'terminated'].map(st => {
          const active = statusFilter === st
          return (
            <button
              key={st}
              onClick={() => setFilter(st)}
              style={{
                padding: '6px 16px',
                border: active ? `1px solid ${C.accentBorder}` : `1px solid ${C.border}`,
                borderRadius: 20,
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                background: active ? C.accentBg : 'transparent',
                color: active ? C.accent : C.muted,
                transition: 'all 0.15s',
              }}
            >
              {st.charAt(0).toUpperCase() + st.slice(1)}
            </button>
          )
        })}
      </div>

      {/* ── Content ── */}
      {loading ? (
        <p style={{ color: C.muted, fontSize: 14 }}>Loading documents…</p>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '72px 24px', color: C.muted }}>
          <div style={{ width: 72, height: 72, borderRadius: 20, background: 'rgba(255,255,255,0.04)', border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <FileText size={32} color={C.dim} />
          </div>
          <p style={{ fontSize: 17, fontWeight: 700, color: C.text, margin: '0 0 8px' }}>No documents found</p>
          <p style={{ fontSize: 13, color: C.muted, maxWidth: 320, margin: '0 auto', lineHeight: 1.6 }}>
            {leases.length === 0
              ? isTenant ? 'Your lease agreement will appear here once created.' : 'No lease agreements yet.'
              : 'No documents match your filters.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.map(lease => {
            const prop     = lease.property || {}
            const tenant   = lease.tenant   || {}
            const sm       = STATUS_META[lease.status] || STATUS_META.pending
            return (
              <div
                key={lease._id}
                style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, transition: 'border-color 0.15s' }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = C.border2)}
                onMouseLeave={e => (e.currentTarget.style.borderColor = C.border)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 10, background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <FileText size={20} color='#60a5fa' />
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>
                      Lease Agreement — {prop.title || lease.propertyId || 'Property'}
                    </div>
                    <div style={{ fontSize: 12, color: C.muted, marginTop: 3, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                      {!isTenant && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                          <User size={11} />
                          {[tenant.firstName, tenant.lastName].filter(Boolean).join(' ') || tenant.email || 'Tenant'}
                          <span style={{ opacity: 0.4 }}>·</span>
                        </span>
                      )}
                      <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                        <Calendar size={11} />
                        {fmtDate(lease.startDate)} → {fmtDate(lease.endDate)}
                      </span>
                    </div>
                    {lease.rentAmount && (
                      <div style={{ fontSize: 12, color: C.accent, marginTop: 3, fontWeight: 700 }}>
                        {fmtMoney(lease.rentAmount)} / month
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, color: sm.color, background: sm.bg }}>
                    {sm.icon} {lease.status || 'pending'}
                  </span>
                  <button
                    onClick={() => setSelected(lease)}
                    style={{ padding: '6px 13px', fontSize: 12, fontWeight: 600, border: `1px solid ${C.border}`, borderRadius: 7, cursor: 'pointer', background: C.surface2, color: C.text, display: 'flex', alignItems: 'center', gap: 5, transition: 'border-color 0.15s' }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = C.border2)}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = C.border)}
                  >
                    <Eye size={13} /> View
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── Detail Modal ── */}
      {selected && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 }}
          onClick={() => setSelected(null)}
        >
          <div
            style={{ background: C.surface, border: `1px solid ${C.border2}`, borderRadius: 16, padding: 24, width: '100%', maxWidth: 560, maxHeight: '80vh', overflowY: 'auto', boxShadow: '0 24px 64px rgba(0,0,0,0.5)' }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <div style={{ fontSize: 17, fontWeight: 800, color: C.text }}>{selected.property?.title || 'Property'}</div>
                <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>Lease Details</div>
              </div>
              <button
                onClick={() => setSelected(null)}
                style={{ background: C.surface2, border: `1px solid ${C.border}`, borderRadius: 8, padding: '5px 12px', cursor: 'pointer', fontWeight: 600, fontSize: 12, color: C.muted }}
              >
                Close
              </button>
            </div>

            {[
              ['Lease ID',        selected._id],
              ['Status',          selected.status || '—'],
              ['Start Date',      fmtDate(selected.startDate)],
              ['End Date',        fmtDate(selected.endDate)],
              ['Monthly Rent',    fmtMoney(selected.rentAmount)],
              ['Deposit',         fmtMoney(selected.depositAmount)],
              ['Next Payment',    fmtDate(selected.nextPaymentDate)],
              ...(!isTenant
                ? [
                    ['Tenant', [selected.tenant?.firstName, selected.tenant?.lastName].filter(Boolean).join(' ') || selected.tenant?.email || '—'],
                    ['Tenant Email', selected.tenant?.email || '—'],
                    ['Tenant Phone', selected.tenant?.phone || '—']
                  ]
                : [
                    ['Property Address', [selected.property?.address, selected.property?.city, selected.property?.state].filter(Boolean).join(', ') || '—'],
                    ['Landlord', [selected.landlord?.firstName, selected.landlord?.lastName].filter(Boolean).join(' ') || '—']
                  ]),
              ['Payment Status',  selected.paymentStatus || '—'],
              ['Notes',           selected.notes || '—'],
            ].map(([label, val]) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '9px 0', borderBottom: `1px solid ${C.border}`, gap: 12 }}>
                <span style={{ fontSize: 12, color: C.muted, fontWeight: 600, flexShrink: 0 }}>{label}</span>
                <span style={{ fontSize: 13, color: C.text, textAlign: 'right', wordBreak: 'break-all' }}>{val}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
