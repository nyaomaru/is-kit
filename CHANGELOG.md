# Changelog

All notable changes to this project will be documented in this file.

This project adheres to [Keep a Changelog](https://keepachangelog.com/) and [SemVer](https://semver.org/).

---

## [v1.1.12] - 2026-01-31

### Fixed

- fix npm publish workflow by @nyaomaru in [#125](https://github.com/nyaomaru/is-kit/pull/125)

### Changed

- remove andAll assertion via predicate helper by @nyaomaru in [#126](https://github.com/nyaomaru/is-kit/pull/126)

### Docs

- 1.1.11 by [bot] by @github-actions in [#123](https://github.com/nyaomaru/is-kit/pull/123)

### Chore

- Update pnpm to v10.28.2 by [bot] by @renovate in [#124](https://github.com/nyaomaru/is-kit/pull/124)

**Full Changelog**: https://github.com/nyaomaru/is-kit/compare/v1.1.11...v1.1.12

[v1.1.12]: https://github.com/nyaomaru/is-kit/compare/v1.1.11...v1.1.12

## [v1.1.11] - 2026-01-24

### Changed

- remove redundant casts after object guards by @nyaomaru in [#120](https://github.com/nyaomaru/is-kit/pull/120)
- prettier format by @nyaomaru in [#121](https://github.com/nyaomaru/is-kit/pull/121)

### Docs

- 1.1.10 by [bot] by @github-actions in [#117](https://github.com/nyaomaru/is-kit/pull/117)

### Chore

- Update pnpm to v10.28.1 by [bot] by @renovate in [#118](https://github.com/nyaomaru/is-kit/pull/118)
- Update dependency prettier to v3.8.1 by [bot] by @renovate in [#119](https://github.com/nyaomaru/is-kit/pull/119)

**Full Changelog**: https://github.com/nyaomaru/is-kit/compare/v1.1.10...v1.1.11

[v1.1.11]: https://github.com/nyaomaru/is-kit/compare/v1.1.10...v1.1.11

## [v1.1.10] - 2026-01-17

### Fixed

- fix parallel setting by @nyaomaru in [#112](https://github.com/nyaomaru/is-kit/pull/112)
- fix web_search config by @nyaomaru in [#114](https://github.com/nyaomaru/is-kit/pull/114)
- eslint warnings by @nyaomaru in [#115](https://github.com/nyaomaru/is-kit/pull/115)

### Chore

- Update dependency prettier to v3.8.0 by [bot] by @renovate in [#113](https://github.com/nyaomaru/is-kit/pull/113)

### Docs

- 1.1.9 by [bot] by @github-actions in [#111](https://github.com/nyaomaru/is-kit/pull/111)

**Full Changelog**: https://github.com/nyaomaru/is-kit/compare/v1.1.9...v1.1.10

[v1.1.10]: https://github.com/nyaomaru/is-kit/compare/v1.1.9...v1.1.10

## [v1.1.9] - 2026-01-11

### Fixed

- fix eslint by @nyaomaru in [#107](https://github.com/nyaomaru/is-kit/pull/107)
- fix eslint tsx by @nyaomaru in [#108](https://github.com/nyaomaru/is-kit/pull/108)

### Docs

- 1.1.8 by [bot] by @github-actions in [#105](https://github.com/nyaomaru/is-kit/pull/105)

### Chore

- Update pnpm to v10.28.0 by [bot] by @renovate in [#106](https://github.com/nyaomaru/is-kit/pull/106)
- add lefthook by @nyaomaru in [#109](https://github.com/nyaomaru/is-kit/pull/109)

**Full Changelog**: https://github.com/nyaomaru/is-kit/compare/v1.1.8...v1.1.9

[v1.1.9]: https://github.com/nyaomaru/is-kit/compare/v1.1.8...v1.1.9

## [v1.1.8] - 2026-01-03

### Added

- add numeric primitive guards by @nyaomaru in [#102](https://github.com/nyaomaru/is-kit/pull/102)

### Docs

- 1.1.7 by [bot] by @github-actions in [#100](https://github.com/nyaomaru/is-kit/pull/100)

### Chore

- Update pnpm to v10.27.0 by [bot] by @renovate in [#101](https://github.com/nyaomaru/is-kit/pull/101)
- Update jdx/mise-action action to v3 by [bot] by @renovate in [#103](https://github.com/nyaomaru/is-kit/pull/103)

### What’s new 🚀

- Added numeric guards `isNaN`, `isInfiniteNumber`, and `isZero` for handling NaN, ±Infinity, and zero edge cases.
- Updated tests and documentation to cover the new helpers and examples.

```ts
import { isNaN, isInfiniteNumber, isZero } from 'is-kit';

isNaN(NaN); // true
isNaN(0); // false

isInfiniteNumber(Infinity); // true
isInfiniteNumber(1); // false

isZero(0); // true
isZero(-0); // true
isZero(1); // false
```

**Full Changelog**: https://github.com/nyaomaru/is-kit/compare/v1.1.7...v1.1.8

[v1.1.8]: https://github.com/nyaomaru/is-kit/compare/v1.1.7...v1.1.8

## [v1.1.7] - 2025-12-27

### Added

- add isInteger, isSafeInteger, isPositive, isNegative by @nyaomaru in [#98](https://github.com/nyaomaru/is-kit/pull/98)

### Docs

- 1.1.6 by [bot] by @github-actions in [#96](https://github.com/nyaomaru/is-kit/pull/96)

### Chore

- Update pnpm to v10.26.2 by [bot] by @renovate in [#97](https://github.com/nyaomaru/is-kit/pull/97)

### What’s New 🚀

- Add numeric guards in primitive: `isInteger`, `isSafeInteger`, `isPositive`, `isNegative`.
- Semantics:
  - `isInteger` uses Number.isInteger narrowing to `number` type.
  - `isSafeInteger` uses Number.isSafeInteger narrowing to `number` type..
  - `isPositive` accepts finite numbers strictly greater than 0 (excludes NaN/±Infinity; -0 is not positive).
  - `isNegative` accepts finite numbers strictly less than 0 (excludes NaN/±Infinity; -0 is not negative).

**Full Changelog**: https://github.com/nyaomaru/is-kit/compare/v1.1.6...v1.1.7

[v1.1.7]: https://github.com/nyaomaru/is-kit/compare/v1.1.6...v1.1.7

## [v1.1.6] - 2025-12-20

### Changed

- use toBooleanPredicates in oneOf to align with or by @nyaomaru in [#91](https://github.com/nyaomaru/is-kit/pull/91)

### Docs

- 1.1.5 by [bot] by @github-actions in [#82](https://github.com/nyaomaru/is-kit/pull/82)

### Test

- rename test files by @nyaomaru in [#86](https://github.com/nyaomaru/is-kit/pull/86)

### Chore

- Update dependency next to v14.2.35 by [bot] by @renovate in [#84](https://github.com/nyaomaru/is-kit/pull/84)
- Update dependency autoprefixer to v10.4.23 by [bot] by @renovate in [#83](https://github.com/nyaomaru/is-kit/pull/83)
- Update dependency tailwindcss to v3.4.19 by [bot] by @renovate in [#85](https://github.com/nyaomaru/is-kit/pull/85)
- Update eslint monorepo to v9.39.2 by [bot] by @renovate in [#87](https://github.com/nyaomaru/is-kit/pull/87)
- Update dependency lucide-react to ^0.562.0 by [bot] by @renovate in [#88](https://github.com/nyaomaru/is-kit/pull/88)
- Update dependency prettier to v3.7.4 by [bot] by @renovate in [#89](https://github.com/nyaomaru/is-kit/pull/89)
- Update pnpm to v10.26.1 by [bot] by @renovate in [#90](https://github.com/nyaomaru/is-kit/pull/90)
- Update actions/cache action to v5 by [bot] by @renovate in [#92](https://github.com/nyaomaru/is-kit/pull/92)
- Update actions/checkout action to v6 by [bot] by @renovate in [#93](https://github.com/nyaomaru/is-kit/pull/93)
- Update actions/setup-node action to v6 by [bot] by @renovate in [#94](https://github.com/nyaomaru/is-kit/pull/94)

**Full Changelog**: https://github.com/nyaomaru/is-kit/compare/v1.1.5...v1.1.6

[v1.1.6]: https://github.com/nyaomaru/is-kit/compare/v1.1.5...v1.1.6

## [v1.1.5] - 2025-12-13

### Fixed

- support tuple-array and varargs in oneOfValues by @nyaomaru in [#80](https://github.com/nyaomaru/is-kit/pull/80)

### Docs

- 1.1.4 by [bot] by @github-actions in [#77](https://github.com/nyaomaru/is-kit/pull/77)

### Chore

- Update dependency ts-jest to v29.4.6 by [bot] by @renovate in [#78](https://github.com/nyaomaru/is-kit/pull/78)
- Update dependency lucide-react to ^0.561.0 by [bot] by @renovate in [#79](https://github.com/nyaomaru/is-kit/pull/79)

**Full Changelog**: https://github.com/nyaomaru/is-kit/compare/v1.1.4...v1.1.5

[v1.1.5]: https://github.com/nyaomaru/is-kit/compare/v1.1.4...v1.1.5

## [v1.1.4] - 2025-12-07

### Changed

- file name by @nyaomaru in [#73](https://github.com/nyaomaru/is-kit/pull/73)
- simplify equalsBy generics and constraints by @nyaomaru in [#74](https://github.com/nyaomaru/is-kit/pull/74)
- remove unsafe assertion by @nyaomaru in [#75](https://github.com/nyaomaru/is-kit/pull/75)

### Docs

- 1.1.3 by [bot] by @github-actions in [#70](https://github.com/nyaomaru/is-kit/pull/70)

### Chore

- Update dependency typedoc to v0.28.15 by [bot] by @renovate in [#71](https://github.com/nyaomaru/is-kit/pull/71)
- Update dependency lucide-react to ^0.555.0 by [bot] by @renovate in [#72](https://github.com/nyaomaru/is-kit/pull/72)

**Full Changelog**: https://github.com/nyaomaru/is-kit/compare/v1.1.3...v1.1.4

[v1.1.4]: https://github.com/nyaomaru/is-kit/compare/v1.1.3...v1.1.4

## [v1.1.3] - 2025-11-29

### Added

- add isPrimitive guard preset by @nyaomaru in [#66](https://github.com/nyaomaru/is-kit/pull/66)

### Fixed

- remove release name by @nyaomaru in [#67](https://github.com/nyaomaru/is-kit/pull/67)

### Changed

- precompute schema keys and allowed set by @nyaomaru in [#68](https://github.com/nyaomaru/is-kit/pull/68)

### Chore

- v1.1.2 by [bot] by @github-actions in [#63](https://github.com/nyaomaru/is-kit/pull/63)
- Update dependency /react to v18.3.27 by @renovate[bot] by @types in [#64](https://github.com/nyaomaru/is-kit/pull/64)
- Update dependency lucide-react to ^0.554.0 - autoclosed by [bot] by @renovate in [#65](https://github.com/nyaomaru/is-kit/pull/65)
- Release: 1.1.3 by [bot] by @github-actions in [#69](https://github.com/nyaomaru/is-kit/pull/69)

### What's New 🚀

Add `isPrimitive` to check whether primitive type or not!

```ts
import { isPrimitive } from 'is-kit';

// Check any JavaScript primitive in one go
isPrimitive('x'); // true
isPrimitive(123); // true
isPrimitive(NaN); // true (use isNumber for finite only)
isPrimitive({}); // false`;
```

**Full Changelog**: https://github.com/nyaomaru/is-kit/compare/v1.1.2...v1.1.3

[v1.1.3]: https://github.com/nyaomaru/is-kit/compare/v1.1.2...v1.1.3

## [v1.1.2] - 2025-11-22

### Added

- isWeakMap and isWeakSet by @nyaomaru in [#61](https://github.com/nyaomaru/is-kit/pull/61)

### Fixed

- changelog workflow permission error by @nyaomaru in [#58](https://github.com/nyaomaru/is-kit/pull/58)

### Chore

- Release: 1.1.1 by [bot] by @github-actions in [#57](https://github.com/nyaomaru/is-kit/pull/57)
- Update dependency autoprefixer to v10.4.22 by [bot] by @renovate in [#59](https://github.com/nyaomaru/is-kit/pull/59)
- Update dependency tsup to v8.5.1 by [bot] by @renovate in [#60](https://github.com/nyaomaru/is-kit/pull/60)
- Release: 1.1.2 by [bot] by @github-actions in [#62](https://github.com/nyaomaru/is-kit/pull/62)

### What's New 🚀

Add `isWeakMap` and `isWeakSet`!

```ts
isWeakMap(new WeakMap()); // true
isWeakSet(new WeakSet()); // true
```

**Full Changelog**: https://github.com/nyaomaru/is-kit/compare/v1.1.1...v1.1.2

[v1.1.2]: https://github.com/nyaomaru/is-kit/compare/v1.1.1...v1.1.2

## [v1.1.1] - 2025-11-15

### Changed

- use define and add comment by @nyaomaru in [#55](https://github.com/nyaomaru/is-kit/pull/55)

### Chore

- Update dependency /react-label to v2.1.8 by @renovate[bot] by @radix-ui in [#53](https://github.com/nyaomaru/is-kit/pull/53)
- Update dependency lucide-react to ^0.553.0 by [bot] by @renovate in [#54](https://github.com/nyaomaru/is-kit/pull/54)
- Update pnpm to v10.22.0 by [bot] by @renovate in [#48](https://github.com/nyaomaru/is-kit/pull/48)
- Update eslint monorepo to v9.39.1 by [bot] by @renovate in [#47](https://github.com/nyaomaru/is-kit/pull/47)
- update README badge by @nyaomaru in [#56](https://github.com/nyaomaru/is-kit/pull/56)

**Full Changelog**: https://github.com/nyaomaru/is-kit/compare/v1.1.0...v1.1.1

[v1.1.1]: https://github.com/nyaomaru/is-kit/compare/v1.1.0...v1.1.1

## [v1.1.0] - 2025-11-04

### Added

- add narrowKeyTo for key literal narrowing by @nyaomaru in [#49](https://github.com/nyaomaru/is-kit/pull/49)
- narrow key description by @nyaomaru in [#50](https://github.com/nyaomaru/is-kit/pull/50)

### Fixed

- update changelog workflow by @nyaomaru in [#45](https://github.com/nyaomaru/is-kit/pull/45)
- release workflow by @nyaomaru in [#52](https://github.com/nyaomaru/is-kit/pull/52)

### Chore

- Release: 1.0.5 by [bot] by @github-actions in [#44](https://github.com/nyaomaru/is-kit/pull/44)
- changelog v1.0.5 by @nyaomaru in [#46](https://github.com/nyaomaru/is-kit/pull/46)
- Release: 1.1.0 by [bot] by @github-actions in [#51](https://github.com/nyaomaru/is-kit/pull/51)

### What's new 🚀

- Add `narrowKeyTo` for key literal narrowing ✨ in [#49](https://github.com/nyaomaru/is-kit/pull/49)
  - `equalsBy` preserves the base type and doesn’t narrow selected fields to literals, leading to confusion and
    boilerplate type predicates.
  - `narrowKeyTo` provides a small, composable helper aligned with is-kit’s ergonomics for property-based
    literal narrowing.

### Example

```ts
type User = { id: string; age: number; role: 'admin' | 'guest' | 'trial' };

const isUser = struct({
  id: isString,
  age: isNumber,
  role: oneOfValues('admin', 'guest', 'trial'),
});

// Build role-specific guards that also narrow the 'role' field to literals
const byRole = narrowKeyTo(isUser, 'role');
const isAdmin = byRole('admin'); // Readonly<User> & { role: 'admin' }
const isGuest = byRole('guest'); // Readonly<User> & { role: 'guest' }
const isTrial = byRole('trial'); // Readonly<User> & { role: 'trial' }

// Compose as usual
const isGuestOrTrial = or(isGuest, isTrial);

declare const input: unknown;
if (isGuestOrTrial(input)) {
  // input.role is narrowed to 'guest' | 'trial'
}
```

**Full Changelog**: https://github.com/nyaomaru/is-kit/compare/v1.0.5...v1.1.0

[v1.1.0]: https://github.com/nyaomaru/is-kit/compare/v1.0.5...v1.1.0

## [v1.0.5] - 2025-11-02

### Fixed

- remove anthropic api key setting (#42)

### Changed

- args type definition (#43)

### Chore

- Merge pull request #43 from nyaomaru/refactor/args-type (#43)
- Merge pull request #41 from nyaomaru/renovate/lucide-monorepo (#41)
- Update dependency lucide-react to ^0.552.0 (#41)
- Merge pull request #40 from nyaomaru/renovate/jest-monorepo (#40)
- Merge pull request #42 from nyaomaru/chore/update-changelog-workflow (#42)
- update CHANGELOG workflow (#42)
- Update dependency jest to v30.2.0 (#40)
- Merge pull request #39 from nyaomaru/chore/update-CHANGELOG (#39)
- update CHANGELOG (#39)

[Unreleased]: https://github.com/nyaomaru/is-kit/compare/v1.1.12...HEAD
[v1.0.5]: https://github.com/nyaomaru/is-kit/compare/v1.0.4...v1.0.5

## [1.0.4] - 2025-10-25

### Changed

- JSR version bump (#31)
- combinator: moved key check to front of guard declaration (#36)

### Docs

- Removed unnecessary useEffect (#32)
- Removed unused next-themes (#37)

### Chore

- Updated logo image (#35)
- Updated dependency typescript to v5.9.3 (#34)
- Updated dependency typedoc to v0.28.14 (#33)

[Unreleased]: https://github.com/nyaomaru/is-kit/compare/v1.0.4...HEAD
[1.0.4]: https://github.com/nyaomaru/is-kit/releases/tag/v1.0.4

---

## [1.0.3] - 2025-10-18

### Fixed

- Fixed npm registry error (#28)

### Changed

- Reused `isObject` and `isFunction` (#29)

[Unreleased]: https://github.com/nyaomaru/is-kit/compare/v1.0.3...HEAD
[1.0.3]: https://github.com/nyaomaru/is-kit/releases/tag/v1.0.3

---

## [1.0.2] - 2025-10-13

### Changed

- Support cross-realm plain objects by @nyaomaru in (#26)

### Docs

- Page layout issue (#16)
- API description (#17)
- Components directory (#25)
- Removed Japanese translation page (#20)
- Updated is-kit sample (#19)

### Chore

- Fixed release workflow for pnpm version (#14)
- Updated CHANGELOG (#15)
- Updated README (#21)
- Used mise in CI (#22)
- Updated dependency ts-jest to v29.4.5 (#24)
- Updated dependency @types/react to v18.3.26 (#23)

[Unreleased]: https://github.com/nyaomaru/is-kit/compare/v1.0.2...HEAD
[1.0.2]: https://github.com/nyaomaru/is-kit/releases/tag/v1.0.2

---

## [1.0.1] - 2025-10-07

### Docs

- Sidebar layout and API reference pages
  - Improved tab switching UX for better navigation (#10)

### Fixed

- Fixed version bump workflow configuration (#12)

### Chore

- Updated project logo image (#7)
- Adjusted logo width to 700px in README.md (#9)
- Updated JSR configuration and metadata (#6)
- Added initial CHANGELOG.md (#8)
- Added release workflow for automated tagging and publishing (#11)
- Automated release: v1.0.1 by @github-actions[bot] (#13)

[Unreleased]: https://github.com/nyaomaru/is-kit/compare/v1.0.1...HEAD
[1.0.1]: https://github.com/nyaomaru/is-kit/releases/tag/v1.0.1

---

## [1.0.0] - 2025-10-05

### Added

- Initial stable release with core APIs:
  - `define`, `predicateToRefine`
  - `and`, `or`, `not`
  - `struct`, `array`, `tuple`, `oneOf`
  - `nullable`, `optional`, `equals`, `safeParse`, `safeParseWith`
- ESM/CJS/types bundled; `sideEffects:false`
- Jest runtime tests and `tsd` type tests (CI required)

### Docs

- Docs site (Next.js + shadcn/ui), quick start & API Reference

[Unreleased]: https://github.com/nyaomaru/is-kit/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/nyaomaru/is-kit/releases/tag/v1.0.0
