import { ApiReferencePager } from '@/components/api-reference-pager';
import { CodeBlock } from '@/components/code-block';
import { Heading } from '@/components/ui/heading';
import { Paragraph } from '@/components/ui/paragraph';
import { Stack } from '@/components/ui/stack';

const sample = `import {
  isFunction,
  isObject,
  isPlainObject,
  isArray,
  isDate,
  isRegExp,
  isMap,
  isSet,
  isPromiseLike,
  isIterable,
  isAsyncIterable,
  isArrayBuffer,
  isDataView,
  isTypedArray,
  isError,
  isURL,
  isBlob,
} from 'is-kit';

// Function / Object basics
isFunction(() => {}); // true
isObject({}); // true
isObject(null); // false
isPlainObject({ a: 1 }); // true
isPlainObject(Object.create(null)); // true

// Collections
isArray([]); // true
isMap(new Map()); // true
isSet(new Set()); // true

// Date / RegExp
isDate(new Date()); // true
isDate(new Date('invalid')); // false
isRegExp(/abc/); // true

// Promise-like / Iterables
isPromiseLike(Promise.resolve()); // true
isPromiseLike({ then() {} }); // true
isIterable(new Set([1, 2, 3])); // true
const asyncGen = (async function* () { yield 1; })();
isAsyncIterable(asyncGen); // true

// Binary data
isArrayBuffer(new ArrayBuffer(8)); // true
isDataView(new DataView(new ArrayBuffer(8))); // true
isTypedArray(new Uint8Array([1, 2])); // true

// Errors and web types
isError(new Error('boom')); // true
isURL(new URL('https://example.com')); // true
isBlob(new Blob(['hi'])); // true`;

export default function ObjectPage() {
  return (
    <Stack variant='main' className='container mx-auto px-4 py-10' gap='xl'>
      <Stack variant='section' gap='md'>
        <Heading variant='h1'>object</Heading>
        <Paragraph>Object/collection/structured data guards.</Paragraph>
        <CodeBlock code={sample} language='ts' />
      </Stack>
      <ApiReferencePager currentHref='/api-reference/object' />
    </Stack>
  );
}
