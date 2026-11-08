/**
 * The service worker's runtime image cache — the one place its name lives.
 * astro.config.mjs gives it to the workbox CacheFirst rule, and the offline
 * panel (OfflineImages island) fills and empties the very same Cache
 * Storage entry, so a picture downloaded ahead of time is the one the
 * service worker serves.
 * * Never rename it once shipped: a phone's downloaded pictures would be
 * orphaned.
 * Pure module with no imports: astro.config.mjs loads it.
 */
export const RUNTIME_IMAGE_CACHE = 'oot-images';

/**
 * Folders under public/ whose images are cached on first view instead of
 * precached. Keep in sync with the `urlPattern` in astro.config.mjs (workbox
 * serialises that function, so it cannot read this list).
 */
export const RUNTIME_IMAGE_DIRS = ['img/games', 'images/skulltulas'] as const;
