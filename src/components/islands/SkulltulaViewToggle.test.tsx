// @vitest-environment jsdom
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { SkulltulaArea } from '@/lib/skulltula-map-layout';

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

const STORE = 'oot-collectibles-done';

const pins = [
  {
    id: 'sk-01',
    number: 1,
    zone: 'Kokiri Forest',
    zoneKey: 'Kokiri Forest',
    hub: 'kokiri',
    location: 'Above the shop door',
    x: 60,
    y: 70,
  },
  {
    id: 'sk-02',
    number: 2,
    zone: 'Hyrule Field',
    zoneKey: 'Hyrule Field',
    hub: 'hyrule-field',
    location: 'Under the drawbridge',
    x: 20,
    y: 80,
  },
];

const groups = [
  {
    title: 'Kokiri Forest',
    items: [{ id: 'sk-01', title: 'Gold Skulltula #1', detail: 'Above the shop door' }],
  },
  {
    title: 'Hyrule Field',
    items: [{ id: 'sk-02', title: 'Gold Skulltula #2', detail: 'Under the drawbridge' }],
  },
];

const areaLabels: Record<SkulltulaArea, string> = {
  kokiri: 'Kokiri Forest & Lost Woods',
  'hyrule-field': 'Hyrule Field & Castle',
  kakariko: 'Kakariko',
  'death-mountain': 'Death Mountain',
  zora: 'Zora',
  'lake-hylia': 'Lake Hylia',
  gerudo: 'Gerudo',
};

const baseProps = {
  store: STORE,
  groups,
  pins,
  progressLabel: 'Gold Skulltula',
  viewToggleLabel: 'List or map',
  listLabel: 'List',
  mapLabel: 'Map',
  areaLabels,
  doneLabel: 'collected',
  pendingLabel: 'not collected',
};

describe('SkulltulaViewToggle', () => {
  beforeEach(() => {
    memory.clear();
    vi.resetModules();
  });

  it('defaults to the List view — the map is never the only way to see the checklist', async () => {
    const { default: SkulltulaViewToggle } = await import('./SkulltulaViewToggle');
    render(<SkulltulaViewToggle {...baseProps} />);

    expect(screen.getByRole('heading', { level: 2, name: /Kokiri Forest/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'List' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Map' })).toHaveAttribute('aria-pressed', 'false');
  });

  it('switching to Map renders the same pieces grouped by hub, and back to List keeps it available', async () => {
    const user = userEvent.setup();
    const { default: SkulltulaViewToggle } = await import('./SkulltulaViewToggle');
    render(<SkulltulaViewToggle {...baseProps} />);

    await user.click(screen.getByRole('button', { name: 'Map' }));
    expect(screen.getByText('Kokiri Forest & Lost Woods')).toBeInTheDocument();
    expect(screen.getByText('Hyrule Field & Castle')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Above the shop door/ })).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { level: 2, name: /Kokiri Forest/ }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 4, name: /Kokiri Forest/ })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'List' }));
    expect(screen.getByRole('heading', { level: 2, name: /Kokiri Forest/ })).toBeInTheDocument();
  });

  it('a pin ticked on the map is ticked in the list — one store, same ids', async () => {
    const user = userEvent.setup();
    const { default: SkulltulaViewToggle } = await import('./SkulltulaViewToggle');
    const { checklistStore } = await import('@/stores/checklist');
    render(<SkulltulaViewToggle {...baseProps} />);

    await user.click(screen.getByRole('button', { name: 'Map' }));
    await user.click(screen.getByRole('button', { name: /Above the shop door/ }));
    expect(checklistStore(STORE).$checked.get().has('sk-01')).toBe(true);
    expect(memory.get(STORE)).toEqual(['sk-01']);

    await user.click(screen.getByRole('button', { name: 'List' }));
    expect(screen.getByRole('checkbox', { name: /Gold Skulltula #1/ })).toBeChecked();
    expect(screen.getByRole('progressbar', { name: 'Gold Skulltula' })).toHaveAttribute(
      'aria-valuenow',
      '1',
    );
  });
});
