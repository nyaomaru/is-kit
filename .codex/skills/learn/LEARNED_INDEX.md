# Learned Patterns

- **[deprecate-public-api-before-major-removal](learned/deprecate-public-api-before-major-removal.md)** - Deprecate accidental runtime exports during the current major before removing only their public entry point in the next major.
- **[keep-typed-schema-key-coverage-explicit](learned/keep-typed-schema-key-coverage-explicit.md)** - Match typed schema drift claims to the string-key coverage enforced by both mapped types and runtime enumeration.
- **[model-transformations-as-decoders](learned/model-transformations-as-decoders.md)** - Model value-changing boundary conversions as ParseResult-returning decoder functions rather than type guards.
- **[test-packed-artifacts-from-a-consumer-project](learned/test-packed-artifacts-from-a-consumer-project.md)** - Install the packed tarball in a temporary consumer to verify ESM, CommonJS, and declaration resolution before publishing.
