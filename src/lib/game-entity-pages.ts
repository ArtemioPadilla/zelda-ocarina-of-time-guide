/**
 * Where each engine-game entity lives, root-relative (the locale and base are added by `gameHref`).
 * Weapons, gear, bosses, enemies, items and characters get a page of their
 * own; collectibles get one page per *type* (`slug` is the type's slug, see
 * game-collectible-types.ts), and the other checklist rows (files,
 * achievements) are anchors on their list page. Pure module: the remark
 * plugin uses it too.
 */
export type GameEntityKind =
  | 'weapons'
  | 'gear'
  | 'bosses'
  | 'enemies'
  | 'items'
  | 'characters'
  | 'collectibles'
  | 'files'
  | 'achievements';

export const GAME_ENTITY_PAGES = [
  'weapons',
  'gear',
  'bosses',
  'enemies',
  'items',
  'characters',
] as const;
export type GameEntityPage = (typeof GAME_ENTITY_PAGES)[number];

const LIST: Record<GameEntityKind, string> = {
  weapons: '/arsenal/',
  gear: '/arsenal/',
  bosses: '/bosses/',
  enemies: '/enemies/',
  items: '/items/',
  characters: '/characters/',
  collectibles: '/collectibles/',
  files: '/files/',
  achievements: '/achievements/',
};

/** List page of a kind (`/arsenal/`). */
export function gameListPath(kind: GameEntityKind): string {
  return LIST[kind];
}

/**
 * Path (and hash) of one entity, relative to the game's root. Gear sits
 * under the Arsenal (`/arsenal/gear/<slug>/`, so no weapon may be called
 * "gear"); a collectible's `slug` is its type's.
 */
export function gameEntityPath(kind: GameEntityKind, slug: string): string {
  if (kind === 'gear') return `${LIST.gear}gear/${slug}/`;
  if (kind === 'collectibles') return `${LIST.collectibles}${slug}/`;
  if ((GAME_ENTITY_PAGES as readonly string[]).includes(kind)) return `${LIST[kind]}${slug}/`;
  return `${LIST[kind]}#${slug}`;
}
