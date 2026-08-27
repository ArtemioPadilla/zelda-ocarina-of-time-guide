import type { APIRoute } from 'astro';
import { SITE, REPO_URL } from '@/lib/site-meta';

/**
 * /llms.txt — agent-first index (llmstxt.org). Keep this in sync as routes
 * grow; an agent reads this before crawling anything else.
 */
export const GET: APIRoute = () => {
  const body = `# ${SITE.name}

> ${SITE.description}

Source: ${REPO_URL} (${SITE.license}). Agent/contributor context:
${REPO_URL}/blob/main/CLAUDE.md

## Pages (Spanish, default — English mirror under /en/)

- [Inicio](/): consejos de oro y resumen de progreso
- [Equipo](/equipment/): espadas, escudos, túnicas y objetos clave
- [Canciones](/songs/): las 13 melodías de ocarina, notación y efecto
- [Skulltulas](/skulltulas/): checklist de las 100 Gold Skulltulas
- [Corazones](/hearts/): Piezas de Corazón y Contenedores, con checklist
- [Mazmorras](/chapters/): walkthrough mazmorra a mazmorra (Niño, Adulto, Castillo de Ganon)
- [Jefes](/bosses/): referencia rápida de jefes
- [Consejos](/tips/): combate, magia, objetos perdibles y navegación
- [Secundarias](/sidequests/): secuencia de intercambio y otras recompensas
`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
