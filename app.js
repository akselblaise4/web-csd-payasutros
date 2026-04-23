/* ═══════════════════════════════════════════════════════════ */
/*  CSD PAYASUTROS — INTERACTIVE ENGINE v3.0                  */
/*  Auto-detects division · Live API · Premium Dark Mode      */
/* ═══════════════════════════════════════════════════════════ */

// ── CONFIGURATION ──
const TEAM_NAME = 'CSD Payasutros';
const TEAM_ID = 3250;
const STAGE_ID = 395;
const LEAGUE_ID = 27;
const FETCH_TIMEOUT = 12000;

// Runtime: will be detected dynamically
let CURRENT_GROUP_ID = null;
let CURRENT_GROUP_NAME = '';

// ── FILE:// PROTOCOL GUARD ──
if (window.location.protocol === 'file:') {
  document.addEventListener('DOMContentLoaded', () => {
    const hero = document.querySelector('.hero-content');
    if (hero) {
      const banner = document.createElement('div');
      banner.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:99999;background:#D4213D;color:#fff;text-align:center;padding:14px 20px;font-family:system-ui;font-size:0.95rem;font-weight:600;letter-spacing:0.5px;box-shadow:0 4px 20px rgba(0,0,0,0.5);';
      banner.innerHTML = '⚠️ Para ver datos en vivo, abre la página desde <strong style="text-decoration:underline">http://localhost:3000</strong> con el servidor corriendo (node server.js)';
      document.body.prepend(banner);
    }
  });
}

// ── DATA: PLAYERS (real plantel with photos) ──
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

// ── ROAST QUOTE ICON SVG ──
const QUOTE_SVG = `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V21z"/><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 5v3z"/></svg>`;

// Calculate overall rating from stats (GK uses special stats for true rating)
function calcOverall(stats, special, badge) {
  if (badge === 'gk' && special) {
    const specVals = Object.values(special);
    return Math.round(specVals.reduce((a, b) => a + b, 0) / specVals.length);
  }
  const vals = Object.values(stats);
  return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
}

// ── DATA: GALLERY (static) ──
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

// ═══════════════════════════════════════════════════════════
//  FETCH WITH TIMEOUT
// ═══════════════════════════════════════════════════════════

async function fetchWithTimeout(url, timeout = FETCH_TIMEOUT) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    const resp = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    return await resp.json();
  } catch (err) {
    clearTimeout(timer);
    console.error(`Fetch error for ${url}:`, err.message);
    return null;
  }
}

// ═══════════════════════════════════════════════════════════
//  AUTO-DETECT GROUP (DIVISION)
//  Scans ALL groups in the stage to find Payasutros
// ═══════════════════════════════════════════════════════════

async function detectPayasutrosGroup() {
  // 1. Get all groups (divisions) in the current stage
  const groups = await fetchWithTimeout(`/api/groups/${STAGE_ID}`);
  if (!groups || !Array.isArray(groups) || groups.length === 0) {
    console.error('Could not fetch groups');
    return null;
  }

  console.log(`[AUTO] Found ${groups.length} divisions:`, groups.map(g => g.name).join(', '));

  // 2. Check standings of each group to find Payasutros
  for (const group of groups) {
    const standings = await fetchWithTimeout(`/api/standings/${group.id}`);
    if (!standings || !Array.isArray(standings)) continue;

    const found = standings.find(entry => entry.team && entry.team.id === TEAM_ID);
    if (found) {
      CURRENT_GROUP_ID = group.id;
      CURRENT_GROUP_NAME = group.name;
      console.log(`[AUTO] ✅ ${TEAM_NAME} found in ${group.name} (Group ID: ${group.id})`);
      return { group, standings };
    }
  }

  console.error(`[AUTO] ❌ ${TEAM_NAME} not found in any division`);
  return null;
}

// ═══════════════════════════════════════════════════════════
//  INITIALIZATION
// ═══════════════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {
  if (window.location.protocol === 'file:') return; // don't try API calls from file://

  initLoader();
  initNavbar();
  initScrollAnimations();
  initBackToTop();
  initLightbox();
  initGalleryFilters();

  renderPlayers();
  renderGallery();

  // Load live data — detect group first, then load everything
  loadAllLiveData();
});

