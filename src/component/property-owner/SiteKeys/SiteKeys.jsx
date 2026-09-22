'use client'
import { useState, useEffect } from 'react'
import axios from 'axios'
import './SiteKeys.scss'

const API = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'

export default function SiteKeys () {
  const [keys, setKeys] = useState([])
  const [loading, setLoading] = useState(true)
  const [newKeyName, setNewKeyName] = useState('')
  const [creating, setCreating] = useState(false)
  const [freshKey, setFreshKey] = useState(null) // raw key shown once after creation
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')

  const load = async () => {
    try {
      const res = await axios.get(`${API}/api/me/site-keys`)
      setKeys(res.data.keys || [])
    } catch (e) {
      setError('Could not load site keys.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const handleCreate = async e => {
    e.preventDefault()
    setError('')
    setFreshKey(null)
    setCreating(true)
    try {
      const res = await axios.post(`${API}/api/me/site-keys`, {
        name: newKeyName || 'My WordPress Site'
      })
      setFreshKey(res.data.key)
      setNewKeyName('')
      load()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate key.')
    } finally {
      setCreating(false)
    }
  }

  const handleRevoke = async (keyId, keyName) => {
    if (
      !confirm(
        `Revoke "${keyName}"? Your WordPress site will lose cloud connection.`
      )
    )
      return
    try {
      await axios.delete(`${API}/api/me/site-keys/${keyId}`)
      load()
      if (freshKey && keys.find(k => k._id === keyId)) setFreshKey(null)
    } catch (e) {
      setError('Failed to revoke key.')
    }
  }

  const copyKey = async () => {
    if (!freshKey?.key) return
    await navigator.clipboard.writeText(freshKey.key)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className='sk-page'>
      <div className='sk-header'>
        <h1 className='sk-title'>
          <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' style={{ marginRight: 6, verticalAlign: 'middle' }}><path d='M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4'/></svg>
          PropNect Site Keys
        </h1>
        <p className='sk-subtitle'>
          Connect your WordPress plugin to this PropNect account. Each key links
          one WordPress site.
        </p>
      </div>

      {/* How it works */}
      <div className='sk-how-it-works'>
        <h3>How it works</h3>
        <div className='sk-steps'>
          {[
            {
              n: 1,
              t: 'Generate a key',
              d: 'Click below to create a key for your WordPress site.'
            },
            {
              n: 2,
              t: 'Copy the key',
              d: 'The key is shown only once — copy it immediately.'
            },
            {
              n: 3,
              t: 'Paste in WordPress',
              d: 'In your WP admin: PropNect Booking → Settings → Cloud Sync → Site Key.'
            },
            {
              n: 4,
              t: 'Done!',
              d: 'Your bookings, properties, and availability sync automatically.'
            }
          ].map(s => (
            <div className='sk-step' key={s.n}>
              <div className='sk-step-num'>{s.n}</div>
              <div>
                <strong>{s.t}</strong>
                <div className='sk-step-desc'>{s.d}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create form */}
      <div className='sk-card'>
        <h2>Generate a New Site Key</h2>
        <form onSubmit={handleCreate} className='sk-form'>
          <input
            type='text'
            className='sk-input'
            placeholder='Key name (e.g. "My Hotel Website", "Airbnb Rental")'
            value={newKeyName}
            onChange={e => setNewKeyName(e.target.value)}
            maxLength={80}
          />
          <button
            type='submit'
            className='sk-btn sk-btn-accent'
            disabled={creating}
          >
            {creating ? 'Generating…' : '+ Generate Site Key'}
          </button>
        </form>
        {error && <div className='sk-error'>{error}</div>}

        {/* Fresh key reveal — shown only once */}
        {freshKey && (
          <div className='sk-fresh-key'>
            <div className='sk-fresh-title'>
              <svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' style={{ marginRight: 4, verticalAlign: 'middle' }}><path d='M22 11.08V12a10 10 0 1 1-5.93-9.14'/><polyline points='22 4 12 14.01 9 11.01'/></svg>
              Key generated! Copy it now — it won&apos;t be shown again.
            </div>
            <div className='sk-fresh-key-display'>
              <code className='sk-key-code'>{freshKey.key}</code>
              <button className='sk-btn sk-btn-copy' onClick={copyKey}>
                {copied ? (
                  <>
                    <svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' style={{ marginRight: 4, verticalAlign: 'middle' }}><path d='M22 11.08V12a10 10 0 1 1-5.93-9.14'/><polyline points='22 4 12 14.01 9 11.01'/></svg>
                    Copied!
                  </>
                ) : (
                  <>
                    <svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' style={{ marginRight: 4, verticalAlign: 'middle' }}><rect x='8' y='2' width='8' height='4' rx='1'/><path d='M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2'/></svg>
                    Copy Key
                  </>
                )}
              </button>
            </div>
            <div className='sk-fresh-note'>
              Paste this in your WordPress admin under{' '}
              <strong>
                PropNect Booking → Settings → Cloud Sync → Your PropNect Site
                Key
              </strong>
            </div>
          </div>
        )}
      </div>

      {/* Keys list */}
      <div className='sk-card'>
        <h2>Your Site Keys</h2>
        {loading ? (
          <div className='sk-empty'>Loading…</div>
        ) : keys.length === 0 ? (
          <div className='sk-empty'>
            No site keys yet. Generate one above to connect your WordPress site.
          </div>
        ) : (
          <div className='sk-key-list'>
            {keys.map(k => (
              <div
                className={`sk-key-item ${!k.active ? 'sk-key-revoked' : ''}`}
                key={k._id}
              >
                <div className='sk-key-info'>
                  <div className='sk-key-name'>
                    {k.name}
                    {!k.active && (
                      <span className='sk-badge sk-badge-revoked'>Revoked</span>
                    )}
                    {k.active && (
                      <span className='sk-badge sk-badge-active'>Active</span>
                    )}
                  </div>
                  <div className='sk-key-meta'>
                    <code className='sk-key-preview'>{k.keyPreview}</code>
                    <span>
                      Created {new Date(k.createdAt).toLocaleDateString()}
                    </span>
                    {k.lastUsed && (
                      <span>
                        Last used {new Date(k.lastUsed).toLocaleDateString()}
                      </span>
                    )}
                    {!k.lastUsed && k.active && (
                      <span className='sk-key-unused'>Not yet used</span>
                    )}
                  </div>
                </div>
                {k.active && (
                  <button
                    className='sk-btn sk-btn-danger sk-btn-sm'
                    onClick={() => handleRevoke(k._id, k.name)}
                  >
                    Revoke
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
        <p className='sk-note'>
          Maximum 5 active site keys. Revoke keys you no longer use to keep your
          account secure.
        </p>
      </div>
    </div>
  )
}
