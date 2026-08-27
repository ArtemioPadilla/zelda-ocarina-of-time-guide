import { ui, DEFAULT_LOCALE, type Locale, type UiKey } from './ui';
import { withBase } from '@/lib/href';

export function useTranslations(locale: Locale) {
  return function t(key: UiKey): string {
    return ui[locale][key] ?? ui[DEFAULT_LOCALE][key];
  };
}

/** Locale-aware internal link: '/' + locale prefix (English only) + base. */
export function localizedHref(locale: Locale, path: string): string {
  const prefix = locale === DEFAULT_LOCALE ? '' : `/${locale}`;
  return withBase(`${prefix}${path}`);
}

/**
 * Given the current URL pathname (already base-stripped or not — pass
 * `Astro.url.pathname` directly), returns the equivalent path in `locale`.
 * Route segments are always English regardless of locale (see SiteHeader),
 * so swapping locale only ever has to add/remove the `/en` prefix.
 */
export function swapLocaleHref(targetLocale: Locale, pathname: string): string {
  const base = withBase('/').slice(0, -1); // '' at root deploys, '/repo' under a subpath
  let routePath = pathname;
  if (base && routePath.startsWith(base)) routePath = routePath.slice(base.length);
  const unprefixed = routePath.startsWith('/en/') ? routePath.slice(3) : routePath === '/en' ? '/' : routePath;
  return localizedHref(targetLocale, unprefixed || '/');
}
