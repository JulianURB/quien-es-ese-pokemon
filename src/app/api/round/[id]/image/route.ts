import { artworkUrl } from "@/lib/pokemon";
import { getDB, jsonError } from "@/lib/server";

// La imagen sale por acá para que la URL no delate el número del Pokémon.
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const DB = await getDB();
  const round = await DB.prepare("SELECT pokemon_id FROM rounds WHERE id = ?")
    .bind(id)
    .first<{ pokemon_id: number }>();
  if (!round) return jsonError("Ronda inexistente.", 404);

  const upstream = await fetch(artworkUrl(round.pokemon_id)).catch(() => null);
  if (!upstream?.ok) return jsonError("No se pudo cargar la imagen.", 502);

  return new Response(upstream.body, {
    headers: {
      "content-type": "image/png",
      "cache-control": "private, max-age=3600",
    },
  });
}
