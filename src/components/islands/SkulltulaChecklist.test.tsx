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
  { id: 'sk-01', number: 1, zone: 'Kokiri Forest', location: 'Above the shop door' },
  { id: 'sk-02', number: 2, zone: 'Kokiri Forest', location: 'Behind the Deku Tree' },
  { id: 'sk-03', number: 3, zone: 'Hyrule Field', location: 'Under the drawbridge', note: 'night only' },
];

describe('SkulltulaChecklist', () => {
  beforeEach(() => {
    memory.clear();
    vi.resetModules();
  });

  it('groups items by zone under their own heading', async () => {
    const { default: SkulltulaChecklist } = await import('./SkulltulaChecklist');
    render(<SkulltulaChecklist items={items} progressLabel="Skulltulas" />);
    expect(screen.getByRole('heading', { name: 'Kokiri Forest' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Hyrule Field' })).toBeInTheDocument();
  });

  it('shows the progress bar starting at 0 done', async () => {
    const { default: SkulltulaChecklist } = await import('./SkulltulaChecklist');
    render(<SkulltulaChecklist items={items} progressLabel="Skulltulas" />);
    expect(screen.getByRole('progressbar', { name: 'Skulltulas' })).toHaveAttribute('aria-valuenow', '0');
  });

  it('checking an item updates its checkbox and the progress count', async () => {
    const user = userEvent.setup();
    const { default: SkulltulaChecklist } = await import('./SkulltulaChecklist');
    render(<SkulltulaChecklist items={items} progressLabel="Skulltulas" />);

    const checkbox = screen.getByRole('checkbox', { name: /Above the shop door/ });
    expect(checkbox).not.toBeChecked();

    await user.click(checkbox);

    expect(checkbox).toBeChecked();
    expect(screen.getByRole('progressbar', { name: 'Skulltulas' })).toHaveAttribute('aria-valuenow', '1');
  });

  it('renders the optional note when present', async () => {
    const { default: SkulltulaChecklist } = await import('./SkulltulaChecklist');
    render(<SkulltulaChecklist items={items} progressLabel="Skulltulas" />);
    expect(screen.getByText('night only')).toBeInTheDocument();
  });
});
