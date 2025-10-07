# Changelog

All notable changes to this project will be documented in this file.

This project adheres to [Keep a Changelog](https://keepachangelog.com/) and [SemVer](https://semver.org/).

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
