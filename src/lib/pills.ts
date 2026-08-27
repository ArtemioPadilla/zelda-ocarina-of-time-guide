import type { CollectionEntry } from 'astro:content';

// The pill `type` union content.config.ts already enforces — reused here so
// PILL_STYLE can't silently miss a case (a typo'd key used to fall through
// to `undefined` in the class list with no compile error).
export type PillType = CollectionEntry<'chapters_es'>['data']['pills'][number]['type'];

// Theme-aware pill colors (see the --pill-song/--pill-dungeon tokens and
// their contrast rationale in global.css). boss reuses --destructive
// (Ganon's-triforce red), info reuses --muted-foreground.
export const PILL_STYLE: Record<PillType, string> = {
  boss: 'text-destructive border-destructive/40',
  dungeon: 'text-pill-dungeon border-pill-dungeon/40',
  song: 'text-pill-song border-pill-song/40',
  info: 'text-muted-foreground border-border',
};
