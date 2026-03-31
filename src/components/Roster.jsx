import React, { useState } from 'react'
import { useApp } from '../App.jsx'
import { GMS, getGM, getStarData, getChamp } from '../lib/data.js'
import { OvrBadge, Btn, Modal, Divider, ChampBadge } from './UI.jsx'
import PromoModal from './PromoModal.jsx'

export default function Roster() {
  const { gm, state, setModal } = useApp()
  const [viewing, setViewing] = useState(gm)
  const [selectedStar, setSelectedStar] = useState(null)

  const rosters = state?.rosters || {}
  const champs = state?.championships || {}
  const viewRoster = [...(rosters[viewing] || [])].sort((a, b) => b.ovr - a.ovr)
  const gmInfo = getGM(viewing)

  const titleHolders = {}
  Object.entries(champs).forEach(([champId, val]) => {
    if (val?.superstar) titleHolders[val.superstar] = champId
  })

  return (
    <div style={{ paddingBottom: '0.5rem' }}>
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
        {GMS.map(g => (
          <button
            key={g.id}
            onClick={() => setViewing(g.id)}
            style={{
              padding: '0.55rem 0.95rem',
              borderRadius: '999px',
              fontSize: '0.74rem',
              fontWeight: 700,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.15s',
              background: viewing === g.id ? `linear-gradient(180deg, ${g.color}, ${g.color}cc)` : 'rgba(255,255,255,0.05)',
              border: viewing === g.id ? `1px solid ${g.color}` : '1px solid rgba(255,255,255,0.1)',
              color: viewing === g.id ? '#fff' : 'var(--text-muted)',
              boxShadow: viewing === g.id ? `0 12px 28px ${g.color}24` : 'none',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          >
            {g.short}
          </button>
        ))}
      </div>

      <div className="glass-panel" style={{ borderRadius: '28px', padding: '1rem', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.8rem', flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: gmInfo?.color }}>{gmInfo?.short}</div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-dim)', letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: '0.22rem' }}>
              {viewRoster.length} superstars
            </div>
          </div>
          {viewing === gm && (
            <Btn small variant="ghost" onClick={() => setModal({ type: 'free_promo' })}>Cut Promo</Btn>
          )}
        </div>

        <div className="surface-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginTop: '1rem' }}>
          {[
            { label: 'Total W', value: viewRoster.reduce((a, s) => a + (s.wins || 0), 0) },
            { label: 'Total L', value: viewRoster.reduce((a, s) => a + (s.losses || 0), 0) },
            { label: 'Titles', value: Object.values(champs).filter(v => v?.gm === viewing).length },
          ].map(s => (
            <div key={s.label} className="metric-tile">
              <div style={{ fontSize: '0.62rem', color: 'var(--text-dim)', letterSpacing: '0.16em', marginBottom: '0.22rem', textTransform: 'uppercase' }}>{s.label}</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text)' }}>{s.value}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gap: '0.75rem' }}>
        {viewRoster.map((star, i) => {
          const sd = getStarData(star.name)
          const champId = titleHolders[star.name]
          const champ = champId ? getChamp(champId) : null
          const wr = (star.wins || 0) + (star.losses || 0)
          const wpct = wr > 0 ? Math.round((star.wins / wr) * 100) : null

          return (
            <button
              key={i}
              onClick={() => setSelectedStar(star)}
              style={{
                width: '100%',
                textAlign: 'left',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: '24px',
                padding: '0.95rem 1rem',
                background: 'linear-gradient(180deg, rgba(255,255,255,0.1), rgba(255,255,255,0.04))',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.9rem',
                boxShadow: '0 18px 36px rgba(0,0,0,0.18)',
              }}
            >
              <OvrBadge ovr={star.ovr} size="sm" />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
                  <div style={{ fontSize: '0.98rem', fontWeight: 800, color: 'var(--text)', letterSpacing: '0.01em' }}>{star.name}</div>
                  {champ && <ChampBadge title={champ} />}
                </div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '0.24rem', lineHeight: 1.5 }}>
                  {sd.style} · {wr > 0 ? `${star.wins}W-${star.losses}L${wpct !== null ? ` (${wpct}%)` : ''}` : 'No matches'}
                </div>
              </div>
              <div style={{ fontSize: '0.66rem', color: 'var(--text-dim)', textAlign: 'right', letterSpacing: '0.08em', maxWidth: '96px', lineHeight: 1.45, textTransform: 'uppercase' }}>
                {sd.finisher}
              </div>
            </button>
          )
        })}
      </div>

      <SuperstarModal star={selectedStar} gmId={viewing} onClose={() => setSelectedStar(null)} titleHolders={titleHolders} />
      <PromoModal />
    </div>
  )
}

function SuperstarModal({ star, gmId, onClose, titleHolders }) {
  const { gm, setModal, pushFeedEvent } = useApp()
  if (!star) return null
  const sd = getStarData(star.name)
  const gmInfo = getGM(gmId)
  const champId = titleHolders[star.name]
  const champ = champId ? getChamp(champId) : null
  const wr = (star.wins || 0) + (star.losses || 0)
  const wpct = wr > 0 ? Math.round((star.wins / wr) * 100) : null

  async function callOut() {
    onClose()
    await pushFeedEvent({
      type: 'callout',
      gmId: gm,
      targetGM: gmId,
      text: `${getGM(gm)?.short} calls out ${star.name}!`,
    })
    setModal({ type: 'promo_action', item: { gmId, text: `${star.name} has been called out`, targetGM: gmId }, action: { id: 'callout', label: 'Callout' }, gm })
  }

  return (
    <Modal open onClose={onClose} title={star.name}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div className="glass-panel" style={{ borderRadius: '24px', padding: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem' }}>
            <OvrBadge ovr={star.ovr} size="lg" />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text)', lineHeight: 1 }}>{star.name}</div>
              <div style={{ fontSize: '0.8rem', color: gmInfo?.color, fontWeight: 700, marginTop: '0.28rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{gmInfo?.short}</div>
            </div>
            {champ && <ChampBadge title={champ} />}
          </div>
        </div>

        <div className="surface-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
          {[
            { label: 'Wins', value: star.wins || 0, color: '#79ecb1' },
            { label: 'Losses', value: star.losses || 0, color: '#ff8d9f' },
            { label: 'Win %', value: wpct !== null ? `${wpct}%` : '—', color: '#7cccff' },
          ].map(s => (
            <div key={s.label} className="metric-tile" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.62rem', color: 'var(--text-dim)', letterSpacing: '0.16em', marginBottom: '0.24rem', textTransform: 'uppercase' }}>{s.label}</div>
              <div style={{ fontSize: '1.45rem', fontWeight: 800, color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>

        <Divider />

        <div className="surface-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
          {[
            { label: 'Finisher', value: sd.finisher, color: '#ff6b83' },
            { label: 'Signature', value: sd.signature, color: '#f2ca72' },
            { label: 'Style', value: sd.style, color: '#7cccff' },
            { label: 'Era', value: sd.era, color: 'var(--text-muted)' },
          ].map(m => (
            <div key={m.label} className="metric-tile">
              <div style={{ fontSize: '0.62rem', color: 'var(--text-dim)', letterSpacing: '0.16em', marginBottom: '0.24rem', textTransform: 'uppercase' }}>{m.label}</div>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: m.color }}>{m.value}</div>
            </div>
          ))}
        </div>

        {gmId !== gm && (
          <div style={{ display: 'flex', gap: '0.6rem' }}>
            <Btn variant="red" onClick={callOut} style={{ flex: 1 }}>Call Out</Btn>
            {champ && <Btn variant="gold" onClick={callOut} style={{ flex: 1 }}>Challenge {champ.short}</Btn>}
          </div>
        )}

        {gmId === gm && (
          <Btn variant="ghost" onClick={() => { onClose(); setModal({ type: 'free_promo' }) }} style={{ width: '100%' }}>
            Cut Promo as {star.name}
          </Btn>
        )}
      </div>
    </Modal>
  )
}
