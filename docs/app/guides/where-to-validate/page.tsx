import { CodeBlock } from '@/components/code/code-block';
import {
  GuideArticle,
  GuideCallout,
  GuideHeader,
  GuideSection
} from '@/components/guides/guide-layout';
import { GuidePager } from '@/components/guides/pager';
import { GuideTable } from '@/components/guides/guide-table';
import { Paragraph } from '@/components/ui/paragraph';
import { TextLink } from '@/components/ui/text-link';
import { GUIDE_PATHS } from '@/constants/guides';
import { createGuideMetadata } from '@/lib/guide-metadata';

export const metadata = createGuideMetadata(GUIDE_PATHS.trustBoundaries);

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

const routeHandler = `import { isString, safeJsonParse, struct } from 'is-kit';

const isCreateMessage = struct({
  title: isString,
  body: isString,
});

export async function POST(request: Request) {
  const parsed = safeJsonParse(await request.text(), isCreateMessage);

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

function readClaims(payloadText: string) {
  const parsed = safeJsonParse(payloadText, isSessionClaims);
  return parsed.valid ? parsed.value : undefined;
}`;

export default function WhereToValidateGuidePage() {
  return (
    <GuideArticle>
      <GuideHeader
        breadcrumbLabel='Where to validate'
        title='Where to Validate in a Real Application'
        description='Check a value where trust changes. After it is accepted, ordinary TypeScript handles it until the next boundary.'
      />

      <GuideSection title='Validate at the boundary'>
        <GuideCallout emphasized>
          external or uncertain runtime value → validate where trust changes →
          trusted application value → ordinary TypeScript
        </GuideCallout>
        <Paragraph>
          A stored draft, a query string, and a response body enter the
          application as runtime data. A TypeScript type describes what the rest
          of the code may do with a value after that data has been accepted. The
          guard belongs at the handoff.
        </Paragraph>
        <GuideTable
          columns={['Boundary', 'Uncertain value', 'When the check fails']}
          rows={[
            {
              key: 'storage',
              cells: [
                'Browser storage',
                'Persisted JSON text',
                'Use an empty or default value'
              ]
            },
            {
              key: 'search',
              cells: [
                'URL search parameter',
                'string | null',
                'Use a default, or leave it absent'
              ]
            },
            {
              key: 'response',
              cells: [
                'Required API response',
                'Decoded response body',
                'Reject the response'
              ]
            },
            {
              key: 'field',
              cells: [
                'One uncertain field',
                'A nested external value',
                'Fall back for that field'
              ]
            },
            {
              key: 'request',
              cells: [
                'Server request body',
                'Raw JSON from the client',
                'Respond with a client error'
              ]
            }
          ]}
        />
        <Paragraph>
          The checks themselves are the ones in{' '}
          <TextLink href={GUIDE_PATHS.validateUnknown}>
            validating unknown values
          </TextLink>
          . This page is about where to put them. The{' '}
          <TextLink href={GUIDE_PATHS.bestPractices}>best practices</TextLink>{' '}
          page covers how to place the guards in the codebase.
        </Paragraph>
      </GuideSection>

      <GuideSection title='Browser storage'>
        <Paragraph>
          <code>localStorage</code> and <code>sessionStorage</code> return a
          string or <code>null</code>. The string may be leftover from an older
          version of the app, edited outside the app, or not JSON at all. Parse
          it and accept only the shape the current code still understands.
          Missing and unreadable drafts are recoverable, so the reader returns
          an empty list.
        </Paragraph>
        <CodeBlock code={storedDrafts} language='ts' />
        <Paragraph>
          <code>readDrafts</code> returns the accepted list. Rendering and
          editing that list is ordinary TypeScript. Read the same key again
          after another write if the stored text can change.
        </Paragraph>
        <Paragraph>
          Keep the guard next to the reader, and limit it to the fields that the
          reader uses. A saved token that is only a string needs a string check,
          such as <code>isNonEmptyString</code> in the next section. An object
          guard would describe a shape the token does not have.
        </Paragraph>
      </GuideSection>

      <GuideSection title='URL and search parameters'>
        <Paragraph>
          <code>URLSearchParams#get</code> returns <code>string | null</code>.
          Some routers also coerce numeric-looking query values before your code
          sees them, which can change a token or an identifier. Read the raw
          query string when the exact text matters.
        </Paragraph>
        <CodeBlock code={searchQuery} language='ts' />
        <Paragraph>
          An unknown <code>view</code> becomes <code>&apos;list&apos;</code>. A
          missing token stays absent. <code>page</code> is parsed only after the
          text is a positive integer string, and <code>isSafeInteger</code>{' '}
          rejects a number that cannot be represented exactly. The returned
          object is the trusted query. The page that renders it can branch on{' '}
          <code>view</code> without reading the URL again.
        </Paragraph>
        <Paragraph>
          A required link with a missing token is a failed boundary: return the
          empty or invalid-link state from the reader. Casting{' '}
          <code>get(&apos;token&apos;)</code> with <code>as string</code> hides
          that absence from both the type and the runtime.
        </Paragraph>
      </GuideSection>

      <GuideSection title='API and SDK responses'>
        <Paragraph>
          <code>response.json()</code> is data from another process. Assign it
          to <code>unknown</code> and accept the fields this call uses. A
          transport failure and an unexpected body are different failures: the
          status comes from <code>response.ok</code>, and the shape comes from
          the guard.
        </Paragraph>
        <CodeBlock code={fetchItems} language='ts' />
        <Paragraph>
          <code>readItems</code> returns the accepted array. Callers filter and
          render it with ordinary TypeScript. They call <code>readItems</code>{' '}
          again when they need a new response, rather than running the same
          guard on the value they already received.
        </Paragraph>
        <Paragraph>
          A generated client or another trusted application function can be the
          boundary for fields whose runtime values match that type. Check a
          field again when its runtime value is still uncertain, such as a
          nested payload from another service. Leave the surrounding fields on
          the type you already trust.
        </Paragraph>
        <CodeBlock code={nestedField} language='ts' />
        <Paragraph>
          <code>companyName</code> stays on <code>SettingsResponse</code>. Only{' '}
          <code>plans</code> is treated as <code>unknown</code>, and a mismatch
          becomes an empty list so the rest of the screen can still render. When
          a generated type is the source of truth for a selected payload, keep
          the hand-written guard aligned with it using{' '}
          <TextLink href={GUIDE_PATHS.heyApiTypedStruct}>
            <code>typedStruct</code>
          </TextLink>
          . A guard on every SDK method repeats that generated type at runtime.
        </Paragraph>
      </GuideSection>

      <GuideSection title='A server request body'>
        <Paragraph>
          A Next.js Route Handler sees the same kind of boundary from the
          server. The body is untrusted text until a guard accepts it. This uses
          the existing parse helpers; it does not add a framework adapter.
        </Paragraph>
        <CodeBlock code={routeHandler} language='ts' />
        <Paragraph>
          After <code>parsed.valid</code>, <code>message</code> is the trusted
          command. Persistence and domain work from there use that value
          directly.
        </Paragraph>
      </GuideSection>

      <GuideSection title='Decoded JSON payloads'>
        <Paragraph>
          A decoded token payload, a <code>postMessage</code> event&apos;s{' '}
          <code>data</code>, and a value returned by a third-party SDK are the
          same kind of input when your code did not establish their shape.
          Decode or receive the value, then accept only the fields you use.
        </Paragraph>
        <CodeBlock code={decodedClaims} language='ts' />
        <Paragraph>
          Reading <code>sub</code> and <code>exp</code> does not verify a
          signature. Signature checks stay with the component that is
          responsible for them. The guard only answers whether the decoded JSON
          contains the claims this reader understands.
        </Paragraph>
      </GuideSection>

      <GuideSection title='After the value is trusted'>
        <Paragraph>
          Pass the accepted value into the rest of the application. Narrow a
          property of a value you already trust with a refinement, as in the{' '}
          <TextLink href={GUIDE_PATHS.propertyRefinement}>
            property refinement guide
          </TextLink>
          , instead of rebuilding a whole-object guard for it. Add another
          boundary check when the value is written out and read back, or when it
          arrives again from storage, a URL, a response, or another external
          source.
        </Paragraph>
      </GuideSection>
      <GuidePager currentHref={GUIDE_PATHS.trustBoundaries} />
    </GuideArticle>
  );
}
