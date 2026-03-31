
import fs from 'fs';

function getEnvKey(key) {
  try {
    const env = fs.readFileSync('.env.local', 'utf8');
    const match = env.match(new RegExp(`${key}="(.*?)"`));
    return match ? match[1] : null;
  } catch (e) {
    return null;
  }
}

const GEMINI_KEY = getEnvKey('VITE_GEMINI_KEY');

async function testGemini() {
  console.log("Testing Gemini API (v1beta - gemini-2.0-flash)...");
  if (!GEMINI_KEY) {
    console.error("❌ Error: VITE_GEMINI_KEY not found in .env.local");
    return;
  }

  const systemCtx = "You are a WWE scriptwriter. Keep it short.";
  const prompt = "Generate a 1-sentence challenge from John Cena to Roman Reigns.";

  try {
    // using gemini-2.0-flash which is confirmed to support generateContent in v1beta
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `${systemCtx}\n\n${prompt}` }] }],
        generationConfig: { temperature: 0.9, maxOutputTokens: 100 }
      })
    });
    
    const data = await res.json();
    const result = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (result) {
      console.log("✅ Success! Gemini responded:");
      console.log(`"${result.trim()}"`);
    } else {
      console.error("❌ Error: Received empty response from Gemini API.");
      console.log("Full response:", JSON.stringify(data, null, 2));
    }
  } catch (error) {
    console.error("❌ Fetch Error:", error.message);
  }
}

testGemini();
