import React, { useState, useEffect, createContext, useContext } from 'react'
import { supabase, GMS, INITIAL_ROSTERS, getGM } from './lib/data.js'
import Login from './components/Login.jsx'
import Feed from './components/Feed.jsx'
import Roster from './components/Roster.jsx'
import Titles from './components/Titles.jsx'
import Storylines from './components/Storylines.jsx'
import HallOfFame from './components/HallOfFame.jsx'
import FactionManager from './components/FactionManager.jsx'

export const AppCtx = createContext(null)
export function useApp() { return useContext(AppCtx) }

const TABS = [
  { id: 'feed', label: 'Feed', icon: '⚡' },
  { id: 'roster', label: 'Roster', icon: '👥' },
  { id: 'titles', label: 'Titles', icon: '🏆' },
  { id: 'storylines', label: 'Feuds', icon: '🔥' },
  { id: 'hof', label: 'HoF', icon: '⭐' },
]

export default function App() {
  const [gm, setGm] = useState(null)
  const [state, setState] = useState(null)
  const [trades, setTrades] = useState([])
  const [matches, setMatches] = useState([])
  const [storylines, setStorylines] = useState([])
  const [tab, setTab] = useState('feed')
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)

  useEffect(() => {
    const saved = localStorage.getItem('wwe_backstage_gm')
    if (saved && GMS.find(g => g.id === saved)) setGm(saved)
  }, [])

  useEffect(() => {
    fetchAll()
    const subs = [
      supabase.channel('bs2_state').on('postgres_changes', { event: '*', schema: 'public', table: 'bs2_state' }, fetchState).subscribe(),
      supabase.channel('bs2_trades').on('postgres_changes', { event: '*', schema: 'public', table: 'bs2_trades' }, fetchTrades).subscribe(),
      supabase.channel('bs2_matches').on('postgres_changes', { event: '*', schema: 'public', table: 'bs2_matches' }, fetchMatches).subscribe(),
      supabase.channel('bs2_storylines').on('postgres_changes', { event: '*', schema: 'public', table: 'bs2_storylines' }, fetchStorylines).subscribe(),
    ]
    return () => subs.forEach(s => supabase.removeChannel(s))
  }, [])

  async function fetchAll() {
    await Promise.all([fetchState(), fetchTrades(), fetchMatches(), fetchStorylines()])
    setLoading(false)
  }

  async function fetchState() {
    const { data } = await supabase.from('bs2_state').select('*').eq('id', 1).single()
    if (data) setState(data)
  }
  async function fetchTrades() {
    const { data } = await supabase.from('bs2_trades').select('*').order('created_at', { ascending: false })
    if (data) setTrades(data)
  }
  async function fetchMatches() {
    const { data } = await supabase.from('bs2_matches').select('*').order('played_at', { ascending: false })
    if (data) setMatches(data)
  }
  async function fetchStorylines() {
    const { data } = await supabase.from('bs2_storylines').select('*').order('created_at', { ascending: false })
    if (data) setStorylines(data)
  }

  async function pushFeedEvent(entry) {
    if (!state) return
    const feed = [{ ...entry, id: `${Date.now()}-${Math.random()}`, ts: new Date().toISOString() }, ...(state.feed || [])].slice(0, 100)
    await supabase.from('bs2_state').update({ feed }).eq('id', 1)
  }

  async function initUniverse() {
    const rosters = {}
    Object.entries(INITIAL_ROSTERS).forEach(([gmId, names]) => {
      rosters[gmId] = names.map(name => ({ name, wins: 0, losses: 0 }))
    })
    await supabase.from('bs2_state').upsert({
      id: 1, rosters, championships: {}, factions: [], feed: [], initialized: true,
    })
    fetchState()
  }

  function handleLogin(gmId) { setGm(gmId); localStorage.setItem('wwe_backstage_gm', gmId) }
  function handleLogout() { setGm(null); localStorage.removeItem('wwe_backstage_gm') }

  if (loading) return <Splash />
  if (!state?.initialized) return <InitScreen onInit={initUniverse} />
  if (!gm) return <Login onLogin={handleLogin} />

  const pendingTrades = trades.filter(t => t.status === 'pending' && t.to_gm === gm).length
  const ctx = { gm, state, trades, matches, storylines, pushFeedEvent, fetchState, fetchTrades, fetchMatches, fetchStorylines, modal, setModal }

  return (
    <AppCtx.Provider value={ctx}>
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#0a0a0a' }}>
        <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
          @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
          @keyframes slideUp { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
          .fade-in { animation: fadeIn 0.3s ease; }
        `}</style>

        {/* header */}
        <div style={{ background: '#0d0d0d', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '0.7rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div style={{ fontSize: '18px', fontWeight: 800, letterSpacing: '0.05em' }}>
            <span style={{ color: '#c8192a' }}>WWE</span>
            <span style={{ color: '#fff' }}> BACKSTAGE</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: getGM(gm)?.color }} />
            <span style={{ fontSize: '12px', fontWeight: 600, color: getGM(gm)?.color }}>{getGM(gm)?.short}</span>
            <button onClick={handleLogout} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', padding: '3px 8px', fontSize: '10px', color: '#666', cursor: 'pointer', fontFamily: 'Syne, sans-serif', letterSpacing: '0.05em' }}>SWITCH</button>
          </div>
        </div>

        {/* content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0.75rem', maxWidth: '640px', width: '100%', margin: '0 auto' }}>
          <div className="fade-in" key={tab}>
            {tab === 'feed' && <Feed />}
            {tab === 'roster' && <Roster />}
            {tab === 'titles' && <Titles />}
            {tab === 'storylines' && <Storylines />}
            {tab === 'hof' && <HallOfFame />}
          </div>
        </div>

        {/* bottom nav */}
        <div style={{ background: '#0d0d0d', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexShrink: 0, paddingBottom: 'env(safe-area-inset-bottom)' }}>
          {TABS.map(t => {
            const active = tab === t.id
            const badge = t.id === 'feuds' ? pendingTrades : 0
            return (
              <button key={t.id} onClick={() => setTab(t.id)}
                style={{ flex: 1, padding: '0.6rem 0', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', position: 'relative', transition: 'opacity 0.15s', opacity: active ? 1 : 0.45 }}>
                <span style={{ fontSize: '18px', lineHeight: 1 }}>{t.icon}</span>
                <span style={{ fontSize: '9px', fontWeight: 600, letterSpacing: '0.1em', color: active ? '#c8192a' : '#777', textTransform: 'uppercase' }}>{t.label}</span>
                {active && <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '20px', height: '2px', background: '#c8192a', borderRadius: '0 0 2px 2px' }} />}
                {badge > 0 && <div style={{ position: 'absolute', top: '4px', right: '20%', width: '8px', height: '8px', borderRadius: '50%', background: '#c8192a' }} />}
              </button>
            )
          })}
        </div>
      </div>
    </AppCtx.Provider>
  )
}

function Splash() {
  return (
    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0a' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '28px', fontWeight: 800, letterSpacing: '0.05em' }}><span style={{ color: '#c8192a' }}>WWE</span> BACKSTAGE</div>
        <div style={{ fontSize: '11px', color: '#333', letterSpacing: '0.3em', marginTop: '8px' }}>CONNECTING...</div>
      </div>
    </div>
  )
}

function InitScreen({ onInit }) {
  return (
    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0a', padding: '2rem' }}>
      <div style={{ textAlign: 'center', maxWidth: '340px' }}>
        <div style={{ fontSize: '28px', fontWeight: 800, letterSpacing: '0.05em', marginBottom: '8px' }}><span style={{ color: '#c8192a' }}>WWE</span> BACKSTAGE</div>
        <div style={{ fontSize: '13px', color: '#555', lineHeight: 1.7, marginBottom: '2rem' }}>Welcome to the universe. Initialize to load all rosters and start the show.</div>
        <button onClick={onInit} style={{ padding: '0.85rem 2rem', background: '#c8192a', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 700, letterSpacing: '0.1em', color: '#fff', cursor: 'pointer', fontFamily: 'Syne, sans-serif' }}>INITIALIZE UNIVERSE</button>
      </div>
    </div>
  )
}
