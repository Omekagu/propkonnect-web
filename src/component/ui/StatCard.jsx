/**
 * StatCard — KPI card with icon, value, label, and optional trend
 *
 * Usage:
 *   <StatCard icon={<Users />} value={142} label="Total Users" trend="+12%" trendUp />
 *   <StatCard icon={<Home />} value="₦4.2M" label="Revenue" color="green" />
 *
 * color: "primary" | "green" | "amber" | "red" | "blue" (default: "primary")
 */
import React from 'react'

const COLOR_MAP = {
  primary: { bg: 'rgba(11,61,40,0.08)',  fg: 'var(--color-primary)' },
  green:   { bg: 'rgba(16,185,129,0.1)', fg: '#059669' },
  amber:   { bg: 'rgba(245,158,11,0.1)', fg: '#d97706' },
  red:     { bg: 'rgba(239,68,68,0.1)',  fg: '#dc2626' },
  blue:    { bg: 'rgba(59,130,246,0.1)', fg: '#2563eb' }
}

export default function StatCard ({ icon, value, label, trend, trendUp, color = 'primary', onClick }) {
  const c = COLOR_MAP[color] || COLOR_MAP.primary

  return (
    <div style={{ ...styles.card, cursor: onClick ? 'pointer' : 'default' }} onClick={onClick}>
      {icon && (
        <div style={{ ...styles.icon, background: c.bg, color: c.fg }}>
          {icon}
        </div>
      )}
      <div style={styles.value}>{value ?? '—'}</div>
      <div style={styles.label}>{label}</div>
      {trend && (
        <div style={{ ...styles.trend, color: trendUp ? '#059669' : '#dc2626' }}>
          {trendUp ? '▲' : '▼'} {trend}
        </div>
      )}
    </div>
  )
}

const styles = {
  card: {
    background: 'var(--color-surface)',
    borderRadius: '14px',
    padding: '18px 16px',
    border: '1px solid var(--color-border)',
    boxShadow: 'var(--shadow-sm, 0 1px 3px rgba(0,0,0,0.06))',
    transition: 'box-shadow 0.2s, transform 0.2s',
    userSelect: 'none'
  },
  icon: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '12px',
    flexShrink: 0
  },
  value: {
    fontSize: '26px',
    fontWeight: '800',
    color: 'var(--color-text-primary)',
    lineHeight: '1',
    marginBottom: '4px'
  },
  label: {
    fontSize: '12px',
    color: 'var(--color-text-muted)',
    fontWeight: '500'
  },
  trend: {
    fontSize: '11px',
    fontWeight: '700',
    marginTop: '6px'
  }
}
