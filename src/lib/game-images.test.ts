import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, relative } from 'node:path';
import manifest from '@/data/game-images.json';
import {
  GAME_IMAGE_COLLECTIONS,
  gameChapterImages,
  gameImage,
  gameImageKeys,
  type GameImageEntry,
} from './game-images';
import { groupCollectibles, type CollectibleRow } from './game-collectible-types';
import { ENGINE_GAME_IDS } from './games';

/**
 * The guide's pictures (public/img/games/, see game-images.ts): the
 * manifest and the folder must agree file for file, and every picture must
 * belong to something that exists — an entity, a collectible type, a
 * captioned chapter photo, a map, the cover.
 */
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const IMG = join(ROOT, 'public', 'img', 'games');
const CONTENT = join(ROOT, 'src', 'content', 'games');

function filesUnder(dir: string): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).flatMap((n) => {
    const p = join(dir, n);
    return statSync(p).isDirectory() ? filesUnder(p) : [p];
  });
}

const rowIds = (game: string, locale: string, file: string): string[] => {
  const p = join(CONTENT, game, locale, file);
  return existsSync(p)
    ? (JSON.parse(readFileSync(p, 'utf8')) as { id: string }[]).map((r) => r.id)
    : [];
};

/** Photo ids a chapter's front matter captions (`photos: [{ id: … }]`). */
function chapterPhotoIds(game: string, locale: string, chapter: string): string[] {
  const p = join(CONTENT, game, locale, 'chapters', `${chapter}.md`);
  if (!existsSync(p)) return [];
  const fm = readFileSync(p, 'utf8').match(/^---\n([\s\S]*?)\n---/)?.[1] ?? '';
  return [...fm.matchAll(/^\s*-\s*\{?\s*id:\s*['"]?([^'",}\s]+)/gm)].map((m) => m[1]);
}

/** Why a manifest key names nothing real, or null when it does. */
function orphanReason(key: string): string | null {
  const [game, collection, id, ...rest] = key.split('/');
  if (!game || !collection || !id || rest.length) return 'not <game>/<collection>/<id>';
  if (!(ENGINE_GAME_IDS as string[]).includes(game)) return `unknown game ${game}`;
  if (!(GAME_IMAGE_COLLECTIONS as readonly string[]).includes(collection))
    return `unknown collection ${collection}`;
  const both = (file: string) =>
    rowIds(game, 'es', file).includes(id) && rowIds(game, 'en', file).includes(id);
  switch (collection) {
    case 'cover':
      return id === 'cover' ? null : 'the cover is cover/cover';
    case 'collectibles': {
      const rows = JSON.parse(
        existsSync(join(CONTENT, game, 'en', 'collectibles.json'))
          ? readFileSync(join(CONTENT, game, 'en', 'collectibles.json'), 'utf8')
          : '[]',
      ) as CollectibleRow[];
      return groupCollectibles(rows).some((t) => t.slug === id) ? null : 'no such type';
    }
    case 'chapters': {
      const chapter = id.match(/^(.+)-\d+$/)?.[1];
      if (!chapter) return 'chapter photos are <chapter>-<n>';
      for (const locale of ['es', 'en'])
        if (!chapterPhotoIds(game, locale, chapter).includes(id))
          return `not captioned in ${locale}/chapters/${chapter}.md`;
      return null;
    }
    default:
      return both(`${collection}.json`) ? null : `no ${collection}.json row in both locales`;
  }
}

const MANIFEST = manifest as Record<string, GameImageEntry>;

describe('game images', () => {
  it('every manifest key has its file, and every file its key', () => {
    const onDisk = filesUnder(IMG)
      .filter((f) => !f.endsWith('.md'))
      .map((f) => relative(IMG, f).split('\\').join('/'));
    for (const f of onDisk) expect(f, 'only .webp files').toMatch(/\.webp$/);
    expect(onDisk.map((f) => f.replace(/\.webp$/, '')).sort()).toEqual(gameImageKeys());
  });

  it('every key names something that exists', () => {
    for (const key of gameImageKeys()) expect(orphanReason(key), key).toBeNull();
  });

  it('every entry has its size and source', () => {
    for (const [key, e] of Object.entries(MANIFEST)) {
      expect(e.w, key).toBeGreaterThan(0);
      expect(e.h, key).toBeGreaterThan(0);
      expect(e.source, key).toMatch(/^https:\/\//);
    }
  });

  it('the checks catch a key that names nothing', () => {
    expect(orphanReason('oot/weapons/no-such-sword')).not.toBeNull();
    expect(orphanReason('oot/collectibles/no-such-type')).not.toBeNull();
    expect(orphanReason('oot/chapters/deku-tree-99')).not.toBeNull();
    expect(orphanReason('oot/cover/box')).not.toBeNull();
    expect(orphanReason('oot/lore/navi')).not.toBeNull();
    expect(orphanReason('re4/cover/cover')).not.toBeNull();
    expect(orphanReason('oot/cover/cover')).toBeNull();
    const weapon = rowIds('oot', 'es', 'weapons.json')[0];
    if (weapon) expect(orphanReason(`oot/weapons/${weapon}`)).toBeNull();
  });

  it('resolves nothing for a missing picture', () => {
    expect(gameImage('oot', 'weapons', 'no-such-sword')).toBeUndefined();
    expect(gameChapterImages('oot', 'no-such-chapter').size).toBe(0);
  });
});
