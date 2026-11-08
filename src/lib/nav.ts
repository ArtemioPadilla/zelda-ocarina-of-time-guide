import type { UiKey } from '@/i18n/ui';
import type { SectionNeed } from '@/lib/game-content';

/**
 * Section list for the header nav and the mobile tab bar. Paths are
 * root-relative (`/arsenal/`); the layout adds the locale and deploy base.
 */
/** A resolved link in the header nav. */
export interface NavLink {
  href: string;
  label: string;
  active: boolean;
}

export interface Section {
  path: string;
  key: UiKey;
}

/** Card sections shown on the Guide page and on the Extras page. */
export const GUIDE_CARD_SECTIONS = ['faq', 'survival', 'mechanics'] as const;
export const EXTRAS_CARD_SECTIONS = ['modes', 'dlc', 'unlocks', 'endings', 'secrets'] as const;

/**
 * The guide's sections. A section is linked only when the game has rows
 * for it (`needs`), so a half-written guide never links to an empty page.
 */
export interface EngineSection extends Section {
  needs: SectionNeed | null;
}

export const ENGINE_SECTIONS: EngineSection[] = [
  { path: '/', key: 'nav.home', needs: null },
  { path: '/chapters/', key: 'nav.chapters', needs: 'chapters' },
  { path: '/collectibles/', key: 'nav.collectibles', needs: 'collectibles' },
  { path: '/maps/', key: 'nav.maps', needs: 'maps' },
  { path: '/arsenal/', key: 'nav.arsenal', needs: 'weapons' },
  { path: '/bosses/', key: 'nav.bosses', needs: 'bosses' },
  { path: '/enemies/', key: 'nav.enemies', needs: 'enemies' },
  { path: '/items/', key: 'nav.items', needs: 'items' },
  { path: '/files/', key: 'nav.files', needs: 'files' },
  { path: '/achievements/', key: 'nav.achievements', needs: 'achievements' },
  { path: '/guide/', key: 'nav.guide', needs: 'guide' },
  { path: '/extras/', key: 'nav.extras', needs: 'extras' },
  { path: '/characters/', key: 'nav.characters', needs: 'characters' },
];
