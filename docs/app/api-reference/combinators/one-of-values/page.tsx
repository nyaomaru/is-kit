import { Heading } from "@/components/ui/heading";
import { Paragraph } from "@/components/ui/paragraph";
import { CodeBlock } from "@/components/code-block";
import { ApiReferencePager } from "@/components/api-reference-pager";

const sample = `import { oneOfValues } from 'is-kit';

const isHttpMethod = oneOfValues(['GET', 'POST', 'PUT', 'DELETE'] as const);
isHttpMethod('POST'); // true
isHttpMethod('PATCH'); // false`;

export default function OneOfValuesPage() {
  return (
    <div className="container mx-auto px-4 py-10 space-y-6">
      <Heading variant="h1">oneOfValues</Heading>
      <Paragraph>
        Guard for literal value sets; uses exact equality semantics.
      </Paragraph>
      <CodeBlock code={sample} language="ts" />
      <ApiReferencePager currentHref="/api-reference/combinators/one-of-values" />
    </div>
  );
}
