import { expectType } from 'tsd';
import { optionalKey, typedStruct } from '@/core/combinators';
import { isBoolean, isNumber, isString } from '@/core/primitive';
import type { Predicate } from '@/types';

type User = {
  id: string;
  name: string;
  age?: number;
};

type ApiResponse<
  Path extends string,
  Method extends string
> = Path extends '/users/{id}'
  ? Method extends 'get'
    ? User
    : never
  : never;

type ApiQueryParam<
  Path extends string,
  Method extends string
> = Path extends '/users/{id}'
  ? Method extends 'get'
    ? {
        includePosts?: boolean;
      }
    : never
  : never;

type ApiPathParam<
  Path extends string,
  Method extends string
> = Path extends '/users/{id}'
  ? Method extends 'get'
    ? {
        id: string;
      }
    : never
  : never;

// =============================================
// describe: typedStruct
// =============================================
// it: checks struct fields against a target object type
const isUser = typedStruct<User>()({
  id: isString,
  name: isString,
  age: optionalKey(isNumber)
});
expectType<Predicate<Readonly<User>>>(isUser);

// it: can check hand-written guards against generated API-like types
type UserResponse = ApiResponse<'/users/{id}', 'get'>;
const isUserResponse = typedStruct<UserResponse>()({
  id: isString,
  name: isString,
  age: optionalKey(isNumber)
});
expectType<Predicate<Readonly<UserResponse>>>(isUserResponse);

const isUserQuery = typedStruct<ApiQueryParam<'/users/{id}', 'get'>>()({
  includePosts: optionalKey(isBoolean)
});
expectType<Predicate<Readonly<{ includePosts?: boolean }>>>(isUserQuery);

const isUserPathParams = typedStruct<ApiPathParam<'/users/{id}', 'get'>>()({
  id: isString
});
expectType<Predicate<Readonly<{ id: string }>>>(isUserPathParams);

// it: rejects missing required keys
// @ts-expect-error: typedStruct must reject missing required fields.
typedStruct<User>()({
  id: isString,
  age: optionalKey(isNumber)
});

// it: rejects missing optional keys so type drift stays visible
// @ts-expect-error: typedStruct must reject omitted optional fields.
typedStruct<User>()({
  id: isString,
  name: isString
});

// it: rejects incompatible guards
typedStruct<User>()({
  id: isString,
  // @ts-expect-error: typedStruct must reject guards incompatible with the target field.
  name: isNumber,
  age: optionalKey(isNumber)
});

// it: rejects extra struct fields
typedStruct<User>()({
  id: isString,
  name: isString,
  age: optionalKey(isNumber),
  // @ts-expect-error: typedStruct must reject fields outside the target type.
  active: isBoolean
});
