import { defineCollection, z } from 'astro:content';
import { glob, type Loader } from 'astro/loaders';
import { existsSync, readFileSync } from 'node:fs';
import { PUBLISHED_ENGINE_GAME_IDS } from './lib/games';

// Every content entity ships in both locales as sibling files under
// src/content/games/<game>/es/ and src/content/games/<game>/en/ (never a
// `locale` field per entry — the directory IS the locale). `z` comes from
// astro:content (not the top-level `zod` package): Astro vendors its own zod
// instance, and a type pulled from a separate `zod` import mismatches it.

// ─── The shared engine ───────────────────────────────────────────────────
// src/content/games/<game>/<locale>/<name>.json, one array per file. The
// site ships a single game (oot), but the loader keeps the engine's
// multi-game shape: one collection per kind of thing (`game-weapons_es`),
// each row stored as `<game>/<id>` and carrying `game` and its bare `slug`.
function gameRowsLoader(name: string, locale: 'es' | 'en'): Loader {
  return {
    name: `game-${name}-${locale}`,
    load: async ({ store, parseData, generateDigest, watcher }) => {
      // Draft games' files are never read (games.ts `status`).
      const paths = PUBLISHED_ENGINE_GAME_IDS.map((g) => ({
        game: g,
        path: `src/content/games/${g}/${locale}/${name}.json`,
      }));
      const sync = async () => {
        store.clear();
        for (const { game, path } of paths) {
          if (!existsSync(path)) continue;
          const rows = JSON.parse(readFileSync(path, 'utf8')) as { id: string }[];
          for (const [order, { id, ...rest }] of rows.entries()) {
            const key = `${game}/${id}`;
            const data = await parseData({ id: key, data: { order, ...rest, game, slug: id } });
            store.set({ id: key, data, digest: generateDigest(data) });
          }
        }
      };
      await sync();
      watcher?.on('change', (changed) => {
        if (paths.some((p) => changed.endsWith(p.path))) void sync();
      });
    },
  };
}

function gameJson<const Name extends string, Shape extends z.ZodRawShape>(
  name: Name,
  shape: Shape,
) {
  // Rows are listed in play order; `order` defaults to the row's position.
  const schema = z.object({
    order: z.number(),
    game: z.string(),
    slug: z.string(),
    ...shape,
  });
  const es = defineCollection({ loader: gameRowsLoader(name, 'es'), schema });
  const en = defineCollection({ loader: gameRowsLoader(name, 'en'), schema });
  // Literal keys, so astro:content can type each collection's data.
  return { [`game-${name}_es`]: es, [`game-${name}_en`]: en } as Record<
    `game-${Name}_es` | `game-${Name}_en`,
    typeof es
  >;
}

// Chapter ids are the file names ("ch01"); `part` is one of the game's
// meta rows of kind "part" (e.g. "house", "dlc").
const gamePillSchema = z.object({
  type: z.enum(['boss', 'shop', 'save', 'collectible', 'info', 'missable']),
  label: z.string(),
});
const gameChapterSchema = z.object({
  number: z.string(),
  title: z.string(),
  part: z.string(),
  order: z.number(),
  // One line for the chapter list ("The Guest House: Jack, the dissection room").
  summary: z.string().optional(),
  pills: z.array(gamePillSchema).default([]),
  // Screenshots of the chapter's areas (public/img/games/<game>/chapters/
  // <id>.webp, ids `<chapter>-<n>`, listed in src/data/game-images.json), in
  // play order, with a localized caption.
  photos: z.array(z.object({ id: z.string(), caption: z.string() })).default([]),
});
// Only published games: a draft's chapters are not even parsed.
const PUBLISHED_GLOB =
  PUBLISHED_ENGINE_GAME_IDS.length === 1
    ? PUBLISHED_ENGINE_GAME_IDS[0]
    : `{${PUBLISHED_ENGINE_GAME_IDS.join(',') || '__none__'}}`;
function gameChapters(locale: 'es' | 'en') {
  return defineCollection({
    loader: glob({
      pattern: `${PUBLISHED_GLOB}/${locale}/chapters/*.md`,
      base: 'src/content/games',
      generateId: ({ entry }) => entry.replace(`/${locale}/chapters/`, '/').replace(/\.md$/, ''),
    }),
    schema: gameChapterSchema,
  });
}

// Everything the game's own pages need to label: its parts (acts, areas,
// DLC) and its collectible types with how many there are and what all of
// them unlock.
const gameMetaShape = {
  kind: z.enum(['part', 'collectible']),
  label: z.string(),
  total: z.number().int().optional(),
  reward: z.string().optional(),
  note: z.string().optional(),
};

// One row per pickup (the tracker's checkbox): `type` is a meta collectible
// id, `chapter` a chapter id when the pickup belongs to one walkthrough step
// (many OoT collectibles can be picked up at any time: those leave it out
// and are grouped by `area`, the localized zone name).
const gameCollectibleShape = {
  type: z.string(),
  name: z.string(),
  chapter: z.string().optional(),
  area: z.string(),
  location: z.string(),
  how: z.string().optional(),
  missable: z.boolean().default(false),
  missableNote: z.string().optional(),
  value: z.number().optional(),
  note: z.string().optional(),
  // Map pin (the Gold Skulltula map, src/lib/skulltula-map-layout.ts): the
  // zone's map by its untranslated key ("Inside the Deku Tree"), the hub it
  // is listed under ("kokiri"), the pin's position in % of that zone's
  // picture, the floor tab for multi-floor dungeons ("b1") and the piece's
  // number on the pin. A type whose pieces carry `zoneKey`/`x`/`y` gets the
  // List/Map toggle on its page.
  number: z.number().int().positive().optional(),
  zoneKey: z.string().optional(),
  hub: z.string().optional(),
  x: z.number().min(0).max(100).optional(),
  y: z.number().min(0).max(100).optional(),
  floor: z.string().optional(),
};

