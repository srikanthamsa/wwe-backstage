import React, { useState } from 'react'
import { useApp } from '../App.jsx'
import { GMS, getGM, getStarData, getChamp, CHAMPIONSHIPS } from '../lib/data.js'
import { Card, Label, OvrBadge, GMChip, Btn, Modal, Divider, hexToRgb, ChampBadge } from './UI.jsx'
import PromoModal from './PromoModal.jsx'
import { supabase } from '../lib/data.js'

export default function Roster() {
  const { gm, state, setModal } = useApp()
  const [viewing, setViewing] = useState(gm)
  const [selectedStar, setSelectedStar] = useState(null)
  const [tradeMode, setTradeMode] = useState(false)

  const rosters = state?.rosters || {}
  const champs = state?.championships || {}
  const viewRoster = [...(rosters[viewing] || [])].sort((a, b) => b.ovr - a.ovr)
  const gmInfo = getGM(viewing)

  // figure out which superstars hold titles
  const titleHolders = {}
  Object.entries(champs).forEach(([champId, val]) => {
    if (val?.superstar) titleHolders[val.superstar] = champId
  })

  return (
    <div style={{ paddingBottom: '5rem' }}>
      {/* GM tabs */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '1rem', overflowX: 'auto', paddingBottom: '4px' }}>
        {GMS.map(g => (
          <button key={g.id} onClick={() => setViewing(g.id)}
            style={{ padding: '5px 14px', borderRadius: '99px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.15s', fontFamily: 'Syne, sans-serif', background: viewing === g.id ? g.color : 'rgba(255,255,255,0.05)', border: viewing === g.id ? `1px solid ${g.color}` : '1px solid rgba(255,255,255,0.08)', color: viewing === g.id ? '#fff' : '#666' }}>
            {g.short}
          </button>
        ))}
      </div>

      {/* roster header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
        <div>
          <div style={{ fontSize: '18px', fontWeight: 800, color: gmInfo?.color }}>{gmInfo?.short}</div>
          <div style={{ fontSize: '11px', color: '#555', letterSpacing: '0.08em' }}>
            {viewRoster.length} superstars · Avg {viewRoster.length ? Math.round(viewRoster.reduce((a, s) => a + s.ovr, 0) / viewRoster.length) : '—'} OVR
          </div>
        </div>
        {viewing === gm && (
          <Btn small variant="ghost" onClick={() => setModal({ type: 'free_promo' })}>🎤 Cut Promo</Btn>
        )}
      </div>

      {/* stats bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', marginBottom: '1rem' }}>
        {[
          { label: 'Total W', value: viewRoster.reduce((a, s) => a + (s.wins || 0), 0) },
          { label: 'Total L', value: viewRoster.reduce((a, s) => a + (s.losses || 0), 0) },
          { label: 'Titles', value: Object.values(champs).filter(v => v?.gm === viewing).length },
        ].map(s => (
          <div key={s.label} style={{ background: '#141414', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px', padding: '8px 10px', textAlign: 'center' }}>
            <div style={{ fontSize: '10px', color: '#555', letterSpacing: '0.15em', marginBottom: '2px' }}>{s.label}</div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#fff' }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* superstar grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {viewRoster.map((star, i) => {
          const sd = getStarData(star.name)
          const champId = titleHolders[star.name]
          const champ = champId ? getChamp(champId) : null
          const wr = (star.wins || 0) + (star.losses || 0)
          const wpct = wr > 0 ? Math.round((star.wins / wr) * 100) : null

          return (
            <div key={i} onClick={() => setSelectedStar(star)}
              style={{ background: '#141414', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', padding: '10px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', transition: 'background 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.background = '#1a1a1a'}
              onMouseLeave={e => e.currentTarget.style.background = '#141414'}>

              {/* ovr */}
              <OvrBadge ovr={star.ovr} size="sm" />

              {/* name + details */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#eee', letterSpacing: '0.01em' }}>{star.name}</div>
                  {champ && <ChampBadge title={champ} />}
                </div>
                <div style={{ fontSize: '11px', color: '#555', marginTop: '2px' }}>
                  {sd.style} · {wr > 0 ? `${star.wins}W-${star.losses}L${wpct !== null ? ` (${wpct}%)` : ''}` : 'No matches'}
                </div>
              </div>

              {/* finisher tag */}
              <div style={{ fontSize: '10px', color: '#3a3a3a', textAlign: 'right', letterSpacing: '0.04em', maxWidth: '80px', lineHeight: 1.3 }}>{sd.finisher}</div>
            </div>
          )
        })}
      </div>

      {/* superstar detail modal */}
      <SuperstarModal star={selectedStar} gmId={viewing} onClose={() => setSelectedStar(null)} titleHolders={titleHolders} />
      <PromoModal />
    </div>
  )
}

function SuperstarModal({ star, gmId, onClose, titleHolders }) {
  const { gm, setModal, pushFeedEvent, state } = useApp()
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
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

        {/* hero row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <OvrBadge ovr={star.ovr} size="lg" />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#fff', lineHeight: 1 }}>{star.name}</div>
            <div style={{ fontSize: '12px', color: gmInfo?.color, fontWeight: 600, marginTop: '3px' }}>{gmInfo?.short}</div>
          </div>
          {champ && <ChampBadge title={champ} />}
        </div>

        <Divider />

        {/* stats grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
          {[
            { label: 'Wins', value: star.wins || 0, color: '#2ecc8a' },
            { label: 'Losses', value: star.losses || 0, color: '#e8533a' },
            { label: 'Win %', value: wpct !== null ? `${wpct}%` : '—', color: '#4a9eff' },
          ].map(s => (
            <div key={s.label} style={{ background: '#0d0d0d', borderRadius: '8px', padding: '10px', textAlign: 'center' }}>
              <div style={{ fontSize: '10px', color: '#555', letterSpacing: '0.12em', marginBottom: '4px' }}>{s.label}</div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>

        <Divider />

        {/* moves */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          {[
            { label: 'Finisher', value: sd.finisher, color: '#c8192a' },
            { label: 'Signature', value: sd.signature, color: '#d4af37' },
            { label: 'Style', value: sd.style, color: '#4a9eff' },
            { label: 'Era', value: sd.era, color: '#888' },
          ].map(m => (
            <div key={m.label} style={{ background: '#0d0d0d', borderRadius: '8px', padding: '10px' }}>
              <div style={{ fontSize: '10px', color: '#555', letterSpacing: '0.12em', marginBottom: '4px' }}>{m.label}</div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: m.color }}>{m.value}</div>
            </div>
          ))}
        </div>

        <Divider />

        {/* actions */}
        {gmId !== gm && (
          <div style={{ display: 'flex', gap: '8px' }}>
            <Btn variant="red" onClick={callOut} style={{ flex: 1 }}>🔥 Call Out {star.name}</Btn>
            {champ && <Btn variant="gold" onClick={callOut} style={{ flex: 1 }}>🏆 Challenge for {champ.short}</Btn>}
          </div>
        )}

        {gmId === gm && (
          <Btn variant="ghost" onClick={() => { onClose(); setModal({ type: 'free_promo' }) }} style={{ width: '100%' }}>
            🎤 Cut Promo as {star.name}
          </Btn>
        )}
      </div>
    </Modal>
  )
}
