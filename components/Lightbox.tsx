'use client';

import React, { useEffect } from 'react';

interface LightboxProps {
  isOpen: boolean;
  src: string;
  onClose: () => void;
}

export default function Lightbox({ isOpen, src, onClose }: LightboxProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="lightbox active" id="lightbox" onClick={onClose}>
      <button
        className="lightbox-close"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        aria-label="Cerrar"
      >
        &times;
      </button>
      <img
        src={src}
        alt=""
        className="lightbox-img"
        id="lightbox-img"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking the image
      />
    </div>
  );
}
