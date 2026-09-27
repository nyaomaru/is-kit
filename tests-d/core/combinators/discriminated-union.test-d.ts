import { expectAssignable, expectType } from 'tsd';
import {
  discriminatedUnion,
  oneOfValues,
  typedStruct
} from '@/core/combinators';
import { isBoolean, isNumber, isString, isSymbol } from '@/core/primitive';
import type { Predicate } from '@/types';

type Event =
  | { kind: 'click'; x: number; y: number }
  | { kind: 'scroll'; delta: number };
type ClickEvent = Extract<Event, { kind: 'click' }>;
type ScrollEvent = Extract<Event, { kind: 'scroll' }>;

const isClickEvent = typedStruct<ClickEvent>()({
  kind: oneOfValues('click'),
  x: isNumber,
  y: isNumber
});
const isScrollEvent = typedStruct<ScrollEvent>()({
  kind: oneOfValues('scroll'),
  delta: isNumber
});

// =============================================
// describe: discriminatedUnion
// =============================================
// it: requires a guard for every discriminant value
const isEvent = discriminatedUnion<Event>()('kind', ['click', 'scroll'], {
  click: isClickEvent,
  scroll: isScrollEvent
});
expectType<Predicate<Readonly<ClickEvent> | Readonly<ScrollEvent>>>(isEvent);
expectAssignable<Predicate<Event>>(isEvent);

// it: preserves branch guards that narrow beyond the target member type
type Content =
  | { type: 'text'; value: string | number }
  | { type: 'image'; value: string | number };

const isTextContent = typedStruct<Extract<Content, { type: 'text' }>>()({
  type: oneOfValues('text'),
  value: isString
});
const isImageContent = typedStruct<Extract<Content, { type: 'image' }>>()({
  type: oneOfValues('image'),
  value: isString
});
const isStringContent = discriminatedUnion<Content>()(
  'type',
  ['text', 'image'],
  {
    text: isTextContent,
    image: isImageContent
  }
);
expectType<
  Predicate<
    | Readonly<{ type: 'text'; value: string }>
    | Readonly<{ type: 'image'; value: string }>
  >
>(isStringContent);

// it: supports numeric discriminants
type Response =
  | { status: 200; body: string }
  | { status: 404; message: string };
const isResponse = discriminatedUnion<Response>()('status', [200, 404], {
  200: typedStruct<Extract<Response, { status: 200 }>>()({
    status: oneOfValues(200),
    body: isString
  }),
  404: typedStruct<Extract<Response, { status: 404 }>>()({
    status: oneOfValues(404),
    message: isString
  })
});
expectType<
  Predicate<
    | Readonly<{ status: 200; body: string }>
    | Readonly<{ status: 404; message: string }>
  >
>(isResponse);

// it: supports Result-style boolean discriminants
type Result = { ok: true; value: string } | { ok: false; error: string };
const isResult = discriminatedUnion<Result>()('ok', [true, false], {
  true: typedStruct<Extract<Result, { ok: true }>>()({
    ok: oneOfValues(true),
    value: isString
  }),
  false: typedStruct<Extract<Result, { ok: false }>>()({
    ok: oneOfValues(false),
    error: isString
  })
});
expectType<
  Predicate<
    | Readonly<{ ok: true; value: string }>
    | Readonly<{ ok: false; error: string }>
  >
>(isResult);

// it: reuses a member guard for every literal in its discriminant union
type GroupedEvent =
  | { kind: 'a' | 'b'; value: string }
  | { kind: 'c'; count: number };
type ABEvent = Extract<GroupedEvent, { kind: 'a' | 'b' }>;
type CEvent = Extract<GroupedEvent, { kind: 'c' }>;
const isABEvent = typedStruct<ABEvent>()({
  kind: oneOfValues('a', 'b'),
  value: isString
});
const isCEvent = typedStruct<CEvent>()({
  kind: oneOfValues('c'),
  count: isNumber
});
const isGroupedEvent = discriminatedUnion<GroupedEvent>()(
  'kind',
  ['a', 'b', 'c'],
  {
    a: isABEvent,
    b: isABEvent,
    c: isCEvent
  }
);
expectType<Predicate<Readonly<ABEvent> | Readonly<CEvent>>>(isGroupedEvent);

// it: rejects a branch guard from another member when literals share a member
discriminatedUnion<GroupedEvent>()('kind', ['a', 'b', 'c'], {
  // @ts-expect-error: The a branch must validate the member that contains a.
  a: isCEvent,
  b: isABEvent,
  c: isCEvent
});

// it: rejects a guard narrowed to a different literal in the same member
type AEvent = ABEvent & { kind: 'a' };
const isAEvent = typedStruct<AEvent>()({
  kind: oneOfValues('a'),
  value: isString
});
// @ts-expect-error: The b branch must accept the b discriminant value.
discriminatedUnion<GroupedEvent>()('kind', ['a', 'b', 'c'], {
  a: isAEvent,
  b: isAEvent,
  c: isCEvent
});

// it: rejects discriminants that would use the same JavaScript object key
type NumberKeyCollision =
  | { kind: 1; value: number }
  | { kind: '1'; value: string };
const isNumberKeyCollision = typedStruct<
  Extract<NumberKeyCollision, { kind: 1 }>
>()({
  kind: oneOfValues(1),
  value: isNumber
});

// @ts-expect-error: 1 and '1' both resolve to the same object key.
discriminatedUnion<NumberKeyCollision>()('kind', [1, '1'], {
  1: isNumberKeyCollision
});

type BooleanKeyCollision =
  | { kind: true; value: boolean }
  | { kind: 'true'; value: string };
