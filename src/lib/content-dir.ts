import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Absolute path of `src/content/`, for the auto-link dictionaries built
 * inside Astro components. `new URL('../content/', import.meta.url)` only
 * points there in dev: in `astro build` this module is bundled into a
 * prerender chunk elsewhere, the path misses, and every dictionary built
 * from the content files came out empty (only hand aliases linked). The
 * build runs from the project root, so fall back to that.
 */
export function contentDir(): string {
  const fromHere = fileURLToPath(new URL('../content/', import.meta.url));
  return existsSync(join(fromHere, 'games')) ? fromHere : join(process.cwd(), 'src', 'content');
}
