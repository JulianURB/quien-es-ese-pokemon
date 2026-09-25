// Reglas del juego, compartidas entre cliente y servidor.

export const MAX_ATTEMPTS = 5;
export const WINDOW_MS = 30 * 60_000;
export const ROUND_MS = 30_000;
// Duración de la animación "¿Quién es ese Pokémon?" antes de mostrar la silueta.
export const INTRO_MS = 2_800;
// Tolerancia de red / carga de imagen antes de dar la ronda por perdida.
export const GRACE_MS = 5_000;

export const MAX_POINTS = 1_000;
export const MIN_POINTS = 100;
export const STREAK_BONUS = 50;
export const MAX_STREAK_BONUS = 200;

/** Puntos por acertar según cuánto tardó: 1000 al instante, 100 al límite. */
export function speedPoints(elapsedMs: number): number {
  const t = Math.min(Math.max(elapsedMs, 0), ROUND_MS) / ROUND_MS;
  return Math.round(MIN_POINTS + (MAX_POINTS - MIN_POINTS) * (1 - t));
}

export function streakBonus(streakBefore: number): number {
  return Math.min(streakBefore * STREAK_BONUS, MAX_STREAK_BONUS);
}

/** Normaliza el nombre del entrenador. Devuelve el error si no es válido. */
export function normalizeName(
  raw: string,
): { name: string; key: string } | { error: string } {
  const name = raw.trim().replace(/\s+/g, " ");
  if (name.length < 2) return { error: "El nombre tiene que tener al menos 2 letras." };
  if (name.length > 16) return { error: "Máximo 16 caracteres." };
  if (!/^[\p{L}\p{N} _.\-]+$/u.test(name))
    return { error: "Solo letras, números, espacios, guiones y puntos." };
  const key = name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
  return { name, key };
}
