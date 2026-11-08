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

const groups = [
  {
    title: 'Niño',
    items: [
      { id: 'kokiri-sword', title: 'Espada Kokiri', tag: 'Kokiri Sword', detail: 'Bosque Kokiri' },
      { id: 'chiefs-note', title: 'Nota del jefe' },
    ],
  },
  { title: 'Adulto', items: [{ id: 'two-routes', title: 'Dos rutas' }] },
];

describe('GroupedChecklist', () => {
  beforeEach(() => {
    memory.clear();
    vi.resetModules();
  });

  it('renders the groups with their own counters and the tag', async () => {
    const { default: GroupedChecklist } = await import('./GroupedChecklist');
    render(<GroupedChecklist store="oot-files-done" groups={groups} progressLabel="Files" />);
    expect(screen.getByRole('heading', { name: /Niño/ })).toHaveTextContent('0/2');
    expect(screen.getByText('Kokiri Sword')).toBeInTheDocument();
  });

  it('writes to the named store and updates the progress', async () => {
    const user = userEvent.setup();
    const { default: GroupedChecklist } = await import('./GroupedChecklist');
    const { checklistStore } = await import('@/stores/checklist');
    render(<GroupedChecklist store="oot-files-done" groups={groups} progressLabel="Files" />);
    await user.click(screen.getByRole('checkbox', { name: /Dos rutas/ }));
    expect(screen.getByRole('progressbar', { name: 'Files' })).toHaveAttribute(
      'aria-valuenow',
      '1',
    );
    expect(checklistStore('oot-files-done').$checked.get().has('two-routes')).toBe(true);
    expect(checklistStore('oot-achievements-done').$checked.get().size).toBe(0);
  });
});
