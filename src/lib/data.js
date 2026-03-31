import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

export const GMS = [
  { id: 'srikant', name: "Srikant Freakin' Hamsa", short: 'Srikant', color: '#4a9eff', alignment: 'heel' },
  { id: 'ashpak', name: "Ashpak \"KVD's Nightmare\"", short: 'Ashpak', color: '#2ecc8a', alignment: 'heel' },
  { id: 'kvd', name: 'KVD "The Best In The World"', short: 'KVD', color: '#f0a500', alignment: 'face' },
  { id: 'ekansh', name: 'Ekansh "The Beast" Tiwari', short: 'Ekansh', color: '#e8533a', alignment: 'face' },
  { id: 'debu', name: 'Debu "The Tribal Chief"', short: 'Debu', color: '#a78bfa', alignment: 'face' },
]

export const CHAMPIONSHIPS = [
  { id: 'wwe', name: 'WWE Championship', short: 'WWE', color: '#c8192a', isTag: false },
  { id: 'world', name: 'World Heavyweight Championship', short: 'World HW', color: '#d4af37', isTag: false },
  { id: 'ic', name: 'Intercontinental Championship', short: 'IC', color: '#b0b0b0', isTag: false },
  { id: 'us', name: 'United States Championship', short: 'US', color: '#3b6fd4', isTag: false },
  { id: 'tag', name: 'Tag Team Championships', short: 'Tag', color: '#2ecc8a', isTag: true },
]

