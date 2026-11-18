import { neon, type NeonQueryFunction } from '@neondatabase/serverless';

type Sql = NeonQueryFunction<false, false>;
import { formatEditionDate, getTodayEditionDate } from '../dates';
import type { EditionPublic, Reveal } from '../types';
import { PROTOTYPE_EDITION, type EditionRow, type PhotoRow } from './prototype-data';

function getSql() {
  const url = process.env.DATABASE_URL;
  return url ? neon(url) : null;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
async function hydrate(sql: Sql, e: any): Promise<EditionRow | null> {
  const ids: number[] = [e.photo1_id, e.photo2_id, e.photo3_id, e.photo4_id, e.photo5_id];
  if (ids.some((id) => id == null)) return null;
  const rows = (await sql`SELECT * FROM photos WHERE id = ANY(${ids})`) as any[];
  const byId = new Map(rows.map((r) => [r.id, r]));
  const photos: PhotoRow[] = [];
  for (const id of ids) {
    const p = byId.get(id);
    if (!p) return null;
    photos.push({
      id: p.id,
      archive: p.archive,
      sourceUrl: p.source_url,
      year: p.year,
      city: p.city,
      state: p.state,
      lat: Number(p.lat),
      lon: Number(p.lon),
      title: p.title,
      caption: p.caption,
      imageUrl: p.image_url,
    });
  }
  return { editionNumber: e.edition_number, editionDate: e.edition_date, photos };
}

async function fromDb(
  query: (sql: Sql) => Promise<any[]>,
): Promise<EditionRow | null> {
  const sql = getSql();
  if (!sql) return null;
  try {
    const rows = await query(sql);
    return rows[0] ? await hydrate(sql, rows[0]) : null;
  } catch (err) {
    console.error('[datado] database error, using prototype data', err);
    return null;
  }
}

const SELECT_EDITION = `edition_number, edition_date::text AS edition_date, photo1_id, photo2_id, photo3_id, photo4_id, photo5_id`;

/**
 * Today's edition. If nothing is scheduled for today we reuse the most recent
 * edition re-dated to today, so the prototype stays playable every day.
 */
export async function getTodayEdition(): Promise<EditionRow> {
  const today = getTodayEditionDate();
  const exact = await fromDb(
    (sql) => sql.query(`SELECT ${SELECT_EDITION} FROM editions WHERE edition_date = $1`, [today]) as Promise<any[]>,
  );
  if (exact) return exact;
  const latest =
    (await fromDb(
      (sql) =>
        sql.query(
          `SELECT ${SELECT_EDITION} FROM editions WHERE edition_date <= $1 ORDER BY edition_date DESC LIMIT 1`,
          [today],
        ) as Promise<any[]>,
    )) ?? PROTOTYPE_EDITION;
  return { ...latest, editionDate: today };
}

export async function getEditionByNumber(n: number): Promise<EditionRow | null> {
  const found = await fromDb(
    (sql) => sql.query(`SELECT ${SELECT_EDITION} FROM editions WHERE edition_number = $1`, [n]) as Promise<any[]>,
  );
  if (found) return found;
  return n === PROTOTYPE_EDITION.editionNumber ? PROTOTYPE_EDITION : null;
}

export function toPublic(e: EditionRow): Omit<EditionPublic, 'token'> {
  return {
    editionNumber: e.editionNumber,
    editionDate: e.editionDate,
    formattedDate: formatEditionDate(e.editionDate),
    photos: e.photos.map((p) => ({
      imageUrl: p.imageUrl,
      isPrototype: p.imageUrl.startsWith('/images/prototype/'),
    })),
  };
}

export function toReveal(p: PhotoRow): Reveal {
  return {
    title: p.title,
    year: p.year,
    city: p.city,
    state: p.state,
    lat: p.lat,
    lon: p.lon,
    caption: p.caption,
    archive: p.archive,
    sourceUrl: p.sourceUrl ?? null,
  };
}

/**
 * Quem pode jogar o quê. Só a edição de hoje e edições já encerradas (data anterior a hoje).
 * Edições futuras nunca são servidas, e a edição de hoje só é acessível com a data de hoje.
 */
export async function getEditionAccess(n: number): Promise<{ edition: EditionRow; date: string } | null> {
  const today = getTodayEditionDate();
  const current = await getTodayEdition();
  if (current.editionNumber === n) return { edition: current, date: today };
  const past = await getEditionByNumber(n);
  if (past && past.editionDate < today) return { edition: past, date: past.editionDate };
  return null;
}
