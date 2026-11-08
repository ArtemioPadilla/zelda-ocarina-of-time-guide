/**
 * Collectible *types* of an engine game: the pickups of one thing grouped
 * under one page (`/collectibles/<slug>/`). "Tarot Graffiti #12" belongs to
 * "Tarot Graffiti"; "Safe #3 (Basement)" to "Safe"; the ten
 * "Cyberpsycho Sighting #N (Dogtown)" to "Cyberpsycho Sighting (Dogtown)", because a
 * qualifier every piece of the group shares names the group, while one
 * that changes from piece to piece only says where that piece is.
 *
 * The grouping (and so the slug) is made from the ENGLISH rows: the names
 * are the official English ones, but a few are translated in the Spanish
 * file ("Grafiti #1" / "Graffiti #1"), and the URL must not depend on the locale.
 * Rows are matched across locales by id.
 *
 * Pure module (no Astro imports): the routes, the pages, the auto-link
 * dictionary (remark plugin, Node) and the tests all use it.
 */
export interface CollectibleRow {
  id: string;
  type: string;
  name: string;
  value?: number;
}

export interface CollectibleType {
  /** URL segment, unique inside the game. */
  slug: string;
  /** The meta collectible type (`meta.json` row id) the pieces belong to. */
  meta: string;
  /** English type name ("Tarot Graffiti"). */
  name: string;
  /** Row ids, in the rows' order. */
  ids: string[];
}

/** "Tarot Graffiti #12" → base "Tarot Graffiti"; "Safe #3 (Basement)" → base "Safe", qual "(Basement)". */
export function splitCollectibleName(name: string): { base: string; qual?: string } {
  const n = name.trim().replace(/\s*×\d+$/, '');
  const m = n.match(/^(.*?)\s+#\d+(?:\s+(\(.*\)))?$/);
  if (!m) return { base: n };
  return { base: m[1].trim(), qual: m[2] };
}

/** The name of a group of pieces (its base, plus the qualifier they all share). */
export function collectibleGroupName(names: string[]): string {
  const parts = names.map(splitCollectibleName);
  const base = parts[0]?.base ?? '';
  const q = parts[0]?.qual;
  const shared = parts.length > 1 && q !== undefined && parts.every((p) => p.qual === q);
  return shared ? `${base} ${q}` : base;
}

/** "Cyberpsycho Sighting (Dogtown)" → "cyberpsycho-sighting-dogtown". */
export function slugifyCollectible(name: string): string {
  return name
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/æ/g, 'ae')
    .replace(/['’.]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Groups one game's collectible rows (the English file) into types, in the
 * order their first piece appears. Two meta types that yield the same name
 * keep apart: the later one's slug gets its meta id appended.
 */
export function groupCollectibles(rows: CollectibleRow[]): CollectibleType[] {
  const groups = new Map<string, { meta: string; rows: CollectibleRow[] }>();
  for (const r of rows) {
    const key = `${r.type}\u0000${splitCollectibleName(r.name).base}`;
    let g = groups.get(key);
    if (!g) {
      g = { meta: r.type, rows: [] };
      groups.set(key, g);
    }
    g.rows.push(r);
  }
  const used = new Set<string>();
  const out: CollectibleType[] = [];
  for (const g of groups.values()) {
    const name = collectibleGroupName(g.rows.map((r) => r.name));
    let slug = slugifyCollectible(name) || g.meta;
    if (used.has(slug)) slug = `${slug}-${g.meta}`;
    for (let n = 2; used.has(slug); n++) slug = `${slugifyCollectible(name)}-${g.meta}-${n}`;
    used.add(slug);
    out.push({ slug, meta: g.meta, name, ids: g.rows.map((r) => r.id) });
  }
  return out;
}

/** Row id → its type's slug. */
export function collectibleTypeOf(types: CollectibleType[]): Map<string, string> {
  const m = new Map<string, string>();
  for (const t of types) for (const id of t.ids) m.set(id, t.slug);
  return m;
}

/** The type's name in a locale: the same grouping rule over that locale's rows. */
export function localizedTypeName(type: CollectibleType, rows: CollectibleRow[]): string {
  const byId = new Map(rows.map((r) => [r.id, r.name]));
  const names = type.ids.map((id) => byId.get(id)).filter((n): n is string => Boolean(n));
  return names.length ? collectibleGroupName(names) : type.name;
}

/** Lowest, highest and summed value of a type's pieces; undefined when none has one. */
export function valueSpan(
  values: (number | undefined)[],
): { min: number; max: number; sum: number } | undefined {
  const v = values.filter((x): x is number => typeof x === 'number');
  if (!v.length) return undefined;
  return { min: Math.min(...v), max: Math.max(...v), sum: v.reduce((a, b) => a + b, 0) };
}
