import React, { useState } from 'react'
import { GMS, CHAMPIONSHIPS, getGM, getChamp } from '../lib/data.js'
import { Card, SectionLabel, ActionBtn } from './UI.jsx'

const ANNOUNCEMENT_TYPES = [
  { id: 'match_result', label: 'Match Result' },
  { id: 'title_change', label: 'Title Change' },
  { id: 'trade', label: 'Trade Announcement' },
  { id: 'contract_signing', label: 'Contract Signing' },
  { id: 'challenge', label: 'Open Challenge' },
  { id: 'faction', label: 'Faction Statement' },
  { id: 'custom', label: 'Custom' },
]

export default function Announcements({ gm, state, matches }) {
  const [type, setType] = useState('match_result')
  const [form, setForm] = useState({})
  const [generated, setGenerated] = useState(null)
  const [copied, setCopied] = useState(false)

  const rosters = state?.rosters || {}
  const champs = state?.championships || {}
  const myRoster = [...(rosters[gm] || [])].sort((a, b) => b.ovr - a.ovr)

  function set(key, val) { setForm(f => ({ ...f, [key]: val })) }

  function generate() {
    let text = ''
    let title = ''

    if (type === 'match_result') {
      const winner = form.winner || 'Unknown'
      const loser = form.loser || 'Unknown'
      const wGM = getGM(form.winnerGM)
      const lGM = getGM(form.loserGM)
      const matchT = form.matchType || 'Singles Match'
      const champ = form.titleOnLine ? getChamp(form.titleOnLine) : null
      title = champ ? `NEW ${champ.short.toUpperCase()} CHAMPION` : 'MATCH RESULT'
      text = `🚨 OFFICIAL RESULT 🚨\n\n${matchT.toUpperCase()}\n\n${winner} (${wGM?.short}) def. ${loser} (${lGM?.short})${champ ? `\n\n🏆 ${winner} is your NEW ${champ.name}!` : ''}\n\n${form.notes || ''}`
    }

    if (type === 'title_change') {
      const champ = form.champId ? getChamp(form.champId) : null
      const newChamp = form.newChamp || 'Unknown'
      const gmInfo = getGM(form.champGM)
      title = `NEW ${champ?.short?.toUpperCase() || 'TITLE'} CHAMPION`
      text = `🏆 TITLE CHANGE 🏆\n\nWE HAVE A NEW ${(champ?.name || 'CHAMPION').toUpperCase()}!\n\n${newChamp.toUpperCase()} (${gmInfo?.short}) has captured the ${champ?.name || 'title'}!\n\n${form.notes || ''}`
    }

    if (type === 'trade') {
      const gm1 = getGM(form.tradeGM1)
      const gm2 = getGM(form.tradeGM2)
      title = 'TRADE ANNOUNCEMENT'
      text = `🔄 OFFICIAL TRADE 🔄\n\n${gm1?.short?.toUpperCase()} and ${gm2?.short?.toUpperCase()} have agreed to a trade!\n\n${gm1?.short} sends: ${form.gives1 || 'TBD'}\n${gm2?.short} sends: ${form.gives2 || 'TBD'}\n\n${form.notes || 'This trade is now official.'}`
    }

    if (type === 'contract_signing') {
      const signerGM = getGM(form.signerGM)
      title = 'CONTRACT SIGNING'
      text = `✍️ CONTRACT SIGNING ✍️\n\n${form.superstar || 'A Superstar'} has officially signed with ${signerGM?.short || 'a GM'}!\n\n${form.notes || 'The contract has been signed. It is official.'}`
    }

    if (type === 'challenge') {
      const challenger = getGM(gm)
      const champ = form.champId ? getChamp(form.champId) : null
      title = 'OPEN CHALLENGE'
      text = `🎤 OPEN CHALLENGE 🎤\n\n${getGM(gm)?.short?.toUpperCase()} ISSUES AN OPEN CHALLENGE!\n\n"${form.superstar || 'My superstar'} is putting out an open challenge${champ ? ` for the ${champ.name}` : ''}. Anyone who thinks they can step up — the answer is NO CHANCE IN HELL."\n\n${form.notes || ''}`
    }

    if (type === 'faction') {
      title = 'THE AUTHORITY SPEAKS'
      text = `⚑ OFFICIAL STATEMENT — THE AUTHORITY ⚑\n\n${form.statement || 'The Authority has spoken. What is best for business is best for everyone. And right now, business is good.'}\n\n— The Authority (Srikant & Ashpak)`
    }

    if (type === 'custom') {
      title = form.customTitle || 'ANNOUNCEMENT'
      text = form.customText || ''
    }

    setGenerated({ text, title })
    setCopied(false)
  }

  function copyText() {
    if (!generated) return
    navigator.clipboard.writeText(generated.text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000) })
  }

  return (
    <div style={{ paddingBottom: '2rem' }}>
      <SectionLabel>Announcement type</SectionLabel>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '1.25rem' }}>
        {ANNOUNCEMENT_TYPES.map(t => (
          <button key={t.id} onClick={() => { setType(t.id); setForm({}); setGenerated(null) }}
            style={{ padding: '0.35rem 0.75rem', borderRadius: '99px', fontFamily: 'Barlow Condensed', fontSize: '0.75rem', letterSpacing: '0.1em', cursor: 'pointer', background: type === t.id ? '#c8192a' : 'rgba(255,255,255,0.04)', border: type === t.id ? '1px solid #c8192a' : '1px solid rgba(255,255,255,0.07)', color: type === t.id ? '#fff' : '#666' }}>
            {t.label}
          </button>
        ))}
      </div>

      <Card>
        {/* MATCH RESULT form */}
        {type === 'match_result' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <div>
                <div style={{ fontFamily: 'Barlow Condensed', fontSize: '0.65rem', color: '#555', letterSpacing: '0.2em', marginBottom: '4px' }}>WINNER GM</div>
                <select value={form.winnerGM || ''} onChange={e => set('winnerGM', e.target.value)} style={selStyle}>
                  <option value="">GM</option>
                  {GMS.map(g => <option key={g.id} value={g.id}>{g.short}</option>)}
                </select>
              </div>
              <div>
                <div style={{ fontFamily: 'Barlow Condensed', fontSize: '0.65rem', color: '#555', letterSpacing: '0.2em', marginBottom: '4px' }}>LOSER GM</div>
                <select value={form.loserGM || ''} onChange={e => set('loserGM', e.target.value)} style={selStyle}>
                  <option value="">GM</option>
                  {GMS.map(g => <option key={g.id} value={g.id}>{g.short}</option>)}
                </select>
              </div>
            </div>
            <FieldRow label="Winner superstar" value={form.winner || ''} onChange={v => set('winner', v)} placeholder="e.g. Randy Orton" />
            <FieldRow label="Loser superstar" value={form.loser || ''} onChange={v => set('loser', v)} placeholder="e.g. CM Punk" />
            <div>
              <div style={{ fontFamily: 'Barlow Condensed', fontSize: '0.65rem', color: '#555', letterSpacing: '0.2em', marginBottom: '4px' }}>MATCH TYPE</div>
              <select value={form.matchType || ''} onChange={e => set('matchType', e.target.value)} style={selStyle}>
                {['Singles Match','No DQ','Steel Cage','Hell in a Cell','Ladder','Last Man Standing'].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <div style={{ fontFamily: 'Barlow Condensed', fontSize: '0.65rem', color: '#555', letterSpacing: '0.2em', marginBottom: '4px' }}>TITLE ON THE LINE</div>
              <select value={form.titleOnLine || ''} onChange={e => set('titleOnLine', e.target.value)} style={selStyle}>
                <option value="">None</option>
                {CHAMPIONSHIPS.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <FieldRow label="Notes" value={form.notes || ''} onChange={v => set('notes', v)} placeholder="Optional flavour text" />
          </div>
        )}

        {/* TITLE CHANGE form */}
        {type === 'title_change' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div>
              <div style={{ fontFamily: 'Barlow Condensed', fontSize: '0.65rem', color: '#555', letterSpacing: '0.2em', marginBottom: '4px' }}>CHAMPIONSHIP</div>
              <select value={form.champId || ''} onChange={e => set('champId', e.target.value)} style={selStyle}>
                <option value="">Select</option>
                {CHAMPIONSHIPS.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <div style={{ fontFamily: 'Barlow Condensed', fontSize: '0.65rem', color: '#555', letterSpacing: '0.2em', marginBottom: '4px' }}>NEW CHAMPION'S GM</div>
              <select value={form.champGM || ''} onChange={e => set('champGM', e.target.value)} style={selStyle}>
                <option value="">Select</option>
                {GMS.map(g => <option key={g.id} value={g.id}>{g.short}</option>)}
              </select>
            </div>
            <FieldRow label="New champion" value={form.newChamp || ''} onChange={v => set('newChamp', v)} placeholder="Superstar name" />
            <FieldRow label="Notes" value={form.notes || ''} onChange={v => set('notes', v)} placeholder="Optional" />
          </div>
        )}

        {/* TRADE form */}
        {type === 'trade' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <div>
                <div style={{ fontFamily: 'Barlow Condensed', fontSize: '0.65rem', color: '#555', letterSpacing: '0.2em', marginBottom: '4px' }}>GM 1</div>
                <select value={form.tradeGM1 || ''} onChange={e => set('tradeGM1', e.target.value)} style={selStyle}>
                  <option value="">Select</option>
                  {GMS.map(g => <option key={g.id} value={g.id}>{g.short}</option>)}
                </select>
              </div>
              <div>
                <div style={{ fontFamily: 'Barlow Condensed', fontSize: '0.65rem', color: '#555', letterSpacing: '0.2em', marginBottom: '4px' }}>GM 2</div>
                <select value={form.tradeGM2 || ''} onChange={e => set('tradeGM2', e.target.value)} style={selStyle}>
                  <option value="">Select</option>
                  {GMS.map(g => <option key={g.id} value={g.id}>{g.short}</option>)}
                </select>
              </div>
            </div>
            <FieldRow label={`${getGM(form.tradeGM1)?.short || 'GM1'} sends`} value={form.gives1 || ''} onChange={v => set('gives1', v)} placeholder="Superstar(s)" />
            <FieldRow label={`${getGM(form.tradeGM2)?.short || 'GM2'} sends`} value={form.gives2 || ''} onChange={v => set('gives2', v)} placeholder="Superstar(s)" />
            <FieldRow label="Notes" value={form.notes || ''} onChange={v => set('notes', v)} placeholder="Optional" />
          </div>
        )}

        {/* CONTRACT SIGNING */}
        {type === 'contract_signing' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div>
              <div style={{ fontFamily: 'Barlow Condensed', fontSize: '0.65rem', color: '#555', letterSpacing: '0.2em', marginBottom: '4px' }}>SIGNING GM</div>
              <select value={form.signerGM || ''} onChange={e => set('signerGM', e.target.value)} style={selStyle}>
                <option value="">Select</option>
                {GMS.map(g => <option key={g.id} value={g.id}>{g.short}</option>)}
              </select>
            </div>
            <FieldRow label="Superstar" value={form.superstar || ''} onChange={v => set('superstar', v)} placeholder="Superstar name" />
            <FieldRow label="Notes" value={form.notes || ''} onChange={v => set('notes', v)} placeholder="Contract terms / flavour" />
          </div>
        )}

        {/* CHALLENGE */}
        {type === 'challenge' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <FieldRow label="Your superstar issuing challenge" value={form.superstar || ''} onChange={v => set('superstar', v)} placeholder="e.g. Randy Orton" />
            <div>
              <div style={{ fontFamily: 'Barlow Condensed', fontSize: '0.65rem', color: '#555', letterSpacing: '0.2em', marginBottom: '4px' }}>TITLE ON THE LINE (OPTIONAL)</div>
              <select value={form.champId || ''} onChange={e => set('champId', e.target.value)} style={selStyle}>
                <option value="">None</option>
                {CHAMPIONSHIPS.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <FieldRow label="Quote / flavour" value={form.notes || ''} onChange={v => set('notes', v)} placeholder="Optional trash talk" />
          </div>
        )}

        {/* FACTION */}
        {type === 'faction' && (
          <div>
            <div style={{ fontFamily: 'Barlow Condensed', fontSize: '0.65rem', color: '#555', letterSpacing: '0.2em', marginBottom: '4px' }}>STATEMENT</div>
            <textarea value={form.statement || ''} onChange={e => set('statement', e.target.value)} rows={4} placeholder="Write The Authority's statement..."
              style={{ width: '100%', padding: '0.7rem', background: '#111', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '3px', color: '#ccc', fontFamily: 'Barlow Condensed', fontSize: '0.9rem', outline: 'none', resize: 'vertical' }} />
          </div>
        )}

        {/* CUSTOM */}
        {type === 'custom' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <FieldRow label="Title" value={form.customTitle || ''} onChange={v => set('customTitle', v)} placeholder="e.g. BREAKING NEWS" />
            <div>
              <div style={{ fontFamily: 'Barlow Condensed', fontSize: '0.65rem', color: '#555', letterSpacing: '0.2em', marginBottom: '4px' }}>MESSAGE</div>
              <textarea value={form.customText || ''} onChange={e => set('customText', e.target.value)} rows={5} placeholder="Your announcement..."
                style={{ width: '100%', padding: '0.7rem', background: '#111', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '3px', color: '#ccc', fontFamily: 'Barlow Condensed', fontSize: '0.9rem', outline: 'none', resize: 'vertical' }} />
            </div>
          </div>
        )}

        <ActionBtn variant="red" onClick={generate} style={{ width: '100%', marginTop: '12px', padding: '0.85rem', fontSize: '0.9rem' }}>Generate Announcement</ActionBtn>
      </Card>

      {/* OUTPUT */}
      {generated && (
        <>
          <SectionLabel>WhatsApp text</SectionLabel>
          <Card style={{ padding: '1rem' }}>
            <pre style={{ fontFamily: 'Barlow', fontSize: '0.9rem', color: '#ccc', whiteSpace: 'pre-wrap', lineHeight: 1.6, margin: 0 }}>{generated.text}</pre>
            <ActionBtn variant="green" onClick={copyText} style={{ marginTop: '12px', width: '100%' }}>
              {copied ? 'Copied!' : 'Copy for WhatsApp'}
            </ActionBtn>
          </Card>

          <SectionLabel>Shareable card</SectionLabel>
          <AnnouncementCard title={generated.title} text={generated.text} />
        </>
      )}
    </div>
  )
}

