'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { api } from '@/libs/api-client'
import {
  Shield,
  Users,
  Search,
  ChevronDown,
  ChevronUp,
  Check,
  X,
  RotateCcw,
  Save,
  Loader2,
  AlertCircle,
  Crown,
  User as UserIcon,
  Filter
} from 'lucide-react'
import './AdminPermissions.scss'

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

const ROLE_COLORS = {
  'super-admin':        { bg: '#fff0f0', text: '#c0392b', border: '#f5c6c6' },
  'sub-admin':          { bg: '#fff8f0', text: '#d35400', border: '#fdd5b0' },
  'property-admin':     { bg: '#f0f4ff', text: '#003580', border: '#b8cbf5' },
  'sub-property-admin': { bg: '#f0f8ff', text: '#0071c2', border: '#b3d9f7' },
  'artisan-admin':      { bg: '#f0fff4', text: '#1a6b3a', border: '#b0e8c4' },
  'sub-artisan-admin':  { bg: '#f5fff0', text: '#2e7d32', border: '#c3e9c5' },
  'support-admin':      { bg: '#fdf0ff', text: '#7b1fa2', border: '#e1b0f5' },
}

const ROLE_LABELS = {
  'super-admin':        'Super Admin',
  'sub-admin':          'Sub Admin',
  'property-admin':     'Property Admin',
  'sub-property-admin': 'Sub Property Admin',
  'artisan-admin':      'Artisan Admin',
  'sub-artisan-admin':  'Sub Artisan Admin',
  'support-admin':      'Support Admin',
}

// ─── ROLE BADGE ───────────────────────────────────────────────────────────────

function RoleBadge({ role }) {
  const style = ROLE_COLORS[role] || { bg: '#f5f5f5', text: '#555', border: '#ddd' }
  return (
    <span
      className='role-badge'
      style={{ background: style.bg, color: style.text, borderColor: style.border }}
    >
      {role === 'super-admin' && <Crown size={11} />}
      {ROLE_LABELS[role] || role}
    </span>
  )
}

// ─── PERMISSION CHECKBOX GROUP ────────────────────────────────────────────────

