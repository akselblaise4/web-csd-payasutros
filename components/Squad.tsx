'use client';

import React, { useState, useEffect, useRef } from 'react';

interface PlayerStats {
  RIT: number;
  TIR: number;
  PAS: number;
  REG: number;
  DEF: number;
  FIS: number;
  [key: string]: number;
}

interface Player {
  name: string;
  pos: string;
  badge: string;
  photo: string;
  stats: PlayerStats;
  special?: Record<string, number>;
  quote: string;
}

const playersData: Record<string, Player[]> = {
  Arquero: [
    {
      name: 'CP8',
      pos: 'Arquero',
      badge: 'gk',
      photo: 'img/plantel/CP8_Arquero.jpeg',
      stats: { RIT: 78, TIR: 55, PAS: 84, REG: 65, DEF: 70, FIS: 93 },
      special: { reflejos: 87, posicion: 86, saque: 88 },
      quote: '"Reacciona tan tarde que todavía está atajando el partido pasado."',
    },
  ],
  Defensas: [
    {
      name: 'Pancho',
      pos: 'Defensa Central',
      badge: 'def',
      photo: 'img/plantel/Pancho_Defensa.jpg',
      stats: { RIT: 85, TIR: 78, PAS: 88, REG: 82, DEF: 95, FIS: 94 },
      special: { marcaje: 96, entrada: 94, cabeceo: 92 },
      quote: '"Sale jugando y el equipo reza."',
    },
    {
      name: 'Piperfecto',
      pos: 'Defensa Central',
      badge: 'def',
      photo: 'img/plantel/Piperfecto_Defensa.jpeg',
      stats: { RIT: 99, TIR: 99, PAS: 99, REG: 99, DEF: 99, FIS: 99 },
      special: { marcaje: 99, entrada: 99, cabeceo: 99 },
      quote: '"Como jugador un muro, como DT un papel."',
    },
  ],
  Laterales: [
    {
      name: '7 Pulmones',
      pos: 'Lateral',
      badge: 'lat',
      photo: 'img/plantel/7 pulmones_Lateral.jpeg',
      stats: { RIT: 94, TIR: 82, PAS: 89, REG: 86, DEF: 85, FIS: 95 },
      special: { resistencia: 99, desborde: 94, centro: 91 },
      quote: '"Tiene más lesiones que finales."',
    },
    {
      name: 'Vicho',
      pos: 'Lateral',
      badge: 'lat',
      photo: 'img/plantel/Vicho_Lateral.jpg',
      stats: { RIT: 88, TIR: 75, PAS: 84, REG: 83, DEF: 84, FIS: 96 },
      special: { resistencia: 94, desborde: 91, centro: 88 },
      quote: '"Sube y baja por la banda como si la cancha fuera un ascensor y él el único botón."',
    },
  ],
  Mediocampistas: [
    {
      name: 'Capi',
      pos: 'Mediocampista',
      badge: 'mid',
      photo: 'img/plantel/Capi_Medio.jpg',
      stats: { RIT: 85, TIR: 88, PAS: 95, REG: 94, DEF: 84, FIS: 90 },
      special: { vision: 97, liderazgo: 99, pasesClave: 96 },
      quote: '"Capitán, usted no marca… deja huellas."',
    },
    {
      name: 'Paul Walker',
      pos: 'Mediocampista',
      badge: 'mid',
      photo: 'img/plantel/Paul Walker_Medio.jpg',
      stats: { RIT: 92, TIR: 76, PAS: 88, REG: 85, DEF: 82, FIS: 87 },
      special: { vision: 92, regate: 90, pasesClave: 89 },
      quote: '"Centra, corre, mete… pero definir no está en el pack."',
    },
    {
      name: 'Rigoat',
      pos: 'Mediocampista',
      badge: 'mid',
      photo: 'img/plantel/Rigoat_Medio.jpeg',
      stats: { RIT: 82, TIR: 89, PAS: 93, REG: 88, DEF: 78, FIS: 86 },
      special: { vision: 93, disparo: 94, pasesClave: 90 },
      quote: '"Toca de primera… y se queda sin aire de segunda."',
    },
  ],
  Delanteros: [
    {
      name: 'Matucrack',
      pos: 'Delantero',
      badge: 'fwd',
      photo: 'img/plantel/Matucrack_Delantero.jpg',
      stats: { RIT: 96, TIR: 96, PAS: 89, REG: 94, DEF: 70, FIS: 95 },
      special: { definicion: 98, posicion: 96, velocidad: 95 },
      quote: '"Se llama Matucrack y la verdad... no miente. Aunque celebra goles de tercer tiempo también."',
    },
    {
      name: 'Rey',
      pos: 'Delantero',
      badge: 'fwd',
      photo: 'img/plantel/Rey_Delantero.jpg',
      stats: { RIT: 92, TIR: 95, PAS: 85, REG: 91, DEF: 60, FIS: 93 },
      special: { definicion: 95, potencia: 93, cabeceo: 92 },
      quote: '"Te insulta 90 minutos… y te vacuna en uno."',
    },
    {
      name: 'Wladimilf',
      pos: 'Delantero',
      badge: 'fwd',
      photo: 'img/plantel/Wladimilf_Delantero.jpeg',
      stats: { RIT: 95, TIR: 94, PAS: 88, REG: 92, DEF: 65, FIS: 94 },
      special: { definicion: 96, regate: 95, desborde: 93 },
      quote: '"Con ese porte debería hacer goles… pero hace sombra."',
    },
  ],
};

