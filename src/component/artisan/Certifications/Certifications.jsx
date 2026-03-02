'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'
import { FileText, Upload, Trash2, CheckCircle, Clock } from 'lucide-react'

const API = process.env.NEXT_PUBLIC_BACKEND_URL

const DOC_TYPES = ['Certificate', 'Qualification', 'License', 'Insurance', 'ID', 'Other']

const s = {
  page: { padding: '1.5rem', fontFamily: 'sans-serif' },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: 10 },
  h2: { fontSize: '1.4rem', fontWeight: 700, color: '#111', margin: 0 },
  btnPrimary: { padding: '8px 16px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 },
  btnGhost: { padding: '8px 16px', background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 14 },
  form: { background: '#fff', borderRadius: 12, padding: '1.25rem', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: '1.25rem' },
  formTitle: { fontWeight: 700, fontSize: 15, marginBottom: '1rem', color: '#111' },
  grid2: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 12 },
  label: { display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 5 },
  input: { width: '100%', padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 14, boxSizing: 'border-box' },
  select: { width: '100%', padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 14, background: '#fff', boxSizing: 'border-box' },
  fileInput: { width: '100%', padding: '8px 0', fontSize: 14, marginBottom: 12 },
  formActions: { display: 'flex', gap: 8, justifyContent: 'flex-end' },
  list: { display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  row: { background: '#fff', borderRadius: 10, padding: '0.85rem 1rem', boxShadow: '0 2px 6px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 },
  rowLeft: { display: 'flex', alignItems: 'center', gap: 12 },
  iconWrap: { width: 40, height: 40, borderRadius: 8, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  docName: { fontWeight: 600, fontSize: 14, color: '#111' },
  docMeta: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  verBadge: (v) => ({ padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: v ? '#f0fdf4' : '#fef3c7', color: v ? '#16a34a' : '#d97706', display: 'flex', alignItems: 'center', gap: 4 }),
  btnDanger: { padding: '6px 10px', background: '#fef2f2', color: '#dc2626', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13 },
  empty: { textAlign: 'center', padding: '3rem', color: '#9ca3af' },
  alert: (t) => ({ padding: '10px 14px', borderRadius: 8, fontSize: 13, marginBottom: '0.75rem', background: t === 'success' ? '#f0fdf4' : '#fef2f2', color: t === 'success' ? '#16a34a' : '#dc2626' }),
  info: { background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 8, padding: '0.75rem', fontSize: 13, color: '#0369a1', marginBottom: '1rem' },
}

export default function Certifications () {
  const [docs, setDocs] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', type: 'Certificate' })
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [msg, setMsg] = useState(null)

  useEffect(() => { fetchDocs() }, [])

  async function fetchDocs () {
    try {
      const { data } = await axios.get(`${API}/api/artisan/documents`, { withCredentials: true })
      setDocs(data.documents || data.data || [])
    } catch { setDocs([]) }
    setLoading(false)
  }

  async function uploadDoc () {
    if (!form.name) { setMsg({ type: 'error', text: 'Please enter a document name.' }); return }
    if (!file) { setMsg({ type: 'error', text: 'Please select a file to upload.' }); return }
    setUploading(true)
    setMsg(null)
    try {
      const fd = new FormData()
      fd.append('document', file)
      fd.append('name', form.name)
      fd.append('type', form.type)
      await axios.post(`${API}/api/artisan/documents`, fd, { withCredentials: true, headers: { 'Content-Type': 'multipart/form-data' } })
      setMsg({ type: 'success', text: 'Document uploaded successfully.' })
      setShowForm(false)
      setForm({ name: '', type: 'Certificate' })
      setFile(null)
      fetchDocs()
    } catch (e) {
      setMsg({ type: 'error', text: e.response?.data?.message || 'Upload failed.' })
    } finally {
      setUploading(false)
    }
  }

  async function deleteDoc (docId) {
    if (!confirm('Delete this document?')) return
    try {
      await axios.delete(`${API}/api/artisan/documents/${docId}`, { withCredentials: true })
      setMsg({ type: 'success', text: 'Document deleted.' })
      fetchDocs()
    } catch { setMsg({ type: 'error', text: 'Failed to delete.' }) }
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
        Upload your certifications, qualifications, and licenses. Verified documents boost client trust and help you win more jobs.
      </div>

      {showForm && (
        <div style={s.form}>
          <div style={s.formTitle}>Upload New Document</div>
          <div style={s.grid2}>
            <div>
              <label style={s.label}>Document Name *</label>
              <input style={s.input} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Electrical License" />
            </div>
            <div>
              <label style={s.label}>Type</label>
              <select style={s.select} value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                {DOC_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <label style={s.label}>File (PDF, JPG, PNG)</label>
          <input type="file" accept=".pdf,.jpg,.jpeg,.png" style={s.fileInput} onChange={e => setFile(e.target.files[0])} />
          <div style={s.formActions}>
            <button style={s.btnGhost} onClick={() => setShowForm(false)}>Cancel</button>
            <button style={s.btnPrimary} onClick={uploadDoc} disabled={uploading}>
              <Upload size={14} /> {uploading ? 'Uploading…' : 'Upload'}
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <p style={{ color: '#6b7280' }}>Loading documents…</p>
      ) : docs.length === 0 ? (
        <div style={s.empty}>
          <FileText size={40} opacity={0.3} style={{ display: 'block', margin: '0 auto 10px' }} />
          <p>No documents uploaded yet. Add your certifications to build trust with clients.</p>
        </div>
      ) : (
        <div style={s.list}>
          {docs.map(doc => (
            <div key={doc._id} style={s.row}>
              <div style={s.rowLeft}>
                <div style={s.iconWrap}><FileText size={20} color="#2563eb" /></div>
                <div>
                  <div style={s.docName}>{doc.name || doc.originalName || 'Document'}</div>
                  <div style={s.docMeta}>{doc.type || 'Document'} · {new Date(doc.uploadedAt || doc.createdAt).toLocaleDateString()}</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={s.verBadge(doc.verified)}>
                  {doc.verified ? <CheckCircle size={12} /> : <Clock size={12} />}
                  {doc.verified ? 'Verified' : 'Pending'}
                </span>
                {doc.url && (
                  <a href={doc.url} target="_blank" rel="noreferrer" style={{ fontSize: 13, color: '#2563eb', textDecoration: 'none' }}>View</a>
                )}
                <button style={s.btnDanger} onClick={() => deleteDoc(doc._id)}><Trash2 size={13} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
