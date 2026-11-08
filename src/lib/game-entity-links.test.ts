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
  'weapons.json': [{ id: 'lexington', name: 'Lexington' }],
  'gear.json': [{ id: 'sandevistan', name: 'Sandevistan' }],
  'characters.json': [
    { id: 'v', name: 'V' },
    { id: 'jackie-welles', name: 'Jackie Welles' },
  ],
  'collectibles.json': [
    { id: 'tarot-01', type: 'tarot', name: 'Tarot Graffiti #1 (Watson)' },
    { id: 'tarot-02', type: 'tarot', name: 'Tarot Graffiti #2 (Westbrook)' },
    { id: 'well-01', type: 'well', name: 'Well #1' },
    { id: 'well-02', type: 'well', name: 'Well #2' },
  ],
};

beforeAll(() => {
  contentDir = mkdtempSync(join(tmpdir(), 'cp-links-'));
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
        { key: 'characters/jackie-welles', names: ['Jackie'] },
        { key: 'page:/collectibles/#tarot-02', names: ['the Westbrook tarot'] },
      ],
      skip: ['characters/v'],
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
    expect(hrefs('en', 'Jackie hands V a Lexington and you install a Sandevistan.')).toEqual([
      ['Jackie', '/en/characters/jackie-welles/'],
      ['Lexington', '/en/arsenal/lexington/'],
      ['Sandevistan', '/en/arsenal/gear/sandevistan/'],
    ]);
    expect(hrefs('es', 'Una Lexington.')).toEqual([['Lexington', '/arsenal/lexington/']]);
  });

  it('sends a collectible type to its page and a numbered piece to its checkbox', () => {
    const links = hrefs('en', 'Grab Tarot Graffiti #1, then look for Tarot Graffiti.');
    expect(links[0]).toEqual(['Tarot Graffiti #1', '/en/collectibles/tarot-graffiti/#tarot-01']);
    expect(links[1]).toEqual(['Tarot Graffiti', '/en/collectibles/tarot-graffiti/']);
  });

  it('sends aliases written against the list page to the type page', () => {
    const [link] = hrefs('es', 'Busca the Westbrook tarot.');
    expect(link?.[1]).toBe('/collectibles/tarot-graffiti/#tarot-02');
  });

  it('leaves a plain word made by dropping a number alone, and skips listed names', () => {
    const links = hrefs('en', 'V takes the Well Road to the Old Well, then Well #2.');
    expect(links).toEqual([['Well #2', '/en/collectibles/well/#well-02']]);
  });

  it('prefixes the deploy base', () => {
    const d = buildGameDictionary(GAME, 'en', { base: '/cyberpunk-2077-guide/', contentDir });
    expect(d.entries.find((e) => e.key === 'weapons/lexington')?.href).toBe(
      '/cyberpunk-2077-guide/en/arsenal/lexington/',
    );
  });
});
