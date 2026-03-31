import React from 'react'
import { GMS, CHAMPIONSHIPS, getGM, getChamp } from '../lib/data.js'
import { Card, SectionLabel, ActivityItem, GMTag, OvrBadge, Divider } from './UI.jsx'

export default function Dashboard({ gm, state, trades, matches }) {
  const myRoster = state?.rosters?.[gm] || []
  const pendingTrades = trades.filter(t => t.status === 'pending' && t.to_gm === gm)
  const feed = state?.activity_feed || []
  const champs = state?.championships || {}

  const totalWins = myRoster.reduce((a, s) => a + (s.wins || 0), 0)
  const totalLosses = myRoster.reduce((a, s) => a + (s.losses || 0), 0)
  const myMatches = matches.filter(m => m.gm1 === gm || m.gm2 === gm)
  const myWins = matches.filter(m => m.winner_gm === gm).length

  return (
    <div style={{ paddingBottom: '2rem' }}>

      {/* pending trade alert */}
      {pendingTrades.length > 0 && (
        <div style={{ background: 'rgba(200,25,42,0.1)', border: '1px solid rgba(200,25,42,0.3)', borderRadius: '4px', padding: '0.75rem 1rem', marginBottom: '1rem', fontFamily: 'Barlow Condensed', fontSize: '0.85rem', color: '#e06070', letterSpacing: '0.1em' }}>
          {pendingTrades.length} trade offer{pendingTrades.length > 1 ? 's' : ''} waiting for your response → go to Trades
        </div>
      )}

      {/* my snapshot */}
      <SectionLabel>Your snapshot</SectionLabel>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '1.25rem' }}>
        {[
          { label: 'Roster', value: myRoster.length },
          { label: 'Record', value: `${myWins}W-${myMatches.length - myWins}L` },
          { label: 'Avg OVR', value: myRoster.length ? Math.round(myRoster.reduce((a, s) => a + s.ovr, 0) / myRoster.length) : '—' },
        ].map(m => (
          <div key={m.label} style={{ background: '#161616', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '4px', padding: '0.75rem', textAlign: 'center' }}>
            <div style={{ fontFamily: 'Barlow Condensed', fontSize: '0.6rem', color: '#555', letterSpacing: '0.2em', marginBottom: '4px' }}>{m.label}</div>
            <div style={{ fontFamily: 'Bebas Neue', fontSize: '1.4rem', color: '#fff', letterSpacing: '0.05em' }}>{m.value}</div>
          </div>
        ))}
      </div>

      {/* title snapshot */}
      <SectionLabel>Championships</SectionLabel>
      <Card style={{ padding: '0.6rem 0.75rem', marginBottom: '1.25rem' }}>
        {CHAMPIONSHIPS.map((c, i) => {
          const holder = champs[c.id]
          const holderGM = holder ? getGM(holder.gm) : null
          return (
            <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 0', borderBottom: i < CHAMPIONSHIPS.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
              <div style={{ width: '3px', height: '28px', background: c.color, borderRadius: '2px', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'Barlow Condensed', fontSize: '0.75rem', color: '#888', letterSpacing: '0.1em' }}>{c.short}</div>
                {holder ? (
                  <div style={{ fontFamily: 'Barlow Condensed', fontSize: '0.85rem', fontWeight: 700, color: '#ddd' }}>{holder.superstar}</div>
                ) : (
                  <div style={{ fontFamily: 'Barlow Condensed', fontSize: '0.8rem', color: '#333', letterSpacing: '0.1em' }}>VACANT</div>
                )}
              </div>
              {holderGM && <div style={{ fontFamily: 'Barlow Condensed', fontSize: '0.7rem', color: holderGM.color }}>{holderGM.short}</div>}
            </div>
          )
        })}
      </Card>

      {/* recent matches */}
      {matches.length > 0 && (
        <>
          <SectionLabel>Recent matches</SectionLabel>
          <Card style={{ marginBottom: '1.25rem', padding: '0.6rem 0.75rem' }}>
            {matches.slice(0, 4).map((m, i) => {
              const gm1 = getGM(m.gm1)
              const gm2 = getGM(m.gm2)
              const winnerGM = getGM(m.winner_gm)
              return (
                <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 0', borderBottom: i < Math.min(matches.length, 4) - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: 'Barlow Condensed', fontSize: '0.85rem', color: '#ddd' }}>
                      <span style={{ color: m.winner_gm === m.gm1 ? '#fff' : '#555' }}>{m.superstar1}</span>
                      <span style={{ color: '#333', margin: '0 6px' }}>vs</span>
                      <span style={{ color: m.winner_gm === m.gm2 ? '#fff' : '#555' }}>{m.superstar2}</span>
                    </div>
                    <div style={{ fontFamily: 'Barlow Condensed', fontSize: '0.65rem', color: '#444', letterSpacing: '0.08em' }}>
                      {m.match_type}{m.title_on_line ? ` · ${m.title_on_line} on the line` : ''}
                    </div>
                  </div>
                  <div style={{ fontFamily: 'Barlow Condensed', fontSize: '0.7rem', color: winnerGM?.color }}>W: {winnerGM?.short}</div>
                </div>
              )
            })}
          </Card>
        </>
      )}

      {/* activity feed */}
      <SectionLabel>Activity feed</SectionLabel>
      {feed.length === 0 ? (
        <div style={{ fontFamily: 'Barlow Condensed', fontSize: '0.85rem', color: '#333', letterSpacing: '0.1em', padding: '1rem 0' }}>No activity yet — make some moves.</div>
      ) : (
        <Card style={{ padding: '0.25rem 0.75rem' }}>
          {feed.slice(0, 20).map(item => <ActivityItem key={item.id} item={item} />)}
        </Card>
      )}
    </div>
  )
}
