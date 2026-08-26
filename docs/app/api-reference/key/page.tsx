import { ApiReferencePager } from '@/components/api-reference/pager';
import { CodeBlock } from '@/components/code/code-block';
import { Heading } from '@/components/ui/heading';
import { Paragraph } from '@/components/ui/paragraph';
import { Stack } from '@/components/ui/stack';
import { TextLink } from '@/components/ui/text-link';
import { GUIDE_PATHS } from '@/constants/guides';
import { API_REFERENCE_PATHS, createApiMetadata } from '@/lib/api-metadata';

export const metadata = createApiMetadata(API_REFERENCE_PATHS.key);

const sampleHasKey = `import { hasKey } from 'is-kit';

const hasKind = hasKey('kind');

declare const input: unknown;
if (hasKind(input)) {
  // input: Record<'kind', unknown>
  input.kind;
}`;

const sampleHasKeys = `import { hasKeys } from 'is-kit';

const hasKindAndId = hasKeys('kind', 'id');

declare const input: unknown;
if (hasKindAndId(input)) {
  // input: Record<'kind' | 'id', unknown>
  input.kind;
  input.id;
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

const sampleRefineKey = `import { isString, refineKey } from 'is-kit';

const hasStringValue = refineKey('value', isString);

declare let item: {
  readonly value: string | number;
  readonly id: number;
};

if (hasStringValue(item)) {
  item.value.toUpperCase(); // value: string
  item.id.toFixed(); // unrelated properties are preserved
}`;

const sampleRefineDefinedKey = `import { isString, refineDefinedKey } from 'is-kit';

const hasDefinedStringLabel = refineDefinedKey('label', isString);

declare let item: {
  readonly label?: string | number | undefined;
};

if (hasDefinedStringLabel(item)) {
  item.label.toUpperCase(); // label is present and string
}`;

const sampleRefineIndex = `import { isString, refineIndex } from 'is-kit';

const hasStringAtZero = refineIndex(0, isString);

declare const values: readonly (string | number)[];

if (hasStringAtZero(values)) {
  values[0].toUpperCase(); // values[0]: string
}`;

export default function KeyPage() {
  return (
    <Stack variant='main' className='container mx-auto px-4 py-10' gap='xl'>
      <Stack variant='section' gap='sm'>
        <Stack gap='xs'>
          <Heading variant='h1'>key</Heading>
          <Paragraph>
            Helpers for key presence, literal narrowing, and lifting child
            refinements onto existing parent types. Use <code>hasKey</code>/
            <code>hasKeys</code> to check required own properties,{' '}
            <code>narrowKeyTo</code> for literal values, and the{' '}
            <code>refine*</code> helpers for known properties and array
            elements.
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
          <Heading variant='h2'>hasKeys</Heading>
          <Paragraph>
            Narrow an unknown value to an object that owns all specified keys.
            Useful as a compact pre-check before discriminated-union
            refinements.
          </Paragraph>
        </Stack>
        <CodeBlock language='ts' code={sampleHasKeys} />
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
      <Stack variant='section' gap='sm'>
        <Stack gap='xs'>
          <Heading variant='h2'>refineKey</Heading>
          <Paragraph>
            Apply a refinement to one required property and preserve the
            narrowed property on its existing parent type. The property is read
            once and passed to the refinement once.
          </Paragraph>
        </Stack>
        <CodeBlock language='ts' code={sampleRefineKey} />
      </Stack>
      <Stack variant='section' gap='sm'>
        <Stack gap='xs'>
          <Heading variant='h2'>refineDefinedKey</Heading>
          <Paragraph>
            Require and refine one optional property. A missing property or an{' '}
            <code>undefined</code> value returns <code>false</code> without
            invoking the supplied refinement.
          </Paragraph>
        </Stack>
        <CodeBlock language='ts' code={sampleRefineDefinedKey} />
      </Stack>
      <Stack variant='section' gap='sm'>
        <Stack gap='xs'>
          <Heading variant='h2'>refineIndex</Heading>
          <Paragraph>
            Require and refine one element of a readonly array. Out-of-bounds,
            sparse, and <code>undefined</code> elements return{' '}
            <code>false</code> before the supplied refinement runs.
          </Paragraph>
        </Stack>
        <CodeBlock language='ts' code={sampleRefineIndex} />
      </Stack>
      <Stack variant='section' gap='sm'>
        <Heading variant='h2'>One checked location</Heading>
        <Paragraph>
          Property keys and indices must identify one concrete runtime location.
          Broad keys, unions, template-literal patterns, and branded multi-value
          key domains are rejected so one lookup cannot claim that several
          properties were checked.
        </Paragraph>
        <Paragraph>
          For nested Compiler API examples, continue with{' '}
          <TextLink href={GUIDE_PATHS.typescriptCompilerApi}>
            Using is-kit with the TypeScript Compiler API
          </TextLink>
          .
        </Paragraph>
      </Stack>
      <ApiReferencePager currentHref={API_REFERENCE_PATHS.key} />
    </Stack>
  );
}
