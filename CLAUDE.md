# Guía Zelda: Ocarina of Time — agent context

An offline-first, bilingual (Spanish default at `/`, English under `/en/`)
fan companion guide for **The Legend of Zelda: Ocarina of Time — the
Nintendo Switch 2 remake (2026)**. It is meant to stay open next to the
game: walkthrough step by step, collectibles with checklists (the 100 Gold
Skulltulas with an interactive per-zone map, Pieces of Heart, Heart
Containers), equipment, bosses, songs, items, FAQ.

Deployed to GitHub Pages at <https://artemiop.com/zelda-ocarina-of-time-guide/>
(`.github/workflows/deploy.yml`, `ASTRO_BASE` defaults to
`/zelda-ocarina-of-time-guide`; `ci.yml` runs `npm run check` on every
push/PR). The engine was copied from `cyberpunk-2077-guide` (itself from
`resident-evil-guide`: Astro 5 + React islands + Nano Stores), single game.
The previous hand-built 3DS guide lives on in git history and in
`docs/reference-3ds/`.

## Target version & status

- Target: the **Switch 2 remake (2026)**. Names, locations and mechanics
  must hold for the remake; where it changed something from the N64/3DS
  versions, follow the remake.
- **Current content is a seed**: `src/content/games/oot/` holds one
  walkthrough step (`chapters/deku-tree.md`), the collectible types and the
  100 Skulltulas + 36 Pieces of Heart + 8 Heart Containers, all migrated
  from the 3DS guide and marked as pending the remake research
  (`src/content/games/oot/README.md`). The rest (chapters, bosses, items,
  equipment, cards, characters, maps) comes from the content research.
- `docs/reference-3ds/{es,en}/` is the old 3DS guide's content (JSON +
  chapter Markdown), kept verbatim as a **migration source only**: never
  render it, never import it from `src/`, never treat it as correct for the
  remake without checking. It is excluded from Prettier.

## Architecture

**Single game, served at the root.** `src/lib/games.ts` registers one game,
`oot` (`GAME_ID`), with its titles, tagline, edition (`covers`: «Nintendo
Switch 2 (remake, 2026)»), accent and `status`. The engine keeps its
multi-game shape internally — content rows carry a `game`, components take a
`game` prop — but nothing puts the game in the URL:

- Routes live directly in `src/pages/` (Spanish) and `src/pages/en/`
  (English): `/`, `/chapters/`, `/chapters/<id>/`, `/collectibles/`,
  `/collectibles/<type>/`, `/maps/`, `/arsenal/` (equipment),
  `/arsenal/<id>/`, `/arsenal/gear/<id>/`, `/bosses/[<id>/]`,
  `/enemies/[<id>/]`, `/items/[<id>/]`, `/files/`, `/achievements/`,
  `/guide/`, `/extras/`, `/characters/[<id>/]`, plus `search-index.json`,
  `offline-images.json` and `llms.txt`. Each page file is a two-liner that
  renders a `src/components/game/Game*Page.astro` with `game={GAME_ID}`;
  dynamic ones get their `getStaticPaths` from `src/lib/game-content.ts`.
- `gameHref(locale, game, path)` (`src/i18n/utils.ts`) returns the root
  path with locale prefix and deploy base; `pageHref` in
  `src/lib/entity-links.ts` has the same shape for the remark plugin.
  Always link through these (or `withBase`/`localizedHref`), never a bare
  string: the site runs under a sub-path.
- `BaseLayout.astro` builds the header nav from `ENGINE_SECTIONS`
  (`src/lib/nav.ts`) filtered by `gameSections()` — a section is linked
  only when the game has rows for it — plus the current-step strip
  (`GameChapterStrip`) and the mobile tab bar (`BottomTabBar`). Section
  pages are always generated; an empty one is just not linked. The footer
  shows the Nintendo fan-work notice and the sources line on every page.

**Content** (Zod-validated, `src/content.config.ts`):
`src/content/games/oot/<es|en>/` holds `meta.json` (parts = chapter groups:
`child` «Niño», `adult` «Adulto», `end` «Final»; collectible types with
totals: `skulltula` 100, `heart-piece` 36, `heart-container` 8),
`collectibles.json`, and, as they get written, `cards.json` (sections:
`rules`/`lore` on the home, `faq`/`mechanics`/`survival` on `/guide/`,
`modes`/`dlc`/`unlocks`/`endings`/`secrets` on `/extras/`), `weapons`,
`gear`, `bosses`, `enemies`, `items`, `files`, `achievements`, `characters`,
`shop`, `maps` JSON, plus `chapters/*.md` (one Markdown file per walkthrough
step; front matter `number`, `title`, `part`, `order`, optional `summary`,
`pills`, `photos`). A missing file is an empty collection. Every JSON file
ships in both locales with the same ids, order and data fields;
`src/lib/game-content.test.ts` pins that parity and the cross-references.
Copy supports blank-line paragraphs, `- ` bullets and `**bold**`
(`GameText.astro`). A `draft` status in `games.ts` hides all content
(`PUBLISH_GAMES=oot` previews it, `CHECK_GAMES=oot` tests it).

**Collectibles.** One row per pickup (`type` = a meta collectible id).
`chapter` is **optional**: a pickup tied to one walkthrough step names it
(it then shows on that chapter page); one that can be picked up any time
leaves it out and is grouped by `area` (the localized zone name). Type
pages group pieces by base name (`Gold Skulltula #12` →
`/collectibles/gold-skulltula/`, see `src/lib/game-collectible-types.ts`;
the slug comes from the English rows). Optional map fields: `number`,
`zoneKey` (untranslated zone key), `hub` (map hub id), `x`/`y` (% of the
zone picture), `floor` (dungeon floor tab).

