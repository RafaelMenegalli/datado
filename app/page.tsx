'use client';

import Link from 'next/link';
import { useState } from 'react';
import { MiniGrid } from '@/components/Bits';
import { HowToSheet } from '@/components/HowToSheet';
import { IconCheck, IconFlame, IconHelp, IconPlay } from '@/components/Icons';
import { Logo } from '@/components/Logo';
import { PhotoCard } from '@/components/PhotoCard';
import { fmt } from '@/lib/format';
import { useGame } from '@/lib/game-context';
import type { PhotoPublic } from '@/lib/types';

const FALLBACK_PHOTOS: PhotoPublic[] = [0, 1, 2].map(() => ({ imageUrl: '', isPrototype: true }));
const MAX_POINTS = 25000;

export default function HomePage() {
  const { edition, game, streak, stats, isCompleted, inProgress } = useGame();
  const [helpOpen, setHelpOpen] = useState(false);

  const photos = edition?.photos.length ? edition.photos : FALLBACK_PHOTOS;
  const results = (game?.results.filter((r) => r != null) ?? []) as NonNullable<
    NonNullable<typeof game>['results'][number]
  >[];
  const done = results.length;
  const current = game?.currentPhotoIndex ?? 0;
  const todayScore = results.reduce((sum, r) => sum + r.yearScore + r.locationScore, 0);

  const bestScore = Object.values(stats.history).reduce((m, h) => Math.max(m, h.totalScore), 0);

  return (
    <main className="screen screen-pad home">
      <header className="hud">
        <Logo />
        <div className="hud-right">
          <div className="hud-chip" aria-label={`Sequência: ${streak} ${streak === 1 ? 'dia' : 'dias'}`}>
            <IconFlame />
            <span className="num">{streak}</span>
          </div>
          <button type="button" className="icon-btn" aria-label="Como jogar" onClick={() => setHelpOpen(true)}>
            <IconHelp />
          </button>
        </div>
      </header>

      <section className="stage" aria-label="Desafio de hoje">
        <div className="level-tag">
          <span className="live-dot" aria-hidden="true" />
          {edition ? `Desafio #${edition.editionNumber} · ${edition.formattedDate}` : 'Carregando o desafio…'}
        </div>

        <div className="fan" aria-hidden="true">
          <PhotoCard className="c1" size="small" photo={photos[1]} label="Foto 2" showNotice={false} />
          <PhotoCard className="c2" size="small" photo={photos[2]} label="Foto 3" showNotice={false} />
          <PhotoCard
            className="c3"
            size="small"
            photo={photos[0]}
            label="Foto 1"
            stamp="?? ?? ????"
            caption="que ano é esse?"
            showNotice={false}
          />
        </div>

        <h1 className="game-title">
          Que ano é esse?
          <span className="accent">E onde foi?</span>
        </h1>
        <p className="subtitle">Adivinhe o ano e o lugar de 5 fotos históricas do Brasil.</p>
      </section>

      <ol className="rounds" aria-label="Rodadas do dia">
        {[0, 1, 2, 3, 4].map((i) => {
          const finished = i < done;
          const isCurrent = !isCompleted && i === current && !finished;
          return (
            <li
              key={i}
              className={`round${finished ? ' is-done' : ''}${isCurrent && inProgress ? ' is-current' : ''}`}
              aria-label={`Foto ${i + 1}${finished ? ', concluída' : ''}`}
            >
              {finished ? <IconCheck /> : <span className="num">{i + 1}</span>}
            </li>
          );
        })}
      </ol>

      <div className="rules" aria-label="Regras rápidas">
        <div className="rule">
          <span className="num rule-v">2</span>
          <span className="rule-l">palpites por foto</span>
        </div>
        <div className="rule">
          <span className="num rule-v">{fmt(MAX_POINTS)}</span>
          <span className="rule-l">pontos no máximo</span>
        </div>
        <div className="rule">
          <span className="num rule-v">{bestScore ? fmt(bestScore) : '—'}</span>
          <span className="rule-l">seu recorde</span>
        </div>
      </div>

      {isCompleted ? (
        <div className="done-box">
          <div className="done-score">
            <span className="done-label">Você fez</span>
            <span className="num stamp-glow-large done-pts">{fmt(todayScore)} pts</span>
          </div>
          <MiniGrid results={results} />
          <Link href="/resultado" className="btn btn-play" style={{ marginTop: 14 }}>
            Ver meu resultado
          </Link>
        </div>
      ) : (
        <Link href="/jogar" className="btn btn-play">
          <IconPlay />
          Jogar
        </Link>
      )}
      {inProgress && !isCompleted && (
        <p className="play-hint">
          Você está na foto {Math.min(current + 1, 5)} de 5 · {fmt(todayScore)} pts até agora
        </p>
      )}

      <div style={{ textAlign: 'center', marginTop: 4 }}>
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
