/**
 * PageHeader — Title + optional subtitle + right-side action buttons
 *
 * Usage:
 *   <PageHeader
 *     title="Property Management"
 *     subtitle="View and manage all listings"
 *     actions={<button className="btn-primary">Add New</button>}
 *   />
 */
import React from 'react'

export default function PageHeader ({ title, subtitle, actions, icon }) {
  return (
    <div style={styles.wrap}>
      <div style={styles.left}>
        {icon && <span style={styles.icon}>{icon}</span>}
        <div>
          <h1 style={styles.title}>{title}</h1>
          {subtitle && <p style={styles.subtitle}>{subtitle}</p>}
        </div>
      </div>
      {actions && <div style={styles.actions}>{actions}</div>}
    </div>
  )
}

const styles = {
  wrap: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '16px',
    marginBottom: '24px'
  },
  left: { display: 'flex', alignItems: 'center', gap: '12px' },
  icon: {
    width: '42px',
    height: '42px',
    borderRadius: '12px',
    background: 'rgba(11,61,40,0.08)',
    color: 'var(--color-primary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },
  title: {
    fontSize: '22px',
    fontWeight: '800',
    background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-mid))',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    margin: '0 0 2px'
  },
  subtitle: { fontSize: '13px', color: 'var(--color-text-muted)', margin: 0 },
  actions: { display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }
}
