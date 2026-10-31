import Link from 'next/link';

import { DocsCardGrid } from '@/components/navigation/docs-card-link';
import { Heading } from '@/components/ui/heading';
import { API_REFERENCE_PATHS } from '@/lib/api-metadata';
import { FEATURED_API_ITEMS } from '@/constants/api-catalog';

export type ApiReferencePreviewProps = {
  /** Custom section id enabling deep-linking; defaults to `api-reference`. */
  id?: string;
  /** Heading displayed above the featured API cards. */
  title: string;
  /** Label for the call-to-action button linking to the full reference. */
  fullReferenceLinkText: string;
};

/**
 * Shows a featured subset of API cards and a link to the full reference.
 * @param id Section id used for deep links.
 * @param title Heading displayed above the cards.
 * @param fullReferenceLinkText Label for the full-reference link.
 * @returns Featured API preview section.
 */
export function APIReferencePreview({
  id = 'api-reference',
  title,
  fullReferenceLinkText
}: ApiReferencePreviewProps) {
  const titleId = `${id}-title`;

  return (
    <section id={id} aria-labelledby={titleId} className='mb-16'>
      <Heading id={titleId} variant='h2' className='mb-6'>
        {title}
      </Heading>
      <DocsCardGrid items={FEATURED_API_ITEMS} />
      <div className='mt-24 flex justify-center'>
        <Link
          href={API_REFERENCE_PATHS.index}
          className='inline-flex items-center justify-center h-10 px-6 rounded-md border-primary bg-primary text-background hover:bg-primary/10 transition-colors font-medium border-2'
        >
          {fullReferenceLinkText}
        </Link>
      </div>
    </section>
  );
}
