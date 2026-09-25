import { NextResponse, type NextRequest } from "next/server";
import { GRACE_MS, INTRO_MS, ROUND_MS, speedPoints, streakBonus } from "@/lib/game";
import { getPokemon } from "@/lib/pokemon";
import { currentPlayer, getDB, getStreak, jsonError } from "@/lib/server";
import type { RoundAnswer } from "@/lib/types";

const EARLY_SLACK_MS = 1_500;

/** Responde una ronda. El tiempo y los puntos los calcula el servidor. */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = (await request.json().catch(() => ({}))) as { choice?: unknown };
  const choice = typeof body.choice === "number" ? body.choice : null;

  const DB = await getDB();
  const player = await currentPlayer(DB);
  if (!player) return jsonError("Primero decinos tu nombre.", 401);

  const round = await DB.prepare(
    "SELECT pokemon_id, options, started_at, answered_at FROM rounds WHERE id = ? AND player_id = ?",
  )
    .bind(id, player.id)
    .first<{ pokemon_id: number; options: string; started_at: number; answered_at: number | null }>();
  if (!round) return jsonError("Ronda inexistente.", 404);
  if (round.answered_at !== null) return jsonError("Esta ronda ya se respondió.", 409);

  const now = Date.now();
  // Nadie puede responder antes de ver la silueta (con margen por latencia).
  if (now - round.started_at < INTRO_MS - EARLY_SLACK_MS) {
    return jsonError("Todavía no apareció la silueta.", 400);
  }
  const elapsedMs = Math.max(0, now - round.started_at - INTRO_MS);
  const options = JSON.parse(round.options) as number[];
  const validChoice = choice !== null && options.includes(choice) ? choice : null;
  const inTime = elapsedMs <= ROUND_MS + GRACE_MS;
  const correct = inTime && validChoice === round.pokemon_id;

  const prevStreak = await getStreak(DB, player.id, round.started_at);
  const alreadyCaught = correct
    ? await DB.prepare("SELECT 1 FROM rounds WHERE player_id = ? AND pokemon_id = ? AND correct = 1")
        .bind(player.id, round.pokemon_id)
        .first()
    : null;
  const bonus = correct ? streakBonus(prevStreak) : 0;
  const points = correct ? speedPoints(elapsedMs) + bonus : 0;

  // `answered_at IS NULL` en el WHERE evita que un doble click puntúe dos veces.
  const { meta } = await DB.prepare(
    `UPDATE rounds SET answered_at = ?, chosen_id = ?, correct = ?, elapsed_ms = ?, points = ?
     WHERE id = ? AND answered_at IS NULL`,
  )
    .bind(now, validChoice, correct ? 1 : 0, Math.min(elapsedMs, ROUND_MS), points, id)
    .run();
  if (meta.changes === 0) return jsonError("Esta ronda ya se respondió.", 409);

  const pokemon = getPokemon(round.pokemon_id);
  const res: RoundAnswer = {
    result: correct ? "hit" : validChoice === null || !inTime ? "timeout" : "miss",
    answer: { id: pokemon.id, name: pokemon.name, types: pokemon.types },
    elapsedMs: Math.min(elapsedMs, ROUND_MS),
    points,
    bonus,
    streak: correct ? prevStreak + 1 : 0,
    newCatch: correct && !alreadyCaught,
  };
  return NextResponse.json(res);
}
