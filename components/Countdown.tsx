'use client';

import React, { useState, useEffect } from 'react';
import type { MatchDayDTO } from '@/lib/dto/liga-b.dto';

interface CountdownProps {
  matchDays: MatchDayDTO[] | null;
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

export default function Countdown({ matchDays }: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: '--',
    hours: '--',
    minutes: '--',
    seconds: '--',
  });
  const [hasMatch, setHasMatch] = useState(true);

  useEffect(() => {
    if (!matchDays || !Array.isArray(matchDays) || matchDays.length === 0) {
      setHasMatch(false);
      return;
    }

    // Extract upcoming matches
    const matches: Array<{ date: string; schedule?: string | null }> = [];
    matchDays.forEach((md) => {
      if (!md.matches) return;
      md.matches.forEach((m) => {
        if (m.homeTeamId === TEAM_ID || m.awayTeamId === TEAM_ID) {
          // Only upcoming (unplayed) matches
          if (m.homeScore === null && m.awayScore === null) {
            matches.push({
              date: md.date,
              schedule: m.matchSchedule?.schedule,
            });
          }
        }
      });
    });

    const upcoming = matches
      .map((m) => ({
        targetDate: buildMatchDateTime(m.date, m.schedule),
      }))
      .filter((m) => m.targetDate > new Date())
      .sort((a, b) => a.targetDate.getTime() - b.targetDate.getTime());

    if (upcoming.length === 0) {
      setHasMatch(false);
      return;
    }

    setHasMatch(true);
    const targetDate = upcoming[0].targetDate;

    const tick = () => {
      const diff = targetDate.getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft({ days: '00', hours: '00', minutes: '00', seconds: '00' });
        return;
      }

      const d = Math.floor(diff / 864e5);
      const h = Math.floor((diff % 864e5) / 36e5);
      const m = Math.floor((diff % 36e5) / 6e4);
      const s = Math.floor((diff % 6e4) / 1000);

      setTimeLeft({
        days: String(d).padStart(2, '0'),
        hours: String(h).padStart(2, '0'),
        minutes: String(m).padStart(2, '0'),
        seconds: String(s).padStart(2, '0'),
      });
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [matchDays]);

  if (!hasMatch) {
    return (
      <div className="countdown">
        <div className="countdown-item">
          <div className="countdown-value">--</div>
          <span className="countdown-unit">Días</span>
        </div>
        <span className="countdown-separator">:</span>
        <div className="countdown-item">
          <div className="countdown-value">--</div>
          <span className="countdown-unit">Horas</span>
        </div>
        <span className="countdown-separator">:</span>
        <div className="countdown-item">
          <div className="countdown-value">--</div>
          <span className="countdown-unit">Min</span>
        </div>
        <span className="countdown-separator">:</span>
        <div className="countdown-item">
          <div className="countdown-value">--</div>
          <span className="countdown-unit">Seg</span>
        </div>
      </div>
    );
  }

  return (
    <div className="countdown" id="countdown">
      <div className="countdown-item">
        <div className="countdown-value" id="cd-days">
          {timeLeft.days}
        </div>
        <span className="countdown-unit">Días</span>
      </div>
      <span className="countdown-separator">:</span>
      <div className="countdown-item">
        <div className="countdown-value" id="cd-hours">
          {timeLeft.hours}
        </div>
        <span className="countdown-unit">Horas</span>
      </div>
      <span className="countdown-separator">:</span>
      <div className="countdown-item">
        <div className="countdown-value" id="cd-mins">
          {timeLeft.minutes}
        </div>
        <span className="countdown-unit">Min</span>
      </div>
      <span className="countdown-separator">:</span>
      <div className="countdown-item">
        <div className="countdown-value" id="cd-secs">
          {timeLeft.seconds}
        </div>
        <span className="countdown-unit">Seg</span>
      </div>
    </div>
  );
}
