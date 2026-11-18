import { NextResponse } from 'next/server';
import { getEditionAccess, toPublic } from '@/lib/server/editions';
import { issueToken } from '@/lib/server/token';

export const dynamic = 'force-dynamic';

/** Só edições de hoje ou já encerradas. Edições futuras respondem 404, como se não existissem. */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const n = Number(id);
  if (!Number.isInteger(n) || n < 1) return NextResponse.json({ error: 'Edição inválida' }, { status: 400 });
  const access = await getEditionAccess(n);
  if (!access) return NextResponse.json({ error: 'Edição não encontrada' }, { status: 404 });
  return NextResponse.json(
    { ...toPublic(access.edition), token: issueToken(n, access.date, 0) },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}
