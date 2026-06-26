'use client';

import React from 'react';
import type { StandingDTO } from '@/lib/dto/liga-b.dto';

interface StandingsProps {
  standings: StandingDTO[] | null;
  divisionLabel: string;
  isLoading: boolean;
}

const TEAM_ID = 3250;

export default function Standings({ standings, divisionLabel, isLoading }: StandingsProps) {
  // Sort standings by points DESC, then goalDifference DESC, then goalsFor DESC
  const sortedStandings = standings
    ? [...standings].sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
        return b.goalsFor - a.goalsFor;
      })
    : [];

  return (
    <section className="section standings" id="posiciones">
      <div className="container">
        <div className="section-header">
          <div className="section-tag">Clasificación</div>
          <h2 className="section-title">TABLA DE POSICIONES</h2>
          <div className="divider"></div>
          <p className="section-subtitle" id="division-label">
            {divisionLabel}
          </p>
          <div className="live-badge" id="sync-indicator">
            <span className="live-dot"></span>Datos en vivo · Liga B
          </div>
        </div>

        <div className="standings-table-wrapper">
          {isLoading ? (
            <div className="data-error">
              <span>Cargando tabla de posiciones...</span>
            </div>
          ) : sortedStandings.length === 0 ? (
            <div className="data-error">
              <svg viewBox="0 0 24 24" width="24" height="24">
                <path
                  fill="currentColor"
                  d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"
                />
              </svg>
              <span>No se pudo cargar la clasificación de la división.</span>
            </div>
          ) : (
            <table className="standings-table" id="standings-table">
              <thead>
                <tr>
                  <th>Pos</th>
                  <th>Equipo</th>
                  <th>PJ</th>
                  <th>PG</th>
                  <th>PE</th>
                  <th>PP</th>
                  <th>GF</th>
                  <th>GC</th>
                  <th>DIF</th>
                  <th>PTS</th>
                </tr>
              </thead>
              <tbody id="standings-body">
                {sortedStandings.map((entry, idx) => {
                  const t = entry.team;
                  if (!t) return null;
                  const isPayasutros = t.id === TEAM_ID;
                  const dif = entry.goalDifference;
                  const difStr = dif > 0 ? `+${dif}` : `${dif}`;

                  return (
                    <tr key={t.id} className={isPayasutros ? 'team-highlight' : ''}>
                      <td>
                        <span className="pos">{idx + 1}</span>
                      </td>
                      <td>
                        <div className="team-name-cell">
                          {t.teamLogoUrl ? (
                            <img
                              src={t.teamLogoUrl}
                              alt=""
                              className="team-logo-small"
                              onError={(e) => {
                                (e.currentTarget as HTMLImageElement).style.display = 'none';
                              }}
                            />
                          ) : isPayasutros ? (
                            <img src="/logo.png" alt="" className="team-logo-small" />
                          ) : (
                            <div className="team-logo-placeholder"></div>
                          )}
                          <span>{t.name.trim()}</span>
                        </div>
                      </td>
                      <td>{entry.played}</td>
                      <td>{entry.won}</td>
                      <td>{entry.drawn}</td>
                      <td>{entry.lost}</td>
                      <td>{entry.goalsFor}</td>
                      <td>{entry.goalsAgainst}</td>
                      <td>{difStr}</td>
                      <td>
                        <span className="pts">{entry.points}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </section>
  );
}
