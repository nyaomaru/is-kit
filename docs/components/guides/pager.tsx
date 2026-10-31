import { DocsPager } from '@/components/navigation/docs-pager';
import { GUIDE_PATHS, guideSections } from '@/constants/guides';

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
  return (
    <DocsPager
      currentHref={currentHref}
      items={guideSections.flatMap((section) => section.items)}
      ariaLabel='Guide pager'
      className={className}
      nextDescription='Continue to the next guide'
      home={{
        href: GUIDE_PATHS.index,
        title: 'Guides',
        description: 'Explore all guides',
        ariaLabel: 'Guides overview'
      }}
    />
  );
}
