import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';
import AstroPWA from '@vite-pwa/astro';

// GitHub *project* pages serve at `<domain>/<repo>/`, so the deploy workflow
// sets ASTRO_BASE=/zelda-ocarina-of-time-guide. Local dev leaves it unset → '/'.
const BASE = process.env.ASTRO_BASE || '/';
// Public-asset prefix that respects BASE — used for the manifest icon paths.
const asset = (p) => `${BASE.replace(/\/$/, '')}/${p.replace(/^\//, '')}`;
// start_url/scope/id must end in '/' — GitHub Pages 301-redirects the
// no-slash form, adding a hop every time the installed app launches.
const SCOPE = BASE.endsWith('/') ? BASE : `${BASE}/`;

export default defineConfig({
  // The account's Pages sites are served from its custom domain, not
  // <user>.github.io — confirmed via `gh api .../pages` returning
  // html_url: https://artemiop.com/zelda-ocarina-of-time-guide/ (same
  // account-wide custom domain the RE4 sibling guide uses).
  site: 'https://artemiop.com',
  base: BASE,
  // Spanish is the source/default language (matches the sibling RE4 guide's
  // convention) and stays unprefixed at the root; English lives under /en/.
  i18n: {
    defaultLocale: 'es',
    locales: ['es', 'en'],
    routing: { prefixDefaultLocale: false },
  },
  integrations: [
    react(),
    AstroPWA({
      // registerType: 'autoUpdate' defaults workbox's skipWaiting/clientsClaim
      // to true — a new SW takes over already-open tabs immediately. Safe
      // here: every route is a full document navigation, every island's
      // script is a plain build-time <script type=module>, never a lazily
      // import()-ed chunk.
      registerType: 'autoUpdate',
      strategies: 'generateSW',
      manifest: {
        id: SCOPE,
        name: 'Ocarina of Time — Guía',
        short_name: 'OoT Guía',
        description:
          'Guía y tracker offline de The Legend of Zelda: Ocarina of Time (versión 3DS): mazmorras, las 100 Gold Skulltulas, Piezas de Corazón, canciones de ocarina, equipo y secuencia de intercambios.',
        lang: 'es',
        theme_color: '#0d2b22',
        background_color: '#0d2b22',
        display: 'standalone',
        start_url: SCOPE,
        scope: SCOPE,
        icons: [
          { src: asset('icons/pwa-192.png'), sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: asset('icons/pwa-512.png'), sizes: '512x512', type: 'image/png', purpose: 'any' },
          {
            src: asset('icons/pwa-maskable-512.png'),
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        // Precache all static assets produced by the Astro build — the guide
        // must be fully usable offline once installed.
        globPatterns: ['**/*.{js,css,html,svg,png,ico,webp,woff2}'],
        navigateFallback: SCOPE,
      },
      experimental: { directoryAndTrailingSlashHandler: true },
    }),
  ],
  vite: { plugins: [tailwindcss()] },
  output: 'static',
});
