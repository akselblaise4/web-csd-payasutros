/* ═══════════════════════════════════════════════════════════ */
/*  CSD PAYASUTROS — PROXY SERVER (Anti-CORS)                 */
/*  Express proxy for Liga B API consumption                  */
/* ═══════════════════════════════════════════════════════════ */

const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
const PORT = 3000;
const LIGA_B_API = 'https://api.ligab.cl/v1';

app.use(cors());

// ── NO-CACHE for development (prevents stale JS/CSS) ──
app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  next();
});

app.use(express.static(path.join(__dirname)));

// ── PROXY: Standings ──
app.get('/api/standings/:groupId', async (req, res) => {
  try {
    console.log(`[API] GET standings for group ${req.params.groupId}`);
    const resp = await fetch(`${LIGA_B_API}/groups/${req.params.groupId}/standings`);
    if (!resp.ok) throw new Error(`Liga B API returned ${resp.status}`);
    const data = await resp.json();
    console.log(`[API] Standings: ${data.length} teams`);
    res.json(data);
  } catch (err) {
    console.error('[API] Standings error:', err.message);
    res.status(500).json({ error: 'Failed to fetch standings', detail: err.message });
  }
});

// ── PROXY: Match Days / Fixtures ──
app.get('/api/match-days/:stageId', async (req, res) => {
  try {
    console.log(`[API] GET match-days for stage ${req.params.stageId}`);
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
    const resp = await fetch(`${LIGA_B_API}/stages/${req.params.stageId}/match-days?filter=${encodeURIComponent(filter)}`);
    if (!resp.ok) throw new Error(`Liga B API returned ${resp.status}`);
    const data = await resp.json();
    console.log(`[API] Match-days: ${data.length} dates`);
    res.json(data);
  } catch (err) {
    console.error('[API] Match-days error:', err.message);
    res.status(500).json({ error: 'Failed to fetch fixtures', detail: err.message });
  }
});

// ── PROXY: Groups (for future divisions/playoffs) ──
app.get('/api/groups/:stageId', async (req, res) => {
  try {
    const resp = await fetch(`${LIGA_B_API}/stages/${req.params.stageId}/groups`);
    if (!resp.ok) throw new Error(`Liga B API returned ${resp.status}`);
    const data = await resp.json();
    res.json(data);
  } catch (err) {
    console.error('[API] Groups error:', err.message);
    res.status(500).json({ error: 'Failed to fetch groups', detail: err.message });
  }
});

// ── PROXY: Tournament structure (for Phase 2) ──
app.get('/api/tournaments/:leagueId', async (req, res) => {
  try {
    const filter = JSON.stringify({ include: [{ relation: 'stages' }] });
    const resp = await fetch(`${LIGA_B_API}/leagues/${req.params.leagueId}/tournaments?filter=${encodeURIComponent(filter)}`);
    if (!resp.ok) throw new Error(`Liga B API returned ${resp.status}`);
    const data = await resp.json();
    res.json(data);
  } catch (err) {
    console.error('[API] Tournaments error:', err.message);
    res.status(500).json({ error: 'Failed to fetch tournaments', detail: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`\n  ⚽ CSD Payasutros Server v2.1`);
  console.log(`  → http://localhost:${PORT}`);
  console.log(`  → API Proxy: Liga B (api.ligab.cl)\n`);
});
