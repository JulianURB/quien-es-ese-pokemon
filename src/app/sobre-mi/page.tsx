import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "../components/Footer";
import { PageHeader } from "../components/PageHeader";

export const metadata: Metadata = {
  title: "Sobre mí · ¿Quién es ese Pokémon?",
  description: "Julian Urbani, software builder. Hecho para la hackatón de Webflow en Nerdearla 2026.",
};

const LINKEDIN = "https://www.linkedin.com/in/julian-urbani/";

const STACK = [
  { icon: "⚡", title: "Next.js 16 + React 19", text: "App Router, Tailwind v4 y animaciones hechas a mano con CSS." },
  { icon: "☁️", title: "Webflow Cloud", text: "Corre en Cloudflare Workers vía OpenNext, con SQLite (D1) para jugadores y rondas." },
  { icon: "🛡️", title: "Anti-trampa", text: "El servidor elige el Pokémon, mide el tiempo y calcula los puntos. La respuesta nunca llega al navegador." },
  { icon: "🔋", title: "Intentos atómicos", text: "El cupo de 5 intentos cada 30 minutos se valida y consume en una sola sentencia SQL." },
  { icon: "📡", title: "PokéAPI", text: "Nombres en español, tipos, artwork y gritos de 493 Pokémon." },
  { icon: "🔊", title: "Web Audio", text: "Todos los efectos de sonido se sintetizan en el navegador, sin archivos." },
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
            Construyo software de punta a punta, de la base de datos a la interfaz. Este juego lo armé para la{" "}
            <b className="text-poke-yellow">hackatón de Webflow</b> en el marco de{" "}
            <b className="text-poke-yellow">Nerdearla 2026</b>.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a href={LINKEDIN} target="_blank" rel="noreferrer" className="btn bg-[#0a66c2] px-6 py-3 text-white shadow-[0_4px_0_#07437f] hover:brightness-110">
              <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
                <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z" />
              </svg>
              Conectemos en LinkedIn
            </a>
            <Link href="/compartir" className="btn btn-ghost px-6 py-3">
              📱 Compartir con QR
            </Link>
          </div>
        </section>

        <section className="panel p-6">
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <span className="rounded-2xl bg-poke-yellow px-4 py-2 font-display text-2xl text-black">Nerdearla 2026</span>
            <p className="text-muted">
              ¿Quién es ese Pokémon? nació en la hackatón de Webflow de Nerdearla 2026. Si pasaste por el evento: ¡jugá,
              sumate al ranking y desafiá a alguien!
            </p>
          </div>
        </section>

        <section className="panel p-6">
          <h2 className="font-display text-3xl tracking-wide">🔧 Cómo está hecho</h2>
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
          <a
            href="https://github.com/JulianURB/quien-es-ese-pokemon"
            target="_blank"
            rel="noreferrer"
            className="btn btn-ghost mt-5 px-5 py-2 text-sm"
          >
            Ver el código en GitHub
          </a>
        </section>
      </main>

      <Footer />
    </div>
  );
}
