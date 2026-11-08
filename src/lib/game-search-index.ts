import { gameHref, useTranslations } from '@/i18n/utils';
import {
  gameChapters,
  gameEntries,
  chapterSlug,
  gameCollectibleTypes,
  gameSections,
} from '@/lib/game-content';
import { collectibleTypeOf, localizedTypeName } from '@/lib/game-collectible-types';
import { gameEntityPath } from '@/lib/game-entity-pages';
import { ENGINE_SECTIONS, GUIDE_CARD_SECTIONS } from '@/lib/nav';
import type { GameId } from '@/lib/games';
import type { Locale } from '@/i18n/ui';

/**
 * The header search's index: one row per thing a player might type (a
 * job, a weapon, a boss, a shard, a collectible…), built at build time and
 * served as /search-index.json per locale. Every row points at the page (or
 * `#id` anchor) that renders it.
 */
export interface SearchEntry {
  /** Display title. */
  t: string;
  /** Kind label + chapter, shown under the title. */
  s: string;
  /** Kind slug (used to group and colour). */
  k: SearchKind;
  /** Absolute href (base included). */
  h: string;
  /** Extra searchable text (English original, location) not shown. */
  x?: string;
}

export type SearchKind =
  | 'page'
  | 'chapter'
  | 'weapon'
  | 'gear'
  | 'boss'
  | 'enemy'
  | 'keyItem'
  | 'healing'
  | 'file'
  | 'achievement'
  | 'character'
  | 'collectible'
  | 'card';

/** The game's search index. */
export async function buildGameSearchIndex(game: GameId, locale: Locale): Promise<SearchEntry[]> {
  const t = useTranslations(locale);
  const href = (path: string) => gameHref(locale, game, path);
  const kind = (k: SearchKind) => t(`search.kind.${k}` as Parameters<typeof t>[0]);
  const [
    has,
    chapters,
    collectibles,
    weapons,
    gear,
    bosses,
    enemies,
    items,
    files,
    achievements,
    characters,
    cards,
    types,
    meta,
  ] = await Promise.all([
    gameSections(game),
    gameChapters(game, locale),
    gameEntries('collectibles', game, locale),
    gameEntries('weapons', game, locale),
    gameEntries('gear', game, locale),
    gameEntries('bosses', game, locale),
    gameEntries('enemies', game, locale),
    gameEntries('items', game, locale),
    gameEntries('files', game, locale),
    gameEntries('achievements', game, locale),
    gameEntries('characters', game, locale),
    gameEntries('cards', game, locale),
    gameCollectibleTypes(game),
    gameEntries('meta', game, locale),
  ]);
  const typeOf = collectibleTypeOf(types);
  const plainRows = collectibles.map((c) => ({
    id: c.data.slug,
    type: c.data.type,
    name: c.data.name,
  }));
  const metaLabel = new Map(meta.map((m) => [m.data.slug, m.data.label]));
  const chapterName = new Map(chapters.map((c) => [chapterSlug(c), c.data.number]));
  const sub = (k: SearchKind, chapter?: string) =>
    chapter ? `${kind(k)} · ${chapterName.get(chapter) ?? chapter}` : kind(k);
  const guideSections = new Set<string>(GUIDE_CARD_SECTIONS);

  return [
    ...ENGINE_SECTIONS.filter((s) => s.needs === null || has.has(s.needs)).map((s) => ({
      t: t(s.key),
      s: kind('page'),
      k: 'page' as const,
      h: href(s.path),
    })),
    ...chapters.map((c) => ({
      t: `${c.data.number} · ${c.data.title}`,
      s: kind('chapter'),
      k: 'chapter' as const,
      h: href(`/chapters/${chapterSlug(c)}/`),
      x: c.data.summary,
    })),
    // One entry per collectible type (its page), then every pickup, landing
    // on its checkbox on that page.
    ...types.map((ty) => ({
      t: localizedTypeName(ty, plainRows),
      s: `${kind('collectible')} · ${metaLabel.get(ty.meta) ?? ty.meta}`,
      k: 'collectible' as const,
      h: href(gameEntityPath('collectibles', ty.slug)),
      x: ty.name,
    })),
    ...collectibles.map((c) => ({
      t: c.data.name,
      s: sub('collectible', c.data.chapter),
      k: 'collectible' as const,
      h: `${href(gameEntityPath('collectibles', typeOf.get(c.data.slug)!))}#${c.data.slug}`,
      x: `${c.data.area} ${c.data.location}`,
    })),
    ...weapons.map((w) => ({
      t: w.data.name,
      s: kind('weapon'),
      k: 'weapon' as const,
      h: href(gameEntityPath('weapons', w.data.slug)),
      x: w.data.obtain,
    })),
    ...gear.map((g) => ({
      t: g.data.name,
      s: sub('gear', g.data.chapter),
      k: 'gear' as const,
      h: href(gameEntityPath('gear', g.data.slug)),
      x: g.data.where,
    })),
    ...bosses.map((b) => ({
      t: b.data.name,
      s: kind('boss'),
      k: 'boss' as const,
      h: href(gameEntityPath('bosses', b.data.slug)),
      x: b.data.chapters,
    })),
    ...enemies.map((e) => ({
      t: e.data.name,
      s: kind('enemy'),
      k: 'enemy' as const,
      h: href(gameEntityPath('enemies', e.data.slug)),
    })),
    ...items.map((i) => ({
      t: i.data.name,
      s: sub(i.data.type === 'key' ? 'keyItem' : 'healing', i.data.chapter),
      k: (i.data.type === 'key' ? 'keyItem' : 'healing') as SearchKind,
      h: href(gameEntityPath('items', i.data.slug)),
      x: i.data.where,
    })),
    ...files.map((f) => ({
      t: f.data.name,
      s: sub('file', f.data.chapter),
      k: 'file' as const,
      h: href(gameEntityPath('files', f.data.slug)),
      x: [f.data.original, f.data.where].filter(Boolean).join(' '),
    })),
    ...achievements.map((a) => ({
      t: a.data.name,
      s: kind('achievement'),
      k: 'achievement' as const,
      h: href(gameEntityPath('achievements', a.data.slug)),
      x: a.data.how,
    })),
    ...characters.map((c) => ({
      t: c.data.name,
      s: kind('character'),
      k: 'character' as const,
      h: href(gameEntityPath('characters', c.data.slug)),
    })),
    ...cards.map((c) => ({
      t: c.data.title,
      s: kind('card'),
      k: 'card' as const,
      h: href(
        `${c.data.section === 'rules' || c.data.section === 'lore' ? '/' : guideSections.has(c.data.section) ? '/guide/' : '/extras/'}#${c.data.slug}`,
      ),
    })),
  ];
}
