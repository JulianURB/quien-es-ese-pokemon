import { NextResponse } from "next/server";
import { MAX_ATTEMPTS, WINDOW_MS } from "@/lib/game";
import { getPokemon, pickRound } from "@/lib/pokemon";
import { currentPlayer, getAttempts, getDB, jsonError } from "@/lib/server";
import type { RoundStart } from "@/lib/types";

/** Arranca una ronda: consume un intento y guarda la respuesta del lado del servidor. */
export async function POST() {
  const DB = await getDB();
  const player = await currentPlayer(DB);
  if (!player) return jsonError("Primero decinos tu nombre.", 401);

  const { results: seen } = await DB.prepare(
    "SELECT pokemon_id FROM rounds WHERE player_id = ? ORDER BY started_at DESC LIMIT 30",
  )
    .bind(player.id)
    .all<{ pokemon_id: number }>();
  const { answer, options } = pickRound(new Set(seen.map((r) => r.pokemon_id)));

  const now = Date.now();
  const roundId = crypto.randomUUID();

  // El chequeo del cupo y el insert van en una sola sentencia: dos pedidos en
  // paralelo no pueden colarse un sexto intento.
  const { meta } = await DB.prepare(
    `INSERT INTO rounds (id, player_id, pokemon_id, options, started_at)
     SELECT ?1, ?2, ?3, ?4, ?5
     WHERE (SELECT COUNT(*) FROM rounds WHERE player_id = ?2 AND started_at > ?6) < ?7`,
  )
    .bind(roundId, player.id, answer, JSON.stringify(options), now, now - WINDOW_MS, MAX_ATTEMPTS)
    .run();

  const attempts = await getAttempts(DB, player.id, now);
  if (meta.changes === 0) {
    return jsonError("Ya usaste tus intentos. Esperá a que se recarguen.", 429, { attempts });
  }

  const body: RoundStart = {
    roundId,
    options: options.map((id) => ({ id, name: getPokemon(id).name })),
    attempts,
  };
  return NextResponse.json(body);
}
