import React, { useState, useEffect, createContext, useContext } from 'react'
import { supabase, GMS, INITIAL_ROSTERS, getGM } from './lib/data.js'
import Login from './components/Login.jsx'
import Feed from './components/Feed.jsx'
import Roster from './components/Roster.jsx'
import Titles from './components/Titles.jsx'
import Storylines from './components/Storylines.jsx'
import HallOfFame from './components/HallOfFame.jsx'

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

  function handleLogin(gmId) {
    setGm(gmId)
    localStorage.setItem('wwe_backstage_gm', gmId)
  }

  function handleLogout() {
    setGm(null)
    localStorage.removeItem('wwe_backstage_gm')
  }

  if (loading) return <Splash />
  if (!state?.initialized) return <InitScreen onInit={initUniverse} />
  if (!gm) return <Login onLogin={handleLogin} />

  const pendingTrades = trades.filter(t => t.status === 'pending' && t.to_gm === gm).length
  const activeGM = getGM(gm)
  const totalFeed = state?.feed?.length || 0
  const totalMatches = matches.length
  const activeTitles = Object.values(state?.championships || {}).filter(Boolean).length
  const ctx = { gm, state, trades, matches, storylines, pushFeedEvent, fetchState, fetchTrades, fetchMatches, fetchStorylines, modal, setModal }

  return (
    <AppCtx.Provider value={ctx}>
      <div className="app-shell">
        <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(12px) scale(0.985); }
            to { opacity: 1; transform: translateY(0) scale(1); }
          }
          @keyframes liquidFloat {
            0%, 100% { transform: translate3d(0, 0, 0); }
            50% { transform: translate3d(0, -8px, 0); }
          }
          .fade-in { animation: fadeIn 0.36s cubic-bezier(.2,.8,.2,1); }
          .liquid-orb { animation: liquidFloat 8s ease-in-out infinite; }
        `}</style>

        <div style={{ maxWidth: '1180px', margin: '0 auto', display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 2rem)', gap: '1rem' }}>
          <header
            className="glass-panel"
            style={{
              borderRadius: '32px',
              padding: '1rem 1rem 1.1rem',
              position: 'sticky',
              top: 'max(0.75rem, env(safe-area-inset-top))',
              zIndex: 40,
              overflow: 'hidden',
            }}
          >
            <div className="liquid-orb" style={{ position: 'absolute', top: '-4rem', right: '-2rem', width: '12rem', height: '12rem', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.22), rgba(255,255,255,0.02) 42%, transparent 68%)', filter: 'blur(10px)' }} />
            <div className="liquid-orb" style={{ position: 'absolute', bottom: '-5rem', left: '-2rem', width: '13rem', height: '13rem', borderRadius: '50%', background: 'radial-gradient(circle, rgba(105,195,255,0.16), rgba(105,195,255,0.02) 44%, transparent 70%)', animationDelay: '-2s' }} />

            <div style={{ position: 'relative', zIndex: 1, display: 'grid', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
                <div>
                  <div className="hero-wordmark">
                    <span className="accent">WWE</span>{' '}
                    <span className="ice">BACKSTAGE</span>
                  </div>
                  <div style={{ marginTop: '0.45rem', fontSize: '0.8rem', letterSpacing: '0.24em', textTransform: 'uppercase', color: 'var(--text-dim)' }}>
                    Premium universe control room
                  </div>
                </div>

                <div className="premium-pill" style={{ alignSelf: 'center', padding: '0.45rem 0.55rem 0.45rem 0.75rem' }}>
                  <span style={{ width: 10, height: 10, borderRadius: '999px', background: activeGM?.color, boxShadow: `0 0 18px ${activeGM?.color}66` }} />
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: activeGM?.color }}>{activeGM?.short}</span>
                  <button
                    onClick={handleLogout}
                    style={{
                      border: '1px solid rgba(255,255,255,0.1)',
                      background: 'rgba(255,255,255,0.06)',
                      color: 'var(--text-muted)',
                      borderRadius: '999px',
                      padding: '0.35rem 0.75rem',
                      fontSize: '0.72rem',
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                      cursor: 'pointer',
                    }}
                  >
                    Switch
                  </button>
                </div>
              </div>

              <div className="surface-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))' }}>
                {[
                  { label: 'Live Feed', value: totalFeed, tone: 'var(--accent)' },
                  { label: 'Matches Logged', value: totalMatches, tone: 'var(--accent-2)' },
                  { label: 'Active Titles', value: activeTitles, tone: 'var(--gold)' },
                ].map(metric => (
                  <div key={metric.label} className="metric-tile">
                    <div style={{ fontSize: '0.68rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '0.45rem' }}>
                      {metric.label}
                    </div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 800, color: metric.tone, lineHeight: 1 }}>{metric.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </header>

          <main
            className="glass-panel"
            style={{
              flex: 1,
              borderRadius: '34px',
              padding: '1rem',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              minHeight: 0,
            }}
          >
            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                paddingRight: '0.1rem',
                paddingBottom: '6rem',
              }}
            >
              <div className="fade-in" key={tab}>
                {tab === 'feed' && <Feed />}
                {tab === 'roster' && <Roster />}
                {tab === 'titles' && <Titles />}
                {tab === 'storylines' && <Storylines />}
                {tab === 'hof' && <HallOfFame />}
              </div>
            </div>
          </main>

          <nav
            className="glass-panel"
            style={{
              position: 'fixed',
              left: '50%',
              bottom: `calc(0.9rem + env(safe-area-inset-bottom))`,
              transform: 'translateX(-50%)',
              width: 'min(92vw, 760px)',
              borderRadius: '999px',
              padding: '0.45rem',
              display: 'grid',
              gridTemplateColumns: `repeat(${TABS.length}, 1fr)`,
              gap: '0.35rem',
              zIndex: 60,
            }}
          >
            {TABS.map(t => {
              const active = tab === t.id
              const badge = t.id === 'storylines' ? pendingTrades : 0
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  style={{
                    position: 'relative',
                    border: 'none',
                    cursor: 'pointer',
                    borderRadius: '999px',
                    padding: '0.72rem 0.35rem',
                    background: active ? 'linear-gradient(180deg, rgba(255,255,255,0.18), rgba(255,255,255,0.08))' : 'transparent',
                    color: active ? 'var(--text)' : 'var(--text-dim)',
                    boxShadow: active ? 'inset 0 1px 0 rgba(255,255,255,0.18), 0 10px 24px rgba(0,0,0,0.22)' : 'none',
                    transition: 'all 180ms ease',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.16rem',
                  }}
                >
                  <span style={{ fontSize: '1rem', filter: active ? 'drop-shadow(0 6px 16px rgba(255,255,255,0.16))' : 'none' }}>{t.icon}</span>
                  <span style={{ fontSize: '0.62rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: active ? 'var(--accent)' : 'inherit' }}>
                    {t.label}
                  </span>
                  {badge > 0 && (
                    <span
                      style={{
                        position: 'absolute',
                        top: '0.35rem',
                        right: '0.75rem',
                        minWidth: '1rem',
                        height: '1rem',
                        padding: '0 0.24rem',
                        borderRadius: '999px',
                        background: 'var(--accent)',
                        color: '#fff',
                        fontSize: '0.62rem',
                        fontWeight: 700,
                        display: 'grid',
                        placeItems: 'center',
                        boxShadow: '0 0 18px rgba(255,54,95,0.45)',
                      }}
                    >
                      {badge}
                    </span>
                  )}
                </button>
              )
            })}
          </nav>
        </div>
      </div>
    </AppCtx.Provider>
  )
}

function Splash() {
  return (
    <div className="app-shell" style={{ display: 'grid', placeItems: 'center' }}>
      <div className="glass-panel" style={{ borderRadius: '34px', padding: '2.5rem', width: 'min(92vw, 540px)', textAlign: 'center' }}>
        <div className="hero-wordmark">
          <span className="accent">WWE</span>{' '}
          <span className="ice">BACKSTAGE</span>
        </div>
        <div style={{ marginTop: '0.8rem', fontSize: '0.8rem', letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--text-dim)' }}>
          Connecting to the arena
        </div>
      </div>
    </div>
  )
}

function InitScreen({ onInit }) {
  return (
    <div className="app-shell" style={{ display: 'grid', placeItems: 'center' }}>
      <div className="glass-panel" style={{ borderRadius: '36px', padding: '2rem', width: 'min(92vw, 620px)', overflow: 'hidden', position: 'relative' }}>
        <div style={{ position: 'absolute', inset: 'auto -2rem -5rem auto', width: '14rem', height: '14rem', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,54,95,0.22), transparent 62%)' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div className="hero-wordmark">
            <span className="accent">WWE</span>{' '}
            <span className="ice">BACKSTAGE</span>
          </div>
          <div style={{ marginTop: '0.6rem', color: 'var(--text-muted)', lineHeight: 1.75, maxWidth: '32rem' }}>
            Initialize the universe to load every roster, unlock the live feed, and bring the control room online.
          </div>
          <button
            onClick={onInit}
            style={{
              marginTop: '1.4rem',
              border: '1px solid rgba(255,255,255,0.16)',
              borderRadius: '999px',
              padding: '0.95rem 1.4rem',
              background: 'linear-gradient(135deg, rgba(255,54,95,0.95), rgba(255,106,122,0.82))',
              color: '#fff',
              fontWeight: 800,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              boxShadow: '0 18px 40px rgba(255,54,95,0.28)',
            }}
          >
            Initialize Universe
          </button>
        </div>
      </div>
    </div>
  )
}
