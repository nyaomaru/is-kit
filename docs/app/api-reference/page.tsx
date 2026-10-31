import { DocsCardGrid } from '@/components/navigation/docs-card-link';
import { Heading } from '@/components/ui/heading';
import { Paragraph } from '@/components/ui/paragraph';
import { Stack } from '@/components/ui/stack';
import { API_ITEMS } from '@/constants/api-catalog';
import { API_REFERENCE_PATHS, createApiMetadata } from '@/lib/api-metadata';

export const metadata = createApiMetadata(API_REFERENCE_PATHS.index);

export default function ApiIndexPage() {
  return (
    <Stack variant='main' className='container mx-auto px-4 py-10' gap='xl'>
      <Stack variant='section' gap='sm'>
        <Stack gap='xs'>
          <Heading variant='h1'>API Reference</Heading>
          <Paragraph className='text-muted-foreground'>
            Explore the available functions, combinators, and public types. Use
            the sidebar to navigate.
          </Paragraph>
        </Stack>
      </Stack>
      <DocsCardGrid items={API_ITEMS} />
    </Stack>
  );
}
