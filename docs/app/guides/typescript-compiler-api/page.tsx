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

export const metadata = createGuideMetadata(GUIDE_PATHS.typescriptCompilerApi);

const quickAnswer = `import * as ts from 'typescript';
import { and, refineKey } from 'is-kit';

const isCallWithIdentifierExpression = and(
  ts.isCallExpression,
  refineKey('expression', ts.isIdentifier),
);

declare const node: ts.Node;

if (isCallWithIdentifierExpression(node)) {
  node.expression.text;
  // node: ts.CallExpression & { expression: ts.Identifier }
}`;

const knownDomainComposition = `import * as ts from 'typescript';
import { oneOf, or } from 'is-kit';

const isStringLike = or(
  ts.isStringLiteral,
  ts.isNoSubstitutionTemplateLiteral,
);

const isNamedDeclaration = oneOf(
  ts.isClassDeclaration,
  ts.isFunctionDeclaration,
  ts.isVariableDeclaration,
);

declare const nodes: readonly ts.Node[];

const strings = nodes.filter(isStringLike);
// (ts.StringLiteral | ts.NoSubstitutionTemplateLiteral)[]

const declarations = nodes.filter(isNamedDeclaration);
// (ts.ClassDeclaration | ts.FunctionDeclaration |
//  ts.VariableDeclaration)[]`;

const reusableContexts = `import * as ts from 'typescript';
import { and, refineKey } from 'is-kit';

const isIdentifierNamedJsxAttribute = and(
  ts.isJsxAttribute,
  refineKey('name', ts.isIdentifier),
);

declare const attributes: readonly ts.JsxAttributeLike[];

const attribute = attributes.find(isIdentifierNamedJsxAttribute);
// (ts.JsxAttribute & { name: ts.Identifier }) | undefined

function visit(node: ts.Node): void {
  if (isIdentifierNamedJsxAttribute(node)) {
    node.name.text;
  }

  ts.forEachChild(node, visit);
}`;

const optionalChild = `import * as ts from 'typescript';
import { refineDefinedKey } from 'is-kit';

const hasCallInitializer = refineDefinedKey(
  'initializer',
  ts.isCallExpression,
);

declare const declaration: ts.VariableDeclaration;

if (hasCallInitializer(declaration)) {
  declaration.initializer.expression;
  // initializer is present and is ts.CallExpression
}`;

const indexedChild = `import * as ts from 'typescript';
import { and, refineIndex, refineKey } from 'is-kit';

const isCallWithStringFirstArgument = and(
  ts.isCallExpression,
  refineKey('arguments', refineIndex(0, ts.isStringLiteral)),
);

declare const node: ts.Node;

if (isCallWithStringFirstArgument(node)) {
  node.arguments[0].text;
  // arguments[0] is present and is ts.StringLiteral
}`;

const nestedChildren = `import * as ts from 'typescript';
import { and, refineDefinedKey, refineIndex, refineKey } from 'is-kit';

const isBlockStartingWithReturn = and(
  ts.isBlock,
  refineKey('statements', refineIndex(0, ts.isReturnStatement)),
);

const hasBodyStartingWithReturn = refineDefinedKey(
  'body',
  isBlockStartingWithReturn,
);

declare const method: ts.MethodDeclaration;

if (hasBodyStartingWithReturn(method)) {
  method.body.statements[0].expression;
  // body is present, is a block, and starts with a return statement
}`;

const inlineCheck = `import * as ts from 'typescript';

declare const node: ts.Node;
declare function visit(node: ts.Node): void;

// Keep a one-off local branch inline when no reusable guard is needed.
if (ts.isReturnStatement(node) && node.expression) {
  visit(node.expression);
}`;

