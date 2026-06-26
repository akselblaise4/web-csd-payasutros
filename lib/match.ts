import type { MatchDTO } from './dto/liga-b.dto';

/**
 * Parses an ISO date string (like "2026-06-26T00:00:00.000Z") to extract year, month (0-indexed), and day
 * in a timezone-neutral way.
 */
export function parseMatchDate(isoString: string) {
  const [datePart] = isoString.split('T');
  const [year, month, day] = datePart.split('-').map(Number);
  return { year, month: month - 1, day };
}

/**
 * Combines an ISO date string and a schedule time string (like "20:30") to build a local Date object.
 */
export function buildMatchDateTime(isoDateString: string, scheduleStr?: string | null): Date {
  const { year, month, day } = parseMatchDate(isoDateString);
  let hours = 20;
  let mins = 0;
  if (scheduleStr) {
    const parts = scheduleStr.split(':');
    hours = parseInt(parts[0], 10) || 20;
    mins = parseInt(parts[1] || '0', 10);
  }
  return new Date(year, month, day, hours, mins, 0, 0);
}

/**
 * Returns true if the match has already been played or finished.
 * A match is considered played if:
 * 1. It has scores uploaded.
 * 2. Or if more than 60 minutes (1 hour) have passed since the scheduled start time.
 */
export function isMatchPlayed(m: MatchDTO, matchDayDate: string): boolean {
  if (m.homeScore !== null && m.awayScore !== null) {
    return true;
  }
  const matchTime = buildMatchDateTime(matchDayDate, m.matchSchedule?.schedule);
  // Match duration: 1 hour (60 * 60 * 1000 ms)
  return Date.now() >= matchTime.getTime() + 60 * 60 * 1000;
}

/**
 * Returns true if the match is currently in progress (live).
 * A match is in progress if:
 * 1. The current time is between the scheduled start time and 60 minutes after it.
 * 2. And the scores have not been uploaded yet (are null).
 */
export function isMatchInProgress(m: MatchDTO, matchDayDate: string): boolean {
  if (m.homeScore !== null && m.awayScore !== null) {
    return false;
  }
  const matchTime = buildMatchDateTime(matchDayDate, m.matchSchedule?.schedule);
  const now = Date.now();
  const startTime = matchTime.getTime();
  const endTime = startTime + 60 * 60 * 1000;
  return now >= startTime && now < endTime;
}

/**
 * Returns true if the match is scheduled in the future.
 */
export function isMatchUpcoming(m: MatchDTO, matchDayDate: string): boolean {
  if (m.homeScore !== null && m.awayScore !== null) {
    return false;
  }
  const matchTime = buildMatchDateTime(matchDayDate, m.matchSchedule?.schedule);
  return Date.now() < matchTime.getTime();
}
