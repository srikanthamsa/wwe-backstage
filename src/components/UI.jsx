import React from 'react'
import { getGM, timeAgo } from '../lib/data.js'

export function Card({ children, style, onClick }) {
  return (
    <div onClick={onClick}
      style={{ background: '#141414', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '1rem', marginBottom: '0.65rem', cursor: onClick ? 'pointer' : 'default', transition: onClick ? 'background 0.15s' : 'none', ...style }}
      onMouseEnter={e => onClick && (e.currentTarget.style.background = '#1a1a1a')}
      onMouseLeave={e => onClick && (e.currentTarget.style.background = '#141414')}>
      {children}
    </div>
  )
}

export function Label({ children, color, style }) {
  return <div style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.18em', color: color || '#555', textTransform: 'uppercase', ...style }}>{children}</div>
}

export function OvrBadge({ ovr, size = 'sm' }) {
  const bg = ovr >= 95 ? 'rgba(200,25,42,0.2)' : ovr >= 90 ? 'rgba(212,175,55,0.15)' : ovr >= 85 ? 'rgba(74,158,255,0.12)' : 'rgba(255,255,255,0.05)'
  const col = ovr >= 95 ? '#ff4d5e' : ovr >= 90 ? '#d4af37' : ovr >= 85 ? '#4a9eff' : '#888'
  const fs = size === 'lg' ? '16px' : '11px'
  const pad = size === 'lg' ? '4px 10px' : '2px 6px'
  return <span style={{ fontSize: fs, fontWeight: 700, padding: pad, borderRadius: '4px', background: bg, color: col, display: 'inline-block', minWidth: size === 'lg' ? '42px' : '28px', textAlign: 'center', letterSpacing: '0.02em' }}>{ovr}</span>
}

export function GMPip({ gmId, size = 9 }) {
  const gm = getGM(gmId)
  return <span style={{ display: 'inline-block', width: size, height: size, borderRadius: '50%', background: gm?.color || '#555', flexShrink: 0 }} />
}

export function GMChip({ gmId }) {
  const gm = getGM(gmId)
  if (!gm) return null
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '3px 8px', borderRadius: '99px', background: `rgba(${hexToRgb(gm.color)}, 0.12)`, border: `1px solid rgba(${hexToRgb(gm.color)}, 0.25)` }}>
      <GMPip gmId={gmId} size={7} />
      <span style={{ fontSize: '11px', fontWeight: 600, color: gm.color, letterSpacing: '0.05em' }}>{gm.short}</span>
    </span>
  )
}

export function Btn({ children, onClick, variant = 'default', disabled, style, small }) {
  const variants = {
    default: { bg: 'rgba(255,255,255,0.06)', border: 'rgba(255,255,255,0.12)', col: '#ccc' },
    red: { bg: 'rgba(200,25,42,0.15)', border: 'rgba(200,25,42,0.4)', col: '#ff4d5e' },
    gold: { bg: 'rgba(212,175,55,0.15)', border: 'rgba(212,175,55,0.4)', col: '#d4af37' },
    green: { bg: 'rgba(46,204,138,0.12)', border: 'rgba(46,204,138,0.35)', col: '#2ecc8a' },
    solid: { bg: '#c8192a', border: '#c8192a', col: '#fff' },
    ghost: { bg: 'transparent', border: 'rgba(255,255,255,0.1)', col: '#888' },
  }
  const v = variants[variant] || variants.default
  const pad = small ? '0.3rem 0.7rem' : '0.55rem 1rem'
  const fs = small ? '11px' : '12px'
  return (
    <button onClick={onClick} disabled={disabled}
      style={{ padding: pad, borderRadius: '8px', fontFamily: 'Syne, sans-serif', fontSize: fs, fontWeight: 600, letterSpacing: '0.06em', cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.35 : 1, transition: 'all 0.15s', background: v.bg, border: `1px solid ${v.border}`, color: v.col, ...style }}>
      {children}
    </button>
  )
}

export function Divider({ style }) {
  return <div style={{ height: '1px', background: 'rgba(255,255,255,0.05)', margin: '0.75rem 0', ...style }} />
}

export function Modal({ open, onClose, children, title }) {
  if (!open) return null
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: '#141414', borderRadius: '16px 16px 0 0', width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', padding: '1.25rem', border: '1px solid rgba(255,255,255,0.08)', borderBottom: 'none' }}>
        {title && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div style={{ fontSize: '15px', fontWeight: 700, color: '#fff' }}>{title}</div>
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#555', fontSize: '1.2rem', cursor: 'pointer', lineHeight: 1 }}>×</button>
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
    <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderLeft: `3px solid ${gm?.color || '#555'}`, borderRadius: '0 8px 8px 0', padding: '0.75rem', ...style }}>
      <div style={{ fontSize: '13px', color: '#ddd', lineHeight: 1.7, fontStyle: 'italic', marginBottom: '6px' }}>"{text}"</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <GMPip gmId={gmId} />
        <span style={{ fontSize: '11px', color: gm?.color, fontWeight: 600 }}>{author}</span>
        {ts && <span style={{ fontSize: '10px', color: '#444', marginLeft: '4px' }}>{timeAgo(ts)}</span>}
      </div>
    </div>
  )
}

export function SelectInput({ value, onChange, children, style }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)}
      style={{ width: '100%', padding: '0.6rem 0.75rem', background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: value ? '#ddd' : '#555', fontSize: '13px', outline: 'none', ...style }}>
      {children}
    </select>
  )
}

export function TextInput({ value, onChange, placeholder, style, rows }) {
  const props = { value, onChange: e => onChange(e.target.value), placeholder, style: { width: '100%', padding: '0.6rem 0.75rem', background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#ddd', fontSize: '13px', outline: 'none', resize: 'vertical', ...style } }
  return rows ? <textarea {...props} rows={rows} /> : <input {...props} />
}

export function hexToRgb(hex) {
  if (!hex) return '128,128,128'
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `${r},${g},${b}`
}

export function ChampBadge({ title, size = 'sm' }) {
  if (!title) return null
  const colors = { wwe: '#c8192a', world: '#d4af37', ic: '#b0b0b0', us: '#3b6fd4', tag: '#2ecc8a' }
  const col = colors[title.id || title] || '#888'
  const name = title.short || title
  return (
    <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 7px', borderRadius: '4px', background: `rgba(${hexToRgb(col)}, 0.15)`, border: `1px solid rgba(${hexToRgb(col)}, 0.4)`, color: col, letterSpacing: '0.08em', display: 'inline-block' }}>
      {name}
    </span>
  )
}

export function Spinner() {
  return <div style={{ width: '18px', height: '18px', border: '2px solid rgba(255,255,255,0.1)', borderTop: '2px solid #c8192a', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
}
