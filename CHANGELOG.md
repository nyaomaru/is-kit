# Changelog

All notable changes to this project will be documented in this file.

This project adheres to [Keep a Changelog](https://keepachangelog.com/) and [SemVer](https://semver.org/).

---

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

[Unreleased]: https://github.com/nyaomaru/is-kit/compare/v1.0.5...HEAD
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
