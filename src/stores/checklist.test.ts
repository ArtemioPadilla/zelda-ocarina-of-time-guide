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
    const { checklistStore } = await import('./checklist');
    const s = checklistStore('oot-collectibles-done');
    expect(s.$checked.get().size).toBe(0);

    s.toggle('sk-001');
    expect(s.$checked.get().has('sk-001')).toBe(true);

    s.toggle('sk-001');
    expect(s.$checked.get().has('sk-001')).toBe(false);
  });

  it('toggle persists the current set to idb-keyval under its own key', async () => {
    const { get } = await import('idb-keyval');
    const { checklistStore } = await import('./checklist');
    const s = checklistStore('oot-files-done');

    s.toggle('shard-a');
    s.toggle('shard-b');

    const persisted = (await get('oot-files-done')) as string[];
    expect(new Set(persisted)).toEqual(new Set(['shard-a', 'shard-b']));
  });

  it('reset clears the checked set and the persisted value', async () => {
    const { get } = await import('idb-keyval');
    const { checklistStore } = await import('./checklist');
    const s = checklistStore('oot-achievements-done');

    s.toggle('a');
    s.toggle('b');
    s.reset();

    expect(s.$checked.get().size).toBe(0);
    expect(await get('oot-achievements-done')).toEqual([]);
  });

  it('hands out one store per IndexedDB key, shared by everyone who asks', async () => {
    const { get } = await import('idb-keyval');
    const { checklistStore } = await import('./checklist');
    const a = checklistStore('oot-collectibles-done');
    expect(checklistStore('oot-collectibles-done')).toBe(a);
    a.toggle('sk-001');
    expect(checklistStore('oot-files-done').$checked.get().size).toBe(0);
    expect(await get('oot-collectibles-done')).toEqual(['sk-001']);
  });

  it('keeps the current chapter under <game>-current-chapter', async () => {
    const { get } = await import('idb-keyval');
    const { currentChapterStore } = await import('./checklist');
    const s = currentChapterStore('oot');
    expect(s.$current.get()).toBeNull();
    s.set('deku-tree');
    expect(s.$current.get()).toBe('deku-tree');
    expect(currentChapterStore('oot')).toBe(s);
    expect(await get('oot-current-chapter')).toBe('deku-tree');
    s.reset();
    expect(s.$current.get()).toBeNull();
  });
});
