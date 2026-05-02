import { ApiReferencePager } from '@/components/api-reference/pager';
import { CodeBlock } from '@/components/code/code-block';
import { Heading } from '@/components/ui/heading';
import { Paragraph } from '@/components/ui/paragraph';
import { Stack } from '@/components/ui/stack';

const sample = `import { nonEmptyArrayOf, isString } from 'is-kit';

const isTagList = nonEmptyArrayOf(isString);

isTagList([]); // false
isTagList(['news']); // true
isTagList(['news', 'tech']); // true
isTagList(['news', 1]); // false`;

export default function NonEmptyArrayOfPage() {
  return (
    <Stack variant='main' className='container mx-auto px-4 py-10' gap='xl'>
      <Stack variant='section' gap='md'>
        <Stack gap='xs'>
          <Heading variant='h1'>nonEmptyArrayOf</Heading>
          <Paragraph>
            Guard for homogeneous arrays that must contain at least one element.
          </Paragraph>
        </Stack>
        <CodeBlock code={sample} language='ts' />
      </Stack>
      <ApiReferencePager currentHref='/api-reference/combinators/non-empty-array-of' />
    </Stack>
  );
}
