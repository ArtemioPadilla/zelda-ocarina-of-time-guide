// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, type ReactElement } from 'react';
import { atom } from 'nanostores';
import { renderToString } from 'react-dom/server';
import { hydrateRoot, type Root } from 'react-dom/client';
import { useStore } from '@nanostores/react';
import { useHydratedStore } from './use-hydrated-store';

/**
 * Reproduces the production bug: an island server-rendered with an empty
 * store, hydrated on a device where the store was already filled from
 * IndexedDB by an island that hydrated earlier.
 */
const $current = atom<string | null>(null);
const NO_CHECKED: Set<string> = new Set();

function Plain() {
  const current = useStore($current);
  return <button>{current ? 'current' : 'mark'}</button>;
}
function Safe() {
  const current = useHydratedStore($current, null);
  return <button>{current ? 'current' : 'mark'}</button>;
}

let root: Root | undefined;
afterEach(() => {
  act(() => root?.unmount());
  root = undefined;
  $current.set(null);
  vi.restoreAllMocks();
});

async function hydrateAfterStoreFilled(Component: () => ReactElement) {
  // 1. Server render with the store at its initial value.
  const html = renderToString(<Component />);
  expect(html).toContain('mark');
  const container = document.createElement('div');
  container.innerHTML = html;
  document.body.appendChild(container);
  // 2. Another island already hydrated and IndexedDB resolved.
  $current.set('2-1');
  // 3. This island hydrates now. React reports a mismatch through
  //    onRecoverableError (and, in development, also logs it), so collect it
  //    there instead of letting it surface as an uncaught error.
  const recovered: unknown[] = [];
  vi.spyOn(console, 'error').mockImplementation(() => {});
  await act(async () => {
    root = hydrateRoot(container, <Component />, {
      onRecoverableError: (e) => recovered.push(e),
    });
  });
  return { container, recovered: recovered.map(String).join('\n') };
}

describe('useHydratedStore', () => {
  it("(baseline) @nanostores/react's useStore mismatches when the store filled before hydration", async () => {
    const { recovered } = await hydrateAfterStoreFilled(Plain);
    expect(recovered).toMatch(/hydrat/i);
  });

  it('hydrates with the server value, then shows the store value, with no hydration error', async () => {
    const { container, recovered } = await hydrateAfterStoreFilled(Safe);
    expect(recovered).toBe('');
    expect(container.textContent).toBe('current');
  });

  it('tracks later store changes like useStore does', async () => {
    const { container } = await hydrateAfterStoreFilled(Safe);
    act(() => $current.set(null));
    expect(container.textContent).toBe('mark');
    act(() => $current.set('3-1'));
    expect(container.textContent).toBe('current');
    expect(NO_CHECKED.size).toBe(0);
  });
});
