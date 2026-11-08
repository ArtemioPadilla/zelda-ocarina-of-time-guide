/**
 * ⚠️ SINGLE SOURCE of this site's machine-readable identity (llms.txt,
 * JSON-LD, default meta description, the feedback widget's repo).
 */
export const SITE = {
  name: 'Guía Zelda: Ocarina of Time',
  nameEn: 'Zelda: Ocarina of Time Guide',
  description:
    'Guía de The Legend of Zelda: Ocarina of Time para Nintendo Switch 2 (2026): recorrido por mazmorras, las 100 Skulltulas doradas, Piezas de Corazón, canciones, objetos y jefes. Funciona sin internet. Obra de fans no oficial, no aprobada ni respaldada por Nintendo.',
  repoSlug:
    (import.meta.env.PUBLIC_REPO_SLUG as string | undefined) ??
    'ArtemioPadilla/zelda-ocarina-of-time-guide',
  license: 'MIT',
} as const;

export const REPO_URL = `https://github.com/${SITE.repoSlug}`;
