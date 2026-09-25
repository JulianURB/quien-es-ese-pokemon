import Link from "next/link";

export function Footer() {
  return (
    <footer className="py-8 text-center text-xs leading-relaxed text-muted">
      Hecho por{" "}
      <Link href="/sobre-mi" className="font-bold text-text underline hover:text-poke-yellow">
        Julian Urbani
      </Link>{" "}
      para la hackatón de Webflow · <b className="text-text">Nerdearla 2026</b>
      <br />
      Datos e imágenes de{" "}
      <a href="https://pokeapi.co" className="underline hover:text-text" target="_blank" rel="noreferrer">
        PokéAPI
      </a>{" "}
      · Proyecto fan: Pokémon y sus nombres son marcas de Nintendo, Creatures y Game Freak.
    </footer>
  );
}
