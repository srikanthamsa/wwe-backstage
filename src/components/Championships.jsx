import React, { useState } from 'react'
import { supabase, GMS, CHAMPIONSHIPS, getGM, getChamp } from '../lib/data.js'
import { Card, SectionLabel, ActionBtn, OvrBadge } from './UI.jsx'

export default function Championships({ gm, state, addActivity, fetchState }) {
  const [assigning, setAssigning] = useState(null)
  const [selectedGM, setSelectedGM] = useState('')
  const [selectedStar, setSelectedStar] = useState('')
  const champs = state?.championships || {}
  const rosters = state?.rosters || {}

  async function assignTitle(champId) {
    if (!selectedGM || !selectedStar) return
    const newChamps = { ...champs, [champId]: { gm: selectedGM, superstar: selectedStar, won_at: new Date().toISOString() } }
    await supabase.from('backstage_state').update({ championships: newChamps }).eq('id', 1)
    await addActivity({ type: 'title_change', text: `${selectedStar} (${getGM(selectedGM)?.short}) is the new ${getChamp(champId)?.name} champion` })
    setAssigning(null); setSelectedGM(''); setSelectedStar('')
    fetchState()
  }

  async function vacateTitle(champId) {
    const newChamps = { ...champs }
    delete newChamps[champId]
    await supabase.from('backstage_state').update({ championships: newChamps }).eq('id', 1)
    await addActivity({ type: 'title_change', text: `${getChamp(champId)?.name} has been vacated` })
    fetchState()
  }

  const rosterForGM = selectedGM ? [...(rosters[selectedGM] || [])].sort((a, b) => b.ovr - a.ovr) : []

  return (
    <div style={{ paddingBottom: '2rem' }}>
      <SectionLabel>Current champions</SectionLabel>
      {CHAMPIONSHIPS.map(c => {
        const holder = champs[c.id]
        const holderGM = holder ? getGM(holder.gm) : null
        const isAssigning = assigning === c.id
        return (
          <Card key={c.id}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: holder || isAssigning ? '10px' : '0' }}>
              <div style={{ width: '4px', height: '40px', background: c.color, borderRadius: '2px', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'Barlow Condensed', fontSize: '0.65rem', color: '#555', letterSpacing: '0.2em', marginBottom: '2px' }}>{c.name.toUpperCase()}</div>
                {holder ? (
                  <div>
                    <div style={{ fontFamily: 'Bebas Neue', fontSize: '1.2rem', color: '#fff', letterSpacing: '0.05em', lineHeight: 1 }}>{holder.superstar}</div>
                    <div style={{ fontFamily: 'Barlow Condensed', fontSize: '0.75rem', color: holderGM?.color }}>{holderGM?.short}</div>
                  </div>
                ) : (
                  <div style={{ fontFamily: 'Bebas Neue', fontSize: '1.1rem', color: '#333', letterSpacing: '0.08em' }}>VACANT</div>
                )}
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                <ActionBtn variant="gold" onClick={() => { setAssigning(isAssigning ? null : c.id); setSelectedGM(''); setSelectedStar('') }}>
                  {isAssigning ? 'Cancel' : holder ? 'Change' : 'Assign'}
                </ActionBtn>
                {holder && <ActionBtn variant="red" onClick={() => vacateTitle(c.id)}>Vacate</ActionBtn>}
              </div>
            </div>

            {isAssigning && (
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '10px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                  <select value={selectedGM} onChange={e => { setSelectedGM(e.target.value); setSelectedStar('') }}
                    style={{ padding: '0.55rem', background: '#111', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '3px', color: selectedGM ? '#ccc' : '#555', fontFamily: 'Barlow Condensed', fontSize: '0.8rem', outline: 'none' }}>
                    <option value="">Select GM</option>
                    {GMS.map(g => <option key={g.id} value={g.id}>{g.short}</option>)}
                  </select>
                  <select value={selectedStar} onChange={e => setSelectedStar(e.target.value)} disabled={!selectedGM}
                    style={{ padding: '0.55rem', background: '#111', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '3px', color: selectedStar ? '#ccc' : '#555', fontFamily: 'Barlow Condensed', fontSize: '0.8rem', outline: 'none', opacity: selectedGM ? 1 : 0.4 }}>
                    <option value="">Select superstar</option>
                    {rosterForGM.map(s => <option key={s.name} value={s.name}>{s.name} ({s.ovr})</option>)}
                  </select>
                </div>
                <ActionBtn variant="gold" onClick={() => assignTitle(c.id)} disabled={!selectedGM || !selectedStar} style={{ width: '100%' }}>
                  Confirm — Assign Title
                </ActionBtn>
              </div>
            )}
          </Card>
        )
      })}
    </div>
  )
}
