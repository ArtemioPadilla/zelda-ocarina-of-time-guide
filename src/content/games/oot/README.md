# OoT content

The guide's content for the Nintendo Switch 2 remake (2026), in `es/` and
`en/` with the same ids, order and data fields:

- `chapters/*.md`: the walkthrough steps (parts `child`, `adult`, `end`) and
  the side quests (`side`). Optional `photos` front matter lists screenshots
  `<chapter>-<n>` from `public/img/games/oot/chapters/` (fetched with
  `npm run images:games` from `scripts/wiki-images/oot-chapters.json`).
- `meta.json`, `collectibles.json` (100 Gold Skulltulas, 36 Pieces of Heart,
  8 Heart Containers), `cards.json`, `weapons.json`, `gear.json`,
  `bosses.json`, `enemies.json`, `items.json`, `characters.json`.

Collectible locations, Skulltula map pins (`zoneKey`, `hub`, `x`, `y`,
optional `floor`, `number`, read by `src/lib/skulltula-map-layout.ts`) and
some dungeon layouts were migrated from the **3DS guide**
(`docs/reference-3ds/`) and still need checking against the remake. Text that
is not confirmed for the remake says so («sin confirmar en el remake» / “not
yet confirmed for the remake”).

Still missing: Notes (`files.json`), achievements (`achievements.json`),
maps (`maps.json`) and the shop (`shop.json`).
