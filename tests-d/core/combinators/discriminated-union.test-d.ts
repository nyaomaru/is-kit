import { expectAssignable, expectType } from 'tsd';
import {
  discriminatedUnion,
  oneOfValues,
  typedStruct
} from '@/core/combinators';
import { isNumber, isString } from '@/core/primitive';
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
