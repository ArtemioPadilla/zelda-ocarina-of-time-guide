import type { APIRoute } from 'astro';
import { buildGameSearchIndex } from '@/lib/game-search-index';
import { GAME_ID } from '@/lib/games';

/** The header search's index (see src/lib/game-search-index.ts). */
export const GET: APIRoute = async () =>
  new Response(JSON.stringify(await buildGameSearchIndex(GAME_ID, 'es')), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
