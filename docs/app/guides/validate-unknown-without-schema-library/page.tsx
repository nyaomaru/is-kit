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

export const metadata = createGuideMetadata(GUIDE_PATHS.validateUnknown);

const quickAnswer = `import {
  isString,
  oneOfValues,
  safeParse,
  struct,
} from 'is-kit';

const isUser = struct({
  id: isString,
  name: isString,
  role: oneOfValues('admin', 'member'),
});

declare const input: unknown;

const result = safeParse(isUser, input);

if (result.valid) {
  result.value.name.toUpperCase();
  // result.value: Readonly<{
  //   id: string;
  //   name: string;
  //   role: 'admin' | 'member';
  // }>
}`;

const unsafeAssertion = `type User = {
  id: string;
  name: string;
};

declare const input: unknown;

const user = input as User;

// No runtime check happened.
// This can throw if name is missing or not a string.
user.name.toUpperCase();`;

const composedPayload = `import {
  arrayOf,
  isString,
  nullable,
  oneOfValues,
  optionalKey,
  struct,
} from 'is-kit';

const isProfile = struct({
  displayName: isString,
  bio: optionalKey(nullable(isString)),
});

const isUser = struct({
  id: isString,
  role: oneOfValues('admin', 'member'),
  profile: optionalKey(isProfile),
  tags: arrayOf(isString),
});

isUser({
  id: 'user-1',
  role: 'member',
  tags: ['typescript', 'guards'],
}); // true

isUser({
  id: 'user-1',
  role: 'owner',
  tags: ['typescript'],
}); // false`;

const directGuard = `declare const input: unknown;

if (isUser(input)) {
  renderUser(input);
  // input is narrowed only inside this branch.
}

const result = safeParse(isUser, input);

if (!result.valid) {
  return { status: 400 as const };
}

return {
  status: 200 as const,
  user: result.value,
};`;

const jsonBoundary = `import { safeJsonParse } from 'is-kit';

declare const body: string;

const result = safeJsonParse(body, isUser);

if (!result.valid) {
  return { status: 400 as const };
}

renderUser(result.value);

// Invalid JSON and guard mismatches both return { valid: false }.
// Values are validated as they are; nothing is coerced.`;

const exactObject = `import { isString, struct } from 'is-kit';

const isCredentials = struct(
  {
    username: isString,
    password: isString,
  },
  { exact: true },
);

isCredentials({ username: 'Neko', password: 'secret' }); // true
isCredentials({
  username: 'Neko',
  password: 'secret',
  admin: true,
}); // false`;

const domainRule = `import {
  and,
  isString,
  predicateToRefine,
  struct,
} from 'is-kit';

const isNonBlankString = and(
  isString,
  predicateToRefine<string>((value) => value.trim().length > 0),
);

const isMessage = struct({
  title: isNonBlankString,
  body: isString,
});

isMessage({ title: 'Hello', body: '' }); // true
isMessage({ title: '   ', body: 'Hello' }); // false`;

