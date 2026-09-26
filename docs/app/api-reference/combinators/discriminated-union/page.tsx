import { ApiReferencePager } from '@/components/api-reference/pager';
import { CodeBlock } from '@/components/code/code-block';
import { Heading } from '@/components/ui/heading';
import { Paragraph } from '@/components/ui/paragraph';
import { Stack } from '@/components/ui/stack';
import { API_REFERENCE_PATHS, createApiMetadata } from '@/lib/api-metadata';

export const metadata = createApiMetadata(
  API_REFERENCE_PATHS.discriminatedUnion
);

const sample = `import {
  discriminatedUnion,
  isNumber,
  oneOfValues,
  typedStruct,
} from 'is-kit';

type Event =
  | { kind: 'click'; x: number; y: number }
  | { kind: 'scroll'; delta: number };

const isEvent = discriminatedUnion<Event>()('kind', {
  click: typedStruct<Extract<Event, { kind: 'click' }>>()({
    kind: oneOfValues('click'),
    x: isNumber,
    y: isNumber,
  }),
  scroll: typedStruct<Extract<Event, { kind: 'scroll' }>>()({
    kind: oneOfValues('scroll'),
    delta: isNumber,
  }),
});

isEvent({ kind: 'click', x: 12, y: 24 }); // true
isEvent({ kind: 'hover', target: 'button' }); // false

// TypeScript error: the scroll branch is required.
discriminatedUnion<Event>()('kind', {
  click: typedStruct<Extract<Event, { kind: 'click' }>>()({
    kind: oneOfValues('click'),
    x: isNumber,
    y: isNumber,
  }),
});`;

export default function DiscriminatedUnionPage() {
  return (
    <Stack variant='main' className='container mx-auto px-4 py-10' gap='xl'>
      <Stack variant='section' gap='md'>
        <Stack gap='xs'>
          <Heading variant='h1'>discriminatedUnion</Heading>
          <Paragraph>
            Creates an exhaustive guard for a union with a shared literal
            discriminant. The guard selects a branch from the input's
            discriminant value, then delegates to that branch guard.
          </Paragraph>
          <Paragraph>
            The branch map must have exactly one key for every discriminant
            value. Pair it with <code>typedStruct</code> to check each branch's
            fields against its existing TypeScript type.
          </Paragraph>
          <Paragraph>
            The discriminant must be a required <code>string</code>,{' '}
            <code>number</code>, <code>symbol</code>, or boolean property on
            every union member. Boolean branches use <code>true</code> and{' '}
            <code>false</code> object keys, which makes <code>ok</code>-based
            Result types a natural fit.
          </Paragraph>
          <Paragraph>
            Discriminants that coerce to the same object key, such as{' '}
            <code>1</code> and <code>'1'</code>, are rejected because a branch
            map cannot represent them separately.
          </Paragraph>
        </Stack>
        <CodeBlock code={sample} language='ts' />
      </Stack>
      <ApiReferencePager currentHref={API_REFERENCE_PATHS.discriminatedUnion} />
    </Stack>
  );
}
