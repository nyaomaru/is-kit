import Link from 'next/link';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Heading } from '@/components/ui/heading';
import { Paragraph } from '@/components/ui/paragraph';
import { Stack } from '@/components/ui/stack';
import { GUIDE_ITEMS, GUIDE_PATHS } from '@/constants/guides';
import { createGuideMetadata } from '@/lib/guide-metadata';

export const metadata = createGuideMetadata(GUIDE_PATHS.index);

export default function GuidesIndexPage() {
  return (
    <Stack variant='main' className='container mx-auto px-4 py-10' gap='xl'>
      <Stack variant='section' gap='xs'>
        <Heading variant='h1'>Practical Guides</Heading>
        <Paragraph className='max-w-3xl text-muted-foreground'>
          Start with a real TypeScript problem. Each guide explains the
          tradeoffs, builds a focused solution, and links to the relevant API
          reference.
        </Paragraph>
      </Stack>
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
        {GUIDE_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className='group focus:outline-hidden'
          >
            <Card className='h-full transition-colors group-hover:border-primary'>
              <CardHeader>
                <div className='inline-block w-fit'>
                  <CardTitle className='inline-block text-lg leading-snug underline-offset-4'>
                    {item.title}
                  </CardTitle>
                  <div className='h-px w-0 bg-primary transition-[width] duration-500 group-hover:w-full' />
                </div>
                <CardDescription className='mt-3'>
                  {item.description}
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </Stack>
  );
}
