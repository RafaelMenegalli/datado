'use client';

import { useEffect, useId, useRef } from 'react';
import { IconMinus, IconPlus } from './Icons';

export const MIN_YEAR = 1880;
export const MAX_YEAR = 2025;
export const DEFAULT_YEAR = 1950;
const MARKS = [1880, 1920, 1960, 2000, 2025];

interface Props {
  value: number | null;
  onChange: (year: number) => void;
}

const clamp = (n: number) => Math.min(MAX_YEAR, Math.max(MIN_YEAR, n));

export function YearPicker({ value, onChange }: Props) {
  const id = useId();
  const shown = value ?? DEFAULT_YEAR;
  const latest = useRef(shown);
  latest.current = shown;
  const cb = useRef(onChange);
  cb.current = onChange;
  const timers = useRef<{ delay?: number; repeat?: number }>({});

  const stop = () => {
    window.clearTimeout(timers.current.delay);
    window.clearInterval(timers.current.repeat);
  };
  useEffect(() => stop, []);

  const step = (d: number) => {
    const next = clamp(latest.current + d);
    latest.current = next;
    cb.current(next);
  };

  const startHold = (d: number) => {
    stop();
    step(d);
    timers.current.delay = window.setTimeout(() => {
      timers.current.repeat = window.setInterval(() => step(d), 70);
    }, 400);
    window.addEventListener('pointerup', stop, { once: true });
    window.addEventListener('pointercancel', stop, { once: true });
  };

  const holdProps = (d: number) => ({
    onPointerDown: (e: React.PointerEvent) => {
      if (e.button !== 0) return;
      startHold(d);
    },
    // Keyboard activation (Enter/Space) fires click with detail 0; mouse/touch is handled above.
    onClick: (e: React.MouseEvent) => {
      if (e.detail === 0) step(d);
    },
    onContextMenu: (e: React.MouseEvent) => e.preventDefault(),
  });

  return (
    <div>
      <label htmlFor={id} className="section-label">
        Seu palpite
      </label>
      <div className="year-row">
        <button type="button" className="pm-btn" aria-label="Voltar um ano" {...holdProps(-1)}>
          <IconMinus />
        </button>
        <div className={`year-num ${value == null ? 'unset' : ''}`} aria-hidden="true">
          {value == null ? '????' : value}
        </div>
        <button type="button" className="pm-btn" aria-label="Avançar um ano" {...holdProps(1)}>
          <IconPlus />
        </button>
      </div>
      <input
        id={id}
        className="slider"
        type="range"
        min={MIN_YEAR}
        max={MAX_YEAR}
        step={1}
        value={shown}
        aria-valuetext={value == null ? 'Nenhum ano escolhido' : String(value)}
        onChange={(e) => onChange(Number(e.target.value))}
        // Touching the ruler counts as a guess even without moving it.
        onPointerDown={() => value == null && onChange(shown)}
      />
      <div className="marks" aria-hidden="true">
        {MARKS.map((y) => (
          <span key={y} style={{ left: `${((y - MIN_YEAR) / (MAX_YEAR - MIN_YEAR)) * 100}%` }}>
            {y}
          </span>
        ))}
      </div>
    </div>
  );
}
