import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

export const GMS = [
  { id: 'srikant', name: "Srikant Freakin' Hamsa", short: 'Srikant', color: '#378ADD' },
  { id: 'ashpak', name: "Ashpak \"KVD's Nightmare\"", short: 'Ashpak', color: '#1D9E75' },
  { id: 'kvd', name: 'KVD "The Best In The World"', short: 'KVD', color: '#BA7517' },
  { id: 'ekansh', name: 'Ekansh "The Beast" Tiwari', short: 'Ekansh', color: '#D85A30' },
  { id: 'debu', name: 'Debu "The Tribal Chief"', short: 'Debu', color: '#7F77DD' },
]

export const CHAMPIONSHIPS = [
  { id: 'wwe', name: 'WWE Championship', short: 'WWE', color: '#c8192a' },
  { id: 'world', name: 'World Heavyweight Championship', short: 'World HW', color: '#d4af37' },
  { id: 'ic', name: 'Intercontinental Championship', short: 'IC', color: '#c0c0c0' },
  { id: 'us', name: 'United States Championship', short: 'US', color: '#1a4fa0' },
  { id: 'tag', name: 'Tag Team Championships', short: 'Tag Team', color: '#1D9E75' },
]

export const FACTIONS = [
  { id: 'authority', name: 'The Authority', members: ['srikant', 'ashpak'], color: '#c8192a' },
]

export const INITIAL_ROSTERS = {
  srikant: [
    { name: "John Cena", ovr: 96 },
    { name: "Randy Orton", ovr: 93 },
    { name: "Shawn Michaels", ovr: 94 },
    { name: 'Seth "Freakin" Rollins', ovr: 93 },
    { name: "Gunther", ovr: 92 },
    { name: "Triple H", ovr: 91 },
    { name: "Chris Jericho", ovr: 91 },
    { name: "Finn Bálor", ovr: 90 },
    { name: "Jey Uso", ovr: 90 },
    { name: "The Miz", ovr: 90 },
    { name: "Batista", ovr: 89 },
    { name: "Trick Williams", ovr: 80 },
  ],
  ashpak: [
    { name: "Stone Cold Steve Austin", ovr: 97 },
    { name: "Cody Rhodes", ovr: 96 },
    { name: "Daniel Bryan", ovr: 94 },
    { name: "Bret Hart", ovr: 93 },
    { name: "Sting", ovr: 92 },
    { name: "Hulk Hogan", ovr: 92 },
    { name: "Dusty Rhodes", ovr: 91 },
    { name: "Rob Van Dam", ovr: 90 },
    { name: "Booker T", ovr: 89 },
    { name: "Kurt Angle", ovr: 89 },
    { name: "Shinsuke Nakamura", ovr: 87 },
    { name: "Sheamus", ovr: 86 },
    { name: "Tama Tonga", ovr: 83 },
    { name: "Braun Strowman", ovr: 81 },
    { name: "Erick Rowan", ovr: 80 },
  ],
  kvd: [
    { name: "The Rock", ovr: 96 },
    { name: "CM Punk", ovr: 93 },
    { name: "Bray Wyatt", ovr: 90 },
    { name: "Solo Sikoa", ovr: 88 },
    { name: "Bron Breakker", ovr: 87 },
    { name: "Sami Zayn", ovr: 86 },
    { name: "AJ Styles", ovr: 85 },
    { name: "Kofi Kingston '17", ovr: 85 },
    { name: "R-Truth Ron Cena", ovr: 83 },
    { name: "Carmelo Hayes", ovr: 81 },
    { name: "Ilja Dragunov", ovr: 80 },
  ],
  ekansh: [
    { name: "Brock Lesnar", ovr: 94 },
    { name: "Edge", ovr: 92 },
    { name: "Drew McIntyre", ovr: 91 },
    { name: "Goldberg", ovr: 90 },
    { name: "Logan Paul", ovr: 90 },
    { name: "Mark Henry", ovr: 90 },
    { name: "Kane", ovr: 88 },
    { name: "Kevin Owens", ovr: 87 },
    { name: "Rey Mysterio", ovr: 86 },
    { name: "Damian Priest", ovr: 86 },
    { name: "Bronson Reed", ovr: 85 },
    { name: "Dominik Mysterio", ovr: 84 },
    { name: "Oba Femi", ovr: 80 },
  ],
  debu: [
    { name: "Roman Reigns '22", ovr: 97 },
    { name: "Undertaker", ovr: 96 },
    { name: "Eddie Guerrero", ovr: 90 },
    { name: "Jeff Hardy", ovr: 90 },
    { name: "Dean Ambrose", ovr: 89 },
    { name: "Christian", ovr: 89 },
    { name: "LA Knight", ovr: 88 },
    { name: "Jacob Fatu", ovr: 87 },
    { name: "Uncle Howdy", ovr: 87 },
    { name: "Jimmy Uso", ovr: 84 },
    { name: "Penta", ovr: 84 },
    { name: "Chad Gable", ovr: 80 },
    { name: "Ethan Page", ovr: 80 },
  ],
}

export function getGM(id) { return GMS.find(g => g.id === id) }
export function getChamp(id) { return CHAMPIONSHIPS.find(c => c.id === id) }

export function timeAgo(ts) {
  const diff = Date.now() - new Date(ts).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}
