/** Formata segundos como "m:ss". Retorna "0:00" para valores inválidos. */
export function formatTime(seconds) {
  if (Number.isNaN(seconds) || seconds === Infinity || seconds < 0) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}
