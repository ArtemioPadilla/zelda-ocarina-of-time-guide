import { atom, onMount } from 'nanostores';
import { get, set } from 'idb-keyval';

/**
 * Generic persisted checklist store (which ids are "done"). Used by every
 * checklist (collectibles, shards, achievements) — offline-first,
 * per-device only, no backend. Follows the same onMount-hydrate / listen-to-persist pattern as
 * `src/stores/theme.ts`.
 */
export type ChecklistStore = ReturnType<typeof createChecklistStore>;

const registry = new Map<string, ChecklistStore>();

/** One store per IndexedDB key, shared by every island that asks for it —
 * two islands on a page toggling the same list must see each other. Keys
 * are `<game>-<list>-done` (`oot-collectibles-done`). Never rename a
 * key: a saved run must survive. */
export function checklistStore(idbKey: string): ChecklistStore {
  let s = registry.get(idbKey);
  if (!s) {
    s = createChecklistStore(idbKey);
    registry.set(idbKey, s);
  }
  return s;
}

function createChecklistStore(idbKey: string) {
  const $checked = atom<Set<string>>(new Set());
  // Set the instant a toggle happens, even before IDB hydration resolves.
  // Without this, a click made right after page load (checkbox flips
  // visually, IDB write kicks off) gets silently reverted when the slower
  // hydration `get()` promise resolves afterward and overwrites the atom
  // with the pre-click snapshot — the write already landed in IDB, but the
  // in-memory state (and the UI) regresses out of sync with it.
  let dirty = false;

  if (typeof document !== 'undefined') {
    onMount($checked, () => {
      let cancelled = false;
      get(idbKey)
        .then((stored) => {
          if (!cancelled && !dirty && Array.isArray(stored)) $checked.set(new Set(stored));
        })
        .catch(() => {
          // IndexedDB unavailable (private mode, etc.) — start empty.
        });
      return () => {
        cancelled = true;
      };
    });
  }

  function toggle(id: string) {
    dirty = true;
    const next = new Set($checked.get());
    if (next.has(id)) next.delete(id);
    else next.add(id);
    $checked.set(next);
    set(idbKey, [...next]).catch(() => {});
  }

  function reset() {
    dirty = true;
    $checked.set(new Set());
    set(idbKey, []).catch(() => {});
  }

  return { $checked, toggle, reset };
}

/** Currently-playing chapter of one game (`<game>-current-chapter`). */
function createCurrentChapterStore(key: string) {
  const $current = atom<string | null>(null);
  let dirty = false;

  if (typeof document !== 'undefined') {
    onMount($current, () => {
      let cancelled = false;
      get(key)
        .then((stored) => {
          if (!cancelled && !dirty && typeof stored === 'string') $current.set(stored);
        })
        .catch(() => {});
      return () => {
        cancelled = true;
      };
    });
  }

  function set_(id: string): void {
    dirty = true;
    $current.set(id);
    set(key, id).catch(() => {});
  }

  function reset(): void {
    dirty = true;
    $current.set(null);
    set(key, null).catch(() => {});
  }

  return { $current, set: set_, reset };
}

export type CurrentChapterStore = ReturnType<typeof createCurrentChapterStore>;
const currentRegistry = new Map<string, CurrentChapterStore>();

export function currentChapterStore(game: string): CurrentChapterStore {
  let s = currentRegistry.get(game);
  if (!s) {
    s = createCurrentChapterStore(`${game}-current-chapter`);
    currentRegistry.set(game, s);
  }
  return s;
}
