import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { ENGINE_GAME_IDS, PUBLISHED_ENGINE_GAME_IDS } from './games';

/**
 * The guide's content (src/content/games/<game>/<locale>/): es/en parity
 * (same files, ids, order and data fields), plus the cross-references the
 * pages rely on — a collectible's type must be one of the game's meta
 * types, every chapter reference must be a real chapter, ids unique.
 */
const GAMES_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'content', 'games');

type Row = Record<string, unknown> & { id: string };
const read = (game: string, locale: string, file: string): Row[] =>
  JSON.parse(readFileSync(join(GAMES_DIR, game, locale, file), 'utf8')) as Row[];

// `kind` is data in meta.json (part/collectible) but a display label in
// gear.json, so it is compared for meta only.
const DATA_FIELDS = new Set([
  'order',
  'type',
  'chapter',
  'total',
  'missable',
  'value',
  'cost',
  'recommended',
  'section',
  'see',
]);

// Published games only: a draft is still being written (games.ts `status`).
// CHECK_GAMES=oot (or "all") checks a draft too while it is authored.
const requested = (process.env.CHECK_GAMES ?? '').split(',').filter(Boolean);
const candidates = requested.includes('all')
  ? ENGINE_GAME_IDS
  : [
      ...new Set([
        ...PUBLISHED_ENGINE_GAME_IDS,
        ...ENGINE_GAME_IDS.filter((g) => requested.includes(g)),
      ]),
    ];
const games = candidates.filter((g) => existsSync(join(GAMES_DIR, g, 'es')));

