import React, { useState } from 'react'
import { useApp } from '../App.jsx'
import { GMS, getGM } from '../lib/data.js'
import { Card, Label, GMChip, Btn, Modal, TextInput, SelectInput, Divider, hexToRgb } from './UI.jsx'
import { supabase } from '../lib/data.js'

export default function FactionManager() {
  const { state, gm, pushFeedEvent, fetchState } = useApp()
  const [showCreate, setShowCreate] = useState(false)
  const factions = state?.factions || []

  async function disbandFaction(factionId) {
    const newFactions = factions.filter(f => f.id !== factionId)
    const disbanded = factions.find(f => f.id === factionId)
    await supabase.from('bs2_state').update({ factions: newFactions }).eq('id', 1)
    await pushFeedEvent({ type: 'faction', gmId: gm, text: `${disbanded?.name} has been disbanded.` })
    fetchState()
  }

  async function leaveFaction(factionId) {
    const newFactions = factions.map(f => f.id === factionId ? { ...f, members: f.members.filter(m => m !== gm) } : f).filter(f => f.members.length > 0)
    await supabase.from('bs2_state').update({ factions: newFactions }).eq('id', 1)
    await pushFeedEvent({ type: 'faction', gmId: gm, text: `${getGM(gm)?.short} has left ${factions.find(f => f.id === factionId)?.name}!` })
    fetchState()
  }

  return (
    <div style={{ paddingBottom: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <Label>Factions</Label>
        <Btn small variant="solid" onClick={() => setShowCreate(true)}>+ Form Faction</Btn>
      </div>

      {factions.length === 0 && (
        <div style={{ fontSize: '13px', color: '#444', textAlign: 'center', padding: '2rem' }}>No factions yet. Form one.</div>
      )}

      {factions.map(f => {
        const isMember = f.members.includes(gm)
        return (
          <Card key={f.id} style={{ borderLeft: `3px solid ${f.color}` }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <div style={{ fontSize: '16px', fontWeight: 800, color: f.color }}>{f.name}</div>
              <div style={{ display: 'flex', gap: '6px' }}>
                {isMember && f.leader === gm && <Btn small variant="red" onClick={() => disbandFaction(f.id)}>Disband</Btn>}
                {isMember && f.leader !== gm && <Btn small variant="ghost" onClick={() => leaveFaction(f.id)}>Leave</Btn>}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {f.members.map(mId => (
                <div key={mId} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <GMChip gmId={mId} />
                  {f.leader === mId && <span style={{ fontSize: '10px', color: '#d4af37' }}>★</span>}
                </div>
              ))}
            </div>
            {f.description && <div style={{ fontSize: '12px', color: '#666', fontStyle: 'italic', marginTop: '8px' }}>"{f.description}"</div>}
          </Card>
        )
      })}

      <CreateFactionModal open={showCreate} onClose={() => setShowCreate(false)} />
    </div>
  )
}

function CreateFactionModal({ open, onClose }) {
  const { state, gm, pushFeedEvent, fetchState } = useApp()
  const [name, setName] = useState('')
  const [members, setMembers] = useState([gm])
  const [color, setColor] = useState('#c8192a')
  const [description, setDescription] = useState('')
  const [saving, setSaving] = useState(false)
  if (!open) return null

  const COLORS = ['#c8192a', '#d4af37', '#4a9eff', '#2ecc8a', '#a78bfa', '#e8533a', '#f0a500']

  function toggleMember(id) {
    if (id === gm) return
    setMembers(members.includes(id) ? members.filter(m => m !== id) : [...members, id])
  }

  async function create() {
    if (!name.trim() || members.length < 1) return
    setSaving(true)
    const newFaction = { id: `faction_${Date.now()}`, name: name.trim(), members, color, leader: gm, description: description.trim() || null }
    const factions = [...(state.factions || []), newFaction]
    await supabase.from('bs2_state').update({ factions }).eq('id', 1)
    await pushFeedEvent({
      type: 'faction', gmId: gm,
      text: `${getGM(gm)?.short} forms a new faction — ${name}! Members: ${members.map(m => getGM(m)?.short).join(', ')}.`,
    })
    fetchState(); setSaving(false); onClose()
    setName(''); setMembers([gm]); setDescription('')
  }

  return (
    <Modal open title="Form Faction" onClose={onClose}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <TextInput value={name} onChange={setName} placeholder="Faction name..." />

        <div>
          <Label style={{ marginBottom: '8px' }}>Members</Label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {GMS.map(g => {
              const sel = members.includes(g.id)
              const isMe = g.id === gm
              return (
                <div key={g.id} onClick={() => !isMe && toggleMember(g.id)}
                  style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 10px', borderRadius: '8px', cursor: isMe ? 'default' : 'pointer', background: sel ? `rgba(${hexToRgb(g.color)}, 0.12)` : 'rgba(255,255,255,0.03)', border: `1px solid ${sel ? `rgba(${hexToRgb(g.color)}, 0.4)` : 'rgba(255,255,255,0.06)'}`, transition: 'all 0.15s' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: g.color }} />
                  <span style={{ fontSize: '13px', fontWeight: 600, color: sel ? '#fff' : '#666', flex: 1 }}>{g.short}</span>
                  {isMe && <span style={{ fontSize: '10px', color: '#555', letterSpacing: '0.1em' }}>LEADER</span>}
                  {sel && !isMe && <span style={{ fontSize: '12px', color: g.color }}>✓</span>}
                </div>
              )
            })}
          </div>
        </div>

        <div>
          <Label style={{ marginBottom: '8px' }}>Faction Color</Label>
          <div style={{ display: 'flex', gap: '8px' }}>
            {COLORS.map(c => (
              <div key={c} onClick={() => setColor(c)}
                style={{ width: 28, height: 28, borderRadius: '50%', background: c, cursor: 'pointer', border: color === c ? '2px solid #fff' : '2px solid transparent', transition: 'border 0.15s' }} />
            ))}
          </div>
        </div>

        <TextInput value={description} onChange={setDescription} placeholder="Faction motto or description (optional)..." />

        <Btn variant="solid" onClick={create} disabled={!name.trim() || saving} style={{ width: '100%' }}>
          {saving ? 'Forming...' : 'Form Faction'}
        </Btn>
      </div>
    </Modal>
  )
}
