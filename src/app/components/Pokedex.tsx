"use client";

import { useEffect } from "react";
import { POKEMON_COUNT, getPokemon, spriteUrl } from "@/lib/pokemon";

export function Pokedex({ caught, onClose }: { caught: number[]; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const pct = (caught.length / POKEMON_COUNT) * 100;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 backdrop-blur-sm sm:items-center"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Tu Pokédex"
    >
      <div className="panel pop-in flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between gap-3 bg-poke-red px-5 py-4">
          <h2 className="font-display text-2xl tracking-wide text-white">📕 Tu Pokédex</h2>
          <button onClick={onClose} className="btn h-9 w-9 bg-black/20 text-white" aria-label="Cerrar">
            ✕
          </button>
        </div>
        <div className="px-5 pt-4">
          <div className="mb-1 flex justify-between text-sm font-bold">
            <span>Atrapados</span>
            <span className="tabular-nums">
              {caught.length} / {POKEMON_COUNT}
            </span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-black/40">
            <div className="h-full rounded-full bg-gradient-to-r from-poke-yellow to-ok transition-all" style={{ width: `${pct}%` }} />
          </div>
        </div>
        <div className="overflow-y-auto p-5">
          {caught.length === 0 ? (
            <p className="py-10 text-center text-muted">Todavía no atrapaste ninguno. ¡Acertá para sumarlos acá!</p>
          ) : (
            <ul className="grid grid-cols-3 gap-2 sm:grid-cols-5">
              {caught.map((id) => (
                <li key={id} className="flex flex-col items-center rounded-xl bg-white/5 p-2 text-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={spriteUrl(id)} alt="" width={72} height={72} className="[image-rendering:pixelated]" loading="lazy" />
                  <span className="text-[10px] font-bold text-muted">#{String(id).padStart(3, "0")}</span>
                  <span className="w-full truncate text-xs font-extrabold">{getPokemon(id).name}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
