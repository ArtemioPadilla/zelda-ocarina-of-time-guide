// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

/** A Cache Storage stand-in: one Map of url → body per cache name. */
function fakeCaches() {
  const stores = new Map<string, Map<string, string>>();
  const open = async (name: string) => {
    const m = stores.get(name) ?? new Map<string, string>();
    stores.set(name, m);
    return {
      keys: async () => [...m.keys()].map((url) => ({ url })),
      put: async (url: string, res: { text: () => Promise<string> }) => {
        m.set(url, await res.text());
      },
      delete: async (url: string) => m.delete(url),
    };
  };
  return { stores, api: { open } };
}

const ORIGIN = 'http://localhost:3000';
const LIST = {
  cache: 'img-cache',
  games: {
    oot: {
      urls: ['/img/games/oot/chapters/a.webp', '/img/games/oot/chapters/b.webp'],
      bytes: 20,
    },
    other: {
      urls: ['/img/games/other/cover/cover.webp', '/img/games/other/broken.webp'],
      bytes: 10,
    },
  },
};

describe('offline image downloads', () => {
  let caches: ReturnType<typeof fakeCaches>;
  let fetched: string[];

  beforeEach(() => {
    vi.resetModules();
    caches = fakeCaches();
    fetched = [];
    vi.stubGlobal('caches', caches.api);
    Object.defineProperty(navigator, 'serviceWorker', {
      configurable: true,
      value: { getRegistration: async () => ({}), ready: new Promise(() => {}) },
    });
    Object.defineProperty(navigator, 'storage', {
      configurable: true,
      value: {
        persist: vi.fn(async () => true),
        estimate: async () => ({ usage: 1024, quota: 2048 }),
      },
    });
    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: string) => {
        const url = String(input);
        if (url.endsWith('/offline-images.json'))
          return { ok: true, json: async () => LIST } as unknown as Response;
        fetched.push(url);
        const ok = !url.includes('broken');
        return { ok, status: ok ? 200 : 404, text: async () => url } as unknown as Response;
      }),
    );
  });
  afterEach(() => vi.unstubAllGlobals());

  it('counts what is cached, downloads the rest into the named cache, resumes and deletes', async () => {
    const { $offline, initOffline, downloadOffline, deleteOffline } =
      await import('./offline-images');
    // One picture already viewed (cached by the service worker).
    const pre = await caches.api.open('img-cache');
    await pre.put(`${ORIGIN}/img/games/oot/chapters/a.webp`, { text: async () => 'x' });

    await initOffline('/offline-images.json', 'img-cache');
    expect($offline.get().status).toBe('ready');
    expect($offline.get().saved).toEqual({ oot: 1, other: 0 });

    await downloadOffline('oot');
    expect(fetched).toEqual([`${ORIGIN}/img/games/oot/chapters/b.webp`]);
    expect(navigator.storage.persist).toHaveBeenCalled();
    expect($offline.get().saved.oot).toBe(2);
    expect($offline.get().job).toMatchObject({
      scope: 'oot',
      done: 2,
      total: 2,
      running: false,
    });

    // A failed fetch is counted, not saved, and retried on the next run.
    await downloadOffline('all');
    expect($offline.get().job).toMatchObject({ scope: 'all', failed: 1, done: 3, total: 4 });
    expect($offline.get().saved).toEqual({ oot: 2, other: 1 });
    expect($offline.get().usage).toBe(1024);

    await deleteOffline('oot');
    expect($offline.get().saved).toEqual({ oot: 0, other: 1 });
    expect([...caches.stores.get('img-cache')!.keys()]).toEqual([
      `${ORIGIN}/img/games/other/cover/cover.webp`,
    ]);
  });

  it('says so when there is no service worker', async () => {
    // The API exists (dev server, first visit…) but nothing is registered.
    Object.defineProperty(navigator, 'serviceWorker', {
      configurable: true,
      value: {
        getRegistration: async () => undefined,
        ready: new Promise(() => {}),
      },
    });
    vi.useFakeTimers();
    const { $offline, initOffline } = await import('./offline-images');
    const done = initOffline('/offline-images.json', 'img-cache');
    await vi.advanceTimersByTimeAsync(5000);
    await done;
    vi.useRealTimers();
    expect($offline.get().status).toBe('unsupported');
  });
});
