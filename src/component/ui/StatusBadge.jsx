/**
 * StatusBadge — Color-coded pill badge
 *
 * Usage:
 *   <StatusBadge status="active" />
 *   <StatusBadge status="pending" label="Under Review" />
 *   <StatusBadge color="green" label="Verified" />
 *
 * Built-in status→color mappings cover most domain statuses.
 * Override with color prop: "green" | "amber" | "red" | "blue" | "purple" | "gray" | "primary"
 */
import React from 'react'

const STATUS_MAP = {
  // Green
  active: 'green', approved: 'green', verified: 'green', completed: 'green',
  paid: 'green', released: 'green', signed: 'green', success: 'green',

  // Amber
  pending: 'amber', 'in-progress': 'amber', review: 'amber', processing: 'amber',
  pending_kyc: 'amber', pending_payment_setup: 'blue',

  // Red
  rejected: 'red', cancelled: 'red', suspended: 'red', expired: 'red',
  failed: 'red', terminated: 'red', overdue: 'red',

  // Blue
  open: 'blue', submitted: 'blue', 'under-review': 'blue',

  // Purple
  draft: 'purple', scheduled: 'purple',

  // Gray
  inactive: 'gray', archived: 'gray', closed: 'gray'
}

const COLOR_STYLES = {
  primary: { bg: 'rgba(11,61,40,0.08)',    fg: 'var(--color-primary)' },
  green:   { bg: 'rgba(16,185,129,0.1)',   fg: '#059669' },
  amber:   { bg: 'rgba(245,158,11,0.1)',   fg: '#d97706' },
  red:     { bg: 'rgba(239,68,68,0.1)',    fg: '#dc2626' },
  blue:    { bg: 'rgba(59,130,246,0.1)',   fg: '#2563eb' },
  purple:  { bg: 'rgba(124,58,237,0.1)',   fg: '#7c3aed' },
  gray:    { bg: 'rgba(100,116,139,0.1)',  fg: '#64748b' }
}

export default function StatusBadge ({ status, label, color, dot = true }) {
  const resolvedColor = color || STATUS_MAP[status?.toLowerCase?.()] || 'gray'
  const c = COLOR_STYLES[resolvedColor] || COLOR_STYLES.gray
  const text = label || (status ? status.replace(/_/g, ' ') : '—')

  return (
    <span style={{ ...styles.badge, background: c.bg, color: c.fg }}>
      {dot && <span style={{ ...styles.dot, background: c.fg }} />}
      {text}
    </span>
  )
}

const styles = {
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    padding: '3px 10px',
    borderRadius: '20px',
    fontSize: '11px',
    fontWeight: '700',
    textTransform: 'capitalize',
    whiteSpace: 'nowrap'
  },
  dot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    flexShrink: 0
  }
}
