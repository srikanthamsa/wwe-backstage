import React from 'react'
import { getGM, timeAgo } from '../lib/data.js'

export function Card({ children, style, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(180deg, rgba(255,255,255,0.11), rgba(255,255,255,0.05))',
        border: '1px solid rgba(255,255,255,0.12)',
        borderRadius: '24px',
        padding: '1rem',
        marginBottom: '0.8rem',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'transform 160ms ease, border-color 160ms ease, background 160ms ease, box-shadow 160ms ease',
        boxShadow: '0 18px 40px rgba(0,0,0,0.22)',
        backdropFilter: 'blur(18px) saturate(150%)',
        WebkitBackdropFilter: 'blur(18px) saturate(150%)',
        ...style,
      }}
      onMouseEnter={e => {
        if (!onClick) return
        e.currentTarget.style.transform = 'translateY(-2px)'
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.22)'
        e.currentTarget.style.background = 'linear-gradient(180deg, rgba(255,255,255,0.14), rgba(255,255,255,0.06))'
      }}
      onMouseLeave={e => {
        if (!onClick) return
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'
        e.currentTarget.style.background = 'linear-gradient(180deg, rgba(255,255,255,0.11), rgba(255,255,255,0.05))'
      }}
    >
      <div style={{ position: 'absolute', inset: 1, borderRadius: 'inherit', background: 'linear-gradient(135deg, rgba(255,255,255,0.12), transparent 42%, transparent 66%, rgba(255,255,255,0.06))', pointerEvents: 'none' }} />
      <div style={{ position: 'relative', zIndex: 1 }}>{children}</div>
    </div>
  )
}

export function Label({ children, color, style }) {
  return (
    <div
      style={{
        fontSize: '0.66rem',
        fontWeight: 700,
        letterSpacing: '0.18em',
        color: color || 'var(--text-dim)',
        textTransform: 'uppercase',
        ...style,
      }}
    >
      {children}
    </div>
  )
}

export function OvrBadge({ ovr, size = 'sm' }) {
  const bg = ovr >= 95 ? 'rgba(255,54,95,0.18)' : ovr >= 90 ? 'rgba(242,202,114,0.18)' : ovr >= 85 ? 'rgba(105,195,255,0.16)' : 'rgba(255,255,255,0.08)'
  const col = ovr >= 95 ? '#ff6b83' : ovr >= 90 ? '#f2ca72' : ovr >= 85 ? '#7cccff' : 'var(--text-muted)'
  const fs = size === 'lg' ? '1.1rem' : '0.74rem'
  const pad = size === 'lg' ? '0.42rem 0.82rem' : '0.3rem 0.58rem'
  const minWidth = size === 'lg' ? '3.2rem' : '2.3rem'
  return (
    <span
      style={{
        fontSize: fs,
        fontWeight: 800,
        padding: pad,
        borderRadius: '999px',
        background: bg,
        color: col,
        display: 'inline-grid',
        placeItems: 'center',
        minWidth,
        textAlign: 'center',
        letterSpacing: '0.03em',
        border: `1px solid ${bg.replace(/0\.\d+\)/, '0.3)')}`,
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.08)',
      }}
    >
      {ovr}
    </span>
  )
}

export function GMPip({ gmId, size = 9 }) {
  const gm = getGM(gmId)
  return (
    <span
      style={{
        display: 'inline-block',
        width: size,
        height: size,
        borderRadius: '50%',
        background: gm?.color || '#555',
        flexShrink: 0,
        boxShadow: `0 0 16px ${(gm?.color || '#555')}66`,
      }}
    />
  )
}

export function GMChip({ gmId }) {
  const gm = getGM(gmId)
  if (!gm) return null
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.42rem',
        padding: '0.38rem 0.76rem',
        borderRadius: '999px',
        background: `rgba(${hexToRgb(gm.color)}, 0.12)`,
        border: `1px solid rgba(${hexToRgb(gm.color)}, 0.26)`,
        boxShadow: `inset 0 1px 0 rgba(255,255,255,0.08), 0 12px 24px rgba(${hexToRgb(gm.color)}, 0.08)`,
      }}
    >
      <GMPip gmId={gmId} size={7} />
      <span style={{ fontSize: '0.72rem', fontWeight: 700, color: gm.color, letterSpacing: '0.08em' }}>{gm.short}</span>
    </span>
  )
}

export function Btn({ children, onClick, variant = 'default', disabled, style, small }) {
  const variants = {
    default: { bg: 'rgba(255,255,255,0.08)', border: 'rgba(255,255,255,0.14)', col: 'var(--text)' },
    red: { bg: 'rgba(255,54,95,0.16)', border: 'rgba(255,54,95,0.34)', col: '#ff8ea0' },
    gold: { bg: 'rgba(242,202,114,0.16)', border: 'rgba(242,202,114,0.34)', col: '#f2ca72' },
    green: { bg: 'rgba(100,227,165,0.14)', border: 'rgba(100,227,165,0.32)', col: '#79ecb1' },
    solid: { bg: 'linear-gradient(135deg, rgba(255,54,95,0.95), rgba(255,120,139,0.82))', border: 'rgba(255,255,255,0.16)', col: '#fff' },
    ghost: { bg: 'rgba(255,255,255,0.03)', border: 'rgba(255,255,255,0.1)', col: 'var(--text-muted)' },
  }
  const v = variants[variant] || variants.default
  const pad = small ? '0.5rem 0.82rem' : '0.75rem 1rem'
  const fs = small ? '0.68rem' : '0.78rem'
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: pad,
        borderRadius: '999px',
        fontSize: fs,
        fontWeight: 700,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.4 : 1,
        transition: 'transform 140ms ease, border-color 140ms ease, box-shadow 140ms ease, opacity 140ms ease',
        background: v.bg,
        border: `1px solid ${v.border}`,
        color: v.col,
        boxShadow: variant === 'solid' ? '0 16px 30px rgba(255,54,95,0.24)' : 'inset 0 1px 0 rgba(255,255,255,0.08)',
        ...style,
      }}
    >
      {children}
    </button>
  )
}