async function loadAllLiveData() {
  // Step 1: Detect which division Payasutros is in
  const detection = await detectPayasutrosGroup();

  if (detection) {
    // Step 2: Render standings from the detected group
    renderStandings(detection.standings);
    updateDivisionLabel(CURRENT_GROUP_NAME);

    // Step 3: Load fixtures independently
    loadFixtures();
  } else {
    showDataError('standings-body', 'No se pudo detectar la división de CSD Payasutros.');
    showDataError('fixture-list', 'No se pudo cargar el fixture.');
  }
}

async function loadFixtures() {
  try {
    const data = await fetchWithTimeout(`/api/match-days/${STAGE_ID}`);
    if (data && Array.isArray(data) && data.length > 0) {
      window._matchDays = data;
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

function updateDivisionLabel(divisionName) {
  const subtitle = document.querySelector('#posiciones .section-subtitle');
  if (subtitle) {
    subtitle.textContent = `Liga B+ Jueves Rinconada · Apertura 2026 · ${divisionName}`;
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

  const sorted = [...data].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
    return b.goalsFor - a.goalsFor;
  });

  tbody.innerHTML = sorted.map((entry, idx) => {
    const t = entry.team;
    if (!t) return '';
    const isPayasutros = t.id === TEAM_ID;
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
//  FIXTURE — LIVE DATA (uses CURRENT_GROUP_ID detected)
// ═══════════════════════════════════════════════════════════

function extractPayasutrosMatches(matchDays) {
  const matches = [];
  if (!Array.isArray(matchDays)) return matches;

  matchDays.forEach(md => {
    if (!md.matches || !Array.isArray(md.matches)) return;
    md.matches.forEach(m => {
      // Filter by the DETECTED group (dynamic!)
      if (CURRENT_GROUP_ID && m.groupId !== CURRENT_GROUP_ID) return;
      if (m.homeTeamId === TEAM_ID || m.awayTeamId === TEAM_ID) {
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
    const dA = new Date(a.matchDayDate);
    const dB = new Date(b.matchDayDate);
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
    const matchDate = new Date(m.matchDayDate);
    const schedule = m.matchSchedule ? m.matchSchedule.schedule : '';
    const dateStr = matchDate.toLocaleDateString('es-CL', { weekday: 'short', day: 'numeric', month: 'short' });

    const isHome = home.id === TEAM_ID;
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
          ${home.id === TEAM_ID
            ? '<img src="logo.png" alt="" class="fixture-team-logo">'
            : homeLogoUrl
              ? `<img src="${homeLogoUrl}" alt="" class="fixture-team-logo" onerror="this.style.display='none'">`
              : '<div class="fixture-team-logo"></div>'
          }
          <span class="fixture-team-name" ${home.id === TEAM_ID ? 'style="color:var(--red-bright)"' : ''}>${homeName}</span>
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
          <span class="fixture-team-name" ${away.id === TEAM_ID ? 'style="color:var(--red-bright)"' : ''}>${awayName}</span>
          ${away.id === TEAM_ID
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
    tab.addEventListener('click', () => {
      document.querySelectorAll('.fixture-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      if (window._matchDays) {
        renderFixture(window._matchDays, tab.dataset.filter);
      }
    });
  });
}

// ═══════════════════════════════════════════════════════════
//  COUNTDOWN
// ═══════════════════════════════════════════════════════════

function updateCountdown(matchDays) {
  const matches = extractPayasutrosMatches(matchDays);

  const upcoming = matches
    .filter(m => m.homeScore === null && m.awayScore === null)
    .map(m => {
      const base = new Date(m.matchDayDate);
      const year = base.getUTCFullYear();
      const month = base.getUTCMonth();
      const day = base.getUTCDate();
      let hours = 20, mins = 0;
      if (m.matchSchedule && m.matchSchedule.schedule) {
        const parts = m.matchSchedule.schedule.split(':');
        hours = parseInt(parts[0], 10);
        mins = parseInt(parts[1] || '0', 10);
      }
      return { ...m, targetDate: new Date(year, month, day, hours, mins, 0, 0) };
    })
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
  setInterval(tick, 1000);
}

function updateHeroNextMatch(matchDays) {
  const matches = extractPayasutrosMatches(matchDays);

  const upcoming = matches
    .filter(m => m.homeScore === null && m.awayScore === null)
    .map(m => {
      const base = new Date(m.matchDayDate);
      let hours = 20, mins = 0;
      if (m.matchSchedule && m.matchSchedule.schedule) {
        const parts = m.matchSchedule.schedule.split(':');
        hours = parseInt(parts[0], 10);
        mins = parseInt(parts[1] || '0', 10);
      }
      return { ...m, targetDate: new Date(base.getUTCFullYear(), base.getUTCMonth(), base.getUTCDate(), hours, mins, 0, 0) };
    })
    .filter(m => m.targetDate > new Date())
    .sort((a, b) => a.targetDate - b.targetDate);

  const matchLabel = document.querySelector('.countdown-match');
  if (upcoming.length > 0 && matchLabel) {
    const next = upcoming[0];
    const opponentTeam = next.homeTeamId === TEAM_ID ? next.awayTeam : next.homeTeam;
    const opponentName = opponentTeam ? opponentTeam.name.trim() : 'Rival';
    const isHome = next.homeTeamId === TEAM_ID;
    matchLabel.innerHTML = `<strong>${TEAM_NAME}</strong> ${isHome ? 'vs' : '@'} ${opponentName}`;
  } else if (matchLabel) {
    matchLabel.innerHTML = `<strong>${TEAM_NAME}</strong> — Esperando fixture`;
  }
}

// ═══════════════════════════════════════════════════════════
//  PLAYERS
// ═══════════════════════════════════════════════════════════

function renderPlayers() {
  const container = document.getElementById('plantel-container');
  if (!container) return;

  // Unified premium gold for all OVR
  const OVR_COLOR = '#FFD700';

  container.innerHTML = Object.entries(playersData).map(([group, players]) => {
    const cardsHTML = players.map(player => {
      const overall = calcOverall(player.stats, player.special, player.badge);
      const statLabels = { RIT: 'Ritmo', TIR: 'Tiro', PAS: 'Pase', REG: 'Regate', DEF: 'Defensa', FIS: 'Físico' };

      // Stat color based on value
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

  // Re-observe dynamically created elements for scroll animation
  if (window._scrollObserver) {
    container.querySelectorAll('.animate-on-scroll').forEach(el => window._scrollObserver.observe(el));
  }

  // Draw radar charts on all cards
  setTimeout(() => drawAllRadarCharts(), 100);

  // Touch/click support for card flip
  const isTouchDevice = window.matchMedia('(hover: none)').matches;

  document.querySelectorAll('.player-card').forEach(card => {
    card.addEventListener('click', () => {
      if (isTouchDevice || window.innerWidth <= 1024) {
        // Close other flipped cards on mobile
        document.querySelectorAll('.player-card.flipped').forEach(other => {
          if (other !== card) other.classList.remove('flipped');
        });
      }
      card.classList.toggle('flipped');
    });
  });
}

// Draw hexagonal radar chart on canvas
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

  // Clear
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw grid rings
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

  // Draw axis lines
  for (let i = 0; i < n; i++) {
    const angle = startAngle + i * angleStep;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + maxRadius * Math.cos(angle), cy + maxRadius * Math.sin(angle));
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  // Draw data polygon
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

  // Fill with gold gradient
  const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxRadius);
  gradient.addColorStop(0, 'rgba(255, 215, 0, 0.35)');
  gradient.addColorStop(1, 'rgba(255, 165, 0, 0.08)');
  ctx.fillStyle = gradient;
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 215, 0, 0.7)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Draw data points and labels
  for (let i = 0; i < n; i++) {
    const angle = startAngle + i * angleStep;
    const r = (values[i] / 100) * maxRadius;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);

    // Point
    ctx.beginPath();
    ctx.arc(x, y, 3, 0, Math.PI * 2);
    ctx.fillStyle = '#FFD700';
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Label
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

function formatStatLabel(key) {
  const labels = {
    RIT: 'Ritmo', TIR: 'Tiro', PAS: 'Pase', REG: 'Regate',
    DEF: 'Defensa', FIS: 'Físico',
  };
  return labels[key] || key;
}

// ═══════════════════════════════════════════════════════════
//  GALLERY
// ═══════════════════════════════════════════════════════════

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
