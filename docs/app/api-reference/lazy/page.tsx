import { ApiReferencePager } from '@/components/api-reference/pager';
import { CodeBlock } from '@/components/code/code-block';
import { Heading } from '@/components/ui/heading';
import { Paragraph } from '@/components/ui/paragraph';
import { Stack } from '@/components/ui/stack';
import { API_REFERENCE_PATHS, createApiMetadata } from '@/lib/api-metadata';

export const metadata = createApiMetadata(API_REFERENCE_PATHS.lazy);

const sample = `import { arrayOf, isString, lazy, typedStruct } from 'is-kit';
import type { Predicate } from 'is-kit';

type Tree = {
  readonly value: string;
  readonly children: readonly Tree[];
};

const isTree: Predicate<Tree> = lazy(() =>
  typedStruct<Tree>()({
    value: isString,
    children: arrayOf(isTree),
  }),
);

isTree({
  value: 'root',
  children: [{ value: 'leaf', children: [] }],
}); // true`;

export default function LazyPage() {
  return (
    <Stack variant='main' className='container mx-auto px-4 py-10' gap='xl'>
      <Stack variant='section' gap='md'>
        <Stack gap='xs'>
          <Heading variant='h1'>lazy</Heading>
          <Paragraph>
            Defer creation of a predicate until its first evaluation. This lets
            a recursive guard refer to itself while it is being defined.
          </Paragraph>
        </Stack>
        <CodeBlock code={sample} language='ts' />
      </Stack>

      <Stack variant='section' gap='sm'>
        <Heading variant='h2'>Initialization and caching</Heading>
        <Paragraph>
          The factory runs on first use, and the returned predicate is cached
          after successful initialization. If the factory throws, the error is
          propagated and a later evaluation can retry initialization.
        </Paragraph>
      </Stack>

      <Stack variant='section' gap='sm'>
        <Heading variant='h2'>Circular input values</Heading>
        <Paragraph>
          <code>lazy</code> makes recursive guard definitions possible. It does
          not detect cycles in the input value; validating cyclic data requires
          separate cycle handling.
        </Paragraph>
      </Stack>

      <ApiReferencePager currentHref={API_REFERENCE_PATHS.lazy} />
    </Stack>
  );
}
