import { expectType } from 'tsd';
import type { Predicate } from '../../src/types';
import {
  isFunction,
  isObject,
  isPlainObject,
  isArray,
  isDate,
  isRegExp,
  isMap,
  isSet,
  isWeakMap,
  isWeakSet,
  isPromiseLike,
  isIterable,
  isAsyncIterable,
  isArrayBuffer,
  isDataView,
  isTypedArray,
  isError,
  isURL,
  isBlob,
  isInstanceOf
} from '../../src/core/object';

// =============================================
// describe: object guards (types)
// =============================================
expectType<Predicate<Function>>(isFunction);
expectType<Predicate<Record<PropertyKey, unknown>>>(isObject);
expectType<Predicate<Record<string, unknown>>>(isPlainObject);
expectType<Predicate<readonly unknown[]>>(isArray);
expectType<Predicate<Date>>(isDate);
expectType<Predicate<RegExp>>(isRegExp);
expectType<Predicate<Map<unknown, unknown>>>(isMap);
expectType<Predicate<Set<unknown>>>(isSet);
expectType<Predicate<WeakMap<object, unknown>>>(isWeakMap);
expectType<Predicate<WeakSet<object>>>(isWeakSet);
expectType<Predicate<PromiseLike<unknown>>>(isPromiseLike);
expectType<Predicate<Iterable<unknown>>>(isIterable);
expectType<Predicate<AsyncIterable<unknown>>>(isAsyncIterable);
expectType<Predicate<ArrayBuffer>>(isArrayBuffer);
expectType<Predicate<DataView>>(isDataView);
expectType<Predicate<ArrayBufferView>>(isTypedArray);
expectType<Predicate<Error>>(isError);
expectType<Predicate<URL>>(isURL);
expectType<Predicate<Blob>>(isBlob);

// =============================================
// describe: isInstanceOf (types)
// =============================================
abstract class Animal {
  abstract speak(): string;
}

class Dog extends Animal {
  speak(): string {
    return 'woof';
  }
}

const isAnimal = isInstanceOf(Animal);
expectType<Predicate<Animal>>(isAnimal);

const candidate: unknown = new Dog();
if (isAnimal(candidate)) {
  expectType<Animal>(candidate);
}