**Gold Skulltula map.** When every piece of a type carries a pin
(`zoneKey`/`x`/`y`), `GameCollectibleTypePage.astro` renders the
`SkulltulaViewToggle` island (List/Map) instead of the plain
`GroupedChecklist`: List is the engine's grouped checklist (by zone), Map is
`SkulltulaMapView` → one `SkulltulaMap` per zone under the 7 hubs. Both
write `checklistStore('oot-collectibles-done')` with the row ids, so a pin,
a list row, the Collectibles page and a chapter page are the same tick.
Zone canvases, floor tabs and the real zone photos
(`public/images/skulltulas/**`, Zelda Wiki OoT/OoT3D screenshots, each
attributed under its map) are configured in `src/lib/skulltula-map-layout.ts`;
`skulltula-map-layout.test.ts` checks pins vs. zones/floors, collisions,
photo files and the OoT totals. Pins were calibrated for the 3DS layout
and need a check against the remake. Hub labels are `map.area.*` in
`src/i18n/ui.ts`.

**Auto-links.** `src/lib/game-entity-links.ts` builds a dictionary from the
content plus `src/content/games/oot/aliases.json` (short forms,
`page:/path/#hash` targets, `skip` for names never to link such as `Link`,
`protect` phrases). The remark plugin (`remark-entity-links.ts`) links the
chapter Markdown; `GameText.astro` links copy in pages. After changing the
dictionary run `rm -rf .astro node_modules/.astro` before judging a build.

**Checklists and state.** Nano Stores + `idb-keyval`, no backend:
`checklistStore('<game>-<list>-done')` (`oot-collectibles-done`,
`oot-files-done`, `oot-achievements-done`) and `currentChapterStore('oot')`
in `src/stores/checklist.ts`. Never rename a key or a content id once
shipped (a saved run must survive). Islands share state only through Nano
Stores (never React Context across islands); `useHydratedStore` avoids
hydration mismatches.

**Search.** `src/lib/game-search-index.ts` builds `/search-index.json` per
locale (precached); the `SearchBox` island (⌘K / Ctrl+K) lands on pages or
`#id` anchors — keep the ids when restyling.

**PWA / offline.** `@vite-pwa/astro` precaches every built page, script,
style, font and the search index. Pictures (`public/img/games/**` and the
Skulltula map photos `public/images/skulltulas/**`) are not precached: they
are runtime-cached (`CacheFirst`, cache `oot-images` in
`src/lib/runtime-cache.ts`) and the offline panel on the home
(`OfflinePanel.astro` + `OfflineImages`, `/offline-images.json`) downloads
them ahead of time. Install prompt key `oot-install-dismissed`; manifest
screenshots in `public/screenshots/`.

**Share cards.** `scripts/og-images.ts` draws one 1200×630 card per page
after the build (satori + sharp) in the OoT palette with Fraunces /
Literata / JetBrains Mono — satori needs `.woff`, so the static
`@fontsource/*` packages are devDependencies next to the variable ones the
site uses.

**Images.** `npm run images:games` (`scripts/import-game-images.mjs`)
fetches files from Zelda Wiki's MediaWiki API listed in
`scripts/wiki-images/oot*.json` (`{ collection, id, file, crop?, caption? }`),
writes `public/img/games/oot/<collection>/<id>.webp`, the manifest
`src/data/game-images.json` (empty for now) and
`public/img/games/SOURCES.md`. A row without a file renders text-only.

**Image licensing.** Game imagery is Nintendo's, used non-commercially: the
site stays free (no ads, no paywall), never uses Nintendo/Zelda logos as its
own branding (the Triforce mark in `public/favicon.svg` and `.brand-mark` is
a simple original drawing), and shows on every page «Obra de fans no
oficial, no aprobada ni respaldada por Nintendo.» / "Unofficial fan work,
not approved or endorsed by Nintendo." (`footer.notice`, also in the
manifest, the share cards and `llms.txt`). A takedown is honoured by
deleting the file and its manifest row.

**Theme.** Dark-first (inline script in `BaseLayout`, `src/stores/theme.ts` +
`ThemeToggle`), with a light skin. Tokens are declared once on `:root` with
`light-dark()` OKLCH values in `src/styles/global.css`: Kokiri emerald
`--primary`, Triforce gold `--gold`/`--pill-song`/`--pill-med`, Zora
sapphire `--accent-cyan`/`--pill-dungeon`/`--pill-shop` (engine token names
kept), Goron ruby `--destructive`, green-teal neutrals. Fonts self-hosted
via `@fontsource-variable`: **Fraunces** (display), **Literata** (body),
**JetBrains Mono** (labels). Section glyph = Navi's pulsing spark
(`.glyph`/`.spark`).

**UI copy** lives in `src/i18n/ui.ts` (es/en; `UiKey` is typed from the
Spanish block). Labels: chapters = Recorrido/Etapa · Walkthrough/Step,
arsenal = Equipo/Equipment, files = Notas/Notes. Item type enum values
`quickhack`/`vehicle` are legacy engine names relabelled Magia/Monturas.

## Conventions

- Conventional Commits (`feat:`, `fix:`, `docs:`, `chore:`…).
- Never push to `main` directly: branch (`claude/…`, `feat/…`) + PR.
- Every PR passes `npm run check` (astro check, `tsc --noEmit`, vitest,
  `prettier --check`, build).
- Never import `@radix-ui/*`, `framer-motion` or `@tremor/react`
  (`.claude/checklists/forbidden-imports.json`).
- Nano Stores for cross-island state, never React Context across islands.
- Keep es/en in sync in the same PR.
- Content tables are one row per line (`src/content/games/*/*/*.json` is
  Prettier-ignored on purpose).
