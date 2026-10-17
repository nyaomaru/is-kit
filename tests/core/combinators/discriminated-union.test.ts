import {
  discriminatedUnion,
  discriminatedUnionWithFallback,
  typedStruct
} from '@/core/combinators';
import { isNumber, isString } from '@/core/primitive';

describe('discriminatedUnion', () => {
  type Event =
    | { kind: 'click'; x: number; y: number }
    | { kind: 'scroll'; delta: number };
  type ClickEvent = Extract<Event, { kind: 'click' }>;
  type ScrollEvent = Extract<Event, { kind: 'scroll' }>;

  const isEvent = discriminatedUnion<Event>()('kind', ['click', 'scroll'], {
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

  it('classifies undeclared discriminants with an explicit fallback variant', () => {
    let fallbackCalls = 0;
    const classifyEvent = discriminatedUnionWithFallback<Event>()(
      'kind',
      ['click', 'scroll'],
      {
        click: typedStruct<ClickEvent>()({
          kind: (value): value is 'click' => value === 'click',
          x: isNumber,
          y: isNumber
        }),
        scroll: typedStruct<ScrollEvent>()({
          kind: (value): value is 'scroll' => value === 'scroll',
          delta: isNumber
        })
      },
      {
        tag: 'unknown',
        create: (input, originalKind) => {
          fallbackCalls += 1;
          return { input, originalKind };
        }
      }
    );
    const unknownEvent = { kind: 'hover', target: 'button' };

    expect(classifyEvent({ kind: 'click', x: 12, y: 24 })).toEqual({
      valid: true,
      value: { kind: 'click', x: 12, y: 24 }
    });
    expect(classifyEvent(unknownEvent)).toEqual({
      valid: true,
      value: {
        kind: 'unknown',
        input: unknownEvent,
        originalKind: 'hover'
      }
    });
    expect(fallbackCalls).toBe(1);
  });

  it('does not send malformed known or invalid inputs to the fallback', () => {
    let fallbackCalls = 0;
    const classifyEvent = discriminatedUnionWithFallback<Event>()(
      'kind',
      ['click', 'scroll'],
      {
        click: typedStruct<ClickEvent>()({
          kind: (value): value is 'click' => value === 'click',
          x: isNumber,
          y: isNumber
        }),
        scroll: typedStruct<ScrollEvent>()({
          kind: (value): value is 'scroll' => value === 'scroll',
          delta: isNumber
        })
      },
      {
        tag: 'unknown',
        create: (input, originalKind) => {
          fallbackCalls += 1;
          return { input, originalKind };
        }
      }
    );

    expect(classifyEvent({ kind: 'click', x: 12, y: '24' })).toEqual({
      valid: false
    });
    expect(classifyEvent({ x: 12, y: 24 })).toEqual({ valid: false });
    expect(classifyEvent(Object.create({ kind: 'hover' }))).toEqual({
      valid: false
    });
    expect(classifyEvent({ kind: {} })).toEqual({ valid: false });
    expect(fallbackCalls).toBe(0);
  });

  it('allows the fallback factory to reject an undeclared discriminant', () => {
    const classifyEvent = discriminatedUnionWithFallback<Event>()(
      'kind',
      ['click', 'scroll'],
      {
        click: typedStruct<ClickEvent>()({
          kind: (value): value is 'click' => value === 'click',
          x: isNumber,
          y: isNumber
        }),
        scroll: typedStruct<ScrollEvent>()({
          kind: (value): value is 'scroll' => value === 'scroll',
          delta: isNumber
        })
      },
      { tag: 'unknown', create: () => undefined }
    );

    expect(classifyEvent({ kind: 'hover', target: 'button' })).toEqual({
      valid: false
    });
  });

  it('uses raw discriminant values to select the fallback', () => {
    type NumericEvent = { kind: 1; value: number } | { kind: 2; value: number };
    type BooleanEvent =
      | { kind: true; value: number }
      | { kind: false; value: number };

    const numericGuards = {
      1: typedStruct<Extract<NumericEvent, { kind: 1 }>>()({
        kind: (value): value is 1 => value === 1,
        value: isNumber
      }),
      2: typedStruct<Extract<NumericEvent, { kind: 2 }>>()({
        kind: (value): value is 2 => value === 2,
        value: isNumber
      })
    };
    const classifyNumericEvent = discriminatedUnionWithFallback<NumericEvent>()(
      'kind',
      [1, 2],
      numericGuards,
      { tag: 'unknown', create: (input) => ({ input }) }
    );
    const classifyBooleanEvent = discriminatedUnionWithFallback<BooleanEvent>()(
      'kind',
      [true, false],
      {
        true: typedStruct<Extract<BooleanEvent, { kind: true }>>()({
          kind: (value): value is true => value === true,
          value: isNumber
        }),
        false: typedStruct<Extract<BooleanEvent, { kind: false }>>()({
          kind: (value): value is false => value === false,
          value: isNumber
        })
      },
      { tag: 'unknown', create: (input) => ({ input }) }
    );

    expect(classifyNumericEvent({ kind: '1' })).toEqual({
      valid: true,
      value: { kind: 'unknown', input: { kind: '1' } }
    });
    expect(classifyBooleanEvent({ kind: 'true' })).toEqual({
      valid: true,
      value: { kind: 'unknown', input: { kind: 'true' } }
    });
    expect(() =>
      discriminatedUnionWithFallback<NumericEvent>()(
        'kind',
        [1, 2],
        numericGuards,
        { tag: '1' as never, create: () => ({}) }
      )
    ).toThrow(
      'Fallback discriminatedUnion tag collides with a branch value: 1.'
    );
  });

  it('overrides fallback properties with the same runtime key as the discriminant', () => {
    type NumericKeyEvent =
      | { 1: 'click'; value: number }
      | { 1: 'scroll'; value: number };

    const classifyNumericKeyEvent =
      discriminatedUnionWithFallback<NumericKeyEvent>()(
        1,
        ['click', 'scroll'],
        {
          click: (input): input is Extract<NumericKeyEvent, { 1: 'click' }> =>
            typeof input === 'object' &&
            input !== null &&
            (input as { 1?: unknown })[1] === 'click',
          scroll: (input): input is Extract<NumericKeyEvent, { 1: 'scroll' }> =>
            typeof input === 'object' &&
            input !== null &&
            (input as { 1?: unknown })[1] === 'scroll'
        },
        {
          tag: 'unknown',
          create: () => ({ '1': 'discarded', message: 'Unknown event.' })
        }
      );

    expect(classifyNumericKeyEvent({ 1: 'hover' })).toEqual({
      valid: true,
      value: { 1: 'unknown', message: 'Unknown event.' }
    });
  });

  it('rejects non-plain fallback payloads', () => {
    const nonPlainPayloads = [
      new Date(),
      [1, 2],
      () => undefined,
      new (class Payload {})()
    ];

    for (const payload of nonPlainPayloads) {
      const classifyEvent = discriminatedUnionWithFallback<Event>()(
        'kind',
        ['click', 'scroll'],
        {
          click: typedStruct<ClickEvent>()({
            kind: (value): value is 'click' => value === 'click',
            x: isNumber,
            y: isNumber
          }),
          scroll: typedStruct<ScrollEvent>()({
            kind: (value): value is 'scroll' => value === 'scroll',
            delta: isNumber
          })
        },
        {
          tag: 'unknown',
          create: () => payload as unknown as Record<PropertyKey, unknown>
        }
      );

      expect(classifyEvent({ kind: 'hover' })).toEqual({ valid: false });
    }
  });

  it('preserves non-enumerable fallback payload fields', () => {
    const fallbackPayload = Object.defineProperty(
      {} as { message: string },
      'message',
      {
        configurable: false,
        enumerable: false,
        value: 'Unsupported event kind.',
        writable: false
      }
    );
    const classifyEvent = discriminatedUnionWithFallback<Event>()(
      'kind',
      ['click', 'scroll'],
      {
        click: typedStruct<ClickEvent>()({
          kind: (value): value is 'click' => value === 'click',
          x: isNumber,
          y: isNumber
        }),
        scroll: typedStruct<ScrollEvent>()({
          kind: (value): value is 'scroll' => value === 'scroll',
          delta: isNumber
        })
      },
      { tag: 'unknown', create: () => fallbackPayload }
    );

    const result = classifyEvent({ kind: 'hover' });
    expect(result).toMatchObject({
      valid: true,
      value: { kind: 'unknown', message: 'Unsupported event kind.' }
    });
    if (result.valid) {
      expect(
        Object.getOwnPropertyDescriptor(result.value, 'message')
      ).toMatchObject({
        configurable: false,
        enumerable: false,
        value: 'Unsupported event kind.',
        writable: false
      });
    }
  });

  it('rejects branches omitted from the declared values tuple', () => {
    type HoverEvent = { kind: 'hover'; target: string };

    const guards = {
      click: typedStruct<ClickEvent>()({
        kind: (value): value is 'click' => value === 'click',
        x: isNumber,
        y: isNumber
      }),
      scroll: typedStruct<ScrollEvent>()({
        kind: (value): value is 'scroll' => value === 'scroll',
        delta: isNumber
      }),
      hover: typedStruct<HoverEvent>()({
        kind: (value): value is 'hover' => value === 'hover',
        target: isString
      })
    };
    const eventGuards: Pick<typeof guards, 'click' | 'scroll'> = guards;
    const isDeclaredEvent = discriminatedUnion<Event>()(
      'kind',
      ['click', 'scroll'],
      eventGuards
    );

    expect(isDeclaredEvent({ kind: 'hover', target: 'button' })).toBe(false);
  });

  it('rejects non-object inputs', () => {
    expect(isEvent('click')).toBe(false);
    expect(isEvent(null)).toBe(false);
    expect(isEvent(undefined)).toBe(false);
  });

  it('supports callable members with an own discriminant', () => {
    type Handler = (() => void) & { kind: 'handler' };

    const isHandler = (value: unknown): value is Handler =>
      typeof value === 'function' && Reflect.get(value, 'kind') === 'handler';
    const isHandlerUnion = discriminatedUnion<Handler>()('kind', ['handler'], {
      handler: isHandler
    });
    const handler = Object.assign(() => undefined, {
      kind: 'handler' as const
    });

    expect(isHandlerUnion(handler)).toBe(true);
  });

  it('supports callable guard maps without a __proto__ branch', () => {
    const guards = Object.assign(() => undefined, {
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
    const isCallableMapEvent = discriminatedUnion<Event>()(
      'kind',
      ['click', 'scroll'],
      guards
    );

    expect(isCallableMapEvent({ kind: 'click', x: 12, y: 24 })).toBe(true);
  });

  it('supports numeric discriminants', () => {
    type Response =
      | { status: 200; body: string }
      | { status: 404; message: string };

    const isResponse = discriminatedUnion<Response>()('status', [200, 404], {
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

  it('supports boolean discriminants used by Result types', () => {
    type Result = { ok: true; value: string } | { ok: false; error: string };

    const isResult = discriminatedUnion<Result>()('ok', [true, false], {
      true: typedStruct<Extract<Result, { ok: true }>>()({
        ok: (value): value is true => value === true,
        value: isString
      }),
      false: typedStruct<Extract<Result, { ok: false }>>()({
        ok: (value): value is false => value === false,
        error: isString
      })
    });

    expect(isResult({ ok: true, value: 'done' })).toBe(true);
    expect(isResult({ ok: false, error: 'failed' })).toBe(true);
    expect(isResult({ ok: true, error: 'failed' })).toBe(false);
  });

  it('rejects distinct unique symbol types with the same runtime key', () => {
    const first: unique symbol = Symbol.for('is-kit:shared-event') as never;
    const second: unique symbol = Symbol.for('is-kit:shared-event') as never;
    type FirstEvent = { kind: typeof first; value: string };
    type SecondEvent = { kind: typeof second; error: string };
    type SymbolEvent = FirstEvent | SecondEvent;

    const isFirstEvent = typedStruct<FirstEvent>()({
      kind: (value): value is typeof first => value === first,
      value: isString
    });
    const isSecondEvent = typedStruct<SecondEvent>()({
      kind: (value): value is typeof second => value === second,
      error: isString
    });

    expect(() =>
      discriminatedUnion<SymbolEvent>()('kind', [first, second], {
        [first]: isFirstEvent,
        [second]: isSecondEvent
      })
    ).toThrow('Duplicate discriminatedUnion discriminant value');
  });

  it('supports members whose discriminant contains multiple literals', () => {
    type GroupedEvent =
      | { kind: 'a' | 'b'; value: string }
      | { kind: 'c'; count: number };

    const isABEvent = typedStruct<Extract<GroupedEvent, { kind: 'a' | 'b' }>>()(
      {
        kind: (value): value is 'a' | 'b' => value === 'a' || value === 'b',
        value: isString
      }
    );
    const isCEvent = typedStruct<Extract<GroupedEvent, { kind: 'c' }>>()({
      kind: (value): value is 'c' => value === 'c',
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

    expect(isGroupedEvent({ kind: 'a', value: 'first' })).toBe(true);
    expect(isGroupedEvent({ kind: 'b', value: 'second' })).toBe(true);
    expect(isGroupedEvent({ kind: 'c', count: 3 })).toBe(true);
  });

  it('requires __proto__ to be an own branch-map property', () => {
    type ProtoEvent = { kind: '__proto__'; value: string };
    const isProtoEvent = typedStruct<ProtoEvent>()({
      kind: (value): value is '__proto__' => value === '__proto__',
      value: isString
    });

    expect(() =>
      discriminatedUnion<ProtoEvent>()('kind', ['__proto__'], {
        __proto__: isProtoEvent
      })
    ).toThrow("Use ['__proto__']");

    const isSafeProtoEvent = discriminatedUnion<ProtoEvent>()(
      'kind',
      ['__proto__'],
      {
        ['__proto__']: isProtoEvent
      }
    );

    expect(isSafeProtoEvent({ kind: '__proto__', value: 'safe' })).toBe(true);
  });
});
