import { createHmac, timingSafeEqual } from 'node:crypto';

/**
 * Token de progresso assinado: prova qual foto o jogador já palpitou, sem guardar nenhuma resposta.
 * Formato: edição.data.k.emitidoEm.assinatura  (k = nº de fotos já reveladas)
 */
function secret(): string {
  const s = process.env.DATADO_SECRET;
  if (s && s.length >= 16) return s;
  if (process.env.NODE_ENV === 'production') {
    throw new Error('DATADO_SECRET não configurada (mínimo 16 caracteres).');
  }
  return 'segredo-apenas-para-desenvolvimento-local';
}

const sign = (payload: string) => createHmac('sha256', secret()).update(payload).digest('base64url');

export interface ProgressToken {
  n: number; // número da edição
  d: string; // data da edição (YYYY-MM-DD)
  k: number; // fotos já reveladas
  iat: number; // emitido em (ms)
}

export function issueToken(n: number, d: string, k: number, now = Date.now()): string {
  const payload = `${n}.${d}.${k}.${now}`;
  return `${payload}.${sign(payload)}`;
}

export function readToken(token: unknown): ProgressToken | null {
  if (typeof token !== 'string' || token.length > 200) return null;
  const parts = token.split('.');
  if (parts.length !== 5) return null;
  const payload = parts.slice(0, 4).join('.');
  const given = Buffer.from(parts[4]);
  const expected = Buffer.from(sign(payload));
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) return null;
  const n = Number(parts[0]);
  const k = Number(parts[2]);
  const iat = Number(parts[3]);
  if (![n, k, iat].every(Number.isInteger) || !/^\d{4}-\d{2}-\d{2}$/.test(parts[1])) return null;
  return { n, d: parts[1], k, iat };
}
