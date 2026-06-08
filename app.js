/* ═══════════════════════════════════════════════════════════ */
/*  CSD PAYASUTROS — INTERACTIVE ENGINE v4.0                  */
/*  Full-auto division detection · Cache/Fallback · Alerts    */
/* ═══════════════════════════════════════════════════════════ */

// ── CONFIGURATION ──
const CONFIG = {
  TEAM_NAME: 'CSD Payasutros',
  TEAM_ID: 3250,
  LEAGUE_ID: 27,
  FETCH_TIMEOUT: 12000,
  REFRESH_INTERVAL: 5 * 60 * 1000,  // Auto-refresh every 5 minutes
  CACHE_PREFIX: 'payasutros_',
  CACHE_MAX_AGE: 30 * 60 * 1000,    // LocalStorage cache: 30 min max age
};

// Runtime state — detected dynamically, NEVER hardcoded
const STATE = {
  stageId: null,
  groupId: null,
  groupName: '',
  leagueName: '',
  seasonName: '',
  matchDays: null,
  standings: null,
  refreshTimer: null,
  countdownTimer: null,
};

// ═══════════════════════════════════════════════════════════
//  FILE:// PROTOCOL GUARD
// ═══════════════════════════════════════════════════════════

if (window.location.protocol === 'file:') {
  document.addEventListener('DOMContentLoaded', () => {
    const banner = document.createElement('div');
    banner.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:99999;background:#D4213D;color:#fff;text-align:center;padding:14px 20px;font-family:system-ui;font-size:0.95rem;font-weight:600;letter-spacing:0.5px;box-shadow:0 4px 20px rgba(0,0,0,0.5);';
    banner.innerHTML = '⚠️ Para ver datos en vivo, abre la página desde <strong style="text-decoration:underline">http://localhost:3000</strong> con el servidor corriendo (node server.js)';
    document.body.prepend(banner);
  });
}

// ═══════════════════════════════════════════════════════════
//  CACHE MODULE — LocalStorage with TTL
// ═══════════════════════════════════════════════════════════

const Cache = {
  _key(name) { return CONFIG.CACHE_PREFIX + name; },

  get(name) {
    try {
      const raw = localStorage.getItem(this._key(name));
      if (!raw) return null;
      const entry = JSON.parse(raw);
      if (Date.now() - entry.ts > CONFIG.CACHE_MAX_AGE) {
        localStorage.removeItem(this._key(name));
        return null;
      }
      return entry.data;
    } catch { return null; }
  },

  set(name, data) {
    try {
      localStorage.setItem(this._key(name), JSON.stringify({ data, ts: Date.now() }));
    } catch (e) {
      console.warn('[Cache] Storage full, clearing old entries');
      this.clear();
    }
  },

  clear() {
    const keys = Object.keys(localStorage).filter(k => k.startsWith(CONFIG.CACHE_PREFIX));
    keys.forEach(k => localStorage.removeItem(k));
  }
};

// ═══════════════════════════════════════════════════════════
//  FETCH WITH TIMEOUT + CACHE FALLBACK
// ═══════════════════════════════════════════════════════════

async function fetchWithCache(url, cacheKey, timeout = CONFIG.FETCH_TIMEOUT) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    const resp = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const data = await resp.json();
    Cache.set(cacheKey, data);
    return data;
  } catch (err) {
    clearTimeout(timer);
    console.warn(`[Fetch] ${url} failed: ${err.message}, trying cache...`);
    const cached = Cache.get(cacheKey);
    if (cached) {
      console.log(`[Fetch] ✅ Returned cached data for ${cacheKey}`);
      showSyncStatus('cached');
      return cached;
    }
    console.error(`[Fetch] ❌ No cache available for ${cacheKey}`);
    return null;
  }
}

// ═══════════════════════════════════════════════════════════
//  UI: LOADING / SYNC STATUS
// ═══════════════════════════════════════════════════════════

function showSyncStatus(status) {
  const indicator = document.getElementById('sync-indicator');
  const overlay = document.getElementById('sync-overlay');

  if (indicator) {
    switch (status) {
      case 'syncing':
        indicator.innerHTML = '<span class="sync-dot syncing"></span> SINCRONIZANDO...';
        indicator.className = 'live-badge syncing';
        break;
      case 'live':
        indicator.innerHTML = '<span class="sync-dot live"></span> DATOS EN VIVO · LIGA B';
        indicator.className = 'live-badge live';
        break;
      case 'cached':
        indicator.innerHTML = '<span class="sync-dot cached"></span> DATOS EN CACHÉ · SIN CONEXIÓN';
        indicator.className = 'live-badge cached';
        break;
      case 'error':
        indicator.innerHTML = '<span class="sync-dot error"></span> ERROR DE CONEXIÓN';
        indicator.className = 'live-badge error';
        break;
    }
  }

  if (overlay) {
    overlay.classList.toggle('hidden', status !== 'syncing');
  }
}

// ═══════════════════════════════════════════════════════════
//  DIVISION CHANGE ALERTS
//  Detects when team moves between divisions (ascent/descent)
// ═══════════════════════════════════════════════════════════

