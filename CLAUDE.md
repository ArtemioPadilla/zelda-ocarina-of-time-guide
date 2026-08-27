# OoT Guía — agent context

Sibling project to [resident-evil-4-guide](https://github.com/ArtemioPadilla/resident-evil-4-guide),
built by hand to match its architecture — Astro (static output) + React
islands + Nano Stores/idb-keyval trackers + Tailwind v4 + `@vite-pwa/astro`,
full es/en i18n via `src/i18n/ui.ts` — with a distinct visual identity,
content schema, and dataset for a different game. The Inceptor generator
(`create-inceptor-app`, https://github.com/ArtemioPadilla/inceptor) that
originally bootstrapped the RE4 repo was inspected but not re-run here: its
current template ships a much heavier "full" archetype (MDX, Playwright,
ESLint, base-ui, pagefind…) than the lean scaffold RE4 actually ended up
with after its own dependency audit, so this repo was hand-assembled to
match RE4's *already-trimmed* result directly instead of re-deriving it
through the generator and re-trimming again.

## Target version & scope

This guide targets **Ocarina of Time 3D** (Nintendo 3DS, 2011) as its
primary reference — the remaster, not the 1998 N64 original — the same way
the RE4 sibling guide targets the Wii/HD port rather than the 2005 original.
Where the 3DS version changed something meaningfully (Sheikah Stone hints,
gyro/touch aiming, the Master Quest option, Boss Challenge mode), this guide
follows the 3DS behavior; item/song/location names follow the 3DS English
and Spanish localizations.

## Content-collection mapping (RE4 → OoT)

| RE4 collection | OoT collection | Notes |
|---|---|---|
| `chapters` | `chapters` | 12 story/dungeon steps: 5 child-era, 5 adult-era, 2 endgame (`act: child\|adult\|end`) |
| `medallions` (15, primary checklist) | `skulltulas` (100, primary checklist) | Grouped by the same 31 areas every published Skulltula guide uses |
| `treasures` (combinable/suelto) | `hearts` (piece/container) | 36 Heart Pieces (secondary checklist) + 8 boss Heart Containers |
| `weapons` | `equipment` | Swords, shields, tunics/boots, magic & key items, bottles, postgame |
| `bosses` | `bosses` | 8 dungeon bosses + Ganondorf + Ganon |
| `gems` (table) | `rewards` (table) | The 6 Skulltula House reward tiers (10/20/30/40/50/100) |
| `survival` | `tips` | Combat, magic/bottle economy, explosives, missables, navigation, money |
| `buy-order` | `songs` | The 13 ocarina songs (no merchant economy in OoT) |
| `postgame` | `sidequests` | `route` = the 12-step Biggoron's Sword trading chain; `unlock` = Cucco game, Horseback Archery, Big Poe hunting, Gerudo Training Ground, Great Fairies, Mask of Truth |

## Design direction

Distinct from RE4's amber/leather ledger palette: a Kokiri-forest emerald
green + Triforce gold + Zora sapphire palette (`src/styles/global.css`,
`light-dark()` OKLCH tokens, contrast verified computationally — see the
comments next to each token). Typography swaps Cinzel/Alegreya/Special Elite
for **Fraunces** (storybook display serif) / **Literata** (warm reading
serif) / **JetBrains Mono** (clean UI mono). The decorative motif is
`.spark` — a small pulsing fairy-light glyph (Navi) — replacing RE4's
`.flame` everywhere the brand mark appears.

## Content TODO

Closed in a follow-up pass (see PR history / commit log for the exact
research sources — Zelda Wiki, Zelda Dungeon Wiki, Thonky.com, GameWith):

- **Skulltula location text is now token-precise.** All 100 `skulltulas`
  entries in both locales were rewritten from the original rotating
  area-level hints to a unique, hand-sourced description per individual
  token (cross-referenced against Thonky's and GameWith's per-area Gold
  Skulltula guides). Zone names/order/counts were left untouched — only
  `location` text changed.
- **Gerudo Training Ground** stayed out of the `chapters` collection on
  purpose (that collection is asserted at exactly 12 entries by
  `shape.test.ts` and documented as "12 story/dungeon steps" — turning it
  into a 13th chapter would be a structural change beyond this pass, not a
  content gap). Instead: the `sidequests` unlock row was corrected (it
  wrongly named the reward "Light Arrows" — verified via Zelda Wiki/GameWith
  that Gerudo Training Ground's reward is actually the **Ice Arrows**, Light
  Arrows come from Zelda outside Ganon's Castle) and expanded with a real
  room-by-room summary; a new `tips` entry ("Gerudo Training Ground, room by
  room") adds six sourced per-room hints (silver rupee rooms, the Hover
  Boots quicksand room, the Lens of Truth passage, the underwater room, the
  Megaton Hammer totem, key order for the final doors).
- **Fishing Pond, Poe Collection, and the Cucco-in-house Easter egg** now
  each have their own `sidequests` unlock row: `sq-golden-scale` (adult
  20+ lb catch → Golden Scale), `sq-poe-collector` (10 Big Poes sold to the
  Ghost Shop → bonus Bottle), `sq-super-cucco` (Talon's Super Cucco
  minigame at Lon Lon Ranch → Bottle of Lon Lon Milk). The existing
  Fishing-Pond Piece of Heart (`hp-17` in `hearts`) was left as-is — it was
  already tracked, just not the pond's *other* reward.

Still deliberately out of scope:

- **Master Quest and Boss Challenge mode** (3DS-exclusive extras) are not
  covered.
- **Gerudo Training Ground** still doesn't have its own dedicated page (see
  above for why, and what was done instead within the existing schema).

## Conventions

Same as RE4: Conventional Commits, `npm run check` must pass before any PR,
never import `@radix-ui/*` / `framer-motion` / `@tremor/react`, Nano Stores
for cross-island state (never React Context across islands).
