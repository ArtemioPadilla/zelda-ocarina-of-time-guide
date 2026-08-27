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
  { id: 'sk-01', number: 1, zone: 'Kokiri Forest', location: 'Above the shop door', x: 60, y: 70 },
  { id: 'sk-02', number: 2, zone: 'Lost Woods', location: 'Behind a hollow log', note: 'night only', x: 30, y: 60 },
];

describe('SkulltulaMap', () => {
  beforeEach(() => {
    memory.clear();
    vi.resetModules();
  });

  it('renders one pin button per item, positioned at its x/y%', async () => {
    const { default: SkulltulaMap } = await import('./SkulltulaMap');
    render(<SkulltulaMap area="kokiri" items={items} doneLabel="collected" pendingLabel="not collected" />);

    const pin = screen.getByRole('button', { name: /Above the shop door/ });
    expect(pin).toHaveStyle({ left: '60%', top: '70%' });
  });

  it('gives each pin an aria-label combining the location text and checked state', async () => {
    const { default: SkulltulaMap } = await import('./SkulltulaMap');
    render(<SkulltulaMap area="kokiri" items={items} doneLabel="collected" pendingLabel="not collected" />);

    expect(screen.getByRole('button', { name: '#1 Above the shop door — not collected' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '#2 Behind a hollow log night only — not collected' })).toBeInTheDocument();
  });

  it('clicking a pin toggles the shared skulltulasStore — the same store the list checkboxes use', async () => {
    const user = userEvent.setup();
    const { skulltulasStore } = await import('@/stores/checklist');
    const { default: SkulltulaMap } = await import('./SkulltulaMap');
    render(<SkulltulaMap area="kokiri" items={items} doneLabel="collected" pendingLabel="not collected" />);

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
});
