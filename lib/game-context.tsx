'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { getTodayEditionDate } from './dates';
import { computeResult, photoTotal } from './scoring';
import {
  EMPTY_STATS,
  KEYS,
  applyCompletedGame,
  displayStreak,
  readJSON,
  readStats,
  writeJSON,
} from './storage';
import type { EditionPublic, GameState, LatLon, LocalStats, PhotoResult, Reveal } from './types';

type Status = 'loading' | 'ready' | 'error';

interface GameContextValue {
  status: Status;
  edition: EditionPublic | null;
  game: GameState | null;
  stats: LocalStats;
  streak: number;
  /** All 5 photos have been guessed. */
  isCompleted: boolean;
  /** Any guess made, but not finished. */
  inProgress: boolean;
  totalScore: number;
  retry: () => void;
  setYearGuess: (year: number) => void;
  setLocationGuess: (loc: LatLon) => void;
  /** Returns false if the answer could not be loaded (offline). */
  confirmGuess: () => Promise<boolean>;
  nextPhoto: () => void;
  finish: () => void;
}

const GameContext = createContext<GameContextValue | null>(null);

function newGame(ed: EditionPublic): GameState {
  return {
    editionNumber: ed.editionNumber,
    editionDate: ed.editionDate,
    photos: ed.photos,
    currentPhotoIndex: 0,
    phase: 'guessing',
    guesses: ed.photos.map(() => ({ yearGuess: null, locationGuess: null })),
    results: ed.photos.map(() => null),
    reveals: ed.photos.map(() => null),
    token: ed.token,
  };
}

/** Versões antigas guardavam as respostas no navegador: apaga. */
function purgeLegacyStorage() {
  try {
    for (const k of Object.keys(window.localStorage)) {
      if (k.startsWith('datado:game:v1:') || k.startsWith('datado:edition:v1:')) window.localStorage.removeItem(k);
    }
  } catch {}
}

const setAt = <T,>(arr: T[], i: number, v: T) => arr.map((x, j) => (j === i ? v : x));

type RevealResult = { ok: true; reveal: Reveal; token: string } | { ok: false; status: number };

