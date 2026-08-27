/**
 * ⚠️ SINGLE SOURCE of this site's machine-readable identity (llms.txt,
 * JSON-LD, default meta description).
 */
export const SITE = {
  name: 'OoT Guía',
  description:
    'Guía y tracker offline de The Legend of Zelda: Ocarina of Time (versión 3DS): mazmorras, las 100 Gold Skulltulas, Piezas de Corazón, canciones de ocarina, equipo, jefes y secuencia de intercambios.',
  repoSlug: (import.meta.env.PUBLIC_REPO_SLUG as string | undefined) ?? 'ArtemioPadilla/zelda-ocarina-of-time-guide',
  license: 'MIT',
} as const;

export const REPO_URL = `https://github.com/${SITE.repoSlug}`;
