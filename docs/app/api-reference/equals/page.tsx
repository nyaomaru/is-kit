import { ApiReferencePager } from '@/components/api-reference-pager';
import { CodeBlock } from '@/components/code-block';
import { Heading } from '@/components/ui/heading';
import { Paragraph } from '@/components/ui/paragraph';
import { Stack } from '@/components/ui/stack';

const sample = `import { equals } from 'is-kit';

// Object.is semantics are preserved
equals(NaN)(NaN); // true

// Literal guards narrow discriminated unions
const isDone = equals('done' as const);
// isDone: (value: unknown) => value is 'done'

type Status = 'draft' | 'in-progress' | 'done';

function isFinished(status: Status) {
  if (isDone(status)) {
    // Narrowed to the literal type 'done' inside this branch
    return true;
  }
  return false;
}

isFinished('draft'); // false
isFinished('done'); // true`;

const sampleEqualsByAndKey = `import { equalsBy, equalsKey, isString } from 'is-kit';

// Build a comparator in two steps for clarity
const lengthOfString = equalsBy(isString)((s) => s.length);
const isLength3 = lengthOfString(3 as const);
isLength3('foo'); // true

// Key-based equality guard
const hasId1 = equalsKey('id', 1 as const);
hasId1({ id: 1 }); // true`;

export default function EqualsPage() {
  return (
    <Stack variant='main' className='container mx-auto px-4 py-10' gap='xl'>
      <Stack variant='section' gap='sm'>
        <Stack gap='xs'>
          <Heading variant='h1'>equals</Heading>
          <Paragraph>
            Value equality with Object.is semantics; suitable for precise
            comparisons.
          </Paragraph>
        </Stack>
        <CodeBlock code={sample} language='ts' />
      </Stack>
      <Stack variant='section' gap='sm'>
        <Stack gap='xs'>
          <Heading variant='h2'>equalsBy / equalsKey</Heading>
          <Paragraph>
            Compare by derived values or by property keys when building guards.
          </Paragraph>
        </Stack>
        <CodeBlock language='ts' code={sampleEqualsByAndKey} />
      </Stack>
      <ApiReferencePager currentHref='/api-reference/equals' />
    </Stack>
  );
}