function frontMatter(game: string, locale: string, file: string) {
  const src = readFileSync(join(GAMES_DIR, game, locale, 'chapters', file), 'utf8');
  const fm = src.match(/^---\n([\s\S]*?)\n---/)?.[1] ?? '';
  const pick = (key: string) =>
    fm
      .match(new RegExp(`^${key}:\\s*(.+)$`, 'm'))?.[1]
      ?.trim()
      .replace(/^['"]|['"]$/g, '');
  return { order: pick('order'), part: pick('part') };
}

describe.each(games)('engine game %s', (game) => {
  const jsonFiles = readdirSync(join(GAMES_DIR, game, 'es')).filter((f) => f.endsWith('.json'));
  const chapterFiles = existsSync(join(GAMES_DIR, game, 'es', 'chapters'))
    ? readdirSync(join(GAMES_DIR, game, 'es', 'chapters')).filter((f) => f.endsWith('.md'))
    : [];
  const chapterIds = new Set(chapterFiles.map((f) => f.replace(/\.md$/, '')));
  const rows = (file: string) =>
    jsonFiles.includes(file) ? read(game, 'es', file) : ([] as Row[]);

  it('both locales have the same files', () => {
    const en = readdirSync(join(GAMES_DIR, game, 'en')).filter((f) => f.endsWith('.json'));
    expect(en.sort()).toEqual([...jsonFiles].sort());
    const enChapters = existsSync(join(GAMES_DIR, game, 'en', 'chapters'))
      ? readdirSync(join(GAMES_DIR, game, 'en', 'chapters')).filter((f) => f.endsWith('.md'))
      : [];
    expect(enChapters.sort()).toEqual([...chapterFiles].sort());
  });

  it.each(jsonFiles)('%s: same ids in the same order, same data fields, unique ids', (file) => {
    const es = read(game, 'es', file);
    const en = read(game, 'en', file);
    expect(
      en.map((r) => r.id),
      'ids',
    ).toEqual(es.map((r) => r.id));
    expect(new Set(es.map((r) => r.id)).size, 'unique ids').toBe(es.length);
    es.forEach((row, i) => {
      for (const key of Object.keys(row)) {
        if (!DATA_FIELDS.has(key) && !(key === 'kind' && file === 'meta.json')) continue;
        expect(en[i][key], `${file} › ${row.id} › ${key}`).toEqual(row[key]);
      }
      // Level ledgers: the prices are data, the labels copy.
      if (Array.isArray(row.levels)) {
        const prices = (v: unknown) =>
          (v as { rows: { p?: number }[] }[]).map((l) => l.rows.map((r) => r.p ?? null));
        expect(prices(en[i].levels), `${file} › ${row.id} › levels`).toEqual(prices(row.levels));
      }
    });
  });

  it('maps: same chapters in both locales, every one a real chapter', () => {
    if (!jsonFiles.includes('maps.json')) return;
    const es = read(game, 'es', 'maps.json');
    const en = read(game, 'en', 'maps.json');
    const list = (r: Row) =>
      String(r.chapters)
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
    es.forEach((m, i) => {
      expect(list(en[i]), `maps › ${m.id} › chapters`).toEqual(list(m));
      expect(list(m).length, `maps › ${m.id} has chapters`).toBeGreaterThan(0);
      for (const c of list(m)) expect(chapterIds, `maps › ${m.id}`).toContain(c);
    });
  });

  it('chapter photos: the same ids in both locales, named after their chapter', () => {
    const photoIds = (locale: string, f: string) => {
      const src = readFileSync(join(GAMES_DIR, game, locale, 'chapters', f), 'utf8');
      const fm = src.match(/^---\n([\s\S]*?)\n---/)?.[1] ?? '';
      return [...fm.matchAll(/^\s*-\s*\{?\s*id:\s*['"]?([^'",}\s]+)/gm)].map((m) => m[1]);
    };
    for (const f of chapterFiles) {
      const ids = photoIds('es', f);
      expect(photoIds('en', f), f).toEqual(ids);
      for (const id of ids) expect(id, f).toMatch(new RegExp(`^${f.replace(/\.md$/, '')}-\\d+$`));
    }
  });

  it('chapters: same order and part in both locales', () => {
    for (const f of chapterFiles)
      expect(frontMatter(game, 'en', f), f).toEqual(frontMatter(game, 'es', f));
  });

  it('chapter parts are declared in meta', () => {
    const parts = new Set(
      rows('meta.json')
        .filter((m) => m.kind === 'part')
        .map((m) => m.id),
    );
    for (const f of chapterFiles) expect(parts, f).toContain(frontMatter(game, 'es', f).part);
  });

  it('collectibles use declared types and real chapters, within the declared totals', () => {
    const kinds = rows('meta.json').filter((m) => m.kind === 'collectible');
    const kindIds = new Set(kinds.map((k) => k.id));
    const collectibles = rows('collectibles.json');
    for (const c of collectibles) {
      expect(kindIds, `${c.id} type`).toContain(c.type);
      expect(chapterIds, `${c.id} chapter`).toContain(c.chapter);
    }
    for (const k of kinds) {
      if (typeof k.total !== 'number') continue;
      const n = collectibles.filter((c) => c.type === k.id).length;
      expect(n, `${k.id}: ${n} rows vs total ${k.total}`).toBeLessThanOrEqual(k.total);
    }
  });

  it('every chapter reference points at a real chapter', () => {
    for (const file of ['files.json', 'items.json', 'weapons.json', 'gear.json', 'shop.json']) {
      for (const r of rows(file)) {
        if (typeof r.chapter !== 'string') continue;
        expect(chapterIds, `${file} › ${r.id}`).toContain(r.chapter);
      }
    }
    for (const b of rows('bosses.json')) {
      const refs = String(b.chapters)
        .split(/[,;]/)
        .map((s) => s.trim())
        .filter(Boolean);
      expect(refs.length, `bosses › ${b.id} has chapters`).toBeGreaterThan(0);
      for (const r of refs) expect(chapterIds, `bosses › ${b.id}`).toContain(r);
    }
  });

  it("cards: every `see` is another card or an entity's page", () => {
    const cards = rows('cards.json');
    const known = new Set(cards.map((c) => c.id));
    for (const kind of ['weapons', 'gear', 'bosses', 'enemies', 'items', 'characters'])
      for (const r of rows(`${kind}.json`)) known.add(`${kind}/${r.id}`);
    for (const c of cards) {
      if (typeof c.see !== 'string') continue;
      for (const k of c.see.split(',').map((x) => x.trim()))
        expect(known, `cards › ${c.id} › see`).toContain(k);
    }
  });
});

describe('engine games', () => {
  it('the test covers every game that has content', () => {
    expect(games.every((g) => ENGINE_GAME_IDS.includes(g))).toBe(true);
  });
});
