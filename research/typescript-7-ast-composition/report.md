# TypeScript 7 AST Composition Research Report

Status: Research complete; final ownership and positioning decision recorded

Last updated: 2026-09-03

Maintenance status: Frozen evidence. Do not chase rolling TypeScript nightlies.
Re-run and reassess this conclusion only after TypeScript publishes a stable
AST programmatic API that replaces `typescript/unstable/ast`.

The reproducible fixture matrix and runner are documented in this directory's
[`README.md`](./README.md).

## Executive summary

This research decides whether TypeScript 7 changes the TypeScript Compiler API
story for is-kit. It must distinguish a TypeScript-owned API or type-model gap
from a generic predicate-composition problem. The desired outcome is not a new
is-kit API. It is a defensible decision about what is-kit should keep, change,
add, avoid, or report upstream.

The investigation starts from one important correction: Flint PR #1300 is not
a migration to the AST types currently shipped by TypeScript 7. It introduces
Flint's own generated discriminated-union AST types on top of the TypeScript
runtime. It is therefore a useful control case for what direct `kind` narrowing
could look like, but it is not evidence that TypeScript 7 already provides that
model.

The initial inspection also shows that TypeScript 7.0.2 and the pinned 7.1
nightly export working AST and `isX` entry points under
`typescript/unstable/ast`, while broad types such as `Expression`, `Statement`,
and `TypeNode` remain aliases of base interfaces rather than discriminated
unions. The research must test the proposed direct-`kind` examples instead of
assuming that they narrow today.

The study answers four questions:

1. Which traditional `ts.isX` checks become unnecessary with TypeScript 7?
2. Do gaps remain for property, optional-property, index, and nested narrowing?
3. Do is-kit v1.14's `refineKey`, `refineDefinedKey`, and `refineIndex` fill a
   demonstrated gap?
4. Is each remaining gap owned by TypeScript, by a generic composition library,
   or by neither because native TypeScript is already sufficient?

The research is complete only when this sentence can be filled with evidence:

> TypeScript 7 makes **\_\_\_\_** unnecessary, but reusable **\_\_\_\_** still benefits
> from is-kit because **\_\_\_\_**.

If the evidence cannot fill that sentence, the TypeScript Compiler API should
not remain a primary positioning for the v1.14 property-refinement APIs.

## Verified starting point

These are baseline observations, not the final evaluation.

| Area             | Verified baseline on 2026-09-02                                                                                                                                            | Research consequence                                                            |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| Stable release   | npm `latest` resolves to TypeScript 7.0.2                                                                                                                                  | Test 7.0.2 exactly; do not describe only a future API                           |
| Nightly release  | npm `next` resolved to `7.1.0-dev.20260903.1` at final verification; the matrix pins `7.1.0-dev.20260902.1` and the reported `7.1.0-dev.20260827.1` snapshot also exists   | Pin one nightly for reproducibility and separately record rolling-nightly drift |
| Programmatic API | The TypeScript 7 package root does not provide a stable replacement for the TypeScript 6 programmatic API, but multiple usable surfaces ship under `typescript/unstable/*` | Do not equate “no stable API” with “no usable API”                              |
| AST entry points | Both 7.0.2 and the pinned nightly export `typescript/unstable/ast` and `typescript/unstable/ast/is`                                                                        | Compare `ast.isX` as a first-class TS7 option                                   |
| Broad AST types  | In both inspected versions, `Expression`, `Statement`, and `TypeNode` are base-type aliases, not generated unions of concrete nodes                                        | Direct `kind` narrowing must be proven for each declared input type             |
| `isX` predicates | Both inspected versions provide ordinary node predicates such as `isCallExpression`, `isIdentifier`, and `isStringLiteral`                                                 | Do not assume TS7 intends to remove `isX`                                       |
| Node handles     | The pinned nightly adds generated `isX.Handle` predicates that specialize sync and async `NodeHandle` values                                                               | Evaluate local AST nodes and remote handles separately                          |
| API feedback     | The TypeScript 7.1 API roadmap explicitly asks for remaining API work; recent reports test both 7.0.2 and a 7.1 nightly                                                    | Produce upstream-ready reproductions for TS-owned gaps                          |
| Flint #1300      | Flint replaced many broad `ts.Node` inputs with narrower custom `AST.*` unions, then used direct `kind` checks where those unions made them valid                          | Treat Flint as a discriminated-union control, not as current TS7 behavior       |

Before collecting results, record the exact package tarball integrity, git SHA,
OS, Node version, and compiler binary for every fixture. A moving `@next` result
without an exact snapshot is not acceptable evidence.

## Scope and non-goals

In scope:

- Type-level and runtime behavior of TypeScript 6 guards, TypeScript 7 AST
  guards, direct `kind` checks, and is-kit property refinements.
- Inline control-flow narrowing and extracted reusable predicates as separate
  use cases.
- Parent, child, grandchild, optional-child, indexed-child, and literal-value
  result types.
- Predicate use in branches, visitors, `filter`, and `find`.
- Local AST values and, where applicable, TypeScript 7 sync/async node handles.
- Real OSS evidence and a detailed Flint #1300 case study.
- Identification of upstream TypeScript feedback candidates.

Out of scope:

- Designing is-kit v2 or changing the generic property-refinement API.
- Adding a TypeScript-specific is-kit entry point.
- Claiming that shorter syntax is inherently better.
- Installing is-kit into sampled OSS projects or claiming that every repeated
  AST check warrants a dependency.
- Reimplementing the TypeScript API or AST declarations in is-kit.
- Treating a hypothetical future discriminated-union AST as shipped behavior.
- General performance benchmarking of the TypeScript 7 compiler. Type-checking
  regressions caused by an AST type model are relevant, but require an upstream
  benchmark rather than an is-kit microbenchmark.

## Research controls

The original A/B/C comparison conflates current TS7 with Flint's custom AST
model. Use four lanes instead:

| Lane              | Input and narrowing model                                                                                           | Purpose                                                                     |
| ----------------- | ------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| A — TS6           | `@typescript/typescript6` or TypeScript 6.0.x, broad `ts.Node`, `ts.isX`                                            | Legacy baseline and cross-version portability                               |
| B — TS7 shipped   | TypeScript 7.0.2 and the pinned 7.1 nightly, `typescript/unstable/ast`, both `ast.isX` and direct `kind` checks     | Measure what users can actually use now                                     |
| C — is-kit        | The same TS6 or TS7 predicates composed with `and`, `refineKey`, `refineDefinedKey`, `refineIndex`, and `equalsKey` | Measure generic reusable composition                                        |
| D — union control | Flint/tsl-style generated discriminated-union AST types with direct `kind` checks                                   | Separate the benefit of better entry types from the TS7 runtime/API rewrite |

