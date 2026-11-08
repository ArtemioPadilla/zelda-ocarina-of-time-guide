/**
 * remark plugin: links entity names in the chapter Markdown (see
 * game-entity-links.ts). Every mention, never inside a heading, an existing
 * link or code. The game and locale come from the file path
 * (`src/content/games/<game>/<locale>/chapters/…`).
 */
import type { Root, RootContent, Text, Link, PhrasingContent, Parent } from 'mdast';
import { linkify, type Dictionary, type Locale } from './entity-links';
import { buildGameDictionary } from './game-entity-links';

interface Options {
  base: string;
  contentDir: string;
}

const cache = new Map<string, Dictionary>();

function dictionaryFor(locale: Locale, opts: Options, game: string): Dictionary {
  const k = `${game}|${locale}|${opts.base}`;
  let d = cache.get(k);
  if (!d) {
    d = buildGameDictionary(game, locale, opts);
    cache.set(k, d);
  }
  return d;
}

function walk(node: Parent, dict: Dictionary): void {
  const children = node.children as RootContent[];
  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    if (child.type === 'heading' || child.type === 'link' || child.type === 'linkReference')
      continue;
    if (child.type === 'inlineCode' || child.type === 'code' || child.type === 'html') continue;
    if (child.type === 'text') {
      const segments = linkify(child.value, dict);
      if (segments.length === 1 && !segments[0].href) continue;
      const replacement: PhrasingContent[] = segments.map((s) =>
        s.href
          ? ({
              type: 'link',
              url: s.href,
              data: { hProperties: { className: ['ent-link'] } },
              children: [{ type: 'text', value: s.text } as Text],
            } as Link)
          : ({ type: 'text', value: s.text } as Text),
      );
      children.splice(i, 1, ...replacement);
      i += replacement.length - 1;
      continue;
    }
    if ('children' in child) walk(child as Parent, dict);
  }
}

export default function remarkEntityLinks(opts: Options) {
  return (tree: Root, file: { path?: string; history?: string[] }) => {
    const path = file.path ?? file.history?.[0] ?? '';
    // content/games/<game>/<locale>/chapters/….
    const engine = /[\\/]content[\\/]games[\\/]([a-z0-9]+)[\\/](es|en)[\\/]/.exec(path);
    if (!engine) return;
    const dict = dictionaryFor(engine[2] as Locale, opts, engine[1]);
    for (const block of tree.children) {
      if (block.type === 'heading') continue;
      if ('children' in block) walk(block as Parent, dict);
    }
  };
}
