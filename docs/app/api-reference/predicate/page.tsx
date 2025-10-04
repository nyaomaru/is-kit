import { Heading } from "@/components/ui/heading";
import { Paragraph } from "@/components/ui/paragraph";
import { CodeBlock } from "@/components/code-block";
import { ApiReferencePager } from "@/components/api-reference-pager";

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
    <div className="container mx-auto px-4 py-10 space-y-6">
      <Heading variant="h1">predicate</Heading>
      <Paragraph>Helpers to adapt boolean predicates to refinements.</Paragraph>
      <CodeBlock code={sample} language="ts" />
      <Heading variant="h2" className="mt-8">
        True refinement (brand) example
      </Heading>
      <Paragraph className="text-muted-foreground">
        When you want the type to actually narrow, define a true refinement on
        your side (e.g., a branded type) and compose it with and().
      </Paragraph>
      <CodeBlock code={sampleTrueRefinement} language="ts" />
      <ApiReferencePager currentHref="/api-reference/predicate" />
    </div>
  );
}
