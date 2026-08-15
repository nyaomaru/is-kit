import { CodeBlock } from '@/components/code/code-block';
import { Heading } from '@/components/ui/heading';
import { Paragraph } from '@/components/ui/paragraph';
import { Stack } from '@/components/ui/stack';
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
            <li aria-current='page'>Filter nullish values</li>
          </ol>
        </nav>
        <Heading
          variant='h1'
          className='max-w-3xl leading-tight tracking-tight'
        >
          How to Safely Filter null and undefined from Arrays in TypeScript
        </Heading>
        <Paragraph variant='lead' className='max-w-3xl text-primary/80'>
          Remove nullish values, preserve valid falsy values, and let TypeScript
          infer the array you actually have.
        </Paragraph>
      </Stack>

      <Stack variant='section' gap='md'>
        <Heading variant='h2' className='text-2xl tracking-tight'>
          The quick answer
        </Heading>
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
      </Stack>

      <Stack variant='section' gap='md'>
        <Heading variant='h2' className='text-2xl tracking-tight'>
          The tempting shortcut: filter(Boolean)
        </Heading>
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
        <blockquote className='border-l-2 border-primary/70 py-1 pl-5 text-lg leading-relaxed'>
          “Remove nullish values” and “remove every falsy value” are different
          requirements.
        </blockquote>
      </Stack>

      <Stack variant='section' gap='md'>
        <Heading variant='h2' className='text-2xl tracking-tight'>
          Preserve valid falsy values
        </Heading>
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
      </Stack>

      <Stack variant='section' gap='md'>
        <Heading variant='h2' className='text-2xl tracking-tight'>
          The explicit inline version
        </Heading>
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
      </Stack>

      <Stack variant='section' gap='md'>
        <Heading variant='h2' className='text-2xl tracking-tight'>
          A practical object example
        </Heading>
        <Paragraph>
          Nullable values often appear after mapping an object property.
        </Paragraph>
        <CodeBlock code={objectExample} language='ts' />
        <Paragraph>
          The guard is still just a function. It works naturally at the normal
          control-flow point where the nullable values appear.
        </Paragraph>
        <blockquote className='border-l-2 border-primary/70 py-1 pl-5 text-lg leading-relaxed font-semibold'>
          Build small guards, then reuse them where TypeScript narrowing
          matters.
        </blockquote>
      </Stack>

      <Stack variant='section' gap='md'>
        <Heading variant='h2' className='text-2xl tracking-tight'>
          isNil and isNotNil
        </Heading>
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
      </Stack>

      <Stack variant='section' gap='md'>
        <Heading variant='h2' className='text-2xl tracking-tight'>
          Which approach should you use?
        </Heading>
        <div className='overflow-x-auto rounded-md border'>
          <table className='w-full min-w-2xl border-collapse text-left text-sm'>
            <thead>
              <tr className='border-b bg-primary/5'>
                <th className='px-4 py-3 font-semibold tracking-wide'>
                  Approach
                </th>
                <th className='px-4 py-3 font-semibold tracking-wide'>
                  Best for
                </th>
                <th className='px-4 py-3 font-semibold tracking-wide'>
                  Watch out for
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className='border-b'>
                <td className='px-4 py-3'>filter(Boolean)</td>
                <td className='px-4 py-3'>Removing every falsy value</td>
                <td className='px-4 py-3'>Also removes 0, false, and ''</td>
              </tr>
              <tr className='border-b'>
                <td className='px-4 py-3'>Inline predicate</td>
                <td className='px-4 py-3'>A local, one-off check</td>
                <td className='px-4 py-3'>Repeats easily across a codebase</td>
              </tr>
              <tr>
                <td className='px-4 py-3'>filter(isNotNil)</td>
                <td className='px-4 py-3'>Reusable nullish filtering</td>
                <td className='px-4 py-3'>Requires importing is-kit</td>
              </tr>
            </tbody>
          </table>
        </div>
        <Paragraph>
          There is no need to turn every inline condition into an abstraction.
          Use <code>isNotNil</code> when the shared meaning and reusable
          narrowing make the call site clearer.
        </Paragraph>
      </Stack>

      <Stack variant='section' gap='md' className='border-t pt-8'>
        <Heading variant='h2' className='text-2xl tracking-tight'>
          Summary
        </Heading>
        <ul className='list-disc space-y-2 pl-6'>
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
        </ul>
        <Paragraph>
          The goal is not shorter syntax alone. It is making “present value”
          mean the same thing everywhere your TypeScript application needs it.
        </Paragraph>
      </Stack>
    </Stack>
  );
}
