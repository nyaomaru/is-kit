import { CodeBlock } from '@/components/code/code-block';
import {
  GuideArticle,
  GuideHeader,
  GuideList,
  GuideSection
} from '@/components/guides/guide-layout';
import { GuidePager } from '@/components/guides/pager';
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
        title='Best Practices for Using is-kit in Real Projects'
        description='Put checks where trust changes, keep useful guards close to their purpose, and let ordinary TypeScript handle the rest.'
      />

      <GuideSection title='Validate at a trust boundary'>
        <Paragraph>
          HTTP responses, storage, messages, and third-party SDK results can
          contain values your application has not verified. Keep uncertain data
          as <code>unknown</code>, check it near the entry point, and pass the
          accepted value to application code. A type assertion such as{' '}
          <code>input as User</code> performs no runtime check.
        </Paragraph>
        <CodeBlock code={boundaryExample} language='ts' />
        <Paragraph>
          Choose failure handling for the boundary: reject a required response,
          or return a fallback for recoverable stored data. Handle decoding and
          transport failures as well as guard mismatches. Validate once when
          possible; recheck if a value crosses another trust boundary or can
          change in the meantime. See{' '}
          <TextLink href={GUIDE_PATHS.validateUnknown}>
            validating unknown values
          </TextLink>{' '}
          for more on boundary checks.
        </Paragraph>
      </GuideSection>

      <GuideSection title='Keep guards near their purpose'>
        <Paragraph>
          Name and reuse a guard when it represents a meaningful application
          concept. That makes intent and runtime semantics consistent, and gives
          tests one place to exercise edge cases. A trivial one-off check can
          stay inline.
        </Paragraph>
        <Paragraph>
          Keep a response guard beside its API function, a storage guard near
          its reader, or a shared domain guard with the domain it describes. A
          small <code>utils/is.ts</code> can be enough initially; split it when
          unrelated domains make it hard to navigate. A shared module or facade
          can expose common composed guards, but direct is-kit imports are also
          reasonable. The boundary matters more than the folder name.
        </Paragraph>
        <Paragraph>
          Compose small checks for shared rules, then build the shape needed at
          each boundary. For an existing object type, <code>typedStruct</code>{' '}
          can help detect drift; use <code>struct</code> when the accepted
          boundary shape is deliberately different. See{' '}
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
          Internal values may already have a useful type. If the task is to
          select one variant or narrow a property, refine that information
          rather than rebuilding a guard for the entire object.
        </Paragraph>
        <CodeBlock code={refinementExample} language='ts' />
        <Paragraph>
          This assumes the input already satisfies <code>Item</code>; it does
          not validate an unknown object. See the{' '}
          <TextLink href={GUIDE_PATHS.propertyRefinement}>
            property refinement guide
          </TextLink>{' '}
          for optional and nested properties. Not every TypeScript type needs a
          runtime guard: add one where runtime uncertainty or a reusable
          refinement calls for it.
        </Paragraph>
      </GuideSection>

      <GuideSection title='A quick review'>
        <GuideList>
          <li>Keep external values unknown until a suitable check succeeds.</li>
          <li>Put meaningful named guards near their domain or boundary.</li>
          <li>
            Pass accepted values onward instead of repeatedly parsing them.
          </li>
          <li>Use refinements for known types and compose existing guards.</li>
        </GuideList>
        <Paragraph>
          The library decisions behind this guidance are in the{' '}
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
