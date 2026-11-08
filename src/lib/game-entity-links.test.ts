import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { buildGameDictionary } from './game-entity-links';
import { linkify } from './entity-links';
import { contentDir as resolveContentDir } from './content-dir';

// A small fixture content tree, so the rules are pinned independently of
// how much of the real guide has been written yet.
let contentDir = '';
const GAME = 'oot';
const rows = {
  'weapons.json': [{ id: 'kokiri-sword', name: 'Kokiri Sword' }],
  'gear.json': [{ id: 'hover-boots', name: 'Hover Boots' }],
  'characters.json': [
    { id: 'link', name: 'Link' },
    { id: 'princess-zelda', name: 'Princess Zelda' },
  ],
  'collectibles.json': [
    { id: 'sk-001', type: 'skulltula', name: 'Gold Skulltula #1 (Kokiri Forest)' },
    { id: 'sk-002', type: 'skulltula', name: 'Gold Skulltula #2 (Lost Woods)' },
    { id: 'bean-01', type: 'bean', name: 'Bean #1' },
    { id: 'bean-02', type: 'bean', name: 'Bean #2' },
  ],
};

beforeAll(() => {
  contentDir = mkdtempSync(join(tmpdir(), 'oot-links-'));
  for (const locale of ['es', 'en']) {
    const dir = join(contentDir, 'games', GAME, locale);
    mkdirSync(dir, { recursive: true });
    for (const [file, data] of Object.entries(rows))
      writeFileSync(join(dir, file), JSON.stringify(data));
  }
  writeFileSync(
    join(contentDir, 'games', GAME, 'aliases.json'),
    JSON.stringify({
      aliases: [
        { key: 'characters/princess-zelda', names: ['Zelda'] },
        { key: 'page:/collectibles/#sk-002', names: ['the Lost Woods Skulltula'] },
      ],
      skip: ['characters/link'],
    }),
  );
});
afterAll(() => rmSync(contentDir, { recursive: true, force: true }));

const dict = (locale: 'es' | 'en') => buildGameDictionary(GAME, locale, { base: '/', contentDir });
const hrefs = (locale: 'es' | 'en', text: string) =>
  linkify(text, dict(locale))
    .filter((s) => s.href)
    .map((s) => [s.text, s.href]);

describe('auto-links', () => {
  it('the pages read the real content folder', () => {
    // A wrong folder yields an empty dictionary silently (no links at all).
    expect(existsSync(join(resolveContentDir(), 'games', GAME))).toBe(true);
  });

  it('links weapons, gear and characters to their own root-level pages', () => {
    expect(hrefs('en', 'Zelda hands Link a Kokiri Sword and you put on the Hover Boots.')).toEqual([
      ['Zelda', '/en/characters/princess-zelda/'],
      ['Kokiri Sword', '/en/arsenal/kokiri-sword/'],
      ['Hover Boots', '/en/arsenal/gear/hover-boots/'],
    ]);
    expect(hrefs('es', 'Una Kokiri Sword.')).toEqual([['Kokiri Sword', '/arsenal/kokiri-sword/']]);
  });

  it('sends a collectible type to its page and a numbered piece to its checkbox', () => {
    const links = hrefs('en', 'Grab Gold Skulltula #1, then look for every Gold Skulltula.');
    expect(links[0]).toEqual(['Gold Skulltula #1', '/en/collectibles/gold-skulltula/#sk-001']);
    expect(links[1]).toEqual(['Gold Skulltula', '/en/collectibles/gold-skulltula/']);
  });

  it('sends aliases written against the list page to the type page', () => {
    const [link] = hrefs('es', 'Busca the Lost Woods Skulltula.');
    expect(link?.[1]).toBe('/collectibles/gold-skulltula/#sk-002');
  });

  it('leaves a plain word made by dropping a number alone, and skips listed names', () => {
    const links = hrefs('en', 'Link buys a Bean from the Bean Seller, then plants Bean #2.');
    expect(links).toEqual([['Bean #2', '/en/collectibles/bean/#bean-02']]);
  });

  it('prefixes the deploy base', () => {
    const d = buildGameDictionary(GAME, 'en', {
      base: '/zelda-ocarina-of-time-guide/',
      contentDir,
    });
    expect(d.entries.find((e) => e.key === 'weapons/kokiri-sword')?.href).toBe(
      '/zelda-ocarina-of-time-guide/en/arsenal/kokiri-sword/',
    );
  });
});
