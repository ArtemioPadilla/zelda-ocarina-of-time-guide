import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { AREA_ORDER, ZONE_MAPS, ZONE_MAP_BY_KEY } from './skulltula-map-layout';
import { groupCollectibles, type CollectibleRow } from './game-collectible-types';

/**
 * The Gold Skulltula map: every Skulltula row of collectibles.json is a pin
 * on a configured zone canvas (and floor), every zone map is used, every
 * photo exists, pins don't collide — plus the OoT totals the copy asserts.
 */
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const CONTENT = join(ROOT, 'src', 'content', 'games', 'oot');

interface Row extends CollectibleRow {
  area: string;
  location: string;
  number?: number;
  zoneKey?: string;
  hub?: string;
  x?: number;
  y?: number;
  floor?: string;
}
const rows = (locale: 'es' | 'en'): Row[] =>
  JSON.parse(readFileSync(join(CONTENT, locale, 'collectibles.json'), 'utf8')) as Row[];
const skulltulas = (locale: 'es' | 'en') => rows(locale).filter((r) => r.type === 'skulltula');
const meta = JSON.parse(readFileSync(join(CONTENT, 'es', 'meta.json'), 'utf8')) as {
  id: string;
  kind: string;
  total?: number;
}[];

describe('OoT collectibles', () => {
  it('declares the Skulltula and heart types with their totals', () => {
    const totals = Object.fromEntries(
      meta.filter((m) => m.kind === 'collectible').map((m) => [m.id, m.total]),
    );
    expect(totals).toEqual({ skulltula: 100, 'heart-piece': 36, 'heart-container': 8 });
  });

  it('has the 100 Gold Skulltulas numbered 1-100, 36 Pieces of Heart and 8 Heart Containers', () => {
    const sk = skulltulas('es');
    expect(sk).toHaveLength(100);
    expect(sk.map((s) => s.number).sort((a, b) => a! - b!)).toEqual(
      Array.from({ length: 100 }, (_, i) => i + 1),
    );
    expect(rows('es').filter((r) => r.type === 'heart-piece')).toHaveLength(36);
    expect(rows('es').filter((r) => r.type === 'heart-container')).toHaveLength(8);
  });

  it('groups each kind into one type page (/collectibles/gold-skulltula/ has the map)', () => {
    const types = groupCollectibles(rows('en'));
    expect(types.map((t) => [t.slug, t.ids.length])).toEqual([
      ['gold-skulltula', 100],
      ['piece-of-heart', 36],
      ['heart-container', 8],
    ]);
  });
});

describe('Skulltula map pins', () => {
  it.each(['es', 'en'] as const)(
    '%s: every Skulltula has a known hub, zone canvas and in-range x/y',
    (locale) => {
      for (const s of skulltulas(locale)) {
        expect(AREA_ORDER as readonly string[], `${s.id} hub`).toContain(s.hub);
        const zone = ZONE_MAP_BY_KEY[s.zoneKey ?? ''];
        expect(zone, `${s.id}: no zone map for ${s.zoneKey}`).toBeTruthy();
        expect(zone.hub, `${s.id}: ${s.zoneKey} is not in hub ${s.hub}`).toBe(s.hub);
        for (const v of [s.x, s.y]) {
          expect(v, s.id).toBeGreaterThanOrEqual(0);
          expect(v, s.id).toBeLessThanOrEqual(100);
        }
      }
    },
  );

  it('every zone map is used by some Skulltula', () => {
    const used = new Set(skulltulas('en').map((s) => s.zoneKey));
    for (const z of ZONE_MAPS) expect(used.has(z.zone), `${z.zone} unused`).toBe(true);
  });

  it('a Skulltula in a floored dungeon names one of its floors; others name none', () => {
    for (const s of skulltulas('en')) {
      const floors = ZONE_MAP_BY_KEY[s.zoneKey!].floors;
      if (floors?.length) {
        expect(
          floors.map((f) => f.key),
          `${s.id} floor`,
        ).toContain(s.floor);
      } else expect(s.floor, `${s.id} has a floor outside a floored zone`).toBeUndefined();
    }
  });

  it('no two pins on the same canvas (zone + floor) are closer than 3%', () => {
    const byCanvas = new Map<string, Row[]>();
    for (const s of skulltulas('en')) {
      const key = `${s.zoneKey}::${s.floor ?? ''}`;
      byCanvas.set(key, [...(byCanvas.get(key) ?? []), s]);
    }
    for (const [key, pins] of byCanvas)
      for (let i = 0; i < pins.length; i++)
        for (let j = i + 1; j < pins.length; j++) {
          const d = Math.hypot(pins[i].x! - pins[j].x!, pins[i].y! - pins[j].y!);
          expect(d, `${key}: ${pins[i].id} / ${pins[j].id}`).toBeGreaterThanOrEqual(3);
        }
  });

  it('every zone photo exists under public/ and is attributed', () => {
    for (const z of ZONE_MAPS) {
      const images = z.floors ? z.floors.map((f) => f.image) : z.image ? [z.image] : [];
      for (const img of images) {
        expect(existsSync(join(ROOT, 'public', img.src)), img.src).toBe(true);
        expect(img.attribution, img.src).toBeTruthy();
        expect(img.sourceUrl, img.src).toMatch(/^https:\/\//);
      }
    }
  });
});
