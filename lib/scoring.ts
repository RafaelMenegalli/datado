import type { Color, LatLon, PhotoResult } from './types';

export const MAX_PER_PHOTO = 5000;
export const MAX_DAILY = 25000;

export const TIERS = [
  { name: 'Guardião da Memória', min: 20000, label: '20.000+' },
  { name: 'Historiador', min: 15000, label: '15.000' },
  { name: 'Pesquisador', min: 10000, label: '10.000' },
  { name: 'Explorador', min: 5000, label: '5.000' },
  { name: 'Curioso', min: 0, label: '0' },
] as const;

export function tierFor(points: number) {
  return TIERS.find((t) => points >= t.min) ?? TIERS[TIERS.length - 1];
}

/** d = absolute difference in years. */
export function scoreYear(guessYear: number, correctYear: number): number {
  const d = Math.abs(guessYear - correctYear);
  return Math.round(2500 * Math.exp(-d / 8));
}

export function haversineKm(a: LatLon, b: LatLon): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLon = ((b.lon - a.lon) * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.asin(Math.sqrt(h));
}

export function scoreLocation(
  guessLat: number,
  guessLon: number,
  correctLat: number,
  correctLon: number,
): number {
  const km = haversineKm({ lat: guessLat, lon: guessLon }, { lat: correctLat, lon: correctLon });
  return Math.round(2500 * Math.exp(-km / 400));
}

export function yearColor(diff: number): Color {
  return diff <= 2 ? 'perto' : diff <= 8 ? 'quase' : 'longe';
}

export function locationColor(km: number): Color {
  return km <= 150 ? 'perto' : km <= 600 ? 'quase' : 'longe';
}

export function computeResult(
  yearGuess: number,
  locationGuess: LatLon,
  correct: { year: number; lat: number; lon: number },
): PhotoResult {
  const yearDiff = Math.abs(yearGuess - correct.year);
  const km = haversineKm(locationGuess, correct);
  return {
    yearGuess,
    locationGuess,
    yearScore: scoreYear(yearGuess, correct.year),
    locationScore: scoreLocation(locationGuess.lat, locationGuess.lon, correct.lat, correct.lon),
    yearDiff,
    distanceKm: Math.round(km),
    yearColor: yearColor(yearDiff),
    locationColor: locationColor(km),
  };
}

export const photoTotal = (r: PhotoResult) => r.yearScore + r.locationScore;
