import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import {
  collectibleGroupName,
  collectibleTypeOf,
  groupCollectibles,
  localizedTypeName,
  slugifyCollectible,
  splitCollectibleName,
  valueSpan,
  type CollectibleRow,
} from './game-collectible-types';
import { PUBLISHED_ENGINE_GAME_IDS } from './games';

const SRC = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (game: string, locale: string) => {
  const p = join(SRC, 'content', 'games', game, locale, 'collectibles.json');
  return existsSync(p) ? (JSON.parse(readFileSync(p, 'utf8')) as CollectibleRow[]) : [];
};

describe('splitCollectibleName', () => {
  it('drops the piece number, keeping what follows it apart', () => {
    expect(splitCollectibleName('Tarot Graffiti #12')).toEqual({ base: 'Tarot Graffiti' });
    expect(splitCollectibleName('Safe #3 (Basement)')).toEqual({
      base: 'Safe',
      qual: '(Basement)',
    });
    expect(splitCollectibleName('Iconic Weapon (Dogtown) #4')).toEqual({
      base: 'Iconic Weapon (Dogtown)',
    });
    expect(splitCollectibleName('Fish ×3')).toEqual({ base: 'Fish' });
    expect(splitCollectibleName('Treasure Photo (Fireplace)')).toEqual({
      base: 'Treasure Photo (Fireplace)',
    });
    expect(splitCollectibleName('Militech Crate 02')).toEqual({ base: 'Militech Crate 02' });
  });
});

describe('collectibleGroupName', () => {
  it('keeps a qualifier every piece shares, drops one that changes', () => {
    expect(
      collectibleGroupName([
        'Cyberpsycho Sighting #1 (Dogtown)',
        'Cyberpsycho Sighting #2 (Dogtown)',
      ]),
    ).toBe('Cyberpsycho Sighting (Dogtown)');
    expect(collectibleGroupName(['Tracking Module #1 (Rare)', 'Tracking Module #2 (Common)'])).toBe(
      'Tracking Module',
    );
    // A single piece's qualifier says where it is, not what it is.
    expect(collectibleGroupName(['Stash #2 ("7" puzzle)'])).toBe('Stash');
    expect(collectibleGroupName(['Crimson Glass'])).toBe('Crimson Glass');
  });
});

describe('slugifyCollectible', () => {
  it('makes plain ASCII URL segments', () => {
    expect(slugifyCollectible('Tarot Graffiti')).toBe('tarot-graffiti');
    expect(slugifyCollectible("Johnny's Shard")).toBe('johnnys-shard');
    expect(slugifyCollectible('Mæstro Module')).toBe('maestro-module');
    expect(slugifyCollectible('Cyberpsycho Sighting (Dogtown)')).toBe(
      'cyberpsycho-sighting-dogtown',
    );
    expect(slugifyCollectible('N.C.P.D. Scanner Hustle')).toBe('ncpd-scanner-hustle');
  });
});

describe('groupCollectibles', () => {
  const rows: CollectibleRow[] = [
    { id: 'a1', type: 'psycho', name: 'Cyberpsycho Sighting #1', value: 100 },
    { id: 'm1', type: 'tarot', name: 'Tarot Graffiti #1' },
    { id: 'a2', type: 'psycho', name: 'Cyberpsycho Sighting #2', value: 300 },
    { id: 'n1', type: 'dt', name: 'Cyberpsycho Sighting #1 (Dogtown)' },
    { id: 'n2', type: 'dt', name: 'Cyberpsycho Sighting #2 (Dogtown)' },
    { id: 'x1', type: 'other', name: 'Cyberpsycho Sighting #9' },
  ];
  const types = groupCollectibles(rows);

  it('groups by meta type and name, in first-seen order', () => {
    expect(types.map((t) => [t.slug, t.meta, t.ids])).toEqual([
      ['cyberpsycho-sighting', 'psycho', ['a1', 'a2']],
      ['tarot-graffiti', 'tarot', ['m1']],
      ['cyberpsycho-sighting-dogtown', 'dt', ['n1', 'n2']],
      ['cyberpsycho-sighting-other', 'other', ['x1']],
    ]);
  });

  it('maps every row to its type and names it per locale', () => {
    expect(collectibleTypeOf(types).get('a2')).toBe('cyberpsycho-sighting');
    const es = rows.map((r) => (r.id === 'm1' ? { ...r, name: 'Grafiti de tarot #1' } : r));
    expect(localizedTypeName(types[1], es)).toBe('Grafiti de tarot');
  });

  it('spans the values', () => {
    expect(valueSpan([100, undefined, 300])).toEqual({ min: 100, max: 300, sum: 400 });
    expect(valueSpan([undefined])).toBeUndefined();
  });
});

// The routes' neighbours under /collectibles/ (index.astro, …): a
// type slug equal to one would overwrite that page.
const RESERVED = readdirSync(join(SRC, 'pages', 'collectibles'))
  .filter((f) => !f.startsWith('['))
  .map((f) => f.replace(/\.(astro|ts|js)$/, ''));

describe.each(PUBLISHED_ENGINE_GAME_IDS.filter((g) => read(g, 'en').length > 0))(
  'collectible types of %s',
  (game) => {
    const en = read(game, 'en');
    const es = read(game, 'es');
    const types = groupCollectibles(en);

    it('puts every row in exactly one type, with unique URL-safe slugs', () => {
      const ids = types.flatMap((t) => t.ids).sort();
      expect(ids).toEqual(en.map((r) => r.id).sort());
      expect(new Set(types.map((t) => t.slug)).size).toBe(types.length);
      for (const t of types) expect(t.slug, t.name).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
    });

    it('never takes a URL another file under /collectibles/ uses', () => {
      for (const t of types) expect(RESERVED, t.slug).not.toContain(t.slug);
    });

    it('names each type in Spanish from the same pieces', () => {
      expect(es.map((r) => r.id)).toEqual(en.map((r) => r.id));
      for (const t of types) expect(localizedTypeName(t, es), t.slug).not.toBe('');
    });
  },
);
