import React, { useState } from 'react'
import { GMS, getGM } from '../lib/data.js'
import { Card, SectionLabel, OvrBadge, ActionBtn, StarRow, Divider } from './UI.jsx'

export default function Roster({ gm, state, addActivity }) {
  const [viewingGM, setViewingGM] = useState(gm)
  const rosters = state?.rosters || {}
  const myRoster = rosters[gm] || []
  const viewRoster = rosters[viewingGM] || []
  const sorted = [...viewRoster].sort((a, b) => b.ovr - a.ovr)
  const gmInfo = getGM(viewingGM)
  const isMyRoster = viewingGM === gm

  return (
    <div style={{ paddingBottom: '2rem' }}>

      {/* GM switcher */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '1.25rem', overflowX: 'auto', paddingBottom: '4px' }}>
        {GMS.map(g => (
          <button key={g.id} onClick={() => setViewingGM(g.id)}
            style={{ padding: '0.4rem 0.85rem', borderRadius: '99px', fontFamily: 'Barlow Condensed', fontSize: '0.75rem', letterSpacing: '0.12em', cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.15s', background: viewingGM === g.id ? g.color : 'rgba(255,255,255,0.04)', border: viewingGM === g.id ? `1px solid ${g.color}` : '1px solid rgba(255,255,255,0.07)', color: viewingGM === g.id ? '#fff' : '#666' }}>
            {g.short}
          </button>
        ))}
      </div>

      {/* roster header */}
      <div style={{ marginBottom: '1rem' }}>
        <div style={{ fontFamily: 'Bebas Neue', fontSize: '1.4rem', color: gmInfo?.color, letterSpacing: '0.05em' }}>{gmInfo?.short}'s Roster</div>
        <div style={{ fontFamily: 'Barlow Condensed', fontSize: '0.75rem', color: '#555', letterSpacing: '0.1em' }}>
          {viewRoster.length} superstars · Avg OVR {viewRoster.length ? Math.round(viewRoster.reduce((a, s) => a + s.ovr, 0) / viewRoster.length) : '—'}
        </div>
      </div>

      {/* superstar list */}
      <Card style={{ padding: '0.5rem 0.75rem' }}>
        {sorted.length === 0 && <div style={{ fontFamily: 'Barlow Condensed', fontSize: '0.85rem', color: '#333', padding: '0.5rem 0' }}>No superstars</div>}
        {sorted.map((s, i) => (
          <StarRow key={i} star={s} gmId={viewingGM}
            rightContent={
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                {s.wins !== undefined && <span style={{ fontFamily: 'Barlow Condensed', fontSize: '0.65rem', color: '#444', letterSpacing: '0.05em' }}>{s.wins}W-{s.losses}L</span>}
                {s.on_loan && <span style={{ fontFamily: 'Barlow Condensed', fontSize: '0.6rem', padding: '1px 5px', background: 'rgba(200,25,42,0.15)', color: '#c8192a', borderRadius: '2px' }}>LOAN</span>}
              </div>
            }
          />
        ))}
      </Card>
    </div>
  )
}
