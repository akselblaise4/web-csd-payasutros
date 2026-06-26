import { z } from 'zod';

// Schema for Team details
export const TeamDTOSchema = z.object({
  id: z.number(),
  name: z.string(),
  teamLogoUrl: z.string().nullable().optional(),
});

export type TeamDTO = z.infer<typeof TeamDTOSchema>;

// Schema for Standings entry
export const StandingDTOSchema = z.object({
  points: z.number(),
  played: z.number(),
  won: z.number(),
  drawn: z.number(),
  lost: z.number(),
  goalsFor: z.number(),
  goalsAgainst: z.number(),
  goalDifference: z.number(),
  team: TeamDTOSchema.nullable().optional(),
});

export type StandingDTO = z.infer<typeof StandingDTOSchema>;

// Schema for Match Schedule details
export const MatchScheduleSchema = z.object({
  schedule: z.string().optional(),
});

// Schema for Group details inside match
export const GroupMinSchema = z.object({
  id: z.number(),
  name: z.string(),
});

// Schema for a single Match
export const MatchDTOSchema = z.object({
  id: z.number(),
  homeTeamId: z.number(),
  awayTeamId: z.number(),
  homeScore: z.number().nullable(),
  awayScore: z.number().nullable(),
  groupId: z.number(),
  grounds: z.string().nullable().optional(),
  homeTeam: TeamDTOSchema.nullable().optional(),
  awayTeam: TeamDTOSchema.nullable().optional(),
  matchSchedule: MatchScheduleSchema.nullable().optional(),
  group: GroupMinSchema.nullable().optional(),
});

export type MatchDTO = z.infer<typeof MatchDTOSchema>;

// Schema for Match Day
export const MatchDayDTOSchema = z.object({
  id: z.number(),
  name: z.string(),
  date: z.string(),
  matches: z.array(MatchDTOSchema).optional().default([]),
});

export type MatchDayDTO = z.infer<typeof MatchDayDTOSchema>;

// Schema for Group
export const GroupDTOSchema = z.object({
  id: z.number(),
  name: z.string(),
  stageId: z.number().optional(),
});

export type GroupDTO = z.infer<typeof GroupDTOSchema>;

// Schema for Stage
export const StageDTOSchema = z.object({
  id: z.number(),
  name: z.string().optional(),
});

// Schema for Tournament
export const TournamentDTOSchema = z.object({
  id: z.number(),
  name: z.string(),
  stages: z.array(StageDTOSchema).optional().default([]),
});

export type TournamentDTO = z.infer<typeof TournamentDTOSchema>;

// Schema for League
export const LeagueDTOSchema = z.object({
  id: z.number(),
  name: z.string(),
});

export type LeagueDTO = z.infer<typeof LeagueDTOSchema>;
