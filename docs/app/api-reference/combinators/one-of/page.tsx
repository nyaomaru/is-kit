import { ApiReferencePager } from '@/components/api-reference/pager';
import { CodeBlock } from '@/components/code/code-block';
import { Heading } from '@/components/ui/heading';
import { Paragraph } from '@/components/ui/paragraph';
import { Stack } from '@/components/ui/stack';

const sample = `import { oneOf, isString, isNumber } from 'is-kit';

// Use varargs with oneOf for union guard composition
const isStringOrNumber = oneOf(isString, isNumber);
isStringOrNumber('x'); // true
isStringOrNumber(1); // true
isStringOrNumber(true); // false`;

export default function OneOfPage() {
  return (
    <Stack variant='main' className='container mx-auto px-4 py-10' gap='xl'>
      <Stack variant='section' gap='md'>
        <Stack gap='xs'>
          <Heading variant='h1'>oneOf</Heading>
          <Paragraph>
            Guard that passes when any provided guard passes.
          </Paragraph>
        </Stack>
        <CodeBlock code={sample} language='ts' />
      </Stack>
      <ApiReferencePager currentHref='/api-reference/combinators/one-of' />
    </Stack>
  );
}
