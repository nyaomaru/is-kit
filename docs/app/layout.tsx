import type { Metadata, Viewport } from 'next';
import { Source_Sans_3 } from 'next/font/google';
import './globals.css';
import { SiteHeader } from '@/components/navigation/site-header';
import { SidebarLayout } from '@/components/layout/sidebar-layout';
import { apiSections } from '@/constants/api-sections';
import {
  SITE_DESCRIPTION,
  SITE_OPEN_GRAPH,
  SITE_SOCIAL_IMAGE,
  SITE_TITLE,
  SITE_URL
} from '@/constants/site';

const sourceSans3 = Source_Sans_3({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans'
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  robots: {
    index: true,
    follow: true
  },
  icons: {
    icon: '/iskit_favicon.png',
    shortcut: '/iskit_favicon.png',
    apple: '/iskit_favicon.png'
  },
  openGraph: {
    ...SITE_OPEN_GRAPH,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [SITE_SOCIAL_IMAGE]
  }
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en' suppressHydrationWarning className={sourceSans3.variable}>
      <body className='antialiased'>
        <SiteHeader />
        <SidebarLayout sections={apiSections}>
          <main className='w-full max-w-full overflow-x-hidden pt-14'>
            {children}
          </main>
        </SidebarLayout>
      </body>
    </html>
  );
}