export default function TypeScriptCompilerApiGuidePage() {
  return (
    <GuideArticle>
      <GuideHeader
        breadcrumbLabel='TypeScript Compiler API'
        media={
          <Image
            src='/iskit_guide3.png'
            alt=''
            width={1000}
            height={420}
            sizes='(max-width: 896px) calc(100vw - 2rem), 864px'
            preload
            className='my-4 h-auto w-full rounded-xl border'
          />
        }
        title='Using is-kit with the TypeScript Compiler API'
        description='Compose ts.isX refinements directly, lift child-node checks onto their parents, and preserve precise AST narrowing without TypeScript-specific adapters.'
      />

      <GuideSection title='The quick answer'>
        <Paragraph>
          Combine a Compiler API node guard with <code>refineKey</code> when a
          required child node must also be narrowed.
        </Paragraph>
        <CodeBlock code={quickAnswer} language='ts' />
        <Paragraph>
          <code>ts.isCallExpression</code> narrows the node.{' '}
          <code>refineKey</code> then applies <code>ts.isIdentifier</code> to
          its required <code>expression</code> property and carries that fact
          back to the parent type.
        </Paragraph>
        <GuideCallout emphasized>
          Check the child once at runtime, then preserve the same checked fact
          on the parent in TypeScript control flow.
        </GuideCallout>
      </GuideSection>

      <GuideSection title='Compose Compiler API refinements directly'>
        <Paragraph>
          Compiler API guards accept <code>ts.Node</code>, not arbitrary{' '}
          <code>unknown</code>. is-kit logic combinators preserve that known
          input domain, so wrappers and assertion casts are unnecessary.
        </Paragraph>
        <CodeBlock code={knownDomainComposition} language='ts' />
        <Paragraph>
          The resulting functions remain ordinary type predicates. Reuse them in
          branches, visitors, <code>filter</code>, <code>find</code>, or other
          APIs that understand TypeScript predicates.
        </Paragraph>
      </GuideSection>

      <GuideSection title='Reuse a refined node in find and visitors'>
        <Paragraph>
          A named guard can move between collection methods and AST traversal
          without losing its refined child type. This is especially useful for
          repeated JSX attribute checks.
        </Paragraph>
        <CodeBlock code={reusableContexts} language='ts' />
        <Paragraph>
          The same predicate narrows the result returned by <code>find</code>{' '}
          and the current node inside the visitor branch.
        </Paragraph>
      </GuideSection>

      <GuideSection title='Choose the child contract explicitly'>
        <GuideTable
          columns={['Helper', 'Child contract', 'Failure before refinement']}
          rows={[
            {
              key: 'required',
              cells: [
                'refineKey',
                'Required property',
                'None; the property belongs to the input contract'
              ]
            },
            {
              key: 'optional',
              cells: [
                'refineDefinedKey',
                'Optional property that must be defined',
                'Missing or undefined value'
              ]
            },
            {
              key: 'index',
              cells: [
                'refineIndex',
                'One readonly-array element',
                'Out of bounds, sparse hole, or undefined value'
              ]
            }
          ]}
        />
        <Paragraph>
          These are separate APIs because absence is runtime behavior, not only
          a type annotation. The helper name tells readers whether missing data
          is outside the contract or should make the predicate return false.
        </Paragraph>
      </GuideSection>

      <GuideSection title='Require and refine an optional child'>
        <Paragraph>
          Compiler API declarations commonly expose optional children such as a
          variable initializer or method body. Use <code>refineDefinedKey</code>{' '}
          when absence should fail safely.
        </Paragraph>
        <CodeBlock code={optionalChild} language='ts' />
        <Paragraph>
          Missing and explicitly <code>undefined</code> initializers return{' '}
          <code>false</code>. They are never passed to the narrow-domain
          Compiler API refinement.
        </Paragraph>
      </GuideSection>

      <GuideSection title='Refine one array element'>
        <Paragraph>
          Node arrays can be empty at runtime even when unchecked indexed access
          makes <code>arguments[0]</code> look defined. Use{' '}
          <code>refineIndex</code> to make the element check explicit.
        </Paragraph>
        <CodeBlock code={indexedChild} language='ts' />
        <Paragraph>
          Index <code>0</code> is narrowed only after the value exists and the
          supplied node refinement succeeds.
        </Paragraph>
      </GuideSection>

      <GuideSection title='Compose nested child checks'>
        <Paragraph>
          Build deeper checks one property or index at a time. A path DSL is not
          required to preserve each intermediate parent type.
        </Paragraph>
        <CodeBlock code={nestedChildren} language='ts' />
        <Paragraph>
          This composition remains safe with{' '}
          <code>exactOptionalPropertyTypes</code> and{' '}
          <code>noUncheckedIndexedAccess</code> enabled.
        </Paragraph>
      </GuideSection>

      <GuideSection title='Use one concrete key or index'>
        <Paragraph>
          The key and index helpers accept one concrete runtime location. Broad
          keys, unions, template-literal patterns, and branded multi-value key
          domains are rejected at compile time.
        </Paragraph>
        <GuideCallout>
          One successful lookup proves one property. It cannot soundly claim
          that every property in a wider key domain passed the refinement.
        </GuideCallout>
      </GuideSection>

      <GuideSection title='Keep one-off checks inline'>
        <Paragraph>
          Composition pays off when a predicate is named, reused, nested, or
          passed to another API. A single local condition may remain clearer in
          the Compiler API's native style.
        </Paragraph>
        <CodeBlock code={inlineCheck} language='ts' />
        <Paragraph>
          Do not extract every boolean expression. Prefer is-kit when the guard
          becomes part of the program's reusable type vocabulary.
        </Paragraph>
      </GuideSection>

      <GuideSection title='What the integration does not add'>
        <GuideList>
          <li>is-kit does not wrap individual Compiler API functions.</li>
          <li>
            It does not depend on TypeScript at runtime or require a TypeScript
            peer dependency.
          </li>
          <li>It does not validate complete AST node shapes.</li>
          <li>It does not detect cycles or control AST traversal.</li>
          <li>It does not replace a clear one-off inline condition.</li>
        </GuideList>
      </GuideSection>

      <GuideSection title='TypeScript 7 Compiler API compatibility'>
        <Paragraph>
          TypeScript 7 can type-check is-kit declarations, but TypeScript 7.0
          does not ship the legacy JavaScript Compiler API used by the examples
          in this guide. API-based tooling should keep the TypeScript 6 API
          available through the official{' '}
          <TextLink href='https://www.npmjs.com/package/@typescript/typescript6'>
            @typescript/typescript6 compatibility package
          </TextLink>
          .
        </Paragraph>
        <Paragraph>
          This is a TypeScript 7 platform transition rather than an is-kit
          runtime limitation. is-kit itself has no TypeScript runtime or peer
          dependency.
        </Paragraph>
      </GuideSection>

      <GuideSection title='Summary' className='border-t pt-8'>
        <GuideList>
          <li>
            Compose <code>ts.isX</code> functions directly.
          </li>
          <li>
            Use <code>refineKey</code> for required child properties.
          </li>
          <li>
            Use <code>refineDefinedKey</code> when an optional child must exist.
          </li>
          <li>
            Use <code>refineIndex</code> for one defined array element.
          </li>
          <li>
            Keep local one-off checks inline when extraction adds no value.
          </li>
        </GuideList>
        <Paragraph>
          See the{' '}
          <TextLink href={API_REFERENCE_PATHS.key}>key API reference</TextLink>{' '}
          for the complete property contracts and the{' '}
          <TextLink href={API_REFERENCE_PATHS.logic}>
            logic API reference
          </TextLink>{' '}
          for known-domain composition.
        </Paragraph>
      </GuideSection>
    </GuideArticle>
  );
}