Every code sample must name both its compiler version and its declared input
type. “TS7 narrows this” is too vague: `Node`, `Expression`, a concrete union,
and `NodeHandle<Node>` can produce different results under the same compiler.

## Hypotheses and falsification

| ID  | Hypothesis                                                                                     | Evidence that falsifies it                                                                                   |
| --- | ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| H1  | TS7 removes many local `isX` calls when the input is already a discriminated union             | Current TS7 input types remain broad in the relevant API path, or direct `kind` checks do not narrow         |
| H2  | Native inline checks are clearer than is-kit for one-off branches                              | Native code needs casts, unsafe access, or a hand-written predicate even inside the branch                   |
| H3  | Extracting a parent-plus-child check loses precision or requires a manual predicate annotation | An unannotated native function infers the complete parent-and-child predicate in stable and nightly fixtures |
| H4  | Optional and indexed child checks remain the strongest v1.14 Compiler API use cases            | Native extracted predicates preserve defined optional/indexed children just as safely and concisely          |
| H5  | Nested structure-plus-value checks demonstrate composition beyond `isX` replacement            | The literal and all child refinements are naturally inferred and retained by native reusable predicates      |
| H6  | Flint's reduction in `isX` usage came mainly from narrower visitor/rule input types            | Equivalent broad-input sites also became direct-`kind` checks without casts or custom narrowing              |
| H7  | Any remaining is-kit advantage is generic rather than TypeScript-specific                      | The failure reproduces only for TypeScript AST declarations or node-handle semantics                         |

Do not preserve a hypothesis by changing the input type to one unavailable to a
real consumer. Record whether an input type came from a public API callback,
was manually asserted, or was introduced by a project's custom AST model.

# 1. Research question

The central question is not whether is-kit can express an AST predicate. It is
whether it owns a useful abstraction after TypeScript 7's API and AST type
changes.

For every observed gap, apply this ownership test:

1. Can the behavior be reproduced with small generic object and array types,
   without importing TypeScript?
2. Is the obstacle caused by a TypeScript AST declaration, visitor signature,
   node-handle API, or mismatch between public AST types and runtime semantics?
3. Does native TypeScript already express the result safely with ordinary,
   readable code?
4. Is the code one-off, or is the same semantic predicate reused in multiple
   branches or collection operations?

Provisional ownership:

- AST-specific declaration or handle behavior: TypeScript feedback first.
- General property-predicate lifting that TypeScript handles as designed:
  potential is-kit territory.
- Native code already safe and direct: no library or upstream action.
- General TypeScript control-flow or inferred-predicate bug: TypeScript language
  feedback, even if is-kit can temporarily work around it.

# 2. TS6 narrowing model

Establish the legacy baseline with exact TypeScript 6 declarations and runtime
guards. Start with the familiar inline form:

```ts
if (ts.isCallExpression(node) && ts.isIdentifier(node.expression)) {
  node.expression.text;
}
```

For each canonical case, capture:

- the declared input type;
- the type after each short-circuiting condition;
- whether an unannotated extracted function infers a type predicate;
- the inferred predicate type, if any;
- the shortest sound explicit annotation when inference is insufficient;
- the resulting element type from `filter` and value type from `find`;
- whether parent and child refinements survive reuse.

Use TypeScript 6's actual `ts.isX` declarations. Do not wrap them in
unknown-input predicates or widen the input to make is-kit look preferable.

# 3. TS7 AST narrowing model

Test both TypeScript 7.0.2 and the pinned 7.1 nightly. Import AST values and
types from public package exports only:

```ts
import * as ast from 'typescript/unstable/ast';
import * as is from 'typescript/unstable/ast/is';
```

The proposed direct-`kind` form is a test subject, not an assumed capability:

```ts
if (
  node.kind === ast.SyntaxKind.CallExpression &&
  node.expression.kind === ast.SyntaxKind.Identifier
) {
  node.expression.text;
}
```

Run it for at least these declared inputs:

- `ast.Node`;
- `ast.Expression`;
- a concrete TypeScript-exported union, if one represents the real call site;
- `ast.CallExpression` for the child-only portion;
- a Flint-style custom union control;
- sync and async `NodeHandle<ast.Node>` where the nightly API supports it.

Record compiler diagnostics rather than repairing failed direct-`kind` cases
with assertions. A cast changes the question being measured.

Inspect the declarations in addition to compiling examples. Record whether a
parent type is a discriminated union, a broad base interface, or a brand, and
whether its child property is correspondingly precise. This explains why a
check succeeds or fails instead of merely recording the outcome.

For node handles, first establish the lifecycle:

1. Which properties exist locally on a handle?
2. Which node must be resolved before child access?
3. Does `ast.isX.Handle` narrow only the handle's generic parameter, or also
   enable child access?
4. Would applying `refineKey` to a handle describe real runtime behavior?

Do not present local-object composition as compatible with remote handles if
the handle must be resolved asynchronously first.

# 4. `isX` versus `kind`

The comparison has two independent TS7 mechanisms:

```text
TS6 ts.isX              TS7 ast.isX / ast.isX.Handle
       |                            |
       +------ predicate API -------+

TS7 discriminated input type + node.kind === SyntaxKind.X
       |
       +------ control-flow narrowing
```

For each case, compare:

- accepted input domain;
- impossible-check rejection;
- output type precision;
- support for ordinary nodes and node handles;
- runtime work and any remote resolution;
- source compatibility across TS6 and TS7;
- whether the mechanism composes with generic type guards;
- whether direct `kind` is available because of TS7 itself or because the
  caller already holds a narrower union.

The design-direction question should be answered from TypeScript sources and
maintainer statements, not inferred from Flint's code style. Evidence to
collect includes:

- continued presence and evolution of `ast.isX` in stable and nightly;
- `isX.Handle` work named in the TypeScript 7.1 API roadmap;
- any TypeScript PR or issue proposing discriminated-union public AST types;
- maintainer comments about API migration cost and checker performance;
- whether concrete-union types become public in a later pinned nightly.

