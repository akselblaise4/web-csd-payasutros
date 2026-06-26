import 'server-only';

import {
  StandingDTOSchema,
  MatchDayDTOSchema,
  GroupDTOSchema,
  TournamentDTOSchema,
  LeagueDTOSchema,
  type StandingDTO,
  type MatchDayDTO,
  type GroupDTO,
  type TournamentDTO,
  type LeagueDTO,
} from '../dto/liga-b.dto';

const LIGA_B_API = 'https://api.ligab.cl/v1';
const FETCH_TIMEOUT = 12000;

async function fetchFromApi(endpoint: string): Promise<unknown> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

  try {
    const response = await fetch(`${LIGA_B_API}${endpoint}`, {
      signal: controller.signal,
      next: { revalidate: 120 }, // Next.js ISR cache for 2 minutes
    });

    clearTimeout(id);

    if (!response.ok) {
      throw new Error(`Liga B API error: HTTP status ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    clearTimeout(id);
    console.error(`[DAL Liga B] Error fetching from endpoint ${endpoint}:`, error);
    throw new Error('Internal database connection error');
  }
}

export async function getStandings(groupId: number): Promise<StandingDTO[]> {
  const rawData = await fetchFromApi(`/groups/${groupId}/standings`);
  if (!Array.isArray(rawData)) {
    throw new Error('Invalid standings format received');
  }

  return rawData
    .map((item) => {
      const parsed = StandingDTOSchema.safeParse(item);
      return parsed.success ? parsed.data : null;
    })
    .filter((item): item is StandingDTO => item !== null);
}

export async function getMatchDays(stageId: number): Promise<MatchDayDTO[]> {
  const filter = JSON.stringify({
    include: [
      {
        relation: 'matches',
        scope: {
          include: [
            { relation: 'homeTeam' },
            { relation: 'awayTeam' },
            { relation: 'matchSchedule' },
            { relation: 'group' },
          ],
        },
      },
    ],
  });

  const rawData = await fetchFromApi(`/stages/${stageId}/match-days?filter=${encodeURIComponent(filter)}`);
  if (!Array.isArray(rawData)) {
    throw new Error('Invalid match days format received');
  }

  return rawData
    .map((item) => {
      const parsed = MatchDayDTOSchema.safeParse(item);
      return parsed.success ? parsed.data : null;
    })
    .filter((item): item is MatchDayDTO => item !== null);
}

export async function getGroups(stageId: number): Promise<GroupDTO[]> {
  const rawData = await fetchFromApi(`/stages/${stageId}/groups`);
  if (!Array.isArray(rawData)) {
    throw new Error('Invalid groups format received');
  }

  return rawData
    .map((item) => {
      const parsed = GroupDTOSchema.safeParse(item);
      return parsed.success ? parsed.data : null;
    })
    .filter((item): item is GroupDTO => item !== null);
}

export async function getTournaments(leagueId: number): Promise<TournamentDTO[]> {
  const filter = JSON.stringify({
    include: [{ relation: 'stages' }],
  });

  const rawData = await fetchFromApi(`/leagues/${leagueId}/tournaments?filter=${encodeURIComponent(filter)}`);
  if (!Array.isArray(rawData)) {
    throw new Error('Invalid tournaments format received');
  }

  return rawData
    .map((item) => {
      const parsed = TournamentDTOSchema.safeParse(item);
      return parsed.success ? parsed.data : null;
    })
    .filter((item): item is TournamentDTO => item !== null);
}

export async function getLeagues(): Promise<LeagueDTO[]> {
  const rawData = await fetchFromApi('/leagues');
  if (!Array.isArray(rawData)) {
    throw new Error('Invalid leagues format received');
  }

  return rawData
    .map((item) => {
      const parsed = LeagueDTOSchema.safeParse(item);
      return parsed.success ? parsed.data : null;
    })
    .filter((item): item is LeagueDTO => item !== null);
}
