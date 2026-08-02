/** Predicate that accepts an unknown value and narrows it to `T`. */
export type Predicate<T> = (value: unknown) => value is T;

/** Refinement that narrows a known input type `A` to its subtype `B`. */
export type Refinement<A, B extends A> = (value: A) => value is B;

/** Readability alias for {@link Predicate}. */
export type Guard<T> = Predicate<T>;

/** Readability alias for {@link Refinement}. */
export type Refine<A, B extends A> = Refinement<A, B>;

/** Validates the ordered refinement types accepted by `andAll`. */
export type RefineChain<In, T extends readonly unknown[]> = T extends []
  ? []
  : T extends [Refine<In, infer Next>, ...infer R]
    ? [Refine<In, Next>, ...RefineChain<Next, Extract<R, readonly unknown[]>>]
    : never;

/** Resolves the final narrowed type produced by an ordered refinement chain. */
export type ChainResult<In, T extends readonly unknown[]> = T extends []
  ? In
  : T extends [Refine<In, infer Next>, ...infer R]
    ? ChainResult<Next, Extract<R, readonly unknown[]>>
    : never;

/** Extracts the union of output types from a readonly guard collection. */
export type OutOfGuards<T extends readonly Guard<unknown>[]> =
  T[number] extends Guard<infer U> ? U : never;

/** Tagged success/failure result containing the value when valid. */
export type ParseResult<T> = { valid: true; value: T } | { valid: false };

/** Function that explicitly transforms an input into a parsed output value. */
export type Decoder<Input, Output> = (input: Input) => ParseResult<Output>;

/** Extracts the narrowed output type from a predicate. */
export type GuardedOf<F> = F extends ((value: unknown) => value is infer G)
  ? G
  : never;

/** Extracts guard outputs that remain assignable to a known input type. */
export type GuardedWithin<Fs, A> = Extract<
  Fs extends readonly unknown[] ? GuardedOf<Fs[number]> : never,
  A
>;
