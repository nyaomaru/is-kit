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

export const metadata = createGuideMetadata(GUIDE_PATHS.filterNullish);

const quickAnswer = `import { isNotNil } from 'is-kit';

const values: Array<string | null | undefined> = [
  'Ada',
  null,
  'Linus',
  undefined,
];

const names = values.filter(isNotNil);
//    ^? string[]`;

const booleanShortcut = `const values: Array<string | null | undefined> = [
  'Ada',
  null,
  '',
  undefined,
];

const names = values.filter(Boolean);
// Runtime result: ['Ada']
// TypeScript type: Array<string | null | undefined>`;

const falsyValues = `import { isNotNil } from 'is-kit';

const values: Array<string | number | boolean | null | undefined> = [
  'ready',
  '',
  0,
  false,
  null,
  undefined,
];

const presentValues = values.filter(isNotNil);
// ['', 0, false, 'ready'] are all valid non-nullish values.
// Type: Array<string | number | boolean>`;

const inlineCheck = `const values: Array<string | null | undefined> = [
  'Ada',
  null,
  undefined,
];

const names = values.filter(
  (value): value is string => value !== null && value !== undefined,
);`;

const objectExample = `import { isNotNil } from 'is-kit';

type User = {
  id: string;
  nickname?: string | null;
};

const users: User[] = [
  { id: '1', nickname: 'nyaomaru' },
  { id: '2', nickname: null },
  { id: '3' },
];

const nicknames = users
  .map((user) => user.nickname)
  .filter(isNotNil);

// nicknames: string[]`;

const directCheck = `import { isNil, isNotNil } from 'is-kit';

declare const value: string | null | undefined;

if (isNil(value)) {
  // value: null | undefined
}

if (isNotNil(value)) {
  // value: string
}`;

