import { ApiReferencePager } from '@/components/api-reference/pager';
import { CodeBlock } from '@/components/code/code-block';
import { Heading } from '@/components/ui/heading';
import { Paragraph } from '@/components/ui/paragraph';
import { Stack } from '@/components/ui/stack';

const sample = `import { oneOfValues } from 'is-kit';

const isHttpMethod = oneOfValues(['GET', 'POST', 'PUT', 'DELETE'] as const);
isHttpMethod('POST'); // true
isHttpMethod('PATCH'); // false`;

export default function OneOfValuesPage() {
  return (
    <Stack variant='main' className='container mx-auto px-4 py-10' gap='xl'>
      <Stack variant='section' gap='md'>
        <Stack gap='xs'>
          <Heading variant='h1'>oneOfValues</Heading>
          <Paragraph>
            Guard for literal value sets; uses exact equality semantics.
          </Paragraph>
        </Stack>
        <CodeBlock code={sample} language='ts' />
      </Stack>
      <ApiReferencePager currentHref='/api-reference/combinators/one-of-values' />
    </Stack>
  );
}
