import React from 'react'
import { GMS } from '../lib/data.js'

export default function Login({ onLogin }) {
  return (
    <div className="app-shell" style={{ display: 'grid', placeItems: 'center' }}>
      <div className="glass-panel" style={{ width: 'min(94vw, 980px)', borderRadius: '38px', padding: '1.25rem', overflow: 'hidden', position: 'relative' }}>
        <div style={{ position: 'absolute', top: '-5rem', right: '-4rem', width: '18rem', height: '18rem', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,54,95,0.2), transparent 62%)' }} />
        <div style={{ position: 'absolute', bottom: '-6rem', left: '-3rem', width: '20rem', height: '20rem', borderRadius: '50%', background: 'radial-gradient(circle, rgba(105,195,255,0.16), transparent 60%)' }} />

        <div style={{ position: 'relative', zIndex: 1, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
          <section className="glass-panel" style={{ borderRadius: '30px', padding: '1.6rem', minHeight: '420px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div className="hero-wordmark">
                <span className="accent">WWE</span>{' '}
                <span className="ice">BACKSTAGE</span>
              </div>
              <div style={{ marginTop: '0.8rem', fontSize: '0.82rem', letterSpacing: '0.24em', textTransform: 'uppercase', color: 'var(--text-dim)' }}>
                Draft room access
              </div>
            </div>

            <div style={{ display: 'grid', gap: '0.9rem' }}>
              <div className="metric-tile">
                <div style={{ fontSize: '0.68rem', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '0.45rem' }}>
                  Live features
                </div>
                <div style={{ color: 'var(--text-muted)', lineHeight: 1.7 }}>
                  Feed-driven booking, context-aware promos, dynamic factions, title history, and a Hall of Fame that updates from match logs.
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                {[
                  { label: 'GMs', value: GMS.length },
                  { label: 'Feed Core', value: 'Live' },
                  { label: 'Look', value: 'Glass' },
                ].map(tile => (
                  <div key={tile.label} className="metric-tile" style={{ padding: '0.85rem' }}>
                    <div style={{ fontSize: '0.62rem', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--text-dim)' }}>{tile.label}</div>
                    <div style={{ marginTop: '0.32rem', fontSize: '1.25rem', fontWeight: 800, color: 'var(--text)' }}>{tile.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="glass-panel" style={{ borderRadius: '30px', padding: '1.4rem' }}>
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.82rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--text-dim)' }}>Select your GM</div>
              <div style={{ marginTop: '0.45rem', color: 'var(--text-muted)', lineHeight: 1.65 }}>
                Step into the control room as your brand’s booker and start shaping the universe.
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              {GMS.map(gm => (
                <button
                  key={gm.id}
                  onClick={() => onLogin(gm.id)}
                  style={{
                    padding: '1rem 1.05rem',
                    background: 'linear-gradient(180deg, rgba(255,255,255,0.1), rgba(255,255,255,0.04))',
                    border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: '22px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.9rem',
                    transition: 'transform 180ms ease, border-color 180ms ease, box-shadow 180ms ease',
                    textAlign: 'left',
                    boxShadow: '0 18px 34px rgba(0,0,0,0.18)',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateY(-2px)'
                    e.currentTarget.style.borderColor = `${gm.color}88`
                    e.currentTarget.style.boxShadow = `0 18px 34px ${gm.color}20`
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'
                    e.currentTarget.style.boxShadow = '0 18px 34px rgba(0,0,0,0.18)'
                  }}
                >
                  <div style={{ width: 12, height: 12, borderRadius: '50%', background: gm.color, boxShadow: `0 0 18px ${gm.color}88` }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text)' }}>{gm.short}</div>
                    <div style={{ fontSize: '0.76rem', color: 'var(--text-dim)', marginTop: '0.16rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                      {gm.alignment === 'heel' ? 'Heel authority' : 'Face brand leader'}
                    </div>
                  </div>
                  <div style={{ fontSize: '1.1rem', color: gm.color }}>→</div>
                </button>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
