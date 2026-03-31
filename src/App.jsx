import React, { useState, useEffect } from 'react'
import { supabase, GMS, INITIAL_ROSTERS, FACTIONS, getGM } from './lib/data.js'
import Login from './components/Login.jsx'
import Dashboard from './components/Dashboard.jsx'
import Roster from './components/Roster.jsx'
import Championships from './components/Championships.jsx'
import Matches from './components/Matches.jsx'
import Trades from './components/Trades.jsx'
import Factions from './components/Factions.jsx'
import Announcements from './components/Announcements.jsx'

const NAV = [
  { id: 'dashboard', label: 'Feed' },
  { id: 'roster', label: 'Roster' },
  { id: 'trades', label: 'Trades' },
  { id: 'matches', label: 'Matches' },
  { id: 'titles', label: 'Titles' },
  { id: 'factions', label: 'Factions' },
  { id: 'announcements', label: 'Announce' },
]

const S = {
  app: { minHeight: '100vh', background: '#0d0d0d', display: 'flex', flexDirection: 'column' },
  header: { background: '#111', borderBottom: '2px solid #c8192a', padding: '0.6rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50 },
  logo: { fontFamily: 'Bebas Neue', fontSize: '1.4rem', color: '#fff', letterSpacing: '0.08em' },
  logoRed: { color: '#c8192a' },
  gmBadge: { fontFamily: 'Barlow Condensed', fontSize: '0.75rem', letterSpacing: '0.15em', color: '#888', display: 'flex', alignItems: 'center', gap: '6px' },
  nav: { background: '#0d0d0d', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', overflowX: 'auto', padding: '0 0.5rem' },
  navBtn: { fontFamily: 'Barlow Condensed', fontSize: '0.8rem', letterSpacing: '0.15em', padding: '0.7rem 0.9rem', background: 'none', border: 'none', color: '#555', cursor: 'pointer', whiteSpace: 'nowrap', borderBottom: '2px solid transparent', transition: 'all 0.15s', textTransform: 'uppercase' },
  navBtnActive: { color: '#fff', borderBottom: '2px solid #c8192a' },
  content: { flex: 1, padding: '1rem', maxWidth: '700px', margin: '0 auto', width: '100%' },
}

export default function App() {
  const [gm, setGm] = useState(null)
  const [state, setState] = useState(null)
  const [trades, setTrades] = useState([])
  const [matches, setMatches] = useState([])
  const [tab, setTab] = useState('dashboard')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const saved = localStorage.getItem('wwe_backstage_gm')
    if (saved && GMS.find(g => g.id === saved)) setGm(saved)
  }, [])

  useEffect(() => {
    fetchAll()
    const ch1 = supabase.channel('bs_state')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'backstage_state' }, fetchState)
      .subscribe()
    const ch2 = supabase.channel('bs_trades')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'backstage_trades' }, fetchTrades)
      .subscribe()
    const ch3 = supabase.channel('bs_matches')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'backstage_matches' }, fetchMatches)
      .subscribe()
    return () => { supabase.removeChannel(ch1); supabase.removeChannel(ch2); supabase.removeChannel(ch3) }
  }, [])

  async function fetchAll() {
    await Promise.all([fetchState(), fetchTrades(), fetchMatches()])
    setLoading(false)
  }

  async function fetchState() {
    const { data } = await supabase.from('backstage_state').select('*').eq('id', 1).single()
    if (data) setState(data)
  }

  async function fetchTrades() {
    const { data } = await supabase.from('backstage_trades').select('*').order('created_at', { ascending: false })
    if (data) setTrades(data)
  }

  async function fetchMatches() {
    const { data } = await supabase.from('backstage_matches').select('*').order('played_at', { ascending: false })
    if (data) setMatches(data)
  }

  async function initializeState() {
    const rosters = {}
    Object.entries(INITIAL_ROSTERS).forEach(([gmId, stars]) => {
      rosters[gmId] = stars.map(s => ({ ...s, wins: 0, losses: 0, on_loan: false, loan_to: null, loan_matches: 0 }))
    })
    await supabase.from('backstage_state').upsert({
      id: 1, rosters, championships: {}, factions: FACTIONS,
      contract_signings: [], activity_feed: [], initialized: true,
    })
    fetchState()
  }

  function handleLogin(gmId) {
    setGm(gmId)
    localStorage.setItem('wwe_backstage_gm', gmId)
  }

  function handleLogout() {
    setGm(null)
    localStorage.removeItem('wwe_backstage_gm')
  }

  async function addActivity(entry) {
    if (!state) return
    const feed = [{ ...entry, id: Date.now(), ts: new Date().toISOString() }, ...(state.activity_feed || [])].slice(0, 50)
    await supabase.from('backstage_state').update({ activity_feed: feed }).eq('id', 1)
  }

  if (loading) return <Splash />
  if (!state?.initialized) return <InitScreen onInit={initializeState} />
  if (!gm) return <Login onLogin={handleLogin} />

  const pendingTrades = trades.filter(t => t.status === 'pending' && t.to_gm === gm).length

  const props = { gm, state, trades, matches, addActivity, fetchState, fetchTrades, fetchMatches }

  return (
    <div style={S.app}>
      <header style={S.header}>
        <div style={S.logo}><span style={S.logoRed}>WWE</span> BACKSTAGE</div>
        <div style={S.gmBadge}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: getGM(gm)?.color }} />
          {getGM(gm)?.short}
          <button onClick={handleLogout} style={{ background: 'none', border: 'none', color: '#444', cursor: 'pointer', fontSize: '0.7rem', letterSpacing: '0.1em', fontFamily: 'Barlow Condensed', marginLeft: 4 }}>SWITCH</button>
        </div>
      </header>

      <nav style={S.nav}>
        {NAV.map(n => (
          <button key={n.id} style={{ ...S.navBtn, ...(tab === n.id ? S.navBtnActive : {}) }} onClick={() => setTab(n.id)}>
            {n.label}{n.id === 'trades' && pendingTrades > 0 ? ` (${pendingTrades})` : ''}
          </button>
        ))}
      </nav>

      <div style={S.content}>
        {tab === 'dashboard' && <Dashboard {...props} />}
        {tab === 'roster' && <Roster {...props} />}
        {tab === 'trades' && <Trades {...props} />}
        {tab === 'matches' && <Matches {...props} />}
        {tab === 'titles' && <Championships {...props} />}
        {tab === 'factions' && <Factions {...props} />}
        {tab === 'announcements' && <Announcements {...props} />}
      </div>
    </div>
  )
}

