'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { BrazilMap } from '@/components/BrazilMap';
import { ProgressBar } from '@/components/Bits';
import { IconX } from '@/components/Icons';
import { Modal } from '@/components/Modal';
import { PhotoCard } from '@/components/PhotoCard';
import { Timeline } from '@/components/Timeline';
import { YearPicker } from '@/components/YearPicker';
import { useGame } from '@/lib/game-context';
import { useCountUp } from '@/lib/hooks';
import { fmt, kmLabel, pts, yearsLabel } from '@/lib/format';
import { photoTotal } from '@/lib/scoring';
import type { GameState, PhotoResult, Reveal } from '@/lib/types';

export default function JogarPage() {
  const { status, game, retry } = useGame();
  const router = useRouter();

  useEffect(() => {
    if (game?.phase === 'completed') router.replace('/resultado');
  }, [game?.phase, router]);

  if (status === 'loading' || (game?.phase === 'completed')) {
    return (
      <main className="screen">
        <div className="center-msg">Carregando a edição…</div>
      </main>
    );
  }
  if (status === 'error' || !game) {
    return (
      <main className="screen">
        <div className="center-msg">
          <p>Não foi possível carregar a edição de hoje. Confira a sua conexão.</p>
          <button type="button" className="btn btn-primary" style={{ maxWidth: 260 }} onClick={retry}>
            Tentar de novo
          </button>
          <Link href="/" className="text-link">
            Voltar ao início
          </Link>
        </div>
      </main>
    );
  }

  const i = game.currentPhotoIndex;
  return game.phase === 'revealing' ? <RevealView key={`r${i}`} game={game} /> : <GuessView key={`g${i}`} game={game} />;
}

/* ------------------------------------------------------------------ */

function ExitButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" className="icon-btn" aria-label="Sair da rodada" onClick={() => setOpen(true)}>
        <IconX />
      </button>
      <Modal open={open} onClose={() => setOpen(false)} variant="dialog" labelledBy="exit-title">
        <div className="dialog">
          <h2 id="exit-title" className="display" style={{ fontWeight: 700, fontSize: 19, marginBottom: 18 }}>
            Sair da rodada? O seu progresso será salvo.
          </h2>
          <div className="btn-row">
            <button type="button" className="btn btn-secondary" onClick={() => setOpen(false)}>
              Cancelar
            </button>
            <button type="button" className="btn btn-primary" style={{ height: 54, fontSize: 17 }} onClick={() => router.push('/')}>
              Sair
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}

function TopBar({ game, label, total, done, current }: { game: GameState; label: string; total: number; done: number; current: number | null }) {
  return (
    <header className="topbar">
      <ExitButton />
      <div className="topbar-center">
        <div className="topbar-title">{label}</div>
        <div className="topbar-pts num">{pts(total)}</div>
      </div>
      <ProgressBar done={done} current={current} />
      <span className="sr-only">
        Foto {game.currentPhotoIndex + 1} de {game.photos.length}
      </span>
    </header>
  );
}

/* ------------------------------ guessing ------------------------------ */

function GuessView({ game }: { game: GameState }) {
  const { setYearGuess, setLocationGuess, confirmGuess, totalScore } = useGame();
  const [tab, setTab] = useState<'ano' | 'lugar'>('ano');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);

  const i = game.currentPhotoIndex;
  const photo = game.photos[i];
  const { yearGuess, locationGuess } = game.guesses[i];
  const hasYear = yearGuess != null;
  const hasPlace = locationGuess != null;
  const ready = hasYear && hasPlace;

  const label = ready
    ? 'Confirmar palpite'
    : hasYear
      ? 'Falta marcar o lugar'
      : hasPlace
        ? 'Falta escolher o ano'
        : 'Escolha o ano e o lugar';

  const onConfirm = async () => {
    setBusy(true);
    setError(false);
    const ok = await confirmGuess();
    setBusy(false);
    if (!ok) setError(true);
    else window.scrollTo({ top: 0 });
  };

  return (
    <main className="screen screen-pad-footer">
      <TopBar game={game} label={`Foto ${i + 1} de ${game.photos.length}`} total={totalScore} done={i} current={i} />

      <PhotoCard
        photo={photo}
        label={`Foto ${i + 1}`}
        zoomable
        stamp={hasYear ? String(yearGuess) : '?? ?? ????'}
        live
        size={tab === 'lugar' ? 'compact' : 'normal'}
      />

      <div className="seg" role="tablist" aria-label="Palpite" style={{ marginTop: 18 }}>
        <button type="button" role="tab" id="tab-ano" aria-selected={tab === 'ano'} aria-controls="panel-ano" onClick={() => setTab('ano')}>
          Ano
          {hasYear && <span className="dot" role="img" aria-label="palpite feito" />}
        </button>
        <button type="button" role="tab" id="tab-lugar" aria-selected={tab === 'lugar'} aria-controls="panel-lugar" onClick={() => setTab('lugar')}>
          Lugar
          {hasPlace && <span className="dot" role="img" aria-label="palpite feito" />}
        </button>
      </div>

      <div style={{ marginTop: 14 }}>
        {tab === 'ano' ? (
          <div role="tabpanel" id="panel-ano" aria-labelledby="tab-ano">
            <YearPicker value={yearGuess} onChange={setYearGuess} />
          </div>
        ) : (
          <div role="tabpanel" id="panel-lugar" aria-labelledby="tab-lugar">
            <div className="panel map-panel">
              <BrazilMap guess={locationGuess} onPick={setLocationGuess} />
            </div>
            <p className="hint">Toque no mapa onde você acha que a foto foi tirada</p>
          </div>
        )}
      </div>

      <div className="footer-bar">
        <div className="screen">
          {error && (
            <p className="footer-error" role="alert">
              Não deu para confirmar o palpite. É preciso estar conectado para ver a resposta. Tente de novo.
            </p>
          )}
          <button type="button" className="btn btn-primary" disabled={!ready || busy} onClick={onConfirm}>
            {busy ? 'Confirmando…' : label}
          </button>
        </div>
      </div>
    </main>
  );
}

