export const SUPPORTED_LOCALES = ['en', 'nl'] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'en';

/**
 * Resolves an arbitrary locale identifier to a supported locale.
 * @param locale Locale identifier taken from the URL.
 * @returns Matching supported locale, or the default locale when unsupported.
 */
export const resolveLocale = (locale: string): Locale =>
  SUPPORTED_LOCALES.find(
    (supportedLocale) => supportedLocale === locale
  ) ?? DEFAULT_LOCALE;

export const LOCALE_PATHS = {
  en: '/en',
  nl: '/nl'
} as const satisfies Record<Locale, `/${Locale}`>;
