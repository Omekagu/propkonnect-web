'use client'
import React, { useState, useEffect } from 'react'
import { users as usersApi, kyc as kycApi } from '@/libs/api'
import {
  Search, RefreshCw, Plus, Edit2, Trash2, CheckCircle,
  XCircle, Eye, UserCheck, User, ArrowUp, ArrowDown,
  Users, Activity, Shield, Wrench, Home, ChevronLeft, ChevronRight, X,
  ScanFace, FileText, Camera, KeyRound
} from 'lucide-react'
import './UserManagement.scss'

// ── helpers ───────────────────────────────────────────────────────────────────

const roleBadgeClass = role => {
  if (!role) return 'role-user'
  const r = role.toLowerCase()
  if (r.includes('super')) return 'role-super'
  if (r.includes('admin')) return 'role-admin'
  if (r === 'property-owner' || r === 'property_owner') return 'role-owner'
  if (r === 'artisan') return 'role-artisan'
  return 'role-user'
}

const roleLabel = role => {
  if (!role) return 'User'
  return role.replace(/_/g, ' ').replace(/-/g, ' ')
    .split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

const isOnline = user => {
  if (!user.status?.lastSeen) return false
  return Date.now() - new Date(user.status.lastSeen).getTime() < 5 * 60 * 1000
}

const timeAgo = date => {
  if (!date) return 'Never'
  const s = Math.floor((Date.now() - new Date(date)) / 1000)
  if (s < 60) return 'Just now'
  if (s < 3600) return `${Math.floor(s / 60)}m ago`
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`
  if (s < 604800) return `${Math.floor(s / 86400)}d ago`
  return new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

const fmtDate = d =>
  d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'

function Avatar ({ user, size = 38 }) {
  const online = isOnline(user)
  const initials = `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`
  return (
    <div className='um-avatar' style={{ width: size, height: size, fontSize: size * 0.36 }}>
      {user.avatar ? <img src={user.avatar} alt='' /> : initials || '?'}
      <span className={`um-online-dot ${online ? '' : 'offline'}`} />
    </div>
  )
}

// ── main component ────────────────────────────────────────────────────────────
export default function UserManagement () {
  const [users, setUsers]       = useState([])
  const [filtered, setFiltered] = useState([])
  const [stats, setStats]       = useState(null)
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)
  const [refreshing, setRefreshing] = useState(false)

  // filters
  const [search, setSearch]           = useState('')
  const [roleFilter, setRoleFilter]   = useState('all')
  const [statusFilter, setStatus]     = useState('all')
  const [verifyFilter, setVerify]     = useState('all')
  const [sortBy, setSortBy]           = useState('createdAt')
  const [sortDir, setSortDir]         = useState('desc')

  // pagination
  const PER_PAGE = 15
  const [page, setPage] = useState(1)

  // selection
  const [selected, setSelected]   = useState([])

  // modals
  const [detailUser, setDetailUser]   = useState(null)
  const [editUser, setEditUser]       = useState(null)
  const [deleteUser, setDeleteUser]   = useState(null)
  const [verifyUser, setVerifyUser]   = useState(null)
  const [showCreate, setShowCreate]   = useState(false)

  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', role: 'user', password: '' })

  // reset password
  const [resetPwUser, setResetPwUser] = useState(null)
  const [resetPwForm, setResetPwForm] = useState({ newPassword: '', confirmPassword: '' })
  const [resetPwLoading, setResetPwLoading] = useState(false)
  const [resetPwError, setResetPwError]     = useState(null)

  // KYC inline review
  const [kycUser, setKycUser]         = useState(null)
  const [kycDetail, setKycDetail]     = useState(null)
  const [kycLoading, setKycLoading]   = useState(false)
  const [kycReason, setKycReason]     = useState('')
  const [kycNote, setKycNote]         = useState('')
  const [kycActing, setKycActing]     = useState(false)
  const [kycToast, setKycToast]       = useState(null)

  // ── fetch ──────────────────────────────────────────────────────────────────
  const fetchUsers = async (silent = false) => {
    try {
      if (!silent) setLoading(true)
      else setRefreshing(true)
      const res = await usersApi.getAll({ limit: 5000 })
      const allUsers = res.data.users || []
      setUsers(allUsers)

      // Map backend stats shape → component stats shape
      const rs = res.data.stats?.roleStats || {}
      const vs = res.data.stats?.verificationStats || {}
      setStats({
        totalUsers:     allUsers.length,
        activeUsers:    allUsers.filter(u => isOnline(u)).length,
        verifiedUsers:  vs.verified || 0,
        artisans:       rs.artisan  || 0,
        propertyOwners: rs['property-owner'] || 0
      })
      setError(null)
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to load users')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => { fetchUsers() }, [])

  // ── filter + sort ──────────────────────────────────────────────────────────
  useEffect(() => {
    let r = [...users]

    if (search) {
      const q = search.toLowerCase()
      r = r.filter(u =>
        `${u.firstName} ${u.lastName}`.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.phone?.includes(q)
      )
    }
    if (roleFilter !== 'all') r = r.filter(u => u.role === roleFilter)
    if (statusFilter === 'online')   r = r.filter(u => isOnline(u))
    if (statusFilter === 'offline')  r = r.filter(u => !isOnline(u))
    if (verifyFilter === 'verified')   r = r.filter(u => u.isVerified)
    if (verifyFilter === 'unverified') r = r.filter(u => !u.isVerified)

    r.sort((a, b) => {
      let av = sortBy === 'name' ? `${a.firstName} ${a.lastName}` : a[sortBy]
      let bv = sortBy === 'name' ? `${b.firstName} ${b.lastName}` : b[sortBy]
      if (typeof av === 'string') { av = av.toLowerCase(); bv = bv?.toLowerCase() || '' }
      if (av < bv) return sortDir === 'asc' ? -1 : 1
      if (av > bv) return sortDir === 'asc' ? 1 : -1
      return 0
    })

    setFiltered(r)
    setPage(1)
  }, [users, search, roleFilter, statusFilter, verifyFilter, sortBy, sortDir])

  const totalPages  = Math.ceil(filtered.length / PER_PAGE)
  const paginated   = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  // ── actions ────────────────────────────────────────────────────────────────
  const resetForm = () => setForm({ firstName: '', lastName: '', email: '', phone: '', role: 'user', password: '' })

  const doCreate = async e => {
    e.preventDefault()
    try { await usersApi.create(form); setShowCreate(false); resetForm(); fetchUsers(true) }
    catch (e) { alert(e.response?.data?.message || 'Failed') }
  }

  const doEdit = async e => {
    e.preventDefault()
    try {
      await usersApi.update(editUser._id, form)
      if (form.role !== editUser.role) await usersApi.changeRole(editUser._id, form.role)
      setEditUser(null); resetForm(); fetchUsers(true)
    } catch (e) { alert(e.response?.data?.message || 'Failed') }
  }

  const doDelete = async () => {
    try { await usersApi.remove(deleteUser._id); setDeleteUser(null); fetchUsers(true) }
    catch (e) { alert(e.response?.data?.message || 'Failed') }
  }

  const doVerify = async () => {
    try { await usersApi.verify(verifyUser._id, { isVerified: !verifyUser.isVerified }); setVerifyUser(null); fetchUsers(true) }
    catch (e) { alert(e.response?.data?.message || 'Failed') }
  }

  const openResetPw = user => {
    setResetPwForm({ newPassword: '', confirmPassword: '' })
    setResetPwError(null)
    setResetPwUser(user)
  }

  const doResetPassword = async e => {
    e.preventDefault()
    if (resetPwForm.newPassword.length < 8) {
      setResetPwError('Password must be at least 8 characters.')
      return
    }
    if (resetPwForm.newPassword !== resetPwForm.confirmPassword) {
      setResetPwError('Passwords do not match.')
      return
    }
    setResetPwLoading(true)
    setResetPwError(null)
    try {
      await usersApi.adminResetPassword(resetPwUser._id, { new_password: resetPwForm.newPassword })
      setResetPwUser(null)
    } catch (err) {
      setResetPwError(err.response?.data?.message || 'Failed to reset password.')
    } finally {
      setResetPwLoading(false)
    }
  }

  const openKycReview = async user => {
    setKycUser(user)
    setKycReason('')
    setKycNote('')
    setKycDetail(null)
    setKycLoading(true)
    try {
      const res = await kycApi.adminGetDetail(user._id)
      setKycDetail(res.data.data || res.data)
    } catch {
      setKycDetail(user)
    } finally {
      setKycLoading(false)
    }
  }

  const doKycDecision = async approved => {
    if (!approved && !kycReason.trim()) {
      setKycToast({ msg: 'Please provide a rejection reason.', type: 'error' })
      setTimeout(() => setKycToast(null), 3500)
      return
    }
    setKycActing(true)
    try {
      await kycApi.adminReview(kycUser._id, {
        approved,
        rejectionReason: approved ? undefined : kycReason,
        verificationNote: kycNote
      })
      setKycToast({ msg: approved ? 'KYC approved.' : 'KYC rejected.', type: 'success' })
      setTimeout(() => setKycToast(null), 3500)
      setKycUser(null)
      setKycDetail(null)
      fetchUsers(true)
    } catch (e) {
      setKycToast({ msg: e?.response?.data?.message || 'Action failed.', type: 'error' })
      setTimeout(() => setKycToast(null), 3500)
    } finally {
      setKycActing(false)
    }
  }

  const doBulkDelete = async () => {
    if (!confirm(`Delete ${selected.length} users?`)) return
    for (const id of selected) { try { await usersApi.remove(id) } catch {} }
    setSelected([]); fetchUsers(true)
  }

  const toggleSelect = id => setSelected(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id])
  const toggleAll    = () => setSelected(selected.length === paginated.length ? [] : paginated.map(u => u._id))

  const openEdit = u => {
    setForm({ firstName: u.firstName || '', lastName: u.lastName || '', email: u.email || '', phone: u.phone || '', role: u.role || 'user', password: '' })
    setEditUser(u)
  }

  // ── render ─────────────────────────────────────────────────────────────────
  return (
    <div className='um-wrap'>

      {/* Header */}
      <div className='um-head'>
        <div>
          <h2>User Management</h2>
          <p>Manage and monitor all platform users</p>
        </div>
        <div className='um-head-actions'>
          <button className={`um-btn-icon ${refreshing ? 'spin' : ''}`} onClick={() => fetchUsers(true)} title='Refresh'>
            <RefreshCw size={16} />
          </button>
          <button className='um-btn-ghost' title='Export'>
            Export CSV
          </button>
          <button className='um-btn-primary' onClick={() => { resetForm(); setShowCreate(true) }}>
            <Plus size={15} /> Create User
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className='um-stats'>
        {[
          { icon: <Users size={18} />,     cls: 'total',    val: stats?.totalUsers    || 0, lbl: 'Total Users' },
          { icon: <Activity size={18} />,  cls: 'active',   val: stats?.activeUsers   || 0, lbl: 'Active Now' },
          { icon: <Shield size={18} />,    cls: 'verified', val: stats?.verifiedUsers || 0, lbl: 'Verified' },
          { icon: <Wrench size={18} />,    cls: 'artisan',  val: stats?.artisans      || 0, lbl: 'Artisans' },
          { icon: <Home size={18} />,      cls: 'owners',   val: stats?.propertyOwners|| 0, lbl: 'Owners' }
        ].map(s => (
          <div className='um-stat' key={s.cls}>
            <div className={`um-stat-icon ${s.cls}`}>{s.icon}</div>
            <div className='um-stat-text'>
              <div className='um-stat-val'>{s.val}</div>
              <div className='um-stat-lbl'>{s.lbl}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className='um-toolbar'>
        <div className='um-search'>
          <Search size={14} />
          <input
            placeholder='Search name, email, phone…'
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className='um-filters'>
          <select className='um-select' value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
            <option value='all'>All Roles</option>
            <option value='SUPER_ADMIN'>Super Admin</option>
            <option value='sub-admin'>Sub Admin</option>
            <option value='support-admin'>Support Admin</option>
            <option value='property-owner'>Property Owner</option>
            <option value='artisan'>Artisan</option>
            <option value='property-admin'>Property Admin</option>
            <option value='user'>User</option>
          </select>
          <select className='um-select' value={statusFilter} onChange={e => setStatus(e.target.value)}>
            <option value='all'>All Status</option>
            <option value='online'>Online</option>
            <option value='offline'>Offline</option>
          </select>
          <select className='um-select' value={verifyFilter} onChange={e => setVerify(e.target.value)}>
            <option value='all'>All Verified</option>
            <option value='verified'>Verified</option>
            <option value='unverified'>Unverified</option>
          </select>
          <select className='um-select' value={sortBy} onChange={e => setSortBy(e.target.value)}>
            <option value='createdAt'>Joined</option>
            <option value='name'>Name</option>
            <option value='email'>Email</option>
          </select>
          <button className='um-sort-btn' onClick={() => setSortDir(d => d === 'asc' ? 'desc' : 'asc')}
            title={sortDir === 'asc' ? 'Ascending' : 'Descending'}>
            {sortDir === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
          </button>
        </div>
      </div>

      {/* Bulk actions */}
      {selected.length > 0 && (
        <div className='um-bulk'>
          <span>{selected.length} selected</span>
          <button className='um-btn-danger' onClick={doBulkDelete}>
            <Trash2 size={13} /> Delete Selected
          </button>
          <button className='um-btn-ghost' onClick={() => setSelected([])}>
            <X size={13} /> Clear
          </button>
        </div>
      )}

      {/* Table */}
      <div className='um-table-wrap'>
        {loading ? (
          <div className='um-state'>
            <div className='um-spinner' />
            <p>Loading users…</p>
          </div>
        ) : error ? (
          <div className='um-state error'>
            <XCircle size={36} />
            <h3>Failed to load</h3>
            <p>{error}</p>
            <button className='um-btn-ghost' onClick={() => fetchUsers()}>Retry</button>
          </div>
        ) : filtered.length === 0 ? (
          <div className='um-state'>
            <Users size={40} />
            <h3>No users found</h3>
            <p>Try adjusting your filters</p>
          </div>
        ) : (
          <table className='um-table'>
            <thead>
              <tr>
                <th style={{ width: 40 }}>
                  <input type='checkbox'
                    checked={selected.length === paginated.length && paginated.length > 0}
                    onChange={toggleAll}
                    style={{ accentColor: '#C4E53C', cursor: 'pointer' }}
                  />
                </th>
                <th>User</th>
                <th>Role</th>
                <th>Status</th>
                <th>Verified</th>
                <th>Phone</th>
                <th>Joined</th>
                <th>Last Seen</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map(u => (
                <tr key={u._id} className={selected.includes(u._id) ? 'um-row-selected' : ''}
                  onClick={() => setDetailUser(u)}>
                  <td onClick={e => e.stopPropagation()}>
                    <input type='checkbox'
                      checked={selected.includes(u._id)}
                      onChange={() => toggleSelect(u._id)}
                      style={{ accentColor: '#C4E53C', cursor: 'pointer' }}
                    />
                  </td>
                  <td>
                    <div className='um-user-cell'>
                      <Avatar user={u} />
                      <div className='um-user-info'>
                        <div className='um-user-name'>{u.firstName} {u.lastName}</div>
                        <div className='um-user-email'>{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`um-badge ${roleBadgeClass(u.role)}`}>
                      {roleLabel(u.role)}
                    </span>
                  </td>
                  <td>
                    <span className={`um-badge ${isOnline(u) ? 'online' : 'offline'}`}>
                      {isOnline(u) ? '● Online' : '○ Offline'}
                    </span>
                  </td>
                  <td>
                    {u.isVerified
                      ? <span className='um-badge verified'><CheckCircle size={11} /> Verified</span>
                      : <span className='um-badge unverified'><XCircle size={11} /> Unverified</span>}
                  </td>
                  <td style={{ color: 'rgba(230,237,243,0.55)', fontSize: '0.82rem' }}>{u.phone || '—'}</td>
                  <td style={{ color: 'rgba(230,237,243,0.55)', fontSize: '0.82rem' }}>{fmtDate(u.createdAt)}</td>
                  <td style={{ color: 'rgba(230,237,243,0.55)', fontSize: '0.82rem' }}>{timeAgo(u.status?.lastSeen)}</td>
                  <td onClick={e => e.stopPropagation()}>
                    <div className='um-row-actions'>
                      <button className='view' title='View' onClick={() => setDetailUser(u)}><Eye size={13} /></button>
                      <button className='edit' title='Edit' onClick={() => openEdit(u)}><Edit2 size={13} /></button>
                      {['pending', 'under_review'].includes(u.kycStatus) ? (
                        <button className='kyc' title='Review KYC' onClick={() => openKycReview(u)}><ScanFace size={13} /></button>
                      ) : (
                        <button className='verify' title={u.isVerified ? 'Unverify' : 'Verify'} onClick={() => setVerifyUser(u)}>
                          {u.isVerified ? <UserCheck size={13} /> : <User size={13} />}
                        </button>
                      )}
                      <button className='reset-pw' title='Reset Password' onClick={() => openResetPw(u)}><KeyRound size={13} /></button>
                      <button className='del' title='Delete' onClick={() => setDeleteUser(u)}><Trash2 size={13} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className='um-pagination'>
          <span>{filtered.length} users · Page {page} of {totalPages}</span>
          <div className='um-page-btns'>
            <button disabled={page === 1} onClick={() => setPage(p => p - 1)}><ChevronLeft size={13} /></button>
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map(n => (
              <button key={n} className={page === n ? 'active' : ''} onClick={() => setPage(n)}>{n}</button>
            ))}
            {totalPages > 7 && <button disabled>…</button>}
            <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}><ChevronRight size={13} /></button>
          </div>
        </div>
      )}

      {/* ── Detail Modal ─────────────────────────────────────────────────── */}
      {detailUser && (
        <Modal title='User Details' onClose={() => setDetailUser(null)} size='lg'
          footer={<>
            <button className='um-foot-cancel' onClick={() => setDetailUser(null)}>Close</button>
            {['pending', 'under_review'].includes(detailUser.kycStatus) && (
              <button className='um-foot-kyc' onClick={() => { setDetailUser(null); openKycReview(detailUser) }}>
                <ScanFace size={14} /> Review KYC
              </button>
            )}
            <button className='um-foot-resetpw' onClick={() => { setDetailUser(null); openResetPw(detailUser) }}>
              <KeyRound size={14} /> Reset Password
            </button>
            <button className='um-foot-submit' onClick={() => { setDetailUser(null); openEdit(detailUser) }}>Edit User</button>
          </>}>
          <div className='um-detail-hero'>
            <Avatar user={detailUser} size={58} />
            <div>
              <h3>{detailUser.firstName} {detailUser.lastName}</h3>
              <p>{detailUser.email}</p>
              <div className='um-detail-badges'>
                <span className={`um-badge ${roleBadgeClass(detailUser.role)}`}>{roleLabel(detailUser.role)}</span>
                {detailUser.isVerified
                  ? <span className='um-badge verified'><CheckCircle size={11} /> Verified</span>
                  : <span className='um-badge unverified'>Unverified</span>}
                <span className={`um-badge ${isOnline(detailUser) ? 'online' : 'offline'}`}>
                  {isOnline(detailUser) ? '● Online' : '○ Offline'}
                </span>
              </div>
            </div>
          </div>
          <div className='um-detail-grid'>
            {[
              ['Phone',        detailUser.phone || '—'],
              ['Account Type', detailUser.accountStatus || '—'],
              ['Joined',       fmtDate(detailUser.createdAt)],
              ['Last Seen',    timeAgo(detailUser.status?.lastSeen)],
              ['Properties',   detailUser.properties?.length ?? '—'],
              ['Plan',         detailUser.plan?.name || 'Free'],
              ['KYC Status',   detailUser.kycStatus || '—'],
              ['Trial',        detailUser.plan?.isOnTrial ? 'Active' : '—'],
            ].map(([lbl, val]) => (
              <div className='um-detail-item' key={lbl}>
                <label>{lbl}</label>
                <p>{val}</p>
              </div>
            ))}
          </div>
        </Modal>
      )}

      {/* ── Create Modal ─────────────────────────────────────────────────── */}
      {showCreate && (
        <Modal title='Create User' onClose={() => setShowCreate(false)}
          footer={<>
            <button className='um-foot-cancel' onClick={() => setShowCreate(false)}>Cancel</button>
            <button className='um-foot-submit' onClick={doCreate}>Create</button>
          </>}>
          <UserForm form={form} setForm={setForm} isCreate />
        </Modal>
      )}

      {/* ── Edit Modal ───────────────────────────────────────────────────── */}
      {editUser && (
        <Modal title='Edit User' onClose={() => setEditUser(null)}
          footer={<>
            <button className='um-foot-cancel' onClick={() => setEditUser(null)}>Cancel</button>
            <button className='um-foot-submit' onClick={doEdit}>Save Changes</button>
          </>}>
          <UserForm form={form} setForm={setForm} />
        </Modal>
      )}

      {/* ── Verify Modal ─────────────────────────────────────────────────── */}
      {verifyUser && (
        <Modal title={verifyUser.isVerified ? 'Unverify User' : 'Verify User'} onClose={() => setVerifyUser(null)} size='sm'
          footer={<>
            <button className='um-foot-cancel' onClick={() => setVerifyUser(null)}>Cancel</button>
            <button className='um-foot-verify' onClick={doVerify}>{verifyUser.isVerified ? 'Remove Verification' : 'Mark as Verified'}</button>
          </>}>
          <div className='um-modal-body'>
            <p>
              {verifyUser.isVerified
                ? `Remove verification from ${verifyUser.firstName} ${verifyUser.lastName}?`
                : `Mark ${verifyUser.firstName} ${verifyUser.lastName} as verified?`}
            </p>
          </div>
        </Modal>
      )}

      {/* ── Delete Modal ─────────────────────────────────────────────────── */}
      {deleteUser && (
        <Modal title='Delete User' onClose={() => setDeleteUser(null)} size='sm'
          footer={<>
            <button className='um-foot-cancel' onClick={() => setDeleteUser(null)}>Cancel</button>
            <button className='um-foot-danger' onClick={doDelete}>Delete</button>
          </>}>
          <div className='um-modal-body'>
            <p>Permanently delete <strong>{deleteUser.firstName} {deleteUser.lastName}</strong> ({deleteUser.email})?</p>
            <p style={{ color: '#f85149', fontSize: '0.82rem', marginTop: 8 }}>This cannot be undone.</p>
          </div>
        </Modal>
      )}

      {/* ── Reset Password Modal ─────────────────────────────────────────── */}
      {resetPwUser && (
        <Modal title={`Reset Password — ${resetPwUser.firstName} ${resetPwUser.lastName}`}
          onClose={() => setResetPwUser(null)} size='sm'
          footer={<>
            <button className='um-foot-cancel' onClick={() => setResetPwUser(null)}>Cancel</button>
            <button className='um-foot-resetpw' disabled={resetPwLoading} onClick={doResetPassword}>
              <KeyRound size={14} /> {resetPwLoading ? 'Resetting…' : 'Reset Password'}
            </button>
          </>}>
          <div className='um-form'>
            <p style={{ fontSize: '0.85rem', color: 'rgba(230,237,243,0.55)', marginBottom: 14 }}>
              Set a new password for <strong style={{ color: '#e6edf3' }}>{resetPwUser.email}</strong>. The user will need to use this password on their next login.
            </p>
            {resetPwError && (
              <div className='um-rp-error'><XCircle size={13} /> {resetPwError}</div>
            )}
            <div className='um-field'>
              <label>New Password</label>
              <input
                type='password'
                placeholder='Min. 8 characters'
                value={resetPwForm.newPassword}
                onChange={e => setResetPwForm(p => ({ ...p, newPassword: e.target.value }))}
                autoComplete='new-password'
              />
            </div>
            <div className='um-field'>
              <label>Confirm New Password</label>
              <input
                type='password'
                placeholder='Repeat new password'
                value={resetPwForm.confirmPassword}
                onChange={e => setResetPwForm(p => ({ ...p, confirmPassword: e.target.value }))}
                autoComplete='new-password'
              />
            </div>
          </div>
        </Modal>
      )}

      {/* ── KYC Review Modal ─────────────────────────────────────────────── */}
      {kycUser && (
        <Modal title={`KYC Review — ${kycUser.firstName} ${kycUser.lastName}`} onClose={() => { setKycUser(null); setKycDetail(null) }} size='lg'
          footer={
            kycDetail && ['pending', 'under_review'].includes(kycDetail?.kyc?.status || kycUser.kycStatus) ? <>
              <button className='um-foot-cancel' onClick={() => { setKycUser(null); setKycDetail(null) }}>Cancel</button>
              <button className='um-foot-danger' disabled={kycActing} onClick={() => doKycDecision(false)}>Reject</button>
              <button className='um-foot-kyc' disabled={kycActing} onClick={() => doKycDecision(true)}>
                <CheckCircle size={14} /> {kycActing ? 'Processing…' : 'Approve KYC'}
              </button>
            </> : <button className='um-foot-cancel' onClick={() => { setKycUser(null); setKycDetail(null) }}>Close</button>
          }>
          {kycToast && (
            <div className={`um-kyc-toast ${kycToast.type}`}>
              {kycToast.type === 'success' ? <CheckCircle size={14} /> : <XCircle size={14} />}
              {kycToast.msg}
            </div>
          )}
          {kycLoading ? (
            <div className='um-state'><div className='um-spinner' /><p>Loading KYC details…</p></div>
          ) : (
            <div className='um-kyc-body'>
              {/* Document info */}
              <div className='um-kyc-section'>
                <h4><FileText size={14} /> Identity Document</h4>
                <div className='um-detail-grid' style={{ marginTop: 10 }}>
                  <div className='um-detail-item'>
                    <label>Type</label>
                    <p>{kycDetail?.kyc?.documentType?.replace(/_/g, ' ') || '—'}</p>
                  </div>
                  <div className='um-detail-item'>
                    <label>Number</label>
                    <p>{kycDetail?.kyc?.documentNumber || '—'}</p>
                  </div>
                  <div className='um-detail-item'>
                    <label>Submitted</label>
                    <p>{kycDetail?.kyc?.submittedAt ? new Date(kycDetail.kyc.submittedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}</p>
                  </div>
                  <div className='um-detail-item'>
                    <label>Status</label>
                    <p><span className={`um-badge ${kycDetail?.kyc?.status === 'approved' ? 'verified' : kycDetail?.kyc?.status === 'rejected' ? 'unverified' : 'online'}`}>{kycDetail?.kyc?.status?.replace('_', ' ') || '—'}</span></p>
                  </div>
                </div>
              </div>

              {/* Document images */}
              <div className='um-kyc-section'>
                <h4><Camera size={14} /> Document Images</h4>
                <div className='um-kyc-docs'>
                  {[
                    { label: 'Front', url: kycDetail?.kyc?.documentFrontUrl || kycDetail?.kyc?.documentUrl },
                    { label: 'Back',  url: kycDetail?.kyc?.documentBackUrl },
                    { label: 'Selfie', url: kycDetail?.kyc?.selfieUrl }
                  ].filter(d => d.url).map(doc => (
                    <div className='um-kyc-doc' key={doc.label}>
                      <p className='um-kyc-doc-label'>{doc.label}</p>
                      {/\.(jpg|jpeg|png|gif|webp)$/i.test(doc.url) || doc.url.includes('/image/') ? (
                        <a href={doc.url} target='_blank' rel='noreferrer'>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={doc.url} alt={doc.label} className='um-kyc-thumb' />
                        </a>
                      ) : (
                        <a href={doc.url} target='_blank' rel='noreferrer' className='um-kyc-link'>
                          <Eye size={13} /> View File
                        </a>
                      )}
                    </div>
                  ))}
                  {!kycDetail?.kyc?.documentFrontUrl && !kycDetail?.kyc?.documentUrl && (
                    <p style={{ color: 'rgba(230,237,243,0.4)', fontSize: '0.85rem' }}>No documents uploaded yet.</p>
                  )}
                </div>
              </div>

              {/* Previous rejection */}
              {kycDetail?.kyc?.rejectionReason && (
                <div className='um-kyc-prev-rejection'>
                  <XCircle size={13} /> Previous rejection: {kycDetail.kyc.rejectionReason}
                </div>
              )}

              {/* Decision fields — only for actionable statuses */}
              {['pending', 'under_review'].includes(kycDetail?.kyc?.status || kycUser.kycStatus) && (
                <div className='um-kyc-section'>
                  <h4>Decision</h4>
                  <div className='um-field' style={{ marginTop: 10 }}>
                    <label>Rejection Reason <span style={{ color: 'rgba(230,237,243,0.45)', fontWeight: 400 }}>(required if rejecting)</span></label>
                    <textarea
                      rows={3}
                      placeholder='e.g. Document image is blurry, please resubmit…'
                      value={kycReason}
                      onChange={e => setKycReason(e.target.value)}
                      style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '8px 12px', color: '#e6edf3', fontSize: '0.875rem', resize: 'vertical', marginTop: 6 }}
                    />
                  </div>
                  <div className='um-field' style={{ marginTop: 10 }}>
                    <label>Internal Note <span style={{ color: 'rgba(230,237,243,0.45)', fontWeight: 400 }}>(not shown to user)</span></label>
                    <textarea
                      rows={2}
                      placeholder='Optional internal notes…'
                      value={kycNote}
                      onChange={e => setKycNote(e.target.value)}
                      style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '8px 12px', color: '#e6edf3', fontSize: '0.875rem', resize: 'vertical', marginTop: 6 }}
                    />
                  </div>
                </div>
              )}

              {/* Already decided */}
              {kycDetail?.kyc?.status === 'approved' && (
                <div className='um-kyc-decided approved'>
                  <CheckCircle size={15} /> KYC Approved{kycDetail.kyc.reviewedAt ? ` on ${new Date(kycDetail.kyc.reviewedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}` : ''}
                </div>
              )}
              {kycDetail?.kyc?.status === 'rejected' && (
                <div className='um-kyc-decided rejected'>
                  <XCircle size={15} /> KYC Rejected — {kycDetail.kyc.rejectionReason || 'No reason given'}
                </div>
              )}
            </div>
          )}
        </Modal>
      )}
    </div>
  )
}

// ── Shared modal wrapper ──────────────────────────────────────────────────────
function Modal ({ title, children, onClose, footer, size = '' }) {
  return (
    <div className='um-overlay' onClick={onClose}>
      <div className={`um-modal ${size}`} onClick={e => e.stopPropagation()}>
        <div className='um-modal-head'>
          <h3>{title}</h3>
          <button onClick={onClose}><X size={15} /></button>
        </div>
        {children}
        {footer && <div className='um-modal-foot'>{footer}</div>}
      </div>
    </div>
  )
}

// ── User form (create / edit) ─────────────────────────────────────────────────
function UserForm ({ form, setForm, isCreate = false }) {
  const f = (k, v) => setForm(p => ({ ...p, [k]: v }))
  return (
    <div className='um-form'>
      <div className='um-form-row'>
        <div className='um-field'>
          <label>First Name</label>
          <input value={form.firstName} onChange={e => f('firstName', e.target.value)} placeholder='First name' />
        </div>
        <div className='um-field'>
          <label>Last Name</label>
          <input value={form.lastName} onChange={e => f('lastName', e.target.value)} placeholder='Last name' />
        </div>
      </div>
      <div className='um-field'>
        <label>Email</label>
        <input type='email' value={form.email} onChange={e => f('email', e.target.value)} placeholder='email@example.com' disabled={!isCreate} />
      </div>
      <div className='um-form-row'>
        <div className='um-field'>
          <label>Phone</label>
          <input value={form.phone} onChange={e => f('phone', e.target.value)} placeholder='+234…' />
        </div>
        <div className='um-field'>
          <label>Role</label>
          <select value={form.role} onChange={e => f('role', e.target.value)}>
            <option value='user'>User</option>
            <option value='property-owner'>Property Owner</option>
            <option value='artisan'>Artisan</option>
            <option value='property-admin'>Property Admin</option>
            <option value='artisan-admin'>Artisan Admin</option>
            <option value='sub-admin'>Sub Admin</option>
            <option value='support-admin'>Support Admin</option>
            <option value='SUPER_ADMIN'>Super Admin</option>
          </select>
        </div>
      </div>
      {isCreate && (
        <div className='um-field'>
          <label>Password</label>
          <input type='password' value={form.password} onChange={e => f('password', e.target.value)} placeholder='Temporary password' />
        </div>
      )}
    </div>
  )
}
