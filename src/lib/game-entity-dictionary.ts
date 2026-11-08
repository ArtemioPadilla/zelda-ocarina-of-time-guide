/** Per-game auto-link dictionary for Astro components (see game-entity-links.ts). */
import { contentDir } from './content-dir';
import { buildGameDictionary } from './game-entity-links';
import type { Dictionary, Locale } from './entity-links';

const cache = new Map<string, Dictionary>();

export function gameEntityDictionary(game: string, locale: Locale): Dictionary {
  const k = `${game}|${locale}`;
  let d = cache.get(k);
  if (!d) {
    d = buildGameDictionary(game, locale, {
      base: import.meta.env.BASE_URL,
      contentDir: contentDir(),
    });
    cache.set(k, d);
  }
  return d;
}
