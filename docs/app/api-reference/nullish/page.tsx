import { ApiReferencePager } from '@/components/api-reference/pager';
import { CodeBlock } from '@/components/code/code-block';
import { Heading } from '@/components/ui/heading';
import { Paragraph } from '@/components/ui/paragraph';
import { Stack } from '@/components/ui/stack';
import { API_REFERENCE_PATHS, createApiMetadata } from '@/lib/api-metadata';

export const metadata = createApiMetadata(API_REFERENCE_PATHS.nullish);

const sample = `import {
  isNil,
  isNotNil,
  isString,
  nullable,
  nonNull,
  nullish,
  optional,
  required,
} from 'is-kit';

isNil(null); // true
isNil(undefined); // true
isNil(0); // false
// isNil checks a value directly for null | undefined.

const values: Array<string | null | undefined> = ['value', null, undefined];
const presentValues = values.filter(isNotNil); // string[]
// isNotNil excludes null | undefined and preserves generic narrowing.

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
            instead. Use <code className='mx-1'>isNil</code> to check whether a
            value is nullish, and <code className='mx-1'>isNotNil</code> for the
            inverse check or to remove nullish array entries while preserving
            their narrowed element type.
          </Paragraph>
        </Stack>
        <CodeBlock code={sample} language='ts' />
      </Stack>
      <ApiReferencePager currentHref={API_REFERENCE_PATHS.nullish} />
    </Stack>
  );
}
