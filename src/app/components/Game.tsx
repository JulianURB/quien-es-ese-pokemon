"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { INTRO_MS, normalizeName } from "@/lib/game";
import { POKEMON_COUNT } from "@/lib/pokemon";
import { ApiError, api, countdown, fmt, roundImageUrl, seconds, shareApp, shareText } from "@/lib/client";
import { setMuted, sfx } from "@/lib/sfx";
import type { Attempts, Me, RoundAnswer, RoundStart } from "@/lib/types";
import { Confetti } from "./Confetti";
import { CountUp } from "./CountUp";
import { Leaderboard } from "./Leaderboard";
import { Pokeball } from "./Pokeball";
import { Pokedex } from "./Pokedex";
import { Timer } from "./Timer";
import { TypeChip } from "./TypeChip";

type Phase = "loading" | "name" | "lobby" | "intro" | "question" | "answering" | "result";

const MUTE_KEY = "wtp_muted";

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

function preload(src: string) {
  return new Promise<void>((resolve) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => resolve();
    img.src = src;
  });
}

function useNow(intervalMs: number) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}

export function Game() {
  const [me, setMe] = useState<Me | null>(null);
  const [phase, setPhase] = useState<Phase>("loading");
  const [round, setRound] = useState<RoundStart | null>(null);
  const [picked, setPicked] = useState<number | null>(null);
  const [result, setResult] = useState<RoundAnswer | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [muted, setMutedState] = useState(false);
  const [lbKey, setLbKey] = useState(0);
  const [showDex, setShowDex] = useState(false);
  const busy = useRef(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const now = useNow(1000);

  const notify = useCallback((msg: string) => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3200);
  }, []);

  const refreshMe = useCallback(() => api<Me>("/me").then(setMe).catch(() => {}), []);

  useEffect(() => {
    try {
      const m = localStorage.getItem(MUTE_KEY) === "1";
      // localStorage no existe en el render del servidor: se lee al montar.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMutedState(m);
      setMuted(m);
    } catch {}
    api<Me>("/me")
      .then((m) => {
        setMe(m);
        setPhase(m.player ? "lobby" : "name");
      })
      .catch(() => {
        setPhase("name");
        notify("No pudimos conectar con el servidor.");
      });
  }, [notify]);

  // Cuando se recarga un intento mientras estás en el lobby, actualizamos.
  const nextAt = me?.attempts.nextAt ?? null;
  useEffect(() => {
    if (phase === "lobby" && nextAt !== null && now >= nextAt) refreshMe();
  }, [phase, nextAt, now, refreshMe]);

  function toggleMute() {
    const m = !muted;
    setMutedState(m);
    setMuted(m);
    try {
      localStorage.setItem(MUTE_KEY, m ? "1" : "0");
    } catch {}
    if (!m) sfx.click();
  }

  async function share(text: string) {
    const r = await shareApp(text);
    if (r === "copied") notify("¡Link copiado! Pasáselo a tus amigos 🎉");
    else if (r === "failed") notify("No se pudo compartir. Copiá la dirección del navegador.");
  }

  async function startRound() {
    if (busy.current) return;
    busy.current = true;
    setPhase("intro");
    setResult(null);
    setPicked(null);
    sfx.intro();
    const introDone = wait(INTRO_MS);
    try {
      const r = await api<RoundStart>("/round", { method: "POST" });
      setRound(r);
      setMe((m) => m && { ...m, attempts: r.attempts });
      await Promise.all([introDone, preload(roundImageUrl(r.roundId))]);
      setPhase("question");
      sfx.pop();
    } catch (e) {
      setPhase("lobby");
      notify(e instanceof Error ? e.message : "Algo salió mal.");
      if (e instanceof ApiError && e.status === 429) {
        const attempts = e.data.attempts as Attempts | undefined;
        if (attempts) setMe((m) => m && { ...m, attempts });
      }
    } finally {
      busy.current = false;
    }
  }

  async function answer(choice: number | null) {
    if (phase !== "question" || !round || busy.current) return;
    busy.current = true;
    setPicked(choice);
    setPhase("answering");
    if (choice !== null) sfx.click();
    try {
      const a = await api<RoundAnswer>(`/round/${round.roundId}/answer`, {
        method: "POST",
        body: JSON.stringify({ choice }),
      });
      setResult(a);
      setPhase("result");
      if (a.result === "hit") sfx.correct();
      else sfx.wrong();
      setTimeout(() => sfx.cry(a.answer.id), 450);
      refreshMe();
      setLbKey((k) => k + 1);
    } catch (e) {
      setPhase("lobby");
      notify(e instanceof Error ? e.message : "Algo salió mal.");
      refreshMe();
    } finally {
      busy.current = false;
    }
  }

  // Atajos: 1-4 para responder, Enter para seguir.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.repeat) return;
      if (phase === "question" && round) {
        const i = Number(e.key) - 1;
        if (i >= 0 && i < round.options.length) answer(round.options[i].id);
      } else if (e.key === "Enter" && (phase === "result" || phase === "lobby") && me && me.attempts.left > 0) {
        startRound();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const inRound = phase === "intro" || phase === "question" || phase === "answering" || phase === "result";

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4">
      <header className="flex items-center justify-between gap-3 py-5">
        <button onClick={() => !inRound && me?.player && setPhase("lobby")} className="group flex items-center gap-2">
          <Pokeball className="h-9 w-9 transition-transform duration-500 group-hover:rotate-[360deg]" />
          <span className="logo-text hidden text-2xl sm:inline">¿Quién es ese Pokémon?</span>
        </button>
        <div className="flex items-center gap-2">
          <button onClick={toggleMute} className="btn btn-ghost h-10 w-10" aria-label={muted ? "Activar sonido" : "Silenciar"}>
            {muted ? "🔇" : "🔊"}
          </button>
          <button onClick={() => share(shareText(null))} className="btn btn-primary h-10 px-4 text-sm">
            🔗 <span>Invitar amigos</span>
          </button>
        </div>
      </header>

      <main className="grid flex-1 items-start gap-5 lg:grid-cols-[1fr_360px]">
        <section className="panel stage">
          {phase === "loading" && (
            <div className="flex h-[520px] items-center justify-center">
              <Pokeball className="h-14 w-14 animate-spin" />
            </div>
          )}

          {phase === "name" && (
            <NameScreen
              initial={me?.player?.name ?? ""}
              renaming={!!me?.player}
              onCancel={() => setPhase("lobby")}
              onDone={(m, isNew) => {
                setMe(m);
                setLbKey((k) => k + 1);
                if (isNew) startRound();
                else setPhase("lobby");
              }}
            />
          )}

          {phase === "lobby" && me?.player && (
            <Lobby
              me={me}
              now={now}
              onPlay={startRound}
              onRename={() => setPhase("name")}
              onShare={() => share(shareText(me))}
            />
          )}

          {inRound && (
            <RoundView
              phase={phase}
              round={round}
              picked={picked}
              result={result}
              me={me}
              now={now}
              onAnswer={answer}
              onTick={() => sfx.tick()}
              onNext={startRound}
              onBack={() => setPhase("lobby")}
              onShare={() => share(shareText(me))}
            />
          )}
        </section>

        <aside className="space-y-5">
          {me?.player && <TrainerCard me={me} onDex={() => setShowDex(true)} onInvite={() => share(shareText(null))} />}
          <Leaderboard refreshKey={lbKey} />
        </aside>
      </main>

      <footer className="py-8 text-center text-xs leading-relaxed text-muted">
        Proyecto fan hecho para la hackatón de Webflow · Datos e imágenes de{" "}
        <a href="https://pokeapi.co" className="underline hover:text-text" target="_blank" rel="noreferrer">
          PokéAPI
        </a>
        <br />
        Pokémon y sus nombres son marcas de Nintendo, Creatures y Game Freak.
      </footer>

      {showDex && me && <Pokedex caught={me.caught} onClose={() => setShowDex(false)} />}

      {toast && (
        <div
          role="status"
          className="toast fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-white px-5 py-3 text-sm font-bold text-black shadow-2xl"
        >
          {toast}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */

function NameScreen({
  initial,
  renaming,
  onCancel,
  onDone,
}: {
  initial: string;
  renaming: boolean;
  onCancel: () => void;
  onDone: (me: Me, isNew: boolean) => void;
}) {
  const [name, setName] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = normalizeName(name);
    if ("error" in parsed) return setError(parsed.error);
    setSending(true);
    setError(null);
    try {
      const me = await api<Me>("/player", { method: "POST", body: JSON.stringify({ name: parsed.name }) });
      onDone(me, !renaming);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Algo salió mal.");
      setSending(false);
    }
  }

  return (
    <div className="relative flex min-h-[520px] flex-col items-center justify-center gap-6 px-6 py-12 text-center">
      <div className="rays opacity-40" />
      <Pokeball className="h-16 w-16 animate-bounce" />
      <h1 className="logo-text text-5xl sm:text-7xl">
        ¿Quién es
        <br />
        ese Pokémon?
      </h1>
      {!renaming && (
        <ul className="flex flex-wrap justify-center gap-2 text-sm font-bold">
          <li className="rounded-full bg-black/40 px-3 py-1">🎯 4 opciones</li>
          <li className="rounded-full bg-black/40 px-3 py-1">⏱️ 30 segundos</li>
          <li className="rounded-full bg-black/40 px-3 py-1">⚡ Más rápido, más puntos</li>
          <li className="rounded-full bg-black/40 px-3 py-1">🔋 5 intentos cada 30 min</li>
        </ul>
      )}
      <form onSubmit={submit} className="w-full max-w-sm rounded-3xl bg-black/50 p-5 backdrop-blur">
        <label htmlFor="trainer" className="mb-2 block font-extrabold">
          {renaming ? "Tu nuevo nombre de entrenador" : "¿Cómo te llamás, entrenador?"}
        </label>
        <input
          id="trainer"
          autoFocus
          autoComplete="nickname"
          maxLength={16}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ash, Misty, Brock..."
          className="w-full rounded-full border-2 border-white/15 bg-white/10 px-5 py-3 text-center text-lg font-bold outline-none transition focus:border-poke-yellow"
        />
        {error && <p className="mt-2 text-sm font-bold text-red-300">{error}</p>}
        <button type="submit" disabled={sending} className="btn btn-primary mt-4 w-full py-3 text-lg">
          {sending ? "Un segundo..." : renaming ? "Guardar" : "¡A jugar!"}
        </button>
        {renaming && (
          <button type="button" onClick={onCancel} className="mt-3 text-sm text-muted underline">
            Cancelar
          </button>
        )}
      </form>
    </div>
  );
}

/* ------------------------------------------------------------------ */

function AttemptBalls({ attempts }: { attempts: Attempts }) {
  return (
    <div className="flex items-center gap-1.5" aria-label={`Te quedan ${attempts.left} de ${attempts.max} intentos`}>
      {Array.from({ length: attempts.max }, (_, i) => (
        <Pokeball key={i} className={`h-6 w-6 transition ${i < attempts.left ? "" : "opacity-25 grayscale"}`} />
      ))}
    </div>
  );
}

function RefillNote({ attempts, now }: { attempts: Attempts; now: number }) {
  if (attempts.nextAt === null || attempts.left === attempts.max) return null;
  return (
    <p className="text-sm text-muted">
      +1 intento en <b className="tabular-nums text-text">{countdown(attempts.nextAt - now)}</b>
    </p>
  );
}

function SessionSummary({ me }: { me: Me }) {
  if (me.recent.length === 0) return null;
  const total = me.recent.reduce((s, r) => s + r.points, 0);
  const EMOJI = { hit: "🟩", miss: "🟥", timeout: "⬛" };
  return (
    <div className="rounded-2xl bg-black/40 px-5 py-3">
      <p className="text-xs font-bold uppercase tracking-wider text-muted">Últimos 30 minutos</p>
      <p className="text-2xl tracking-widest">{me.recent.map((r) => EMOJI[r.result]).join("")}</p>
      <p className="font-display text-xl text-poke-yellow">{fmt(total)} pts</p>
    </div>
  );
}

function Lobby({
  me,
  now,
  onPlay,
  onRename,
  onShare,
}: {
  me: Me;
  now: number;
  onPlay: () => void;
  onRename: () => void;
  onShare: () => void;
}) {
  const { attempts } = me;
  return (
    <div className="relative flex min-h-[520px] flex-col items-center justify-center gap-5 px-6 py-12 text-center">
      <div className="rays opacity-40" />
      <p className="rounded-full bg-black/40 px-4 py-1.5">
        ¡Hola, <b>{me.player?.name}</b>!{" "}
        <button onClick={onRename} className="text-xs text-muted underline hover:text-text">
          cambiar nombre
        </button>
      </p>
      <h1 className="logo-text text-5xl sm:text-7xl">
        ¿Quién es
        <br />
        ese Pokémon?
      </h1>

      <AttemptBalls attempts={attempts} />

      {attempts.left > 0 ? (
        <>
          <button onClick={onPlay} className="btn btn-primary px-10 py-4 text-2xl">
            <Pokeball className="h-8 w-8" /> ¡Jugar!
          </button>
          <p className="text-sm text-muted">
            Te quedan <b className="text-text">{attempts.left}</b> de {attempts.max} intentos · Enter para arrancar
          </p>
          <RefillNote attempts={attempts} now={now} />
        </>
      ) : (
        <div className="rounded-3xl bg-black/50 px-6 py-4">
          <p className="text-lg font-extrabold">Usaste tus {attempts.max} intentos 😴</p>
          <p className="text-muted">
            Se recarga uno en{" "}
            <b className="font-display text-2xl tabular-nums text-poke-yellow">
              {countdown((attempts.nextAt ?? now) - now)}
            </b>
          </p>
        </div>
      )}

      {me.recent.length > 0 && (
        <div className="flex flex-col items-center gap-3">
          <SessionSummary me={me} />
          <button onClick={onShare} className="btn btn-ghost px-5 py-2 text-sm">
            📤 Compartir resultado
          </button>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */

function RoundView({
  phase,
  round,
  picked,
  result,
  me,
  now,
  onAnswer,
  onTick,
  onNext,
  onBack,
  onShare,
}: {
  phase: Phase;
  round: RoundStart | null;
  picked: number | null;
  result: RoundAnswer | null;
  me: Me | null;
  now: number;
  onAnswer: (choice: number | null) => void;
  onTick: () => void;
  onNext: () => void;
  onBack: () => void;
  onShare: () => void;
}) {
  const showRound = phase !== "intro" && round;
  const attempts = me?.attempts;

  return (
    <div>
      <div className="relative h-[300px] sm:h-[380px]">
        <div className={`rays ${phase === "intro" ? "fast" : ""}`} />

        {phase === "intro" && (
          <div className="absolute inset-0 flex items-center justify-center px-4 text-center">
            <h2 className="logo-text text-6xl sm:text-8xl">
              <span className="intro-line">¿Quién es</span>
              <span className="intro-line">ese Pokémon?</span>
            </h2>
          </div>
        )}

        {showRound && (
          <>
            {attempts && (
              <span className="absolute left-4 top-4 z-10 rounded-full bg-black/50 px-3 py-1 text-xs font-extrabold">
                Intento {attempts.used}/{attempts.max}
              </span>
            )}
            {(phase === "question" || phase === "answering") && (
              <div className="absolute right-3 top-3 z-10">
                <Timer
                  key={round.roundId}
                  running={phase === "question"}
                  onExpire={() => onAnswer(null)}
                  onTick={onTick}
                />
              </div>
            )}
            <div className="absolute inset-0 flex items-center justify-center p-8">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                key={`${round.roundId}-${phase === "result"}`}
                src={roundImageUrl(round.roundId)}
                alt={phase === "result" && result ? result.answer.name : "Silueta de un Pokémon misterioso"}
                draggable={false}
                onContextMenu={(e) => e.preventDefault()}
                className={`h-full max-h-[300px] w-auto object-contain ${
                  phase === "result" ? "revealed" : "silhouette pop-in"
                }`}
              />
            </div>
            {phase === "result" && <div key={`flash-${round.roundId}`} className="flash" />}
            {phase === "result" && result?.result === "hit" && <Confetti key={`c-${round.roundId}`} />}
          </>
        )}
      </div>

      <div className="border-t border-line bg-panel/90 p-4 sm:p-5">
        {phase === "intro" || !round ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {Array.from({ length: 4 }, (_, i) => (
              <div key={i} className="h-[60px] animate-pulse rounded-2xl bg-white/5" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {round.options.map((o, i) => {
              const isAnswer = result?.answer.id === o.id;
              const isPicked = picked === o.id;
              let style = "bg-white/10 ring-1 ring-white/10 hover:bg-white/20 hover:ring-poke-yellow/60";
              if (phase === "answering") style = isPicked ? "bg-poke-yellow/30 ring-2 ring-poke-yellow animate-pulse" : "bg-white/5 opacity-60";
              if (phase === "result") {
                if (isAnswer) style = "bg-ok text-black ring-2 ring-white";
                else if (isPicked) style = "bg-poke-red text-white shake";
                else style = "bg-white/5 opacity-40";
              }
              return (
                <button
                  key={o.id}
                  onClick={() => onAnswer(o.id)}
                  disabled={phase !== "question"}
                  className={`btn min-h-[60px] justify-start rounded-2xl px-4 text-left text-lg !opacity-100 ${style}`}
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-black/30 text-sm font-black">
                    {i + 1}
                  </span>
                  <span className="truncate">{o.name}</span>
                  {phase === "result" && isAnswer && <span className="ml-auto">✓</span>}
                  {phase === "result" && isPicked && !isAnswer && <span className="ml-auto">✗</span>}
                </button>
              );
            })}
          </div>
        )}

        {phase === "result" && result && me && (
          <ResultPanel result={result} me={me} now={now} onNext={onNext} onBack={onBack} onShare={onShare} />
        )}
      </div>
    </div>
  );
}

function ResultPanel({
  result,
  me,
  now,
  onNext,
  onBack,
  onShare,
}: {
  result: RoundAnswer;
  me: Me;
  now: number;
  onNext: () => void;
  onBack: () => void;
  onShare: () => void;
}) {
  const hit = result.result === "hit";
  const { name, id, types } = result.answer;
  const outOfAttempts = me.attempts.left === 0;

  return (
    <div className="mt-5 flex flex-col items-center gap-2 text-center" aria-live="polite">
      <p className="logo-text pop-in text-4xl sm:text-5xl">
        {hit ? `¡Es ${name}!` : result.result === "timeout" ? "¡Se acabó el tiempo!" : "¡Uy, no era!"}
      </p>
      {!hit && (
        <p className="text-lg">
          Era <b className="text-poke-yellow">{name}</b>
        </p>
      )}
      <div className="flex flex-wrap items-center justify-center gap-2">
        <span className="text-sm font-bold text-muted">#{String(id).padStart(3, "0")}</span>
        {types.map((t) => (
          <TypeChip key={t} type={t} />
        ))}
      </div>

      {hit ? (
        <>
          <p className="font-display text-6xl text-poke-yellow drop-shadow-[0_4px_0_#1d2c6b]">
            +<CountUp value={result.points} />
          </p>
          <p className="text-sm text-muted">
            Respondiste en <b className="text-text">{seconds(result.elapsedMs)}</b>
            {result.bonus > 0 && (
              <>
                {" "}
                · 🔥 racha x{result.streak}: <b className="text-text">+{result.bonus}</b>
              </>
            )}
          </p>
          {result.newCatch && (
            <span className="pop-in rounded-full bg-poke-red px-4 py-1 text-sm font-extrabold">
              📕 ¡Nuevo en tu Pokédex! ({me.caught.length}/{POKEMON_COUNT})
            </span>
          )}
        </>
      ) : (
        <p className="text-muted">0 puntos · la racha vuelve a cero</p>
      )}

      {outOfAttempts && (
        <div className="mt-2 flex flex-col items-center gap-2">
          <SessionSummary me={me} />
          <p className="text-sm text-muted">
            Se recarga un intento en{" "}
            <b className="tabular-nums text-text">{countdown((me.attempts.nextAt ?? now) - now)}</b>
          </p>
        </div>
      )}

      <div className="mt-3 flex flex-wrap justify-center gap-2">
        {outOfAttempts ? (
          <button onClick={onShare} className="btn btn-primary px-6 py-3">
            📤 Compartir resultado
          </button>
        ) : (
          <button onClick={onNext} className="btn btn-primary px-6 py-3">
            Siguiente Pokémon ⏎
          </button>
        )}
        <button onClick={onBack} className="btn btn-ghost px-6 py-3">
          Volver
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */

function TrainerCard({ me, onDex, onInvite }: { me: Me; onDex: () => void; onInvite: () => void }) {
  const { stats } = me;
  const name = me.player?.name ?? "";
  return (
    <section className="panel p-5">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-poke-red font-display text-2xl text-white ring-4 ring-white/10">
          {name.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold uppercase tracking-wider text-muted">Entrenador</p>
          <p className="truncate font-display text-2xl tracking-wide">{name}</p>
        </div>
        {stats.rank !== null && (
          <span className="rounded-full bg-poke-yellow px-3 py-1 font-display text-lg text-black">#{stats.rank}</span>
        )}
      </div>

      <dl className="mt-4 grid grid-cols-3 gap-2 text-center">
        <Stat label="Puntos" value={fmt(stats.score)} highlight />
        <Stat label="Aciertos" value={`${stats.hits}/${stats.played}`} />
        <Stat label="Racha" value={`🔥 ${stats.streak}`} />
        <Stat label="Mejor" value={stats.bestMs !== null ? seconds(stats.bestMs) : "—"} />
        <Stat label="Pokédex" value={`${me.caught.length}`} />
        <Stat label="Precisión" value={stats.played ? `${Math.round((stats.hits / stats.played) * 100)}%` : "—"} />
      </dl>

      <div className="mt-4 flex items-center justify-between rounded-2xl bg-black/30 px-3 py-2">
        <span className="text-xs font-bold uppercase tracking-wider text-muted">Intentos</span>
        <AttemptBalls attempts={me.attempts} />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <button onClick={onDex} className="btn btn-ghost py-2 text-sm">
          📕 Mi Pokédex
        </button>
        <button onClick={onInvite} className="btn btn-ghost py-2 text-sm">
          🔗 Invitar
        </button>
      </div>
    </section>
  );
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="rounded-xl bg-white/5 px-2 py-2">
      <dt className="text-[10px] font-bold uppercase tracking-wider text-muted">{label}</dt>
      <dd className={`font-display text-lg tabular-nums ${highlight ? "text-poke-yellow" : ""}`}>{value}</dd>
    </div>
  );
}
