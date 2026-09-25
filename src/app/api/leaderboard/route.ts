import { NextResponse, type NextRequest } from "next/server";
import { getPokemon } from "@/lib/pokemon";
import { currentPlayer, getDB, getRank, startOfToday } from "@/lib/server";
import type { Leaderboard } from "@/lib/types";

export const dynamic = "force-dynamic";

const TOP = 10;

export async function GET(request: NextRequest) {
  const period = request.nextUrl.searchParams.get("period") === "today" ? "today" : "all";
  const since = period === "today" ? startOfToday(Date.now()) : 0;

  const DB = await getDB();
  const player = await currentPlayer(DB);

  const [top, me, feed, players] = await Promise.all([
    DB.prepare(
      `SELECT p.name, p.id = ?1 AS me, SUM(r.points) AS score, SUM(r.correct) AS hits, COUNT(*) AS played,
              MIN(CASE WHEN r.correct = 1 THEN r.elapsed_ms END) AS best_ms
       FROM rounds r JOIN players p ON p.id = r.player_id
       WHERE r.started_at >= ?2
       GROUP BY p.id
       ORDER BY score DESC, best_ms ASC
       LIMIT ?3`,
    )
      .bind(player?.id ?? "", since, TOP)
      .all<{ name: string; me: number; score: number; hits: number; played: number; best_ms: number | null }>(),
    player ? getRank(DB, player.id, since) : null,
    DB.prepare(
      `SELECT p.name, r.pokemon_id, r.elapsed_ms, r.answered_at
       FROM rounds r JOIN players p ON p.id = r.player_id
       WHERE r.correct = 1 ORDER BY r.answered_at DESC LIMIT 8`,
    ).all<{ name: string; pokemon_id: number; elapsed_ms: number; answered_at: number }>(),
    DB.prepare("SELECT COUNT(DISTINCT player_id) AS n FROM rounds WHERE started_at >= ?")
      .bind(since)
      .first<{ n: number }>(),
  ]);

  const body: Leaderboard = {
    entries: top.results.map((r, i) => ({
      rank: i + 1,
      name: r.name,
      score: r.score,
      hits: r.hits,
      played: r.played,
      bestMs: r.best_ms,
      me: r.me === 1,
    })),
    me: me ?? null,
    feed: feed.results.map((r) => ({
      name: r.name,
      pokemonId: r.pokemon_id,
      pokemonName: getPokemon(r.pokemon_id).name,
      elapsedMs: r.elapsed_ms,
      at: r.answered_at,
    })),
    players: players?.n ?? 0,
  };
  return NextResponse.json(body);
}
