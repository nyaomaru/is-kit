# Changelog

All notable changes to this project will be documented in this file.

This project adheres to [Keep a Changelog](https://keepachangelog.com/) and [SemVer](https://semver.org/).

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
