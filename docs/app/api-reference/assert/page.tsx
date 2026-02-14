import { ApiReferencePager } from '@/components/api-reference/pager';
import { CodeBlock } from '@/components/code/code-block';
import { Heading } from '@/components/ui/heading';
import { Paragraph } from '@/components/ui/paragraph';
import { Stack } from '@/components/ui/stack';

const sampleGuardAssert = `import { assert, isString } from 'is-kit';

declare const input: unknown;

assert(isString, input, 'input must be a string');
// input is narrowed to string here
input.toUpperCase();`;

const sampleRefineAssert = `import { assert, define, isBoolean, isString, struct } from 'is-kit';

type User = { id: string; active: boolean };
type ActiveUser = User & { active: true };

const isUser = struct({
  id: isString,
  active: isBoolean,
});

const isActiveUser = define<ActiveUser>(
  (value) => isUser(value) && value.active === true
);

declare const input: unknown;
assert(isActiveUser, input);
// input is narrowed to ActiveUser here
input.active; // true`;

export default function AssertPage() {
  return (
    <Stack variant='main' className='container mx-auto px-4 py-10' gap='xl'>
      <Stack variant='section' gap='sm'>
        <Stack gap='xs'>
          <Heading variant='h1'>assert</Heading>
          <Paragraph>
            Assert-style helper for fail-fast validation. When the guard passes,
            the value stays narrowed for the rest of the scope.
          </Paragraph>
        </Stack>
      </Stack>
      <Stack variant='section' gap='sm'>
        <Stack gap='xs'>
          <Heading variant='h2'>Assert with Guard</Heading>
          <Paragraph>
            Throws when the guard fails; otherwise continues with a narrowed
            value.
          </Paragraph>
        </Stack>
        <CodeBlock language='ts' code={sampleGuardAssert} />
      </Stack>
      <Stack variant='section' gap='sm'>
        <Stack gap='xs'>
          <Heading variant='h2'>Assert with define</Heading>
          <Paragraph>
            Build a reusable guard with <code>define</code>, then assert once to
            fail fast and continue with a narrowed type.
          </Paragraph>
        </Stack>
        <CodeBlock language='ts' code={sampleRefineAssert} />
      </Stack>
      <ApiReferencePager currentHref='/api-reference/assert' />
    </Stack>
  );
}
