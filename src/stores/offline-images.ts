import { map } from 'nanostores';

/**
 * Offline image downloads: the runtime-cached pictures (see
 * src/lib/runtime-cache.ts) fetched ahead of time into the service worker's
 * own Cache Storage entry, so they are there when the phone has no signal.
 * One shared store, so every panel and button on a page agree on
 * what is saved and on the download in flight.
 *
 * Nothing is kept in IndexedDB: the cache itself is the record of what is
 * saved (a download that stops halfway resumes by skipping what is already
 * in it).
 */
export type OfflineStatus = 'idle' | 'checking' | 'ready' | 'unsupported';

export interface OfflineJob {
  /** A game id, or `all` for every game. */
  scope: string;
  done: number;
  total: number;
  failed: number;
  running: boolean;
}

export interface OfflineState {
  status: OfflineStatus;
  /** Absolute URLs per game (from /offline-images.json). */
  urls: Record<string, string[]>;
  /** How many of each game's URLs are in the cache. */
  saved: Record<string, number>;
  job: OfflineJob | null;
  usage?: number;
  quota?: number;
  /** navigator.storage.persist() answer, once asked. */
  persisted?: boolean;
}

export const INITIAL_OFFLINE: OfflineState = {
  status: 'idle',
  urls: {},
  saved: {},
  job: null,
};

export const $offline = map<OfflineState>(INITIAL_OFFLINE);

/** Parallel fetches while downloading. */
const CONCURRENCY = 6;

let cacheName = '';
let started: Promise<void> | null = null;
let controller: AbortController | null = null;

function supported(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof caches !== 'undefined' &&
    typeof navigator !== 'undefined' &&
    'serviceWorker' in navigator
  );
}

/** Resolves true when a service worker is (or becomes, within a few seconds) registered. */
async function hasServiceWorker(): Promise<boolean> {
  try {
    if (await navigator.serviceWorker.getRegistration()) return true;
    const ready = navigator.serviceWorker.ready.then(() => true);
    const timeout = new Promise<boolean>((r) => setTimeout(() => r(false), 4000));
    return await Promise.race([ready, timeout]);
  } catch {
    return false;
  }
}

async function refreshEstimate() {
  try {
    const est = await navigator.storage?.estimate?.();
    if (est) {
      $offline.setKey('usage', est.usage);
      $offline.setKey('quota', est.quota);
    }
  } catch {
    // Not available: the panel just doesn't show it.
  }
}

async function cachedSet(): Promise<Set<string>> {
  const cache = await caches.open(cacheName);
  return new Set((await cache.keys()).map((r) => r.url));
}

async function refreshSaved() {
  const have = await cachedSet();
  const saved: Record<string, number> = {};
  for (const [game, urls] of Object.entries($offline.get().urls))
    saved[game] = urls.filter((u) => have.has(u)).length;
  $offline.setKey('saved', saved);
  await refreshEstimate();
}

/**
 * Loads the URL list and counts what is already cached. Safe to call from
 * every island on the page: it runs once.
 */
export function initOffline(endpoint: string, cache: string): Promise<void> {
  if (started) return started;
  cacheName = cache;
  started = (async () => {
    if (!supported()) {
      $offline.setKey('status', 'unsupported');
      return;
    }
    $offline.setKey('status', 'checking');
    if (!(await hasServiceWorker())) {
      $offline.setKey('status', 'unsupported');
      return;
    }
    try {
      const res = await fetch(endpoint);
      const data = (await res.json()) as { games: Record<string, { urls: string[] }> };
      const urls: Record<string, string[]> = {};
      for (const [game, g] of Object.entries(data.games))
        urls[game] = g.urls.map((u) => new URL(u, location.href).href);
      $offline.setKey('urls', urls);
      await refreshSaved();
      $offline.setKey('status', 'ready');
    } catch {
      $offline.setKey('status', 'unsupported');
    }
  })();
  return started;
}

function urlsFor(scope: string): string[] {
  const all = $offline.get().urls;
  return scope === 'all' ? Object.values(all).flat() : (all[scope] ?? []);
}

/** Fetches every image of `scope` not yet cached into the runtime cache. */
export async function downloadOffline(scope: string): Promise<void> {
  if ($offline.get().job?.running || $offline.get().status !== 'ready') return;
  const urls = urlsFor(scope);
  try {
    if (navigator.storage?.persist) $offline.setKey('persisted', await navigator.storage.persist());
  } catch {
    // Persistence is a nice-to-have; download anyway.
  }
  const cache = await caches.open(cacheName);
  const have = await cachedSet();
  const todo = urls.filter((u) => !have.has(u));
  controller = new AbortController();
  const { signal } = controller;
  let done = urls.length - todo.length;
  let failed = 0;
  const publish = (running: boolean) =>
    $offline.setKey('job', { scope, done, total: urls.length, failed, running });
  publish(true);

  let next = 0;
  const worker = async () => {
    while (next < todo.length && !signal.aborted) {
      const url = todo[next++];
      try {
        const res = await fetch(url, { signal });
        if (!res.ok) throw new Error(String(res.status));
        await cache.put(url, res);
        done++;
      } catch {
        if (signal.aborted) return;
        failed++;
      }
      publish(true);
    }
  };
  await Promise.all(Array.from({ length: Math.min(CONCURRENCY, todo.length) }, worker));
  controller = null;
  publish(false);
  await refreshSaved();
}

/** Stops the download in flight (what is already saved stays saved). */
export function cancelOffline() {
  controller?.abort();
}

/** Removes `scope`'s images from the runtime cache. */
export async function deleteOffline(scope: string): Promise<void> {
  if ($offline.get().job?.running || $offline.get().status !== 'ready') return;
  const cache = await caches.open(cacheName);
  await Promise.all(urlsFor(scope).map((u) => cache.delete(u)));
  $offline.setKey('job', null);
  await refreshSaved();
}
