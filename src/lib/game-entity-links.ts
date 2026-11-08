/**
 * Auto-links: every mention of a weapon, piece of gear, boss, enemy, item,
 * character or collectible becomes a link to its page (primitives in
 * entity-links.ts), one dictionary per game.
 * Names come from both locales' content files; `aliases.json` next to the
 * game's locale folders adds the short forms the prose uses and can point a
 * name at a page:
 *
 *   { "aliases": [{ "key": "characters/princess-zelda", "names": ["Zelda"] },
 *                 { "key": "page:/collectibles/", "names": ["Skulltulas"] }],
 *     "skip": ["characters/link"],
 *     "protect": ["The Legend of Zelda"] }
 *
 * A collectible links to its type page (game-collectible-types.ts): the
 * type's name ("Mr. Everywhere") to the page, a numbered piece
 * ("Mr. Everywhere #12") to its checkbox there. Aliases written against
 * the list page's anchors (`page:/collectibles/#<piece>`,
 * `page:/collectibles/#type-<meta>`) are sent to the type page too.
 *
 * Pure module (no Astro imports): the remark plugin and the pages use it.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  pageHref,
  pattern,
  baseName,
  type Dictionary,
  type DictionaryEntry,
  type Locale,
} from './entity-links';
import { gameEntityPath, type GameEntityKind } from './game-entity-pages';
import {
  groupCollectibles,
  collectibleTypeOf,
  localizedTypeName,
  type CollectibleRow,
} from './game-collectible-types';

type Row = { id: string; name?: string; original?: string };

interface AliasFile {
  aliases?: { key: string; names: string[]; plural?: 'es' | 's' | 'both' }[];
  skip?: string[];
  protect?: string[];
}

// Claim order: a name two kinds share goes to the first (a boss who is also
// a character links to the boss card; an item called like a collectible
// keeps its item page).
const KINDS: GameEntityKind[] = ['weapons', 'gear', 'bosses', 'enemies', 'items', 'characters'];

function readJson<T>(path: string, fallback: T): T {
  try {
    return JSON.parse(readFileSync(path, 'utf8')) as T;
  } catch {
    return fallback;
  }
}

export function buildGameDictionary(
  game: string,
  locale: Locale,
  opts: { base: string; contentDir: string },
): Dictionary {
  const dir = join(opts.contentDir, 'games', game);
  const extra = readJson<AliasFile>(join(dir, 'aliases.json'), {});
  const skip = new Set(extra.skip ?? []);

  // Collectible types, grouped from the English rows (stable slugs).
  const collectibles = {
    es: readJson<CollectibleRow[]>(join(dir, 'es', 'collectibles.json'), []),
    en: readJson<CollectibleRow[]>(join(dir, 'en', 'collectibles.json'), []),
  };
  const types = groupCollectibles(collectibles.en);
  const typeOf = collectibleTypeOf(types);
  const metaGroups = new Map<string, string[]>();
  for (const ty of types) metaGroups.set(ty.meta, [...(metaGroups.get(ty.meta) ?? []), ty.slug]);

  const href = (path: string) => {
    const [p, hash] = path.split('#');
    return pageHref(locale, opts.base, p, hash);
  };
  const hrefOf = (key: string, hash?: string): string | undefined => {
    if (key.startsWith('page:')) {
      const [path, anchor] = key.slice(5).split('#');
      // The list page's anchors now have a page of their own.
      if (path === '/collectibles/' && anchor) {
        const piece = typeOf.get(anchor);
        if (piece) return href(`${gameEntityPath('collectibles', piece)}#${anchor}`);
        const only = metaGroups.get(anchor.replace(/^type-/, ''));
        if (anchor.startsWith('type-') && only?.length === 1)
          return href(gameEntityPath('collectibles', only[0]));
      }
      return pageHref(locale, opts.base, path, anchor);
    }
    const [kind, slug] = key.split('/');
    if (kind === 'collectibles') {
      if (!types.some((ty) => ty.slug === slug)) return undefined;
      return href(`${gameEntityPath('collectibles', slug)}${hash ? `#${hash}` : ''}`);
    }
    if (!KINDS.includes(kind as GameEntityKind)) return undefined;
    return href(gameEntityPath(kind as GameEntityKind, slug));
  };

  const names = new Map<string, { key: string; plural?: 'es' | 's' | 'both'; hash?: string }>();
  const claim = (name: string, key: string, hash?: string) => {
    const n = name.trim();
    if (n.length < 3 || names.has(n)) return;
    names.set(n, { key, hash });
  };
  for (const kind of KINDS) {
    for (const loc of ['es', 'en'] as const) {
      for (const row of readJson<Row[]>(join(dir, loc, `${kind}.json`), [])) {
        const key = `${kind}/${row.id}`;
        if (!row.name || skip.has(key)) continue;
        claim(row.name, key);
        claim(baseName(row.name), key);
        if (row.original) {
          claim(row.original, key);
          claim(baseName(row.original), key);
        }
      }
    }
  }
  // Collectibles last: each piece's own name first (its checkbox; "Safe #1
  // (Bar & Lounge)" also as "Safe #1"), then the type's name in both
  // locales (the page). Not `baseName`: "Ruby (Pear)" → "Ruby" would send
  // every ruby to one cut. A type name made by dropping the number that is
  // a single word ("Well", "Safe", "Window") is too plain to link on sight
  // ("Old Well", "Well Wheel"); its numbered pieces still link.
  for (const loc of ['es', 'en'] as const) {
    for (const row of collectibles[loc]) {
      const slug = typeOf.get(row.id);
      if (!slug || !row.name || skip.has(`collectibles/${slug}`)) continue;
      claim(row.name, `collectibles/${slug}`, row.id);
      claim(row.name.replace(/(#\d+)\s+\(.*\)$/, '$1'), `collectibles/${slug}`, row.id);
    }
  }
  for (const ty of types) {
    const key = `collectibles/${ty.slug}`;
    if (skip.has(key)) continue;
    for (const loc of ['es', 'en'] as const) {
      const rows = collectibles[loc].filter((r) => ty.ids.includes(r.id));
      const name = localizedTypeName(ty, rows);
      const made = !rows.some((r) => r.name === name);
      if (made && !/\s/.test(name)) continue;
      claim(name, key);
    }
  }
  for (const a of extra.aliases ?? [])
    for (const n of a.names) names.set(n, { key: a.key, plural: a.plural });

  const entries: DictionaryEntry[] = [];
  for (const [name, { key, plural, hash }] of names) {
    const h = hrefOf(key, hash);
    if (!h) continue;
    entries.push({ key, href: h, pattern: pattern(name, plural), length: name.length });
  }
  entries.sort((a, b) => b.length - a.length);
  return { entries, protect: (extra.protect ?? []).map((p) => pattern(p)) };
}