const DivisionAlert = {
  _storageKey: CONFIG.CACHE_PREFIX + 'last_division',

  check(newGroupId, newGroupName) {
    try {
      const prev = localStorage.getItem(this._storageKey);
      if (prev) {
        const prevData = JSON.parse(prev);
        if (prevData.groupId !== newGroupId) {
          const event = {
            timestamp: new Date().toISOString(),
            team: CONFIG.TEAM_NAME,
            from: { groupId: prevData.groupId, name: prevData.groupName },
            to: { groupId: newGroupId, name: newGroupName },
            type: 'DIVISION_CHANGE',
          };
          console.log('🚨 [DIVISION CHANGE DETECTED]', event);
          this._notify(event);
        }
      }
      localStorage.setItem(this._storageKey, JSON.stringify({ groupId: newGroupId, groupName: newGroupName }));
    } catch (e) {
      console.warn('[DivisionAlert] Error:', e);
    }
  },

  // Webhook-ready: replace this with a fetch to Discord/Telegram
  _notify(event) {
    const msg = `🚨 CAMBIO DE DIVISIÓN: ${event.team} pasó de "${event.from.name}" a "${event.to.name}"`;
    console.log(`[WEBHOOK READY] ${msg}`);
    console.log('[WEBHOOK PAYLOAD]', JSON.stringify(event, null, 2));

    // Future: Uncomment and set your webhook URL
    // fetch('https://discord.com/api/webhooks/YOUR_ID/YOUR_TOKEN', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ content: msg })
    // }).catch(e => console.error('Webhook failed:', e));
  }
};

// ═══════════════════════════════════════════════════════════
//  DATE UTILITIES
//  Fix: API dates are in UTC. "2026-04-16T00:00:00.000Z" is
//  Wed Apr 15 in Chile (UTC-4). Games are actually on Thursday.
//  Solution: Parse date components as LOCAL, ignoring timezone.
// ═══════════════════════════════════════════════════════════

function parseMatchDate(isoString) {
  // Extract YYYY-MM-DD from ISO string and treat as LOCAL date
  const [datePart] = isoString.split('T');
  const [year, month, day] = datePart.split('-').map(Number);
  return { year, month: month - 1, day }; // month is 0-indexed
}

function buildMatchDateTime(isoDateString, scheduleStr) {
  const { year, month, day } = parseMatchDate(isoDateString);
  let hours = 20, mins = 0;
  if (scheduleStr) {
    const parts = scheduleStr.split(':');
    hours = parseInt(parts[0], 10) || 20;
    mins = parseInt(parts[1] || '0', 10);
  }
  return new Date(year, month, day, hours, mins, 0, 0);
}

function formatMatchDate(isoDateString) {
  const { year, month, day } = parseMatchDate(isoDateString);
  const dt = new Date(year, month, day, 12, 0); // noon to avoid DST issues
  return dt.toLocaleDateString('es-CL', { weekday: 'short', day: 'numeric', month: 'short' });
}

// ═══════════════════════════════════════════════════════════
//  AUTO-DETECT: STAGE + GROUP (DIVISION)
//  Scans all tournaments → stages → groups → standings
//  to find CSD Payasutros anywhere in the league structure.
// ═══════════════════════════════════════════════════════════

async function detectTeamLocation() {
  console.log('[AUTO] 🔍 Scanning league structure for', CONFIG.TEAM_NAME, '...');

  // Step 1: Get all tournaments (and their stages) for the league
  const tournaments = await fetchWithCache(
    `/api/tournaments/${CONFIG.LEAGUE_ID}`,
    `tournaments_${CONFIG.LEAGUE_ID}`
  );

  if (!tournaments || !Array.isArray(tournaments) || tournaments.length === 0) {
    console.error('[AUTO] Could not fetch tournaments');
    return null;
  }

  // Step 2: Find the most recent/active tournament
  // Sort by ID descending (most recent first)
  const sorted = [...tournaments].sort((a, b) => b.id - a.id);

  for (const tournament of sorted) {
    const stages = tournament.stages || [];
    if (stages.length === 0) continue;

    // Sort stages: most recent first
    const sortedStages = [...stages].sort((a, b) => b.id - a.id);

    for (const stage of sortedStages) {
      console.log(`[AUTO] Checking stage: ${stage.name || stage.id} (ID: ${stage.id})`);

      // Step 3: Get all groups (divisions) in this stage
      const groups = await fetchWithCache(
        `/api/groups/${stage.id}`,
        `groups_${stage.id}`
      );

      if (!groups || !Array.isArray(groups) || groups.length === 0) continue;

      console.log(`[AUTO]   Found ${groups.length} divisions:`, groups.map(g => g.name).join(', '));

      // Step 4: Check standings of each group to find our team
      for (const group of groups) {
        const standings = await fetchWithCache(
          `/api/standings/${group.id}`,
          `standings_${group.id}`
        );

        if (!standings || !Array.isArray(standings)) continue;

        const found = standings.find(entry => entry.team && entry.team.id === CONFIG.TEAM_ID);
        if (found) {
          STATE.stageId = stage.id;
          STATE.groupId = group.id;
          STATE.groupName = group.name;
          STATE.seasonName = tournament.name || '';
          STATE.leagueName = `Liga B+ Jueves Rinconada`;
          STATE.standings = standings;

          console.log(`[AUTO] ✅ ${CONFIG.TEAM_NAME} found!`);
          console.log(`[AUTO]    Tournament: ${tournament.name}`);
          console.log(`[AUTO]    Stage: ${stage.name || stage.id}`);
          console.log(`[AUTO]    Division: ${group.name} (ID: ${group.id})`);

          // Check for division change
          DivisionAlert.check(group.id, group.name);

          return { tournament, stage, group, standings };
        }
      }
    }
  }

  console.error(`[AUTO] ❌ ${CONFIG.TEAM_NAME} not found in any division of league ${CONFIG.LEAGUE_ID}`);
  return null;
}

