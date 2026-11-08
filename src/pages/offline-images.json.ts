import type { APIRoute } from 'astro';
import { withBase } from '@/lib/href';
import { offlineImages } from '@/lib/offline-images';
import { RUNTIME_IMAGE_CACHE } from '@/lib/runtime-cache';

/**
 * /offline-images.json — every image the service worker caches on first
 * view (not precached), per game, with the deploy base already applied:
 *
 *   { "cache": "oot-images",
 *     "games": { "oot": { "urls": ["/…/img/games/oot/…webp", …], "bytes": 4891234 } } }
 *
 * The offline panel (OfflineImages island) reads it to download a game's
 * pictures into that cache ahead of a trip without internet. It is itself
 * precached (a .json in the build), so the panel can still count and
 * delete while offline.
 */
export const GET: APIRoute = () => {
  const games = Object.fromEntries(
    Object.entries(offlineImages()).map(([game, g]) => [
      game,
      { urls: g.paths.map(withBase), bytes: g.bytes },
    ]),
  );
  return new Response(JSON.stringify({ cache: RUNTIME_IMAGE_CACHE, games }), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
};
