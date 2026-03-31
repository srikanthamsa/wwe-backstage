const GEMINI_KEY = import.meta.env.VITE_GEMINI_KEY

export async function generatePromo({ speaker, target, context, type = 'promo', champTitle, alignment }) {
  if (!GEMINI_KEY) return fallbackPromo(speaker, target, type)

  const systemCtx = `You are a WWE scriptwriter generating in-character promos for a friend group's WWE Universe Mode. Keep it under 120 words. Be dramatic, use wrestling terminology, make it personal and spicy. No asterisks or stage directions. Just the promo text.`

  const prompt = buildPrompt({ speaker, target, context, type, champTitle, alignment })

  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `${systemCtx}\n\n${prompt}` }] }],
        generationConfig: { temperature: 0.9, maxOutputTokens: 200 }
      })
    })
    const data = await res.json()
    return data?.candidates?.[0]?.content?.parts?.[0]?.text || fallbackPromo(speaker, target, type)
  } catch {
    return fallbackPromo(speaker, target, type)
  }
}

function buildPrompt({ speaker, target, context, type, champTitle, alignment }) {
  const heel = alignment === 'heel'
  if (type === 'callout') return `${speaker} (${heel ? 'heel' : 'face'}) is cutting a callout promo challenging ${target || 'anyone in the locker room'}${champTitle ? ` for the ${champTitle}` : ''}. Context: ${context || 'general rivalry'}. Make it intense.`
  if (type === 'accept') return `${speaker} is accepting ${target}'s challenge. They're fired up and ready. Short, direct, confident. Context: ${context || ''}`
  if (type === 'reject') return `${speaker} is rejecting ${target}'s challenge in the most disrespectful way possible. They're dismissive and arrogant.`
  if (type === 'title_win') return `${speaker} just won the ${champTitle}. Short victory promo. ${heel ? 'Heel celebration — arrogant, dismissive of the crowd.' : 'Face celebration — emotional, grateful, fired up.'}`
  if (type === 'title_vacated') return `${speaker} is cutting a promo about the ${champTitle} being vacated. ${context || 'Setting up for a new champion'}.`
  if (type === 'respond') return `${speaker} is responding to ${target}'s recent promo. ${context || 'Fire back hard.'}. Keep it spicy.`
  if (type === 'congratulate') return `${speaker} is cutting a promo congratulating ${target}. ${heel ? 'Backhanded compliment — jealous underneath.' : 'Genuine but competitive.'}`
  if (type === 'match_result_winner') return `${speaker} just beat ${target}. Post-match promo. ${heel ? 'Ruthless gloating.' : 'Confident but respectful victory speech.'}`
  if (type === 'rematch') return `${speaker} is demanding a rematch against ${target}. They're furious and intense.`
  if (type === 'faction_form') return `${speaker} is announcing the formation of a new faction. Declare dominance, explain why the others joined.`
  if (type === 'qualifying') return `${speaker} is telling ${target} they need to prove themselves first before getting a title shot. Make it condescending.`
  return `${speaker} cuts a general promo. Context: ${context || 'Just arrived at the arena.'}`
}

function fallbackPromo(speaker, target, type) {
  const lines = {
    callout: `${speaker} here. And I'm done waiting. ${target ? `${target}, ` : ''}I'm calling you out — right here, right now. You think you're on my level? You haven't earned the right to breathe the same air as me. Step up or step aside.`,
    accept: `You want it? You got it. I've been waiting for this moment. Don't blink.`,
    reject: `You? Challenging me? That's the funniest thing I've heard all week. Come back when you've actually accomplished something.`,
    title_win: `Look at me. Look at this. This is what greatness looks like. Remember this moment.`,
    respond: `I heard every word. And I want you to know — I don't forget. And I don't forgive.`,
    congratulate: `You got lucky. Enjoy it while it lasts.`,
    default: `${speaker} is here, and business is about to pick up.`,
  }
  return lines[type] || lines.default
}
