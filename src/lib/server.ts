import { getCloudflareContext } from "@opennextjs/cloudflare";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { MAX_ATTEMPTS, WINDOW_MS } from "./game";
import type { Attempts, Me, RoundResult } from "./types";

// El id del jugador es su credencial: vive solo en esta cookie httpOnly.
export const PLAYER_COOKIE = "wtp_pid";

export async function getDB(): Promise<D1Database> {
  const { env } = await getCloudflareContext({ async: true });
  return env.DB;
}

export function jsonError(error: string, status: number, extra?: object) {
  return NextResponse.json({ error, ...extra }, { status });
}

export async function currentPlayer(DB: D1Database) {
  const id = (await cookies()).get(PLAYER_COOKIE)?.value;
  if (!id) return null;
  return DB.prepare("SELECT id, name FROM players WHERE id = ?")
    .bind(id)
    .first<{ id: string; name: string }>();
}

export function setPlayerCookie(res: NextResponse, id: string, secure: boolean) {
  res.cookies.set(PLAYER_COOKIE, id, {
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
}

/** Inicio del día en Argentina (UTC-3, sin horario de verano). */
export function startOfToday(now: number): number {
  const DAY = 86_400_000;
  const OFFSET = 3 * 3_600_000;
  return Math.floor((now - OFFSET) / DAY) * DAY + OFFSET;
}

export async function getAttempts(DB: D1Database, playerId: string, now: number): Promise<Attempts> {
  const { results } = await DB.prepare(
    "SELECT started_at FROM rounds WHERE player_id = ? AND started_at > ? ORDER BY started_at",
  )
    .bind(playerId, now - WINDOW_MS)
    .all<{ started_at: number }>();
  const used = results.length;
  return {
    used,
    left: Math.max(0, MAX_ATTEMPTS - used),
    max: MAX_ATTEMPTS,
    nextAt: used > 0 ? results[0].started_at + WINDOW_MS : null,
  };
}

export function roundResult(r: { answered_at: number | null; chosen_id: number | null; correct: number }): RoundResult {
  if (r.correct) return "hit";
  return r.answered_at === null || r.chosen_id === null ? "timeout" : "miss";
}

/** Rondas de aciertos seguidos, desde la más reciente hacia atrás. */
export async function getStreak(DB: D1Database, playerId: string, before: number): Promise<number> {
  const { results } = await DB.prepare(
    "SELECT correct FROM rounds WHERE player_id = ? AND started_at < ? ORDER BY started_at DESC LIMIT 10",
  )
    .bind(playerId, before)
    .all<{ correct: number }>();
  let streak = 0;
  for (const r of results) {
    if (!r.correct) break;
    streak++;
  }
  return streak;
}

/** Puesto del jugador en el ranking desde `since`, o null si no jugó. */
export async function getRank(DB: D1Database, playerId: string, since: number) {
  return DB.prepare(
    `WITH t AS (
       SELECT player_id, SUM(points) AS score FROM rounds WHERE started_at >= ?2 GROUP BY player_id
     )
     SELECT (SELECT COUNT(*) FROM t WHERE score > mine.score) + 1 AS rank, mine.score AS score
     FROM t AS mine WHERE mine.player_id = ?1`,
  )
    .bind(playerId, since)
    .first<{ rank: number; score: number }>();
}

export async function buildMe(DB: D1Database, player: { id: string; name: string } | null): Promise<Me> {
  const now = Date.now();
  const empty: Me = {
    player: null,
    attempts: { used: 0, left: MAX_ATTEMPTS, max: MAX_ATTEMPTS, nextAt: null },
    stats: { score: 0, rank: null, played: 0, hits: 0, bestMs: null, streak: 0 },
    recent: [],
    caught: [],
  };
  if (!player) return empty;

  const [attempts, totals, rank, streak, recent, caught] = await Promise.all([
    getAttempts(DB, player.id, now),
    DB.prepare(
      `SELECT COALESCE(SUM(points), 0) AS score, COALESCE(SUM(correct), 0) AS hits, COUNT(*) AS played,
              MIN(CASE WHEN correct = 1 THEN elapsed_ms END) AS best_ms
       FROM rounds WHERE player_id = ?`,
    )
      .bind(player.id)
      .first<{ score: number; hits: number; played: number; best_ms: number | null }>(),
    getRank(DB, player.id, 0),
    getStreak(DB, player.id, now + 1),
    DB.prepare(
      "SELECT answered_at, chosen_id, correct, points FROM rounds WHERE player_id = ? AND started_at > ? ORDER BY started_at",
    )
      .bind(player.id, now - WINDOW_MS)
      .all<{ answered_at: number | null; chosen_id: number | null; correct: number; points: number }>(),
    DB.prepare("SELECT DISTINCT pokemon_id FROM rounds WHERE player_id = ? AND correct = 1 ORDER BY pokemon_id")
      .bind(player.id)
      .all<{ pokemon_id: number }>(),
  ]);

  return {
    player: { name: player.name },
    attempts,
    stats: {
      score: totals?.score ?? 0,
      rank: rank?.rank ?? null,
      played: totals?.played ?? 0,
      hits: totals?.hits ?? 0,
      bestMs: totals?.best_ms ?? null,
      streak,
    },
    recent: recent.results.map((r) => ({ result: roundResult(r), points: r.points })),
    caught: caught.results.map((r) => r.pokemon_id),
  };
}
