'use client'
import { useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import './LicenseKeys.scss'

const API = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'

const STATUS_COLORS = {
  active: '#16a34a',
  used: '#2563eb',
  revoked: '#ef4444',
  expired: '#9ca3af'
}
const STATUS_LABELS = {
  active: 'Active',
  used: 'In Use',
  revoked: 'Revoked',
  expired: 'Expired'
}

export default function LicenseKeys () {
  const [keys, setKeys] = useState([])
  const [stats, setStats] = useState({})
  const [loading, setLoading] = useState(true)
  const [genOpen, setGenOpen] = useState(false)
  const [copying, setCopying] = useState(null)

  // Filter state
  const [filter, setFilter] = useState({ status: '', tier: '', page: 1 })
  const [total, setTotal] = useState(0)

  // Generate form state
  const [form, setForm] = useState({
    count: 1,
    tier: 'pro',
    expiresAt: '',
    notes: '',
    assignedEmail: '',
    assignedDomain: ''
  })
  const [generating, setGenerating] = useState(false)
  const [genResult, setGenResult] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filter.status) params.set('status', filter.status)
      if (filter.tier) params.set('tier', filter.tier)
      params.set('page', filter.page)
      params.set('limit', 20)

      const [keysRes, statsRes] = await Promise.all([
        axios.get(`${API}/api/license-keys?${params}`),
        axios.get(`${API}/api/license-keys/stats`)
      ])
      setKeys(keysRes.data.keys || [])
      setTotal(keysRes.data.total || 0)
      setStats(statsRes.data)
    } catch (e) {
      console.error('License keys load error:', e)
    } finally {
      setLoading(false)
    }
  }, [filter])

  useEffect(() => {
    load()
  }, [load])

  const handleGenerate = async e => {
    e.preventDefault()
    setGenerating(true)
    setGenResult(null)
    try {
      const res = await axios.post(`${API}/api/license-keys/generate`, form)
      setGenResult(res.data.keys)
      load()
    } catch (err) {
      setGenResult({
        error: err.response?.data?.message || 'Generation failed'
      })
    } finally {
      setGenerating(false)
    }
  }

  const handleRevoke = async (id, key) => {
    if (!confirm(`Revoke key ${key}? This cannot be undone.`)) return
    await axios.patch(`${API}/api/license-keys/${id}/revoke`)
    load()
  }

  const copyKey = async key => {
    await navigator.clipboard.writeText(key)
    setCopying(key)
    setTimeout(() => setCopying(null), 1500)
  }

  const pages = Math.ceil(total / 20)

  return (
    <div className='lk-page'>
      <div className='lk-header'>
        <div>
          <h1 className='lk-title'>
            <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' style={{ marginRight: 6, verticalAlign: 'middle' }}><path d='M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4'/></svg>
            License Keys
          </h1>
          <p className='lk-subtitle'>
            Generate and manage PropNect Pro license keys for WordPress
            customers.
          </p>
        </div>
        <button
          className='lk-btn lk-btn-accent'
          onClick={() => {
            setGenOpen(true)
            setGenResult(null)
          }}
        >
          + Generate Keys
        </button>
      </div>

      {/* Stats row */}
      <div className='lk-stats'>
        {[
          {
            label: 'Total Generated',
            value: stats.total ?? '—',
            color: '#374151'
          },
          {
            label: 'Active (unused)',
            value: stats.active ?? '—',
            color: '#16a34a'
          },
          { label: 'In Use', value: stats.used ?? '—', color: '#2563eb' },
          { label: 'Revoked', value: stats.revoked ?? '—', color: '#ef4444' }
        ].map(s => (
          <div className='lk-stat-card' key={s.label}>
            <div className='lk-stat-value' style={{ color: s.color }}>
              {s.value}
            </div>
            <div className='lk-stat-label'>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Generate modal */}
      {genOpen && (
        <div
          className='lk-modal-overlay'
          onClick={e => {
            if (e.target === e.currentTarget) setGenOpen(false)
          }}
        >
          <div className='lk-modal'>
            <div className='lk-modal-header'>
              <h2>Generate License Keys</h2>
              <button
                className='lk-modal-close'
                onClick={() => setGenOpen(false)}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleGenerate} className='lk-gen-form'>
              <div className='lk-form-row lk-form-row-inline'>
                <div>
                  <label>Quantity</label>
                  <input
                    type='number'
                    min={1}
                    max={50}
                    value={form.count}
                    onChange={e =>
                      setForm(f => ({
                        ...f,
                        count: parseInt(e.target.value) || 1
                      }))
                    }
                    className='lk-input lk-input-sm'
                  />
                  <small>Max 50 at once</small>
                </div>
                <div>
                  <label>Tier</label>
                  <select
                    value={form.tier}
                    onChange={e =>
                      setForm(f => ({ ...f, tier: e.target.value }))
                    }
                    className='lk-input'
                  >
                    <option value='pro'>Pro</option>
                    <option value='enterprise'>Enterprise</option>
                  </select>
                </div>
                <div>
                  <label>Expires (optional)</label>
                  <input
                    type='date'
                    value={form.expiresAt}
                    onChange={e =>
                      setForm(f => ({ ...f, expiresAt: e.target.value }))
                    }
                    className='lk-input'
                  />
                  <small>Leave blank = lifetime</small>
                </div>
              </div>
              <div className='lk-form-row lk-form-row-inline'>
                <div>
                  <label>Assign to Email (optional)</label>
                  <input
                    type='email'
                    value={form.assignedEmail}
                    onChange={e =>
                      setForm(f => ({ ...f, assignedEmail: e.target.value }))
                    }
                    className='lk-input'
                    placeholder='customer@example.com'
                  />
                </div>
                <div>
                  <label>Assign to Domain (optional)</label>
                  <input
                    type='text'
                    value={form.assignedDomain}
                    onChange={e =>
                      setForm(f => ({ ...f, assignedDomain: e.target.value }))
                    }
                    className='lk-input'
                    placeholder='example.com'
                  />
                </div>
              </div>
              <div className='lk-form-row'>
                <label>Internal Notes (admin only)</label>
                <textarea
                  value={form.notes}
                  onChange={e =>
                    setForm(f => ({ ...f, notes: e.target.value }))
                  }
                  className='lk-input'
                  rows={2}
                  placeholder='e.g. Customer name, order ID, promo…'
                />
              </div>

              {/* Result */}
              {genResult && !genResult.error && (
                <div className='lk-gen-result'>
                  <div className='lk-gen-result-title'>
                    <svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' style={{ marginRight: 4, verticalAlign: 'middle' }}><path d='M22 11.08V12a10 10 0 1 1-5.93-9.14'/><polyline points='22 4 12 14.01 9 11.01'/></svg>
                    {genResult.length} key{genResult.length > 1 ? 's' : ''}{' '}
                    generated
                  </div>
                  {genResult.map(k => (
                    <div key={k._id} className='lk-gen-key-row'>
                      <code className='lk-gen-key'>{k.key}</code>
                      <button
                        type='button'
                        className='lk-btn lk-btn-xs'
                        onClick={() => copyKey(k.key)}
                      >
                        {copying === k.key ? (
                        <>
                          <svg width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' style={{ marginRight: 3, verticalAlign: 'middle' }}><path d='M22 11.08V12a10 10 0 1 1-5.93-9.14'/><polyline points='22 4 12 14.01 9 11.01'/></svg>
                          Copied
                        </>
                      ) : (
                        <>
                          <svg width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' style={{ marginRight: 3, verticalAlign: 'middle' }}><rect x='8' y='2' width='8' height='4' rx='1'/><path d='M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2'/></svg>
                          Copy
                        </>
                      )}
                      </button>
                    </div>
                  ))}
                  <button
                    type='button'
                    className='lk-btn'
                    style={{ marginTop: 8 }}
                    onClick={() =>
                      navigator.clipboard.writeText(
                        genResult.map(k => k.key).join('\n')
                      )
                    }
                  >
                    <svg width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' style={{ marginRight: 4, verticalAlign: 'middle' }}><rect x='8' y='2' width='8' height='4' rx='1'/><path d='M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2'/></svg>
                    Copy All Keys
                  </button>
                </div>
              )}
              {genResult?.error && (
                <div className='lk-error'>{genResult.error}</div>
              )}

              <div className='lk-modal-actions'>
                <button
                  type='button'
                  className='lk-btn'
                  onClick={() => setGenOpen(false)}
                >
                  Close
                </button>
                <button
                  type='submit'
                  className='lk-btn lk-btn-accent'
                  disabled={generating}
                >
                  {generating
                    ? 'Generating…'
                    : `Generate ${form.count} Key${form.count > 1 ? 's' : ''}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className='lk-filters'>
        <select
          value={filter.status}
          onChange={e =>
            setFilter(f => ({ ...f, status: e.target.value, page: 1 }))
          }
          className='lk-input lk-input-sm'
        >
          <option value=''>All Statuses</option>
          <option value='active'>Active</option>
          <option value='used'>In Use</option>
          <option value='revoked'>Revoked</option>
          <option value='expired'>Expired</option>
        </select>
        <select
          value={filter.tier}
          onChange={e =>
            setFilter(f => ({ ...f, tier: e.target.value, page: 1 }))
          }
          className='lk-input lk-input-sm'
        >
          <option value=''>All Tiers</option>
          <option value='pro'>Pro</option>
          <option value='enterprise'>Enterprise</option>
        </select>
        <span className='lk-total'>
          {total} key{total !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Table */}
      <div className='lk-table-wrap'>
        {loading ? (
          <div className='lk-loading'>Loading keys…</div>
        ) : keys.length === 0 ? (
          <div className='lk-empty'>
            No license keys found. Generate your first one above.
          </div>
        ) : (
          <table className='lk-table'>
            <thead>
              <tr>
                <th>Key</th>
                <th>Tier</th>
                <th>Status</th>
                <th>Assigned To</th>
                <th>Domain</th>
                <th>Expires</th>
                <th>Generated</th>
                <th>Notes</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {keys.map(k => (
                <tr
                  key={k._id}
                  className={k.status === 'revoked' ? 'lk-row-revoked' : ''}
                >
                  <td>
                    <div className='lk-key-cell'>
                      <code className='lk-key-code'>{k.key}</code>
                      <button
                        className='lk-btn lk-btn-xs'
                        onClick={() => copyKey(k.key)}
                      >
                        {copying === k.key ? (
                          <svg width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><path d='M22 11.08V12a10 10 0 1 1-5.93-9.14'/><polyline points='22 4 12 14.01 9 11.01'/></svg>
                        ) : (
                          <svg width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><rect x='8' y='2' width='8' height='4' rx='1'/><path d='M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2'/></svg>
                        )}
                      </button>
                    </div>
                  </td>
                  <td>
                    <span
                      className='lk-badge'
                      style={{
                        background:
                          k.tier === 'enterprise' ? '#7c3aed' : '#0B3D28'
                      }}
                    >
                      {k.tier === 'enterprise' ? (
                        <>
                          <svg width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' style={{ marginRight: 3, verticalAlign: 'middle' }}><polygon points='12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2'/></svg>
                          Enterprise
                        </>
                      ) : (
                        <>
                          <svg width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' style={{ marginRight: 3, verticalAlign: 'middle' }}><circle cx='12' cy='8' r='6'/><path d='M15.477 12.89L17 22l-5-3-5 3 1.523-9.11'/></svg>
                          Pro
                        </>
                      )}
                    </span>
                  </td>
                  <td>
                    <span
                      className='lk-status-dot'
                      style={{ background: STATUS_COLORS[k.status] }}
                    />
                    {STATUS_LABELS[k.status] || k.status}
                  </td>
                  <td className='lk-muted'>{k.assignedEmail || '—'}</td>
                  <td className='lk-muted'>{k.assignedDomain || '—'}</td>
                  <td className='lk-muted'>
                    {k.expiresAt
                      ? new Date(k.expiresAt).toLocaleDateString()
                      : 'Lifetime'}
                  </td>
                  <td className='lk-muted'>
                    {new Date(k.createdAt).toLocaleDateString()}
                  </td>
                  <td className='lk-muted lk-notes'>{k.notes || '—'}</td>
                  <td>
                    {k.status !== 'revoked' && (
                      <button
                        className='lk-btn lk-btn-xs lk-btn-danger'
                        onClick={() => handleRevoke(k._id, k.key)}
                      >
                        Revoke
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div className='lk-pagination'>
          <button
            className='lk-btn lk-btn-xs'
            disabled={filter.page <= 1}
            onClick={() => setFilter(f => ({ ...f, page: f.page - 1 }))}
          >
            ← Prev
          </button>
          <span>
            Page {filter.page} of {pages}
          </span>
          <button
            className='lk-btn lk-btn-xs'
            disabled={filter.page >= pages}
            onClick={() => setFilter(f => ({ ...f, page: f.page + 1 }))}
          >
            Next →
          </button>
        </div>
      )}

      {/* WordPress integration guide */}
      <div className='lk-guide'>
        <h3>
          <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' style={{ marginRight: 6, verticalAlign: 'middle' }}><rect x='8' y='2' width='8' height='4' rx='1'/><path d='M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2'/><path d='M12 11h4M12 16h4M8 11h.01M8 16h.01'/></svg>
          How to activate Pro on WordPress
        </h3>
        <ol>
          <li>
            Generate a key above (format: <code>PNPRO-XXXX-XXXX-XXXX-XXXX</code>
            )
          </li>
          <li>Send the key to the customer</li>
          <li>
            Customer goes to{' '}
            <strong>PropNect Booking → Settings → License</strong> in their
            WordPress admin
          </li>
          <li>
            They paste the key and click <strong>Save Settings</strong>
          </li>
          <li>Pro features unlock immediately</li>
          <li>
            If their site is connected to this PropNect server, the key is
            validated here in real-time
          </li>
        </ol>
        <div className='lk-endpoint'>
          <strong>Validation endpoint (used by plugin):</strong>
          <code>{API}/api/license-keys/validate</code>
        </div>
      </div>
    </div>
  )
}
