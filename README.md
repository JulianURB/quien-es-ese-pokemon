# ¿Quién es ese Pokémon?

Juego de navegador de [Julian Urbani](https://github.com/JulianURB): aparece la silueta de un Pokémon y tenés 30 segundos para elegir entre 4 opciones. Mientras más rápido respondas, más puntos. 5 intentos cada 30 minutos y un ranking para ver quién es el mejor entrenador.

## Qué tiene

- **Intro estilo anime** ("¿Quién es ese Pokémon?" con rayos girando), silueta, temporizador animado de 30 s y revelación con el grito del Pokémon.
- **Puntaje por velocidad**: de 1000 (al instante) a 100 (al límite), más bonus por racha de aciertos.
- **5 intentos cada 30 minutos** (ventana deslizante), con cuenta regresiva hasta el próximo.
- **Ranking** de hoy e histórico, con tu puesto aunque estés fuera del top, y feed en vivo de las últimas capturas.
- **Tu Pokédex**: los Pokémon que acertaste quedan guardados.
- **Compartir**: link para invitar y resultado estilo Wordle (🟩🟥⬛), con imagen de vista previa para redes.
- Sonidos sintetizados con Web Audio (con botón de silencio), atajos de teclado 1–4 y Enter, responsive.

## Anti-trampa: todo lo decide el servidor

- El servidor elige el Pokémon y las opciones; la respuesta correcta nunca viaja al navegador.
- La imagen se sirve por `/api/round/:id/image`, así la URL no delata el número del Pokémon.
- El tiempo y los puntos se calculan en el servidor, y se rechazan respuestas anteriores a la silueta.
- El cupo de intentos se chequea y consume en una sola sentencia SQL (no se cuela un sexto intento con pedidos en paralelo), y una ronda no se puede responder dos veces.
- La identidad del jugador vive en una cookie httpOnly que nunca se expone.

## Stack

- Next.js 16 (App Router) + React 19 + Tailwind v4
- Webflow Cloud (Cloudflare Workers vía OpenNext) con SQLite (D1) para jugadores y rondas
- [PokéAPI](https://pokeapi.co/) para nombres en español, tipos, artwork y gritos (Pokémon de las generaciones 1 a 4)

## Estructura

```
migrations/           esquema de la base (Webflow Cloud las aplica al deployar)
scripts/              generador de src/data/pokemon.json desde PokéAPI
src/lib/game.ts       reglas del juego (compartidas cliente/servidor)
src/lib/server.ts     acceso a D1, sesión del jugador, intentos, ranking
src/app/api/          player, me, round, round/[id]/image, round/[id]/answer, leaderboard
src/app/components/   Game (máquina de estados), Timer, Leaderboard, Pokedex...
```

## Desarrollo local

Requiere Node 22 (lo pide `wrangler`).

```bash
npm install
npm run db:setup      # crea la base SQLite local en .wrangler/
npm run dev           # next dev, con la base local conectada
npm run dev:cf        # build de OpenNext + wrangler dev: el mismo runtime que producción
```

## Deploy en Webflow Cloud

Webflow Cloud instala con `npm ci` y construye con `npm run build`, así que `package-lock.json` tiene que estar al día. La base se declara en `wrangler.json` y las migraciones de `migrations/` se aplican solas en cada deploy.

- No setear `basePath` ni `assetPrefix` en `next.config.ts`: Webflow los aplica según el mount path.
- Para rutas propias (assets de `public/`, `fetch` a `/api/...`) usar el prefijo `process.env.NEXT_PUBLIC_BASE_PATH`.
- No usar `export const runtime = "edge"`: el adapter de OpenNext no lo soporta.

---

Hecho por [Julian Urbani](https://github.com/JulianURB) · [LinkedIn](https://www.linkedin.com/in/julian-urbani/). Pokémon es marca de Nintendo, Creatures y Game Freak.
