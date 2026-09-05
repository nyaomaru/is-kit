# Learned Patterns

- **[balance-runtime-cost-with-compositional-design](learned/balance-runtime-cost-with-compositional-design.md)** - Require meaningful absolute-cost evidence before replacing is-kit's compositional built-in guards with direct predicates.
- **[deprecate-public-api-before-major-removal](learned/deprecate-public-api-before-major-removal.md)** - Deprecate accidental runtime exports during the current major before removing only their public entry point in the next major.
- **[keep-typed-schema-key-coverage-explicit](learned/keep-typed-schema-key-coverage-explicit.md)** - Match typed schema drift claims to the string-key coverage enforced by both mapped types and runtime enumeration.
- **[model-transformations-as-decoders](learned/model-transformations-as-decoders.md)** - Model value-changing boundary conversions as ParseResult-returning decoder functions rather than type guards.
- **[order-precise-overloads-before-generic-fallbacks](learned/order-precise-overloads-before-generic-fallbacks.md)** - Put tuple-preserving overloads before homogeneous array fallbacks so concrete chains retain their final narrowing.
- **[prefer-non-throwing-intrinsic-brand-checks](learned/prefer-non-throwing-intrinsic-brand-checks.md)** - Prefer captured intrinsic accessors that distinguish built-in brands without exceptions on successful validation paths.
- **[preserve-explicit-generic-call-compatibility](learned/preserve-explicit-generic-call-compatibility.md)** - Treat public type-parameter shape as source API and test explicit generic calls when generalizing signatures.
- **[preserve-type-guard-semantics-across-host-values](learned/preserve-type-guard-semantics-across-host-values.md)** - Keep a type guard's runtime set exact across host values such as browser `document.all` when optimizing primitive checks.
- **[require-singleton-keys-for-single-property-refinements](learned/require-singleton-keys-for-single-property-refinements.md)** - Reuse one mapped-type constraint to reject union, broad, patterned, and branded key domains before narrowing one property.
- **[separate-property-refinement-absence-contracts](learned/separate-property-refinement-absence-contracts.md)** - Keep property access semantics separate from own-index absence checks when lifting refinements.
- **[test-packed-artifacts-from-a-consumer-project](learned/test-packed-artifacts-from-a-consumer-project.md)** - Install the packed tarball in a temporary consumer to verify ESM, CommonJS, and declaration resolution before publishing.
