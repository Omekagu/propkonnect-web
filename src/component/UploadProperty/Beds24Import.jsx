'use client'

import React, { useState, useCallback } from 'react'
import { api } from '@/libs/api-client'
import {
  ArrowLeft, Plug, Check, AlertCircle, Loader2,
  RefreshCw, Download, ChevronDown, ChevronUp, Eye, EyeOff
} from 'lucide-react'
import './Beds24Import.scss'

// ── Component ─────────────────────────────────────────────────────────────────

export default function Beds24Import ({ onBack, onComplete }) {
  const [apiKey,       setApiKey]       = useState('')
  const [showKey,      setShowKey]      = useState(false)
  const [testState,    setTestState]    = useState(null)   // null | 'loading' | 'ok' | 'fail'
  const [testMsg,      setTestMsg]      = useState('')
  const [propCount,    setPropCount]    = useState(0)
  const [importing,    setImporting]    = useState(false)
  const [importResult, setImportResult] = useState(null)  // { success, message, log, totals }
  const [showLog,      setShowLog]      = useState(true)
  const [notice,       setNotice]       = useState(null)

  const flash = useCallback((msg, type = 'error') => {
    setNotice({ msg, type })
    setTimeout(() => setNotice(null), 5000)
  }, [])

  // ── Test connection ────────────────────────────────────────────────────────

  const handleTest = async () => {
    if (!apiKey.trim()) { flash('Paste your Beds24 API token first.'); return }
    setTestState('loading')
    setTestMsg('')
    try {
      const res = await api.post('/api/beds24/test', { apiKey: apiKey.trim() })
      if (res.data?.success) {
        setTestState('ok')
        setTestMsg(res.data.message)
        setPropCount(res.data.propertyCount ?? 0)
      } else {
        setTestState('fail')
        setTestMsg(res.data?.message ?? 'Connection failed')
      }
    } catch (err) {
      setTestState('fail')
      setTestMsg(err.response?.data?.message ?? err.message ?? 'Connection error')
    }
  }

  // ── Import all ─────────────────────────────────────────────────────────────

  const handleImport = async () => {
    if (!apiKey.trim() || testState !== 'ok') return
    setImporting(true)
    setImportResult(null)
    try {
      // Long operation — give it 3 minutes
      const res = await api.post('/api/beds24/import', { apiKey: apiKey.trim() }, { timeout: 180000 })
      if (res.data?.success) {
        setImportResult(res.data)
        onComplete?.(res.data)
      } else {
        setImportResult(res.data)
        flash(res.data?.message ?? 'Import failed')
      }
    } catch (err) {
      flash(err.response?.data?.message ?? err.message ?? 'Import failed')
    } finally {
      setImporting(false)
    }
  }

  // ── Result screen ──────────────────────────────────────────────────────────

  if (importResult?.success) {
    const { totals, log, message } = importResult
    return (
      <div className='b24-page'>
        <div className='b24-result'>
          <div className='b24-result__icon b24-result__icon--ok'><Check size={32} /></div>
          <h2 className='b24-result__title'>Import Complete</h2>
          <p className='b24-result__sub'>{message}</p>

          <div className='b24-result__stats'>
            <div className='b24-stat-box'>
              <span className='b24-stat-box__num'>{totals?.properties ?? 0}</span>
              <span className='b24-stat-box__label'>New Properties</span>
            </div>
            <div className='b24-stat-box'>
              <span className='b24-stat-box__num'>{totals?.rooms ?? 0}</span>
              <span className='b24-stat-box__label'>Room Types</span>
            </div>
            <div className='b24-stat-box'>
              <span className='b24-stat-box__num'>{totals?.reservations ?? 0}</span>
              <span className='b24-stat-box__label'>Reservations</span>
            </div>
          </div>

          {log?.length > 0 && (
            <div className='b24-log-wrap'>
              <button className='b24-log-toggle' onClick={() => setShowLog(p => !p)}>
                {showLog ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                {showLog ? 'Hide' : 'Show'} import log ({log.length} lines)
              </button>
              {showLog && (
                <div className='b24-log'>
                  {log.map((line, i) => (
                    <div key={i} className={`b24-log__line${line.startsWith('  ') ? ' b24-log__line--indent' : ''}`}>
                      {line}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className='b24-result__actions'>
            <button className='b24-btn b24-btn--primary' onClick={onBack}>
              View My Properties
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── Main screen ────────────────────────────────────────────────────────────

  return (
    <div className='b24-page'>
      {notice && (
        <div className={`b24-toast b24-toast--${notice.type}`}>
          {notice.type === 'error' ? <AlertCircle size={14} /> : <Check size={14} />}
          {notice.msg}
        </div>
      )}

      {/* Header */}
      <div className='b24-header'>
        <button className='b24-back' onClick={onBack}>
          <ArrowLeft size={16} /> Back
        </button>
        <div>
          <h2 className='b24-title'>Import from Beds24</h2>
          <p className='b24-sub'>
            Pull your properties, room types, rates and reservations from Beds24
            into PropNect. Beds24 is certified with Booking.com, Expedia, Airbnb,
            Agoda, Hotels.com and 100+ other OTAs.
          </p>
        </div>
      </div>

      {/* Step 1 — API key */}
      <div className='b24-card'>
        <div className='b24-card__num'>1</div>
        <div className='b24-card__body'>
          <h3>Enter your Beds24 API token</h3>
          <p className='b24-hint'>
            Find it in Beds24: <strong>Settings → Account → Developer Access → Generate Token</strong>.
            Use the long-lived developer token (~160 characters), not the account API keys.
          </p>
          <div className='b24-key-row'>
            <input
              className='b24-input'
              type={showKey ? 'text' : 'password'}
              placeholder='Paste your Beds24 developer token here…'
              value={apiKey}
              onChange={e => { setApiKey(e.target.value); setTestState(null) }}
              autoComplete='off'
              spellCheck={false}
            />
            <button className='b24-eye' onClick={() => setShowKey(p => !p)} title={showKey ? 'Hide' : 'Show'}>
              {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {apiKey && (
            <p className='b24-key-len'>
              Token length: <strong>{apiKey.trim().length}</strong> characters
              {apiKey.trim().length < 100 && <span className='b24-key-warn'> — expected ~160, this looks too short</span>}
            </p>
          )}

          <button
            className={`b24-btn b24-btn--outline${testState === 'ok' ? ' b24-btn--ok' : ''}`}
            onClick={handleTest}
            disabled={testState === 'loading' || !apiKey.trim()}
          >
            {testState === 'loading' ? <><Loader2 size={14} className='b24-spin' /> Testing…</>
              : testState === 'ok'   ? <><Check size={14} /> Connected</>
              : <><Plug size={14} /> Test Connection</>}
          </button>

          {testState === 'ok' && (
            <div className='b24-test-ok'>
              <Check size={14} /> {testMsg}
            </div>
          )}
          {testState === 'fail' && (
            <div className='b24-test-fail'>
              <AlertCircle size={14} /> {testMsg}
            </div>
          )}
        </div>
      </div>

      {/* Step 2 — Import */}
      {testState === 'ok' && (
        <div className='b24-card'>
          <div className='b24-card__num'>2</div>
          <div className='b24-card__body'>
            <h3>Import everything from Beds24</h3>
            <p className='b24-hint'>
              This will pull{' '}
              <strong>{propCount} propert{propCount === 1 ? 'y' : 'ies'}</strong>,
              their room types, nightly rates and existing reservations into PropNect.
              Safe to run multiple times — existing records are updated, not duplicated.
            </p>
            <ul className='b24-checklist'>
              <li><Check size={12} /> Properties (address, location, amenities)</li>
              <li><Check size={12} /> Room types (name, capacity, pricing)</li>
              <li><Check size={12} /> Nightly rates from Beds24 calendar</li>
              <li><Check size={12} /> Existing reservations (last 30 days + next year)</li>
            </ul>

            <button
              className='b24-btn b24-btn--primary'
              onClick={handleImport}
              disabled={importing}
            >
              {importing
                ? <><Loader2 size={14} className='b24-spin' /> Importing… this may take a minute</>
                : <><Download size={14} /> Import Everything from Beds24</>}
            </button>

            {importing && (
              <p className='b24-importing-note'>
                <RefreshCw size={12} className='b24-spin' />
                &nbsp;Fetching properties, rooms and reservations from Beds24 API…
              </p>
            )}
          </div>
        </div>
      )}

      {/* Info card */}
      <div className='b24-info-card'>
        <h4>How it works</h4>
        <ol>
          <li>Create a Beds24 account at <strong>beds24.com</strong> (~€10/month)</li>
          <li>Connect Booking.com, Expedia, or Airbnb inside Beds24</li>
          <li>Generate an API token in Beds24 → Settings → Account → Developer Access</li>
          <li>Paste it above and click Import — PropNect pulls everything automatically</li>
        </ol>
        <p>
          After import, PropNect stays in sync with Beds24 — availability and rates push
          to all your connected OTAs automatically when bookings are made.
        </p>
      </div>
    </div>
  )
}