export const SUPERSTAR_DATA = {
  "John Cena": { finisher: "Attitude Adjustment", signature: "STF", style: "Powerhouse", era: "2000s–2010s" },
  "Randy Orton": { finisher: "RKO", signature: "Punt Kick", style: "Viper / Technical", era: "2000s–2020s" },
  "Shawn Michaels": { finisher: "Sweet Chin Music", signature: "Elbow Drop", style: "Showstopper", era: "1990s–2000s" },
  "Seth \"Freakin\" Rollins": { finisher: "Curb Stomp", signature: "Frog Splash", style: "Architect / Visionary", era: "2010s–2020s" },
  "Gunther": { finisher: "Powerbomb", signature: "Sleeper Hold", style: "Ring General", era: "2020s" },
  "Triple H": { finisher: "Pedigree", signature: "Spinebuster", style: "Cerebral Assassin", era: "1990s–2010s" },
  "Chris Jericho": { finisher: "Walls of Jericho", signature: "Lionsault", style: "The Painmaker", era: "1990s–2020s" },
  "Finn Bálor": { finisher: "Coup de Grâce", signature: "Sling Blade", style: "Prince / Demon", era: "2010s–2020s" },
  "Jey Uso": { finisher: "Uso Splash", signature: "Superkick", style: "Main Event Yeet", era: "2010s–2020s" },
  "The Miz": { finisher: "Skull Crushing Finale", signature: "Reality Check", style: "A-Lister", era: "2000s–2020s" },
  "Batista": { finisher: "Batista Bomb", signature: "Spear", style: "Animal", era: "2000s–2010s" },
  "Trick Williams": { finisher: "Trick Shot", signature: "Harlem Leg Sweep", style: "Trick Daddy", era: "2020s" },
  "Stone Cold Steve Austin": { finisher: "Stone Cold Stunner", signature: "Lou Thesz Press", style: "Texas Rattlesnake", era: "1990s–2000s" },
  "Cody Rhodes": { finisher: "Cross Rhodes", signature: "Disaster Kick", style: "American Nightmare", era: "2010s–2020s" },
  "Daniel Bryan": { finisher: "Running Knee / Yes Lock", signature: "Busaiku Knee", style: "Yes Movement", era: "2000s–2010s" },
  "Bret Hart": { finisher: "Sharpshooter", signature: "Russian Leg Sweep", style: "Excellence of Execution", era: "1980s–1990s" },
  "Sting": { finisher: "Scorpion Death Drop", signature: "Stinger Splash", style: "Icon", era: "1990s–2000s" },
  "Hulk Hogan": { finisher: "Leg Drop", signature: "Big Boot", style: "Immortal", era: "1980s–1990s" },
  "Dusty Rhodes": { finisher: "Bionic Elbow", signature: "Flip Flop and Fly", style: "American Dream", era: "1970s–1980s" },
  "Rob Van Dam": { finisher: "Five Star Frog Splash", signature: "Rolling Thunder", style: "Whole F'n Show", era: "1990s–2000s" },
  "Booker T": { finisher: "Scissors Kick", signature: "Book End", style: "King Booker", era: "1990s–2000s" },
  "Kurt Angle": { finisher: "Angle Slam / Ankle Lock", signature: "German Suplex", style: "Olympic Hero", era: "1990s–2000s" },
  "Shinsuke Nakamura": { finisher: "Kinshasa", signature: "Reverse Exploder", style: "King of Strong Style", era: "2010s–2020s" },
  "Sheamus": { finisher: "Brogue Kick", signature: "White Noise", style: "Celtic Warrior", era: "2000s–2020s" },
  "Tama Tonga": { finisher: "Gun Stun", signature: "Stinger Splash", style: "Silverback", era: "2010s–2020s" },
  "Braun Strowman": { finisher: "Running Powerslam", signature: "Chokeslam", style: "Monster Among Men", era: "2010s–2020s" },
  "Erick Rowan": { finisher: "Iron Claw Slam", signature: "Big Boot", style: "Creepy", era: "2010s" },
  "The Rock": { finisher: "People's Elbow / Rock Bottom", signature: "Spinebuster", style: "Most Electrifying Man", era: "1990s–2000s" },
  "CM Punk": { finisher: "GTS", signature: "Anaconda Vice", style: "Best In The World", era: "2000s–2020s" },
  "Bray Wyatt": { finisher: "Sister Abigail", signature: "Uranage", style: "Eater of Worlds", era: "2010s–2020s" },
  "Solo Sikoa": { finisher: "Spike", signature: "Samoan Splash", style: "Enforcer", era: "2020s" },
  "Bron Breakker": { finisher: "Steiner Screwdriver", signature: "Spear", style: "Freak", era: "2020s" },
  "Sami Zayn": { finisher: "Helluva Kick", signature: "Blue Thunder Bomb", style: "Honorary Uce", era: "2010s–2020s" },
  "AJ Styles": { finisher: "Phenomenal Forearm / Styles Clash", signature: "Phenomenal Blitz", style: "Phenomenal One", era: "2010s–2020s" },
  "Brock Lesnar": { finisher: "F5", signature: "German Suplex", style: "Beast Incarnate", era: "2000s–2020s" },
  "Edge": { finisher: "Spear", signature: "Edgecution", style: "Rated R Superstar", era: "1990s–2010s" },
  "Drew McIntyre": { finisher: "Claymore Kick", signature: "Future Shock DDT", style: "Scottish Warrior", era: "2010s–2020s" },
  "Goldberg": { finisher: "Jackhammer", signature: "Spear", style: "Streak", era: "1990s–2000s" },
  "Logan Paul": { finisher: "Buckshot Lariat", signature: "Frog Splash", style: "Maverick", era: "2020s" },
  "Mark Henry": { finisher: "World's Strongest Slam", signature: "Bear Hug", style: "World's Strongest Man", era: "1990s–2010s" },
  "Kane": { finisher: "Chokeslam / Tombstone", signature: "Flying Clothesline", style: "Big Red Monster", era: "1990s–2010s" },
  "Kevin Owens": { finisher: "Stunner / Pop-up Powerbomb", signature: "Cannonball", style: "Prize Fighter", era: "2010s–2020s" },
  "Rey Mysterio": { finisher: "619", signature: "Hurricanrana", style: "Master of 619", era: "1990s–2020s" },
  "Damian Priest": { finisher: "South of Heaven", signature: "Reckoning", style: "Archer of Infamy", era: "2020s" },
  "Bronson Reed": { finisher: "Tsunami", signature: "Chokeslam", style: "Colossal", era: "2020s" },
  "Dominik Mysterio": { finisher: "Frog Splash", signature: "Three Amigos", style: "Dirty Dom", era: "2020s" },
  "Oba Femi": { finisher: "Fall From Grace", signature: "Powerbomb", style: "Unstoppable", era: "2020s" },
  "Roman Reigns '22": { finisher: "Spear", signature: "Superman Punch", style: "Tribal Chief", era: "2020s" },
  "Undertaker": { finisher: "Tombstone / Last Ride", signature: "Chokeslam", style: "Deadman / Phenom", era: "1990s–2010s" },
  "Eddie Guerrero": { finisher: "Frog Splash", signature: "Three Amigos", style: "Latino Heat", era: "1990s–2000s" },
  "Jeff Hardy": { finisher: "Swanton Bomb", signature: "Twist of Fate", style: "Charismatic Enigma", era: "1990s–2010s" },
  "Dean Ambrose": { finisher: "Dirty Deeds", signature: "Rebound Lariat", style: "Lunatic Fringe", era: "2010s" },
  "Christian": { finisher: "Killswitch", signature: "Spear", style: "Captain Charisma", era: "1990s–2010s" },
  "LA Knight": { finisher: "BFT", signature: "Blunt Force Trauma", style: "Yeah!", era: "2020s" },
  "Jacob Fatu": { finisher: "Moonsault", signature: "Samoan Drop", style: "Samoan Werewolf", era: "2020s" },
  "Uncle Howdy": { finisher: "Sister Abigail", signature: "Uranage", style: "Wyatt Remnant", era: "2020s" },
  "Jimmy Uso": { finisher: "Uso Splash", signature: "Superkick", style: "Usos Day", era: "2010s–2020s" },
  "Penta": { finisher: "Pentagon Driver", signature: "Fear Factor", style: "Cero Miedo", era: "2020s" },
  "Chad Gable": { finisher: "Chaos Theory", signature: "Ankle Lock", style: "Shoosh", era: "2010s–2020s" },
  "Ethan Page": { finisher: "Ego's Edge", signature: "Package Piledriver", style: "All Ego", era: "2020s" },
  "Kofi Kingston '17": { finisher: "Trouble in Paradise", signature: "SOS", style: "High Flyer", era: "2000s–2020s" },
  "R-Truth Ron Cena": { finisher: "Attitude Adjustment", signature: "Five Knuckle Shuffle", style: "Comedy Legend", era: "2010s–2020s" },
  "Carmelo Hayes": { finisher: "Nothing But Net", signature: "Springboard Cutter", style: "Him", era: "2020s" },
  "Ilja Dragunov": { finisher: "Torpedo Moscow", signature: "H-Bomb", style: "Mad Dragon", era: "2020s" },
}

