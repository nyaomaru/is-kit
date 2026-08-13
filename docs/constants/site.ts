import type { Metadata } from 'next';

export const SITE_URL = 'https://is-kit-docs.vercel.app';

export const SITE_TITLE = 'is-kit Docs — TypeScript Type Guard Toolkit';

export const SITE_DESCRIPTION =
  'Documentation for is-kit, a lightweight, zero-dependency toolkit for building composable TypeScript type guards.';

export const SITE_SOCIAL_IMAGE = '/iskit_logo1.svg';

export const SITE_OPEN_GRAPH = {
  type: 'website',
  siteName: 'is-kit Docs',
  images: [
    {
      url: SITE_SOCIAL_IMAGE,
      alt: 'is-kit logo'
    }
  ]
} satisfies NonNullable<Metadata['openGraph']>;
