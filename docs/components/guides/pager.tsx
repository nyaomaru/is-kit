import Link from 'next/link';

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { guideSections } from '@/constants/guides';
import { cn } from '@/lib/utils';

type GuideNavigationItem = {
  href: string;
  label: string;
};

/**
 * Returns guide links in the same order displayed by the sidebar.
 * @returns Ordered guide navigation entries.
 */
function getGuideNavigationItems(): GuideNavigationItem[] {
  return guideSections.flatMap((section) => section.items);
}

export type GuidePagerProps = {
  /** Href of the guide currently in view; used to determine the next guide. */
  currentHref: string;
  /** Tailwind class overrides merged onto the pager navigation element. */
  className?: string;
};

/**
 * Links a guide to the guide index and its next sidebar-ordered guide.
 * @param currentHref Href of the guide currently in view.
 * @param className Optional classes merged onto the navigation container.
 * @returns Guide pager navigation.
 */
export function GuidePager({ currentHref, className }: GuidePagerProps) {
  const items = getGuideNavigationItems();
  const currentIndex = items.findIndex((item) => item.href === currentHref);
  const next = currentIndex >= 0 ? items[currentIndex + 1] : undefined;

  return (
    <nav aria-label='Guide pager' className={cn('mt-1', className)}>
      <div className='grid w-full grid-cols-1 items-stretch gap-4 md:grid-cols-3'>
        <Link
          href='/guides'
          className='group block h-full w-full justify-self-stretch rounded-md focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background'
          aria-label='Guides overview'
        >
          <Card className='h-full w-full transition-colors group-hover:border-primary'>
            <CardHeader>
              <div className='inline-block w-fit'>
                <CardTitle className='inline-block text-lg underline-offset-4'>
                  Guides
                </CardTitle>
                <div className='h-px w-0 bg-primary transition-[width] duration-500 group-hover:w-full' />
              </div>
              <CardDescription className='mt-3'>
                Explore all guides
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>
        <div className='hidden md:block' aria-hidden />
        {next ? (
          <Link
            href={next.href}
            className='group block h-full w-full justify-self-stretch rounded-md focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background'
            aria-label={`Next: ${next.label}`}
          >
            <Card className='h-full w-full transition-colors group-hover:border-primary'>
              <CardHeader>
                <div className='inline-block w-fit'>
                  <CardTitle className='inline-block text-lg underline-offset-4'>
                    Next: {next.label}
                  </CardTitle>
                  <div className='h-px w-0 bg-primary transition-[width] duration-500 group-hover:w-full' />
                </div>
                <CardDescription className='mt-3'>
                  Continue to the next guide
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ) : (
          <div className='hidden md:block' />
        )}
      </div>
    </nav>
  );
}
