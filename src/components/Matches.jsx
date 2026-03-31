import React, { useState } from 'react'
import { supabase, GMS, CHAMPIONSHIPS, getGM, getChamp } from '../lib/data.js'
import { Card, SectionLabel, OvrBadge, ActionBtn, GMTag } from './UI.jsx'

const MATCH_TYPES = ['Singles', 'No DQ', 'Last Man Standing', 'Steel Cage', 'Hell in a Cell', 'Ladder', 'TLC', 'Royal Rumble', 'Fatal 4-Way', 'Elimination Chamber']

export default function Matches({ gm, state, matches, addActivity, fetchMatches, fetchState }) {
  const [gm1, setGm1] = useState(gm)
  const [gm2, setGm2] = useState('')
  const [star1, setStar1] = useState('')
  const [star2, setStar2] = useState('')
  const [winnerSide, setWinnerSide] = useState('')
  const [matchType, setMatchType] = useState('Singles')
  const [titleOnLine, setTitleOnLine] = useState('')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [mode, setMode] = useState('log')

  const rosters = state?.rosters || {}
  const champs = state?.championships || {}
  const roster1 = [...(rosters[gm1] || [])].sort((a, b) => b.ovr - a.ovr)
  const roster2 = gm2 ? [...(rosters[gm2] || [])].sort((a, b) => b.ovr - a.ovr) : []

  async function logMatch() {
    if (!gm1 || !gm2 || !star1 || !star2 || !winnerSide) return
    setSaving(true)
    const winnerGM = winnerSide === '1' ? gm1 : gm2
    const winnerStar = winnerSide === '1' ? star1 : star2
    const loserGM = winnerSide === '1' ? gm2 : gm1
    const loserStar = winnerSide === '1' ? star2 : star1

    await supabase.from('backstage_matches').insert({
      gm1, gm2, superstar1: star1, superstar2: star2,
      winner_gm: winnerGM, winner_superstar: winnerStar,
      match_type: matchType, title_on_line: titleOnLine || null, notes: notes || null,
    })

    const newRosters = JSON.parse(JSON.stringify(rosters))
    const wIdx = newRosters[winnerGM]?.findIndex(s => s.name === winnerStar)
    if (wIdx !== undefined && wIdx >= 0) newRosters[winnerGM][wIdx].wins = (newRosters[winnerGM][wIdx].wins || 0) + 1
    const lIdx = newRosters[loserGM]?.findIndex(s => s.name === loserStar)
    if (lIdx !== undefined && lIdx >= 0) newRosters[loserGM][lIdx].losses = (newRosters[loserGM][lIdx].losses || 0) + 1

    let newChamps = { ...champs }
    if (titleOnLine && winnerGM) {
      newChamps[titleOnLine] = { gm: winnerGM, superstar: winnerStar, won_at: new Date().toISOString() }
    }

    await supabase.from('backstage_state').update({ rosters: newRosters, championships: newChamps }).eq('id', 1)
    await addActivity({
      type: 'match',
      text: `${winnerStar} (${getGM(winnerGM)?.short}) def. ${loserStar} (${getGM(loserGM)?.short})${titleOnLine ? ` — ${getChamp(titleOnLine)?.short} title change!` : ''}`
    })

    setGm2(''); setStar1(''); setStar2(''); setWinnerSide(''); setTitleOnLine(''); setNotes(''); setSaving(false)
    fetchMatches(); fetchState()
  }

  return (
    <div style={{ paddingBottom: '2rem' }}>
      <div style={{ display: 'flex', gap: '6px', marginBottom: '1.25rem' }}>
        {[['log', 'Log Match'], ['history', `History (${matches.length})`]].map(([id, label]) => (
          <button key={id} onClick={() => setMode(id)}
            style={{ padding: '0.4rem 0.85rem', borderRadius: '99px', fontFamily: 'Barlow Condensed', fontSize: '0.75rem', letterSpacing: '0.12em', cursor: 'pointer', background: mode === id ? '#c8192a' : 'rgba(255,255,255,0.04)', border: mode === id ? '1px solid #c8192a' : '1px solid rgba(255,255,255,0.07)', color: mode === id ? '#fff' : '#666' }}>
            {label}
          </button>
        ))}
      </div>

      {mode === 'log' && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
            {/* GM1 */}
            <div>
              <SectionLabel>GM 1</SectionLabel>
              <select value={gm1} onChange={e => { setGm1(e.target.value); setStar1('') }}
                style={{ width: '100%', padding: '0.6rem', background: '#161616', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '3px', color: '#ccc', fontFamily: 'Barlow Condensed', fontSize: '0.85rem', marginBottom: '6px', outline: 'none' }}>
                {GMS.map(g => <option key={g.id} value={g.id}>{g.short}</option>)}
              </select>
              <select value={star1} onChange={e => setStar1(e.target.value)}
                style={{ width: '100%', padding: '0.6rem', background: '#161616', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '3px', color: star1 ? '#ccc' : '#555', fontFamily: 'Barlow Condensed', fontSize: '0.85rem', outline: 'none' }}>
                <option value="">Select superstar</option>
                {roster1.map(s => <option key={s.name} value={s.name}>{s.name} ({s.ovr})</option>)}
              </select>
            </div>
            {/* GM2 */}
            <div>
              <SectionLabel>GM 2</SectionLabel>
              <select value={gm2} onChange={e => { setGm2(e.target.value); setStar2('') }}
                style={{ width: '100%', padding: '0.6rem', background: '#161616', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '3px', color: gm2 ? '#ccc' : '#555', fontFamily: 'Barlow Condensed', fontSize: '0.85rem', marginBottom: '6px', outline: 'none' }}>
                <option value="">Select GM</option>
                {GMS.filter(g => g.id !== gm1).map(g => <option key={g.id} value={g.id}>{g.short}</option>)}
              </select>
              <select value={star2} onChange={e => setStar2(e.target.value)} disabled={!gm2}
                style={{ width: '100%', padding: '0.6rem', background: '#161616', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '3px', color: star2 ? '#ccc' : '#555', fontFamily: 'Barlow Condensed', fontSize: '0.85rem', outline: 'none', opacity: gm2 ? 1 : 0.4 }}>
                <option value="">Select superstar</option>
                {roster2.map(s => <option key={s.name} value={s.name}>{s.name} ({s.ovr})</option>)}
              </select>
            </div>
          </div>

          {/* winner */}
          {star1 && star2 && (
            <>
              <SectionLabel>Winner</SectionLabel>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '1rem' }}>
                <button onClick={() => setWinnerSide('1')}
                  style={{ padding: '0.75rem', background: winnerSide === '1' ? `rgba(${getGM(gm1)?.color?.slice(1).match(/.{2}/g)?.map(x => parseInt(x, 16)).join(',')}, 0.2)` : '#161616', border: `1px solid ${winnerSide === '1' ? (getGM(gm1)?.color || '#555') : 'rgba(255,255,255,0.07)'}`, borderRadius: '3px', cursor: 'pointer', fontFamily: 'Barlow Condensed', fontSize: '0.85rem', color: winnerSide === '1' ? '#fff' : '#666', transition: 'all 0.15s' }}>
                  {star1}
                </button>
                <button onClick={() => setWinnerSide('2')}
                  style={{ padding: '0.75rem', background: winnerSide === '2' ? `rgba(${getGM(gm2)?.color?.slice(1).match(/.{2}/g)?.map(x => parseInt(x, 16)).join(',')}, 0.2)` : '#161616', border: `1px solid ${winnerSide === '2' ? (getGM(gm2)?.color || '#555') : 'rgba(255,255,255,0.07)'}`, borderRadius: '3px', cursor: 'pointer', fontFamily: 'Barlow Condensed', fontSize: '0.85rem', color: winnerSide === '2' ? '#fff' : '#666', transition: 'all 0.15s' }}>
                  {star2}
                </button>
              </div>
            </>
          )}

          {/* match type */}
          <SectionLabel>Match type</SectionLabel>
          <select value={matchType} onChange={e => setMatchType(e.target.value)}
            style={{ width: '100%', padding: '0.6rem', background: '#161616', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '3px', color: '#ccc', fontFamily: 'Barlow Condensed', fontSize: '0.85rem', marginBottom: '1rem', outline: 'none' }}>
            {MATCH_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>

          {/* title on the line */}
          <SectionLabel>Title on the line (optional)</SectionLabel>
          <select value={titleOnLine} onChange={e => setTitleOnLine(e.target.value)}
            style={{ width: '100%', padding: '0.6rem', background: '#161616', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '3px', color: titleOnLine ? '#ccc' : '#555', fontFamily: 'Barlow Condensed', fontSize: '0.85rem', marginBottom: '1rem', outline: 'none' }}>
            <option value="">None</option>
            {CHAMPIONSHIPS.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>

          <input value={notes} onChange={e => setNotes(e.target.value)} placeholder="Match notes (optional)..."
            style={{ width: '100%', padding: '0.7rem', background: '#161616', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '3px', color: '#ccc', fontFamily: 'Barlow Condensed', fontSize: '0.9rem', marginBottom: '0.75rem', outline: 'none' }} />

          <ActionBtn variant="red" onClick={logMatch} disabled={!gm2 || !star1 || !star2 || !winnerSide || saving} style={{ width: '100%', padding: '0.85rem', fontSize: '0.9rem' }}>
            {saving ? 'Saving...' : 'Log Result'}
          </ActionBtn>
        </>
      )}

      {mode === 'history' && (
        <>
          {matches.length === 0 && <div style={{ fontFamily: 'Barlow Condensed', fontSize: '0.85rem', color: '#333', padding: '1rem 0' }}>No matches yet</div>}
          {matches.map(m => (
            <Card key={m.id} style={{ padding: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <div style={{ fontFamily: 'Barlow Condensed', fontSize: '0.65rem', color: '#555', letterSpacing: '0.15em' }}>{m.match_type}{m.title_on_line ? ` · ${getChamp(m.title_on_line)?.short}` : ''}</div>
              </div>
              <div style={{ fontFamily: 'Barlow Condensed', fontSize: '1rem', color: '#ddd' }}>
                <span style={{ color: m.winner_gm === m.gm1 ? '#fff' : '#555', fontWeight: m.winner_gm === m.gm1 ? 700 : 400 }}>{m.superstar1}</span>
                <span style={{ color: '#333', margin: '0 8px' }}>vs</span>
                <span style={{ color: m.winner_gm === m.gm2 ? '#fff' : '#555', fontWeight: m.winner_gm === m.gm2 ? 700 : 400 }}>{m.superstar2}</span>
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '4px' }}>
                <div style={{ fontFamily: 'Barlow Condensed', fontSize: '0.7rem', color: getGM(m.winner_gm)?.color }}>W: {getGM(m.winner_gm)?.short}</div>
                {m.notes && <div style={{ fontFamily: 'Barlow Condensed', fontSize: '0.7rem', color: '#555', fontStyle: 'italic' }}>{m.notes}</div>}
              </div>
            </Card>
          ))}
        </>
      )}
    </div>
  )
}
