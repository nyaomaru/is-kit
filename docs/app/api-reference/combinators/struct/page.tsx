import { ApiReferencePager } from '@/components/api-reference-pager';
import { CodeBlock } from '@/components/code-block';
import { Heading } from '@/components/ui/heading';
import { Paragraph } from '@/components/ui/paragraph';
import { Stack } from '@/components/ui/stack';

const sample = `import { struct, isString, isNumber } from 'is-kit';

const isUser = struct({ id: isNumber, name: isString });
isUser({ id: 1, name: 'A' }); // true

const isExactUser = struct({ id: isNumber, name: isString }, { exact: true });
isExactUser({ id: 1, name: 'A', extra: 1 }); // false`;

export default function StructPage() {
  return (
    <Stack variant='main' className='container mx-auto px-4 py-10' gap='xl'>
      <Stack variant='section' gap='md'>
        <Heading variant='h1'>struct</Heading>
        <Paragraph>
          Shape guard for objects; supports exact key checking via options.
        </Paragraph>
        <CodeBlock code={sample} language='ts' />
      </Stack>
      <ApiReferencePager currentHref='/api-reference/combinators/struct' />
    </Stack>
  );
}
