import { NextResponse } from 'next/server';
import { getTodayEdition, toPublic } from '@/lib/server/editions';
import { issueToken } from '@/lib/server/token';

export const dynamic = 'force-dynamic';

export async function GET() {
  const edition = await getTodayEdition();
  // Sem títulos, ids ou respostas: só as imagens e um token de progresso (foto 0).
  return NextResponse.json(
    { ...toPublic(edition), token: issueToken(edition.editionNumber, edition.editionDate, 0) },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}
