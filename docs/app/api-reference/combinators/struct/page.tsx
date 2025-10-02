import { Heading } from "@/components/ui/heading";
import { Paragraph } from "@/components/ui/paragraph";
import { CodeBlock } from "@/components/code-block";
import { ApiReferencePager } from "@/components/api-reference-pager";

const sample = `import { struct, isString, isNumber } from 'is-kit';

const isUser = struct({ id: isNumber, name: isString });
isUser({ id: 1, name: 'A' }); // true

const isExactUser = struct({ id: isNumber, name: isString }, { exact: true });
isExactUser({ id: 1, name: 'A', extra: 1 }); // false`;

export default function StructPage() {
  return (
    <div className="container mx-auto px-4 py-10 space-y-6">
      <Heading variant="h1">struct</Heading>
      <Paragraph>
        Shape guard for objects; supports exact key checking via options.
      </Paragraph>
      <CodeBlock code={sample} language="ts" />
      <ApiReferencePager currentHref="/api-reference/combinators/struct" />
    </div>
  );
}
