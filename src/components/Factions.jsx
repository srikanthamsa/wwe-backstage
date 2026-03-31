import React, { useState } from 'react'
import { supabase, GMS, FACTIONS, getGM } from '../lib/data.js'
import { Card, SectionLabel, ActionBtn, GMTag, OvrBadge } from './UI.jsx'

export default function Factions({ gm, state, addActivity, fetchState }) {
  const factions = state?.factions || FACTIONS
  const rosters = state?.rosters || {}

  return (
    <div style={{ paddingBottom: '2rem' }}>
      <SectionLabel>Active factions</SectionLabel>
      {factions.map(f => {
        const allStars = f.members.flatMap(mId => (rosters[mId] || []).map(s => ({ ...s, gmId: mId }))).sort((a, b) => b.ovr - a.ovr)
        return (
          <Card key={f.id}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <div style={{ width: '4px', height: '36px', background: f.color, borderRadius: '2px' }} />
              <div>
                <div style={{ fontFamily: 'Bebas Neue', fontSize: '1.4rem', color: f.color, letterSpacing: '0.05em', lineHeight: 1 }}>{f.name}</div>
                <div style={{ fontFamily: 'Barlow Condensed', fontSize: '0.7rem', color: '#555', letterSpacing: '0.1em' }}>
                  {f.members.map(id => getGM(id)?.short).join(' · ')} · {allStars.length} superstars combined
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              {f.members.map(mId => {
                const g = getGM(mId)
                return (
                  <div key={mId} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 10px', background: `rgba(${g?.color?.slice(1).match(/.{2}/g)?.map(x => parseInt(x, 16)).join(',')}, 0.12)`, border: `1px solid rgba(${g?.color?.slice(1).match(/.{2}/g)?.map(x => parseInt(x, 16)).join(',')}, 0.3)`, borderRadius: '99px' }}>
                    <div style={{ width: 7, height: 7, borderRadius: '50%', background: g?.color }} />
                    <span style={{ fontFamily: 'Barlow Condensed', fontSize: '0.75rem', color: g?.color, letterSpacing: '0.08em', fontWeight: 700 }}>{g?.short}</span>
                  </div>
                )
              })}
            </div>

            <div style={{ fontFamily: 'Barlow Condensed', fontSize: '0.65rem', color: '#555', letterSpacing: '0.2em', marginBottom: '6px' }}>COMBINED ROSTER</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
              {allStars.slice(0, 10).map((s, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '4px 0' }}>
                  <OvrBadge ovr={s.ovr} />
                  <span style={{ fontFamily: 'Barlow Condensed', fontSize: '0.78rem', color: '#bbb' }}>{s.name}</span>
                </div>
              ))}
              {allStars.length > 10 && <div style={{ fontFamily: 'Barlow Condensed', fontSize: '0.7rem', color: '#444', padding: '4px 0' }}>+{allStars.length - 10} more</div>}
            </div>
          </Card>
        )
      })}

      <SectionLabel style={{ marginTop: '1rem' }}>GM standings</SectionLabel>
      {GMS.map(g => {
        const inFaction = factions.find(f => f.members.includes(g.id))
        const roster = rosters[g.id] || []
        return (
          <div key={g.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: g.color, flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'Barlow Condensed', fontSize: '0.9rem', fontWeight: 700, color: '#ddd' }}>{g.short}</div>
              <div style={{ fontFamily: 'Barlow Condensed', fontSize: '0.65rem', color: '#444', letterSpacing: '0.1em' }}>{roster.length} superstars</div>
            </div>
            {inFaction && (
              <div style={{ fontFamily: 'Barlow Condensed', fontSize: '0.65rem', padding: '2px 8px', background: `rgba(${inFaction.color.slice(1).match(/.{2}/g)?.map(x => parseInt(x, 16)).join(',')}, 0.15)`, border: `1px solid rgba(${inFaction.color.slice(1).match(/.{2}/g)?.map(x => parseInt(x, 16)).join(',')}, 0.3)`, borderRadius: '99px', color: inFaction.color, letterSpacing: '0.08em' }}>
                {inFaction.name}
              </div>
            )}
            {!inFaction && <div style={{ fontFamily: 'Barlow Condensed', fontSize: '0.65rem', color: '#333', letterSpacing: '0.1em' }}>FACE</div>}
          </div>
        )
      })}
    </div>
  )
}
