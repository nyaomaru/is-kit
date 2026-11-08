import Image from 'next/image';

import { CodeBlock } from '@/components/code/code-block';
import {
  GuideArticle,
  GuideHeader,
  GuideSection
} from '@/components/guides/guide-layout';
import { GuidePager } from '@/components/guides/pager';
import { GuideTable } from '@/components/guides/guide-table';
import { DocsCardLink } from '@/components/navigation/docs-card-link';
import { Card } from '@/components/ui/card';
import { Paragraph } from '@/components/ui/paragraph';
import { TextLink } from '@/components/ui/text-link';
import { GUIDE_PATHS } from '@/constants/guides';
import { createGuideMetadata } from '@/lib/guide-metadata';

export const metadata = createGuideMetadata(GUIDE_PATHS.designPrinciples);

const principles = [
  {
    id: 'trust',
    title: 'Trustworthy',
    description: 'Runtime and types agree.'
  },
  {
    id: 'compose',
    title: 'Composable',
    description: 'Build from small pieces.'
  },
  {
    id: 'narrowing',
    title: 'Natural narrowing',
    description: 'Work with TypeScript.'
  },
  {
    id: 'core',
    title: 'Small core',
    description: 'Every API earns its place.'
  },
  {
    id: 'runtime',
    title: 'Explicit runtime',
    description: 'Make behavior clear.'
  }
] as const;

const decisionSteps = [
  {
    title: 'Start with the use case',
    question: 'Does it make reusable guards easier to build, compose, or use?'
  },
  {
    title: 'Try composition',
    question: 'Can existing APIs already express the idea clearly?'
  },
  {
    title: 'Check the contract',
    question:
      'Do runtime behavior and narrowing agree, including at edge cases?'
  },
  {
    title: 'Consider the fit',
    question:
      'Does it work naturally with TypeScript, and justify its public surface?'
  }
] as const;

const composedGuard = `import { arrayOf, isString, nullable } from 'is-kit';

const isNullableString = nullable(isString);
const isList = arrayOf(isNullableString);

isList(['hello', null]); // true
isList(['hello', 42]);   // false`;

