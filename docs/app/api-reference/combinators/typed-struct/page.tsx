import { ApiReferencePager } from '@/components/api-reference/pager';
import { CodeBlock } from '@/components/code/code-block';
import { Heading } from '@/components/ui/heading';
import { Paragraph } from '@/components/ui/paragraph';
import { Stack } from '@/components/ui/stack';

const sample = `import { isNumber, isString, optionalKey, typedStruct } from 'is-kit';

type User = {
  id: number;
  name: string;
  nickname?: string;
};

const isUser = typedStruct<User>()({
  id: isNumber,
  name: isString,
  nickname: optionalKey(isString),
});

isUser({ id: 1, name: 'Neko' }); // true
isUser({ id: 1, name: 'Neko', nickname: 'nya' }); // true
isUser({ id: 1, name: 'Neko', nickname: 123 }); // false

// typedStruct checks the hand-written struct fields against User.
typedStruct<User>()({
  id: isNumber,
  // TypeScript error: missing name and nickname fields
});

typedStruct<User>()({
  id: isNumber,
  name: isNumber,
  // TypeScript error: name must use a string guard
  nickname: optionalKey(isString),
});

// OpenAPI-generated types can be used the same way.
type PostResponse = {
  id: number;
  title: string;
  summary?: string;
};

const isPostResponse = typedStruct<PostResponse>()({
  id: isNumber,
  title: isString,
  summary: optionalKey(isString),
});`;

export default function TypedStructPage() {
  return (
    <Stack variant='main' className='container mx-auto px-4 py-10' gap='xl'>
      <Stack variant='section' gap='md'>
        <Stack gap='xs'>
          <Heading variant='h1'>typedStruct</Heading>
          <Paragraph>
            Typed wrapper around <code>struct</code> for keeping hand-written
            object guards in sync with an existing object type.
          </Paragraph>
          <Paragraph>
            Optional keys in the target type must still be declared with{' '}
            <code>optionalKey(...)</code>. This makes drift visible when the
            target type changes. This helper is not an OpenAPI validator or a
            schema generator.
          </Paragraph>
        </Stack>
        <CodeBlock code={sample} language='ts' />
      </Stack>
      <ApiReferencePager currentHref='/api-reference/combinators/typed-struct' />
    </Stack>
  );
}
