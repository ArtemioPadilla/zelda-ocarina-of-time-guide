/**
 * Single source of truth for the Skulltula interactive map's per-zone
 * canvases. The map renders one card per `zoneKey` (the 31 fine-grained
 * zones from `content.config.ts`'s `skulltulasSchema`), grouped under the
 * 7 top-level hubs (`AREA_ORDER`) purely for List/Map navigation — each
 * zone gets its own independent 0-100 x 0-100 coordinate space.
 *
 * `ZONE_MAPS[zoneKey].image`, where present, is a real sourced photo of
 * that zone (an OoT/OoT3D screenshot from Zelda Wiki — see each entry's
 * `attribution`/`sourceUrl`) used as the map's base layer, with every pin
 * in that zone hand-recalibrated in `src/content/{es,en}/skulltulas.json`
 * against that image's actual geometry. Most pins are landmark-anchored;
 * a few per zone (mainly Kakariko Village and Zora's River) are
 * compass-approximated instead, where a described landmark fell outside
 * the photographed frame — no per-pin list of which is which exists
 * beyond that qualitative note, so treat any single pin's precision as
 * "real position, landmark confidence not individually recorded".
 * OoT's 100 Gold Skulltulas span far more distinct
 * areas than a single overworld map image could ever cover at usable
 * precision (unlike, say, Wind Waker's one Sea Chart) — and OoT is a 3D
 * game with no official top-down overworld map at all, so "real image"
 * here means an angled in-game/promotional screenshot, the same kind of
 * asset other OoT fan guides (Zelda Wiki, Zelda Dungeon Wiki) use for
 * these areas, not an orthographic map.
 *
 * Where no `image` is set, the zone falls back to the original hand-drawn
 * schematic treatment: a single solid rect filling the whole 0-100 canvas
 * (interior/exterior fill only, via `interior`), with pins positioned by
 * hand. This deliberately covers every dungeon interior (OoT's 3D,
 * multi-floor dungeons don't reduce to one flat image any more than the
 * overworld does — doing them justice would mean a per-floor sub-map and
 * floor switcher, a real feature beyond this pass) plus a handful of
 * smaller overworld zones a matching photo wasn't sourced for yet.
 */

export const AREA_ORDER = [
  'kokiri',
  'hyrule-field',
  'kakariko',
  'death-mountain',
  'zora',
  'lake-hylia',
  'gerudo',
] as const;

export type SkulltulaArea = (typeof AREA_ORDER)[number];

export interface ZoneMapImage {
  /** Path under `public/`, e.g. `/images/skulltulas/kakariko-village.webp`. */
  src: string;
  /** Natural pixel size of `src` — used to give the map its real aspect
   * ratio instead of forcing a generic 16/10 box. */
  width: number;
  height: number;
  /** Rendered as a small caption under the map, and linked to `sourceUrl`. */
  attribution: string;
  sourceUrl: string;
}

export interface ZoneMapFloor {
  /** Stable key matching the `floor` field on that zone's skulltulas.json
   * entries (e.g. "b1", "1f") — untranslated, same pattern as `zoneKey`. */
  key: string;
  /** Short tab label shown in the floor switcher, e.g. "B1", "1F". */
  label: string;
  image: ZoneMapImage;
}

export interface ZoneMapConfig {
  zone: string;
  hub: SkulltulaArea;
  /** Dungeon/interior zones get a slightly different schematic fill (see
   * SkulltulaMap.tsx) when they have no real `image`/`floors`. */
  interior: boolean;
  image?: ZoneMapImage;
  /** Present only for the 11 dungeon interiors that got a per-floor real-
   * image treatment: one real screenshot per floor, switched via a floor
   * tab UI in SkulltulaMap.tsx, instead of a single zone-wide `image`.
   * Mutually exclusive with `image` in practice (a floored zone leaves
   * `image` unset). Each dungeon's skulltulas.json entries carry a matching
   * `floor` key so the map knows which tab a given pin belongs to. */
  floors?: ZoneMapFloor[];
}

const img = (
  file: string,
  width: number,
  height: number,
  attribution: string,
  sourceUrl: string,
): ZoneMapImage => ({ src: `/images/skulltulas/${file}`, width, height, attribution, sourceUrl });

const floor = (
  key: string,
  label: string,
  file: string,
  width: number,
  height: number,
  attribution: string,
  sourceUrl: string,
): ZoneMapFloor => ({ key, label, image: img(file, width, height, attribution, sourceUrl) });

