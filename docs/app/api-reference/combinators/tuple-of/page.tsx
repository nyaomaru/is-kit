import { Heading } from "@/components/ui/heading";
import { Paragraph } from "@/components/ui/paragraph";
import { CodeBlock } from "@/components/code-block";
import { ApiReferencePager } from "@/components/api-reference-pager";

const sample = `import { tupleOf, isString, isNumber } from 'is-kit';

// Use varargs with tupleOf for best inference
const isPair = tupleOf(isString, isNumber);
isPair(['x', 1]); // true
isPair(['x']); // false`;

export default function TupleOfPage() {
  return (
    <div className="container mx-auto px-4 py-10 space-y-6">
      <Heading variant="h1">tupleOf</Heading>
      <Paragraph>
        Guard for fixed-length tuples with per-index guards.
      </Paragraph>
      <CodeBlock code={sample} language="ts" />
      <ApiReferencePager currentHref="/api-reference/combinators/tuple-of" />
    </div>
  );
}
