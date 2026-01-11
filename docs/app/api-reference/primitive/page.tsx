import { ApiReferencePager } from '@/components/api-reference/pager';
import { CodeBlock } from '@/components/code/code-block';
import { Heading } from '@/components/ui/heading';
import { Paragraph } from '@/components/ui/paragraph';
import { Stack } from '@/components/ui/stack';

const sample = `import {
  isString,
  isNumber,
  isInteger,
  isSafeInteger,
  isPositive,
  isNegative,
  isZero,
  isNaN,
  isInfiniteNumber,
  isBoolean,
  isUndefined,
  isNull,
  isBigInt,
  isSymbol,
  isPrimitive,
} from 'is-kit';

isString('a'); // true
isNumber(123); // true
isBoolean(false); // true
isUndefined(undefined); // true
isNull(null); // true
isBigInt(10n); // true
isSymbol(Symbol('x')); // true

// Check any JavaScript primitive in one go
isPrimitive('x'); // true
isPrimitive(123); // true
isPrimitive(NaN); // true (use isNumber for finite only)
isPrimitive({}); // false

// Numeric helpers
isInteger(42); // true
isSafeInteger(2 ** 53); // false
isPositive(0); // false
isNegative(-0); // false
isZero(-0); // true
isNaN(NaN); // true
isInfiniteNumber(Infinity); // true`;

export default function PrimitivePage() {
  return (
    <Stack variant='main' className='container mx-auto px-4 py-10' gap='xl'>
      <Stack variant='section' gap='md'>
        <Stack gap='xs'>
          <Heading variant='h1'>primitive</Heading>
          <Paragraph>
            Primitive value guards such as string/number/boolean and more.
            Finite numbers use <code className='mx-1'>isNumber</code> (excludes
            NaN/±Infinity). Use <code className='mx-1'>isPrimitive</code> to
            accept any primitive (string, number, boolean, bigint, symbol,
            undefined, null). Numeric helpers are available:{' '}
            <code className='mx-1'>isInteger</code>,
            <code className='mx-1'>isSafeInteger</code>,
            <code className='mx-1'>isPositive</code>,
            <code className='mx-1'>isNegative</code>,
            <code className='mx-1'>isZero</code>,
            <code className='mx-1'>isNaN</code>,
            <code className='mx-1'>isInfiniteNumber</code>.
          </Paragraph>
        </Stack>
        <CodeBlock code={sample} language='ts' />
      </Stack>
      <ApiReferencePager currentHref='/api-reference/primitive' />
    </Stack>
  );
}
