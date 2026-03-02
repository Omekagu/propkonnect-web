'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'
import { ImageIcon, Plus, Pencil, Trash2, X, Check } from 'lucide-react'

const API = process.env.NEXT_PUBLIC_BACKEND_URL

const CATEGORIES = ['Plumbing', 'Electrical', 'Carpentry', 'Painting', 'Cleaning', 'Security', 'HVAC', 'Other']

const s = {
  page: { padding: '1.5rem', fontFamily: 'sans-serif' },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: 10 },
  h2: { fontSize: '1.4rem', fontWeight: 700, color: '#111', margin: 0 },
  btnPrimary: { padding: '8px 16px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 },
  btnGhost: { padding: '8px 16px', background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 14 },
  btnDanger: { padding: '6px 12px', background: '#fef2f2', color: '#dc2626', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13 },
  form: { background: '#fff', borderRadius: 12, padding: '1.25rem', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: '1.25rem' },
  formTitle: { fontWeight: 700, fontSize: 15, marginBottom: '1rem', color: '#111' },
  grid2: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 12 },
  label: { display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 5 },
  input: { width: '100%', padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 14, boxSizing: 'border-box' },
  select: { width: '100%', padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 14, background: '#fff', boxSizing: 'border-box' },
  textarea: { width: '100%', padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 14, resize: 'vertical', boxSizing: 'border-box', marginBottom: 12 },
  formActions: { display: 'flex', gap: 8, justifyContent: 'flex-end' },
  portfolioGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' },
  card: { background: '#fff', borderRadius: 12, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  imgWrap: { height: 180, background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  img: { width: '100%', height: '100%', objectFit: 'cover' },
  cardBody: { padding: '0.85rem' },
  cardTitle: { fontWeight: 700, fontSize: 14, color: '#111', marginBottom: 4 },
  cardMeta: { fontSize: 12, color: '#6b7280', marginBottom: 8 },
  cardActions: { display: 'flex', gap: 6, justifyContent: 'flex-end' },
  empty: { textAlign: 'center', padding: '3rem', color: '#9ca3af' },
  alert: (t) => ({ padding: '10px 14px', borderRadius: 8, fontSize: 13, marginBottom: '0.75rem', background: t === 'success' ? '#f0fdf4' : '#fef2f2', color: t === 'success' ? '#16a34a' : '#dc2626' }),
}

const emptyForm = { title: '', description: '', category: '', imageUrl: '' }

export default function Portfolio () {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [editId, setEditId] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [msg, setMsg] = useState(null)

  useEffect(() => { fetchPortfolio() }, [])

  async function fetchPortfolio () {
    try {
      const { data } = await axios.get(`${API}/api/artisan/portfolio/me`, { withCredentials: true })
      setItems(data.portfolios || data.data || [])
    } catch { setItems([]) }
    setLoading(false)
  }

  async function submitForm () {
    if (!form.title) { setMsg({ type: 'error', text: 'Title is required.' }); return }
    setSubmitting(true)
    setMsg(null)
    try {
      if (editId) {
        await axios.put(`${API}/api/artisan/portfolio/${editId}`, form, { withCredentials: true })
        setMsg({ type: 'success', text: 'Portfolio item updated.' })
      } else {
        await axios.post(`${API}/api/artisan/portfolio`, form, { withCredentials: true })
        setMsg({ type: 'success', text: 'Portfolio item added.' })
      }
      setForm(emptyForm)
      setShowForm(false)
      setEditId(null)
      fetchPortfolio()
    } catch (e) {
      setMsg({ type: 'error', text: e.response?.data?.message || 'Failed to save.' })
    } finally {
      setSubmitting(false)
    }
  }

  async function deleteItem (id) {
    if (!confirm('Delete this portfolio item?')) return
    try {
      await axios.delete(`${API}/api/artisan/portfolio/${id}`, { withCredentials: true })
      setMsg({ type: 'success', text: 'Item deleted.' })
      fetchPortfolio()
    } catch { setMsg({ type: 'error', text: 'Failed to delete.' }) }
  }

  function startEdit (item) {
    setForm({ title: item.title || '', description: item.description || '', category: item.category || '', imageUrl: item.imageUrl || '' })
    setEditId(item._id)
    setShowForm(true)
  }

  return (
    <div style={s.page}>
      <div style={s.header}>
        <h2 style={s.h2}>Portfolio</h2>
        <button style={s.btnPrimary} onClick={() => { setShowForm(s => !s); setEditId(null); setForm(emptyForm) }}>
          <Plus size={16} /> Add Work
        </button>
      </div>

      {msg && <div style={s.alert(msg.type)}>{msg.text}</div>}

      {showForm && (
        <div style={s.form}>
          <div style={s.formTitle}>{editId ? 'Edit Item' : 'Add Portfolio Item'}</div>
          <div style={s.grid2}>
            <div>
              <label style={s.label}>Title *</label>
              <input style={s.input} value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Kitchen Renovation" />
            </div>
            <div>
              <label style={s.label}>Category</label>
              <select style={s.select} value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                <option value="">Select category</option>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <label style={s.label}>Image URL (optional)</label>
          <input style={{ ...s.input, marginBottom: 12 }} value={form.imageUrl} onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value }))} placeholder="https://…" />
          <label style={s.label}>Description</label>
          <textarea rows={3} style={s.textarea} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Describe this work…" />
          <div style={s.formActions}>
            <button style={s.btnGhost} onClick={() => { setShowForm(false); setEditId(null); setForm(emptyForm) }}>Cancel</button>
            <button style={s.btnPrimary} onClick={submitForm} disabled={submitting}>
              <Check size={14} /> {submitting ? 'Saving…' : editId ? 'Update' : 'Add'}
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <p style={{ color: '#6b7280' }}>Loading portfolio…</p>
      ) : items.length === 0 ? (
        <div style={s.empty}>
          <ImageIcon size={40} opacity={0.3} style={{ display: 'block', margin: '0 auto 10px' }} />
          <p>No portfolio items yet. Showcase your work to attract more clients.</p>
        </div>
      ) : (
        <div style={s.portfolioGrid}>
          {items.map(item => (
            <div key={item._id} style={s.card}>
              <div style={s.imgWrap}>
                {item.imageUrl
                  ? <img src={item.imageUrl} alt={item.title} style={s.img} />
                  : <ImageIcon size={36} opacity={0.2} />
                }
              </div>
              <div style={s.cardBody}>
                <div style={s.cardTitle}>{item.title}</div>
                <div style={s.cardMeta}>{item.category}{item.description ? ' · ' + item.description.slice(0, 60) + (item.description.length > 60 ? '…' : '') : ''}</div>
                <div style={s.cardActions}>
                  <button style={s.btnDanger} onClick={() => deleteItem(item._id)}><Trash2 size={13} /></button>
                  <button style={{ ...s.btnGhost, padding: '6px 12px', fontSize: 13 }} onClick={() => startEdit(item)}><Pencil size={13} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