// ═══════════════════════════════════════════════════════════
//  INITIALIZATION
// ═══════════════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {
  if (window.location.protocol === 'file:') return;

  initLoader();
  initNavbar();
  initScrollAnimations();
  initBackToTop();
  initLightbox();
  initGalleryFilters();

  renderPlayers();
  renderGallery();

  // Load live data
  loadAllLiveData();

  // Auto-refresh every 5 minutes
  STATE.refreshTimer = setInterval(() => {
    console.log('[REFRESH] Auto-refreshing data...');
    loadAllLiveData(true);
  }, CONFIG.REFRESH_INTERVAL);
});

async function loadAllLiveData(isRefresh = false) {
  showSyncStatus('syncing');

  // Step 1: Detect where Payasutros is (stage + group)
  const detection = await detectTeamLocation();

  if (detection) {
    // Step 2: Render standings
    renderStandings(detection.standings);
    updateDivisionLabel();

    // Step 3: Load fixtures for the detected stage
    await loadFixtures();

    showSyncStatus('live');
  } else {
    // Try cached data as last resort
    const cachedStandings = Cache.get('last_standings');
    const cachedMatchDays = Cache.get('last_matchdays');

    if (cachedStandings) {
      renderStandings(cachedStandings);
      showSyncStatus('cached');
    } else {
      showDataError('standings-body', 'No se pudo detectar la división de CSD Payasutros.');
      showSyncStatus('error');
    }

    if (cachedMatchDays) {
      STATE.matchDays = cachedMatchDays;
      renderFixture(cachedMatchDays, 'all');
      initFixtureTabs();
      updateCountdown(cachedMatchDays);
      updateHeroNextMatch(cachedMatchDays);
    } else {
      showDataError('fixture-list', 'No se pudo cargar el fixture.');
    }
  }
}

async function loadFixtures() {
  if (!STATE.stageId) return;

  try {
    const data = await fetchWithCache(
      `/api/match-days/${STATE.stageId}`,
      `matchdays_${STATE.stageId}`
    );

    if (data && Array.isArray(data) && data.length > 0) {
      STATE.matchDays = data;
      Cache.set('last_matchdays', data);
      renderFixture(data, 'all');
      initFixtureTabs();
      updateCountdown(data);
      updateHeroNextMatch(data);
    } else {
      showDataError('fixture-list', 'No se pudo cargar el fixture.');
    }
  } catch (err) {
    console.error('loadFixtures failed:', err);
    showDataError('fixture-list', 'Error al cargar fixture.');
  }
}

function updateDivisionLabel() {
  const label = document.getElementById('division-label');
  if (label) {
    label.textContent = `${STATE.leagueName} · ${STATE.seasonName} · ${STATE.groupName}`;
  }
}

function showDataError(containerId, msg) {
  const el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML = `<div class="data-error">
    <svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
    <span>${msg}</span>
  </div>`;
}

function initLoader() {
  const loader = document.getElementById('loader');
  setTimeout(() => { loader.classList.add('hidden'); }, 1800);
}

// ═══════════════════════════════════════════════════════════
//  STANDINGS — LIVE DATA
// ═══════════════════════════════════════════════════════════

function renderStandings(data) {
  const tbody = document.getElementById('standings-body');
  if (!tbody) return;

  // Save for cache fallback
  Cache.set('last_standings', data);

  const sorted = [...data].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
    return b.goalsFor - a.goalsFor;
  });

  tbody.innerHTML = sorted.map((entry, idx) => {
    const t = entry.team;
    if (!t) return '';
    const isPayasutros = t.id === CONFIG.TEAM_ID;
    const dif = entry.goalDifference;
    const difStr = dif > 0 ? `+${dif}` : `${dif}`;
    const logoUrl = t.teamLogoUrl;

    return `
      <tr class="${isPayasutros ? 'team-highlight' : ''}">
        <td><span class="pos">${idx + 1}</span></td>
        <td>
          <div class="team-name-cell">
            ${logoUrl
              ? `<img src="${logoUrl}" alt="" class="team-logo-small" onerror="this.style.display='none'">`
              : isPayasutros ? '<img src="logo.png" alt="" class="team-logo-small">' : '<div class="team-logo-placeholder"></div>'
            }
            <span>${t.name.trim()}</span>
          </div>
        </td>
        <td>${entry.played}</td>
        <td>${entry.won}</td>
        <td>${entry.drawn}</td>
        <td>${entry.lost}</td>
        <td>${entry.goalsFor}</td>
        <td>${entry.goalsAgainst}</td>
        <td>${difStr}</td>
        <td><span class="pts">${entry.points}</span></td>
      </tr>
    `;
  }).join('');
}

