import React from 'react'
import { GMS } from '../lib/data.js'

export default function Login({ onLogin }) {
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#0a0a0a', padding: '2rem' }}>
      <div style={{ width: '100%', maxWidth: '400px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ fontSize: 'clamp(28px, 8vw, 40px)', fontWeight: 800, letterSpacing: '0.04em', lineHeight: 1 }}>
            <span style={{ color: '#c8192a' }}>WWE</span>
            <span style={{ color: '#fff' }}> BACKSTAGE</span>
          </div>
          <div style={{ fontSize: '11px', color: '#444', letterSpacing: '0.3em', marginTop: '8px' }}>SELECT YOUR GM</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {GMS.map(gm => (
            <button key={gm.id} onClick={() => onLogin(gm.id)}
              style={{ padding: '1rem 1.25rem', background: '#141414', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px', transition: 'all 0.2s', fontFamily: 'Syne, sans-serif', textAlign: 'left' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = gm.color; e.currentTarget.style.background = '#1a1a1a' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; e.currentTarget.style.background = '#141414' }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: gm.color, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '15px', fontWeight: 700, color: '#fff' }}>{gm.short}</div>
                <div style={{ fontSize: '11px', color: '#555', marginTop: '2px' }}>{gm.alignment === 'heel' ? '😈 Heel' : '😇 Face'}</div>
              </div>
              <div style={{ fontSize: '14px', color: gm.color }}>→</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
