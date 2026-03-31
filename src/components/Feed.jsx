import React, { useState } from 'react'
import { useApp } from '../App.jsx'
import { getGM, getChamp, getStarData, timeAgo } from '../lib/data.js'
import { Card, Label, GMChip, GMPip, Btn, Modal, PromoBox, TextInput, hexToRgb, Spinner, ChampBadge } from './UI.jsx'
import { generatePromo } from '../lib/gemini.js'
import { supabase } from '../lib/data.js'
import PromoModal from './PromoModal.jsx'

export default function Feed() {
  const { state, gm, setModal } = useApp()
  const feed = state?.feed || []

  if (feed.length === 0) {
    return (
      <div style={{ padding: '3rem 1rem', textAlign: 'center' }}>
        <div style={{ fontSize: '32px', marginBottom: '12px' }}>🎤</div>
        <div style={{ fontSize: '15px', fontWeight: 700, color: '#fff', marginBottom: '6px' }}>The arena is quiet.</div>
        <div style={{ fontSize: '13px', color: '#555', lineHeight: 1.6 }}>Log a match, assign a title, start a feud — the show begins when someone makes a move.</div>
      </div>
    )
  }

  return (
    <div style={{ paddingBottom: '1rem' }}>
      {feed.map(item => <FeedCard key={item.id} item={item} />)}
    </div>
  )
}

function FeedCard({ item }) {
  const { gm, setModal, pushFeedEvent, state } = useApp()
  const [expanded, setExpanded] = useState(false)
  const [showActions, setShowActions] = useState(false)

  const typeConfig = {
    match: { icon: '⚡', color: '#f0a500', label: 'Match Result' },
    title_change: { icon: '🏆', color: '#d4af37', label: 'Title Change' },
    promo: { icon: '🎤', color: '#4a9eff', label: 'Promo' },
    callout: { icon: '🔥', color: '#e8533a', label: 'Callout' },
    trade: { icon: '↔', color: '#2ecc8a', label: 'Trade' },
    faction: { icon: '⚑', color: '#a78bfa', label: 'Faction' },
    title_vacated: { icon: '👑', color: '#888', label: 'Vacated' },
    congratulate: { icon: '👏', color: '#2ecc8a', label: 'Reaction' },
    respond: { icon: '💬', color: '#4a9eff', label: 'Response' },
    rematch: { icon: '⚔', color: '#e8533a', label: 'Rematch Demand' },
  }

  const cfg = typeConfig[item.type] || { icon: '·', color: '#555', label: 'Update' }

  const actions = buildActions(item, gm, state)

  function handleAction(action) {
    setShowActions(false)
    setModal({ type: 'promo_action', item, action, gm })
  }

  return (
    <div className="fade-in" style={{ marginBottom: '0.65rem' }}>
      <Card style={{ padding: '0.85rem' }}>
        {/* header row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <span style={{ fontSize: '16px', lineHeight: 1 }}>{cfg.icon}</span>
          <div style={{ flex: 1 }}>
            <Label color={cfg.color}>{cfg.label}</Label>
          </div>
          <span style={{ fontSize: '10px', color: '#444', letterSpacing: '0.08em' }}>{timeAgo(item.ts)}</span>
        </div>

        {/* main content */}
        <div style={{ fontSize: '14px', color: '#ddd', lineHeight: 1.6, fontWeight: 500, marginBottom: item.promo ? '8px' : '0' }}>
          {item.text}
        </div>

        {/* promo text if any */}
        {item.promo && (
          <PromoBox text={item.promo} author={item.promoBy || getGM(item.gmId)?.short} gmId={item.gmId} style={{ marginTop: '8px' }} />
        )}

        {/* responses */}
        {item.responses && item.responses.length > 0 && (
          <div style={{ marginTop: '8px' }}>
            {(expanded ? item.responses : item.responses.slice(-1)).map((r, i) => (
              <PromoBox key={i} text={r.text} author={r.author} gmId={r.gmId} ts={r.ts} style={{ marginTop: '6px' }} />
            ))}
            {item.responses.length > 1 && (
              <button onClick={() => setExpanded(!expanded)} style={{ background: 'none', border: 'none', fontSize: '11px', color: '#555', cursor: 'pointer', padding: '4px 0', fontFamily: 'Syne, sans-serif' }}>
                {expanded ? 'Show less' : `+${item.responses.length - 1} more responses`}
              </button>
            )}
          </div>
        )}

        {/* action buttons */}
        {actions.length > 0 && (
          <div style={{ marginTop: '10px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {actions.slice(0, 3).map(a => (
              <Btn key={a.id} small variant={a.variant || 'ghost'} onClick={() => handleAction(a)}>{a.label}</Btn>
            ))}
            {actions.length > 3 && (
              <Btn small variant="ghost" onClick={() => setShowActions(!showActions)}>More ···</Btn>
            )}
          </div>
        )}

        {showActions && (
          <div style={{ marginTop: '6px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {actions.slice(3).map(a => (
              <Btn key={a.id} small variant={a.variant || 'ghost'} onClick={() => handleAction(a)}>{a.label}</Btn>
            ))}
          </div>
        )}
      </Card>
      <PromoActionModal />
    </div>
  )
}

