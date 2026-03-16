'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'
import { FileText, Search, Download, Eye, Home, User, Calendar, CheckCircle, Clock, AlertCircle } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

const API = process.env.NEXT_PUBLIC_BACKEND_URL

const STATUS_META = {
  active:     { color: '#16a34a', bg: '#f0fdf4',  icon: <CheckCircle size={12} /> },
  pending:    { color: '#d97706', bg: '#fef3c7',  icon: <Clock size={12} /> },
  signed:     { color: '#2563eb', bg: '#dbeafe',  icon: <CheckCircle size={12} /> },
  terminated: { color: '#6b7280', bg: '#f3f4f6',  icon: <AlertCircle size={12} /> },
}

const s = {
  page: { padding: '1.5rem', fontFamily: 'sans-serif' },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: 10 },
  h2: { fontSize: '1.4rem', fontWeight: 700, color: '#111', margin: 0 },
  searchWrap: { display: 'flex', alignItems: 'center', gap: 8, background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 8, padding: '7px 12px', width: 240 },
  searchInput: { border: 'none', background: 'transparent', outline: 'none', fontSize: 14, color: '#111', width: '100%' },
  statGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem', marginBottom: '1.25rem' },
  statCard: { background: '#fff', borderRadius: 10, padding: '1rem', boxShadow: '0 2px 6px rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', gap: 10 },
  iconBox: (bg) => ({ width: 38, height: 38, borderRadius: 8, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }),
  statVal: { fontWeight: 700, fontSize: '1.1rem', color: '#111' },
  statLbl: { fontSize: 11, color: '#6b7280', marginTop: 1 },
  tabRow: { display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: '1rem' },
  tab: (active) => ({ padding: '6px 14px', border: 'none', borderRadius: 20, fontSize: 13, fontWeight: 600, cursor: 'pointer', background: active ? '#2563eb' : '#f3f4f6', color: active ? '#fff' : '#374151' }),
  list: { display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  card: { background: '#fff', borderRadius: 12, padding: '1rem', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 },
  cardLeft: { display: 'flex', alignItems: 'center', gap: 12 },
  iconWrap: { width: 42, height: 42, borderRadius: 10, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  docTitle: { fontWeight: 600, fontSize: 14, color: '#111' },
  docMeta: { fontSize: 12, color: '#6b7280', marginTop: 3 },
  badge: (color, bg) => ({ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 600, color, background: bg }),
  actions: { display: 'flex', alignItems: 'center', gap: 8 },
  btnView: { padding: '6px 12px', fontSize: 12, fontWeight: 600, border: 'none', borderRadius: 6, cursor: 'pointer', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', gap: 4 },
  empty: { textAlign: 'center', padding: '3rem', color: '#9ca3af', fontSize: 14 },
  detail: { background: '#f9fafb', borderRadius: 10, padding: '1rem', marginTop: '0.75rem', fontSize: 13 },
  detailRow: { display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid #e5e7eb' },
  detailLabel: { color: '#6b7280', fontWeight: 600 },
  modal: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' },
  modalBox: { background: '#fff', borderRadius: 16, padding: '1.5rem', width: '100%', maxWidth: 560, maxHeight: '80vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' },
  modalTitle: { fontSize: '1.1rem', fontWeight: 700, color: '#111', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  closeBtn: { background: '#f3f4f6', border: 'none', borderRadius: 8, padding: '4px 10px', cursor: 'pointer', fontWeight: 600, fontSize: 13, color: '#374151' },
}

export default function Document () {
  const { user } = useAuth()
  const [leases, setLeases] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selected, setSelected] = useState(null)

  const isTenant = user?.role === 'user' || user?.role === 'tenant'
  const isOwner  = user?.role === 'property-owner'

  useEffect(() => {
    if (!user) return
    const token = localStorage.getItem('authToken')
    if (!token) return
    const endpoint = isTenant
      ? `${API}/api/leases/my`
      : `${API}/api/leases/landlord`
    axios.get(endpoint, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => {
        const data = isTenant
          ? (res.data?.leases || res.data?.data || (res.data?.lease ? [res.data.lease] : []))
          : (res.data?.leases || res.data?.data || [])
        setLeases(data)
      })
      .catch(() => setLeases([]))
      .finally(() => setLoading(false))
  }, [user, isTenant])

  const filtered = leases.filter(l => {
    const prop   = l.property || {}
    const tenant = l.tenant   || {}
    const propTitle   = (prop.title || '').toLowerCase()
    const tenantName  = [tenant.firstName, tenant.lastName].filter(Boolean).join(' ').toLowerCase()
    const matchSearch = !search || propTitle.includes(search.toLowerCase()) || tenantName.includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || l.status === statusFilter
    return matchSearch && matchStatus
  })

  const counts = {
    total:      leases.length,
    active:     leases.filter(l => l.status === 'active').length,
    pending:    leases.filter(l => l.status === 'pending' || l.status === 'signed').length,
    terminated: leases.filter(l => l.status === 'terminated').length,
  }

  const statuses = ['all', 'active', 'pending', 'signed', 'terminated']

  return (
    <div style={s.page}>
      <div style={s.header}>
        <h2 style={s.h2}>
          {isTenant ? 'My Lease Documents' : isOwner ? 'Lease Agreements' : 'Documents'}
        </h2>
        <div style={s.searchWrap}>
          <Search size={14} color="#9ca3af" />
          <input
            style={s.searchInput}
            placeholder={isTenant ? 'Search property…' : 'Search property, tenant…'}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div style={s.statGrid}>
        {[
          { label: 'Total',      val: counts.total,      bg: '#eff6ff', icon: <FileText size={18} color="#2563eb" /> },
          { label: 'Active',     val: counts.active,     bg: '#dcfce7', icon: <CheckCircle size={18} color="#16a34a" /> },
          { label: 'Pending',    val: counts.pending,    bg: '#fef3c7', icon: <Clock size={18} color="#d97706" /> },
          { label: 'Terminated', val: counts.terminated, bg: '#f3f4f6', icon: <AlertCircle size={18} color="#6b7280" /> },
        ].map(st => (
          <div key={st.label} style={s.statCard}>
            <div style={s.iconBox(st.bg)}>{st.icon}</div>
            <div>
              <div style={s.statVal}>{st.val}</div>
              <div style={s.statLbl}>{st.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={s.tabRow}>
        {statuses.map(st => (
          <button key={st} style={s.tab(statusFilter === st)} onClick={() => setStatusFilter(st)}>
            {st.charAt(0).toUpperCase() + st.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <p style={{ color: '#6b7280', fontSize: 14 }}>Loading documents…</p>
      ) : filtered.length === 0 ? (
        <div style={s.empty}>
          <FileText size={40} opacity={0.3} style={{ display: 'block', margin: '0 auto 10px' }} />
          <p>
            {leases.length === 0
              ? (isTenant ? 'No lease documents found. Your lease agreement will appear here once created.' : 'No lease documents found.')
              : 'No documents match your filters.'}
          </p>
        </div>
      ) : (
        <div style={s.list}>
          {filtered.map(lease => {
            const prop   = lease.property || {}
            const tenant = lease.tenant   || {}
            const landlord = lease.landlord || {}
            const sm = STATUS_META[lease.status] || STATUS_META.pending
            return (
              <div key={lease._id} style={s.card}>
                <div style={s.cardLeft}>
                  <div style={s.iconWrap}><FileText size={20} color="#2563eb" /></div>
                  <div>
                    <div style={s.docTitle}>
                      Lease Agreement — {prop.title || lease.propertyId || 'Property'}
                    </div>
                    <div style={s.docMeta}>
                      {!isTenant && (
                        <span style={{ marginRight: 8 }}>
                          <User size={11} style={{ marginRight: 3 }} />
                          {[tenant.firstName, tenant.lastName].filter(Boolean).join(' ') || tenant.email || 'Tenant'}
                          {' · '}
                        </span>
                      )}
                      <Calendar size={11} style={{ marginRight: 3 }} />
                      {lease.startDate ? new Date(lease.startDate).toLocaleDateString() : '—'}
                      {' → '}
                      {lease.endDate ? new Date(lease.endDate).toLocaleDateString() : 'ongoing'}
                    </div>
                    {lease.rentAmount && (
                      <div style={{ fontSize: 12, color: '#374151', marginTop: 2, fontWeight: 600 }}>
                        N{Number(lease.rentAmount).toLocaleString()} / month
                      </div>
                    )}
                  </div>
                </div>

                <div style={s.actions}>
                  <span style={s.badge(sm.color, sm.bg)}>
                    {sm.icon} {lease.status || 'pending'}
                  </span>
                  <button style={s.btnView} onClick={() => setSelected(lease)}>
                    <Eye size={13} /> View
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {selected && (
        <div style={s.modal} onClick={() => setSelected(null)}>
          <div style={s.modalBox} onClick={e => e.stopPropagation()}>
            <div style={s.modalTitle}>
              <span>Lease Details</span>
              <button style={s.closeBtn} onClick={() => setSelected(null)}>Close</button>
            </div>

            <div style={{ fontSize: 14, fontWeight: 600, color: '#111', marginBottom: '0.5rem' }}>
              {selected.property?.title || 'Property'}
            </div>

            {[
              ['Lease ID',      selected._id],
              ['Status',        selected.status || '—'],
              ['Start Date',    selected.startDate ? new Date(selected.startDate).toLocaleDateString() : '—'],
              ['End Date',      selected.endDate   ? new Date(selected.endDate).toLocaleDateString()   : 'Ongoing'],
              ['Monthly Rent',  selected.rentAmount ? `N${Number(selected.rentAmount).toLocaleString()}` : '—'],
              ['Deposit',       selected.depositAmount ? `N${Number(selected.depositAmount).toLocaleString()}` : '—'],
              ['Next Payment',  selected.nextPaymentDate ? new Date(selected.nextPaymentDate).toLocaleDateString() : '—'],
              ...(!isTenant ? [
                ['Tenant',    [selected.tenant?.firstName, selected.tenant?.lastName].filter(Boolean).join(' ') || selected.tenant?.email || '—'],
                ['Tenant Email', selected.tenant?.email || '—'],
                ['Tenant Phone', selected.tenant?.phone  || '—'],
              ] : [
                ['Property Address', [selected.property?.address, selected.property?.city, selected.property?.state].filter(Boolean).join(', ') || '—'],
                ['Landlord', [selected.landlord?.firstName, selected.landlord?.lastName].filter(Boolean).join(' ') || '—'],
              ]),
              ['Payment Status', selected.paymentStatus || '—'],
              ['Notes',          selected.notes || '—'],
            ].map(([label, val]) => (
              <div key={label} style={s.detailRow}>
                <span style={s.detailLabel}>{label}</span>
                <span style={{ color: '#111', fontSize: 13 }}>{val}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
