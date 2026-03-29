'use client'

import { useState, useEffect } from 'react'
import { api } from '@/libs/api-client'
import { FileText, Upload, Trash2, CheckCircle, Clock } from 'lucide-react'

const DOC_TYPES = [
  { value: 'certification',   label: 'Certificate / Qualification' },
  { value: 'license',         label: 'License' },
  { value: 'insurance',       label: 'Insurance' },
  { value: 'id',              label: 'Government ID' },
  { value: 'tax-certificate', label: 'Tax Certificate' },
  { value: 'other',           label: 'Other' }
]

const s = {
  page: {
    padding: '1.5rem',
    fontFamily: 'sans-serif',
    background: '#0d1117',
    minHeight: '100%'
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '1.25rem',
    flexWrap: 'wrap',
    gap: 10
  },
  h2: { fontSize: '1.4rem', fontWeight: 700, color: '#e6edf3', margin: 0 },
  btnPrimary: {
    padding: '8px 16px',
    background: '#C4E53C',
    color: '#0d1117',
    border: 'none',
    borderRadius: 8,
    cursor: 'pointer',
    fontWeight: 700,
    fontSize: 14,
    display: 'flex',
    alignItems: 'center',
    gap: 6
  },
  btnGhost: {
    padding: '8px 16px',
    background: '#21262d',
    color: '#c9d1d9',
    border: '1px solid #30363d',
    borderRadius: 8,
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: 14
  },
  form: {
    background: '#161b22',
    borderRadius: 12,
    padding: '1.25rem',
    border: '1px solid #30363d',
    marginBottom: '1.25rem'
  },
  formTitle: {
    fontWeight: 700,
    fontSize: 15,
    marginBottom: '1rem',
    color: '#e6edf3'
  },
  grid2: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: 12,
    marginBottom: 12
  },
  label: {
    display: 'block',
    fontSize: 13,
    fontWeight: 600,
    color: '#8b949e',
    marginBottom: 5
  },
  input: {
    width: '100%',
    padding: '8px 12px',
    border: '1px solid #30363d',
    borderRadius: 8,
    fontSize: 14,
    boxSizing: 'border-box',
    background: '#21262d',
    color: '#e6edf3'
  },
  select: {
    width: '100%',
    padding: '8px 12px',
    border: '1px solid #30363d',
    borderRadius: 8,
    fontSize: 14,
    background: '#21262d',
    color: '#e6edf3',
    boxSizing: 'border-box'
  },
  fileInput: {
    width: '100%',
    padding: '8px 0',
    fontSize: 14,
    marginBottom: 12,
    color: '#c9d1d9'
  },
  formActions: { display: 'flex', gap: 8, justifyContent: 'flex-end' },
  list: { display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  row: {
    background: '#161b22',
    borderRadius: 10,
    padding: '0.85rem 1rem',
    border: '1px solid #30363d',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8
  },
  rowLeft: { display: 'flex', alignItems: 'center', gap: 12 },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 8,
    background: 'rgba(56,139,253,.15)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },
  docName: { fontWeight: 600, fontSize: 14, color: '#e6edf3' },
  docMeta: { fontSize: 12, color: '#8b949e', marginTop: 2 },
  verBadge: v => ({
    padding: '2px 8px',
    borderRadius: 20,
    fontSize: 11,
    fontWeight: 600,
    background: v ? 'rgba(46,160,67,.15)' : 'rgba(210,153,34,.15)',
    color: v ? '#3fb950' : '#d29922',
    display: 'flex',
    alignItems: 'center',
    gap: 4
  }),
  btnDanger: {
    padding: '6px 10px',
    background: 'rgba(248,81,73,.15)',
    color: '#f85149',
    border: 'none',
    borderRadius: 6,
    cursor: 'pointer',
    fontSize: 13
  },
  empty: { textAlign: 'center', padding: '3rem', color: '#6e7681' },
  alert: t => ({
    padding: '10px 14px',
    borderRadius: 8,
    fontSize: 13,
    marginBottom: '0.75rem',
    background: t === 'success' ? 'rgba(46,160,67,.15)' : 'rgba(248,81,73,.15)',
    color: t === 'success' ? '#3fb950' : '#f85149',
    border:
      '1px solid ' +
      (t === 'success' ? 'rgba(46,160,67,.3)' : 'rgba(248,81,73,.3)')
  }),
  info: {
    background: 'rgba(56,139,253,.1)',
    border: '1px solid rgba(56,139,253,.25)',
    borderRadius: 8,
    padding: '0.75rem',
    fontSize: 13,
    color: '#58a6ff',
    marginBottom: '1rem'
  }
}