function buildActions(item, gm, state) {
  const actions = []
  const champs = state?.championships || {}
  const myTitles = Object.entries(champs).filter(([, v]) => v?.gm === gm).map(([k]) => k)
  const isMyEvent = item.gmId === gm || item.winnerGM === gm

  // Always: cut a promo
  actions.push({ id: 'promo', label: '🎤 Cut Promo', variant: 'default' })

  if (item.type === 'match') {
    const iLoser = item.loserGM === gm
    const iWinner = item.winnerGM === gm
    if (iLoser) actions.push({ id: 'rematch', label: '⚔ Demand Rematch', variant: 'red' })
    if (iWinner) actions.push({ id: 'gloat', label: '😤 Gloat', variant: 'gold' })
    actions.push({ id: 'respond', label: '💬 Respond', variant: 'ghost' })
  }

  if (item.type === 'title_change') {
    const newChampGM = item.winnerGM
    if (newChampGM !== gm) {
      actions.push({ id: 'challenge', label: '🎯 Challenge', variant: 'red' })
      actions.push({ id: 'congratulate', label: '👏 Congratulate', variant: 'green' })
    }
  }

  if (item.type === 'callout' || item.type === 'promo') {
    if (item.targetGM === gm || item.gmId !== gm) {
      actions.push({ id: 'fire_back', label: '🔥 Fire Back', variant: 'red' })
      actions.push({ id: 'accept', label: '✓ Accept', variant: 'green' })
      actions.push({ id: 'reject', label: '✗ Dismiss', variant: 'ghost' })
      actions.push({ id: 'qualifying', label: '🏆 Make them qualify', variant: 'gold' })
    }
  }

  if (item.type === 'faction') {
    actions.push({ id: 'respond', label: '💬 Respond', variant: 'ghost' })
  }

  return actions
}

