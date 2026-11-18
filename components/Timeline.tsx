import { MAX_YEAR, MIN_YEAR } from './YearPicker';

const pct = (y: number) => ((y - MIN_YEAR) / (MAX_YEAR - MIN_YEAR)) * 100;

export function Timeline({ guess, correct }: { guess: number; correct: number }) {
  const lo = Math.min(guess, correct);
  const hi = Math.max(guess, correct);
  const same = guess === correct;
  return (
    <div role="img" aria-label={`Linha do tempo: seu palpite ${guess}, ano correto ${correct}`}>
      <div className="timeline">
        <div className="bar" />
        {!same && <div className="seg-hi" style={{ left: `${pct(lo)}%`, width: `${pct(hi) - pct(lo)}%` }} />}
        <div className="mk right" style={{ left: `${pct(correct)}%` }} />
        <div className="mk guess" style={{ left: `${pct(guess)}%` }} />
        <span className="lbl up" style={{ left: `${pct(guess)}%` }}>
          {guess}
        </span>
        <span className="lbl down" style={{ left: `${pct(correct)}%` }}>
          {same ? `${correct} ✓` : correct}
        </span>
      </div>
      <div className="timeline-ticks" aria-hidden="true">
        <span>{MIN_YEAR}</span>
        <span>{MAX_YEAR}</span>
      </div>
    </div>
  );
}
