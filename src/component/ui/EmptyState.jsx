/**
 * EmptyState — Empty state with icon, title, description, and optional CTA
 *
 * Usage:
 *   <EmptyState
 *     icon={<Inbox size={48} />}
 *     title="No properties found"
 *     description="Try adjusting your filters or add a new listing."
 *     action={<button onClick={handleAdd}>Add Property</button>}
 *   />
 */
import React from 'react'

export default function EmptyState ({ icon, title, description, action }) {
  return (
    <div style={styles.wrap}>
      {icon && <div style={styles.icon}>{icon}</div>}
      {title && <h3 style={styles.title}>{title}</h3>}
      {description && <p style={styles.desc}>{description}</p>}
      {action && <div style={styles.action}>{action}</div>}
    </div>
  )
}

const styles = {
  wrap: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px 20px',
    textAlign: 'center'
  },
  icon: {
    color: 'var(--color-text-muted)',
    opacity: '0.35',
    marginBottom: '16px'
  },
  title: {
    fontSize: '16px',
    fontWeight: '700',
    color: 'var(--color-text-primary)',
    margin: '0 0 8px'
  },
  desc: {
    fontSize: '13px',
    color: 'var(--color-text-muted)',
    margin: '0 0 20px',
    maxWidth: '320px',
    lineHeight: '1.6'
  },
  action: { marginTop: '4px' }
}
