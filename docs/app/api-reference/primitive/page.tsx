import { ApiReferencePager } from '@/components/api-reference/pager';
import { CodeBlock } from '@/components/code/code-block';
import { Heading } from '@/components/ui/heading';
import { Paragraph } from '@/components/ui/paragraph';
import { Stack } from '@/components/ui/stack';

const sample = `import { isString, isNumber, isBoolean, isUndefined, isNull, isBigInt, isSymbol, isPrimitive } from 'is-kit';

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
isPrimitive({}); // false`;

export default function PrimitivePage() {
  return (
    <Stack variant='main' className='container mx-auto px-4 py-10' gap='xl'>
      <Stack variant='section' gap='md'>
        <Stack gap='xs'>
          <Heading variant='h1'>primitive</Heading>
          <Paragraph>
            Primitive value guards such as string/number/boolean and more. Use
            <code className='mx-1'>isPrimitive</code> to accept any primitive
            (string, number, boolean, bigint, symbol, undefined, null).
          </Paragraph>
        </Stack>
        <CodeBlock code={sample} language='ts' />
      </Stack>
      <ApiReferencePager currentHref='/api-reference/primitive' />
    </Stack>
  );
}
