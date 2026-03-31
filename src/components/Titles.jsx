import React, { useState } from 'react'
import { useApp } from '../App.jsx'
import { supabase, GMS, CHAMPIONSHIPS, getGM, getChamp } from '../lib/data.js'
import { Card, Label, OvrBadge, Btn, Modal, Divider, hexToRgb, SelectInput, TextInput, Spinner } from './UI.jsx'
import { generatePromo } from '../lib/gemini.js'

export default function Titles() {
  const { state, gm, pushFeedEvent, fetchState, setModal } = useApp()
  const [assigning, setAssigning] = useState(null)
  const [vacating, setVacating] = useState(null)
  const champs = state?.championships || {}
  const rosters = state?.rosters || {}

  return (
    <div style={{ paddingBottom: '5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div style={{ fontSize: '18px', fontWeight: 800, color: '#fff' }}>Championships</div>
        <Btn small variant="ghost" onClick={() => setModal({ type: 'free_promo' })}>🎤 Promo</Btn>
      </div>

      {CHAMPIONSHIPS.map(c => {
        const holder = champs[c.id]
        const holderGM = holder ? getGM(holder.gm) : null

        return (
          <Card key={c.id} style={{ padding: '1rem' }}>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', marginBottom: '12px' }}>
              <div style={{ width: '4px', minHeight: '48px', background: c.color, borderRadius: '2px', flexShrink: 0, marginTop: '2px' }} />
              <div style={{ flex: 1 }}>
                <Label color={c.color}>{c.name}</Label>
                {holder ? (
                  <div style={{ marginTop: '6px' }}>
                    {c.isTag ? (
                      <div>
                        {holder.superstar && <div style={{ fontSize: '16px', fontWeight: 800, color: '#fff', letterSpacing: '0.01em' }}>{holder.superstar}</div>}
                        {holder.superstar2 && <div style={{ fontSize: '16px', fontWeight: 800, color: '#fff', letterSpacing: '0.01em' }}>{holder.superstar2}</div>}
                        <div style={{ fontSize: '12px', color: holderGM?.color, fontWeight: 600, marginTop: '2px' }}>
                          {holderGM?.short}{holder.gm2 ? ` & ${getGM(holder.gm2)?.short}` : ''}
                        </div>
                      </div>
                    ) : (
                      <>
                        <div style={{ fontSize: '18px', fontWeight: 800, color: '#fff', letterSpacing: '0.01em' }}>{holder.superstar}</div>
                        <div style={{ fontSize: '12px', color: holderGM?.color, fontWeight: 600 }}>{holderGM?.short}</div>
                      </>
                    )}
                    {holder.won_at && (
                      <div style={{ fontSize: '10px', color: '#444', marginTop: '3px', letterSpacing: '0.06em' }}>
                        Since {new Date(holder.won_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ fontSize: '16px', fontWeight: 700, color: '#333', marginTop: '6px', letterSpacing: '0.06em' }}>VACANT</div>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <Btn small variant={holder ? 'ghost' : 'gold'} onClick={() => setAssigning(c.id)} style={{ flex: 1 }}>
                {holder ? 'Change' : 'Assign Title'}
              </Btn>
              {holder && (
                <Btn small variant="red" onClick={() => setVacating(c.id)}>Vacate</Btn>
              )}
            </div>
          </Card>
        )
      })}

      <AssignModal champId={assigning} onClose={() => setAssigning(null)} />
      <VacateModal champId={vacating} onClose={() => setVacating(null)} />
    </div>
  )
}

function AssignModal({ champId, onClose }) {
  const { state, gm, pushFeedEvent, fetchState } = useApp()
  const [gm1, setGm1] = useState(gm)
  const [star1, setStar1] = useState('')
  const [gm2, setGm2] = useState('')
  const [star2, setStar2] = useState('')
  const [saving, setSaving] = useState(false)

  if (!champId) return null
  const champ = getChamp(champId)
  const rosters = state?.rosters || {}
  const roster1 = [...(rosters[gm1] || [])].sort((a, b) => b.ovr - a.ovr)
  const roster2 = gm2 ? [...(rosters[gm2] || [])].sort((a, b) => b.ovr - a.ovr) : []

  async function assign() {
    if (!star1) return
    setSaving(true)
    const champs = { ...(state.championships || {}) }

    if (champ.isTag) {
      champs[champId] = { gm: gm1, superstar: star1, gm2: gm2 || null, superstar2: star2 || null, won_at: new Date().toISOString() }
    } else {
      champs[champId] = { gm: gm1, superstar: star1, won_at: new Date().toISOString() }
    }

    await supabase.from('bs2_state').update({ championships: champs }).eq('id', 1)

    const titleText = champ.isTag
      ? `${star1}${star2 ? ` & ${star2}` : ''} are the new ${champ.name}!`
      : `${star1} is the new ${champ.name}!`

    await pushFeedEvent({
      type: 'title_change',
      gmId: gm1,
      winnerGM: gm1,
      winnerStar: star1,
      champId,
      text: titleText,
    })
    fetchState()
    setSaving(false)
    onClose()
    setStar1(''); setStar2(''); setGm2('')
  }

  return (
    <Modal open title={`Assign ${champ?.name}`} onClose={onClose}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div>
          <Label style={{ marginBottom: '6px' }}>GM</Label>
          <SelectInput value={gm1} onChange={v => { setGm1(v); setStar1('') }}>
            {GMS.map(g => <option key={g.id} value={g.id}>{g.short}</option>)}
          </SelectInput>
        </div>
        <div>
          <Label style={{ marginBottom: '6px' }}>Champion</Label>
          <SelectInput value={star1} onChange={setStar1}>
            <option value="">Select superstar</option>
            {roster1.map(s => <option key={s.name} value={s.name}>{s.name} ({s.ovr})</option>)}
          </SelectInput>
        </div>

        {champ?.isTag && (
          <>
            <Divider />
            <div style={{ fontSize: '11px', color: '#555', letterSpacing: '0.1em' }}>TAG PARTNER</div>
            <div>
              <Label style={{ marginBottom: '6px' }}>Partner GM</Label>
              <SelectInput value={gm2} onChange={v => { setGm2(v); setStar2('') }}>
                <option value="">Same GM</option>
                {GMS.map(g => <option key={g.id} value={g.id}>{g.short}</option>)}
              </SelectInput>
            </div>
            <div>
              <Label style={{ marginBottom: '6px' }}>Tag Partner</Label>
              <SelectInput value={star2} onChange={setStar2}>
                <option value="">Select partner</option>
                {(gm2 ? [...(state?.rosters?.[gm2] || [])] : roster1).sort((a, b) => b.ovr - a.ovr).map(s => <option key={s.name} value={s.name}>{s.name} ({s.ovr})</option>)}
              </SelectInput>
            </div>
          </>
        )}

        <Btn variant="solid" onClick={assign} disabled={!star1 || saving} style={{ width: '100%', marginTop: '4px' }}>
          {saving ? 'Assigning...' : 'Confirm Assignment'}
        </Btn>
      </div>
    </Modal>
  )
}

function VacateModal({ champId, onClose }) {
  const { state, gm, pushFeedEvent, fetchState } = useApp()
  const [promoText, setPromoText] = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  if (!champId) return null
  const champ = getChamp(champId)
  const myGM = getGM(gm)

  async function genPromo() {
    setLoading(true)
    const text = await generatePromo({
      speaker: myGM?.short,
      type: 'title_vacated',
      champTitle: champ?.name,
      alignment: myGM?.alignment,
    })
    setPromoText(text)
    setLoading(false)
  }

  async function vacate() {
    setSaving(true)
    const champs = { ...(state.championships || {}) }
    delete champs[champId]
    await supabase.from('bs2_state').update({ championships: champs }).eq('id', 1)
    await pushFeedEvent({
      type: 'title_vacated',
      gmId: gm,
      text: `The ${champ?.name} has been vacated.`,
      promo: promoText || undefined,
      promoBy: promoText ? myGM?.short : undefined,
    })
    fetchState()
    setSaving(false)
    onClose()
    setPromoText('')
  }

  return (
    <Modal open title={`Vacate ${champ?.name}`} onClose={onClose}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ fontSize: '13px', color: '#888', lineHeight: 1.6 }}>
          This will remove the current champion. Optionally cut a promo explaining why.
        </div>
        <Btn variant="ghost" onClick={genPromo} disabled={loading} style={{ width: '100%' }}>
          {loading ? '✨ Generating...' : '✨ Generate Vacate Promo'}
        </Btn>
        <TextInput value={promoText} onChange={setPromoText} placeholder="Optional promo (or leave empty)..." rows={3} />
        <div style={{ display: 'flex', gap: '8px' }}>
          <Btn variant="ghost" onClick={onClose} style={{ flex: 1 }}>Cancel</Btn>
          <Btn variant="red" onClick={vacate} disabled={saving} style={{ flex: 1 }}>
            {saving ? 'Vacating...' : 'Vacate Title'}
          </Btn>
        </div>
      </div>
    </Modal>
  )
}
