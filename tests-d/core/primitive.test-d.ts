import { expectType } from 'tsd';
import {
  isString,
  isNumberPrimitive,
  isFiniteNumber,
  isNumber,
  isBoolean,
  isBigInt,
  isSymbol,
  isUndefined,
  isNull,
} from '../../src/core/primitive';
import type { Predicate, Refine } from '../../src/types';

// =============================================
// describe: primitive guards
// =============================================
// it: isString is a Predicate<string>
expectType<Predicate<string>>(isString);

// it: isNumberPrimitive is a Predicate<number>
expectType<Predicate<number>>(isNumberPrimitive);

// it: isFiniteNumber refines number -> number (finite subset)
expectType<Refine<number, number>>(isFiniteNumber);

// it: isNumber (finite) is a Predicate<number>
expectType<Predicate<number>>(isNumber);

// it: other primitives
expectType<Predicate<boolean>>(isBoolean);
expectType<Predicate<bigint>>(isBigInt);
expectType<Predicate<symbol>>(isSymbol);
expectType<Predicate<undefined>>(isUndefined);
expectType<Predicate<null>>(isNull);
