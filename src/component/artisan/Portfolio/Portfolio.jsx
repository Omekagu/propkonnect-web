'use client'

import { useState, useEffect, useRef } from 'react'
import { api } from '@/libs/api-client'
import {
  ImageIcon, Plus, Pencil, Trash2, Check, X,
  Briefcase, Star, Tag, FileText, ExternalLink,
  ChevronDown, Grid, List
} from 'lucide-react'

const CATEGORIES = [
  'Plumbing', 'Electrical', 'Carpentry', 'Painting',
  'Cleaning', 'Security', 'HVAC', 'Tiling',
  'Landscaping', 'Roofing', 'Welding', 'Other'
]

const CAT_COLORS = {
  Plumbing: '#3b82f6', Electrical: '#f59e0b', Carpentry: '#92400e',
  Painting: '#ec4899', Cleaning: '#06b6d4', Security: '#6366f1',
  HVAC: '#14b8a6', Tiling: '#8b5cf6', Landscaping: '#22c55e',
  Roofing: '#f97316', Welding: '#ef4444', Other: '#6b7280'
}

const s = {
  page: { padding: '1.5rem', background: '#0d1117', minHeight: '100%', fontFamily: 'Inter, sans-serif' },

  // Top bar
  topBar: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: 10 },
  headingGroup: { display: 'flex', flexDirection: 'column', gap: 4 },
  h2: { fontSize: '1.4rem', fontWeight: 700, color: '#e6edf3', margin: 0 },
  subheading: { fontSize: 13, color: '#8b949e', margin: 0 },
  topActions: { display: 'flex', gap: 8, alignItems: 'center' },

  // Buttons
  btnPrimary: {
    padding: '9px 16px', background: '#C4E53C', color: '#0d1117',
    border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 700,
    fontSize: 13, display: 'flex', alignItems: 'center', gap: 6
  },
  btnGhost: {
    padding: '8px 14px', background: '#21262d', color: '#c9d1d9',
    border: '1px solid #30363d', borderRadius: 8, cursor: 'pointer',
    fontWeight: 600, fontSize: 13, display: 'flex', alignItems: 'center', gap: 5
  },
  btnDanger: {
    padding: '5px 10px', background: 'rgba(248,81,73,.12)',
    color: '#f85149', border: '1px solid rgba(248,81,73,.2)',
    borderRadius: 6, cursor: 'pointer', fontSize: 12,
    display: 'flex', alignItems: 'center', gap: 4
  },
  btnIcon: {
    width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: '#21262d', border: '1px solid #30363d', borderRadius: 7, cursor: 'pointer', color: '#8b949e'
  },

  // Filter strip
  filterStrip: { display: 'flex', gap: 8, marginBottom: '1.25rem', flexWrap: 'wrap', alignItems: 'center' },
  filterChip: (active) => ({
    padding: '5px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer',
    background: active ? '#C4E53C' : '#21262d',
    color: active ? '#0d1117' : '#8b949e',
    border: active ? 'none' : '1px solid #30363d'
  }),

  // Form panel
  form: {
    background: '#161b22', borderRadius: 12, padding: '1.5rem',
    border: '1px solid #30363d', marginBottom: '1.5rem'
  },
  formTitle: { fontWeight: 700, fontSize: 15, marginBottom: '1.25rem', color: '#e6edf3', display: 'flex', alignItems: 'center', gap: 8 },
  grid2: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 12 },
  fieldGroup: { display: 'flex', flexDirection: 'column', gap: 5 },
  label: { fontSize: 12, fontWeight: 600, color: '#8b949e', letterSpacing: '0.03em' },
  input: {
    width: '100%', padding: '8px 12px', border: '1px solid #30363d', borderRadius: 8,
    fontSize: 13, boxSizing: 'border-box', background: '#21262d', color: '#e6edf3', outline: 'none'
  },
  select: {
    width: '100%', padding: '8px 12px', border: '1px solid #30363d', borderRadius: 8,
    fontSize: 13, background: '#21262d', color: '#e6edf3', boxSizing: 'border-box', outline: 'none'
  },
  textarea: {
    width: '100%', padding: '8px 12px', border: '1px solid #30363d', borderRadius: 8,
    fontSize: 13, resize: 'vertical', boxSizing: 'border-box', marginBottom: 0,
    background: '#21262d', color: '#e6edf3', outline: 'none', minHeight: 80
  },
  formActions: { display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 16 },

  // Grid layout
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' },

  // Card
  card: {
    background: '#161b22', borderRadius: 14, overflow: 'hidden',
    border: '1px solid #30363d', display: 'flex', flexDirection: 'column',
    transition: 'transform 0.15s, border-color 0.15s'
  },
  imgWrap: { height: 190, background: '#0d1117', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative' },
  img: { width: '100%', height: '100%', objectFit: 'cover', display: 'block' },
  catRibbon: (cat) => ({
    position: 'absolute', bottom: 10, left: 10,
    background: (CAT_COLORS[cat] || '#6b7280') + '22',
    border: `1px solid ${CAT_COLORS[cat] || '#6b7280'}55`,
    color: CAT_COLORS[cat] || '#8b949e',
    padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700
  }),
  cardBody: { padding: '0.9rem', flex: 1, display: 'flex', flexDirection: 'column' },
  cardTitle: { fontWeight: 700, fontSize: 14, color: '#e6edf3', marginBottom: 4 },
  cardDesc: { fontSize: 12, color: '#8b949e', lineHeight: 1.55, flex: 1, marginBottom: 12 },
  cardActions: { display: 'flex', gap: 6, justifyContent: 'flex-end', paddingTop: 8, borderTop: '1px solid #21262d' },

  // Alert
  alert: (t) => ({
    padding: '10px 14px', borderRadius: 8, fontSize: 13, marginBottom: '1rem',
    background: t === 'success' ? 'rgba(46,160,67,.15)' : 'rgba(248,81,73,.15)',
    color: t === 'success' ? '#3fb950' : '#f85149',
    border: `1px solid ${t === 'success' ? 'rgba(46,160,67,.3)' : 'rgba(248,81,73,.3)'}`
  }),

  // Empty
  empty: { textAlign: 'center', padding: '3.5rem 2rem', color: '#6e7681' },
  emptyTitle: { fontSize: 15, fontWeight: 600, color: '#8b949e', marginTop: 12, marginBottom: 6 },
  emptyText: { fontSize: 13, lineHeight: 1.6 },

  // Stats row
  statsRow: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
    gap: 12, marginBottom: '1.25rem'
  },
  statCard: {
    background: '#161b22', border: '1px solid #30363d', borderRadius: 10,
    padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 3
  },
  statNum: { fontSize: 22, fontWeight: 800, color: '#C4E53C' },
  statLabel: { fontSize: 12, color: '#8b949e', fontWeight: 600 },
}

