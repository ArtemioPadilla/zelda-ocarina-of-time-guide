/**
 * Auto-link primitives: the dictionary shape, the whole-word matcher and
 * `linkify`, which splits running text into plain and linked segments —
 * every mention links (the guide is read with the game running,
 * mid-paragraph, so any mention must be tappable), longest name first,
 * whole words only. The game's dictionary itself is built by
 * game-entity-links.ts.
 *
 * Pure module (no Astro imports): the remark plugin (Node) uses it too.
 */
export type Locale = 'es' | 'en';

export interface DictionaryEntry {
  /** `kind/slug` (or `page:/path/`), for "never link this here". */
  key: string;
  href: string;
  pattern: RegExp;
  /** Alias length, to prefer the longest match at the same position. */
  length: number;
}

export interface Dictionary {
  entries: DictionaryEntry[];
  /** Phrases that must never be linked even though they contain a name. */
  protect: RegExp[];
}

export interface Segment {
  text: string;
  href?: string;
  key?: string;
}

/** `/chapters/…`, `/en/chapters/…`, `/base/en/…` — same shape as `gameHref`
 * (single-game site: no game segment). */
export function pageHref(locale: Locale, base: string, path: string, hash?: string): string {
  const b = base.replace(/\/$/, '');
  const l = locale === 'en' ? '/en' : '';
  return `${b}${l}${path}${hash ? `#${hash}` : ''}`;
}

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Word boundaries that understand accents and digits ("Red9", "Méndez").
const before = '(?<![\\p{L}\\p{N}])';
const after = '(?![\\p{L}\\p{N}])';

export function pattern(name: string, plural?: 'es' | 's' | 'both'): RegExp {
  const suffix =
    plural === 'es' ? '(?:es)?' : plural === 's' ? 's?' : plural === 'both' ? '(?:es|s)?' : '';
  return new RegExp(`${before}${escape(name)}${suffix}${after}`, 'u');
}

/** Drops the qualifier the content files use to tell instances apart. */
export function baseName(name: string): string {
  return name
    .replace(/\s*\([^)]*\)/g, '')
    .replace(/\s*×\d+$/, '')
    .replace(/\s*«[^»]*»/g, '')
    .replace(/\s*"[^"]*"/g, '')
    .trim();
}

/**
 * Splits `text` into plain and linked segments. Every mention links; `skip`
 * holds the keys never to link here (the entity whose own card is being
 * rendered).
 */
export function linkify(text: string, dict: Dictionary, skip: Set<string> = new Set()): Segment[] {
  const out: Segment[] = [];
  let rest = text;
  let plain = '';
  while (rest.length > 0) {
    let best: { index: number; length: number; entry?: DictionaryEntry } | undefined;
    for (const p of dict.protect) {
      const m = p.exec(rest);
      if (m && (!best || m.index < best.index)) best = { index: m.index, length: m[0].length };
    }
    for (const e of dict.entries) {
      if (skip.has(e.key)) continue;
      const m = e.pattern.exec(rest);
      if (!m) continue;
      if (!best || m.index < best.index || (m.index === best.index && m[0].length > best.length)) {
        best = { index: m.index, length: m[0].length, entry: e };
      }
    }
    if (!best) {
      plain += rest;
      break;
    }
    plain += rest.slice(0, best.index);
    const matched = rest.slice(best.index, best.index + best.length);
    if (best.entry) {
      if (plain) out.push({ text: plain });
      plain = '';
      out.push({ text: matched, href: best.entry.href, key: best.entry.key });
    } else {
      plain += matched;
    }
    rest = rest.slice(best.index + best.length);
  }
  if (plain) out.push({ text: plain });
  return out;
}
