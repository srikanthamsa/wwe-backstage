
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

async function listModels() {
  console.log("Listing available Gemini models...");
  if (!GEMINI_KEY) {
    console.error("❌ Error: VITE_GEMINI_KEY not found.");
    return;
  }

  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_KEY}`);
    const data = await res.json();
    console.log(JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("❌ Error listing models:", error.message);
  }
}

listModels();
