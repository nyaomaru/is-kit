import { CodeBlock } from '@/components/code/code-block';
import {
  GuideArticle,
  GuideCallout,
  GuideHeader,
  GuideList,
  GuideSection
} from '@/components/guides/guide-layout';
import { GuidePager } from '@/components/guides/pager';
import { Paragraph } from '@/components/ui/paragraph';
import { TextLink } from '@/components/ui/text-link';
import { GUIDE_PATHS } from '@/constants/guides';
import { API_REFERENCE_PATHS } from '@/lib/api-metadata';
import { createGuideMetadata } from '@/lib/guide-metadata';

export const metadata = createGuideMetadata(GUIDE_PATHS.recursiveTypeGuards);

const quickAnswer = `import { arrayOf, isString, lazy, typedStruct } from 'is-kit';
import type { Predicate } from 'is-kit';

type Tree = {
  readonly value: string;
  readonly children: readonly Tree[];
};

const isTree: Predicate<Tree> = lazy(() =>
  typedStruct<Tree>()({
    value: isString,
    children: arrayOf(isTree),
  }),
);

isTree({
  value: 'root',
  children: [{ value: 'leaf', children: [] }],
}); // true`;

const eagerDefinition = `const isTree = typedStruct<Tree>()({
  value: isString,
  children: arrayOf(isTree),
  //                 ^ Cannot access 'isTree' before initialization.
});`;

const jsonBoundary = `import { safeJsonParse } from 'is-kit';

function readTree(input: string) {
  const result = safeJsonParse(input, isTree);

  if (!result.valid) {
    return undefined;
  }

  return result.value;
}

readTree('{"value":"root","children":[]}');
// { readonly value: string; readonly children: readonly Tree[] } | undefined`;

const discriminatedTree = `import {
  arrayOf,
  isString,
  lazy,
  oneOf,
  oneOfValues,
  typedStruct,
} from 'is-kit';
import type { Predicate } from 'is-kit';

type File = {
  readonly kind: 'file';
  readonly name: string;
};
type Directory = {
  readonly kind: 'directory';
  readonly name: string;
  readonly children: readonly Node[];
};
type Node = File | Directory;

const isNode: Predicate<Node> = lazy(() =>
  oneOf(
    typedStruct<File>()({
      kind: oneOfValues('file'),
      name: isString,
    }),
    typedStruct<Directory>()({
      kind: oneOfValues('directory'),
      name: isString,
      children: arrayOf(isNode),
    }),
  ),
);`;

const cyclicValue = `type MutableTree = {
  value: string;
  children: MutableTree[];
};

const node: MutableTree = { value: 'root', children: [] };
node.children.push(node);

isTree(node);
// May recurse until the call stack is exhausted.`;

