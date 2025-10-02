import { Heading } from "@/components/ui/heading";
import { Paragraph } from "@/components/ui/paragraph";
import { CodeBlock } from "@/components/code-block";
import { ApiReferencePager } from "@/components/api-reference-pager";

const sample = `import { recordOf, isString, isNumber } from 'is-kit';

const isStringNumberRecord = recordOf(isString, isNumber);
isStringNumberRecord({ a: 1, b: 2 }); // true
isStringNumberRecord({ a: 'x' }); // false`;

export default function RecordOfPage() {
  return (
    <div className="container mx-auto px-4 py-10 space-y-6">
      <Heading variant="h1">recordOf</Heading>
      <Paragraph>Guard for records with guards for keys and values.</Paragraph>
      <CodeBlock code={sample} language="ts" />
      <ApiReferencePager currentHref="/api-reference/combinators/record-of" />
    </div>
  );
}
