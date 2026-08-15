import type { MetadataRoute } from 'next';
import { API_ITEMS } from '@/constants/api-items';
import { GUIDE_ITEMS, GUIDE_PATHS } from '@/constants/guides';
import {
  DEFAULT_LOCALE,
  LOCALE_PATHS,
  SUPPORTED_LOCALES
} from '@/constants/i18n';
import { SITE_URL } from '@/constants/site';

const toAbsoluteUrl = (path: string): string =>
  new URL(path, SITE_URL).toString();

const localizedHomeAlternates = {
  languages: {
    ...Object.fromEntries(
      SUPPORTED_LOCALES.map((locale) => [
        locale,
        toAbsoluteUrl(LOCALE_PATHS[locale])
      ])
    ),
    'x-default': toAbsoluteUrl(LOCALE_PATHS[DEFAULT_LOCALE])
  }
};

export default function sitemap(): MetadataRoute.Sitemap {
  const localizedHomePages: MetadataRoute.Sitemap = SUPPORTED_LOCALES.map(
    (locale) => ({
      url: toAbsoluteUrl(LOCALE_PATHS[locale]),
      changeFrequency: 'weekly',
      priority: locale === DEFAULT_LOCALE ? 1 : 0.9,
      alternates: localizedHomeAlternates
    })
  );

  const apiReferencePages: MetadataRoute.Sitemap = [
    '/api-reference',
    ...API_ITEMS.map(({ href }) => href)
  ].map((path, index) => ({
    url: toAbsoluteUrl(path),
    changeFrequency: 'weekly',
    priority: index === 0 ? 0.9 : 0.8
  }));

  const guidePages: MetadataRoute.Sitemap = [
    GUIDE_PATHS.index,
    ...GUIDE_ITEMS.map(({ href }) => href)
  ].map((path, index) => ({
    url: toAbsoluteUrl(path),
    changeFrequency: 'monthly',
    priority: index === 0 ? 0.9 : 0.85
  }));

  return [...localizedHomePages, ...guidePages, ...apiReferencePages];
}
