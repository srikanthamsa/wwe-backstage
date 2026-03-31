import React from 'react'
import { GMS } from '../lib/data.js'

export default function Login({ onLogin }) {
  return (
    <div style={{ minHeight: '100vh', background: '#0d0d0d', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{ fontFamily: 'Bebas Neue', fontSize: 'clamp(2.5rem, 10vw, 4rem)', letterSpacing: '0.08em', lineHeight: 1 }}>
            <span style={{ color: '#c8192a' }}>WWE</span>{' '}
            <span style={{ color: '#fff' }}>BACKSTAGE</span>
          </div>
          <div style={{ fontFamily: 'Barlow Condensed', fontSize: '0.75rem', color: '#444', letterSpacing: '0.35em', marginTop: '0.4rem' }}>GENERAL MANAGER LOGIN</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {GMS.map(gm => (
            <button key={gm.id} onClick={() => onLogin(gm.id)}
              style={{ padding: '1.1rem 1.25rem', background: '#161616', border: `1px solid rgba(255,255,255,0.07)`, borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px', transition: 'all 0.2s', textAlign: 'left' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = gm.color; e.currentTarget.style.background = '#1a1a1a' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; e.currentTarget.style.background = '#161616' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: gm.color, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'Bebas Neue', fontSize: '1.1rem', color: '#fff', letterSpacing: '0.06em' }}>{gm.short}</div>
                <div style={{ fontFamily: 'Barlow Condensed', fontSize: '0.7rem', color: '#555', letterSpacing: '0.08em' }}>{gm.name}</div>
              </div>
              <div style={{ fontFamily: 'Barlow Condensed', fontSize: '0.75rem', color: '#333', letterSpacing: '0.1em' }}>→</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
