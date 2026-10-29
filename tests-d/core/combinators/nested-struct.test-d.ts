import {
  expectAssignable,
  expectError,
  expectNotAssignable,
  expectType
} from 'tsd';
import {
  arrayOf,
  oneOf,
  oneOfValues,
  optionalKey,
  struct
} from '@/core/combinators';
import { optional } from '@/core/nullish';
import { isNumber, isString } from '@/core/primitive';
import type { Predicate } from '@/types';

// =============================================
// describe: nested struct inference
// =============================================
// it: preserves reusable guards, nested optional keys, arrays, and unions
const isAddress = struct({
  city: isString,
  coordinates: optionalKey(struct({ latitude: isNumber, longitude: isNumber }))
});
const isEmail = struct({ kind: oneOfValues('email'), value: isString });
const isPhone = struct({ kind: oneOfValues('phone'), value: isNumber });
const isContact = oneOf(isEmail, isPhone);
const isAccount = struct({
  profile: struct({
    address: isAddress,
    previousAddresses: arrayOf(isAddress),
    contacts: arrayOf(isContact),
    alias: optionalKey(isString),
    note: optional(isString)
  })
});

type Address = {
  readonly city: string;
  readonly coordinates?: {
    readonly latitude: number;
    readonly longitude: number;
  };
};
type Contact =
  | { readonly kind: 'email'; readonly value: string }
  | { readonly kind: 'phone'; readonly value: number };
type Account = {
  readonly profile: {
    readonly address: Address;
    readonly previousAddresses: readonly Address[];
    readonly contacts: readonly Contact[];
    readonly alias?: string;
    readonly note: string | undefined;
  };
};

expectType<Predicate<Account>>(isAccount);
expectAssignable<Account>({
  profile: {
    address: { city: 'Amsterdam' },
    previousAddresses: [],
    contacts: [],
    note: undefined
  }
});
expectNotAssignable<Account>({
  profile: {
    address: { city: 'Amsterdam' },
    previousAddresses: [],
    contacts: []
  }
});
expectNotAssignable<Account>({
  profile: {
    address: { city: 1 },
    previousAddresses: [],
    contacts: [],
    note: undefined
  }
});
expectNotAssignable<Contact>({ kind: 'email', value: 123 });

// it: narrows deep properties and discriminated union members without losing readonly
declare let candidate: unknown;
if (isAccount(candidate)) {
  expectType<Account>(candidate);
  expectType<number | undefined>(
    candidate.profile.address.coordinates?.latitude
  );
  expectType<string | undefined>(candidate.profile.alias);
  expectType<string | undefined>(candidate.profile.note);
  expectError((candidate.profile.address.city = 'Rotterdam'));
  expectError(candidate.profile.previousAddresses.push({ city: 'Rotterdam' }));

  for (const contact of candidate.profile.contacts) {
    if (contact.kind === 'email') {
      expectType<string>(contact.value);
      expectNotAssignable<number>(contact.value);
    } else {
      expectType<number>(contact.value);
      expectNotAssignable<string>(contact.value);
    }
  }
}