// ═══════════════════════════════════════════════════════════
//  FIXTURE — LIVE DATA (uses dynamically detected group)
// ═══════════════════════════════════════════════════════════

function extractPayasutrosMatches(matchDays) {
  const matches = [];
  if (!Array.isArray(matchDays)) return matches;

  matchDays.forEach(md => {
    if (!md.matches || !Array.isArray(md.matches)) return;
    md.matches.forEach(m => {
      // Filter by the DETECTED group (dynamic!)
      if (STATE.groupId && m.groupId !== STATE.groupId) return;
      if (m.homeTeamId === CONFIG.TEAM_ID || m.awayTeamId === CONFIG.TEAM_ID) {
        matches.push({
          ...m,
          matchDayName: md.name,
          matchDayDate: md.date
        });
      }
    });
  });
  return matches;
}

function renderFixture(matchDays, filter) {
  const list = document.getElementById('fixture-list');
  if (!list) return;

  let matches = extractPayasutrosMatches(matchDays);
  const isPlayed = m => m.homeScore !== null && m.awayScore !== null;

  if (filter === 'played') matches = matches.filter(isPlayed);
  if (filter === 'upcoming') matches = matches.filter(m => !isPlayed(m));

  matches.sort((a, b) => {
    const aP = isPlayed(a);
    const bP = isPlayed(b);
    if (aP && !bP) return -1;
    if (!aP && bP) return 1;
    const dA = buildMatchDateTime(a.matchDayDate, a.matchSchedule?.schedule);
    const dB = buildMatchDateTime(b.matchDayDate, b.matchSchedule?.schedule);
    return aP ? dB - dA : dA - dB;
  });

  if (matches.length === 0) {
    list.innerHTML = '<div class="data-error"><span>No hay partidos para mostrar.</span></div>';
    return;
  }

  list.innerHTML = matches.map(m => {
    const home = m.homeTeam || { id: m.homeTeamId, name: 'Equipo' };
    const away = m.awayTeam || { id: m.awayTeamId, name: 'Equipo' };
    const played = isPlayed(m);
    const schedule = m.matchSchedule ? m.matchSchedule.schedule : '';

    // FIX: Use local date parsing instead of new Date(UTC)
    const dateStr = formatMatchDate(m.matchDayDate);

    const isHome = home.id === CONFIG.TEAM_ID;
    let centerHTML = '';
    let resultBadge = '';

    if (played) {
      centerHTML = `<div class="fixture-score">${m.homeScore} — ${m.awayScore}</div>`;
      const homeWin = m.homeScore > m.awayScore;
      const draw = m.homeScore === m.awayScore;
      const payasutrosWin = (isHome && homeWin) || (!isHome && !homeWin && !draw);

      if (payasutrosWin) {
        resultBadge = '<span class="fixture-result-badge win">Victoria</span>';
      } else if (draw) {
        resultBadge = '<span class="fixture-result-badge draw">Empate</span>';
      } else {
        resultBadge = '<span class="fixture-result-badge loss">Derrota</span>';
      }
    } else {
      centerHTML = '<div class="fixture-vs">VS</div>';
    }

    const homeName = (home.name || 'Equipo').trim();
    const awayName = (away.name || 'Equipo').trim();
    const homeLogoUrl = home.teamLogoUrl;
    const awayLogoUrl = away.teamLogoUrl;

    return `
      <div class="fixture-card ${played ? 'played' : ''}">
        <div class="fixture-team">
          ${home.id === CONFIG.TEAM_ID
            ? '<img src="logo.png" alt="" class="fixture-team-logo">'
            : homeLogoUrl
              ? `<img src="${homeLogoUrl}" alt="" class="fixture-team-logo" onerror="this.style.display='none'">`
              : '<div class="fixture-team-logo"></div>'
          }
          <span class="fixture-team-name" ${home.id === CONFIG.TEAM_ID ? 'style="color:var(--red-bright)"' : ''}>${homeName}</span>
        </div>

        <div class="fixture-center">
          ${centerHTML}
          <div class="fixture-date">${dateStr}${schedule ? ' · ' + schedule : ''}</div>
          ${resultBadge}
          ${m.grounds ? `
          <div class="fixture-meta">
            <span class="fixture-meta-item">
              <svg viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
              ${m.grounds}
            </span>
          </div>` : ''}
        </div>

        <div class="fixture-team away">
          <span class="fixture-team-name" ${away.id === CONFIG.TEAM_ID ? 'style="color:var(--red-bright)"' : ''}>${awayName}</span>
          ${away.id === CONFIG.TEAM_ID
            ? '<img src="logo.png" alt="" class="fixture-team-logo">'
            : awayLogoUrl
              ? `<img src="${awayLogoUrl}" alt="" class="fixture-team-logo" onerror="this.style.display='none'">`
              : '<div class="fixture-team-logo"></div>'
          }
        </div>
      </div>
    `;
  }).join('');
}