const levelRow = z.object({ v: z.string(), p: z.number().optional() });
const gameWeaponShape = {
  name: z.string(),
  original: z.string().optional(),
  // Localized display group ("Pistolas", "Escopetas", "DLC").
  category: z.string(),
  // How and where you get it ("Guest house, 1st floor bathroom — Chapter 2").
  obtain: z.string(),
  chapter: z.string().optional(),
  price: z.string().optional(),
  // Base → max stats as copy ("Power", "1.2 → 2.0").
  stats: z.array(z.object({ label: z.string(), value: z.string() })).default([]),
  // Upgrade ledger per stat, first row is the base.
  levels: z.array(z.object({ label: z.string(), rows: z.array(levelRow) })).default([]),
  exclusive: z.string().optional(),
  verdict: z.string().optional(),
  notes: z.string().optional(),
  recommended: z.boolean().default(false),
};

const gameGearShape = {
  name: z.string(),
  original: z.string().optional(),
  kind: z.string(),
  where: z.string(),
  chapter: z.string().optional(),
  effect: z.string(),
  price: z.string().optional(),
  verdict: z.string().optional(),
};

const gameBossShape = {
  name: z.string(),
  original: z.string().optional(),
  chapters: z.string(),
  arena: z.string().optional(),
  weak: z.string().optional(),
  // Step-by-step strategy, one step per string.
  steps: z.array(z.string()).default([]),
  strategy: z.string().optional(),
  reward: z.string().optional(),
  note: z.string().optional(),
};

const gameEnemyShape = {
  name: z.string(),
  original: z.string().optional(),
  group: z.string(),
  chapters: z.string(),
  weak: z.string(),
  tactic: z.string(),
  drops: z.string().optional(),
  note: z.string().optional(),
};

const gameItemShape = {
  name: z.string(),
  original: z.string().optional(),
  type: z.enum([
    'key',
    'healing',
    'crafting',
    'ammo',
    'special',
    'treasure',
    'quickhack',
    'vehicle',
  ]),
  chapter: z.string().optional(),
  where: z.string().optional(),
  use: z.string(),
  recipe: z.string().optional(),
  value: z.number().optional(),
  note: z.string().optional(),
};

const gameFileShape = {
  name: z.string(),
  original: z.string().optional(),
  chapter: z.string(),
  where: z.string(),
  gist: z.string().optional(),
};

const gameAchievementShape = {
  name: z.string(),
  how: z.string(),
  tier: z.string().optional(),
  tip: z.string().optional(),
  missable: z.boolean().default(false),
};

const gameCharacterShape = {
  name: z.string(),
  // The English in-game name, shown under a Spanish name and linked too.
  original: z.string().optional(),
  role: z.string(),
  appears: z.string(),
  note: z.string(),
};

// Copy cards grouped by the page that shows them: the game's home (rules,
// lore), the Guide page (faq, survival, mechanics) and Extras (modes, dlc,
// unlocks, endings, secrets). `see` lists what to read next, comma
// separated: another card's id, or an entity as `<kind>/<id>`
// (`gear/reinforced-tendons`).
const gameCardShape = {
  section: z.enum([
    'faq',
    'rules',
    'lore',
    'mechanics',
    'survival',
    'modes',
    'dlc',
    'unlocks',
    'endings',
    'secrets',
  ]),
  title: z.string(),
  body: z.string(),
  see: z.string().optional(),
};

// In-game maps (public/img/games/<game>/maps/<id>.webp): one row per map,
// shown on the game's Maps page and on every chapter in `chapters` (a comma
// list of chapter ids).
const gameMapShape = {
  title: z.string(),
  area: z.string(),
  chapters: z.string(),
  caption: z.string().optional(),
  // Where the map image comes from (wiki file page), shown next to it.
  source: z.string().optional(),
};

// Shop / vendor plan (what to buy and when).
const gameShopShape = {
  chapter: z.string(),
  buy: z.string(),
  sell: z.string().optional(),
  avoid: z.string().optional(),
  cost: z.number().int().nonnegative().optional(),
};

export const collections = {
  'game-chapters_es': gameChapters('es'),
  'game-chapters_en': gameChapters('en'),
  ...gameJson('meta', gameMetaShape),
  ...gameJson('collectibles', gameCollectibleShape),
  ...gameJson('weapons', gameWeaponShape),
  ...gameJson('gear', gameGearShape),
  ...gameJson('bosses', gameBossShape),
  ...gameJson('enemies', gameEnemyShape),
  ...gameJson('items', gameItemShape),
  ...gameJson('files', gameFileShape),
  ...gameJson('achievements', gameAchievementShape),
  ...gameJson('characters', gameCharacterShape),
  ...gameJson('cards', gameCardShape),
  ...gameJson('shop', gameShopShape),
  ...gameJson('maps', gameMapShape),
};
