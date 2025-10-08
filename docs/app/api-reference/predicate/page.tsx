import { ApiReferencePager } from '@/components/api-reference-pager';
import { CodeBlock } from '@/components/code-block';
import { Heading } from '@/components/ui/heading';
import { Paragraph } from '@/components/ui/paragraph';
import { Stack } from '@/components/ui/stack';

const sample = `import { predicateToRefine, and, isNumber } from 'is-kit';

const isPositive = predicateToRefine<number>((n) => n > 0);
const isPositiveNumber = and(isNumber, isPositive);
isPositiveNumber(3); // true

const isEvenBool = (n: number) => n % 2 === 0;
const isEvenRefine = predicateToRefine<number>(isEvenBool);

const isEvenNumber = and(isNumber, isEvenRefine);
isEvenNumber(3); // false
isEvenNumber(4); // true
`;

const sampleTrueRefinement = `import { and, isNumber } from 'is-kit';

// True refinement (branded type) — the type actually narrows
type Positive = number & { readonly __brand: 'Positive' };

const isPositive = (n: number): n is Positive => n > 0;

const isPositiveNumber = and(isNumber, isPositive);
// (x: unknown) => x is Positive

function sqrtOfPositive(n: Positive): number { return Math.sqrt(n); }

const maybeNumber: unknown = 9;
if (isPositiveNumber(maybeNumber)) {
  sqrtOfPositive(maybeNumber); // OK — narrowed to Positive
}`;

export default function PredicatePage() {
  return (
    <Stack variant='main' className='container mx-auto px-4 py-10' gap='xl'>
      <Stack variant='section' gap='md'>
        <Stack gap='xs'>
          <Heading variant='h1'>predicate</Heading>
          <Paragraph>
            Helpers to adapt boolean predicates to refinements.
          </Paragraph>
        </Stack>
        <CodeBlock code={sample} language='ts' />
      </Stack>
      <Stack variant='section' gap='md'>
        <Stack gap='xs'>
          <Heading variant='h2'>True refinement (brand) example</Heading>
          <Paragraph className='text-muted-foreground'>
            When you want the type to actually narrow, define a true refinement
            on your side (e.g., a branded type) and compose it with and().
          </Paragraph>
        </Stack>
        <CodeBlock code={sampleTrueRefinement} language='ts' />
      </Stack>
      <ApiReferencePager currentHref='/api-reference/predicate' />
    </Stack>
  );
}
