import { ApiReferencePager } from '@/components/api-reference-pager';
import { CodeBlock } from '@/components/code-block';
import { Heading } from '@/components/ui/heading';
import { Paragraph } from '@/components/ui/paragraph';
import { Stack } from '@/components/ui/stack';

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
    <Stack variant='main' className='container mx-auto px-4 py-10' gap='xl'>
      <Stack variant='section' gap='md'>
        <Stack gap='xs'>
          <Heading variant='h1'>parse</Heading>
          <Paragraph>
            Runtime-safe parsing helpers returning tagged results.
          </Paragraph>
        </Stack>
        <CodeBlock code={sample} language='ts' />
      </Stack>
      <ApiReferencePager currentHref='/api-reference/parse' />
    </Stack>
  );
}
