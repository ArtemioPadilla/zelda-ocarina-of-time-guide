# OoT content — seed

This folder is a **minimal seed** so the engine builds: one walkthrough step
(`chapters/deku-tree.md`), the collectible types in `meta.json` and the 100
Gold Skulltulas + 36 Pieces of Heart + 8 Heart Containers in
`collectibles.json`, all migrated from the **3DS guide**
(`docs/reference-3ds/`). Locations, coordinates and text are 3DS-based and
pending the Nintendo Switch 2 remake (2026) research; the rest of the content
(chapters, bosses, items, cards, characters…) comes later.

Skulltula rows carry the map fields (`zoneKey`, `hub`, `x`, `y`, optional
`floor`, `number`) read by the Skulltula map on `/collectibles/gold-skulltula/`
(`src/lib/skulltula-map-layout.ts`).
