import { CodeBlock } from '@/components/code/code-block';
import {
  GuideArticle,
  GuideHeader,
  GuideSection
} from '@/components/guides/guide-layout';
import { GuidePager } from '@/components/guides/pager';
import { Card } from '@/components/ui/card';
import { Heading } from '@/components/ui/heading';
import { Paragraph } from '@/components/ui/paragraph';
import { TextLink } from '@/components/ui/text-link';
import { GUIDE_PATHS } from '@/constants/guides';
import { createGuideMetadata } from '@/lib/guide-metadata';

export const metadata = createGuideMetadata(GUIDE_PATHS.trustBoundaries);

const trustSteps = [
  'External value',
  'unknown',
  'validate',
  'Trusted value',
  'ordinary TypeScript'
] as const;

const boundaries = [
  {
    id: 'storage',
    title: 'Browser storage',
    description: 'Persisted text is still runtime data when it is read back.',
    flow: 'stored text → decode → validate → application state'
  },
  {
    id: 'search',
    title: 'URL and search parameters',
    description: 'A query value stays string | null until a guard accepts it.',
    flow: 'string | null → narrow → domain value'
  },
  {
    id: 'api',
    title: 'API and SDK responses',
    description: 'Validate the response or field that is still uncertain.',
    flow: 'external response → uncertain data → validate what matters'
  },
  {
    id: 'payloads',
    title: 'Server and decoded payloads',
    description: 'A request body or decoded JSON text enters as unknown.',
    flow: 'request / decoded payload → unknown → application value'
  }
] as const;

const probablyYes = [
  'HTTP or other external response',
  'Browser storage',
  'URL or search parameters',
  'Request body',
  'Third-party payload',
  'Decoded JSON whose shape is not yet established'
] as const;

const usuallyNo = [
  'A value already validated at the boundary',
  'Ordinary component or application state',
  'An already trusted domain object',
  'A typed value that only needs property refinement',
  'A value that has not crossed another trust boundary'
] as const;

const storedDrafts = `import {
  arrayOf,
  isString,
  optionalKey,
  safeJsonParse,
  struct,
} from 'is-kit';

const isDraft = struct({
  title: isString,
  note: optionalKey(isString),
});

const isDraftList = arrayOf(isDraft);

function readDrafts(storage: Storage, key: string) {
  try {
    const raw = storage.getItem(key);
    if (raw === null) return [];

    const parsed = safeJsonParse(raw, isDraftList);
    return parsed.valid ? parsed.value : [];
  } catch {
    // Storage can throw when it is unavailable.
    return [];
  }
}`;

const searchQuery = `import {
  and,
  isSafeInteger,
  isString,
  oneOfValues,
  predicateToRefine,
} from 'is-kit';

const isView = oneOfValues('list', 'board');

const isNonEmptyString = and(
  isString,
  predicateToRefine<string>((value) => value.trim().length > 0),
);

const isPositiveIntString = and(
  isString,
  predicateToRefine<string>((value) => /^[1-9]\\d*$/.test(value)),
);

function readPage(value: string | null): number {
  if (!isPositiveIntString(value)) return 1;

  // The text matched an integer pattern. Number only converts it.
  const page = Number(value);
  return isSafeInteger(page) ? page : 1;
}

function readQuery(params: URLSearchParams) {
  const viewParam = params.get('view');
  const token = params.get('token');

  return {
    view: viewParam !== null && isView(viewParam) ? viewParam : 'list',
    token: isNonEmptyString(token) ? token : undefined,
    page: readPage(params.get('page')),
  };
}`;

const fetchItems = `import { arrayOf, isString, oneOfValues, safeParse, struct } from 'is-kit';

const isItem = struct({
  id: isString,
  name: isString,
  status: oneOfValues('open', 'closed'),
});

async function readItems(response: Response) {
  if (!response.ok) {
    throw new Error('Request failed');
  }

  const payload: unknown = await response.json();
  const parsed = safeParse(arrayOf(isItem), payload);

  if (!parsed.valid) {
    throw new Error('Invalid items response');
  }

  return parsed.value;
}`;

