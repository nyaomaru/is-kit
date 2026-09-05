# Prefer Non-Throwing Intrinsic Brand Checks

**Captured:** 2026-09-05
**Context:** Distinguishing related built-in objects without `instanceof` or spoofable object tags
**Tags:** typescript, type-guards, runtime-validation, built-ins, cross-realm, performance

## Problem

Captured intrinsic methods and accessors are reliable brand checks because they
inspect internal slots, accept cross-realm instances, and reject
`Symbol.toStringTag` spoofing. However, a throwing accessor can be the wrong
intrinsic for a common path. The previous `isTypedArray` called the captured
`DataView.prototype.buffer` getter and interpreted its expected `TypeError` as
evidence that every valid typed array was not a DataView. This made exceptions
part of the successful typed-array path.

## Solution

Inspect the specification for another captured intrinsic whose normal result
distinguishes the brands. `%TypedArray%.prototype[Symbol.toStringTag]` checks the
`[[TypedArrayName]]` internal slot directly: it returns the typed-array name for
a genuine typed array and `undefined` for DataView and other values. Calling the
captured getter does not read an object's own spoofable tag.

Keep the public composition pattern where practical. The optimization belongs
inside the primitive brand check and is justified by removing exception-driven
normal control flow, not merely by shortening the predicate.

## Example

```ts
const typedArrayName = Object.getOwnPropertyDescriptor(
  Object.getPrototypeOf(Uint8Array.prototype),
  Symbol.toStringTag
)?.get;

export const isTypedArray = define<ArrayBufferView>(
  (value) => typedArrayName?.call(value) !== undefined
);
```

## When To Use

Use this approach when two related built-in brands share a broad platform check
and one is currently excluded by catching an expected exception. Verify the
chosen accessor against the ECMAScript algorithm and test every supported
constructor, DataView or sibling-brand rejection, cross-realm values,
subclasses, proxies, spoofed tags, and detached or out-of-bounds buffers.

Measure the absolute success-path cost as well as the relative improvement, and
run the check in at least one browser when the package supports browsers.

## Related Files

- `src/core/object.ts`
- `tests/core/object.test.ts`
- `runtime-guard-refactoring-design.md`
