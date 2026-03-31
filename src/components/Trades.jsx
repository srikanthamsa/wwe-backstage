import React, { useState } from 'react'
import { supabase, GMS, getGM } from '../lib/data.js'
import { Card, SectionLabel, OvrBadge, ActionBtn, GMTag, Divider } from './UI.jsx'

export default function Trades({ gm, state, trades, addActivity, fetchTrades, fetchState }) {
  const [mode, setMode] = useState('inbox')
  const [toGM, setToGM] = useState('')
  const [myOffer, setMyOffer] = useState([])
  const [theirOffer, setTheirOffer] = useState([])
  const [notes, setNotes] = useState('')
  const [sending, setSending] = useState(false)

  const rosters = state?.rosters || {}
  const myRoster = [...(rosters[gm] || [])].sort((a, b) => b.ovr - a.ovr)
  const theirRoster = toGM ? [...(rosters[toGM] || [])].sort((a, b) => b.ovr - a.ovr) : []

  const incoming = trades.filter(t => t.to_gm === gm && t.status === 'pending')
  const outgoing = trades.filter(t => t.from_gm === gm && t.status === 'pending')
  const history = trades.filter(t => (t.from_gm === gm || t.to_gm === gm) && t.status !== 'pending')

  function toggleStar(list, setList, star) {
    const exists = list.find(s => s.name === star.name)
    if (exists) setList(list.filter(s => s.name !== star.name))
    else setList([...list, star])
  }

  async function sendTrade() {
    if (!toGM || (myOffer.length === 0 && theirOffer.length === 0)) return
    setSending(true)
    await supabase.from('backstage_trades').insert({
      from_gm: gm, to_gm: toGM,
      offer: { giving: myOffer, receiving: theirOffer, notes },
      status: 'pending',
    })
    await addActivity({ type: 'trade_sent', text: `${getGM(gm)?.short} sent a trade offer to ${getGM(toGM)?.short}` })
    setMyOffer([]); setTheirOffer([]); setNotes(''); setToGM(''); setSending(false); setMode('inbox')
    fetchTrades()
  }

  async function respondTrade(tradeId, accept, trade) {
    await supabase.from('backstage_trades').update({ status: accept ? 'accepted' : 'rejected', updated_at: new Date().toISOString() }).eq('id', tradeId)

    if (accept) {
      const newRosters = JSON.parse(JSON.stringify(rosters))
      const giving = trade.offer.giving || []
      const receiving = trade.offer.receiving || []
      giving.forEach(s => {
        newRosters[trade.from_gm] = newRosters[trade.from_gm].filter(x => x.name !== s.name)
        newRosters[trade.to_gm] = [...(newRosters[trade.to_gm] || []), s]
      })
      receiving.forEach(s => {
        newRosters[trade.to_gm] = newRosters[trade.to_gm].filter(x => x.name !== s.name)
        newRosters[trade.from_gm] = [...(newRosters[trade.from_gm] || []), s]
      })
      await supabase.from('backstage_state').update({ rosters: newRosters }).eq('id', 1)
      await addActivity({ type: 'trade_accepted', text: `${getGM(gm)?.short} accepted ${getGM(trade.from_gm)?.short}'s trade offer` })
      fetchState()
    } else {
      await addActivity({ type: 'trade_rejected', text: `${getGM(gm)?.short} rejected ${getGM(trade.from_gm)?.short}'s trade offer` })
    }
    fetchTrades()
  }

  return (
    <div style={{ paddingBottom: '2rem' }}>
      <div style={{ display: 'flex', gap: '6px', marginBottom: '1.25rem' }}>
        {[['inbox', `Inbox (${incoming.length})`], ['send', 'New Trade'], ['history', 'History']].map(([id, label]) => (
          <button key={id} onClick={() => setMode(id)}
            style={{ padding: '0.4rem 0.85rem', borderRadius: '99px', fontFamily: 'Barlow Condensed', fontSize: '0.75rem', letterSpacing: '0.12em', cursor: 'pointer', transition: 'all 0.15s', background: mode === id ? '#c8192a' : 'rgba(255,255,255,0.04)', border: mode === id ? '1px solid #c8192a' : '1px solid rgba(255,255,255,0.07)', color: mode === id ? '#fff' : '#666' }}>
            {label}
          </button>
        ))}
      </div>

      {/* INBOX */}
      {mode === 'inbox' && (
        <>
          {incoming.length === 0 && <div style={{ fontFamily: 'Barlow Condensed', fontSize: '0.85rem', color: '#333', letterSpacing: '0.1em', padding: '1rem 0' }}>No pending offers</div>}
          {incoming.map(t => (
            <Card key={t.id}>
              <div style={{ fontFamily: 'Barlow Condensed', fontSize: '0.7rem', color: '#555', letterSpacing: '0.15em', marginBottom: '8px' }}>OFFER FROM {getGM(t.from_gm)?.short.toUpperCase()}</div>
              <TradeOfferView offer={t.offer} fromGM={t.from_gm} toGM={t.to_gm} />
              {t.offer.notes && <div style={{ fontFamily: 'Barlow Condensed', fontSize: '0.8rem', color: '#888', fontStyle: 'italic', margin: '8px 0' }}>"{t.offer.notes}"</div>}
              <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                <ActionBtn variant="green" onClick={() => respondTrade(t.id, true, t)}>Accept</ActionBtn>
                <ActionBtn variant="red" onClick={() => respondTrade(t.id, false, t)}>Reject</ActionBtn>
              </div>
            </Card>
          ))}

          {outgoing.length > 0 && (
            <>
              <SectionLabel>Your pending offers</SectionLabel>
              {outgoing.map(t => (
                <Card key={t.id} style={{ opacity: 0.7 }}>
                  <div style={{ fontFamily: 'Barlow Condensed', fontSize: '0.7rem', color: '#555', letterSpacing: '0.15em', marginBottom: '8px' }}>SENT TO {getGM(t.to_gm)?.short.toUpperCase()} · PENDING</div>
                  <TradeOfferView offer={t.offer} fromGM={t.from_gm} toGM={t.to_gm} />
                </Card>
              ))}
            </>
          )}
        </>
      )}

      {/* SEND */}
      {mode === 'send' && (
        <>
          <SectionLabel>Send to</SectionLabel>
          <div style={{ display: 'flex', gap: '6px', marginBottom: '1rem', flexWrap: 'wrap' }}>
            {GMS.filter(g => g.id !== gm).map(g => (
              <button key={g.id} onClick={() => { setToGM(g.id); setTheirOffer([]) }}
                style={{ padding: '0.4rem 0.85rem', borderRadius: '99px', fontFamily: 'Barlow Condensed', fontSize: '0.75rem', letterSpacing: '0.12em', cursor: 'pointer', background: toGM === g.id ? g.color : 'rgba(255,255,255,0.04)', border: `1px solid ${toGM === g.id ? g.color : 'rgba(255,255,255,0.07)'}`, color: toGM === g.id ? '#fff' : '#666' }}>
                {g.short}
              </button>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
            <div>
              <SectionLabel>You give</SectionLabel>
              <div style={{ background: '#111', borderRadius: '4px', maxHeight: '280px', overflowY: 'auto' }}>
                {myRoster.map((s, i) => (
                  <div key={i} onClick={() => toggleStar(myOffer, setMyOffer, s)}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 8px', cursor: 'pointer', background: myOffer.find(x => x.name === s.name) ? 'rgba(200,25,42,0.15)' : 'transparent', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                    <OvrBadge ovr={s.ovr} />
                    <span style={{ fontFamily: 'Barlow Condensed', fontSize: '0.8rem', color: myOffer.find(x => x.name === s.name) ? '#e06070' : '#bbb' }}>{s.name}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <SectionLabel>You receive</SectionLabel>
              <div style={{ background: '#111', borderRadius: '4px', maxHeight: '280px', overflowY: 'auto' }}>
                {!toGM && <div style={{ padding: '8px', fontFamily: 'Barlow Condensed', fontSize: '0.75rem', color: '#333' }}>Select a GM first</div>}
                {theirRoster.map((s, i) => (
                  <div key={i} onClick={() => toggleStar(theirOffer, setTheirOffer, s)}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 8px', cursor: 'pointer', background: theirOffer.find(x => x.name === s.name) ? 'rgba(29,158,117,0.15)' : 'transparent', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                    <OvrBadge ovr={s.ovr} />
                    <span style={{ fontFamily: 'Barlow Condensed', fontSize: '0.8rem', color: theirOffer.find(x => x.name === s.name) ? '#6fcf8f' : '#bbb' }}>{s.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <input value={notes} onChange={e => setNotes(e.target.value)} placeholder="Add a note (optional)..."
            style={{ width: '100%', padding: '0.7rem', background: '#161616', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '3px', color: '#ccc', fontFamily: 'Barlow Condensed', fontSize: '0.9rem', marginBottom: '0.75rem', outline: 'none' }} />

          {(myOffer.length > 0 || theirOffer.length > 0) && (
            <div style={{ fontFamily: 'Barlow Condensed', fontSize: '0.8rem', color: '#888', marginBottom: '0.75rem' }}>
              {myOffer.length > 0 && <div>Giving: {myOffer.map(s => s.name).join(', ')}</div>}
              {theirOffer.length > 0 && <div>Receiving: {theirOffer.map(s => s.name).join(', ')}</div>}
            </div>
          )}

          <ActionBtn variant="red" onClick={sendTrade} disabled={!toGM || (myOffer.length === 0 && theirOffer.length === 0) || sending} style={{ width: '100%', padding: '0.85rem', fontSize: '0.9rem' }}>
            {sending ? 'Sending...' : 'Send Trade Offer'}
          </ActionBtn>
        </>
      )}

      {/* HISTORY */}
      {mode === 'history' && (
        <>
          {history.length === 0 && <div style={{ fontFamily: 'Barlow Condensed', fontSize: '0.85rem', color: '#333', letterSpacing: '0.1em', padding: '1rem 0' }}>No trade history yet</div>}
          {history.map(t => (
            <Card key={t.id} style={{ opacity: 0.6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <div style={{ fontFamily: 'Barlow Condensed', fontSize: '0.7rem', color: '#555', letterSpacing: '0.15em' }}>{getGM(t.from_gm)?.short} → {getGM(t.to_gm)?.short}</div>
                <div style={{ fontFamily: 'Barlow Condensed', fontSize: '0.7rem', color: t.status === 'accepted' ? '#1D9E75' : '#c8192a', letterSpacing: '0.1em' }}>{t.status.toUpperCase()}</div>
              </div>
              <TradeOfferView offer={t.offer} fromGM={t.from_gm} toGM={t.to_gm} />
            </Card>
          ))}
        </>
      )}
    </div>
  )
}

function TradeOfferView({ offer, fromGM, toGM }) {
  const giving = offer.giving || []
  const receiving = offer.receiving || []
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
      <div>
        <div style={{ fontFamily: 'Barlow Condensed', fontSize: '0.65rem', color: '#555', letterSpacing: '0.15em', marginBottom: '4px' }}>{getGM(fromGM)?.short} gives</div>
        {giving.length === 0 ? <div style={{ fontFamily: 'Barlow Condensed', fontSize: '0.75rem', color: '#333' }}>Nothing</div> : giving.map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '3px' }}>
            <OvrBadge ovr={s.ovr} />
            <span style={{ fontFamily: 'Barlow Condensed', fontSize: '0.8rem', color: '#ccc' }}>{s.name}</span>
          </div>
        ))}
      </div>
      <div>
        <div style={{ fontFamily: 'Barlow Condensed', fontSize: '0.65rem', color: '#555', letterSpacing: '0.15em', marginBottom: '4px' }}>{getGM(toGM)?.short} gives</div>
        {receiving.length === 0 ? <div style={{ fontFamily: 'Barlow Condensed', fontSize: '0.75rem', color: '#333' }}>Nothing</div> : receiving.map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '3px' }}>
            <OvrBadge ovr={s.ovr} />
            <span style={{ fontFamily: 'Barlow Condensed', fontSize: '0.8rem', color: '#ccc' }}>{s.name}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
