import { useSyncExternalStore } from 'react';
import type { ReadableAtom } from 'nanostores';

/**
 * `useStore` for islands that are server-rendered.
 *
 * `@nanostores/react`'s `useStore` hands React the store's *current* value as
 * the server snapshot too. That is fine while the store still holds its
 * initial value, but our checklist stores fill from IndexedDB the moment
 * the first island subscribes — so an island that hydrates a little later
 * (a slow phone hydrating the chapter page's five islands one by one) sees
 * "The Rescue is current" / "12 collectibles found" on its very first render
 * while the HTML it is hydrating says "mark as current" / "0". React then
 * throws a hydration text mismatch (minified error #418) and re-renders the
 * whole island from scratch.
 *
 * This hook gives React the value the server rendered with (`serverValue`)
 * as the hydration snapshot, so hydration always matches, and React applies
 * the real store value in the re-render it schedules right after — the same
 * thing that happens on a fast device when IndexedDB resolves late.
 *
 * `serverValue` must be referentially stable across renders (a module-level
 * constant), or `useSyncExternalStore` will re-render forever.
 */
export function useHydratedStore<T>(store: ReadableAtom<T>, serverValue: T): T {
  return useSyncExternalStore(
    (onChange) => store.listen(onChange),
    () => store.get(),
    () => serverValue,
  );
}

/** Stable "nothing checked yet" snapshot for the checklist stores. */
export const NO_CHECKED: Set<string> = new Set();
