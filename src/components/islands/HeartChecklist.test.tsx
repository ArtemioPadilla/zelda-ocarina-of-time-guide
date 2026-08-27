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
  { id: 'heart-lost-woods-1', name: 'Piece of Heart', detail: 'Lost Woods · play Saria’s Song', missable: false },
  { id: 'heart-castle-town-dog', name: 'Piece of Heart', detail: 'Castle Town · night only', missable: true },
];

describe('HeartChecklist', () => {
  beforeEach(() => {
    memory.clear();
    vi.resetModules();
  });

  it('shows the missable badge only for items flagged missable', async () => {
    const { default: HeartChecklist } = await import('./HeartChecklist');
    render(<HeartChecklist items={items} progressLabel="Hearts" missableLabel="missable" />);
    const missableBadges = screen.getAllByText('missable');
    expect(missableBadges).toHaveLength(1);
  });

  it('checking a heart updates the progress count', async () => {
    const user = userEvent.setup();
    const { default: HeartChecklist } = await import('./HeartChecklist');
    render(<HeartChecklist items={items} progressLabel="Hearts" missableLabel="missable" />);

    expect(screen.getByRole('progressbar', { name: 'Hearts' })).toHaveAttribute('aria-valuenow', '0');
    await user.click(screen.getAllByRole('checkbox')[0]);
    expect(screen.getByRole('progressbar', { name: 'Hearts' })).toHaveAttribute('aria-valuenow', '1');
  });

  it('renders each item detail text', async () => {
    const { default: HeartChecklist } = await import('./HeartChecklist');
    render(<HeartChecklist items={items} progressLabel="Hearts" missableLabel="missable" />);
    expect(screen.getByText('Lost Woods · play Saria’s Song')).toBeInTheDocument();
    expect(screen.getByText('Castle Town · night only')).toBeInTheDocument();
  });
});
