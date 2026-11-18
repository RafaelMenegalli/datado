import { COLOR_NAME } from '@/lib/format';
import type { PhotoResult } from '@/lib/types';

/** done = photos already finished; current = index of the photo in play (or null). */
export function ProgressBar({ done, current }: { done: number; current: number | null }) {
  return (
    <div className="progress" aria-hidden="true">
      {[0, 1, 2, 3, 4].map((i) => (
        <i key={i} className={i < done ? 'done' : i === current ? 'current' : ''} />
      ))}
    </div>
  );
}

/** Two rows of small coloured squares: year on top, location below. */
export function MiniGrid({ results }: { results: PhotoResult[] }) {
  const desc = (key: 'yearColor' | 'locationColor') => results.map((r) => COLOR_NAME[r[key]]).join(', ');
  return (
    <div className="mini-grid">
      <span className="sr-only">
        Ano: {desc('yearColor')}. Lugar: {desc('locationColor')}.
      </span>
      {(['yearColor', 'locationColor'] as const).map((k) => (
        <div className="row" key={k} aria-hidden="true">
          {results.map((r, i) => (
            <span key={i} className={`sq ${r[k]}`} />
          ))}
        </div>
      ))}
    </div>
  );
}
