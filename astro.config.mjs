import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';
import AstroPWA from '@vite-pwa/astro';
import ogImages from './scripts/og-images.ts';
import { fileURLToPath } from 'node:url';
import remarkEntityLinks from './src/lib/remark-entity-links.ts';
import { RUNTIME_IMAGE_CACHE } from './src/lib/runtime-cache.ts';

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
  // <user>.github.io: this one at https://artemiop.com/zelda-ocarina-of-time-guide/.
  site: 'https://artemiop.com',
  base: BASE,
  // Spanish is the default language and stays unprefixed at the root;
  // English lives under /en/. Astro's built-in i18n routing handles the URL structure.
  i18n: {
    defaultLocale: 'es',
    locales: ['es', 'en'],
    routing: { prefixDefaultLocale: false },
  },
  markdown: {
    // Walkthrough prose: every weapon, boss, enemy, item… the guide has a
    // page for becomes a link to it (src/lib/game-entity-links.ts).
    remarkPlugins: [
      [
        remarkEntityLinks,
        { base: BASE, contentDir: fileURLToPath(new URL('./src/content/', import.meta.url)) },
      ],
    ],
  },
  integrations: [
    react(),
    AstroPWA({
      // registerType: 'autoUpdate' defaults workbox's skipWaiting/clientsClaim
      // to true — a new SW takes over already-open tabs immediately instead
      // of waiting for their next full reload. That's only unsafe for a site
      // with client-side route/chunk lazy-loading (an open tab could later
      // request an asset hash the new precache no longer has). This site has
      // none: every route is a full document navigation and every React
      // island's script is a plain <script type=module> emitted at build
      // time, not a lazily `import()`-ed chunk (verified: zero dynamic
      // `import()` in src/ outside test files) — so there's nothing an
      // already-open tab could fetch that the new SW wouldn't still serve.
      registerType: 'autoUpdate',
      strategies: 'generateSW',
      // No includeAssets: favicon.svg/apple-touch-icon.png/logo-source.svg are
      // already matched by workbox.globPatterns below — includeAssets would
      // just add duplicate (same-revision, harmless today, but fragile)
      // precache entries for the same files.
      manifest: {
        id: SCOPE,
        // `id`/`scope`/`start_url` follow BASE.
        name: 'Guía Zelda: Ocarina of Time',
        short_name: 'CP2077 Guía',
        description:
          'Guía de The Legend of Zelda: Ocarina of Time para Nintendo Switch 2 (2026): recorrido por mazmorras, las 100 Skulltulas doradas, Piezas de Corazón, canciones, objetos y jefes. Funciona sin internet. Obra de fans no oficial, no aprobada ni respaldada por Nintendo.',
        lang: 'es',
        theme_color: '#0d2b22',
        background_color: '#0d2b22',
        display: 'standalone',
        start_url: SCOPE,
        scope: SCOPE,
        categories: ['games', 'entertainment'],
        // Long-press the app icon: jump straight to these sections.
        shortcuts: [
          {
            name: 'Recorrido',
            url: `${SCOPE}chapters/`,
            icons: [{ src: asset('icons/pwa-192.png'), sizes: '192x192' }],
          },
          {
            name: 'Preguntas frecuentes',
            url: `${SCOPE}guide/#section-faq`,
            icons: [{ src: asset('icons/pwa-192.png'), sizes: '192x192' }],
          },
          {
            name: 'Skulltulas doradas',
            url: `${SCOPE}collectibles/gold-skulltula/`,
            icons: [{ src: asset('icons/pwa-192.png'), sizes: '192x192' }],
          },
          {
            name: 'Coleccionables',
            url: `${SCOPE}collectibles/`,
            icons: [{ src: asset('icons/pwa-192.png'), sizes: '192x192' }],
          },
        ],
        // The richer install dialog (Chrome/Android) shows these.
        screenshots: [
          {
            src: asset('screenshots/phone.png'),
            sizes: '780x1688',
            type: 'image/png',
            form_factor: 'narrow',
            label: 'El mapa de Skulltulas en el celular',
          },
          {
            src: asset('screenshots/desktop.png'),
            sizes: '1280x800',
            type: 'image/png',
            form_factor: 'wide',
            label: 'El recorrido del juego',
          },
        ],
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
        // `json` is the per-locale search index (src/pages/search-index.json.ts).
        globPatterns: ['**/*.{js,css,html,svg,png,ico,webp,woff2,json}'],
        // The guide's pictures (public/img/games/: thumbnails, screenshots
        // and maps; public/images/skulltulas/: the Skulltula map photos) are
        // deliberately NOT precached — that would multiply the
        // install download for images most sessions never open. They're
        // cached on first view instead (runtimeCaching below), and the
        // offline panel (/offline-images.json + the OfflineImages island)
        // can fetch them all into that cache ahead of time.
        // og/: share cards, fetched only by link previews (scripts/og-images.ts).
        globIgnores: ['img/games/**', 'images/skulltulas/**', 'og/**'],
        runtimeCaching: [
          {
            // Keep in sync with RUNTIME_IMAGE_DIRS (src/lib/runtime-cache.ts):
            // workbox serialises this function, so it can't read that list.
            urlPattern: ({ url }) =>
              url.pathname.includes('/img/games/') || url.pathname.includes('/images/skulltulas/'),
            handler: 'CacheFirst',
            options: {
              // The offline panel writes into this same cache by name.
              cacheName: RUNTIME_IMAGE_CACHE,
              // Roomy enough for every picture at once: a lower cap would
              // evict what the offline panel just downloaded.
              expiration: { maxEntries: 5000, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
        navigateFallback: SCOPE,
      },
      experimental: { directoryAndTrailingSlashHandler: true },
    }),
    ogImages(),
  ],
  vite: { plugins: [tailwindcss()] },
  output: 'static',
});