function initFixtureTabs() {
  document.querySelectorAll('.fixture-tab').forEach(tab => {
    // Remove old listeners by cloning
    const newTab = tab.cloneNode(true);
    tab.parentNode.replaceChild(newTab, tab);

    newTab.addEventListener('click', () => {
      document.querySelectorAll('.fixture-tab').forEach(t => t.classList.remove('active'));
      newTab.classList.add('active');
      if (STATE.matchDays) {
        renderFixture(STATE.matchDays, newTab.dataset.filter);
      }
    });
  });
}

// ═══════════════════════════════════════════════════════════
//  COUNTDOWN — Uses fixed local date parsing
// ═══════════════════════════════════════════════════════════

function updateCountdown(matchDays) {
  const matches = extractPayasutrosMatches(matchDays);

  const upcoming = matches
    .filter(m => m.homeScore === null && m.awayScore === null)
    .map(m => ({
      ...m,
      targetDate: buildMatchDateTime(
        m.matchDayDate,
        m.matchSchedule?.schedule
      )
    }))
    .filter(m => m.targetDate > new Date())
    .sort((a, b) => a.targetDate - b.targetDate);

  const cdDays = document.getElementById('cd-days');
  const cdHours = document.getElementById('cd-hours');
  const cdMins = document.getElementById('cd-mins');
  const cdSecs = document.getElementById('cd-secs');
  if (!cdDays || !cdHours || !cdMins || !cdSecs) return;

  if (upcoming.length === 0) {
    cdDays.textContent = '--';
    cdHours.textContent = '--';
    cdMins.textContent = '--';
    cdSecs.textContent = '--';
    const label = document.querySelector('.countdown-label');
    if (label) label.textContent = 'Sin partidos programados';
    return;
  }

  const targetDate = upcoming[0].targetDate;

  // Clear previous countdown timer
  if (STATE.countdownTimer) clearInterval(STATE.countdownTimer);

  function tick() {
    const diff = targetDate - new Date();
    if (diff <= 0) {
      cdDays.textContent = '00';
      cdHours.textContent = '00';
      cdMins.textContent = '00';
      cdSecs.textContent = '00';
      return;
    }
    cdDays.textContent = String(Math.floor(diff / 864e5)).padStart(2, '0');
    cdHours.textContent = String(Math.floor((diff % 864e5) / 36e5)).padStart(2, '0');
    cdMins.textContent = String(Math.floor((diff % 36e5) / 6e4)).padStart(2, '0');
    cdSecs.textContent = String(Math.floor((diff % 6e4) / 1e3)).padStart(2, '0');
  }

  tick();
  STATE.countdownTimer = setInterval(tick, 1000);
}

function updateHeroNextMatch(matchDays) {
  const matches = extractPayasutrosMatches(matchDays);

  const upcoming = matches
    .filter(m => m.homeScore === null && m.awayScore === null)
    .map(m => ({
      ...m,
      targetDate: buildMatchDateTime(m.matchDayDate, m.matchSchedule?.schedule)
    }))
    .filter(m => m.targetDate > new Date())
    .sort((a, b) => a.targetDate - b.targetDate);

  const matchLabel = document.querySelector('.countdown-match');
  if (upcoming.length > 0 && matchLabel) {
    const next = upcoming[0];
    const opponentTeam = next.homeTeamId === CONFIG.TEAM_ID ? next.awayTeam : next.homeTeam;
    const opponentName = opponentTeam ? opponentTeam.name.trim() : 'Rival';
    const isHome = next.homeTeamId === CONFIG.TEAM_ID;
    matchLabel.innerHTML = `<strong>${CONFIG.TEAM_NAME}</strong> ${isHome ? 'vs' : '@'} ${opponentName}`;
  } else if (matchLabel) {
    matchLabel.innerHTML = `<strong>${CONFIG.TEAM_NAME}</strong> — Esperando fixture`;
  }
}

// ═══════════════════════════════════════════════════════════
//  PLAYERS
// ═══════════════════════════════════════════════════════════

const QUOTE_SVG = `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V21z"/><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 5v3z"/></svg>`;