The Bluesky discussion that triggered this study contains competing concerns:
better unions can reject impossible checks and improve traversal ergonomics,
while a previous TypeScript experiment reportedly increased type-checking cost
materially. Record both. Ergonomics alone cannot decide the upstream design.

# 5. Inline narrowing

Inline code is the native baseline. If it is clear and sound, recommend it.

```ts
if (
  node.kind === ast.SyntaxKind.CallExpression &&
  node.expression.kind === ast.SyntaxKind.Identifier
) {
  node.expression.text;
}
```

Evaluate inline code on:

| Dimension       | Question                                                           |
| --------------- | ------------------------------------------------------------------ |
| Local narrowing | Does the branch naturally narrow each accessed value?              |
| Safety          | Are missing, undefined, or out-of-range values checked before use? |
| Declared input  | Is the input type naturally available at the real call site?       |
| Diagnostics     | Does TypeScript reject impossible node-kind checks?                |
| Readability     | Does the condition directly communicate the one-off intent?        |
| Boilerplate     | Are casts, helper aliases, or repeated temporaries required?       |

Do not count an is-kit win for an inline check merely because a composed guard
can be named. Conversely, do not count a TS7 win from an inline branch as
evidence about extracted predicates.

# 6. Reusable predicates

Repeat each case as an extracted predicate used in all of these contexts:

```ts
const isFoo = (node: ast.Node) => {
  // native conditions
};

nodes.filter(isFoo);
nodes.find(isFoo);

if (isFoo(node)) {
  // inspect parent and child types
}

function visit(node: ast.Node): void {
  if (isFoo(node)) {
    // inspect parent, child, and grandchild types
  }
}
```

Test three native forms separately:

1. unannotated function with inferred return type;
2. explicit `node is ...` return type using only exported TS7 types;
3. a named type alias or intersection introduced solely for the predicate.

Then compare the is-kit form:

```ts
const isIdentifierCall = and(
  ast.isCallExpression,
  refineKey('expression', ast.isIdentifier)
);
```

Capture the full inferred type of `isFoo`, not only whether its body compiles.
The result must retain the checked child and grandchild types on the parent. A
predicate that narrows only to `CallExpression` is a loss for this research.

Measure boilerplate as semantic obligations, not raw character count:

- manual predicate annotation;
- manual parent/child intersection;
- exported helper type;
- assertion cast;
- duplicated runtime check;
- TypeScript-version-specific import or adapter.

# 7. Property refinement

Use the following five canonical cases. For every case, run the complete inline
and reusable matrix in Sections 5 and 6.

## Case 1: required child

```text
CallExpression
└── expression -> Identifier
```

Compare:

```ts
// TS6
ts.isCallExpression(node) && ts.isIdentifier(node.expression);

// TS7 predicate API
ast.isCallExpression(node) && ast.isIdentifier(node.expression);

// TS7 kind API under each declared input type
node.kind === ast.SyntaxKind.CallExpression &&
  node.expression.kind === ast.SyntaxKind.Identifier;

// is-kit
and(ast.isCallExpression, refineKey('expression', ast.isIdentifier));
```

Required result:

```ts
ast.CallExpression & { expression: ast.Identifier };
```

Determine whether this result is inferred, manually expressible, and preserved
through each reusable context.

## Case 2: optional child

```text
VariableDeclaration
└── initializer? -> CallExpression
```

Compare native checks with:

```ts
const hasCallInitializer = refineDefinedKey(
  'initializer',
  ast.isCallExpression
);
```

Required runtime observations:

| Input                        | Expected result | Child predicate invoked? |
| ---------------------------- | --------------- | ------------------------ |
| missing property             | `false`         | no                       |
| present with `undefined`     | `false`         | no                       |
| present with wrong node      | `false`         | yes                      |
| present with call expression | `true`          | yes                      |

Required success type:

```ts
ast.VariableDeclaration & { initializer: ast.CallExpression };
```

Test under both `exactOptionalPropertyTypes: false` and `true`. Record whether
native predicate extraction distinguishes “present” from merely
“not undefined,” and whether that distinction matters for actual AST nodes.

## Case 3: indexed child

```text
CallExpression
└── arguments[0] -> StringLiteral
```

Compare native length/value checks with:

```ts
const hasStringFirstArgument = refineKey(
  'arguments',
  refineIndex(0, ast.isStringLiteral)
);
```

Required runtime observations:

| Input                | Expected result | Element predicate invoked? |
| -------------------- | --------------- | -------------------------- |
| empty array          | `false`         | no                         |
| sparse index         | `false`         | no                         |
| explicit `undefined` | `false`         | no                         |
| wrong node           | `false`         | yes                        |
| string literal       | `true`          | yes                        |

Required success type:

```ts
ast.CallExpression & {
  arguments: ast.NodeArray<ast.Expression> & { readonly 0: ast.StringLiteral };
}
```

Run with `noUncheckedIndexedAccess: false` and `true`. Inspect the actual TS7
`NodeArray` declaration and parsed runtime values. A real parser may return
dense immutable node lists even though `refineIndex` deliberately has generic
array semantics; keep those facts separate.

## Case 4: nested property

```text
CallExpression
└── expression: PropertyAccessExpression
    └── expression: Identifier
```

The reusable is-kit candidate is:

```ts
const isIdentifierPropertyCall = and(
  ast.isCallExpression,
  refineKey(
    'expression',
    and(
      ast.isPropertyAccessExpression,
      refineKey('expression', ast.isIdentifier)
    )
  )
);
```

Required result:

```ts
ast.CallExpression & {
  expression: ast.PropertyAccessExpression & {
    expression: ast.Identifier;
  };
}
```

Record whether each native alternative preserves both nested levels after
extraction and through collection APIs. This case is a stronger composition
test than repeated top-level `isX` checks.

## Case 5: structure plus value

```ts
const isRequireCall = and(
  ast.isCallExpression,
  refineKey(
    'expression',
    and(ast.isIdentifier, refineKey('text', equals('require')))
  )
);
```

Required result:

```ts
ast.CallExpression & {
  expression: ast.Identifier & { text: 'require' };
}
```

Compare it with native `isX`, native `kind`, and direct text equality. Verify
whether the literal value survives:

- an inline branch;
- an unannotated extracted predicate;
- an explicitly annotated predicate;
- `filter`;
- `find`;
- a visitor branch.

This case evaluates composition with existing is-kit functionality, not merely
whether `refineKey` can replace one AST check.

# 8. Optional and index refinement

Optional and indexed properties have absence semantics beyond node-kind
narrowing. Evaluate them independently from the AST model.

For `refineDefinedKey`, answer:

- Does the property need to be an own property?
- Are a missing property and a present `undefined` intentionally equivalent?
- Is the child predicate skipped for both?
- Does success remove optionality on the parent result?
- Does the behavior match a native AST object received from TS7?

For `refineIndex`, answer:

- Is an out-of-bounds index distinguishable from a sparse slot?
- Is explicit `undefined` passed to the supplied refinement?
- Does success retain a defined literal index on the parent array?
- Does `NodeArray` guarantee density or non-emptiness in its public type?
- Are TS7 `NodeList` or handle-based traversal values ordinary arrays at the
  point where `refineIndex` would run?

Run a generic control fixture using plain objects and readonly arrays. If the
same reusable narrowing issue exists there, it is evidence for generic is-kit
ownership rather than a TypeScript AST defect.

# 9. Real OSS case studies

Study five to eight independent repositories. Start with:

- Flint;
- Angular CLI;
- RxJS;
- ts-jest;
- Vue Macros;
- React Doctor;
- FormatJS;
- Sentry.

If a repository has no relevant current pattern, record that negative result
and replace it only after preserving the reason. Do not select only examples
that favor is-kit.

For reproducibility, record:

- repository and exact commit SHA;
- file and stable line permalink;
- TypeScript version range and AST dependency;
- the node's declared type at the check site;
- whether the predicate is inline or reused;
- reuse count and contexts;
- current native code;
- a current-TS7 rewrite that actually type-checks;
- an is-kit rewrite;
- any runtime/API semantic mismatch.

Classify every pattern by primary category and optional secondary category:

| Category | Meaning                                                                     |
| -------- | --------------------------------------------------------------------------- |
| A        | Current TS7 alone clearly improves the original code                        |
| B        | Native TS7 is sufficient for the inline case                                |
| C        | Extraction or reuse makes is-kit materially clearer or more precise         |
| D        | Nested property composition makes is-kit materially clearer or more precise |
| E        | is-kit provides little or no benefit                                        |

“Materially” requires at least one of: retained result precision, removal of a
manual predicate intersection, safe optional/index handling, or elimination of
duplicated reusable logic. Fewer characters alone is not enough.

For each pattern, also report a recommendation:

- keep native inline;
- extract a native predicate;
- compose with is-kit if already a dependency;
- consider is-kit as a new dependency;
- report a TypeScript issue;
- no action.

The dependency recommendation must consider project policy, bundle/runtime
cost, contributor familiarity, and frequency of reuse. A one-off expression is
not evidence that a project should adopt is-kit.

# 10. Flint #1300 analysis

Flint #1300 is the primary case study because it directly addresses broad AST
types and `isX` ergonomics. The analysis must preserve its actual causal chain:

1. Flint issue #1204 identified that `ts.Node` is a base interface rather than
   a discriminated union and that broad `ts.isX` inputs allow impossible checks.
2. The project adopted generated custom AST types derived from Arnaud Barre's
   work, without replacing TypeScript's runtime nodes.
3. Rule and helper inputs were narrowed from types such as `ts.Node` or
   `ts.Expression` to project-specific types such as `AST.Statement` and
   `AST.LeftHandSideExpression`.
4. Many `ts.isX` calls could then become direct `kind` comparisons because the
   new declared inputs were discriminated unions.
5. Flint retained `ts.isX`/utility predicates where values remained broad
   `ts.Node` or where another utility still added value.

Extract at least these kinds of diff:

- a visitor or rule whose input changed from broad `ts.Node` to a custom union;
- a helper whose `ts.Expression` input became a narrower expression union;
- a direct `kind` replacement that relies on the new input type;
- a remaining `isX` call and the reason it could not or should not change;
- a nested child check, if present, to test whether custom unions remove the
  property-lifting problem or only top-level narrowing.

For each extracted pattern, replay it in four environments:

1. its pre-PR Flint type;
2. its post-PR custom AST type;
3. current TS7 `typescript/unstable/ast` types;
4. current TS7 predicates composed with is-kit.

This replay distinguishes three possible causes:

- the TypeScript 7 runtime/API architecture;
- better discriminated entry types;
- generic reusable predicate composition.

Do not state that dissatisfaction with `isX` composability caused the PR unless
a maintainer explicitly confirms that. The available issue text supports
concerns about broad accepted inputs and lack of discriminated unions; those are
related to, but not identical with, parent-child predicate composition.

# 11. is-kit v1.14 evaluation

Evaluate the released API as it exists. Do not design a new helper to rescue a
weak result.

Score each canonical and OSS case on this table:

| Dimension                 | Native inline          | Native reusable        | is-kit reusable        |
| ------------------------- | ---------------------- | ---------------------- | ---------------------- |
| Compiles without casts    | yes/no                 | yes/no                 | yes/no                 |
| Parent result retained    | exact/partial/no       | exact/partial/no       | exact/partial/no       |
| Child/grandchild retained | exact/partial/no       | exact/partial/no       | exact/partial/no       |
| Works in `filter`         | exact/partial/no       | exact/partial/no       | exact/partial/no       |
| Works in `find`           | exact/partial/no       | exact/partial/no       | exact/partial/no       |
| Works in visitor          | exact/partial/no       | exact/partial/no       | exact/partial/no       |
| Manual type expression    | none/simple/complex    | none/simple/complex    | none/simple/complex    |
| Runtime absence semantics | safe/irrelevant/unsafe | safe/irrelevant/unsafe | safe/irrelevant/unsafe |
| TS6/TS7 portability       | yes/no                 | yes/no                 | yes/no                 |

Decision levels:

### Strong Compiler API use case

Use this result only if all of the following hold:

- stable and pinned-nightly native reusable forms require a meaningful manual
  annotation, lose checked child information, or make safe optional/index
  reuse materially harder;
- is-kit preserves the desired result without assertions;
- the pattern occurs repeatedly in at least two independent OSS repositories;
- the remaining limitation is generic composition behavior, not an AST API
  defect that TypeScript should fix.