export function Divider({ style }) {
  return <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent)', margin: '0.9rem 0', ...style }} />
}

export function Modal({ open, onClose, children, title }) {
  if (!open) return null
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        background: 'rgba(2, 4, 12, 0.62)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        padding: '1rem',
      }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div
        className="glass-panel"
        style={{
          borderRadius: '28px',
          width: '100%',
          maxWidth: '720px',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '1.2rem',
          boxShadow: '0 34px 80px rgba(0,0,0,0.45)',
        }}
      >
        {title && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', gap: '1rem' }}>
            <div style={{ fontSize: '0.96rem', fontWeight: 800, color: 'var(--text)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{title}</div>
            <button
              onClick={onClose}
              style={{
                width: '2rem',
                height: '2rem',
                borderRadius: '50%',
                border: '1px solid rgba(255,255,255,0.12)',
                background: 'rgba(255,255,255,0.05)',
                color: 'var(--text-muted)',
                fontSize: '1.05rem',
                cursor: 'pointer',
                lineHeight: 1,
              }}
            >
              ×
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  )
}

export function PromoBox({ text, author, gmId, ts, style }) {
  const gm = getGM(gmId)
  return (
    <div
      style={{
        background: `linear-gradient(180deg, rgba(${hexToRgb(gm?.color || '#7785b5')}, 0.14), rgba(255,255,255,0.03))`,
        border: '1px solid rgba(255,255,255,0.1)',
        borderLeft: `3px solid ${gm?.color || '#555'}`,
        borderRadius: '0 18px 18px 0',
        padding: '0.9rem',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.08)',
        ...style,
      }}
    >
      <div style={{ fontSize: '0.84rem', color: 'var(--text)', lineHeight: 1.75, fontStyle: 'italic', marginBottom: '0.55rem' }}>"{text}"</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.42rem', flexWrap: 'wrap' }}>
        <GMPip gmId={gmId} />
        <span style={{ fontSize: '0.72rem', color: gm?.color, fontWeight: 700, letterSpacing: '0.05em' }}>{author}</span>
        {ts && <span style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>{timeAgo(ts)}</span>}
      </div>
    </div>
  )
}

export function SelectInput({ value, onChange, children, style }) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      style={{
        width: '100%',
        padding: '0.82rem 0.95rem',
        background: 'rgba(8, 12, 28, 0.72)',
        border: '1px solid rgba(255,255,255,0.12)',
        borderRadius: '16px',
        color: value ? 'var(--text)' : 'var(--text-dim)',
        fontSize: '0.85rem',
        outline: 'none',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06)',
        ...style,
      }}
    >
      {children}
    </select>
  )
}

export function TextInput({ value, onChange, placeholder, style, rows }) {
  const props = {
    value,
    onChange: e => onChange(e.target.value),
    placeholder,
    style: {
      width: '100%',
      padding: '0.82rem 0.95rem',
      background: 'rgba(8, 12, 28, 0.72)',
      border: '1px solid rgba(255,255,255,0.12)',
      borderRadius: '16px',
      color: 'var(--text)',
      fontSize: '0.85rem',
      outline: 'none',
      resize: 'vertical',
      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06)',
      ...style,
    },
  }
  return rows ? <textarea {...props} rows={rows} /> : <input {...props} />
}

export function hexToRgb(hex) {
  if (!hex) return '128,128,128'
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `${r},${g},${b}`
}

export function ChampBadge({ title }) {
  if (!title) return null
  const colors = { wwe: '#ff4a67', world: '#f2ca72', ic: '#d7deec', us: '#6a9fff', tag: '#64e3a5' }
  const col = colors[title.id || title] || '#c2cbeb'
  const name = title.short || title
  return (
    <span
      style={{
        fontSize: '0.62rem',
        fontWeight: 800,
        padding: '0.32rem 0.62rem',
        borderRadius: '999px',
        background: `rgba(${hexToRgb(col)}, 0.14)`,
        border: `1px solid rgba(${hexToRgb(col)}, 0.28)`,
        color: col,
        letterSpacing: '0.12em',
        display: 'inline-block',
        textTransform: 'uppercase',
      }}
    >
      {name}
    </span>
  )
}

export function Spinner() {
  return <div style={{ width: '20px', height: '20px', border: '2px solid rgba(255,255,255,0.12)', borderTop: '2px solid var(--accent)', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
}
