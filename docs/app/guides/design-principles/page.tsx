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

export const metadata = createGuideMetadata(GUIDE_PATHS.designPrinciples);

export default function DesignPrinciplesGuidePage() {
  return (
    <GuideArticle>
      <GuideHeader
        breadcrumbLabel='Design principles'
        title='Design principles and non-goals'
        description='Build small guards. Compose them. These principles guide changes to is-kit and help contributors evaluate new ideas.'
      />

      <GuideSection title='Make guards trustworthy'>
        <Paragraph>
          A guard connects a runtime check to TypeScript narrowing. When it
          returns true, the narrowed type must accurately describe the value.
          Runtime behavior and types need to agree at edge cases as well as on
          ordinary inputs. Prefer soundness over accepting more values in a
          surprising or unsafe way, and test both runtime and type behavior.
        </Paragraph>
      </GuideSection>

      <GuideSection title='Prefer small, composable guards'>
        <Paragraph>
          Small predicates can be understood, tested, reused, and combined
          independently. Prefer building on existing primitives when composition
          expresses the use case clearly. A larger abstraction should solve a
          real problem that composition alone does not address well.
        </Paragraph>
      </GuideSection>

      <GuideSection title='Preserve natural TypeScript narrowing'>
        <Paragraph>
          Guards should work with ordinary control flow and APIs such as{' '}
          <code>filter</code> and <code>find</code>. Preserve useful information
          from existing types: for example, <code>refineKey</code> narrows a
          property while retaining its parent type. See the{' '}
          <TextLink href={GUIDE_PATHS.propertyRefinement}>
            property refinement guide
          </TextLink>{' '}
          for the details.
        </Paragraph>
      </GuideSection>

      <GuideSection title='Keep the core small and dependency-free'>
        <Paragraph>
          Every public API adds concepts to learn and a contract to maintain.
          New surface area should earn its place. Better documentation,
          composition patterns, tests, performance, or edge-case handling may
          solve a problem without another abstraction.
        </Paragraph>
      </GuideSection>

      <GuideSection title='Keep runtime behavior explicit'>
        <Paragraph>
          A guard should be understandable as a predicate on the value it
          receives. Avoid hidden coercion or transformation. When a helper
          performs a separate operation, such as decoding JSON before checking
          it, make that behavior explicit in its contract.
        </Paragraph>
      </GuideSection>

      <GuideSection title='Non-goals'>
        <Paragraph>
          is-kit is not intended to become a full schema-validation framework.
          In particular, its goals do not include rich structured validation
          error trees, transformation or coercion pipelines, or schema
          generation. Libraries such as Zod, Valibot, and ArkType address
          broader schema-oriented needs; they can coexist with is-kit where
          those needs arise.
        </Paragraph>
      </GuideSection>

      <GuideSection title='Evaluating a change'>
        <Paragraph>
          Use these questions when considering a feature, bug fix, or public API
          proposal:
        </Paragraph>
        <GuideList>
          <li>
            Does it make reusable guards easier to build, compose, or use?
          </li>
          <li>
            Do runtime behavior and narrowing agree, including at edge cases?
          </li>
          <li>Does it work naturally with TypeScript control flow?</li>
          <li>
            Can existing APIs express the use case clearly through composition?
          </li>
          <li>
            Is the benefit worth the added public surface and maintenance?
          </li>
          <li>
            Does it fit the core, belong in an optional layer, or move the
            project toward a different category of library?
          </li>
        </GuideList>
        <Paragraph>
          For applying these ideas in an application, see{' '}
          <TextLink href={GUIDE_PATHS.bestPractices}>best practices</TextLink>.
        </Paragraph>
      </GuideSection>
      <GuidePager currentHref={GUIDE_PATHS.designPrinciples} />
    </GuideArticle>
  );
}
