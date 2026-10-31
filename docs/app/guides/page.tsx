import { DocsCardGrid } from '@/components/navigation/docs-card-link';
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
      <DocsCardGrid items={GUIDE_ITEMS} titleClassName='leading-snug' />
    </Stack>
  );
}
