import { ApiReferencePager } from '@/components/api-reference/pager';
import { CodeBlock } from '@/components/code/code-block';
import { Heading } from '@/components/ui/heading';
import { Paragraph } from '@/components/ui/paragraph';
import { Stack } from '@/components/ui/stack';
import { API_REFERENCE_PATHS, createApiMetadata } from '@/lib/api-metadata';

export const metadata = createApiMetadata(API_REFERENCE_PATHS.types);

const sample = `import { isString, optionalKey, struct } from 'is-kit';
import type {
  InferSchema,
  ParseResult,
  Predicate,
  StructOptions,
} from 'is-kit';

const userSchema = {
  id: isString,
  nickname: optionalKey(isString),
} as const;

type User = InferSchema<typeof userSchema>;

const options: StructOptions = { exact: true };
const isUser: Predicate<User> = struct(userSchema, options);

declare const result: ParseResult<User>;
if (result.valid) {
  result.value.id; // string
}`;

const primaryTypes = [
  {
    name: 'Predicate<T>, Guard<T>',
    description:
      'The core unknown-input type guard contract. Guard is a readability alias for Predicate.'
  },
  {
    name: 'Refinement<A, B>, Refine<A, B>',
    description:
      'Narrows a known input type A to a subtype B. Refine is a readability alias for Refinement.'
  },
  {
    name: 'ParseResult<T>',
    description:
      'The tagged valid/value result returned by safeParse and related helpers.'
  },
  {
    name: 'Primitive',
    description: 'The union of JavaScript primitive value types.'
  },
  {
    name: 'InferSchema<S>',
    description:
      'Infers the readonly object type represented by a struct schema.'
  },
  {
    name: 'StructOptions',
    description:
      'The public exact-key options accepted by struct and typedStruct.'
  },
  {
    name: 'TypedStructShape<T>, TypedStructFields<T, S>',
    description:
      'Public contracts for annotating wrappers and reusable helpers around typedStruct.'
  }
] as const;

const advancedTypes = [
  {
    name: 'GuardedOf<F>',
    description: 'Extracts the guarded output type from one predicate.'
  },
  {
    name: 'OutOfGuards<T>, GuardedWithin<Fs, A>',
    description:
      'Extracts and constrains unions produced by collections of guards.'
  },
  {
    name: 'RefineChain<In, T>, ChainResult<In, T>',
    description:
      'Models the ordered refinements and final output used by refinement chains.'
  },
  {
    name: 'OptionalSchemaField<G>, SchemaField, Schema',
    description:
      'Building blocks for wrappers that accept or construct struct schemas.'
  },
  {
    name: 'NoExtraKeys<S, Shape>',
    description: 'Rejects keys outside an expected type-level shape.'
  },
  {
    name: 'OptionalObjectKeys<T>, RequiredObjectKeys<T>',
    description: 'Extracts optional or required keys from an object type.'
  }
] as const;

function TypeList({
  items
}: {
  items: readonly { name: string; description: string }[];
}) {
  return (
    <ul className='space-y-3 pl-5 list-disc'>
      {items.map(({ name, description }) => (
        <li key={name}>
          <code>{name}</code> — {description}
        </li>
      ))}
    </ul>
  );
}

export default function TypesPage() {
  return (
    <Stack variant='main' className='container mx-auto px-4 py-10' gap='xl'>
      <Stack variant='section' gap='md'>
        <Stack gap='xs'>
          <Heading variant='h1'>types</Heading>
          <Paragraph>
            Public type exports for guard authoring, parse results, schema
            inference, and type-level extensions.
          </Paragraph>
          <Paragraph className='text-muted-foreground'>
            Primary and advanced types are equally supported public API. The
            classification only controls discoverability: start with primary
            types and reach for advanced types when building reusable wrappers.
          </Paragraph>
        </Stack>
        <CodeBlock code={sample} language='ts' />
      </Stack>

      <Stack variant='section' gap='md'>
        <Heading variant='h2'>Primary types</Heading>
        <TypeList items={primaryTypes} />
      </Stack>

      <Stack variant='section' gap='md'>
        <Heading variant='h2'>Advanced building blocks</Heading>
        <TypeList items={advancedTypes} />
        <Paragraph className='text-muted-foreground'>
          <code>SchemaShape</code> is not exported from the package root. It
          remains an implementation detail unless a concrete external use case
          requires a public contract.
        </Paragraph>
      </Stack>

      <ApiReferencePager currentHref={API_REFERENCE_PATHS.types} />
    </Stack>
  );
}
