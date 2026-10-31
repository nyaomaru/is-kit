import { DocsCardLink } from '@/components/navigation/docs-card-link';
import { cn } from '@/lib/utils';

type DocsPagerItem = {
  href: string;
  label: string;
};

type DocsPagerHome = {
  href: string;
  title: string;
  description: string;
  ariaLabel: string;
};

export type DocsPagerProps = {
  /** Href of the page currently in view. */
  currentHref: string;
  /** Pages in sidebar order, excluding the section index. */
  items: readonly DocsPagerItem[];
  /** Link back to the section index. */
  home: DocsPagerHome;
  /** Supporting copy on the next-page card. */
  nextDescription: string;
  /** Accessible name for the pager navigation. */
  ariaLabel: string;
  /** Classes merged onto the navigation element. */
  className?: string;
};

/**
 * Links the current docs page back to its index and forward to the next page.
 * @param currentHref Href of the page currently in view.
 * @param items Sidebar-ordered pages used to find the next link.
 * @param home Section index card.
 * @param nextDescription Supporting copy on the next-page card.
 * @param ariaLabel Accessible name for the pager.
 * @param className Classes merged onto the navigation element.
 * @returns Index card and the next page card.
 */
export function DocsPager({
  currentHref,
  items,
  home,
  nextDescription,
  ariaLabel,
  className
}: DocsPagerProps) {
  const currentIndex = items.findIndex((item) => item.href === currentHref);
  const next = currentIndex >= 0 ? items[currentIndex + 1] : undefined;
  const linkClassName = 'h-full w-full justify-self-stretch';

  return (
    <nav aria-label={ariaLabel} className={cn('mt-1', className)}>
      <div className='grid w-full grid-cols-1 items-stretch gap-4 md:grid-cols-3'>
        <DocsCardLink
          href={home.href}
          title={home.title}
          description={home.description}
          ariaLabel={home.ariaLabel}
          className={linkClassName}
          cardClassName='w-full'
        />
        <div className='hidden md:block' aria-hidden />
        {next ? (
          <DocsCardLink
            href={next.href}
            title={`Next: ${next.label}`}
            description={nextDescription}
            ariaLabel={`Next: ${next.label}`}
            className={linkClassName}
            cardClassName='w-full'
          />
        ) : (
          <div className='hidden md:block' />
        )}
      </div>
    </nav>
  );
}
