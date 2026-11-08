/**
 * Share cards (Open Graph images): after the build, draw one 1200×630 JPEG
 * per page into dist/og/<key>.jpg, the path BaseLayout puts in og:image.
 *
 * Each Spanish page says what to draw in its own <head>: the title, the meta
 * description, `x-og-key` (the file name, shared with the English page),
 * `x-og-kicker` (the section) and, on entity pages, `x-og-art` (its
 * picture). Text is laid out by satori with the site's fonts and rasterised
 * by sharp, so the build needs no browser. The cards are not precached by the
 * service worker (globIgnores `og/**`): only link previews fetch them.
 */
import type { AstroIntegration } from 'astro';
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import satori from 'satori';
import sharp from 'sharp';

const W = 1200;
const H = 630;
// OoT palette (src/styles/global.css, dark skin): Temple-of-Time teal
// canvas, Triforce gold, Kokiri emerald, Zora sapphire.
const BG = '#0d2b22';
const GOLD = '#e8b93a';
const EMERALD = '#5fd08a';
const SAPPHIRE = '#5cb6e8';
const TEXT = '#ecefe0';
const MUTED = '#9db5a6';

type Node = { type: string; props: Record<string, unknown> };
const el = (type: string, style: Record<string, unknown>, children?: unknown): Node => ({
  type,
  props: { style, children },
});

const font = (pkg: string, file: string) =>
  readFile(join(process.cwd(), 'node_modules', pkg, 'files', file));

const decode = (s: string) =>
  s
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');

const meta = (html: string, name: string) => {
  const m = html.match(new RegExp(`<meta (?:name|property)="${name}" content="([^"]*)"`));
  return m ? decode(m[1]) : undefined;
};

const clip = (s: string, n: number) => (s.length > n ? `${s.slice(0, n - 1).trimEnd()}…` : s);

async function htmlFiles(dir: string): Promise<string[]> {
  const out: string[] = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) {
      // One card per page: the English pages share the Spanish one's.
      if (e.name === 'en' || e.name === 'og' || e.name === '_astro' || e.name === 'img') continue;
      out.push(...(await htmlFiles(p)));
    } else if (e.name === 'index.html') out.push(p);
  }
  return out;
}

function card(o: {
  site: string;
  kicker: string;
  title: string;
  text: string;
  url: string;
  art?: string;
}): Node {
  const long = o.title.length > 38;
  const textCol = el(
    'div',
    { display: 'flex', flexDirection: 'column', flex: 1, paddingRight: o.art ? 40 : 0 },
    [
      el(
        'div',
        { display: 'flex', fontFamily: 'Mono', fontSize: 26, color: GOLD, letterSpacing: 2 },
        o.site.toUpperCase(),
      ),
      el(
        'div',
        { display: 'flex', marginTop: 28, fontFamily: 'Mono', fontSize: 24, color: EMERALD },
        o.kicker.toUpperCase(),
      ),
      el(
        'div',
        {
          display: 'flex',
          marginTop: 10,
          fontFamily: 'Fraunces',
          fontWeight: 700,
          fontSize: long ? 58 : 74,
          lineHeight: 1.05,
          color: TEXT,
        },
        clip(o.title, 90),
      ),
      el(
        'div',
        {
          display: 'flex',
          marginTop: 22,
          fontFamily: 'Literata',
          fontWeight: 400,
          fontSize: 28,
          lineHeight: 1.25,
          color: MUTED,
        },
        clip(o.text, o.art ? 150 : 210),
      ),
    ],
  );
  const artCol = o.art
    ? el(
        'div',
        {
          display: 'flex',
          width: 400,
          height: 400,
          alignItems: 'center',
          justifyContent: 'center',
          border: `2px solid ${GOLD}`,
          borderRadius: 16,
          backgroundColor: '#123a2e',
        },
        { type: 'img', props: { src: o.art, style: { maxWidth: 380, maxHeight: 380 } } },
      )
    : null;
  return el(
    'div',
    {
      display: 'flex',
      flexDirection: 'column',
      width: W,
      height: H,
      backgroundColor: BG,
      padding: '56px 64px 40px 72px',
      borderLeft: `14px solid ${GOLD}`,
      backgroundImage: `radial-gradient(circle at 85% 0%, ${SAPPHIRE}33, transparent 55%)`,
    },
    [
      el(
        'div',
        { display: 'flex', flex: 1, alignItems: 'center' },
        artCol ? [textCol, artCol] : [textCol],
      ),
      el(
        'div',
        {
          display: 'flex',
          flexDirection: 'column',
          fontFamily: 'Mono',
          fontSize: 18,
          lineHeight: 1.4,
          color: MUTED,
          borderTop: `2px solid #24503f`,
          paddingTop: 14,
        },
        [
          el('div', { display: 'flex' }, o.url),
          el(
            'div',
            { display: 'flex' },
            'Obra de fans no oficial, no aprobada ni respaldada por Nintendo.',
          ),
        ],
      ),
    ],
  );
}

export default function ogImages(): AstroIntegration {
  let base = '';
  return {
    name: 'og-images',
    hooks: {
      'astro:config:done': ({ config }) => {
        base = config.base.replace(/\/$/, '');
      },
      'astro:build:done': async ({ dir, logger }) => {
        const root = fileURLToPath(dir);
        const fonts = [
          // Satori reads .woff/.ttf, not woff2: the static @fontsource
          // packages (devDependencies) ship .woff; the site itself uses the
          // variable woff2 builds.
          {
            name: 'Fraunces',
            data: await font('@fontsource/fraunces', 'fraunces-latin-700-normal.woff'),
            weight: 700 as const,
          },
          {
            name: 'Literata',
            data: await font('@fontsource/literata', 'literata-latin-400-normal.woff'),
            weight: 400 as const,
          },
          {
            name: 'Mono',
            data: await font('@fontsource/jetbrains-mono', 'jetbrains-mono-latin-500-normal.woff'),
            weight: 400 as const,
          },
        ];
        const files = await htmlFiles(root);
        let made = 0;
        const queue = [...files];
        const work = async () => {
          for (let f = queue.shift(); f; f = queue.shift()) {
            const html = await readFile(f, 'utf8');
            const key = meta(html, 'x-og-key');
            if (!key) continue;
            const site = meta(html, 'og:site_name') ?? '';
            const rawTitle = decode(html.match(/<title>([^<]*)<\/title>/)?.[1] ?? site);
            const title = rawTitle.replace(new RegExp(`\\s·\\s${site}$`), '') || site;
            const artPath = meta(html, 'x-og-art');
            let art: string | undefined;
            if (artPath) {
              const file = join(root, artPath.slice(base.length).replace(/^\//, ''));
              try {
                const png = await sharp(file).resize(380, 380, { fit: 'inside' }).png().toBuffer();
                art = `data:image/png;base64,${png.toString('base64')}`;
              } catch {
                art = undefined;
              }
            }
            const svg = await satori(
              card({
                site,
                kicker: meta(html, 'x-og-kicker') ?? site,
                title,
                text: meta(html, 'description') ?? '',
                url: `artemiop.com${base}`,
                art,
              }) as never,
              { width: W, height: H, fonts },
            );
            const out = join(root, 'og', `${key}.jpg`);
            await mkdir(dirname(out), { recursive: true });
            await writeFile(out, await sharp(Buffer.from(svg)).jpeg({ quality: 80 }).toBuffer());
            made++;
          }
        };
        await Promise.all(Array.from({ length: 6 }, work));
        logger.info(`${made} share cards written to og/`);
      },
    },
  };
}
