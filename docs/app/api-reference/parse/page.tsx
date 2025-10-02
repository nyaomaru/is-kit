import { Heading } from "@/components/ui/heading";
import { Paragraph } from "@/components/ui/paragraph";
import { CodeBlock } from "@/components/code-block";
import { ApiReferencePager } from "@/components/api-reference-pager";

const sample = `import { safeParse, safeParseWith, predicateToRefine, and, isString, isNumber } from 'is-kit';

const parseResult1 = safeParse(isString, 'ok');
if (parseResult1.valid) {
  parseResult1.value; // string
}

const isEven = predicateToRefine<number>((num) => num % 2 === 0);
const isEvenNumber = and(isNumber, isEven);
const parseEven = safeParseWith(isEvenNumber);
const parseResult2 = parseEven(4); // { valid: true, value: 4 }`;

export default function ParsePage() {
  return (
    <div className="container mx-auto px-4 py-10 space-y-6">
      <Heading variant="h1">parse</Heading>
      <Paragraph>
        Runtime-safe parsing helpers returning tagged results.
      </Paragraph>
      <CodeBlock code={sample} language="ts" />
      <ApiReferencePager currentHref="/api-reference/parse" />
    </div>
  );
}