const nestedField = `import {
  arrayOf,
  isString,
  nullable,
  optionalKey,
  safeParse,
  struct,
} from 'is-kit';

type SettingsResponse = {
  companyName: string;
  // This field is still uncertain, so the reader checks it below.
  plans: unknown;
};

const isPlans = nullable(
  arrayOf(
    struct({
      name: optionalKey(nullable(isString)),
    }),
  ),
);

function readPlans(settings: SettingsResponse) {
  const parsed = safeParse(isPlans, settings.plans);

  if (!parsed.valid || parsed.value === null) return [];

  return parsed.value;
}`;

const routeHandler = `import { isString, safeParse, struct } from 'is-kit';

const isCreateMessage = struct({
  title: isString,
  body: isString,
});

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: 'Invalid request' }, { status: 400 });
  }

  const parsed = safeParse(isCreateMessage, payload);
  if (!parsed.valid) {
    return Response.json({ error: 'Invalid request' }, { status: 400 });
  }

  const message = parsed.value;
  return Response.json({ title: message.title }, { status: 201 });
}`;

const decodedClaims = `import { isNumber, isString, optionalKey, safeJsonParse, struct } from 'is-kit';

const isSessionClaims = struct({
  sub: optionalKey(isString),
  exp: optionalKey(isNumber),
});

function readClaims(payloadJson: string) {
  const parsed = safeJsonParse(payloadJson, isSessionClaims);
  return parsed.valid ? parsed.value : undefined;
}`;

/**
 * Renders a compact boundary path with arrows that point down on small screens.
 * @param label Short name for the path.
 * @param steps Ordered labels from the uncertain value to the trusted result.
 * @returns Bordered flow panel.
 */
function FlowPanel({
  label,
  steps
}: {
  label: string;
  steps: readonly string[];
}) {
  return (
    <div className='rounded-xl border border-primary/40 bg-primary/5 p-6 sm:p-8'>
      <p className='text-xs font-semibold tracking-[0.18em] uppercase text-primary'>
        {label}
      </p>
      <ol className='mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3'>
        {steps.map((step, index) => (
          <li
            key={step}
            className='flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-3'
          >
            <span className='font-mono text-sm font-semibold sm:text-base'>
              {step}
            </span>
            {index < steps.length - 1 ? (
              <span aria-hidden='true' className='text-xl text-primary'>
                <span className='inline-block rotate-90 sm:rotate-0'>→</span>
              </span>
            ) : null}
          </li>
        ))}
      </ol>
    </div>
  );
}

