import type { Metadata, Viewport } from 'next';
import { Source_Sans_3 } from 'next/font/google';
import './globals.css';
import { SiteHeader } from '@/components/navigation/site-header';
import { SidebarLayout } from '@/components/layout/sidebar-layout';
import { apiSections } from '@/constants/api-sections';

const sourceSans3 = Source_Sans_3({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'is-kit • Docs',
  description: 'Type-safe isXXX combinators and utilities',
  icons: {
    icon: '/iskit_favicon.png',
    shortcut: '/iskit_favicon.png',
    apple: '/iskit_favicon.png',
  },
  openGraph: {
    title: 'is-kit • Docs',
    description: 'Type-safe isXXX combinators and utilities',
    images: [
      {
        url: '/iskit_logo1.svg',
        alt: 'is-kit logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/iskit_logo1.svg'],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
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
