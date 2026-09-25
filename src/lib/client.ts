import type { Me, RoundResult } from "./types";

export const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data: Record<string, unknown>,
  ) {
    super(message);
  }
}

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}/api${path}`, {
    ...init,
    headers: { "content-type": "application/json" },
    cache: "no-store",
  });
  const data = (await res.json().catch(() => ({}))) as Record<string, unknown> & { error?: string };
  if (!res.ok) throw new ApiError(data.error ?? "Algo salió mal. Probá de nuevo.", res.status, data);
  return data as T;
}

export const roundImageUrl = (roundId: string) => `${BASE}/api/round/${roundId}/image`;

export const fmt = (n: number) => new Intl.NumberFormat("es-AR").format(n);
export const seconds = (ms: number) => `${(ms / 1000).toFixed(1).replace(".", ",")} s`;

export function countdown(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function timeAgo(at: number, now: number): string {
  const s = Math.max(0, Math.round((now - at) / 1000));
  if (s < 60) return "recién";
  const m = Math.round(s / 60);
  if (m < 60) return `hace ${m} min`;
  const h = Math.round(m / 60);
  if (h < 24) return `hace ${h} h`;
  return `hace ${Math.round(h / 24)} d`;
}

const EMOJI: Record<RoundResult, string> = { hit: "🟩", miss: "🟥", timeout: "⬛" };

export function shareText(me: Me | null): string {
  const recent = me?.recent ?? [];
  if (recent.length === 0) {
    return "🎮 ¿Quién es ese Pokémon? Adiviná la silueta en 30 segundos. ¿Te animás?";
  }
  const squares = recent.map((r) => EMOJI[r.result]).join("");
  const total = recent.reduce((sum, r) => sum + r.points, 0);
  return `🎮 ¿Quién es ese Pokémon?\n${squares}  ${fmt(total)} pts\n¿Me ganás?`;
}

/** Comparte con la hoja nativa del celular, o copia al portapapeles. */
export async function shareApp(text: string): Promise<"shared" | "copied" | "failed"> {
  const url = `${location.origin}${BASE}/`;
  if (navigator.share) {
    try {
      await navigator.share({ title: "¿Quién es ese Pokémon?", text, url });
      return "shared";
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") return "failed";
    }
  }
  try {
    await navigator.clipboard.writeText(`${text}\n${url}`);
    return "copied";
  } catch {
    return "failed";
  }
}
