import React, { useState } from 'react'
import { useApp } from '../App.jsx'
import { getGM, getChamp, timeAgo } from '../lib/data.js'
import { Card, Label, Btn, Modal, PromoBox, TextInput, Spinner } from './UI.jsx'
import { generatePromo } from '../lib/gemini.js'
import { supabase } from '../lib/data.js'
import PromoModal from './PromoModal.jsx'

export default function Feed() {
  const { state } = useApp()
  const feed = state?.feed || []

  if (feed.length === 0) {
    return (
      <div className="premium-empty">
        <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>🎤</div>
        <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text)', marginBottom: '0.35rem' }}>The arena is quiet.</div>
        <div style={{ maxWidth: '34rem', margin: '0 auto', lineHeight: 1.7 }}>
          Log a match, assign a title, or fire the first promo. Every move becomes a live feed moment.
        </div>
      </div>
    )
  }

  return (
    <div style={{ paddingBottom: '0.5rem' }}>
      {feed.map(item => <FeedCard key={item.id} item={item} />)}
    </div>
  )
}

function FeedCard({ item }) {
  const { gm, setModal, state } = useApp()
  const [expanded, setExpanded] = useState(false)
  const [showActions, setShowActions] = useState(false)

  const typeConfig = {
    match: { icon: '⚡', color: '#f2ca72', label: 'Match Result' },
    title_change: { icon: '🏆', color: '#f2ca72', label: 'Title Change' },
    promo: { icon: '🎤', color: '#7cccff', label: 'Promo' },
    callout: { icon: '🔥', color: '#ff8d9f', label: 'Callout' },
    trade: { icon: '↔', color: '#79ecb1', label: 'Trade' },
    faction: { icon: '⚑', color: '#bea4ff', label: 'Faction' },
    title_vacated: { icon: '👑', color: '#d4d9eb', label: 'Vacated' },
    congratulate: { icon: '👏', color: '#79ecb1', label: 'Reaction' },
    respond: { icon: '💬', color: '#7cccff', label: 'Response' },
    rematch: { icon: '⚔', color: '#ff8d9f', label: 'Rematch Demand' },
  }

  const cfg = typeConfig[item.type] || { icon: '·', color: 'var(--text-dim)', label: 'Update' }
  const actions = buildActions(item, gm, state)

  function handleAction(action) {
    setShowActions(false)
    setModal({ type: 'promo_action', item, action, gm })
  }

  return (
    <div className="fade-in" style={{ marginBottom: '0.8rem' }}>
      <Card style={{ padding: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem', marginBottom: '0.9rem' }}>
          <div
            style={{
              width: '2.7rem',
              height: '2.7rem',
              borderRadius: '18px',
              background: `linear-gradient(180deg, ${cfg.color}28, rgba(255,255,255,0.06))`,
              border: `1px solid ${cfg.color}44`,
              display: 'grid',
              placeItems: 'center',
              fontSize: '1rem',
              boxShadow: `0 14px 28px ${cfg.color}18`,
            }}
          >
            {cfg.icon}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem', alignItems: 'center', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
              <Label color={cfg.color}>{cfg.label}</Label>
              <span style={{ fontSize: '0.68rem', color: 'var(--text-dim)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>{timeAgo(item.ts)}</span>
            </div>
            <div style={{ fontSize: '0.98rem', color: 'var(--text)', lineHeight: 1.65, fontWeight: 700 }}>{item.text}</div>
          </div>
        </div>

        {item.promo && (
          <PromoBox text={item.promo} author={item.promoBy || getGM(item.gmId)?.short} gmId={item.gmId} style={{ marginTop: '0.8rem' }} />
        )}

        {item.responses && item.responses.length > 0 && (
          <div style={{ marginTop: '0.8rem' }}>
            {(expanded ? item.responses : item.responses.slice(-1)).map((r, i) => (
              <PromoBox key={i} text={r.text} author={r.author} gmId={r.gmId} ts={r.ts} style={{ marginTop: '0.55rem' }} />
            ))}
            {item.responses.length > 1 && (
              <button
                onClick={() => setExpanded(!expanded)}
                style={{ background: 'none', border: 'none', fontSize: '0.72rem', color: 'var(--text-dim)', cursor: 'pointer', padding: '0.5rem 0 0', letterSpacing: '0.08em', textTransform: 'uppercase' }}
              >
                {expanded ? 'Show less' : `+${item.responses.length - 1} more responses`}
              </button>
            )}
          </div>
        )}

        {actions.length > 0 && (
          <div style={{ marginTop: '1rem', display: 'flex', gap: '0.45rem', flexWrap: 'wrap' }}>
            {actions.slice(0, 3).map(a => (
              <Btn key={a.id} small variant={a.variant || 'ghost'} onClick={() => handleAction(a)}>{a.label}</Btn>
            ))}
            {actions.length > 3 && (
              <Btn small variant="ghost" onClick={() => setShowActions(!showActions)}>More</Btn>
            )}
          </div>
        )}

        {showActions && (
          <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.45rem', flexWrap: 'wrap' }}>
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

  actions.push({ id: 'promo', label: 'Cut Promo', variant: 'default' })

  if (item.type === 'match') {
    const iLoser = item.loserGM === gm
    const iWinner = item.winnerGM === gm
    if (iLoser) actions.push({ id: 'rematch', label: 'Demand Rematch', variant: 'red' })
    if (iWinner) actions.push({ id: 'gloat', label: 'Gloat', variant: 'gold' })
    actions.push({ id: 'respond', label: 'Respond', variant: 'ghost' })
  }

  if (item.type === 'title_change') {
    const newChampGM = item.winnerGM
    if (newChampGM !== gm) {
      actions.push({ id: 'challenge', label: 'Challenge', variant: 'red' })
      actions.push({ id: 'congratulate', label: 'Congratulate', variant: 'green' })
    }
  }

  if (item.type === 'callout' || item.type === 'promo') {
    if (item.targetGM === gm || item.gmId !== gm) {
      actions.push({ id: 'fire_back', label: 'Fire Back', variant: 'red' })
      actions.push({ id: 'accept', label: 'Accept', variant: 'green' })
      actions.push({ id: 'reject', label: 'Dismiss', variant: 'ghost' })
      actions.push({ id: 'qualifying', label: 'Make Them Qualify', variant: 'gold' })
    }
  }

  if (item.type === 'faction') {
    actions.push({ id: 'respond', label: 'Respond', variant: 'ghost' })
  }

  return actions
}

function PromoActionModal() {
  const { modal, setModal, gm, pushFeedEvent, state } = useApp()
  const [loading, setLoading] = useState(false)
  const [promoText, setPromoText] = useState('')

  if (!modal || modal.type !== 'promo_action') return null

  const { item, action } = modal
  const myGM = getGM(gm)
  const targetGM = getGM(item.gmId !== gm ? item.gmId : item.targetGM)

  async function generateAndShow() {
    setLoading(true)
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
    setLoading(false)
  }

  async function post() {
    if (!promoText.trim()) return
    const feedEntry = buildFeedEntry(action.id, gm, promoText, item, myGM, targetGM)
    await pushFeedEvent(feedEntry)

    if (['fire_back', 'respond', 'accept', 'reject', 'congratulate', 'rematch', 'qualifying', 'gloat'].includes(action.id)) {
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
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.7 }}>
          Responding to <span style={{ color: 'var(--text)' }}>{item.text?.slice(0, 100)}...</span>
        </div>

        {!promoText && !loading && (
          <Btn variant="solid" onClick={generateAndShow} style={{ width: '100%' }}>
            Generate AI Promo
          </Btn>
        )}

        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', justifyContent: 'center' }}>
            <Spinner />
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Writing your promo...</span>
          </div>
        )}

        {promoText && (
          <>
            <TextInput value={promoText} onChange={setPromoText} rows={5} style={{ fontSize: '0.88rem', lineHeight: 1.75 }} />
            <div style={{ display: 'flex', gap: '0.6rem' }}>
              <Btn variant="ghost" onClick={generateAndShow} style={{ flex: 1 }}>Regenerate</Btn>
              <Btn variant="solid" onClick={post} style={{ flex: 1.4 }}>Post Promo</Btn>
            </div>
          </>
        )}

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '0.9rem' }}>
          <div style={{ fontSize: '0.66rem', color: 'var(--text-dim)', marginBottom: '0.55rem', letterSpacing: '0.16em', textTransform: 'uppercase' }}>Or write your own</div>
          <TextInput value={promoText} onChange={setPromoText} placeholder="Write your promo..." rows={3} />
          {promoText && <Btn variant="solid" onClick={post} style={{ width: '100%', marginTop: '0.7rem' }}>Post</Btn>}
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
    qualifying: { type: 'callout', text: `${myGM?.short} says ${targetGM?.short || 'they'} must qualify first.` },
    gloat: { type: 'promo', text: `${myGM?.short} gloats after the victory.` },
    challenge: { type: 'callout', text: `${myGM?.short} steps up to challenge for gold.`, targetGM: item.winnerGM },
  }
  return { ...base, ...(map[actionId] || map.respond) }
}

export { PromoActionModal }
