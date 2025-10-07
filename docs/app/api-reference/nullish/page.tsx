import { ApiReferencePager } from '@/components/api-reference-pager';
import { CodeBlock } from '@/components/code-block';
import { Heading } from '@/components/ui/heading';
import { Paragraph } from '@/components/ui/paragraph';
import { Stack } from '@/components/ui/stack';

const sample = `import { isString, nullable, nonNull, nullish, optional, required } from 'is-kit';

const maybeString = nullable(isString);
maybeString(null); // true

const notNull = nonNull(isString);
notNull('x'); // true

const maybe = nullish(isString);
maybe(undefined); // true

const maybeUndef = optional(isString);
maybeUndef(undefined); // true

const needValue = required(optional(isString));
needValue('ok'); // true`;

export default function NullishPage() {
  return (
    <Stack variant='main' className='container mx-auto px-4 py-10' gap='xl'>
      <Stack variant='section' gap='md'>
        <Heading variant='h1'>nullish</Heading>
        <Paragraph>
          Nullability helpers to widen or narrow optionality.
        </Paragraph>
        <CodeBlock code={sample} language='ts' />
      </Stack>
      <ApiReferencePager currentHref='/api-reference/nullish' />
    </Stack>
  );
}
