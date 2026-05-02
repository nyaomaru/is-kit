import { ApiReferencePager } from '@/components/api-reference/pager';
import { CodeBlock } from '@/components/code/code-block';
import { Heading } from '@/components/ui/heading';
import { Paragraph } from '@/components/ui/paragraph';
import { Stack } from '@/components/ui/stack';

const sample = `import { arrayOf, nonEmptyArrayOf, isString } from 'is-kit';

const isStringArray = arrayOf(isString);
isStringArray(['a', 'b']); // true
isStringArray(['a', 1]); // false

const isNonEmptyStringArray = nonEmptyArrayOf(isString);
isNonEmptyStringArray([]); // false
isNonEmptyStringArray(['a']); // true`;

export default function ArrayOfPage() {
  return (
    <Stack variant='main' className='container mx-auto px-4 py-10' gap='xl'>
      <Stack variant='section' gap='md'>
        <Stack gap='xs'>
          <Heading variant='h1'>arrayOf</Heading>
          <Paragraph>
            Guard for homogeneous arrays with an element guard. Use{' '}
            <code>nonEmptyArrayOf(...)</code> when empty arrays should fail.
          </Paragraph>
        </Stack>
        <CodeBlock code={sample} language='ts' />
      </Stack>
      <ApiReferencePager currentHref='/api-reference/combinators/array-of' />
    </Stack>
  );
}