function PromoActionModal() {
  const { modal, setModal, gm, pushFeedEvent, state } = useApp()
  const [loading, setLoading] = useState(false)
  const [promoText, setPromoText] = useState('')
  const [edited, setEdited] = useState(false)

  if (!modal || modal.type !== 'promo_action') return null

  const { item, action } = modal
  const myGM = getGM(gm)
  const targetGM = getGM(item.gmId !== gm ? item.gmId : item.targetGM)
  const champs = state?.championships || {}

  async function generateAndShow() {
    setLoading(true)
    const myRoster = state?.rosters?.[gm] || []
    const myBestStar = myRoster.sort((a, b) => b.ovr - a.ovr)[0]
    const targetTitle = item.champId ? getChamp(item.champId) : null

    const text = await generatePromo({
      speaker: myGM?.short,
      target: targetGM?.short || item.winnerStar,
      context: item.text,
      type: action.id,
      champTitle: targetTitle?.name,
      alignment: myGM?.alignment,
    })
    setPromoText(text)
    setEdited(false)
    setLoading(false)
  }

  async function post() {
    if (!promoText.trim()) return
    const feedEntry = buildFeedEntry(action.id, gm, promoText, item, myGM, targetGM)
    await pushFeedEvent(feedEntry)

    // also add as response to original item
    if (['fire_back','respond','accept','reject','congratulate','rematch','qualifying','gloat'].includes(action.id)) {
      const feed = [...(state.feed || [])]
      const idx = feed.findIndex(f => f.id === item.id)
      if (idx >= 0) {
        const responses = [...(feed[idx].responses || []), { text: promoText, author: myGM?.short, gmId: gm, ts: new Date().toISOString() }]
        feed[idx] = { ...feed[idx], responses }
        await supabase.from('bs2_state').update({ feed }).eq('id', 1)
      }
    }

    setModal(null)
    setPromoText('')
  }

  return (
    <Modal open title={action.label} onClose={() => { setModal(null); setPromoText('') }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ fontSize: '12px', color: '#555', lineHeight: 1.6 }}>
          Responding to: <span style={{ color: '#ccc' }}>{item.text?.slice(0, 80)}...</span>
        </div>

        {!promoText && !loading && (
          <Btn variant="solid" onClick={generateAndShow} style={{ width: '100%' }}>
            ✨ Generate AI Promo (Gemini)
          </Btn>
        )}

        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '1rem', justifyContent: 'center' }}>
            <Spinner />
            <span style={{ fontSize: '13px', color: '#888' }}>Writing your promo...</span>
          </div>
        )}

        {promoText && (
          <>
            <TextInput value={promoText} onChange={setPromoText} rows={5} style={{ fontSize: '13px', lineHeight: 1.7 }} />
            <div style={{ display: 'flex', gap: '8px' }}>
              <Btn variant="ghost" onClick={generateAndShow} style={{ flex: 1 }}>🔄 Regenerate</Btn>
              <Btn variant="solid" onClick={post} style={{ flex: 2 }}>Post Promo</Btn>
            </div>
          </>
        )}

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '10px' }}>
          <div style={{ fontSize: '11px', color: '#444', marginBottom: '8px', letterSpacing: '0.05em' }}>OR WRITE YOUR OWN</div>
          <TextInput value={promoText} onChange={setPromoText} placeholder="Write your promo..." rows={3} />
          {promoText && <Btn variant="solid" onClick={post} style={{ width: '100%', marginTop: '8px' }}>Post</Btn>}
        </div>
      </div>
    </Modal>
  )
}

function buildFeedEntry(actionId, gm, promoText, item, myGM, targetGM) {
  const base = { gmId: gm, promo: promoText, promoBy: myGM?.short }
  const map = {
    promo: { type: 'promo', text: `${myGM?.short} steps up to cut a promo.` },
    fire_back: { type: 'respond', text: `${myGM?.short} fires back at ${targetGM?.short || 'the locker room'}.` },
    respond: { type: 'respond', text: `${myGM?.short} responds.` },
    accept: { type: 'callout', text: `${myGM?.short} ACCEPTS the challenge!`, targetGM: item.gmId },
    reject: { type: 'respond', text: `${myGM?.short} dismisses ${targetGM?.short || 'the challenge'}.` },
    congratulate: { type: 'congratulate', text: `${myGM?.short} congratulates ${targetGM?.short}.` },
    rematch: { type: 'rematch', text: `${myGM?.short} demands a rematch!`, targetGM: item.winnerGM },
    challenge: { type: 'callout', text: `${myGM?.short} challenges for the gold!`, champId: item.champId },
    gloat: { type: 'promo', text: `${myGM?.short} gloats after the victory.` },
    qualifying: { type: 'callout', text: `${myGM?.short} tells ${targetGM?.short} to earn their shot first.` },
  }
  return { ...base, ...(map[actionId] || map.promo) }
}
