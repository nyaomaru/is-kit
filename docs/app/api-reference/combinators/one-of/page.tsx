import { Heading } from "@/components/ui/heading";
import { Paragraph } from "@/components/ui/paragraph";
import { CodeBlock } from "@/components/code-block";
import { ApiReferencePager } from "@/components/api-reference-pager";

const sample = `import { oneOf, isString, isNumber } from 'is-kit';

// Use varargs with oneOf for union guard composition
const isStringOrNumber = oneOf(isString, isNumber);
isStringOrNumber('x'); // true
isStringOrNumber(1); // true
isStringOrNumber(true); // false`;

export default function OneOfPage() {
  return (
    <div className="container mx-auto px-4 py-10 space-y-6">
      <Heading variant="h1">oneOf</Heading>
      <Paragraph>Guard that passes when any provided guard passes.</Paragraph>
      <CodeBlock code={sample} language="ts" />
      <ApiReferencePager currentHref="/api-reference/combinators/one-of" />
    </div>
  );
}
