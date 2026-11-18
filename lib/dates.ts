/** Edition date in Brasília time (UTC-3). A new edition starts at 03:00 UTC. */
export function getTodayEditionDate(now: Date = new Date()): string {
  const brasilia = new Date(now.getTime() - 3 * 60 * 60 * 1000);
  return brasilia.toISOString().split('T')[0];
}

export function getCountdownToNextEdition(now: Date = new Date()): {
  hours: number;
  minutes: number;
  seconds: number;
} {
  const next = new Date(now.getTime());
  next.setUTCHours(3, 0, 0, 0);
  if (now.getUTCHours() >= 3) next.setUTCDate(next.getUTCDate() + 1);
  const diff = next.getTime() - now.getTime();
  return {
    hours: Math.floor(diff / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
  };
}

export function shiftDate(date: string, days: number): string {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().split('T')[0];
}

/** "quarta, 18 de novembro" */
export function formatEditionDate(date: string): string {
  const d = new Date(`${date}T12:00:00Z`);
  return new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    timeZone: 'UTC',
  })
    .format(d)
    .replace('-feira', '');
}
