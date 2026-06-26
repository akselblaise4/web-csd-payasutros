'use client';

import React, { useState } from 'react';

interface GalleryItem {
  src: string;
  title: string;
  date: string;
  category: string;
}

const galleryData: GalleryItem[] = [
  { src: '/img/gallery-1.png', title: 'Gol de la Victoria', date: 'Mar 2026', category: '2026' },
  { src: '/img/gallery-2.png', title: 'Celebración del Equipo', date: 'Mar 2026', category: '2026' },
  { src: '/img/gallery-3.png', title: 'Campeones Clausura', date: 'Dic 2025', category: '2025' },
  { src: '/img/gallery-4.png', title: 'Pretemporada 2026', date: 'Ene 2026', category: '2026' },
  { src: '/img/gallery-5.png', title: 'La Hinchada', date: 'Oct 2025', category: '2025' },
  { src: '/img/gallery-6.png', title: 'Clásico Amistoso', date: 'Feb 2026', category: 'amistosos' },
  { src: '/team-photo.png', title: 'Foto Oficial 2026', date: 'Ene 2026', category: '2026' },
  { src: '/hero-bg.png', title: 'Nuestro Estadio', date: '2025', category: '2025' },
];

interface GalleryProps {
  onSelectImage: (src: string) => void;
}

export default function Gallery({ onSelectImage }: GalleryProps) {
  const [filter, setFilter] = useState('all');

  const filteredData =
    filter === 'all'
      ? galleryData
      : galleryData.filter((item) => item.category === filter);

  return (
    <section className="section gallery" id="galeria">
      <div className="container">
        <div className="section-header">
          <div className="section-tag">Multimedia</div>
          <h2 className="section-title">GALERÍA HISTÓRICA</h2>
          <div className="divider"></div>
          <p className="section-subtitle">
            Los mejores momentos del club a lo largo de su historia.
          </p>
        </div>

        <div className="gallery-filters" id="gallery-filters">
          <button
            className={`gallery-filter ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            Todas
          </button>
          <button
            className={`gallery-filter ${filter === '2026' ? 'active' : ''}`}
            onClick={() => setFilter('2026')}
          >
            Temporada 2026
          </button>
          <button
            className={`gallery-filter ${filter === '2025' ? 'active' : ''}`}
            onClick={() => setFilter('2025')}
          >
            Temporada 2025
          </button>
          <button
            className={`gallery-filter ${filter === 'amistosos' ? 'active' : ''}`}
            onClick={() => setFilter('amistosos')}
          >
            Amistosos
          </button>
        </div>

        <div className="gallery-grid" id="gallery-grid">
          {filteredData.map((item) => (
            <div
              key={item.src}
              className="gallery-item"
              onClick={() => onSelectImage(item.src)}
            >
              <img src={item.src} alt={item.title} loading="lazy" />
              <div className="gallery-overlay">
                <p className="gallery-overlay-title">{item.title}</p>
                <p className="gallery-overlay-date">{item.date}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