const emptyForm = { title: '', description: '', category: '', imageUrl: '', tags: '' }

export default function Portfolio () {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [editId, setEditId] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [msg, setMsg] = useState(null)
  const [activeFilter, setActiveFilter] = useState('All')
  const [hoveredCard, setHoveredCard] = useState(null)
  const msgTimer = useRef(null)

  useEffect(() => { fetchPortfolio() }, [])

  function flash (type, text) {
    setMsg({ type, text })
    clearTimeout(msgTimer.current)
    msgTimer.current = setTimeout(() => setMsg(null), 4000)
  }

  async function fetchPortfolio () {
    setLoading(true)
    try {
      const { data } = await api.get('/api/artisan/portfolio/me')
      setItems(data.portfolios || data.data || [])
    } catch { setItems([]) }
    setLoading(false)
  }

  async function submitForm () {
    if (!form.title.trim()) { flash('error', 'Title is required.'); return }
    setSubmitting(true)
    setMsg(null)
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category,
        imageUrl: form.imageUrl.trim(),
        tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : []
      }
      if (editId) {
        await api.put(`/api/artisan/portfolio/${editId}`, payload)
        flash('success', 'Portfolio item updated.')
      } else {
        await api.post('/api/artisan/portfolio', payload)
        flash('success', 'Work added to your catalogue.')
      }
      setForm(emptyForm)
      setShowForm(false)
      setEditId(null)
      fetchPortfolio()
    } catch (e) {
      flash('error', e.response?.data?.message || 'Failed to save.')
    } finally {
      setSubmitting(false)
    }
  }

  async function deleteItem (id) {
    if (!confirm('Remove this item from your catalogue?')) return
    try {
      await api.delete(`/api/artisan/portfolio/${id}`)
      flash('success', 'Item removed.')
      fetchPortfolio()
    } catch { flash('error', 'Failed to delete.') }
  }

  function startEdit (item) {
    setForm({
      title: item.title || '',
      description: item.description || '',
      category: item.category || '',
      imageUrl: item.imageUrl || '',
      tags: Array.isArray(item.tags) ? item.tags.join(', ') : (item.tags || '')
    })
    setEditId(item._id)
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function cancelForm () { setShowForm(false); setEditId(null); setForm(emptyForm) }

  // Derived
  const categories = ['All', ...new Set(items.map(i => i.category).filter(Boolean))]
  const filtered = activeFilter === 'All' ? items : items.filter(i => i.category === activeFilter)
  const catCounts = items.reduce((acc, i) => { if (i.category) acc[i.category] = (acc[i.category] || 0) + 1; return acc }, {})

  return (
    <div style={s.page}>
      {/* ── Top bar ── */}
      <div style={s.topBar}>
        <div style={s.headingGroup}>
          <h2 style={s.h2}>My Work Catalogue</h2>
          <p style={s.subheading}>Showcase your completed projects to attract clients</p>
        </div>
        <div style={s.topActions}>
          <button
            style={s.btnPrimary}
            onClick={() => { setShowForm(v => !v); setEditId(null); setForm(emptyForm) }}
          >
            <Plus size={15} /> {showForm ? 'Cancel' : 'Add Work'}
          </button>
        </div>
      </div>

      {/* ── Stats ── */}
      {items.length > 0 && (
        <div style={s.statsRow}>
          <div style={s.statCard}>
            <span style={s.statNum}>{items.length}</span>
            <span style={s.statLabel}>Total Projects</span>
          </div>
          {Object.entries(catCounts).slice(0, 3).map(([cat, count]) => (
            <div key={cat} style={s.statCard}>
              <span style={{ ...s.statNum, color: CAT_COLORS[cat] || '#C4E53C' }}>{count}</span>
              <span style={s.statLabel}>{cat}</span>
            </div>
          ))}
        </div>
      )}

      {/* ── Alert ── */}
      {msg && <div style={s.alert(msg.type)}>{msg.text}</div>}

      {/* ── Add/Edit form ── */}
      {showForm && (
        <div style={s.form}>
          <div style={s.formTitle}>
            <Briefcase size={16} color='#C4E53C' />
            {editId ? 'Edit Portfolio Item' : 'Add New Work'}
          </div>

          <div style={s.grid2}>
            <div style={s.fieldGroup}>
              <label style={s.label}>Project Title *</label>
              <input
                style={s.input}
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder='e.g. Kitchen Plumbing Overhaul'
              />
            </div>
            <div style={s.fieldGroup}>
              <label style={s.label}>Category</label>
              <select
                style={s.select}
                value={form.category}
                onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
              >
                <option value=''>Select category…</option>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div style={{ ...s.fieldGroup, marginBottom: 12 }}>
            <label style={s.label}>Image URL (paste a link to your work photo)</label>
            <input
              style={s.input}
              value={form.imageUrl}
              onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value }))}
              placeholder='https://…'
            />
            {form.imageUrl && (
              <img
                src={form.imageUrl} alt='preview'
                style={{ height: 100, width: 180, objectFit: 'cover', borderRadius: 8, marginTop: 8, border: '1px solid #30363d' }}
                onError={e => { e.target.style.display = 'none' }}
              />
            )}
          </div>

          <div style={{ ...s.fieldGroup, marginBottom: 12 }}>
            <label style={s.label}>Description</label>
            <textarea
              rows={3}
              style={s.textarea}
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder='Describe the project — scope, materials used, results…'
            />
          </div>

          <div style={s.fieldGroup}>
            <label style={s.label}>Tags (comma-separated)</label>
            <input
              style={s.input}
              value={form.tags}
              onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
              placeholder='residential, bathroom, emergency'
            />
          </div>

          <div style={s.formActions}>
            <button style={s.btnGhost} onClick={cancelForm}>Cancel</button>
            <button style={s.btnPrimary} onClick={submitForm} disabled={submitting}>
              <Check size={14} />
              {submitting ? 'Saving…' : editId ? 'Update' : 'Add to Catalogue'}
            </button>
          </div>
        </div>
      )}

      {/* ── Category filter ── */}
      {categories.length > 1 && (
        <div style={s.filterStrip}>
          <Tag size={13} color='#8b949e' />
          {categories.map(cat => (
            <button
              key={cat}
              style={s.filterChip(activeFilter === cat)}
              onClick={() => setActiveFilter(cat)}
            >
              {cat}
              {cat !== 'All' && catCounts[cat] ? ` (${catCounts[cat]})` : ''}
            </button>
          ))}
        </div>
      )}

      {/* ── Grid ── */}
      {loading ? (
        <p style={{ color: '#8b949e', fontSize: 14 }}>Loading catalogue…</p>
      ) : filtered.length === 0 ? (
        <div style={s.empty}>
          <ImageIcon size={44} opacity={0.2} style={{ display: 'block', margin: '0 auto' }} />
          <p style={s.emptyTitle}>{activeFilter === 'All' ? 'No work added yet' : `No ${activeFilter} projects`}</p>
          <p style={s.emptyText}>
            {activeFilter === 'All'
              ? 'Add photos and descriptions of your completed projects to build trust with potential clients.'
              : `Switch to "All" or add a new ${activeFilter} project.`}
          </p>
        </div>
      ) : (
        <div style={s.grid}>
          {filtered.map(item => (
            <div
              key={item._id}
              style={{
                ...s.card,
                transform: hoveredCard === item._id ? 'translateY(-3px)' : 'none',
                borderColor: hoveredCard === item._id ? '#C4E53C44' : '#30363d'
              }}
              onMouseEnter={() => setHoveredCard(item._id)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              {/* Image */}
              <div style={s.imgWrap}>
                {item.imageUrl
                  ? <img src={item.imageUrl} alt={item.title} style={s.img} loading='lazy' />
                  : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                      <ImageIcon size={36} opacity={0.15} color='#8b949e' />
                      <span style={{ fontSize: 12, color: '#6e7681' }}>No image</span>
                    </div>
                  )
                }
                {item.category && (
                  <span style={s.catRibbon(item.category)}>{item.category}</span>
                )}
              </div>

              {/* Body */}
              <div style={s.cardBody}>
                <div style={s.cardTitle}>{item.title}</div>
                {item.description && (
                  <div style={s.cardDesc}>
                    {item.description.length > 100
                      ? item.description.slice(0, 100) + '…'
                      : item.description}
                  </div>
                )}

                {/* Tags */}
                {item.tags?.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 10 }}>
                    {item.tags.slice(0, 4).map(tag => (
                      <span
                        key={tag}
                        style={{ fontSize: 10, padding: '2px 8px', borderRadius: 20, background: '#21262d', color: '#8b949e', border: '1px solid #30363d' }}
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Actions */}
                <div style={s.cardActions}>
                  <button style={s.btnDanger} onClick={() => deleteItem(item._id)}>
                    <Trash2 size={12} /> Remove
                  </button>
                  <button
                    style={{ ...s.btnGhost, padding: '5px 10px', fontSize: 12 }}
                    onClick={() => startEdit(item)}
                  >
                    <Pencil size={12} /> Edit
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
