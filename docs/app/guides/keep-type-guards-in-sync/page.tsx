import Image from 'next/image';

import { CodeBlock } from '@/components/code/code-block';
import {
  GuideArticle,
  GuideCallout,
  GuideHeader,
  GuideList,
  GuideSection
} from '@/components/guides/guide-layout';
import { GuideTable } from '@/components/guides/guide-table';
import { Paragraph } from '@/components/ui/paragraph';
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
    <GuideArticle>
      <GuideHeader
        breadcrumbLabel='Sync type guards'
        media={
          <Image
            src='/iskit_guide2.png'
            alt='guide2 thumbnail'
            width={1000}
            height={420}
            sizes='(max-width: 896px) calc(100vw - 2rem), 864px'
            preload
            className='my-4 h-auto w-full rounded-xl border'
          />
        }
        title='How to Keep Hand-Written Type Guards in Sync with TypeScript Types'
        description='Start with the type you already have, write the runtime checks by hand, and make structural drift a compile-time error.'
      />

      <GuideSection title='The quick answer'>
        <Paragraph>
          Pass your existing object type to <code>typedStruct</code>, then
          define one guard for every string-keyed field.
        </Paragraph>
        <CodeBlock code={quickAnswer} language='ts' />
        <Paragraph>
          At runtime, this uses the same object validation as{' '}
          <code>struct</code>. At compile time, the field map is checked against{' '}
          <code>User</code> for missing, extra, and incompatible string-keyed
          fields.
        </Paragraph>
        <Paragraph>
          The guards are still explicit. The useful part is that the compiler
          now knows which type they are supposed to follow.
        </Paragraph>
      </GuideSection>

      <GuideSection title='Why a type predicate can drift silently'>
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
        <GuideCallout>
          The compiler can check a guard’s declared type. It cannot prove that
          arbitrary runtime logic checks every field.
        </GuideCallout>
      </GuideSection>

      <GuideSection title='Make string-keyed structural drift visible'>
        <Paragraph>
          For ordinary string-keyed object shapes,{' '}
          <code>typedStruct&lt;User&gt;()</code> turns the object type into a
          compile-time contract for the field map.
        </Paragraph>
        <CodeBlock code={visibleDrift} language='ts' />
        <Paragraph>
          The same check also rejects string-keyed schema fields that do not
          exist on <code>User</code>. String-keyed renames, additions, removals,
          and field-type changes therefore surface next to the guard definition
          during type checking.
        </Paragraph>
        <Paragraph>
          This does not remove maintenance. It moves forgotten maintenance from
          production behavior into a compiler error.
        </Paragraph>
        <GuideCallout>
          This drift guarantee is limited to string-keyed properties. Numeric
          and symbol properties are excluded from <code>TypedStructShape</code>,
          so they are not required in the field map and cannot be validated by
          the resulting <code>typedStruct</code> guard.
        </GuideCallout>
      </GuideSection>

      <GuideSection title='Keep optional keys explicit'>
        <Paragraph>
          Optional string-keyed object properties must still appear in the field
          map. Wrap them with <code>optionalKey</code> so the key may be absent
          at runtime.
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
          optional string-keyed property is added to <code>User</code>, the
          guard should not ignore it silently.
        </Paragraph>
      </GuideSection>

      <GuideSection title='Compose nested existing types'>
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
        <GuideCallout emphasized>
          Reuse the existing type at compile time. Compose small guards at
          runtime.
        </GuideCallout>
      </GuideSection>

      <GuideSection title='Compile-time fields and runtime extra keys'>
        <Paragraph>
          <code>typedStruct</code> rejects extra string-keyed fields in the
          guard definition. Extra keys in an input object are a separate runtime
          choice.
        </Paragraph>
        <CodeBlock code={exactObjects} language='ts' />
        <Paragraph>
          Without <code>{'{ exact: true }'}</code>, matching objects may contain
          additional own enumerable string keys. Enable it when the runtime
          boundary requires a closed object shape.
        </Paragraph>
      </GuideSection>

      <GuideSection title='Choose the right source of truth'>
        <GuideTable
          columns={['Approach', 'Source of truth', 'Best for']}
          rows={[
            {
              key: 'manual-predicate',
              cells: [
                'Manual predicate',
                'Your implementation',
                'Custom, non-structural logic'
              ]
            },
            {
              key: 'struct',
              cells: [
                'struct',
                'The guard field map',
                'Guard-first object types'
              ]
            },
            {
              key: 'typed-struct',
              cells: [
                'typedStruct',
                'An existing TypeScript type',
                'Type-first application code'
              ]
            },
            {
              key: 'schema-library',
              cells: [
                'Schema library or codegen',
                'A schema or generated artifact',
                'Rich errors, transforms, or generation'
              ]
            }
          ]}
        />
        <Paragraph>
          Use <code>struct</code> when the guard should define the resulting
          type. Use <code>typedStruct</code> when the TypeScript type already
          exists and the hand-written guard must follow it.
        </Paragraph>
      </GuideSection>

      <GuideSection title='What typedStruct does not do'>
        <GuideList>
          <li>It does not generate runtime validation from erased types.</li>
          <li>
            It does not track or validate numeric and symbol properties on the
            target type.
          </li>
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
        </GuideList>
        <Paragraph>
          It is intentionally smaller: a typed bridge between an existing object
          type and the guards you choose to run.
        </Paragraph>
      </GuideSection>

      <GuideSection title='Summary' className='border-t pt-8'>
        <GuideList>
          <li>
            Use <code>typedStruct&lt;T&gt;()</code> when a string-keyed object
            type <code>T</code> already exists and needs a runtime guard.
          </li>
          <li>
            Declare required and optional string keys so type drift stays
            visible.
          </li>
          <li>Compose nested guards from the corresponding property types.</li>
          <li>
            Use <code>exact: true</code> only when runtime inputs must reject
            additional keys.
          </li>
        </GuideList>
        <Paragraph>
          For the complete contract and additional examples, see the{' '}
          <TextLink href={API_REFERENCE_PATHS.typedStruct}>
            typedStruct API reference
          </TextLink>
          .
        </Paragraph>
      </GuideSection>
    </GuideArticle>
  );
}
