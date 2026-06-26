'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Standings from '@/components/Standings';
import Squad from '@/components/Squad';
import Fixture from '@/components/Fixture';
import Gallery from '@/components/Gallery';
import Footer from '@/components/Footer';
import SyncOverlay from '@/components/SyncOverlay';
import Lightbox from '@/components/Lightbox';

import type { StandingDTO, MatchDayDTO } from '@/lib/dto/liga-b.dto';

const CONFIG = {
  TEAM_NAME: 'CSD Payasutros',
  TEAM_ID: 3250,
  LEAGUE_ID: 27,
  REFRESH_INTERVAL: 5 * 60 * 1000, // 5 minutes
};

const CACHE_PREFIX = 'payasutros_';
const CACHE_MAX_AGE = 30 * 60 * 1000; // 30 min max age

const LocalCache = {
  get(name: string) {
    if (typeof window === 'undefined') return null;
    try {
      const raw = localStorage.getItem(CACHE_PREFIX + name);
      if (!raw) return null;
      const entry = JSON.parse(raw);
      if (Date.now() - entry.ts > CACHE_MAX_AGE) {
        localStorage.removeItem(CACHE_PREFIX + name);
        return null;
      }
      return entry.data;
    } catch {
      return null;
    }
  },
  set(name: string, data: unknown) {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(
        CACHE_PREFIX + name,
        JSON.stringify({ data, ts: Date.now() })
      );
    } catch (e) {
      console.warn('[Cache] LocalStorage full, ignoring write');
    }
  },
};

// Check for division movements (ascent/descent)
const DivisionAlert = {
  check(newGroupId: number, newGroupName: string) {
    try {
      const prev = localStorage.getItem(CACHE_PREFIX + 'last_division');
      if (prev) {
        const prevData = JSON.parse(prev);
        if (prevData.groupId !== newGroupId) {
          const event = {
            timestamp: new Date().toISOString(),
            team: CONFIG.TEAM_NAME,
            from: { groupId: prevData.groupId, name: prevData.groupName },
            to: { groupId: newGroupId, name: newGroupName },
            type: 'DIVISION_CHANGE',
          };
          console.log('🚨 [DIVISION CHANGE DETECTED]', event);
          // Webhook notification hook ready
        }
      }
      localStorage.setItem(
        CACHE_PREFIX + 'last_division',
        JSON.stringify({ groupId: newGroupId, groupName: newGroupName })
      );
    } catch (e) {
      console.warn('[DivisionAlert] Error checking division change:', e);
    }
  },
};

