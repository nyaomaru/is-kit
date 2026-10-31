import Link from 'next/link';
import type * as React from 'react';

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { cn } from '@/lib/utils';

type DocsCardLinkProps = {
  /** Destination path for the card. */
  href: string;
  /** Title shown inside the card. */
  title: React.ReactNode;
  /** Supporting copy shown under the title. */
  description: React.ReactNode;
  /** Accessible name when the visible title is not enough. */
  ariaLabel?: string;
  /** Classes merged onto the link. */
  className?: string;
  /** Classes merged onto the card surface. */
  cardClassName?: string;
  /** Classes merged onto the title. */
  titleClassName?: string;
};

/**
 * Renders a docs card that underlines its title on hover.
 * @param href Destination path.
 * @param title Card title.
 * @param description Supporting copy.
 * @param ariaLabel Optional accessible name for the link.
 * @param className Classes merged onto the link.
 * @param cardClassName Classes merged onto the card surface.
 * @param titleClassName Classes merged onto the title.
 * @returns Linked card used by indexes, previews, and pagers.
 */
export function DocsCardLink({
  href,
  title,
  description,
  ariaLabel,
  className,
  cardClassName,
  titleClassName
}: DocsCardLinkProps) {
  return (
    <Link
      href={href}
      aria-label={ariaLabel}
      className={cn(
        'group block rounded-md focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        className
      )}
    >
      <Card
        className={cn(
          'h-full transition-colors group-hover:border-primary',
          cardClassName
        )}
      >
        <CardHeader>
          <div className='inline-block w-fit'>
            <CardTitle
              className={cn(
                'inline-block text-lg underline-offset-4',
                titleClassName
              )}
            >
              {title}
            </CardTitle>
            <div className='h-px w-0 bg-primary transition-[width] duration-500 group-hover:w-full' />
          </div>
          <CardDescription className='mt-3'>{description}</CardDescription>
        </CardHeader>
      </Card>
    </Link>
  );
}

type DocsCardItem = {
  href: string;
  title: string;
  description: string;
};

type DocsCardGridProps = {
  /** Cards rendered in source order. */
  items: readonly DocsCardItem[];
  /** Classes merged onto every card title. */
  titleClassName?: string;
};

/**
 * Renders a responsive grid of docs cards.
 * @param items Cards in display order.
 * @param titleClassName Classes merged onto every card title.
 * @returns Card grid used by docs index pages.
 */
export function DocsCardGrid({ items, titleClassName }: DocsCardGridProps) {
  return (
    <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
      {items.map((item) => (
        <DocsCardLink
          key={item.href}
          href={item.href}
          title={item.title}
          description={item.description}
          titleClassName={titleClassName}
        />
      ))}
    </div>
  );
}
