import { gameHref, useTranslations } from '@/i18n/utils';
import { getGame, type GameId } from '@/lib/games';
import { gameChapters, chapterSlug } from '@/lib/game-content';
import type { Locale } from '@/i18n/ui';

/** Everything most engine pages start with. */
export async function gamePage(game: GameId, locale: Locale) {
  const g = getGame(game)!;
  const t = useTranslations(locale);
  const chapters = await gameChapters(game, locale);
  const chapterBySlug = new Map(chapters.map((c) => [chapterSlug(c), c]));
  return {
    g,
    t,
    chapters,
    /** Link inside this game. */
    h: (path: string) => gameHref(locale, game, path),
    /** `<title>`: "Jefes · Guía Zelda: Ocarina of Time". */
    title: (s: string) => `${s} · ${t('site.name')}`,
    /** "Ch. 3 · Main House" for a chapter slug, the slug itself if unknown. */
    chapterLabel: (slug: string) => {
      const c = chapterBySlug.get(slug);
      return c ? `${c.data.number} · ${c.data.title}` : slug;
    },
    chapterOrder: (slug: string) => chapterBySlug.get(slug)?.data.order ?? 999,
    chapterBySlug,
  };
}

/** Pill colours for the chapter pills. */
export const GAME_PILL_STYLE: Record<string, string> = {
  boss: 'text-destructive border-destructive/40',
  shop: 'text-pill-shop border-pill-shop/40',
  collectible: 'text-pill-med border-pill-med/40',
  save: 'text-muted-foreground border-border',
  info: 'text-muted-foreground border-border',
  missable: 'text-destructive border-destructive/40',
};

/**
 * Collectible rows in checklist groups: one group per chapter (play order)
 * for rows that name one, then one per `area` (first appearance) for rows
 * that can be picked up at any time. `byArea` groups every row by area
 * (a type with a map lists its pieces zone by zone, like the map).
 */
export function collectibleGroups<R extends { data: { chapter?: string; area: string } }>(
  rows: R[],
  chapterLabel: (slug: string) => string,
  chapterOrder: (slug: string) => number,
  byArea = false,
): { title: string; chapter?: string; rows: R[] }[] {
  const groups = new Map<string, { title: string; chapter?: string; rows: R[] }>();
  for (const r of rows) {
    const chapter = byArea ? undefined : r.data.chapter;
    const key = chapter ? `c:${chapter}` : `a:${r.data.area}`;
    let g = groups.get(key);
    if (!g) {
      g = { title: chapter ? chapterLabel(chapter) : r.data.area, chapter, rows: [] };
      groups.set(key, g);
    }
    g.rows.push(r);
  }
  const all = [...groups.values()];
  const inChapters = all
    .filter((g) => g.chapter)
    .sort((a, b) => chapterOrder(a.chapter!) - chapterOrder(b.chapter!));
  return [...inChapters, ...all.filter((g) => !g.chapter)];
}
