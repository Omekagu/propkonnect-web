/**
 * ConfirmModal — Reusable confirm/delete dialog
 *
 * Usage:
 *   <ConfirmModal
 *     open={showConfirm}
 *     title="Delete Property"
 *     message="This action cannot be undone."
 *     confirmLabel="Delete"
 *     danger
 *     loading={deleting}
 *     onConfirm={handleDelete}
 *     onCancel={() => setShowConfirm(false)}
 *   />
 */
import React from 'react'
import { AlertTriangle, Trash2, CheckCircle } from 'lucide-react'

export default function ConfirmModal ({
  open,
  title = 'Are you sure?',
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  danger = false,
  loading = false,
  onConfirm,
  onCancel
}) {
  if (!open) return null

  const confirmColor = danger
    ? { bg: '#dc2626', hover: '#b91c1c' }
    : { bg: 'var(--color-primary)', hover: 'var(--color-primary-dark, #052418)' }

  return (
    <div style={s.overlay} onClick={onCancel}>
      <div style={s.modal} onClick={e => e.stopPropagation()} role='dialog' aria-modal>
        {/* Icon */}
        <div style={{ ...s.iconWrap, background: danger ? 'rgba(239,68,68,0.1)' : 'rgba(11,61,40,0.08)' }}>
          {danger
            ? <AlertTriangle size={22} color='#dc2626' />
            : <CheckCircle size={22} color='var(--color-primary)' />
          }
        </div>

        <h2 style={s.title}>{title}</h2>
        {message && <p style={s.message}>{message}</p>}

        <div style={s.btns}>
          <button style={s.cancelBtn} onClick={onCancel} disabled={loading}>
            {cancelLabel}
          </button>
          <button
            style={{
              ...s.confirmBtn,
              background: confirmColor.bg,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Processing…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

const s = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(15,23,42,0.55)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1100,
    padding: '16px',
    backdropFilter: 'blur(2px)'
  },
  modal: {
    background: 'var(--color-surface)',
    borderRadius: '18px',
    padding: '28px 24px 24px',
    width: '100%',
    maxWidth: '400px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
    textAlign: 'center'
  },
  iconWrap: {
    width: '52px',
    height: '52px',
    borderRadius: '14px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '16px'
  },
  title: {
    fontSize: '17px',
    fontWeight: '800',
    color: 'var(--color-text-primary)',
    margin: '0 0 8px'
  },
  message: {
    fontSize: '13px',
    color: 'var(--color-text-muted)',
    margin: '0 0 24px',
    lineHeight: '1.6'
  },
  btns: {
    display: 'flex',
    gap: '10px'
  },
  cancelBtn: {
    flex: 1,
    padding: '10px 16px',
    borderRadius: '10px',
    border: '1px solid var(--color-border)',
    background: 'var(--color-surface)',
    color: 'var(--color-text-secondary)',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer'
  },
  confirmBtn: {
    flex: 1,
    padding: '10px 16px',
    borderRadius: '10px',
    border: 'none',
    color: '#fff',
    fontSize: '13px',
    fontWeight: '700',
    transition: 'background 0.2s'
  }
}
