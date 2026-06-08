/* ═══════════════════════════════════════════════════════════ */
/*  CSD PAYASUTROS — PROXY SERVER v4.0                         */
/*  Express proxy · Server-side cache · Rate-limit aware       */
/* ═══════════════════════════════════════════════════════════ */

const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
const PORT = 3000;
const LIGA_B_API = 'https://api.ligab.cl/v1';
const CACHE_TTL = 2 * 60 * 1000; // 2 minutes

// ── SERVER-SIDE CACHE ──
const cache = new Map();

function getCached(key) {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.ts > CACHE_TTL) {
    cache.delete(key);
    return null;
  }
  return entry.data;
}

function setCache(key, data) {
  cache.set(key, { data, ts: Date.now() });
}

async function proxyFetch(url, cacheKey, res) {
  // Try cache first
  const cached = getCached(cacheKey);

  try {
    const resp = await fetch(url, { timeout: 15000 });
    if (resp.status === 429) {
      console.warn(`[API] ⚠️  Rate limited on ${cacheKey}`);
      if (cached) {
        console.log(`[API] Returning cached data for ${cacheKey}`);
        return res.json(cached);
      }
      return res.status(429).json({ error: 'Rate limited, no cache available' });
    }
    if (!resp.ok) throw new Error(`API returned ${resp.status}`);
    const data = await resp.json();
    setCache(cacheKey, data);
    return res.json(data);
  } catch (err) {
    console.error(`[API] Error on ${cacheKey}:`, err.message);
    if (cached) {
      console.log(`[API] Returning stale cache for ${cacheKey}`);
      return res.json(cached);
    }
    return res.status(500).json({ error: 'Failed to fetch', detail: err.message });
  }
}

app.use(cors());

// ── NO-CACHE for static files (prevents stale JS/CSS) ──
app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  next();
});

app.use(express.static(path.join(__dirname)));

// ── PROXY: Standings ──
app.get('/api/standings/:groupId', (req, res) => {
  const { groupId } = req.params;
  console.log(`[API] GET standings for group ${groupId}`);
  proxyFetch(
    `${LIGA_B_API}/groups/${groupId}/standings`,
    `standings_${groupId}`,
    res
  );
});

// ── PROXY: Match Days / Fixtures ──
app.get('/api/match-days/:stageId', (req, res) => {
  const { stageId } = req.params;
  console.log(`[API] GET match-days for stage ${stageId}`);
  const filter = JSON.stringify({
    include: [{
      relation: 'matches',
      scope: {
        include: [
          { relation: 'homeTeam' },
          { relation: 'awayTeam' },
          { relation: 'matchSchedule' },
          { relation: 'group' }
        ]
      }
    }]
  });
  proxyFetch(
    `${LIGA_B_API}/stages/${stageId}/match-days?filter=${encodeURIComponent(filter)}`,
    `matchdays_${stageId}`,
    res
  );
});

// ── PROXY: Groups (divisions within a stage) ──
app.get('/api/groups/:stageId', (req, res) => {
  const { stageId } = req.params;
  proxyFetch(
    `${LIGA_B_API}/stages/${stageId}/groups`,
    `groups_${stageId}`,
    res
  );
});

// ── PROXY: Tournaments (all stages for a league) ──
app.get('/api/tournaments/:leagueId', (req, res) => {
  const { leagueId } = req.params;
  const filter = JSON.stringify({ include: [{ relation: 'stages' }] });
  proxyFetch(
    `${LIGA_B_API}/leagues/${leagueId}/tournaments?filter=${encodeURIComponent(filter)}`,
    `tournaments_${leagueId}`,
    res
  );
});

// ── PROXY: All leagues (for cross-league search) ──
app.get('/api/leagues', (req, res) => {
  proxyFetch(`${LIGA_B_API}/leagues`, 'leagues_all', res);
});

app.listen(PORT, () => {
  console.log(`\n  ⚽ CSD Payasutros Server v4.0`);
  console.log(`  → http://localhost:${PORT}`);
  console.log(`  → API Proxy: Liga B (api.ligab.cl)`);
  console.log(`  → Cache TTL: ${CACHE_TTL / 1000}s\n`);
});
