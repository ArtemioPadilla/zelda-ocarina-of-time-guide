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
