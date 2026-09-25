import Link from "next/link";
import { Pokeball } from "./Pokeball";

export function PageHeader() {
  return (
    <header className="flex items-center justify-between gap-3 py-5">
      <Link href="/" className="group flex items-center gap-2">
        <Pokeball className="h-9 w-9 transition-transform duration-500 group-hover:rotate-[360deg]" />
        <span className="logo-text hidden text-2xl sm:inline">¿Quién es ese Pokémon?</span>
      </Link>
      <Link href="/" className="btn btn-primary h-10 px-4 text-sm">
        🎮 Jugar
      </Link>
    </header>
  );
}
