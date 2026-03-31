import React, { useState } from 'react'
import { useApp } from '../App.jsx'
import { getGM, GMS } from '../lib/data.js'
import { Modal, Btn, TextInput, SelectInput, Spinner } from './UI.jsx'
import { generatePromo } from '../lib/gemini.js'

export default function PromoModal() {
  const { modal, setModal, gm, pushFeedEvent, state } = useApp()
  const [target, setTarget] = useState('')
  const [promoText, setPromoText] = useState('')
  const [loading, setLoading] = useState(false)

  if (!modal || modal.type !== 'free_promo') return null

  const myGM = getGM(gm)

  async function generate() {
    setLoading(true)
    const text = await generatePromo({
      speaker: myGM?.short,
      target: target ? getGM(target)?.short : undefined,
      type: 'promo',
      alignment: myGM?.alignment,
    })
    setPromoText(text)
    setLoading(false)
  }

  async function post() {
    if (!promoText.trim()) return
    await pushFeedEvent({
      type: 'promo',
      gmId: gm,
      targetGM: target || null,
      text: `${myGM?.short} grabs the mic${target ? ` and calls out ${getGM(target)?.short}` : ''}.`,
      promo: promoText,
      promoBy: myGM?.short,
    })
    setModal(null)
    setPromoText('')
    setTarget('')
  }

  return (
    <Modal open title="🎤 Cut a Promo" onClose={() => { setModal(null); setPromoText(''); setTarget('') }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div>
          <div style={{ fontSize: '11px', color: '#555', letterSpacing: '0.1em', marginBottom: '6px' }}>CALLING OUT (OPTIONAL)</div>
          <SelectInput value={target} onChange={setTarget}>
            <option value="">General promo</option>
            {GMS.filter(g => g.id !== gm).map(g => <option key={g.id} value={g.id}>{g.short}</option>)}
          </SelectInput>
        </div>

        <Btn variant="solid" onClick={generate} disabled={loading} style={{ width: '100%' }}>
          {loading ? <span style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}><Spinner /> Generating...</span> : '✨ Generate AI Promo'}
        </Btn>

        {promoText && (
          <>
            <TextInput value={promoText} onChange={setPromoText} rows={5} style={{ fontSize: '13px', lineHeight: 1.7 }} />
            <div style={{ display: 'flex', gap: '8px' }}>
              <Btn variant="ghost" onClick={generate} style={{ flex: 1 }}>🔄 Regenerate</Btn>
              <Btn variant="solid" onClick={post} style={{ flex: 2 }}>Post to Feed</Btn>
            </div>
          </>
        )}

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '10px' }}>
          <div style={{ fontSize: '11px', color: '#444', marginBottom: '8px' }}>WRITE YOUR OWN</div>
          <TextInput value={promoText} onChange={setPromoText} placeholder="Type your promo..." rows={3} />
          {promoText && <Btn variant="solid" onClick={post} style={{ width: '100%', marginTop: '8px' }}>Post to Feed</Btn>}
        </div>
      </div>
    </Modal>
  )
}
