import { ApiReferencePager } from '@/components/api-reference-pager';
import { CodeBlock } from '@/components/code-block';
import { Heading } from '@/components/ui/heading';
import { Paragraph } from '@/components/ui/paragraph';
import { Stack } from '@/components/ui/stack';

const sample = `import { recordOf, isString, isNumber } from 'is-kit';

const isStringNumberRecord = recordOf(isString, isNumber);
isStringNumberRecord({ a: 1, b: 2 }); // true
isStringNumberRecord({ a: 'x' }); // false`;

export default function RecordOfPage() {
  return (
    <Stack variant='main' className='container mx-auto px-4 py-10' gap='xl'>
      <Stack variant='section' gap='md'>
        <Stack gap='xs'>
          <Heading variant='h1'>recordOf</Heading>
          <Paragraph>
            Guard for records with guards for keys and values.
          </Paragraph>
        </Stack>
        <CodeBlock code={sample} language='ts' />
      </Stack>
      <ApiReferencePager currentHref='/api-reference/combinators/record-of' />
    </Stack>
  );
}