const isBooleanKeyCollision = typedStruct<
  Extract<BooleanKeyCollision, { kind: true }>
>()({
  kind: oneOfValues(true),
  value: isBoolean
});

// @ts-expect-error: true and 'true' both resolve to the same object key.
discriminatedUnion<BooleanKeyCollision>()('kind', [true, 'true'], {
  true: isBooleanKeyCollision
});

// it: rejects broad primitive discriminants that cannot be enumerated
type BroadStringEvent = { kind: string; value: string };
const isBroadStringEvent = typedStruct<BroadStringEvent>()({
  kind: isString,
  value: isString
});
const broadStringValue: string = 'only';
const broadStringValues = [broadStringValue] as const;
const broadStringGuards = { [broadStringValue]: isBroadStringEvent };

// @ts-expect-error: A broad string discriminant cannot be exhaustively mapped.
discriminatedUnion<BroadStringEvent>()('kind', ['only'], {
  only: isBroadStringEvent
});

discriminatedUnion<BroadStringEvent>()(
  // @ts-expect-error: A broad tuple element cannot make a string domain finite.
  'kind',
  broadStringValues,
  broadStringGuards
);

type BroadNumberEvent = { kind: number; value: string };
const isBroadNumberEvent = typedStruct<BroadNumberEvent>()({
  kind: isNumber,
  value: isString
});

// @ts-expect-error: A broad number discriminant cannot be exhaustively mapped.
discriminatedUnion<BroadNumberEvent>()('kind', [1], {
  1: isBroadNumberEvent
});

declare const onlySymbol: unique symbol;
type BroadSymbolEvent = { kind: symbol; value: string };
const isBroadSymbolEvent = typedStruct<BroadSymbolEvent>()({
  kind: isSymbol,
  value: isString
});

// @ts-expect-error: A broad symbol discriminant cannot be exhaustively mapped.
discriminatedUnion<BroadSymbolEvent>()('kind', [onlySymbol], {
  [onlySymbol]: isBroadSymbolEvent
});

// it: rejects infinite template-literal discriminants
type InfiniteTemplateEvent = { kind: `event-${string}`; value: string };
const isEventOne = typedStruct<InfiniteTemplateEvent>()({
  kind: oneOfValues('event-one'),
  value: isString
});

// @ts-expect-error: An infinite template-literal discriminant cannot be exhaustively mapped.
discriminatedUnion<InfiniteTemplateEvent>()('kind', ['event-one'], {
  'event-one': isEventOne
});

const templateKeyedGuards: Record<
  `event-${string}`,
  Predicate<InfiniteTemplateEvent>
> = {
  'event-one': isEventOne
};

discriminatedUnion<InfiniteTemplateEvent>()(
  // @ts-expect-error: A template-keyed Record cannot make an infinite domain finite.
  'kind',
  ['event-one'],
  templateKeyedGuards
);

type NumericTemplateEvent = { kind: `item:${number}`; value: string };
const isItemOne = typedStruct<NumericTemplateEvent>()({
  kind: oneOfValues('item:1'),
  value: isString
});

// @ts-expect-error: A number template-literal discriminant is infinite.
discriminatedUnion<NumericTemplateEvent>()('kind', ['item:1'], {
  'item:1': isItemOne
});

declare const kindBrand: unique symbol;
type BrandedKind = string & { readonly [kindBrand]: 'kind' };
type BrandedEvent = { kind: BrandedKind; value: string };
declare const isBrandedKind: Predicate<BrandedKind>;
declare const brandedValue: BrandedKind;
const isBrandedEvent = typedStruct<BrandedEvent>()({
  kind: isBrandedKind,
  value: isString
});

// @ts-expect-error: A branded string discriminant is not a finite literal set.
discriminatedUnion<BrandedEvent>()('kind', [brandedValue], {
  [brandedValue]: isBrandedEvent
});

// it: rejects a value tuple that omits a finite discriminant
// @ts-expect-error: The tuple must contain every discriminant value.
discriminatedUnion<Event>()('kind', ['click'], {
  click: isClickEvent
});

// it: rejects a tuple element that can resolve to multiple discriminants
declare const eventKind: 'click' | 'scroll';
const ambiguousEventValues = [eventKind] as const;
discriminatedUnion<Event>()(
  'kind',
  // @ts-expect-error: Each tuple element must be one discriminant literal.
  ambiguousEventValues,
  {
    click: isClickEvent,
    scroll: isScrollEvent
  }
);

// it: rejects a union where a tuple variant omits a discriminant
declare const partialEventValues: readonly ['click'] | readonly ['scroll'];
discriminatedUnion<Event>()(
  'kind',
  // @ts-expect-error: Every possible tuple must cover all discriminants.
  partialEventValues,
  {
    click: isClickEvent,
    scroll: isScrollEvent
  }
);

// it: rejects a missing union branch
// @ts-expect-error: Each discriminant value needs a branch guard.
discriminatedUnion<Event>()('kind', ['click', 'scroll'], {
  click: isClickEvent
});

// it: rejects a branch outside the target union
discriminatedUnion<Event>()('kind', ['click', 'scroll'], {
  click: isClickEvent,
  scroll: isScrollEvent,
  // @ts-expect-error: Extra discriminant values are not allowed.
  hover: isClickEvent
});

// it: rejects a guard for the wrong discriminated member
discriminatedUnion<Event>()('kind', ['click', 'scroll'], {
  // @ts-expect-error: The click branch must validate click events.
  click: isScrollEvent,
  scroll: isScrollEvent
});