### Nice-to-have Compiler API use case

Use this result when native TypeScript expresses every result safely, but is-kit
is modestly clearer for a repeated predicate—especially in a project already
using is-kit. Documentation must say that one-off native checks are preferred.

### Generic API with Compiler API as one example

Use this positioning when current TS7 makes both inline and reusable AST checks
natural enough that Compiler API code no longer demonstrates a material gap.
Keep the generic property-refinement APIs if they remain sound and useful, but
do not lead with Compiler API adoption.

### Upstream-first result

Use this result when the strongest obstacle is a TS7 AST declaration,
`NodeHandle` behavior, traversal contract, or inconsistent predicate typing.
Prepare a TypeScript reproduction before considering more is-kit API.

# 12. TypeScript feedback candidates

Open or propose a TypeScript issue only when the finding is reproducible on the
latest pinned nightly and one of these conditions holds:

- a public AST input that should be a closed union cannot narrow by `kind`;
- a documented `ast.isX` or `ast.isX.Handle` result loses its specialization;
- `filter`, `find`, or a visitor loses a type predicate contrary to TypeScript's
  normal predicate behavior;
- local AST and node-handle predicates expose inconsistent result types;
- a traversal or `NodeList` declaration does not match runtime absence/index
  semantics;
- the required predicate output cannot be expressed with public TS7 types;
- a regression exists between 7.0.2 and the pinned 7.1 nightly.

Do not file an AST issue merely because TypeScript does not automatically lift
an arbitrary child predicate into a reusable parent intersection. First reduce
the behavior to generic types and determine whether it is a language-level bug,
a deliberate inference boundary, or ordinary library ergonomics.

Each feedback candidate must include:

1. a minimal repository with no is-kit dependency;
2. exact stable and nightly versions;
3. compiler options;
4. expected and actual inferred types;
5. runtime behavior if handles or traversal are involved;
6. why the issue is AST-specific or a TypeScript language inconsistency;
7. a link to the relevant TypeScript 7.1 API-roadmap item;
8. performance or migration tradeoffs when proposing broader union types.

The recent API reports against both 7.0.2 and
`7.1.0-dev.20260827.1` provide a useful standard: verify stable and nightly,
state the missing capability precisely, explain why local reimplementation is
insufficient, and suggest an API shape without making it a precondition for the
report.

# 13. API gap candidates

An is-kit gap is eligible for consideration only after the released v1.14 API
has been tested unchanged and the behavior reproduces on generic object types.

Candidate categories:

- a sound reusable property lift not expressible with `refineKey`;
- defined optional-property semantics not covered by `refineDefinedKey`;
- one concrete readonly-array index not covered by `refineIndex`;
- loss of literal value refinement when composing `equalsKey`;
- inability to retain a refinement through an existing logic combinator.

Reject or defer a candidate when:

- it exists only for `NodeHandle` or another TypeScript-specific abstraction;
- it requires is-kit to know `SyntaxKind`, AST node brands, snapshots, or remote
  resolution;
- it only saves a few characters in a one-off branch;
- native TypeScript already infers the full reusable predicate;
- it broadens a key or index domain beyond one runtime lookup;
- it changes missing/undefined semantics to match one AST implementation;
- evidence comes only from a hypothetical future union model.

No new public API should be proposed in the research report unless it includes
a generic motivating example, at least two real reuse sites, a soundness
argument, TypeScript-version compatibility evidence, and a comparison with the
existing v1.14 helpers.

## Final-report conclusion requirements

The final report must begin its conclusion with one evidence-backed sentence:

> TypeScript 7 makes **[specific mechanism or pattern]** unnecessary, but
> reusable **[specific predicate category]** still benefits from is-kit because
> **[observed type-system or composition behavior]**.

If the second clause is unsupported, write that explicitly and reduce the
Compiler API positioning. Do not fill the sentence with “nested narrowing” or
“composition” without naming the failing native form and retained is-kit result.

Then end the report with exactly these five decision buckets:

### Keep

- Which released APIs and documentation claims remain supported by evidence.

### Change

- Which positioning, examples, terminology, or implementation should change.

### Add

- Which tests, guides, or APIs have sufficient evidence to add.

### Do not add

- Which ideas were rejected, and the evidence or ownership reason for each.

### Feedback upstream

- Which minimal reproductions should be sent to TypeScript, with issue links or
  a clear “none” result.

## Execution plan

### Phase 1: freeze sources and fixtures

- Record the is-kit commit and pack the local package.
- Pin TypeScript 6.0.x, 7.0.2, and
  `7.1.0-dev.20260902.1` exactly.
- Save the npm integrity and relevant declaration excerpts.
- Create isolated fixture packages under
  `research/typescript-7-ast-composition/fixtures/` so one TypeScript package
  cannot shadow another.

Use a research directory first rather than adding the nightly directly to
`tests-d`. The repository's normal type tests intentionally use one compiler,
while this study compares incompatible package/API surfaces. Promote only
stable, valuable regressions into CI after the conclusion.

### Phase 2: implement the canonical matrix

- Add required, optional, indexed, nested, and literal-value cases.
- Add inline, inferred reusable, explicit reusable, and is-kit forms.
- Add branch, `filter`, and `find` consumers.
- Compile under strict settings, then toggle `exactOptionalPropertyTypes` and
  `noUncheckedIndexedAccess` in dedicated configs.
- Save diagnostics and emitted declaration snapshots where they reveal inferred
  predicate types.

### Phase 2.5: decision checkpoint

Stop after the canonical matrix and classify its evidence before starting any
broader research:

- If native reusable predicates infer and preserve the complete parent, child,
  grandchild, defined optional/indexed, and literal-value results in all five
  cases—and retain them through `if`, `filter`, and `find`—stop strong-use-case
  research. Classify the Compiler API positioning as generic or nice-to-have,
  then proceed directly to the report.
- If is-kit materially outperforms native reusable predicates in at least one
  case, identify the exact winning behavior and continue only to targeted OSS
  validation of that behavior.
- If the difference is caused by TS7 AST declarations or API semantics rather
  than generic property composition, prepare a minimal upstream reproduction
  before expanding is-kit research.
- If the result is ambiguous, add only the smallest experiment needed to resolve
  the ambiguity. Do not enter every later phase by default.

Record the checkpoint outcome and explicitly list which later phases are being
entered or skipped. NodeHandle research is never required to decide the ordinary
AST result.

