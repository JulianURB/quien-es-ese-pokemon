import data from "@/data/pokemon.json";

type Row = [id: number, name: string, gen: number, types: string[]];

export interface Pokemon {
  id: number;
  name: string;
  gen: number;
  types: string[];
}

const ROWS = data as Row[];
export const POKEMON_COUNT = ROWS.length;

export function getPokemon(id: number): Pokemon {
  const [pid, name, gen, types] = ROWS[id - 1];
  return { id: pid, name, gen, types };
}

const SPRITES = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon";

export const artworkUrl = (id: number) => `${SPRITES}/other/official-artwork/${id}.png`;
export const spriteUrl = (id: number) => `${SPRITES}/${id}.png`;
export const cryUrl = (id: number) =>
  `https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/${id}.ogg`;

export const TYPES: Record<string, { label: string; color: string }> = {
  normal: { label: "Normal", color: "#A8A77A" },
  fire: { label: "Fuego", color: "#EE8130" },
  water: { label: "Agua", color: "#6390F0" },
  electric: { label: "Eléctrico", color: "#F7D02C" },
  grass: { label: "Planta", color: "#7AC74C" },
  ice: { label: "Hielo", color: "#96D9D6" },
  fighting: { label: "Lucha", color: "#C22E28" },
  poison: { label: "Veneno", color: "#A33EA1" },
  ground: { label: "Tierra", color: "#E2BF65" },
  flying: { label: "Volador", color: "#A98FF3" },
  psychic: { label: "Psíquico", color: "#F95587" },
  bug: { label: "Bicho", color: "#A6B91A" },
  rock: { label: "Roca", color: "#B6A136" },
  ghost: { label: "Fantasma", color: "#735797" },
  dragon: { label: "Dragón", color: "#6F35FC" },
  dark: { label: "Siniestro", color: "#705746" },
  steel: { label: "Acero", color: "#B7B7CE" },
  fairy: { label: "Hada", color: "#D685AD" },
};

function randomInt(max: number): number {
  const buf = new Uint32Array(1);
  crypto.getRandomValues(buf);
  return buf[0] % max;
}

function shuffle<T>(items: T[]): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Elige el Pokémon de la ronda (evitando los vistos hace poco) y 3 distractores
 * de la misma generación, uno de ellos con un tipo en común si existe: así las
 * opciones se parecen y la ronda no se resuelve por descarte.
 */
export function pickRound(recent: Set<number>): { answer: number; options: number[] } {
  let answer = randomInt(POKEMON_COUNT) + 1;
  for (let i = 0; i < 20 && recent.has(answer); i++) answer = randomInt(POKEMON_COUNT) + 1;

  const target = getPokemon(answer);
  const sameGen = shuffle(ROWS.filter((r) => r[2] === target.gen && r[0] !== answer));
  const sharesType = sameGen.find((r) => r[3].some((t) => target.types.includes(t)));

  const distractors = new Set<number>();
  if (sharesType) distractors.add(sharesType[0]);
  for (const r of sameGen) {
    if (distractors.size === 3) break;
    distractors.add(r[0]);
  }

  return { answer, options: shuffle([answer, ...distractors]) };
}
