#!/usr/bin/env node
/**
 * Fetches the guide's images (public/img/games/<game>/<collection>/<id>.webp)
 * from Zelda Wiki (zeldawiki.wiki, MediaWiki API) and regenerates src/data/game-images.json
 * (dimensions + source per image) and public/img/games/SOURCES.md.
 *
 * Usage:
 *   node scripts/import-game-images.mjs [--game oot] [--only weapons,bosses] [--root DIR] [--contact DIR] [--force]
 *
 * Manifests live in scripts/wiki-images/<game>.json (or several <game>-<part>.json, e.g.
 * oot-bosses.json): an array of
 *   { collection, id, file, crop?: {left,top,width,height} | {x,y,w,h} as fractions, caption? }
 * where `file` is the wiki file name without the "File:" prefix. Adding an
 * image is: add a row, run the script, commit the .webp, the JSON and SOURCES.md.
 *
 * Every image is Nintendo's game imagery, used non-commercially in an
 * unofficial fan guide, with the unofficial-fan-work notice shown on every
 * page. A takedown is honoured by deleting the file and its
 * manifest row: pages fall back to text.
 *
 * --contact DIR writes labelled contact sheets (30 tiles each) of what was
 * fetched, for a visual check that every image is the right entity.
 */
import { mkdir, readFile, writeFile, readdir, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const REPO = join(dirname(fileURLToPath(import.meta.url)), '..');
const API = 'https://zeldawiki.wiki/w/api.php';
const UA =
  'oot-guide image importer (https://github.com/ArtemioPadilla/zelda-ocarina-of-time-guide)';

const args = process.argv.slice(2);
const opt = (name) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : undefined;
};
const ROOT = opt('root') ?? REPO;
const GAMES = (opt('game') ?? 'oot').split(',');
const ONLY = opt('only')?.split(',');
const CONTACT = opt('contact');
const FORCE = args.includes('--force');

// Output geometry per collection.
const SIZE = {
  thumb: { width: 320, height: 320, fit: 'inside' },
  chapters: { width: 600, height: 375, fit: 'cover' },
  cover: { width: 640, height: 360, fit: 'cover' },
  maps: { width: 1600, height: 1600, fit: 'inside' },
};
const sizeFor = (c) => SIZE[c] ?? SIZE.thumb;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function api(params) {
  const url = `${API}?${new URLSearchParams({ format: 'json', ...params })}`;
  for (let i = 0; i < 4; i++) {
    const res = await fetch(url, { headers: { 'User-Agent': UA } });
    if (res.ok) return res.json();
    await sleep(1000 * 2 ** i);
  }
  throw new Error(`API failed: ${url}`);
}

/** File name → { url, descriptionurl, width, height } in batches of 50. */
async function resolveFiles(names) {
  const out = new Map();
  for (let i = 0; i < names.length; i += 50) {
    const batch = names.slice(i, i + 50);
    const d = await api({
      action: 'query',
      prop: 'imageinfo',
      iiprop: 'url|size',
      titles: batch.map((n) => `File:${n}`).join('|'),
    });
    const norm = new Map((d.query.normalized ?? []).map((x) => [x.to, x.from]));
    for (const p of Object.values(d.query.pages)) {
      const info = p.imageinfo?.[0];
      const asked = (norm.get(p.title) ?? p.title).replace(/^File:/, '');
      if (info) out.set(asked, info);
      else out.set(asked, null);
    }
    await sleep(300);
  }
  return out;
}

async function download(url) {
  for (let i = 0; i < 4; i++) {
    const res = await fetch(url, { headers: { 'User-Agent': UA } });
    if (res.ok) return Buffer.from(await res.arrayBuffer());
    await sleep(1000 * 2 ** i);
  }
  throw new Error(`download failed: ${url}`);
}

async function render(buf, entry) {
  let img = sharp(buf, { animated: false }).rotate();
  const meta = await img.metadata();
  if (entry.crop) {
    const c = entry.crop;
    const box =
      'x' in c
        ? {
            left: Math.round(c.x * meta.width),
            top: Math.round(c.y * meta.height),
            width: Math.round(c.w * meta.width),
            height: Math.round(c.h * meta.height),
          }
        : c;
    img = img.extract(box);
  }
  const s = sizeFor(entry.collection);
  if (s === SIZE.thumb) {
    // Renders often sit in a wide transparent or flat margin: trim it when possible.
    const base = await img.png().toBuffer();
    img = await sharp(base)
      .trim({ threshold: 10 })
      .png()
      .toBuffer()
      .then((b) => sharp(b))
      .catch(() => sharp(base));
  }
  const out = await img
    .resize({
      width: s.width,
      height: s.height,
      fit: s.fit,
      withoutEnlargement: s.fit === 'inside',
    })
    .webp({ quality: entry.collection === 'maps' ? 82 : 78 })
    .toBuffer({ resolveWithObject: true });
  return out;
}

const manifestPath = join(ROOT, 'src/data/game-images.json');
const index = existsSync(manifestPath) ? JSON.parse(await readFile(manifestPath, 'utf8')) : {};
const failures = [];
const fetched = [];

