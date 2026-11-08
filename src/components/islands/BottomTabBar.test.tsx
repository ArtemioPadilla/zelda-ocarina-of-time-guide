// @vitest-environment jsdom
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

const memory = new Map<string, unknown>();
vi.mock('idb-keyval', () => ({
  get: vi.fn((key: string) => Promise.resolve(memory.get(key))),
  set: vi.fn((key: string, value: unknown) => {
    memory.set(key, value);
    return Promise.resolve();
  }),
  del: vi.fn(() => Promise.resolve()),
}));

const tabs = [
  { href: '/', label: 'Home', icon: 'home' as const, active: false },
  { href: '/chapters/', label: 'Chapter', icon: 'chapter' as const, active: true },
  { href: '/collectibles/', label: 'Collectibles', icon: 'treasures' as const, active: false },
  { href: '/arsenal/', label: 'Arsenal', icon: 'arsenal' as const, active: false },
  {
    href: '/enemies/',
    label: 'More',
    icon: 'more' as const,
    active: false,
    menu: [
      { href: '/files/', label: 'Shards' },
      { href: '/enemies/', label: 'Enemies' },
    ],
  },
];

describe('BottomTabBar', () => {
  beforeEach(() => {
    memory.clear();
    vi.resetModules();
  });

  it('marks the active tab with aria-current and links the chapter tab to the index when none is set', async () => {
    const { default: BottomTabBar } = await import('./BottomTabBar');
    render(
      <BottomTabBar tabs={tabs} game="oot" chaptersHref="/chapters/" ariaLabel="Quick access" />,
    );
    expect(screen.getByRole('navigation', { name: 'Quick access' })).toBeInTheDocument();
    const chapter = screen.getByRole('link', { name: 'Chapter' });
    expect(chapter).toHaveAttribute('aria-current', 'page');
    expect(chapter).toHaveAttribute('href', '/chapters/');
    expect(screen.getByRole('link', { name: 'Home' })).not.toHaveAttribute('aria-current');
  });

  it('the chapter tab jumps straight to the current chapter once one is set', async () => {
    const { currentChapterStore } = await import('@/stores/checklist');
    currentChapterStore('oot').set('the-rescue');
    const { default: BottomTabBar } = await import('./BottomTabBar');
    render(
      <BottomTabBar tabs={tabs} game="oot" chaptersHref="/chapters/" ariaLabel="Quick access" />,
    );
    expect(screen.getByRole('link', { name: 'Chapter' })).toHaveAttribute(
      'href',
      '/chapters/the-rescue/',
    );
  });

  it('the "more" tab opens a sheet with the remaining sections and closes on Escape', async () => {
    const { default: userEvent } = await import('@testing-library/user-event');
    const user = userEvent.setup();
    const { default: BottomTabBar } = await import('./BottomTabBar');
    render(
      <BottomTabBar
        tabs={tabs}
        game="oot"
        chaptersHref="/chapters/"
        ariaLabel="Quick access"
        moreLabel="More sections"
      />,
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'More' }));
    const sheet = screen.getByRole('dialog', { name: 'More sections' });
    expect(sheet).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Shards' })).toHaveAttribute('href', '/files/');
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
