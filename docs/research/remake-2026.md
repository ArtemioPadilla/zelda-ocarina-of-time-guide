# Research: *The Legend of Zelda: Ocarina of Time* (Nintendo Switch 2, 2026)

What a remake-first guide can rely on today, what changed from *Ocarina of Time 3D*
(3DS, 2011), and what nobody has documented yet.

- **Researched:** 2026-11-08, three days after the game came out on 2026-11-05.
- **Scope change (coordinator, mid-task):** the guide is being retargeted to the
  Switch 2 remake as its **only** primary version. The 3DS dataset now lives in
  `docs/reference-3ds/`. This file collects (a) the remake's own structure and
  data and (b) every difference from the 3DS/N64 version found so far. Use (b) to
  decide which `docs/reference-3ds/` data can be carried over.
- **Reading this file:** every claim has a source and date in brackets, with
  short source keys defined in [Sources](#sources).

## Tags

| Tag | Meaning |
|---|---|
| **(UNVERIFIED)** | Only one source says it, or a single guide whose other data looks copied from N64 guides. |
| **(CONFLICT)** | Sources disagree. Every side is listed. |
| **(PRE-RELEASE)** | Comes from previews, trailers or hands-on coverage before 2026-11-05. The final game may differ. |
| *(no tag)* | At least two independent sources agree, or Nintendo says it. |

**How reliable the sources are.** Nintendo's own pages and the "Ask the Developer"
interview are first-party, but they cover features, not data. Zelda Wiki is a
community wiki: its main remake article was last revised 2026-11-08T03:42Z and is
the most detailed source so far, but it changes daily. The early collectible
guides (games.gg, Respec, Nintendo Life, Playnius, Nintendo Insider, FinalBoss)
were written in a rush during launch week. Some, FinalBoss especially, plainly
copy N64 data (for example, they still list the "Stone of Agony"), so remake
data that appears only in those guides is tagged UNVERIFIED. **No first-party or
complete community remake dataset exists yet** for locations of Skulltulas, Heart
Pieces or chests.

---

## 0. Summary of key differences

1. **Same adventure, same order.** It has the same dungeons in the same order
   with the same bosses, and no new dungeons. Nintendo "basically retained the
   dungeon mechanisms", but objects were moved and some layouts and puzzles
   changed. Nintendo Life estimates "around 10%" of puzzles and locations
   changed. The Forest Temple and Water Temple have the most documented changes.
2. **No Master Quest, Hero Mode or New Game+ at launch.** The **Hall of Fallen
   Foes**, a dream-world gallery for boss and mini-boss rematches and gauntlets,
   replaces the 3DS **Boss Challenge**. Dataminers found Master Quest data that
   would unlock through DLC. Nintendo has not announced it.
3. **Sheikah Stones are gone** (UNVERIFIED: only Zelda Wiki says so). In their
   place are **Threads of Time**, a quest log and story tapestry, and **Fairy
   Thoughts**, hint spots that Navi reads.
4. **Collectibles:** still **100 Gold Skulltulas**, **36 Pieces of Heart** and
   **8 Heart Containers**. Some locations moved:
   - The Ice Cavern Heart Piece is now sold by a Business Scrub in Death Mountain Crater.
   - The Hyrule Field underwater-grotto piece is replaced by a time-travel chest puzzle.
   - The Hyrule Field scrub piece now costs 100 Rupees and needs a password.
   - Per-area Skulltula counts are the same as the 3DS data except **Hyrule Field 3 (was 2)** and **Lon Lon Ranch 3 (was 4)**.
5. **Skulltula House:** the 20-token reward is the **Echo Gem** (replaces the
   Stone of Agony), 40 tokens gives **20 Bombchus** (UNVERIFIED), and 100 tokens
   gives a **Gold Rupee** (200).
6. **Items:**
   - A **5th bottle**, from the Castle Town Potion Shop.
   - The Poe Collector's bottle now takes **5 Big Poes**.
   - **Lenses of Truth** are worn like goggles.
   - **Business Scrub Seeds** are a new consumable.
   - The **Echo Gem**.
   - Wallets roughly double: start 200, then 500, then 1,000.
   - Great Fairies now charge growing Rupee offerings.
   - Masks work as adult.
   - Farore's Wind is reworked.
   - Din's Fire and the Spin-Attack fairies may have swapped places (CONFLICT).
7. **Songs:** the same 12 songs plus the Scarecrow's Song, with no new songs.
   - Inputs now use the buttons A, X, Y, L and R.
   - You can hum or play a real instrument into the microphone.
   - A Songbook lists your songs, and song cutscenes can be skipped.
8. **Controls:**
   - There is a jump button (X). Auto-jump is gone.
   - Hold A to dash. The camera is free, on the right stick.
   - There is one item button (ZR) and a quick-swap bar (L/R).
   - The D-pad holds the Ocarina (←), headgear/Lenses (↑), footwear/Iron Boots (↓) and Navi (→).
   - Aiming can use buttons or motion controls. The view is third-person while aiming.
9. **Names (English):**
   - Zora Domain, Zora Fountain, Lord Jabu-Jabu's Belly
   - Gerudo Proving Grounds, Mirage Desert, Ganondorf's Castle
   - Sacred Grove, Great Moblin, Lenses of Truth
   - Hero's Clothes, Minuet *of the* Forest
   - Gohma (not "Queen Gohma")
10. **Spanish:**
    - The game ships **Latin-American Spanish text and a full Latin-American
      Spanish voice cast**. A Castilian dub is also included.
    - Nintendo Mexico's page uses names that **differ from the guide's current
      Spanish strings**: *Arrullo de Zelda* (guide: *Nana de Zelda*), *Aldea
      Kakariko* (guide: *Pueblo Kakariko*), *Resortera de las Hadas* and *Arco de las
      Hadas* (guide: *... de Hada*).
    - LatAm press uses *Lentes de la Verdad*.

---

## 1. Release facts

| Fact | Value | Source / notes |
|---|---|---|
| Announced | Nintendo Direct, **9 June 2026** | ZW-OOTNS2 (cites @NintendoAmerica video r8eMoxo4ipE, 2026-06-09) |
| Release date announced | Zelda 40th Anniversary Direct, **8 Sept 2026** | ZW-OOTNS2; ZW-ToT |
| Release | **5 November 2026**, Switch 2 exclusive | NIN-US-STORE; NIN-MX; NIN-UK; NIN-US-NEWS (2026-11-05) |
| Price (US) | **$59.99 digital** / **$69.99 physical** | NIN-US-STORE; NIN-US-NEWS; KEEN-ED (2026-11-04) |
| Price (Mexico) | **MXN 1,229.00** digital | NIN-MX (retrieved 2026-11-08) |
| Price (other) | UK £49.99 digital; €59.99; AU$94.95 digital / AU$109.95 physical (KEEN-ED). UK retail £54.99–59.99 (NL-REV). | Retail vs eShop pricing, not a real conflict |
| Physical edition | First print run has a **textured foil cover** while supplies last. Not stated whether it is a Game-Key Card or a full cartridge. | KEEN-ED; ZW-OOTNS2 ("limited time") |
| Special editions | No collector's edition. A separate **Zelda 40th-anniversary special-edition Switch 2 console** is sold on its own. | NIN-US-STORE; NIN-MX; KEEN-ED |
| Early-purchase bonus | 40th-anniversary wallpaper for **digital** purchases before 2026-11-23 23:59 PT (US and MX). UK retailers gave replica Spiritual Stones while stock lasted. | NIN-US-STORE; NIN-MX; KEEN-ED |
| Accessories | "Electric OCARINA OF TIME" toy, $49.99, plays 12 songs, works with sound recognition | KEEN-ED (UNVERIFIED) |
| amiibo | Must be enabled in Settings. **Young Link** and **Young Zelda** amiibo (2027, $24.99 each) unlock masks based on the N64 character models. Other Zelda amiibo give random consumables: bombs, magic jars, sticks, nuts, Business Scrub Seeds. NL-REV calls nothing they give "essential". | NIN-US-STORE; NIN-UK; ZW-OOTNS2; NL-REV; KEEN-ED |
| File size | **24.9 GB** on Nintendo US, UK, ES and MX | NIN-US-STORE; NIN-UK; NIN-ES; NIN-MX. KEEN-ED says "27 GB" (CONFLICT; the official 24.9 GB figure is preferred) |
| Text languages (16) | Japanese, British English, US English, French, Canadian French, German, Italian, **Spanish**, **Latin American Spanish**, Korean, Dutch, Russian, Simplified and Traditional Chinese, Brazilian Portuguese, Polish | NIN-US-STORE; NIN-MX. Polish is a series first (text only, ZW-OOTNS2). |
| Voice | **Full voice acting in cutscenes** in English, Japanese, **Spanish (Spain and Latin America)**, Portuguese, Italian, French and German. Link stays silent apart from grunts. | ZW-OOTNS2; DESTR (2026-11-04); ATD-4 |
| Latin-American Spanish dub | **Yes.** Cast includes Navi (Nycolle González), Zelda/Sheik (Casandra Acevedo), Ganondorf (Emmanuel Alejandro), Great Deku Tree (Leonardo Agustín), Saria (Ana Lobo), Kaepora Gaebora/Rauru (Olin Garcés), Impa (Gabriela Guzmán), Darunia (Julio Grijalva), Ruto (Erika Ugalde), adult Ruto (Monserrat Mendoza), Nabooru (Dannan Huicochea), Koume/Kotake/Twinrova (Isabel Martinón / Circe Luna / Andrea Orozco). LevelUp praises the LatAm dub. | NINTENDEROS-CAST (2026-11-05); LU-REV (2026-11-04); 3DJ-MX (2026-09-08, PRE-RELEASE) |
| Partial voicing | Cubed3: voicing is "partial" and switches to unvoiced text mid-scene | CUBED3 (2026-11-06) (UNVERIFIED) |
| Play modes | TV, tabletop and handheld; 1 player | NIN-US-STORE; NIN-MX |
| Performance | **60 fps** docked and handheld; no separate quality or performance mode documented. Handheld resolution "takes a notable hit", with occasional dips. HDR and VRR output on supported TVs; 5.1 surround. | DESTR; CUBED3; NL-REV; NIN-US-STORE; ATD-4 |
| Ratings | ESRB E10+, PEGI 12, CERO B, USK 12, ClassInd 10, etc. | ZW-OOTNS2; NIN-US-STORE |
| Reception | Metacritic **96**; Famitsu **37/40** (10/9/9/9), the same score as the 3DS version | MC (retrieved 2026-11-08); VGC-FAM (2026-11-04) |
| Companion app | **ZELDA NOTES**, in the Nintendo Switch App. Features: map, Gossip Quests (photo hunts that pay out ocarina scores), Hall of Fallen Foes, Today's Record, play data, Photo Studio, Threads of Time, amiibo, ocarina player, daily quiz with 2,000+ questions | NIN-US-NEWS; NIN-UK; NE-LIST (2026-10-19, PRE-RELEASE); ZW-OOTNS2 |

---

## 2. Structure

### 2.1 Dungeons and story order

Nintendo: "we basically retained the dungeon mechanisms from the original game",
but "objects were placed to guide direction, so some layouts differ slightly"
[ATD-3]. The developers kept the original's separate maps and area connections
instead of building a seamless open world [ATD-2].

**Order:** "same dungeons in the same order as the original, with no new ones"
[GG-DUNG 2026-11-05]. Nintendo Life's walkthrough sections follow the classic
order [NL-WT]:

Kokiri Forest, then Hyrule Field and Castle Market, Kakariko, Death Mountain
Trail and Goron City, Zora River/Domain and Lake Hylia, Temple of Time,
"Awakening the Five Sages", Forest, Fire, Water, Shadow, Spirit, and "The Final
Stretch". The abridged walkthrough adds the Great Deku Tree, Hyrule Castle, Lost
Woods, Dodongo Cavern, Lord Jabu-Jabu's Belly, Ice Cavern, Bottom of the Well
and Gerudo's Fortress / Training Ground.

| # | Remake dungeon name (EN) | Boss | Main item | Documented changes |
|---|---|---|---|---|
| 1 | **The Great Deku Tree** (was "Inside the Deku Tree"; name from Game8 via GG-DUNG, UNVERIFIED) | **Gohma** (statue name in ZW-HOFF; 3DS: "Queen Gohma") | Fairy Slingshot | The floating platform is now a wooden bridge that collapses [GG-DUNG; SILIC 2026-11-04]. The slingshot target opening changed [GG-DUNG via Game8, UNVERIFIED]. Gohma's arms guard her weak spot while she is immune [ATD-3; LU-NEWS 2026-11-03]. Big Deku Babas removed game-wide [ZW-OOTNS2]. |
| 2 | Dodongo's Cavern ("Dodongo Cavern" in NL-WT) | King Dodongo | Bomb Bag | No specific changes documented. |
| 3 | **Lord Jabu-Jabu's Belly** | Barinade | Boomerang | Colour-coded tunnels. The Big Octo arena was redesigned and the spinning spikes removed (RPG Site via GG-DUNG, UNVERIFIED). |
| — | Temple of Time / Master Sword | — | — | After drawing the sword, Link opens a spectral path to the Sacred Realm. Ganondorf freezes him and walks in. [ZW-OOTNS2] |
| 4 | Forest Temple | Phantom Ganon | Fairy Bow | "Biggest changes seen so far": a new shortcut lift in the north-west room, the block-slider puzzle has no time limit but needs the right pieces, and one doorway is blocked by rocks so the route differs [GG-DUNG via Game8 / Nintendo Everything; CUBED3; NE-LIST]. Phantom Ganon's projectiles are slower (RPG Site via GG-DUNG, UNVERIFIED). |
| 5 | Fire Temple | Volvagia | Megaton Hammer | Lava kills on contact. Hot areas drain health immediately; the Goron Tunic heat timer is gone. [ZW-OOTNS2; GG-DUNG] |
| 6 | Ice Cavern | — | Iron Boots | Its entrance is visibly caved in during the child era [ZW-OOTNS2]. Its Heart Piece moved out (see §3.2). |
| 7 | Water Temple | Morpha | Longshot | Iron Boots on D-pad ↓. Some walls are now lattices so you can see the next room. Some rooms adjusted. The water-level mechanic is unchanged (three heights, Zelda's Lullaby at Triforce marks) [ATD-3; LU-REV; GAMINGBOLT/Kotaku summaries]. Colour-coded water-level lights carried over from the 3DS version [SILIC]. "The notorious key is replaced by a rupee in a chest" [CUBED3] (UNVERIFIED). Dark Link duel "loses tension" [LU-REV]. |
| 8 | Bottom of the Well | — | **Lenses of Truth** | No specific changes documented. Dead Hand can be forced to surface by killing all its hands [ZW-OOTNS2]. |
| 9 | Shadow Temple | Bongo Bongo | Hover Boots | No specific changes documented. |
| 10 | Spirit Temple | Twinrova | Silver Gauntlets, Mirror Shield | Twinrova's attacks toned down (RPG Site via GG-DUNG, UNVERIFIED). |
| 11 | **Gerudo Proving Grounds** (optional; was "Training Ground") | — | Ice Arrows | Silver Rupees are now non-item silver gems that fly into the door lock [ZW-OOTNS2]. Rooms not documented. |
| 12 | **Ganondorf's Castle** | Ganondorf, Ganon | Golden Gauntlets (Shadow trial) | Six trials kept [GG-DUNG via TheGamer]. The tower escape is overhauled: Zelda holds back a horde and freezes ReDeads, there is a Hookshot gap outside [ZW-OOTNS2], and **no escape timer** [GG-DUNG]. |

General dungeon notes:
- Fewer keys in places, simpler routes, and most puzzle countdown timers removed.
- Enemies and resources no longer respawn endlessly [CUBED3] (UNVERIFIED).
- Some bosses have rarely seen new attacks [RPG Site via GG-DUNG, UNVERIFIED]; "tweaked patterns" [CUBED3].
- Many reviewers found the game too easy [DESTR; LU-REV; TechRadar via search, 2026-11].

### 2.2 Bosses and mini-bosses

- **Same 10 bosses**: Gohma, King Dodongo, Barinade, Phantom Ganon, Volvagia,
  Morpha, Bongo Bongo, Twinrova, Ganondorf, Ganon. These are the boss statues in
  the Hall of Fallen Foes [ZW-HOFF, retrieved 2026-11-08]. Nintendo says it
  wanted bosses to feel new "without changing its essence" [ATD-3].
- **Mini-bosses** with statues include Big Octo, Dark Link, Dead Hand, Flare
  Dancer, Iron Knuckles (black, silver, Nabooru), Stalfos, Lizalfos, Dinolfos,
  White Wolfos, the Poe sisters (Meg, Jo, Beth, Amy), the composer brothers
  (Sharp, Flat) and the **Great Moblin** (was "Club Moblin"), who "blocks the
  way in the Sacred Grove" [ZW-HOFF; ZW-OOTNS2].
- **Enemy changes** [ZW-OOTNS2]:
  - Iron Knuckle axe swings can be blocked with a shield.
  - The Mirror Shield reflects Beamos lasers.
  - ReDeads charge at Link, and many more stand in adult Castle Town.
  - Wallmasters cast a visible purple warning glow.
  - Jo the Poe sister is now deep red.
  - Big Deku Babas are removed.
- **Boss strategies are not documented** remake-by-remake beyond Gohma.

### 2.3 Overworld and areas

From ZW-OOTNS2 unless noted:
- **Same zone-based world**, but many interiors and sub-areas are merged into
  larger maps without loading screens:
  - Lake Hylia is now part of the Hyrule Field map.
  - All of Castle Town, including the Temple of Time, is one map with a free camera.
- **Layout changes**, most notably in Kakariko Village and Zora Fountain.
- **Restyled areas** to look like *BotW*/*TotK*: Death Mountain, Zora River
  (now with spruces and ruins) and Lon Lon Ranch.
- **Hyrule Field** now has waterfalls, ruins and groves, plus more daytime
  enemies. Stalchildren also appear at night in the adult era.
- **New climbable fences and vines** in Goron City and Gerudo's Fortress.
- **Castle courtyard infiltration** follows a new route: through a sewer, a
  rooftop garden and a storage room. Reviewers note the free camera and jumping
  make it easier [LU-REV; NPR 2026-11-04].
- **Zora Domain thaws** after Morpha is beaten.
- **Grottos are visible** as cracked ground or rocks.
  - Hidden-grotto spots: [ZW-OOTNS2; NE-LIST; GG-SKULL via Game8].
  - The Song of Storms reveals more hidden holes [GG-SONGS via Game8, UNVERIFIED].
- **Big Poes** in Hyrule Field are marked by bright purple lanterns.
- **Time and NPCs:**
  - The day/night cycle is longer, and time passes in settlements.
  - You can sleep in beds or bedrolls to change the time.
  - NPCs follow schedules, and Castle Town has more of them.
  - Mido is reworked into a well-meaning character [NPR].
- **No new warp points.** Nintendo added them, then removed them to keep the
  original pacing [ATD-1].
- **Few new explorable buildings** [CUBED3].

### 2.4 Modes

| Mode | Status | Sources |
|---|---|---|
| Master Quest | **Not included.** Dataminers MrCheeze (2026-11-06) and OatmealDome (2026-11-07) found "MQ" strings and incomplete Master Quest data (mirrored world, changed dungeons) that would unlock **through owning DLC**. Aonuma: Nintendo wants to "leave future possibilities open", with no announcement. | KOTAKU-MQ (2026-11-04); NL-REV; CUBED3; TBREAK (2026-11-08) |
| Hero Mode / hard mode | **Not included** | KOTAKU-MQ (citing RPG Site); NL-REV; CUBED3 |
| New Game+ | **Not included.** Make several saves before the final boss if you are going for 100%. | DESTR |
| Boss Challenge (3DS) | **Replaced by the Hall of Fallen Foes** (see §2.5) | ZW-OOTNS2; SILIC |
| Saves | **One save file per system user.** Link can't be renamed. One manual save plus several autosaves. You resume where you saved, not at Link's house or the Temple of Time. | ZW-OOTNS2; NL-REV |

### 2.5 New side content

- **Hall of Fallen Foes.** Dream-world statues of every defeated enemy, with
  lore, locations and useful items.
  - Rematch bosses and mini-bosses with a timer.
  - **Boss gauntlets** give limited hearts and items and pay Rupees for in-hall upgrades.
  - Clearing a gauntlet sends a trophy (Kaepora delivers it) to Link's house.
  - **Unlock:** after first reaching the adult era, return to Kakariko as a child and meet Kaepora Gaebora. Afterwards, rest in any bed or bedroll (or on the "glowing green carpets").
  - [ZW-OOTNS2; ZW-HOFF; NL-REV ("rewards are useless"); NIN-US-NEWS]
- **Fairy Thoughts.** Spots left around Hyrule that Navi reads for hints and
  secrets. Playing a song at one drops an item or restores hearts. More Gossip
  Stones, some with new secrets. [ZW-OOTNS2; ZW-FT; NIN-US-NEWS]
- **Business Scrub password.** A new side quest (a Nintendo Life guide topic)
  tied to the Hyrule Field Heart Piece [NL-WT; RESPEC].
- **Potion Shop helper quest.** Gives the 5th bottle [ZW-OOTNS2; PLAYNIUS-COL].
- **Gossip Quests** in ZELDA NOTES (outside the game) [NE-LIST; ZW-OOTNS2].
- **Kept side quests:**
  - Happy Mask Shop, Epona, Cucco collection (7 Cuccos), Biggoron trade, Great Fairies.
  - Fishing, Horseback Archery, Big Poes, Dampé's game and race, and the frogs, all referenced by Heart Piece guides.
  - [NL-WT; NL-HP; RESPEC; PLAYNIUS-COL]

---

## 3. Collectibles

### 3.1 Gold Skulltulas

- **Total: 100.** **56 are in the overworld and 44 in dungeons.**
  [GG-SKULL 2026-11-05 (citing TheGamer and Game8); PLAYNIUS-SK 2026-11-06]
- **Locations:** "most are in the same locations as the original, but some
  have been moved" (Game8 via GG-SKULL; also stated by VGC guide titles and
  Vertical Slice via search, 2026-11). **No source lists which ones moved.** The
  only concrete example is a new bug-hole Skulltula near Zora's River (Game8 via
  GG-SKULL, UNVERIFIED).
- **Detection:** the **Echo Gem** (equip it) blinks and vibrates near Gold
  Skulltulas, including spots where one only appears at night [ZW-ECHO; NL-REV;
  GG-SKULL via TheGamer].
- **Soil patches:** ten Skulltulas are in soft soil and are dug up with bugs
  from a bottle [PLAYNIUS-SK].
- **Different attack patterns** for Skulltulas [NE-LIST, PRE-RELEASE].

**Per-area counts, remake vs the guide's 3DS data** (`docs/reference-3ds/*/skulltulas.json`):

| Area (guide zone) | 3DS guide | Remake (TheGamer via GG-SKULL) | Remake (PLAYNIUS-SK, grouped) |
|---|---|---|---|
| Kokiri Forest | 3 | 3 | 3 |
| Lost Woods + Sacred Forest Meadow ("Sacred Grove") | 3 + 1 | 3 + 1 | 4 |
| **Hyrule Field** | **2** | **3** | **3** |
| **Lon Lon Ranch** | **4** | **3** | **3** |
| Castle Market + Hyrule Castle + outside Ganon's Castle | 1 + 2 + 1 | 3 + 1 ("Ganondorf's Castle") | 4 |
| Kakariko + Graveyard | 6 + 2 | 8 | 8 |
| DM Trail + Goron City + DM Crater | 4 + 2 + 2 | 4 + 2 + 2 | 8 |
| Zora's River + Domain + Fountain + Lake Hylia | 4 + 1 + 3 + 5 | 4 + 1 + 3 + 5 | 13 |
| Gerudo Valley + Fortress + Wasteland ("Mirage Desert") + Colossus | 4 + 2 + 1 + 3 | 4 + 2 + 1 + 3 | 10 |
| Dungeons (Deku 4, Dodongo 5, Jabu 4, Forest 5, Fire 5, Ice 3, Water 5, Well 3, Shadow 5, Spirit 5) | 44 | 44 (same split) | 44 |

Both remake sources agree on Hyrule Field +1 and Lon Lon Ranch −1. Every other
grouped total matches the 3DS dataset. Individual token positions are **not**
confirmed to match, even inside areas whose count is unchanged.

**House of Skulltula rewards** (`rewards` collection):

| Tokens | 3DS guide | Remake | Sources |
|---|---|---|---|
| 10 | Adult's Wallet (99 → 200) | **Adult's Wallet, holds 500** | GG-SKULL; PLAYNIUS-SK ("bolsa de adulto (500 rupias)"); FINALBOSS-W |
| 20 | Stone of Agony | **Echo Gem** (Spain: *Broche resonante*) | ZW-ECHO; GG-SKULL; PLAYNIUS-SK. FINALBOSS-W still says Stone of Agony (CONFLICT, but that guide looks copied from N64 data). |
| 30 | Giant's Wallet (500) | **Giant's Wallet, holds 1,000** | PLAYNIUS-SK; FINALBOSS-W |
| 40 | Bombchus (10) | **20 Bombchus** | GG-SKULL (from Game8 only); PLAYNIUS-SK. FINALBOSS-W says 10 (CONFLICT). |
| 50 | Piece of Heart | Piece of Heart | all |
| 100 | 200 Rupees, repeatable | **Gold Rupee (200)**, repeatable | GG-SKULL; PLAYNIUS-SK |

Starting wallet: **200 Rupees** [SILIC; NE-LIST (PRE-RELEASE); NPR ("wallets hold double")].

### 3.2 Pieces of Heart and Heart Containers

- **36 Pieces of Heart + 8 boss Heart Containers.** That makes 20 hearts in
  total with the starting 3. [NL-HP 2026-11-05; RESPEC 2026-11-05; PLAYNIUS-COL]
- **Nintendo Insider says "35"** [NI-HP 2026-11-05] but lists 36 entries,
  numbering #33 twice. That is a numbering error, not a real conflict.
- **Pickup change:** Heart Containers and Pieces now need a press of **A**; you
  no longer collect them by touching them [ZW-OOTNS2].

Changes mapped to the guide's 3DS `hearts` IDs (`docs/reference-3ds/*/hearts.json`):

| Guide ID (3DS) | 3DS method | Remake status | Sources |
|---|---|---|---|
| hp-29 Ice Cavern (Blue Fire on red ice) | — | **Removed.** Replaced by a **Death Mountain Crater Business Scrub (child), 100 Rupees** (NL-HP adds a Deku Seed trick). | RESPEC ("relocated from the Ice Cavern"); NL-HP #28; NI-HP #27; PLAYNIUS-COL ("desaparece la de la Caverna de hielo"). NI-HP files an Iron-Boots piece under Zora Fountain that mentions the Ice Cavern; probably hp-28, check this. |
| hp-20 Hyrule Field, underwater grotto under the lone tree | — | **Replaced** by a **Hyrule Field rock-outcrop chest, solved with time travel**: sealed as a child, empty as an adult. Read a Fairy Thought as an adult, then open the chest as a child. | RESPEC #34; NL-HP #35 ("Fairy Note time shift"); NI-HP #32; PLAYNIUS-COL ("nuevas en la Llanura") |
| hp-19 Hyrule Field Business Scrub grotto (10 Rupees, near the Lake Hylia fence) | — | **Changed.** Scrub grotto **near Hyrule Castle / north-east of Castle Town**, **100 Rupees with a password**, sold out as an adult so buy it as a child. | RESPEC #35; NL-HP #36; NI-HP #33 |
| hp-09 Graveyard back grave | needs Sun's Song vs ReDead | Sun's Song **not required** | NL-HP (UNVERIFIED) |
| hp-12 Zora's River pillar | Cucco glide | The old Cucco jump "reportedly does not work". Use **Bombs + Cucco**. | NL-HP (UNVERIFIED) |
| hp-08 Dampé's grave-digging | tour | **Faster**; 10 Rupees per dig | RESPEC; NL-HP |
| hp-11 Death Mountain Trail ledge | backflip or bean | Can't be grabbed early with jump tricks; use the bean | RESPEC (UNVERIFIED) |
| hp-17 Fishing Pond | large fish | "55 cm+ fish" / "big fish, 30 Rupees" | RESPEC; NL-HP |
| other 28 IDs | — | Listed by the remake guides at the same place with the same method. RESPEC warns that some pieces were "moved slightly, placed into chests, or given new acquisition methods" without naming them. | NL-HP; RESPEC; NI-HP |

### 3.3 Other collectibles and counters

- **Bottles: 5** (3DS: 4) [ZW-OOTNS2; NE-LIST; PLAYNIUS-COL].
  - The new bottle comes from helping the **Potion Shop owner in Hyrule Castle Town**.
  - The **Poe Collector gives a bottle at 5 Big Poes** (was 10). All 10 now pay a **Gold Rupee**. [ZW-OOTNS2]
  - Other bottles, presumably unchanged: Cucco Lady (7 Cuccos), Talon's Super
    Cucco game, Ruto's Letter [PLAYNIUS-COL]. The VGC bottle guide dated
    2026-11-05 lists only the four N64 bottles; it covers the N64 version.
- **Great Fairies: 6.** Each now **asks for an increasing Rupee offering**, up to 500 Rupees [ZW-OOTNS2; PLAYNIUS-COL; NPR].
  - **Din's Fire and improved Spin Attack fountains (CONFLICT):** ZW-OOTNS2 says
    the fairies **swapped**, so Din's Fire is on Death Mountain and the Spin Attack
    is at Hyrule Castle. FINALBOSS-GF and a VGC guide give the N64 placement
    (Din's Fire at Hyrule Castle). The FinalBoss and VGC guides look N64-derived.
    Check in game.
  - Gifts now appear as Collection items: Gift of Improved Spin, Doubled Magic, Halved Damage [ZW-OOTNS2].
- **Monoliths:** many more than the 3 in the original [ZW-OOTNS2].
- **Business Scrub Seeds:** a consumable found in **newly added chests** and from
  amiibo. Using one summons a wandering Business Scrub shop. [ZW-BSS; ZW-OOTNS2]
- **Retro masks** from amiibo [NIN-UK; ZW-OOTNS2].
- **Hall of Fallen Foes statues** work as an enemy bestiary [ZW-HOFF].

---

## 4. Items, equipment, songs, mechanics, controls

### 4.1 Controls (default)

| Action | Remake | Sources |
|---|---|---|
| Jump | **X**, anywhere. Auto-jump removed. Also climbs small ledges and dashes while swimming. Child and adult jump different distances. | ZW-OOTNS2; ATD-3; NL-REV (A also jumps in some contexts) |
| Dash | **Hold A**, the roll button | ZW-OOTNS2; ATD-3; NIN-UK |
| Sword | **Y**; hold and release for a spin attack | NL-REV |
| Jump Attack | Two-step *BotW* style by default, or one-press N64 style as an option | ATD-3; LU-NEWS |
| Target | **ZL**; two lock-on settings | DESTR; NE-LIST; MIXVALE (2026-10-19, PRE-RELEASE) |
| Item button | **ZR only**, one slot | ZW-OOTNS2 |
| Item swap | **L/R** open a horizontal bar (NL-REV: hold R) | ZW-OOTNS2; NL-REV; NPR |
| D-pad | **← Ocarina**, **↑ headgear** (Lenses or masks), **↓ footwear** (Iron or Hover Boots), **→ Navi** | ZW-OOTNS2; DESTR; LU-REV |
| Camera | **Right stick, fully free**, including in Castle Town | ZW-OOTNS2; ATD-3 |
| Aiming | Buttons or **motion (gyro)**, set in Options. Third-person view; you can move while aiming. | NIN-US-STORE; NIN-MX; SILIC; VGC-FAM |
| Ocarina | Buttons, **humming or a real instrument into the mic**. Hold ZL for the list of learned songs; song cutscenes can be skipped. | ZW-OOTNS2; NL-REV; ATD-4; NIN-MX |
| HUD presets | **Standard / Pro / Master**. Pro shows minimal information; Master shows none, not even the lock-on marker or reticle. | NE-LIST; Nintendowire, OtakuKart and Gameblog (all Oct 2026, PRE-RELEASE); CUBED3 confirms a no-HUD option |
| Accessibility (official list) | Stereo/surround; playable without motion or touch controls; colour alternatives. NL-REV also lists motion aiming, invert axis and a navigational map. **No difficulty selector.** | NIN-US-STORE; NIN-MX; NL-REV |

### 4.2 Equipment and items vs the guide's `equipment` collection

| Guide entry (3DS) | Remake status | Sources |
|---|---|---|
| Kokiri Sword | Same. es-MX: *Espada kokiri*. Swords can no longer hit walls or collect Rupees (engine limit). | NIN-MX; ZW-OOTNS2 |
| Master Sword | Same role, **redesigned** in *Skyward Sword*+ style | ZW-OOTNS2 |
| Giant's Knife | **Not documented.** FinalBoss-style guides mention buying it from Medigoron for 200, unconfirmed. | search snippet (UNVERIFIED) |
| Biggoron's Sword | Present. NL calls it "**Biggoron Sword**". Two-handed, double Master Sword damage. | NL-BIG |
| Deku Shield / Hylian Shield / Mirror Shield | Present. Hylian Shield **redesigned**. Mirror Shield now **reflects Beamos lasers**. A child crouching under water with the Hylian Shield now drowns. | ZW-OOTNS2 |
| Kokiri Tunic (adult) | Renamed **Hero's Clothes** | ZW-OOTNS2 |
| Goron Tunic | Heat **timer removed**. Without the tunic you lose health fast. | ZW-OOTNS2; GG-DUNG |
| Zora Tunic | No changes documented | — |
| Iron Boots / Hover Boots | **Footwear on D-pad ↓**. Iron Boots toggle instantly. | ZW-OOTNS2; DESTR; LU-REV |
| Fairy Slingshot / Fairy Bow | Present. es-MX: *Resortera de las Hadas*, *Arco de las Hadas*. Third-person aiming, gyro optional. | NIN-MX; SILIC |
| Boomerang, Bomb Bag, Megaton Hammer, Hookshot / Longshot | Present (dungeon rewards as in the original) | GG-DUNG |
| Lens of Truth | Becomes the **Lenses of Truth**: goggles (headgear, D-pad ↑) that use magic while worn, with a purple eye effect. LatAm: *Lentes de la Verdad*. | ZW-LENS; ZW-OOTNS2; NL-REV; LU-REV |
| Magic Meter / Great Fairies | Fairies charge offerings, and two may have moved (CONFLICT, §3.3). **Farore's Wind** returns you to the exact marked spot, costs **2 magic (was 6)**, and its point can only be replaced, not dispelled. **Din's Fire** runs in real time. | ZW-OOTNS2; NE-LIST |
| Magic Beans | No changes documented | — |
| Bottle | **5 bottles** (see §3.3) | ZW-OOTNS2 |
| *(new)* Echo Gem | Equipment, the 20-token Skulltula House reward. Detects Gold Skulltulas. Replaces the Stone and Shard of Agony. | ZW-ECHO |
| *(new)* Business Scrub Seed | Consumable that summons a scrub shop | ZW-BSS |
| *(new)* Ocarinas on Link's belt | You keep the Fairy Ocarina and the Ocarina of Time. Link's fingers move with the notes. | ZW-OOTNS2; GG-SONGS |
| Masks | **Usable as an adult.** The Mask of Truth now also reads NPC thoughts. | ZW-OOTNS2 |
| Menus | Quest Status is split into **Collection** and **Key Items**. The inventory is split into child, adult and shared sections. | ZW-OOTNS2; NE-LIST |
| Rupee economy | **Rebalanced**: shops cost more, with new ways to spend | ZW-OOTNS2 |

### 4.3 Songs (`songs` collection)

- **The same 12 songs plus the Scarecrow's Song (13 in the guide's count). No new songs.** [GG-SONGS 2026-11-05; PLAYNIUS-COL]
- **Same teachers and warp destinations** [GG-SONGS].
- **Inputs now use A, X, Y, L and R** [GG-SONGS; PLAYNIUS-COL; NL-REV].
  GG-SONGS gives all 12 inputs. They match a consistent one-to-one remap of the
  guide's notation (UNVERIFIED for the exact remap, which has one source, but
  all 12 songs agree):
  **● → L, ▼ → R, ► → A, ◄ → Y, ▲ → X.**

| Song (EN; es-MX where shown officially) | Guide notation (3DS/N64) | Remake input (GG-SONGS) |
|---|---|---|
| Zelda's Lullaby (*Arrullo de Zelda*, NIN-MX) | ◄ ▲ ► ◄ ▲ ► | Y X A Y X A |
| Saria's Song | ▼ ► ◄ ▼ ► ◄ | R A Y R A Y |
| Epona's Song | ▲ ► ◄ ▲ ► ◄ (guide; see note below) | X Y A X Y A |
| Sun's Song (*Canción del Sol*, NIN-MX) | ► ▼ ▲ ► ▼ ▲ | A R X A R X |
| Song of Time (*Canción del tiempo*, NIN-MX) | ► ● ▼ ► ● ▼ | A L R A L R |
| Song of Storms | ● ▼ ▲ ● ▼ ▲ | L R X L R X |
| Minuet **of the** Forest (renamed, ZW-OOTNS2) | ● ▲ ◄ ► ◄ ► | L X Y A Y A |
| Bolero of Fire | ▼ ● ▼ ● ► ▼ ► ▼ | R L R L A R A R |
| Serenade of Water | ● ▼ ► ► ◄ | L R A A Y |
| Nocturne of Shadow | ◄ ► ► ● ◄ ► ▼ | Y A A L Y A R |
| Requiem of Spirit | ● ▼ ● ► ▼ ● | L R L A R L |
| Prelude of Light | ▲ ► ▲ ► ◄ ▲ | X A X A Y X |
| Scarecrow's Song | 8 notes of your choice | 8 notes of your choice (Bonooru as a child, Pierre as an adult) |

> **Note for the maintainer:** the guide's Epona's Song notation in
> `docs/reference-3ds/es/songs.json` is `▲ ► ◄ ▲ ► ◄`. The standard N64
> notation is ▲ ◄ ► (C-up, C-left, C-right). The remake input X Y A fits ▲ ◄ ►,
> so the 3DS data likely has ◄ and ► swapped. Check this before reusing it.

Other song details:
- The Lost Woods Skull Kid memory game shows the notes on screen and ignores
  rhythm [GG-SONGS via Game8, UNVERIFIED].
- Navi has a unique dance for each song [ZW-OOTNS2].

---

## 5. Quality of life

| Feature | Remake | Sources |
|---|---|---|
| Sheikah Stones (3DS hint videos) | **Removed** | ZW-OOTNS2 (UNVERIFIED: single explicit source) |
| Objective tracking | **Threads of Time**: a quest log plus a tapestry that fills in as the story advances. It helps with long chains such as the Biggoron trade (Dexerto, via search). | ZW-OOTNS2; ZW-ToT; ATD-3; DESTR; NL-REV |
| Hints | **Fairy Thoughts**. Navi only speaks when you call her (D-pad →); silent text bubbles appear during play. | ZW-FT; LU-REV; NPR; NE-LIST |
| Map | New hand-drawn map by the N64 map artist. The map **shows the collectible status of each area**. The mini-map is in full colour. | ATD-2; ZW-OOTNS2 |
| Autosave | Several autosaves plus one manual save. You resume where you saved. | NL-REV; ZW-OOTNS2 |
| Fast travel | Warp songs only (no new warp points) | ATD-1; GG-SONGS |
| Difficulty options | **None** (no Hero or Master Quest mode). HUD presets are the only visual "difficulty". | KOTAKU-MQ; CUBED3; NE-LIST |
| Timers | Most puzzle countdowns are gone, the Ganon escape timer is gone, and the heat timer is gone | CUBED3; GG-DUNG; ZW-OOTNS2 |
| Loading | Rare loading screens; merged maps | SILIC; ZW-OOTNS2 |
| Dialogue | Fully rewritten, with more guidance; NPCs have repeat-dialogue variants | ZW-OOTNS2 |
| Accessibility | See §4.1. No text-size controls or assist mode documented. | NIN-US-STORE; cloudspress FAQ via search (PRE-RELEASE) |

---

## 6. Names

### 6.1 English renames (official, in game)

From ZW-OOTNS2 (wiki transcriptions of in-game text), corroborated where noted:

| 3DS / N64 name | Remake name |
|---|---|
| Zora's Domain / Zora's Fountain | **Zora Domain / Zora Fountain** (also NIN-US-NEWS: "Zora Domain") |
| Inside Jabu-Jabu's Belly | **Lord Jabu-Jabu's Belly** (also GG-DUNG, NL-WT, ZW-HOFF) |
| Inside the Deku Tree | **The Great Deku Tree** (GG-DUNG via Game8, UNVERIFIED) |
| Sacred Forest Meadow | **Sacred Grove** (ZW-HOFF statue text; GG-SONGS via Game8) |
| Gerudo Training Ground | **Gerudo Proving Grounds** (also GG-DUNG via Game8) |
| Haunted Wasteland | **Mirage Desert** (also GG-SKULL via TheGamer) |
| Ganon's Castle | **Ganondorf's Castle** (also GG-DUNG, GG-SKULL) |
| Club Moblin | **Great Moblin** |
| Queen Gohma | **Gohma** (ZW-HOFF boss statue) |
| Lens of Truth | **Lenses of Truth** |
| Kokiri Tunic (adult) | **Hero's Clothes** |
| Minuet of Forest | **Minuet of the Forest** |
| Stone of Agony | **Echo Gem** (a different item) |
| Biggoron's Sword | "Biggoron Sword" (NL-BIG, UNVERIFIED) |
| Trade items | NL-BIG: Pocket Egg → Pocket Cucco → Cojiro → Odd Mushroom → **Odd Poultice** (was Odd Potion) → Poacher's Saw → **Broken Goron Sword** → Prescription → Eyeball Frog → **Speciality Eye Drops** → **Biggoron Sword Receipt** (was Claim Check) → Biggoron Sword (UNVERIFIED, single source) |
| Hyrule Castle Market / Castle Town interiors / Temple of Time | Merged into a single **Hyrule Castle Town** map |

### 6.2 Spanish (Latin America): what official sources show

**Game title:** the English title is used unchanged in every region: *The
Legend of Zelda: Ocarina of Time* [NIN-MX; NIN-ES].

Names from **Nintendo Mexico's product page** [NIN-MX, retrieved 2026-11-08,
from body text and image alt text] compared with the guide's current
`docs/reference-3ds/es` strings:

| Item | es-MX official (remake) | Guide (3DS-based) | Same? |
|---|---|---|---|
| Zelda's Lullaby | **Arrullo de Zelda** | Nana de Zelda | **No** |
| Sun's Song | Canción del Sol | Canción del Sol | yes |
| Song of Time | Canción del tiempo | Canción del Tiempo | yes (capitalisation only) |
| Kakariko Village | **Aldea Kakariko** | Pueblo Kakariko | **No** |
| Fairy Slingshot | **Resortera de las Hadas** | Resortera de Hada | **No** |
| Fairy Bow | **Arco de las Hadas** | Arco de Hada | **No** |
| Hookshot | gancho | Gancho | yes |
| Kokiri Sword | Espada kokiri | Espada Kokiri | yes (capitalisation) |
| Deku Shield / Deku Stick | Escudo deku / Palo deku | Escudo Deku / — | yes (capitalisation) |
| Hylian Shield | escudo hyliano | Escudo Hyliano | yes |
| Master Sword | Espada Maestra | Espada Maestra | yes |
| Fairy Ocarina / Ocarina of Time | Ocarina de las Hadas / Ocarina del Tiempo | — | n/a |
| Places | Bosque Kokiri, Gran Árbol Deku, Río zora, Ciudad Goron, Rancho Lon Lon, Castillo de Hyrule, Montaña de la Muerte, Reino Sagrado | Bosque Kokiri, Río Zora, Ciudad Goron, Rancho Lon Lon, Castillo de Hyrule | mostly yes |
| Characters | Link niño, Link adulto, Zelda niña, Navi, Saria, Epona, Ganondorf | — | n/a |
| Hall of Fallen Foes | described in alt text as "**el coliseo de los monstruos**" (lower case, descriptive; may not be the in-game name) | — | (UNVERIFIED) |
| Threads of Time | described only as "un tapiz" ("progress tapestry"). Culturageek (AR, 2026-11-06) says "tapiz de misiones". | — | not documented |

**LatAm press** (LevelUp, Mexico):
- **Lentes de la Verdad** (guide: *Lente de la Verdad*: **No**).
- **botas de hierro** (guide: *Botas de Hierro*: yes).
- Templo del Agua, Templo del Fuego (yes).
- Sources: LU-REV (2026-11-04); LU-NEWS (2026-11-03).

**Spain** names, for contrast only (not the guide's target):
- NIN-ES uses *Tirachinas de las Hadas*, *llanura de Hyrule*, *Nuez deku*, *Bumerán*.
- PLAYNIUS-SK (2026-11-06) uses *Broche resonante* (Echo Gem), *Santuario del
  bosque*, *Ciudadela*, *Cueva de los Dodongos*, *Tripa de Jabu-Jabu*, *Caverna
  de hielo*, *Fondo del pozo*, *bolsa de adulto / de gigante*.

**Not yet documented in Latin-American Spanish:**
- Most dungeon names.
- New items: Echo Gem, Business Scrub Seed.
- New features: Threads of Time, Hall of Fallen Foes, Fairy Thoughts.
- Renamed places: Gerudo Proving Grounds, Mirage Desert, Ganondorf's Castle, Sacred Grove.
- Warp-song names.
- Trade items.
- Boss subtitles.

The guide's Spanish strings should be checked against an in-game LatAm playthrough
or a LatAm walkthrough once one is published.

---

## 7. Remake-first walkthrough skeleton

The guide's 12 chapters map onto the remake's order as follows. The order
matches GG-DUNG, NL-WT and ATD-2. Chapter titles may need the renamed places.

| Chapter (3DS ref) | Remake content | Remake-specific notes to add |
|---|---|---|
| C1 Kokiri Forest + Deku Tree | same | Collapsing bridge; Gohma's arm guard; voiced intro and tapestry; leaves fall when the Deku Tree dies |
| C2 Hyrule Field + Castle Town | same | Castle Town is one free-camera map. New castle infiltration route (sewer, rooftop garden, storeroom). Potion Shop bottle quest. |
| C3 Kakariko + Dodongo's Cavern | same | Kakariko layout changed |
| C4 Zora's Domain + Jabu-Jabu | same | Renamed Zora Domain / Lord Jabu-Jabu's Belly; colour-coded tunnels; Big Octo arena |
| C5 Temple of Time + Master Sword | same | New Sacred Realm cutscene |
| C6 Adult Link + Forest Temple | same | Lift shortcut, slider puzzle, rerouted doorway; Sacred Grove name |
| C7 Death Mountain Crater + Fire Temple | same | No heat timer; Din's Fire fountain location (CONFLICT) |
| C8 Lake Hylia + Water Temple (+ Ice Cavern) | same | D-pad boots, lattice walls; Ice Cavern no longer has a Heart Piece; Zora Domain thaws after Morpha |
| C9 Well + Graveyard + Shadow Temple | same | Lenses of Truth on the D-pad |
| C10 Gerudo Valley + Spirit Temple | same | Mirage Desert name; Gerudo Proving Grounds; new climbable fences |
| C11 Ganondorf's Castle trials | same | Six trials; renamed castle |
| C12 Ganon + ending | same | Escape reworked, no timer, Hookshot gap; make extra saves (no New Game+) |

**Route level not yet documented:** room-by-room dungeon routes and key counts
(Cubed3 says some keys were removed), chest contents, and which new
Business-Scrub-Seed chests exist.

---

## 8. What is NOT yet documented (as of 2026-11-08)

- Exact positions of the moved Gold Skulltulas. No source lists them.
- A verified remake-only list of all 100 Skulltula and 36 Heart Piece positions.
  The current guides are early and some copy N64 data.
- Exact Great Fairy offering amounts (one review gives "up to 500"), and whether
  the Din's Fire / Spin Attack fountains swapped.
- The full Biggoron chain in the remake: number of steps, timers, and whether the
  Giant's Knife is still sold. Eye-drops timer: NL-BIG says 3.5 min, FinalBoss
  says 4 min (CONFLICT). NL-BIG gives Odd Mushroom 4 min and Eyeball Frog 2.5 min.
- Mask Shop rotation and rewards (Mask of Truth requirements), Big Poe Rupee
  values, and Horseback Archery / fishing thresholds and rewards beyond the Heart
  Piece guides.
- Ammo capacity upgrades (bomb bag, quiver, seed bag, sticks/nuts) and their sources.
- Rooms of the Gerudo Proving Grounds, and the Shadow Temple, Spirit Temple and
  Bottom of the Well changes.
- Locations of the new Business Scrub Seed chests; the full list of Fairy Thoughts.
- Official Latin-American Spanish names for most dungeons, items and new features.
- Whether Master Quest arrives as DLC (only datamined).

---

## Sources

All URLs were retrieved on 2026-11-08. The date is publication date, or
"undated" if the page shows none.

**First-party (Nintendo)**
- NIN-US-STORE: Nintendo US store page, undated: https://www.nintendo.com/us/store/products/the-legend-of-zelda-ocarina-of-time-switch-2/
- NIN-MX: Nintendo México store page, undated: https://www.nintendo.com/es-mx/store/products/the-legend-of-zelda-ocarina-of-time-switch-2/
- NIN-UK: Nintendo UK page 3115664, undated: https://www.nintendo.com/en-gb/Games/Nintendo-Switch-2-games/The-Legend-of-Zelda-Ocarina-of-Time-3115664.html
- NIN-ES: Nintendo España page 3115664, undated: https://www.nintendo.com/es-es/Juegos/Juegos-de-Nintendo-Switch-2/The-Legend-of-Zelda-Ocarina-of-Time-3115664.html
- NIN-US-NEWS: "The Legend of Zelda: Ocarina of Time is now available", 2026-11-05: https://www.nintendo.com/us/whatsnew/its-time-experience-the-legend-of-zelda-ocarina-of-time-reborn-exclusively-for-nintendo-switch-2/
- ATD-1 to ATD-4: Ask the Developer Vol. 24, Parts 1–4. Published 2026-11-02 (Zelda Wiki's citation date for Parts 1–2; Parts 3–4 are the same series):
  - https://www.nintendo.com/us/whatsnew/ask-the-developer-vol-24-the-legend-of-zelda-ocarina-of-time-part-1/
  - https://www.nintendo.com/us/whatsnew/ask-the-developer-vol-24-the-legend-of-zelda-ocarina-of-time-part-2/
  - https://www.nintendo.com/us/whatsnew/ask-the-developer-vol-24-the-legend-of-zelda-ocarina-of-time-part-3/
  - https://www.nintendo.com/us/whatsnew/ask-the-developer-vol-24-the-legend-of-zelda-ocarina-of-time-part-4/

**Wikis**
- ZW-OOTNS2: Zelda Wiki, "The Legend of Zelda: Ocarina of Time (Nintendo Switch 2)". Revision 2026-11-08T03:42:40Z, read via the API: https://zeldawiki.wiki/wiki/The_Legend_of_Zelda:_Ocarina_of_Time_(Nintendo_Switch_2)
- ZW-ECHO, ZW-HOFF, ZW-BSS, ZW-ToT, ZW-FT, ZW-LENS: Zelda Wiki pages Echo_Gem, Hall_of_Fallen_Foes, Business_Scrub_Seed, Threads_of_Time, Fairy_Thought, Lenses_of_Truth (retrieved 2026-11-08), at https://zeldawiki.wiki/wiki/<Page>

**Reviews and news**
- NL-REV: Nintendo Life review (9/10). Page shows "Wed", i.e. 2026-11-04: https://www.nintendolife.com/reviews/nintendo-switch-2/the-legend-of-zelda-ocarina-of-time
- DESTR: Destructoid review (10/10), 2026-11-04: https://www.destructoid.com/reviews/the-legend-of-zelda-ocarina-of-time-remake-review/
- CUBED3: Cubed3 review (9/10), 2026-11-06: https://www.cubed3.com/games/reviews/nintendo-switch-2/the-legend-of-zelda-ocarina-of-time-1
- SILIC: Siliconera review (10), 2026-11-04: https://www.siliconera.com/review-the-legend-of-zelda-ocarina-of-time-switch-2-is-a-stunning-remake/
- NPR: NPR review (James Perkins Mastromarino) via WUNC, 2026-11-04: https://www.wunc.org/2026-11-04/review-the-legend-of-zelda-ocarina-of-time-remake-is-superb-streamlined-and-safe
- VGC-FAM: VGC on Famitsu's 37/40, 2026-11-04: https://www.videogameschronicle.com/news/zelda-ocarina-of-time-switch-2-remake-review-published-in-famitsu/
- MC: Metacritic, 96: https://www.metacritic.com/game/the-legend-of-zelda-ocarina-of-time-2026/
- KOTAKU-MQ: Kotaku, "Remake officially has no Master Quest", 2026-11-04: https://kotaku.com/the-zelda-ocarina-of-time-remake-has-no-master-quest-2000753351
- TBREAK: Master Quest DLC datamine, 2026-11-08: https://tbreak.com/ocarina-of-time-master-quest-dlc-datamine/
- KEEN-ED: KeenGamer editions and prices, 2026-11-04: https://www.keengamer.com/articles/news/the-legend-of-zelda-ocarina-of-time-launches-november-5-at-59-99-digital-and-69-99-physical/
- NE-LIST: Nintendo Everything "List of everything new", 2026-10-19 (PRE-RELEASE): https://nintendoeverything.com/?p=923861
- Forbes review, 2026-11-04 (returned 403; used only via search snippet): https://www.forbes.com/sites/games/2026/11/04/zelda-ocarina-of-time-switch-2-review-a-breathtakingly-beautiful-remake/
- HUD presets, PRE-RELEASE (search snippets): https://nintendoeverything.com/?p=927345, https://www.mixvale.com.br/2026/10/19/zeltik-reveals-master-hud-mode-and-zl-targeting-options-for-zelda-on/
- TheSpike pre-release explainer, 2026-08-26 (outdated): https://www.thespike.gg/legend-of-zelda/beginner-guides/zelda-ocarina-of-time-switch-2-remake

**Latin-American and Spanish-language sources**
- LU-REV: LevelUp review (10/10), 2026-11-04: https://www.levelup.com/nintendo-switch-2/reviews/the-legend-of-zelda-ocarina-of-time/
- LU-NEWS: LevelUp, "Nintendo detalla cómo modernizó…", 2026-11-03: https://www.levelup.com/noticias/nintendo-detalla-como-modernizo-zelda-ocarina-of-time-para-switch-2-y-revela-algunos-cambios-en-la-aventura/
- NINTENDEROS-CAST: Nintenderos voice cast (Castilian and LatAm), 2026-11-05: https://www.nintenderos.com/2026/11/estos-son-los-actores-de-voz-en-castellano-y-espanol-latino-de-zelda-ocarina-of-time-remake-para-nintendo-switch-2/
- 3DJ-MX: 3DJuegos México on the LatAm dub, 2026-09-08 (PRE-RELEASE): https://www.3djuegos.com.mx/accion/juego-importante-historia-fin-tendra-doblaje-al-espanol-latino-su-nueva-version-the-legend-of-zelda-ocarina-of-time-remake
- Culturageek (AR) review, 2026-11-06: https://culturageek.com.ar/review-zelda-ocarina-of-time/
- PLAYNIUS-SK: PlayNius, 100 Skulltulas, 2026-11-06: https://playnius.com/guias-y-trucos/6598/ocarina-of-time-switch-2-skulltulas-doradas
- PLAYNIUS-COL: PlayNius collectibles guide, undated (Nov 2026): https://playnius.com/guias-y-trucos/6629/guia-ocarina-of-time-switch-2-coleccionables

**Launch-week guides**
- GG-SKULL: games.gg Gold Skulltulas (TheGamer and Game8 data), 2026-11-05: https://games.gg/the-legend-of-zelda-ocarina-of-time-2026/guides/ocarina-of-time-remake-gold-skulltula-locations-all-100-and-rewards/
- GG-DUNG: games.gg dungeons, order and changes, 2026-11-05: https://games.gg/the-legend-of-zelda-ocarina-of-time-2026/guides/ocarina-of-time-remake-dungeons-full-list-order-and-what-changed/
- GG-SONGS: games.gg songs and inputs, 2026-11-05: https://games.gg/the-legend-of-zelda-ocarina-of-time-2026/guides/ocarina-of-time-remake-songs-all-12-melodies-and-their-inputs/
- NL-HP: Nintendo Life Heart Pieces, 2026-11-05: https://www.nintendolife.com/guides/zelda-ocarina-of-time-heart-piece-locations-switch-2
- NL-WT: Nintendo Life walkthrough hub, undated: https://www.nintendolife.com/guides/zelda-ocarina-of-time-walkthrough-switch-2-remake
- NL-BIG: Nintendo Life Biggoron trade, undated: https://www.nintendolife.com/guides/zelda-ocarina-of-time-biggeron-sword-trading-sequence-switch-2
- RESPEC: Respec Pieces of Heart list, 2026-11-05: https://www.respec.net/guide/280-the-legend-zelda-ocarina-time-remake-pieces-heart-list-every-heart-piece-location-including-those-moved-for-switch-2
- NI-HP: Nintendo Insider Heart Pieces, 2026-11-05: https://www.nintendo-insider.com/zelda-ocarina-of-time-remake-heart-piece-locations-guide/
- FINALBOSS-W: FinalBoss Skulltula rewards and wallets, 2026-11-04 (partly N64-derived): https://finalboss.io/zelda-oot-switch-2-skulltula-rewards-wallet-upgrades
- FINALBOSS-GF: FinalBoss Great Fairies, undated (looks N64-derived): https://finalboss.io/zelda-oot-switch-2-great-fairy-locations-magic

Could not be fetched: Game8 (returned an empty page), Vertical Slice (429),
Eurogamer.es (403). Their claims appear here only when quoted by games.gg or
seen in search snippets. No Atomix, IGN, GameSpot, Eurogamer or Polygon remake
review text was retrieved.

---

## Implications for the guide

Rule from the coordinator: keep 3DS-based data **only where sources confirm the
remake left it unchanged**. Otherwise mark it **needs remake source** or
**unknown yet**.

| Collection | Verdict | Why |
|---|---|---|
| **chapters** (12) | **Needs rewrite on the same skeleton.** The 12-step order and child/adult/end split are confirmed unchanged and reusable. The walkthrough prose **needs a remake source**. | Same dungeons, order and bosses [GG-DUNG; NL-WT; ATD-3]. Rooms, puzzles, keys and timers changed in the Deku Tree, Jabu, Forest, Fire, Water and Ganondorf's Castle. Controls changed everywhere (jump, D-pad boots, Lenses). Area layouts changed (Kakariko, Castle Town, castle infiltration, Zora Fountain). Place names changed. Prose for Dodongo, Ice Cavern, Well, Shadow and Spirit may need only light edits, but **unknown yet**: no source confirms they are unchanged. |
| **skulltulas** (100) | **Partly reusable.** The count (100) and the 31-zone structure are confirmed. Zone counts are confirmed **except Hyrule Field (3, was 2) and Lon Lon Ranch (3, was 4)**. **Every `location` text, plus the x/y map pins (new art and layouts), needs a remake source.** | Two sources agree on per-area counts [GG-SKULL; PLAYNIUS-SK]. "Some have been moved", with no list. New maps and layouts break the pin coordinates. Zone labels need renames (Zora Domain/Fountain, Lord Jabu-Jabu's Belly, Mirage Desert, Ganondorf's Castle, Sacred Grove, Great Deku Tree). |
| **rewards** (Skulltula House table) | **Needs remake notes.** Tiers 10/30/50/100 can be kept with new values; 20 and 40 must change. | 20 tokens = Echo Gem (not the Stone of Agony). 40 = 20 Bombchus (UNVERIFIED). Wallets hold 500 and 1,000 (start at 200). 100 = Gold Rupee. |
| **hearts** (36 + 8) | **Partly reusable.** Counts are confirmed (36 + 8). About 28 entries are listed by remake guides at the same place: **keep them with a needs-verification flag**. hp-19, hp-20 and hp-29 **need a rewrite**. hp-08, hp-09, hp-11, hp-12 and hp-17 **need remake notes**. | See §3.2. Area labels need renames (Zora Fountain, Castle Town). RESPEC warns other pieces were "moved slightly or put in chests" without listing them, so those stay **unknown yet** until a full remake list exists. |
| **equipment** (22) | **Needs remake notes, plus new entries.** Swords, shields, Boomerang, Bomb Bag, Bow, Hammer, Hookshot/Longshot, Magic Beans and Zora Tunic: **reusable as is** (obtain points unchanged per GG-DUNG). | Changes needed: Lens → **Lenses of Truth** (goggles, D-pad ↑); Iron/Hover Boots → footwear (D-pad ↓); Goron Tunic (no timer); Master Sword and Hylian Shield redesigned; Mirror Shield reflects Beamos; Bottle 4 → **5**; Magic (Farore's Wind 2 MP, fairy offerings, Din's Fire location CONFLICT); Biggoron Sword naming. **Add:** Echo Gem, Business Scrub Seed, Hero's Clothes, the two ocarinas, wallet capacities. Giant's Knife: **unknown yet**. |
| **songs** (13) | **Needs remake notes.** Names, teachers, effects and warp targets are reusable as is. The **`notation` field needs a rewrite** to A/X/Y/L/R. | The same 12 songs plus the Scarecrow's Song [GG-SONGS; PLAYNIUS-COL]. Inputs remap one-to-one (● L, ▼ R, ► A, ◄ Y, ▲ X; single source, but consistent across all 12). Add humming, the Songbook and skippable cutscenes. Rename to "Minuet of the Forest". In es, *Arrullo de Zelda* replaces *Nana de Zelda*. Check the 3DS Epona notation. |
| **bosses** (10) | **Needs remake notes.** The roster is reusable as is (10, same order). **Strategies need a remake source.** | Confirmed roster [ZW-HOFF]. Gohma name and arm-guard tell confirmed [ATD-3]. Phantom Ganon, Twinrova and "new rare attacks" changes are UNVERIFIED. Chapter labels need renames. Add a Hall of Fallen Foes rematch note. |
| **sidequests** (route + unlock) | **Needs remake notes, plus a partial rewrite.** | **route (Biggoron chain):** the chain still exists and its order looks the same, but item names (Odd Poultice, Broken Goron Sword, Speciality Eye Drops, Biggoron Sword Receipt), timers and step count are UNVERIFIED or CONFLICT, so **needs remake source**. **unlock rows:** sq-poe-collector **needs a rewrite** (5 Big Poes give the bottle, 10 give a Gold Rupee). sq-magic2 and sq-defense2 **need remake notes** (Rupee offerings). sq-training becomes "Gerudo Proving Grounds", with the Ice Arrows reward kept and room details **unknown yet**. sq-mask-truth: masks usable as adult, the Mask of Truth reads thoughts, requirements **unknown yet**. sq-cucco, sq-super-cucco and sq-golden-scale are probably unchanged but **unknown yet**. sq-archery: threshold unconfirmed. **Add:** Hall of Fallen Foes, Potion Shop bottle quest, Business Scrub password, Fairy Thoughts. |
| **tips** (7) | **Needs rewrite.** | tip-combat: jump, dash, ZL options, blockable Iron Knuckles. tip-magic: Lenses drain, Farore's Wind 2 MP, 5 bottles, Business Scrub Seeds. tip-explosives: visible cracked grottos. tip-timing: no New Game+, so save before the final boss; Poe Collector change. tip-navigation: no Sheikah Stones; Threads of Time, Fairy Thoughts, map collectible status, beds change the time. tip-money: wallets 200/500/1,000, pricier shops, fairy offerings, Gold Rupees. tip-training-ground: room details **unknown yet** (and Silver Rupees are now gems). |
| **rules / i18n strings** | **Needs remake notes** | Game title (same in every language), platform, the 3DS → Switch 2 framing, and the es-MX names in §6.2. |

**Overall:** the remake keeps the original's skeleton: 12 story steps, 10 bosses,
100 Skulltulas, 36 + 8 hearts and 13 songs. Every schema and count assertion in
the guide (for example, 12 chapters and 100 Skulltulas) can stay as it is. Most
of the work is in location text, map pins, the controls and mechanics prose, the
song notation, the Skulltula House values, the few moved Heart Pieces, the
renamed places and items, and the es-MX names. Re-check this file in a week or
two: complete per-token Skulltula and Heart Piece lists (Game8, IGN wiki, Zelda
Dungeon, Zelda Wiki) and an official LatAm walkthrough should be out by then.
