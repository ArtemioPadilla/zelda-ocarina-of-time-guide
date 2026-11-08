/**
 * Normalises `Astro.url.pathname` to the locale-independent route the nav
 * keys on: strips the deploy base and the `/en` prefix, so `/en/bosses/` and
 * `/bosses/` both become `/bosses/`. Shared by SiteHeader (top nav) and
 * BottomTabBar (mobile tabs) so both highlight the same section.
 */
export function currentRoutePath(pathname: string): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  let routePath = pathname;
  if (base && routePath.startsWith(base)) routePath = routePath.slice(base.length);
  if (routePath.startsWith('/en/')) routePath = routePath.slice(3);
  else if (routePath === '/en') routePath = '/';
  return routePath || '/';
}

export function isRouteActive(routePath: string, path: string): boolean {
  return path === '/' ? routePath === '/' : routePath.startsWith(path);
}
