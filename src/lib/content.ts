import { getCollection, type CollectionEntry, type CollectionKey } from 'astro:content';
import type { Locale } from '@/i18n/ui';

/** Base collection names produced by content.config.ts's `localizedJson()` factory
 * (and `chapters`, defined the same `${name}_${locale}` way by hand) — every real
 * `CollectionKey` ends in `_es` or `_en`, so this strips that suffix back off. A
 * typo'd name here is now a compile error instead of a runtime `getCollection`
 * failure at build time. */
type LocalizedBaseName<K> = K extends `${infer Base}_es` ? Base : K extends `${infer Base}_en` ? Base : never;
type BaseCollectionName = LocalizedBaseName<CollectionKey>;

/** Reads the `${name}_${locale}` collection pair produced by content.config.ts. */
export function getLocalized<Name extends BaseCollectionName>(name: Name, locale: Locale) {
  return getCollection(`${name}_${locale}` as CollectionKey) as Promise<
    CollectionEntry<`${Name}_${Locale}`>[]
  >;
}
