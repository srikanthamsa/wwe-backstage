import React from 'react'
import { getGM, timeAgo } from '../lib/data.js'

export function Card({ children, style }) {
  return <div style={{ background: '#161616', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '6px', padding: '1rem', marginBottom: '0.75rem', ...style }}>{children}</div>
}

export function SectionLabel({ children }) {
  return <div style={{ fontFamily: 'Barlow Condensed', fontSize: '0.65rem', letterSpacing: '0.35em', color: '#c8192a', textTransform: 'uppercase', marginBottom: '0.6rem', marginTop: '0.25rem' }}>{children}</div>
}

export function OvrBadge({ ovr }) {
  const bg = ovr >= 95 ? '#2a1a2a' : ovr >= 90 ? '#1a1a2a' : ovr >= 85 ? '#1a2a1a' : '#1e1e1e'
  const col = ovr >= 95 ? '#c89bff' : ovr >= 90 ? '#6ca8ff' : ovr >= 85 ? '#6fcf8f' : '#888'
  return <span style={{ fontFamily: 'Barlow Condensed', fontSize: '11px', fontWeight: 700, padding: '2px 6px', borderRadius: '3px', background: bg, color: col, minWidth: '28px', display: 'inline-block', textAlign: 'center' }}>{ovr}</span>
}

export function GMDot({ gmId, size = 8 }) {
  const gm = getGM(gmId)
  return <span style={{ display: 'inline-block', width: size, height: size, borderRadius: '50%', background: gm?.color || '#555', flexShrink: 0 }} />
}

export function GMTag({ gmId }) {
  const gm = getGM(gmId)
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontFamily: 'Barlow Condensed', fontSize: '0.75rem', letterSpacing: '0.08em', color: gm?.color || '#888' }}>
      <GMDot gmId={gmId} />
      {gm?.short}
    </span>
  )
}

export function Divider() {
  return <div style={{ height: '1px', background: 'rgba(255,255,255,0.05)', margin: '0.75rem 0' }} />
}

export function ActionBtn({ children, onClick, disabled, variant = 'default', style }) {
  const variants = {
    default: { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#aaa' },
    red: { background: 'rgba(200,25,42,0.15)', border: '1px solid rgba(200,25,42,0.4)', color: '#c8192a' },
    green: { background: 'rgba(29,158,117,0.12)', border: '1px solid rgba(29,158,117,0.35)', color: '#1D9E75' },
    gold: { background: 'rgba(212,175,55,0.12)', border: '1px solid rgba(212,175,55,0.35)', color: '#d4af37' },
  }
  const v = variants[variant] || variants.default
  return (
    <button onClick={onClick} disabled={disabled}
      style={{ padding: '0.55rem 1rem', borderRadius: '3px', fontFamily: 'Barlow Condensed', fontSize: '0.8rem', letterSpacing: '0.12em', cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.4 : 1, transition: 'all 0.15s', textTransform: 'uppercase', ...v, ...style }}>
      {children}
    </button>
  )
}

export function ActivityItem({ item }) {
  const icons = { trade_sent: '↔', trade_accepted: '✓', trade_rejected: '✗', match: '⚡', title_change: '🏆', contract_signing: '✍', faction: '⚑', loan: '↗' }
  return (
    <div style={{ display: 'flex', gap: '0.75rem', padding: '0.6rem 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
      <div style={{ fontFamily: 'Barlow Condensed', fontSize: '1rem', color: '#444', minWidth: '1.2rem', textAlign: 'center' }}>{icons[item.type] || '·'}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: 'Barlow Condensed', fontSize: '0.9rem', color: '#ccc', lineHeight: 1.4 }}>{item.text}</div>
        <div style={{ fontFamily: 'Barlow Condensed', fontSize: '0.65rem', color: '#444', marginTop: '2px', letterSpacing: '0.1em' }}>{timeAgo(item.ts)}</div>
      </div>
    </div>
  )
}

export function StarRow({ star, gmId, rightContent }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
      <OvrBadge ovr={star.ovr} />
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: 'Barlow Condensed', fontSize: '0.9rem', fontWeight: 700, color: '#ddd', letterSpacing: '0.02em' }}>{star.name}</div>
        {(star.wins !== undefined) && (
          <div style={{ fontFamily: 'Barlow Condensed', fontSize: '0.65rem', color: '#444', letterSpacing: '0.1em' }}>{star.wins}W · {star.losses}L{star.on_loan ? ' · ON LOAN' : ''}</div>
        )}
      </div>
      {rightContent}
    </div>
  )
}
