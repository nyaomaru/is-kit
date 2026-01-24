export type Predicate<T> = (value: unknown) => value is T;

export type Refinement<A, B extends A> = (value: A) => value is B;

export type Guard<T> = Predicate<T>;

export type Refine<A, B extends A> = Refinement<A, B>;

export type RefineChain<In, T extends readonly unknown[]> = T extends []
  ? []
  : T extends [Refine<In, infer Next>, ...infer R]
    ? [Refine<In, Next>, ...RefineChain<Next, Extract<R, readonly unknown[]>>]
    : never;

export type ChainResult<In, T extends readonly unknown[]> = T extends []
  ? In
  : T extends [Refine<In, infer Next>, ...infer R]
    ? ChainResult<Next, Extract<R, readonly unknown[]>>
    : never;

export type OutOfGuards<T extends readonly Guard<unknown>[]> =
  T[number] extends Guard<infer U> ? U : never;

export type ParseResult<T> = { valid: true; value: T } | { valid: false };

export type GuardedOf<F> = F extends (value: unknown) => value is infer G
  ? G
  : never;

export type GuardedWithin<Fs, A> = Extract<
  Fs extends readonly unknown[] ? GuardedOf<Fs[number]> : never,
  A
>;

export type Schema = Readonly<Record<string, Predicate<unknown>>>;

export type InferSchema<S extends Schema> = {
  readonly [K in keyof S]: GuardedOf<S[K]>;
};