const QUOTE_SVG = (
  <svg
    viewBox="0 0 24 24"
    width="20"
    height="20"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V21z" />
    <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25 0 2 2 2h.75c0 2.25.25 4-2.75 5v3z" />
  </svg>
);

function calcOverall(stats: PlayerStats, special?: Record<string, number>, badge?: string) {
  if (badge === 'gk' && special) {
    const specVals = Object.values(special);
    return Math.round(specVals.reduce((a, b) => a + b, 0) / specVals.length);
  }
  const vals = Object.values(stats);
  return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
}

function PlayerCard({ player }: { player: Player }) {
  const [isFlipped, setIsFlipped] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const overall = calcOverall(player.stats, player.special, player.badge);

  const drawRadarChart = (canvas: HTMLCanvasElement, stats: PlayerStats) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
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
  };

  useEffect(() => {
    if (canvasRef.current) {
      drawRadarChart(canvasRef.current, player.stats);
    }
  }, [isFlipped, player.stats]);

  const statLabels: Record<string, string> = {
    RIT: 'Ritmo',
    TIR: 'Tiro',
    PAS: 'Pase',
    REG: 'Regate',
    DEF: 'Defensa',
    FIS: 'Físico',
  };

  const statColor = (val: number) => {
    if (val >= 90) return '#00E676';
    if (val >= 80) return '#69F0AE';
    if (val >= 70) return '#FFD740';
    if (val >= 60) return '#FFAB40';
    return '#FF5252';
  };

  return (
    <div
      className={`player-card ${isFlipped ? 'flipped' : ''}`}
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <div className="player-card-inner">
        {/* Front of Card */}
        <div className="player-card-front">
          <div className={`player-card-gradient ${player.badge}`}></div>
          <div className="player-overall">
            <span className="player-overall-num">{overall}</span>
            <span className="player-overall-label">OVR</span>
          </div>
          <span className={`player-position-badge ${player.badge}`}>{player.pos}</span>
          <div className="player-photo-wrapper">
            <img
              src={player.photo}
              alt={player.name}
              className="player-photo"
              loading="lazy"
            />
          </div>
          <div className="player-info">
            <h3 className="player-name">{player.name.toUpperCase()}</h3>
            <p className="player-role">{player.pos}</p>
          </div>
          <div className="player-mini-stats">
            {Object.entries(player.stats).map(([key, val]) => (
              <div key={key} className="mini-stat">
                <span className="mini-stat-val">{val}</span>
                <span className="mini-stat-key">{key}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Back of Card */}
        <div className="player-card-back">
          <div className="player-back-header">
            <div className="player-back-overall">{overall}</div>
            <div>
              <div className="player-back-name">{player.name.toUpperCase()}</div>
              <div className="player-back-pos">{player.pos}</div>
            </div>
          </div>

          <div className="player-roast-quote">
            <div className="roast-icon">{QUOTE_SVG}</div>
            <p className="roast-text">{player.quote}</p>
          </div>

          <div className="player-radar-container">
            <canvas
              ref={canvasRef}
              className="player-radar-canvas"
              width="200"
              height="200"
            ></canvas>
          </div>

          <div className="player-fifa-stats">
            {Object.entries(player.stats).map(([key, val]) => (
              <div key={key} className="fifa-stat-row">
                <span className="fifa-stat-value" style={{ color: statColor(val) }}>
                  {val}
                </span>
                <span className="fifa-stat-label">{statLabels[key] || key}</span>
                <div className="fifa-stat-bar-track">
                  <div
                    className="fifa-stat-bar-fill"
                    style={{ width: `${val}%`, background: statColor(val) }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
          <div className="player-card-flip-hint">↻ Toca para voltear</div>
        </div>
      </div>
    </div>
  );
}

export default function Squad() {
  return (
    <section className="section plantel" id="plantel">
      <div className="container">
        <div className="section-header">
          <div className="section-tag">Nuestro Equipo</div>
          <h2 className="section-title">EL PLANTEL</h2>
          <div className="divider"></div>
          <p className="section-subtitle">
            Conocé a cada jugador. Pasá el cursor o tocá la tarjeta para ver sus
            estadísticas FIFA.
          </p>
        </div>

        <div id="plantel-container">
          {Object.entries(playersData).map(([group, players]) => (
            <div key={group} className="position-group">
              <h3 className="position-group-title">{group.toUpperCase()}</h3>
              <div className="players-grid">
                {players.map((player) => (
                  <PlayerCard key={player.name} player={player} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
