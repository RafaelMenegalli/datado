import type { Reveal } from '../types';

export interface PhotoRow extends Reveal {
  id: number;
  title: string;
  imageUrl: string;
}

export interface EditionRow {
  editionNumber: number;
  editionDate: string;
  photos: PhotoRow[];
}

/** Same content as scripts/seed.mjs. Used when DATABASE_URL is not configured. */
export const PROTOTYPE_PHOTOS: PhotoRow[] = [
  {
    id: 1,
    archive: 'Arquivo Nacional',
    sourceUrl: null,
    year: 1959,
    city: 'Brasília',
    state: 'DF',
    lat: -15.7998,
    lon: -47.8645,
    title: 'Congresso Nacional em construção',
    caption:
      'As obras do Congresso Nacional, inaugurado em 21 de abril de 1960, moldaram a nova capital do Brasil.',
    imageUrl: '/images/prototype/foto1.jpg',
  },
  {
    id: 2,
    archive: 'Instituto Moreira Salles',
    sourceUrl: null,
    year: 1930,
    city: 'Salvador',
    state: 'BA',
    lat: -12.9744,
    lon: -38.513,
    title: 'Elevador Lacerda',
    caption:
      'Inaugurado em 1873, o Elevador Lacerda conecta a Cidade Alta à Cidade Baixa e é símbolo de Salvador.',
    imageUrl: '/images/prototype/foto2.jpg',
  },
  {
    id: 3,
    archive: 'Brasiliana Fotográfica',
    sourceUrl: null,
    year: 1926,
    city: 'Florianópolis',
    state: 'SC',
    lat: -27.5935,
    lon: -48.565,
    title: 'Ponte Hercílio Luz',
    caption:
      'A Ponte Hercílio Luz, inaugurada em 1926, foi por décadas a única ligação terrestre de Florianópolis ao continente.',
    imageUrl: '/images/prototype/foto3.jpg',
  },
  {
    id: 4,
    archive: 'Arquivo Nacional',
    sourceUrl: null,
    year: 1950,
    city: 'Rio de Janeiro',
    state: 'RJ',
    lat: -22.9122,
    lon: -43.2302,
    title: 'Estádio do Maracanã',
    caption:
      'O Maracanã foi inaugurado para a Copa do Mundo de 1950, quando o Brasil perdeu para o Uruguai na final.',
    imageUrl: '/images/prototype/foto4.jpg',
  },
  {
    id: 5,
    archive: 'Brasiliana Fotográfica',
    sourceUrl: null,
    year: 1896,
    city: 'Manaus',
    state: 'AM',
    lat: -3.1302,
    lon: -60.0234,
    title: 'Teatro Amazonas',
    caption:
      'Erguido no auge do ciclo da borracha, o Teatro Amazonas abriu suas portas em 31 de dezembro de 1896.',
    imageUrl: '/images/prototype/foto5.jpg',
  },
];

export const PROTOTYPE_EDITION: EditionRow = {
  editionNumber: 1,
  editionDate: '2026-11-18',
  photos: PROTOTYPE_PHOTOS,
};
