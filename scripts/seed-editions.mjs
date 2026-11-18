// Cria as edições #2 a #11 (uma por dia, a partir de 2026-11-19).
// Uso: npm run db:seed:editions   (lê DATABASE_URL de .env.local)
// É idempotente: edições que já existem são ignoradas.
//
// IMPORTANTE: os fatos (ano, cidade, coordenadas, legenda) são reais, mas as imagens
// são placeholders do protótipo e a fonte ainda é "a definir". Antes de publicar,
// troque image_url / archive / source_url de cada foto por uma foto histórica real
// com a fonte correta.
import { neon } from '@neondatabase/serverless';

const url = process.env.DATABASE_URL;
if (!url) {
  console.error('DATABASE_URL não definida. Coloque em .env.local.');
  process.exit(1);
}
const sql = neon(url);

const FONTE = 'a definir (protótipo)';
// [ano, cidade, UF, lat, lon, título, legenda]
const EDITIONS = {
  2: [
    [1911, 'São Paulo', 'SP', -23.545, -46.6386, 'Theatro Municipal de São Paulo', 'O Theatro Municipal foi inaugurado em 12 de setembro de 1911 e virou palco da Semana de Arte Moderna de 1922.'],
    [1901, 'Belém', 'PA', -1.4524, -48.5037, 'Mercado de Ferro do Ver-o-Peso', 'A estrutura de ferro do Ver-o-Peso, trazida da Europa, foi inaugurada em 1901 em plena era da borracha.'],
    [2002, 'Brasília', 'DF', -15.8189, -47.8268, 'Ponte Juscelino Kubitschek', 'Inaugurada em dezembro de 2002, a ponte JK cruza o Lago Paranoá com seus três arcos assimétricos.'],
    [1931, 'Rio de Janeiro', 'RJ', -22.9519, -43.2105, 'Cristo Redentor', 'O Cristo Redentor foi inaugurado em 12 de outubro de 1931, no alto do Corcovado.'],
    [1965, 'Belo Horizonte', 'MG', -19.8659, -43.971, 'Estádio Mineirão', 'O Mineirão foi inaugurado em 5 de setembro de 1965 e se tornou o grande estádio de Minas Gerais.'],
  ],
  3: [
    [1912, 'Porto Velho', 'RO', -8.7612, -63.9039, 'Estrada de Ferro Madeira-Mamoré', 'A Madeira-Mamoré foi inaugurada em 1912, ligando Porto Velho a Guajará-Mirim em plena selva amazônica.'],
    [1984, 'Foz do Iguaçu', 'PR', -25.4084, -54.5883, 'Usina de Itaipu', 'Itaipu, construída em parceria com o Paraguai, começou a gerar energia em 1984.'],
    [1992, 'Curitiba', 'PR', -25.3846, -49.2754, 'Ópera de Arame', 'A Ópera de Arame, com estrutura tubular e teto transparente, foi inaugurada em Curitiba em 1992.'],
    [1910, 'Fortaleza', 'CE', -3.7292, -38.5256, 'Theatro José de Alencar', 'O Theatro José de Alencar, com estrutura de ferro, foi inaugurado em Fortaleza em 1910.'],
    [1933, 'Goiânia', 'GO', -16.6869, -49.2648, 'Fundação de Goiânia', 'Goiânia, cidade planejada para ser a nova capital de Goiás, foi fundada em 24 de outubro de 1933.'],
  ],
  4: [
    [1940, 'São Paulo', 'SP', -23.5453, -46.6663, 'Estádio do Pacaembu', 'O Pacaembu foi inaugurado em 27 de abril de 1940 e foi por décadas o principal estádio de São Paulo.'],
    [1974, 'Niterói', 'RJ', -22.8697, -43.165, 'Ponte Rio–Niterói', 'A Ponte Rio–Niterói foi inaugurada em 4 de março de 1974 e liga as duas cidades pela Baía de Guanabara.'],
    [1951, 'Salvador', 'BA', -12.9791, -38.5042, 'Estádio da Fonte Nova', 'O Estádio da Fonte Nova foi inaugurado em Salvador em janeiro de 1951.'],
    [1922, 'Santos', 'SP', -23.9354, -46.3249, 'Bolsa do Café de Santos', 'A Bolsa Oficial de Café, inaugurada em 1922, era o centro do comércio do café no maior porto do Brasil.'],
    [1969, 'Porto Alegre', 'RS', -30.0654, -51.2358, 'Estádio Beira-Rio', 'O Beira-Rio foi inaugurado em abril de 1969, à beira do Guaíba, e é a casa do Internacional.'],
  ],
  5: [
    [1958, 'Brasília', 'DF', -15.8133, -47.8283, 'Palácio da Alvorada', 'O Palácio da Alvorada, projetado por Oscar Niemeyer, foi inaugurado em 30 de junho de 1958.'],
    [1929, 'São Paulo', 'SP', -23.5455, -46.6339, 'Edifício Martinelli', 'Inaugurado em 1929, o Martinelli foi o primeiro arranha-céu de São Paulo.'],
    [1884, 'Petrópolis', 'RJ', -22.509, -43.179, 'Palácio de Cristal', 'O Palácio de Cristal, estrutura de ferro e vidro vinda da França, foi inaugurado em Petrópolis em 1884.'],
    [1909, 'Rio de Janeiro', 'RJ', -22.9086, -43.1766, 'Theatro Municipal do Rio de Janeiro', 'O Theatro Municipal do Rio foi inaugurado em 14 de julho de 1909, na Cinelândia.'],
    [1885, 'Paranaguá', 'PR', -25.5163, -48.5225, 'Estrada de Ferro Curitiba–Paranaguá', 'A ferrovia que desce a Serra do Mar, de Curitiba até Paranaguá, foi inaugurada em 1885.'],
  ],
  6: [
    [1968, 'São Paulo', 'SP', -23.5614, -46.6559, 'MASP na Avenida Paulista', 'O prédio do MASP, com seu grande vão livre projetado por Lina Bo Bardi, foi inaugurado em 1968.'],
    [1932, 'Porto Alegre', 'RS', -30.0305, -51.229, 'Viaduto Otávio Rocha', 'O Viaduto Otávio Rocha foi inaugurado em 1932 e atravessa a Avenida Borges de Medeiros, no centro de Porto Alegre.'],
    [1970, 'Brasília', 'DF', -15.7983, -47.8756, 'Catedral de Brasília', 'A Catedral Metropolitana, de Niemeyer, foi inaugurada em 31 de maio de 1970.'],
    [1923, 'Rio de Janeiro', 'RJ', -22.9672, -43.1788, 'Copacabana Palace', 'O Copacabana Palace foi inaugurado em 1923 e virou símbolo do glamour carioca.'],
    [1984, 'Blumenau', 'SC', -26.9194, -49.0661, 'Oktoberfest de Blumenau', 'A primeira Oktoberfest de Blumenau aconteceu em 1984, para animar a cidade após enchentes.'],
  ],
  7: [
    [1984, 'Rio de Janeiro', 'RJ', -22.9113, -43.1963, 'Sambódromo da Marquês de Sapucaí', 'O Sambódromo foi inaugurado em 1984, quando passou a receber os desfiles das escolas de samba do Rio.'],
    [1954, 'São Paulo', 'SP', -23.5874, -46.6576, 'Parque Ibirapuera', 'O Parque Ibirapuera foi inaugurado em 1954, nas comemorações do IV Centenário da cidade de São Paulo.'],
    [1980, 'Aparecida', 'SP', -22.8505, -45.2295, 'Basílica Nova de Aparecida', 'A Basílica Nova de Aparecida foi consagrada pelo papa João Paulo II em 4 de julho de 1980.'],
    [1960, 'Brasília', 'DF', -15.7998, -47.8604, 'Inauguração de Brasília', 'Brasília foi inaugurada em 21 de abril de 1960, no governo de Juscelino Kubitschek.'],
    [1943, 'Belo Horizonte', 'MG', -19.8584, -43.9703, 'Igreja da Pampulha', 'A Igreja de São Francisco de Assis, de Niemeyer, na Pampulha, foi concluída em 1943.'],
  ],
  8: [
    [1912, 'Rio de Janeiro', 'RJ', -22.9486, -43.1566, 'Bondinho do Pão de Açúcar', 'O primeiro trecho do bondinho do Pão de Açúcar foi inaugurado em 1912.'],
    [1938, 'São Paulo', 'SP', -23.5342, -46.6396, 'Estação Júlio Prestes', 'A Estação Júlio Prestes foi inaugurada em 1938, para os trens do café que chegavam a São Paulo.'],
    [2007, 'Natal', 'RN', -5.7578, -35.2062, 'Ponte Newton Navarro', 'A Ponte Newton Navarro, sobre o Rio Potengi, foi inaugurada em Natal em 2007.'],
    [1972, 'Curitiba', 'PR', -25.4284, -49.2733, 'Rua XV de Novembro', 'Em 1972, a Rua XV de Novembro virou a primeira grande rua só para pedestres do Brasil.'],
    [1989, 'Palmas', 'TO', -10.184, -48.3336, 'Fundação de Palmas', 'Palmas foi fundada em 20 de maio de 1989 para ser a capital do novo estado do Tocantins.'],
  ],
  9: [
    [1938, 'São Paulo', 'SP', -23.5453, -46.6391, 'Viaduto do Chá', 'O atual Viaduto do Chá foi inaugurado em 1938 e liga o centro velho ao centro novo de São Paulo.'],
    [1989, 'Vitória', 'ES', -20.33, -40.29, 'Terceira Ponte', 'A Terceira Ponte, entre Vitória e Vila Velha, foi inaugurada em 1989.'],
    [1927, 'Rio de Janeiro', 'RJ', -22.8927, -43.2279, 'Estádio de São Januário', 'São Januário foi inaugurado em 21 de abril de 1927 e é a casa do Vasco da Gama.'],
    [2000, 'Belém', 'PA', -1.451, -48.5, 'Estação das Docas', 'A Estação das Docas, antigos armazéns do porto reformados, foi inaugurada em Belém em 2000.'],
    [2014, 'Cuiabá', 'MT', -15.6033, -56.1215, 'Arena Pantanal', 'A Arena Pantanal foi inaugurada em 2014 para a Copa do Mundo no Brasil.'],
  ],
  10: [
    [1910, 'Rio de Janeiro', 'RJ', -22.9089, -43.1756, 'Biblioteca Nacional', 'O prédio da Biblioteca Nacional, na Cinelândia, foi inaugurado em 1910.'],
    [1960, 'São Paulo', 'SP', -23.6001, -46.72, 'Estádio do Morumbi', 'O Morumbi foi inaugurado em 2 de outubro de 1960 e é a casa do São Paulo.'],
    [1999, 'Fortaleza', 'CE', -3.7232, -38.518, 'Centro Dragão do Mar', 'O Centro Dragão do Mar de Arte e Cultura foi inaugurado em Fortaleza em 1999.'],
    [1928, 'Porto Alegre', 'RS', -30.0346, -51.243, 'Usina do Gasômetro', 'A Usina do Gasômetro, na orla do Guaíba, começou a funcionar em 1928.'],
    [1889, 'Juiz de Fora', 'MG', -21.7642, -43.3503, 'Usina Hidrelétrica de Marmelos', 'A Usina de Marmelos, em Juiz de Fora, entrou em operação em 1889 e é a primeira hidrelétrica da América do Sul.'],
  ],
  11: [
    [1981, 'Brasília', 'DF', -15.7955, -47.9136, 'Memorial JK', 'O Memorial JK, que guarda o acervo de Juscelino Kubitschek, foi inaugurado em Brasília em 1981.'],
    [2015, 'Rio de Janeiro', 'RJ', -22.8944, -43.1799, 'Museu do Amanhã', 'O Museu do Amanhã, na Praça Mauá, foi inaugurado em dezembro de 2015.'],
    [2000, 'Porto Seguro', 'BA', -16.4435, -39.0643, 'Os 500 anos do Brasil', 'Em abril de 2000, Porto Seguro recebeu as comemorações dos 500 anos da chegada dos portugueses.'],
    [1983, 'Joinville', 'SC', -26.3045, -48.8487, 'Festival de Dança de Joinville', 'O Festival de Dança de Joinville teve a sua primeira edição em 1983.'],
    [1983, 'Alcântara', 'MA', -2.3167, -44.3667, 'Centro de Lançamento de Alcântara', 'O Centro de Lançamento de Alcântara foi inaugurado em 1983, perto da linha do Equador.'],
  ],
};