for (const game of GAMES) {
  const dir = join(REPO, 'scripts/wiki-images');
  if (!existsSync(dir)) continue;
  const files = (await readdir(dir)).filter(
    (f) => f === `${game}.json` || f.startsWith(`${game}-`),
  );
  let entries = [];
  for (const f of files) entries.push(...JSON.parse(await readFile(join(dir, f), 'utf8')));
  if (!entries.length) continue;
  if (ONLY) entries = entries.filter((e) => ONLY.includes(e.collection));
  const infos = await resolveFiles([...new Set(entries.map((e) => e.file))]);
  for (const e of entries) {
    const key = `${game}/${e.collection}/${e.id}`;
    const rel = `img/games/${game}/${e.collection}/${e.id}.webp`;
    const dest = join(ROOT, 'public', rel);
    const info = infos.get(e.file);
    if (!info) {
      failures.push(`${key}: wiki file not found: ${e.file}`);
      continue;
    }
    if (!FORCE && existsSync(dest) && index[key]?.file === e.file) {
      fetched.push({ key, dest, label: e.id });
      continue;
    }
    try {
      const buf = await download(info.url);
      const { data, info: out } = await render(buf, e);
      await mkdir(dirname(dest), { recursive: true });
      await writeFile(dest, data);
      index[key] = {
        w: out.width,
        h: out.height,
        file: e.file,
        source: info.descriptionurl,
        ...(e.caption ? { caption: e.caption } : {}),
      };
      fetched.push({ key, dest, label: e.id });
      process.stdout.write('.');
      await sleep(150);
    } catch (err) {
      failures.push(`${key}: ${err.message}`);
    }
  }
}

// Drop index rows whose file is gone (takedowns, renamed ids).
for (const key of Object.keys(index)) {
  if (!existsSync(join(ROOT, 'public/img/games', `${key}.webp`))) delete index[key];
}
const sorted = Object.fromEntries(Object.entries(index).sort(([a], [b]) => a.localeCompare(b)));
await mkdir(dirname(manifestPath), { recursive: true });
await writeFile(manifestPath, JSON.stringify(sorted, null, 1) + '\n');

// Provenance.
const rows = Object.entries(sorted).map(([k, v]) => `| \`${k}.webp\` | [${v.file}](${v.source}) |`);
await mkdir(join(ROOT, 'public/img/games'), { recursive: true });
await writeFile(
  join(ROOT, 'public/img/games/SOURCES.md'),
  `# Zelda: Ocarina of Time images — sources

Generated by \`scripts/import-game-images.mjs\` from \`scripts/wiki-images/<game>.json\`.
Do not edit by hand.

Every file here is **Nintendo's game imagery** used non-commercially in an
unofficial fan guide: the site is free, carries no ads or paywall, and shows on
every page the notice _"Unofficial fan work, not approved or endorsed by
Nintendo."_ (_«Obra de fans no oficial, no aprobada ni respaldada por
Nintendo.»_). The Legend of Zelda and its imagery are trademarks and property
of Nintendo. Attribution is not a license: to honour a takedown, delete the
file and its manifest row; the page falls back to text.

The Gold Skulltula map photos (\`public/images/skulltulas/\`) are listed with
their Zelda Wiki source in \`src/lib/skulltula-map-layout.ts\` and credited under
each map.

| File | Wiki source |
| ---- | ----------- |
${rows.join('\n')}
`,
);

// Contact sheets for the visual check.
if (CONTACT) {
  await mkdir(CONTACT, { recursive: true });
  const tile = 160;
  const cols = 6;
  const per = 30;
  const esc = (s) =>
    s.replace(/[<>&"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' })[c]);
  const groups = {};
  for (const f of fetched) {
    const [game, col] = f.key.split('/');
    (groups[`${game}-${col}`] ??= []).push(f);
  }
  for (const [name, list] of Object.entries(groups)) {
    for (let p = 0; p * per < list.length; p++) {
      const page = list.slice(p * per, (p + 1) * per);
      const rowsN = Math.ceil(page.length / cols);
      const layers = [];
      for (let i = 0; i < page.length; i++) {
        const x = (i % cols) * tile;
        const y = Math.floor(i / cols) * (tile + 28);
        const img = await sharp(page[i].dest)
          .resize({ width: tile, height: tile, fit: 'contain', background: '#222' })
          .toBuffer();
        layers.push({ input: img, left: x, top: y });
        const svg = `<svg width="${tile}" height="28"><rect width="100%" height="100%" fill="#000"/><text x="4" y="18" font-size="12" font-family="sans-serif" fill="#fff">${esc(page[i].label.slice(0, 24))}</text></svg>`;
        layers.push({ input: Buffer.from(svg), left: x, top: y + tile });
      }
      await sharp({
        create: {
          width: cols * tile,
          height: rowsN * (tile + 28),
          channels: 3,
          background: '#111',
        },
      })
        .composite(layers)
        .png()
        .toFile(join(CONTACT, `${name}-${p + 1}.png`));
    }
  }
}

console.log(`\n${fetched.length} images ok, ${failures.length} failed`);
for (const f of failures) console.log('  ✗', f);
