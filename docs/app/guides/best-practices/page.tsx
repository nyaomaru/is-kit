import Image from 'next/image';

import { CodeBlock } from '@/components/code/code-block';
import {
  GuideArticle,
  GuideHeader,
  GuideSection
} from '@/components/guides/guide-layout';
import { GuidePager } from '@/components/guides/pager';
import { GuideTable } from '@/components/guides/guide-table';
import { Paragraph } from '@/components/ui/paragraph';
import { TextLink } from '@/components/ui/text-link';
import { GUIDE_PATHS } from '@/constants/guides';
import { createGuideMetadata } from '@/lib/guide-metadata';

export const metadata = createGuideMetadata(GUIDE_PATHS.bestPractices);

const boundaryExample = `import { isString, oneOfValues, safeParse, struct } from 'is-kit';

const isUser = struct({
  id: isString,
  name: isString,
  role: oneOfValues('admin', 'member'),
});

async function readUser(response: Response) {
  const input: unknown = await response.json();
  const result = safeParse(isUser, input);
  if (!result.valid) throw new Error('Invalid user response');
  return result.value;
}`;

const refinementExample = `import { isString, refineKey } from 'is-kit';

type Item = { id: number; value: string | number };
declare const items: Item[];

const hasStringValue = refineKey('value', isString);
const textItems = items.filter(hasStringValue);
// Each item retains its id and has a string value.`;

export default function BestPracticesGuidePage() {
  return (
    <GuideArticle>
      <GuideHeader
        breadcrumbLabel='Best practices'
        media={
          <Image
            src='/iskit_best_practice.png'
            alt='is-kit logo and pixel-art mascot wearing glasses'
            width={1000}
            height={420}
            sizes='(max-width: 896px) calc(100vw - 2rem), 864px'
            preload
            className='my-4 h-auto w-full rounded-xl border'
          />
        }
        title='Best Practices for Using is-kit in Real Projects'
        description='Put checks where trust changes, keep useful guards close to their purpose, and let ordinary TypeScript handle the rest.'
      />

      <GuideSection title='Two jobs, two starting points'>
        <div className='grid gap-4 sm:grid-cols-2'>
          <div className='rounded-lg border border-primary/50 bg-primary/5 p-5'>
            <p className='text-xs font-semibold tracking-wider uppercase text-primary'>
              External data
            </p>
            <p className='mt-3 text-lg font-semibold'>
              Unknown → validate → use
            </p>
            <p className='mt-2 text-sm leading-relaxed text-muted-foreground'>
              Check what entered the application before trusting its shape.
            </p>
          </div>
          <div className='rounded-lg border p-5'>
            <p className='text-xs font-semibold tracking-wider uppercase text-primary'>
              Known data
            </p>
            <p className='mt-3 text-lg font-semibold'>Typed → refine → use</p>
            <p className='mt-2 text-sm leading-relaxed text-muted-foreground'>
              Keep the existing type and narrow only what you need.
            </p>
          </div>
        </div>
      </GuideSection>

      <GuideSection title='Validate where trust changes'>
        <Paragraph>
          HTTP responses, storage, and messages can contain unexpected values.
          Keep them <code>unknown</code> until a guard accepts them;{' '}
          <code>input as User</code> performs no runtime check.
        </Paragraph>
        <CodeBlock code={boundaryExample} language='ts' />
        <Paragraph>
          Reject a required response or choose a fallback for recoverable data.
          Handle decoding and transport failures too. Pass the accepted value
          onward; recheck if it can change or crosses another trust boundary.
          See{' '}
          <TextLink href={GUIDE_PATHS.validateUnknown}>
            validating unknown values
          </TextLink>{' '}
          for more on boundary checks.
        </Paragraph>
      </GuideSection>

      <GuideSection title='Keep guards near their purpose'>
        <Paragraph>
          A named guard gives a meaningful check one home for reuse and tests.
          Trivial one-off checks can stay inline. Place guards where their
          purpose is easiest to find:
        </Paragraph>
        <GuideTable
          columns={['Guard', 'A useful home']}
          rows={[
            {
              key: 'api',
              cells: ['Response shape', 'Beside the API function']
            },
            { key: 'storage', cells: ['Stored state', 'Near its reader'] },
            {
              key: 'domain',
              cells: ['Shared domain rule', 'With the domain or shared guards']
            }
          ]}
        />
        <Paragraph>
          A small <code>utils/is.ts</code> is fine to start; split it when
          unrelated guards become hard to find. A shared facade can help, but
          direct imports work too. The boundary matters more than the folder
          name.
        </Paragraph>
        <Paragraph>
          Compose small checks. Use <code>typedStruct</code> to help detect
          drift from an existing type, or <code>struct</code> when the accepted
          boundary shape differs. See{' '}
          <TextLink href={GUIDE_PATHS.syncTypeGuards}>
            keeping guards in sync
          </TextLink>{' '}
          and{' '}
          <TextLink href={GUIDE_PATHS.heyApiTypedStruct}>
            validating generated API types
          </TextLink>
          .
        </Paragraph>
      </GuideSection>

      <GuideSection title='Refine known values instead of validating again'>
        <Paragraph>
          If an internal value already has a useful type, narrow the property
          you need instead of validating the whole object again.
        </Paragraph>
        <CodeBlock code={refinementExample} language='ts' />
        <Paragraph>
          This assumes the input already satisfies <code>Item</code>; it does
          not validate an unknown object. See the{' '}
          <TextLink href={GUIDE_PATHS.propertyRefinement}>
            property refinement guide
          </TextLink>{' '}
          for optional and nested properties.
        </Paragraph>
      </GuideSection>

      <GuideSection title='Keep the toolkit small'>
        <Paragraph>
          Add guards where runtime uncertainty or reusable refinement calls for
          them. You do not need a guard for every TypeScript type. The library
          decisions behind this guidance are in the{' '}
          <TextLink href={GUIDE_PATHS.designPrinciples}>
            design principles and non-goals
          </TextLink>
          .
        </Paragraph>
      </GuideSection>
      <GuidePager currentHref={GUIDE_PATHS.bestPractices} />
    </GuideArticle>
  );
}
