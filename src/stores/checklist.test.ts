import { describe, expect, it, vi, beforeEach } from 'vitest';

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

// `checklist.ts` only wires up onMount/persistence when `document` exists —
// this suite runs in vitest's default `node` environment (no document), so
// it exercises the pure in-memory toggle logic, which is what the atom's
// consumers (the React islands) actually depend on for correctness.
describe('checklist store', () => {
  beforeEach(() => {
    memory.clear();
    vi.resetModules();
  });

  it('toggle adds an id when absent and removes it when present', async () => {
    const { skulltulasStore } = await import('./checklist');
    expect(skulltulasStore.$checked.get().size).toBe(0);

    skulltulasStore.toggle('sk-01');
    expect(skulltulasStore.$checked.get().has('sk-01')).toBe(true);

    skulltulasStore.toggle('sk-01');
    expect(skulltulasStore.$checked.get().has('sk-01')).toBe(false);
  });

  it('toggle persists the current set to idb-keyval under its own key', async () => {
    const { get } = await import('idb-keyval');
    const { heartsStore } = await import('./checklist');

    heartsStore.toggle('heart-lost-woods-1');
    heartsStore.toggle('heart-castle-town-dog');

    const persisted = (await get('oot-hearts-done')) as string[];
    expect(new Set(persisted)).toEqual(new Set(['heart-lost-woods-1', 'heart-castle-town-dog']));
  });

  it('skulltulas and hearts stores persist independently', async () => {
    const { skulltulasStore, heartsStore } = await import('./checklist');

    skulltulasStore.toggle('sk-01');
    expect(heartsStore.$checked.get().size).toBe(0);
    expect(skulltulasStore.$checked.get().size).toBe(1);
  });

  it('reset clears the checked set and the persisted value', async () => {
    const { get } = await import('idb-keyval');
    const { skulltulasStore } = await import('./checklist');

    skulltulasStore.toggle('sk-01');
    skulltulasStore.toggle('sk-02');
    skulltulasStore.reset();

    expect(skulltulasStore.$checked.get().size).toBe(0);
    expect(await get('oot-skulltulas-done')).toEqual([]);
  });

  it('setCurrentChapter updates the store and persists the chapter id', async () => {
    const { get } = await import('idb-keyval');
    const { $currentChapter, setCurrentChapter } = await import('./checklist');

    setCurrentChapter('c1');
    expect($currentChapter.get()).toBe('c1');
    expect(await get('oot-current-chapter')).toBe('c1');
  });
});