/* ------------------------------ reveal ------------------------------ */

function RevealView({ game }: { game: GameState }) {
  const { nextPhoto, finish, totalScore } = useGame();
  const router = useRouter();
  const i = game.currentPhotoIndex;
  const photo = game.photos[i];
  const result = game.results[i] as PhotoResult;
  const rev = game.reveals[i] as Reveal;
  const isLast = i === game.photos.length - 1;
  const total = photoTotal(result);
  const shown = useCountUp(total);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, []);

  const yearChip = result.yearDiff === 0 ? 'Na mosca!' : `${yearsLabel(result.yearDiff)} de diferença`;

  return (
    <main className="screen screen-pad-footer">
      <TopBar game={game} label={`Foto ${i + 1} de ${game.photos.length} · resultado`} total={totalScore} done={i + 1} current={null} />

      <div className="reveal-head">
        <PhotoCard photo={photo} label={rev.title} size="small" stamp={String(rev.year)} showNotice={false} zoomable />
        <div style={{ minWidth: 0 }}>
          <div className="reveal-score" aria-hidden="true">
            +{fmt(shown)}
          </div>
          <p className="sr-only">Você fez {pts(total)} nesta foto.</p>
          <h2 className="reveal-title">{rev.title}</h2>
          <p className="reveal-sub">
            {rev.city}, {rev.state} · {rev.year}
          </p>
        </div>
      </div>

      <div className="two-cards">
        <div className="card res-card">
          <span className="section-label">Ano</span>
          <span className={`chip ${result.yearColor}`}>{yearChip}</span>
          <p className="line">
            Seu palpite: <b>{result.yearGuess}</b>
          </p>
          <p className="line">
            Correto: <b>{rev.year}</b>
          </p>
          <p className="res-pts">{pts(result.yearScore)}</p>
        </div>
        <div className="card res-card">
          <span className="section-label">Lugar</span>
          <span className={`chip ${result.locationColor}`}>{kmLabel(result.distanceKm)}</span>
          <p className="line">Local da foto:</p>
          <p className="line">
            <b>
              {rev.city}, {rev.state}
            </b>
          </p>
          <p className="res-pts">{pts(result.locationScore)}</p>
        </div>
      </div>

      <div className="panel">
        <div className="map-panel" style={{ padding: 0 }}>
          <BrazilMap guess={result.locationGuess} correct={{ lat: rev.lat, lon: rev.lon }} />
        </div>
        <p className="legend">
          <span>
            <span className="g">●</span> Seu palpite
          </span>
          <span>
            <span className="c">◎</span> Local da foto
          </span>
        </p>
      </div>

      <section className="block">
        <span className="section-label">Linha do tempo</span>
        <div className="panel" style={{ padding: '10px 12px' }}>
          <Timeline guess={result.yearGuess} correct={rev.year} />
        </div>
      </section>

      <section className="block about">
        <span className="section-label">Sobre a foto</span>
        <div className="card">
          <p className="cap">{rev.caption}</p>
          <p className="src">
            Fonte:{' '}
            {rev.sourceUrl ? (
              <a href={rev.sourceUrl} target="_blank" rel="noopener noreferrer">
                {rev.archive}
              </a>
            ) : (
              rev.archive
            )}
          </p>
        </div>
      </section>

      <div className="footer-bar">
        <div className="screen">
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              if (isLast) {
                finish();
                router.push('/resultado');
              } else {
                nextPhoto();
              }
            }}
          >
            {isLast ? 'Ver meu resultado →' : 'Próxima foto →'}
          </button>
        </div>
      </div>
    </main>
  );
}
