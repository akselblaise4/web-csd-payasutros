'use client';

import React from 'react';

interface SyncOverlayProps {
  status: 'syncing' | 'live' | 'cached' | 'error';
}

export default function SyncOverlay({ status }: SyncOverlayProps) {
  if (status !== 'syncing') return null;

  return (
    <div id="sync-overlay" className="sync-overlay">
      <div className="sync-spinner"></div>
      <span>Sincronizando datos...</span>
    </div>
  );
}
