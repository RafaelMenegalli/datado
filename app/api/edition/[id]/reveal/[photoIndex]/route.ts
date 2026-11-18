import { NextResponse } from 'next/server';
import { getEditionAccess, toReveal } from '@/lib/server/editions';
import { issueToken, readToken } from '@/lib/server/token';

export const dynamic = 'force-dynamic';

const MIN_THINK_MS = 1500; // um humano leva mais que isso para olhar a foto e palpitar
const NO_STORE = { 'Cache-Control': 'private, no-store' };

const fail = (status: number, error: string) => NextResponse.json({ error }, { status, headers: NO_STORE });

/**
 * POST { token, yearGuess, lat, lon }
 * A resposta de uma foto só sai depois de o jogador enviar um palpite válido para ela,
 * na ordem (0 → 4), com o token de progresso emitido pelo servidor. Não existe GET.
 */
export async function POST(req: Request, { params }: { params: Promise<{ id: string; photoIndex: string }> }) {
  const { id, photoIndex } = await params;
  const n = Number(id);
  const i = Number(photoIndex);
  if (!Number.isInteger(n) || !Number.isInteger(i) || i < 0 || i > 4) return fail(400, 'Parâmetros inválidos');

  let body: { token?: unknown; yearGuess?: unknown; lat?: unknown; lon?: unknown };
  try {
    body = await req.json();
  } catch {
    return fail(400, 'Corpo inválido');
  }

  const { yearGuess, lat, lon } = body;
  const validGuess =
    typeof yearGuess === 'number' && Number.isInteger(yearGuess) && yearGuess >= 1880 && yearGuess <= 2025 &&
    typeof lat === 'number' && lat >= -35 && lat <= 6 &&
    typeof lon === 'number' && lon >= -75 && lon <= -33;
  if (!validGuess) return fail(400, 'Palpite inválido');

  const access = await getEditionAccess(n);
  if (!access) return fail(404, 'Edição não encontrada');

  const token = readToken(body.token);
  if (!token || token.n !== n) return fail(401, 'Token inválido');
  if (token.d !== access.date) return fail(401, 'Edição expirada'); // virou o dia: recarregue
  if (token.k !== i) return fail(409, 'Foto fora de ordem');
  if (Date.now() - token.iat < MIN_THINK_MS) return fail(429, 'Calma, olhe a foto primeiro');

  return NextResponse.json(
    { reveal: toReveal(access.edition.photos[i]), token: issueToken(n, access.date, i + 1) },
    { headers: NO_STORE },
  );
}
