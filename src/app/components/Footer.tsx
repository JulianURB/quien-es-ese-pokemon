import Link from "next/link";
import { GITHUB, LINKEDIN } from "@/lib/links";

export function Footer() {
  return (
    <footer className="py-8 text-center text-xs leading-relaxed text-muted">
      Un proyecto de{" "}
      <Link href="/sobre-mi" className="font-bold text-text underline hover:text-poke-yellow">
        Julian Urbani
      </Link>{" "}
      ·{" "}
      <a href={GITHUB} className="underline hover:text-text" target="_blank" rel="noreferrer">
        GitHub
      </a>{" "}
      ·{" "}
      <a href={LINKEDIN} className="underline hover:text-text" target="_blank" rel="noreferrer">
        LinkedIn
      </a>
      <br />
      Datos de{" "}
      <a href="https://pokeapi.co" className="underline hover:text-text" target="_blank" rel="noreferrer">
        PokéAPI
      </a>{" "}
      · Pokémon es marca de Nintendo, Creatures y Game Freak.
    </footer>
  );
}
