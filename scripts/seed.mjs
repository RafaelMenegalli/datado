// Creates the tables and seeds Edition #1.
// Usage: npm run db:seed   (reads DATABASE_URL from .env.local)
import { readFileSync } from 'node:fs';
import { neon } from '@neondatabase/serverless';

const url = process.env.DATABASE_URL;
if (!url) {
  console.error('DATABASE_URL is not set. Put it in .env.local (see .env.example).');
  process.exit(1);
}
const sql = neon(url);

const schema = readFileSync(new URL('../db/schema.sql', import.meta.url), 'utf8')
  .split(';')
  .map((s) => s.trim())
  .filter(Boolean);
for (const stmt of schema) await sql.query(stmt);

const [{ count }] = await sql`SELECT count(*)::int AS count FROM photos`;
if (count === 0) {
  await sql`INSERT INTO photos (archive, source_url, year, city, state, lat, lon, title, caption, image_url) VALUES
    ('Arquivo Nacional', null, 1959, 'Brasília', 'DF', -15.7998, -47.8645,
     'Congresso Nacional em construção',
     'As obras do Congresso Nacional, inaugurado em 21 de abril de 1960, moldaram a nova capital do Brasil.',
     '/images/prototype/foto1.jpg'),
    ('Instituto Moreira Salles', null, 1930, 'Salvador', 'BA', -12.9744, -38.5130,
     'Elevador Lacerda',
     'Inaugurado em 1873, o Elevador Lacerda conecta a Cidade Alta à Cidade Baixa e é símbolo de Salvador.',
     '/images/prototype/foto2.jpg'),
    ('Brasiliana Fotográfica', null, 1926, 'Florianópolis', 'SC', -27.5935, -48.5650,
     'Ponte Hercílio Luz',
     'A Ponte Hercílio Luz, inaugurada em 1926, foi por décadas a única ligação terrestre de Florianópolis ao continente.',
     '/images/prototype/foto3.jpg'),
    ('Arquivo Nacional', null, 1950, 'Rio de Janeiro', 'RJ', -22.9122, -43.2302,
     'Estádio do Maracanã',
     'O Maracanã foi inaugurado para a Copa do Mundo de 1950, quando o Brasil perdeu para o Uruguai na final.',
     '/images/prototype/foto4.jpg'),
    ('Brasiliana Fotográfica', null, 1896, 'Manaus', 'AM', -3.1302, -60.0234,
     'Teatro Amazonas',
     'Erguido no auge do ciclo da borracha, o Teatro Amazonas abriu suas portas em 31 de dezembro de 1896.',
     '/images/prototype/foto5.jpg')`;
  console.log('Seeded 5 photos.');
}

await sql`INSERT INTO editions (edition_number, edition_date, photo1_id, photo2_id, photo3_id, photo4_id, photo5_id)
  SELECT 1, '2026-11-18', p.ids[1], p.ids[2], p.ids[3], p.ids[4], p.ids[5]
  FROM (SELECT array_agg(id ORDER BY id) AS ids FROM (SELECT id FROM photos ORDER BY id LIMIT 5) t) p
  ON CONFLICT (edition_number) DO NOTHING`;
console.log('Edition #1 ready.');
