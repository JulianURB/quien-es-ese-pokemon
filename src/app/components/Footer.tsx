import Link from "next/link";

export function Footer() {
  return (
    <footer className="py-8 text-center text-xs leading-relaxed text-muted">
      Hecho por{" "}
      <Link href="/sobre-mi" className="font-bold text-text underline hover:text-poke-yellow">
        Julian Urbani
      </Link>{" "}
      powered by <b className="text-text">Claude</b>
      <br />
      Datos de{" "}
      <a href="https://pokeapi.co" className="underline hover:text-text" target="_blank" rel="noreferrer">
        PokéAPI
      </a>{" "}
      · Pokémon es marca de Nintendo, Creatures y Game Freak.
    </footer>
  );
}