const playersData = {
  'Arquero': [
    {
      name: 'CP8', pos: 'Arquero', badge: 'gk',
      photo: 'img/plantel/CP8_Arquero.jpeg',
      stats: { RIT: 78, TIR: 55, PAS: 84, REG: 65, DEF: 70, FIS: 93 },
      special: { reflejos: 87, posicion: 86, saque: 88 },
      quote: '"Reacciona tan tarde que todavía está atajando el partido pasado."'
    },
  ],
  'Defensas': [
    {
      name: 'Pancho', pos: 'Defensa Central', badge: 'def',
      photo: 'img/plantel/Pancho_Defensa.jpg',
      stats: { RIT: 85, TIR: 78, PAS: 88, REG: 82, DEF: 95, FIS: 94 },
      special: { marcaje: 96, entrada: 94, cabeceo: 92 },
      quote: '"Sale jugando y el equipo reza."'
    },
    {
      name: 'Piperfecto', pos: 'Defensa Central', badge: 'def',
      photo: 'img/plantel/Piperfecto_Defensa.jpeg',
      stats: { RIT: 99, TIR: 99, PAS: 99, REG: 99, DEF: 99, FIS: 99 },
      special: { marcaje: 99, entrada: 99, cabeceo: 99 },
      quote: '"Como jugador un muro, como DT un papel."'
    },
  ],
  'Laterales': [
    {
      name: '7 Pulmones', pos: 'Lateral', badge: 'lat',
      photo: 'img/plantel/7 pulmones_Lateral.jpeg',
      stats: { RIT: 94, TIR: 82, PAS: 89, REG: 86, DEF: 85, FIS: 95 },
      special: { resistencia: 99, desborde: 94, centro: 91 },
      quote: '"Tiene más lesiones que finales."'
    },
    {
      name: 'Vicho', pos: 'Lateral', badge: 'lat',
      photo: 'img/plantel/Vicho_Lateral.jpg',
      stats: { RIT: 88, TIR: 75, PAS: 84, REG: 83, DEF: 84, FIS: 96 },
      special: { resistencia: 94, desborde: 91, centro: 88 },
      quote: '"Sube y baja por la banda como si la cancha fuera un ascensor y él el único botón."'
    },
  ],
  'Mediocampistas': [
    {
      name: 'Capi', pos: 'Mediocampista', badge: 'mid',
      photo: 'img/plantel/Capi_Medio.jpg',
      stats: { RIT: 85, TIR: 88, PAS: 95, REG: 94, DEF: 84, FIS: 90 },
      special: { vision: 97, liderazgo: 99, pasesClave: 96 },
      quote: '"Capitán, usted no marca… deja huellas."'
    },
    {
      name: 'Paul Walker', pos: 'Mediocampista', badge: 'mid',
      photo: 'img/plantel/Paul Walker_Medio.jpg',
      stats: { RIT: 92, TIR: 76, PAS: 88, REG: 85, DEF: 82, FIS: 87 },
      special: { vision: 92, regate: 90, pasesClave: 89 },
      quote: '"Centra, corre, mete… pero definir no está en el pack."'
    },
    {
      name: 'Rigoat', pos: 'Mediocampista', badge: 'mid',
      photo: 'img/plantel/Rigoat_Medio.jpeg',
      stats: { RIT: 82, TIR: 89, PAS: 93, REG: 88, DEF: 78, FIS: 86 },
      special: { vision: 93, disparo: 94, pasesClave: 90 },
      quote: '"Toca de primera… y se queda sin aire de segunda."'
    },
  ],
  'Delanteros': [
    {
      name: 'Matucrack', pos: 'Delantero', badge: 'fwd',
      photo: 'img/plantel/Matucrack_Delantero.jpg',
      stats: { RIT: 96, TIR: 96, PAS: 89, REG: 94, DEF: 70, FIS: 95 },
      special: { definicion: 98, posicion: 96, velocidad: 95 },
      quote: '"Se llama Matucrack y la verdad... no miente. Aunque celebra goles de tercer tiempo también."'
    },
    {
      name: 'Rey', pos: 'Delantero', badge: 'fwd',
      photo: 'img/plantel/Rey_Delantero.jpg',
      stats: { RIT: 92, TIR: 95, PAS: 85, REG: 91, DEF: 60, FIS: 93 },
      special: { definicion: 95, potencia: 93, cabeceo: 92 },
      quote: '"Te insulta 90 minutos… y te vacuna en uno."'
    },
    {
      name: 'Wladimilf', pos: 'Delantero', badge: 'fwd',
      photo: 'img/plantel/Wladimilf_Delantero.jpeg',
      stats: { RIT: 95, TIR: 94, PAS: 88, REG: 92, DEF: 65, FIS: 94 },
      special: { definicion: 96, regate: 95, desborde: 93 },
      quote: '"Con ese porte debería hacer goles… pero hace sombra."'
    },
  ],
};

function calcOverall(stats, special, badge) {
  if (badge === 'gk' && special) {
    const specVals = Object.values(special);
    return Math.round(specVals.reduce((a, b) => a + b, 0) / specVals.length);
  }
  const vals = Object.values(stats);
  return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
}

