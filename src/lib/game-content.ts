import { getCollection, type CollectionEntry } from 'astro:content';
import { existsSync } from 'node:fs';
import type { Locale } from '@/i18n/ui';
import { ENGINE_GAME_IDS, GAME_ID, PUBLISHED_ENGINE_GAME_IDS, type GameId } from '@/lib/games';
import { GUIDE_CARD_SECTIONS, EXTRAS_CARD_SECTIONS } from '@/lib/nav';
import { groupCollectibles, type CollectibleType } from '@/lib/game-collectible-types';

/** The per-kind collections of the shared engine (see content.config.ts). */
export type EngineCollection =
  | 'meta'
  | 'collectibles'
  | 'weapons'
  | 'gear'
  | 'bosses'
  | 'enemies'
  | 'items'
  | 'files'
  | 'achievements'
  | 'characters'
  | 'cards'
  | 'shop'
  | 'maps';

type Key<N extends EngineCollection> = `game-${N}_${Locale}`;
// Both locales share one schema; typing entries off the `es` collection
// avoids the es|en union, whose array fields TS can't `.map` without any.
export type EngineEntry<N extends EngineCollection> = CollectionEntry<`game-${N}_es`>;
export type EngineChapter = CollectionEntry<'game-chapters_es'>;

// Astro logs a warning on every getCollection() of an empty collection; a
// kind no published game has a file for yet (maps.json before the maps
// land) is read as empty without asking.
const hasFiles = new Map<EngineCollection, boolean>();
function anyGameHas(name: EngineCollection): boolean {
  let v = hasFiles.get(name);
  if (v === undefined) {
    v = PUBLISHED_ENGINE_GAME_IDS.some((g) => existsSync(`src/content/games/${g}/es/${name}.json`));
    hasFiles.set(name, v);
  }
  return v;
}

/** Every game's rows of one kind (empty when no game has that file). */
async function allRows<N extends EngineCollection>(
  name: N,
  locale: Locale,
): Promise<EngineEntry<N>[]> {
  if (!anyGameHas(name)) return [];
  return (await getCollection(`game-${name}_${locale}` as Key<N>)) as unknown as EngineEntry<N>[];
}

/** Rows of one kind for one game, in play order. */
export async function gameEntries<N extends EngineCollection>(
  name: N,
  game: GameId,
  locale: Locale,
): Promise<EngineEntry<N>[]> {
  const all = await allRows(name, locale);
  return all
    .filter((e) => (e.data as { game: string }).game === game)
    .sort((a, b) => (a.data as { order: number }).order - (b.data as { order: number }).order);
}

/** Chapter slug ("the-rescue") from its entry id ("oot/the-rescue"). */
export function chapterSlug(entry: { id: string }): string {
  return entry.id.slice(entry.id.indexOf('/') + 1);
}

export async function gameChapters(game: GameId, locale: Locale): Promise<EngineChapter[]> {
  const all = (await getCollection(`game-chapters_${locale}`)) as EngineChapter[];
  return all.filter((c) => c.id.startsWith(`${game}/`)).sort((a, b) => a.data.order - b.data.order);
}

/** Engine games with at least one chapter written (the rest show "soon"). */
export async function readyEngineGames(): Promise<GameId[]> {
  const all = (await getCollection('game-chapters_es')) as EngineChapter[];
  return ENGINE_GAME_IDS.filter((g) => all.some((c) => c.id.startsWith(`${g}/`)));
}

export type SectionNeed = EngineCollection | 'chapters' | 'guide' | 'extras';

const GUIDE = new Set<string>(GUIDE_CARD_SECTIONS);
const EXTRAS = new Set<string>(EXTRAS_CARD_SECTIONS);

/** Engine games that have content for a section (its `getStaticPaths`). */
export async function gamePaths(need: SectionNeed): Promise<GameId[]> {
  if (need === 'chapters') return readyEngineGames();
  if (need === 'guide' || need === 'extras') {
    const set = need === 'guide' ? GUIDE : EXTRAS;
    const cards = await allRows('cards', 'es');
    return ENGINE_GAME_IDS.filter((g) =>
      cards.some((c) => c.data.game === g && set.has(c.data.section)),
    );
  }
  const rows = await allRows(need, 'es');
  return ENGINE_GAME_IDS.filter((g) => rows.some((r) => r.data.game === g));
}

/** Which sections a game has, for its nav (same rule as `gamePaths`). */
export async function gameSections(game: GameId): Promise<Set<SectionNeed>> {
  const needs: SectionNeed[] = [
    'chapters',
    'collectibles',
    'weapons',
    'bosses',
    'enemies',
    'items',
    'files',
    'achievements',
    'characters',
    'maps',
    'guide',
    'extras',
  ];
  const has = await Promise.all(needs.map(async (n) => (await gamePaths(n)).includes(game)));
  return new Set(needs.filter((_, i) => has[i]));
}

/** `getStaticPaths` for an entity page: every slug of the site's game. */
export async function gameEntityStaticPaths(
  kind: 'weapons' | 'gear' | 'bosses' | 'enemies' | 'items' | 'characters',
) {
  const rows = await gameEntries(kind, GAME_ID, 'es');
  return rows.map((r) => ({ params: { id: r.data.slug } }));
}

/**
 * A game's collectible types (see game-collectible-types.ts), grouped from
 * the English rows so the slugs are the same in both locales.
 */
export async function gameCollectibleTypes(game: GameId): Promise<CollectibleType[]> {
  const rows = await gameEntries('collectibles', game, 'en');
  return groupCollectibles(
    rows.map((r) => ({
      id: r.data.slug,
      type: r.data.type,
      name: r.data.name,
      value: r.data.value,
    })),
  );
}

/** `getStaticPaths` for the collectible type pages: every type of the site's game. */
export async function collectibleTypeStaticPaths() {
  return (await gameCollectibleTypes(GAME_ID)).map((t) => ({ params: { type: t.slug } }));
}

/** A maps.json row's `chapters` ("ch01, ch02") as chapter ids. */
export function mapChapterIds(chapters: string): string[] {
  return chapters
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}
