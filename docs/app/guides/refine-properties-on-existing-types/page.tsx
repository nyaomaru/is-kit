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

export const metadata = createGuideMetadata(GUIDE_PATHS.propertyRefinement);

const quickAnswer = `import { isString, refineKey } from 'is-kit';

type Item = {
  readonly id: number;
  readonly value: string | number;
};

const hasStringValue = refineKey('value', isString);

declare const items: readonly Item[];

const textItems = items.filter(hasStringValue);
// Array<Item & Record<'value', string>>

textItems[0]?.value.toUpperCase();`;

const extractedCondition = `import { isString, refineKey } from 'is-kit';

type Item = { readonly value: string | number };
declare const items: readonly Item[];

const checksStringValue = (item: Item) => isString(item.value);
const checked = items.filter(checksStringValue);
// Item[]: the extracted function returns boolean

const hasStringValue = refineKey('value', isString);
const refined = items.filter(hasStringValue);
// Array<Item & Record<'value', string>>`;

const requiredProperty = `import { isString, refineKey } from 'is-kit';

type Message = {
  readonly id: string;
  readonly body: string | Uint8Array;
};

const hasTextBody = refineKey('body', isString);

declare const message: Message;

if (hasTextBody(message)) {
  message.body.toUpperCase(); // body: string
  message.id.toUpperCase(); // unrelated fields remain available
}`;

const optionalProperty = `import { isString, refineDefinedKey } from 'is-kit';

type Job = {
  readonly id: string;
  readonly result?: string | Uint8Array;
};

const hasTextResult = refineDefinedKey('result', isString);

declare const jobs: readonly Job[];

const completedTextJobs = jobs.filter(hasTextResult);
// Array<Job & Record<'result', string>>`;

const indexedProperty = `import { isString, refineIndex, refineKey } from 'is-kit';

type Batch = {
  readonly values: readonly (string | number)[];
};

const startsWithString = refineKey(
  'values',
  refineIndex(0, isString),
);

declare const batch: Batch;

if (startsWithString(batch)) {
  batch.values[0].toUpperCase(); // index 0 exists and is string
}`;

const nestedAndLiteral = `import {
  andAll,
  equals,
  isString,
  refineKey,
} from 'is-kit';

type TextPayload = {
  readonly kind: 'text';
  readonly status: 'pending' | 'ready';
  readonly body: string | Uint8Array;
};

type Payload =
  | TextPayload
  | { readonly kind: 'binary'; readonly bytes: Uint8Array };

type Envelope = { readonly payload: Payload };

const isTextPayload = (payload: Payload): payload is TextPayload =>
  payload.kind === 'text';

const hasReadyTextPayload = refineKey(
  'payload',
  andAll(
    isTextPayload,
    refineKey('status', equals('ready')),
    refineKey('body', isString),
  ),
);

declare const envelope: Envelope;

if (hasReadyTextPayload(envelope)) {
  envelope.payload.status; // 'ready'
  envelope.payload.body.toUpperCase(); // string
}`;

const explicitAlternative = `type Item = { readonly value: string | number };
type ItemWithStringValue = Item & { readonly value: string };

const hasStringValue = (item: Item): item is ItemWithStringValue =>
  typeof item.value === 'string';`;

