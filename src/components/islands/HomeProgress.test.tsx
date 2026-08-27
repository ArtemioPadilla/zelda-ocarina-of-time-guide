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

const chapters = [
  { id: 'c1', number: 'C1', title: 'Inside the Deku Tree' },
  { id: 'c2', number: 'C2', title: "Dodongo's Cavern" },
];

const baseProps = {
  totalSkulltulas: 100,
  totalHearts: 36,
  chapters,
  skulltulasLabel: 'Skulltulas',
  heartsLabel: 'Hearts',
  chapterLabel: 'Current dungeon',
  resetLabel: 'Reset progress',
  resetConfirmMessage: 'Reset everything?',
};

describe('HomeProgress', () => {
  beforeEach(() => {
    memory.clear();
    vi.resetModules();
  });

  it('renders both progress bars starting at 0', async () => {
    const { default: HomeProgress } = await import('./HomeProgress');
    render(<HomeProgress {...baseProps} />);
    expect(screen.getByRole('progressbar', { name: 'Skulltulas' })).toHaveAttribute('aria-valuemax', '100');
    expect(screen.getByRole('progressbar', { name: 'Hearts' })).toHaveAttribute('aria-valuemax', '36');
  });

  it('lists every chapter as a select option', async () => {
    const { default: HomeProgress } = await import('./HomeProgress');
    render(<HomeProgress {...baseProps} />);
    expect(screen.getByRole('option', { name: /Dodongo's Cavern/ })).toBeInTheDocument();
  });

  it('reset button does nothing when the confirm dialog is declined', async () => {
    const user = userEvent.setup();
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    const { default: HomeProgress } = await import('./HomeProgress');
    const { skulltulasStore } = await import('@/stores/checklist');

    render(<HomeProgress {...baseProps} />);
    skulltulasStore.toggle('sk-01');
    await user.click(screen.getByRole('button', { name: 'Reset progress' }));

    expect(skulltulasStore.$checked.get().has('sk-01')).toBe(true);
  });

  it('reset button clears progress when the confirm dialog is accepted', async () => {
    const user = userEvent.setup();
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    const { default: HomeProgress } = await import('./HomeProgress');
    const { skulltulasStore } = await import('@/stores/checklist');

    render(<HomeProgress {...baseProps} />);
    skulltulasStore.toggle('sk-01');
    await user.click(screen.getByRole('button', { name: 'Reset progress' }));

    expect(skulltulasStore.$checked.get().has('sk-01')).toBe(false);
  });
});