function renderPlayers() {
  const container = document.getElementById('plantel-container');
  if (!container) return;

  container.innerHTML = Object.entries(playersData).map(([group, players]) => {
    const cardsHTML = players.map(player => {
      const overall = calcOverall(player.stats, player.special, player.badge);
      const statLabels = { RIT: 'Ritmo', TIR: 'Tiro', PAS: 'Pase', REG: 'Regate', DEF: 'Defensa', FIS: 'Físico' };

      function statColor(val) {
        if (val >= 90) return '#00E676';
        if (val >= 80) return '#69F0AE';
        if (val >= 70) return '#FFD740';
        if (val >= 60) return '#FFAB40';
        return '#FF5252';
      }

      const statsHTML = Object.entries(player.stats).map(([key, val]) => `
        <div class="fifa-stat-row">
          <span class="fifa-stat-value" style="color:${statColor(val)}">${val}</span>
          <span class="fifa-stat-label">${statLabels[key] || key}</span>
          <div class="fifa-stat-bar-track">
            <div class="fifa-stat-bar-fill" style="width:${val}%;background:${statColor(val)}"></div>
          </div>
        </div>
      `).join('');

      const quoteText = player.quote || '';

      return `
        <div class="player-card" data-stats='${JSON.stringify(player.stats)}'>
          <div class="player-card-inner">
            <div class="player-card-front">
              <div class="player-card-gradient ${player.badge}"></div>
              <div class="player-overall">
                <span class="player-overall-num">${overall}</span>
                <span class="player-overall-label">OVR</span>
              </div>
              <span class="player-position-badge ${player.badge}">${player.pos}</span>
              <div class="player-photo-wrapper">
                <img src="${player.photo}" alt="${player.name}" class="player-photo" loading="lazy">
              </div>
              <div class="player-info">
                <h3 class="player-name">${player.name.toUpperCase()}</h3>
                <p class="player-role">${player.pos}</p>
              </div>
              <div class="player-mini-stats">
                ${Object.entries(player.stats).map(([key, val]) => `
                  <div class="mini-stat">
                    <span class="mini-stat-val">${val}</span>
                    <span class="mini-stat-key">${key}</span>
                  </div>
                `).join('')}
              </div>
            </div>
            <div class="player-card-back">
              <div class="player-back-header">
                <div class="player-back-overall">${overall}</div>
                <div>
                  <div class="player-back-name">${player.name.toUpperCase()}</div>
                  <div class="player-back-pos">${player.pos}</div>
                </div>
              </div>

              <div class="player-roast-quote">
                <div class="roast-icon">${QUOTE_SVG}</div>
                <p class="roast-text">${quoteText}</p>
              </div>

              <div class="player-radar-container">
                <canvas class="player-radar-canvas" width="200" height="200"></canvas>
              </div>
              <div class="player-fifa-stats">${statsHTML}</div>
              <div class="player-card-flip-hint">↻ Toca para voltear</div>
            </div>
          </div>
        </div>
      `;
    }).join('');

    return `
      <div class="position-group animate-on-scroll">
        <h3 class="position-group-title">${group.toUpperCase()}</h3>
        <div class="players-grid">${cardsHTML}</div>
      </div>
    `;
  }).join('');

  if (window._scrollObserver) {
    container.querySelectorAll('.animate-on-scroll').forEach(el => window._scrollObserver.observe(el));
  }

  setTimeout(() => drawAllRadarCharts(), 100);

  const isTouchDevice = window.matchMedia('(hover: none)').matches;
  document.querySelectorAll('.player-card').forEach(card => {
    card.addEventListener('click', () => {
      if (isTouchDevice || window.innerWidth <= 1024) {
        document.querySelectorAll('.player-card.flipped').forEach(other => {
          if (other !== card) other.classList.remove('flipped');
        });
      }
      card.classList.toggle('flipped');
    });
  });
}

// ═══════════════════════════════════════════════════════════
//  RADAR CHART
// ═══════════════════════════════════════════════════════════

function drawAllRadarCharts() {
  document.querySelectorAll('.player-card').forEach(card => {
    const canvas = card.querySelector('.player-radar-canvas');
    if (!canvas) return;
    const stats = JSON.parse(card.dataset.stats);
    drawRadarChart(canvas, stats);
  });
}

function drawRadarChart(canvas, stats) {
  const ctx = canvas.getContext('2d');
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;
  const maxRadius = 72;
  const labels = Object.keys(stats);
  const values = Object.values(stats);
  const n = labels.length;
  const angleStep = (2 * Math.PI) / n;
  const startAngle = -Math.PI / 2;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Grid rings
  for (let ring = 1; ring <= 4; ring++) {
    const r = (maxRadius / 4) * ring;
    ctx.beginPath();
    for (let i = 0; i <= n; i++) {
      const angle = startAngle + i * angleStep;
      const x = cx + r * Math.cos(angle);
      const y = cy + r * Math.sin(angle);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.strokeStyle = 'rgba(255,255,255,0.07)';
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  // Axis lines
  for (let i = 0; i < n; i++) {
    const angle = startAngle + i * angleStep;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + maxRadius * Math.cos(angle), cy + maxRadius * Math.sin(angle));
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  // Data polygon
  ctx.beginPath();
  for (let i = 0; i <= n; i++) {
    const idx = i % n;
    const angle = startAngle + idx * angleStep;
    const r = (values[idx] / 100) * maxRadius;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();

  const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxRadius);
  gradient.addColorStop(0, 'rgba(255, 215, 0, 0.35)');
  gradient.addColorStop(1, 'rgba(255, 165, 0, 0.08)');
  ctx.fillStyle = gradient;
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 215, 0, 0.7)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Data points and labels
  for (let i = 0; i < n; i++) {
    const angle = startAngle + i * angleStep;
    const r = (values[i] / 100) * maxRadius;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);

    ctx.beginPath();
    ctx.arc(x, y, 3, 0, Math.PI * 2);
    ctx.fillStyle = '#FFD700';
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1;
    ctx.stroke();

    const labelR = maxRadius + 16;
    const lx = cx + labelR * Math.cos(angle);
    const ly = cy + labelR * Math.sin(angle);
    ctx.font = '600 10px "Outfit", sans-serif';
    ctx.fillStyle = '#999';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(labels[i], lx, ly);
  }
}

