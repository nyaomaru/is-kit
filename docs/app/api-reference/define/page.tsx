import { Heading } from "@/components/ui/heading";
import { Paragraph } from "@/components/ui/paragraph";
import { CodeBlock } from "@/components/code-block";
import { ApiReferencePager } from "@/components/api-reference-pager";

const sample = `import { define, isString } from 'is-kit';

// Prefer generics on define<T> to avoid verbose type predicates
const isNonEmptyString = define<string>(
  (value) => isString(value) && value.length > 0
);

isNonEmptyString('foo'); // true
isNonEmptyString(''); // false`;

export default function DefinePage() {
  return (
    <div className="container mx-auto px-4 py-10 space-y-6">
      <Heading variant="h1">define</Heading>
      <Paragraph>
        Wrap a predicate to brand it as a guard for composition and inference
        stability.
      </Paragraph>
      <CodeBlock code={sample} language="ts" />
      <ApiReferencePager currentHref="/api-reference/define" />
    </div>
  );
}