export default function RecursiveTypeGuardsGuidePage() {
  return (
    <GuideArticle>
      <GuideHeader
        breadcrumbLabel='Recursive type guards'
        title='Recursive Type Guards in TypeScript with lazy'
        description='Define a guard once, let it refer to itself safely, and use it to validate tree-shaped values without turning your runtime checks into a schema framework.'
      />

      <GuideSection title='The quick answer'>
        <Paragraph>
          Wrap the guard factory with <code>lazy</code>, then refer to the
          resulting guard for each recursive child.
        </Paragraph>
        <CodeBlock code={quickAnswer} language='ts' />
        <Paragraph>
          <code>isTree</code> is still an ordinary reusable type guard. It works
          in branches, with <code>safeParse</code>, and anywhere a
          <code>Predicate&lt;Tree&gt;</code> is accepted.
        </Paragraph>
      </GuideSection>

      <GuideSection title='Why a recursive guard needs lazy'>
        <Paragraph>
          A tree guard needs itself to check every child. Defining it eagerly
          reads the variable before that variable has been initialized.
        </Paragraph>
        <CodeBlock code={eagerDefinition} language='ts' />
        <Paragraph>
          <code>lazy</code> delays the factory until the first value is checked.
          By then, <code>isTree</code> has been assigned, so the child guard can
          safely refer to it.
        </Paragraph>
        <Paragraph>
          The <code>Predicate&lt;Tree&gt;</code> annotation is also intentional.
          <code>lazy</code> delays runtime construction, but TypeScript still
          analyzes the initializer. Because <code>isTree</code> refers to
          itself, the annotation gives the compiler a type before it resolves
          that recursive reference. <code>lazy&lt;Tree&gt;(...)</code> alone
          does not break the inference cycle.
        </Paragraph>
        <GuideCallout emphasized>
          <code>lazy</code> delays guard construction. It does not make a
          recursive value safe by itself.
        </GuideCallout>
      </GuideSection>

      <GuideSection title='Keep the existing type and the guard aligned'>
        <Paragraph>
          <code>typedStruct&lt;Tree&gt;()</code> makes the existing TypeScript
          type the source of truth for the object fields. Missing, extra, or
          incompatible guard fields become compile-time errors while the guard
          remains a plain runtime function.
        </Paragraph>
        <Paragraph>
          Use <code>arrayOf(isTree)</code> for a homogeneous child list. Each
          child must satisfy the same guard, regardless of how deeply it is
          nested.
        </Paragraph>
        <Paragraph>
          For more on keeping a hand-written guard aligned with an existing
          type, see the{' '}
          <TextLink href={GUIDE_PATHS.syncTypeGuards}>
            type-guard synchronization guide
          </TextLink>
          .
        </Paragraph>
      </GuideSection>

      <GuideSection title='Validate recursive JSON at the boundary'>
        <Paragraph>
          JSON text is untrusted input. Use <code>safeJsonParse</code> to decode
          it to <code>unknown</code>, then apply the same recursive guard.
        </Paragraph>
        <CodeBlock code={jsonBoundary} language='ts' />
        <Paragraph>
          Invalid JSON and an invalid tree both return{' '}
          <code>{'{ valid: false }'}</code>. The helper does not coerce values,
          fill missing fields, or transform the tree.
        </Paragraph>
      </GuideSection>

      <GuideSection title='Compose recursive unions when the node kinds differ'>
        <Paragraph>
          Recursive data does not have to be one uniform object shape. Combine
          leaf and branch guards with <code>oneOf</code>, then make only the
          branch variant refer to the lazy guard.
        </Paragraph>
        <CodeBlock code={discriminatedTree} language='ts' />
        <Paragraph>
          Literal <code>kind</code> fields keep the two node variants explicit
          at runtime and give TypeScript a discriminated union after a
          successful check.
        </Paragraph>
      </GuideSection>

      <GuideSection title='A tree is not a cyclic graph'>
        <Paragraph>
          Recursive JSON is a tree: JSON cannot represent an object pointing
          back to itself. In-memory JavaScript objects can contain cycles, and
          the same recursive guard will keep following them.
        </Paragraph>
        <CodeBlock code={cyclicValue} language='ts' />
        <Paragraph>
          <code>lazy</code> caches the predicate created by its factory, not
          previously visited input objects. If cyclic graphs are part of the
          input contract, add explicit cycle handling outside the guard.
        </Paragraph>
      </GuideSection>

      <GuideSection title='Use recursion only where it clarifies the contract'>
        <GuideList>
          <li>
            Use <code>lazy</code> when a guard directly or indirectly refers to
            itself.
          </li>
          <li>
            Use <code>typedStruct</code> when an existing object type should
            stay aligned with the recursive guard.
          </li>
          <li>
            Use <code>safeJsonParse</code> at JSON text boundaries.
          </li>
          <li>
            Do not expect <code>lazy</code> to detect cycles, coerce values, or
            produce path-rich validation errors.
          </li>
        </GuideList>
        <Paragraph>
          See the{' '}
          <TextLink href={API_REFERENCE_PATHS.lazy}>
            lazy API reference
          </TextLink>{' '}
          for factory caching details and the{' '}
          <TextLink href={API_REFERENCE_PATHS.parse}>
            parse API reference
          </TextLink>{' '}
          for the full <code>safeJsonParse</code> contract.
        </Paragraph>
      </GuideSection>

      <GuidePager currentHref={GUIDE_PATHS.recursiveTypeGuards} />
    </GuideArticle>
  );
}