// ═══════════════════════════════════════════════════════════
//  GALLERY
// ═══════════════════════════════════════════════════════════

const galleryData = [
  { src: 'img/gallery-1.png', title: 'Gol de la Victoria', date: 'Mar 2026', category: '2026' },
  { src: 'img/gallery-2.png', title: 'Celebración del Equipo', date: 'Mar 2026', category: '2026' },
  { src: 'img/gallery-3.png', title: 'Campeones Clausura', date: 'Dic 2025', category: '2025' },
  { src: 'img/gallery-4.png', title: 'Pretemporada 2026', date: 'Ene 2026', category: '2026' },
  { src: 'img/gallery-5.png', title: 'La Hinchada', date: 'Oct 2025', category: '2025' },
  { src: 'img/gallery-6.png', title: 'Clásico Amistoso', date: 'Feb 2026', category: 'amistosos' },
  { src: 'team-photo.png', title: 'Foto Oficial 2026', date: 'Ene 2026', category: '2026' },
  { src: 'hero-bg.png', title: 'Nuestro Estadio', date: '2025', category: '2025' },
];

function renderGallery(filter = 'all') {
  const grid = document.getElementById('gallery-grid');
  if (!grid) return;
  let data = filter === 'all' ? galleryData : galleryData.filter(item => item.category === filter);

  grid.innerHTML = data.map(item => `
    <div class="gallery-item" data-src="${item.src}">
      <img src="${item.src}" alt="${item.title}" loading="lazy">
      <div class="gallery-overlay">
        <p class="gallery-overlay-title">${item.title}</p>
        <p class="gallery-overlay-date">${item.date}</p>
      </div>
    </div>
  `).join('');

  document.querySelectorAll('.gallery-item').forEach(item => {
    item.addEventListener('click', () => openLightbox(item.dataset.src));
  });
}

function initGalleryFilters() {
  document.querySelectorAll('.gallery-filter').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.gallery-filter').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderGallery(btn.dataset.filter);
    });
  });
}

// ── LIGHTBOX ──
function initLightbox() {
  const lightbox = document.getElementById('lightbox');
  const closeBtn = document.getElementById('lightbox-close');
  if (!lightbox || !closeBtn) return;
  closeBtn.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeLightbox(); });
}

function openLightbox(src) {
  const lightbox = document.getElementById('lightbox');
  const img = document.getElementById('lightbox-img');
  if (!lightbox || !img) return;
  img.src = src;
  lightbox.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  const lightbox = document.getElementById('lightbox');
  if (!lightbox) return;
  lightbox.classList.remove('active');
  document.body.style.overflow = '';
}

// ═══════════════════════════════════════════════════════════
//  NAVBAR
// ═══════════════════════════════════════════════════════════

function initNavbar() {
  const navbar = document.getElementById('navbar');
  const toggle = document.getElementById('nav-toggle');
  const links = document.getElementById('nav-links');
  const overlay = document.getElementById('nav-overlay');
  if (!navbar || !toggle || !links || !overlay) return;

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 80);
    const sections = document.querySelectorAll('section[id]');
    let current = '';
    sections.forEach(section => {
      if (window.scrollY >= section.offsetTop - 120) current = section.getAttribute('id');
    });
    document.querySelectorAll('.nav-link').forEach(link => {
      link.classList.toggle('active', link.getAttribute('data-section') === current);
    });
  });

  toggle.addEventListener('click', () => {
    toggle.classList.toggle('active');
    links.classList.toggle('active');
    overlay.classList.toggle('active');
    document.body.style.overflow = links.classList.contains('active') ? 'hidden' : '';
  });

  overlay.addEventListener('click', () => {
    toggle.classList.remove('active');
    links.classList.remove('active');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  });

  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      toggle.classList.remove('active');
      links.classList.remove('active');
      overlay.classList.remove('active');
      document.body.style.overflow = '';
    });
  });
}

function initScrollAnimations() {
  window._scrollObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add('visible');
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
  document.querySelectorAll('.animate-on-scroll').forEach(el => window._scrollObserver.observe(el));
}

function initBackToTop() {
  const btn = document.getElementById('back-to-top');
  if (!btn) return;
  window.addEventListener('scroll', () => btn.classList.toggle('visible', window.scrollY > 600));
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}
