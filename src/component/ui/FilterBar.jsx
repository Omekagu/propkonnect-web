/**
 * FilterBar — Search + dropdown filters row
 *
 * Usage:
 *   <FilterBar
 *     search={search}
 *     onSearch={setSearch}
 *     searchPlaceholder="Search properties…"
 *     filters={[
 *       { key: 'status', value: status, onChange: setStatus,
 *         options: [{ value: '', label: 'All statuses' }, { value: 'active', label: 'Active' }] },
 *       { key: 'type', value: type, onChange: setType,
 *         options: [...] }
 *     ]}
 *     actions={<button>Export</button>}
 *   />
 */
import React from 'react'
import { Search, SlidersHorizontal } from 'lucide-react'

export default function FilterBar ({
  search,
  onSearch,
  searchPlaceholder = 'Search…',
  filters = [],
  actions
}) {
  return (
    <div style={s.bar}>
      {/* Search */}
      {onSearch !== undefined && (
        <div style={s.searchWrap}>
          <Search size={15} style={s.searchIcon} />
          <input
            style={s.input}
            placeholder={searchPlaceholder}
            value={search ?? ''}
            onChange={e => onSearch(e.target.value)}
          />
        </div>
      )}

      {/* Filter dropdowns */}
      {filters.length > 0 && (
        <div style={s.filterGroup}>
          <SlidersHorizontal size={14} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
          {filters.map(({ key, value, onChange, options = [] }) => (
            <select
              key={key}
              style={s.select}
              value={value ?? ''}
              onChange={e => onChange(e.target.value)}
            >
              {options.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          ))}
        </div>
      )}

      {/* Right-side actions */}
      {actions && <div style={s.actions}>{actions}</div>}
    </div>
  )
}

const s = {
  bar: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    flexWrap: 'wrap',
    marginBottom: '18px'
  },
  searchWrap: {
    position: 'relative',
    flex: 1,
    minWidth: '200px'
  },
  searchIcon: {
    position: 'absolute',
    left: '11px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: 'var(--color-text-muted)',
    pointerEvents: 'none'
  },
  input: {
    width: '100%',
    padding: '9px 12px 9px 34px',
    border: '1px solid var(--color-border)',
    borderRadius: '10px',
    background: 'var(--color-surface)',
    fontSize: '13px',
    color: 'var(--color-text-primary)',
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: 'inherit'
  },
  filterGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexWrap: 'wrap'
  },
  select: {
    padding: '9px 30px 9px 12px',
    border: '1px solid var(--color-border)',
    borderRadius: '10px',
    background: 'var(--color-surface)',
    fontSize: '13px',
    color: 'var(--color-text-primary)',
    outline: 'none',
    cursor: 'pointer',
    fontFamily: 'inherit',
    appearance: 'none',
    backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E\")",
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 9px center'
  },
  actions: {
    display: 'flex',
    gap: '8px',
    marginLeft: 'auto'
  }
}
