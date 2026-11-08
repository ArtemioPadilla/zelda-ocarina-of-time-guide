import { useEffect, useRef, useState } from 'react';
import { currentChapterStore } from '@/stores/checklist';
import { useHydratedStore } from '@/lib/use-hydrated-store';

export type TabIcon =
  'home' | 'chapter' | 'map' | 'treasures' | 'enemies' | 'more' | 'games' | 'arsenal';

export interface TabMenuItem {
  href: string;
  label: string;
}

export interface Tab {
  href: string;
  label: string;
  icon: TabIcon;
  active: boolean;
  /** When set, the tab opens a sheet with these links instead of navigating. */
  menu?: TabMenuItem[];
}

interface Props {
  tabs: Tab[];
  /** Localised `/chapters/` prefix (base included) — the chapter tab jumps
   * straight to the current chapter once one is set, else to the index. */
  chaptersHref: string;
  ariaLabel: string;
  /** Accessible name of the "more" sheet, e.g. "More sections". */
  moreLabel?: string;
  /** Whose current chapter the chapter tab jumps to. */
  game: string;
}

const ICONS: Record<TabIcon, string> = {
  home: 'M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z',
  chapter: 'M5 4h10l4 4v12H5z M8 12h8 M8 16h5',
  map: 'M9 4l6 2 6-2v14l-6 2-6-2-6 2V6z M9 4v14 M15 6v14',
  treasures: 'M4 9h16v10H4z M4 9l3-4h10l3 4 M10 13h4',
  enemies: 'M12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16z M9 10h.01 M15 10h.01 M9 15c1.5 1 4.5 1 6 0',
  more: 'M5 12h.01 M12 12h.01 M19 12h.01',
  games: 'M4 4h7v7H4z M13 4h7v7h-7z M4 13h7v7H4z M13 13h7v7h-7z',
  arsenal: 'M3 14h11l3-3h4v4h-4l-1 1v3h-3v-2H3z M7 14v-3h4',
};

/**
 * Mobile-only bottom tab bar (hidden ≥ md by BaseLayout): the four places
 * you tap while playing with the phone next to the game, plus a "more" tab
 * that opens a sheet with every other section — the top nav scrolls
 * sideways on a phone and hides sections past the edge. Plain
 * <a>s — every route is a full navigation; only the sheet is client state.
 */
export default function BottomTabBar({ tabs, chaptersHref, ariaLabel, moreLabel, game }: Props) {
  const current = useHydratedStore(currentChapterStore(game).$current, null);
  const [open, setOpen] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    const onClick = (e: MouseEvent) => {
      if (sheetRef.current && !sheetRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('click', onClick);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('click', onClick);
    };
  }, [open]);

  const tabClass = (active: boolean) =>
    `relative flex flex-col items-center justify-center gap-0.5 font-mono text-[10px] transition-colors ${
      active ? 'text-primary' : 'text-muted-foreground hover:text-primary'
    }`;
  const icon = (name: TabIcon) => (
    <svg
      viewBox="0 0 24 24"
      className="h-[22px] w-[22px]"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={ICONS[name]} />
    </svg>
  );
  const menuTab = tabs.find((t) => t.menu);

  return (
    <div ref={sheetRef} className="relative">
      {menuTab?.menu && open ? (
        <div
          id="bottom-tab-more"
          role="dialog"
          aria-label={moreLabel ?? menuTab.label}
          className="absolute inset-x-2 bottom-full mb-2 grid grid-cols-2 gap-1.5 rounded-lg border border-border bg-card p-2 shadow-lg"
        >
          {menuTab.menu.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="rounded-md border border-border/70 px-3 py-2.5 text-center font-mono text-xs text-foreground hover:border-primary/60 hover:text-primary"
            >
              {item.label}
            </a>
          ))}
        </div>
      ) : null}
      <nav
        aria-label={ariaLabel}
        className="grid h-[60px] border-t border-border bg-card/95 backdrop-blur-md"
        style={{ gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))` }}
      >
        {tabs.map((tab) => {
          if (tab.menu) {
            return (
              <button
                key={tab.href}
                type="button"
                aria-expanded={open}
                aria-controls="bottom-tab-more"
                aria-current={tab.active ? 'page' : undefined}
                onClick={() => setOpen((v) => !v)}
                className={tabClass(tab.active || open)}
              >
                {tab.active ? (
                  <span
                    aria-hidden="true"
                    className="absolute top-0 h-0.5 w-9 rounded-b bg-primary"
                  />
                ) : null}
                {icon(tab.icon)}
                {tab.label}
              </button>
            );
          }
          const href = tab.icon === 'chapter' && current ? `${chaptersHref}${current}/` : tab.href;
          return (
            <a
              key={tab.href}
              href={href}
              aria-current={tab.active ? 'page' : undefined}
              className={tabClass(tab.active)}
            >
              {tab.active ? (
                <span
                  aria-hidden="true"
                  className="absolute top-0 h-0.5 w-9 rounded-b bg-primary"
                />
              ) : null}
              {icon(tab.icon)}
              {tab.label}
            </a>
          );
        })}
      </nav>
    </div>
  );
}