/** A resposta só é entregue pelo servidor depois do palpite, na ordem, com o token de progresso. */
async function postGuess(
  editionNumber: number,
  i: number,
  token: string,
  yearGuess: number,
  loc: LatLon,
): Promise<RevealResult> {
  try {
    const res = await fetch(`/api/edition/${editionNumber}/reveal/${i}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, yearGuess, lat: loc.lat, lon: loc.lon }),
    });
    if (!res.ok) return { ok: false, status: res.status };
    const data = (await res.json()) as { reveal: Reveal; token: string };
    return { ok: true, reveal: data.reveal, token: data.token };
  } catch {
    return { ok: false, status: 0 };
  }
}

export function GameProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<Status>('loading');
  const [edition, setEdition] = useState<EditionPublic | null>(null);
  const [game, setGame] = useState<GameState | null>(null);
  const [stats, setStats] = useState<LocalStats>(EMPTY_STATS);
  const [today, setToday] = useState<string>('');
  const gameRef = useRef<GameState | null>(null);
  const statsRef = useRef<LocalStats>(EMPTY_STATS);

  const commit = useCallback((fn: (g: GameState) => GameState) => {
    if (!gameRef.current) return;
    const next = fn(gameRef.current);
    gameRef.current = next;
    setGame(next);
    writeJSON(KEYS.game(next.editionDate), next);
  }, []);

  const load = useCallback(async () => {
    setStatus('loading');
    purgeLegacyStorage();
    const date = getTodayEditionDate();
    // Sempre busca a edição atual (imagens e token novos); o cache só serve de reserva sem internet.
    let ed: EditionPublic | null = null;
    try {
      const res = await fetch('/api/edition/today', { cache: 'no-store' });
      if (!res.ok) throw new Error(String(res.status));
      ed = (await res.json()) as EditionPublic;
      writeJSON(KEYS.edition(ed.editionDate), ed);
    } catch {
      ed = readJSON<EditionPublic>(KEYS.edition(date));
    }
    if (!ed) {
      setStatus('error');
      return;
    }
    const saved = readJSON<GameState>(KEYS.game(ed.editionDate));
    // Mantém o progresso salvo, mas com as imagens da edição atual.
    const g =
      saved && saved.editionNumber === ed.editionNumber && saved.token ? { ...saved, photos: ed.photos } : newGame(ed);
    gameRef.current = g;
    statsRef.current = readStats();
    setEdition(ed);
    setGame(g);
    setStats(statsRef.current);
    setToday(date);
    setStatus('ready');
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  // Reload when the tab comes back after midnight (Brasília).
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === 'visible' && today && getTodayEditionDate() !== today) void load();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [today, load]);

  const setYearGuess = useCallback(
    (year: number) =>
      commit((g) => {
        if (g.phase !== 'guessing') return g;
        const i = g.currentPhotoIndex;
        return { ...g, guesses: setAt(g.guesses, i, { ...g.guesses[i], yearGuess: year }) };
      }),
    [commit],
  );

  const setLocationGuess = useCallback(
    (loc: LatLon) =>
      commit((g) => {
        if (g.phase !== 'guessing') return g;
        const i = g.currentPhotoIndex;
        return { ...g, guesses: setAt(g.guesses, i, { ...g.guesses[i], locationGuess: loc }) };
      }),
    [commit],
  );

  const confirmGuess = useCallback(async () => {
    const g = gameRef.current;
    if (!g || g.phase !== 'guessing') return false;
    const i = g.currentPhotoIndex;
    const { yearGuess, locationGuess } = g.guesses[i];
    if (yearGuess == null || !locationGuess) return false;

    const got = await postGuess(g.editionNumber, i, g.token, yearGuess, locationGuess);
    if (!got.ok) {
      // 401 = virou o dia ou token antigo: descarta o cache e recarrega a edição.
      if (got.status === 401) {
        try {
          window.localStorage.removeItem(KEYS.edition(g.editionDate));
        } catch {}
        void load();
      }
      return false;
    }
    const rev = got.reveal;

    const result = computeResult(yearGuess, locationGuess, rev);
    commit((cur) => ({
      ...cur,
      phase: 'revealing',
      results: setAt(cur.results, i, result),
      reveals: setAt(cur.reveals, i, rev),
      token: got.token,
    }));

    const done = gameRef.current!.results;
    if (done.every(Boolean)) {
      const next = applyCompletedGame(statsRef.current, g.editionDate, g.editionNumber, done as PhotoResult[]);
      statsRef.current = next;
      setStats(next);
      writeJSON(KEYS.stats, next);
    }
    return true;
  }, [commit, load]);

  const nextPhoto = useCallback(
    () =>
      commit((g) =>
        g.phase === 'revealing' && g.currentPhotoIndex < g.photos.length - 1
          ? { ...g, phase: 'guessing', currentPhotoIndex: g.currentPhotoIndex + 1 }
          : g,
      ),
    [commit],
  );

  const finish = useCallback(() => commit((g) => ({ ...g, phase: 'completed' })), [commit]);

  const value = useMemo<GameContextValue>(() => {
    const results = game?.results ?? [];
    const isCompleted = results.length > 0 && results.every(Boolean);
    const inProgress =
      !!game &&
      !isCompleted &&
      (game.currentPhotoIndex > 0 ||
        game.phase !== 'guessing' ||
        game.guesses[0].yearGuess != null ||
        game.guesses[0].locationGuess != null);
    const totalScore = results.reduce((s, r) => s + (r ? photoTotal(r) : 0), 0);
    return {
      status,
      edition,
      game,
      stats,
      streak: today ? displayStreak(stats, today) : 0,
      isCompleted,
      inProgress,
      totalScore,
      retry: () => void load(),
      setYearGuess,
      setLocationGuess,
      confirmGuess,
      nextPhoto,
      finish,
    };
  }, [status, edition, game, stats, today, load, setYearGuess, setLocationGuess, confirmGuess, nextPhoto, finish]);

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame(): GameContextValue {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used inside <GameProvider>');
  return ctx;
}