export const INITIAL_ROSTERS = {
  srikant: ["John Cena","Randy Orton","Shawn Michaels","Seth \"Freakin\" Rollins","Gunther","Triple H","Chris Jericho","Finn Bálor","Jey Uso","The Miz","Batista","Trick Williams"],
  ashpak: ["Stone Cold Steve Austin","Cody Rhodes","Daniel Bryan","Bret Hart","Sting","Hulk Hogan","Dusty Rhodes","Rob Van Dam","Booker T","Kurt Angle","Shinsuke Nakamura","Sheamus","Tama Tonga","Braun Strowman","Erick Rowan"],
  kvd: ["The Rock","CM Punk","Bray Wyatt","Solo Sikoa","Bron Breakker","Sami Zayn","AJ Styles","Kofi Kingston '17","R-Truth Ron Cena","Carmelo Hayes","Ilja Dragunov"],
  ekansh: ["Brock Lesnar","Edge","Drew McIntyre","Goldberg","Logan Paul","Mark Henry","Kane","Kevin Owens","Rey Mysterio","Damian Priest","Bronson Reed","Dominik Mysterio","Oba Femi"],
  debu: ["Roman Reigns '22","Undertaker","Eddie Guerrero","Jeff Hardy","Dean Ambrose","Christian","LA Knight","Jacob Fatu","Uncle Howdy","Jimmy Uso","Penta","Chad Gable","Ethan Page"],
}

export const MATCH_TYPES = ['Singles','No DQ','Last Man Standing','Steel Cage','Hell in a Cell','Ladder','TLC','Iron Man','Submission Only','Extreme Rules']

export function getGM(id) { return GMS.find(g => g.id === id) }
export function getChamp(id) { return CHAMPIONSHIPS.find(c => c.id === id) }
export function getStarData(name) { return SUPERSTAR_DATA[name] || { finisher: 'Unknown', signature: 'Unknown', style: 'Unknown', era: 'Unknown' } }

export function timeAgo(ts) {
  const diff = Date.now() - new Date(ts).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

export function ordinal(n) {
  const s = ['th','st','nd','rd']
  const v = n % 100
  return n + (s[(v-20)%10] || s[v] || s[0])
}
