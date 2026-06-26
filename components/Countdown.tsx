'use client';

import React, { useState, useEffect } from 'react';

interface CountdownProps {
  targetDate: Date | null;
  isLive: boolean;
}

export default function Countdown({ targetDate, isLive }: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: '--',
    hours: '--',
    minutes: '--',
    seconds: '--',
  });

  useEffect(() => {
    if (!targetDate || isLive) {
      return;
    }

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
  }, [targetDate, isLive]);

  // Case 1: Match is currently live (in progress)
  if (isLive) {
    return (
      <div className="countdown-live-container">
        <div className="countdown-live-badge">
          <span className="live-dot-pulsate"></span>
          <span>PARTIDO EN JUEGO</span>
        </div>
      </div>
    );
  }

  // Case 2: No upcoming match is scheduled yet
  if (!targetDate) {
    return (
      <div className="countdown-pending-container">
        <span className="countdown-pending-text">PRÓXIMO PARTIDO POR DEFINIR</span>
      </div>
    );
  }

  // Case 3: Regular countdown to upcoming match
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
