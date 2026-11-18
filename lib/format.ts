import type { Color, PhotoResult } from './types';

const nf = new Intl.NumberFormat('pt-BR');
export const fmt = (n: number) => nf.format(n);

export const pts = (n: number) => `${fmt(n)} pts`;

export const yearsLabel = (n: number) => `${fmt(n)} ${n === 1 ? 'ano' : 'anos'}`;

export const kmLabel = (n: number) => `${fmt(n)} km`;

export const pad2 = (n: number) => String(n).padStart(2, '0');

export const COLOR_EMOJI: Record<Color, string> = { perto: '🟩', quase: '🟨', longe: '🟥' };
export const COLOR_NAME: Record<Color, string> = { perto: 'Perto', quase: 'Quase', longe: 'Longe' };

/** Share text. Never includes the correct year or location. */
export function buildShareText(editionNumber: number, total: number, results: PhotoResult[]): string {
  const years = results.map((r) => COLOR_EMOJI[r.yearColor]).join('');
  const places = results.map((r) => COLOR_EMOJI[r.locationColor]).join('');
  return `Datado #${editionNumber} · ${fmt(total)} pts\n📅 ${years}\n📍 ${places}\ndatado.art`;
}
