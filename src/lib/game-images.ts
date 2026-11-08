import manifest from '@/data/game-images.json';
import { withBase } from '@/lib/href';

/**
 * The guide's images (Nintendo's imagery, used non-commercially in an
 * unofficial fan guide — see public/img/games/SOURCES.md).
 *
 * Files live in `public/img/games/<game>/<collection>/<id>.webp` and are NOT
 * precached by the PWA (hundreds of them would bloat the install): the
 * service worker caches each one the first time it is shown (runtime
 * CacheFirst, astro.config.mjs), and the "offline" panel can fetch them
 * all ahead of time (/offline-images.json).
 *
 * `src/data/game-images.json` is the generated manifest — one entry per
 * file, `"<game>/<collection>/<id>": { w, h, source }` — so a page knows a
 * picture exists (and its size, for a layout that does not jump) without
 * reading the disk. An entry without a file renders text-only; removing a
 * file and its manifest row is all a takedown takes.
 *
 * Collections: entity thumbnails keyed by the entry's slug (collectibles by
 * their type slug, game-collectible-types.ts), chapter screenshots
 * (`<chapter>-<n>`), in-game maps (maps.json ids) and the game's cover
 * (`cover/cover`).
 */
/** Plain data shape safe to pass into a React island as a prop. */
export interface EntityImage {
  src: string;
  width: number;
  height: number;
}

export const GAME_IMAGE_COLLECTIONS = [
  'weapons',
  'gear',
  'bosses',
  'enemies',
  'items',
  'characters',
  'collectibles',
  'chapters',
  'maps',
  'cover',
] as const;
export type GameImageCollection = (typeof GAME_IMAGE_COLLECTIONS)[number];

export interface GameImageEntry {
  w: number;
  h: number;
  /** Where the file came from (wiki file page). */
  source: string;
}

const MANIFEST = manifest as Record<string, GameImageEntry>;

/** Public path of a manifest key, without the deploy base. */
export function gameImagePath(key: string): string {
  return `/img/games/${key}.webp`;
}

export function gameImage(
  game: string,
  collection: GameImageCollection,
  id: string,
): (EntityImage & { source: string }) | undefined {
  const key = `${game}/${collection}/${id}`;
  const e = MANIFEST[key];
  if (!e) return undefined;
  return { src: withBase(gameImagePath(key)), width: e.w, height: e.h, source: e.source };
}

/** The game's cover (box art / key art), when it has one. */
export function gameCover(game: string) {
  return gameImage(game, 'cover', 'cover');
}

/** A chapter's screenshots by photo id (`ch01-1` → image), for its gallery. */
export function gameChapterImages(game: string, chapter: string): Map<string, EntityImage> {
  const prefix = `${game}/chapters/${chapter}-`;
  const out = new Map<string, EntityImage>();
  for (const key of Object.keys(MANIFEST)) {
    if (!key.startsWith(prefix)) continue;
    const id = key.slice(`${game}/chapters/`.length);
    out.set(id, gameImage(game, 'chapters', id)!);
  }
  return out;
}

/** Every manifest key (`oot/weapons/lexington`), sorted — for the tests and /offline-images.json. */
export function gameImageKeys(): string[] {
  return Object.keys(MANIFEST).sort();
}
