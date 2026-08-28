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

const items = [
  {
    id: 'sk-01',
    number: 1,
    zone: 'Kokiri Forest',
    zoneKey: 'Kokiri Forest',
    area: 'kokiri' as const,
    location: 'Above the shop door',
    x: 60,
    y: 70,
  },
  {
    id: 'sk-02',
    number: 2,
    zone: 'Hyrule Field',
    zoneKey: 'Hyrule Field',
    area: 'hyrule-field' as const,
    location: 'Under the drawbridge',
    x: 20,
    y: 80,
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
  items,
  progressLabel: 'Skulltulas',
  viewToggleLabel: 'Skulltula list view',
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

    expect(screen.getByRole('heading', { level: 2, name: 'Kokiri Forest' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'List' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Map' })).toHaveAttribute('aria-pressed', 'false');
  });

  it('switching to Map view renders the same items grouped by area, and back to List keeps it available', async () => {
    const user = userEvent.setup();
    const { default: SkulltulaViewToggle } = await import('./SkulltulaViewToggle');
    render(<SkulltulaViewToggle {...baseProps} />);

    await user.click(screen.getByRole('button', { name: 'Map' }));
    expect(screen.getByText('Kokiri Forest & Lost Woods')).toBeInTheDocument();
    expect(screen.getByText('Hyrule Field & Castle')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Above the shop door/ })).toBeInTheDocument();
    // List's zone-grouped <h2> heading is gone while Map is showing — Map
    // has its own zone sub-heading, but at a different heading level.
    expect(screen.queryByRole('heading', { level: 2, name: 'Kokiri Forest' })).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 4, name: /Kokiri Forest/ })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'List' }));
    expect(screen.getByRole('heading', { level: 2, name: 'Kokiri Forest' })).toBeInTheDocument();
  });

  it('toggling a pin in Map view is reflected in List view — one shared items array and store', async () => {
    const user = userEvent.setup();
    const { default: SkulltulaViewToggle } = await import('./SkulltulaViewToggle');
    render(<SkulltulaViewToggle {...baseProps} />);

    await user.click(screen.getByRole('button', { name: 'Map' }));
    await user.click(screen.getByRole('button', { name: /Above the shop door/ }));

    await user.click(screen.getByRole('button', { name: 'List' }));
    const checkbox = screen.getByRole('checkbox', { name: /Above the shop door/ });
    expect(checkbox).toBeChecked();
  });
});
