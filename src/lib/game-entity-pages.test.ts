import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { gameEntityPath, gameListPath } from './game-entity-pages';
import { PUBLISHED_ENGINE_GAME_IDS } from './games';

const GAMES_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'content', 'games');
const ids = (game: string, locale: string, file: string): string[] => {
  const p = join(GAMES_DIR, game, locale, file);
  return existsSync(p)
    ? (JSON.parse(readFileSync(p, 'utf8')) as { id: string }[]).map((r) => r.id)
    : [];
};

describe('gameEntityPath', () => {
  it('gives every entity with a page its own URL', () => {
    expect(gameEntityPath('weapons', 'lexington')).toBe('/arsenal/lexington/');
    expect(gameEntityPath('gear', 'sandevistan')).toBe('/arsenal/gear/sandevistan/');
    expect(gameEntityPath('bosses', 'adam-smasher')).toBe('/bosses/adam-smasher/');
    expect(gameEntityPath('collectibles', 'tarot-graffiti')).toBe('/collectibles/tarot-graffiti/');
  });
  it('keeps the other checklist rows as anchors on their list', () => {
    expect(gameEntityPath('files', 'rescue-shard')).toBe('/files/#rescue-shard');
    expect(gameEntityPath('achievements', 'welcome')).toBe('/achievements/#welcome');
    expect(gameListPath('gear')).toBe('/arsenal/');
  });
});

// Gear pages live at /arsenal/gear/<id>/, next to the weapons'
// /arsenal/<id>/: a weapon called "gear" would take the whole folder.
describe.each(PUBLISHED_ENGINE_GAME_IDS)('%s arsenal URLs', (game) => {
  for (const locale of ['es', 'en'])
    it(`${locale}: no weapon slug is "gear"`, () => {
      expect(ids(game, locale, 'weapons.json')).not.toContain('gear');
    });
});
