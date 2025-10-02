import { Heading } from "@/components/ui/heading";
import { Paragraph } from "@/components/ui/paragraph";
import { CodeBlock } from "@/components/code-block";
import { ApiReferencePager } from "@/components/api-reference-pager";

const sample = `import { arrayOf, isString } from 'is-kit';

const isStringArray = arrayOf(isString);
isStringArray(['a', 'b']); // true
isStringArray(['a', 1]); // false`;

export default function ArrayOfPage() {
  return (
    <div className="container mx-auto px-4 py-10 space-y-6">
      <Heading variant="h1">arrayOf</Heading>
      <Paragraph>Guard for homogeneous arrays with element guard.</Paragraph>
      <CodeBlock code={sample} language="ts" />
      <ApiReferencePager currentHref="/api-reference/combinators/array-of" />
    </div>
  );
}
