import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import * as yaml from 'js-yaml';
import { AREA_ORDER, ZONE_MAP_BY_KEY, type SkulltulaArea } from '@/lib/skulltula-map-layout';

// Plain Node/fs checks against the raw content files — deliberately NOT going
// through astro:content (that requires the full Astro Vite pipeline). This
// still catches the failure modes that matter for a locale-mirrored content
// tree: missing translations, id drift between es/en, and structural counts
// the guide's copy asserts (e.g. "100 skulltulas").

const CONTENT_DIR = join(dirname(fileURLToPath(import.meta.url)));
const JSON_ENTITIES = ['rules', 'songs', 'equipment', 'skulltulas', 'hearts', 'rewards', 'bosses', 'tips', 'sidequests'];

function loadJson<T extends { id: string }>(locale: 'es' | 'en', name: string): T[] {
  return JSON.parse(readFileSync(join(CONTENT_DIR, locale, `${name}.json`), 'utf8')) as T[];
}

function chapterFiles(locale: 'es' | 'en'): string[] {
  const dir = join(CONTENT_DIR, locale, 'chapters');
  if (!existsSync(dir)) return [];
  return readdirSync(dir).filter((f) => f.endsWith('.md')).sort();
}

describe('content: es/en parity', () => {
  for (const name of JSON_ENTITIES) {
    it(`${name}.json has matching ids in es and en, same order`, () => {
      const es = loadJson('es', name);
      const en = loadJson('en', name);
      expect(en.map((e) => e.id)).toEqual(es.map((e) => e.id));
    });

    it(`${name}.json has no duplicate ids`, () => {
      const es = loadJson('es', name);
      const ids = es.map((e) => e.id);
      expect(new Set(ids).size).toBe(ids.length);
    });
  }

  it('chapters: es and en have the same 12 filenames', () => {
    const es = chapterFiles('es');
    expect(es).toHaveLength(12);
    const en = chapterFiles('en');
    expect(en).toEqual(es);
  });

  it.each(['es', 'en'] as const)('%s: every chapter has valid act/order/pills frontmatter', (locale) => {
    const files = chapterFiles(locale);
    const dir = join(CONTENT_DIR, locale, 'chapters');
    const orders = new Set<number>();
    for (const file of files) {
      const raw = readFileSync(join(dir, file), 'utf8');
      const match = raw.match(/^---\n([\s\S]*?)\n---/);
      expect(match, `${file} must start with a frontmatter block`).toBeTruthy();
      const fm = yaml.load(match![1]) as { act: string; order: number; pills: { type: string; label: string }[] };
      expect(['child', 'adult', 'end']).toContain(fm.act);
      orders.add(fm.order);
      for (const pill of fm.pills) {
        expect(['dungeon', 'boss', 'song', 'info']).toContain(pill.type);
        expect(typeof pill.label).toBe('string');
      }
    }
    expect(orders.size).toBe(files.length);
  });
});

interface SkulltulaShape {
  id: string;
  number: number;
  zone: string;
  zoneKey: string;
  area: SkulltulaArea;
  x: number;
  y: number;
}

describe('content: skulltulas', () => {
  it('has exactly 100 entries numbered 1-100 with no gaps or duplicates', () => {
    const skulltulas = loadJson<{ id: string; number: number }>('es', 'skulltulas');
    expect(skulltulas).toHaveLength(100);
    const numbers = skulltulas.map((s) => s.number).sort((a, b) => a - b);
    expect(numbers).toEqual(Array.from({ length: 100 }, (_, i) => i + 1));
  });

  it.each(['es', 'en'] as const)('%s: every entry has a valid map area and an in-range x/y', (locale) => {
    const skulltulas = loadJson<SkulltulaShape>(locale, 'skulltulas');
    for (const s of skulltulas) {
      expect(AREA_ORDER, `${s.id} has an unknown area ${s.area}`).toContain(s.area);
      expect(s.x, `${s.id}.x`).toBeGreaterThanOrEqual(0);
      expect(s.x, `${s.id}.x`).toBeLessThanOrEqual(100);
      expect(s.y, `${s.id}.y`).toBeGreaterThanOrEqual(0);
      expect(s.y, `${s.id}.y`).toBeLessThanOrEqual(100);
    }
  });

  it('every entry\'s zoneKey (es and en alike — it is a stable, untranslated identifier, same pattern as `area`) has a matching zone map', () => {
    // ZONE_MAP_BY_KEY's keys are authored in English (skulltula-map-layout.ts
    // is locale-agnostic map data, not translated UI copy) — `zoneKey` is
    // deliberately untranslated in both locale files, unlike the localized
    // `zone` display text, so it can be cross-checked directly regardless
    // of locale.
    for (const locale of ['es', 'en'] as const) {
      const skulltulas = loadJson<SkulltulaShape>(locale, 'skulltulas');
      for (const s of skulltulas) {
        expect(ZONE_MAP_BY_KEY[s.zoneKey], `${locale} ${s.id}: no zone map for zoneKey ${s.zoneKey}`).toBeTruthy();
        expect(ZONE_MAP_BY_KEY[s.zoneKey].hub, `${s.id}: zoneKey ${s.zoneKey}'s hub doesn't match its area`).toBe(s.area);
      }
    }
  });

  it('every zoneKey referenced by skulltulas.json exists in ZONE_MAP_BY_KEY, and vice versa every zone map is used', () => {
    const skulltulas = loadJson<{ id: string; zoneKey: string }>('en', 'skulltulas');
    const usedKeys = new Set(skulltulas.map((s) => s.zoneKey));
    for (const s of skulltulas) expect(ZONE_MAP_BY_KEY[s.zoneKey], s.zoneKey).toBeTruthy();
    for (const zoneKey of Object.keys(ZONE_MAP_BY_KEY)) {
      expect(usedKeys.has(zoneKey), `zone map "${zoneKey}" is never referenced by any skulltula`).toBe(true);
    }
  });

  it('no two skulltulas in the same zone render pins closer than a safe minimum distance apart — regression guard for the sk-053/sk-054-style pin-collision bugs this map has had before', () => {
    // Each zone is its own independent 0-100 canvas now (see
    // skulltula-map-layout.ts), so "same zone" is exactly "same zoneKey".
    const MIN_DISTANCE = 3; // percent, on a 0-100 canvas
    const skulltulas = loadJson<SkulltulaShape>('en', 'skulltulas');
    const byZone = new Map<string, SkulltulaShape[]>();
    for (const s of skulltulas) {
      const list = byZone.get(s.zoneKey) ?? [];
      list.push(s);
      byZone.set(s.zoneKey, list);
    }
    for (const [zoneKey, items] of byZone) {
      for (let i = 0; i < items.length; i++) {
        for (let j = i + 1; j < items.length; j++) {
          const a = items[i];
          const b = items[j];
          const distance = Math.hypot(a.x - b.x, a.y - b.y);
          expect(
            distance,
            `${zoneKey}: ${a.id} (${a.x},${a.y}) and ${b.id} (${b.x},${b.y}) are only ${distance.toFixed(2)} apart`,
          ).toBeGreaterThanOrEqual(MIN_DISTANCE);
        }
      }
    }
  });
});

