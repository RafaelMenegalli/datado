'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { IconCheck, IconChat, IconCopy, IconX } from '@/components/Icons';
import { useGame } from '@/lib/game-context';
import { useCountdown } from '@/lib/hooks';
import { buildShareText, fmt, pad2 } from '@/lib/format';
import { MAX_DAILY, TIERS, photoTotal, tierFor } from '@/lib/scoring';
import type { PhotoResult } from '@/lib/types';

export default function ResultadoPage() {
  const { status, game, stats, isCompleted, inProgress, totalScore, retry } = useGame();
  const router = useRouter();
  const countdown = useCountdown();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (status === 'ready' && !isCompleted) router.replace(inProgress ? '/jogar' : '/');
  }, [status, isCompleted, inProgress, router]);

  if (status === 'error') {
    return (
      <main className="screen">
        <div className="center-msg">
          <p>Não foi possível carregar o seu resultado.</p>
          <button type="button" className="btn btn-primary" style={{ maxWidth: 260 }} onClick={retry}>
            Tentar de novo
          </button>
        </div>
      </main>
    );
  }
  if (status !== 'ready' || !game || !isCompleted) {
    return (
      <main className="screen">
        <div className="center-msg">Carregando…</div>
      </main>
    );
  }

  const results = game.results as PhotoResult[];
  const tier = tierFor(totalScore);
  const shareText = buildShareText(game.editionNumber, totalScore, results);
  const waHref = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
  const avg = stats.gamesPlayed ? Math.round(stats.totalPoints / stats.gamesPlayed) : 0;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = shareText;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="screen screen-pad">
      <header className="res-head">
        <h1>DATADO #{game.editionNumber}</h1>
        <Link href="/" className="icon-btn" aria-label="Voltar ao início">
          <IconX />
        </Link>
      </header>

      <section style={{ textAlign: 'center', marginTop: 10 }}>
        <span className="section-label">Sua pontuação</span>
        <div className="big-score" aria-label={`${fmt(totalScore)} pontos`}>
          {fmt(totalScore)}
        </div>
        <p style={{ color: 'var(--color-texto-sec)', fontSize: 14 }}>de {fmt(MAX_DAILY)} possíveis</p>
      </section>

      <section className="block">
        <span className="section-label">Seu título</span>
        <ul className="ladder">
          {TIERS.map((t) => (
            <li key={t.name} className={t.name === tier.name ? 'earned' : ''} aria-current={t.name === tier.name ? 'true' : undefined}>
              <span className="nm">{t.name}</span>
              <span className="num">{t.label}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="block">
        <span className="section-label">Grade do dia</span>
        <div className="day-grid">
          {results.map((r, i) => (
            <div className="cell" key={i}>
              <div className="thumb" aria-label={`Foto ${i + 1}, ${fmt(photoTotal(r))} pontos`}>
                {i + 1}
              </div>
              <div className={`sq ${r.yearColor}`} title="Ano">
                <span className="sr-only">Ano: </span>±{r.yearDiff}a
              </div>
              <div className={`sq ${r.locationColor}`} title="Lugar">
                <span className="sr-only">Lugar: </span>
                {fmt(r.distanceKm)}km
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="block">
        <span className="section-label">Compartilhar</span>
        <div className="wa" aria-label="Prévia da mensagem">
          {shareText}
        </div>
        <div className="stack" style={{ gap: 10, marginTop: 12 }}>
          <a className="btn btn-primary" href={waHref} target="_blank" rel="noopener noreferrer">
            <IconChat /> WhatsApp
          </a>
          <button type="button" className="btn btn-secondary" onClick={copy} aria-live="polite">
            {copied ? (
              <>
                Copiado! <IconCheck />
              </>
            ) : (
              <>
                <IconCopy /> Copiar
              </>
            )}
          </button>
        </div>
      </section>

      <section className="block" style={{ textAlign: 'center' }}>
        <span className="section-label">Próxima edição em</span>
        <div className="countdown" role="timer" aria-live="off">
          {countdown ? `${pad2(countdown.hours)}:${pad2(countdown.minutes)}:${pad2(countdown.seconds)}` : '--:--:--'}
        </div>
      </section>

      <section className="block">
        <span className="section-label">Estatísticas</span>
        <div className="card stats">
          <div className="stat">
            <span className="v">{fmt(stats.gamesPlayed)}</span>
            <span className="l">Jogos jogados</span>
          </div>
          <div className="stat">
            <span className="v">{fmt(stats.currentStreak)}</span>
            <span className="l">Sequência atual</span>
          </div>
          <div className="stat">
            <span className="v">{fmt(stats.bestStreak)}</span>
            <span className="l">Melhor sequência</span>
          </div>
          <div className="stat">
            <span className="v">{fmt(avg)}</span>
            <span className="l">Pontuação média</span>
          </div>
        </div>
      </section>

      <div style={{ textAlign: 'center', marginTop: 12 }}>
        <Link href="/" className="text-link">
          Voltar ao início
        </Link>
      </div>
    </main>
  );
}
