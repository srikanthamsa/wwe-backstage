import React, { useState } from 'react'
import { useApp } from '../App.jsx'
import { GMS, CHAMPIONSHIPS, MATCH_TYPES, getGM, getChamp } from '../lib/data.js'
import { Card, Label, GMChip, Btn, Modal, Divider, SelectInput, TextInput, PromoBox, hexToRgb, Spinner } from './UI.jsx'
import { generatePromo } from '../lib/gemini.js'
import { supabase } from '../lib/data.js'

const TABS = ['Feuds', 'Matches', 'Trades']

export default function Storylines() {
  const { gm, state, trades, matches, setModal, pushFeedEvent, fetchState, fetchTrades, fetchMatches } = useApp()
  const [tab, setTab] = useState('Feuds')
  const [showCallout, setShowCallout] = useState(false)
  const [showLogMatch, setShowLogMatch] = useState(false)
  const [showTrade, setShowTrade] = useState(false)

  const pendingTrades = trades.filter(t => t.status === 'pending' && t.to_gm === gm)
  const myMatches = matches.filter(m => m.gm1 === gm || m.gm2 === gm)

  return (
    <div style={{ paddingBottom: '5rem' }}>
      {/* tab bar */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '1rem' }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            style={{ flex: 1, padding: '7px', borderRadius: '8px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: 'Syne, sans-serif', background: tab === t ? '#c8192a' : 'rgba(255,255,255,0.05)', border: tab === t ? '1px solid #c8192a' : '1px solid rgba(255,255,255,0.08)', color: tab === t ? '#fff' : '#666', letterSpacing: '0.05em' }}>
            {t}{t === 'Trades' && pendingTrades.length > 0 ? ` (${pendingTrades.length})` : ''}
          </button>
        ))}
      </div>

      {/* FEUDS */}
      {tab === 'Feuds' && (
        <>
          <Btn variant="solid" onClick={() => setShowCallout(true)} style={{ width: '100%', marginBottom: '1rem' }}>
            🔥 Start a Feud / Issue Callout
          </Btn>
          <FeudsView />
        </>
      )}

      {/* MATCHES */}
      {tab === 'Matches' && (
        <>
          <Btn variant="solid" onClick={() => setShowLogMatch(true)} style={{ width: '100%', marginBottom: '1rem' }}>
            ⚡ Log Match Result
          </Btn>
          <MatchHistory matches={matches} />
        </>
      )}

      {/* TRADES */}
      {tab === 'Trades' && (
        <>
          <Btn variant="solid" onClick={() => setShowTrade(true)} style={{ width: '100%', marginBottom: '1rem' }}>
            ↔ New Trade Offer
          </Btn>
          <TradeView />
        </>
      )}

      <CalloutModal open={showCallout} onClose={() => setShowCallout(false)} />
      <LogMatchModal open={showLogMatch} onClose={() => setShowLogMatch(false)} />
      <TradeModal open={showTrade} onClose={() => setShowTrade(false)} />
    </div>
  )
}

function FeudsView() {
  const { state } = useApp()
  const feed = (state?.feed || []).filter(f => ['callout', 'rematch', 'respond'].includes(f.type))
  if (feed.length === 0) return <div style={{ fontSize: '13px', color: '#444', padding: '2rem', textAlign: 'center' }}>No active feuds yet. Issue a callout to start one.</div>

  return (
    <div>
      {feed.slice(0, 15).map((item, i) => {
        const gm = getGM(item.gmId)
        return (
          <Card key={i} style={{ padding: '0.85rem' }}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '14px' }}>{item.type === 'callout' ? '🔥' : item.type === 'rematch' ? '⚔' : '💬'}</span>
              <GMChip gmId={item.gmId} />
              {item.targetGM && <><span style={{ color: '#444', fontSize: '11px' }}>→</span><GMChip gmId={item.targetGM} /></>}
            </div>
            <div style={{ fontSize: '13px', color: '#ccc', fontWeight: 500 }}>{item.text}</div>
            {item.promo && <PromoBox text={item.promo} author={item.promoBy} gmId={item.gmId} style={{ marginTop: '8px' }} />}
            {item.responses?.slice(-1).map((r, i) => <PromoBox key={i} text={r.text} author={r.author} gmId={r.gmId} style={{ marginTop: '6px' }} />)}
          </Card>
        )
      })}
    </div>
  )
}

