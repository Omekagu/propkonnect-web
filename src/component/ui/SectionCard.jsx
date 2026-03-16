/**
 * SectionCard — White card wrapper with optional title, subtitle, and header actions
 *
 * Usage:
 *   <SectionCard title="Recent Transactions" actions={<button>View All</button>}>
 *     <DataTable ... />
 *   </SectionCard>
 *
 *   <SectionCard padding={false}> {/* removes body padding, useful for tables *\/}
 *     <table>...</table>
 *   </SectionCard>
 */
import React from 'react'

export default function SectionCard ({
  title,
  subtitle,
  icon,
  actions,
  children,
  padding = true,
  className
}) {
  const hasHead = title || subtitle || icon || actions

  return (
    <div style={s.card} className={className}>
      {hasHead && (
        <div style={s.head}>
          <div style={s.headLeft}>
            {icon && <span style={s.icon}>{icon}</span>}
            <div>
              {title && <h2 style={s.title}>{title}</h2>}
              {subtitle && <p style={s.subtitle}>{subtitle}</p>}
            </div>
          </div>
          {actions && <div style={s.actions}>{actions}</div>}
        </div>
      )}
      <div style={padding ? s.body : undefined}>
        {children}
      </div>
    </div>
  )
}

const s = {
  card: {
    background: 'var(--color-surface)',
    borderRadius: '16px',
    border: '1px solid var(--color-border)',
    boxShadow: 'var(--shadow-sm, 0 1px 3px rgba(0,0,0,0.06))',
    overflow: 'hidden'
  },
  head: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 20px',
    borderBottom: '1px solid var(--color-border)',
    gap: '12px'
  },
  headLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  icon: {
    color: 'var(--color-primary)',
    display: 'flex',
    alignItems: 'center',
    flexShrink: 0
  },
  title: {
    fontSize: '15px',
    fontWeight: '700',
    color: 'var(--color-text-primary)',
    margin: 0
  },
  subtitle: {
    fontSize: '12px',
    color: 'var(--color-text-muted)',
    margin: '2px 0 0'
  },
  actions: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
    flexShrink: 0
  },
  body: {
    padding: '20px'
  }
}
