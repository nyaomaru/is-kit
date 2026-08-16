import { CodeBlock } from '@/components/code/code-block';
import { Heading } from '@/components/ui/heading';
import { Paragraph } from '@/components/ui/paragraph';
import { Stack } from '@/components/ui/stack';
import { TextLink } from '@/components/ui/text-link';
import { GUIDE_PATHS } from '@/constants/guides';
import { API_REFERENCE_PATHS } from '@/lib/api-metadata';
import { createGuideMetadata } from '@/lib/guide-metadata';

export const metadata = createGuideMetadata(GUIDE_PATHS.syncTypeGuards);

const quickAnswer = `import {
  isNumber,
  isString,
  optionalKey,
  typedStruct,
} from 'is-kit';

type User = {
  id: string;
  name: string;
  age?: number;
};

const isUser = typedStruct<User>()({
  id: isString,
  name: isString,
  age: optionalKey(isNumber),
});

declare const input: unknown;

if (isUser(input)) {
  input.name.toUpperCase();
  // input: Readonly<User>
}`;

const trustedAnnotation = `type User = {
  id: string;
  name: string;
  role: 'admin' | 'member';
};

const isUser = (value: unknown): value is User => {
  if (typeof value !== 'object' || value === null) return false;

  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.id === 'string' &&
    typeof candidate.name === 'string'
  );
};

// The implementation forgot role, but the annotation still compiles.
// TypeScript trusts a user-defined type predicate.`;

const visibleDrift = `import {
  isNumber,
  isString,
  oneOfValues,
  optionalKey,
  typedStruct,
} from 'is-kit';

type User = {
  id: string;
  name: string;
  role: 'admin' | 'member';
  age?: number;
};

typedStruct<User>()({
  id: isString,
  name: isString,
  age: optionalKey(isNumber),
  // TypeScript error: role is missing.
});

typedStruct<User>()({
  id: isString,
  name: isNumber,
  // TypeScript error: name requires a string-compatible guard.
  role: oneOfValues('admin', 'member'),
  age: optionalKey(isNumber),
});`;

const optionalFields = `import {
  isString,
  nullable,
  optionalKey,
  typedStruct,
} from 'is-kit';

type User = {
  id: string;
  nickname?: string | null;
};

const isUser = typedStruct<User>()({
  id: isString,
  nickname: optionalKey(nullable(isString)),
});

isUser({ id: 'user-1' }); // true
isUser({ id: 'user-1', nickname: null }); // true
isUser({ id: 'user-1', nickname: 'Neko' }); // true
isUser({ id: 'user-1', nickname: 42 }); // false`;

const nestedTypes = `import {
  arrayOf,
  isString,
  nullable,
  typedStruct,
} from 'is-kit';

type Account = {
  readonly id: string;
  readonly profile: {
    readonly displayName: string;
    readonly bio: string | null;
  } | null;
  readonly tags: readonly string[];
};

const isProfile = typedStruct<NonNullable<Account['profile']>>()({
  displayName: isString,
  bio: nullable(isString),
});

const isAccount = typedStruct<Account>()({
  id: isString,
  profile: nullable(isProfile),
  tags: arrayOf(isString),
});`;

const exactObjects = `import { isString, typedStruct } from 'is-kit';

type User = {
  id: string;
  name: string;
};

const isExactUser = typedStruct<User>()(
  {
    id: isString,
    name: isString,
  },
  { exact: true },
);

isExactUser({ id: 'user-1', name: 'Ada' }); // true
isExactUser({ id: 'user-1', name: 'Ada', debug: true }); // false`;

