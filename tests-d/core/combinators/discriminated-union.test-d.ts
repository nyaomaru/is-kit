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
const isEvent = discriminatedUnion<Event>()('kind', {
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
const isStringContent = discriminatedUnion<Content>()('type', {
  text: isTextContent,
  image: isImageContent
});
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
const isResponse = discriminatedUnion<Response>()('status', {
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
const isResult = discriminatedUnion<Result>()('ok', {
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
discriminatedUnion<NumberKeyCollision>()('kind', {
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
discriminatedUnion<BooleanKeyCollision>()('kind', {
  true: isBooleanKeyCollision
});

// it: rejects broad primitive discriminants that cannot be enumerated
type BroadStringEvent = { kind: string; value: string };
const isBroadStringEvent = typedStruct<BroadStringEvent>()({
  kind: isString,
  value: isString
});

// @ts-expect-error: A broad string discriminant cannot be exhaustively mapped.
discriminatedUnion<BroadStringEvent>()('kind', {
  only: isBroadStringEvent
});

type BroadNumberEvent = { kind: number; value: string };
const isBroadNumberEvent = typedStruct<BroadNumberEvent>()({
  kind: isNumber,
  value: isString
});

// @ts-expect-error: A broad number discriminant cannot be exhaustively mapped.
discriminatedUnion<BroadNumberEvent>()('kind', {
  1: isBroadNumberEvent
});

declare const onlySymbol: unique symbol;
type BroadSymbolEvent = { kind: symbol; value: string };
const isBroadSymbolEvent = typedStruct<BroadSymbolEvent>()({
  kind: isSymbol,
  value: isString
});

// @ts-expect-error: A broad symbol discriminant cannot be exhaustively mapped.
discriminatedUnion<BroadSymbolEvent>()('kind', {
  [onlySymbol]: isBroadSymbolEvent
});

// it: rejects a missing union branch
// @ts-expect-error: Each discriminant value needs a branch guard.
discriminatedUnion<Event>()('kind', {
  click: isClickEvent
});

// it: rejects a branch outside the target union
discriminatedUnion<Event>()('kind', {
  click: isClickEvent,
  scroll: isScrollEvent,
  // @ts-expect-error: Extra discriminant values are not allowed.
  hover: isClickEvent
});

// it: rejects a guard for the wrong discriminated member
discriminatedUnion<Event>()('kind', {
  // @ts-expect-error: The click branch must validate click events.
  click: isScrollEvent,
  scroll: isScrollEvent
});
