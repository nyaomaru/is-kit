import { Heading } from "@/components/ui/heading";
import { Paragraph } from "@/components/ui/paragraph";
import { CodeBlock } from "@/components/code-block";
import { ApiReferencePager } from "@/components/api-reference-pager";

const sample = `import { isString, isNumber, isBoolean, isUndefined, isNull, isBigInt, isSymbol } from 'is-kit';

isString('a'); // true
isNumber(123); // true
isBoolean(false); // true
isUndefined(undefined); // true
isNull(null); // true
isBigInt(10n); // true
isSymbol(Symbol('x')); // true`;

export default function PrimitivePage() {
  return (
    <div className="container mx-auto px-4 py-10 space-y-6">
      <Heading variant="h1">primitive</Heading>
      <Paragraph>
        Primitive value guards such as string/number/boolean and more.
      </Paragraph>
      <CodeBlock code={sample} language="ts" />
      <ApiReferencePager currentHref="/api-reference/primitive" />
    </div>
  );
}
