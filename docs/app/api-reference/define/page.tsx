import { ApiReferencePager } from '@/components/api-reference-pager';
import { CodeBlock } from '@/components/code-block';
import { Heading } from '@/components/ui/heading';
import { Paragraph } from '@/components/ui/paragraph';
import { Stack } from '@/components/ui/stack';

const sample = `import { define, isString } from 'is-kit';

// Prefer generics on define<T> to avoid verbose type predicates
const isNonEmptyString = define<string>(
  (value) => isString(value) && value.length > 0
);

isNonEmptyString('foo'); // true
isNonEmptyString(''); // false`;

export default function DefinePage() {
  return (
    <Stack variant='main' className='container mx-auto px-4 py-10' gap='xl'>
      <Stack variant='section' gap='md'>
        <Heading variant='h1'>define</Heading>
        <Paragraph>
          Wrap a predicate to brand it as a guard for composition and inference
          stability.
        </Paragraph>
        <CodeBlock code={sample} language='ts' />
      </Stack>
      <ApiReferencePager currentHref='/api-reference/define' />
    </Stack>
  );
}
