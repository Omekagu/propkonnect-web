'use client'

import React, { useState, useRef, useCallback } from 'react'
import { api } from '@/libs/api-client'
import {
  ArrowLeft,
  Upload,
  Download,
  Check,
  AlertCircle,
  X,
  Loader2,
  FileText,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import './BatchUpload.scss'

// ─── CSV Template columns ──────────────────────────────────────────────────
const TEMPLATE_COLUMNS = [
  'title',
  'description',
  'category',
  'purpose',
  'price',
  'rentPrice',
  'rentFrequency',
  'currency',
  'location',
  'address',
  'city',
  'state',
  'country',
  'bedrooms',
  'bathrooms',
  'sqft',
  'features',
  'tags',
  'status'
]

const SAMPLE_ROW = [
  '3-Bedroom Flat, Lekki',
  'Spacious modern apartment with ocean view',
  'Apartment',
  'For Rent',
  '',
  '350000',
  'monthly',
  'NGN',
  'Lekki Phase 1, Lagos',
  '15 Ocean Drive',
  'Lagos',
  'Lagos',
  'Nigeria',
  '3',
  '2',
  '1200',
  'Air Conditioning|Parking|Swimming Pool',
  'luxury|waterfront',
  'draft'
]

const REQUIRED_COLS = ['title']

const CATEGORY_VALUES = [
  'Apartment',
  'House',
  'Shortlet',
  'Hotel',
  'Land',
  'Commercial'
]
const PURPOSE_VALUES = ['For Rent', 'For Sale', 'Both', 'Lease']
const FREQ_VALUES = ['daily', 'weekly', 'monthly', 'yearly', 'per night']
const STATUS_VALUES = ['draft', 'pending_review', 'published']

// ─── Helpers ──────────────────────────────────────────────────────────────────

function downloadTemplate () {
  const header = TEMPLATE_COLUMNS.join(',')
  const sample = SAMPLE_ROW.map(v => `"${v}"`).join(',')
  const csv = [header, sample].join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'propnekt_bulk_template.csv'
  a.click()
  URL.revokeObjectURL(url)
}

function parseCSV (text) {
  const lines = text.trim().split(/\r?\n/)
  if (lines.length < 2) return { headers: [], rows: [] }

  // Simple CSV parser (handles quoted fields)
  function parseLine (line) {
    const result = []
    let cur = ''
    let inQuote = false
    for (let i = 0; i < line.length; i++) {
      const ch = line[i]
      if (ch === '"') {
        if (inQuote && line[i + 1] === '"') {
          cur += '"'
          i++
        } else inQuote = !inQuote
      } else if (ch === ',' && !inQuote) {
        result.push(cur.trim())
        cur = ''
      } else {
        cur += ch
      }
    }
    result.push(cur.trim())
    return result
  }

  const headers = parseLine(lines[0]).map(h =>
    h.toLowerCase().replace(/\s+/g, '')
  )
  const rows = lines
    .slice(1)
    .filter(l => l.trim())
    .map((line, i) => {
      const vals = parseLine(line)
      const obj = { _rowNum: i + 2 }
      headers.forEach((h, idx) => {
        obj[h] = vals[idx] || ''
      })
      return obj
    })
  return { headers, rows }
}

function validateRow (row) {
  const errs = []
  if (!row.title?.trim()) errs.push('title required')
  if (row.category && !CATEGORY_VALUES.includes(row.category))
    errs.push(`invalid category "${row.category}"`)
  if (row.purpose && !PURPOSE_VALUES.includes(row.purpose))
    errs.push(`invalid purpose "${row.purpose}"`)
  if (row.rentfrequency && !FREQ_VALUES.includes(row.rentfrequency))
    errs.push(`invalid rentFrequency "${row.rentfrequency}"`)
  if (row.price && isNaN(Number(row.price))) errs.push('price must be a number')
  if (row.rentprice && isNaN(Number(row.rentprice)))
    errs.push('rentPrice must be a number')
  if (row.bedrooms && isNaN(Number(row.bedrooms)))
    errs.push('bedrooms must be a number')
  if (row.bathrooms && isNaN(Number(row.bathrooms)))
    errs.push('bathrooms must be a number')
  return errs
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function BatchUpload ({ onBack, onComplete }) {
  const [dragOver, setDragOver] = useState(false)
  const [fileName, setFileName] = useState(null)
  const [parsed, setParsed] = useState(null) // { headers, rows, validRows, errorRows }
  const [parseError, setParseError] = useState(null)
  const [showPreview, setShowPreview] = useState(true)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null) // { created, errors, batchId }
  const [notice, setNotice] = useState(null)
  const [batchId, setBatchId] = useState(null)

  const fileRef = useRef(null)

  const flash = useCallback((msg, type = 'error') => {
    setNotice({ msg, type })
    setTimeout(() => setNotice(null), 4000)
  }, [])

  const processFile = useCallback(file => {
    if (!file) return
    if (!file.name.match(/\.csv$/i)) {
      setParseError('Please upload a .csv file')
      return
    }
    setFileName(file.name)
    setParseError(null)
    setParsed(null)
    setResult(null)
    setBatchId(`batch_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`)

    const reader = new FileReader()
    reader.onload = e => {
      try {
        const { headers, rows } = parseCSV(e.target.result)
        if (!rows.length) {
          setParseError('No data rows found in file')
          return
        }

        // Check required columns
        const missing = REQUIRED_COLS.filter(c => !headers.includes(c))
        if (missing.length) {
          setParseError(`Missing required columns: ${missing.join(', ')}`)
          return
        }

        const annotated = rows.map(row => ({
          ...row,
          _errors: validateRow(row)
        }))
        const validRows = annotated.filter(r => r._errors.length === 0)
        const errorRows = annotated.filter(r => r._errors.length > 0)

        setParsed({ headers, rows: annotated, validRows, errorRows })
      } catch (err) {
        setParseError('Failed to parse CSV: ' + err.message)
      }
    }
    reader.readAsText(file)
  }, [])

  const onDrop = useCallback(
    e => {
      e.preventDefault()
      setDragOver(false)
      const file = e.dataTransfer.files[0]
      processFile(file)
    },
    [processFile]
  )

  const onFileChange = e => processFile(e.target.files[0])

  const handleSubmit = async () => {
    if (!parsed?.validRows.length || result) return // prevent resubmit after success
    setLoading(true)

    // Normalize row keys for backend
    const toSend = parsed.validRows.map(row => ({
      title: row.title,
      description: row.description,
      category: row.category,
      purpose: row.purpose,
      price: row.price,
      rentPrice: row.rentprice || row.rentPrice,
      rentFrequency: row.rentfrequency || row.rentFrequency,
      currency: row.currency,
      location: row.location,
      address: row.address,
      city: row.city,
      state: row.state,
      country: row.country,
      bedrooms: row.bedrooms,
      bathrooms: row.bathrooms,
      sqft: row.sqft,
      features: row.features
        ? row.features
            .split('|')
            .map(s => s.trim())
            .filter(Boolean)
        : [],
      tags: row.tags
        ? row.tags
            .split('|')
            .map(s => s.trim())
            .filter(Boolean)
        : [],
      status: row.status || 'draft'
    }))

    try {
      const res = await api.post('/api/properties/bulk', {
        properties: toSend,
        filename: fileName,
        batchId
      })
      if (res.data?.success) {
        setResult(res.data)
        onComplete?.(res.data)
      } else {
        flash(res.data?.msg || 'Upload failed')
      }
    } catch (err) {
      flash(err.response?.data?.msg || err.message || 'Upload failed')
    } finally {
      setLoading(false)
    }
  }

  // ── Result screen ────────────────────────────────────────────────────────
  if (result) {
    return (
      <div className='bu-page'>
        <div className='bu-result'>
          <div className='bu-result__icon bu-result__icon--success'>
            <Check size={32} />
          </div>
          <h2 className='bu-result__title'>Batch Upload Complete</h2>
          <p className='bu-result__sub'>
            <strong>{result.created}</strong> properties created and saved as
            drafts.
          </p>
          {result.errors?.length > 0 && (
            <div className='bu-result__errors'>
              <p className='bu-result__err-title'>
                <AlertCircle size={14} /> {result.errors.length} row(s) failed:
              </p>
              <ul>
                {result.errors.map((e, i) => (
                  <li key={i}>
                    <strong>Row {e.row}:</strong> {e.error}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className='bu-result__actions'>
            <button className='bu-btn bu-btn--primary' onClick={onBack}>
              Go to My Properties
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── Main upload screen ───────────────────────────────────────────────────
  return (
    <div className='bu-page'>
      {notice && (
        <div className={`bu-toast bu-toast--${notice.type}`}>
          {notice.type === 'error' ? (
            <AlertCircle size={14} />
          ) : (
            <Check size={14} />
          )}
          {notice.msg}
        </div>
      )}

      {/* Header */}
      <div className='bu-header'>
        <button className='bu-back' onClick={onBack}>
          <ArrowLeft size={16} /> Back
        </button>
        <div>
          <h2 className='bu-title'>Batch / CSV Upload</h2>
          <p className='bu-sub'>
            Upload up to 500 properties at once from a spreadsheet
          </p>
        </div>
      </div>

      {/* Step 1: Download template */}
      <div className='bu-card'>
        <div className='bu-card__num'>1</div>
        <div className='bu-card__body'>
          <h3>Download the template</h3>
          <p>
            Use our CSV template to ensure your data is in the correct format.
            Pipe-separate multiple values for features and tags (e.g.{' '}
            <code>Air Conditioning|Parking|Pool</code>).
          </p>
          <button className='bu-btn bu-btn--ghost' onClick={downloadTemplate}>
            <Download size={15} /> Download CSV Template
          </button>
        </div>
      </div>

      {/* Step 2: Upload file */}
      <div className='bu-card'>
        <div className='bu-card__num'>2</div>
        <div className='bu-card__body'>
          <h3>Upload your file</h3>
          <div
            className={`bu-dropzone${dragOver ? ' bu-dropzone--over' : ''}${
              fileName ? ' bu-dropzone--filled' : ''
            }`}
            onDragOver={e => {
              e.preventDefault()
              setDragOver(true)
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            onClick={() => fileRef.current?.click()}
          >
            <input
              ref={fileRef}
              type='file'
              accept='.csv'
              style={{ display: 'none' }}
              onChange={onFileChange}
            />
            {fileName ? (
              <div className='bu-dropzone__filled'>
                <FileText size={24} />
                <span>{fileName}</span>
                <button
                  className='bu-clear'
                  onClick={e => {
                    e.stopPropagation()
                    setFileName(null)
                    setParsed(null)
                    setParseError(null)
                  }}
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <>
                <Upload size={28} />
                <p>
                  Drag & drop your CSV here, or{' '}
                  <span className='bu-link'>browse</span>
                </p>
                <p className='bu-dropzone__hint'>
                  Only .csv files • Max 500 rows
                </p>
              </>
            )}
          </div>
          {parseError && (
            <div className='bu-parse-error'>
              <AlertCircle size={14} /> {parseError}
            </div>
          )}
        </div>
      </div>

      {/* Step 3: Preview + validate */}
      {parsed && (
        <div className='bu-card'>
          <div className='bu-card__num'>3</div>
          <div className='bu-card__body'>
            <div className='bu-preview-header'>
              <div>
                <h3>Preview & Validate</h3>
                <div className='bu-stats'>
                  <span className='bu-stat bu-stat--ok'>
                    <Check size={12} /> {parsed.validRows.length} valid
                  </span>
                  {parsed.errorRows.length > 0 && (
                    <span className='bu-stat bu-stat--err'>
                      <AlertCircle size={12} /> {parsed.errorRows.length} errors
                    </span>
                  )}
                  <span className='bu-stat'>Total: {parsed.rows.length}</span>
                </div>
              </div>
              <button
                className='bu-toggle'
                onClick={() => setShowPreview(p => !p)}
              >
                {showPreview ? (
                  <ChevronUp size={16} />
                ) : (
                  <ChevronDown size={16} />
                )}
                {showPreview ? 'Hide' : 'Show'} preview
              </button>
            </div>

            {showPreview && (
              <div className='bu-table-wrap'>
                <table className='bu-table'>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Title</th>
                      <th>Category</th>
                      <th>Purpose</th>
                      <th>Price</th>
                      <th>Location</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsed.rows.slice(0, 50).map((row, i) => (
                      <tr
                        key={i}
                        className={
                          row._errors.length ? 'bu-row--err' : 'bu-row--ok'
                        }
                      >
                        <td>{row._rowNum}</td>
                        <td>
                          {row.title || <em className='bu-empty'>—</em>}
                          {row._errors.length > 0 && (
                            <div className='bu-row-errors'>
                              {row._errors.join('; ')}
                            </div>
                          )}
                        </td>
                        <td>{row.category || '—'}</td>
                        <td>{row.purpose || '—'}</td>
                        <td>{row.price || row.rentprice || '—'}</td>
                        <td>{row.city || row.location || '—'}</td>
                        <td>{row.status || 'draft'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {parsed.rows.length > 50 && (
                  <p className='bu-more'>
                    Showing first 50 of {parsed.rows.length} rows
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Submit */}
      {parsed && (
        <div className='bu-footer'>
          {parsed.errorRows.length > 0 && (
            <p className='bu-footer__warn'>
              <AlertCircle size={14} /> {parsed.errorRows.length} rows will be
              skipped due to errors. Only {parsed.validRows.length} valid rows
              will be uploaded.
            </p>
          )}
          <div className='bu-footer__actions'>
            <button className='bu-btn bu-btn--ghost' onClick={onBack}>
              Cancel
            </button>
            <button
              className='bu-btn bu-btn--primary'
              onClick={handleSubmit}
              disabled={loading || parsed.validRows.length === 0}
            >
              {loading ? (
                <>
                  <Loader2 size={14} className='bu-spin' /> Uploading…
                </>
              ) : (
                <>
                  <Upload size={14} /> Upload {parsed.validRows.length}{' '}
                  properties
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