export default function FilterNullAndUndefinedGuidePage() {
  return (
    <GuideArticle>
      <GuideHeader
        breadcrumbLabel='Filter nullish values'
        media={
          <Image
            src='/iskit_guide1.png'
            alt='guide1 thumbnail'
            width={1000}
            height={420}
            sizes='(max-width: 896px) calc(100vw - 2rem), 864px'
            preload
            className='my-4 h-auto w-full rounded-xl border'
          />
        }
        title='How to Safely Filter null and undefined from Arrays in TypeScript'
        description='Remove nullish values, preserve valid falsy values, and let TypeScript infer the array you actually have.'
      />

      <GuideSection title='The quick answer'>
        <Paragraph>
          Pass <code>isNotNil</code> directly to <code>Array.filter</code>.
        </Paragraph>
        <CodeBlock code={quickAnswer} language='ts' />
        <Paragraph>
          At runtime, <code>null</code> and <code>undefined</code> are removed.
          At compile time, the result narrows from{' '}
          <code>Array&lt;string | null | undefined&gt;</code> to{' '}
          <code>string[]</code>.
        </Paragraph>
        <Paragraph>
          That is the whole solution. But the common alternatives are worth
          understanding, because they do not all mean the same thing.
        </Paragraph>
      </GuideSection>

      <GuideSection title='The tempting shortcut: filter(Boolean)'>
        <Paragraph>You may already have code like this:</Paragraph>
        <CodeBlock code={booleanShortcut} language='ts' />
        <Paragraph>This works.</Paragraph>
        <Paragraph>But it solves a broader problem.</Paragraph>
        <Paragraph>
          <code>Boolean</code> removes every falsy value, not only{' '}
          <code>null</code> and <code>undefined</code>. That includes empty
          strings, zero, and <code>false</code>. It also does not communicate a
          nullish-specific type predicate to <code>Array.filter</code>.
        </Paragraph>
        <GuideCallout>
          “Remove nullish values” and “remove every falsy value” are different
          requirements.
        </GuideCallout>
      </GuideSection>

      <GuideSection title='Preserve valid falsy values'>
        <Paragraph>
          A value does not become missing just because JavaScript considers it
          falsy.
        </Paragraph>
        <CodeBlock code={falsyValues} language='ts' />
        <Paragraph>
          This distinction matters in real application data. A quantity of{' '}
          <code>0</code>, a disabled flag set to <code>false</code>, or an empty
          user input may all be valid values.
        </Paragraph>
        <Paragraph>
          <code>isNotNil</code> rejects exactly two values: <code>null</code>{' '}
          and <code>undefined</code>.
        </Paragraph>
      </GuideSection>

      <GuideSection title='The explicit inline version'>
        <Paragraph>
          You do not need a library for a one-off check. An explicit type
          predicate is perfectly valid TypeScript.
        </Paragraph>
        <CodeBlock code={inlineCheck} language='ts' />
        <Paragraph>
          The code is not broken. It is simply repetitive when the same rule
          appears across API adapters, selectors, and UI helpers.
        </Paragraph>
        <Paragraph>
          <code>isNotNil</code> gives that rule one reusable name. Because it is
          generic, it preserves whatever non-nullish union each array already
          contains.
        </Paragraph>
      </GuideSection>

      <GuideSection title='A practical object example'>
        <Paragraph>
          Nullable values often appear after mapping an object property.
        </Paragraph>
        <CodeBlock code={objectExample} language='ts' />
        <Paragraph>
          The guard is still just a function. It works naturally at the normal
          control-flow point where the nullable values appear.
        </Paragraph>
        <GuideCallout emphasized>
          Build small guards, then reuse them where TypeScript narrowing
          matters.
        </GuideCallout>
      </GuideSection>

      <GuideSection title='isNil and isNotNil'>
        <Paragraph>
          Use <code>isNotNil</code> when you want the non-nullish values. Use{' '}
          <code>isNil</code> when you want to handle the missing branch itself.
        </Paragraph>
        <CodeBlock code={directCheck} language='ts' />
        <Paragraph>
          For the complete nullability API—including <code>nullable</code>,{' '}
          <code>nullish</code>, <code>optional</code>, and <code>required</code>
          —see the{' '}
          <TextLink href={API_REFERENCE_PATHS.nullish}>
            nullish API reference
          </TextLink>
          .
        </Paragraph>
      </GuideSection>

      <GuideSection title='Which approach should you use?'>
        <GuideTable
          columns={['Approach', 'Best for', 'Watch out for']}
          rows={[
            {
              key: 'filter-boolean',
              cells: [
                'filter(Boolean)',
                'Removing every falsy value',
                "Also removes 0, false, and ''"
              ]
            },
            {
              key: 'inline-predicate',
              cells: [
                'Inline predicate',
                'A local, one-off check',
                'Repeats easily across a codebase'
              ]
            },
            {
              key: 'filter-is-not-nil',
              cells: [
                'filter(isNotNil)',
                'Reusable nullish filtering',
                'Requires importing is-kit'
              ]
            }
          ]}
        />
        <Paragraph>
          There is no need to turn every inline condition into an abstraction.
          Use <code>isNotNil</code> when the shared meaning and reusable
          narrowing make the call site clearer.
        </Paragraph>
      </GuideSection>

      <GuideSection title='Summary' className='border-t pt-8'>
        <GuideList>
          <li>
            Use <code>filter(isNotNil)</code> to remove <code>null</code> and{' '}
            <code>undefined</code> while narrowing the result.
          </li>
          <li>
            Avoid <code>filter(Boolean)</code> when zero, false, or empty
            strings are valid values.
          </li>
          <li>An inline predicate is fine when the check is truly one-off.</li>
          <li>
            Prefer a named guard when the same runtime meaning appears in more
            than one place.
          </li>
        </GuideList>
        <Paragraph>
          The goal is not shorter syntax alone. It is making “present value”
          mean the same thing everywhere your TypeScript application needs it.
        </Paragraph>
      </GuideSection>
    </GuideArticle>
  );
}