export default function WhereToValidateGuidePage() {
  return (
    <GuideArticle>
      <GuideHeader
        breadcrumbLabel='Where to validate'
        title='Where to Validate in a Real Application'
        description='Check a value where trust changes. After it is accepted, ordinary TypeScript handles it until the next boundary.'
      />

      <div className='rounded-xl border border-primary/40 bg-primary/5 px-6 py-8 sm:px-10 sm:py-12'>
        <p className='text-xs font-semibold tracking-[0.18em] uppercase text-primary'>
          Where trust changes
        </p>
        <ol
          aria-label='From an external value to ordinary TypeScript'
          className='mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4'
        >
          {trustSteps.map((step, index) => (
            <li
              key={step}
              className='flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4'
            >
              <span className='text-lg font-semibold tracking-tight sm:text-xl'>
                {step}
              </span>
              {index < trustSteps.length - 1 ? (
                <span aria-hidden='true' className='text-2xl text-primary'>
                  <span className='inline-block rotate-90 sm:rotate-0'>→</span>
                </span>
              ) : null}
            </li>
          ))}
        </ol>
      </div>

      <GuideSection title='Boundaries at a glance'>
        <ul className='grid gap-3 sm:grid-cols-2'>
          {boundaries.map((boundary, index) => (
            <li key={boundary.id}>
              <a
                href={`#${boundary.id}`}
                className='group block h-full rounded-lg border bg-card p-5 transition-colors hover:border-primary focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring'
              >
                <span className='link-underline inline-block font-semibold tabular-nums'>
                  0{index + 1}: {boundary.title}
                </span>
                <span className='mt-3 block text-sm leading-relaxed text-muted-foreground'>
                  {boundary.description}
                </span>
                <span className='mt-4 block font-mono text-xs leading-relaxed'>
                  {boundary.flow}
                </span>
              </a>
            </li>
          ))}
        </ul>
        <Paragraph>
          <TextLink href={GUIDE_PATHS.designPrinciples}>
            Design principles
          </TextLink>{' '}
          explain why these checks stay small.{' '}
          <TextLink href={GUIDE_PATHS.bestPractices}>Best practices</TextLink>{' '}
          cover how to organize them.{' '}
          <TextLink href={GUIDE_PATHS.validateUnknown}>
            Validating unknown values
          </TextLink>{' '}
          shows how a check works.
        </Paragraph>
      </GuideSection>

      <GuideSection
        id='storage'
        title='01 / Browser storage'
        className='scroll-mt-20'
      >
        <Paragraph>
          <code>localStorage</code> and <code>sessionStorage</code> return a
          string or <code>null</code>. Reading that string back does not restore
          the type written earlier. Missing, stale, edited, or non-JSON text is
          recoverable, so this reader returns an empty list.{' '}
          <code>safeJsonParse</code> decodes the text and applies the guard
          together.
        </Paragraph>
        <FlowPanel
          label='Stored drafts'
          steps={[
            'localStorage',
            'string | null',
            'JSON decode',
            'unknown',
            'isDraftList',
            'Draft[]'
          ]}
        />
        <CodeBlock code={storedDrafts} language='ts' />
        <Paragraph>
          <code>readDrafts</code> returns that list for ordinary TypeScript.
          Read the key again after another write. Keep the guard next to the
          reader, and include only the fields that the reader still uses.
        </Paragraph>
      </GuideSection>

      <GuideSection
        id='search'
        title='02 / URL and search parameters'
        className='scroll-mt-20'
      >
        <Paragraph>
          <code>URLSearchParams#get</code> returns <code>string | null</code>.
          Some routers coerce numeric-looking query values before your code sees
          them, so read the raw query string when the exact text matters.
        </Paragraph>
        <FlowPanel
          label='Search query'
          steps={[
            'URLSearchParams',
            'string | null',
            'guard',
            'view / token / page'
          ]}
        />
        <CodeBlock code={searchQuery} language='ts' />
        <Paragraph>
          An unknown <code>view</code> becomes <code>&apos;list&apos;</code>. A
          missing or blank token stays absent. <code>page</code> continues from
          accepted integer text through <code>Number</code> to a safe integer.
          <code>Number</code> only converts text the guard has already accepted,
          and missing or non-integer text uses <code>1</code>. The returned
          object is the trusted query. Casting{' '}
          <code>get(&apos;token&apos;)</code> with <code>as string</code> hides
          a missing token from both the type and the runtime.
        </Paragraph>
      </GuideSection>

      <GuideSection
        id='api'
        title='03 / API and SDK responses'
        className='scroll-mt-20'
      >
        <Paragraph>
          <code>response.json()</code> is data from another process. Assign it
          to <code>unknown</code> and accept the fields this call uses. The
          status comes from <code>response.ok</code>; the shape comes from the
          guard.
        </Paragraph>
        <FlowPanel
          label='Response body'
          steps={[
            'response.json()',
            'unknown',
            'validate once',
            'trusted items'
          ]}
        />
        <CodeBlock code={fetchItems} language='ts' />
        <Paragraph>
          <code>readItems</code> returns the accepted array. Callers filter and
          render it with ordinary TypeScript, and call <code>readItems</code>{' '}
          again when they need a new response.
        </Paragraph>
        <div className='grid gap-4 sm:grid-cols-2'>
          <Card className='border-primary/60 bg-primary/5 p-6'>
            <h3 className='font-semibold'>Validate here</h3>
            <ul className='mt-4 list-disc space-y-2 pl-5 text-sm leading-relaxed'>
              <li>
                A raw <code>fetch()</code> response
              </li>
              <li>Runtime-uncertain nested data</li>
              <li>Third-party data the application has not accepted yet</li>
            </ul>
          </Card>
          <Card className='p-6'>
            <h3 className='font-semibold'>Usually do not validate again</h3>
            <ul className='mt-4 list-disc space-y-2 pl-5 text-sm leading-relaxed'>
              <li>A value already accepted at a boundary</li>
              <li>Ordinary internal application state</li>
              <li>Every field on every later use</li>
              <li>
                A generated-client result the application has chosen to treat as
                its trust boundary
              </li>
            </ul>
          </Card>
        </div>
        <Paragraph>
          A generated TypeScript client does not check the response at runtime.
          Its types are erased at build time. If the application already treats
          that client as the trust boundary for a call, later code uses the
          resulting fields directly.
        </Paragraph>
        <Paragraph>
          Check a field when that field is still uncertain, such as a nested
          payload from another service. Fall back for that field and leave the
          surrounding values on the type the application already uses.
        </Paragraph>
        <CodeBlock code={nestedField} language='ts' />
        <Paragraph>
          <code>companyName</code> stays a trusted field. <code>plans</code> is
          the uncertain boundary, so a mismatch becomes an empty list. When a
          selected payload should stay aligned with a generated object type, use{' '}
          <TextLink href={GUIDE_PATHS.heyApiTypedStruct}>
            <code>typedStruct</code>
          </TextLink>
          .
        </Paragraph>
      </GuideSection>

      <GuideSection
        id='payloads'
        title='04 / Server and decoded payloads'
        className='scroll-mt-20'
      >
        <Paragraph>
          A Route Handler and a decoded payload are the same boundary from the
          other side of the application. Start from the JSON value your code
          actually received.
        </Paragraph>
        <FlowPanel
          label='Request or decoded JSON'
          steps={[
            'request or decoded JSON',
            'unknown',
            'guard',
            'application value'
          ]}
        />
        <Heading variant='h3' className='text-xl'>
          Request body
        </Heading>
        <Paragraph>
          Invalid JSON fails at <code>request.json()</code> before the guard
          runs. After <code>parsed.valid</code>, <code>message</code> is the
          trusted command.
        </Paragraph>
        <CodeBlock code={routeHandler} language='ts' />
        <Heading variant='h3' className='text-xl'>
          Decoded JSON
        </Heading>
        <Paragraph>
          <code>payloadJson</code> is JSON text after any token-specific
          decoding has already happened. <code>safeJsonParse</code> decodes that
          text and checks the claims. Reading <code>sub</code> and{' '}
          <code>exp</code> does not verify a signature.
        </Paragraph>
        <CodeBlock code={decodedClaims} language='ts' />
      </GuideSection>

      <GuideSection
        id='decision'
        title='Do I need a guard here?'
        className='scroll-mt-20'
      >
        <div className='grid gap-4 sm:grid-cols-2'>
          <Card className='border-primary/60 bg-primary/5 p-6'>
            <h3 className='font-semibold'>Probably yes</h3>
            <ul className='mt-4 list-disc space-y-2 pl-5 text-sm leading-relaxed'>
              {probablyYes.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </Card>
          <Card className='p-6'>
            <h3 className='font-semibold'>Usually no</h3>
            <ul className='mt-4 list-disc space-y-2 pl-5 text-sm leading-relaxed'>
              {usuallyNo.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </Card>
        </div>
        <Paragraph>
          Validate when trust changes. Do not validate the same trusted value
          over and over. Narrow a property of a value you already trust with the{' '}
          <TextLink href={GUIDE_PATHS.propertyRefinement}>
            property refinement guide
          </TextLink>
          .
        </Paragraph>
      </GuideSection>
      <GuidePager currentHref={GUIDE_PATHS.trustBoundaries} />
    </GuideArticle>
  );
}
