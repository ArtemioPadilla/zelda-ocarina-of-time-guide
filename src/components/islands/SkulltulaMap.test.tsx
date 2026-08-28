// @vitest-environment jsdom
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const memory = new Map<string, unknown>();

vi.mock('idb-keyval', () => ({
  get: vi.fn((key: string) => Promise.resolve(memory.get(key))),
  set: vi.fn((key: string, value: unknown) => {
    memory.set(key, value);
    return Promise.resolve();
  }),
  del: vi.fn((key: string) => {
    memory.delete(key);
    return Promise.resolve();
  }),
}));

const items = [
  { id: 'sk-01', number: 1, zoneKey: 'Kokiri Forest', location: 'Above the shop door', x: 60, y: 70 },
  { id: 'sk-02', number: 2, zoneKey: 'Lost Woods', location: 'Behind a hollow log', note: 'night only', x: 30, y: 60 },
];

describe('SkulltulaMap', () => {
  beforeEach(() => {
    memory.clear();
    vi.resetModules();
  });

  it('renders one pin button per item, positioned at its x/y%', async () => {
    const { default: SkulltulaMap } = await import('./SkulltulaMap');
    render(<SkulltulaMap zoneKey="Kokiri Forest" items={items} doneLabel="collected" pendingLabel="not collected" />);

    const pin = screen.getByRole('button', { name: /Above the shop door/ });
    expect(pin).toHaveStyle({ left: '60%', top: '70%' });
  });

  it('gives each pin an aria-label combining the location text and checked state', async () => {
    const { default: SkulltulaMap } = await import('./SkulltulaMap');
    render(<SkulltulaMap zoneKey="Kokiri Forest" items={items} doneLabel="collected" pendingLabel="not collected" />);

    expect(screen.getByRole('button', { name: '#1 Above the shop door — not collected' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '#2 Behind a hollow log night only — not collected' })).toBeInTheDocument();
  });

  it('clicking a pin toggles the shared skulltulasStore — the same store the list checkboxes use', async () => {
    const user = userEvent.setup();
    const { skulltulasStore } = await import('@/stores/checklist');
    const { default: SkulltulaMap } = await import('./SkulltulaMap');
    render(<SkulltulaMap zoneKey="Kokiri Forest" items={items} doneLabel="collected" pendingLabel="not collected" />);

    expect(skulltulasStore.$checked.get().has('sk-01')).toBe(false);

    const pin = screen.getByRole('button', { name: /Above the shop door/ });
    await user.click(pin);

    // Store updated directly (no duplicate/local state)...
    expect(skulltulasStore.$checked.get().has('sk-01')).toBe(true);
    // ...and the pin re-renders to reflect it: pressed state + updated label.
    expect(pin).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: '#1 Above the shop door — collected' })).toBeInTheDocument();

    await user.click(pin);
    expect(skulltulasStore.$checked.get().has('sk-01')).toBe(false);
  });

  it('uses a real sourced image as the base layer when the zone has one, with an attribution link', async () => {
    const { default: SkulltulaMap } = await import('./SkulltulaMap');
    render(<SkulltulaMap zoneKey="Kokiri Forest" items={items} doneLabel="collected" pendingLabel="not collected" />);

    const image = screen.getByRole('img', { name: 'Kokiri Forest' });
    expect(image).toHaveAttribute('src', '/images/skulltulas/kokiri-forest.webp');
    expect(screen.getByRole('link')).toHaveAttribute('href', expect.stringContaining('zeldawiki.wiki'));
  });

  it('falls back to the schematic single-region fill for a zone with no sourced image', async () => {
    const { default: SkulltulaMap } = await import('./SkulltulaMap');
    // Every real zoneKey now has either `image` or `floors` (100/100 pins on
    // real imagery) — use a zoneKey absent from ZONE_MAP_BY_KEY to exercise
    // the schematic fallback path itself, decoupled from which real zones
    // currently have a sourced photo.
    render(<SkulltulaMap zoneKey="Nonexistent Zone" items={items} doneLabel="collected" pendingLabel="not collected" />);

    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  describe('floored dungeon zones', () => {
    const floorItems = [
      { id: 'sk-001', number: 1, zoneKey: 'Inside the Deku Tree', location: '3F Compass Room', x: 30, y: 42, floor: '3f' },
      { id: 'sk-002', number: 2, zoneKey: 'Inside the Deku Tree', location: 'Web vines to B1', x: 45, y: 80, floor: 'b1' },
      { id: 'sk-003', number: 3, zoneKey: 'Inside the Deku Tree', location: 'Iron bars at cobweb base', x: 24, y: 48, floor: 'b1' },
    ];

    it('renders a floor tab per configured floor and defaults to the first one', async () => {
      const { default: SkulltulaMap } = await import('./SkulltulaMap');
      render(
        <SkulltulaMap zoneKey="Inside the Deku Tree" items={floorItems} doneLabel="collected" pendingLabel="not collected" />,
      );

      const tabs = screen.getAllByRole('tab');
      expect(tabs.map((t) => t.textContent)).toEqual(['3F', 'B1']);
      expect(tabs[0]).toHaveAttribute('aria-selected', 'true');
    });

    it('only shows pins belonging to the selected floor, and switches on tab click', async () => {
      const user = userEvent.setup();
      const { default: SkulltulaMap } = await import('./SkulltulaMap');
      render(
        <SkulltulaMap zoneKey="Inside the Deku Tree" items={floorItems} doneLabel="collected" pendingLabel="not collected" />,
      );

      // Defaults to 3F: only sk-001's pin visible.
      expect(screen.getByRole('button', { name: /3F Compass Room/ })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /Web vines to B1/ })).not.toBeInTheDocument();

      await user.click(screen.getByRole('tab', { name: 'B1' }));

      // Switched to B1: sk-002/sk-003 visible, sk-001 (3F) hidden.
      expect(screen.queryByRole('button', { name: /3F Compass Room/ })).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Web vines to B1/ })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Iron bars at cobweb base/ })).toBeInTheDocument();
    });

    it('shows a real per-floor image and updates its attribution when switching floors', async () => {
      const user = userEvent.setup();
      const { default: SkulltulaMap } = await import('./SkulltulaMap');
      render(
        <SkulltulaMap zoneKey="Inside the Deku Tree" items={floorItems} doneLabel="collected" pendingLabel="not collected" />,
      );

      expect(screen.getByRole('img').getAttribute('src')).toContain('deku-tree/3f.webp');
      await user.click(screen.getByRole('tab', { name: 'B1' }));
      expect(screen.getByRole('img').getAttribute('src')).toContain('deku-tree/b1.webp');
    });
  });
});