describe('content: hearts', () => {
  it('has exactly 36 heart pieces and 8 heart containers', () => {
    const hearts = loadJson<{ id: string; kind: string }>('es', 'hearts');
    expect(hearts.filter((h) => h.kind === 'piece')).toHaveLength(36);
    expect(hearts.filter((h) => h.kind === 'container')).toHaveLength(8);
  });

  it('every heart piece has an area and a method', () => {
    const hearts = loadJson<{ id: string; kind: string; area?: string; method?: string }>('es', 'hearts');
    for (const h of hearts.filter((h) => h.kind === 'piece')) {
      expect(h.area).toBeTruthy();
      expect(h.method).toBeTruthy();
    }
  });

  it('every heart container has a source', () => {
    const hearts = loadJson<{ id: string; kind: string; source?: string }>('es', 'hearts');
    for (const h of hearts.filter((h) => h.kind === 'container')) {
      expect(h.source).toBeTruthy();
    }
  });
});

describe('content: equipment', () => {
  const VALID_CATEGORIES = new Set(['swords', 'shields', 'tunics', 'magic', 'bottles', 'postgame']);
  it('every item has a valid category', () => {
    const equipment = loadJson<{ id: string; category: string }>('es', 'equipment');
    for (const e of equipment) expect(VALID_CATEGORIES.has(e.category)).toBe(true);
  });

  it.each(['es', 'en'] as const)('%s: every optional stat is a positive number with a label and unit', (locale) => {
    type EquipmentShape = { id: string; stat?: { label: string; value: number; unit: string } };
    const equipment = loadJson<EquipmentShape>(locale, 'equipment');
    for (const e of equipment.filter((e) => e.stat)) {
      expect(e.stat!.value, e.id).toBeGreaterThan(0);
      expect(e.stat!.label, e.id).toBeTruthy();
      expect(e.stat!.unit, e.id).toBeTruthy();
    }
  });

  it('the Hookshot -> Longshot reach chain is a real doubling (not a flat/fabricated number)', () => {
    type EquipmentShape = { id: string; upgradeOf?: string; name: string; stat?: { value: number } };
    const equipment = loadJson<EquipmentShape>('es', 'equipment');
    const byName = new Map(equipment.map((e) => [e.name, e]));
    const longshot = equipment.find((e) => e.id === 'eq-longshot')!;
    const hookshot = byName.get(longshot.upgradeOf!)!;
    expect(longshot.stat!.value).toBeGreaterThan(hookshot.stat!.value);
  });
});

describe('content: songs', () => {
  it('has exactly 13 songs (12 melodies + Scarecrow’s Song)', () => {
    const songs = loadJson<{ id: string }>('es', 'songs');
    expect(songs).toHaveLength(13);
  });
});

describe('content: rewards', () => {
  it('has exactly 6 Skulltula House reward tiers', () => {
    const rewards = loadJson<{ id: string }>('es', 'rewards');
    expect(rewards).toHaveLength(6);
  });
});

describe('content: sidequests', () => {
  it('the Biggoron’s Sword trading route has 12 sequential steps', () => {
    const sidequests = loadJson<{ id: string; kind: string; step?: number }>('es', 'sidequests');
    const route = sidequests.filter((s) => s.kind === 'route').sort((a, b) => (a.step ?? 0) - (b.step ?? 0));
    expect(route).toHaveLength(12);
    expect(route.map((r) => r.step)).toEqual(Array.from({ length: 12 }, (_, i) => i + 1));
  });
});