export default function DesignPrinciplesGuidePage() {
  return (
    <GuideArticle>
      <GuideHeader
        breadcrumbLabel='Design principles'
        media={
          <div className='my-4 flex flex-col gap-8 rounded-xl border border-primary/40 bg-primary/5 px-6 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-10 sm:py-12'>
            <div>
              <p className='text-xs font-semibold tracking-[0.18em] uppercase text-primary'>
                The idea
              </p>
              <p className='mt-4 text-3xl font-semibold leading-tight tracking-tight sm:text-5xl'>
                Build small guards.
                <br />
                Compose them.
              </p>
              <p className='mt-5 max-w-xl text-base leading-relaxed text-muted-foreground'>
                Reusable runtime checks, trustworthy types, and ordinary
                TypeScript control flow.
              </p>
            </div>
            <Image
              src='/iskit_logo1.svg'
              alt=''
              width={488}
              height={420}
              className='w-24 shrink-0 self-end sm:w-32 sm:self-center lg:w-40'
            />
          </div>
        }
        title='Design principles and non-goals'
        description='A practical reference for deciding what belongs in is-kit, and why.'
      />

      <GuideSection title='The principles at a glance'>
        <ul className='grid gap-3 sm:grid-cols-2'>
          {principles.map((principle, index) => (
            <li key={principle.id}>
              <a
                href={`#${principle.id}`}
                className='group block h-full rounded-lg border bg-card p-5 transition-colors hover:border-primary focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring'
              >
                <span className='link-underline inline-block font-semibold tabular-nums'>
                  0{index + 1}: {principle.title}
                </span>
                <span className='mt-3 block text-sm text-muted-foreground'>
                  {principle.description}
                </span>
              </a>
            </li>
          ))}
        </ul>
      </GuideSection>

      <GuideSection
        id='trust'
        title='01 / Make guards trustworthy'
        className='scroll-mt-20'
      >
        <Paragraph>
          A guard connects a runtime check to TypeScript narrowing. When it
          returns true, the narrowed type must accurately describe the value.
        </Paragraph>
        <div className='rounded-xl border border-primary/40 bg-primary/5 p-6 sm:p-8'>
          <p className='text-xs font-semibold tracking-[0.18em] uppercase text-primary'>
            The guard contract
          </p>
          <div className='mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6'>
            <div className='min-w-0'>
              <p className='text-sm text-muted-foreground'>At runtime</p>
              <p className='mt-2 font-mono text-lg font-semibold sm:text-xl'>
                guard(value) === true
              </p>
            </div>
            <span
              aria-hidden='true'
              className='text-2xl text-primary sm:mx-12 sm:text-3xl'
            >
              <span className='inline-block rotate-90 sm:rotate-0'>→</span>
            </span>
            <div className='min-w-0 flex-1'>
              <p className='text-sm text-muted-foreground'>
                Then you can trust
              </p>
              <p className='mt-2 text-lg font-semibold sm:text-xl'>
                The value fits its narrowed type.
              </p>
            </div>
          </div>
        </div>
        <Paragraph>
          That promise must hold at edge cases as well as on ordinary inputs.
          Prefer soundness over surprising or unsafe acceptance, and test both
          runtime and type behavior.
        </Paragraph>
      </GuideSection>

      <GuideSection
        id='compose'
        title='02 / Prefer small, composable guards'
        className='scroll-mt-20'
      >
        <Paragraph>
          Small predicates can be understood, tested, reused, and combined
          independently. Each piece below has one job: check a string, allow
          null, or check every array element.
        </Paragraph>
        <CodeBlock code={composedGuard} language='ts' />
        <Paragraph>
          Prefer existing primitives when composition expresses the use case
          clearly. A larger abstraction should solve a real problem that
          composition alone does not address well.
        </Paragraph>
      </GuideSection>

      <GuideSection
        id='narrowing'
        className='scroll-mt-20'
        title='03 / Preserve natural TypeScript narrowing'
      >
        <Paragraph>
          Guards should work with ordinary control flow and APIs such as{' '}
          <code>filter</code> and <code>find</code>. Preserve useful information
          from existing types: <code>refineKey</code> narrows a property while
          retaining its parent type. See the{' '}
          <TextLink href={GUIDE_PATHS.propertyRefinement}>
            property refinement guide
          </TextLink>{' '}
          for the details.
        </Paragraph>
      </GuideSection>

      <GuideSection
        id='core'
        className='scroll-mt-20'
        title='04 / Keep the core small and dependency-free'
      >
        <Paragraph>
          Every public API adds concepts to learn and a contract to maintain.
          New surface area should earn its place. Better documentation,
          composition patterns, tests, performance, or edge-case handling may
          solve a problem without another abstraction.
        </Paragraph>
      </GuideSection>

      <GuideSection
        id='runtime'
        title='05 / Keep runtime behavior explicit'
        className='scroll-mt-20'
      >
        <Paragraph>
          A guard should be understandable as a predicate on the value it
          receives. Avoid hidden coercion or transformation. When a helper
          performs a separate operation, such as decoding JSON before checking
          it, make that behavior explicit in its contract.
        </Paragraph>
      </GuideSection>

      <GuideSection title='Where is-kit draws the line'>
        <div className='grid gap-4 sm:grid-cols-2'>
          <Card className='border-primary/60 bg-primary/5 p-6'>
            <h3 className='font-semibold'>What we focus on</h3>
            <ul className='mt-4 list-disc space-y-2 pl-5 text-sm leading-relaxed'>
              <li>Reusable type guards</li>
              <li>Composition of small checks</li>
              <li>Natural TypeScript narrowing</li>
              <li>Predictable runtime predicates</li>
            </ul>
          </Card>
          <Card className='p-6'>
            <h3 className='font-semibold'>Non-goals</h3>
            <ul className='mt-4 list-disc space-y-2 pl-5 text-sm leading-relaxed'>
              <li>Rich structured validation error trees</li>
              <li>Transformation or coercion pipelines</li>
              <li>Schema generation</li>
              <li>Becoming a full schema-validation framework</li>
            </ul>
          </Card>
        </div>
        <Paragraph>
          Zod, Valibot, and ArkType address broader schema-oriented needs. They
          can coexist with is-kit where those needs arise.
        </Paragraph>
      </GuideSection>

      <GuideSection title='Evaluating a change'>
        <Paragraph>
          Use this path for features, fixes, and public API proposals. The
          questions guide a discussion; they are not an automatic approval.
        </Paragraph>
        <GuideTable
          columns={['Step', 'Question']}
          rows={decisionSteps.map((step, index) => ({
            key: step.title,
            cells: [`${index + 1}. ${step.title}`, step.question]
          }))}
        />
        <div className='rounded-lg border border-dashed border-primary/50 p-5'>
          <p className='font-semibold'>Consider the boundary</p>
          <p className='mt-2 text-sm leading-relaxed text-muted-foreground'>
            Does the idea fit the core, belong in an optional layer, or move the
            project toward a different category of library? Rich errors,
            transformations, and schema generation are generally outside the
            core.
          </p>
        </div>
      </GuideSection>

      <section aria-labelledby='apply-principles' className='border-t pt-8'>
        <h2
          id='apply-principles'
          className='text-2xl font-semibold tracking-tight'
        >
          Put the principles to work
        </h2>
        <p className='mt-3 mb-5 leading-relaxed text-muted-foreground'>
          Build small guards. Compose them. Then use them where they help.
        </p>
        <DocsCardLink
          href={GUIDE_PATHS.bestPractices}
          title='Best Practices for Using is-kit in Real Projects'
          description='Find practical guidance on trust boundaries, guard organization, and refinement.'
        />
      </section>
      <GuidePager currentHref={GUIDE_PATHS.designPrinciples} />
    </GuideArticle>
  );
}
