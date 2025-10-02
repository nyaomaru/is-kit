export const SUPPORTED_LOCALES = ['en', 'ja', 'nl'] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'en';