// Ordered per hub, matching the original AREA_REGIONS authoring order —
// `ZONES_BY_HUB` (derived below) preserves that order for the Map view.
export const ZONE_MAPS: ZoneMapConfig[] = [
  // --- Kokiri hub ---
  {
    zone: 'Kokiri Forest',
    hub: 'kokiri',
    interior: false,
    image: img(
      'kokiri-forest.webp',
      1400,
      714,
      'Zelda Wiki — OoT3D Kokiri Forest map',
      'https://zeldawiki.wiki/wiki/File:OoT3D_Kokiri_Forest_Map.png',
    ),
  },
  {
    zone: 'Inside the Deku Tree',
    hub: 'kokiri',
    interior: true,
    floors: [
      floor(
        '3f',
        '3F',
        'dungeons/deku-tree/3f.webp',
        1400,
        788,
        'Zelda Wiki — OoT3D Inside the Deku Tree, 3F',
        'https://zeldawiki.wiki/wiki/File:OoT3D_Floor_3_(Inside_the_Deku_Tree).png',
      ),
      floor(
        'b1',
        'B1',
        'dungeons/deku-tree/b1.webp',
        1400,
        788,
        'Zelda Wiki — OoT3D Inside the Deku Tree, B1',
        'https://zeldawiki.wiki/wiki/File:OoT3D_Basement_1_(Inside_the_Deku_Tree).png',
      ),
    ],
  },
  { zone: 'Lost Woods', hub: 'kokiri', interior: false },
  { zone: 'Sacred Forest Meadow', hub: 'kokiri', interior: false },
  {
    zone: 'Forest Temple',
    hub: 'kokiri',
    interior: true,
    floors: [
      floor(
        '1f',
        '1F',
        'dungeons/forest-temple/1f.webp',
        1400,
        788,
        'Zelda Wiki — OoT3D Forest Temple, Main Room',
        'https://zeldawiki.wiki/wiki/File:OoT3D_Main_Room.png',
      ),
      floor(
        'b1',
        'B1',
        'dungeons/forest-temple/b1.webp',
        1400,
        788,
        'Zelda Wiki — OoT3D Forest Temple, Basement rotating room',
        'https://zeldawiki.wiki/wiki/File:OoT3D_Basement.png',
      ),
    ],
  },
  // --- Hyrule Field hub ---
  { zone: 'Hyrule Castle Market', hub: 'hyrule-field', interior: false },
  { zone: 'Hyrule Castle', hub: 'hyrule-field', interior: false },
  { zone: "Ganon's Castle", hub: 'hyrule-field', interior: true },
  { zone: 'Hyrule Field', hub: 'hyrule-field', interior: false },
  {
    zone: 'Lon Lon Ranch',
    hub: 'hyrule-field',
    interior: false,
    image: img(
      'lon-lon-ranch.webp',
      1400,
      788,
      'Zelda Wiki — OoT3D Lon Lon Ranch screenshot',
      'https://zeldawiki.wiki/wiki/File:OoT3D_Lon_Lon_Ranch.png',
    ),
  },
  // --- Kakariko hub ---
  {
    zone: 'Graveyard',
    hub: 'kakariko',
    interior: false,
    image: img(
      'graveyard.webp',
      1400,
      788,
      'Zelda Wiki — OoT3D Kakariko Village Graveyard screenshot',
      'https://zeldawiki.wiki/wiki/File:OoT3D_Kakariko_Village_Graveyard.png',
    ),
  },
  { zone: 'Shadow Temple', hub: 'kakariko', interior: true },
  {
    zone: 'Kakariko Village',
    hub: 'kakariko',
    interior: false,
    image: img(
      'kakariko-village.webp',
      1400,
      788,
      'Zelda Wiki — OoT3D Kakariko Village screenshot',
      'https://zeldawiki.wiki/wiki/File:OoT3D_Kakariko_Village.png',
    ),
  },
  {
    zone: 'Bottom of the Well',
    hub: 'kakariko',
    interior: true,
    floors: [
      floor(
        'main',
        'Interior',
        'dungeons/bottom-of-the-well/main.webp',
        1400,
        788,
        'Zelda Wiki — OoT3D Bottom of the Well, central corridor',
        'https://zeldawiki.wiki/wiki/File:OoT3D_Bottom_of_the_Well.png',
      ),
    ],
  },
  // --- Death Mountain hub ---
  { zone: 'Death Mountain Crater', hub: 'death-mountain', interior: false },
  {
    zone: "Dodongo's Cavern",
    hub: 'death-mountain',
    interior: true,
    floors: [
      floor(
        '1f',
        '1F',
        'dungeons/dodongos-cavern/1f.webp',
        1400,
        788,
        "Zelda Wiki — OoT3D Dodongo's Cavern entrance hall",
        "https://zeldawiki.wiki/wiki/File:OoT3D_Dodongo's_Cavern.png",
      ),
    ],
  },
  {
    zone: 'Fire Temple',
    hub: 'death-mountain',
    interior: true,
    floors: [
      floor(
        'main',
        'Interior',
        'dungeons/fire-temple/1f.webp',
        1120,
        840,
        'Zelda Wiki — OoT Fire Temple entrance hall',
        'https://zeldawiki.wiki/wiki/File:FireTemple.jpg',
      ),
    ],
  },
  { zone: 'Goron City', hub: 'death-mountain', interior: true },
  { zone: 'Death Mountain Trail', hub: 'death-mountain', interior: false },
  // --- Zora hub ---
  {
    zone: "Zora's Fountain",
    hub: 'zora',
    interior: false,
    image: img(
      'zoras-fountain.webp',
      1400,
      788,
      "Zelda Wiki — OoT3D Zora's Fountain screenshot",
      "https://zeldawiki.wiki/wiki/File:OoT3D_Zora's_Fountain.png",
    ),
  },
  {
    zone: 'Ice Cavern',
    hub: 'zora',
    interior: true,
    floors: [
      floor(
        'main',
        'Interior',
        'dungeons/ice-cavern/main.webp',
        1120,
        672,
        'Zelda Wiki — OoT3D Ice Cavern, movable ice block room',
        'https://zeldawiki.wiki/wiki/File:OoT3D_Ice_Cavern.png',
      ),
    ],
  },
  { zone: "Zora's Domain", hub: 'zora', interior: false },
  {
    zone: 'Water Temple',
    hub: 'zora',
    interior: true,
    floors: [
      floor(
        'main',
        'Interior',
        'dungeons/water-temple/main.webp',
        1400,
        713,
        'Zelda Wiki — OoT3D Water Temple, central pillar building',
        'https://zeldawiki.wiki/wiki/File:OoT3D_Water_Temple.png',
      ),
    ],
  },
  {
    zone: "Inside Jabu-Jabu's Belly",
    hub: 'zora',
    interior: true,
    floors: [
      floor(
        '1f',
        '1F',
        'dungeons/jabu-jabu/1f.webp',
        1400,
        788,
        "Zelda Wiki — OoT3D Inside Jabu-Jabu's Belly, 1F",
        "https://zeldawiki.wiki/wiki/File:OoT3D_Floor_1_(Inside_Jabu-Jabu's_Belly).png",
      ),
      floor(
        'b1',
        'B1',
        'dungeons/jabu-jabu/b1.webp',
        1400,
        788,
        "Zelda Wiki — OoT3D Inside Jabu-Jabu's Belly, B1",
        "https://zeldawiki.wiki/wiki/File:OoT3D_Basement_1_(Inside_Jabu-Jabu's_Belly).png",
      ),
    ],
  },
  {
    zone: "Zora's River",
    hub: 'zora',
    interior: false,
    image: img(
      'zoras-river.webp',
      1400,
      788,
      "Zelda Wiki — OoT3D Zora's River screenshot",
      "https://zeldawiki.wiki/wiki/File:OoT3D_Zora's_River.png",
    ),
  },
  // --- Lake Hylia hub ---
  {
    zone: 'Lake Hylia',
    hub: 'lake-hylia',
    interior: false,
    image: img(
      'lake-hylia.webp',
      1400,
      788,
      'Zelda Wiki — OoT3D Lake Hylia screenshot',
      'https://zeldawiki.wiki/wiki/File:OoT3D_Lake_Hylia.png',
    ),
  },
  // --- Gerudo hub ---
  { zone: "Gerudo's Fortress", hub: 'gerudo', interior: false },
  { zone: 'Desert Colossus', hub: 'gerudo', interior: false },
  { zone: 'Haunted Wasteland', hub: 'gerudo', interior: false },
  { zone: 'Spirit Temple', hub: 'gerudo', interior: true },
  {
    zone: 'Gerudo Valley',
    hub: 'gerudo',
    interior: false,
    image: img(
      'gerudo-valley.webp',
      1400,
      730,
      'Zelda Wiki — OoT Gerudo Valley screenshot',
      'https://zeldawiki.wiki/wiki/File:OoT_Gerudo_Valley.png',
    ),
  },
];

export const ZONE_MAP_BY_KEY: Record<string, ZoneMapConfig> = Object.fromEntries(
  ZONE_MAPS.map((z) => [z.zone, z]),
);

/** Zone keys grouped by hub, in `ZONE_MAPS`' authored order — what the Map
 * view iterates to render one hub section per `AREA_ORDER` entry, each
 * containing one card per zone within it. */
export const ZONES_BY_HUB: Record<SkulltulaArea, string[]> = Object.fromEntries(
  AREA_ORDER.map((hub) => [hub, ZONE_MAPS.filter((z) => z.hub === hub).map((z) => z.zone)]),
) as Record<SkulltulaArea, string[]>;
