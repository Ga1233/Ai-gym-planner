const express  = require('express');
const fetch    = require('node-fetch');   // v2 — CommonJS compatible
const authMW   = require('../middleware/auth');

const router = express.Router();
router.use(authMW);

// ── Core AI caller ────────────────────────────────────────────
async function callAI(messages, systemMsg, maxTokens) {
  const baseURL = (process.env.AI_API_BASE_URL || 'https://api.groq.com/openai/v1').replace(/\/$/, '');
  const model   = process.env.AI_MODEL   || 'llama3-70b-8192';
  const apiKey  = process.env.AI_API_KEY || '';
  const tokens  = Number(maxTokens) || Number(process.env.AI_MAX_TOKENS) || 2048;

  if (!apiKey || apiKey === 'YOUR_GROQ_API_KEY_HERE') {
    const err = new Error('AI_API_KEY is missing in your .env file. Add your Groq API key.');
    err.status = 503;
    throw err;
  }

  console.log(`[AI] → ${baseURL}/chat/completions  model=${model}  maxTokens=${tokens}`);

  let response;
  try {
    response = await fetch(`${baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        max_tokens: tokens,
        temperature: 0.7,
        messages: [
          { role: 'system', content: systemMsg },
          ...messages,
        ],
      }),
    });
  } catch (networkErr) {
    const err = new Error(`Cannot reach AI provider: ${networkErr.message}. Check AI_API_BASE_URL in .env`);
    err.status = 502;
    throw err;
  }

  const rawText = await response.text();

  if (!response.ok) {
    console.error(`[AI] HTTP ${response.status}:`, rawText);
    let msg = `AI provider error (HTTP ${response.status})`;
    try {
      const parsed = JSON.parse(rawText);
      msg = parsed?.error?.message || parsed?.message || msg;
    } catch {}
    const err = new Error(msg);
    err.status = 502;
    throw err;
  }

  let data;
  try {
    data = JSON.parse(rawText);
  } catch {
    console.error('[AI] Could not parse response JSON:', rawText.slice(0, 300));
    const err = new Error('AI returned non-JSON response. Try a different model.');
    err.status = 502;
    throw err;
  }

  if (!data.choices || !data.choices.length) {
    console.error('[AI] No choices in response:', JSON.stringify(data).slice(0, 300));
    const err = new Error('AI returned empty response. Check your model name in .env');
    err.status = 502;
    throw err;
  }

  return data.choices[0].message?.content || '';
}

// ── POST /api/ai/generate-workout ─────────────────────────────
router.post('/generate-workout', async (req, res, next) => {
  try {
    const {
      goals         = [],
      fitnessLevel  = 'intermediate',
      daysPerWeek   = 3,
      equipment     = ['bodyweight'],
      focusArea     = 'full body',
      sessionLength = 60,
    } = req.body;

    const systemMsg = `You are an expert certified personal trainer.
You ONLY respond with raw valid JSON — no markdown, no code fences, no explanation.
The JSON must exactly match the schema the user gives you.`;

    const userMsg = `Create a ${daysPerWeek}-day per week workout plan for a ${fitnessLevel} athlete.
Goals: ${goals.join(', ') || 'general fitness'}
Focus area: ${focusArea}
Session length: ${sessionLength} minutes
Equipment available: ${equipment.join(', ')}

Respond ONLY with this JSON (no markdown, no backticks, no extra text):
{
  "title": "Plan name here",
  "description": "Short description here",
  "days": [
    {
      "day": "Monday",
      "title": "Workout title",
      "category": "strength",
      "exercises": [
        {
          "name": "Exercise name",
          "sets": 3,
          "reps": "10-12",
          "rest": 60,
          "notes": "Optional tip"
        }
      ]
    }
  ],
  "weeklyTips": ["Tip 1", "Tip 2"]
}`;

    const raw = await callAI([{ role: 'user', content: userMsg }], systemMsg, process.env.AI_MAX_TOKENS || 2048);

    // Strip any accidental markdown fences
    const cleaned = raw
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```\s*$/, '')
      .trim();

    let plan;
    try {
      plan = JSON.parse(cleaned);
    } catch (e) {
      console.error('[AI] JSON parse error. Raw:', cleaned.slice(0, 500));
      return res.status(502).json({ error: 'AI returned malformed JSON. Please try again.' });
    }

    res.json(plan);
  } catch (err) { next(err); }
});

// ── POST /api/ai/chat ──────────────────────────────────────────
router.post('/chat', async (req, res, next) => {
  try {
    const { messages = [], userProfile = {} } = req.body;

    if (!Array.isArray(messages) || !messages.length)
      return res.status(400).json({ error: 'messages array is required' });

    const sanitized = messages.slice(-20).map(m => ({
      role:    m.role === 'assistant' ? 'assistant' : 'user',
      content: String(m.content).slice(0, 2000),
    }));

    const systemMsg = `You are a knowledgeable AI fitness coach inside a gym planner app.
User profile: fitness level = ${userProfile.fitnessLevel || 'not set'}, goals = ${(userProfile.goals || []).join(', ') || 'not set'}.
Give practical, evidence-based fitness and nutrition advice.
Keep replies concise (under 250 words) unless the user asks for more detail.
Do not provide medical diagnoses.`;

    const reply = await callAI(sanitized, systemMsg, 512);
    res.json({ reply });
  } catch (err) { next(err); }
});

// ── POST /api/ai/analyze-workout ───────────────────────────────
router.post('/analyze-workout', async (req, res, next) => {
  try {
    const { workout } = req.body;
    if (!workout) return res.status(400).json({ error: 'workout data required' });

    const systemMsg = `You are a strength and conditioning coach. Respond ONLY with raw valid JSON — no markdown.`;

    const userMsg = `Analyze this workout and respond ONLY with this JSON (no markdown, no backticks):
{
  "score": 7,
  "strengths": ["string"],
  "improvements": ["string"],
  "safetyNotes": ["string"],
  "progressionTip": "string"
}

Workout data: ${JSON.stringify(workout)}`;

    const raw     = await callAI([{ role: 'user', content: userMsg }], systemMsg, 512);
    const cleaned = raw.replace(/^```(?:json)?/i,'').replace(/```$/,'').trim();

    let analysis;
    try { analysis = JSON.parse(cleaned); }
    catch { return res.status(502).json({ error: 'AI returned malformed JSON for analysis.' }); }

    res.json(analysis);
  } catch (err) { next(err); }
});

module.exports = router;