export default function Home() {
  const [showLoader, setShowLoader] = useState(true);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  // Live state
  const [stageId, setStageId] = useState<number | null>(null);
  const [groupId, setGroupId] = useState<number | null>(null);
  const [groupName, setGroupName] = useState<string>('');
  const [seasonName, setSeasonName] = useState<string>('');
  const [leagueName, setLeagueName] = useState<string>('');
  const [standings, setStandings] = useState<StandingDTO[] | null>(null);
  const [matchDays, setMatchDays] = useState<MatchDayDTO[] | null>(null);

  const [syncStatus, setSyncStatus] = useState<'syncing' | 'live' | 'cached' | 'error'>('syncing');
  const [isLoading, setIsLoading] = useState(true);

  // Hide loader initial timeout
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoader(false);
    }, 1800);
    return () => clearTimeout(timer);
  }, []);

  // Back to top scroll listener
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 600);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch helper with timeout
  const fetchWithTimeout = async (url: string, timeout = 12000): Promise<Response> => {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(id);
    return response;
  };

  const loadAllLiveData = async () => {
    setSyncStatus('syncing');
    setIsLoading(true);

    try {
      // Step 1: Detect team location dynamically
      const tournamentsResp = await fetchWithTimeout(`/api/tournaments/${CONFIG.LEAGUE_ID}`);
      if (!tournamentsResp.ok) throw new Error('Failed to fetch tournaments');
      const tournaments = await tournamentsResp.json();

      if (!Array.isArray(tournaments) || tournaments.length === 0) {
        throw new Error('No tournaments available');
      }

      // Sort recent first
      const sortedTournaments = [...tournaments].sort((a, b) => b.id - a.id);
      let foundLocation = null;

      for (const tournament of sortedTournaments) {
        const stages = tournament.stages || [];
        const sortedStages = [...stages].sort((a, b) => b.id - a.id);

        for (const stage of sortedStages) {
          const groupsResp = await fetchWithTimeout(`/api/groups/${stage.id}`);
          if (!groupsResp.ok) continue;
          const groups = await groupsResp.json();

          if (!Array.isArray(groups)) continue;

          for (const group of groups) {
            const standingsResp = await fetchWithTimeout(`/api/standings/${group.id}`);
            if (!standingsResp.ok) continue;
            const standingsData: StandingDTO[] = await standingsResp.json();

            if (!Array.isArray(standingsData)) continue;

            const found = standingsData.find(
              (entry) => entry.team && entry.team.id === CONFIG.TEAM_ID
            );

            if (found) {
              foundLocation = {
                stageId: stage.id,
                groupId: group.id,
                groupName: group.name,
                seasonName: tournament.name || '',
                leagueName: 'Liga B+ Jueves Rinconada',
                standings: standingsData,
              };
              break;
            }
          }
          if (foundLocation) break;
        }
        if (foundLocation) break;
      }

      if (foundLocation) {
        // Update detected location state
        setStageId(foundLocation.stageId);
        setGroupId(foundLocation.groupId);
        setGroupName(foundLocation.groupName);
        setSeasonName(foundLocation.seasonName);
        setLeagueName(foundLocation.leagueName);
        setStandings(foundLocation.standings);

        LocalCache.set('last_standings', foundLocation.standings);
        LocalCache.set('last_location', {
          stageId: foundLocation.stageId,
          groupId: foundLocation.groupId,
          groupName: foundLocation.groupName,
          seasonName: foundLocation.seasonName,
          leagueName: foundLocation.leagueName,
        });

        // Trigger division change alert verification
        DivisionAlert.check(foundLocation.groupId, foundLocation.groupName);

        // Step 2: Fetch fixtures for the active stage
        const matchDaysResp = await fetchWithTimeout(`/api/match-days/${foundLocation.stageId}`);
        if (matchDaysResp.ok) {
          const matchDaysData: MatchDayDTO[] = await matchDaysResp.json();
          setMatchDays(matchDaysData);
          LocalCache.set('last_matchdays', matchDaysData);
        }

        setSyncStatus('live');
      } else {
        throw new Error('Team location not detected in active divisions');
      }
    } catch (err) {
      console.warn('[Sync] Sync failed, reading from cache fallback:', err);
      // Load from LocalCache as fallback
      const cachedStandings = LocalCache.get('last_standings') as StandingDTO[] | null;
      const cachedMatchdays = LocalCache.get('last_matchdays') as MatchDayDTO[] | null;
      const cachedLocation = LocalCache.get('last_location') as {
        stageId: number;
        groupId: number;
        groupName: string;
        seasonName: string;
        leagueName: string;
      } | null;

      if (cachedLocation) {
        setStageId(cachedLocation.stageId);
        setGroupId(cachedLocation.groupId);
        setGroupName(cachedLocation.groupName);
        setSeasonName(cachedLocation.seasonName);
        setLeagueName(cachedLocation.leagueName);
      }

      if (cachedStandings) {
        setStandings(cachedStandings);
        setSyncStatus('cached');
      } else {
        setSyncStatus('error');
      }

      if (cachedMatchdays) {
        setMatchDays(cachedMatchdays);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // On mount data fetch & loop
  useEffect(() => {
    loadAllLiveData();

    const interval = setInterval(() => {
      loadAllLiveData();
    }, CONFIG.REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Division text helper
  const getDivisionLabel = () => {
    if (isLoading && syncStatus === 'syncing') {
      return 'Detectando división...';
    }
    if (groupId) {
      return `${leagueName} · ${seasonName} · ${groupName}`;
    }
    return 'No se pudo detectar la división de CSD Payasutros.';
  };

  // Next match text helper for Hero
  const getNextMatchLabel = () => {
    if (!matchDays || !Array.isArray(matchDays)) {
      return 'Cargando datos en vivo...';
    }

    const matches: Array<{ homeTeamId: number; homeTeam?: any; awayTeam?: any }> = [];
    matchDays.forEach((md) => {
      if (!md.matches) return;
      md.matches.forEach((m) => {
        if (groupId && m.groupId !== groupId) return;
        if (m.homeTeamId === CONFIG.TEAM_ID || m.awayTeamId === CONFIG.TEAM_ID) {
          if (m.homeScore === null && m.awayScore === null) {
            matches.push(m);
          }
        }
      });
    });

    if (matches.length > 0) {
      const next = matches[0];
      const opponent = next.homeTeamId === CONFIG.TEAM_ID ? next.awayTeam : next.homeTeam;
      const opponentName = opponent ? opponent.name.trim() : 'Rival';
      const connectionWord = next.homeTeamId === CONFIG.TEAM_ID ? 'vs' : '@';
      return `<strong>${CONFIG.TEAM_NAME}</strong> ${connectionWord} ${opponentName}`;
    }

    return `<strong>${CONFIG.TEAM_NAME}</strong> — Esperando fixture`;
  };

  return (
    <>
      {/* Loader */}
      <div className={`loader ${!showLoader ? 'hidden' : ''}`} id="loader">
        <img src="/logo.png" alt="CSD Payasutros" className="loader-logo" />
        <div className="loader-bar">
          <div className="loader-bar-fill"></div>
        </div>
      </div>

      <Navbar />

      <Hero matchDays={matchDays} nextMatchLabel={getNextMatchLabel()} />

      <Standings
        standings={standings}
        divisionLabel={getDivisionLabel()}
        isLoading={isLoading && !standings}
      />

      <Squad />

      <Fixture
        matchDays={matchDays}
        groupId={groupId}
        isLoading={isLoading && !matchDays}
      />

      <Gallery onSelectImage={(src) => setLightboxImage(src)} />

      <Footer />

      {/* Back to top */}
      <button
        className={`back-to-top ${showBackToTop ? 'visible' : ''}`}
        id="back-to-top"
        onClick={handleScrollToTop}
        aria-label="Volver arriba"
      >
        ↑
      </button>

      {/* Sync Status Bottom Overlay */}
      <SyncOverlay status={syncStatus} />

      {/* Lightbox Modal */}
      <Lightbox
        isOpen={lightboxImage !== null}
        src={lightboxImage || ''}
        onClose={() => setLightboxImage(null)}
      />
    </>
  );
}
