# OoT Guía

Guía y tracker offline (PWA, ES/EN) de **The Legend of Zelda: Ocarina of
Time 3D** (Nintendo 3DS): consejos de oro, equipo, las 13 canciones de
ocarina, las 100 Gold Skulltulas, Piezas de Corazón y Contenedores,
walkthrough mazmorra a mazmorra, jefes y secundarias (secuencia de
intercambio hacia la Espada de Biggoron). Los checklists de
skulltulas/corazones y la mazmorra actual se guardan en el dispositivo
(IndexedDB) — sin cuentas, sin backend, funciona sin conexión una vez
instalada.

```bash
npm install
npm run dev      # http://localhost:4321
npm run check    # gate: astro check + type-check + tests + build
```

Hermano de [resident-evil-4-guide](https://github.com/ArtemioPadilla/resident-evil-4-guide),
construido a mano replicando su arquitectura (Astro + React islands +
Nano Stores/idb-keyval + Tailwind v4 + `@vite-pwa/astro`), con identidad
visual, contenido y esquema de datos propios. Ver `CLAUDE.md` para las
decisiones de diseño y el TODO de contenido.
