import { ApiReferencePager } from '@/components/api-reference/pager';
import { CodeBlock } from '@/components/code/code-block';
import { Heading } from '@/components/ui/heading';
import { Paragraph } from '@/components/ui/paragraph';
import { Stack } from '@/components/ui/stack';

const sample = `import { mapOf, isString, isNumber } from 'is-kit';

const isScoreMap = mapOf(isString, isNumber);
isScoreMap(new Map([['math', 98], ['english', 91]])); // true
isScoreMap(new Map([['math', '98']])); // false`;

export default function MapOfPage() {
  return (
    <Stack variant='main' className='container mx-auto px-4 py-10' gap='xl'>
      <Stack variant='section' gap='md'>
        <Stack gap='xs'>
          <Heading variant='h1'>mapOf</Heading>
          <Paragraph>
            Guard for maps where every key and value must satisfy their guards.
          </Paragraph>
        </Stack>
        <CodeBlock code={sample} language='ts' />
      </Stack>
      <ApiReferencePager currentHref='/api-reference/combinators/map-of' />
    </Stack>
  );
}
