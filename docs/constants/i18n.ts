export const SUPPORTED_LOCALES = ['en', 'nl'] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'en';

export const LOCALE_PATHS = {
  en: '/en',
  nl: '/nl'
} as const satisfies Record<Locale, `/${Locale}`>;
