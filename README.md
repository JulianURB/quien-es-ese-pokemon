# ¿Quién es ese Pokémon?

Juego de navegador: adiviná el Pokémon por su silueta. Hecho para la hackatón de Webflow.

- **Stack:** Next.js 16 (App Router) + React 19 + Tailwind v4
- **Datos:** [PokéAPI](https://pokeapi.co/)
- **Deploy:** Webflow Cloud (Cloudflare Workers vía OpenNext)

## Desarrollo local

```bash
npm install
npm run dev
```

## Deploy en Webflow Cloud

Webflow Cloud instala con `npm ci` y construye con `npm run build`, así que `package-lock.json` tiene que estar al día.

- No setear `basePath` ni `assetPrefix` en `next.config.ts`: Webflow los aplica según el mount path.
- Para rutas propias (assets de `public/`, `fetch` a `/api/...`) usar el prefijo `process.env.NEXT_PUBLIC_BASE_PATH`.
- No usar `export const runtime = "edge"`: el adapter de OpenNext no lo soporta.
