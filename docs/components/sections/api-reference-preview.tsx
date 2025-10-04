import Link from 'next/link';

import { Heading } from '@/components/ui/heading';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { FEATURED_API_ITEMS } from '@/constants/api-items';

export type ApiReferencePreviewProps = {
  id?: string;
  title: string;
  fullReferenceLinkText: string;
};

export function APIReferencePreview({
  id = 'api-reference',
  title,
  fullReferenceLinkText,
}: ApiReferencePreviewProps) {
  const titleId = `${id}-title`;
  const items = FEATURED_API_ITEMS;
  return (
    <section id={id} aria-labelledby={titleId} className="mb-16">
      <Heading id={titleId} variant="h2" className="mb-6">
        {title}
      </Heading>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="group focus:outline-none"
          >
            <Card className="h-full transition-colors group-hover:border-primary">
              <CardHeader>
                <div className="inline-block w-fit">
                  <CardTitle className="inline-block text-lg underline-offset-4">
                    {item.title}
                  </CardTitle>
                  <div className="mt-1 h-px w-0 bg-primary transition-[width] duration-500 group-hover:w-full" />
                </div>
                <CardDescription>{item.description}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
      <div className="mt-24 flex justify-center">
        <Link
          href="/api-reference"
          className="inline-flex items-center justify-center h-10 px-6 rounded-md border-primary bg-primary text-background hover:bg-primary/10 transition-colors font-bold border-2 font-sans"
        >
          {fullReferenceLinkText}
        </Link>
      </div>
    </section>
  );
}
