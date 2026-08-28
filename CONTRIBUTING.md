# Contribuir a OoT Guía

Gracias por el interés — este es un proyecto personal/fan-made, así que
mantenemos el proceso ligero. No hace falta pedir permiso para abrir un
issue o un PR pequeño.

## Correr el proyecto en local

```bash
npm install
npm run dev      # http://localhost:4321
npm run check    # gate: astro check + type-check + tests + build
```

Node >= 22 (ver `.nvmrc`).

## Dónde vive el contenido

Todo el contenido del juego está en `src/content/<locale>/`, duplicado en
`es/` (idioma por defecto, sin prefijo de ruta) y `en/` (bajo `/en/`):

- **Colecciones JSON** (`songs.json`, `skulltulas.json`, `hearts.json`,
  `equipment.json`, `bosses.json`, `rewards.json`, `tips.json`,
  `sidequests.json`, `rules.json`) — arrays de objetos con un `id` estable
  compartido entre locales.
- **`chapters/`** — un `.md` por mazmorra/paso de historia (`c1.md` …
  `c12.md`), con frontmatter (`number`, `title`, `act`, `order`,
  `skulltulaCount`, `pills`) y el cuerpo en Markdown.

**Convención es/en:** cada entrada en `es/algo.json` debe tener una entrada
con el mismo `id`, en el mismo orden, en `en/algo.json` (y lo mismo para los
archivos de `chapters/`). `src/content/shape.test.ts` verifica esto
automáticamente — un PR que solo traduzca un locale y no el otro va a fallar
`npm run check`.

## Reportar una corrección de contenido

La forma más rápida: usa el botón **"Reportar un problema"** (FeedbackFAB,
esquina inferior) en el sitio publicado — abre un issue de GitHub
pre-rellenado con la página actual, versión del build y (si aplica)
diagnósticos automáticos. No necesitas cuenta de GitHub para verlo, pero sí
para enviarlo.

Si prefieres abrir el issue tú mismo, usa la plantilla **Corrección de
contenido** al crear un issue nuevo.

## Qué hace bueno un PR de corrección de contenido

- **Cita una fuente** — Zelda Wiki, Zelda Dungeon Wiki, Thonky.com,
  GameWith, o tu propia partida con pasos para reproducirlo. Un dato de
  memoria sin fuente es más difícil de verificar.
- **Mantén ambos locales sincronizados** — si corriges `es/hearts.json`,
  corrige también la entrada equivalente (mismo `id`) en `en/hearts.json`.
  No es necesario que sea traducción palabra por palabra, pero el hecho
  corregido debe coincidir en ambos.
- **No cambies el `id`** de una entrada existente salvo que sea
  estrictamente necesario — otros archivos y tests pueden depender de él.
- **Corre `npm run check` antes de abrir el PR.** Es el mismo gate que
  corre en CI: `astro check` + `tsc --noEmit` + `vitest` + `astro build`.

Para todo lo demás (features, bugs de la app, dudas) no hay reglas
especiales — abre un issue o PR y lo revisamos.