### Phase 3: validate a material difference in real OSS, if required

- Search only for the canonical behavior that passed the checkpoint.
- Start with the most relevant repositories rather than all candidates.
- Freeze each inspected revision and record positive and negative evidence.
- Expand toward five to eight repositories only if the smaller sample does not
  establish recurrence or absence.
- Include Flint #1300 only when narrower discriminated input types are relevant
  to the observed difference.

### Phase 4: verify relevant runtime semantics, if required

- Enter this phase only if the checkpoint result depends on optional or indexed
  absence semantics.
- Check only the relevant missing, sparse, undefined, wrong-node, and
  correct-node cases.
- Compare controlled generic fixtures with real TS7 AST values.
- Avoid NodeList or handle research unless ordinary node semantics leave the
  decision unresolved.

### Phase 5: investigate and reproduce an upstream issue, if required

- Enter this phase only for an AST-specific declaration, predicate, traversal,
  or language-inference finding.
- Compare stable and pinned-nightly declarations around that exact finding.
- Review only the TypeScript history and performance concerns relevant to the
  proposed upstream change.
- Prepare a minimal no-is-kit reproduction before proposing more is-kit API.

### Phase 6: investigate NodeHandle separately, if still valuable

- Do not enter this phase until the ordinary AST positioning is decided.
- Treat NodeHandle narrowing and resolution as a separate TS7 API-semantics
  question, not evidence for the generic `refineKey` value proposition.
- Skip this phase when its result cannot change a product or upstream decision.

### Phase 7: apply the final ownership and positioning decision

- Reduce each remaining gap to a generic control.
- Separate AST declaration issues, language inference issues, and library
  ergonomics.
- Evaluate v1.14 against the strong/nice-to-have/generic/upstream-first gates.
- Record skipped phases as intentional consequences of the checkpoint.

### Phase 8: write the research report

- Fill all result tables with exact versions and types.
- State limitations and unresolved nightly behavior.
- Complete the required sentence.
- End with Keep, Change, Add, Do not add, and Feedback upstream.

## Completion checklist

- [x] Stable and nightly versions are exact and reproducible.
- [x] TS6, shipped TS7, and is-kit lanes are separated.
- [x] `ast.isX` and direct `kind` are tested on ordinary AST nodes.
- [x] All five canonical cases cover inline and reusable forms.
- [x] Branch, `filter`, and `find` result types are captured.
- [x] The Phase 2.5 checkpoint outcome and skipped phases are recorded.
- [x] If OSS validation is entered, the inspected sample includes negative
      evidence and is no larger than needed for the decision.
- [x] If Flint is analyzed, its custom types remain distinct from TS7-shipped
      types.
- [x] If runtime semantics affect the decision, the relevant optional or index
      cases are verified.
- [x] If NodeHandle is analyzed, its conclusion is reported separately from
      ordinary AST composition.
- [x] Each claimed gap has a generic reduction and an ownership decision.
- [x] No assertion cast is counted as successful narrowing.
- [x] Any TypeScript feedback candidate reproduces on the pinned nightly.
- [x] v1.14 positioning passes a stated decision gate.
- [x] The required conclusion sentence is evidence-backed or explicitly cannot
      be completed.
- [x] The report ends with all five required decision buckets.

## Sources and provenance

Primary discussion and motivation:

