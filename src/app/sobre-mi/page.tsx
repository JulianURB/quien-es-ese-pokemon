import type { Metadata } from "next";
import { GITHUB, LINKEDIN } from "@/lib/links";
import { Footer } from "../components/Footer";
import { PageHeader } from "../components/PageHeader";

export const metadata: Metadata = {
  title: "Sobre mí · ¿Quién es ese Pokémon?",
  description: "Julian Urbani, software builder.",
};


const STACK = [
  { icon: "⚡", title: "Next.js + React", text: "Next.js 16 y React 19 con Tailwind. Las animaciones, hechas a mano con CSS." },
  { icon: "☁️", title: "En el edge", text: "Corre en Cloudflare Workers, con una base SQLite para los jugadores y el ranking." },
  { icon: "🕵️", title: "Nada de trampas", text: "El servidor elige el Pokémon, toma el tiempo y reparte los puntos. La respuesta nunca llega a tu navegador, así que no la busques en la consola 😉" },
  { icon: "🔋", title: "5 intentos, ni uno más", text: "El límite se chequea y se descuenta en una sola consulta SQL: aunque mandes pedidos en paralelo, no se cuela un sexto." },
  { icon: "📡", title: "PokéAPI", text: "De ahí salen los nombres en español, los tipos, las imágenes y los gritos de los 493 Pokémon." },
  { icon: "🔊", title: "Sonidos caseros", text: "Cero archivos de audio: todos los efectos se sintetizan en el momento con Web Audio." },
];

export default function SobreMiPage() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4">
      <PageHeader />

      <main className="space-y-5">
        <section className="panel stage px-6 py-12 text-center">
          <div className="rays opacity-40" />
          <div className="pop-in mx-auto flex h-28 w-28 items-center justify-center rounded-full bg-poke-red font-display text-5xl text-white shadow-2xl ring-8 ring-white/15">
            JU
          </div>
          <h1 className="logo-text mt-6 text-5xl sm:text-6xl">Julian Urbani</h1>
          <p className="mt-3 inline-block rounded-full bg-black/40 px-4 py-1.5 text-lg font-extrabold tracking-wide">
            Software builder
          </p>
          <p className="mx-auto mt-6 max-w-lg text-lg leading-relaxed">
            ¡Hola! 👋 Me gusta armar cosas de punta a punta, de la base de datos a la última animación.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a href={LINKEDIN} target="_blank" rel="noreferrer" className="btn bg-[#0a66c2] px-6 py-3 text-white shadow-[0_4px_0_#07437f] hover:brightness-110">
              <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
                <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z" />
              </svg>
              Sumame en LinkedIn
            </a>
            <a href={GITHUB} target="_blank" rel="noreferrer" className="btn bg-white px-6 py-3 text-black shadow-[0_4px_0_#9aa6d6] hover:brightness-95">
              <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
                <path d="M12 .3a12 12 0 0 0-3.8 23.38c.6.12.83-.26.83-.57L9 21.07c-3.34.72-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.08-.74.09-.73.09-.73 1.2.09 1.83 1.24 1.83 1.24 1.07 1.83 2.8 1.3 3.49 1 .1-.78.42-1.31.76-1.61-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.14-.3-.54-1.52.1-3.18 0 0 1-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.28-1.55 3.29-1.23 3.29-1.23.64 1.66.24 2.88.12 3.18a4.65 4.65 0 0 1 1.23 3.22c0 4.61-2.8 5.63-5.48 5.92.42.36.81 1.1.81 2.22l-.01 3.29c0 .32.21.69.82.57A12 12 0 0 0 12 .3" />
              </svg>
              Mirá mi GitHub
            </a>
          </div>
        </section>

        <section className="panel p-6">
          <h2 className="font-display text-3xl tracking-wide">🔧 ¿Cómo está hecho?</h2>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2">
            {STACK.map((s) => (
              <li key={s.title} className="rounded-2xl bg-white/5 p-4">
                <p className="font-extrabold">
                  {s.icon} {s.title}
                </p>
                <p className="mt-1 text-sm text-muted">{s.text}</p>
              </li>
            ))}
          </ul>
        </section>
      </main>

      <Footer />
    </div>
  );
}