export default function KeepTypeGuardsInSyncGuidePage() {
  return (
    <Stack
      variant='article'
      className='container mx-auto max-w-4xl px-4 py-10'
      gap='xl'
    >
      <Stack variant='section' gap='sm' className='border-b pb-8'>
        <nav aria-label='Breadcrumb'>
          <ol className='flex items-center gap-2 text-sm font-medium tracking-[0.14em] uppercase text-primary/70'>
            <li>
              <TextLink href={GUIDE_PATHS.index} className='text-inherit'>
                Guides
              </TextLink>
            </li>
            <li aria-hidden='true'>/</li>
            <li aria-current='page'>Sync type guards</li>
          </ol>
        </nav>
        <Heading
          variant='h1'
          className='max-w-3xl leading-tight tracking-tight'
        >
          How to Keep Hand-Written Type Guards in Sync with TypeScript Types
        </Heading>
        <Paragraph variant='lead' className='max-w-3xl text-primary/80'>
          Start with the type you already have, write the runtime checks by
          hand, and make structural drift a compile-time error.
        </Paragraph>
      </Stack>

      <Stack variant='section' gap='md'>
        <Heading variant='h2' className='text-2xl tracking-tight'>
          The quick answer
        </Heading>
        <Paragraph>
          Pass your existing object type to <code>typedStruct</code>, then
          define one guard for every field.
        </Paragraph>
        <CodeBlock code={quickAnswer} language='ts' />
        <Paragraph>
          At runtime, this uses the same object validation as{' '}
          <code>struct</code>. At compile time, the field map is checked against{' '}
          <code>User</code> for missing, extra, and incompatible fields.
        </Paragraph>
        <Paragraph>
          The guards are still explicit. The useful part is that the compiler
          now knows which type they are supposed to follow.
        </Paragraph>
      </Stack>

      <Stack variant='section' gap='md'>
        <Heading variant='h2' className='text-2xl tracking-tight'>
          Why a type predicate can drift silently
        </Heading>
        <Paragraph>
          A hand-written predicate often starts small. Then the application type
          gains a field, while the runtime check stays unchanged.
        </Paragraph>
        <CodeBlock code={trustedAnnotation} language='ts' />
        <Paragraph>
          This is valid TypeScript. A return type such as{' '}
          <code>value is User</code> is a promise made by your function, not a
          proof derived from its body.
        </Paragraph>
        <blockquote className='border-l-2 border-primary/70 py-1 pl-5 text-lg leading-relaxed'>
          The compiler can check a guard’s declared type. It cannot prove that
          arbitrary runtime logic checks every field.
        </blockquote>
      </Stack>

      <Stack variant='section' gap='md'>
        <Heading variant='h2' className='text-2xl tracking-tight'>
          Make structural drift visible
        </Heading>
        <Paragraph>
          <code>typedStruct&lt;User&gt;()</code> turns the object type into a
          compile-time contract for the field map.
        </Paragraph>
        <CodeBlock code={visibleDrift} language='ts' />
        <Paragraph>
          The same check also rejects schema fields that do not exist on{' '}
          <code>User</code>. Renames, additions, removals, and field-type
          changes therefore surface next to the guard definition during type
          checking.
        </Paragraph>
        <Paragraph>
          This does not remove maintenance. It moves forgotten maintenance from
          production behavior into a compiler error.
        </Paragraph>
      </Stack>

      <Stack variant='section' gap='md'>
        <Heading variant='h2' className='text-2xl tracking-tight'>
          Keep optional keys explicit
        </Heading>
        <Paragraph>
          Optional object properties must still appear in the field map. Wrap
          them with <code>optionalKey</code> so the key may be absent at
          runtime.
        </Paragraph>
        <CodeBlock code={optionalFields} language='ts' />
        <Paragraph>
          Key optionality and value nullability are separate decisions. Here,
          <code>optionalKey</code> allows <code>nickname</code> to be absent,
          while <code>nullable</code> allows an existing key to contain{' '}
          <code>null</code>.
        </Paragraph>
        <Paragraph>
          Requiring optional keys in the field map is deliberate. If a new
          optional property is added to <code>User</code>, the guard should not
          ignore it silently.
        </Paragraph>
      </Stack>

      <Stack variant='section' gap='md'>
        <Heading variant='h2' className='text-2xl tracking-tight'>
          Compose nested existing types
        </Heading>
        <Paragraph>
          For nested objects, define a focused guard from the corresponding
          property type and compose it into the parent guard.
        </Paragraph>
        <CodeBlock code={nestedTypes} language='ts' />
        <Paragraph>
          Referencing <code>Account['profile']</code> keeps the nested guard
          connected to the original type without copying the object shape into
          another TypeScript alias.
        </Paragraph>
        <blockquote className='border-l-2 border-primary/70 py-1 pl-5 text-lg leading-relaxed font-semibold'>
          Reuse the existing type at compile time. Compose small guards at
          runtime.
        </blockquote>
      </Stack>

      <Stack variant='section' gap='md'>
        <Heading variant='h2' className='text-2xl tracking-tight'>
          Compile-time fields and runtime extra keys
        </Heading>
        <Paragraph>
          <code>typedStruct</code> always rejects extra fields in the guard
          definition. Extra keys in an input object are a separate runtime
          choice.
        </Paragraph>
        <CodeBlock code={exactObjects} language='ts' />
        <Paragraph>
          Without <code>{'{ exact: true }'}</code>, matching objects may contain
          additional own enumerable string keys. Enable it when the runtime
          boundary requires a closed object shape.
        </Paragraph>
      </Stack>

      <Stack variant='section' gap='md'>
        <Heading variant='h2' className='text-2xl tracking-tight'>
          Choose the right source of truth
        </Heading>
        <div className='overflow-x-auto rounded-md border'>
          <table className='w-full min-w-2xl border-collapse text-left text-sm'>
            <thead>
              <tr className='border-b bg-primary/5'>
                <th className='px-4 py-3 font-semibold tracking-wide'>
                  Approach
                </th>
                <th className='px-4 py-3 font-semibold tracking-wide'>
                  Source of truth
                </th>
                <th className='px-4 py-3 font-semibold tracking-wide'>
                  Best for
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className='border-b'>
                <td className='px-4 py-3'>Manual predicate</td>
                <td className='px-4 py-3'>Your implementation</td>
                <td className='px-4 py-3'>Custom, non-structural logic</td>
              </tr>
              <tr className='border-b'>
                <td className='px-4 py-3'>struct</td>
                <td className='px-4 py-3'>The guard field map</td>
                <td className='px-4 py-3'>Guard-first object types</td>
              </tr>
              <tr className='border-b'>
                <td className='px-4 py-3'>typedStruct</td>
                <td className='px-4 py-3'>An existing TypeScript type</td>
                <td className='px-4 py-3'>Type-first application code</td>
              </tr>
              <tr>
                <td className='px-4 py-3'>Schema library or codegen</td>
                <td className='px-4 py-3'>A schema or generated artifact</td>
                <td className='px-4 py-3'>
                  Rich errors, transforms, or generation
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <Paragraph>
          Use <code>struct</code> when the guard should define the resulting
          type. Use <code>typedStruct</code> when the TypeScript type already
          exists and the hand-written guard must follow it.
        </Paragraph>
      </Stack>

      <Stack variant='section' gap='md'>
        <Heading variant='h2' className='text-2xl tracking-tight'>
          What typedStruct does not do
        </Heading>
        <ul className='list-disc space-y-2 pl-6'>
          <li>It does not generate runtime validation from erased types.</li>
          <li>
            It cannot prove that a custom predicate’s implementation is honest.
          </li>
          <li>
            It does not coerce data or return structured validation errors.
          </li>
          <li>
            It does not replace a schema-first workflow when a schema is your
            actual source of truth.
          </li>
        </ul>
        <Paragraph>
          It is intentionally smaller: a typed bridge between an existing object
          type and the guards you choose to run.
        </Paragraph>
      </Stack>

      <Stack variant='section' gap='md' className='border-t pt-8'>
        <Heading variant='h2' className='text-2xl tracking-tight'>
          Summary
        </Heading>
        <ul className='list-disc space-y-2 pl-6'>
          <li>
            Use <code>typedStruct&lt;T&gt;()</code> when <code>T</code> already
            exists and needs a runtime guard.
          </li>
          <li>
            Declare required and optional keys so type drift stays visible.
          </li>
          <li>Compose nested guards from the corresponding property types.</li>
          <li>
            Use <code>exact: true</code> only when runtime inputs must reject
            additional keys.
          </li>
        </ul>
        <Paragraph>
          For the complete contract and additional examples, see the{' '}
          <TextLink href={API_REFERENCE_PATHS.typedStruct}>
            typedStruct API reference
          </TextLink>
          .
        </Paragraph>
      </Stack>
    </Stack>
  );
}