export default function Certifications () {
  const [docs, setDocs] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', type: 'certification' })
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [msg, setMsg] = useState(null)

  useEffect(() => {
    fetchDocs()
  }, [])

  async function fetchDocs () {
    try {
      const { data } = await api.get('/api/artisan/documents')
      setDocs(data.documents || data.data || [])
    } catch {
      setDocs([])
    }
    setLoading(false)
  }

  async function uploadDoc () {
    if (!form.name) {
      setMsg({ type: 'error', text: 'Please enter a document name.' })
      return
    }
    if (!file) {
      setMsg({ type: 'error', text: 'Please select a file to upload.' })
      return
    }
    setUploading(true)
    setMsg(null)
    try {
      const fd = new FormData()
      fd.append('document', file)
      fd.append('name', form.name)
      fd.append('type', form.type)
      await api.post('/api/artisan/documents', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setMsg({ type: 'success', text: 'Document uploaded successfully.' })
      setShowForm(false)
      setForm({ name: '', type: 'certification' })
      setFile(null)
      fetchDocs()
    } catch (e) {
      setMsg({
        type: 'error',
        text: e.response?.data?.message || 'Upload failed.'
      })
    } finally {
      setUploading(false)
    }
  }

  async function deleteDoc (docId) {
    if (!confirm('Delete this document?')) return
    try {
      await api.delete(`/api/artisan/documents/${docId}`)
      setMsg({ type: 'success', text: 'Document deleted.' })
      fetchDocs()
    } catch {
      setMsg({ type: 'error', text: 'Failed to delete.' })
    }
  }

  return (
    <div style={s.page}>
      <div style={s.header}>
        <h2 style={s.h2}>Certifications & Documents</h2>
        <button style={s.btnPrimary} onClick={() => setShowForm(v => !v)}>
          <Upload size={16} /> Upload Document
        </button>
      </div>

      {msg && <div style={s.alert(msg.type)}>{msg.text}</div>}

      <div style={s.info}>
        Upload your certifications, qualifications, and licenses. Verified
        documents boost client trust and help you win more jobs.
      </div>

      {showForm && (
        <div style={s.form}>
          <div style={s.formTitle}>Upload New Document</div>
          <div style={s.grid2}>
            <div>
              <label style={s.label}>Document Name *</label>
              <input
                style={s.input}
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder='e.g. Electrical License'
              />
            </div>
            <div>
              <label style={s.label}>Type</label>
              <select
                style={s.select}
                value={form.type}
                onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
              >
                {DOC_TYPES.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
          </div>
          <label style={s.label}>File (PDF, JPG, PNG)</label>
          <input
            type='file'
            accept='.pdf,.jpg,.jpeg,.png'
            style={s.fileInput}
            onChange={e => setFile(e.target.files[0])}
          />
          <div style={s.formActions}>
            <button style={s.btnGhost} onClick={() => setShowForm(false)}>
              Cancel
            </button>
            <button
              style={s.btnPrimary}
              onClick={uploadDoc}
              disabled={uploading}
            >
              <Upload size={14} /> {uploading ? 'Uploading…' : 'Upload'}
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <p style={{ color: '#8b949e' }}>Loading documents…</p>
      ) : docs.length === 0 ? (
        <div style={s.empty}>
          <FileText
            size={40}
            opacity={0.3}
            style={{ display: 'block', margin: '0 auto 10px' }}
            color='#6e7681'
          />
          <p>
            No documents uploaded yet. Add your certifications to build trust
            with clients.
          </p>
        </div>
      ) : (
        <div style={s.list}>
          {docs.map(doc => (
            <div key={doc._id} style={s.row}>
              <div style={s.rowLeft}>
                <div style={s.iconWrap}>
                  <FileText size={20} color='#58a6ff' />
                </div>
                <div>
                  <div style={s.docName}>
                    {doc.name || doc.originalName || 'Document'}
                  </div>
                  <div style={s.docMeta}>
                    {DOC_TYPES.find(t => t.value === doc.type)?.label || doc.type || 'Document'} ·{' '}
                    {new Date(
                      doc.uploadedAt || doc.createdAt
                    ).toLocaleDateString()}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={s.verBadge(doc.verified)}>
                  {doc.verified ? (
                    <CheckCircle size={12} />
                  ) : (
                    <Clock size={12} />
                  )}
                  {doc.verified ? 'Verified' : 'Pending'}
                </span>
                {doc.url && (
                  <a
                    href={doc.url}
                    target='_blank'
                    rel='noreferrer'
                    style={{
                      fontSize: 13,
                      color: '#58a6ff',
                      textDecoration: 'none'
                    }}
                  >
                    View
                  </a>
                )}
                <button style={s.btnDanger} onClick={() => deleteDoc(doc._id)}>
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
