'use client';

import React, { useState, useEffect } from 'react';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 80);

      // Section tracking for active menu states
      const sections = document.querySelectorAll('section[id]');
      let current = 'hero';
      sections.forEach((section) => {
        const el = section as HTMLElement;
        if (window.scrollY >= el.offsetTop - 120) {
          current = el.getAttribute('id') || 'hero';
        }
      });
      setActiveSection(current);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
    document.body.style.overflow = !isOpen ? 'hidden' : '';
  };

  const closeMenu = () => {
    setIsOpen(false);
    document.body.style.overflow = '';
  };

  return (
    <>
      <div
        className={`nav-overlay ${isOpen ? 'active' : ''}`}
        onClick={closeMenu}
      ></div>

      <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`} id="navbar">
        <div className="container">
          <a href="#hero" className="nav-brand" onClick={closeMenu}>
            <img src="/logo.png" alt="CSD Payasutros" className="nav-logo" />
            <span className="nav-brand-text">
              CSD <span>PAYASUTROS</span>
            </span>
          </a>

          <div className={`nav-links ${isOpen ? 'active' : ''}`} id="nav-links">
            <a
              href="#hero"
              className={`nav-link ${activeSection === 'hero' ? 'active' : ''}`}
              onClick={closeMenu}
            >
              Inicio
            </a>
            <a
              href="#posiciones"
              className={`nav-link ${activeSection === 'posiciones' ? 'active' : ''}`}
              onClick={closeMenu}
            >
              Posiciones
            </a>
            <a
              href="#plantel"
              className={`nav-link ${activeSection === 'plantel' ? 'active' : ''}`}
              onClick={closeMenu}
            >
              Plantel
            </a>
            <a
              href="#fixture"
              className={`nav-link ${activeSection === 'fixture' ? 'active' : ''}`}
              onClick={closeMenu}
            >
              Fixture
            </a>
            <a
              href="#galeria"
              className={`nav-link ${activeSection === 'galeria' ? 'active' : ''}`}
              onClick={closeMenu}
            >
              Galería
            </a>
            <a href="#contacto" className="nav-cta" onClick={closeMenu}>
              Contacto
            </a>
          </div>

          <button
            className={`nav-toggle ${isOpen ? 'active' : ''}`}
            onClick={toggleMenu}
            aria-label="Menú"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </nav>
    </>
  );
}
