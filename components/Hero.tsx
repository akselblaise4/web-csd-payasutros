'use client';

import React from 'react';
import Countdown from './Countdown';

interface HeroProps {
  targetDate: Date | null;
  isLive: boolean;
  nextMatchLabel: string;
}

export default function Hero({ targetDate, isLive, nextMatchLabel }: HeroProps) {
  return (
    <section className="hero" id="hero">
      <div className="hero-bg">
        <img src="/hero-bg.png" alt="Estadio Rinconada" />
      </div>

      <div className="hero-content">
        <div className="hero-badge">
          <span className="dot"></span>
          Temporada 2026
        </div>

        <img src="/logo.png" alt="Escudo CSD Payasutros" className="hero-logo" />

        <h1 className="hero-title">PAYASUTROS</h1>
        <p className="hero-subtitle">Club Social y Deportivo</p>

        <div className="countdown-wrapper">
          <p className="countdown-label">Próximo Partido</p>
          <p
            className="countdown-match"
            dangerouslySetInnerHTML={{ __html: nextMatchLabel }}
          ></p>
          <Countdown targetDate={targetDate} isLive={isLive} />
        </div>
      </div>

      <div className="hero-scroll">
        <span>Scroll</span>
        <div className="scroll-line"></div>
      </div>
    </section>
  );
}
