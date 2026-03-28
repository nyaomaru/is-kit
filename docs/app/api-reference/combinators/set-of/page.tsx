import { ApiReferencePager } from '@/components/api-reference/pager';
import { CodeBlock } from '@/components/code/code-block';
import { Heading } from '@/components/ui/heading';
import { Paragraph } from '@/components/ui/paragraph';
import { Stack } from '@/components/ui/stack';

const sample = `import { setOf, isString } from 'is-kit';

const isStringSet = setOf(isString);
isStringSet(new Set(['a', 'b'])); // true
isStringSet(new Set(['a', 1])); // false`;

export default function SetOfPage() {
  return (
    <Stack variant='main' className='container mx-auto px-4 py-10' gap='xl'>
      <Stack variant='section' gap='md'>
        <Stack gap='xs'>
          <Heading variant='h1'>setOf</Heading>
          <Paragraph>
            Guard for sets where every value must satisfy the provided guard.
          </Paragraph>
        </Stack>
        <CodeBlock code={sample} language='ts' />
      </Stack>
      <ApiReferencePager currentHref='/api-reference/combinators/set-of' />
    </Stack>
  );
}
