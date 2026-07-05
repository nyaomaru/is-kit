import { ApiReferencePager } from '@/components/api-reference/pager';
import { CodeBlock } from '@/components/code/code-block';
import { Heading } from '@/components/ui/heading';
import { Paragraph } from '@/components/ui/paragraph';
import { Stack } from '@/components/ui/stack';

const sample = `import { isNil, isString, nullable, nonNull, nullish, optional, required } from 'is-kit';

isNil(null); // true
isNil(undefined); // true
isNil(0); // false
// isNil checks a value directly for null | undefined.

const maybeString = nullable(isString);
maybeString(null); // true

const notNull = nonNull(isString);
notNull('x'); // true

const maybe = nullish(isString);
maybe(undefined); // true
// nullish(isString) widens isString to also accept null or undefined.

const maybeUndef = optional(isString);
maybeUndef(undefined); // true

const needValue = required(optional(isString));
needValue('ok'); // true

// isNil checks the value itself.
// nullish(...) widens another guard to accept null or undefined.
// optional(...) is value-level.
// For struct key-level optional properties, use optionalKey(...).`;

export default function NullishPage() {
  return (
    <Stack variant='main' className='container mx-auto px-4 py-10' gap='xl'>
      <Stack variant='section' gap='md'>
        <Stack gap='xs'>
          <Heading variant='h1'>nullish</Heading>
          <Paragraph>
            Nullability helpers to widen or narrow values such as{' '}
            <code>undefined</code> and <code>null</code>. For key-level optional
            fields inside <code>struct</code>, use <code>optionalKey(...)</code>
            instead. Use <code className='mx-1'>isNil</code> when you only need
            to check whether the value itself is <code>null</code> or{' '}
            <code>undefined</code>.
          </Paragraph>
        </Stack>
        <CodeBlock code={sample} language='ts' />
      </Stack>
      <ApiReferencePager currentHref='/api-reference/nullish' />
    </Stack>
  );
}
