import type { APIRoute } from 'astro';
import { SITE, REPO_URL } from '@/lib/site-meta';
import { GAME_ID, getGame } from '@/lib/games';
import { gameSections } from '@/lib/game-content';
import { ENGINE_SECTIONS } from '@/lib/nav';
import { useTranslations } from '@/i18n/utils';

/**
 * /llms.txt — agent-first index (llmstxt.org). Lists the sections the guide
 * actually has content for, so it never points an agent at an empty page.
 */
export const GET: APIRoute = async () => {
  const g = getGame(GAME_ID)!;
  const t = useTranslations('es');
  const has = await gameSections(GAME_ID);
  const sections = ENGINE_SECTIONS.filter((s) => s.needs === null || has.has(s.needs))
    .map((s) => `- [${t(s.key)}](${s.path})`)
    .join('\n');
  const body = `# ${SITE.name} / ${SITE.nameEn}

> ${SITE.description}

Unofficial fan work, not approved or endorsed by Nintendo.

Source: ${REPO_URL} (${SITE.license}). Agent/contributor context:
${REPO_URL}/blob/main/CLAUDE.md

## ${g.title.es} — ${g.covers.es}

${g.tagline.es}

Spanish is the default locale at the root; the English mirror lives under /en/.

## Pages

${sections}

Entity pages: /arsenal/<id>/, /arsenal/gear/<id>/, /bosses/<id>/, /enemies/<id>/, /items/<id>/, /characters/<id>/, one page per walkthrough step at /chapters/<id>/ and one per collectible type (every location, with a checklist) at /collectibles/<type>/ — for the sections the guide has. The Gold Skulltula page (/collectibles/gold-skulltula/) also has an interactive per-zone map.

Offline: /offline-images.json lists every picture the offline panel can download ahead of time; /search-index.json is the header search's index.
`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
