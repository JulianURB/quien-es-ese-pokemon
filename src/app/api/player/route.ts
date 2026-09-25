import { NextResponse, type NextRequest } from "next/server";
import { normalizeName } from "@/lib/game";
import { buildMe, currentPlayer, getDB, jsonError, setPlayerCookie } from "@/lib/server";

/** Registra al entrenador, o le cambia el nombre si ya tiene cookie. */
export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => ({}))) as { name?: unknown };
  const parsed = normalizeName(String(body.name ?? ""));
  if ("error" in parsed) return jsonError(parsed.error, 400);

  const DB = await getDB();
  const existing = await currentPlayer(DB);

  const owner = await DB.prepare("SELECT id FROM players WHERE name_key = ?")
    .bind(parsed.key)
    .first<{ id: string }>();
  if (owner && owner.id !== existing?.id) {
    return jsonError("Ese nombre ya lo tiene otro entrenador. Probá con otro.", 409);
  }

  let player: { id: string; name: string };
  try {
    if (existing) {
      await DB.prepare("UPDATE players SET name = ?, name_key = ? WHERE id = ?")
        .bind(parsed.name, parsed.key, existing.id)
        .run();
      player = { id: existing.id, name: parsed.name };
    } else {
      player = { id: crypto.randomUUID(), name: parsed.name };
      await DB.prepare("INSERT INTO players (id, name, name_key, created_at) VALUES (?, ?, ?, ?)")
        .bind(player.id, parsed.name, parsed.key, Date.now())
        .run();
    }
  } catch {
    // Carrera contra otro registro con el mismo nombre (UNIQUE en name_key).
    return jsonError("Ese nombre ya lo tiene otro entrenador. Probá con otro.", 409);
  }

  const res = NextResponse.json(await buildMe(DB, player));
  setPlayerCookie(res, player.id, request.nextUrl.protocol === "https:");
  return res;
}