- [Arnaud Barre: custom AST types and the Flint adoption](https://bsky.app/profile/arnaud-barre.bsky.social/post/3mt7igsr2xs2s)
- [Evangeline: Compiler API composition examples and research suggestion](https://bsky.app/profile/evadeva.bsky.social/post/3mt7laxo5hc2f)
- [Andrew Branch: TypeScript 7 API nightly demo thread](https://bsky.app/profile/andrewbran.ch/post/3mt3limebfc2h)
- [Andrew Branch: unstable API architecture and expected 7.1 changes](https://bsky.app/profile/andrewbran.ch/post/3mt3lipkxjk2h)
- [Andrew Branch: similarity to the TypeScript 6 API](https://bsky.app/profile/andrewbran.ch/post/3mt3liuhzvc2h)

TypeScript sources:

- [TypeScript 7.1 API feature roadmap](https://github.com/microsoft/TypeScript/issues/63875)
- [TypeScript issue #64069, verified on 7.0.2 and a 7.1 nightly](https://github.com/microsoft/TypeScript/issues/64069)
- [TypeScript package versions](https://npmx.dev/package/typescript/versions)
- [TypeScript 7.0.2 AST declarations](https://unpkg.com/typescript@7.0.2/dist/ast/ast.generated.d.ts)
- [TypeScript 7.0.2 generated `isX` declarations](https://unpkg.com/typescript@7.0.2/dist/ast/is.generated.d.ts)
- [Pinned TypeScript 7.1 nightly AST declarations](https://unpkg.com/typescript@7.1.0-dev.20260902.1/dist/ast/ast.generated.d.ts)
- [Pinned TypeScript 7.1 nightly generated `isX` declarations](https://unpkg.com/typescript@7.1.0-dev.20260902.1/dist/ast/is.generated.d.ts)

Flint and custom AST sources:

- [Flint issue #1204: better-typed AST proposal](https://github.com/flint-fyi/flint/issues/1204)
- [Flint PR #1300: better AST types](https://github.com/flint-fyi/flint/pull/1300)
- [Flint PR #1300 changes](https://github.com/flint-fyi/flint/pull/1300/changes)
- [Arnaud Barre's generated tsl AST types](https://github.com/ArnaudBarre/tsl/blob/main/src/ast.ts)

All quotations, API signatures, and declaration observations in the final
report must point to a stable permalink or an exact published package version.
Bluesky posts establish motivation and maintainer context; compiler output and
published declarations establish technical behavior.

# 14. Canonical matrix results

Phase 1 and Phase 2 were executed on 2026-09-03 with the checked-in runner and
fixtures under `research/typescript-7-ast-composition/`.

## Frozen environment

| Input                    | Exact value                                                                                       |
| ------------------------ | ------------------------------------------------------------------------------------------------- |
| is-kit commit            | `35f42724000ed6997027ab2a781e861864344c98`                                                        |
| Packed is-kit version    | `1.14.0`                                                                                          |
| Packed tarball SHA-1     | `70063bb65fc2c9bc174543e62b3929ebf7672d16`                                                        |
| Packed tarball integrity | `sha512-FRMXLskPY1S8ucG5OxJYKxw0jtxhQiKlIf94IZ3LcaQk27u7cz4UprzxVQT87dvxrkGXeUefldEyNfZdTQrCnQ==` |
| Node.js                  | `24.20.0`                                                                                         |
| OS                       | Linux x86-64, WSL2 kernel `6.6.87.2-microsoft-standard-WSL2`                                      |

The TypeScript packages were installed by exact version into isolated temporary
consumers:

| Lane        | Version                | npm integrity                                                                                     | Git SHA                                    |
| ----------- | ---------------------- | ------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| TS6         | `6.0.3`                | `sha512-y2TvuxSZPDyQakkFRPZHKFm+KKVqIisdg9/CZwm9ftvKXLP8NRWj38/ODjNbr43SsoXqNuAisEf1GdCxqWcdBw==` | `050880ce59e30b356b686bd3144efe24f875ebc8` |
| TS7 stable  | `7.0.2`                | `sha512-8FYau96o3NKOhbjKi/qNvG/W5jhzxkbdm5sj9AbZ/5T5sWqn3hJgLfGx27sRKZWTvyzCP8dLRBTf5tBTSRVUNA==` | `2bd066d87f5bafd315be9f40889d0a60b9e58e0b` |
| TS7 nightly | `7.1.0-dev.20260902.1` | `sha512-Q+H2lm/zA8dhOyxUNmIIAqdAB9OkMMuDKsUg8hsTKBpkFLEtlHj8KzWSxuAEiSSgopI4cpltGeTmp+It2LuASQ==` | `43a90f4c105bc9db7cb7aa299beddafbabe1d23e` |

At final verification, npm tags resolved `latest` to `7.0.2` and the rolling
`next` tag to `7.1.0-dev.20260903.1`. The matrix deliberately retains the
previous day's exact nightly so its declaration output remains reproducible.

The nightly declarations reference explicit resource-management symbols, so
the fixture declares `lib: ["ESNext", "DOM"]`. The target remains ES2022. This
changes only the available ambient declarations and is required to read the
nightly package's own public `.d.ts` files.

## Direct `kind` result

Neither TypeScript 7.0.2 nor the pinned 7.1 nightly narrows the shipped broad
AST types through direct `kind` comparisons:

- `ast.Node` does not expose `expression` after a
  `kind === SyntaxKind.CallExpression` check;
- an `ExpressionBase` child does not become `Identifier` after an Identifier
  kind check;
- optional, indexed, and nested children likewise remain `ExpressionBase`;
- an equivalent generated discriminated-union control narrows its child to the
  exact `UnionIdentifier` type.

This falsifies H1 for the AST types currently shipped by TypeScript 7 and
supports the narrower-input explanation in H6. Direct `kind` is effective when
the declared input is already a discriminated union; the TS7 runtime/API rewrite
does not provide that model for the tested `Node` and `Expression` paths.

## Reusable predicate matrix

The emitted declarations were equivalent across TS6, TS7 stable, and the
pinned nightly:

| Case                   | Native inline branch                                                     | Native inferred reusable                     | Native explicit reusable                          | is-kit reusable                              |
| ---------------------- | ------------------------------------------------------------------------ | -------------------------------------------- | ------------------------------------------------- | -------------------------------------------- |
| Required child         | child usable in branch; returned parent is `CallExpression` only         | `boolean`; `filter` and `find` retain `Node` | exact after writing `IdentifierCall`              | exact parent and child                       |
| Optional child         | child usable in branch; returned parent is `VariableDeclaration` only    | `boolean`; optional child is not retained    | exact after writing `VariableWithCallInitializer` | exact and defined child                      |
| Indexed child          | element usable in branch; returned parent is `CallExpression` only       | `boolean`; index is not retained             | exact after writing the indexed intersection      | exact defined index                          |
| Nested child           | both children usable in branch; returned parent is `CallExpression` only | `boolean`; neither child is retained         | exact after writing the nested intersection       | exact parent, child, and grandchild          |
| Structure plus literal | literal usable in branch; returned parent is `CallExpression` only       | `boolean`; literal is not retained           | exact after writing `RequireCall`                 | exact parent, child, and `'require'` literal |

For example, the native required-child function emitted this type:

```ts
(node: ast.Node) => boolean;
```

Its `filter` result was therefore `ast.Node[]`. The corresponding is-kit form
emitted a refinement equivalent to:

```ts
Refinement<ast.Node, ast.CallExpression & Record<'expression', ast.Identifier>>;
```

and preserved that intersection through `if`, `filter`, and `find`.

The literal fixture initially used `and(ast.isIdentifier,
equalsKey('text', 'require'))`. That generic whole-object predicate did not
expose its intersection to `and`. This was a fixture composition error rather
than an API gap. Expressing the operation as property refinement retains the
literal without an annotation:

```ts
and(ast.isIdentifier, refineKey('text', equals('require')));
```

## Generic ownership control

The same five outcomes reproduce without importing TypeScript. Plain object,
optional property, readonly array, nested discriminated union, and literal
fixtures all emit `boolean` for native extracted conditions and retain their
full intersections with is-kit. The behavior is therefore generic property-
predicate lifting, not a defect in TypeScript's AST declarations.

All fixtures compiled with these option combinations:

- `exactOptionalPropertyTypes: true`, `noUncheckedIndexedAccess: true`;
- relaxed optional properties only;
- unchecked indexed access only;
- both options disabled.

## Phase 2.5 checkpoint

The checkpoint enters only targeted Phase 3 OSS validation:

- is-kit materially outperforms unannotated native reusable predicates in all
  five canonical cases by retaining checked parent/child information;
- native explicit predicates remain fully sound and are the dependency-free
  baseline, but require handwritten intersection aliases or annotations;
- the result is unchanged between TS6, TS7 stable, and the pinned nightly;
- the generic controls assign ownership to is-kit ergonomics rather than an
  AST-specific TypeScript issue.

Phase 4 runtime work is skipped because the decision does not depend on
optional or indexed absence semantics; required and nested cases already
establish the reusable difference. Phase 5 upstream reproduction and Phase 6
NodeHandle research are also skipped because neither can change ownership of
the ordinary local-object result. Phase 3 should inspect only enough OSS cases
to confirm whether the exact reusable parent-child pattern recurs and whether
it justifies either an existing-dependency recommendation or merely a
nice-to-have positioning.

## Targeted OSS validation

The checkpoint called for recurrence evidence rather than another broad
survey. Five repositories were inspected at frozen revisions:

| Repository                                                                                                                                               | Frozen revision                            | Observed pattern                                                                                                                       | Classification | Recommendation                                                                                                         |
| -------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------- | -------------- | ---------------------------------------------------------------------------------------------------------------------- |
| [TypeStat](https://github.com/JoshuaKGoldberg/TypeStat/blob/696c1b1370a088e2b2771dbe60f363c0ca55dbda/src/mutators/builtIn/fixImportExtensions/index.ts)  | `696c1b1370a088e2b2771dbe60f363c0ca55dbda` | Reusable `isExtensionlessExportOrImport` manually declares an import/export intersection whose `moduleSpecifier` is `StringLiteral`.   | C              | Keep the native explicit predicate; one helper does not justify a new dependency.                                      |
| [Flint](https://github.com/flint-fyi/flint/blob/7bcf9840c7eb4fdff097a126428fe4439f1c74eb/packages/typescript-language/src/collectReferencedFilePaths.ts) | `7bcf9840c7eb4fdff097a126428fe4439f1c74eb` | After custom discriminated unions landed, broad-node helpers still manually declare optional, indexed, and nested child intersections. | C/D            | Keep Flint's local predicates; use it as evidence that top-level unions and property lifting solve different problems. |
| [i18n-check](https://github.com/lingualdev/i18n-check/blob/cc67a665975d5ffbfc7752a35fc3b8af7ea8c3e8/src/utils/nextIntlSrcParser.ts)                      | `cc67a665975d5ffbfc7752a35fc3b8af7ea8c3e8` | One visitor repeats call/identifier/property and argument checks across many branches.                                                 | C/D            | Shared guards are plausible, but two short local predicates remain more proportionate than adding is-kit.              |
| [dpdm](https://github.com/acrazing/dpdm/blob/52ac8b89b90615fc2398c9a95f53cafa33f558dc/src/parser.ts)                                                     | `52ac8b89b90615fc2398c9a95f53cafa33f558dc` | One visitor repeats import/export/call child checks and retains three `StringLiteral` assertions.                                      | C              | Remove casts with local predicates first; do not add a dependency for one visitor.                                     |
| [capnweb](https://github.com/cloudflare/capnweb/blob/3f34bfd0ca85d56f72711b5621c3cf660a77729b/packages/capnweb-validate/src/transform/run.ts)            | `3f34bfd0ca85d56f72711b5621c3cf660a77729b` | Named AST helpers return primitive values or booleans and do not need refined parent types.                                            | E              | Keep the native helpers unchanged.                                                                                     |

TypeStat and Flint establish recurrence of the exact manual parent-child
intersection measured by the canonical matrix. i18n-check and dpdm show that
the underlying checks recur more broadly, while also demonstrating why API fit
does not automatically justify a dependency. capnweb is deliberate negative
evidence: not every extracted AST helper benefits from a type predicate.

Flint PR [#1300](https://github.com/flint-fyi/flint/pull/1300) also resolves H6.
Its direct `kind` replacements coincide with inputs changing from broad
TypeScript types to Flint's generated `AST.*` unions. The PR's own guidance
retains `ts.isX` for broad `ts.Node` values, and its
`collectReferencedFilePaths` diff kept manually annotated child intersections.
This is a union-entry-type improvement, not evidence that TypeScript 7 ships an
equivalent discriminated AST or eliminates reusable property lifting.

# 15. Conclusion

TypeScript 7 makes **none of the tested `ast.isX` checks unnecessary for its
shipped broad `Node` and `Expression` inputs**, but reusable **parent-child,
optional-child, indexed-child, nested-child, and literal-value predicates**
still benefit from is-kit because **native extracted conditions emit `boolean`
and lose the checked intersections, while the v1.14 combinators preserve them
through branches, `filter`, and `find` without manual predicate annotations**.

This is a genuine generic composition advantage, but not a reason to present
is-kit as a required TypeScript Compiler API dependency. Native inline checks
remain the clearest default for one-off code, and explicit local predicates are
often the proportionate choice when a project does not already depend on
is-kit.

## Keep

- Keep `and`, `refineKey`, `refineDefinedKey`, and `refineIndex` generic and
  TypeScript-independent.
- Keep Compiler API examples for reusable parent-child, optional, indexed, and
  nested guards; all remain valid on the tested TS7 AST surface.
- Keep recommending native inline checks for one-off branches.

## Change

- Do not imply that TypeScript 7's shipped AST is a discriminated union or that
  direct `kind` checks replace `ast.isX` for broad inputs.
- Describe Flint as a custom generated-union control, not a TypeScript 7
  migration or proof of shipped TS7 narrowing.
- Position the Compiler API as a demanding example of generic property
  refinement rather than the primary reason to adopt is-kit.
- Use `refineKey('text', equals('require'))` for composable literal-property
  examples; `equalsKey` remains useful as a standalone generic object guard.

## Add

- Add the isolated TS6/TS7 research fixtures and runner as reproducible evidence
  outside the normal single-compiler type suite.
- Add a concise documentation note distinguishing shipped broad AST types from
  custom discriminated unions when TypeScript 7 guidance is published.
- Consider a stable package-consumer regression derived from the matrix after
  the `typescript/unstable/ast` entry point stabilizes; do not pin a nightly in
  ordinary CI now.

## Do not add

- Do not add a TypeScript-specific is-kit entry point, AST wrapper, or
  `SyntaxKind`-aware API.
- Do not add a deep-path DSL, a second literal-key helper, or a special
  `equalsKey`/`and` overload; the existing property and equality primitives
  express the complete literal result.
- Do not add NodeHandle support to solve an ordinary local-node composition
  problem.
- Do not propose is-kit dependencies to the inspected repositories solely to
  shorten their current checks.

## Feedback upstream

- None. The reusable-predicate behavior reproduces on generic object types and
  is not an AST-specific TypeScript defect.
- No new discriminated-AST issue is warranted from this study. Existing
  TypeScript discussions already cover that design and its checker-performance
  tradeoffs; the stable and nightly probes found no new regression between
  7.0.2 and `7.1.0-dev.20260902.1`.
