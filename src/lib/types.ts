// Formas de las respuestas de la API.

export type RoundResult = "hit" | "miss" | "timeout";

export interface Attempts {
  used: number;
  left: number;
  max: number;
  /** Cuándo se libera el próximo intento (ms epoch), si hay alguno usado. */
  nextAt: number | null;
}

export interface Me {
  player: { name: string } | null;
  attempts: Attempts;
  stats: {
    score: number;
    rank: number | null;
    played: number;
    hits: number;
    bestMs: number | null;
    streak: number;
  };
  /** Rondas de la ventana actual de 30 minutos, para compartir el resultado. */
  recent: { result: RoundResult; points: number }[];
  caught: number[];
}

export interface RoundStart {
  roundId: string;
  options: { id: number; name: string }[];
  attempts: Attempts;
}

export interface RoundAnswer {
  result: RoundResult;
  answer: { id: number; name: string; types: string[] };
  elapsedMs: number;
  points: number;
  bonus: number;
  streak: number;
  newCatch: boolean;
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  score: number;
  hits: number;
  played: number;
  bestMs: number | null;
  me: boolean;
}

export interface Leaderboard {
  entries: LeaderboardEntry[];
  me: { rank: number; score: number } | null;
  feed: { name: string; pokemonId: number; pokemonName: string; elapsedMs: number; at: number }[];
  players: number;
}
