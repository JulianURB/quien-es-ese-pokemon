"use client";

import { useEffect, useState } from "react";
import { api, fmt, seconds, timeAgo } from "@/lib/client";
import { spriteUrl } from "@/lib/pokemon";
import type { Leaderboard as Data } from "@/lib/types";

const MEDALS = ["🥇", "🥈", "🥉"];

export function Leaderboard({ refreshKey }: { refreshKey: number }) {
  const [period, setPeriod] = useState<"today" | "all">("today");
  const [data, setData] = useState<Data | null>(null);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    let alive = true;
    const load = () =>
      api<Data>(`/leaderboard?period=${period}`)
        .then((d) => {
          if (alive) {
            setData(d);
            setNow(Date.now());
          }
        })
        .catch(() => {});
    load();
    const id = setInterval(load, 15_000);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, [period, refreshKey]);

  const meInTop = data?.entries.some((e) => e.me);

  return (
    <section className="panel p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="font-display text-2xl tracking-wide">🏆 Ranking</h2>
        <div className="flex rounded-full bg-black/30 p-1 text-sm font-bold" role="tablist">
          {(["today", "all"] as const).map((p) => (
            <button
              key={p}
              role="tab"
              aria-selected={period === p}
              onClick={() => setPeriod(p)}
              className={`rounded-full px-3 py-1 transition ${period === p ? "bg-poke-yellow text-black" : "text-muted hover:text-text"}`}
            >
              {p === "today" ? "Hoy" : "Histórico"}
            </button>
          ))}
        </div>
      </div>

      {!data ? (
        <ul className="space-y-2">
          {Array.from({ length: 5 }, (_, i) => (
            <li key={i} className="h-11 animate-pulse rounded-xl bg-white/5" />
          ))}
        </ul>
      ) : data.entries.length === 0 ? (
        <p className="rounded-xl bg-white/5 p-4 text-center text-muted">
          Nadie jugó todavía {period === "today" ? "hoy" : ""}. ¡Sé el primero en el ranking!
        </p>
      ) : (
        <ol className="space-y-1.5">
          {data.entries.map((e) => (
            <li
              key={e.rank}
              className={`flex items-center gap-3 rounded-xl px-3 py-2 ${
                e.me ? "bg-poke-yellow/15 ring-1 ring-poke-yellow/60" : e.rank <= 3 ? "bg-white/[.07]" : "bg-white/[.03]"
              }`}
            >
              <span className="w-7 text-center text-lg font-black tabular-nums">{MEDALS[e.rank - 1] ?? e.rank}</span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-extrabold">
                  {e.name} {e.me && <span className="text-xs text-poke-yellow">(vos)</span>}
                </span>
                <span className="block text-xs text-muted">
                  {e.hits}/{e.played} aciertos{e.bestMs !== null && ` · mejor ${seconds(e.bestMs)}`}
                </span>
              </span>
              <span className="font-display text-xl tabular-nums text-poke-yellow">{fmt(e.score)}</span>
            </li>
          ))}
          {data.me && !meInTop && (
            <li className="mt-2 flex items-center gap-3 rounded-xl bg-poke-yellow/15 px-3 py-2 ring-1 ring-poke-yellow/60">
              <span className="w-7 text-center font-black tabular-nums">{data.me.rank}</span>
              <span className="flex-1 font-extrabold">Vos</span>
              <span className="font-display text-xl tabular-nums text-poke-yellow">{fmt(data.me.score)}</span>
            </li>
          )}
        </ol>
      )}

      {data && data.players > 0 && (
        <p className="mt-3 text-center text-xs text-muted">
          {data.players} {data.players === 1 ? "entrenador jugó" : "entrenadores jugaron"} {period === "today" ? "hoy" : "en total"}
        </p>
      )}

      {data && data.feed.length > 0 && (
        <div className="mt-5 border-t border-line pt-4">
          <h3 className="mb-2 flex items-center gap-2 text-sm font-extrabold uppercase tracking-wider text-muted">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-ok opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-ok" />
            </span>
            Últimas capturas
          </h3>
          <ul className="space-y-1">
            {data.feed.map((f, i) => (
              <li key={`${f.at}-${i}`} className="feed-item flex items-center gap-2 text-sm" style={{ animationDelay: `${i * 40}ms` }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={spriteUrl(f.pokemonId)} alt="" width={36} height={36} className="-my-1 [image-rendering:pixelated]" />
                <span className="min-w-0 flex-1 truncate">
                  <b>{f.name}</b> atrapó a <b className="text-poke-yellow">{f.pokemonName}</b> en {seconds(f.elapsedMs)}
                </span>
                <span className="shrink-0 text-xs text-muted">{timeAgo(f.at, now)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