function MatchHistory({ matches }) {
  if (matches.length === 0) return <div style={{ fontSize: '13px', color: '#444', padding: '2rem', textAlign: 'center' }}>No matches logged yet.</div>
  return (
    <div>
      {matches.map(m => (
        <Card key={m.id} style={{ padding: '0.85rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
            <Label>{m.match_type}{m.title_on_line ? ` · ${getChamp(m.title_on_line)?.short}` : ''}</Label>
            <span style={{ fontSize: '10px', color: '#444' }}>{new Date(m.played_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
          </div>
          <div style={{ fontSize: '15px', fontWeight: 700 }}>
            <span style={{ color: m.winner_gm === m.gm1 ? '#fff' : '#444' }}>{m.superstar1}</span>
            <span style={{ color: '#333', margin: '0 8px', fontSize: '12px' }}>vs</span>
            <span style={{ color: m.winner_gm === m.gm2 ? '#fff' : '#444' }}>{m.superstar2}</span>
          </div>
          <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
            <span style={{ fontSize: '11px', color: getGM(m.winner_gm)?.color, fontWeight: 600 }}>Winner: {getGM(m.winner_gm)?.short}</span>
          </div>
        </Card>
      ))}
    </div>
  )
}

function TradeView() {
  const { gm, state, trades, pushFeedEvent, fetchTrades, fetchState } = useApp()
  const incoming = trades.filter(t => t.to_gm === gm && t.status === 'pending')
  const outgoing = trades.filter(t => t.from_gm === gm && t.status === 'pending')
  const history = trades.filter(t => (t.from_gm === gm || t.to_gm === gm) && t.status !== 'pending')

  async function respond(trade, accept) {
    await supabase.from('bs2_trades').update({ status: accept ? 'accepted' : 'rejected', updated_at: new Date().toISOString() }).eq('id', trade.id)
    if (accept) {
      const newRosters = JSON.parse(JSON.stringify(state.rosters || {}))
      ;(trade.offer.giving || []).forEach(s => {
        newRosters[trade.from_gm] = newRosters[trade.from_gm]?.filter(x => x.name !== s.name)
        newRosters[trade.to_gm] = [...(newRosters[trade.to_gm] || []), s]
      })
      ;(trade.offer.receiving || []).forEach(s => {
        newRosters[trade.to_gm] = newRosters[trade.to_gm]?.filter(x => x.name !== s.name)
        newRosters[trade.from_gm] = [...(newRosters[trade.from_gm] || []), s]
      })
      await supabase.from('bs2_state').update({ rosters: newRosters }).eq('id', 1)
      await pushFeedEvent({ type: 'trade', gmId: gm, text: `Trade accepted: ${getGM(trade.from_gm)?.short} and ${getGM(gm)?.short} complete a deal.` })
      fetchState()
    }
    fetchTrades()
  }

  return (
    <div>
      {incoming.length === 0 && outgoing.length === 0 && history.length === 0 && (
        <div style={{ fontSize: '13px', color: '#444', padding: '2rem', textAlign: 'center' }}>No trade activity yet.</div>
      )}
      {incoming.map(t => (
        <Card key={t.id}>
          <Label color="#d4af37" style={{ marginBottom: '8px' }}>Offer from {getGM(t.from_gm)?.short}</Label>
          <TradeOfferView offer={t.offer} fromGM={t.from_gm} toGM={t.to_gm} />
          {t.offer.notes && <div style={{ fontSize: '12px', color: '#777', fontStyle: 'italic', margin: '8px 0' }}>"{t.offer.notes}"</div>}
          <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
            <Btn variant="green" onClick={() => respond(t, true)} style={{ flex: 1 }}>Accept</Btn>
            <Btn variant="red" onClick={() => respond(t, false)} style={{ flex: 1 }}>Reject</Btn>
          </div>
        </Card>
      ))}
      {outgoing.map(t => (
        <Card key={t.id} style={{ opacity: 0.6 }}>
          <Label style={{ marginBottom: '8px' }}>Sent to {getGM(t.to_gm)?.short} · PENDING</Label>
          <TradeOfferView offer={t.offer} fromGM={t.from_gm} toGM={t.to_gm} />
        </Card>
      ))}
      {history.slice(0, 8).map(t => (
        <Card key={t.id} style={{ opacity: 0.5 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Label>{getGM(t.from_gm)?.short} → {getGM(t.to_gm)?.short}</Label>
            <Label color={t.status === 'accepted' ? '#2ecc8a' : '#e8533a'}>{t.status.toUpperCase()}</Label>
          </div>
        </Card>
      ))}
    </div>
  )
}

function TradeOfferView({ offer, fromGM, toGM }) {
  const giving = offer.giving || []
  const receiving = offer.receiving || []
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
      {[{ label: `${getGM(fromGM)?.short} gives`, stars: giving }, { label: `${getGM(toGM)?.short} gives`, stars: receiving }].map(side => (
        <div key={side.label}>
          <div style={{ fontSize: '10px', color: '#555', letterSpacing: '0.12em', marginBottom: '4px' }}>{side.label.toUpperCase()}</div>
          {side.stars.length === 0 ? <div style={{ fontSize: '12px', color: '#333' }}>Nothing</div> : side.stars.map((s, i) => (
            <div key={i} style={{ fontSize: '12px', color: '#ccc', fontWeight: 600, marginBottom: '2px' }}>{s.name} ({s.ovr})</div>
          ))}
        </div>
      ))}
    </div>
  )
}

function CalloutModal({ open, onClose }) {
  const { gm, state, pushFeedEvent } = useApp()
  const [targetGM, setTargetGM] = useState('')
  const [targetStar, setTargetStar] = useState('')
  const [champId, setChampId] = useState('')
  const [promoText, setPromoText] = useState('')
  const [loading, setLoading] = useState(false)

  if (!open) return null
  const myGM = getGM(gm)
  const theirRoster = targetGM ? [...(state?.rosters?.[targetGM] || [])].sort((a, b) => b.ovr - a.ovr) : []

  async function generate() {
    setLoading(true)
    const text = await generatePromo({
      speaker: myGM?.short, target: targetGM ? getGM(targetGM)?.short : 'the locker room',
      type: 'callout', champTitle: champId ? getChamp(champId)?.name : undefined,
      alignment: myGM?.alignment,
    })
    setPromoText(text)
    setLoading(false)
  }

  async function post() {
    if (!promoText.trim()) return
    await pushFeedEvent({
      type: 'callout', gmId: gm, targetGM: targetGM || null,
      champId: champId || null,
      text: `${myGM?.short} calls out ${targetGM ? getGM(targetGM)?.short : 'the entire locker room'}${champId ? ` for the ${getChamp(champId)?.name}` : ''}!`,
      promo: promoText, promoBy: myGM?.short,
    })
    onClose(); setPromoText(''); setTargetGM(''); setTargetStar(''); setChampId('')
  }

  return (
    <Modal open title="🔥 Issue Callout" onClose={onClose}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div>
          <Label style={{ marginBottom: '6px' }}>Target GM (optional)</Label>
          <SelectInput value={targetGM} onChange={setTargetGM}>
            <option value="">Open challenge</option>
            {GMS.filter(g => g.id !== gm).map(g => <option key={g.id} value={g.id}>{g.short}</option>)}
          </SelectInput>
        </div>
        <div>
          <Label style={{ marginBottom: '6px' }}>For a title? (optional)</Label>
          <SelectInput value={champId} onChange={setChampId}>
            <option value="">No title on line</option>
            {CHAMPIONSHIPS.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </SelectInput>
        </div>
        <Btn variant="solid" onClick={generate} disabled={loading} style={{ width: '100%' }}>
          {loading ? '✨ Generating...' : '✨ Generate Callout Promo'}
        </Btn>
        {promoText && (
          <>
            <TextInput value={promoText} onChange={setPromoText} rows={4} style={{ fontSize: '13px', lineHeight: 1.7 }} />
            <div style={{ display: 'flex', gap: '8px' }}>
              <Btn variant="ghost" onClick={generate} style={{ flex: 1 }}>🔄 Regen</Btn>
              <Btn variant="solid" onClick={post} style={{ flex: 2 }}>Post Callout</Btn>
            </div>
          </>
        )}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '10px' }}>
          <Label style={{ marginBottom: '6px' }}>Or write your own</Label>
          <TextInput value={promoText} onChange={setPromoText} placeholder="Your callout..." rows={3} />
          {promoText && <Btn variant="solid" onClick={post} style={{ width: '100%', marginTop: '8px' }}>Post</Btn>}
        </div>
      </div>
    </Modal>
  )
}

function LogMatchModal({ open, onClose }) {
  const { gm, state, pushFeedEvent, fetchMatches, fetchState } = useApp()
  const [gm1, setGm1] = useState(gm)
  const [gm2, setGm2] = useState('')
  const [star1, setStar1] = useState('')
  const [star2, setStar2] = useState('')
  const [winnerSide, setWinnerSide] = useState('')
  const [matchType, setMatchType] = useState('Singles')
  const [titleOnLine, setTitleOnLine] = useState('')
  const [saving, setSaving] = useState(false)
  if (!open) return null

  const rosters = state?.rosters || {}
  const r1 = [...(rosters[gm1] || [])].sort((a, b) => b.ovr - a.ovr)
  const r2 = gm2 ? [...(rosters[gm2] || [])].sort((a, b) => b.ovr - a.ovr) : []

  async function logMatch() {
    if (!gm1 || !gm2 || !star1 || !star2 || !winnerSide) return
    setSaving(true)
    const winnerGM = winnerSide === '1' ? gm1 : gm2
    const winnerStar = winnerSide === '1' ? star1 : star2
    const loserGM = winnerSide === '1' ? gm2 : gm1
    const loserStar = winnerSide === '1' ? star2 : star1

    await supabase.from('bs2_matches').insert({ gm1, gm2, superstar1: star1, superstar2: star2, winner_gm: winnerGM, winner_superstar: winnerStar, match_type: matchType, title_on_line: titleOnLine || null })

    const newRosters = JSON.parse(JSON.stringify(rosters))
    const wi = newRosters[winnerGM]?.findIndex(s => s.name === winnerStar)
    if (wi >= 0) newRosters[winnerGM][wi].wins = (newRosters[winnerGM][wi].wins || 0) + 1
    const li = newRosters[loserGM]?.findIndex(s => s.name === loserStar)
    if (li >= 0) newRosters[loserGM][li].losses = (newRosters[loserGM][li].losses || 0) + 1

    let newChamps = { ...(state.championships || {}) }
    if (titleOnLine) {
      newChamps[titleOnLine] = { gm: winnerGM, superstar: winnerStar, won_at: new Date().toISOString() }
    }

    await supabase.from('bs2_state').update({ rosters: newRosters, championships: newChamps }).eq('id', 1)
    const champ = titleOnLine ? getChamp(titleOnLine) : null
    await pushFeedEvent({
      type: 'match', gmId: winnerGM, winnerGM, loserGM, winnerStar, loserStar, champId: titleOnLine || null,
      text: `${winnerStar} (${getGM(winnerGM)?.short}) def. ${loserStar} (${getGM(loserGM)?.short})${champ ? ` — NEW ${champ.short} CHAMPION!` : ''}`,
    })

    setSaving(false); fetchMatches(); fetchState(); onClose()
    setGm2(''); setStar1(''); setStar2(''); setWinnerSide(''); setTitleOnLine('')
  }

  return (
    <Modal open title="⚡ Log Match" onClose={onClose}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <div>
            <Label style={{ marginBottom: '5px' }}>GM 1</Label>
            <SelectInput value={gm1} onChange={v => { setGm1(v); setStar1('') }}>{GMS.map(g => <option key={g.id} value={g.id}>{g.short}</option>)}</SelectInput>
          </div>
          <div>
            <Label style={{ marginBottom: '5px' }}>GM 2</Label>
            <SelectInput value={gm2} onChange={v => { setGm2(v); setStar2('') }}>
              <option value="">Select</option>
              {GMS.filter(g => g.id !== gm1).map(g => <option key={g.id} value={g.id}>{g.short}</option>)}
            </SelectInput>
          </div>
          <SelectInput value={star1} onChange={setStar1}>
            <option value="">Select superstar</option>
            {r1.map(s => <option key={s.name} value={s.name}>{s.name} ({s.ovr})</option>)}
          </SelectInput>
          <SelectInput value={star2} onChange={setStar2} style={{ opacity: gm2 ? 1 : 0.4 }}>
            <option value="">Select superstar</option>
            {r2.map(s => <option key={s.name} value={s.name}>{s.name} ({s.ovr})</option>)}
          </SelectInput>
        </div>

        {star1 && star2 && (
          <div>
            <Label style={{ marginBottom: '6px' }}>Winner</Label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {[['1', star1, gm1], ['2', star2, gm2]].map(([side, name, gmId]) => (
                <button key={side} onClick={() => setWinnerSide(side)}
                  style={{ padding: '10px', borderRadius: '8px', fontFamily: 'Syne, sans-serif', fontSize: '13px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s', background: winnerSide === side ? `rgba(${hexToRgb(getGM(gmId)?.color || '#888')}, 0.2)` : '#0d0d0d', border: `1px solid ${winnerSide === side ? (getGM(gmId)?.color || '#888') : 'rgba(255,255,255,0.08)'}`, color: winnerSide === side ? '#fff' : '#666' }}>
                  {name}
                </button>
              ))}
            </div>
          </div>
        )}

        <SelectInput value={matchType} onChange={setMatchType}>
          {MATCH_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </SelectInput>
        <SelectInput value={titleOnLine} onChange={setTitleOnLine}>
          <option value="">No title on line</option>
          {CHAMPIONSHIPS.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </SelectInput>

        <Btn variant="solid" onClick={logMatch} disabled={!gm2 || !star1 || !star2 || !winnerSide || saving} style={{ width: '100%' }}>
          {saving ? 'Saving...' : 'Log Result'}
        </Btn>
      </div>
    </Modal>
  )
}

function TradeModal({ open, onClose }) {
  const { gm, state, pushFeedEvent, fetchTrades } = useApp()
  const [toGM, setToGM] = useState('')
  const [myOffer, setMyOffer] = useState([])
  const [theirOffer, setTheirOffer] = useState([])
  const [notes, setNotes] = useState('')
  const [sending, setSending] = useState(false)
  if (!open) return null

  const rosters = state?.rosters || {}
  const myR = [...(rosters[gm] || [])].sort((a, b) => b.ovr - a.ovr)
  const theirR = toGM ? [...(rosters[toGM] || [])].sort((a, b) => b.ovr - a.ovr) : []

  function toggle(list, setList, star) {
    setList(list.find(s => s.name === star.name) ? list.filter(s => s.name !== star.name) : [...list, star])
  }

  async function send() {
    setSending(true)
    await supabase.from('bs2_trades').insert({ from_gm: gm, to_gm: toGM, offer: { giving: myOffer, receiving: theirOffer, notes }, status: 'pending' })
    await pushFeedEvent({ type: 'trade', gmId: gm, text: `${getGM(gm)?.short} sent a trade offer to ${getGM(toGM)?.short}.` })
    setSending(false); fetchTrades(); onClose()
    setToGM(''); setMyOffer([]); setTheirOffer([]); setNotes('')
  }

  return (
    <Modal open title="↔ New Trade Offer" onClose={onClose}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div>
          <Label style={{ marginBottom: '6px' }}>Send to</Label>
          <SelectInput value={toGM} onChange={v => { setToGM(v); setTheirOffer([]) }}>
            <option value="">Select GM</option>
            {GMS.filter(g => g.id !== gm).map(g => <option key={g.id} value={g.id}>{g.short}</option>)}
          </SelectInput>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          {[{ label: 'You give', list: myOffer, setList: setMyOffer, roster: myR, col: '#e8533a' },
            { label: 'You receive', list: theirOffer, setList: setTheirOffer, roster: theirR, col: '#2ecc8a' }].map(side => (
            <div key={side.label}>
              <Label color={side.col} style={{ marginBottom: '4px' }}>{side.label}</Label>
              <div style={{ background: '#0d0d0d', borderRadius: '8px', maxHeight: '200px', overflowY: 'auto', border: '1px solid rgba(255,255,255,0.06)' }}>
                {!toGM && side.label !== 'You give' && <div style={{ padding: '8px', fontSize: '11px', color: '#333' }}>Pick a GM first</div>}
                {side.roster.map((s, i) => {
                  const sel = side.list.find(x => x.name === s.name)
                  return (
                    <div key={i} onClick={() => toggle(side.list, side.setList, s)}
                      style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 8px', cursor: 'pointer', background: sel ? `rgba(${hexToRgb(side.col)}, 0.12)` : 'transparent', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: sel ? side.col : '#888', minWidth: '26px' }}>{s.ovr}</span>
                      <span style={{ fontSize: '12px', color: sel ? '#fff' : '#888' }}>{s.name}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
        <TextInput value={notes} onChange={setNotes} placeholder="Note (optional)..." />
        <Btn variant="solid" onClick={send} disabled={!toGM || (myOffer.length === 0 && theirOffer.length === 0) || sending} style={{ width: '100%' }}>
          {sending ? 'Sending...' : 'Send Trade Offer'}
        </Btn>
      </div>
    </Modal>
  )
}
