'use client';

import React, { useState, useEffect } from 'react';
import type { MatchDayDTO, MatchDTO } from '@/lib/dto/liga-b.dto';

interface FixtureProps {
  matchDays: MatchDayDTO[] | null;
  groupId: number | null;
  isLoading: boolean;
}

const TEAM_ID = 3250;

function parseMatchDate(isoString: string) {
  const [datePart] = isoString.split('T');
  const [year, month, day] = datePart.split('-').map(Number);
  return { year, month: month - 1, day };
}

function buildMatchDateTime(isoDateString: string, scheduleStr?: string | null) {
  const { year, month, day } = parseMatchDate(isoDateString);
  let hours = 20, mins = 0;
  if (scheduleStr) {
    const parts = scheduleStr.split(':');
    hours = parseInt(parts[0], 10) || 20;
    mins = parseInt(parts[1] || '0', 10);
  }
  return new Date(year, month, day, hours, mins, 0, 0);
}

function formatMatchDate(isoDateString: string) {
  const { year, month, day } = parseMatchDate(isoDateString);
  const dt = new Date(year, month, day, 12, 0); // noon to bypass DST offsets
  return dt.toLocaleDateString('es-CL', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
}

interface PayasutrosMatch extends MatchDTO {
  matchDayDate: string;
  matchDayName: string;
}

export default function Fixture({ matchDays, groupId, isLoading }: FixtureProps) {
  const [filter, setFilter] = useState<'all' | 'played' | 'upcoming'>('all');
  const [matches, setMatches] = useState<PayasutrosMatch[]>([]);

  useEffect(() => {
    if (!matchDays || !Array.isArray(matchDays)) {
      setMatches([]);
      return;
    }

    const extracted: PayasutrosMatch[] = [];
    matchDays.forEach((md) => {
      if (!md.matches) return;
      md.matches.forEach((m) => {
        // Filter by the detected division group if applicable
        if (groupId && m.groupId !== groupId) return;

        if (m.homeTeamId === TEAM_ID || m.awayTeamId === TEAM_ID) {
          extracted.push({
            ...m,
            matchDayName: md.name,
            matchDayDate: md.date,
          });
        }
      });
    });

    const isPlayed = (m: PayasutrosMatch) => m.homeScore !== null && m.awayScore !== null;

    // Filter according to selection
    let filtered = [...extracted];
    if (filter === 'played') {
      filtered = extracted.filter(isPlayed);
    } else if (filter === 'upcoming') {
      filtered = extracted.filter((m) => !isPlayed(m));
    }

    // Sort order: played games descending (recent first), upcoming games ascending (next first)
    filtered.sort((a, b) => {
      const aP = isPlayed(a);
      const bP = isPlayed(b);
      if (aP && !bP) return -1;
      if (!aP && bP) return 1;
      const dA = buildMatchDateTime(a.matchDayDate, a.matchSchedule?.schedule);
      const dB = buildMatchDateTime(b.matchDayDate, b.matchSchedule?.schedule);
      return aP ? dB.getTime() - dA.getTime() : dA.getTime() - dB.getTime();
    });

    setMatches(filtered);
  }, [matchDays, filter, groupId]);

  const isPlayedMatch = (m: PayasutrosMatch) => m.homeScore !== null && m.awayScore !== null;

  return (
    <section className="section fixture" id="fixture">
      <div className="container">
        <div className="section-header">
          <div className="section-tag">Calendario</div>
          <h2 className="section-title">FIXTURE</h2>
          <div className="divider"></div>
          <p className="section-subtitle">
            Resultados y calendario completo de la temporada.
          </p>
          <div className="live-badge" style={{ marginTop: 'var(--space-md)' }}>
            <span className="live-dot"></span>Datos en vivo · Liga B
          </div>
        </div>

        <div className="fixture-tabs">
          <button
            className={`fixture-tab ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            Todos
          </button>
          <button
            className={`fixture-tab ${filter === 'played' ? 'active' : ''}`}
            onClick={() => setFilter('played')}
          >
            Jugados
          </button>
          <button
            className={`fixture-tab ${filter === 'upcoming' ? 'active' : ''}`}
            onClick={() => setFilter('upcoming')}
          >
            Próximos
          </button>
        </div>

        <div className="fixture-list" id="fixture-list">
          {isLoading ? (
            <div className="data-error">
              <span>Cargando fixture...</span>
            </div>
          ) : matches.length === 0 ? (
            <div className="data-error">
              <span>No hay partidos para mostrar.</span>
            </div>
          ) : (
            matches.map((m) => {
              const home = m.homeTeam || { id: m.homeTeamId, name: 'Equipo' };
              const away = m.awayTeam || { id: m.awayTeamId, name: 'Equipo' };
              const played = isPlayedMatch(m);
              const schedule = m.matchSchedule?.schedule || '';
              const dateStr = formatMatchDate(m.matchDayDate);
              const isHome = home.id === TEAM_ID;

              let centerHTML = null;
              let resultBadge = null;

              if (played) {
                centerHTML = (
                  <div className="fixture-score">
                    {m.homeScore} — {m.awayScore}
                  </div>
                );

                const homeScore = m.homeScore ?? 0;
                const awayScore = m.awayScore ?? 0;
                const homeWin = homeScore > awayScore;
                const draw = homeScore === awayScore;
                const payasutrosWin = (isHome && homeWin) || (!isHome && !homeWin && !draw);

                if (payasutrosWin) {
                  resultBadge = <span className="fixture-result-badge win">Victoria</span>;
                } else if (draw) {
                  resultBadge = <span className="fixture-result-badge draw">Empate</span>;
                } else {
                  resultBadge = <span className="fixture-result-badge loss">Derrota</span>;
                }
              } else {
                centerHTML = <div className="fixture-vs">VS</div>;
              }

              const homeName = (home.name || 'Equipo').trim();
              const awayName = (away.name || 'Equipo').trim();

              return (
                <div key={m.id} className={`fixture-card ${played ? 'played' : ''}`}>
                  <div className="fixture-team">
                    {home.id === TEAM_ID ? (
                      <img src="/logo.png" alt="" className="fixture-team-logo" />
                    ) : home.teamLogoUrl ? (
                      <img
                        src={home.teamLogoUrl}
                        alt=""
                        className="fixture-team-logo"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="fixture-team-logo"></div>
                    )}
                    <span
                      className="fixture-team-name"
                      style={home.id === TEAM_ID ? { color: 'var(--red-bright)' } : {}}
                    >
                      {homeName}
                    </span>
                  </div>

                  <div className="fixture-center">
                    {centerHTML}
                    <div className="fixture-date">
                      {dateStr}
                      {schedule ? ' · ' + schedule : ''}
                    </div>
                    {resultBadge}
                    {m.grounds && (
                      <div className="fixture-meta">
                        <span className="fixture-meta-item">
                          <svg viewBox="0 0 24 24">
                            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                          </svg>
                          {m.grounds}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="fixture-team away">
                    <span
                      className="fixture-team-name"
                      style={away.id === TEAM_ID ? { color: 'var(--red-bright)' } : {}}
                    >
                      {awayName}
                    </span>
                    {away.id === TEAM_ID ? (
                      <img src="/logo.png" alt="" className="fixture-team-logo" />
                    ) : away.teamLogoUrl ? (
                      <img
                        src={away.teamLogoUrl}
                        alt=""
                        className="fixture-team-logo"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="fixture-team-logo"></div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}
