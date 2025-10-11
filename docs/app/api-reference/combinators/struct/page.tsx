import { ApiReferencePager } from '@/components/api-reference-pager';
import { CodeBlock } from '@/components/code-block';
import { Heading } from '@/components/ui/heading';
import { Paragraph } from '@/components/ui/paragraph';
import { Stack } from '@/components/ui/stack';

const sample = `import { arrayOf, optional, struct, isString, isNumber } from 'is-kit';

const isUser = struct({
  id: isNumber,
  name: isString,
  nickname: optional(isString),
});
// isUser: Guard<{ id: number; name: string; nickname?: string | undefined }>

const input: unknown = {
  id: 42,
  name: 'Neko',
  nickname: 'nya',
};

if (isUser(input)) {
  input.nickname?.toUpperCase(); // input narrowed to User shape
}

const isExactUser = struct(
  { id: isNumber, name: isString },
  { exact: true }
);
isExactUser({ id: 1, name: 'A' }); // true
isExactUser({ id: 1, name: 'A', extra: 1 }); // false (extra keys rejected)

const isTeam = struct({
  name: isString,
  members: arrayOf(isUser),
});
// Nested structs compose cleanly; members inherits the User guard.

isTeam({
  name: 'core',
  members: [{ id: 1, name: 'Neko' }],
}); // true
isTeam({
  name: 'core',
  members: [{ id: 1, name: 'Neko', nickname: 123 }],
}); // false (nickname is not a string)`;

export default function StructPage() {
  return (
    <Stack variant='main' className='container mx-auto px-4 py-10' gap='xl'>
      <Stack variant='section' gap='md'>
        <Stack gap='xs'>
          <Heading variant='h1'>struct</Heading>
          <Paragraph>
            Shape guard for objects; supports exact key checking via options.
          </Paragraph>
        </Stack>
        <CodeBlock code={sample} language='ts' />
      </Stack>
      <ApiReferencePager currentHref='/api-reference/combinators/struct' />
    </Stack>
  );
}