function PermissionGroup({ group, permissions, labels, effective, defaults, custom, onChange, readOnly }) {
  const [collapsed, setCollapsed] = useState(false)
  const allChecked = permissions.every(p => effective.includes(p))
  const someChecked = permissions.some(p => effective.includes(p))

  const toggleAll = () => {
    if (readOnly) return
    if (allChecked) {
      // Remove all in group from custom
      onChange(custom.filter(p => !permissions.includes(p)))
    } else {
      // Add all in group to custom (union)
      onChange([...new Set([...custom, ...permissions])])
    }
  }

  return (
    <div className='perm-group'>
      <div className='perm-group-header' onClick={() => setCollapsed(c => !c)}>
        <button
          type='button'
          className={`perm-group-toggle ${allChecked ? 'all' : someChecked ? 'some' : ''}`}
          onClick={e => { e.stopPropagation(); toggleAll() }}
          disabled={readOnly}
          title={allChecked ? 'Deselect all' : 'Select all'}
        >
          {allChecked ? <Check size={12} /> : someChecked ? <span className='dash' /> : null}
        </button>
        <span className='perm-group-name'>{group}</span>
        <span className='perm-group-count'>
          {permissions.filter(p => effective.includes(p)).length}/{permissions.length}
        </span>
        {collapsed ? <ChevronDown size={15} /> : <ChevronUp size={15} />}
      </div>

      {!collapsed && (
        <div className='perm-list'>
          {permissions.map(perm => {
            const isDefault  = defaults.includes(perm)
            const isCustom   = custom.includes(perm)
            const isEffective = effective.includes(perm)

            const toggle = () => {
              if (readOnly || isDefault) return
              if (isCustom) {
                onChange(custom.filter(p => p !== perm))
              } else {
                onChange([...custom, perm])
              }
            }

            return (
              <label key={perm} className={`perm-row ${isDefault ? 'is-default' : ''}`}>
                <span
                  className={`perm-check ${isEffective ? 'checked' : ''} ${isDefault ? 'locked' : ''}`}
                  onClick={toggle}
                >
                  {isEffective && <Check size={11} />}
                </span>
                <span className='perm-label'>{labels[perm] || perm}</span>
                {isDefault && <span className='perm-tag default'>role default</span>}
                {isCustom  && <span className='perm-tag custom'>custom</span>}
              </label>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─── ADMIN ROW / EDITOR ───────────────────────────────────────────────────────

function AdminRow({ admin, schema, currentUserRole, onSaved }) {
  const [open,    setOpen]    = useState(false)
  const [custom,  setCustom]  = useState(admin.customPermissions || [])
  const [saving,  setSaving]  = useState(false)
  const [notice,  setNotice]  = useState(null)

  const effective = [...new Set([...(admin.roleDefaults || []), ...custom])]
  const isDirty   = JSON.stringify([...custom].sort()) !==
                    JSON.stringify([...(admin.customPermissions || [])].sort())

  const readOnly  = currentUserRole !== 'super-admin' && admin.role === 'super-admin'

  const save = async () => {
    setSaving(true)
    setNotice(null)
    try {
      await api.put(`/api/admin/permissions/${admin._id}`, { customPermissions: custom })
      setNotice({ type: 'success', msg: 'Permissions saved' })
      onSaved(admin._id, custom)
    } catch (err) {
      setNotice({ type: 'error', msg: err.response?.data?.msg || 'Failed to save' })
    } finally {
      setSaving(false)
    }
  }

  const reset = async () => {
    setSaving(true)
    try {
      await api.post(`/api/admin/permissions/${admin._id}/reset`)
      setCustom([])
      setNotice({ type: 'success', msg: 'Reset to role defaults' })
      onSaved(admin._id, [])
    } catch (err) {
      setNotice({ type: 'error', msg: err.response?.data?.msg || 'Failed to reset' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className={`admin-row ${open ? 'open' : ''}`}>
      {/* ── Row summary ── */}
      <div className='admin-row-summary' onClick={() => setOpen(o => !o)}>
        <div className='admin-avatar'>
          {admin.firstName?.[0]}{admin.lastName?.[0]}
        </div>
        <div className='admin-info'>
          <span className='admin-name'>{admin.firstName} {admin.lastName}</span>
          <span className='admin-email'>{admin.email}</span>
        </div>
        <RoleBadge role={admin.role} />
        <div className='admin-perm-count'>
          <Shield size={14} />
          {effective.length} permissions
        </div>
        <div className='admin-chevron'>
          {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </div>

      {/* ── Permission editor ── */}
      {open && (
        <div className='admin-editor'>
          {readOnly && (
            <div className='editor-notice info'>
              <AlertCircle size={15} />
              Super admin permissions cannot be modified.
            </div>
          )}

          {notice && (
            <div className={`editor-notice ${notice.type}`}>
              {notice.type === 'success' ? <Check size={15} /> : <AlertCircle size={15} />}
              {notice.msg}
            </div>
          )}

          <div className='editor-legend'>
            <span><span className='perm-tag default'>role default</span> — inherited from role, always active</span>
            <span><span className='perm-tag custom'>custom</span> — extra permission you granted</span>
          </div>

          <div className='perm-groups'>
            {schema.groups?.map(g => (
              <PermissionGroup
                key={g.group}
                group={g.group}
                permissions={g.permissions}
                labels={g.labels}
                effective={effective}
                defaults={admin.roleDefaults || []}
                custom={custom}
                onChange={setCustom}
                readOnly={readOnly}
              />
            ))}
          </div>

          {!readOnly && (
            <div className='editor-actions'>
              <button
                type='button'
                className='btn-reset'
                onClick={reset}
                disabled={saving || custom.length === 0}
              >
                <RotateCcw size={14} /> Reset to defaults
              </button>
              <button
                type='button'
                className='btn-save'
                onClick={save}
                disabled={saving || !isDirty}
              >
                {saving ? <Loader2 size={14} className='spin' /> : <Save size={14} />}
                {saving ? 'Saving…' : 'Save permissions'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export default function AdminPermissions({ currentUser }) {
  const [schema,  setSchema]  = useState(null)
  const [admins,  setAdmins]  = useState([])
  const [total,   setTotal]   = useState(0)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)
  const [search,  setSearch]  = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [page,    setPage]    = useState(1)
  const LIMIT = 15

  const loadSchema = useCallback(async () => {
    const res = await api.get('/api/admin/permissions/schema')
    setSchema(res.data.data)
  }, [])

  const loadAdmins = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({ page, limit: LIMIT })
      if (search)     params.set('search', search)
      if (roleFilter) params.set('role',   roleFilter)

      const res = await api.get(`/api/admin/permissions/admins?${params}`)
      setAdmins(res.data.data)
      setTotal(res.data.total)
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to load admins')
    } finally {
      setLoading(false)
    }
  }, [page, search, roleFilter])

  useEffect(() => { loadSchema() }, [loadSchema])
  useEffect(() => { loadAdmins() }, [loadAdmins])

  const handleSaved = (userId, newCustom) => {
    setAdmins(prev => prev.map(a =>
      a._id === userId
        ? { ...a, customPermissions: newCustom, effectivePermissions: [...new Set([...(a.roleDefaults || []), ...newCustom])] }
        : a
    ))
  }

  const totalPages = Math.ceil(total / LIMIT)

  return (
    <div className='admin-permissions'>
      {/* ── Header ── */}
      <div className='ap-header'>
        <div className='ap-header-left'>
          <Shield size={24} />
          <div>
            <h2>Admin Permissions</h2>
            <p>Manage granular permissions for each admin account</p>
          </div>
        </div>
        <div className='ap-stats'>
          <div className='ap-stat'>
            <Users size={16} />
            <span>{total} admins</span>
          </div>
        </div>
      </div>

      {/* ── Filters ── */}
      <div className='ap-filters'>
        <div className='ap-search'>
          <Search size={16} />
          <input
            type='text'
            placeholder='Search by name or email…'
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
          />
          {search && (
            <button type='button' onClick={() => { setSearch(''); setPage(1) }}>
              <X size={14} />
            </button>
          )}
        </div>

        <div className='ap-role-filter'>
          <Filter size={15} />
          <select
            value={roleFilter}
            onChange={e => { setRoleFilter(e.target.value); setPage(1) }}
          >
            <option value=''>All admin roles</option>
            {schema?.adminRoles?.map(r => (
              <option key={r} value={r}>{ROLE_LABELS[r] || r}</option>
            ))}
          </select>
        </div>
      </div>

      {/* ── Content ── */}
      {loading && (
        <div className='ap-loading'>
          <Loader2 size={28} className='spin' />
          <span>Loading admins…</span>
        </div>
      )}

      {error && (
        <div className='ap-error'>
          <AlertCircle size={18} />
          {error}
          <button type='button' onClick={loadAdmins}>Retry</button>
        </div>
      )}

      {!loading && !error && admins.length === 0 && (
        <div className='ap-empty'>
          <UserIcon size={40} />
          <p>No admins found</p>
        </div>
      )}

      {!loading && !error && admins.length > 0 && (
        <>
          <div className='admin-list'>
            {admins.map(admin => (
              <AdminRow
                key={admin._id}
                admin={admin}
                schema={schema}
                currentUserRole={currentUser?.role}
                onSaved={handleSaved}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div className='ap-pagination'>
              <button
                type='button'
                disabled={page <= 1}
                onClick={() => setPage(p => p - 1)}
              >
                Previous
              </button>
              <span>Page {page} of {totalPages}</span>
              <button
                type='button'
                disabled={page >= totalPages}
                onClick={() => setPage(p => p + 1)}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
