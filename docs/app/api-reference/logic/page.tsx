import { ApiReferencePager } from '@/components/api-reference-pager';
import { CodeBlock } from '@/components/code-block';
import { Heading } from '@/components/ui/heading';
import { Paragraph } from '@/components/ui/paragraph';
import { Stack } from '@/components/ui/stack';

const sample = `import { and, or, not, predicateToRefine, isString, isNumber } from 'is-kit';

// Clearer name for the min-length rule
const isLongLiteral = predicateToRefine<string>((value) => value.length > 3);

const isLongString = and(isString, isLongLiteral);
isLongString('abcd'); // true
isLongString('ab');   // false
isLongString(123 as unknown); // false

// Type narrowing example
declare const maybeString: unknown;
if (isLongString(maybeString)) {
  maybeString.toUpperCase(); // narrowed to string
}
or(isString, isNumber)('foo'); // true
not(isString)(123); // true`;

const sampleAndAll = `import { andAll, predicateToRefine, isString } from 'is-kit';

// Chain multiple string checks with andAll
const minLen4 = predicateToRefine<string>((value) => value.length >= 4);
const startsWithA = predicateToRefine<string>((value) => value.startsWith('A'));

const isShortTitle = andAll(isString, minLen4, startsWithA);

isShortTitle('Axel'); // true
isShortTitle('Bob'); // false (does not start with A)
isShortTitle('ABC'); // false (length < 4)`;

const sampleGuardIn = `import { and, guardIn } from 'is-kit';

// Adapt a guard to a broader domain, then compose extra rules
type Shape = { kind: 'rect' | 'circle' };
type Circle = { kind: 'circle'; radius: number };

const isCircle = (input: unknown): input is Circle =>
  typeof input === 'object' && input !== null && (input as any).kind === 'circle';

// Make it work as a refinement within Shape
const circleInShape = guardIn<Shape>()(isCircle); // Refine<Shape, Circle>

// Add a runtime-only rule (type stays Circle)
const positiveRadius = (circle: Circle): circle is Circle => circle.radius > 0;

const validCircle = and(circleInShape, positiveRadius);

const shapeCircleValid: Shape = { kind: 'circle', radius: 10 };
const shapeCircleNegativeRadius: Shape = { kind: 'circle', radius: -1 };
const shapeRect: Shape = { kind: 'rect' } as any;

validCircle(shapeCircleValid); // true
validCircle(shapeCircleNegativeRadius); // false (radius not positive)
validCircle(shapeRect); // false (not a circle)`;

export default function LogicPage() {
  return (
    <Stack variant='main' className='container mx-auto px-4 py-10' gap='xl'>
      <Stack variant='section' gap='md'>
        <Heading variant='h1'>logic</Heading>
        <Paragraph>
          Logical combinators to compose guards and refinements in a type-safe
          way.
        </Paragraph>
        <CodeBlock code={sample} language='ts' />
      </Stack>
      <Stack variant='section' gap='md'>
        <Heading variant='h2'>andAll</Heading>
        <Paragraph>Chain multiple refinements after a precondition.</Paragraph>
        <CodeBlock language='ts' code={sampleAndAll} />
      </Stack>
      <Stack variant='section' gap='md'>
        <Heading variant='h2'>guardIn</Heading>
        <Paragraph>Adapt a guard to a broader domain and keep composing.</Paragraph>
        <CodeBlock language='ts' code={sampleGuardIn} />
      </Stack>
      <ApiReferencePager currentHref='/api-reference/logic' />
    </Stack>
  );
}
