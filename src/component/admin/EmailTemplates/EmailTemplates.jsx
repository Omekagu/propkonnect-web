'use client'

import { useState, useEffect, useCallback } from 'react'
import { Save, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react'
import { emailTemplates as emailTemplatesApi } from '@/libs/api'
import './EmailTemplates.scss'

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
  const [preview, setPreview] = useState(false)

  const load = useCallback(async () => {
    try {
      setLoading(true)
      const { data } = await emailTemplatesApi.getAll()
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
    setPreview(false)
  }

  async function save () {
    if (!selected) return
    setSaving(true)
    setMsg(null)
    try {
      const { data } = await emailTemplatesApi.update(selected.type, { subject, htmlBody, isActive })
      setMsg({ type: 'success', text: 'Template saved successfully.' })
      setTemplates(prev => prev.map(t => t.type === selected.type ? data.template : t))
      setSelected(data.template)
    } catch (e) {
      setMsg({ type: 'error', text: e.response?.data?.message || 'Save failed' })
    } finally {
      setSaving(false)
    }
  }

  async function resetTemplate () {
    if (!selected || !confirm('Reset this template to its default content?')) return
    setSaving(true)
    setMsg(null)
    try {
      const { data } = await emailTemplatesApi.reset(selected.type)
      pick(data.template)
      setMsg({ type: 'success', text: 'Template reset to default.' })
      setTemplates(prev => prev.map(t => t.type === selected.type ? data.template : t))
    } catch (e) {
      setMsg({ type: 'error', text: e.response?.data?.message || 'Reset failed' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className='et-state'>
        <div className='et-spinner' />
        <span>Loading templates…</span>
      </div>
    )
  }

  return (
    <div className='et-wrap'>
      {/* Sidebar */}
      <aside className='et-sidebar'>
        <div className='et-sidebar-title'>Templates</div>
        {templates.map(t => (
          <button
            key={t.type}
            className={`et-sidebar-item${selected?.type === t.type ? ' active' : ''}`}
            onClick={() => pick(t)}
          >
            <span>{TYPE_LABELS[t.type] || t.name}</span>
            {!t.isActive && <span className='et-off-badge'>Off</span>}
          </button>
        ))}
      </aside>

      {/* Editor */}
      <main className='et-main'>
        {selected ? (
          <>
            <div className='et-main-head'>
              <div>
                <h2>{TYPE_LABELS[selected.type] || selected.name}</h2>
                <p>
                  Variables: {(selected.variables || []).map(v => `{{${v}}}`).join(', ') || 'none'}
                </p>
              </div>
              <label className='et-toggle-label'>
                <span className='et-toggle'>
                  <input
                    type='checkbox'
                    checked={isActive}
                    onChange={e => setIsActive(e.target.checked)}
                  />
                  <span className='et-toggle-track'>
                    <span className='et-toggle-knob' />
                  </span>
                </span>
                Active
              </label>
            </div>

            {msg && (
              <div className={`et-alert et-alert--${msg.type}`}>{msg.text}</div>
            )}

            <div className='et-field'>
              <label className='et-label'>Subject</label>
              <input
                className='et-input'
                value={subject}
                onChange={e => setSubject(e.target.value)}
                placeholder='Email subject line…'
              />
            </div>

            <div className='et-field'>
              <label className='et-label'>HTML Body</label>
              <textarea
                className='et-textarea'
                value={htmlBody}
                onChange={e => setHtmlBody(e.target.value)}
                rows={16}
                spellCheck={false}
              />
            </div>

            {/* Preview */}
            <button
              className='et-preview-toggle'
              onClick={() => setPreview(p => !p)}
            >
              Preview (rendered HTML)
              {preview ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
            {preview && (
              <div
                className='et-preview-frame'
                dangerouslySetInnerHTML={{ __html: htmlBody }}
              />
            )}

            <div className='et-actions'>
              <button
                className='et-btn et-btn--save'
                onClick={save}
                disabled={saving}
              >
                <Save size={14} />
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
              <button
                className='et-btn et-btn--reset'
                onClick={resetTemplate}
                disabled={saving}
              >
                <RotateCcw size={14} />
                Reset to Default
              </button>
            </div>
          </>
        ) : (
          <p className='et-empty'>Select a template to edit.</p>
        )}
      </main>
    </div>
  )
}
