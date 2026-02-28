'use client'

import { useState, useEffect, useCallback } from 'react'
import axios from 'axios'

const API = process.env.NEXT_PUBLIC_BACKEND_URL

const TYPE_LABELS = {
  welcome:              'Welcome Email',
  otp:                  'OTP Verification',
  application_status:   'Application Status',
  bid_status:           'Bid Status',
  payment_confirmation: 'Payment Confirmation',
  maintenance_update:   'Maintenance Update',
  lease_signed:         'Lease Signed',
  password_reset:       'Password Reset'
}

export default function EmailTemplates () {
  const [templates, setTemplates] = useState([])
  const [selected, setSelected] = useState(null)
  const [subject, setSubject] = useState('')
  const [htmlBody, setHtmlBody] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState(null)

  const load = useCallback(async () => {
    try {
      setLoading(true)
      const { data } = await axios.get(`${API}/api/admin/email-templates`, { withCredentials: true })
      setTemplates(data.templates || [])
      if (data.templates?.length > 0 && !selected) {
        pick(data.templates[0])
      }
    } catch (e) {
      setMsg({ type: 'error', text: e.response?.data?.message || 'Failed to load templates' })
    } finally {
      setLoading(false)
    }
  }, []) // eslint-disable-line

  useEffect(() => { load() }, [load])

  function pick (t) {
    setSelected(t)
    setSubject(t.subject)
    setHtmlBody(t.htmlBody)
    setIsActive(t.isActive ?? true)
    setMsg(null)
  }

  async function save () {
    if (!selected) return
    setSaving(true)
    setMsg(null)
    try {
      const { data } = await axios.put(
        `${API}/api/admin/email-templates/${selected.type}`,
        { subject, htmlBody, isActive },
        { withCredentials: true }
      )
      setMsg({ type: 'success', text: 'Template saved successfully.' })
      setTemplates(prev => prev.map(t => t.type === selected.type ? data.template : t))
      setSelected(data.template)
    } catch (e) {
      setMsg({ type: 'error', text: e.response?.data?.message || 'Save failed' })
    } finally {
      setSaving(false)
    }
  }

  async function reset () {
    if (!selected || !confirm('Reset this template to its default content?')) return
    setSaving(true)
    setMsg(null)
    try {
      const { data } = await axios.post(
        `${API}/api/admin/email-templates/${selected.type}/reset`,
        {},
        { withCredentials: true }
      )
      pick(data.template)
      setMsg({ type: 'success', text: 'Template reset to default.' })
      setTemplates(prev => prev.map(t => t.type === selected.type ? data.template : t))
    } catch (e) {
      setMsg({ type: 'error', text: e.response?.data?.message || 'Reset failed' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div style={{ padding: 32, color: '#888' }}>Loading templates…</div>

  return (
    <div style={{ display: 'flex', gap: 0, minHeight: '80vh', fontFamily: 'sans-serif' }}>
      {/* Sidebar */}
      <aside style={{
        width: 220, borderRight: '1px solid #e5e7eb', padding: '16px 0',
        background: '#fafafa', flexShrink: 0
      }}>
        <div style={{ padding: '0 16px 12px', fontWeight: 700, fontSize: 13, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 1 }}>
          Templates
        </div>
        {templates.map(t => (
          <button
            key={t.type}
            onClick={() => pick(t)}
            style={{
              width: '100%', textAlign: 'left', padding: '10px 16px',
              border: 'none', cursor: 'pointer', fontSize: 14,
              background: selected?.type === t.type ? '#eff6ff' : 'transparent',
              color: selected?.type === t.type ? '#2563eb' : '#374151',
              fontWeight: selected?.type === t.type ? 700 : 400,
              borderLeft: selected?.type === t.type ? '3px solid #2563eb' : '3px solid transparent'
            }}
          >
            {TYPE_LABELS[t.type] || t.name}
            {!t.isActive && <span style={{ marginLeft: 6, fontSize: 10, color: '#ef4444' }}>OFF</span>}
          </button>
        ))}
      </aside>

      {/* Editor */}
      <main style={{ flex: 1, padding: 28, maxWidth: 860 }}>
        {selected ? (
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div>
                <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>{TYPE_LABELS[selected.type] || selected.name}</h2>
                <p style={{ margin: '4px 0 0', fontSize: 13, color: '#6b7280' }}>
                  Variables: {(selected.variables || []).map(v => `{{${v}}}`).join(', ') || 'none'}
                </p>
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, cursor: 'pointer' }}>
                <input type='checkbox' checked={isActive} onChange={e => setIsActive(e.target.checked)} />
                Active
              </label>
            </div>

            {msg && (
              <div style={{
                padding: '10px 16px', borderRadius: 8, marginBottom: 16,
                background: msg.type === 'success' ? '#f0fdf4' : '#fef2f2',
                color: msg.type === 'success' ? '#16a34a' : '#dc2626',
                border: `1px solid ${msg.type === 'success' ? '#bbf7d0' : '#fecaca'}`
              }}>{msg.text}</div>
            )}

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontWeight: 600, fontSize: 13, marginBottom: 6, color: '#374151' }}>
                Subject
              </label>
              <input
                value={subject}
                onChange={e => setSubject(e.target.value)}
                style={{
                  width: '100%', padding: '10px 12px', borderRadius: 8,
                  border: '1px solid #d1d5db', fontSize: 14, boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontWeight: 600, fontSize: 13, marginBottom: 6, color: '#374151' }}>
                HTML Body
              </label>
              <textarea
                value={htmlBody}
                onChange={e => setHtmlBody(e.target.value)}
                rows={16}
                style={{
                  width: '100%', padding: '10px 12px', borderRadius: 8,
                  border: '1px solid #d1d5db', fontSize: 13, fontFamily: 'monospace',
                  resize: 'vertical', boxSizing: 'border-box', lineHeight: 1.6
                }}
              />
            </div>

            {/* Preview pane */}
            <details style={{ marginBottom: 20 }}>
              <summary style={{ cursor: 'pointer', fontWeight: 600, fontSize: 13, color: '#6b7280', userSelect: 'none' }}>
                Preview (rendered HTML)
              </summary>
              <div style={{
                marginTop: 12, padding: 16, borderRadius: 8,
                border: '1px solid #e5e7eb', background: '#fff'
              }}
                dangerouslySetInnerHTML={{ __html: htmlBody }}
              />
            </details>

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={save}
                disabled={saving}
                style={{
                  padding: '10px 24px', background: '#2563eb', color: '#fff',
                  border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer',
                  opacity: saving ? 0.6 : 1
                }}
              >
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
              <button
                onClick={reset}
                disabled={saving}
                style={{
                  padding: '10px 24px', background: '#f3f4f6', color: '#374151',
                  border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer'
                }}
              >
                Reset to Default
              </button>
            </div>
          </>
        ) : (
          <p style={{ color: '#9ca3af' }}>Select a template to edit.</p>
        )}
      </main>
    </div>
  )
}