export default function RefinePropertiesOnExistingTypesGuidePage() {
  return (
    <GuideArticle>
      <GuideHeader
        breadcrumbLabel='Refine existing properties'
        title='Refine Properties on Existing TypeScript Types'
        description='Lift a check on one child value back onto its parent, then reuse the resulting predicate in branches, filter, find, and deeper compositions.'
      />

      <GuideSection title='The quick answer'>
        <Paragraph>
          Use <code>refineKey</code> when the parent is already typed and a
          required property needs a more precise reusable predicate.
        </Paragraph>
        <CodeBlock code={quickAnswer} language='ts' />
        <Paragraph>
          The result preserves both facts: the value is still an{' '}
          <code>Item</code>, and its <code>value</code> property is a string.
          The named predicate carries that intersection through{' '}
          <code>filter</code> without a handwritten predicate annotation.
        </Paragraph>
        <GuideCallout emphasized>
          Property refinement is useful when the parent type is already known.
          It is not a replacement for validating an unknown object shape.
        </GuideCallout>
      </GuideSection>

      <GuideSection title='Why lift the child check onto its parent'>
        <Paragraph>
          TypeScript narrows a property inside a local branch, but an extracted
          compound condition does not generally advertise the corresponding
          parent-property intersection as its return type.
        </Paragraph>
        <CodeBlock code={extractedCondition} language='ts' />
        <Paragraph>
          <code>refineKey</code> turns the same runtime check into a reusable
          type predicate. This is the core capability; it applies to ordinary
          application models, library types, generated clients, and ASTs alike.
        </Paragraph>
      </GuideSection>

      <GuideSection title='Choose the property contract explicitly'>
        <GuideTable
          columns={['Helper', 'Use it for', 'Returns false before refinement']}
          rows={[
            {
              key: 'required',
              cells: [
                'refineKey',
                'One required property',
                'Never; the property belongs to the input contract'
              ]
            },
            {
              key: 'optional',
              cells: [
                'refineDefinedKey',
                'One optional property that must be defined',
                'The value is missing or undefined'
              ]
            },
            {
              key: 'index',
              cells: [
                'refineIndex',
                'One readonly-array element',
                'The index is absent, sparse, inherited, or undefined'
              ]
            }
          ]}
        />
        <Paragraph>
          Absence is runtime behavior, not only a type annotation. Separate
          helpers make it visible whether a missing child violates the input
          contract or simply makes the predicate fail.
        </Paragraph>
      </GuideSection>

      <GuideSection title='Refine one required property'>
        <Paragraph>
          <code>refineKey</code> reads a required property once, applies the
          supplied refinement once, and preserves every unrelated part of the
          parent type.
        </Paragraph>
        <CodeBlock code={requiredProperty} language='ts' />
        <Paragraph>
          It uses normal property access, so inherited properties and accessors
          follow ordinary JavaScript behavior.
        </Paragraph>
      </GuideSection>

      <GuideSection title='Require and refine an optional property'>
        <Paragraph>
          Use <code>refineDefinedKey</code> when absence is allowed by the input
          type but should make this particular predicate return false.
        </Paragraph>
        <CodeBlock code={optionalProperty} language='ts' />
        <Paragraph>
          A missing or explicitly <code>undefined</code> result is not passed to{' '}
          <code>isString</code>. A successful check records the property as
          required and narrowed on the parent.
        </Paragraph>
      </GuideSection>

      <GuideSection title='Refine one array element'>
        <Paragraph>
          Use <code>refineIndex</code> when one concrete array position must
          exist and satisfy another refinement. Lift it with{' '}
          <code>refineKey</code> when the array belongs to a parent object.
        </Paragraph>
        <CodeBlock code={indexedProperty} language='ts' />
        <Paragraph>
          The own-element check rejects out-of-bounds access, sparse holes,
          inherited numeric properties, and explicit <code>undefined</code>,
          including when <code>noUncheckedIndexedAccess</code> is disabled.
        </Paragraph>
      </GuideSection>

      <GuideSection title='Compose nested and literal refinements'>
        <Paragraph>
          Property refinements remain ordinary predicates. Compose them one
          property at a time with <code>andAll</code>, and use{' '}
          <code>equals</code> when the child should narrow to a literal value.
        </Paragraph>
        <CodeBlock code={nestedAndLiteral} language='ts' />
        <Paragraph>
          Each successful check remains visible on the final parent type. A
          concrete child guard establishes the input domain, the following
          property refinements accumulate facts about that child, and the outer{' '}
          <code>refineKey</code> carries the result back to the parent.
        </Paragraph>
      </GuideSection>

      <GuideSection title='Know when a local predicate is enough'>
        <Paragraph>
          A handwritten predicate remains a clear dependency-free alternative,
          especially for one local shape. The tradeoff is writing and
          maintaining the parent intersection yourself.
        </Paragraph>
        <CodeBlock code={explicitAlternative} language='ts' />
        <GuideCallout>
          Use the helpers when the pattern repeats, composes, or benefits from a
          shared type vocabulary. Keep a one-off local branch inline when it is
          already the clearest expression.
        </GuideCallout>
      </GuideSection>

      <GuideSection title='Advanced example: Compiler API nodes'>
        <Paragraph>
          The TypeScript Compiler API is a demanding application of the same
          generic pattern: broad nodes first narrow with an <code>isX</code>{' '}
          guard, then child properties need reusable refinements of their own.
        </Paragraph>
        <Paragraph>
          Continue with{' '}
          <TextLink href={GUIDE_PATHS.typescriptCompilerApi}>
            Advanced property refinement with the TypeScript Compiler API
          </TextLink>{' '}
          for required, optional, indexed, and nested AST examples.
        </Paragraph>
      </GuideSection>

      <GuideSection title='Summary' className='border-t pt-8'>
        <GuideList>
          <li>
            Use <code>refineKey</code> for one required property.
          </li>
          <li>
            Use <code>refineDefinedKey</code> when an optional property must be
            present and defined.
          </li>
          <li>
            Use <code>refineIndex</code> for one defined own array element.
          </li>
          <li>Compose helpers to retain nested and literal child facts.</li>
          <li>
            Validate unknown object shapes with a guard such as struct first.
          </li>
        </GuideList>
        <Paragraph>
          See the{' '}
          <TextLink href={API_REFERENCE_PATHS.key}>
            <i>key API reference</i>
          </TextLink>{' '}
          for the complete contracts and key-domain restrictions.
        </Paragraph>
      </GuideSection>
    </GuideArticle>
  );
}
