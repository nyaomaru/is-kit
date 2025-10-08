import Link from 'next/link';
import { apiSections } from '@/constants/api-sections';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';

type Item = {
  /** URL for the API reference entry. */
  href: string;
  /** Human readable label for navigation. */
  label: string;
};

function flatten(sections = apiSections): Item[] {
  const out: Item[] = [];
  for (const s of sections) {
    for (const it of s.items) out.push({ href: it.href, label: it.label });
  }
  return out;
}

export type ApiReferencePagerProps = {
  /** Href of the item currently in view; used to compute the next link. */
  currentHref: string;
};
export function ApiReferencePager({ currentHref }: ApiReferencePagerProps) {
  const list = flatten();
  const idx = list.findIndex((x) => x.href === currentHref);
  const next = idx >= 0 ? list[idx + 1] : undefined;

  return (
    <nav aria-label='API pager' className='mt-1'>
      <div className='grid grid-cols-1 gap-4 md:grid-cols-3 items-stretch w-full'>
        <Link
          href='/api-reference'
          className='group focus:outline-none block h-full w-full justify-self-stretch'
          aria-label='API Reference home'
        >
          <Card className='h-full w-full transition-colors group-hover:border-primary'>
            <CardHeader>
              <div className='inline-block w-fit'>
                <CardTitle className='inline-block text-lg underline-offset-4'>
                  API Reference
                </CardTitle>
                <div className='h-px w-0 bg-primary transition-[width] duration-500 group-hover:w-full' />
              </div>
              <CardDescription className='mt-3'>
                Explore all APIs and categories
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>
        {/* spacer column on md+ to create breathing room */}
        <div className='hidden md:block' aria-hidden />
        {next ? (
          <Link
            href={next.href}
            className='group focus:outline-none block h-full w-full justify-self-stretch'
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
                  Continue to the next API
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