const FIRST_DATE = '2026-11-19'; // edição #2
const dateFor = (n) => {
  const d = new Date(`${FIRST_DATE}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + (n - 2));
  return d.toISOString().slice(0, 10);
};

for (const [num, photos] of Object.entries(EDITIONS)) {
  const n = Number(num);
  const date = dateFor(n);
  const exists = await sql`SELECT 1 FROM editions WHERE edition_number = ${n} OR edition_date = ${date}`;
  if (exists.length) {
    console.log(`#${n} (${date}) já existe, pulando.`);
    continue;
  }
  const ids = [];
  for (const [year, city, state, lat, lon, title, caption] of photos) {
    const [row] = await sql`
      INSERT INTO photos (archive, source_url, year, city, state, lat, lon, title, caption, image_url)
      VALUES (${FONTE}, null, ${year}, ${city}, ${state}, ${lat}, ${lon}, ${title}, ${caption}, '/images/prototype/placeholder.jpg')
      RETURNING id`;
    ids.push(row.id);
  }
  await sql`INSERT INTO editions (edition_number, edition_date, photo1_id, photo2_id, photo3_id, photo4_id, photo5_id)
    VALUES (${n}, ${date}, ${ids[0]}, ${ids[1]}, ${ids[2]}, ${ids[3]}, ${ids[4]})`;
  console.log(`#${n} (${date}) criada: ${photos.map((p) => p[5]).join(' | ')}`);
}
