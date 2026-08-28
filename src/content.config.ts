import { defineCollection, z } from 'astro:content';
import { glob, file } from 'astro/loaders';

// Every content entity ships in both locales as sibling files under
// src/content/es/ and src/content/en/ (never a `locale` field per entry —
// the directory IS the locale). This factory keeps that pairing DRY.
// `schema` is typed via the same `z` re-exported by astro:content (not the
// top-level `zod` package) — Astro vendors its own zod instance, and a type
// pulled from a separate `zod` import structurally mismatches it.
function localizedJson<Schema extends z.ZodType>(name: string, schema: Schema) {
  return {
    [`${name}_es`]: defineCollection({ loader: file(`src/content/es/${name}.json`), schema }),
    [`${name}_en`]: defineCollection({ loader: file(`src/content/en/${name}.json`), schema }),
  };
}

const rulesSchema = z.object({
  title: z.string(),
  body: z.string(),
  order: z.number(),
});

// Ocarina songs — the analog of the RE4 guide's "buy-order" collection: the
// short list every player consults constantly while playing. `notation`
// carries the in-game C-button/stick symbol sequence as plain text (e.g.
// "▲ ► ▼ ▲ ► ▼") so it renders without needing custom glyph assets.
const songsSchema = z.object({
  name: z.string(),
  notation: z.string(),
  learnedFrom: z.string(),
  effect: z.string(),
  order: z.number(),
});

// Equipment & upgrades — swords, shields, tunics, magic/bottle items and the
// postgame Biggoron's Sword. Analog of RE4's weapons collection.
//
// `stat` is a small optional numeric progression — only present on the
// handful of items where an actual documented in-game number exists *and*
// a before/after comparison is meaningful (the sword-damage chain, the
// Hookshot→Longshot reach chain). Most equipment entries have no numeric
// game stat at all (OoT never exposes shield "defense" or tunic values as
// numbers), so this stays optional rather than becoming a required field
// with fabricated data. `value` is expressed in `unit` (hearts of damage
// for swords, meters for hookshot reach), sourced from Zelda Wiki /
// CloudModding's OoT damage charts (see EquipmentPage's stat bar caption).
const equipmentSchema = z.object({
  name: z.string(),
  category: z.enum(['swords', 'shields', 'tunics', 'magic', 'bottles', 'postgame']),
  obtain: z.string(),
  effect: z.string().optional(),
  upgradeOf: z.string().optional(),
  notes: z.string().optional(),
  recommended: z.boolean().default(false),
  stat: z.object({ label: z.string(), value: z.number().positive(), unit: z.string() }).optional(),
});

// The 7 top-level overworld hubs the interactive Skulltula map's List view
// groups its 31 fine-grained `zone` headings under. Purely a navigation
// grouping now — the map itself renders one canvas per `zoneKey` (see
// `src/lib/skulltula-map-layout.ts`), not one per hub.
const skulltulaAreaSchema = z.enum([
  'kokiri',
  'hyrule-field',
  'kakariko',
  'death-mountain',
  'zora',
  'lake-hylia',
  'gerudo',
]);

// The 100 Gold Skulltulas — this guide's primary completionist checklist
// (analog of RE4's 15 blue medallions). `zone` is the localized, human-
// readable heading shown in the UI (translated per locale); `zoneKey` is
// the same zone but as a stable, untranslated identifier (always the
// English name, identical in both `es/skulltulas.json` and
// `en/skulltulas.json` — the same non-localized-key pattern `area` already
// uses) that `src/lib/skulltula-map-layout.ts`'s `ZONE_MAPS` is keyed by.
// `x`/`y` are percentages (0-100) within that skulltula's *own zone's* map
// canvas — either a real sourced photo/screenshot of that zone (see
// `ZONE_MAPS[zoneKey].image`) or, where no real image was sourced, a
// single-region schematic fallback that fills the whole 0-100 canvas.
const skulltulasSchema = z.object({
  number: z.number().min(1).max(100),
  zone: z.string(),
  zoneKey: z.string(),
  area: skulltulaAreaSchema,
  x: z.number().min(0).max(100),
  y: z.number().min(0).max(100),
  location: z.string(),
  note: z.string().optional(),
});

// Discriminated by `kind`: a Piece of Heart always carries area/method/hero,
// a full Heart Container always carries a source — matches the RE4 guide's
// combinable-vs-suelto treasure split (many small collectibles vs. a handful
// of standalone ones), just re-grounded in OoT's actual item economy.
const heartsSchema = z.discriminatedUnion('kind', [
  z.object({
    kind: z.literal('piece'),
    name: z.string(),
    area: z.string(),
    method: z.string(),
    hero: z.enum(['child', 'adult', 'either']),
    missable: z.boolean().default(false),
    note: z.string().optional(),
  }),
  z.object({
    kind: z.literal('container'),
    name: z.string(),
    source: z.string(),
    note: z.string().optional(),
  }),
]);

// Gold Skulltula House reward tiers (Kakariko's cursed family) — a small
// reference table, analog of RE4's gems-location table.
const rewardsSchema = z.object({
  threshold: z.string(),
  reward: z.string(),
  effect: z.string(),
});

const bossesSchema = z.object({
  name: z.string(),
  chapters: z.string(),
  strategy: z.string(),
  drop: z.string().optional(),
  order: z.number(),
});

const tipsSchema = z.object({
  title: z.string(),
  items: z.array(z.string()),
  order: z.number(),
});

// Sidequests: `route` is the ordered Biggoron's Sword trading-sequence chain,
// `unlock` is every other notable sidequest payoff (Trading Sequence, Cucco
// game, Horseback Archery, Big Poe hunting, Gerudo Training Ground, Great
// Fairies, Mask sidequest…).
const sidequestsSchema = z.union([
  z.object({ kind: z.literal('unlock'), name: z.string(), how: z.string(), order: z.number() }),
  z.object({ kind: z.literal('route'), step: z.number(), title: z.string(), body: z.string() }),
]);

const chaptersSchema = z.object({
  number: z.string(),
  title: z.string(),
  act: z.enum(['child', 'adult', 'end']),
  order: z.number(),
  skulltulaCount: z.number().optional(),
  pills: z.array(z.object({ type: z.enum(['dungeon', 'boss', 'song', 'info']), label: z.string() })),
});

export const collections = {
  ...localizedJson('rules', rulesSchema),
  ...localizedJson('songs', songsSchema),
  ...localizedJson('equipment', equipmentSchema),
  ...localizedJson('skulltulas', skulltulasSchema),
  ...localizedJson('hearts', heartsSchema),
  ...localizedJson('rewards', rewardsSchema),
  ...localizedJson('bosses', bossesSchema),
  ...localizedJson('tips', tipsSchema),
  ...localizedJson('sidequests', sidequestsSchema),
  chapters_es: defineCollection({ loader: glob({ pattern: '*.md', base: 'src/content/es/chapters' }), schema: chaptersSchema }),
  chapters_en: defineCollection({ loader: glob({ pattern: '*.md', base: 'src/content/en/chapters' }), schema: chaptersSchema }),
};
