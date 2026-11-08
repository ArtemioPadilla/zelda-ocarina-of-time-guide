/**
 * The game this guide covers. The site is a single-game guide served at the
 * root (`/`, `/chapters/<id>/`, `/en/…`), but the shared engine keeps its
 * multi-game shape (content rows carry a `game`, components take a `game`
 * prop), so this registry stays a list of one.
 *
 * Pure module (no Astro imports): the remark plugin (Node) reads it too.
 */
export type GameId = 'oot';

/** The one game of this site. Every route renders it. */
export const GAME_ID: GameId = 'oot';

export interface Game {
  id: GameId;
  /** Short label for compact spots ("OoT"). */
  short: string;
  /** Accent colour for the game's cards (CSS colour). */
  accent: string;
  title: { es: string; en: string };
  tagline: { es: string; en: string };
  /** Edition / version the guide covers. */
  covers: { es: string; en: string };
  /**
   * `draft` content is never loaded (no pages, no search, no tests); flip
   * to `published` in the PR that ships it.
   */
  status: 'published' | 'draft';
}

export const GAMES: readonly Game[] = [
  {
    id: 'oot',
    short: 'OoT',
    accent: '#d9a62e',
    title: {
      es: 'The Legend of Zelda: Ocarina of Time',
      en: 'The Legend of Zelda: Ocarina of Time',
    },
    tagline: {
      es: 'Link, el Hada Navi y los siete Sabios contra Ganondorf, de niño y de adulto.',
      en: 'Link, the fairy Navi and the seven Sages against Ganondorf, as a child and as an adult.',
    },
    covers: {
      es: 'Nintendo Switch 2 (remake, 2026)',
      en: 'Nintendo Switch 2 (2026 remake)',
    },
    status: 'published',
  },
];

export const GAME_IDS = GAMES.map((g) => g.id) as GameId[];

/** Games that run on the shared engine (all of them). */
export const ENGINE_GAME_IDS = GAME_IDS;

// PUBLISH_GAMES=oot renders a draft in a local build (review, preview)
// without publishing it; CI never sets it.
const previewed = ((typeof process !== 'undefined' && process.env?.PUBLISH_GAMES) || '').split(',');

/** Games whose content is loaded and rendered (see `status`). */
export const PUBLISHED_ENGINE_GAME_IDS = ENGINE_GAME_IDS.filter(
  (id) => GAMES.find((g) => g.id === id)!.status === 'published' || previewed.includes(id),
);

/** Compact label ("OoT"). */
export function gameShortLabel(g: Game): string {
  return g.short;
}

export function getGame(id: string): Game | undefined {
  return GAMES.find((g) => g.id === id);
}

export function isGameId(id: string): id is GameId {
  return (GAME_IDS as string[]).includes(id);
}

/**
 * The game a route belongs to. Single-game site: always `oot` (kept as a
 * function so the layout and islands read the same way they did on the
 * multi-game engine).
 */
export function gameOfRoute(_routePath: string): GameId {
  return GAME_ID;
}
