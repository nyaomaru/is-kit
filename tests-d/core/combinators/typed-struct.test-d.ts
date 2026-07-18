import { expectAssignable, expectType } from 'tsd';
import {
  arrayOf,
  oneOfValues,
  optionalKey,
  typedStruct
} from '@/core/combinators';
import { nullable } from '@/core/nullish';
import { isBoolean, isNumber, isString } from '@/core/primitive';
import type { Predicate } from '@/types';
import type {
  NoExtraKeys,
  OptionalObjectKeys,
  RequiredObjectKeys,
  StructOptions,
  TypedStructFields,
  TypedStructShape
} from 'is-kit';

type User = {
  /** Stable identifier returned for the user. */
  id: string;
  /** Display name shown for the user. */
  name: string;
  /** Optional age supplied by the user profile. */
  age?: number;
};

type ApiResponse<
  Path extends string,
  Method extends string
> = Path extends '/users/{id}' ? (Method extends 'get' ? User : never) : never;

type ApiQueryParam<
  Path extends string,
  Method extends string
> = Path extends '/users/{id}'
  ? Method extends 'get'
    ? {
        /** Whether related posts should be included in the response. */
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
        /** User identifier extracted from the request path. */
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

// it: supports readonly, nullable, and nested generated API response fields
type GeneratedUserResponse = {
  /** Stable identifier returned by the generated API client. */
  readonly id: string;
  /** Nullable public profile associated with the user. */
  readonly profile: {
    /** Name rendered in public profile views. */
    readonly displayName: string;
    /** Optional profile biography represented as a nullable value. */
    readonly bio: string | null;
  } | null;
  /** Immutable labels attached to the user. */
  readonly tags: readonly string[];
  /** Optional nullable metadata returned for privileged requests. */
  readonly metadata?: {
    /** Whether the user passed the verification process. */
    readonly verified: boolean;
  } | null;
};

const isGeneratedProfile = typedStruct<
  NonNullable<GeneratedUserResponse['profile']>
>()({
  displayName: isString,
  bio: nullable(isString)
});

const isGeneratedMetadata = typedStruct<
  NonNullable<GeneratedUserResponse['metadata']>
>()({
  verified: isBoolean
});

const isGeneratedUserResponse = typedStruct<GeneratedUserResponse>()({
  id: isString,
  profile: nullable(isGeneratedProfile),
  tags: arrayOf(isString),
  metadata: optionalKey(nullable(isGeneratedMetadata))
});
expectType<Predicate<Readonly<GeneratedUserResponse>>>(isGeneratedUserResponse);

// it: preserves field guards that narrow beyond the target field types
type Content = {
  /** Discriminator identifying the content representation. */
  kind: string;
  /** Content payload before a guard narrows its representation. */
  value: string | number;
  /** Optional label before a guard narrows its representation. */
  label?: string | number;
};

const isTextContent = typedStruct<Content>()({
  kind: oneOfValues('text'),
  value: isString,
  label: optionalKey(isString)
});
expectType<
  Predicate<Readonly<{ kind: 'text'; value: string; label?: string }>>
>(isTextContent);
expectAssignable<Predicate<Readonly<Content>>>(isTextContent);

// =============================================
// describe: public type exports
// =============================================
// it: exposes typedStruct schema helper types from the package entrypoint
type PublicUserShape = TypedStructShape<User>;
type PublicUserFields = TypedStructFields<User, PublicUserShape>;
type PublicUserRequiredKeys = RequiredObjectKeys<User>;
type PublicUserOptionalKeys = OptionalObjectKeys<User>;
type PublicUserNoExtraKeys = NoExtraKeys<{ id: string }, { id: unknown }>;
const publicStructOptions: StructOptions = { exact: true };

expectAssignable<PublicUserShape>({
  id: isString,
  name: isString,
  age: optionalKey(isNumber)
});
expectAssignable<PublicUserFields>({
  id: isString,
  name: isString,
  age: optionalKey(isNumber)
});
expectAssignable<PublicUserRequiredKeys>('id');
expectAssignable<PublicUserRequiredKeys>('name');
expectType<PublicUserOptionalKeys>('age');
expectAssignable<PublicUserNoExtraKeys>({ id: 'user-1' });
expectType<StructOptions>(publicStructOptions);

typedStruct<User>()(
  {
    id: isString,
    name: isString,
    age: optionalKey(isNumber)
  },
  publicStructOptions
);

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
