'use client';

import Link from 'next/link';
import { useState } from 'react';
import { MiniGrid } from '@/components/Bits';
import { HowToSheet } from '@/components/HowToSheet';
import { IconFlame, IconHelp } from '@/components/Icons';
import { Logo } from '@/components/Logo';
import { PhotoCard } from '@/components/PhotoCard';
import { useGame } from '@/lib/game-context';
import type { PhotoPublic } from '@/lib/types';

const FALLBACK_PHOTOS: PhotoPublic[] = [0, 1, 2].map(() => ({ imageUrl: '', isPrototype: true }));

export default function HomePage() {
  const { edition, game, streak, isCompleted, inProgress } = useGame();
  const [helpOpen, setHelpOpen] = useState(false);

  const photos = edition?.photos.length ? edition.photos : FALLBACK_PHOTOS;
  const results = game?.results.filter((r) => r != null) ?? [];

  return (
    <main className="screen screen-pad">
      <header className="res-head">
        <Logo />
        <button type="button" className="icon-btn" aria-label="Como jogar" onClick={() => setHelpOpen(true)}>
          <IconHelp />
        </button>
      </header>

      <div className="fan" aria-hidden="true">
        <PhotoCard className="c1" size="small" photo={photos[1]} label="Foto 2" showNotice={false} />
        <PhotoCard className="c2" size="small" photo={photos[2]} label="Foto 3" showNotice={false} />
        <PhotoCard
          className="c3"
          size="small"
          photo={photos[0]}
          label="Foto 1"
          stamp="?? ?? ????"
          caption={edition ? `edição #${edition.editionNumber}` : 'edição de hoje'}
          showNotice={false}
        />
      </div>

      <h1 className="headline" style={{ marginTop: 12 }}>
        Cinco fotos do Brasil.
        <span className="accent">Em que ano? Em que lugar?</span>
      </h1>
      <p className="subtitle">Um desafio novo por dia, igual para todo mundo. Dá para jogar em 3 minutos.</p>

      <div className="card edition-card" style={{ marginTop: 20 }}>
        <div>
          <div className="ed">
            {edition ? `Edição #${edition.editionNumber} · ${edition.formattedDate}` : 'Carregando a edição…'}
          </div>
          {isCompleted && <MiniGrid results={results as NonNullable<(typeof results)[number]>[]} />}
        </div>
        <div className="streak" aria-label={`Sequência: ${streak} ${streak === 1 ? 'dia' : 'dias'}`}>
          <IconFlame />
          <span>
            {streak} {streak === 1 ? 'dia' : 'dias'}
          </span>
        </div>
      </div>

      <div style={{ marginTop: 20 }}>
        {isCompleted ? (
          <Link href="/resultado" className="btn btn-secondary">
            Ver meu resultado
          </Link>
        ) : (
          <Link href="/jogar" className="btn btn-primary glow">
            {inProgress ? 'Continuar →' : 'Começar →'}
          </Link>
        )}
      </div>

      <div style={{ textAlign: 'center', marginTop: 6 }}>
        <button type="button" className="text-link" onClick={() => setHelpOpen(true)}>
          Como jogar
        </button>
      </div>

      <footer className="home-footer">
        <p>Fotos de acervos públicos brasileiros, com fonte em cada uma</p>
        <p>
          Mapa: ©{' '}
          <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">
            OpenStreetMap
          </a>
          , <a href="https://openfreemap.org" target="_blank" rel="noopener noreferrer">
            OpenFreeMap
          </a>
          , <a href="https://maplibre.org" target="_blank" rel="noopener noreferrer">
            MapLibre
          </a>
        </p>
      </footer>

      <HowToSheet open={helpOpen} onClose={() => setHelpOpen(false)} />
    </main>
  );
}