function Splash() {
  return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0d0d0d' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontFamily: 'Bebas Neue', fontSize: '2.5rem', letterSpacing: '0.1em' }}><span style={{ color: '#c8192a' }}>WWE</span> BACKSTAGE</div>
        <div style={{ fontFamily: 'Barlow Condensed', fontSize: '0.75rem', color: '#333', letterSpacing: '0.3em', marginTop: '0.5rem' }}>CONNECTING...</div>
      </div>
    </div>
  )
}

function InitScreen({ onInit }) {
  return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0d0d0d', padding: '2rem' }}>
      <div style={{ textAlign: 'center', maxWidth: '360px' }}>
        <div style={{ fontFamily: 'Bebas Neue', fontSize: '2.5rem', letterSpacing: '0.1em', marginBottom: '0.25rem' }}><span style={{ color: '#c8192a' }}>WWE</span> BACKSTAGE</div>
        <div style={{ fontFamily: 'Barlow Condensed', fontSize: '0.85rem', color: '#555', letterSpacing: '0.15em', marginBottom: '2rem', lineHeight: 1.6 }}>First time setup — this will load all rosters and initialize the universe.</div>
        <button onClick={onInit} style={{ padding: '0.9rem 2.5rem', background: '#c8192a', border: 'none', borderRadius: '2px', fontFamily: 'Bebas Neue', fontSize: '1.1rem', letterSpacing: '0.15em', color: '#fff', cursor: 'pointer' }}>Initialize Universe</button>
      </div>
    </div>
  )
}
