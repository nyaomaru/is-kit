import { discriminatedUnion, typedStruct } from '@/core/combinators';
import { isNumber, isString } from '@/core/primitive';

describe('discriminatedUnion', () => {
  type Event =
    | { kind: 'click'; x: number; y: number }
    | { kind: 'scroll'; delta: number };
  type ClickEvent = Extract<Event, { kind: 'click' }>;
  type ScrollEvent = Extract<Event, { kind: 'scroll' }>;

  const isEvent = discriminatedUnion<Event>()('kind', {
    click: typedStruct<ClickEvent>()({
      kind: (value): value is 'click' => value === 'click',
      x: isNumber,
      y: isNumber
    }),
    scroll: typedStruct<ScrollEvent>()({
      kind: (value): value is 'scroll' => value === 'scroll',
      delta: isNumber
    })
  });

  it('delegates to the guard for the input discriminant', () => {
    expect(isEvent({ kind: 'click', x: 12, y: 24 })).toBe(true);
    expect(isEvent({ kind: 'scroll', delta: 8 })).toBe(true);
    expect(isEvent({ kind: 'click', x: 12, y: '24' })).toBe(false);
  });

  it('rejects objects with an unknown or inherited discriminant', () => {
    expect(isEvent({ kind: 'hover', target: 'button' })).toBe(false);
    expect(isEvent({ x: 12, y: 24 })).toBe(false);
    expect(isEvent(Object.create({ kind: 'click' }))).toBe(false);
  });

  it('rejects non-object inputs', () => {
    expect(isEvent('click')).toBe(false);
    expect(isEvent(null)).toBe(false);
    expect(isEvent(undefined)).toBe(false);
  });

  it('supports numeric discriminants', () => {
    type Response =
      | { status: 200; body: string }
      | { status: 404; message: string };

    const isResponse = discriminatedUnion<Response>()('status', {
      200: typedStruct<Extract<Response, { status: 200 }>>()({
        status: (value): value is 200 => value === 200,
        body: isString
      }),
      404: typedStruct<Extract<Response, { status: 404 }>>()({
        status: (value): value is 404 => value === 404,
        message: isString
      })
    });

    expect(isResponse({ status: 200, body: 'OK' })).toBe(true);
    expect(isResponse({ status: 404, message: 'Not Found' })).toBe(true);
    expect(isResponse({ status: 500, message: 'Error' })).toBe(false);
  });
});
