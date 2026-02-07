import { ApiReferencePager } from '@/components/api-reference/pager';
import { CodeBlock } from '@/components/code/code-block';
import { Heading } from '@/components/ui/heading';
import { Paragraph } from '@/components/ui/paragraph';
import { Stack } from '@/components/ui/stack';

const sampleHasKey = `import { hasKey } from 'is-kit';

const hasKind = hasKey('kind');

declare const input: unknown;
if (hasKind(input)) {
  // input: Record<'kind', unknown>
  input.kind;
}`;

const sampleNarrowKeyTo = `import { narrowKeyTo, or, struct, isString, isNumber, oneOfValues } from 'is-kit';

type User = { id: string; age: number; role: 'admin' | 'guest' | 'trial' };

const isUser = struct({
  id: isString,
  age: isNumber,
  role: oneOfValues('admin', 'guest', 'trial'),
});

// Build role-specific guards that also narrow the 'role' field to literals
const byRole = narrowKeyTo(isUser, 'role');
const isAdmin = byRole('admin'); // Readonly<User> & { role: 'admin' }
const isGuest = byRole('guest'); // Readonly<User> & { role: 'guest' }
const isTrial = byRole('trial'); // Readonly<User> & { role: 'trial' }

// Compose as usual
const isGuestOrTrial = or(isGuest, isTrial);

declare const input: unknown;
if (isGuestOrTrial(input)) {
  // input.role is narrowed to 'guest' | 'trial'
}`;

export default function KeyPage() {
  return (
    <Stack variant='main' className='container mx-auto px-4 py-10' gap='xl'>
      <Stack variant='section' gap='sm'>
        <Stack gap='xs'>
          <Heading variant='h1'>key</Heading>
          <Paragraph>
            Helpers for key-based guards and literal narrowing. Use{' '}
            <code>hasKey</code> to check for a required own property and{' '}
            <code>narrowKeyTo</code> to constrain a property to a literal value.
          </Paragraph>
        </Stack>
      </Stack>
      <Stack variant='section' gap='sm'>
        <Stack gap='xs'>
          <Heading variant='h2'>hasKey</Heading>
          <Paragraph>
            Narrow an unknown value to an object that owns a specific key. Handy
            before custom refinements or discriminated-union checks.
          </Paragraph>
        </Stack>
        <CodeBlock language='ts' code={sampleHasKey} />
      </Stack>
      <Stack variant='section' gap='sm'>
        <Stack gap='xs'>
          <Heading variant='h2'>narrowKeyTo</Heading>
          <Paragraph>
            Build reusable guards that narrow a property to specific literal
            values.
          </Paragraph>
        </Stack>
        <CodeBlock language='ts' code={sampleNarrowKeyTo} />
      </Stack>
      <ApiReferencePager currentHref='/api-reference/key' />
    </Stack>
  );
}