function FieldRow({ label, value, onChange, placeholder }) {
  return (
    <div>
      <div style={{ fontFamily: 'Barlow Condensed', fontSize: '0.65rem', color: '#555', letterSpacing: '0.2em', marginBottom: '4px' }}>{label.toUpperCase()}</div>
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        style={{ width: '100%', padding: '0.55rem 0.7rem', background: '#111', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '3px', color: '#ccc', fontFamily: 'Barlow Condensed', fontSize: '0.85rem', outline: 'none' }} />
    </div>
  )
}

const selStyle = { width: '100%', padding: '0.55rem', background: '#111', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '3px', color: '#ccc', fontFamily: 'Barlow Condensed', fontSize: '0.85rem', outline: 'none' }

function AnnouncementCard({ title, text }) {
  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>*{margin:0;padding:0;box-sizing:border-box}body{background:#0d0d0d;width:600px;padding:40px;font-family:Georgia,serif}.card{background:#111;border:2px solid #c8192a;border-radius:8px;overflow:hidden}.header{background:#c8192a;padding:16px 24px}.header-title{font-family:Impact,sans-serif;font-size:28px;color:#fff;letter-spacing:0.08em;text-transform:uppercase}.logo{font-family:Impact,sans-serif;font-size:14px;color:rgba(255,255,255,0.6);letter-spacing:0.3em;margin-top:2px}.body{padding:24px}.text{font-size:15px;color:#ddd;white-space:pre-wrap;line-height:1.7}.footer{padding:12px 24px;border-top:1px solid rgba(255,255,255,0.08);font-size:11px;color:#444;letter-spacing:0.15em}</style></head><body><div class="card"><div class="header"><div class="header-title">${title}</div><div class="logo">WWE BACKSTAGE</div></div><div class="body"><div class="text">${text.replace(/</g, '&lt;')}</div></div><div class="footer">WWE BACKSTAGE · UNIVERSE MODE</div></div></body></html>`
  const blob = new Blob([html], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  return (
    <div style={{ background: '#111', border: '1px solid rgba(200,25,42,0.3)', borderRadius: '6px', overflow: 'hidden', marginBottom: '1rem' }}>
      <div style={{ background: '#c8192a', padding: '10px 14px' }}>
        <div style={{ fontFamily: 'Bebas Neue', fontSize: '1.2rem', color: '#fff', letterSpacing: '0.08em' }}>{title}</div>
        <div style={{ fontFamily: 'Barlow Condensed', fontSize: '0.65rem', color: 'rgba(255,255,255,0.6)', letterSpacing: '0.2em' }}>WWE BACKSTAGE</div>
      </div>
      <div style={{ padding: '14px' }}>
        <pre style={{ fontFamily: 'Barlow', fontSize: '0.85rem', color: '#bbb', whiteSpace: 'pre-wrap', lineHeight: 1.6, margin: 0 }}>{text}</pre>
      </div>
      <div style={{ padding: '8px 14px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <a href={url} download="announcement.html" style={{ fontFamily: 'Barlow Condensed', fontSize: '0.75rem', color: '#c8192a', letterSpacing: '0.15em', textDecoration: 'none' }}>Download HTML card →</a>
      </div>
    </div>
  )
}
