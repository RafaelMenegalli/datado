import { shiftDate } from './dates';
import { photoTotal } from './scoring';
import type { LocalStats, PhotoResult } from './types';

export const KEYS = {
  stats: 'datado:stats:v1',
  game: (date: string) => `datado:game:v2:${date}`,
  edition: (date: string) => `datado:edition:v2:${date}`,
};

export function readJSON<T>(key: string): T | null {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export function writeJSON(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable or full: the game keeps working in memory */
  }
}

export const EMPTY_STATS: LocalStats = {
  gamesPlayed: 0,
  currentStreak: 0,
  bestStreak: 0,
  totalPoints: 0,
  lastPlayedDate: null,
  history: {},
};

export function readStats(): LocalStats {
  return { ...EMPTY_STATS, ...(readJSON<LocalStats>(KEYS.stats) ?? {}) };
}

/** Streak shown in the UI: broken if the last game was before yesterday. */
export function displayStreak(stats: LocalStats, today: string): number {
  const last = stats.lastPlayedDate;
  if (!last) return 0;
  return last === today || last === shiftDate(today, -1) ? stats.currentStreak : 0;
}

export function applyCompletedGame(
  stats: LocalStats,
  date: string,
  editionNumber: number,
  photos: PhotoResult[],
): LocalStats {
  if (stats.history[date]) return stats; // never count the same day twice
  const totalScore = photos.reduce((sum, r) => sum + photoTotal(r), 0);
  const currentStreak = stats.lastPlayedDate === shiftDate(date, -1) ? stats.currentStreak + 1 : 1;
  return {
    gamesPlayed: stats.gamesPlayed + 1,
    currentStreak,
    bestStreak: Math.max(stats.bestStreak, currentStreak),
    totalPoints: stats.totalPoints + totalScore,
    lastPlayedDate: date,
    history: { ...stats.history, [date]: { editionNumber, totalScore, photos } },
  };
}
