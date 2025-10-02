import { Heading } from "@/components/ui/heading";
import { Paragraph } from "@/components/ui/paragraph";
import { CodeBlock } from "@/components/code-block";
import { ApiReferencePager } from "@/components/api-reference-pager";

const sample = `import { equals } from 'is-kit';

equals(1, 1); // true
equals(NaN, NaN); // true (Object.is semantics)`;

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
    <div className="container mx-auto px-4 py-10 space-y-6">
      <Heading variant="h1">equals</Heading>
      <Paragraph>
        Value equality with Object.is semantics; suitable for precise
        comparisons.
      </Paragraph>
      <CodeBlock code={sample} language="ts" />
      <Heading variant="h2" className="mt-10">
        equalsBy / equalsKey
      </Heading>
      <Paragraph className="mb-2">
        Compare by derived values or by property keys when building guards.
      </Paragraph>
      <CodeBlock language="ts" code={sampleEqualsByAndKey} />
      <ApiReferencePager currentHref="/api-reference/equals" />
    </div>
  );
}
