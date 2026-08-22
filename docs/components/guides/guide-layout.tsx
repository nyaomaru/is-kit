import type * as React from 'react';

import { Heading } from '@/components/ui/heading';
import { Paragraph } from '@/components/ui/paragraph';
import { Stack } from '@/components/ui/stack';
import { TextLink } from '@/components/ui/text-link';
import { GUIDE_PATHS } from '@/constants/guides';
import { cn } from '@/lib/utils';

type GuideArticleProps = React.ComponentPropsWithoutRef<'article'>;

/**
 * Provides the shared width and vertical rhythm for a guide article.
 * @param props Standard article attributes and guide content.
 * @returns Guide article container.
 */
export function GuideArticle({ className, ...props }: GuideArticleProps) {
  return (
    <Stack
      variant='article'
      className={cn('container mx-auto max-w-4xl px-4 py-10', className)}
      gap='xl'
      {...props}
    />
  );
}

type GuideHeaderProps = {
  /** Short current-page label shown after the Guides breadcrumb. */
  breadcrumbLabel: string;
  /** Main guide heading. */
  title: string;
  /** Introductory summary shown below the heading. */
  description: React.ReactNode;
};

/**
 * Renders a guide breadcrumb, title, and lead description.
 * @param breadcrumbLabel Current guide label used in the breadcrumb.
 * @param title Guide page title.
 * @param description Short guide introduction.
 * @returns Shared guide header.
 */
export function GuideHeader({
  breadcrumbLabel,
  title,
  description
}: GuideHeaderProps) {
  return (
    <Stack variant='section' gap='sm' className='border-b pb-8'>
      <nav aria-label='Breadcrumb'>
        <ol className='flex items-center gap-2 text-sm font-medium tracking-[0.14em] uppercase text-primary/70'>
          <li>
            <TextLink href={GUIDE_PATHS.index} className='text-inherit'>
              Guides
            </TextLink>
          </li>
          <li aria-hidden='true'>/</li>
          <li aria-current='page'>{breadcrumbLabel}</li>
        </ol>
      </nav>
      <Heading variant='h1' className='max-w-3xl leading-tight tracking-tight'>
        {title}
      </Heading>
      <Paragraph variant='lead' className='max-w-3xl text-primary/80'>
        {description}
      </Paragraph>
    </Stack>
  );
}

type GuideSectionProps = React.ComponentPropsWithoutRef<'section'> & {
  /** Section heading rendered before the content. */
  title: string;
};

/**
 * Renders a consistently spaced guide section with an h2 heading.
 * @param title Section heading.
 * @param props Standard section attributes and section content.
 * @returns Guide content section.
 */
export function GuideSection({
  className,
  title,
  children,
  ...props
}: GuideSectionProps) {
  return (
    <Stack variant='section' gap='md' className={className} {...props}>
      <Heading variant='h2' className='text-2xl tracking-tight'>
        {title}
      </Heading>
      {children}
    </Stack>
  );
}

type GuideCalloutProps = React.ComponentPropsWithoutRef<'blockquote'> & {
  /** Applies stronger emphasis for key takeaways. */
  emphasized?: boolean;
};

/**
 * Highlights a guide note or takeaway with the shared quote treatment.
 * @param emphasized Whether to render the callout with stronger text.
 * @param props Standard blockquote attributes and callout content.
 * @returns Styled guide callout.
 */
export function GuideCallout({
  className,
  emphasized = false,
  ...props
}: GuideCalloutProps) {
  return (
    <blockquote
      className={cn(
        'border-l-2 border-primary/70 py-1 pl-5 text-lg leading-relaxed',
        emphasized && 'font-semibold',
        className
      )}
      {...props}
    />
  );
}

type GuideListProps = React.ComponentPropsWithoutRef<'ul'>;

/**
 * Renders the shared unordered-list style used in guide summaries and notes.
 * @param props Standard unordered-list attributes and list items.
 * @returns Styled guide list.
 */
export function GuideList({ className, ...props }: GuideListProps) {
  return (
    <ul className={cn('list-disc space-y-2 pl-6', className)} {...props} />
  );
}
