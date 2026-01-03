import { expectType } from 'tsd';
import {
  isString,
  isNumberPrimitive,
  isNaN,
  isInfiniteNumber,
  isFiniteNumber,
  isNumber,
  isInteger,
  isSafeInteger,
  isPositive,
  isNegative,
  isZero,
  isBoolean,
  isBigInt,
  isSymbol,
  isUndefined,
  isNull,
  isPrimitive,
} from '../../src/core/primitive';
import type { Predicate, Refine, Primitive } from '../../src/types';

// =============================================
// describe: primitive guards
// =============================================
// it: isString is a Predicate<string>
expectType<Predicate<string>>(isString);

// it: isNumberPrimitive is a Predicate<number>
expectType<Predicate<number>>(isNumberPrimitive);

// it: isNaN is a Predicate<number>
expectType<Predicate<number>>(isNaN);

// it: isInfiniteNumber is a Predicate<number>
expectType<Predicate<number>>(isInfiniteNumber);

// it: isFiniteNumber refines number -> number (finite subset)
expectType<Refine<number, number>>(isFiniteNumber);

// it: isNumber (finite) is a Predicate<number>
expectType<Predicate<number>>(isNumber);

// it: integer and safe-integer are Predicate<number>
expectType<Predicate<number>>(isInteger);
expectType<Predicate<number>>(isSafeInteger);

// it: positive/negative are Predicate<number>
expectType<Predicate<number>>(isPositive);
expectType<Predicate<number>>(isNegative);
expectType<Predicate<number>>(isZero);

// it: other primitives
expectType<Predicate<boolean>>(isBoolean);
expectType<Predicate<bigint>>(isBigInt);
expectType<Predicate<symbol>>(isSymbol);
expectType<Predicate<undefined>>(isUndefined);
expectType<Predicate<null>>(isNull);

// it: isPrimitive is a Predicate<Primitive>
expectType<Predicate<Primitive>>(isPrimitive);
