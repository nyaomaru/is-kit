---
name: learn
description: Extract reusable patterns from non-trivial work in the is-kit repository and store them as project knowledge. Use after meaningful API design, type-system work, debugging, or compatibility discoveries.
---

# /learn - Capture Reusable is-kit Patterns

Analyze the current session and capture reusable knowledge for this TypeScript type-guard library.

## Auto-Activation Criteria

Consider auto-activating this skill when:

1. A non-trivial bug was fixed in runtime guard behavior or type inference.
2. A public API design decision was made and validated with tests.
3. A tricky TypeScript modeling pattern was discovered.
4. A runtime/type parity issue was diagnosed and resolved.
5. The session produced reusable guidance about tests, docs, or release safety for this library.

Do not activate for:

- trivial typo fixes
- one-line doc wording changes
- obvious refactors with no reusable lesson
- patterns already documented in `.codex/skills/learn/learned/`

## Manual Trigger

Run `/learn` after finishing a meaningful implementation, refactor, or debugging session in `is-kit`.

## What To Extract

### 1. Public API Design Patterns

- What API was added or changed?
- Why was that shape chosen over alternatives?
- What backward-compatibility constraint mattered?
- How should similar future APIs be designed?

Project-relevant examples:

- Distinguishing key-level optionality from value-level `undefined`.
- Choosing a specialized combinator vs. a more generic abstraction.
- Preserving existing semantics in a minor release while introducing a new helper.

### 2. Type Modeling Patterns

- How were inference, narrowing, or overloads preserved?
- What TypeScript limitation mattered?
- What exact type shape or helper solved it?

Project-relevant examples:

- Modeling `struct` schemas with required vs. optional keys.
- Normalizing intersection-heavy inferred types for `tsd`.
- Preserving literal narrowing without assertion casts.

### 3. Runtime Validation Patterns

- What runtime behavior needed to match the type-level contract?
- What edge cases mattered?
- What implementation detail should future changes preserve?

Project-relevant examples:

- Own-key checks vs. inherited property checks in `struct`.
- Exact-mode semantics when optional keys are present or absent.
- Composing schema markers with existing value guards.

### 4. Verification Patterns

- What test mix caught the issue?
- What commands should be run after similar changes?
- What docs needed updating to keep the repo consistent?

Project-relevant examples:

- Adding both Jest and `tsd` coverage for public API changes.
- Running `pnpm build`, `pnpm lint`, `pnpm test`, and `pnpm test:types`.
- Updating README and docs site examples when semantics change.

## Output Format

Create one file per pattern at:

`.codex/skills/learn/learned/[pattern-name].md`

Template:

````markdown
# [Descriptive Pattern Name]

**Captured:** YYYY-MM-DD
**Context:** [When this pattern applies]
**Tags:** typescript, type-guards, combinators, struct, tsd, api-design, runtime-validation, etc.

## Problem

[Specific recurring problem this pattern solves]

## Solution

[Reusable approach, key decisions, constraints, and tradeoffs]

## Example

```ts
// Minimal real example from this codebase
```

## When To Use

[Trigger conditions for applying this pattern]

## Related Files

- `src/core/combinators/struct.ts`
- `src/types/schema.ts`
- `tests/core/combinators/struct.test.ts`
- `tests-d/core/combinators/struct.test-d.ts`
````

## Process

1. Review the session for candidate learnings.
2. Select the highest-value reusable pattern(s).
3. Draft the pattern file.
4. Ask for user confirmation before saving.
5. Save to `.codex/skills/learn/learned/`.
6. Update `.codex/skills/learn/LEARNED_INDEX.md` with a one-line entry.

Index format:

`- **[pattern-name](learned/pattern-name.md)** - One-line summary.`

## Common Pattern Categories For This Repository

- Guard/combinator API design
- Runtime/type parity in public APIs
- `struct` schema semantics and exact-mode behavior
- TypeScript inference and overload design
- `tsd`-driven regression prevention
- Object-shape validation edge cases
- Documentation alignment after API changes

## Notes

- Capture only reusable, non-trivial lessons.
- Prefer patterns that explain both runtime behavior and type inference.
- Include the commands and tests that validated the pattern when relevant.
- Keep entries concrete, searchable, and library-focused.