export default function ValidateUnknownWithoutSchemaLibraryGuidePage() {
  return (
    <GuideArticle>
      <GuideHeader
        breadcrumbLabel='Validate unknown'
        title='How to Validate unknown in TypeScript Without a Schema Library'
        description='Keep untrusted values unknown, compose the runtime checks you need, and narrow them with a small tagged result.'
      />

      <GuideSection title='The quick answer'>
        <Paragraph>
          Build a reusable object guard, then pass it and the unknown value to{' '}
          <code>safeParse</code>.
        </Paragraph>
        <CodeBlock code={quickAnswer} language='ts' />
        <Paragraph>
          The guard performs the runtime checks. <code>safeParse</code> returns{' '}
          <code>{'{ valid: true, value }'}</code> or{' '}
          <code>{'{ valid: false }'}</code>, so TypeScript can narrow the result
          with an ordinary branch.
        </Paragraph>
        <Paragraph>
          There is no generated schema and no hidden conversion. The accepted
          type is inferred directly from the guards you composed.
        </Paragraph>
      </GuideSection>

      <GuideSection title='Keep boundary values unknown'>
        <Paragraph>
          HTTP responses, parsed JSON, storage values, message payloads, and
          data from third-party code do not become trustworthy because your
          application expects a TypeScript type.
        </Paragraph>
        <Paragraph>
          Model those values as <code>unknown</code>. Unlike <code>any</code>,
          it prevents property access until code has established what the value
          actually is.
        </Paragraph>
        <GuideCallout>
          <code>unknown</code> is not missing type information. It is an honest
          description of an unverified boundary value.
        </GuideCallout>
      </GuideSection>

      <GuideSection title='A type assertion is not validation'>
        <Paragraph>
          The shortest way past <code>unknown</code> is often an <code>as</code>{' '}
          assertion. It is also the easiest way to move the risk somewhere less
          visible.
        </Paragraph>
        <CodeBlock code={unsafeAssertion} language='ts' />
        <Paragraph>
          An assertion changes what the compiler believes. It does not inspect
          the value, add a property, or turn invalid input into valid data.
        </Paragraph>
        <Paragraph>
          A guard connects both sides: it returns a boolean at runtime and
          narrows the same value when that boolean is true.
        </Paragraph>
      </GuideSection>

      <GuideSection title='Compose the payload you actually accept'>
        <Paragraph>
          Start with primitive guards, then compose literals, optional keys,
          nullable values, arrays, and nested objects.
        </Paragraph>
        <CodeBlock code={composedPayload} language='ts' />
        <Paragraph>
          Each piece remains a normal predicate. You can test it independently,
          reuse it at another boundary, or compose it into a larger guard.
        </Paragraph>
        <Paragraph>
          <code>optionalKey</code> means the property may be absent.{' '}
          <code>nullable</code> means an existing value may be <code>null</code>
          . Keeping those meanings separate makes the runtime contract explicit.
        </Paragraph>
      </GuideSection>

      <GuideSection title='Use a direct guard or a tagged result'>
        <Paragraph>
          Guards already work directly in TypeScript control flow. Use{' '}
          <code>safeParse</code> when the validated value needs to move through
          a result-oriented branch or function boundary.
        </Paragraph>
        <CodeBlock code={directGuard} language='ts' />
        <Paragraph>
          <code>safeParse</code> does not clone or transform the value. On
          success, it returns the same value after the guard has accepted it.
        </Paragraph>
      </GuideSection>

      <GuideSection title='Validate JSON at the decode boundary'>
        <Paragraph>
          <code>JSON.parse</code> returns <code>any</code>.{' '}
          <code>safeJsonParse</code> contains that unsafe result as{' '}
          <code>unknown</code> and applies your guard before returning it.
        </Paragraph>
        <CodeBlock code={jsonBoundary} language='ts' />
        <Paragraph>
          This is decode-then-guard behavior. Invalid JSON and guard failures
          share the same small failure result, and values are never coerced to
          satisfy the guard.
        </Paragraph>
      </GuideSection>

      <GuideSection title='Decide whether extra keys are allowed'>
        <Paragraph>
          By default, <code>struct</code> validates declared fields and permits
          additional keys. Use <code>exact: true</code> when the boundary needs
          a closed object shape.
        </Paragraph>
        <CodeBlock code={exactObject} language='ts' />
        <Paragraph>
          Exact mode rejects extra own enumerable string keys. It follows{' '}
          <code>Object.keys</code> semantics, so symbol properties are outside
          this check.
        </Paragraph>
      </GuideSection>

      <GuideSection title='Add focused domain rules'>
        <Paragraph>
          Structural checks are often enough. When a field has a small business
          rule, compose a refinement after its broader guard.
        </Paragraph>
        <CodeBlock code={domainRule} language='ts' />
        <Paragraph>
          The string check runs first, so the refinement receives a string
          rather than <code>unknown</code>. The resulting guard stays reusable
          and preserves normal TypeScript narrowing.
        </Paragraph>
      </GuideSection>

      <GuideSection title='Choose the smallest sufficient approach'>
        <GuideTable
          columns={['Approach', 'Best for', 'Tradeoff']}
          rows={[
            {
              key: 'inline-typeof',
              cells: [
                'Inline typeof checks',
                'One local primitive value',
                'Repeats as shapes grow'
              ]
            },
            {
              key: 'is-kit-guards',
              cells: [
                'is-kit guards',
                'Reusable boolean validation',
                'No structured error details'
              ]
            },
            {
              key: 'schema-library',
              cells: [
                'Schema library',
                'Rich errors and transformations',
                'Introduces a schema-first workflow'
              ]
            }
          ]}
        />
        <Paragraph>
          You are still adding is-kit as a package. The distinction is that it
          is a zero-runtime-dependency type guard toolkit, not a schema language
          or validation framework.
        </Paragraph>
      </GuideSection>

      <GuideSection title='When a schema library is the better choice'>
        <GuideList>
          <li>
            You need field paths and multiple structured validation issues.
          </li>
          <li>You need coercion, defaults, or value transformations.</li>
          <li>A shared schema must generate types or external artifacts.</li>
          <li>
            Your forms or API framework integrate with a schema ecosystem.
          </li>
        </GuideList>
        <Paragraph>
          is-kit guards answer a narrower question: does this value satisfy the
          predicate, and if so, what can TypeScript safely narrow it to?
        </Paragraph>
      </GuideSection>

      <GuideSection title='Summary' className='border-t pt-8'>
        <GuideList>
          <li>Keep unverified boundary values typed as unknown.</li>
          <li>Use guards instead of assertions when runtime trust matters.</li>
          <li>Compose small predicates into the payload shape you accept.</li>
          <li>
            Use <code>safeParse</code> for a tagged result and{' '}
            <code>safeJsonParse</code> at JSON text boundaries.
          </li>
          <li>
            Adopt a schema library when richer validation is the requirement.
          </li>
        </GuideList>
        <Paragraph>
          Continue with the{' '}
          <TextLink href={API_REFERENCE_PATHS.parse}>parse</TextLink> and{' '}
          <TextLink href={API_REFERENCE_PATHS.struct}>struct</TextLink> API
          references for the complete contracts.
        </Paragraph>
      </GuideSection>
    </GuideArticle>
  );
}
