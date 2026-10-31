import { DocsPager } from '@/components/navigation/docs-pager';
import { apiSections } from '@/constants/api-catalog';
import { API_REFERENCE_PATHS } from '@/lib/api-metadata';

export type ApiReferencePagerProps = {
  /** Href of the item currently in view; used to compute the next link. */
  currentHref: string;
  /** Tailwind class overrides merged onto the container nav. */
  className?: string;
};

/**
 * Links an API page to the reference index and the next sidebar entry.
 * @param currentHref Href of the API page currently in view.
 * @param className Classes merged onto the navigation element.
 * @returns API reference pager.
 */
export function ApiReferencePager({
  currentHref,
  className
}: ApiReferencePagerProps) {
  return (
    <DocsPager
      currentHref={currentHref}
      items={apiSections.flatMap((section) => section.items)}
      ariaLabel='API pager'
      className={className}
      nextDescription='Continue to the next API'
      home={{
        href: API_REFERENCE_PATHS.index,
        title: 'API Reference',
        description: 'Explore all APIs and categories',
        ariaLabel: 'API Reference home'
      }}
    />
  );
}
