"use client";

import { useEffect, useState } from "react";

const TOTAL_POKEMON = 151;

function artworkUrl(id: number) {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
}

export default function Home() {
  const [id, setId] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);

  function next() {
    setId(Math.floor(Math.random() * TOTAL_POKEMON) + 1);
    setRevealed(false);
  }

  useEffect(next, []);

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-8 p-6 text-center">
      <h1 className="text-4xl font-bold sm:text-5xl">¿Quién es ese Pokémon?</h1>

      <div className="flex h-72 w-72 items-center justify-center">
        {id && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={artworkUrl(id)}
            alt={revealed ? `Pokémon #${id}` : "Silueta de un Pokémon"}
            className="h-full w-full object-contain transition-[filter] duration-500"
            style={{ filter: revealed ? "none" : "brightness(0)" }}
          />
        )}
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => setRevealed(true)}
          className="rounded-full bg-yellow-400 px-6 py-3 font-semibold text-black"
        >
          Revelar
        </button>
        <button
          onClick={next}
          className="rounded-full border border-white/30 px-6 py-3 font-semibold"
        >
          Otro
        </button>
      </div>
    </main>
  );
}
