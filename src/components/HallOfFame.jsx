import React, { useMemo } from 'react'
import { useApp } from '../App.jsx'
import { GMS, CHAMPIONSHIPS, getGM, getChamp, ordinal } from '../lib/data.js'
import { Card, Label, OvrBadge, GMChip, Divider, hexToRgb } from './UI.jsx'

export default function HallOfFame() {
  const { state, matches } = useApp()
  const champs = state?.championships || {}
  const rosters = state?.rosters || {}

  const stats = useMemo(() => {
    const gmStats = {}
    GMS.forEach(g => {
      gmStats[g.id] = { wins: 0, losses: 0, titles: 0, titleReigns: {}, bestStreak: 0, currentStreak: 0, biggestWin: null }
    })

    // count title reigns from feed events
    const feed = state?.feed || []
    feed.filter(f => f.type === 'title_change').forEach(f => {
      if (f.gmId && gmStats[f.gmId]) {
        if (!gmStats[f.gmId].titleReigns[f.champId]) gmStats[f.gmId].titleReigns[f.champId] = 0
        gmStats[f.gmId].titleReigns[f.champId]++
        gmStats[f.gmId].titles++
      }
    })

    // match stats
    matches.forEach(m => {
      if (gmStats[m.winner_gm]) gmStats[m.winner_gm].wins++
      const loserGM = m.gm1 === m.winner_gm ? m.gm2 : m.gm1
      if (gmStats[loserGM]) gmStats[loserGM].losses++
    })

    // current title holders
    Object.entries(champs).forEach(([champId, val]) => {
      if (val?.gm && gmStats[val.gm]) {
        if (!gmStats[val.gm].titleReigns[champId]) gmStats[val.gm].titleReigns[champId] = 0
      }
    })

    return gmStats
  }, [state, matches])

  // superstar stats
  const starStats = useMemo(() => {
    const all = {}
    Object.entries(rosters).forEach(([gmId, stars]) => {
      stars.forEach(s => {
        all[s.name] = { ...s, gmId, total: (s.wins || 0) + (s.losses || 0) }
      })
    })
    return Object.values(all).sort((a, b) => b.wins - a.wins)
  }, [rosters])

  const mostWins = starStats.filter(s => s.wins > 0).slice(0, 5)
  const topWinPct = starStats.filter(s => (s.wins + s.losses) >= 2).sort((a, b) => (b.wins / (b.wins + b.losses)) - (a.wins / (a.wins + a.losses))).slice(0, 5)

  return (
    <div style={{ paddingBottom: '5rem' }}>
      <div style={{ fontSize: '18px', fontWeight: 800, color: '#d4af37', marginBottom: '1rem', letterSpacing: '0.03em' }}>⭐ Hall of Fame</div>

      {/* GM leaderboard */}
      <Label color="#d4af37" style={{ marginBottom: '8px' }}>GM Standings</Label>
      {GMS.map((g, i) => {
        const s = stats[g.id]
        const totalReigns = Object.values(s.titleReigns).reduce((a, v) => a + v, 0)
        const wr = s.wins + s.losses
        const wpct = wr > 0 ? Math.round((s.wins / wr) * 100) : null
        const myTitles = Object.entries(champs).filter(([, v]) => v?.gm === g.id)

        return (
          <Card key={g.id} style={{ padding: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <div style={{ fontSize: '24px', fontWeight: 800, color: i === 0 ? '#d4af37' : i === 1 ? '#b0b0b0' : i === 2 ? '#cd7f32' : '#333', minWidth: '28px' }}>
                {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}`}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '15px', fontWeight: 700, color: g.color }}>{g.short}</div>
                <div style={{ fontSize: '11px', color: '#555', marginTop: '2px' }}>{g.alignment === 'heel' ? '😈 Heel' : '😇 Face'}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '18px', fontWeight: 800, color: '#fff' }}>{s.wins}W–{s.losses}L</div>
                {wpct !== null && <div style={{ fontSize: '11px', color: '#555' }}>{wpct}% win rate</div>}
              </div>
            </div>

            {/* title reign breakdown */}
            {totalReigns > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
                {Object.entries(s.titleReigns).map(([cId, count]) => {
                  const c = getChamp(cId)
                  if (!c) return null
                  return (
                    <div key={cId} style={{ fontSize: '10px', padding: '3px 8px', borderRadius: '99px', background: `rgba(${hexToRgb(c.color)}, 0.15)`, border: `1px solid rgba(${hexToRgb(c.color)}, 0.3)`, color: c.color, fontWeight: 700, letterSpacing: '0.06em' }}>
                      {ordinal(count)} {c.short} Reign{count > 1 ? 's' : ''}
                    </div>
                  )
                })}
              </div>
            )}

            {/* current titles */}
            {myTitles.length > 0 && (
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {myTitles.map(([cId, val]) => {
                  const c = getChamp(cId)
                  return (
                    <div key={cId} style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '4px', background: `rgba(${hexToRgb(c?.color || '#888')}, 0.2)`, color: c?.color, fontWeight: 700 }}>
                      🏆 {c?.short} — {val.superstar}
                    </div>
                  )
                })}
              </div>
            )}
          </Card>
        )
      })}

      <Divider style={{ margin: '1.25rem 0' }} />

      {/* superstar leaderboards */}
      {mostWins.length > 0 && (
        <>
          <Label color="#d4af37" style={{ marginBottom: '8px' }}>Most Wins — Superstars</Label>
          <Card style={{ padding: '0.75rem' }}>
            {mostWins.map((s, i) => (
              <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 0', borderBottom: i < mostWins.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                <div style={{ fontSize: '14px', fontWeight: 800, color: '#444', minWidth: '20px' }}>{i + 1}</div>
                <OvrBadge ovr={s.ovr} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#ddd' }}>{s.name}</div>
                  <div style={{ fontSize: '10px', color: getGM(s.gmId)?.color }}>{getGM(s.gmId)?.short}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: '#2ecc8a' }}>{s.wins}W</div>
                  <div style={{ fontSize: '10px', color: '#555' }}>{s.losses}L</div>
                </div>
              </div>
            ))}
          </Card>
        </>
      )}

      {topWinPct.length > 0 && (
        <>
          <Label color="#d4af37" style={{ marginBottom: '8px', marginTop: '1rem' }}>Best Win % (min 2 matches)</Label>
          <Card style={{ padding: '0.75rem' }}>
            {topWinPct.map((s, i) => {
              const pct = Math.round((s.wins / (s.wins + s.losses)) * 100)
              return (
                <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 0', borderBottom: i < topWinPct.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: '#444', minWidth: '20px' }}>{i + 1}</div>
                  <OvrBadge ovr={s.ovr} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#ddd' }}>{s.name}</div>
                    <div style={{ fontSize: '10px', color: getGM(s.gmId)?.color }}>{getGM(s.gmId)?.short}</div>
                  </div>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: '#4a9eff' }}>{pct}%</div>
                </div>
              )
            })}
          </Card>
        </>
      )}

      {matches.length === 0 && mostWins.length === 0 && (
        <div style={{ fontSize: '13px', color: '#444', textAlign: 'center', padding: '2rem' }}>
          No match history yet. Log results to build the Hall of Fame.
        </div>
      )}
    </div>
  )
}
