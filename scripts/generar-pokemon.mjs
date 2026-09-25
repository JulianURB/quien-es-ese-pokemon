// Genera src/data/pokemon.json desde la API GraphQL de PokéAPI.
// Formato compacto: [id, nombre en español, generación, [tipos]].
// Correr con: npm run data:pokemon
import { writeFileSync } from "node:fs";

const MAX_ID = 493; // Generaciones 1 a 4

const query = `{
  pokemon_v2_pokemonspecies(where: { id: { _lte: ${MAX_ID} } }, order_by: { id: asc }) {
    id
    name
    generation_id
    pokemon_v2_pokemonspeciesnames(where: { language_id: { _eq: 7 } }) { name }
    pokemon_v2_pokemons(where: { is_default: { _eq: true } }) {
      pokemon_v2_pokemontypes(order_by: { slot: asc }) { pokemon_v2_type { name } }
    }
  }
}`;

const res = await fetch("https://beta.pokeapi.co/graphql/v1beta", {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ query }),
});
const { data } = await res.json();

const pokemon = data.pokemon_v2_pokemonspecies.map((s) => [
  s.id,
  s.pokemon_v2_pokemonspeciesnames[0]?.name ?? s.name,
  s.generation_id,
  s.pokemon_v2_pokemons[0].pokemon_v2_pokemontypes.map((t) => t.pokemon_v2_type.name),
]);

if (pokemon.length !== MAX_ID) throw new Error(`Se esperaban ${MAX_ID}, llegaron ${pokemon.length}`);

writeFileSync(new URL("../src/data/pokemon.json", import.meta.url), JSON.stringify(pokemon) + "\n");
console.log(`OK: ${pokemon.length} Pokémon`);
