/**
 * Every runtime-cached image (runtime-cache.ts), per game, with its size on
 * disk: what the offline panel offers to download ahead of time. Built at
 * build time from the image manifest (src/data/game-images.json) and the
 * files themselves (public/img/games/), plus the Skulltula map photos
 * (public/images/skulltulas/).
 *
 * Node-only (reads public/): used by /offline-images.json and by the pages
 * that show the counts.
 */
import { existsSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { GAME_ID, GAME_IDS, type GameId } from '@/lib/games';
import { gameImageKeys, gameImagePath } from '@/lib/game-images';

const PUBLIC = join(process.cwd(), 'public');

export interface OfflineGameImages {
  /** Public paths without the deploy base (`/img/games/oot/…`). */
  paths: string[];
  bytes: number;
}

/** Public paths of every .webp under a public/ folder, sorted. */
function filesUnder(dir: string): string[] {
  const abs = join(PUBLIC, dir);
  if (!existsSync(abs)) return [];
  return readdirSync(abs, { withFileTypes: true })
    .flatMap((d) =>
      d.isDirectory()
        ? filesUnder(`${dir}/${d.name}`)
        : d.name.endsWith('.webp')
          ? [`/${dir}/${d.name}`]
          : [],
    )
    .sort();
}

let cached: Record<GameId, OfflineGameImages> | undefined;

/** Per game: every image to fetch for offline use, and their total size. */
export function offlineImages(): Record<GameId, OfflineGameImages> {
  if (cached) return cached;
  const byGame = Object.fromEntries(
    GAME_IDS.map((g) => [g, { paths: [] as string[], bytes: 0 }]),
  ) as Record<GameId, OfflineGameImages>;
  const add = (game: GameId, path: string) => {
    let size = 0;
    try {
      size = statSync(join(PUBLIC, path)).size;
    } catch {
      return; // a manifest row without its file: the tests catch it
    }
    byGame[game].paths.push(path);
    byGame[game].bytes += size;
  };
  for (const key of gameImageKeys()) {
    const game = key.slice(0, key.indexOf('/')) as GameId;
    if (byGame[game]) add(game, gameImagePath(key));
  }
  // The Gold Skulltula map's zone photos (src/lib/skulltula-map-layout.ts).
  for (const path of filesUnder('images/skulltulas')) add(GAME_ID, path);
  cached = byGame;
  return byGame;
}
